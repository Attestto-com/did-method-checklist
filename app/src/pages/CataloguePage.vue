<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMethodsData } from '@/composables/useMethodsData'
import { useFilters } from '@/composables/useFilters'
import MethodTable from '@/components/MethodTable.vue'
import MethodDetail from '@/components/MethodDetail.vue'

const { methods, methodsWithGrades } = useMethodsData()

const {
  search,
  categoryFilter,
  lifecycleFilter,
  assessedOnly,
  filtered,
  reset,
} = useFilters(() => methodsWithGrades.value)

const selectedMethod = ref<string | null>(null)

const selectedMethodData = computed(() => {
  if (!selectedMethod.value) return null
  return methodsWithGrades.value.find(m => m.method === selectedMethod.value) ?? null
})

function selectMethod(method: string) {
  selectedMethod.value = method
}

const stats = computed(() => {
  const all = methods.value
  const hasSpec = all.filter(m => m.specUrl != null)
  const hasClaims = all.filter(m => m.reqMet.length > 0)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const activeRepo = all.filter(m => {
    if (!m.lastCommit) return false
    return new Date(m.lastCommit) > sixMonthsAgo && !m.archived
  })
  const hasResolver = all.filter(m => m.feat.resolver === true)
  const archived = all.filter(m => m.archived)
  const pq = all.filter(m => m.crypto.pq === true)

  return [
    { value: all.length, label: 'Catalogued', color: 'text-status-info' },
    { value: hasSpec.length, label: 'Has Spec', color: 'text-status-met' },
    { value: hasClaims.length, label: 'Self-Reported', color: 'text-status-partial' },
    { value: activeRepo.length, label: 'Active Repo', color: 'text-status-met' },
    { value: hasResolver.length, label: 'Resolver', color: 'text-status-experimental' },
    { value: archived.length, label: 'Archived', color: 'text-status-not-met' },
    { value: pq.length, label: 'Post-Quantum', color: '' },
  ]
})
</script>

<template>
  <!-- Stats bar -->
  <div class="grid grid-cols-4 sm:grid-cols-7 gap-3">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="card-stat"
    >
      <div
        class="card-stat-value"
        :class="stat.color"
        :style="stat.color === '' ? `color: var(--color-cyan)` : undefined"
      >{{ stat.value }}</div>
      <div class="card-stat-label">{{ stat.label }}</div>
    </div>
  </div>

  <!-- Filters -->
  <div class="flex flex-wrap gap-3 items-center">
    <div class="relative flex-1 max-w-sm">
      <svg class="input-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        v-model="search"
        type="text"
        placeholder="Search methods..."
        class="input-base pl-10"
      />
    </div>
    <select v-model="categoryFilter" class="input-base" style="width: auto;">
      <option value="all">All categories</option>
      <option value="blockchain">Blockchain</option>
      <option value="web">Web</option>
      <option value="peer">Peer</option>
      <option value="ledger">Ledger</option>
      <option value="generative">Generative</option>
      <option value="hybrid">Hybrid</option>
      <option value="other">Other</option>
    </select>
    <select v-model="lifecycleFilter" class="input-base" style="width: auto;">
      <option value="all">All Maturity</option>
      <option value="stable">Stable</option>
      <option value="active">Active</option>
      <option value="experimental">Experimental</option>
      <option value="deprecated">Deprecated</option>
      <option value="legacy">Legacy</option>
      <option value="not-assessed">Not Assessed</option>
    </select>
    <label class="input-checkbox-group">
      <input v-model="assessedOnly" type="checkbox" class="rounded border-gray-600" />
      Assessed only
    </label>
    <button class="btn-ghost flex items-center gap-1" @click="reset">
      &times; Clear
    </button>
  </div>

  <!-- Results count -->
  <div class="text-help">
    {{ filtered.length }} methods found
  </div>

  <!-- Table -->
  <MethodTable
    :methods="filtered"
    @select-method="selectMethod"
  />

  <!-- Method detail modal -->
  <MethodDetail
    v-if="selectedMethodData"
    :method="selectedMethodData!"
    @close="selectedMethod = null"
  />
</template>
