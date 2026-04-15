import { ref, computed } from 'vue'
import type { MethodEntry, RegistryType, LifecycleStatus } from '@/types/method'

/**
 * Filtering and search composable for the method list.
 */
export function useFilters<T extends MethodEntry>(methods: () => T[]) {
  const search = ref('')
  const categoryFilter = ref<RegistryType | 'all'>('all')
  const lifecycleFilter = ref<LifecycleStatus | 'all'>('all')
  const assessedOnly = ref(false)

  const filtered = computed(() => {
    let result = methods()

    // Text search
    if (search.value.trim()) {
      const q = search.value.toLowerCase().trim()
      result = result.filter(m =>
        m.method.toLowerCase().includes(q)
        || (m.abstract?.toLowerCase().includes(q))
        || (m.blockchain?.toLowerCase().includes(q))
      )
    }

    // Category
    if (categoryFilter.value !== 'all') {
      result = result.filter(m => m.registryType === categoryFilter.value)
    }

    // Lifecycle
    if (lifecycleFilter.value !== 'all') {
      result = result.filter(m => m.maturity.lifecycle === lifecycleFilter.value)
    }

    // Assessed only
    if (assessedOnly.value) {
      result = result.filter(m => m.assessed)
    }

    return result
  })

  function reset() {
    search.value = ''
    categoryFilter.value = 'all'
    lifecycleFilter.value = 'all'
    assessedOnly.value = false
  }

  return {
    search,
    categoryFilter,
    lifecycleFilter,
    assessedOnly,
    filtered,
    reset,
  }
}
