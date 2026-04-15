#!/usr/bin/env node
/**
 * Fetch GitHub health signals for DID methods.
 * Uses `gh api` CLI (authenticated, 5000 req/hr).
 *
 * Pulls per repo:
 *  - Open issues (human-only, excluding bots)
 *  - Open PRs (human-only, excluding bots)
 *  - Branch count
 *  - Last human commit date + author
 *  - Contributors (human-only count)
 *  - Bot vs human activity ratio
 *  - Release count + latest release date
 *
 * Output: data/github-health.json
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const KNOWN_BOTS = new Set([
  'renovate[bot]', 'dependabot[bot]', 'github-actions[bot]',
  'renovate-bot', 'dependabot', 'greenkeeper[bot]',
  'semantic-release-bot', 'allcontributors[bot]',
  'codecov[bot]', 'snyk-bot', 'mergify[bot]',
  'web-flow', // GitHub web UI merge commits
])

function isBot(login) {
  if (!login) return true
  const l = login.toLowerCase()
  return KNOWN_BOTS.has(l) || l.endsWith('[bot]') || l.includes('bot')
}

function gh(endpoint) {
  try {
    const result = execSync(`gh api "${endpoint}" --paginate 2>/dev/null`, {
      encoding: 'utf-8',
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    })
    return JSON.parse(result)
  } catch {
    return null
  }
}

// Lighter call without --paginate for single-page endpoints
function ghSingle(endpoint) {
  try {
    const result = execSync(`gh api "${endpoint}" 2>/dev/null`, {
      encoding: 'utf-8',
      timeout: 15000,
    })
    return JSON.parse(result)
  } catch {
    return null
  }
}

function fetchRepoHealth(repo) {
  console.log(`  Fetching: ${repo}`)

  // 1. Repo metadata (includes open_issues_count but that includes PRs)
  const meta = ghSingle(`repos/${repo}`)
  if (!meta) return null

  // 2. Open issues (not PRs) — first page, 100 items
  const issues = gh(`repos/${repo}/issues?state=open&per_page=100`) || []
  const realIssues = Array.isArray(issues)
    ? issues.filter(i => !i.pull_request && !isBot(i.user?.login))
    : []
  const botIssues = Array.isArray(issues)
    ? issues.filter(i => !i.pull_request && isBot(i.user?.login))
    : []

  // 3. Open PRs — first page
  const prs = gh(`repos/${repo}/pulls?state=open&per_page=100`) || []
  const realPRs = Array.isArray(prs)
    ? prs.filter(p => !isBot(p.user?.login))
    : []
  const botPRs = Array.isArray(prs)
    ? prs.filter(p => isBot(p.user?.login))
    : []

  // 4. Branches
  const branches = gh(`repos/${repo}/branches?per_page=100`) || []
  const branchCount = Array.isArray(branches) ? branches.length : 0

  // 5. Recent commits (last 30) — check human vs bot
  const commits = gh(`repos/${repo}/commits?per_page=30`) || []
  let lastHumanCommit = null
  let lastHumanAuthor = null
  let humanCommits = 0
  let botCommits = 0

  if (Array.isArray(commits)) {
    for (const c of commits) {
      const author = c.author?.login || c.commit?.author?.name || ''
      if (isBot(author)) {
        botCommits++
      } else {
        humanCommits++
        if (!lastHumanCommit) {
          lastHumanCommit = c.commit?.author?.date || null
          lastHumanAuthor = author
        }
      }
    }
  }

  // 6. Contributors (top 30)
  const contribs = gh(`repos/${repo}/contributors?per_page=30`) || []
  const humanContributors = Array.isArray(contribs)
    ? contribs.filter(c => !isBot(c.login)).length
    : 0

  // 7. Releases
  const releases = gh(`repos/${repo}/releases?per_page=5`) || []
  const releaseCount = Array.isArray(releases) ? releases.length : 0
  const latestRelease = Array.isArray(releases) && releases.length
    ? { tag: releases[0].tag_name, date: releases[0].published_at }
    : null

  // Compute liveness verdict
  const totalRecentCommits = humanCommits + botCommits
  const humanRatio = totalRecentCommits > 0 ? humanCommits / totalRecentCommits : 0
  let liveness = 'unknown'
  if (meta.archived) {
    liveness = 'archived'
  } else if (humanCommits === 0 && botCommits > 0) {
    liveness = 'bot-only'
  } else if (humanCommits === 0 && botCommits === 0) {
    liveness = 'dead'
  } else if (humanRatio < 0.2) {
    liveness = 'mostly-bots'
  } else if (lastHumanCommit) {
    const daysSince = Math.floor((Date.now() - new Date(lastHumanCommit).getTime()) / 86400000)
    if (daysSince <= 90) liveness = 'active'
    else if (daysSince <= 365) liveness = 'stale'
    else liveness = 'dormant'
  }

  return {
    repo,
    openIssues: { human: realIssues.length, bot: botIssues.length },
    openPRs: { human: realPRs.length, bot: botPRs.length },
    branches: branchCount,
    recentCommits: { human: humanCommits, bot: botCommits, total: totalRecentCommits },
    lastHumanCommit,
    lastHumanAuthor,
    humanContributors,
    releases: { count: releaseCount, latest: latestRelease },
    liveness,
    fetchedAt: new Date().toISOString(),
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const SOURCE = process.argv[2] || 'data/methods-index.json'
const data = JSON.parse(readFileSync(SOURCE, 'utf-8'))
const methods = data.methods || []

// Filter to methods with GitHub repos
const withRepo = methods.filter(m => m.githubRepo).slice(0, 225)
console.log(`Found ${withRepo.length} methods with GitHub repos`)

// Check gh auth
try {
  execSync('gh auth status 2>&1', { encoding: 'utf-8' })
} catch (e) {
  console.error('ERROR: gh CLI not authenticated. Run `gh auth login` first.')
  process.exit(1)
}

// Check rate limit
const rateLimit = ghSingle('rate_limit')
const remaining = rateLimit?.rate?.remaining || 0
console.log(`GitHub API rate limit remaining: ${remaining}`)
if (remaining < withRepo.length * 7) {
  console.warn(`WARNING: May hit rate limit. Need ~${withRepo.length * 7} calls, have ${remaining} remaining.`)
}

const results = {}
let done = 0
for (const m of withRepo) {
  const health = fetchRepoHealth(m.githubRepo)
  if (health) {
    results[m.method] = health
  }
  done++
  if (done % 10 === 0) {
    console.log(`Progress: ${done}/${withRepo.length}`)
    // Save checkpoint
    writeFileSync('data/github-health.json', JSON.stringify({
      version: '1.0.0',
      generated: new Date().toISOString().split('T')[0],
      description: 'GitHub health signals per DID method repo. Bot activity filtered out.',
      total: Object.keys(results).length,
      methods: results,
    }, null, 2))
  }
}

// Final save
const output = {
  version: '1.0.0',
  generated: new Date().toISOString().split('T')[0],
  description: 'GitHub health signals per DID method repo. Bot activity filtered out.',
  total: Object.keys(results).length,
  methods: results,
}

writeFileSync('data/github-health.json', JSON.stringify(output, null, 2))

// Summary
const livenessCounts = {}
for (const h of Object.values(results)) {
  livenessCounts[h.liveness] = (livenessCounts[h.liveness] || 0) + 1
}

console.log(`\nDone. ${Object.keys(results).length} repos fetched → data/github-health.json`)
console.log('Liveness breakdown:', JSON.stringify(livenessCounts, null, 2))
console.log('Bot-only:', Object.entries(results).filter(([, h]) => h.liveness === 'bot-only').map(([m]) => m).join(', '))
