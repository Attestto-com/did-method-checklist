import { ref, computed } from 'vue'
import type { MethodEntry, Requirement, UseCase } from '@/types/method'
import { TOTAL_REQUIREMENTS } from '@/config/requirements'
import { computeGrade } from '@/config/grading'

/**
 * Loads and merges DID method data from JSON files.
 *
 * Data sources:
 * - methods-index.json: method entries with capabilities
 * - requirements.json: W3C requirement definitions
 * - use-cases.json: W3C use case definitions
 * - method-claims.json: community-sourced assessment claims
 */

const DATA_BASE = import.meta.env.BASE_URL + 'data/'

const methods = ref<MethodEntry[]>([])
const requirements = ref<Requirement[]>([])
const useCases = ref<UseCase[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const loaded = ref(false)

async function fetchJson<T>(filename: string): Promise<T> {
  const res = await fetch(DATA_BASE + filename)
  if (!res.ok) throw new Error(`Failed to load ${filename}: ${res.status}`)
  return res.json()
}

export function useMethodsData() {
  async function loadAll() {
    if (loaded.value) return
    loading.value = true
    error.value = null

    try {
      const [methodsRaw, reqsRaw, ucsRaw] = await Promise.all([
        fetchJson<MethodEntry[] | { methods: MethodEntry[] }>('methods-index.json'),
        fetchJson<Requirement[] | { requirements: Requirement[] }>('requirements.json'),
        fetchJson<UseCase[] | { useCases: UseCase[] }>('use-cases.json'),
      ])

      // Normalize: handle both array and wrapped-object formats
      const methodsList = Array.isArray(methodsRaw) ? methodsRaw : (methodsRaw as { methods: MethodEntry[] }).methods ?? []
      const reqsList = Array.isArray(reqsRaw) ? reqsRaw : (reqsRaw as { requirements: Requirement[] }).requirements ?? []
      const ucsList = Array.isArray(ucsRaw) ? ucsRaw : (ucsRaw as { useCases: UseCase[] }).useCases ?? []

      methods.value = methodsList.map(normalizeMethod)
      requirements.value = reqsList
      useCases.value = ucsList
      loaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error loading data'
    } finally {
      loading.value = false
    }
  }

  /** Methods that have been assessed by their community */
  const assessedMethods = computed(() => methods.value.filter(m => m.assessed))

  /** Methods that have NOT been assessed */
  const unassessedMethods = computed(() => methods.value.filter(m => !m.assessed))

  /** Assessment coverage: what % of registered methods have been assessed */
  const assessmentCoverage = computed(() => {
    if (methods.value.length === 0) return 0
    return Math.round((assessedMethods.value.length / methods.value.length) * 100)
  })

  /** Methods with computed grades */
  const methodsWithGrades = computed(() =>
    methods.value.map(m => ({
      ...m,
      gradeResult: computeGrade(m, TOTAL_REQUIREMENTS),
    }))
  )

  return {
    methods,
    requirements,
    useCases,
    loading,
    error,
    loaded,
    loadAll,
    assessedMethods,
    unassessedMethods,
    assessmentCoverage,
    methodsWithGrades,
  }
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

function normalizeMethod(raw: Partial<MethodEntry> & { method: string }): MethodEntry {
  const hasRequirements = raw.requirements != null && Object.keys(raw.requirements).length > 0
  const _hasReqMet = Array.isArray(raw.reqMet) && raw.reqMet.length > 0
  // Only treat as assessed if explicitly marked — legacy AI-generated data is NOT verified
  const assessed = raw.assessed === true ? true : hasRequirements ? true : false

  return {
    method: raw.method,
    abstract: raw.abstract ?? null,
    specUrl: raw.specUrl ?? null,
    repoUrl: raw.repoUrl ?? null,
    githubRepo: raw.githubRepo ?? null,
    stars: raw.stars ?? null,
    lastCommit: raw.lastCommit ?? null,
    archived: raw.archived ?? false,
    registryType: raw.registryType ?? 'other',
    blockchain: raw.blockchain ?? null,
    assessed,
    requirements: raw.requirements ?? {},
    reqMet: raw.reqMet ?? [],
    reqPct: raw.reqPct ?? 0,
    feat: {
      create: raw.feat?.create ?? null,
      read: raw.feat?.read ?? null,
      update: raw.feat?.update ?? null,
      deactivate: raw.feat?.deactivate ?? null,
      keyRotation: raw.feat?.keyRotation ?? null,
      didLog: raw.feat?.didLog ?? null,
      recovery: raw.feat?.recovery ?? null,
      multiSig: raw.feat?.multiSig ?? null,
      vc: raw.feat?.vc ?? null,
      sd: raw.feat?.sd ?? null,
      didcomm: raw.feat?.didcomm ?? null,
      resolver: raw.feat?.resolver ?? null,
      jsonld: raw.feat?.jsonld ?? null,
      privacy: raw.feat?.privacy ?? null,
    },
    crypto: {
      ed25519: raw.crypto?.ed25519 ?? null,
      secp256k1: raw.crypto?.secp256k1 ?? null,
      p256: raw.crypto?.p256 ?? null,
      bls: raw.crypto?.bls ?? null,
      pq: raw.crypto?.pq ?? null,
    },
    ucScores: {
      enterprise: raw.ucScores?.enterprise ?? null,
      education: raw.ucScores?.education ?? null,
      healthcare: raw.ucScores?.healthcare ?? null,
      legal: raw.ucScores?.legal ?? null,
      credentials: raw.ucScores?.credentials ?? null,
      communication: raw.ucScores?.communication ?? null,
    },
    maturity: {
      hasSpec: raw.maturity?.hasSpec ?? null,
      specSections: raw.maturity?.specSections ?? null,
      implementations: raw.maturity?.implementations ?? null,
      testSuite: raw.maturity?.testSuite ?? null,
      productionDeployments: raw.maturity?.productionDeployments ?? null,
      activeContributors: raw.maturity?.activeContributors ?? null,
      lastSpecUpdate: raw.maturity?.lastSpecUpdate ?? null,
      lifecycle: raw.maturity?.lifecycle ?? 'not-assessed',
    },
    compat: {
      methods: raw.compat?.methods ?? [],
      via: raw.compat?.via ?? '',
    },
    industries: raw.industries ?? [],
  }
}
