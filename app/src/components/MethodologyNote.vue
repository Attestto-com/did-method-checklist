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
        <h4 class="methodology-note__heading">What the percentages mean</h4>
        <ul class="list-disc pl-5 space-y-1 text-xs">
          <li><strong class="text-status-met">80%+</strong> — High coverage: the method's community has documented most W3C requirements</li>
          <li><strong class="text-status-partial">50–79%</strong> — Moderate coverage: some requirements documented, others pending</li>
          <li><strong class="text-muted">1–49%</strong> — Partial coverage: assessment is in early stages</li>
          <li><strong class="text-dim">Not Assessed</strong> — No data has been submitted. This does NOT mean the method lacks features — it means nobody has filled in the self-assessment yet.</li>
        </ul>
        <p class="text-xs mt-2 text-muted">
          <strong>This tool does not grade, rank, or recommend methods.</strong>
          It helps teams understand their options by showing what each method's community has documented.
          If you are a method author and your data is missing or wrong, <a href="/self-assessment" class="link">submit a self-assessment</a>.
        </p>
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
