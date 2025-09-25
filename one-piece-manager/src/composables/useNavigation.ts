// src/composables/useNavigation.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NavigationSystem } from '@/utils/navigationSystem'
import { db, Task, Island, Crew } from '@/utils/database'

export function useNavigation(crewId: number, characterId: number) {
  const currentTask = ref<Task | null>(null)
  const isNavigating = ref(false)
  const navigationProgress = ref(0)
  const timeRemaining = ref(0)
  const isCompleting = ref(false)
  const conflictingTasks = ref<Task[]>([])
  const canNavigateReason = ref<string>('')
  const destinationIsland = ref<Island | null>(null)
  
  let timer: NodeJS.Timeout | null = null
  
  // ✅ COMPUTED
  const formattedTimeRemaining = computed(() => {
    return NavigationSystem.formatTime(timeRemaining.value)
  })
  
  const navigationPercentage = computed(() => {
    return Math.round(navigationProgress.value)
  })
  
  const canNavigate = computed(() => {
    return !isNavigating.value && !isCompleting.value && conflictingTasks.value.length === 0
  })
  
  const hasConflicts = computed(() => {
    return conflictingTasks.value.length > 0
  })
  
  // ✅ VERIFICAR CONFLITOS
  const checkNavigationConflicts = async () => {
    try {
      const result = await NavigationSystem.canStartNavigation(crewId)
      
      if (!result.canNavigate) {
        conflictingTasks.value = result.conflictingTasks || []
        canNavigateReason.value = result.reason || 'Não é possível navegar no momento'
        console.log('⚠️ Conflitos detectados:', result.reason)
      } else {
        conflictingTasks.value = []
        canNavigateReason.value = ''
        console.log('✅ Nenhum conflito detectado, pode navegar')
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar conflitos:', error)
      conflictingTasks.value = []
      canNavigateReason.value = 'Erro ao verificar tarefas ativas'
    }
  }
  
  // ✅ VERIFICAR STATUS DA NAVEGAÇÃO
  const checkNavigationStatus = async () => {
    try {
      // Primeiro verificar conflitos
      await checkNavigationConflicts()
      
      // Depois verificar task ativa
      const activeTask = await NavigationSystem.hasActiveNavigationTask()
      
      if (activeTask) {
        currentTask.value = activeTask
        isNavigating.value = true
        
        // Buscar informações da ilha destino
        if (activeTask.targetId) {
          const island = await db.islands.get(activeTask.targetId)
          destinationIsland.value = island || null
        }
        
        const progress = NavigationSystem.getNavigationProgress(activeTask)
        navigationProgress.value = progress.progress
        timeRemaining.value = progress.timeRemaining
        
        if (progress.isCompleted && !isCompleting.value && !activeTask.isCompleted) {
          console.log('🏝️ Navegação finalizada! Completando automaticamente...')
          await completeNavigation()
        }
      } else {
        currentTask.value = null
        isNavigating.value = false
        navigationProgress.value = 0
        timeRemaining.value = 0
        isCompleting.value = false
        destinationIsland.value = null
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar status da navegação:', error)
    }
  }
  
  // ✅ INICIAR NAVEGAÇÃO
  const startNavigation = async (): Promise<boolean> => {
    try {
      console.log('🚢 Verificando se pode iniciar navegação...')
      
      const result = await NavigationSystem.canStartNavigation(crewId)
      
      if (!result.canNavigate) {
        console.error('❌ Não é possível navegar:', result.reason)
        conflictingTasks.value = result.conflictingTasks || []
        canNavigateReason.value = result.reason || 'Não é possível navegar'
        return false
      }
      
      const task = await NavigationSystem.startNavigation(crewId, characterId)
      
      if (task) {
        currentTask.value = task
        isNavigating.value = true
        conflictingTasks.value = []
        canNavigateReason.value = ''
        
        // Buscar informações da ilha destino
        if (task.targetId) {
          const island = await db.islands.get(task.targetId)
          destinationIsland.value = island || null
        }
        
        startTimer()
        console.log('✅ Navegação iniciada com sucesso!')
        return true
      }
      
      console.error('❌ Falha ao criar task de navegação')
      return false
      
    } catch (error) {
      console.error('❌ Erro ao iniciar navegação:', error)
      return false
    }
  }
  
  // ✅ COMPLETAR NAVEGAÇÃO
const completeNavigation = async (): Promise<boolean> => {
  if (!currentTask.value || isCompleting.value) {
    return false
  }
  
  try {
    console.log('🔄 useNavigation - Completando navegação...')
    isCompleting.value = true
    
    const result = await NavigationSystem.completeNavigation(currentTask.value.id!)
    
    if (result.success) {
      console.log('✅ useNavigation - Navegação completada com sucesso!')
      console.log('📊 useNavigation - Resultado:', result)
      
      // ✅ EMITIR EVENTO COM DADOS COMPLETOS
      const completionEvent = new CustomEvent('navigationCompleted', {
        detail: {
          taskId: currentTask.value.id,
          crewId: crewId,
          destinationIsland: result.destinationIsland,
          destinationIslandId: result.destinationIslandId,
          enemyCrew: result.enemyCrew,
          enemyCrewId: result.enemyCrewId,
          battleStory: result.battleStory,
          enemyCrewSize: result.enemyCrewSize,
          encounterType: result.encounterType,
          success: true
        }
      })
      
      window.dispatchEvent(completionEvent)
      
      stopTimer()
      
      // Aguardar um pouco e verificar status novamente
      setTimeout(async () => {
        await checkNavigationStatus()
      }, 500)
      
      return true
    } else {
      console.error('❌ useNavigation - Falha ao completar navegação')
      isCompleting.value = false
      return false
    }
    
  } catch (error) {
    console.error('❌ useNavigation - Erro ao completar navegação:', error)
    isCompleting.value = false
    return false
  }
}

  
  // ✅ TIMER
  const startTimer = () => {
    if (timer) clearInterval(timer)
    
    console.log('⏰ Timer de navegação iniciado')
    
    timer = setInterval(async () => {
      await checkNavigationStatus()
    }, 1000)
  }
  
  const stopTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
      console.log('⏰ Timer de navegação parado')
    }
  }
  
  // ✅ LIFECYCLE
  onMounted(async () => {
    console.log('🔄 useNavigation montado, verificando status...')
    await checkNavigationStatus()
    
    if (isNavigating.value && currentTask.value) {
      console.log('🚢 Navegação ativa encontrada, iniciando timer...')
      startTimer()
    }
  })
  
  onUnmounted(() => {
    console.log('🔄 useNavigation desmontado, parando timer...')
    stopTimer()
  })
  
  return {
    // State
    currentTask,
    isNavigating,
    navigationProgress,
    timeRemaining,
    isCompleting,
    conflictingTasks,
    canNavigateReason,
    destinationIsland,
    
    // Computed
    formattedTimeRemaining,
    navigationPercentage,
    canNavigate,
    hasConflicts,
    
    // Methods
    startNavigation,
    completeNavigation,
    checkNavigationStatus,
    checkNavigationConflicts
  }
}