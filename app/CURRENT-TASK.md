# DID Landscape Explorer — Task Tracker

## Active Branch: `onboarding-guide` (ahead of upstream/main by 10 commits)

## Completed

| Task | Date | Notes |
|---|---|---|
| Semantic CSS Framework | 2026-03-14 | 29 sections, 900+ lines in `style.css`. All 13 components migrated. Zero raw Tailwind colors in components. |
| Style Guide | 2026-03-14 | `StyleGuide.vue` — live reference consuming all semantic classes |
| Codex (.codex.md) | 2026-03-14 | Full architecture doc, styling rules, text hierarchy, component classes, routes |
| CLAUDE.md | 2026-03-14 | Analysis prompts, data access, output files, key principles |
| SelfAssessment TS fix | 2026-03-14 | Fixed `loadFromLocal()` — was referencing 3 non-existent refs, now writes to `assessments` |
| SelfAssessment semantic migration | 2026-03-15 | Full wizard migration: 30+ semantic classes applied. Only INDUSTRY_LABELS dynamic colors remain (dedup task). |
| ESLint setup | 2026-03-15 | ESLint 9 flat config + typescript-eslint + eslint-plugin-vue. 0 errors, 0 warnings. |
| Repo download buttons | 2026-03-15 | ZIP download in MethodDetail, MethodTable, SelfAssessment preview. Merged callout with volunteer CTA. |
| DID-signed revisions Phase 1 | 2026-03-15 | Identity step in wizard (Step 1). Signing method selector, contributor DID, methodology, LLM model. Revision metadata in export JSON. Types added. |

## In Progress

| Task | Status | Notes |
|---|---|---|
| DID-signed revisions | Phase 1 DONE | Phase 2: did:key generation. Phase 3: VC/VP envelope. Phase 4: did:web via GH Pages. |

## Backlog

| # | Task | Priority | Notes |
|---|---|---|---|
| 1-3 | ~~TS fix, semantic migration, ESLint~~ | **DONE** | |
| 4 | INDUSTRY_LABELS dedup | LOW | Same map in 3 files — extract to config |
| 5 | Method data enrichment | ONGOING | More assessments in `methods-index.json` |
| 6 | GitHub Pages deployment | TODO | Static hosting for the explorer |
| 7 | Dark/light theme toggle | BACKLOG | Currently dark-only; tokens are ready |
| 8 | DID revision Phase 2 | HIGH | `did:key` generation in-browser |
| 9 | DID revision Phase 3 | HIGH | VC/VP signed envelope around export |
| 10 | DID revision Phase 4 | MEDIUM | `did:web` registration via PR + CI |
| 11 | DID revision Phase 5 | MEDIUM | Contributor profile pages on GH Pages |
| 12 | DID revision Phase 6 | MEDIUM | Vault Extension signing integration |
| 13 | DID revision Phase 7 | MEDIUM | Weighted consensus + revisions timeline UI |
| 14 | Live playground | LOW | Each signing method is a live demo of DID architecture |

## Build

```bash
pnpm install && pnpm dev     # Dev server
npx vite build                # Production build
pnpm lint                     # ESLint 9 — 0 errors, 0 warnings
```
