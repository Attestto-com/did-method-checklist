<script setup lang="ts">
import { ref } from 'vue'

const expanded = ref(false)
</script>

<template>
  <div class="methodology-note">
    <button
      class="flex w-full items-center justify-between text-left"
      @click="expanded = !expanded"
    >
      <div class="flex items-center gap-2">
        <span class="methodology-note__icon">&#9888;</span>
        <span class="methodology-note__title">How This Tool Works — Read Before Using</span>
      </div>
      <span class="methodology-note__toggle">{{ expanded ? 'collapse' : 'expand' }}</span>
    </button>

    <div v-if="expanded" class="methodology-note__body">
      <p>
        This tool displays <strong>community-sourced claims</strong> about DID method capabilities.
        It does not independently verify whether a method has a feature — it shows what the method's
        community has documented.
      </p>

      <div>
        <h4 class="methodology-note__heading">What the grades mean</h4>
        <ul class="list-disc pl-5 space-y-1 text-xs">
          <li><strong class="text-status-met">A/A+</strong> — Method community has documented coverage for 85%+ of W3C requirements</li>
          <li><strong class="text-status-partial">B</strong> — 70–84% documented coverage</li>
          <li><strong class="text-muted">C</strong> — 50–69% documented coverage</li>
          <li><strong class="text-status-not-met">D/F</strong> — Below 50% documented coverage</li>
          <li><strong class="text-dim">Not Assessed</strong> — No data has been submitted for this method. This does NOT mean the method lacks features.</li>
        </ul>
      </div>

      <div>
        <h4 class="methodology-note__heading">Data sources</h4>
        <p class="text-xs">
          Method data comes from JSON files in this repository. Method communities can submit
          or update their claims via pull request. Unverified claims are shown with a disclaimer.
          WG-reviewed claims are marked as verified.
        </p>
      </div>

      <div>
        <h4 class="methodology-note__heading">Assessment criteria</h4>
        <p class="text-xs">
          The rubric for what constitutes "met," "partial," "not applicable," and "not met" for
          each W3C requirement is under active discussion with the DID Working Group.
          Current assessments are self-reported and may not reflect a consensus definition.
        </p>
      </div>
    </div>
  </div>
</template>
