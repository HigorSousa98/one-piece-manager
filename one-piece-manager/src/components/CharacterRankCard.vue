<template>
  <div
    class="character-rank-card"
    :class="{ 'player-card': character.isPlayer, 'special-card': specialBadge }"
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

    <!-- Wanted Poster -->
    <div class="poster-container">
      <WantedPoster
        :character="character"
        size="small"
        :show-actions="false"
        :show-size-controls="false"
        class="character-poster"
      />
    </div>

    <!-- Character Info Overlay -->
    <div class="character-info-overlay">
      <h4 class="character-name text-subtitle-1 font-weight-bold mb-1">
        {{ character.name }}
      </h4>
      
      <p class="crew-name text-caption text-medium-emphasis mb-2">
        {{ character.crewName }}
      </p>

      <!-- Stats Row -->
      <div class="stats-row mb-2">
        <div class="stat-item">
          <v-icon size="14" class="me-1">mdi-star</v-icon>
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
      <div class="location-info mb-2">
        <v-icon size="12" class="me-1">mdi-map-marker</v-icon>
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
      <div class="character-type">
        <v-chip
          :color="getTypeColor(character.type)"
          size="x-small"
          variant="tonal"
          prepend-icon="mdi-account"
        >
          {{ formatType(character.type) }}
        </v-chip>
      </div>
    </div>

    <!-- Hover Effect Overlay -->
    <div class="hover-overlay">
      <v-icon size="32" color="white">mdi-eye</v-icon>
      <p class="text-caption mt-1">Ver Detalhes</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RankingCharacter } from '@/utils/worldEncyclopedia'
import WantedPoster from '@/components/WantedPoster.vue'
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(139, 69, 19, 0.3);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.character-rank-card:hover {
  transform: translateY(-8px) rotate(1deg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(139, 69, 19, 0.6);
}

.character-rank-card.player-card {
  border: 3px solid #4CAF50;
  box-shadow: 0 0 25px rgba(76, 175, 80, 0.4);
}

.character-rank-card.player-card:hover {
  box-shadow: 0 12px 40px rgba(76, 175, 80, 0.6);
}

.character-rank-card.special-card {
  border: 3px solid #FF9800;
  box-shadow: 0 0 25px rgba(255, 152, 0, 0.4);
}

.character-rank-card.special-card:hover {
  box-shadow: 0 12px 40px rgba(255, 152, 0, 0.6);
}

/* Badges */
.rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
}

.special-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.player-badge {
  position: absolute;
  top: 40px;
  right: 8px;
  z-index: 10;
}

.rank-chip {
  font-weight: bold;
  font-size: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.special-chip {
  font-weight: bold;
  font-size: 0.7rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Poster Container */
.poster-container {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-poster {
  transform: scale(0.85);
  transition: all 0.3s ease;
}

.character-rank-card:hover .character-poster {
  transform: scale(0.9) rotate(-2deg);
}

/* Character Info Overlay */
.character-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.9) 70%,
    transparent 100%
  );
  padding: 16px 12px 12px;
  text-align: center;
  backdrop-filter: blur(5px);
  border-top: 1px solid rgba(139, 69, 19, 0.2);
}

.character-name {
  color: #2c1810;
  line-height: 1.2;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

.crew-name {
  color: rgba(44, 24, 16, 0.7);
  font-style: italic;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.stat-item {
  display: flex;
  align-items: center;
  color: rgba(44, 24, 16, 0.8);
  background: rgba(255, 255, 255, 0.6);
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.location-info {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(44, 24, 16, 0.7);
  flex-wrap: wrap;
  gap: 4px;
  font-size: 0.75rem;
}

.character-type {
  display: flex;
  justify-content: center;
}

/* Bounty Display Adjustments */
.stats-row :deep(.character-bounty-chip) {
  font-size: 0.65rem !important;
  height: 18px !important;
  padding: 0 4px !important;
}

/* Hover Overlay */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(139, 69, 19, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  backdrop-filter: blur(5px);
}

.character-rank-card:hover .hover-overlay {
  opacity: 1;
}

.hover-overlay .v-icon {
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
}

/* Responsive */
@media (max-width: 768px) {
  .poster-container {
    height: 240px;
  }
  
  .character-poster {
    transform: scale(0.75);
  }
  
  .character-rank-card:hover .character-poster {
    transform: scale(0.8) rotate(-1deg);
  }
  
  .character-info-overlay {
    padding: 12px 8px 8px;
  }
  
  .character-name {
    font-size: 0.9rem;
  }
  
  .stats-row {
    flex-direction: column;
    gap: 2px;
  }
}

/* Animation for special effects */
@keyframes wanted-glow {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(139, 69, 19, 0.3);
  }
  50% { 
    box-shadow: 0 0 30px rgba(139, 69, 19, 0.6);
  }
}

.character-rank-card.special-card {
  animation: wanted-glow 3s ease-in-out infinite;
}

.character-rank-card.player-card {
  animation: wanted-glow 3s ease-in-out infinite;
}
</style>