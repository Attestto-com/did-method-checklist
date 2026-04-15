/**
 * Solana identity resolution — SNS domain + Attestto SBT lookup.
 *
 * After a Solana wallet connects, checks for:
 *  1. SNS .sol domain → resolves to did:sns
 *  2. Attestto SSID SBT → adds verified badge
 *  3. Bare CAIP-10 degraded fallback (not did:pkh — see did:sns spec §13)
 *
 * Uses lightweight API calls — no heavy Solana SDK dependency.
 */

/** Solana mainnet CAIP-2 chain reference (CASA registry) */
const SOLANA_CHAIN_REF = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'

export interface SolanaIdentity {
  /** Best DID for this address (did:sns if domain found, null if only CAIP-10 available) */
  did: string | null
  /** CAIP-10 account identifier — always present regardless of DID resolution */
  caip10: string
  /** DID method used, or null if no DID was resolved */
  method: 'did:sns' | null
  /** Primary SNS domain name, if any (e.g. 'chongkan.sol') */
  domain: string | null
  /** All SNS domains owned by this address */
  allDomains: SnsDomain[]
  /** Whether an Attestto SSID SBT was found */
  hasAttessttoSbt: boolean
  /** Raw wallet address */
  address: string
}

/**
 * Resolve the best identity for a Solana wallet address.
 *
 * 1. Reverse-lookup SNS domain via Bonfida API → did:sns
 * 2. Check for Attestto SSID SBT (TODO: implement when SBT program is live)
 * 3. Fall back to bare CAIP-10 (not did:pkh — deprecated, no production usage)
 */
export async function resolveSolanaIdentity(
  address: string,
  signal?: AbortSignal,
): Promise<SolanaIdentity> {
  const caip10 = `caip10:${SOLANA_CHAIN_REF}:${address}`

  const fallback: SolanaIdentity = {
    did: null,
    caip10,
    method: null,
    domain: null,
    allDomains: [],
    hasAttessttoSbt: false,
    address,
  }

  // Try SNS reverse lookup
  try {
    const result = await reverseLookupSns(address, signal)
    if (result) {
      return {
        did: `did:sns:${result.primary}`,
        caip10,
        method: 'did:sns',
        domain: result.primary,
        allDomains: result.all,
        hasAttessttoSbt: false, // TODO: check SBT once program is live
        address,
      }
    }
  } catch {
    // SNS lookup failed — fall back to bare CAIP-10
  }

  return fallback
}

/** All SNS domains owned by this address */
export interface SnsDomain {
  key: string
  domain: string
}

/**
 * Reverse-lookup SNS .sol domains for a Solana address.
 * Uses the Bonfida SNS SDK proxy API: /domains/{pubkey}
 */
async function reverseLookupSns(
  address: string,
  signal?: AbortSignal,
): Promise<{ primary: string; all: SnsDomain[] } | null> {
  try {
    const res = await fetch(
      `https://sns-sdk-proxy.bonfida.workers.dev/domains/${address}`,
      { signal, headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return null

    const data = await res.json() as { s: string; result: SnsDomain[] }
    if (data.s !== 'ok' || !data.result?.length) return null

    // Sort: prefer shortest domain (likely the personal/primary one)
    const sorted = [...data.result].sort((a, b) => a.domain.length - b.domain.length)
    const primary = sorted[0].domain
    return {
      primary: primary.endsWith('.sol') ? primary : `${primary}.sol`,
      all: sorted,
    }
  } catch {
    return null
  }
}
