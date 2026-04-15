<script setup lang="ts">
import type { MethodEntry, GradeResult } from '@/types/method'
import { LIFECYCLE_STATUSES, REGISTRY_TYPES } from '@/config/taxonomy'
import { countMet, countPartial, countAssessed } from '@/config/grading'
import { TOTAL_REQUIREMENTS } from '@/config/requirements'

const props = defineProps<{
  method: MethodEntry & { gradeResult: GradeResult }
}>()

const emit = defineEmits<{
  select: [method: string]
}>()

const lifecycle = LIFECYCLE_STATUSES[props.method.maturity.lifecycle]
const category = REGISTRY_TYPES[props.method.registryType]
</script>

<template>
  <div
    class="rounded-lg border border-gray-700 bg-gray-800/50 p-4 cursor-pointer hover:border-gray-500 transition-colors"
    @click="emit('select', method.method)"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-mono font-semibold text-sm text-gray-100">{{ method.method }}</h3>
      <div
        v-if="method.assessed"
        class="text-lg font-bold"
        :style="{ color: method.gradeResult.color }"
      >
        {{ method.gradeResult.grade }}
      </div>
      <span v-else class="text-xs text-gray-500 italic">Not Assessed</span>
    </div>

    <!-- Abstract -->
    <p v-if="method.abstract" class="text-xs text-gray-400 mb-3 line-clamp-2">
      {{ method.abstract }}
    </p>

    <!-- Badges -->
    <div class="flex flex-wrap gap-1.5 mb-3">
      <span
        class="text-[10px] px-1.5 py-0.5 rounded-full border"
        :style="{ borderColor: lifecycle.color + '40', color: lifecycle.color }"
      >
        {{ lifecycle.label }}
      </span>
      <span class="text-[10px] px-1.5 py-0.5 rounded-full border border-gray-600 text-gray-400">
        {{ category.label }}
      </span>
    </div>

    <!-- Stats (only for assessed methods) -->
    <div v-if="method.assessed" class="grid grid-cols-3 gap-2 text-center">
      <div>
        <div class="text-sm font-semibold text-gray-200">{{ countMet(method) }}</div>
        <div class="text-[10px] text-gray-500">Met</div>
      </div>
      <div>
        <div class="text-sm font-semibold text-yellow-400">{{ countPartial(method) }}</div>
        <div class="text-[10px] text-gray-500">Partial</div>
      </div>
      <div>
        <div class="text-sm font-semibold text-gray-400">{{ TOTAL_REQUIREMENTS - countAssessed(method) }}</div>
        <div class="text-[10px] text-gray-500">Pending</div>
      </div>
    </div>

    <!-- Not assessed message -->
    <p v-else class="text-[10px] text-gray-500 italic text-center py-2">
      No community assessment submitted yet.
      This does not mean the method lacks features.
    </p>

    <!-- Spec link -->
    <div v-if="method.specUrl" class="mt-2 pt-2 border-t border-gray-700">
      <a
        :href="method.specUrl"
        target="_blank"
        class="text-[10px] text-blue-400 hover:underline"
        @click.stop
      >
        View specification &rarr;
      </a>
    </div>
  </div>
</template>
