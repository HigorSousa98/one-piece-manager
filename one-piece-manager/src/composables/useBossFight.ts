// src/composables/useBossFight.ts
import { computed, onMounted, watch } from 'vue'
import { useBossFightStore } from '@/stores/bossFightStore'
import type { DetectedBoss } from '@/utils/bossDetectionSystem' 

export function useBossFight(playerCrewId: number, currentIslandId: number) {
  const bossFightStore = useBossFightStore()

  // ✅ COMPUTED PROPERTIES
  const detectedBosses = computed(() => bossFightStore.detectedBosses)
  const currentBossFight = computed(() => bossFightStore.currentBossFight)
  const nextOpponent = computed(() => bossFightStore.nextOpponent)
  const availableMembers = computed(() => bossFightStore.availableMembers)
  const loading = computed(() => bossFightStore.loading)
  const error = computed(() => bossFightStore.error)
  const hasBossesOnIsland = computed(() => bossFightStore.hasBossesOnIsland)
  const hasActiveBossFight = computed(() => bossFightStore.hasActiveBossFight)
  const currentBattleProgress = computed(() => bossFightStore.currentBattleProgress)
  const bossType = computed(() => bossFightStore.bossType)
  const canSelectFighter = computed(() => bossFightStore.canSelectFighter)

  // ✅ METHODS
  const detectBosses = async () => {
    await bossFightStore.detectBossesOnIsland(currentIslandId)
  }

  const checkActiveFight = async () => {
    await bossFightStore.checkActiveBossFight(playerCrewId)
  }

  const startBossFight = async (detectedBoss: DetectedBoss) => {
    return await bossFightStore.startBossFight(playerCrewId, detectedBoss)
  }

  const executeBattle = async (playerCharacterId: number) => {
    return await bossFightStore.executeBattle(playerCharacterId)
  }

  const clearState = () => {
    bossFightStore.clearState()
  }

  // ✅ WATCHERS
  watch(() => currentIslandId, async (newIslandId) => {
    if (newIslandId) {
      await detectBosses()
    }
  }, { immediate: true })

  // ✅ LIFECYCLE
  onMounted(async () => {
    await checkActiveFight()
    if (currentIslandId) {
      await detectBosses()
    }
  })

  return {
    // State
    detectedBosses,
    currentBossFight,
    nextOpponent,
    availableMembers,
    loading,
    error,
    
    // Getters
    hasBossesOnIsland,
    hasActiveBossFight,
    currentBattleProgress,
    bossType,
    canSelectFighter,
    
    // Methods
    detectBosses,
    checkActiveFight,
    startBossFight,
    executeBattle,
    clearState
  }
}