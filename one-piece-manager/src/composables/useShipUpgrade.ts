// src/composables/useShipUpgrade.ts

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ShipUpgradeSystem } from '@/utils/shipUpgradeSystem'
import type { Task, Ship, Character } from '@/utils/database'
import type { Ref, ComputedRef } from 'vue'

export function useShipUpgrade(
  ship: Ref<Ship | null> | ComputedRef<Ship | null>, 
  character: Ref<Character | null> | ComputedRef<Character | null>
) {
  // ✅ REFS PARA ESTADOS
  const currentTask = ref<Task | null>(null)
  const isUpgrading = ref<boolean>(false)
  const upgradeProgress = ref<number>(0)
  const timeRemaining = ref<number>(0)
  const isCompleting = ref<boolean>(false)
  const isInitialized = ref<boolean>(false)
  
  let timer: NodeJS.Timeout | null = null
  
  // ✅ COMPUTED
  const formattedTimeRemaining = computed(() => {
    return ShipUpgradeSystem.formatTime(timeRemaining.value)
  })
  
  const upgradePercentage = computed(() => {
    return Math.round(upgradeProgress.value)
  })
  
  // ✅ COMPUTED PARA VERIFICAR SE PODE FAZER UPGRADE
  const canUpgrade = computed(() => {
    if (!ship.value || !character.value || !isInitialized.value) {
      console.log('🔧 useShipUpgrade - Dados não disponíveis:', {
        ship: !!ship.value,
        character: !!character.value,
        initialized: isInitialized.value
      })
      return false
    }

    const shipNotUpgrading = !isUpgrading.value && !isCompleting.value
    const shipNotMaxLevel = ship.value.level < 5
    const captainLevelAllows = ship.value.level < ShipUpgradeSystem.determineShipLevel(character.value.level)

    const result = shipNotUpgrading && shipNotMaxLevel && captainLevelAllows

    console.log('🔧 useShipUpgrade - canUpgrade check:', {
      shipLevel: ship.value.level,
      captainLevel: character.value.level,
      maxAllowed: ShipUpgradeSystem.determineShipLevel(character.value.level),
      shipNotUpgrading,
      shipNotMaxLevel,
      captainLevelAllows,
      result
    })

    return result
  })

  // ✅ COMPUTED PARA INFO DE UPGRADE
  const upgradeInfo = computed(() => {
    if (!ship.value || !character.value) {
      return {
        canUpgrade: false,
        reason: 'Dados não disponíveis',
        maxAllowedLevel: 1,
        nextRequiredLevel: 10
      }
    }
    
    const maxAllowed = ShipUpgradeSystem.determineShipLevel(character.value.level)
    const currentLevel = ship.value.level
    
    if (currentLevel >= 5) {
      return {
        canUpgrade: false,
        reason: 'Navio já está no nível máximo',
        maxAllowedLevel: maxAllowed,
        nextRequiredLevel: null
      }
    }
    
    if (currentLevel >= maxAllowed) {
      const nextLevelRequirements = [
        { level: 2, required: 10 },
        { level: 3, required: 30 },
        { level: 4, required: 60 },
        { level: 5, required: 80 }
      ]
      
      const nextReq = nextLevelRequirements.find(req => req.level > currentLevel)
      
      return {
        canUpgrade: false,
        reason: `Capitão precisa estar no level ${nextReq?.required || 80}`,
        maxAllowedLevel: maxAllowed,
        nextRequiredLevel: nextReq?.required || null
      }
    }
    
    if (isUpgrading.value || isCompleting.value) {
      return {
        canUpgrade: false,
        reason: 'Upgrade em andamento',
        maxAllowedLevel: maxAllowed,
        nextRequiredLevel: null
      }
    }
    
    return {
      canUpgrade: true,
      reason: 'Pode fazer upgrade',
      maxAllowedLevel: maxAllowed,
      nextRequiredLevel: null
    }
  })
  
  // ✅ VERIFICAR STATUS DO UPGRADE
  const checkUpgradeStatus = async (): Promise<void> => {
    if (!ship.value) {
      console.log('⚠️ useShipUpgrade - Ship não disponível para verificar status')
      return
    }
    
    try {
      console.log('🔄 useShipUpgrade - Verificando status do upgrade...')
      
      // Usar crewId em vez de ship.id
      const crewId = ship.value.crewId
      const activeTask = await ShipUpgradeSystem.hasActiveUpgradeTask(ship.value.id)
      
      console.log('🔍 useShipUpgrade - Task ativa encontrada:', !!activeTask, activeTask?.type)
      
      if (activeTask) {
        currentTask.value = activeTask
        isUpgrading.value = true
        
        const progress = ShipUpgradeSystem.getUpgradeProgress(activeTask)
        upgradeProgress.value = progress.progress
        timeRemaining.value = progress.timeRemaining
        
        console.log('📊 useShipUpgrade - Progresso:', {
          progress: progress.progress,
          timeRemaining: progress.timeRemaining,
          isCompleted: progress.isCompleted
        })
        
        if (progress.isCompleted && !isCompleting.value && !activeTask.isCompleted) {
          console.log('🔧 useShipUpgrade - Upgrade finalizado! Completando automaticamente...')
          await completeUpgrade()
        }
      } else {
        console.log('✅ useShipUpgrade - Nenhuma task ativa encontrada')
        currentTask.value = null
        isUpgrading.value = false
        upgradeProgress.value = 0
        timeRemaining.value = 0
        isCompleting.value = false
      }
      
      if (!isInitialized.value) {
        isInitialized.value = true
        console.log('✅ useShipUpgrade - Composable inicializado')
      }
      
    } catch (error) {
      console.error('❌ useShipUpgrade - Erro ao verificar status do upgrade:', error)
      if (!isInitialized.value) {
        isInitialized.value = true
      }
    }
  }
  
  // ✅ INICIAR UPGRADE
  const startUpgrade = async (): Promise<boolean> => {
    if (!ship.value || !character.value) {
      console.error('❌ useShipUpgrade - Dados não disponíveis para iniciar upgrade')
      return false
    }
    
    try {
      console.log('🔧 useShipUpgrade - Iniciando upgrade do navio...')
      
      // Verificar se pode fazer upgrade usando a nova lógica
      if (!canUpgrade.value) {
        console.log('❌ useShipUpgrade - Não é possível fazer upgrade:', upgradeInfo.value.reason)
        return false
      }
      
      const task = await ShipUpgradeSystem.startShipUpgrade(ship.value, character.value.id!)
      
      if (task) {
        currentTask.value = task
        isUpgrading.value = true
        startTimer()
        console.log('✅ useShipUpgrade - Upgrade iniciado com sucesso!')
        return true
      }
      
      console.error('❌ useShipUpgrade - Falha ao criar task de upgrade')
      return false
      
    } catch (error) {
      console.error('❌ useShipUpgrade - Erro ao iniciar upgrade:', error)
      return false
    }
  }
  
  // ✅ COMPLETAR UPGRADE
  const completeUpgrade = async (): Promise<boolean> => {
    if (!currentTask.value || isCompleting.value) {
      console.log('⚠️ useShipUpgrade - Não é possível completar upgrade:', {
        hasTask: !!currentTask.value,
        isCompleting: isCompleting.value
      })
      return false
    }
    
    try {
      console.log('🔄 useShipUpgrade - Completando upgrade...')
      isCompleting.value = true
      
      const result = await ShipUpgradeSystem.completeShipUpgrade(currentTask.value.id!)
      
      if (result.success) {
        console.log('✅ useShipUpgrade - Upgrade completado com sucesso!')
        
        // Emitir evento personalizado
        const completionEvent = new CustomEvent('shipUpgradeCompleted', {
          detail: { 
            taskId: currentTask.value.id,
            newLevel: result.newLevel,
            ship: result.ship
          }
        })
        
        window.dispatchEvent(completionEvent)
        
        stopTimer()
        
        // Aguardar um pouco e verificar status novamente
        setTimeout(async () => {
          await checkUpgradeStatus()
        }, 500)
        
        return true
      } else {
        console.error('❌ useShipUpgrade - Falha ao completar upgrade')
        isCompleting.value = false
        return false
      }
      
    } catch (error) {
      console.error('❌ useShipUpgrade - Erro ao completar upgrade:', error)
      isCompleting.value = false
      return false
    }
  }
  
  // ✅ CANCELAR UPGRADE
  const cancelUpgrade = async (): Promise<boolean> => {
    if (!currentTask.value) {
      console.log('⚠️ useShipUpgrade - Nenhuma task para cancelar')
      return false
    }
    
    try {
      console.log('�� useShipUpgrade - Cancelando upgrade...')
      
      const success = await ShipUpgradeSystem.cancelShipUpgrade(currentTask.value.id!)
      
      if (success) {
        stopTimer()
        await checkUpgradeStatus()
                console.log('✅ useShipUpgrade - Upgrade cancelado com sucesso')
        return true
      }
      
      console.error('❌ useShipUpgrade - Falha ao cancelar upgrade')
      return false
      
    } catch (error) {
      console.error('❌ useShipUpgrade - Erro ao cancelar upgrade:', error)
      return false
    }
  }
  
  // ✅ TIMER
  const startTimer = (): void => {
    if (timer) clearInterval(timer)
    
    console.log('⏰ useShipUpgrade - Iniciando timer de verificação')
    timer = setInterval(async () => {
      await checkUpgradeStatus()
    }, 1000)
  }
  
  const stopTimer = (): void => {
    if (timer) {
      console.log('⏰ useShipUpgrade - Parando timer de verificação')
      clearInterval(timer)
      timer = null
    }
  }
  
  // ✅ WATCHERS - Reagir a mudanças no ship e character
  watch([ship, character], async ([newShip, newCharacter]) => {
    console.log('👀 useShipUpgrade - Dados mudaram:', {
      ship: !!newShip,
      character: !!newCharacter,
      shipId: newShip?.id,
      characterId: newCharacter?.id
    })
    
    if (newShip && newCharacter) {
      await checkUpgradeStatus()
      
      // Se há uma task ativa, iniciar timer
      if (currentTask.value && !timer) {
        startTimer()
      }
    } else {
      stopTimer()
      // Reset states quando não há ship ou character
      currentTask.value = null
      isUpgrading.value = false
      upgradeProgress.value = 0
      timeRemaining.value = 0
      isCompleting.value = false
      isInitialized.value = false
    }
  }, { immediate: true, deep: true })
  
  // ✅ LIFECYCLE
  onMounted(async () => {
    console.log('🚀 useShipUpgrade - Composable montado')
    // O watch já vai cuidar da inicialização
  })
  
  onUnmounted(() => {
    console.log('💀 useShipUpgrade - Composable desmontado')
    stopTimer()
  })
  
  return {
    // State
    currentTask,
    isUpgrading,
    upgradeProgress,
    timeRemaining,
    isCompleting,
    isInitialized,
    
    // Computed
    formattedTimeRemaining,
    upgradePercentage,
    canUpgrade,
    upgradeInfo,
    
    // Methods
    startUpgrade,
    completeUpgrade,
    cancelUpgrade,
    checkUpgradeStatus
  }
}