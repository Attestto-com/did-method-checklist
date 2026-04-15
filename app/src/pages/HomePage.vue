<script setup lang="ts">
import { useMethodsData } from '@/composables/useMethodsData'

const { methods } = useMethodsData()
</script>

<template>
  <div class="space-y-10 max-w-4xl mx-auto">

    <!-- Hero -->
    <div class="text-center space-y-3 pt-4">
      <h1 class="hero-title">
        DID Method <span class="shell-header__accent">Catalogue</span>
      </h1>
      <p class="hero-description">
        A community-sourced catalogue for comparing DID methods based on self-reported assessments
        against <a href="https://www.w3.org/TR/did-use-cases/" target="_blank" class="link">W3C DID Use Cases</a> requirements.
        Not a registry. Not an endorsement. Just data.
      </p>
      <div class="flex justify-center gap-3 pt-2">
        <router-link to="/catalogue" class="hero-btn-primary">Browse Catalogue</router-link>
        <router-link to="/self-assessment" class="hero-btn-outline">Submit Assessment</router-link>
      </div>
    </div>

    <!-- Quick stats -->
    <div class="grid grid-cols-3 gap-3">
      <div class="card-stat py-4">
        <div class="card-stat-value text-status-info">{{ methods.length }}</div>
        <div class="card-stat-label text-xs">Methods Catalogued</div>
      </div>
      <div class="card-stat py-4">
        <div class="card-stat-value text-status-met">22</div>
        <div class="card-stat-label text-xs">W3C Requirements</div>
      </div>
      <div class="card-stat py-4">
        <div class="card-stat-value text-status-experimental">17</div>
        <div class="card-stat-label text-xs">Use Cases Defined</div>
      </div>
    </div>

    <!-- Tools grid -->
    <div>
      <h2 class="text-section-header mb-4">Tools</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

        <router-link to="/catalogue" class="group tool-card hover:border-blue-400/40">
          <h3 class="tool-card__title text-status-info group-hover:text-blue-300">Method Catalogue</h3>
          <p class="tool-card__desc">
            Browse, filter, and compare all catalogued DID methods. Sort by stars, activity, requirements claimed, category, and industry.
          </p>
        </router-link>

        <router-link to="/self-assessment" class="group tool-card hover:border-green-400/40">
          <h3 class="tool-card__title text-status-met group-hover:text-green-300">Self-Assessment Wizard</h3>
          <p class="tool-card__desc">
            Step-by-step wizard to assess your DID method against the 22 W3C requirements. Export as JSON for submission.
          </p>
        </router-link>

        <router-link to="/llm-prompt" class="group tool-card hover:border-purple-400/40">
          <h3 class="tool-card__title text-status-experimental group-hover:text-purple-300">LLM-Assisted Assessment</h3>
          <p class="tool-card__desc">
            Copy a structured prompt to use with any LLM (Claude, ChatGPT, Gemini) to auto-generate a spec assessment from your documentation.
          </p>
        </router-link>

        <router-link to="/ecosystem" class="group tool-card hover:border-yellow-400/40">
          <h3 class="tool-card__title text-status-partial group-hover:text-yellow-300">Ecosystem Analysis</h3>
          <p class="tool-card__desc">
            Feature comparison matrix and method overlap analysis. See how methods relate to each other across capabilities.
          </p>
        </router-link>

        <router-link to="/requirements" class="group tool-card hover:border-cyan-400/40">
          <h3 class="tool-card__title group-hover:text-cyan-300" style="color: var(--color-cyan);">Requirements Matrix</h3>
          <p class="tool-card__desc">
            Full matrix of all 22 W3C requirements vs all methods. See at a glance which requirements each method claims to meet.
          </p>
        </router-link>

        <div class="tool-card--placeholder">
          <h3 class="tool-card__title text-muted">More coming</h3>
          <p class="tool-card__desc">
            Additional analysis tools, comparison views, and export formats are in development.
          </p>
        </div>

      </div>
    </div>

    <!-- Fork / Deep analysis -->
    <div class="card p-6 space-y-4">
      <h2 class="text-section-header">Go Deeper</h2>
      <p class="text-body text-muted">
        The catalogue provides a high-level view based on self-reported claims. For a thorough analysis — testing resolvers, verifying cryptographic implementations, auditing spec compliance — you'll want to work locally with the full dataset.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="step-card">
          <h4 class="step-card__title">1. Clone the repo</h4>
          <div class="code-inline">
            <code>git clone https://github.com/user/did-landscape-explorer.git</code>
          </div>
          <p class="step-card__desc">
            Full source + all method data as JSON files you can query, transform, and extend.
          </p>
        </div>

        <div class="step-card">
          <h4 class="step-card__title">2. Run locally</h4>
          <div class="code-inline">
            <code>npm install && npm run dev</code>
          </div>
          <p class="step-card__desc">
            Modify the data, add your own methods, run custom comparisons — no server needed.
          </p>
        </div>

        <div class="step-card">
          <h4 class="step-card__title">3. Contribute back</h4>
          <div class="code-inline">
            <code>gh pr create</code>
          </div>
          <p class="step-card__desc">
            Submit corrections, new assessments, or improved data via pull request.
          </p>
        </div>
      </div>

      <div class="text-xs text-muted pt-3" style="border-top: 1px solid var(--color-border);">
        <strong class="text-description">What you can do locally:</strong>
        Run resolver tests against live networks, verify cryptographic proofs, cross-reference with the
        <a href="https://www.w3.org/TR/did-spec-registries/" target="_blank" class="link">DID Spec Registries</a>,
        build custom scoring models, generate reports for your organization, or integrate with your CI pipeline.
      </div>
    </div>

    <!-- Principles -->
    <div class="callout-warning px-5 py-4 space-y-2">
      <h3 class="callout__title">Design Principles</h3>
      <ul class="text-xs space-y-1 text-description">
        <li><strong class="text-secondary">Observable facts only</strong> — We show what methods claim. We do not assign grades, maturity levels, or rankings.</li>
        <li><strong class="text-secondary">Not assessed ≠ failing</strong> — Missing data means the method hasn't been assessed, not that it fails.</li>
        <li><strong class="text-secondary">Community-sourced</strong> — All data comes from method authors, implementers, or community contributors.</li>
        <li><strong class="text-secondary">Open & forkable</strong> — Every piece of data is in plain JSON. Clone, fork, remix.</li>
      </ul>
    </div>
  </div>
</template>
