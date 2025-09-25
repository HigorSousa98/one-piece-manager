// src/composables/useTimeRemaining.ts

import { ref, onMounted, onUnmounted } from 'vue'

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
      formatted: formatTimeRemaining(endTime)
    }
  }

  onMounted(() => {
    startTimer()
  })

  onUnmounted(() => {
    stopTimer()
  })

  return {
    currentTime,
    formatTimeRemaining,
    getTimeRemainingData,
    startTimer,
    stopTimer
  }
}