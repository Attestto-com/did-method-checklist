<script setup lang="ts">
/**
 * Style Guide — live reference for all UI patterns used in the explorer.
 *
 * Every visual pattern in the app should have an example here.
 * Contributors: use these patterns, don't invent new ones.
 *
 * ALL classes reference semantic definitions in style.css.
 * Raw Tailwind color/size utilities are FORBIDDEN in components.
 */
import { ref } from 'vue'
import { statusSymbol, statusColor } from '@/config/grading'
import { LIFECYCLE_STATUSES, REGISTRY_TYPES } from '@/config/taxonomy'
import type { AssessmentStatus } from '@/types/method'

const assessmentStatuses: AssessmentStatus[] = ['met', 'partial', 'not-met', 'not-applicable', 'not-assessed']

// Interactive demos
const demoExpanded = ref(false)
const demoSort = ref<'asc' | 'desc'>('asc')
const demoSearch = ref('')
const demoCheckbox = ref(false)
const demoSelect = ref('all')
const demoTab = ref('tab1')

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
</script>

<template>
  <div class="space-y-10 max-w-5xl">
    <div>
      <h2 class="text-page-title mb-1">Style Guide</h2>
      <p class="text-help">
        Live reference for all UI patterns. Every visual element in the explorer should be documented here.
        Contributors: use these patterns, don't invent new ones.
      </p>
    </div>

    <!-- ================================================================ -->
    <!-- COLORS -->
    <!-- ================================================================ -->
    <section class="layout-card-content">
      <h3 class="text-subsection section-divider">Semantic Colors</h3>
      <div class="grid grid-cols-6 gap-3">
        <div v-for="[name, color] in [
          ['Green (met)', 'var(--color-green)'],
          ['Yellow (partial)', 'var(--color-yellow)'],
          ['Red (not met)', 'var(--color-red)'],
          ['Blue (info/links)', 'var(--color-blue)'],
          ['Purple (experimental)', 'var(--color-purple)'],
          ['Dim (no data)', 'var(--color-text-dim)'],
        ]" :key="name" class="text-center">
          <div class="w-full h-8 rounded" :style="{ backgroundColor: color as string }"></div>
          <span class="text-label mt-1 block" style="text-transform: none;">{{ name }}</span>
        </div>
      </div>
      <p class="text-footnote">
        Defined as CSS custom properties in <code class="code-ref">style.css</code>. Use <code class="code-ref">var(--color-*)</code> in inline styles or semantic classes.
      </p>
    </section>

    <!-- ================================================================ -->
    <!-- TYPOGRAPHY -->
    <!-- ================================================================ -->
    <section class="layout-card-content">
      <h3 class="text-subsection section-divider">Typography</h3>
      <div class="rounded-lg border border-gray-700 divide-y divide-gray-700/50">
        <div v-for="[sample, cssClass, usage] in [
          ['Page Title', 'text-page-title', 'Page headings'],
          ['Section Header', 'text-section-header', 'Major sections within a page'],
          ['Subsection', 'text-subsection', 'Card titles, group headers'],
          ['Body Text', 'text-body', 'Primary content text'],
          ['Description', 'text-help', 'Secondary descriptions, help text'],
          ['Muted', 'text-muted', 'Tertiary text, footnotes'],
          ['Label', 'text-label', 'Section labels, stat labels'],
          ['did:method:name', 'text-method-name', 'Method names (always monospace)'],
          ['R1, R22', 'text-requirement-id', 'Requirement IDs'],
          ['88%', 'text-score', 'Numeric values, scores'],
        ]" :key="sample" class="flex items-center gap-4 px-4 py-2.5">
          <span class="w-48" :class="cssClass as string">{{ sample }}</span>
          <code class="code-ref flex-1">{{ cssClass }}</code>
          <span class="text-dim w-40 text-right text-[10px]">{{ usage }}</span>
        </div>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- ASSESSMENT STATUS -->
    <!-- ================================================================ -->
    <section class="layout-card-content">
      <h3 class="text-subsection section-divider">Assessment Status</h3>
      <div class="flex gap-6">
        <div v-for="status in assessmentStatuses" :key="status" class="text-center">
          <span class="text-2xl block" :style="{ color: statusColor(status) }">
            {{ statusSymbol(status) }}
          </span>
          <span class="text-dim text-[10px] block mt-1">{{ status }}</span>
        </div>
      </div>
      <p class="text-footnote">
        5-state model. "not-assessed" means no data — NOT a failing status.
        Symbols from <code class="code-ref">config/grading.ts</code>.
      </p>
    </section>

    <!-- ================================================================ -->
    <!-- BADGES -->
    <!-- ================================================================ -->
    <section class="space-y-4">
      <h3 class="text-subsection section-divider">Badges &amp; Pills</h3>

      <!-- Lifecycle -->
      <div>
        <h4 class="text-label mb-2">Lifecycle</h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(config, key) in LIFECYCLE_STATUSES"
            :key="key"
            class="badge-lifecycle"
            :style="{ borderColor: config.color + '40', color: config.color }"
          >{{ config.label }}</span>
        </div>
      </div>

      <!-- Category -->
      <div>
        <h4 class="text-label mb-2">Registry Type</h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(config, key) in REGISTRY_TYPES"
            :key="key"
            class="badge-category"
          >{{ config.label }}</span>
        </div>
      </div>

      <!-- Requirement Tiers -->
      <div>
        <h4 class="text-label mb-2">Requirement Tiers</h4>
        <div class="flex gap-2">
          <span class="badge-tier-core">core</span>
          <span class="badge-tier-common">common</span>
          <span class="badge-tier-specialized">specialized</span>
        </div>
      </div>

      <!-- Industry -->
      <div>
        <h4 class="text-label mb-2">Industries</h4>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="(config, key) in INDUSTRY_LABELS"
            :key="key"
            class="badge-industry"
            :class="config.color"
          >{{ config.short }}</span>
        </div>
      </div>

      <!-- Feature pills -->
      <div>
        <h4 class="text-label mb-2">Feature &amp; Crypto Pills</h4>
        <div class="flex flex-wrap gap-1">
          <span class="pill-supported">Key Rotation</span>
          <span class="pill-unsupported">Multi-Sig</span>
          <span class="pill-unknown">DID Log</span>
        </div>
        <p class="text-footnote mt-1">Green = supported, red = not supported, gray = unknown/not documented</p>
      </div>

      <!-- Requirement compatibility pills -->
      <div>
        <h4 class="text-label mb-2">Requirement Compatibility</h4>
        <div class="flex flex-wrap gap-1">
          <span class="pill-req-met">R1</span>
          <span class="pill-req-met">R2</span>
          <span class="pill-req-unmet">R3</span>
          <span class="pill-req-unmet">R4</span>
          <span class="pill-req-met">R5</span>
        </div>
        <p class="text-footnote mt-1">Green = method covers this requirement, gray = not covered. Used in the method preview modal.</p>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- BUTTONS -->
    <!-- ================================================================ -->
    <section class="layout-card-content">
      <h3 class="text-subsection section-divider">Buttons</h3>
      <div class="flex flex-wrap items-center gap-3">
        <button class="btn-primary">Primary</button>
        <button class="btn-success">Success</button>
        <button class="btn-outline">Outline</button>
        <button class="btn-dashed">Dashed</button>
        <button class="btn-ghost">Ghost</button>
        <button class="btn-accent">Accent Outline</button>
        <button class="btn-disabled" disabled>Disabled</button>
      </div>

      <!-- Segmented toggle -->
      <div>
        <h4 class="text-label mb-2">Segmented Toggle</h4>
        <div class="toggle-group">
          <button
            v-for="tab in ['tab1', 'tab2', 'tab3']"
            :key="tab"
            class="toggle-group__item"
            :class="demoTab === tab ? 'toggle-group__item--active' : ''"
            @click="demoTab = tab"
          >{{ tab === 'tab1' ? 'Option A' : tab === 'tab2' ? 'Option B' : 'Option C' }}</button>
        </div>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- INPUTS -->
    <!-- ================================================================ -->
    <section class="layout-card-content">
      <h3 class="text-subsection section-divider">Inputs</h3>
      <div class="grid grid-cols-3 gap-3">
        <!-- Search -->
        <div>
          <label class="input-label">Search</label>
          <div class="relative">
            <svg class="input-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="demoSearch"
              type="text"
              placeholder="Search methods..."
              class="input-base pl-10"
            />
          </div>
        </div>
        <!-- Select -->
        <div>
          <label class="input-label">Select</label>
          <select v-model="demoSelect" class="input-base">
            <option value="all">All categories</option>
            <option value="blockchain">Blockchain</option>
            <option value="web">Web</option>
          </select>
        </div>
        <!-- Text input -->
        <div>
          <label class="input-label">Text Input</label>
          <input
            type="text"
            placeholder="did:your-method"
            class="input-base"
          />
        </div>
      </div>
      <!-- Checkbox -->
      <div class="flex items-center gap-4">
        <label class="input-checkbox-group">
          <input v-model="demoCheckbox" type="checkbox" class="rounded border-gray-600" />
          Assessed only
        </label>
        <span class="text-footnote" style="font-style: normal;">Standard checkbox pattern for filters</span>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- CARDS -->
    <!-- ================================================================ -->
    <section class="space-y-4">
      <h3 class="text-subsection section-divider">Cards</h3>

      <!-- Stat cards -->
      <div>
        <h4 class="text-label mb-2">Stat Cards</h4>
        <div class="grid grid-cols-4 gap-3">
          <div class="card-stat">
            <div class="card-stat-value text-status-info">225</div>
            <div class="card-stat-label">Catalogued</div>
          </div>
          <div class="card-stat">
            <div class="card-stat-value text-status-met">200</div>
            <div class="card-stat-label">Has Spec</div>
          </div>
          <div class="card-stat">
            <div class="card-stat-value text-status-not-met">10</div>
            <div class="card-stat-label">Archived</div>
          </div>
          <div class="card-stat">
            <div class="card-stat-value" style="color: var(--color-cyan);">5</div>
            <div class="card-stat-label">Post-Quantum</div>
          </div>
        </div>
      </div>

      <!-- Info card -->
      <div>
        <h4 class="text-label mb-2">Info Card</h4>
        <div class="card">
          <h3 class="text-subsection mb-1">Card Title</h3>
          <p class="text-help">Card description text. Used for content sections, form panels, and grouped information.</p>
        </div>
      </div>

      <!-- Collapsible card -->
      <div>
        <h4 class="text-label mb-2">Collapsible Card</h4>
        <div class="card-collapsible" :class="demoExpanded ? 'card-collapsible--expanded' : ''">
          <button
            class="card-collapsible__trigger"
            @click="demoExpanded = !demoExpanded"
          >
            <div>
              <h3 class="text-sm font-semibold text-status-info">Collapsible Section</h3>
              <p class="text-help mt-0.5">Click to expand/collapse content</p>
            </div>
            <span class="text-muted text-sm transition-transform" :class="demoExpanded ? 'rotate-180' : ''">&#9660;</span>
          </button>
          <div v-if="demoExpanded" class="card-collapsible__body">
            <p class="text-body">Expanded content goes here. Used for LLM prompts, methodology notes, and optional detail sections.</p>
          </div>
        </div>
      </div>

      <!-- Callouts -->
      <div>
        <h4 class="text-label mb-2">Callouts</h4>
        <div class="space-y-2">
          <div class="callout-info">
            <h4 class="callout__title">Info Callout</h4>
            <p class="callout__body">Informational content, instructions, how-to guides.</p>
          </div>
          <div class="callout-warning">
            <h4 class="callout__title">Warning Callout</h4>
            <p class="callout__body">Important notes, design principles, caveats.</p>
          </div>
          <div class="callout-success">
            <h4 class="callout__title">Success Callout</h4>
            <p class="callout__body">Confirmations, completed states.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- TABLE -->
    <!-- ================================================================ -->
    <section class="layout-card-content">
      <h3 class="text-subsection section-divider">Table</h3>
      <div class="table-wrapper">
        <table class="table">
          <thead class="table-head">
            <tr>
              <th class="text-center w-10">#</th>
              <th
                class="sortable"
                @click="demoSort = demoSort === 'asc' ? 'desc' : 'asc'"
              >Method{{ demoSort === 'asc' ? ' &#9650;' : ' &#9660;' }}</th>
              <th>Category</th>
              <th class="text-center">Reqs</th>
              <th class="text-center">Spec</th>
              <th class="text-right">Stars</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr class="table-row">
              <td class="table-cell-rank">1</td>
              <td><span class="text-method-name">did:example</span></td>
              <td><span class="badge-category">Blockchain</span></td>
              <td class="text-center"><span class="text-secondary">18</span><span class="text-dim">/22</span></td>
              <td class="text-center"><span class="table-cell-link">View &rarr;</span></td>
              <td class="text-right"><span class="text-description text-xs">&#9734; 1.2k</span></td>
            </tr>
            <tr class="table-row">
              <td class="table-cell-rank">2</td>
              <td><span class="text-method-name">did:unassessed</span></td>
              <td><span class="badge-category">Web</span></td>
              <td class="text-center"><span class="table-cell-empty">&mdash;</span></td>
              <td class="text-center"><span class="table-cell-empty">&mdash;</span></td>
              <td class="text-right"><span class="table-cell-empty">&mdash;</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-footnote">
        Sortable headers with &#9650;/&#9660; arrows. Hover state on rows. Monospace for method names.
        "View &rarr;" links for specs. Dash (&mdash;) for missing data.
      </p>
    </section>

    <!-- ================================================================ -->
    <!-- MODALS -->
    <!-- ================================================================ -->
    <section class="layout-card-content">
      <h3 class="text-subsection section-divider">Modal Pattern</h3>
      <div class="modal-panel max-w-md">
        <div class="modal-header">
          <div>
            <h3 class="text-section-header font-mono">did:example</h3>
            <span class="badge-category">Blockchain</span>
          </div>
          <button class="modal-header__close">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-purpose">
            Purpose line explaining what this modal is for.
          </p>
          <p class="text-body">Modal body content. Description or details about the selected item.</p>
          <div class="grid grid-cols-2 gap-2">
            <div class="card-stat">
              <div class="text-sm font-bold text-status-info">18<span class="text-dim">/22</span></div>
              <div class="card-stat-label">Reqs Claimed</div>
            </div>
            <div class="card-stat">
              <div class="text-sm font-bold text-secondary">active</div>
              <div class="card-stat-label">Lifecycle</div>
            </div>
          </div>
        </div>
      </div>
      <p class="text-footnote">
        Modals use <code class="code-ref">Teleport to="body"</code>, <code class="code-ref">.modal-overlay</code>,
        <code class="code-ref">@click.self</code> to close on backdrop click. Sticky header with close button.
      </p>
    </section>

    <!-- ================================================================ -->
    <!-- EMPTY / NOT PROVIDED STATES -->
    <!-- ================================================================ -->
    <section class="layout-card-content">
      <h3 class="text-subsection section-divider">Empty &amp; Not Provided States</h3>
      <div class="space-y-2">
        <div>
          <h4 class="text-label mb-1.5">Section Label</h4>
          <p class="empty-state">Not yet provided by the method's assessment</p>
        </div>
        <p class="text-footnote">
          Always show the section heading even when data is missing. Use <code class="code-ref">.empty-state</code> to indicate what <em>could</em> be shown.
          Never hide empty sections — visibility encourages contribution.
        </p>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- WIZARD PATTERN -->
    <!-- ================================================================ -->
    <section class="layout-card-content">
      <h3 class="text-subsection section-divider">Wizard Steps</h3>
      <div class="grid grid-cols-5 gap-2">
        <div class="wizard-step wizard-step--active">
          <span class="wizard-step__number">1</span>
          <span class="wizard-step__label">Active Step</span>
        </div>
        <div class="wizard-step wizard-step--done">
          <span class="wizard-step__number">2</span>
          <span class="wizard-step__label">Completed</span>
        </div>
        <div class="wizard-step">
          <span class="wizard-step__number">3</span>
          <span class="wizard-step__label">Upcoming</span>
        </div>
        <div class="wizard-step">
          <span class="wizard-step__number">4</span>
          <span class="wizard-step__label">Upcoming</span>
        </div>
        <div class="wizard-step">
          <span class="wizard-step__number">5</span>
          <span class="wizard-step__label">Upcoming</span>
        </div>
      </div>
      <p class="text-footnote">
        Step indicators: blue border for active, green for completed, gray for upcoming.
        Bottom nav bar with Back / Next buttons. "Next" disabled until step validation passes.
      </p>
    </section>

    <!-- ================================================================ -->
    <!-- LAYOUT -->
    <!-- ================================================================ -->
    <section class="layout-card-content">
      <h3 class="text-subsection section-divider">Layout &amp; Spacing</h3>
      <div class="card space-y-2">
        <div v-for="[cssClass, usage] in [
          ['layout-page', 'Standard content width (all pages except Requirements Matrix)'],
          ['layout-page-full', 'Full-width pages (Requirements Matrix — via route meta fullWidth: true)'],
          ['layout-content', 'Main content padding (px-6 py-6)'],
          ['layout-sections', 'Vertical spacing between page sections (space-y-6)'],
          ['layout-card-content', 'Vertical spacing within cards/sections (space-y-3)'],
        ]" :key="cssClass" class="flex items-center gap-3 text-xs">
          <code class="code-ref w-44">{{ cssClass }}</code>
          <span class="text-muted">{{ usage }}</span>
        </div>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- LINKS -->
    <!-- ================================================================ -->
    <section class="layout-card-content">
      <h3 class="text-subsection section-divider">Links</h3>
      <div class="flex items-center gap-6">
        <a href="#" class="link">Standard link</a>
        <a href="#" class="link">External link &#8599;</a>
        <a href="#" class="link-muted">Muted link</a>
        <a href="#" class="link-muted underline">Footer link</a>
      </div>
      <p class="text-footnote">
        External links use &#8599; (north-east arrow) suffix. Internal navigation uses <code class="code-ref">router-link</code>.
      </p>
    </section>

    <!-- ================================================================ -->
    <!-- CODE -->
    <!-- ================================================================ -->
    <section class="layout-card-content">
      <h3 class="text-subsection section-divider">Code &amp; Pre-formatted</h3>
      <div class="space-y-2">
        <div class="code-inline">
          <code>git clone https://github.com/example/repo.git</code>
        </div>
        <pre class="code-block">{
  "method": "did:example",
  "assessed": true,
  "requirements": { "R1": { "status": "met" } }
}</pre>
      </div>
      <p class="text-footnote">
        Inline commands: <code class="code-ref">.code-inline</code> with green text. JSON blocks: <code class="code-ref">.code-block</code> with gray text.
      </p>
    </section>
  </div>
</template>
