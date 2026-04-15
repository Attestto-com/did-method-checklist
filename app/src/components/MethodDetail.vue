<script setup lang="ts">
import type { MethodEntry, GradeResult } from '@/types/method'
import { REQUIREMENTS } from '@/config/requirements'
import { LIFECYCLE_STATUSES, REGISTRY_TYPES, FEATURE_DEFINITIONS } from '@/config/taxonomy'
import { getRequirementStatus } from '@/composables/useAssessment'
import { statusSymbol, statusColor } from '@/config/grading'
import { repoZipUrl } from '@/config/urls'

const props = defineProps<{
  method: MethodEntry & { gradeResult: GradeResult }
}>()

defineEmits<{
  close: []
}>()

const lifecycle = LIFECYCLE_STATUSES[props.method.maturity.lifecycle]
const category = REGISTRY_TYPES[props.method.registryType]
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
    <!-- Backdrop -->
    <div class="absolute inset-0" style="background: var(--color-bg-overlay);" @click="$emit('close')"></div>

    <!-- Panel -->
    <div class="relative modal-panel max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6 space-y-6">
      <!-- Close button -->
      <button
        class="absolute top-4 right-4 modal-header__close text-xl"
        @click="$emit('close')"
      >
        &times;
      </button>

      <!-- Header -->
      <div>
        <div class="flex items-center gap-4 mb-2">
          <h2 class="text-xl font-mono font-bold text-secondary">{{ method.method }}</h2>
          <div
            v-if="method.assessed"
            class="text-2xl font-bold"
            :style="{ color: method.gradeResult.color }"
          >
            {{ method.gradeResult.grade }}
          </div>
          <span v-else class="text-sm text-muted italic px-2 py-1 rounded" style="background: var(--color-bg-input);">
            Not Assessed
          </span>
        </div>
        <p v-if="method.abstract" class="text-body text-muted">{{ method.abstract }}</p>
      </div>

      <!-- Badges -->
      <div class="flex flex-wrap gap-2">
        <span
          class="badge-lifecycle"
          :style="{ borderColor: lifecycle.color + '40', color: lifecycle.color }"
        >
          {{ lifecycle.label }}
        </span>
        <span class="badge-category">
          {{ category.label }}
        </span>
        <a
          v-if="method.specUrl"
          :href="method.specUrl"
          target="_blank"
          class="badge-pill border-blue-500/30 text-status-info hover:underline"
        >
          Specification &rarr;
        </a>
      </div>

      <!-- Community contribution callout -->
      <div :class="method.assessed ? 'callout-info' : 'callout-warning'">
        <template v-if="!method.assessed">
          <p class="callout__title">This method needs community input</p>
          <p class="callout__body">
            No assessment has been submitted yet &mdash; this does <strong class="text-secondary">not</strong>
            mean the method lacks capabilities. It simply hasn't been reviewed.
          </p>
          <p class="callout__body mt-2">
            Help strengthen the DID ecosystem: download the repository, analyse the specification
            with an LLM or on your own, and submit your findings as a pull request.
            Every contribution &mdash; whether from an individual, a team, or an AI-assisted review
            &mdash; is tracked as a separate revision so the community can build on each other's work.
          </p>
        </template>
        <template v-else>
          <p class="callout__body">
            Download the full repository to explore schemas, resolution logic, test vectors,
            and implementation details &mdash; or feed it to an LLM agent for deep spec analysis.
            Additional assessment revisions from other contributors and models are welcome.
          </p>
        </template>
        <div class="flex items-center gap-3 mt-3">
          <a
            v-if="repoZipUrl(method.repoUrl)"
            :href="repoZipUrl(method.repoUrl)!"
            class="btn-accent"
            download
          >&#8681; Download Repo ZIP</a>
          <router-link to="/llm-prompt" class="btn-outline">LLM Analysis Guide &rarr;</router-link>
          <router-link to="/self-assessment" class="btn-outline">Submit an Assessment &rarr;</router-link>
        </div>
      </div>

      <!-- Requirements table -->
      <div v-if="method.assessed">
        <h3 class="text-subsection mb-3">
          W3C Requirements ({{ method.reqMet.length }}/{{ REQUIREMENTS.length }})
        </h3>
        <div class="space-y-1">
          <div
            v-for="req in REQUIREMENTS"
            :key="req.id"
            class="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-gray-800/50"
          >
            <span
              class="text-sm w-5 text-center"
              :style="{ color: statusColor(getRequirementStatus(method, req.id)) }"
            >
              {{ statusSymbol(getRequirementStatus(method, req.id)) }}
            </span>
            <span class="text-requirement-id w-8">{{ req.id }}</span>
            <span class="text-description flex-1">{{ req.name }}</span>
            <span
              :class="{
                'tier-core': req.tier === 'core',
                'tier-common': req.tier === 'common',
                'tier-specialized': req.tier === 'specialized',
              }"
            >
              {{ req.tier }}
            </span>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div>
        <h3 class="text-subsection mb-3">Features</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div
            v-for="feat in FEATURE_DEFINITIONS"
            :key="feat.key"
            class="feat-card"
            :class="method.feat[feat.key as keyof typeof method.feat] === true
              ? 'feat-card--yes'
              : method.feat[feat.key as keyof typeof method.feat] === false
                ? 'feat-card--no'
                : 'feat-card--unset'"
          >
            <div class="flex items-center gap-2">
              <span
                v-if="method.feat[feat.key as keyof typeof method.feat] === null"
                class="text-ghost text-sm"
              >?</span>
              <span
                v-else-if="method.feat[feat.key as keyof typeof method.feat]"
                class="text-status-met text-sm"
              >&#10003;</span>
              <span v-else class="text-status-not-met text-sm">&#10007;</span>
              <span class="text-xs text-secondary font-medium">{{ feat.label }}</span>
            </div>
            <p class="text-[10px] text-dim leading-tight mt-1">{{ feat.description }}</p>
          </div>
        </div>
      </div>

      <!-- Compatibility -->
      <div v-if="method.compat.methods.length > 0">
        <h3 class="text-subsection mb-2">Compatible With</h3>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="m in method.compat.methods"
            :key="m"
            class="badge-category font-mono"
          >
            {{ m }}
          </span>
        </div>
        <p v-if="method.compat.via" class="text-dim text-[10px] mt-1">{{ method.compat.via }}</p>
      </div>
    </div>
  </div>
</template>
