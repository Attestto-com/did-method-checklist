#!/usr/bin/env node
/**
 * Enrich methods index with:
 * 1. Repo descriptions as abstracts
 * 2. Tech stack inference (which standards each method mentions)
 * 3. Cross-method compatibility inference
 * 4. Per-requirement tech approach (what satisfies each R)
 *
 * Reads: 02-enriched-full.json (source), 03-summaries.json (features)
 * Outputs: data/methods-index.json (enriched compact)
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SOURCE = process.argv[2] || '../CORTEX/docs/en/internal/identity/did-landscape/02-enriched-full.json'
const full = JSON.parse(readFileSync(SOURCE, 'utf-8'))

// ─── Known tech stacks per feature ──────────────────────────────────────────

const TECH_FOR_REQUIREMENT = {
  R1:  { techs: ['Ed25519','secp256k1','P-256','RSA'], approach: 'Digital signature using keys in DID Document' },
  R2:  { techs: ['Blockchain tx','Key derivation','Peer generation'], approach: 'Controller creates DID without central authority' },
  R3:  { techs: ['Blockchain uniqueness','Deterministic derivation','DNS uniqueness'], approach: 'Registry enforces global uniqueness' },
  R4:  { techs: ['Public blockchain','IPFS','DNS'], approach: 'Resolution reads from public registry, not issuer' },
  R5:  { techs: ['Ed25519VerificationKey2020','EcdsaSecp256k1VerificationKey2019','JsonWebKey2020'], approach: 'DID Document contains verification methods' },
  R6:  { techs: ['DID Document update','Controller rotation','Multi-sig upgrade'], approach: 'Replace keys in DID Document without changing DID' },
  R7:  { techs: ['DIDComm endpoint','LinkedDomains','CredentialRegistry'], approach: 'Service endpoints in DID Document' },
  R8:  { techs: ['No PII on-chain','Encrypted vaults','SD-JWT','AnonCreds','ZKP'], approach: 'Minimal data on-chain, selective disclosure for credentials' },
  R9:  { techs: ['Controller property','Multi-sig','Subdomain hierarchy','capabilityDelegation'], approach: 'DID Document controller/delegation properties' },
  R10: { techs: ['Blockchain (global)','DNS (global)','No jurisdiction binding'], approach: 'Method works without jurisdiction-specific infrastructure' },
  R11: { techs: ['Decentralized consensus','No admin keys','Censorship-resistant registry'], approach: 'No single authority can revoke the DID' },
  R12: { techs: ['One-time tx fee','Free resolution','No subscriptions'], approach: 'Minimal ongoing costs for DID maintenance' },
  R13: { techs: ['Open-source resolver','W3C standard format','Multiple implementations'], approach: 'Standard format + open-source tooling' },
  R14: { techs: ['Pairwise DIDs','ZKP','SD-JWT','Encrypted storage','Blind indexes'], approach: 'Correlation mitigation via selective disclosure or pairwise identifiers' },
  R15: { techs: ['ML-DSA-44','ML-KEM-768','Algorithm agility','Hybrid mode'], approach: 'Post-quantum key types defined or migration path documented' },
  R16: { techs: ['Blockchain persistence','IPFS pinning','Multi-node redundancy'], approach: 'Data survives on registry even if issuer disappears' },
  R17: { techs: ['Multiple implementations','Open-source','Standard protocol'], approach: 'Not tied to a single software deployment' },
  R18: { techs: ['Self-custody keys','No platform dependency','Exportable DID'], approach: 'Controller retains keys independent of provider' },
  R19: { techs: ['DIDComm v2','ECIES encryption','X25519 key agreement'], approach: 'Authenticated encrypted messaging via DID Document keys' },
  R20: { techs: ['Cross-chain','Multiple registries','Registry abstraction'], approach: 'Method can work on multiple registries or chains' },
  R21: { techs: ['LEI binding','KYC attestation','eIDAS certificate','X.509 bridge'], approach: 'DID binds to a legal identity via verifiable credential' },
  R22: { techs: ['Human-readable aliases','DNS mapping','Name service'], approach: 'User-facing names instead of cryptographic hashes' },
}

// ─── Cross-method compatibility knowledge ───────────────────────────────────

const COMPATIBILITY_MAP = {
  // Methods known to interoperate via specific protocols
  'did:web':    { compatWith: ['did:key','did:peer','did:ethr','did:ion','did:jwk'], via: 'Universal Resolver + JSON-LD' },
  'did:key':    { compatWith: ['did:web','did:peer','did:ethr','did:jwk'], via: 'Key-only, works with any VC framework' },
  'did:peer':   { compatWith: ['did:key','did:web','did:ethr'], via: 'DIDComm v2 — peer exchange' },
  'did:ethr':   { compatWith: ['did:web','did:key','did:peer','did:pkh','did:ens'], via: 'Ethereum ecosystem + Universal Resolver' },
  'did:ion':    { compatWith: ['did:web','did:key','did:ethr'], via: 'Sidetree protocol + Universal Resolver' },
  'did:pkh':    { compatWith: ['did:ethr','did:ens','did:sol','did:sns'], via: 'Blockchain address derivation — multi-chain' },
  'did:ens':    { compatWith: ['did:ethr','did:pkh','did:sns'], via: 'Name service method — Ethereum equivalent of did:sns' },
  'did:sns':    { compatWith: ['did:ens','did:pkh','did:web','did:key','did:peer'], via: 'Universal Resolver + Credo-TS + DIDComm v2 + SD-JWT' },
  'did:sov':    { compatWith: ['did:indy','did:peer','did:web'], via: 'Hyperledger Indy/Aries ecosystem' },
  'did:indy':   { compatWith: ['did:sov','did:peer','did:web'], via: 'Hyperledger Aries agent framework' },
  'did:prism':  { compatWith: ['did:web','did:key','did:peer'], via: 'Cardano ecosystem + Identus framework' },
  'did:ebsi':   { compatWith: ['did:web','did:key','did:ethr'], via: 'EBSI European Blockchain — eIDAS compliance' },
  'did:cheqd':  { compatWith: ['did:web','did:key','did:indy'], via: 'Cosmos SDK + Veramo/ACA-Py integration' },
  'did:jwk':    { compatWith: ['did:web','did:key'], via: 'JWK-based — works with any JOSE library' },
  'did:plc':    { compatWith: ['did:web'], via: 'AT Protocol (Bluesky) — custom resolution' },
  'did:webvh':  { compatWith: ['did:web','did:key'], via: 'Web-based with verifiable history' },
}

// ─── Industry tags for well-known methods ───────────────────────────────────

const KNOWN_INDUSTRIES = {
  'did:sns':   ['cross-border-finance','banking-kyc','defi-identity','government-eid','academic-credentials','patient-health','messaging','supply-chain'],
  'did:ethr':  ['defi-identity','supply-chain','iot-devices'],
  'did:web':   ['enterprise','government-eid','academic-credentials'],
  'did:ion':   ['enterprise'],
  'did:sov':   ['government-eid','banking-kyc'],
  'did:indy':  ['government-eid','banking-kyc','patient-health'],
  'did:prism': ['government-eid','academic-credentials'],
  'did:ebsi':  ['government-eid','academic-credentials','cross-border-finance'],
  'did:cheqd': ['enterprise','banking-kyc'],
  'did:ens':   ['defi-identity','messaging','social-media'],
  'did:pkh':   ['defi-identity'],
  'did:plc':   ['social-media','messaging'],
  'did:peer':  ['messaging'],
  'did:key':   ['messaging'],
}

// ─── L2 industry inference (improved) ───────────────────────────────────────

function inferIndustries(m) {
  // Use known tags first
  const known = KNOWN_INDUSTRIES[m.method]
  if (known) return known

  const tags = []
  const uc = m.focalUseCases || {}
  const nf = m.nonFocalUseCases || {}
  const r = m.requirements || {}
  const f = m.features || {}

  if ((uc['Enterprise Identifiers']?.score || 0) >= 75) {
    if (f.selectiveDisclosure || r.R21) tags.push('cross-border-finance')
    if (r.R8 && r.R14) tags.push('banking-kyc')
  }
  if (m.isBlockchainBased && m.cryptoSupport?.secp256k1 && (r.R11 || r.R12)) tags.push('defi-identity')
  if ((nf['Vehicle Assemblies']?.score || 0) >= 70 || (nf['Supply Chain Pseudonymity']?.score || 0) >= 70) tags.push('supply-chain')
  if ((nf['eIDAS Public Authority Credentials']?.score || 0) >= 75 || (nf['Digital Permanent Resident Card']?.score || 0) >= 75) tags.push('government-eid')
  if ((uc['Life-long Credentials (Education)']?.score || 0) >= 70) tags.push('academic-credentials')
  if ((uc['Prescriptions (Healthcare)']?.score || 0) >= 70) tags.push('patient-health')
  if ((uc['Digital Executor (Law)']?.score || 0) >= 70) tags.push('government-eid')
  if ((uc['Portable Secure Communication']?.score || 0) >= 70) tags.push('messaging')
  if (m.isPeerBased && r.R14) tags.push('social-media')

  return [...new Set(tags)]
}

// ─── Build per-requirement tech approach ────────────────────────────────────

function buildReqTechs(m) {
  const result = {}
  const r = m.requirements || {}
  const f = m.features || {}
  const c = m.cryptoSupport || {}

  for (const [rId, info] of Object.entries(TECH_FOR_REQUIREMENT)) {
    const met = !!r[rId]
    const techs = []

    if (met) {
      // Add specific techs based on method features
      if (rId === 'R1' || rId === 'R5') {
        if (c.ed25519) techs.push('Ed25519')
        if (c.secp256k1) techs.push('secp256k1')
        if (c.p256) techs.push('P-256')
        if (c.bls) techs.push('BLS12-381')
        if (c.postQuantum) techs.push('ML-DSA-44')
      }
      if (rId === 'R6' && f.keyRotation) techs.push('DID Document update')
      if (rId === 'R7') techs.push('Service endpoints')
      if (rId === 'R8') {
        if (f.selectiveDisclosure) techs.push('Selective Disclosure')
        techs.push('No PII on-chain')
      }
      if (rId === 'R9' && f.multiSig) techs.push('Multi-sig')
      if (rId === 'R14') {
        if (f.selectiveDisclosure) techs.push('SD-JWT')
        if (m.isPeerBased) techs.push('Pairwise DIDs')
      }
      if (rId === 'R15' && c.postQuantum) techs.push('ML-DSA-44 / ML-KEM-768')
      if (rId === 'R19' && f.didComm) techs.push('DIDComm v2')
      if (rId === 'R22') {
        if (m.method.includes('sns') || m.method.includes('ens')) techs.push('Name service alias')
        else if (m.isWebBased) techs.push('DNS domain')
      }

      // Fallback to generic if no specific techs
      if (techs.length === 0) techs.push(info.approach)
    }

    result[rId] = { met, techs, approach: info.approach }
  }

  return result
}

// ─── Build compact record ────────────────────────────────────────────────────

function compact(m) {
  const r = m.requirements || {}
  const f = m.features || {}
  const c = m.cryptoSupport || {}
  const uc = m.focalUseCases || {}
  const compat = COMPATIBILITY_MAP[m.method] || null

  return {
    method: m.method,
    abstract: m.repoDescription || null,
    specUrl: m.specUrl || null,
    repoUrl: m.repoUrl || null,
    githubRepo: m.githubRepo || null,

    // Health
    stars: m.repoStars || 0,
    lastCommit: m.lastCommitDate || null,
    archived: m.repoArchived || false,
    active: m.isActive || false,
    specLive: m.specLive || false,
    specLength: m.specLengthChars || null,

    // Registry
    blockchain: m.blockchain || null,
    registryType: m.isBlockchainBased ? 'blockchain' : m.isWebBased ? 'web' : m.isPeerBased ? 'peer' : 'other',

    // Requirements
    reqMet: Object.entries(r).filter(([k, v]) => v && k.match(/^R\d+$/)).map(([k]) => k),
    reqPct: m.requirementsPct || 0,
    reqTotal: m.totalRequirementsMet || 0,

    // Per-requirement tech approach
    reqTechs: buildReqTechs(m),

    // Use case scores
    ucScores: {
      enterprise: uc['Enterprise Identifiers']?.score || 0,
      education: uc['Life-long Credentials (Education)']?.score || 0,
      healthcare: uc['Prescriptions (Healthcare)']?.score || 0,
      legal: uc['Digital Executor (Law)']?.score || 0,
      credentials: uc['Alice Rents a Car (Credentials)']?.score || 0,
      communication: uc['Portable Secure Communication']?.score || 0,
    },

    // Benefits
    benefits: m.benefitScores || {},

    // Industries (enriched)
    industries: inferIndustries(m),

    // Crypto
    crypto: {
      ed25519: c.ed25519 || false,
      secp256k1: c.secp256k1 || false,
      p256: c.p256 || false,
      bls: c.bls || false,
      pq: c.postQuantum || false,
    },

    // Features
    feat: {
      create: !!f.supportsCreate,
      read: !!f.supportsRead,
      update: !!f.supportsUpdate,
      deactivate: !!f.supportsDeactivate,
      keyRotation: f.keyRotation || false,
      didLog: f.didLog || false,
      recovery: f.recovery || false,
      multiSig: f.multiSig || false,
      vc: f.verifiableCredentials || false,
      sd: f.selectiveDisclosure || false,
      didcomm: f.didComm || false,
      resolver: f.universalResolver || false,
      jsonld: f.jsonLd || false,
      privacy: !!r.R8,
    },

    // Cross-method compatibility
    compat: compat ? { methods: compat.compatWith, via: compat.via } : null,
  }
}

// ─── Process ─────────────────────────────────────────────────────────────────

const index = full.map(compact)
index.sort((a, b) => b.reqPct - a.reqPct || b.stars - a.stars)

const stats = {
  total: index.length,
  active: index.filter(m => m.active).length,
  specLive: index.filter(m => m.specLive).length,
  blockchain: index.filter(m => m.registryType === 'blockchain').length,
  web: index.filter(m => m.registryType === 'web').length,
  peer: index.filter(m => m.registryType === 'peer').length,
  archived: index.filter(m => m.archived).length,
  pq: index.filter(m => m.crypto.pq).length,
  fullReq: index.filter(m => m.reqPct === 100).length,
  withCompat: index.filter(m => m.compat).length,
  chains: {},
}
for (const m of index) { if (m.blockchain) stats.chains[m.blockchain] = (stats.chains[m.blockchain] || 0) + 1 }

const output = { version: '2.1.0', generated: new Date().toISOString().split('T')[0], stats, methods: index }
writeFileSync('data/methods-index.json', JSON.stringify(output))

const kb = (JSON.stringify(output).length / 1024).toFixed(0)
console.log(`Built enriched index: ${index.length} methods → data/methods-index.json (${kb} KB)`)
console.log(`  With compatibility data: ${stats.withCompat}`)
console.log(`  With reqTechs: ${index.filter(m => Object.keys(m.reqTechs).length > 0).length}`)
console.log(`  With industries: ${index.filter(m => m.industries.length > 0).length}`)
console.log(`  With abstracts: ${index.filter(m => m.abstract).length}`)
