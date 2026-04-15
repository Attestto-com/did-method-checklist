<script setup lang="ts">
import { ref } from 'vue'
import { useMethodsData } from '@/composables/useMethodsData'
import { useFilters } from '@/composables/useFilters'
import RequirementsMatrix from '@/components/RequirementsMatrix.vue'
import MethodDetail from '@/components/MethodDetail.vue'

const { methodsWithGrades } = useMethodsData()
const { filtered } = useFilters(() => methodsWithGrades.value)

const selectedMethod = ref<string | null>(null)
const selectedMethodData = () => {
  if (!selectedMethod.value) return null
  return methodsWithGrades.value.find(m => m.method === selectedMethod.value) ?? null
}
</script>

<template>
  <p class="text-xs text-muted" style="border-left: 3px solid var(--color-border); padding: 0.5rem 0.75rem; margin-bottom: 1rem;">
    How each method maps to the 22 W3C DID Use Case requirements. Based on self-assessments, not independent review.
    If your method's data is missing or wrong, submit a correction via the Self-Assessment wizard.
  </p>
  <RequirementsMatrix
    :methods="filtered"
    @select-method="(m: string) => selectedMethod = m"
  />

  <MethodDetail
    v-if="selectedMethodData()"
    :method="selectedMethodData()!"
    @close="selectedMethod = null"
  />
</template>
