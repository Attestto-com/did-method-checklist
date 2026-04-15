import type { AssessmentStatus, Grade, GradeResult, MethodEntry } from '@/types/method'

/**
 * Coverage computation.
 *
 * This tool does NOT grade or rank methods. It computes requirement
 * coverage — what percentage of W3C requirements a method claims to meet
 * based on self-reported data.
 *
 * Low coverage means "not yet assessed" or "the method's spec doesn't
 * address this requirement" — NOT "the method is bad."
 */

// ---------------------------------------------------------------------------
// Coverage thresholds (descriptive labels, NOT judgments)
// ---------------------------------------------------------------------------

const COVERAGE_THRESHOLDS: { min: number; grade: Grade; label: string; color: string }[] = [
  { min: 80, grade: 'N/A', label: 'High coverage', color: 'var(--color-green)' },
  { min: 50, grade: 'N/A', label: 'Moderate coverage', color: 'var(--color-yellow)' },
  { min: 1,  grade: 'N/A', label: 'Partial coverage', color: 'var(--color-text-muted)' },
  { min: 0,  grade: 'N/A', label: 'Not assessed', color: 'var(--color-text-dim)' },
]

const NOT_ASSESSED_RESULT: GradeResult = {
  grade: 'N/A',
  pct: 0,
  label: 'Not assessed',
  color: 'var(--color-text-dim)',
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Compute coverage for a method. Returns "Not assessed" if method hasn't been assessed. */
export function computeGrade(method: MethodEntry, totalRequirements: number): GradeResult {
  if (!method.assessed) {
    return { ...NOT_ASSESSED_RESULT }
  }

  const metCount = countMet(method)
  const pct = totalRequirements > 0 ? Math.round((metCount / totalRequirements) * 100) : 0

  const threshold = COVERAGE_THRESHOLDS.find(t => pct >= t.min) ?? COVERAGE_THRESHOLDS[COVERAGE_THRESHOLDS.length - 1]

  return {
    grade: 'N/A', // Never show letter grades
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
