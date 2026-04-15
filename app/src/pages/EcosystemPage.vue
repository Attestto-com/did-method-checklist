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
    <p class="text-xs text-muted" style="border-left: 3px solid var(--color-border); padding: 0.5rem 0.75rem;">
      Feature comparison across methods. Data is community-sourced — gaps mean "not yet documented", not "missing."
      Method teams can update their entry via the Self-Assessment wizard.
    </p>
    <FeatureMatrix :methods="filtered" />
    <OverlapAnalysis :methods="methods" />
  </div>
</template>
