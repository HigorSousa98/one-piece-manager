<template>
  <div
    class="character-rank-card"
    :class="{ 
      'player-card': character.isPlayer, 
      'special-card': specialBadge,
      'search-result': highlightSearch && isSearchMatch 
    }"
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
        <v-icon start size="12">mdi-trophy</v-icon>
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
        <v-icon start size="12">mdi-star</v-icon>
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
        class="pulse-animation"
      >
        YOU
      </v-chip>
    </div>

    <!-- Search Match Indicator -->
    <div class="search-indicator" v-if="highlightSearch && isSearchMatch">
      <v-chip
        color="warning"
        size="x-small"
        variant="elevated"
        prepend-icon="mdi-magnify"
      >
        Match
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
      <!-- Character Name with Search Highlight -->
      <h4 
        class="character-name text-subtitle-1 font-weight-bold mb-1"
        v-html="highlightedName"
      />
      
      <p class="crew-name text-caption text-medium-emphasis mb-2">
        <v-icon size="12" class="me-1">mdi-account-group</v-icon>
        {{ character.crewName || 'No Crew' }}
      </p>

      <!-- Stats Row -->
      <div class="stats-row mb-2">
        <div class="stat-item level-stat">
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
        <span class="text-caption">{{ character.currentIslandName || 'Unknown' }}</span>
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

      <!-- Character Type & Additional Info -->
      <div class="character-details">
        <v-chip
          :color="GameLogic.getTypeColor(character.type)"
          size="x-small"
          variant="tonal"
          :prepend-icon="GameLogic.getTypeIcon(character.type)"
          class="type-chip"
        >
          {{ GameLogic.formatType(character.type) }}
        </v-chip>
        
        <!-- Devil Fruit Indicator -->
        <v-chip
          v-if="character.devilFruitId"
          color="purple"
          size="x-small"
          variant="tonal"
          prepend-icon="mdi-fruit-grapes"
          class="ml-1"
        >
          DF User
        </v-chip>
      </div>
    </div>

    <!-- Hover Effect Overlay -->
    <div class="hover-overlay">
      <div class="hover-content">
        <v-icon size="32" color="white" class="hover-icon">mdi-eye</v-icon>
        <p class="text-caption mt-2 hover-text">Ver Detalhes</p>
        
        <!-- Quick Stats Preview -->
        <div class="quick-stats mt-3">
          <div class="quick-stat">
            <v-icon size="16" color="white">mdi-sword</v-icon>
            <span>{{ character.stats?.attack || 0 }}</span>
          </div>
          <div class="quick-stat">
            <v-icon size="16" color="white">mdi-shield</v-icon>
            <span>{{ character.stats?.defense || 0 }}</span>
          </div>
          <div class="quick-stat">
            <v-icon size="16" color="white">mdi-run-fast</v-icon>
            <span>{{ character.stats?.speed || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <v-progress-circular
        indeterminate
        color="primary"
        size="32"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RankingCharacter } from '@/utils/worldEncyclopedia'
import WantedPoster from '@/components/WantedPoster.vue'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'
import { GameLogic } from '@/utils/gameLogic'

// Props
interface Props {
  character: RankingCharacter
  specialBadge?: string
  badgeColor?: string
  showRank?: boolean
  highlightSearch?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  specialBadge: undefined,
  badgeColor: 'primary',
  showRank: true,
  highlightSearch: '',
  loading: false
})

// Emits
defineEmits<{
  click: [character: RankingCharacter]
}>()

// Computed
const isSearchMatch = computed(() => {
  if (!props.highlightSearch.trim()) return false
  return props.character.name.toLowerCase().includes(props.highlightSearch.toLowerCase())
})

const highlightedName = computed(() => {
  if (!props.highlightSearch.trim() || !isSearchMatch.value) {
    return props.character.name
  }
  
  const regex = new RegExp(`(${props.highlightSearch.trim()})`, 'gi')
  return props.character.name.replace(regex, '<mark class="search-highlight">$1</mark>')
})

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'amber-darken-2'
  if (rank === 2) return 'grey-lighten-1'
  if (rank === 3) return 'orange-darken-1'
  if (rank <= 10) return 'blue-darken-1'
  if (rank <= 50) return 'green-darken-1'
  if (rank <= 100) return 'purple-darken-1'
  return 'grey-darken-1'
}

const getDifficultyColor = (difficulty: number): string => {
  if (difficulty <= 5) return 'success'
  if (difficulty <= 10) return 'warning'
  if (difficulty <= 15) return 'orange'
  if (difficulty <= 20) return 'error'
  return 'red-darken-2'
}

const getPowerColor = (power: number): string => {
  if (power >= 100000) return 'red-darken-2'      // Yonko
  if (power >= 50000) return 'purple-darken-1'    // Admiral
  if (power >= 25000) return 'orange-darken-1'    // Warlord
  if (power >= 10000) return 'blue-darken-1'      // Supernova
  if (power >= 5000) return 'green-darken-1'      // Veteran
  if (power >= 1000) return 'teal-darken-1'       // Experienced
  return 'grey-darken-1'                          // Rookie/Beginner
}

const formatType = (type: string): string => {
  return type.replace(/([A-Z])/g, ' $1').trim()
}

const formatPower = (power: number): string => {
  if (power >= 1000000) return `${(power / 1000000).toFixed(1)}M`
  if (power >= 1000) return `${(power / 1000).toFixed(1)}K`
  return power.toString()
}
</script>

<style scoped>
.character-rank-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(139, 69, 19, 0.3);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.character-rank-card:hover {
  transform: translateY(-8px) rotate(1deg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
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

.character-rank-card.search-result {
  border: 3px solid #FFC107;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
}

.character-rank-card.search-result:hover {
  box-shadow: 0 12px 40px rgba(255, 193, 7, 0.6);
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

.search-indicator {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.rank-chip, .special-chip {
  font-weight: bold;
  font-size: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
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
  flex-shrink: 0;
}

.character-poster {
  transform: scale(0.85);
  transition: all 0.3s ease;
}

.character-rank-card:hover .character-poster {
  transform: scale(0.9) rotate(-2deg);
}

.power-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.power-chip {
  font-weight: bold;
  backdrop-filter: blur(5px);
}

/* Character Info Overlay */
.character-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.95) 70%,
    rgba(255, 255, 255, 0.8) 90%,
    transparent 100%
  );
  padding: 16px 12px 12px;
  text-align: center;
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(139, 69, 19, 0.2);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.character-name {
  color: #2c1810;
  line-height: 1.2;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

:deep(.search-highlight) {
  background: linear-gradient(45deg, #FFC107, #FFD54F);
  color: #1a1a1a;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  animation: highlight-glow 2s ease-in-out infinite;
}

@keyframes highlight-glow {
  0%, 100% { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); }
  50% { box-shadow: 0 2px 8px rgba(255, 193, 7, 0.4); }
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
  background: rgba(255, 255, 255, 0.7);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

.level-stat {
  background: linear-gradient(45deg, rgba(255, 193, 7, 0.2), rgba(255, 213, 79, 0.2));
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

.character-details {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.type-chip {
  font-weight: 500;
}

/* Bounty Display Adjustments */
.stats-row :deep(.character-bounty-chip) {
  font-size: 0.65rem !important;
  height: 20px !important;
  padding: 0 6px !important;
}

/* Hover Overlay */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(139, 69, 19, 0.95) 0%,
    rgba(101, 67, 33, 0.95) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.character-rank-card:hover .hover-overlay {
  opacity: 1;
}

.hover-content {
  text-align: center;
  color: white;
}

.hover-icon {
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.hover-text {
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.quick-stats {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.quick-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 0.75rem;
  font-weight: bold;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
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
  
  .quick-stats {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .character-rank-card {
    border-radius: 12px;
  }
  
  .poster-container {
    height: 200px;
  }
  
  .rank-badge, .special-badge, .player-badge {
    top: 4px;
  }
  
  .rank-badge { left: 4px; }
  .special-badge { right: 4px; }
  .player-badge { right: 4px; top: 32px; }
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