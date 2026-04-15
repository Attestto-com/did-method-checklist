<script setup lang="ts">
import type { MethodEntry } from '@/types/method'
import { FEATURE_DEFINITIONS } from '@/config/taxonomy'

defineProps<{
  methods: MethodEntry[]
}>()

function featureDisplay(val: boolean | null): { symbol: string; color: string } {
  if (val === null) return { symbol: '?', color: 'var(--color-text-dim)' }
  if (val) return { symbol: '\u2713', color: 'var(--color-green)' }
  return { symbol: '\u2717', color: 'var(--color-red)' }
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="matrix">
      <thead class="matrix-head">
        <tr>
          <th class="text-left matrix-sticky min-w-[140px]">
            Feature
          </th>
          <th
            v-for="m in methods"
            :key="m.method"
            class="text-center min-w-[40px] text-description"
          >
            <span class="writing-mode-vertical text-[10px]">
              {{ m.method.replace('did:', '') }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="feat in FEATURE_DEFINITIONS"
          :key="feat.key"
          class="matrix-row"
        >
          <td class="text-description matrix-sticky" :title="feat.description">
            {{ feat.label }}
          </td>
          <td
            v-for="m in methods"
            :key="m.method"
            class="text-center py-1.5 px-1"
          >
            <span
              class="text-sm"
              :style="{ color: featureDisplay(m.feat[feat.key as keyof typeof m.feat]).color }"
            >
              {{ featureDisplay(m.feat[feat.key as keyof typeof m.feat]).symbol }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="matrix-legend">
      <span><span class="text-status-met">&#10003;</span> Supported</span>
      <span><span class="text-status-not-met">&#10007;</span> Not Supported</span>
      <span><span class="text-dim">?</span> No Data</span>
    </div>
  </div>
</template>

<style scoped>
.writing-mode-vertical {
  writing-mode: vertical-lr;
  text-orientation: mixed;
  transform: rotate(180deg);
  white-space: nowrap;
}
</style>
