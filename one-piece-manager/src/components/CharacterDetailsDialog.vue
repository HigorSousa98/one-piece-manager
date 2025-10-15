<template>
  <v-dialog
    v-model="dialog"
    max-width="800"
    persistent
    transition="dialog-transition"
  >
    <v-card v-if="character" class="character-details-dialog">
      <!-- Header -->
      <v-card-title class="character-header pa-0">
        <div class="header-background">
          <div class="header-content pa-6">
            <div class="d-flex align-center">
              <!-- ✅ AVATAAARS AVATAR -->
              <AvataaarsAvatar
                :character="character"
                size="80"
                variant="circle"
                :show-status-indicators="true"
                :show-level="true"
                :show-power-rank="true"
                :show-actions="false"
                :clickable="false"
                class="character-avatar me-4"
              />
              
              <div class="flex-grow-1">
                <h2 class="text-h4 font-weight-bold text-white mb-1">
                  {{ character.name }}
                </h2>
                <p class="text-subtitle-1 text-white-secondary mb-2">
                  {{ character.crewName }}
                </p>
                
                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    :color="getTypeColor(character.type)"
                    variant="elevated"
                    size="small"
                  >
                    {{ formatType(character.type) }}
                  </v-chip>
                  
                  <v-chip
                    v-if="character.specialTitle"
                    color="warning"
                    variant="elevated"
                    size="small"
                  >
                    {{ character.specialTitle }}
                  </v-chip>
                  
                  <v-chip
                    v-if="character.isPlayer"
                    color="success"
                    variant="elevated"
                    size="small"
                    prepend-icon="mdi-account-star"
                  >
                    YOU
                  </v-chip>
                </div>
              </div>
              
              <div class="rank-display text-center">
                <div class="text-h2 font-weight-bold text-white">
                  #{{ character.rank }}
                </div>
                <div class="text-caption text-white-secondary">
                  World Rank
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-6">
        <v-row>
          <!-- Stats Column -->
          <v-col cols="12" md="6">
            <h3 class="text-h6 font-weight-bold mb-4">
              <v-icon class="me-2">mdi-chart-line</v-icon>
              Character Stats
            </h3>
            
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-label">Level</div>
                <div class="stat-value">{{ character.level }}</div>
              </div>
              
              <!-- ✅ BOUNTY DISPLAY COMPONENT -->
              <div class="stat-item bounty-stat">
                <div class="stat-label">Bounty/Rank</div>
                <CharacterBountyDisplay
                  :character="character"
                  size="small"
                  variant="elevated"
                />
              </div>
              
              <div class="stat-item">
                <div class="stat-label">Attack</div>
                <div class="stat-value">{{ character.stats?.attack || 0 }}</div>
              </div>
              
              <div class="stat-item">
                <div class="stat-label">Speed</div>
                <div class="stat-value">{{ character.stats?.speed || 0 }}</div>
              </div>
              
              <div class="stat-item">
                <div class="stat-label">Defense</div>
                <div class="stat-value">{{ character.stats?.defense || 0 }}</div>
              </div>
              
              <div class="stat-item">
                <div class="stat-label">Kindness</div>
                <div class="stat-value">{{ character.kindness || 0 }}</div>
              </div>
            </div>
          </v-col>
          
          <!-- Info Column -->
          <v-col cols="12" md="6">
            <h3 class="text-h6 font-weight-bold mb-4">
              <v-icon class="me-2">mdi-information</v-icon>
              Character Info
            </h3>
            
            <div class="info-list">
              <div class="info-item">
                <v-icon class="info-icon">mdi-map-marker</v-icon>
                <div>
                  <div class="info-label">Current Location</div>
                  <div class="info-value">
                    {{ character.currentIslandName }}
                    <v-chip
                      :color="getDifficultyColor(character.currentIslandDifficulty)"
                      size="x-small"
                      variant="tonal"
                      class="ml-2"
                    >
                      Difficulty {{ character.currentIslandDifficulty }}
                    </v-chip>
                  </div>
                </div>
              </div>
              
              <div class="info-item">
                <v-icon class="info-icon">mdi-account-group</v-icon>
                <div>
                  <div class="info-label">Crew</div>
                  <div class="info-value">{{ character.crewName }}</div>
                </div>
              </div>
              
              <div class="info-item">
                <v-icon class="info-icon">mdi-crown</v-icon>
                <div>
                  <div class="info-label">Position</div>
                  <div class="info-value">{{ character.position || 'Captain' }}</div>
                </div>
              </div>
              
              <div class="info-item" v-if="character.devilFruitId">
                <v-icon class="info-icon">mdi-fruit-grapes</v-icon>
                <div>
                  <div class="info-label">Devil Fruit</div>
                  <div class="info-value">{{ devilFruit(character.devilFruitId).name }}</div>
                </div>
              </div>

              <!-- ✅ BOUNTY DETAILS -->
              <div class="info-item">
                <v-icon class="info-icon">{{ getBountyIcon(character.type) }}</v-icon>
                <div>
                  <div class="info-label">{{ getBountyLabel(character.type) }}</div>
                  <CharacterBountyDisplay
                    :character="character"
                    size="default"
                    variant="elevated"
                  />
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          color="primary"
          variant="outlined"
          @click="dialog = false"
        >
          Close
        </v-btn>
        <v-btn
          v-if="!character.isPlayer"
          color="warning"
          variant="elevated"
          prepend-icon="mdi-sword-cross"
          @click="challengeCharacter"
        >
          Challenge
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RankingCharacter } from '@/utils/worldEncyclopedia'
import AvataaarsAvatar from '@/components/AvataaarsAvatar.vue'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'
import { DevilFruit } from '@/utils/database'

// Props
interface Props {
  modelValue: boolean
  character: RankingCharacter | null
  allDevilFruits: DevilFruit[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Computed
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const devilFruit = (df: number): DevilFruit => {
    return props.allDevilFruits.find(devilFruit => devilFruit.id === df)
}

// Methods
const challengeCharacter = (): void => {
  // Implementar lógica de desafio
  console.log('Challenge character:', props.character?.name)
  dialog.value = false
}

// Helper functions
const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    Pirate: 'red',
    Marine: 'blue',
    BountyHunter: 'green',
    Government: 'purple'
  }
  return colors[type] || 'grey'
}

const getDifficultyColor = (difficulty: number): string => {
  if (difficulty <= 5) return 'success'
  if (difficulty <= 10) return 'warning'
  if (difficulty <= 15) return 'orange'
  return 'error'
}

const formatType = (type: string): string => {
  return type.replace(/([A-Z])/g, ' $1').trim()
}

const getBountyIcon = (type: string): string => {
  const icons: Record<string, string> = {
    Pirate: 'mdi-currency-usd',
    Marine: 'mdi-star',
    BountyHunter: 'mdi-trophy',
    Government: 'mdi-shield-crown'
  }
  return icons[type] || 'mdi-help'
}

const getBountyLabel = (type: string): string => {
  const labels: Record<string, string> = {
    Pirate: 'Bounty',
    Marine: 'Marine Rank',
    BountyHunter: 'Hunter Rank',
    Government: 'Government Rank'
  }
  return labels[type] || 'Rank'
}
</script>

<style scoped>
.character-details-dialog {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
}

/* Header */
.character-header {
  position: relative;
  overflow: hidden;
}

.header-background {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.header-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.header-content {
  position: relative;
  z-index: 1;
}

/* ✅ AJUSTE PARA AVATAAARS AVATAR NO HEADER */
.character-avatar :deep(.avataaars-avatar) {
  border: 3px solid rgba(255, 255, 255, 0.5);
}

.rank-display {
  min-width: 100px;
}

.text-white-secondary {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* ✅ AJUSTE ESPECIAL PARA BOUNTY STAT */
.stat-item.bounty-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-item.bounty-stat :deep(.character-bounty-chip) {
  margin: 0;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

/* Info List */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-icon {
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
}

.info-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
}

.info-value {
  font-weight: 500;
  color: white;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content .d-flex {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .rank-display {
    order: -1;
  }
}
</style>