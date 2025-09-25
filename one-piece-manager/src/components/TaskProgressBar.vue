<!-- src/components/TaskProgressBar.vue -->
<template>
  <v-progress-linear
    :model-value="progressPercentage"
    :color="progressColor"
    height="10"
    class="task-progress-bar"
    striped
    :animated="progressPercentage < 100"
    rounded
  >
    <template v-slot:default>
      <div class="progress-text">
        {{ Math.round(progressPercentage) }}%
      </div>
    </template>
  </v-progress-linear>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Task } from '@/utils/database'

interface Props {
  task: Task
  updateInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  updateInterval: 1000
})

const emit = defineEmits<{
  progressUpdate: [percentage: number]
}>()

const currentTime = ref(new Date().getTime())
let intervalId: ReturnType<typeof setInterval> | null = null

const progressPercentage = computed(() => {
  const now = currentTime.value
  const start = new Date(props.task.startTime).getTime()
  const end = new Date(props.task.endTime).getTime()
  
  const progress = ((now - start) / (end - start)) * 100
  const percentage = Math.min(100, Math.max(0, progress))
  
  return percentage
})

const progressColor = computed(() => {
  const percentage = progressPercentage.value
  
  if (percentage === 100) return 'success'
  if (percentage >= 75) return 'light-green'
  if (percentage >= 50) return 'orange'
  if (percentage >= 25) return 'deep-orange'
  return 'red'
})

const startTimer = () => {
  if (intervalId) return
  
  intervalId = setInterval(() => {
    currentTime.value = new Date().getTime()
    emit('progressUpdate', progressPercentage.value)
  }, props.updateInterval)
}

const stopTimer = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.task-progress-bar {
  border-radius: 8px;
  margin: 8px 0;
}

.progress-text {
  font-size: 10px;
  font-weight: 600;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}
</style>