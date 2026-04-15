<script setup lang="ts">
import { ref } from 'vue'
import type { PromptEntry } from '@/config/prompts'

const props = defineProps<{ prompt: PromptEntry }>()

const expanded = ref(false)
const content = ref('')
const copied = ref(false)
const loading = ref(false)

async function loadContent() {
  if (content.value) return
  loading.value = true
  try {
    const base = import.meta.env.BASE_URL
    const res = await fetch(`${base}${props.prompt.file.replace(/^\//, '')}`)
    content.value = await res.text()
  } catch {
    content.value = 'Failed to load prompt.'
  } finally {
    loading.value = false
  }
}

function toggle() {
  expanded.value = !expanded.value
  if (expanded.value) loadContent()
}

function copy() {
  navigator.clipboard.writeText(content.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div
    class="prompt-card rounded-lg border transition-colors"
    :class="[
      prompt.isContext ? 'prompt-card--context' : 'prompt-card--default',
      expanded ? 'border-gray-600' : (prompt.isContext ? 'border-amber-400/20' : 'border-gray-700'),
    ]"
  >
    <!-- Header -->
    <button
      class="card-collapsible__trigger"
      @click="toggle"
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold" :class="prompt.color.split(' ')[0]">{{ prompt.title }}</h3>
          <span v-if="prompt.isContext" class="prompt-card__required-badge">Required</span>
        </div>
        <p class="text-help mt-0.5">{{ prompt.description }}</p>
      </div>
      <span class="text-muted text-sm ml-3 shrink-0 transition-transform" :class="expanded ? 'rotate-180' : ''">
        &#9660;
      </span>
    </button>

    <!-- Collapsible body -->
    <div v-if="expanded" class="prompt-card__body">
      <div v-if="loading" class="px-5 py-6 text-center state-loading" style="padding-top: 1.5rem; padding-bottom: 1.5rem;">Loading prompt...</div>
      <template v-else>
        <div class="flex justify-end px-5 pt-3">
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="copied ? 'btn-success' : 'btn-primary'"
            @click.stop="copy"
          >{{ copied ? 'Copied!' : 'Copy Prompt' }}</button>
        </div>
        <pre class="prompt-card__content">{{ content }}</pre>
      </template>
    </div>
  </div>
</template>
