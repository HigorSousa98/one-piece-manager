// src/composables/useAvatarManager.ts
import { ref, computed } from 'vue'
import { AvataaarsCache } from '@/utils/avataaarsCache'

export function useAvatarManager() {
  const isLoading = ref(false)
  const cacheStats = ref({
    totalEntries: 0,
    totalSize: '0 KB',
    oldestEntry: null as Date | null,
    mostAccessed: null as any,
  })

  const updateCacheStats = async () => {
    cacheStats.value = await AvataaarsCache.getStats()
  }

  const clearCache = async () => {
    await AvataaarsCache.clearCache()
    await updateCacheStats()
  }

  return {
    isLoading: computed(() => isLoading.value),
    cacheStats: computed(() => cacheStats.value),
    updateCacheStats,
    clearCache,
  }
}
