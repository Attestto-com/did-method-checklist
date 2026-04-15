<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMethodsData } from '@/composables/useMethodsData'
import { REQUIREMENTS, REQUIREMENTS_MAP } from '@/config/requirements'
import { FEATURE_DEFINITIONS } from '@/config/taxonomy'
import type { AssessmentStatus, UseCase, UseCaseCategory, MethodEntry, SigningMethod, Methodology } from '@/types/method'
import { REGISTRY_TYPES } from '@/config/taxonomy'
import { repoZipUrl } from '@/config/urls'
import { discoverWallets, type WalletAnnouncement } from 'identity-bridge'
import { getEnabledProviders, ACCEPTED_DID_METHODS, DID_RESOLVER_URL } from '@/config/identity'
import { generateDidKey, signAssessment, persistKeyToSession, loadKeyFromSession, clearKeyFromSession, type GeneratedKey } from '@/services/did-key'
import { resolveIdentities, sns, caip10 } from 'identity-resolver'

const { methods, useCases, loadAll } = useMethodsData()
onMounted(loadAll)

// ---------------------------------------------------------------------------
// Wizard
// ---------------------------------------------------------------------------

const step = ref(1)
const STEPS = [
  { num: 1, label: 'Method Info' },
  { num: 2, label: 'Use Case' },
  { num: 3, label: 'Features' },
  { num: 4, label: 'Requirements' },
  { num: 5, label: 'Review' },
  { num: 6, label: 'Sign (optional)' },
]

// ---------------------------------------------------------------------------
// Identity (Step 1)
// ---------------------------------------------------------------------------

const contributorDid = ref('')
const signingMethod = ref<SigningMethod | null>(null)
const contributorName = ref('')
const llmModel = ref('')
const methodology = ref<Methodology>('manual')
const revisionNotes = ref('')
const identityConnected = ref(false)
const identityConnecting = ref(false)

type ConnectFlow = 'generate' | 'wallet' | 'extension' | 'github' | 'paste'

const enabledProviders = getEnabledProviders()

/** Generated signing key (session-scoped) */
const generatedKey = ref<GeneratedKey | null>(loadKeyFromSession())
/** JWS proof produced at export time */
const assessmentJws = ref<string | null>(null)
const signing = ref(false)

const selectedFlow = ref<ConnectFlow | null>(null)
const detectedWallets = ref<WalletAnnouncement[]>([])
const selectedWallet = ref<WalletAnnouncement | null>(null)
const walletDiscoveryDone = ref(false)

const chapiError = ref<string | null>(null)

/** Discover all credential wallet extensions via the universal handshake */
async function discoverCredentialWallets() {
  identityConnecting.value = true
  walletDiscoveryDone.value = false
  detectedWallets.value = []
  selectedWallet.value = null
  chapiError.value = null
  try {
    const wallets = await discoverWallets(1000)
    detectedWallets.value = wallets
    // Don't auto-connect — let user pick, then CHAPI consent happens in wallet
  } finally {
    walletDiscoveryDone.value = true
    identityConnecting.value = false
  }
}

/**
 * Request the user's holder DID via CHAPI DIDAuthentication.
 * The wallet opens its consent UI — the user picks which identity to share.
 * We only receive the DID they approved.
 */
async function requestIdentityFromWallet(wallet: WalletAnnouncement) {
  selectedWallet.value = wallet
  identityConnecting.value = true
  chapiError.value = null

  try {
    // CHAPI request — cast to any since the `web` property is a CHAPI extension
    // not in the standard CredentialRequestOptions type
    const chapiOptions = {
      web: {
        VerifiablePresentation: {
          query: { type: 'DIDAuthentication' },
          challenge: 'did-explorer-' + Date.now(),
          domain: window.location.origin,
        },
      },
    }
    const credential = await navigator.credentials.get(chapiOptions as unknown as globalThis.CredentialRequestOptions)

    // Extract holder DID from the VP response
    const cred = credential as unknown as { type: string; data: Record<string, unknown> }
    const vp = cred?.data
    const holderDid = (vp?.holder as string) || null

    if (!holderDid || !holderDid.startsWith('did:')) {
      chapiError.value = 'Wallet did not return a valid holder DID'
      identityConnecting.value = false
      return
    }

    contributorDid.value = holderDid
    const methodPrefix = holderDid.split(':').slice(0, 2).join(':') as SigningMethod
    signingMethod.value = (ACCEPTED_DID_METHODS as string[]).includes(methodPrefix)
      ? methodPrefix as SigningMethod
      : 'custom'
    identityConnected.value = true
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Request cancelled'
    if (msg === 'User declined') {
      chapiError.value = 'Identity request was declined'
    } else if (msg === 'Wallet is locked' || msg === 'No key pair in vault' || msg === 'No holder DID configured') {
      chapiError.value = 'Wallet has no DID yet — open the extension and click "Create DID" first, then try again.'
    } else {
      chapiError.value = msg
    }
  } finally {
    identityConnecting.value = false
  }
}

type WalletChain = 'solana' | 'ethereum'
const walletChain = ref<WalletChain | null>(null)
const resolvingIdentity = ref(false)
const resolvedDomain = ref<string | null>(null)
const allResolvedDomains = ref<{ label: string; did: string; isFavourite: boolean; hasDidDocument: boolean }[]>([])

/** After Solana wallet connects, try to resolve SNS domain */
async function resolveSnsDomain(address: string) {
  resolvingIdentity.value = true
  resolvedDomain.value = null
  allResolvedDomains.value = []
  try {
    // Pass 1: resolve all SNS domains
    const identities = await resolveIdentities({
      chain: 'solana',
      address,
      providers: [sns(), caip10()],
    })
    const snsResults = identities.filter(i => i.provider === 'sns' && i.did)
    if (snsResults.length > 0) {
      contributorDid.value = snsResults[0].did!
      signingMethod.value = 'did:sns'
      resolvedDomain.value = snsResults[0].label
      allResolvedDomains.value = snsResults.map(r => ({
        label: r.label,
        did: r.did!,
        isFavourite: !!(r.meta as Record<string, unknown>)?.isFavourite,
        hasDidDocument: false,
      }))

      // Pass 2: check which domains have DID Documents (DID-enabled)
      if (DID_RESOLVER_URL) {
        const verified = await resolveIdentities({
          chain: 'solana',
          address,
          providers: [sns({ resolverUrl: DID_RESOLVER_URL, requireDidDocument: true })],
        })
        const verifiedDids = new Set(verified.filter(i => i.did).map(i => i.did))
        allResolvedDomains.value = allResolvedDomains.value.map(d => ({
          ...d,
          hasDidDocument: verifiedDids.has(d.did),
        }))
        // If the favourite has a DID Document, prefer it; otherwise pick first verified
        const bestVerified = allResolvedDomains.value.find(d => d.hasDidDocument && d.isFavourite)
          || allResolvedDomains.value.find(d => d.hasDidDocument)
        if (bestVerified) {
          contributorDid.value = bestVerified.did
          resolvedDomain.value = bestVerified.label
        }
      }
    }
  } catch {
    // SNS resolution failed — did stays null (CAIP-10 in contributorDid)
  } finally {
    resolvingIdentity.value = false
  }
}

/** Connect wallet via window.solana or window.ethereum */
async function connectWallet(chain?: WalletChain) {
  identityConnecting.value = true
  try {
    // Try Solana first (or if explicitly selected)
    if (!chain || chain === 'solana') {
      const sol = (window as unknown as Record<string, unknown>).solana as { connect: () => Promise<{ publicKey: { toString: () => string } }> } | undefined
      if (sol) {
        const resp = await sol.connect()
        const solAddress = resp.publicKey.toString()
        contributorDid.value = `caip10:solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:${solAddress}`
        signingMethod.value = 'caip10'
        walletChain.value = 'solana'
        identityConnected.value = true
        // Try upgrading to did:sns in background
        resolveSnsDomain(solAddress)
        return
      }
    }

    // Then Ethereum
    if (!chain || chain === 'ethereum') {
      const eth = (window as unknown as Record<string, unknown>).ethereum as { request: (args: { method: string }) => Promise<string[]> } | undefined
      if (eth) {
        const accounts = await eth.request({ method: 'eth_requestAccounts' })
        if (accounts[0]) {
          contributorDid.value = `caip10:eip155:1:${accounts[0]}`
          signingMethod.value = 'caip10'
          walletChain.value = 'ethereum'
          identityConnected.value = true
          return
        }
      }
    }

    // No wallet found
    contributorDid.value = ''
    identityConnected.value = false
  } catch {
    identityConnected.value = false
  } finally {
    identityConnecting.value = false
  }
}

/** Detect which wallet providers are available */
const availableChains = computed(() => {
  const chains: { key: WalletChain; label: string; icon: string }[] = []
  if ((window as unknown as Record<string, unknown>).solana) {
    chains.push({ key: 'solana', label: 'Solana', icon: '◎' })
  }
  if ((window as unknown as Record<string, unknown>).ethereum) {
    chains.push({ key: 'ethereum', label: 'Ethereum', icon: 'Ξ' })
  }
  return chains
})

/** Generate a did:key in the browser */
async function generateKey() {
  identityConnecting.value = true
  try {
    const key = await generateDidKey()
    generatedKey.value = key
    persistKeyToSession(key)
    contributorDid.value = key.did
    signingMethod.value = 'did:key'
    identityConnected.value = true
  } catch {
    identityConnected.value = false
  } finally {
    identityConnecting.value = false
  }
}

/** Handle flow selection */
function selectFlow(flow: ConnectFlow) {
  selectedFlow.value = flow
  identityConnected.value = false
  contributorDid.value = ''
  signingMethod.value = null
  assessmentJws.value = null

  if (flow === 'generate') {
    generateKey()
  } else if (flow === 'wallet') {
    connectWallet()
  } else if (flow === 'extension') {
    discoverCredentialWallets()
  }
  // 'paste' — user types DID manually (handled in template)
  // 'github' — Phase 4
}

/** Sign the current assessment JSON with the generated key */
async function signCurrentAssessment() {
  if (!generatedKey.value) return
  signing.value = true
  try {
    const result = await signAssessment(
      exportJson.value,
      generatedKey.value.privateKeyJwk,
      generatedKey.value.did,
      generatedKey.value.verificationMethodId,
    )
    assessmentJws.value = result.jws
  } finally {
    signing.value = false
  }
}

const METHODOLOGIES: { key: Methodology; label: string; description: string }[] = [
  { key: 'manual', label: 'Manual Review', description: 'You read the spec and assessed it yourself' },
  { key: 'llm-assisted', label: 'LLM-Assisted', description: 'You used an LLM to help analyse the spec' },
  { key: 'automated', label: 'Fully Automated', description: 'An LLM or tool generated the entire assessment' },
  { key: 'hybrid', label: 'Team / Hybrid', description: 'Multiple people and/or models collaborated' },
]

// ---------------------------------------------------------------------------
// Method Info (Step 2)
// ---------------------------------------------------------------------------

const methodName = ref('')
const specUrl = ref('')
const repoUrl = ref('')
const blockchain = ref('')
const registryType = ref('blockchain')
const contactName = ref('')

// ---------------------------------------------------------------------------
// Use Case (Step 2)
// ---------------------------------------------------------------------------

const selectedUseCaseId = ref<string | null>(null)
const audienceFilter = ref<string | null>(null)

const catNames: Record<string, string> = {
  'CAT-FIN': 'Finance & Commerce',
  'CAT-GOV': 'Government & Legal',
  'CAT-EDU': 'Education & Skills',
  'CAT-HEALTH': 'Healthcare',
  'CAT-INFRA': 'Infrastructure & Supply Chain',
  'CAT-PRIVACY': 'Privacy & Communication',
}

const categories = computed<UseCaseCategory[]>(() => {
  const catMap = new Map<string, UseCaseCategory>()
  for (const uc of useCasesList.value) {
    if (!catMap.has(uc.category)) {
      catMap.set(uc.category, { id: uc.category, name: catNames[uc.category] ?? uc.category, description: '' })
    }
  }
  return Array.from(catMap.values())
})

const useCasesList = computed<UseCase[]>(() =>
  useCases.value.map(uc => ({
    ...uc,
    requiredRequirements: uc.requiredRequirements ?? uc.requirements ?? [],
    description: uc.description ?? '',
    w3cSection: uc.w3cSection ?? '',
    detailLevel: uc.detailLevel ?? 'brief',
    detailUrl: uc.detailUrl ?? null,
    industries: uc.industries ?? [],
    actors: uc.actors ?? [],
    tags: uc.tags ?? [],
  }))
)

const selectedUseCase = computed(() =>
  useCasesList.value.find(uc => uc.id === selectedUseCaseId.value) ?? null
)

const useCaseRequirements = computed(() => {
  if (!selectedUseCase.value) return []
  return selectedUseCase.value.requiredRequirements.map(id => REQUIREMENTS_MAP[id]).filter(Boolean)
})

const AUDIENCES = [
  { key: 'Persons', match: ['consumer', 'patient', 'student', 'user', 'worker', 'citizen', 'holder', 'resident', 'sender', 'receiver'] },
  { key: 'Business', match: ['corporation', 'employer', 'firm', 'manufacturer', 'merchant', 'supplier', 'importer'] },
  { key: 'Enterprise', match: ['enterprise', 'regulator', 'auditor', 'court', 'public-authority', 'customs-authority'] },
]

function useCaseMatchesAudience(uc: UseCase): boolean {
  if (!audienceFilter.value) return true
  const aud = AUDIENCES.find(a => a.key === audienceFilter.value)
  if (!aud) return true
  return uc.actors.some(actor => aud.match.includes(actor))
}

function useCasesForCategory(catId: string): UseCase[] {
  return useCasesList.value.filter(uc => uc.category === catId).filter(useCaseMatchesAudience)
}

const INDUSTRY_LABELS: Record<string, { short: string; color: string }> = {
  'cross-border-finance': { short: 'Finance', color: 'text-emerald-400 border-emerald-400/30' },
  'banking-kyc': { short: 'Banking', color: 'text-blue-400 border-blue-400/30' },
  'defi-identity': { short: 'DeFi', color: 'text-purple-400 border-purple-400/30' },
  'government-eid': { short: 'Gov', color: 'text-amber-400 border-amber-400/30' },
  'academic-credentials': { short: 'Edu', color: 'text-cyan-400 border-cyan-400/30' },
  'patient-health': { short: 'Health', color: 'text-red-400 border-red-400/30' },
  'messaging': { short: 'Comms', color: 'text-green-400 border-green-400/30' },
  'supply-chain': { short: 'Supply', color: 'text-orange-400 border-orange-400/30' },
  'social-media': { short: 'Social', color: 'text-pink-400 border-pink-400/30' },
  'iot-devices': { short: 'IoT', color: 'text-teal-400 border-teal-400/30' },
  'enterprise': { short: 'Enterprise', color: 'text-indigo-400 border-indigo-400/30' },
}
function previewIndustryLabel(ind: string): string { return INDUSTRY_LABELS[ind]?.short ?? ind }
function previewIndustryColor(ind: string): string { return INDUSTRY_LABELS[ind]?.color ?? 'text-gray-300 border-gray-600' }

const FEATURE_LABELS: Record<string, string> = {
  create: 'Create', read: 'Read', update: 'Update', deactivate: 'Deactivate',
  keyRotation: 'Key Rotation', didLog: 'DID Log', recovery: 'Recovery', multiSig: 'Multi-Sig',
  vc: 'VCs', sd: 'Selective Disclosure', didcomm: 'DIDComm', resolver: 'Resolver',
  jsonld: 'JSON-LD', privacy: 'Privacy',
}
const CRYPTO_LABELS: Record<string, string> = {
  ed25519: 'Ed25519', secp256k1: 'secp256k1', p256: 'P-256', bls: 'BLS', pq: 'Post-Quantum',
}
function previewFeatureLabel(key: string): string { return FEATURE_LABELS[key] ?? key }
function previewCryptoLabel(key: string): string { return CRYPTO_LABELS[key] ?? key }

const coveringMethods = computed(() => {
  if (!selectedUseCase.value) return []
  const reqIds = selectedUseCase.value.requiredRequirements
  return methods.value
    .filter(m => reqIds.some(id => m.reqMet.includes(id)))
    .sort((a, b) => {
      const aCov = reqIds.filter(id => a.reqMet.includes(id)).length
      const bCov = reqIds.filter(id => b.reqMet.includes(id)).length
      return bCov - aCov
    })
    .slice(0, 10)
})

const previewMethod = ref<MethodEntry | null>(null)

// ---------------------------------------------------------------------------
// Features (Step 3)
// ---------------------------------------------------------------------------

const features = ref<Record<string, boolean | null>>(
  Object.fromEntries(FEATURE_DEFINITIONS.map(f => [f.key, null]))
)

// ---------------------------------------------------------------------------
// Requirements (Step 4)
// ---------------------------------------------------------------------------

const assessments = ref<Record<string, { status: AssessmentStatus; approach: string; evidence: string }>>(
  Object.fromEntries(REQUIREMENTS.map(r => [r.id, { status: 'not-assessed' as AssessmentStatus, approach: '', evidence: '' }]))
)

const STATUS_OPTIONS: { value: AssessmentStatus; label: string; color: string }[] = [
  { value: 'met', label: 'Met', color: 'text-status-met' },
  { value: 'partial', label: 'Partial', color: 'text-status-partial' },
  { value: 'not-met', label: 'Not Met', color: 'text-status-not-met' },
  { value: 'not-applicable', label: 'N/A', color: 'text-description' },
  { value: 'not-assessed', label: 'Skip', color: 'text-dim' },
]

const assessedCount = computed(() => Object.values(assessments.value).filter(a => a.status !== 'not-assessed').length)
const metCount = computed(() => Object.values(assessments.value).filter(a => a.status === 'met').length)

// ---------------------------------------------------------------------------
// Export (Step 5)
// ---------------------------------------------------------------------------

const showExport = ref(false)

const exportJson = computed(() => {
  const reqs: Record<string, object> = {}
  for (const [id, a] of Object.entries(assessments.value)) {
    if (a.status !== 'not-assessed') {
      reqs[id] = { status: a.status, approach: a.approach || undefined, evidence: a.evidence || undefined, submittedBy: contactName.value || undefined, verified: false }
    }
  }
  const feat: Record<string, boolean | null> = {}
  for (const [k, v] of Object.entries(features.value)) feat[k] = v

  return JSON.stringify({
    method: methodName.value || 'did:your-method',
    specUrl: specUrl.value || undefined,
    repoUrl: repoUrl.value || undefined,
    blockchain: blockchain.value || undefined,
    registryType: registryType.value,
    assessed: true,
    useCase: selectedUseCase.value?.id ?? undefined,
    requirements: reqs,
    feat,
    revision: {
      id: `rev-${Date.now().toString(36)}`,
      contributor: {
        did: contributorDid.value || `did:key:pending`,
        method: signingMethod.value ?? 'did:key',
        displayName: contributorName.value || contactName.value || undefined,
      },
      model: llmModel.value || null,
      methodology: methodology.value,
      date: new Date().toISOString(),
      notes: revisionNotes.value || undefined,
      ...(assessmentJws.value ? {
        proof: {
          type: 'JsonWebSignature2020',
          jws: assessmentJws.value,
          verificationMethod: generatedKey.value?.verificationMethodId,
          created: new Date().toISOString(),
        },
      } : {}),
    },
  }, null, 2)
})

const saved = ref(false)
const STORAGE_KEY = 'did-landscape-assessment-draft'

function saveToLocal() {
  localStorage.setItem(STORAGE_KEY, exportJson.value)
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

function downloadJson() {
  const name = methodName.value.trim().replace(/[^a-z0-9_-]/gi, '-') || 'assessment'
  const blob = new Blob([exportJson.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}-assessment.json`
  a.click()
  URL.revokeObjectURL(url)
}

function loadFromLocal() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return
  try {
    const data = JSON.parse(raw)
    if (data.revision?.contributor?.did) {
      contributorDid.value = data.revision.contributor.did
      identityConnected.value = true
    }
    if (data.revision?.contributor?.method) signingMethod.value = data.revision.contributor.method
    if (data.revision?.contributor?.displayName) contributorName.value = data.revision.contributor.displayName
    if (data.revision?.model) llmModel.value = data.revision.model
    if (data.revision?.methodology) methodology.value = data.revision.methodology
    if (data.revision?.notes) revisionNotes.value = data.revision.notes
    if (data.method) methodName.value = data.method
    if (data.specUrl) specUrl.value = data.specUrl
    if (data.repoUrl) repoUrl.value = data.repoUrl
    if (data.blockchain) blockchain.value = data.blockchain
    if (data.registryType) registryType.value = data.registryType
    if (data.submittedBy?.name) contactName.value = data.submittedBy.name
    if (data.revision?.contributor?.displayName) contactName.value = data.revision.contributor.displayName
    if (data.useCase) selectedUseCaseId.value = data.useCase
    if (data.feat) {
      for (const [k, v] of Object.entries(data.feat)) {
        if (k in features.value) features.value[k] = v as boolean | null
      }
    }
    if (data.requirements) {
      for (const [id, val] of Object.entries(data.requirements)) {
        const r = val as { status?: string; approach?: string; evidence?: string }
        if (id in assessments.value) {
          if (r.status) assessments.value[id].status = r.status as AssessmentStatus
          if (r.approach) assessments.value[id].approach = r.approach
          if (r.evidence) assessments.value[id].evidence = r.evidence
        }
      }
    }
  } catch { /* ignore corrupt data */ }
}

const hasSavedDraft = computed(() => localStorage.getItem(STORAGE_KEY) !== null)

function fillDummy() {
  selectedFlow.value = 'generate'
  signingMethod.value = 'did:key'
  contributorDid.value = 'did:key:z6MkDemo1234567890abcdef'
  identityConnected.value = true
  contributorName.value = 'Jane Doe'
  methodology.value = 'manual'
  methodName.value = 'did:example'
  specUrl.value = 'https://www.w3.org/TR/did-core/#example'
  repoUrl.value = 'https://github.com/example/did-example'
  blockchain.value = ''
  registryType.value = 'web'
  contactName.value = 'Jane Doe'
  selectedUseCaseId.value = 'UC-CRED'

  // Features — partial for demo
  const demoFeatures: Record<string, boolean> = {
    create: false, read: false, update: false, deactivate: false,
    keyRotation: true, didLog: false, recovery: false, multiSig: false,
    vc: true, sd: false, didcomm: false, resolver: true, jsonld: true, privacy: true,
  }
  for (const f of FEATURE_DEFINITIONS) {
    features.value[f.key] = demoFeatures[f.key] ?? null
  }

  // Requirements — mix of met, partial, and not-assessed for realistic demo
  const statuses: Record<string, { status: AssessmentStatus; approach: string }> = {
    R1: { status: 'met', approach: 'Ed25519 signatures via DID Document keys' },
    R2: { status: 'met', approach: 'Controller creates DID via web domain' },
    R3: { status: 'met', approach: 'Domain name system enforces uniqueness' },
    R4: { status: 'met', approach: 'Resolution via HTTPS endpoint' },
    R5: { status: 'met', approach: 'DID Document contains Ed25519 verification methods' },
    R6: { status: 'partial', approach: 'Key rotation supported but requires domain access' },
    R7: { status: 'met', approach: 'Service endpoints defined in DID Document' },
    R8: { status: 'partial', approach: 'No PII in DID Document, but DID is correlatable' },
    R9: { status: 'met', approach: 'Controller property in DID Document' },
    R10: { status: 'met', approach: 'Works globally via DNS' },
    R11: { status: 'not-met', approach: 'Domain registrar can deny service' },
    R12: { status: 'met', approach: 'Domain registration cost only' },
    R13: { status: 'met', approach: 'W3C DID Core compliant, open-source' },
    R14: { status: 'not-assessed', approach: '' },
    R15: { status: 'not-assessed', approach: '' },
    R16: { status: 'partial', approach: 'Depends on domain renewal' },
    R17: { status: 'met', approach: 'Standard HTTP resolution' },
    R18: { status: 'partial', approach: 'Controller holds keys but domain is rented' },
    R19: { status: 'not-assessed', approach: '' },
    R20: { status: 'met', approach: 'alsoKnownAs for cross-method linking' },
    R21: { status: 'not-assessed', approach: '' },
    R22: { status: 'met', approach: 'Human-readable domain names' },
  }
  for (const r of REQUIREMENTS) {
    const s = statuses[r.id]
    assessments.value[r.id] = {
      status: s?.status ?? 'not-assessed',
      approach: s?.approach ?? '',
      evidence: 'https://www.w3.org/TR/did-core/',
    }
  }
}

function canAdvance(): boolean {
  if (step.value === 1) return methodName.value.trim().length > 0
  if (step.value === 2) return selectedUseCaseId.value != null
  return true
}
</script>

<template>
  <div class="space-y-4">
    <!-- Status bar -->
    <div class="card-stat px-5 py-2.5 flex items-center justify-between text-sm" style="text-align: left;">
      <div class="flex items-center gap-5 text-description text-xs">
        <span v-if="contributorDid || signingMethod">Signer: <strong class="text-primary font-mono">{{ contributorDid || signingMethod || '—' }}</strong></span>
        <span>Method: <strong class="text-primary">{{ methodName || 'not set' }}</strong></span>
        <span v-if="selectedUseCase">Use Case: <strong class="text-primary">{{ selectedUseCase.name }}</strong></span>
        <span v-if="methodology !== 'manual'">Via: <strong class="text-primary">{{ methodology }}{{ llmModel ? ' · ' + llmModel : '' }}</strong></span>
      </div>
      <div class="flex gap-2">
        <button
          v-if="hasSavedDraft && step <= 2"
          class="btn-accent"
          @click="loadFromLocal"
        >Resume Draft</button>
        <template v-if="step > 1 && step < 6">
          <button
            class="btn-success"
            @click="saveToLocal"
          >{{ saved ? 'Saved!' : 'Save' }}</button>
        </template>
      </div>
    </div>

    <!-- Step indicators -->
    <div class="grid grid-cols-6 gap-2">
      <button
        v-for="s in STEPS"
        :key="s.num"
        class="wizard-step text-left transition-colors"
        :class="step === s.num
          ? 'wizard-step--active'
          : s.num < step
            ? 'wizard-step--done'
            : ''"
        @click="s.num <= step + 1 && (step = s.num)"
      >
        <span class="wizard-step__number text-base font-bold mr-1.5">{{ s.num }}</span>
        <span class="wizard-step__label">{{ s.label }}</span>
      </button>
    </div>

    <!-- ================================================================ -->
    <!-- STEP 1: METHOD INFO -->
    <!-- ================================================================ -->
    <!-- (Identity moved to Step 6: Sign) -->

    <!-- ================================================================ -->

    <div v-if="step === 1" class="card">
      <h2 class="text-subsection mb-4">Method Information</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label class="input-label">Method name *</label>
          <input v-model="methodName" type="text" placeholder="did:your-method"
            class="input-compact" />
        </div>
        <div>
          <label class="input-label">Registry type</label>
          <select v-model="registryType" class="input-compact--text">
            <option value="blockchain">Blockchain</option>
            <option value="web">Web</option>
            <option value="peer">Peer</option>
            <option value="ledger">Ledger</option>
            <option value="generative">Generative</option>
            <option value="hybrid">Hybrid</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label class="input-label">Registry Type Details</label>
          <input v-model="blockchain" type="text"
            :placeholder="registryType === 'blockchain' ? 'e.g. Ethereum, Solana...'
              : registryType === 'web' ? 'e.g. domain-based, DNS...'
              : registryType === 'peer' ? 'e.g. peer-to-peer protocol...'
              : registryType === 'ledger' ? 'e.g. Indy, Hyperledger...'
              : registryType === 'generative' ? 'e.g. derived from key material...'
              : registryType === 'hybrid' ? 'e.g. web + crypto log...'
              : 'Describe your registry type...'"
            class="input-compact--text" />
        </div>
        <div>
          <label class="input-label">Specification URL</label>
          <input v-model="specUrl" type="url" placeholder="https://..."
            class="input-compact--text" />
        </div>
        <div>
          <label class="input-label">Repository URL</label>
          <input v-model="repoUrl" type="url" placeholder="https://github.com/..."
            class="input-compact--text" />
        </div>
        <div>
          <label class="input-label">Your name</label>
          <input v-model="contactName" type="text" placeholder="For attribution"
            class="input-compact--text" />
        </div>
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- STEP 2: USE CASE (v1 compact layout) -->
    <!-- ================================================================ -->
    <div v-else-if="step === 2" class="card px-5 py-4">
      <div class="flex items-baseline justify-between mb-3">
        <div class="flex items-baseline gap-2">
          <h2 class="text-subsection">Select a use case</h2>
          <span class="text-help">— this determines which requirements apply</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-help mr-1">Filter by audience:</span>
          <button
            v-for="aud in AUDIENCES"
            :key="aud.key"
            class="audience-pill"
            :class="audienceFilter === aud.key
              ? 'audience-pill--active'
              : 'audience-pill--inactive'"
            @click="audienceFilter = audienceFilter === aud.key ? null : aud.key"
          >{{ aud.key }}</button>
        </div>
      </div>

      <div class="grid grid-cols-[240px_1fr] gap-4">
        <!-- Left: categorized list -->
        <div class="space-y-2 overflow-y-auto max-h-[460px] pr-1 border-r border-gray-700/50">
          <div v-for="cat in categories" :key="cat.id">
            <h3 class="uc-category-heading">{{ cat.name }}</h3>
            <button
              v-for="uc in useCasesForCategory(cat.id)"
              :key="uc.id"
              class="uc-item"
              :class="selectedUseCaseId === uc.id
                ? 'uc-item--active'
                : 'uc-item--inactive'"
              @click="selectedUseCaseId = uc.id"
            >
              <span class="truncate">{{ uc.name }}</span>
              <span class="text-[10px] text-muted tabular-nums ml-2 shrink-0">{{ uc.requiredRequirements.length }}</span>
            </button>
          </div>

        </div>

        <!-- Right: detail -->
        <div v-if="selectedUseCase" class="space-y-3">
          <div>
            <h3 class="text-lg font-bold text-primary">{{ selectedUseCase.name }}</h3>
            <p class="text-description mt-1">{{ selectedUseCase.description }}</p>
          </div>

          <!-- Actors + W3C link -->
          <div class="flex flex-wrap items-center gap-1.5">
            <span
              v-for="actor in selectedUseCase.actors"
              :key="actor"
              class="actor-badge"
              :class="AUDIENCES.some(a => a.match.includes(actor))
                ? 'actor-badge--matched'
                : 'actor-badge--default'"
            >{{ actor }}</span>
            <a
              v-if="selectedUseCase.detailUrl"
              :href="selectedUseCase.detailUrl"
              target="_blank"
              class="link ml-auto"
            >W3C Reference &#8599;</a>
          </div>

          <!-- Covering methods -->
          <div v-if="coveringMethods.length">
            <h4 class="text-label font-semibold mb-1">
              Methods Addressing This Use Case
            </h4>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="cm in coveringMethods"
                :key="cm.method"
                class="method-pill"
                @click="previewMethod = cm"
              >{{ cm.method }}</button>
            </div>
          </div>

          <!-- Required capabilities (compact) -->
          <div>
            <h4 class="text-label font-semibold mb-1.5">
              Required Capabilities ({{ useCaseRequirements.length }})
            </h4>
            <div class="rounded border border-gray-700 divide-y divide-gray-700/50">
              <div
                v-for="req in useCaseRequirements"
                :key="req.id"
                class="flex items-center gap-2 px-3 py-1.5"
              >
                <span class="text-requirement-id w-6">{{ req.id }}</span>
                <span class="text-description flex-1">{{ req.name }}</span>
                <span
                  class="tier-badge"
                  :class="{
                    'tier-badge--core': req.tier === 'core',
                    'tier-badge--common': req.tier === 'common',
                    'tier-badge--special': req.tier === 'specialized',
                  }"
                >{{ req.tier }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex items-center justify-center text-muted text-sm">
          Select a use case from the list to see its requirements
        </div>
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- STEP 3: FEATURES -->
    <!-- ================================================================ -->
    <div v-else-if="step === 3" class="card">
      <h2 class="text-subsection mb-4">Feature Support</h2>
      <p class="text-help mb-4">
        Mark which capabilities your method supports. Leave unset if unknown.
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        <div
          v-for="feat in FEATURE_DEFINITIONS"
          :key="feat.key"
          class="feat-card"
          :class="features[feat.key] === true ? 'feat-card--yes'
            : features[feat.key] === false ? 'feat-card--no'
            : 'feat-card--unset'"
        >
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-xs font-medium text-secondary">{{ feat.label }}</span>
            <div class="flex gap-0.5">
              <button
                class="feat-toggle"
                :class="features[feat.key] === true ? 'feat-toggle--yes' : ''"
                @click="features[feat.key] = features[feat.key] === true ? null : true"
              >&#10003;</button>
              <button
                class="feat-toggle"
                :class="features[feat.key] === false ? 'feat-toggle--no' : ''"
                @click="features[feat.key] = features[feat.key] === false ? null : false"
              >&#10007;</button>
            </div>
          </div>
          <p class="text-[10px] text-muted leading-tight">{{ feat.description }}</p>
        </div>
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- STEP 4: REQUIREMENTS -->
    <!-- ================================================================ -->
    <div v-else-if="step === 4" class="space-y-3">
      <!-- Progress -->
      <div class="card-stat px-4 py-3 flex items-center gap-4 text-left">
        <span class="text-xs text-description font-medium shrink-0">Progress</span>
        <div class="progress-track">
          <div
            :class="assessedCount === REQUIREMENTS.length ? 'progress-fill progress-fill--complete' : 'progress-fill progress-fill--active'"
            :style="{ width: Math.round((assessedCount / REQUIREMENTS.length) * 100) + '%' }"
          ></div>
        </div>
        <span class="text-xs text-muted shrink-0 tabular-nums">
          {{ assessedCount }}/{{ REQUIREMENTS.length }}
          &middot; <span class="text-status-met">{{ metCount }} met</span>
        </span>
      </div>

      <!-- Requirements -->
      <div
        v-for="req in REQUIREMENTS"
        :key="req.id"
        class="req-card"
        :class="assessments[req.id].status === 'met' ? 'req-card--met'
          : assessments[req.id].status === 'partial' ? 'req-card--partial'
          : assessments[req.id].status === 'not-met' ? 'req-card--not-met'
          : 'req-card--default'"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <span class="text-requirement-id shrink-0">{{ req.id }}</span>
            <span class="text-sm text-primary font-medium truncate">{{ req.name }}</span>
            <span
              class="tier-badge shrink-0"
              :class="{
                'tier-badge--core': req.tier === 'core',
                'tier-badge--common': req.tier === 'common',
                'tier-badge--special': req.tier === 'specialized',
              }"
            >{{ req.tier }}</span>
            <span
              v-if="selectedUseCase?.requiredRequirements.includes(req.id)"
              class="required-tag"
            >required</span>
          </div>
          <div class="flex gap-1 shrink-0">
            <button
              v-for="opt in STATUS_OPTIONS"
              :key="opt.value"
              class="status-toggle"
              :class="assessments[req.id].status === opt.value
                ? opt.color + ' status-toggle--active'
                : ''"
              @click="assessments[req.id].status = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>
        <p class="card-stat-label">{{ req.description }}</p>
        <template v-if="assessments[req.id].status !== 'not-assessed'">
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model="assessments[req.id].approach"
              type="text"
              placeholder="How does your method address this?"
              class="input-evidence"
            />
            <input
              v-model="assessments[req.id].evidence"
              type="url"
              placeholder="Evidence URL (spec section, code...)"
              class="input-evidence"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- STEP 5: REVIEW -->
    <!-- ================================================================ -->
    <div v-else-if="step === 5" class="card space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-subsection">Review</h2>
          <p class="text-help mt-1">
            Verify your assessment before signing.
          </p>
        </div>
        <button
          class="btn-outline"
          @click="showExport = !showExport"
        >{{ showExport ? 'Hide' : 'Preview' }} JSON</button>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="review-stat">
          <div class="text-lg font-bold text-primary font-mono">{{ methodName || '—' }}</div>
          <div class="card-stat-label">Method</div>
        </div>
        <div class="review-stat">
          <div class="text-lg font-bold text-status-met">{{ metCount }}</div>
          <div class="card-stat-label">Reqs Met</div>
        </div>
        <div class="review-stat">
          <div class="text-lg font-bold text-status-info">{{ assessedCount }}/{{ REQUIREMENTS.length }}</div>
          <div class="card-stat-label">Assessed</div>
        </div>
        <div class="review-stat">
          <div class="text-sm font-bold text-status-experimental">{{ selectedUseCase?.name ?? '—' }}</div>
          <div class="card-stat-label">Use Case</div>
        </div>
      </div>

      <!-- Requirement summary -->
      <div class="grid grid-cols-2 gap-2">
        <div v-for="req in REQUIREMENTS.filter(r => assessments[r.id].status !== 'not-assessed')" :key="req.id" class="flex items-center gap-2 text-xs">
          <span class="text-requirement-id">{{ req.id }}</span>
          <span class="text-description flex-1 truncate">{{ req.name }}</span>
          <span :class="{
            'text-status-met': assessments[req.id].status === 'met',
            'text-status-partial': assessments[req.id].status === 'partial',
            'text-status-not-met': assessments[req.id].status === 'not-met',
            'text-dim': assessments[req.id].status === 'not-applicable',
          }">{{ assessments[req.id].status }}</span>
        </div>
      </div>

      <!-- Feature summary -->
      <div>
        <h4 class="text-label font-semibold mb-1.5">Features</h4>
        <div class="flex flex-wrap gap-1">
          <span v-for="f in FEATURE_DEFINITIONS" :key="f.key" class="text-[10px] px-1.5 py-0.5 rounded-full border"
            :class="features[f.key] === true ? 'text-status-met border-green-500/30'
              : features[f.key] === false ? 'text-status-not-met border-red-500/30'
              : 'text-dim border-gray-700'"
          >{{ previewFeatureLabel(f.key) }}</span>
        </div>
      </div>

      <pre
        v-if="showExport"
        class="code-block overflow-x-auto max-h-80"
      >{{ exportJson }}</pre>
    </div>

    <!-- ================================================================ -->
    <!-- STEP 6: IDENTITY + SIGN & EXPORT -->
    <!-- ================================================================ -->
    <div v-else-if="step === 6" class="space-y-4">
      <!-- Identity connection -->
      <div class="card space-y-5">
        <div>
          <h2 class="text-subsection mb-1">Authenticate &amp; Sign <span class="text-xs text-muted font-normal">(optional)</span></h2>
          <p class="text-help">
            Optionally sign this assessment with your DID to create a verifiable chain of contributions.
            Unsigned assessments can still be submitted via pull request.
            Signing uses the <a href="https://www.npmjs.com/package/@attestto/id-wallet-adapter" target="_blank" class="link">wallet adapter protocol</a> for identity wallet discovery.
          </p>
        </div>

        <!-- Connection options (config-driven) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            v-for="opt in enabledProviders"
            :key="opt.key"
            class="identity-card"
            :class="[
              selectedFlow === opt.key ? 'identity-card--active' : 'identity-card--inactive',
            ]"
            @click="selectFlow(opt.key as ConnectFlow)"
          >
            <span class="text-xl">{{ opt.icon }}</span>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-secondary">{{ opt.label }}</span>
              </div>
              <div class="text-[10px] text-muted leading-tight mt-0.5">{{ opt.description }}</div>
            </div>
          </button>
        </div>

        <!-- Paste DID input -->
        <div v-if="selectedFlow === 'paste'" class="space-y-2">
          <label class="input-label">Your DID</label>
          <input
            v-model="contributorDid"
            type="text"
            placeholder="did:key:z6Mk... or did:web:example.com"
            class="input-compact--text"
            @input="signingMethod = contributorDid.startsWith('did:') ? (ACCEPTED_DID_METHODS.includes(contributorDid.split(':').slice(0,2).join(':')) ? contributorDid.split(':').slice(0,2).join(':') as SigningMethod : 'custom') : null"
          />
          <p class="text-[10px] text-muted">
            Assessment will be unsigned — paste is for attribution only.
          </p>
        </div>

        <!-- Generating key -->
        <div v-if="selectedFlow === 'generate' && generatedKey && !identityConnected" class="callout-info">
          <p class="callout__title">Generating keypair...</p>
        </div>

        <!-- Connected: extension wallet -->
        <div v-if="identityConnected && contributorDid && selectedFlow === 'extension' && selectedWallet" class="space-y-2">
          <div class="identity-card identity-card--active">
            <img v-if="selectedWallet.icon" :src="selectedWallet.icon" :alt="selectedWallet.name" class="w-10 h-10 rounded" />
            <span v-else class="text-2xl">&#128274;</span>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs text-muted">Wallet</span>
                <span class="text-sm font-semibold text-primary">{{ selectedWallet.name }}</span>
              </div>
              <div class="text-[10px] text-muted leading-tight mt-0.5">
                by {{ selectedWallet.maintainer.name }}
                <span v-if="selectedWallet.protocols.length"> · {{ selectedWallet.protocols.join(', ') }}</span>
              </div>
              <div class="mt-2 pt-2 border-t border-gray-700/50">
                <div class="text-xs text-muted">Signer (user-consented)</div>
                <div class="did-display">{{ contributorDid }}</div>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="text-status-met text-xs font-semibold">&#10003; Connected</span>
              <button class="identity-action" @click="identityConnected = false; contributorDid = ''; selectedWallet = null; chapiError = null">Disconnect</button>
            </div>
          </div>
        </div>

        <!-- CHAPI error -->
        <div v-if="chapiError && selectedFlow === 'extension'" class="callout-warning">
          <p class="callout__title">Identity request failed</p>
          <p class="callout__body">{{ chapiError }}</p>
        </div>

        <!-- Connected: generated key -->
        <div v-else-if="identityConnected && contributorDid && selectedFlow === 'generate' && generatedKey" class="identity-card identity-card--active">
          <span class="text-2xl">&#128273;</span>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-primary">Browser Keypair</span>
              <span class="tier-badge tier-badge--core text-[9px]">Ed25519</span>
            </div>
            <div class="text-[10px] text-muted leading-tight mt-0.5">
              Fresh keypair generated in your browser — stored in sessionStorage only
            </div>
            <div class="did-display">{{ contributorDid }}</div>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="text-status-met text-xs font-semibold">&#10003; Ready to Sign</span>
            <button class="identity-action" @click="identityConnected = false; contributorDid = ''; generatedKey = null">Clear Key</button>
          </div>
        </div>

        <!-- Connected: Web3 wallet -->
        <div v-else-if="identityConnected && contributorDid && selectedFlow === 'wallet'" class="space-y-2">
          <div class="identity-card identity-card--active">
            <span class="text-2xl">{{ walletChain === 'solana' ? '&#9678;' : '&#926;' }}</span>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-primary">
                  {{ resolvedDomain || (walletChain === 'solana' ? 'Solana' : 'Ethereum') + ' Wallet' }}
                </span>
                <span class="tier-badge tier-badge--common text-[9px]">{{ signingMethod }}</span>
                <span v-if="resolvingIdentity" class="text-[9px] text-muted">resolving domain...</span>
              </div>
              <div class="text-[10px] text-muted leading-tight mt-0.5">
                <template v-if="resolvedDomain">SNS domain resolved via Bonfida</template>
                <template v-else>Address verified via wallet signature</template>
              </div>
              <div class="did-display">{{ contributorDid }}</div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="text-status-met text-xs font-semibold">&#10003; Connected</span>
              <button class="identity-action" @click="identityConnected = false; contributorDid = ''; walletChain = null; resolvedDomain = null; allResolvedDomains = []">Disconnect</button>
            </div>
          </div>

          <!-- Privacy warning -->
          <div class="callout-warning">
            <p class="callout__title">Privacy Notice</p>
            <p class="callout__body">
              This method links your wallet address and on-chain domains to this assessment.
              Anyone can trace this DID back to your wallet activity and holdings.
              For pseudonymous contributions, use <strong>Generate Key</strong> or <strong>Identity Wallet</strong> instead.
            </p>
          </div>

          <!-- All SNS domains -->
          <div v-if="allResolvedDomains.length > 1" class="domain-list">
            <div class="text-[10px] text-muted mb-1.5">{{ allResolvedDomains.length }} SNS domains owned</div>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="d in allResolvedDomains"
                :key="d.did"
                class="domain-pill"
                :class="contributorDid === d.did ? 'domain-pill--active' : ''"
                @click="contributorDid = d.did; resolvedDomain = d.label"
              >
                <span>{{ d.label }}</span>
                <span v-if="d.isFavourite" class="text-[8px]" title="Favourite domain">&#9733;</span>
                <span v-if="d.hasDidDocument" class="domain-pill__verified" title="DID Document attached">&#10003;</span>
              </button>
            </div>
            <div v-if="allResolvedDomains.some(d => d.hasDidDocument)" class="text-[9px] text-muted mt-1.5">
              &#10003; = DID Document attached
            </div>
          </div>
        </div>

        <!-- Connected: paste -->
        <div v-else-if="identityConnected && contributorDid && selectedFlow === 'paste'" class="callout-success">
          <p class="callout__title">DID Set</p>
          <p class="callout__body font-mono break-all text-[11px] opacity-80">{{ contributorDid }}</p>
        </div>

        <!-- Connecting (non-extension flows) -->
        <div v-else-if="identityConnecting && selectedFlow !== 'extension'" class="callout-info">
          <p class="callout__body">Connecting...</p>
        </div>

        <!-- Wallet chain picker -->
        <div v-else-if="selectedFlow === 'wallet' && !identityConnecting && !identityConnected && availableChains.length > 1" class="space-y-2">
          <p class="text-help text-xs">Multiple wallets detected — select a chain:</p>
          <div class="flex gap-2">
            <button
              v-for="c in availableChains"
              :key="c.key"
              class="identity-card flex-1 identity-card--inactive"
              @click="connectWallet(c.key)"
            >
              <span class="text-xl">{{ c.icon }}</span>
              <span class="text-xs font-semibold text-secondary">{{ c.label }}</span>
            </button>
          </div>
        </div>

        <!-- No wallet found -->
        <div v-else-if="selectedFlow === 'wallet' && !identityConnecting && !identityConnected" class="callout-warning">
          <p class="callout__title">No wallet detected</p>
          <p class="callout__body">Install a Web3 wallet extension (MetaMask, Phantom, etc.) and reload this page.</p>
          <button class="btn-outline mt-2" @click="connectWallet()">Retry</button>
        </div>

        <!-- Extension: waiting for wallet consent -->
        <div v-if="selectedFlow === 'extension' && identityConnecting && selectedWallet && !identityConnected" class="callout-info">
          <p class="callout__title">Waiting for {{ selectedWallet.name }}...</p>
          <p class="callout__body">Approve the identity request in your wallet extension.</p>
        </div>

        <!-- Extension: wallets discovered -->
        <div v-else-if="selectedFlow === 'extension' && walletDiscoveryDone && detectedWallets.length > 0 && !identityConnected && !identityConnecting" class="space-y-3">
          <p class="text-help text-xs">
            {{ detectedWallets.length }} credential wallet{{ detectedWallets.length > 1 ? 's' : '' }} detected. Select one to request your identity:
          </p>
          <div class="space-y-2">
            <button
              v-for="w in detectedWallets"
              :key="w.did"
              class="identity-card w-full"
              :class="selectedWallet?.did === w.did ? 'identity-card--active' : 'identity-card--inactive'"
              @click="requestIdentityFromWallet(w)"
            >
              <img v-if="w.icon" :src="w.icon" :alt="w.name" class="w-8 h-8 rounded" />
              <span v-else class="text-xl">&#128274;</span>
              <div class="flex-1 text-left">
                <div class="text-xs font-semibold text-secondary">{{ w.name }}</div>
                <div class="text-[10px] text-muted font-mono leading-tight mt-0.5">{{ w.did }}</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Extension: no wallets -->
        <div v-else-if="selectedFlow === 'extension' && walletDiscoveryDone && detectedWallets.length === 0" class="space-y-3">
          <div class="callout-warning">
            <p class="callout__title">No identity wallet detected</p>
            <p class="callout__body">No credential wallet extensions responded. Install one to present your DID.</p>
          </div>
          <div class="text-[10px] text-muted mt-1">
            You can use any credential wallet extension that supports the
            <a href="https://chapi.io/" target="_blank" class="link">CHAPI</a> or
            <a href="https://github.com/nickreserved/universal-wallet-interop-spec" target="_blank" class="link">Universal Wallet</a> protocols.
            Alternatively, use the "Generate did:key" or "Paste DID" options above.
          </div>
          <button class="btn-outline w-full" @click="discoverCredentialWallets">Retry Discovery</button>
        </div>

        <!-- Display name + methodology -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="input-label">Display name <span class="text-muted">(optional)</span></label>
            <input v-model="contributorName" type="text" placeholder="How you'd like to be credited" class="input-compact--text" />
          </div>
          <div>
            <label class="input-label">Revision notes <span class="text-muted">(optional)</span></label>
            <input v-model="revisionNotes" type="text" placeholder="e.g. Reviewed spec v2.1, sections 3-7" class="input-compact--text" />
          </div>
        </div>

        <div>
          <h3 class="text-label font-semibold mb-2">Methodology</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              v-for="m in METHODOLOGIES"
              :key="m.key"
              class="identity-card"
              :class="methodology === m.key ? 'identity-card--active' : 'identity-card--inactive'"
              @click="methodology = m.key"
            >
              <div>
                <div class="text-xs font-semibold text-secondary">{{ m.label }}</div>
                <div class="text-[10px] text-muted leading-tight">{{ m.description }}</div>
              </div>
            </button>
          </div>
        </div>

        <div v-if="methodology === 'llm-assisted' || methodology === 'automated' || methodology === 'hybrid'">
          <label class="input-label">LLM model used</label>
          <input v-model="llmModel" type="text" placeholder="e.g. Claude Opus 4, GPT-4o, Gemini..." class="input-compact--text" />
        </div>
      </div>

      <!-- Sign & export card -->
      <div v-if="identityConnected && contributorDid" class="card space-y-4">
        <div class="card-stat px-5 py-4 text-left space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-description font-medium">Signer</div>
              <div class="text-sm font-mono text-primary break-all">{{ contributorDid }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-description font-medium">Method</div>
              <div class="text-sm text-primary">{{ signingMethod }}</div>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2 border-t border-gray-700/50">
            <div class="flex-1">
              <div class="text-xs text-description font-medium mb-1">Proof</div>
              <div v-if="assessmentJws" class="text-sm text-status-met font-semibold">Signed</div>
              <div v-else class="text-sm text-muted">Unsigned</div>
            </div>
            <button
              v-if="generatedKey && !assessmentJws"
              class="btn-accent"
              :disabled="signing"
              @click="signCurrentAssessment"
            >{{ signing ? 'Signing...' : 'Sign Assessment' }}</button>
            <span v-else-if="!generatedKey && signingMethod !== 'did:key'" class="text-[10px] text-muted">
              Signing is only available for browser-generated keys
            </span>
          </div>

          <div v-if="assessmentJws" class="space-y-1">
            <div class="text-[10px] text-muted">JWS Compact Serialization</div>
            <div class="code-block text-[10px] break-all max-h-20 overflow-y-auto">{{ assessmentJws }}</div>
          </div>
        </div>

        <div class="flex gap-2">
          <button class="btn-success flex-1" @click="saveToLocal">{{ saved ? 'Saved!' : 'Save Draft' }}</button>
          <button class="btn-primary flex-1" @click="downloadJson">Download JSON</button>
        </div>

        <div class="callout-info">
          <p class="callout__title">How to submit</p>
          <p class="callout__body">
            Download the JSON file, then open a PR to
            <a :href="repoUrl || '#'" target="_blank" class="text-status-info hover:underline">w3c/did-extensions</a>
            adding it to <code class="code-inline">public/data/assessments/</code>.
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom navigation bar -->
    <div class="flex items-center justify-between pt-1">
      <div class="flex items-center gap-3">
        <button
          v-if="step > 1"
          class="btn-outline"
          @click="step--"
        >&larr; Back</button>

        <template v-if="step === 2">
          <span class="text-help">Don't see your use case?</span>
          <a
            href="https://github.com/w3c/did-use-cases/issues"
            target="_blank"
            class="btn-accent"
          >Propose at W3C &#8599;</a>
        </template>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="step === 1 && !methodName"
          class="btn-dashed"
          @click="fillDummy"
        >
          Use Demo Data
        </button>
        <button
        v-if="step < 6"
        :class="canAdvance()
          ? 'btn-primary'
          : 'btn-primary opacity-50 cursor-not-allowed'"
        :disabled="!canAdvance()"
        @click="canAdvance() && step++"
      >
        Next: {{ STEPS[step]?.label }} &rarr;
      </button>
      </div>
    </div>
  </div>

  <!-- Method quick-info modal -->
  <Teleport to="body">
    <div
      v-if="previewMethod"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      @click.self="previewMethod = null"
    >
      <div class="preview-modal">
        <!-- Header -->
        <div class="preview-modal__header">
          <div>
            <h3 class="text-lg font-bold font-mono text-primary">{{ previewMethod.method }}</h3>
            <span class="tier-badge tier-badge--special">
              {{ REGISTRY_TYPES[previewMethod.registryType]?.label ?? previewMethod.registryType }}
            </span>
          </div>
          <button
            class="modal-header__close"
            @click="previewMethod = null"
          >&times;</button>
        </div>

        <!-- Body -->
        <div class="px-5 py-4 space-y-4">
          <!-- Purpose -->
          <p class="text-help border-l-2 border-blue-400/40 pl-3">
            Quick reference to evaluate whether this method's capabilities, industry focus, and requirement coverage align with your own specification needs.
          </p>

          <!-- Abstract -->
          <p v-if="previewMethod.abstract" class="text-description">
            {{ previewMethod.abstract }}
          </p>

          <!-- Key stats grid -->
          <div class="grid grid-cols-4 gap-2">
            <div class="mini-stat">
              <div class="text-sm font-bold text-status-info">{{ previewMethod.reqMet.length }}<span class="text-dim">/22</span></div>
              <div class="card-stat-label">Reqs Claimed</div>
            </div>
            <div class="mini-stat">
              <div class="text-sm font-bold text-secondary">{{ previewMethod.maturity.lifecycle }}</div>
              <div class="card-stat-label">Lifecycle</div>
            </div>
            <div class="mini-stat">
              <div class="text-sm font-bold text-secondary">{{ previewMethod.stars ?? '—' }}</div>
              <div class="card-stat-label">Stars</div>
            </div>
            <div class="mini-stat">
              <div class="text-sm font-bold text-secondary">{{ previewMethod.maturity.implementations ?? '—' }}</div>
              <div class="card-stat-label">Implementations</div>
            </div>
          </div>

          <!-- Industries -->
          <div>
            <h4 class="text-label font-semibold mb-1.5">Industries</h4>
            <div v-if="previewMethod.industries.length" class="flex flex-wrap gap-1">
              <span
                v-for="ind in previewMethod.industries"
                :key="ind"
                class="badge-industry"
                :class="previewIndustryColor(ind)"
              >{{ previewIndustryLabel(ind) }}</span>
            </div>
            <p v-else class="empty-state">Not yet provided by the method's assessment</p>
          </div>

          <!-- Use Case Fit -->
          <div>
            <h4 class="text-label font-semibold mb-1.5">Use Case Fit</h4>
            <template v-if="previewMethod.assessed">
              <div class="grid grid-cols-3 gap-1.5">
                <div v-for="(score, key) in previewMethod.ucScores" :key="key" class="score-cell">
                  <span class="text-xs text-description capitalize">{{ key }}</span>
                  <span v-if="score != null" class="text-xs font-mono" :class="score >= 70 ? 'text-status-met' : score >= 40 ? 'text-status-partial' : 'text-dim'">{{ score }}%</span>
                  <span v-else class="text-xs text-ghost">—</span>
                </div>
              </div>
            </template>
            <p v-else class="empty-state">Not yet provided by the method's assessment</p>
          </div>

          <!-- Features & Crypto — compact pill layout -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h4 class="text-label font-semibold mb-1.5">Features</h4>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(val, key) in previewMethod.feat"
                  :key="key"
                  class="bool-pill"
                  :class="val === true
                    ? 'bool-pill--yes'
                    : val === false
                      ? 'bool-pill--no'
                      : 'bool-pill--unknown'"
                >{{ previewFeatureLabel(String(key)) }}</span>
              </div>
            </div>
            <div>
              <h4 class="text-label font-semibold mb-1.5">Crypto</h4>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(val, key) in previewMethod.crypto"
                  :key="key"
                  class="bool-pill"
                  :class="val === true
                    ? 'bool-pill--yes'
                    : val === false
                      ? 'bool-pill--no'
                      : 'bool-pill--unknown'"
                >{{ previewCryptoLabel(String(key)) }}</span>
              </div>
            </div>
          </div>

          <!-- Requirement overlap with current use case -->
          <div v-if="selectedUseCase && previewMethod.reqMet.length > 0">
            <h4 class="text-label font-semibold mb-1.5">
              Compatibility with "{{ selectedUseCase.name }}"
            </h4>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="reqId in selectedUseCase.requiredRequirements"
                :key="reqId"
                class="bool-pill font-mono"
                :class="previewMethod.reqMet.includes(reqId)
                  ? 'bool-pill--yes'
                  : 'bool-pill--unknown'"
              >{{ reqId }}</span>
            </div>
            <p class="text-[10px] text-muted mt-1">
              {{ selectedUseCase.requiredRequirements.filter(r => previewMethod!.reqMet.includes(r)).length }}
              of {{ selectedUseCase.requiredRequirements.length }} requirements covered
            </p>
          </div>

          <!-- Interoperability -->
          <div>
            <h4 class="text-label font-semibold mb-1.5">Interoperability</h4>
            <div v-if="previewMethod.compat.methods.length > 0" class="flex flex-wrap gap-1 items-center">
              <span
                v-for="m in previewMethod.compat.methods"
                :key="m"
                class="compat-badge"
              >{{ m }}</span>
              <span v-if="previewMethod.compat.via" class="text-[10px] text-muted ml-1">via {{ previewMethod.compat.via }}</span>
            </div>
            <p v-else class="empty-state">Not yet provided by the method's assessment</p>
          </div>

          <!-- Links -->
          <div class="flex gap-3 pt-1 border-t border-gray-700">
            <a
              v-if="previewMethod.specUrl"
              :href="previewMethod.specUrl"
              target="_blank"
              class="link"
            >Spec &#8599;</a>
            <a
              v-if="previewMethod.repoUrl"
              :href="previewMethod.repoUrl"
              target="_blank"
              class="link"
            >Repository &#8599;</a>
            <a
              v-if="repoZipUrl(previewMethod.repoUrl)"
              :href="repoZipUrl(previewMethod.repoUrl)!"
              class="link text-status-met"
              download
            >&#8681; Download ZIP</a>
            <span v-if="previewMethod.lastCommit" class="text-help ml-auto">
              Last activity: {{ previewMethod.lastCommit.slice(0, 10) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
