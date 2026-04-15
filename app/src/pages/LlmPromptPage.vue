<script setup lang="ts">
import { computed } from 'vue'
import { PROMPTS } from '@/config/prompts'
import PromptCard from '@/components/PromptCard.vue'

const contextPrompt = computed(() => PROMPTS.find(p => p.isContext))
const analysisPrompts = computed(() => PROMPTS.filter(p => !p.isContext))
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-page-title">LLM-Assisted Analysis</h2>
      <p class="text-body text-muted mt-1">
        Use an LLM to analyze DID method specifications against the W3C requirements framework.
        Two workflows available — pick the one that fits your setup.
      </p>
    </div>

    <!-- Workflow selector -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <!-- Claude Code (recommended) -->
      <div class="callout-success px-5 py-5 space-y-3">
        <div class="flex items-center gap-2">
          <h3 class="callout__title" style="margin-bottom: 0;">Claude Code</h3>
          <span class="prompt-card__required-badge" style="background: rgba(74, 222, 128, 0.1); color: #4ade80; border-color: rgba(74, 222, 128, 0.2);">Recommended</span>
        </div>
        <p class="text-help">
          Clone the repo and use Claude Code directly. It reads the data files, understands the schema,
          and writes output files (JSON assessments, Markdown reports) into the project.
        </p>
        <div class="space-y-2">
          <div class="code-inline"><code>git clone https://github.com/user/did-landscape-explorer.git</code></div>
          <div class="code-inline"><code>cd did-landscape-explorer</code></div>
          <div class="code-inline"><code>claude</code></div>
        </div>
        <p class="text-[11px] text-muted">
          Claude Code will read the <code class="text-muted">CLAUDE.md</code> automatically, load the requirements and feature definitions,
          and ask what you'd like to do. Just tell it: <em class="text-description">"Assess the did:example spec at https://..."</em>
        </p>
        <div class="text-[11px] text-muted pt-2" style="border-top: 1px solid var(--color-border);">
          <div><strong class="text-description">What it does that copy-paste can't:</strong></div>
          <ul class="space-y-0.5 list-disc list-inside">
            <li>Reads existing method data to avoid duplicates</li>
            <li>Writes assessment JSON directly to the project</li>
            <li>Generates Markdown reports into <code class="text-muted">docs/analyses/</code></li>
            <li>Can compare your spec against any method already in the catalogue</li>
            <li>Can run <code class="text-muted">pnpm build</code> to verify the output is valid</li>
          </ul>
        </div>
      </div>

      <!-- Manual copy-paste -->
      <div class="card p-5 space-y-3">
        <h3 class="text-subsection text-description">Copy-Paste Prompts</h3>
        <p class="text-help">
          If you don't have Claude Code, use any LLM by copying the prompts below. Load the context first,
          then pick an analysis prompt and paste your spec.
        </p>
        <ol class="text-help space-y-1 list-decimal list-inside">
          <li>Copy the <strong style="color: #fbbf24;">Load Context</strong> prompt into your LLM</li>
          <li>Copy one of the analysis prompts into the same conversation</li>
          <li>Replace the placeholder with your spec URL or text</li>
          <li>Review the output and verify against your spec</li>
        </ol>
        <p class="text-[11px] text-muted">
          Works with Claude, ChatGPT, Gemini, or any LLM with a large enough context window.
        </p>
      </div>
    </div>

    <!-- Copy-paste prompts section -->
    <div class="space-y-4">
      <h3 class="text-subsection text-primary">Prompts</h3>

      <!-- Context loader -->
      <PromptCard v-if="contextPrompt" :prompt="contextPrompt" />

      <!-- Analysis prompts -->
      <div class="space-y-3">
        <h4 class="text-label">Analysis prompts</h4>
        <PromptCard v-for="p in analysisPrompts" :key="p.id" :prompt="p" />
      </div>
    </div>
  </div>
</template>
