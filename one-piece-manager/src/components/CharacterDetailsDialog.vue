<template>
  <v-dialog
    v-model="dialog"
    max-width="1000"
    persistent
    transition="dialog-transition"
    @click:outside="closeDialog"
  >
    <v-card v-if="character" class="character-details-dialog">
      
      <!-- Header com Wanted Poster -->
      <v-card-title class="character-header pa-0">
        <div class="header-background">
          <div class="header-content pa-6">
            
            <!-- Wanted Poster Section -->
            <div class="poster-section">
              <div class="poster-container">
                <WantedPoster
                  :character="character"
                  size="small"
                  :show-actions="false"
                  :show-size-controls="false"
                  class="main-poster"
                  @download-complete="onPosterDownload"
                  @share-complete="onPosterShare"
                />
              </div>
              
              <!-- Rank Badge Overlay -->
              <div class="rank-overlay">
                <v-chip
                  color="amber"
                  size="large"
                  variant="elevated"
                  class="rank-chip-large"
                >
                  <v-icon left>mdi-trophy</v-icon>
                  RANK #{{ character.rank }}
                </v-chip>
              </div>
              
              <!-- Special Badges -->
              <div class="special-badges">
                <v-chip
                  v-if="character.isPlayer"
                  color="success"
                  variant="elevated"
                  size="small"
                  prepend-icon="mdi-account-star"
                  class="special-chip"
                >
                  YOU
                </v-chip>
                
                <v-chip
                  v-if="character.specialTitle"
                  color="warning"
                  variant="elevated"
                  size="small"
                  class="special-chip"
                >
                  {{ character.specialTitle }}
                </v-chip>
              </div>
            </div>
            
          </div>
        </div>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-6">
        <v-row>
          <!-- Character Info Column -->
          <v-col cols="12" md="6">
            <h3 class="text-h6 font-weight-bold mb-4">
              <v-icon class="me-2">mdi-account</v-icon>
              Informações do Personagem
            </h3>
            
            <div class="info-list">
              <div class="info-item">
                <v-icon class="info-icon">mdi-account-circle</v-icon>
                <div>
                  <div class="info-label">Nome Completo</div>
                  <div class="info-value">{{ character.name }}</div>
                </div>
              </div>
              
              <div class="info-item">
                <v-icon class="info-icon">mdi-account-group</v-icon>
                <div>
                  <div class="info-label">Tripulação</div>
                  <div class="info-value">{{ character.crewName }}</div>
                </div>
              </div>
              
              <div class="info-item">
                <v-icon class="info-icon">mdi-crown</v-icon>
                <div>
                  <div class="info-label">Posição</div>
                  <div class="info-value">{{ character.position || 'Capitão' }}</div>
                </div>
              </div>
              
              <div class="info-item">
                <v-icon class="info-icon">mdi-shield-account</v-icon>
                <div>
                  <div class="info-label">Tipo</div>
                  <div class="info-value">
                    <v-chip
                      :color="getTypeColor(character.type)"
                      variant="tonal"
                      size="small"
                    >
                      {{ formatType(character.type) }}
                    </v-chip>
                  </div>
                </div>
              </div>
              
              <div class="info-item">
                <v-icon class="info-icon">mdi-map-marker</v-icon>
                <div>
                  <div class="info-label">Localização Atual</div>
                  <div class="info-value">
                    {{ character.currentIslandName }}
                    <v-chip
                      :color="getDifficultyColor(character.currentIslandDifficulty)"
                      size="x-small"
                      variant="tonal"
                      class="ml-2"
                    >
                      Dificuldade {{ character.currentIslandDifficulty }}
                    </v-chip>
                  </div>
                </div>
              </div>
              
              <div class="info-item" v-if="character.devilFruitId">
                <v-icon class="info-icon">mdi-fruit-grapes</v-icon>
                <div>
                  <div class="info-label">Akuma no Mi</div>
                  <div class="info-value">{{ devilFruit(character.devilFruitId)?.name || 'Desconhecida' }}</div>
                </div>
              </div>

              <!-- Bounty/Rank Details -->
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
          
          <!-- Stats Column -->
          <v-col cols="12" md="6">
            <h3 class="text-h6 font-weight-bold mb-4">
              <v-icon class="me-2">mdi-chart-line</v-icon>
              Estatísticas de Combate
            </h3>
            
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon">
                  <v-icon color="orange">mdi-star</v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-label">Level</div>
                  <div class="stat-value">{{ character.level }}</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <v-icon color="red">mdi-sword</v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-label">Ataque</div>
                  <div class="stat-value">{{ character.stats?.attack || 0 }}</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <v-icon color="blue">mdi-run-fast</v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-label">Velocidade</div>
                  <div class="stat-value">{{ character.stats?.speed || 0 }}</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <v-icon color="green">mdi-shield</v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-label">Defesa</div>
                  <div class="stat-value">{{ character.stats?.defense || 0 }}</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <v-icon color="pink">mdi-heart</v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-label">Bondade</div>
                  <div class="stat-value">{{ character.kindness || 0 }}</div>
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
          variant="elevated"
          @click="dialog = false"
        >
          Fechar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEventListener } from '@vueuse/core'
import type { RankingCharacter } from '@/utils/worldEncyclopedia'
import WantedPoster from '@/components/WantedPoster.vue'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'
import { DevilFruit } from '@/utils/database'

// Props
interface Props {
  modelValue: boolean
  character: RankingCharacter | null
  allDevilFruits: DevilFruit[]
}

useEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDialog()
  }
})

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

// Methods
const devilFruit = (df: number): DevilFruit | undefined => {
  return props.allDevilFruits.find(devilFruit => devilFruit.id === df)
}

const challengeCharacter = (): void => {
  console.log('Challenge character:', props.character?.name)
  // Implementar lógica de desafio
  dialog.value = false
}

const downloadCharacterPoster = (): void => {
  console.log('Download poster for:', props.character?.name)
  // A função de download será chamada pelo componente WantedPoster
}

const shareCharacterInfo = (): void => {
  if (!props.character) return
  
  const shareText = `🏴‍☠️ ${props.character.name}
Rank: #${props.character.rank}
Tripulação: ${props.character.crewName}
Level: ${props.character.level}`

  if (navigator.share) {
    navigator.share({
      title: `One Piece - ${props.character.name}`,
      text: shareText
    })
  } else {
    navigator.clipboard.writeText(shareText)
  }
}

const onPosterDownload = (success: boolean): void => {
  if (success) {
    console.log('✅ Poster baixado com sucesso!')
  } else {
    console.log('❌ Erro ao baixar poster')
  }
}

const onPosterShare = (success: boolean): void => {
  if (success) {
    console.log('✅ Poster compartilhado com sucesso!')
  } else {
    console.log('❌ Erro ao compartilhar poster')
  }
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
    Pirate: 'Recompensa',
    Marine: 'Patente Marine',
    BountyHunter: 'Rank de Caçador',
    Government: 'Rank Governamental'
  }
  return labels[type] || 'Rank'
}

const closeDialog = () => {
  // Aqui você pode adicionar lógica antes de fechar
  // Por exemplo: salvar dados, mostrar confirmação, etc.
  
  console.log('Dialog fechado ao clicar fora')
  dialog.value = false
}
</script>

<style scoped>
.character-details-dialog {
  background: linear-gradient(135deg, #2c1810 0%, #8b4513 100%);
  color: white;
}

/* Header */
.character-header {
  position: relative;
  overflow: hidden;
}

.header-background {
  background: linear-gradient(135deg, #8b4513 0%, #d2691e 100%);
  position: relative;
}

.header-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
}

.header-content {
  position: relative;
  z-index: 1;
}

/* Poster Section */
.poster-section {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.poster-container {
  position: relative;
}

.main-poster {
  filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.4));
}

.rank-overlay {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 10;
}

.rank-chip-large {
  font-size: 1rem !important;
  font-weight: bold;
  padding: 12px 16px;
  box-shadow: 0 4px 16px rgba(255, 193, 7, 0.4);
}

.special-badges {
  position: absolute;
  top: -10px;
  left: -10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.special-chip {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Content Styles */
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.info-icon {
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

.info-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.info-value {
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
}

.power-summary {
  margin-top: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .poster-section {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .rank-overlay {
    position: static;
    margin-top: 1rem;
  }
  
  .special-badges {
    position: static;
    flex-direction: row;
    justify-content: center;
    margin-top: 1rem;
  }
}

/* Animations */
@keyframes posterGlow {
  0%, 100% { 
    filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.4));
  }
  50% { 
    filter: drop-shadow(0 12px 48px rgba(139, 69, 19, 0.6));
  }
}

.main-poster:hover {
  animation: posterGlow 2s ease-in-out infinite;
}
</style>