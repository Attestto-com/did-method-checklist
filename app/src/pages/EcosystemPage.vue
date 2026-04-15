<script setup lang="ts">
import { useMethodsData } from '@/composables/useMethodsData'
import { useFilters } from '@/composables/useFilters'
import FeatureMatrix from '@/components/FeatureMatrix.vue'
import OverlapAnalysis from '@/components/OverlapAnalysis.vue'

const { methods, methodsWithGrades } = useMethodsData()
const { filtered } = useFilters(() => methodsWithGrades.value)
</script>

<template>
  <div class="space-y-8">
    <FeatureMatrix :methods="filtered" />
    <OverlapAnalysis :methods="methods" />
  </div>
</template>
