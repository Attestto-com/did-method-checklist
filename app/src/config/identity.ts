/**
 * Identity provider configuration — controls which signing flows
 * are available in the Self-Assessment wizard.
 *
 * Fork-friendly: disable flows you don't need, add custom ones.
 */

import type { SigningMethod } from '@/types/method'

export interface IdentityProviderConfig {
  /** Unique key for this flow */
  key: string
  /** Display label */
  label: string
  /** Short description shown in the selector */
  description: string
  /** Icon (emoji or Unicode) */
  icon: string
  /** DID method produced by this flow */
  didMethod: SigningMethod
  /** Whether this flow is available */
  enabled: boolean
  /** Sort order (lower = first) */
  order: number
}

/**
 * Available identity connection flows.
 *
 * Each flow produces a DID that signs the assessment.
 * Add or remove entries to customize for your deployment.
 */
export const IDENTITY_PROVIDERS: IdentityProviderConfig[] = [
  {
    key: 'generate',
    label: 'Generate Key',
    description: 'Create a fresh Ed25519 keypair in your browser — no wallet or extension needed',
    icon: '\u{1F511}',
    didMethod: 'did:key',
    enabled: true,
    order: 1,
  },
  {
    key: 'wallet',
    label: 'Web3 Wallet',
    description: 'MetaMask, Phantom, or any Web3 wallet — resolves to did:sns if you have a .sol domain, otherwise signs with your wallet address (CAIP-10)',
    icon: '\u26D3',
    didMethod: 'caip10',
    enabled: true,
    order: 2,
  },
  {
    key: 'extension',
    label: 'Identity Wallet',
    description: 'Present a credential from any W3C-compatible identity wallet extension',
    icon: '\u{1F6E1}',
    didMethod: 'custom',
    enabled: true,
    order: 3,
  },
  {
    key: 'github',
    label: 'GitHub Account',
    description: 'Authenticate with GitHub — we derive a did:web for you on this project',
    icon: '\u2325',
    didMethod: 'did:web',
    enabled: false,
    order: 4,
  },
  {
    key: 'paste',
    label: 'Paste DID',
    description: 'Already have a DID? Paste it directly (assessment will be unsigned)',
    icon: '\u{1F4CB}',
    didMethod: 'custom',
    enabled: true,
    order: 5,
  },
]

/** DID methods accepted for signed assessments */
export const ACCEPTED_DID_METHODS: string[] = [
  'did:key',
  'did:pkh',   // kept for backward-compat with existing signed assessments
  'did:web',
  'did:sns',
  'did:ens',
  'caip10',    // degraded fallback — wallet address with no DID
]

/** Default signing method when generating a key */
export const DEFAULT_SIGNING_METHOD: SigningMethod = 'did:key'

/**
 * Universal Resolver URL for verifying DID Documents on domains.
 * Domains with a DID Document attached are marked with a checkmark.
 * Set to empty string to skip DID Document verification.
 */
export const DID_RESOLVER_URL = 'https://dev.uniresolver.io'

/** Get enabled providers sorted by order */
export function getEnabledProviders(): IdentityProviderConfig[] {
  return IDENTITY_PROVIDERS
    .filter(p => p.enabled)
    .sort((a, b) => a.order - b.order)
}
