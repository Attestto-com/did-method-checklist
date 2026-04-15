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
