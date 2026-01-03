// src/composables/useTimeRemaining.ts

import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Task } from '@/utils/database'

export function useTimeRemaining(updateInterval: number = 1000) {
  const currentTime = ref(new Date().getTime())
  let intervalId: ReturnType<typeof setInterval> | null = null

  const startTimer = () => {
    if (intervalId) return

    intervalId = setInterval(() => {
      currentTime.value = new Date().getTime()
    }, updateInterval)
  }

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const formatTimeRemaining = (endTime: Date | string): string => {
    const end = new Date(endTime).getTime()
    const remaining = Math.max(0, end - currentTime.value)

    if (remaining === 0) return 'Concluído!'

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const getTimeRemainingData = (endTime: Date | string) => {
    const end = new Date(endTime).getTime()
    const remaining = Math.max(0, end - currentTime.value)

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

    return {
      remaining,
      hours,
      minutes,
      seconds,
      isCompleted: remaining === 0,
      formatted: formatTimeRemaining(endTime),
    }
  }

  // ✅ NOVAS FUNCIONALIDADES PARA TASKS

  /**
   * Calcula o progresso completo de uma task
   */
  const getTaskProgress = (task: Task | null) => {
    if (!task) {
      return {
        progress: 0,
        timeRemaining: 0,
        isCompleted: false,
        totalTime: 0,
        elapsed: 0,
        formattedTimeRemaining: 'N/A',
        formattedElapsedTime: 'N/A',
        formattedTotalTime: 'N/A',
      }
    }

    const startTime = new Date(task.startTime).getTime()
    const endTime = new Date(task.endTime).getTime()
    const current = currentTime.value

    const totalTime = endTime - startTime
    const elapsed = Math.max(0, current - startTime)
    const remaining = Math.max(0, endTime - current)

    const progressPercentage = Math.min(100, Math.max(0, (elapsed / totalTime) * 100))
    const isCompleted = current >= endTime

    return {
      progress: progressPercentage,
      timeRemaining: remaining,
      isCompleted,
      totalTime,
      elapsed,
      formattedTimeRemaining: formatDuration(remaining),
      formattedElapsedTime: formatDuration(elapsed),
      formattedTotalTime: formatDuration(totalTime),
    }
  }

  /**
   * Cria um computed reativo para o progresso de uma task
   */
  const createTaskProgressComputed = (taskRef: any) => {
    return computed(() => getTaskProgress(taskRef.value))
  }

  /**
   * Determina a cor da progress bar baseada no progresso
   */
  const getProgressColor = (progress: number, isCompleted: boolean): string => {
    if (isCompleted) return 'success'
    if (progress > 75) return 'orange'
    if (progress > 50) return 'primary'
    if (progress > 25) return 'info'
    return 'blue-grey'
  }

  /**
   * Determina o status da task
   */
  const getTaskStatus = (task: Task | null): 'none' | 'pending' | 'running' | 'completed' => {
    if (!task) return 'none'

    const progress = getTaskProgress(task)

    if (progress.isCompleted) return 'completed'
    if (progress.progress > 0) return 'running'
    return 'pending'
  }

  /**
   * Formatar duração em milliseconds para string legível
   */
  const formatDuration = (milliseconds: number): string => {
    if (milliseconds <= 0) return '0s'

    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
    } else {
      return `${seconds}s`
    }
  }

  /**
   * Obter informações formatadas para exibição em cards/interfaces
   */
  const getTaskDisplayInfo = (
    task: Task,
  ): {
    title: string
    subtitle: string
    progress: number
    timeInfo: string
    statusColor: string
    statusIcon: string
    isCompleted: boolean
  } => {
    const progress = getTaskProgress(task)
    const status = getTaskStatus(task)

    // Mapear tipos de task para ícones e cores
    const taskTypeMap = {
      exploration: { icon: 'mdi-compass', color: 'green' },
      training: { icon: 'mdi-dumbbell', color: 'orange' },
      navigation: { icon: 'mdi-ship-wheel', color: 'blue' },
      ship_upgrade: { icon: 'mdi-hammer-wrench', color: 'purple' },
      island_liberation: { icon: 'mdi-sword-cross', color: 'red' },
    }

    const taskInfo = taskTypeMap[task.type as keyof typeof taskTypeMap] || {
      icon: 'mdi-clipboard',
      color: 'grey',
    }

    return {
      title: task.description || `${task.type} Task`,
      subtitle: `${task.type.charAt(0).toUpperCase() + task.type.slice(1)} • ${task.location || 'Unknown'}`,
      progress: progress.progress,
      timeInfo: progress.isCompleted ? 'Concluída!' : progress.formattedTimeRemaining,
      statusColor: getProgressColor(progress.progress, progress.isCompleted),
      statusIcon: taskInfo.icon,
      isCompleted: progress.isCompleted,
    }
  }

  /**
   * Verificar se múltiplas tasks estão completas
   */
  const areTasksCompleted = (tasks: Task[]): boolean => {
    return tasks.every((task) => getTaskProgress(task).isCompleted)
  }

  /**
   * Obter estatísticas de um conjunto de tasks
   */
  const getTasksStatistics = (tasks: Task[]) => {
    const total = tasks.length
    const completed = tasks.filter((task) => getTaskProgress(task).isCompleted).length
    const running = tasks.filter((task) => {
      const status = getTaskStatus(task)
      return status === 'running' || status === 'pending'
    }).length

    const overallProgress = total > 0 ? (completed / total) * 100 : 0

    return {
      total,
      completed,
      running,
      overallProgress,
      completionRate: `${completed}/${total}`,
    }
  }

  /**
   * Criar um watcher reativo para detectar conclusão de task
   */
  const watchTaskCompletion = (
    taskRef: any,
    onComplete: (task: Task) => void,
    onProgress?: (progress: number) => void,
  ) => {
    let wasCompleted = false

    const unwatch = computed(() => {
      const task = taskRef.value
      if (!task) return

      const progress = getTaskProgress(task)

      // Callback de progresso
      if (onProgress) {
        onProgress(progress.progress)
      }

      // Callback de conclusão
      if (progress.isCompleted && !wasCompleted) {
        wasCompleted = true
        onComplete(task)
      } else if (!progress.isCompleted) {
        wasCompleted = false
      }

      return progress
    })

    return unwatch
  }

  onMounted(() => {
    startTimer()
  })

  onUnmounted(() => {
    stopTimer()
  })

  return {
    // ✅ FUNCIONALIDADES ORIGINAIS
    currentTime,
    formatTimeRemaining,
    getTimeRemainingData,
    startTimer,
    stopTimer,

    // ✅ NOVAS FUNCIONALIDADES PARA TASKS
    getTaskProgress,
    createTaskProgressComputed,
    getProgressColor,
    getTaskStatus,
    formatDuration,
    getTaskDisplayInfo,
    areTasksCompleted,
    getTasksStatistics,
    watchTaskCompletion,
  }
}
