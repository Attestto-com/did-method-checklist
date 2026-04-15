/**
 * did:key generation + JWS signing — pure Web Crypto API.
 *
 * Generates Ed25519 keypairs, derives did:key identifiers per the
 * did:key method spec (https://w3c-ccg.github.io/did-method-key/),
 * and signs payloads as JWS compact serialization.
 *
 * Uses the `jose` library for JWS creation/verification and
 * multicodec/multibase encoding for did:key derivation.
 */

import { SignJWT, importJWK, exportJWK, jwtVerify, type JWK } from 'jose'

// ---------------------------------------------------------------------------
// Multicodec prefix for Ed25519 public key (0xed01)
// ---------------------------------------------------------------------------

const ED25519_MULTICODEC_PREFIX = new Uint8Array([0xed, 0x01])

// ---------------------------------------------------------------------------
// Base58btc alphabet (multibase 'z' prefix)
// ---------------------------------------------------------------------------

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function base58btcEncode(bytes: Uint8Array): string {
  // Convert bytes to a big integer
  let num = 0n
  for (const b of bytes) num = num * 256n + BigInt(b)

  // Encode to base58
  let encoded = ''
  while (num > 0n) {
    const [q, r] = [num / 58n, num % 58n]
    encoded = BASE58_ALPHABET[Number(r)] + encoded
    num = q
  }

  // Preserve leading zeros
  for (const b of bytes) {
    if (b !== 0) break
    encoded = '1' + encoded
  }

  return encoded
}

// ---------------------------------------------------------------------------
// Key generation
// ---------------------------------------------------------------------------

export interface GeneratedKey {
  /** The derived did:key identifier */
  did: string
  /** Public key as JWK (safe to share) */
  publicKeyJwk: JWK
  /** Private key as JWK (keep secret — stored in sessionStorage only) */
  privateKeyJwk: JWK
  /** Verification method ID (did#key fragment) */
  verificationMethodId: string
}

/**
 * Generate a fresh Ed25519 keypair and derive a did:key identifier.
 *
 * The private key is returned as JWK for sessionStorage persistence.
 * It is NOT stored anywhere automatically — the caller decides.
 */
export async function generateDidKey(): Promise<GeneratedKey> {
  // Generate Ed25519 keypair via Web Crypto
  const keyPair = await crypto.subtle.generateKey(
    { name: 'Ed25519' },
    true, // extractable — needed for JWK export
    ['sign', 'verify'],
  )

  // Export keys as JWK
  const publicKeyJwk = await exportJWK(keyPair.publicKey)
  const privateKeyJwk = await exportJWK(keyPair.privateKey)

  // Derive did:key from public key bytes
  // Ed25519 public key 'x' parameter is 32 bytes, base64url-encoded
  const publicKeyBytes = base64urlToBytes(publicKeyJwk.x!)

  // Multicodec: 0xed01 prefix + raw public key bytes
  const multicodecKey = new Uint8Array(ED25519_MULTICODEC_PREFIX.length + publicKeyBytes.length)
  multicodecKey.set(ED25519_MULTICODEC_PREFIX)
  multicodecKey.set(publicKeyBytes, ED25519_MULTICODEC_PREFIX.length)

  // Multibase: 'z' prefix + base58btc encoding
  const multibaseKey = 'z' + base58btcEncode(multicodecKey)

  const did = `did:key:${multibaseKey}`
  const verificationMethodId = `${did}#${multibaseKey}`

  return {
    did,
    publicKeyJwk,
    privateKeyJwk,
    verificationMethodId,
  }
}

// ---------------------------------------------------------------------------
// JWS signing
// ---------------------------------------------------------------------------

export interface SignedAssessment {
  /** The assessment JSON (unchanged) */
  payload: string
  /** JWS compact serialization (header.payload.signature) */
  jws: string
  /** The signer's DID */
  signerDid: string
  /** Verification method used */
  verificationMethod: string
}

/**
 * Sign an assessment JSON string with an Ed25519 private key.
 *
 * Produces a JWS compact serialization with:
 *   - `alg: EdDSA`
 *   - `kid: did:key:z6Mk...#z6Mk...` (verification method)
 *   - Payload = the assessment JSON
 *
 * @param payload     The assessment JSON string to sign
 * @param privateJwk  The signer's Ed25519 private key (JWK)
 * @param did         The signer's DID
 * @param vmId        The verification method ID
 */
export async function signAssessment(
  payload: string,
  privateJwk: JWK,
  did: string,
  vmId: string,
): Promise<SignedAssessment> {
  const privateKey = await importJWK(privateJwk, 'EdDSA')

  const jws = await new SignJWT(JSON.parse(payload))
    .setProtectedHeader({
      alg: 'EdDSA',
      kid: vmId,
      typ: 'did-assessment+jwt',
    })
    .setIssuer(did)
    .setIssuedAt()
    .sign(privateKey)

  return { payload, jws, signerDid: did, verificationMethod: vmId }
}

// ---------------------------------------------------------------------------
// JWS verification
// ---------------------------------------------------------------------------

/**
 * Verify a signed assessment JWS against a public key JWK.
 *
 * @param jws         The JWS compact serialization
 * @param publicJwk   The signer's public key (from DID Document)
 * @returns The verified payload, or null if verification fails
 */
export async function verifyAssessmentSignature(
  jws: string,
  publicJwk: JWK,
): Promise<Record<string, unknown> | null> {
  try {
    const publicKey = await importJWK(publicJwk, 'EdDSA')
    const { payload } = await jwtVerify(jws, publicKey)
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Session storage helpers
// ---------------------------------------------------------------------------

const SESSION_KEY = 'did-landscape-signing-key'

/** Store the generated key in sessionStorage (cleared on browser close) */
export function persistKeyToSession(key: GeneratedKey): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(key))
}

/** Retrieve a previously generated key from sessionStorage */
export function loadKeyFromSession(): GeneratedKey | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as GeneratedKey
  } catch {
    return null
  }
}

/** Clear the signing key from sessionStorage */
export function clearKeyFromSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

// ---------------------------------------------------------------------------
// Base64url helpers
// ---------------------------------------------------------------------------

function base64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  const binary = atob(b64 + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
