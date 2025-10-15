<template>
  <div class="history-page">
    <!-- Loading Overlay -->
    <div v-if="initialLoading" class="loading-overlay">
      <div class="loading-content">
        <v-progress-circular
          indeterminate
          color="primary"
          size="80"
          width="6"
        />
        <h2 class="mt-6 text-h4 font-weight-bold">Loading Adventure History</h2>
        <p class="mt-2 text-subtitle-1 text-medium-emphasis">
          Gathering your epic journey data...
        </p>
        <div class="loading-steps mt-4">
          <div class="step-item" :class="{ active: loadingStep >= 1 }">
            <v-icon class="me-2">mdi-database</v-icon>
            Loading character data
          </div>
          <div class="step-item" :class="{ active: loadingStep >= 2 }">
            <v-icon class="me-2">mdi-clipboard-list</v-icon>
            Fetching task history
          </div>
          <div class="step-item" :class="{ active: loadingStep >= 3 }">
            <v-icon class="me-2">mdi-sword-cross</v-icon>
            Loading battle records
          </div>
          <div class="step-item" :class="{ active: loadingStep >= 4 }">
            <v-icon class="me-2">mdi-chart-line</v-icon>
            Calculating statistics
          </div>
        </div>
      </div>
    </div>

    <v-container v-else>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold">Adventure History</h1>
          <p class="text-subtitle-1 text-medium-emphasis">
            Track all your character's actions and battles
          </p>
        </div>
        <div class="d-flex gap-2">
          <v-btn
            color="info"
            variant="outlined"
            prepend-icon="mdi-chart-line"
            @click="showStats = !showStats"
            :disabled="refreshLoading"
          >
            {{ showStats ? 'Hide' : 'Show' }} Stats
          </v-btn>
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-refresh"
            @click="refreshHistory"
            :loading="refreshLoading"
          >
            Refresh
          </v-btn>
        </div>
      </div>

      <!-- Stats Panel -->
      <v-expand-transition>
        <v-card v-if="showStats && historyStats" class="mb-6" elevation="2">
          <v-card-title>
            <v-icon class="me-2">mdi-chart-box</v-icon>
            History Statistics
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3">
                <div class="text-center">
                  <div class="text-h3 font-weight-bold text-primary">
                    {{ historyStats.totalTasks }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">Total Tasks</div>
                  <div class="text-caption">
                    {{ historyStats.completedTasks }} completed
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-center">
                  <div class="text-h3 font-weight-bold text-success">
                    {{ historyStats.battlesWon }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">Battles Won</div>
                  <div class="text-caption">
                    {{ historyStats.battlesLost }} lost
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-center">
                  <div class="text-h3 font-weight-bold text-warning">
                    {{ formatBounty(historyStats.totalBounty) }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">Total Bounty</div>
                  <div class="text-caption">
                    {{ formatNumber(historyStats.totalExperience) }} EXP
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-center">
                  <div class="text-h3 font-weight-bold text-pink">
                    {{ historyStats.totalKindness }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">Total Kindness</div>
                  <div class="text-caption">
                    Favorite: {{ historyStats.favoriteLocation }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-expand-transition>

      <!-- Filters -->
      <v-card class="mb-6" elevation="2">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.type"
                :items="typeOptions"
                label="Action Type"
                clearable
                variant="outlined"
                density="compact"
                :disabled="refreshLoading"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="filters.difficulty"
                :items="difficultyOptions"
                label="Difficulty"
                clearable
                variant="outlined"
                density="compact"
                :disabled="refreshLoading"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="filters.isCompleted"
                :items="completionOptions"
                label="Status"
                clearable
                variant="outlined"
                density="compact"
                :disabled="refreshLoading"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                v-model="filters.location"
                label="Location"
                clearable
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-map-marker"
                :disabled="refreshLoading"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                label="Sort By"
                variant="outlined"
                density="compact"
                :disabled="refreshLoading"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Content Area -->
      <div v-if="refreshLoading" class="text-center py-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
        <p class="mt-4 text-h6">Refreshing history...</p>
      </div>

      <div v-else-if="paginatedHistory.length === 0" class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1">mdi-history</v-icon>
        <h3 class="mt-4 text-h5">No History Found</h3>
        <p class="text-body-1 text-medium-emphasis">
          {{ hasFilters ? 'Try adjusting your filters or' : '' }}
          Start your adventure to see your history here!
        </p>
        <v-btn
          v-if="hasFilters"
          color="primary"
          variant="outlined"
          class="mt-4"
          @click="clearFilters"
        >
          Clear Filters
        </v-btn>
      </div>

      <!-- History Timeline -->
      <v-timeline v-else side="end" class="history-timeline">
        <v-timeline-item
          v-for="entry in paginatedHistory"
          :key="`${entry.source}-${entry.id}`"
          :dot-color="getEntryColor(entry)"
          size="small"
        >
          <template #icon>
            <v-icon :color="getEntryIconColor(entry)" size="20">
              {{ getEntryIcon(entry) }}
            </v-icon>
          </template>

          <template #opposite>
            <div class="text-caption text-medium-emphasis">
              {{ formatDate(entry.timestamp) }}
            </div>
          </template>

          <v-card
            :class="['history-entry', { 'entry-expanded': entry.expanded }]"
            elevation="2"
            @click="toggleEntry(entry)"
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-start">
                <div class="flex-grow-1">
                  <h4 class="text-h6 mb-1">{{ entry.title }}</h4>
                  <p class="text-body-2 text-medium-emphasis mb-2">
                    {{ entry.description }}
                  </p>
                  
                  <!-- Basic Info -->
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <v-chip
                      :color="getTypeColor(entry.type)"
                      size="small"
                      variant="tonal"
                    >
                      {{ formatType(entry.type) }}
                    </v-chip>
                    
                    <v-chip
                      v-if="entry.difficulty"
                      :color="getDifficultyColor(entry.difficulty)"
                      size="small"
                      variant="tonal"
                    >
                      {{ entry.difficulty }}
                    </v-chip>
                    
                    <v-chip
                      v-if="entry.location"
                      color="info"
                      size="small"
                      variant="tonal"
                      prepend-icon="mdi-map-marker"
                    >
                      {{ entry.location }}
                    </v-chip>

                    <v-chip
                      v-if="entry.source === 'task'"
                      :color="entry.isCompleted ? 'success' : 'warning'"
                      size="small"
                      variant="tonal"
                      :prepend-icon="entry.isCompleted ? 'mdi-check' : 'mdi-clock'"
                    >
                      {{ entry.isCompleted ? 'Completed' : 'In Progress' }}
                    </v-chip>
                  </div>

                  <!-- Rewards Summary -->
                  <div v-if="hasRewards(entry)" class="d-flex flex-wrap gap-2">
                    <v-chip
                      v-if="entry.experienceReward"
                      color="success"
                      size="small"
                      variant="outlined"
                      prepend-icon="mdi-star"
                    >
                      +{{ formatNumber(entry.experienceReward) }} EXP
                    </v-chip>
                    
                    <v-chip
                      v-if="entry.bountyReward"
                      color="warning"
                      size="small"
                      variant="outlined"
                      prepend-icon="mdi-currency-usd"
                    >
                      +{{ formatBounty(entry.bountyReward) }}
                    </v-chip>
                    
                    <v-chip
                      v-if="entry.kindnessReward"
                      color="pink"
                      size="small"
                      variant="outlined"
                      prepend-icon="mdi-heart"
                    >
                      +{{ entry.kindnessReward }} Kindness
                    </v-chip>
                  </div>
                </div>

                <v-btn
                  :icon="entry.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  variant="text"
                  size="small"
                />
              </div>

              <!-- Expanded Details -->
              <v-expand-transition>
                <div v-if="entry.expanded" class="mt-4 pt-4 border-t">
                  <!-- Task Details -->
                  <div v-if="entry.source === 'task'" class="expanded-details">
                    <v-row>
                      <v-col cols="12" md="6">
                        <h5 class="text-subtitle-2 mb-2">Task Details</h5>
                        <div class="detail-item">
                          <strong>Duration:</strong> {{ entry.duration }} minutes
                        </div>
                        <div v-if="entry.helpType" class="detail-item">
                          <strong>Help Type:</strong> {{ formatHelpType(entry.helpType) }}
                        </div>
                        <div v-if="entry.step !== undefined" class="detail-item">
                          <strong>Liberation Step:</strong> {{ entry.step }}
                          <v-chip
                            v-if="entry.stepCompleted !== undefined"
                            :color="entry.stepCompleted ? 'success' : 'warning'"
                            size="x-small"
                            variant="tonal"
                            class="ml-2"
                          >
                            {{ entry.stepCompleted ? 'Step Complete' : 'Step Pending' }}
                          </v-chip>
                        </div>
                        <div class="detail-item">
                          <strong>Status:</strong> 
                          <v-chip
                            :color="entry.isCompleted ? 'success' : 'warning'"
                            size="x-small"
                            variant="tonal"
                          >
                            {{ entry.isCompleted ? 'Completed' : 'In Progress' }}
                          </v-chip>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <h5 class="text-subtitle-2 mb-2">Timeline</h5>
                        <div class="detail-item">
                          <strong>Started:</strong> {{ formatDateTime(entry.startTime!) }}
                        </div>
                        <div class="detail-item">
                          <strong>Expected End:</strong> {{ formatDateTime(entry.endTime!) }}
                        </div>
                        <div v-if="entry.completedAt" class="detail-item">
                          <strong>Completed:</strong> {{ formatDateTime(new Date(entry.completedAt)) }}
                        </div>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Battle Details -->
                  <div v-else-if="entry.source === 'battle'" class="expanded-details">
                    <v-row>
                      <v-col cols="12" md="6">
                        <h5 class="text-subtitle-2 mb-2">Battle Results</h5>
                        <div class="detail-item">
                          <strong>Result:</strong>
                          <v-chip
                            :color="entry.isWinner ? 'success' : 'error'"
                            size="small"
                            variant="tonal"
                            :prepend-icon="entry.isWinner ? 'mdi-trophy' : 'mdi-skull'"
                          >
                            {{ entry.isWinner ? 'Victory' : 'Defeat' }}
                          </v-chip>
                        </div>
                        <div class="detail-item">
                          <strong>Opponent:</strong> {{ entry.opponent }}
                        </div>
                        <div class="detail-item">
                          <strong>Opponent Crew:</strong> {{ entry.opponentCrew }}
                        </div>
                        <div class="detail-item">
                          <strong>Battle Time:</strong> {{ formatDateTime(entry.timestamp) }}
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <h5 class="text-subtitle-2 mb-2">Battle Log</h5>
                        <div class="battle-log">
                          <div
                            v-for="(log, index) in entry.battleLog?.slice(0, 3)"
                            :key="index"
                            class="log-entry text-caption"
                          >
                            {{ log }}
                          </div>
                          <v-btn
                            v-if="entry.battleLog && entry.battleLog.length > 3"
                            variant="text"
                            size="x-small"
                            color="primary"
                            @click.stop="showFullBattleLog(entry)"
                          >
                            View Full Log ({{ entry.battleLog.length }} entries)
                          </v-btn>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          color="primary"
          :disabled="refreshLoading"
        />
      </div>
    </v-container>

    <!-- Battle Log Dialog -->
    <v-dialog v-model="battleLogDialog" max-width="700">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2">mdi-sword-cross</v-icon>
          <span class="text-h5">Complete Battle Log</span>
        </v-card-title>
        <v-card-text>
          <div class="battle-log-full">
            <div
              v-for="(log, index) in selectedBattleLog"
              :key="index"
              class="log-entry mb-1 pa-2 rounded"
              :class="index % 2 === 0 ? 'bg-grey-lighten-5' : ''"
            >
              <span class="text-caption text-medium-emphasis">[{{ index + 1 }}]</span>
              {{ log }}
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="battleLogDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { HistorySystem, type HistoryEntry, type HistoryFilters, type HistoryStats } from '@/utils/historySystem'

const characterStore = useCharacterStore()

// Loading states
const initialLoading = ref(true)
const refreshLoading = ref(false)
const loadingStep = ref(0)

// Reactive data
const showStats = ref(false)
const historyEntries = ref<HistoryEntry[]>([])
const historyStats = ref<HistoryStats | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10
const battleLogDialog = ref(false)
const selectedBattleLog = ref<string[]>([])

// Filters
const filters = ref<HistoryFilters>({
  type: null,
  difficulty: null,
  location: '',
  isCompleted: null
})

const sortBy = ref('newest')

// Options for filters
const typeOptions = [
  { title: 'All Tasks', value: 'task' },
  { title: 'All Battles', value: 'battle' },
  { title: 'Exploration', value: 'exploration' },
  { title: 'Training', value: 'training' },
  { title: 'Navigation', value: 'navigation' },
  { title: 'Ship Upgrade', value: 'ship_upgrade' },
  { title: 'Ship Repair', value: 'ship_repair' },
  { title: 'Island Liberation', value: 'island_liberation' }
]

const difficultyOptions = [
  { title: 'Easy', value: 'easy' },
  { title: 'Medium', value: 'medium' },
  { title: 'Hard', value: 'hard' }
]

const completionOptions = [
  { title: 'Completed', value: true },
  { title: 'In Progress', value: false }
]

const sortOptions = [
  { title: 'Newest First', value: 'newest' },
  { title: 'Oldest First', value: 'oldest' },
  { title: 'By Type', value: 'type' },
  { title: 'By Location', value: 'location' }
]

// Computed
const filteredHistory = computed(() => {
  let filtered = [...historyEntries.value]

  // Sort
  switch (sortBy.value) {
    case 'oldest':
      filtered.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      break
    case 'type':
      filtered.sort((a, b) => a.type.localeCompare(b.type))
      break
    case 'location':
      filtered.sort((a, b) => (a.location || '').localeCompare(b.location || ''))
      break
    default: // newest
      filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredHistory.value.length / itemsPerPage))

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredHistory.value.slice(start, end)
})

const hasFilters = computed(() => {
  return !!(filters.value.type || filters.value.difficulty || filters.value.location || filters.value.isCompleted !== null)
})

// Methods
const loadHistory = async (isInitial = false): Promise<void> => {
  if (!characterStore.playerCharacter?.id) return

  if (isInitial) {
    initialLoading.value = true
    loadingStep.value = 0
  } else {
    refreshLoading.value = true
  }

  try {
    // Step 1: Character data check
    if (isInitial) {
      loadingStep.value = 1
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Step 2: Load tasks
    if (isInitial) {
      loadingStep.value = 2
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Step 3: Load battles
    if (isInitial) {
      loadingStep.value = 3
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Step 4: Calculate stats and process data
    if (isInitial) {
      loadingStep.value = 4
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const [history, stats] = await Promise.all([
      HistorySystem.getFilteredHistory(characterStore.playerCharacter.id, filters.value),
      HistorySystem.getHistoryStats(characterStore.playerCharacter.id)
    ])

    // Add expanded property to each entry
    historyEntries.value = history.map(entry => ({ 
      ...entry, 
      expanded: false 
    }))
    historyStats.value = stats

    // Small delay for smooth transition
    if (isInitial) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }

  } catch (error) {
    console.error('Failed to load history:', error)
  } finally {
    if (isInitial) {
      initialLoading.value = false
      loadingStep.value = 0
    } else {
      refreshLoading.value = false
    }
  }
}

const refreshHistory = (): void => {
  loadHistory(false)
}

const clearFilters = (): void => {
  filters.value = {
    type: null,
    difficulty: null,
    location: '',
    isCompleted: null
  }
  sortBy.value = 'newest'
}

const toggleEntry = (entry: HistoryEntry): void => {
  entry.expanded = !entry.expanded
}

const showFullBattleLog = (entry: HistoryEntry): void => {
  selectedBattleLog.value = entry.battleLog || []
  battleLogDialog.value = true
}

// Helper functions
const getEntryIcon = (entry: HistoryEntry): string => {
  if (entry.source === 'battle') {
    return entry.isWinner ? 'mdi-sword-cross' : 'mdi-shield-off'
  }
  
  switch (entry.type) {
    case 'exploration': return 'mdi-compass'
    case 'training': return 'mdi-dumbbell'
    case 'navigation': return 'mdi-ship-wheel'
    case 'ship_upgrade': return 'mdi-hammer-wrench'
    case 'ship_repair': return 'mdi-wrench'
    case 'island_liberation': return 'mdi-flag'
    default: return 'mdi-clipboard-text'
  }
}

const getEntryColor = (entry: HistoryEntry): string => {
  if (entry.source === 'battle') {
    return entry.isWinner ? 'success' : 'error'
  }
  return entry.isCompleted ? 'success' : 'warning'
}

const getEntryIconColor = (entry: HistoryEntry): string => {
  if (entry.source === 'battle') {
    return entry.isWinner ? 'success' : 'error'
  }
  return 'primary'
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    exploration: 'info',
    training: 'success',
    navigation: 'primary',
    ship_upgrade: 'warning',
    ship_repair: 'orange',
    island_liberation: 'purple',
    battle: 'red'
  }
  return colors[type] || 'grey'
}

const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'error'
  }
  return colors[difficulty] || 'grey'
}

const hasRewards = (entry: HistoryEntry): boolean => {
  return !!(entry.experienceReward || entry.bountyReward || entry.kindnessReward)
}

const formatType = (type: string): string => {
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatHelpType = (helpType: string): string => {
  return helpType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatBounty = (bounty: number): string => {
  if (bounty >= 1000000) {
    return `${(bounty / 1000000).toFixed(1)}M`
  } else if (bounty >= 1000) {
    return `${(bounty / 1000).toFixed(1)}K`
  }
  return bounty.toString()
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num)
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Watchers
watch(() => filters.value, () => {
  currentPage.value = 1
  if (!initialLoading.value) {
    loadHistory(false)
  }
}, { deep: true })

watch(sortBy, () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(async () => {
  await nextTick()
  await loadHistory(true)
})
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.loading-steps {
  margin-top: 2rem;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  opacity: 0.3;
  transition: opacity 0.3s ease;
  font-size: 0.9rem;
}

.step-item.active {
  opacity: 1;
  color: var(--v-theme-primary);
}

/* Timeline Styles */
.history-timeline {
  max-width: none;
}

.history-entry {
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.history-entry:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
  border-left-color: var(--v-theme-primary);
}

.entry-expanded {
  border-left-color: var(--v-theme-primary);
}

.expanded-details {
  background: rgba(0,0,0,0.02);
  border-radius: 8px;
  padding: 16px;
}

.detail-item {
  margin-bottom: 8px;
  font-size: 0.875rem;
}

.battle-log {
  max-height: 150px;
  overflow-y: auto;
  background: rgba(0,0,0,0.02);
  border-radius: 4px;
  padding: 8px;
}

.battle-log-full {
  max-height: 400px;
  overflow-y: auto;
}

.log-entry {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  line-height: 1.4;
}

.border-t {
  border-top: 1px solid rgba(0,0,0,0.12);
}

.gap-2 {
  gap: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .loading-content {
    padding: 1rem;
  }
  
  .step-item {
    font-size: 0.8rem;
  }
}
</style>