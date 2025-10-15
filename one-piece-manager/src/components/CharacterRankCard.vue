<template>
  <v-card
    class="character-rank-card"
    :class="{ 'player-card': character.isPlayer, 'special-card': specialBadge }"
    elevation="4"
    hover
    @click="$emit('click', character)"
  >
    <!-- Rank Badge -->
    <div class="rank-badge" v-if="showRank">
      <v-chip
        :color="getRankColor(character.rank)"
        size="small"
        variant="elevated"
        class="rank-chip"
      >
        #{{ character.rank }}
      </v-chip>
    </div>

    <!-- Special Title Badge -->
    <div class="special-badge" v-if="specialBadge">
      <v-chip
        :color="badgeColor"
        size="small"
        variant="elevated"
        class="special-chip"
      >
        {{ specialBadge }}
      </v-chip>
    </div>

    <!-- Player Badge -->
    <div class="player-badge" v-if="character.isPlayer">
      <v-chip
        color="success"
        size="small"
        variant="elevated"
        prepend-icon="mdi-account-star"
      >
        YOU
      </v-chip>
    </div>

    <!-- Character Avatar -->
    <div class="avatar-container">
      <AvataaarsAvatar
        :character="character"
        size="80"
        variant="circle"
        :show-status-indicators="false"
        :show-actions="false"
        :clickable="false"
        class="character-avatar"
      />
      
      <!-- Type Icon -->
      <div class="type-icon">
        <v-icon
          :color="getTypeColor(character.type)"
          size="24"
        >
          {{ getTypeIcon(character.type) }}
        </v-icon>
      </div>
    </div>

    <!-- Character Info -->
    <v-card-text class="character-info pa-3">
      <h4 class="character-name text-h6 font-weight-bold mb-1">
        {{ character.name }}
      </h4>
      
      <p class="crew-name text-body-2 text-medium-emphasis mb-2">
        {{ character.crewName }}
      </p>

      <!-- Stats Row -->
      <div class="stats-row mb-2">
        <div class="stat-item">
          <v-icon size="16" class="me-1">mdi-star</v-icon>
          <span class="text-caption">Lv.{{ character.level }}</span>
        </div>
        <!-- Bounty Display Component -->
        <CharacterBountyDisplay
          :character="character"
          size="x-small"
          variant="tonal"
        />
      </div>

      <!-- Location -->
      <div class="location-info">
        <v-icon size="14" class="me-1">mdi-map-marker</v-icon>
        <span class="text-caption">{{ character.currentIslandName }}</span>
        <v-chip
          v-if="character.currentIslandDifficulty > 0"
          :color="getDifficultyColor(character.currentIslandDifficulty)"
          size="x-small"
          variant="tonal"
          class="ml-1"
        >
          Lv.{{ character.currentIslandDifficulty }}
        </v-chip>
      </div>

      <!-- Character Type -->
      <div class="character-type mt-2">
        <v-chip
          :color="getTypeColor(character.type)"
          size="small"
          variant="tonal"
        >
          {{ formatType(character.type) }}
        </v-chip>
      </div>
    </v-card-text>

    <!-- Hover Effect Overlay -->
    <div class="hover-overlay">
      <v-icon size="32" color="white">mdi-eye</v-icon>
      <p class="text-caption mt-1">View Details</p>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { RankingCharacter } from '@/utils/worldEncyclopedia'
import AvataaarsAvatar from '@/components/AvataaarsAvatar.vue'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'

// Props
interface Props {
  character: RankingCharacter
  specialBadge?: string
  badgeColor?: string
  showRank?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  specialBadge: undefined,
  badgeColor: 'primary',
  showRank: true
})

// Emits
defineEmits<{
  click: [character: RankingCharacter]
}>()

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



const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    Pirate: 'mdi-pirate',
    Marine: 'mdi-anchor',
    BountyHunter: 'mdi-target',
    Government: 'mdi-bank'
  }
  return icons[type] || 'mdi-account'
}

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'amber'
  if (rank === 2) return 'grey-lighten-1'
  if (rank === 3) return 'orange'
  if (rank <= 10) return 'blue'
  if (rank <= 50) return 'green'
  return 'grey'
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
</script>

<style scoped>
.character-rank-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.character-rank-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.character-rank-card.player-card {
  border: 2px solid #4CAF50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
}

.character-rank-card.special-card {
  border: 2px solid #FF9800;
  box-shadow: 0 0 20px rgba(255, 152, 0, 0.3);
}

/* Badges */
.rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
}

.special-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.player-badge {
  position: absolute;
  top: 40px;
  right: 8px;
  z-index: 2;
}

.rank-chip {
  font-weight: bold;
  font-size: 0.75rem;
}

.special-chip {
  font-weight: bold;
  font-size: 0.7rem;
}

/* Avatar */
.avatar-container {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 1rem 1rem 0.5rem;
}

.character-avatar {
  transition: all 0.3s ease;
}

.character-rank-card:hover .character-avatar {
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

/* ✅ AJUSTE PARA AVATAAARS AVATAR */
.character-avatar :deep(.avataaars-avatar) {
  transition: all 0.3s ease;
}

.character-rank-card:hover .character-avatar :deep(.avataaars-avatar) {
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

.type-icon {
  position: absolute;
  bottom: -5px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  padding: 4px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* Character Info */
.character-info {
  text-align: center;
  color: black;
}

.character-name {
  color: black;
  line-height: 1.2;
  min-height: 2.4em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.crew-name {
  color: rgba(0, 0, 0, 0.7);
  font-style: italic;
  min-height: 1.2em;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.8);
}

/* ✅ AJUSTE PARA BOUNTY DISPLAY */
.stats-row :deep(.character-bounty-chip) {
  font-size: 0.7rem !important;
  height: 20px !important;
  padding: 0 6px !important;
}

.location-info {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.7);
  flex-wrap: wrap;
  gap: 4px;
}

.character-type {
  display: flex;
  justify-content: center;
}

/* Hover Overlay */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: black;
}

.character-rank-card:hover .hover-overlay {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .character-avatar {
    width: 60px !important;
    height: 60px !important;
  }
  
  .character-name {
    font-size: 1rem;
  }
  
  .stats-row {
    flex-direction: column;
    gap: 4px;
  }
}
</style>