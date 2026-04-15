import type { MethodEntry, AssessmentStatus } from '@/types/method'
import { REQUIREMENTS } from '@/config/requirements'

/**
 * Assessment logic — isolated and testable.
 *
 * This composable contains ALL scoring and comparison logic.
 * No scoring happens in components — it all flows through here.
 */

/** Get the assessment status for a specific requirement on a method */
export function getRequirementStatus(method: MethodEntry, reqId: string): AssessmentStatus {
  if (!method.assessed) return 'not-assessed'

  // Check new-style requirements object first
  const assessment = method.requirements[reqId]
  if (assessment) return assessment.status

  // Fall back to legacy reqMet array
  if (method.reqMet.includes(reqId)) return 'met'

  return 'not-assessed'
}

/** Compute overlap between two methods (requirements both meet) */
export function computeOverlap(a: MethodEntry, b: MethodEntry): {
  shared: string[]
  onlyA: string[]
  onlyB: string[]
  pct: number
} {
  const aSet = new Set(
    REQUIREMENTS
      .map(r => r.id)
      .filter(id => getRequirementStatus(a, id) === 'met')
  )
  const bSet = new Set(
    REQUIREMENTS
      .map(r => r.id)
      .filter(id => getRequirementStatus(b, id) === 'met')
  )

  const shared = [...aSet].filter(id => bSet.has(id))
  const onlyA = [...aSet].filter(id => !bSet.has(id))
  const onlyB = [...bSet].filter(id => !aSet.has(id))
  const union = new Set([...aSet, ...bSet])
  const pct = union.size > 0 ? Math.round((shared.length / union.size) * 100) : 0

  return { shared, onlyA, onlyB, pct }
}

/** Compute gap analysis — which requirements are NOT met by a method */
export function computeGaps(method: MethodEntry): {
  reqId: string
  name: string
  status: AssessmentStatus
  tier: string
}[] {
  return REQUIREMENTS
    .map(r => ({
      reqId: r.id,
      name: r.name,
      status: getRequirementStatus(method, r.id),
      tier: r.tier,
    }))
    .filter(r => r.status !== 'met')
}

/** Find methods that complement a given method (cover its gaps) */
export function findComplementary(
  method: MethodEntry,
  allMethods: MethodEntry[],
  limit = 5,
): { method: MethodEntry; coversGaps: string[]; pct: number }[] {
  const gaps = computeGaps(method)
    .filter(g => g.status === 'not-met' || g.status === 'not-assessed')
    .map(g => g.reqId)

  if (gaps.length === 0) return []

  return allMethods
    .filter(m => m.method !== method.method && m.assessed)
    .map(m => {
      const coversGaps = gaps.filter(gapId => getRequirementStatus(m, gapId) === 'met')
      return {
        method: m,
        coversGaps,
        pct: gaps.length > 0 ? Math.round((coversGaps.length / gaps.length) * 100) : 0,
      }
    })
    .filter(r => r.coversGaps.length > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, limit)
}
