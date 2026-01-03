// src/composables/useAvatarManager.ts

import { ref, computed, onUnmounted } from 'vue'
import { AvatarCacheSystem } from '@/utils/avatarCacheSystem'
import { AvatarGenerationSystem } from '@/utils/avatarGenerationSystem'
import type { Character } from '@/utils/database'

export function useAvatarManager() {
  // ✅ STATE
  const loadingAvatars = ref(new Set<number>())
  const errorAvatars = ref(new Set<number>())
  const cacheStats = ref({
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    missRate: 0,
    averageAccessTime: 0,
  })

  // ✅ COMPUTED
  const isLoading = computed(() => loadingAvatars.value.size > 0)
  const hasErrors = computed(() => errorAvatars.value.size > 0)
  const formattedCacheSize = computed(() => {
    const size = cacheStats.value.totalSize
    if (size > 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`
    } else if (size > 1024) {
      return `${(size / 1024).toFixed(2)} KB`
    }
    return `${size} bytes`
  })

  // ✅ METHODS
  const loadAvatar = async (
    character: Character,
    forceRegenerate = false,
  ): Promise<string | null> => {
    const characterId = character.id!

    try {
      loadingAvatars.value.add(characterId)
      errorAvatars.value.delete(characterId)

      let svgData: string | null = null

      if (!forceRegenerate) {
        svgData = await AvatarCacheSystem.getFromCache(characterId)
      }

      if (!svgData) {
        svgData = await AvatarGenerationSystem.getAvatarByCharacterId(characterId)

        if (!svgData || forceRegenerate) {
          const avatar = await AvatarGenerationSystem.generateAvatar(character)
          svgData = avatar.svgData
        }

        if (svgData) {
          await AvatarCacheSystem.addToCache(characterId, svgData)
        }
      }

      return svgData
    } catch (error) {
      console.error(`❌ Erro ao carregar avatar ${characterId}:`, error)
      errorAvatars.value.add(characterId)
      return null
    } finally {
      loadingAvatars.value.delete(characterId)
    }
  }

  const regenerateAvatar = async (character: Character): Promise<string | null> => {
    const characterId = character.id!

    try {
      loadingAvatars.value.add(characterId)
      errorAvatars.value.delete(characterId)

      AvatarCacheSystem.removeFromCache(characterId)
      const avatar = await AvatarGenerationSystem.regenerateAvatar(characterId)

      if (avatar) {
        await AvatarCacheSystem.addToCache(characterId, avatar.svgData)
        return avatar.svgData
      }

      return null
    } catch (error) {
      console.error(`❌ Erro ao regenerar avatar ${characterId}:`, error)
      errorAvatars.value.add(characterId)
      return null
    } finally {
      loadingAvatars.value.delete(characterId)
    }
  }

  const preloadAvatars = async (characters: Character[]): Promise<void> => {
    const characterIds = characters.map((c) => c.id!).filter(Boolean)
    await AvatarCacheSystem.preloadAvatars(characterIds)
  }

  const updateCacheStats = async (): Promise<void> => {
    cacheStats.value = await AvatarCacheSystem.getStats()
  }

  const clearCache = async (): Promise<void> => {
    await AvatarCacheSystem.clearAll()
    await updateCacheStats()
  }

  const isAvatarLoading = (characterId: number): boolean => {
    return loadingAvatars.value.has(characterId)
  }

  const hasAvatarError = (characterId: number): boolean => {
    return errorAvatars.value.has(characterId)
  }

  // ✅ LIFECYCLE
  onUnmounted(() => {
    loadingAvatars.value.clear()
    errorAvatars.value.clear()
  })

  return {
    // State
    isLoading,
    hasErrors,
    cacheStats,
    formattedCacheSize,

    // Methods
    loadAvatar,
    regenerateAvatar,
    preloadAvatars,
    updateCacheStats,
    clearCache,
    isAvatarLoading,
    hasAvatarError,
  }
}
