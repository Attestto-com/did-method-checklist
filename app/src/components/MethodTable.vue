<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MethodEntry, GradeResult } from '@/types/method'
import { REGISTRY_TYPES } from '@/config/taxonomy'
import { repoZipUrl } from '@/config/urls'

type MethodWithGrade = MethodEntry & { gradeResult: GradeResult }
type SortKey = 'method' | 'useCase' | 'category' | 'reqs' | 'lastCommit' | 'stars'

const props = defineProps<{
  methods: MethodWithGrade[]
}>()

const emit = defineEmits<{
  selectMethod: [method: string]
}>()

const sortKey = ref<SortKey>('stars')
const sortAsc = ref(false)
const page = ref(1)
const perPage = 50

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = key === 'method'
  }
  page.value = 1
}

function sortArrow(key: SortKey): string {
  if (sortKey.value !== key) return ''
  return sortAsc.value ? ' \u25B2' : ' \u25BC'
}

/** Derive primary use case from ucScores */
function primaryUseCase(m: MethodEntry): string {
  const scores = m.ucScores
  let best = ''
  let bestVal = 0
  for (const [k, v] of Object.entries(scores)) {
    if (v != null && v > bestVal) {
      bestVal = v
      best = k
    }
  }
  if (!best) return '—'
  const labels: Record<string, string> = {
    enterprise: 'Enterprise',
    education: 'Education',
    healthcare: 'Healthcare',
    legal: 'Legal',
    credentials: 'Credentials',
    communication: 'Communication',
  }
  return labels[best] ?? best
}

/** Format industries as short labels */
const INDUSTRY_LABELS: Record<string, { short: string; color: string }> = {
  'cross-border-finance': { short: 'Finance', color: 'text-emerald-400 border-emerald-400/30' },
  'banking-kyc': { short: 'Banking', color: 'text-blue-400 border-blue-400/30' },
  'defi-identity': { short: 'DeFi', color: 'text-purple-400 border-purple-400/30' },
  'government-eid': { short: 'Gov', color: 'text-amber-400 border-amber-400/30' },
  'academic-credentials': { short: 'Edu', color: 'text-cyan-400 border-cyan-400/30' },
  'patient-health': { short: 'Health', color: 'text-red-400 border-red-400/30' },
  'messaging': { short: 'Comms', color: 'text-green-400 border-green-400/30' },
  'supply-chain': { short: 'Supply', color: 'text-orange-400 border-orange-400/30' },
  'social-media': { short: 'Social', color: 'text-pink-400 border-pink-400/30' },
  'iot-devices': { short: 'IoT', color: 'text-teal-400 border-teal-400/30' },
  'enterprise': { short: 'Enterprise', color: 'text-indigo-400 border-indigo-400/30' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return dateStr.slice(0, 10)
}

function formatStars(n: number | null): string {
  if (n == null || n === 0) return '—'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

const sorted = computed(() => {
  const list = [...props.methods]
  const dir = sortAsc.value ? 1 : -1

  list.sort((a, b) => {
    switch (sortKey.value) {
      case 'method':
        return dir * a.method.localeCompare(b.method)
      case 'useCase':
        return dir * primaryUseCase(a).localeCompare(primaryUseCase(b))
      case 'category':
        return dir * a.registryType.localeCompare(b.registryType)
      case 'reqs':
        return dir * (a.reqMet.length - b.reqMet.length)
      case 'lastCommit': {
        const da = a.lastCommit ? new Date(a.lastCommit).getTime() : 0
        const db = b.lastCommit ? new Date(b.lastCommit).getTime() : 0
        return dir * (da - db)
      }
      case 'stars':
        return dir * ((a.stars ?? 0) - (b.stars ?? 0))
      default:
        return 0
    }
  })

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / perPage)))
const paged = computed(() => {
  const start = (page.value - 1) * perPage
  return sorted.value.slice(start, start + perPage)
})
</script>

<template>
  <div class="layout-card-content">
    <div class="table-wrapper">
      <table class="table">
        <thead class="table-head">
          <tr>
            <th class="text-center w-10">#</th>
            <th
              class="sortable sticky left-0 z-10"
              style="background: rgba(31, 41, 55, 0.8);"
              @click="toggleSort('method')"
            >
              Method{{ sortArrow('method') }}
            </th>
            <th class="sortable" @click="toggleSort('useCase')">
              Use Case{{ sortArrow('useCase') }}
            </th>
            <th class="sortable" @click="toggleSort('category')">
              Category{{ sortArrow('category') }}
            </th>
            <th>Industries</th>
            <th
              class="sortable text-center"
              title="Self-reported requirement claims — not verified"
              @click="toggleSort('reqs')"
            >
              Reqs Claimed{{ sortArrow('reqs') }}
            </th>
            <th class="text-center">Spec</th>
            <th class="text-center">Repo</th>
            <th class="sortable" @click="toggleSort('lastCommit')">
              Last Activity{{ sortArrow('lastCommit') }}
            </th>
            <th class="sortable text-right" @click="toggleSort('stars')">
              Stars{{ sortArrow('stars') }}
            </th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr
            v-for="(m, idx) in paged"
            :key="m.method"
            class="table-row"
            @click="emit('selectMethod', m.method)"
          >
            <!-- Row number -->
            <td class="table-cell-rank">
              {{ (page - 1) * perPage + idx + 1 }}
            </td>

            <!-- Method -->
            <td class="sticky left-0 z-10" style="background: var(--color-bg-base);">
              <span class="text-method-name">{{ m.method }}</span>
            </td>

            <!-- Use Case -->
            <td class="text-description text-xs">
              {{ primaryUseCase(m) }}
            </td>

            <!-- Category -->
            <td>
              <span class="badge-category">
                {{ REGISTRY_TYPES[m.registryType]?.label ?? m.registryType }}
              </span>
            </td>

            <!-- Industries -->
            <td>
              <div class="flex flex-wrap gap-1 max-w-[200px]">
                <template v-if="m.industries.length > 0">
                  <span
                    v-for="ind in m.industries.slice(0, 3)"
                    :key="ind"
                    class="badge-industry"
                    :class="INDUSTRY_LABELS[ind]?.color ?? 'text-gray-300 border-gray-600'"
                  >
                    {{ INDUSTRY_LABELS[ind]?.short ?? ind }}
                  </span>
                  <span v-if="m.industries.length > 3" class="text-muted text-[10px]">
                    +{{ m.industries.length - 3 }}
                  </span>
                </template>
                <span v-else class="table-cell-empty">—</span>
              </div>
            </td>

            <!-- Reqs Claimed -->
            <td class="text-center">
              <template v-if="m.reqMet.length > 0">
                <span class="text-secondary">{{ m.reqMet.length }}</span>
                <span class="text-dim">/22</span>
              </template>
              <span v-else class="table-cell-empty">—</span>
            </td>

            <!-- Spec -->
            <td class="text-center">
              <a
                v-if="m.specUrl"
                :href="m.specUrl"
                target="_blank"
                class="table-cell-link hover:text-blue-300"
                @click.stop
              >
                View &rarr;
              </a>
              <span v-else class="table-cell-empty">—</span>
            </td>

            <!-- Repo Download -->
            <td class="text-center">
              <a
                v-if="repoZipUrl(m.repoUrl)"
                :href="repoZipUrl(m.repoUrl)!"
                class="table-cell-link text-status-met hover:text-green-300"
                download
                @click.stop
              >
                &#8681; ZIP
              </a>
              <span v-else class="table-cell-empty">—</span>
            </td>

            <!-- Last Activity -->
            <td>
              <span
                class="text-xs"
                :class="m.lastCommit ? 'text-description' : 'text-dim'"
              >
                {{ formatDate(m.lastCommit) }}
              </span>
            </td>

            <!-- Stars -->
            <td class="text-right">
              <span v-if="m.stars != null && m.stars > 0" class="text-xs text-description">
                &#9734; {{ formatStars(m.stars) }}
              </span>
              <span v-else class="table-cell-empty">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        class="pagination__btn"
        :disabled="page <= 1"
        @click="page--"
      >
        &larr; Prev
      </button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button
        class="pagination__btn"
        :disabled="page >= totalPages"
        @click="page++"
      >
        Next &rarr;
      </button>
    </div>
  </div>
</template>
