export interface PromptEntry {
  id: string
  title: string
  description: string
  color: string
  file: string
  /** If true, this is the context prompt that should be loaded first */
  isContext?: boolean
}

export const PROMPTS: PromptEntry[] = [
  {
    id: 'context-loader',
    title: 'Step 1: Load Context',
    description: 'Load the DID requirements, features, use cases, and scoring definitions into the LLM. Run this first, then pick an analysis prompt below.',
    color: 'text-amber-400 border-amber-400/30',
    file: '/data/prompts/context-loader.md',
    isContext: true,
  },
  {
    id: 'spec-assessment',
    title: 'Spec Self-Assessment',
    description: 'Generate a structured self-assessment JSON from a DID method spec. Output can be imported into the Self-Assessment wizard.',
    color: 'text-blue-400 border-blue-400/30',
    file: '/data/prompts/spec-assessment.md',
  },
  {
    id: 'deep-analysis',
    title: 'Deep Technical Analysis',
    description: 'Comprehensive review covering spec quality, security, privacy, operational readiness, and interoperability gaps.',
    color: 'text-purple-400 border-purple-400/30',
    file: '/data/prompts/deep-analysis.md',
  },
  {
    id: 'comparison',
    title: 'Method Comparison',
    description: 'Side-by-side comparison of two or more DID methods across architecture, crypto, privacy, and use case fit.',
    color: 'text-cyan-400 border-cyan-400/30',
    file: '/data/prompts/comparison.md',
  },
]
