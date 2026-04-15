<script setup lang="ts">
import type { MethodEntry, GradeResult } from '@/types/method'
import { REQUIREMENTS } from '@/config/requirements'
import { getRequirementStatus } from '@/composables/useAssessment'
import { statusSymbol, statusColor } from '@/config/grading'

defineProps<{
  methods: (MethodEntry & { gradeResult: GradeResult })[]
}>()

const emit = defineEmits<{
  selectMethod: [method: string]
}>()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="matrix">
      <thead class="matrix-head">
        <tr>
          <th class="text-left matrix-sticky min-w-[180px]">
            Requirement
          </th>
          <th class="text-center w-16">Tier</th>
          <th
            v-for="m in methods"
            :key="m.method"
            class="text-center cursor-pointer hover:text-blue-400 min-w-[40px]"
            :class="m.assessed ? 'text-description' : 'text-ghost italic'"
            :title="m.assessed ? m.method : `${m.method} (not assessed)`"
            @click="emit('selectMethod', m.method)"
          >
            <span class="writing-mode-vertical text-[10px]">
              {{ m.method.replace('did:', '') }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="req in REQUIREMENTS"
          :key="req.id"
          class="matrix-row"
        >
          <td class="text-description matrix-sticky">
            <span class="text-requirement-id mr-1">{{ req.id }}</span>
            {{ req.name }}
          </td>
          <td class="text-center py-1.5 px-1">
            <span
              :class="{
                'tier-core': req.tier === 'core',
                'tier-common': req.tier === 'common',
                'tier-specialized': req.tier === 'specialized',
              }"
            >
              {{ req.tier }}
            </span>
          </td>
          <td
            v-for="m in methods"
            :key="m.method"
            class="text-center py-1.5 px-1"
            :title="`${m.method}: ${getRequirementStatus(m, req.id)}`"
          >
            <span
              class="text-sm"
              :style="{ color: statusColor(getRequirementStatus(m, req.id)) }"
            >
              {{ statusSymbol(getRequirementStatus(m, req.id)) }}
            </span>
          </td>
        </tr>

        <!-- Total row -->
        <tr class="matrix-total">
          <td class="text-secondary matrix-sticky">Total</td>
          <td></td>
          <td
            v-for="m in methods"
            :key="m.method"
            class="text-center py-2 px-1"
          >
            <span
              v-if="m.assessed"
              class="text-sm font-bold"
              :style="{ color: m.gradeResult.color }"
            >
              {{ m.gradeResult.grade }}
            </span>
            <span v-else class="text-[10px] text-ghost">?</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Legend -->
    <div class="matrix-legend">
      <span><span class="text-status-met">&#10003;</span> Met</span>
      <span><span class="text-status-partial">&#9681;</span> Partial</span>
      <span><span class="text-status-not-met">&#10007;</span> Not Met</span>
      <span><span class="text-dim">&mdash;</span> N/A</span>
      <span><span class="text-ghost">?</span> Not Assessed</span>
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
