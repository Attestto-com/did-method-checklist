import type { LifecycleStatus, RegistryType } from '@/types/method'

/**
 * Taxonomy configuration.
 *
 * Categories, lifecycle statuses, and feature definitions.
 * These are PROPOSALS — subject to WG review and approval.
 * See: https://github.com/w3c/did-extensions/issues/TBD
 */

// ---------------------------------------------------------------------------
// Registry categories
// ---------------------------------------------------------------------------

export const REGISTRY_TYPES: Record<RegistryType, { label: string; description: string }> = {
  blockchain: { label: 'Blockchain', description: 'Identity anchored to a blockchain ledger (e.g., Ethereum, Solana, Bitcoin)' },
  web: { label: 'Web', description: 'Identity anchored to web domains or URLs (e.g., did:web)' },
  peer: { label: 'Peer', description: 'Identity exchanged peer-to-peer without a registry (e.g., did:peer)' },
  ledger: { label: 'Ledger', description: 'Identity anchored to a purpose-built identity ledger (e.g., Indy)' },
  generative: { label: 'Generative', description: 'Identity derived algorithmically from key material (e.g., did:key, did:pkh)' },
  hybrid: { label: 'Hybrid', description: 'Combines multiple registry types (e.g., did:webvh — web + cryptographic log)' },
  other: { label: 'Other', description: 'Does not fit the above categories' },
}

// ---------------------------------------------------------------------------
// Lifecycle statuses
// ---------------------------------------------------------------------------

export const LIFECYCLE_STATUSES: Record<LifecycleStatus, { label: string; color: string; description: string }> = {
  experimental: { label: 'Experimental', color: 'var(--color-purple)', description: 'Early stage — spec in development, few or no production deployments' },
  active: { label: 'Active', color: 'var(--color-green)', description: 'Actively maintained — spec published, community engaged, implementations exist' },
  stable: { label: 'Stable', color: 'var(--color-blue)', description: 'Mature — spec stable, multiple implementations, production deployments' },
  deprecated: { label: 'Deprecated', color: 'var(--color-yellow)', description: 'Superseded — still works but a newer method is recommended' },
  legacy: { label: 'Legacy', color: 'var(--color-text-dim)', description: 'No longer actively developed — may still be in use' },
  'not-assessed': { label: 'Not Assessed', color: 'var(--color-text-dim)', description: 'Lifecycle status has not been determined' },
}

// ---------------------------------------------------------------------------
// Feature definitions
// ---------------------------------------------------------------------------

export const FEATURE_DEFINITIONS = [
  { key: 'create', label: 'Create', description: 'DID creation operation defined' },
  { key: 'read', label: 'Read/Resolve', description: 'DID resolution operation defined' },
  { key: 'update', label: 'Update', description: 'DID Document update operation defined' },
  { key: 'deactivate', label: 'Deactivate', description: 'DID deactivation operation defined' },
  { key: 'keyRotation', label: 'Key Rotation', description: 'Keys can be replaced without changing the DID' },
  { key: 'didLog', label: 'DID Log', description: 'Verifiable history of DID Document changes' },
  { key: 'recovery', label: 'Recovery', description: 'Key recovery mechanism defined' },
  { key: 'multiSig', label: 'Multi-Sig', description: 'Multi-signature or threshold control' },
  { key: 'vc', label: 'VC Support', description: 'Works with W3C Verifiable Credentials' },
  { key: 'sd', label: 'Selective Disclosure', description: 'Supports SD-JWT or similar selective disclosure' },
  { key: 'didcomm', label: 'DIDComm', description: 'Supports DIDComm v2 messaging' },
  { key: 'resolver', label: 'Universal Resolver', description: 'Driver available for the Universal Resolver' },
  { key: 'jsonld', label: 'JSON-LD', description: 'JSON-LD context defined' },
  { key: 'privacy', label: 'Privacy Features', description: 'Pairwise DIDs, correlation mitigation, or similar' },
] as const

export type FeatureKey = typeof FEATURE_DEFINITIONS[number]['key']
