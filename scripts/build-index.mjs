#!/usr/bin/env node
/**
 * Build a compact V2 index from the enriched-full.json landscape data.
 * Output: data/methods-index.json (~compact, one flat object per method)
 *
 * Properties align to checklist.md sections and data/*.json catalogs.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SOURCE = process.argv[2] || '../CORTEX/docs/en/internal/identity/did-landscape/02-enriched-full.json'
const full = JSON.parse(readFileSync(SOURCE, 'utf-8'))

// ─── L2 industry inference from use-case scores ─────────────────────────────

function inferL2(m) {
  const tags = []
  const uc = m.focalUseCases || {}
  const nf = m.nonFocalUseCases || {}

  // Finance-related
  if ((uc['Enterprise Identifiers']?.score || 0) >= 75) {
    if (m.features?.selectiveDisclosure || m.requirements?.R21) tags.push('cross-border-finance')
    if (m.requirements?.R8 && m.requirements?.R14) tags.push('banking-kyc')
  }
  // DeFi
  if (m.isBlockchainBased && m.cryptoSupport?.secp256k1 && (m.requirements?.R11 || m.requirements?.R12)) {
    tags.push('defi-identity')
  }
  // Supply chain
  if ((nf['Vehicle Assemblies']?.score || 0) >= 70 || (nf['Supply Chain Pseudonymity']?.score || 0) >= 70) {
    tags.push('supply-chain')
  }
  // Government
  if ((nf['eIDAS Public Authority Credentials']?.score || 0) >= 75 || (nf['Digital Permanent Resident Card']?.score || 0) >= 75) {
    tags.push('government-eid')
  }
  // Education
  if ((uc['Life-long Credentials (Education)']?.score || 0) >= 70) {
    tags.push('academic-credentials')
  }
  // Healthcare
  if ((uc['Prescriptions (Healthcare)']?.score || 0) >= 70) {
    tags.push('patient-health')
  }
  // Legal
  if ((uc['Digital Executor (Law)']?.score || 0) >= 70) {
    tags.push('government-eid')
  }
  // Communication
  if ((uc['Portable Secure Communication']?.score || 0) >= 70) {
    tags.push('messaging')
  }
  // Social
  if (m.isPeerBased && m.requirements?.R14) {
    tags.push('social-media')
  }
  // IoT
  if (m.method.includes('io') || m.method.includes('tangle') || m.method.includes('ockam')) {
    tags.push('iot-devices')
  }

  return [...new Set(tags)]
}

// ─── Build compact record ────────────────────────────────────────────────────

function compact(m) {
  const r = m.requirements || {}
  const f = m.features || {}
  const c = m.cryptoSupport || {}
  const uc = m.focalUseCases || {}

  return {
    // Identity
    method: m.method,
    specUrl: m.specUrl || null,
    repoUrl: m.repoUrl || null,
    githubRepo: m.githubRepo || null,

    // Health signals
    stars: m.repoStars || 0,
    lastCommit: m.lastCommitDate || null,
    archived: m.repoArchived || false,
    active: m.isActive || false,
    specLive: m.specLive || false,
    specLength: m.specLengthChars || null,

    // Registry
    blockchain: m.blockchain || null,
    registryType: m.isBlockchainBased ? 'blockchain' : m.isWebBased ? 'web' : m.isPeerBased ? 'peer' : 'other',

    // W3C Requirements (compact: array of met requirement IDs)
    reqMet: Object.entries(r).filter(([k, v]) => v && k.match(/^R\d+$/)).map(([k]) => k),
    reqPct: m.requirementsPct || 0,
    reqTotal: m.totalRequirementsMet || 0,

    // Focal use case scores
    ucScores: {
      enterprise: uc['Enterprise Identifiers']?.score || 0,
      education: uc['Life-long Credentials (Education)']?.score || 0,
      healthcare: uc['Prescriptions (Healthcare)']?.score || 0,
      legal: uc['Digital Executor (Law)']?.score || 0,
      credentials: uc['Alice Rents a Car (Credentials)']?.score || 0,
      communication: uc['Portable Secure Communication']?.score || 0,
    },

    // Benefit scores
    benefits: m.benefitScores || {},

    // L2 industry tags (inferred)
    industries: inferL2(m),

    // Crypto (compact flags)
    crypto: {
      ed25519: c.ed25519 || false,
      secp256k1: c.secp256k1 || false,
      p256: c.p256 || false,
      bls: c.bls || false,
      pq: c.postQuantum || false,
    },

    // Features (compact flags)
    feat: {
      create: !!r.supportsCreate || !!m.features?.supportsCreate,
      read: !!r.supportsRead || !!m.features?.supportsRead,
      update: !!r.supportsUpdate || !!m.features?.supportsUpdate,
      deactivate: !!r.supportsDeactivate || !!m.features?.supportsDeactivate,
      keyRotation: f.keyRotation || false,
      didLog: f.didLog || false,
      recovery: f.recovery || false,
      multiSig: f.multiSig || false,
      vc: f.verifiableCredentials || false,
      sd: f.selectiveDisclosure || false,
      didcomm: f.didComm || false,
      resolver: f.universalResolver || false,
      jsonld: f.jsonLd || false,
      privacy: !!m.requirements?.R8,
    },
  }
}

// ─── Process ─────────────────────────────────────────────────────────────────

const index = full.map(compact)

// Sort by reqPct desc, then stars desc
index.sort((a, b) => b.reqPct - a.reqPct || b.stars - a.stars)

// Stats
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
  chains: {},
}

for (const m of index) {
  if (m.blockchain) {
    stats.chains[m.blockchain] = (stats.chains[m.blockchain] || 0) + 1
  }
}

const output = { version: '2.0.0', generated: new Date().toISOString().split('T')[0], stats, methods: index }

writeFileSync('data/methods-index.json', JSON.stringify(output))
console.log(`Built index: ${index.length} methods → data/methods-index.json (${(JSON.stringify(output).length / 1024).toFixed(0)} KB)`)
console.log(`Stats:`, JSON.stringify(stats, null, 2))
