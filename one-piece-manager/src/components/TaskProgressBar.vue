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
/* TaskProgressBar - Active task countdown */

.task-progress-bar {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 12px 14px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #E8D5A3;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.task-time-remaining {
  font-family: Georgia, serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: #D4AF37;
}

.task-track {
  height: 8px;
  background: rgba(10,22,40,0.8);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.04);
}

.task-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #866700, #D4AF37);
  transition: width 1s linear;
  position: relative;
  overflow: hidden;
}

.task-fill::after {
  content: '';
  position: absolute;
  top: 0; left: -60%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: task-shimmer 2.5s infinite;
}

.task-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #90CAF9;
  background: rgba(144,202,249,0.1);
  border: 1px solid rgba(144,202,249,0.25);
  margin-top: 6px;
}

@keyframes task-shimmer {
  0%   { left: -60%; }
  100% { left: 160%; }
}
</style>