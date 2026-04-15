<script setup lang="ts">
import SelfAssessment from '@/components/SelfAssessment.vue'
</script>

<template>
  <p class="text-xs text-muted" style="border-left: 3px solid var(--color-border); padding: 0.5rem 0.75rem; margin-bottom: 1rem;">
    Step-by-step wizard for method teams to document their own capabilities against W3C requirements.
    Your submission becomes the public record — other projects use this data to evaluate interoperability with your method.
  </p>
  <SelfAssessment />
</template>
