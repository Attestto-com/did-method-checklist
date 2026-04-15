import type { Requirement } from '@/types/method'

/**
 * W3C DID Requirements (R1–R22).
 *
 * Source: https://www.w3.org/TR/2021/NOTE-did-use-cases-20210317/
 *
 * Tier classification:
 * - core: expected of any serious DID method
 * - common: important for most implementations
 * - specialized: needed for specific domains
 */
export const REQUIREMENTS: Requirement[] = [
  { id: 'R1', name: 'Authentication / Proof of Control', description: 'Digital signature using keys in DID Document', tier: 'core' },
  { id: 'R2', name: 'Decentralized / Self-Issued', description: 'Controller creates DID without central authority', tier: 'common' },
  { id: 'R3', name: 'Guaranteed Unique Identifier', description: 'Registry enforces global uniqueness', tier: 'common' },
  { id: 'R4', name: 'No Call Home', description: 'Resolution reads from public registry, not issuer', tier: 'specialized' },
  { id: 'R5', name: 'Associated Cryptographic Material', description: 'DID Document contains verification methods', tier: 'common' },
  { id: 'R6', name: 'Streamlined Key Rotation', description: 'Replace keys in DID Document without changing DID', tier: 'specialized' },
  { id: 'R7', name: 'Service Endpoint Discovery', description: 'Service endpoints in DID Document', tier: 'common' },
  { id: 'R8', name: 'Privacy Preserving', description: 'Minimal data on-chain, selective disclosure for credentials', tier: 'common' },
  { id: 'R9', name: 'Delegation of Control', description: 'DID Document controller/delegation properties', tier: 'specialized' },
  { id: 'R10', name: 'Inter-Jurisdictional', description: 'Method works without jurisdiction-specific infrastructure', tier: 'common' },
  { id: 'R11', name: 'Cannot Be Administratively Denied', description: 'No single authority can revoke the DID', tier: 'specialized' },
  { id: 'R12', name: 'Minimized Rents', description: 'Minimal ongoing costs for DID maintenance', tier: 'specialized' },
  { id: 'R13', name: 'No Vendor Lock-In', description: 'Standard format + open-source tooling', tier: 'common' },
  { id: 'R14', name: 'Preempt / Limit Trackable Data Trails', description: 'Correlation mitigation via selective disclosure or pairwise identifiers', tier: 'specialized' },
  { id: 'R15', name: 'Cryptographic Future-Proof', description: 'Post-quantum key types defined or migration path documented', tier: 'specialized' },
  { id: 'R16', name: 'Survives Issuing Organization Mortality', description: 'Data survives on registry even if issuer disappears', tier: 'specialized' },
  { id: 'R17', name: 'Survives Deployment End-of-Life', description: 'Not tied to a single software deployment', tier: 'specialized' },
  { id: 'R18', name: 'Survives Relationship with Service Provider', description: 'Controller retains keys independent of provider', tier: 'common' },
  { id: 'R19', name: 'Cryptographic Authentication & Communication', description: 'Authenticated encrypted messaging via DID Document keys', tier: 'specialized' },
  { id: 'R20', name: 'Registry Agnostic', description: 'Method can work on multiple registries or chains', tier: 'specialized' },
  { id: 'R21', name: 'Legally-Enabled Identity', description: 'DID binds to a legal identity via verifiable credential', tier: 'specialized' },
  { id: 'R22', name: 'Human-Centered Interoperability', description: 'User-facing names instead of cryptographic hashes', tier: 'core' },
]

export const REQUIREMENTS_MAP = Object.fromEntries(REQUIREMENTS.map(r => [r.id, r]))

export const TOTAL_REQUIREMENTS = REQUIREMENTS.length
