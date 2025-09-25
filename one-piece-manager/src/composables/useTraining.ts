// src/composables/useTraining.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TrainingSystem } from '@/utils/trainingSystem'
import type { Task } from '@/utils/database'

export function useTraining(crewId: number, characterId: number) {
  const currentTask = ref<Task | null>(null)
  const isTraining = ref(false)
  const trainingProgress = ref(0)
  const timeRemaining = ref(0)
  const isCompleting = ref(false) // ✅ NOVO: Estado para evitar múltiplas execuções
  
  let timer: NodeJS.Timeout | null = null
  
  // ✅ COMPUTED
  const formattedTimeRemaining = computed(() => {
    return TrainingSystem.formatTime(timeRemaining.value)
  })
  
  const trainingPercentage = computed(() => {
    return Math.round(trainingProgress.value)
  })
  
  const canTrain = computed(() => {
    return !isTraining.value && !isCompleting.value
  })
  
  const currentIntensity = computed(() => {
    if (!currentTask.value) return null
    
    // Extrair intensidade da duração da task
    const startTime = new Date(currentTask.value.startTime)
    const endTime = new Date(currentTask.value.endTime)
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60000
    
    if (durationMinutes <= 1) return 1
    if (durationMinutes <= 5) return 5
    return 10
  })
  
  // ✅ METHODS
  const checkTrainingStatus = async () => {
    try {
      const activeTask = await TrainingSystem.hasActiveTrainingTask()
      
      if (activeTask) {
        currentTask.value = activeTask
        isTraining.value = true
        
        const progress = TrainingSystem.getTaskProgress(activeTask)
        trainingProgress.value = progress.progress
        timeRemaining.value = progress.timeRemaining
        
        // ✅ CORREÇÃO: Se a task está completa E não está sendo processada, finalizar
        if (progress.isCompleted && !isCompleting.value && !activeTask.isCompleted) {
          console.log('⏰ Tempo de treino finalizado! Completando automaticamente...')
          await completeTraining()
        }
      } else {
        // ✅ Se não há task ativa, resetar estados
        currentTask.value = null
        isTraining.value = false
        trainingProgress.value = 0
        timeRemaining.value = 0
        isCompleting.value = false
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar status do treino:', error)
    }
  }
  
  const startTraining = async (intensity: 1 | 5 | 10): Promise<boolean> => {
    try {
      console.log(`🏋️ Iniciando treino com intensidade ${intensity}x...`)
      
      const task = await TrainingSystem.startTraining(crewId, characterId, intensity)
      
      if (task) {
        currentTask.value = task
        isTraining.value = true
        startTimer()
        console.log('✅ Treino iniciado com sucesso!')
        return true
      }
      
      console.error('❌ Falha ao criar task de treino')
      return false
      
    } catch (error) {
      console.error('❌ Erro ao iniciar treino:', error)
      return false
    }
  }
  
  const completeTraining = async (): Promise<boolean> => {
    if (!currentTask.value || isCompleting.value) {
      console.log('⚠️ Nenhuma task para completar ou já está sendo processada')
      return false
    }
    
    try {
      console.log('🔄 Iniciando finalização do treino...')
      isCompleting.value = true
      
      const success = await TrainingSystem.completeTraining(currentTask.value.id!)
      
      if (success) {
        console.log('✅ Treino completado com sucesso!')
        
        // ✅ Emitir evento personalizado para notificar conclusão
        const completionEvent = new CustomEvent('trainingCompleted', {
          detail: { 
            crewId, 
            taskId: currentTask.value.id,
            experience: currentTask.value.experienceReward,
            intensity: currentIntensity.value
          }
        })
        
        window.dispatchEvent(completionEvent)
        console.log('📢 Evento trainingCompleted emitido:', completionEvent.detail)
        
        // ✅ Parar timer e resetar estados
        stopTimer()
        
        // ✅ Aguardar um pouco antes de verificar status novamente
        setTimeout(async () => {
          await checkTrainingStatus()
        }, 500)
        
        return true
      } else {
        console.error('❌ Falha ao completar treino no sistema')
        isCompleting.value = false
        return false
      }
      
    } catch (error) {
      console.error('❌ Erro ao completar treino:', error)
      isCompleting.value = false
      return false
    }
  }
  
  const cancelTraining = async (): Promise<boolean> => {
    if (!currentTask.value) return false
    
    try {
      console.log('🛑 Cancelando treino...')
      
      const success = await TrainingSystem.cancelTraining(currentTask.value.id!)
      
      if (success) {
        stopTimer()
        await checkTrainingStatus()
        console.log('✅ Treino cancelado com sucesso')
        return true
      }
      
      return false
      
    } catch (error) {
      console.error('❌ Erro ao cancelar treino:', error)
      return false
    }
  }
  
  const startTimer = () => {
    if (timer) clearInterval(timer)
    
    console.log('⏰ Timer de treino iniciado')
    
    timer = setInterval(async () => {
      await checkTrainingStatus()
    }, 1000) // Verificar a cada segundo
  }
  
  const stopTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
      console.log('⏰ Timer de treino parado')
    }
  }
  
  // ✅ LIFECYCLE
  onMounted(async () => {
    console.log('🔄 useTraining montado, verificando status...')
    await checkTrainingStatus()
    
    if (isTraining.value && currentTask.value) {
      console.log('🏋️ Treino ativo encontrado, iniciando timer...')
      startTimer()
    }
  })
  
  onUnmounted(() => {
    console.log('🔄 useTraining desmontado, parando timer...')
    stopTimer()
  })
  
  return {
    // State
    currentTask,
    isTraining,
    trainingProgress,
    timeRemaining,
    isCompleting,
    
    // Computed
    formattedTimeRemaining,
    trainingPercentage,
    canTrain,
    currentIntensity,
    
    // Methods
    startTraining,
    completeTraining,
    cancelTraining,
    checkTrainingStatus
  }
}