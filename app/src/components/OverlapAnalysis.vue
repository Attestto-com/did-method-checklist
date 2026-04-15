<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MethodEntry } from '@/types/method'
import { computeOverlap } from '@/composables/useAssessment'
import { REQUIREMENTS_MAP } from '@/config/requirements'

const props = defineProps<{
  methods: MethodEntry[]
}>()

const methodA = ref<string | null>(null)
const methodB = ref<string | null>(null)

const assessedMethods = computed(() => props.methods.filter(m => m.assessed))

const overlap = computed(() => {
  if (!methodA.value || !methodB.value) return null
  const a = props.methods.find(m => m.method === methodA.value)
  const b = props.methods.find(m => m.method === methodB.value)
  if (!a || !b) return null
  return computeOverlap(a, b)
})
</script>

<template>
  <div>
    <h3 class="text-subsection mb-3">Overlap Analysis</h3>
    <p class="text-help text-dim mb-4">
      Compare two assessed methods to see which requirements they share, and where they differ.
    </p>

    <!-- Method selectors -->
    <div class="flex gap-3 mb-4">
      <select v-model="methodA" class="input-base flex-1">
        <option :value="null">Select method A...</option>
        <option
          v-for="m in assessedMethods"
          :key="m.method"
          :value="m.method"
          :disabled="m.method === methodB"
        >
          {{ m.method }}
        </option>
      </select>
      <select v-model="methodB" class="input-base flex-1">
        <option :value="null">Select method B...</option>
        <option
          v-for="m in assessedMethods"
          :key="m.method"
          :value="m.method"
          :disabled="m.method === methodA"
        >
          {{ m.method }}
        </option>
      </select>
    </div>

    <!-- Results -->
    <div v-if="overlap" class="space-y-4">
      <!-- Summary -->
      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="overlap-stat">
          <div class="overlap-stat__value text-status-met">{{ overlap.shared.length }}</div>
          <div class="overlap-stat__label">Shared</div>
        </div>
        <div class="overlap-stat">
          <div class="overlap-stat__value text-status-info">{{ overlap.onlyA.length }}</div>
          <div class="overlap-stat__label">Only {{ methodA?.replace('did:', '') }}</div>
        </div>
        <div class="overlap-stat">
          <div class="overlap-stat__value text-status-experimental">{{ overlap.onlyB.length }}</div>
          <div class="overlap-stat__label">Only {{ methodB?.replace('did:', '') }}</div>
        </div>
      </div>

      <!-- Requirement breakdown -->
      <div class="space-y-1">
        <div
          v-for="reqId in [...overlap.shared, ...overlap.onlyA, ...overlap.onlyB]"
          :key="reqId"
          class="flex items-center gap-2 text-xs py-1 px-2 rounded"
        >
          <span class="text-requirement-id w-8">{{ reqId }}</span>
          <span class="text-description flex-1">{{ REQUIREMENTS_MAP[reqId]?.name ?? reqId }}</span>
          <span
            v-if="overlap.shared.includes(reqId)"
            class="overlap-pill overlap-pill--shared"
          >Both</span>
          <span
            v-else-if="overlap.onlyA.includes(reqId)"
            class="overlap-pill overlap-pill--a"
          >{{ methodA?.replace('did:', '') }}</span>
          <span
            v-else
            class="overlap-pill overlap-pill--b"
          >{{ methodB?.replace('did:', '') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
