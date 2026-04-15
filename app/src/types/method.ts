/**
 * Core types for the DID Landscape Explorer.
 *
 * These types define the data model for method entries, assessments,
 * and the requirement/use-case framework. All data is community-sourced
 * via JSON files — the tool renders and compares, it does not judge.
 */

// ---------------------------------------------------------------------------
// Assessment status
// ---------------------------------------------------------------------------

/** Whether a method has been assessed for a given requirement */
export type AssessmentStatus = 'met' | 'partial' | 'not-met' | 'not-applicable' | 'not-assessed'

/** A single requirement assessment with evidence */
export interface RequirementAssessment {
  /** Assessment result */
  status: AssessmentStatus
  /** Technologies or mechanisms used to meet the requirement */
  techs: string[]
  /** Brief description of the approach */
  approach: string
  /** URL to spec section, implementation, or evidence */
  evidence?: string
  /** Who submitted this assessment */
  submittedBy?: string
  /** Whether the WG has reviewed this claim */
  verified?: boolean
}

// ---------------------------------------------------------------------------
// Features & capabilities
// ---------------------------------------------------------------------------

export interface MethodFeatures {
  create: boolean | null
  read: boolean | null
  update: boolean | null
  deactivate: boolean | null
  keyRotation: boolean | null
  didLog: boolean | null
  recovery: boolean | null
  multiSig: boolean | null
  vc: boolean | null
  sd: boolean | null
  didcomm: boolean | null
  resolver: boolean | null
  jsonld: boolean | null
  privacy: boolean | null
}

export interface CryptoSupport {
  ed25519: boolean | null
  secp256k1: boolean | null
  p256: boolean | null
  bls: boolean | null
  pq: boolean | null
}

// ---------------------------------------------------------------------------
// Use case scores
// ---------------------------------------------------------------------------

export interface UseCaseScores {
  enterprise: number | null
  education: number | null
  healthcare: number | null
  legal: number | null
  credentials: number | null
  communication: number | null
}

// ---------------------------------------------------------------------------
// Lifecycle & maturity
// ---------------------------------------------------------------------------

/** Lifecycle status — decided by method community or WG, not computed */
export type LifecycleStatus =
  | 'experimental'
  | 'active'
  | 'stable'
  | 'deprecated'
  | 'legacy'
  | 'not-assessed'

/** Raw maturity signals — displayed as-is, not converted to levels */
export interface MaturitySignals {
  hasSpec: boolean | null
  specSections: number | null
  implementations: number | null
  testSuite: boolean | null
  productionDeployments: number | null
  activeContributors: number | null
  lastSpecUpdate: string | null
  /** Community-declared lifecycle — NOT computed by the tool */
  lifecycle: LifecycleStatus
}

// ---------------------------------------------------------------------------
// Registry categories
// ---------------------------------------------------------------------------

export type RegistryType =
  | 'blockchain'
  | 'web'
  | 'peer'
  | 'ledger'
  | 'generative'
  | 'hybrid'
  | 'other'

// ---------------------------------------------------------------------------
// Method entry (the main data model)
// ---------------------------------------------------------------------------

export interface MethodEntry {
  /** DID method name, e.g. "did:webvh" */
  method: string
  /** Brief description */
  abstract: string | null

  // --- Spec & repo ---
  specUrl: string | null
  repoUrl: string | null
  githubRepo: string | null
  stars: number | null
  lastCommit: string | null
  archived: boolean

  // --- Classification ---
  registryType: RegistryType
  blockchain: string | null

  // --- Assessment state ---
  /** Whether this method has been assessed by its community */
  assessed: boolean
  /** Per-requirement assessments */
  requirements: Record<string, RequirementAssessment>
  /** Computed: requirements with status 'met' or 'partial' */
  reqMet: string[]
  /** Computed: percentage of requirements met */
  reqPct: number

  // --- Capabilities ---
  feat: MethodFeatures
  crypto: CryptoSupport
  ucScores: UseCaseScores

  // --- Maturity ---
  maturity: MaturitySignals

  // --- Interoperability ---
  compat: {
    methods: string[]
    via: string
  }

  // --- Industries ---
  industries: string[]
}

// ---------------------------------------------------------------------------
// Requirements & use cases (reference data)
// ---------------------------------------------------------------------------

export interface Requirement {
  id: string
  name: string
  description: string
  tier: 'core' | 'common' | 'specialized'
}

export interface UseCaseCategory {
  id: string
  name: string
  description: string
}

export interface UseCase {
  id: string
  name: string
  category: string
  description: string
  w3cSection: string
  detailLevel: 'full' | 'brief'
  detailUrl: string | null
  requiredRequirements: string[]
  industries: string[]
  actors: string[]
  tags: string[]
  /** @deprecated alias for requiredRequirements — kept for backwards compat */
  requirements?: string[]
}

// ---------------------------------------------------------------------------
// Revision & contributor identity
// ---------------------------------------------------------------------------

/** DID method used by the contributor to sign their assessment */
export type SigningMethod = 'did:key' | 'did:web' | 'did:pkh' | 'did:ens' | 'did:sns' | 'caip10' | 'custom'

/** How the assessment was produced */
export type Methodology = 'manual' | 'llm-assisted' | 'automated' | 'hybrid'

/** Contributor identity for a revision */
export interface RevisionContributor {
  /** Contributor's DID */
  did: string
  /** DID method used for signing */
  method: SigningMethod
  /** Display name (optional, not authoritative) */
  displayName?: string
}

/** A single assessment revision from one contributor */
export interface AssessmentRevision {
  /** Unique revision ID */
  id: string
  /** Who submitted this revision */
  contributor: RevisionContributor
  /** LLM model used, if any */
  model: string | null
  /** How the assessment was produced */
  methodology: Methodology
  /** ISO 8601 timestamp */
  date: string
  /** Git commit hash of the repo at time of analysis */
  repoCommit: string | null
  /** Per-requirement assessments in this revision */
  requirements: Record<string, { status: AssessmentStatus; approach?: string; evidence?: string }>
  /** Feature assessments in this revision */
  features: Record<string, boolean | null>
  /** Free-form notes */
  notes: string
  /** Cryptographic proof (Phase 3 — VC/VP envelope) */
  proof?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Grading (display-only, not authoritative)
// ---------------------------------------------------------------------------

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' | 'N/A'

export interface GradeResult {
  grade: Grade
  pct: number
  label: string
  color: string
}
