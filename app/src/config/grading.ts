import type { AssessmentStatus, Grade, GradeResult, MethodEntry } from '@/types/method'

/**
 * Grading configuration.
 *
 * IMPORTANT: Grades reflect documented claims in the registry,
 * NOT the method's actual capabilities. A low grade means
 * "we haven't verified this feature yet," not "the method doesn't have it."
 *
 * Methods with `assessed: false` NEVER receive a letter grade —
 * they show "Not Assessed" (gray, no grade).
 */

// ---------------------------------------------------------------------------
// Grade thresholds
// ---------------------------------------------------------------------------

const GRADE_THRESHOLDS: { min: number; grade: Grade; label: string; color: string }[] = [
  { min: 95, grade: 'A+', label: 'Excellent', color: 'var(--color-green)' },
  { min: 85, grade: 'A', label: 'Strong', color: 'var(--color-green)' },
  { min: 70, grade: 'B', label: 'Good', color: 'var(--color-yellow)' },
  { min: 50, grade: 'C', label: 'Adequate', color: 'var(--color-text-muted)' },
  { min: 30, grade: 'D', label: 'Weak', color: 'var(--color-red)' },
  { min: 0, grade: 'F', label: 'Insufficient', color: 'var(--color-red)' },
]

const NOT_ASSESSED_RESULT: GradeResult = {
  grade: 'N/A',
  pct: 0,
  label: 'Not Assessed',
  color: 'var(--color-text-dim)',
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Compute grade for a method. Returns "Not Assessed" if method hasn't been assessed. */
export function computeGrade(method: MethodEntry, totalRequirements: number): GradeResult {
  if (!method.assessed) {
    return { ...NOT_ASSESSED_RESULT }
  }

  const metCount = countMet(method)
  const pct = totalRequirements > 0 ? Math.round((metCount / totalRequirements) * 100) : 0

  const threshold = GRADE_THRESHOLDS.find(t => pct >= t.min) ?? GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1]

  return {
    grade: threshold.grade,
    pct,
    label: threshold.label,
    color: threshold.color,
  }
}

/** Count requirements with status 'met' */
export function countMet(method: MethodEntry): number {
  return Object.values(method.requirements).filter(r => r.status === 'met').length
}

/** Count requirements with status 'partial' */
export function countPartial(method: MethodEntry): number {
  return Object.values(method.requirements).filter(r => r.status === 'partial').length
}

/** Count requirements with status 'not-applicable' */
export function countNotApplicable(method: MethodEntry): number {
  return Object.values(method.requirements).filter(r => r.status === 'not-applicable').length
}

/** Count requirements that have been assessed (any status except 'not-assessed') */
export function countAssessed(method: MethodEntry): number {
  return Object.values(method.requirements).filter(r => r.status !== 'not-assessed').length
}

/** Get display symbol for a requirement status in the matrix */
export function statusSymbol(status: AssessmentStatus): string {
  switch (status) {
    case 'met': return '\u2713'           // ✓
    case 'partial': return '\u25D1'       // ◑
    case 'not-met': return '\u2717'       // ✗
    case 'not-applicable': return '\u2014' // —
    case 'not-assessed': return '?'
  }
}

/** Get display color for a requirement status */
export function statusColor(status: AssessmentStatus): string {
  switch (status) {
    case 'met': return 'var(--color-green)'
    case 'partial': return 'var(--color-yellow)'
    case 'not-met': return 'var(--color-red)'
    case 'not-applicable': return 'var(--color-text-dim)'
    case 'not-assessed': return 'var(--color-text-dim)'
  }
}
