<!-- src/components/TimeRemaining.vue -->
<template>
  <span :class="getTimeClass()" class="time-remaining">
    <v-icon v-if="showIcon && !timeData.isCompleted" size="small" class="mr-1">
      {{ getTimeIcon() }}
    </v-icon>
    {{ formattedTime }}
    
    <!-- BADGE DE URGÊNCIA COM MELHOR CONTRASTE -->
    <v-chip 
      v-if="showUrgencyBadge && isUrgent && !timeData.isCompleted"
      color="red-darken-2"
      size="x-small"
      class="ml-1 pulse white--text"
      variant="elevated"
    >
      <strong>URGENTE</strong>
    </v-chip>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  endTime: Date | string
  startTime?: Date | string
  showIcon?: boolean
  colorCoded?: boolean
  format?: 'short' | 'long' | 'minimal' | 'compact'
  showUrgencyBadge?: boolean
  urgencyThreshold?: number // em minutos
  updateInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
  colorCoded: true,
  format: 'short',
  showUrgencyBadge: true,
  urgencyThreshold: 5,
  updateInterval: 1000
})

const emit = defineEmits<{
  completed: []
  timeUpdate: [remaining: number, percentage: number]
  urgent: [remaining: number]
}>()

const currentTime = ref(new Date().getTime())
const hasEmittedUrgent = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null

const timeData = computed(() => {
  const end = new Date(props.endTime).getTime()
  const remaining = Math.max(0, end - currentTime.value)
  
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
  
  let percentage = 0
  if (props.startTime) {
    const start = new Date(props.startTime).getTime()
    const total = end - start
    const elapsed = currentTime.value - start
    percentage = Math.min(100, Math.max(0, (elapsed / total) * 100))
  }
  
  return {
    remaining,
    hours,
    minutes,
    seconds,
    percentage,
    isCompleted: remaining === 0
  }
})

const isUrgent = computed(() => {
  const minutesRemaining = timeData.value.remaining / (1000 * 60)
  return minutesRemaining <= props.urgencyThreshold && minutesRemaining > 0
})

const formattedTime = computed(() => {
  const { hours, minutes, seconds, isCompleted } = timeData.value
  
  if (isCompleted) {
    return props.showIcon ? '✅ Concluído!' : 'Concluído!'
  }
  
  switch (props.format) {
    case 'long':
      if (hours > 0) {
        return `${hours} hora(s), ${minutes} minuto(s) e ${seconds} segundo(s)`
      } else if (minutes > 0) {
        return `${minutes} minuto(s) e ${seconds} segundo(s)`
      } else {
        return `${seconds} segundo(s)`
      }
      
    case 'minimal':
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }
      
    case 'compact':
      if (hours > 0) {
        return `${hours}h${minutes}m`
      } else if (minutes > 0) {
        return `${minutes}m${seconds}s`
      } else {
        return `${seconds}s`
      }
      
    case 'short':
    default:
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`
      } else {
        return `${seconds}s`
      }
  }
})

// ✅ CORES MELHORADAS PARA CONTRASTE
const getTimeClass = () => {
  if (!props.colorCoded) return 'time-default'
  
  const { isCompleted } = timeData.value
  
  if (isCompleted) return 'time-completed'
  
  const minutes = timeData.value.remaining / (1000 * 60)
  
  if (minutes <= 1) return 'time-critical'
  if (minutes <= props.urgencyThreshold) return 'time-warning'
  return 'time-normal'
}

const getTimeIcon = () => {
  const minutes = timeData.value.remaining / (1000 * 60)
  
  if (minutes <= 1) return 'mdi-alarm'
  if (minutes <= props.urgencyThreshold) return 'mdi-clock-alert'
  return 'mdi-clock'
}

const startTimer = () => {
  if (intervalId) return
  
  intervalId = setInterval(() => {
    currentTime.value = new Date().getTime()
    
    emit('timeUpdate', timeData.value.remaining, timeData.value.percentage)
    
    if (isUrgent.value && !hasEmittedUrgent.value) {
      hasEmittedUrgent.value = true
      emit('urgent', timeData.value.remaining)
    }
    
    if (timeData.value.isCompleted) {
      emit('completed')
      stopTimer()
    }
  }, props.updateInterval)
}

const stopTimer = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

watch(() => props.endTime, () => {
  currentTime.value = new Date().getTime()
  hasEmittedUrgent.value = false
}, { immediate: true })

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.time-remaining {
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

/* ✅ CORES MELHORADAS PARA CONTRASTE EM FUNDO AZUL */
.time-completed {
  background-color: rgba(76, 175, 80, 0.9);
  color: white !important;
  font-weight: 700;
}

.time-critical {
  background-color: rgba(244, 67, 54, 0.9);
  color: white !important;
  font-weight: 700;
  animation: blink 1s infinite;
}

.time-warning {
  background-color: rgba(255, 152, 0, 0.9);
  color: white !important;
  font-weight: 600;
}

.time-normal {
  background-color: rgba(255, 255, 255, 0.9);
  color: #1976d2 !important;
  font-weight: 500;
}

.time-default {
  background-color: rgba(255, 255, 255, 0.8);
  color: #333 !important;
}

.pulse {
  animation: pulse 1.5s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.7; }
}

@keyframes pulse {
  0% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% { 
    transform: scale(1);
    opacity: 1;
  }
}
</style>