<template>
  <div class="world-encyclopedia-container">
    
    <!-- LOADING STATE -->
    <div v-if="initialLoading" class="loading-container">
      <v-row justify="center">
        <v-col cols="12" class="text-center">
          <v-card class="pa-8">
            <v-card-text>
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
                class="mb-4"
              ></v-progress-circular>
              
              <div class="text-h6 mb-4">Carregando Enciclopédia do Mundo</div>
              
              <!-- PROGRESSO DETALHADO -->
              <div class="loading-steps">
                <div class="step-item" :class="{ 'completed': loadingStep >= 1 }">
                  <v-icon :color="loadingStep >= 1 ? 'success' : 'grey'">
                    {{ loadingStep >= 1 ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Dados dos Personagens</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': loadingStep >= 2 }">
                  <v-icon :color="loadingStep >= 2 ? 'success' : 'grey'">
                    {{ loadingStep >= 2 ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Calculando Rankings</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': loadingStep >= 3 }">
                  <v-icon :color="loadingStep >= 3 ? 'success' : 'grey'">
                    {{ loadingStep >= 3 ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Organizando Grupos Especiais</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': loadingStep >= 4 }">
                  <v-icon :color="loadingStep >= 4 ? 'success' : 'grey'">
                    {{ loadingStep >= 4 ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Gerando Estatísticas</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <!-- CONTEÚDO PRINCIPAL -->
    <div v-else>
      
      <!-- HEADER -->
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4" variant="elevated">
            <v-card-title class="text-center">
              <v-icon left size="large">mdi-earth</v-icon>
              ENCICLOPÉDIA DO MUNDO
            </v-card-title>
            <v-card-subtitle class="text-center">
              Os personagens mais renomados dos mares
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>

      <!-- POSIÇÃO DO PLAYER HEADER -->
      <v-row v-if="playerInfo">
  <v-col cols="12">
    <v-card 
      variant="elevated" 
      class="mb-4 player-position-card" 
      :class="getPlayerCardClass()"
    >
      <!-- Header -->
      <v-card-title class="player-header pa-4">
        <div class="header-content">
          <div class="header-icon">
            <v-icon size="32" color="white">mdi-crown</v-icon>
          </div>
          <div class="header-text">
            <h2 class="text-h5 font-weight-bold text-white mb-1">
              👑 SUA POSIÇÃO NO MUNDO
            </h2>
            <p class="text-subtitle-2 text-white-secondary mb-0">
              Ranking Global de {{ formatType(playerInfo.category) }}s
            </p>
          </div>
        </div>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-6">
        <v-row align="center" justify="center">
          
          <!-- Wanted Poster -->
          <v-col cols="12" md="4" class="text-center">
            <div class="poster-container">
              <WantedPoster
                :character="playerCharacter"
                size="small"
                :show-actions="false"
                :show-size-controls="false"
                class="player-poster"
              />
              
              <!-- Player Badge -->
              <div class="player-badge-overlay">
                <v-chip
                  color="success"
                  variant="elevated"
                  size="large"
                  prepend-icon="mdi-account-star"
                  class="player-chip"
                >
                  VOCÊ
                </v-chip>
              </div>
            </div>
          </v-col>

          <!-- Rank Info -->
          <v-col cols="12" md="8">
            <div class="rank-info-section">
              
              <!-- Main Rank Display -->
              <div class="main-rank mb-4">
                <div class="rank-number">
                  <span class="rank-hash">#</span>
                  <span class="rank-value">{{ playerInfo.rank }}</span>
                </div>
                <div class="rank-context">
                  <v-chip
                    :color="getRankColor(playerInfo.rank)"
                    variant="elevated"
                    size="large"
                    class="rank-chip"
                  >
                    {{ getRankTitle(playerInfo.rank) }}
                  </v-chip>
                </div>
              </div>

              <!-- Stats Grid -->
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">
                    <v-icon color="primary">mdi-account-group</v-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ playerInfo.totalInCategory }}</div>
                    <div class="stat-label">Total {{ formatType(playerInfo.category) }}s</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">
                    <v-icon color="success">mdi-trending-up</v-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ getPercentile() }}%</div>
                    <div class="stat-label">Top Percentil</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">
                    <v-icon color="warning">mdi-trophy</v-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ playerCharacter.level }}</div>
                    <div class="stat-label">Nível Atual</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">
                    <v-icon :color="getTypeColor(playerInfo.category)">{{ getTypeIcon(playerInfo.category) }}</v-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ formatType(playerInfo.category) }}</div>
                    <div class="stat-label">Categoria</div>
                  </div>
                </div>
              </div>

              <!-- Progress to Next Rank -->
              <div class="rank-progress mt-4" v-if="playerInfo.rank > 1">
                <div class="progress-header mb-2">
                  <span class="text-subtitle-2 font-weight-medium">
                    Próximo Objetivo: Rank #{{ playerInfo.rank - 1 }}
                  </span>
                  <v-chip size="small" color="info" variant="tonal">
                    {{ getProgressToNextRank() }}
                  </v-chip>
                </div>
                <v-progress-linear
                  :model-value="getProgressPercentage()"
                  color="primary"
                  height="8"
                  rounded
                  class="progress-bar"
                />
              </div>

              <!-- Achievement Badge -->
              <div class="achievement-section mt-4" v-if="getAchievementBadge()">
                <v-alert
                  :color="getAchievementColor()"
                  variant="tonal"
                  :icon="getAchievementIcon()"
                  class="achievement-alert"
                >
                  <template v-slot:title>
                    {{ getAchievementTitle() }}
                  </template>
                  {{ getAchievementDescription() }}
                </v-alert>
              </div>

            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-col>
</v-row>

      <!-- ESTATÍSTICAS GERAIS -->
      <v-row v-if="showStats && worldStats">
        <v-col cols="12">
          <v-card variant="elevated" class="mb-4" color="blue-lighten-5">
            <v-card-title class="text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-chart-box</v-icon>
              📊 ESTATÍSTICAS DO MUNDO
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="red-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="red-darken-2">mdi-pirate</v-icon>
                      <div class="text-h6 mt-1 text-red-darken-3">{{ worldStats.totalPirates }}</div>
                      <div class="text-caption">Piratas</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="blue-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="blue-darken-2">mdi-anchor</v-icon>
                      <div class="text-h6 mt-1 text-blue-darken-3">{{ worldStats.totalMarines }}</div>
                      <div class="text-caption">Marines</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="green-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="green-darken-2">mdi-target</v-icon>
                      <div class="text-h6 mt-1 text-green-darken-3">{{ worldStats.totalBountyHunters }}</div>
                      <div class="text-caption">Caçadores</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="purple-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="purple-darken-2">mdi-bank</v-icon>
                      <div class="text-h6 mt-1 text-purple-darken-3">{{ worldStats.totalGovernment }}</div>
                      <div class="text-caption">Governo</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <v-row class="mt-4">
                <v-col cols="12" md="6">
                  <v-card variant="outlined" color="orange-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="orange-darken-2">mdi-trophy</v-icon>
                      <div class="text-h6 mt-1 text-orange-darken-3">{{ formatBounty(worldStats.highestBounty) }}</div>
                      <div class="text-caption">Maior Recompensa</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" color="cyan-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="cyan-darken-2">mdi-calculator</v-icon>
                      <div class="text-h6 mt-1 text-cyan-darken-3">{{ formatBounty(worldStats.averageBounty) }}</div>
                      <div class="text-caption">Recompensa Média</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- CONTROLES -->
      <v-row>
        <v-col cols="12">
          <v-card variant="elevated" class="mb-4">
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-center flex-wrap gap-2">
                <div class="d-flex gap-2">
                  <v-btn
                    color="info"
                    variant="outlined"
                    prepend-icon="mdi-chart-line"
                    @click="showStats = !showStats"
                    :disabled="refreshLoading"
                  >
                    {{ showStats ? 'Ocultar' : 'Mostrar' }} Stats
                  </v-btn>
                </div>
                <div>
                  <v-btn
                    color="primary"
                    variant="elevated"
                    prepend-icon="mdi-refresh"
                    @click="refreshRankings"
                    :loading="refreshLoading"
                  >
                    {{ refreshLoading ? 'Atualizando...' : 'Atualizar Rankings' }}
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- TABS NAVIGATION -->
      <v-row>
        <v-col cols="12">
          <v-card variant="elevated" class="mb-4">
            <v-tabs v-model="activeTab" bg-color="transparent" color="primary" show-arrows>
              <v-tab value="yonkou" class="tab-item">
                <v-icon class="me-2">mdi-crown</v-icon>
                <span class="tab-text">Yonkou</span>
              </v-tab>
              <v-tab value="shichibukai" class="tab-item">
                <v-icon class="me-2">mdi-shield-crown</v-icon>
                <span class="tab-text">Shichibukai</span>
              </v-tab>
              <v-tab value="admirals" class="tab-item">
                <v-icon class="me-2">mdi-star-circle</v-icon>
                <span class="tab-text">Admirais</span>
              </v-tab>
              <v-tab value="gorousei" class="tab-item">
                <v-icon class="me-2">mdi-account-star</v-icon>
                <span class="tab-text">Gorousei</span>
              </v-tab>
              <v-tab value="pirates" class="tab-item">
                <v-icon class="me-2">mdi-pirate</v-icon>
                <span class="tab-text">Piratas</span>
              </v-tab>
              <v-tab value="marines" class="tab-item">
                <v-icon class="me-2">mdi-anchor</v-icon>
                <span class="tab-text">Marines</span>
              </v-tab>
              <v-tab value="bountyHunters" class="tab-item">
                <v-icon class="me-2">mdi-target</v-icon>
                <span class="tab-text">Caçadores</span>
              </v-tab>
              <v-tab value="government" class="tab-item">
                <v-icon class="me-2">mdi-bank</v-icon>
                <span class="tab-text">Governo</span>
              </v-tab>
              <v-tab value="supernovas" class="tab-item">
                <v-icon class="me-2">mdi-star-shooting</v-icon>
                <span class="tab-text">Supernovas</span>
              </v-tab>
            </v-tabs>
          </v-card>
        </v-col>
      </v-row>

      <!-- CONTENT AREA -->
      <div v-if="refreshLoading" class="loading-container">
        <v-row justify="center">
          <v-col cols="12" class="text-center">
            <v-card class="pa-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
                class="mb-4"
              />
              <div class="text-h6">Atualizando rankings...</div>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- RANKINGS CONTENT -->
      <v-window v-else v-model="activeTab">
        <!-- Yonkou Tab -->
        <v-window-item value="yonkou">
          <v-card variant="elevated" color="red-lighten-5">
            <v-card-title class="text-red-darken-3">
              <v-icon left color="red-darken-3">mdi-crown</v-icon>
              👑 OS QUATRO IMPERADORES
            </v-card-title>
            <v-card-subtitle class="text-red-darken-2">
              Os piratas mais poderosos do Novo Mundo
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.yonkou"
                :max-items="4"
                special-badge="Yonkou"
                badge-color="red"
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Shichibukai Tab -->
        <v-window-item value="shichibukai">
          <v-card variant="elevated" color="purple-lighten-5">
            <v-card-title class="text-purple-darken-3">
              <v-icon left color="purple-darken-3">mdi-shield-crown</v-icon>
              ⚔️ OS SETE CORSÁRIOS
            </v-card-title>
            <v-card-subtitle class="text-purple-darken-2">
              Piratas sancionados pelo Governo Mundial
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.shichibukai"
                :max-items="7"
                special-badge="Shichibukai"
                badge-color="purple"
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Admirals Tab -->
        <v-window-item value="admirals">
          <v-card variant="elevated" color="blue-lighten-5">
            <v-card-title class="text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-star-circle</v-icon>
              ⭐ ALMIRANTES DA MARINHA
            </v-card-title>
            <v-card-subtitle class="text-blue-darken-2">
              Os oficiais de mais alto escalão da Marinha
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.admirals"
                special-badge="Almirante"
                badge-color="blue"
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Gorousei Tab -->
        <v-window-item value="gorousei">
          <v-card variant="elevated" color="grey-lighten-4">
            <v-card-title class="text-grey-darken-4">
              <v-icon left color="grey-darken-4">mdi-account-star</v-icon>
              🌟 AS CINCO ESTRELAS ANCIÃS
            </v-card-title>
            <v-card-subtitle class="text-grey-darken-3">
              A mais alta autoridade do Governo Mundial
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.gorousei"
                :max-items="5"
                special-badge="Gorousei"
                badge-color="grey-darken-2"
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Pirates Tab -->
        <v-window-item value="pirates">
          <v-card variant="elevated" color="red-lighten-5">
            <v-card-title class="text-red-darken-3">
              <v-icon left color="red-darken-3">mdi-pirate</v-icon>
              🏴‍☠️ RANKING DE PIRATAS
            </v-card-title>
            <v-card-subtitle class="text-red-darken-2">
              Todos os piratas classificados por recompensa
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.pirates"
                show-pagination
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Marines Tab -->
        <v-window-item value="marines">
          <v-card variant="elevated" color="blue-lighten-5">
            <v-card-title class="text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-anchor</v-icon>
              ⚓ RANKING DE MARINES
            </v-card-title>
            <v-card-subtitle class="text-blue-darken-2">
              Todos os marines classificados por patente
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.marines"
                show-pagination
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Bounty Hunters Tab -->
        <v-window-item value="bountyHunters">
          <v-card variant="elevated" color="green-lighten-5">
            <v-card-title class="text-green-darken-3">
              <v-icon left color="green-darken-3">mdi-target</v-icon>
              🎯 RANKING DE CAÇADORES
            </v-card-title>
            <v-card-subtitle class="text-green-darken-2">
              Todos os caçadores de recompensa classificados
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.bountyHunters"
                show-pagination
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Government Tab -->
        <v-window-item value="government">
          <v-card variant="elevated" color="orange-lighten-5">
            <v-card-title class="text-orange-darken-3">
              <v-icon left color="orange-darken-3">mdi-bank</v-icon>
              🏛️ RANKING DO GOVERNO
            </v-card-title>
            <v-card-subtitle class="text-orange-darken-2">
              Todos os agentes governamentais classificados
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.government"
                show-pagination
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Supernovas Tab -->
        <v-window-item value="supernovas">
          <v-card variant="elevated" color="orange-lighten-5">
            <v-card-title class="text-orange-darken-3">
              <v-icon left color="orange-darken-3">mdi-star-shooting</v-icon>
              🌟 CANDIDATOS A SUPERNOVA
            </v-card-title>
            <v-card-subtitle class="text-orange-darken-2">
              Piratas em ascensão no Paraíso (Ilhas dificuldade ≤ 14)
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.supernovas"
                :max-items="15"
                special-badge="Candidato"
                badge-color="orange"
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </div>

    <!-- Character Details Dialog -->
    <CharacterDetailsDialog
      v-model="characterDialog"
      :character="selectedCharacter"
      :all-devil-fruits="rankings.allDevilFruits"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { WorldEncyclopedia, type WorldRankings, type PlayerRankingInfo, type RankingCharacter } from '@/utils/worldEncyclopedia'
import RankingSection from '@/components/RankingSection.vue'
import CharacterDetailsDialog from '@/components/CharacterDetailsDialog.vue'
import AvataaarsAvatar from '@/components/AvataaarsAvatar.vue'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'
import WantedPoster from '@/components/WantedPoster.vue'
const characterStore = useCharacterStore()

// Loading states
const initialLoading = ref(true)
const refreshLoading = ref(false)
const loadingStep = ref(0)

// Data
const activeTab = ref('yonkou')
const showStats = ref(false)
const rankings = ref<WorldRankings>({
  yonkou: [],
  shichibukai: [],
  admirals: [],
  gorousei: [],
  pirates: [],
  marines: [],
  bountyHunters: [],
  government: [],
  supernovas: [],
  playerInfo: null,
  allDevilFruits: []
})
const worldStats = ref(null)
const playerInfo = ref<PlayerRankingInfo | null>(null)

// Dialog
const characterDialog = ref(false)
const selectedCharacter = ref<RankingCharacter | null>(null)

// Computed
const playerCharacter = computed(() => characterStore.playerCharacter)

// Methods
const loadRankings = async (isInitial = false): Promise<void> => {
  if (isInitial) {
    initialLoading.value = true
    loadingStep.value = 0
  } else {
    refreshLoading.value = true
  }

  try {
    if (isInitial) {
      loadingStep.value = 1
      await new Promise(resolve => setTimeout(resolve, 500))
      
      loadingStep.value = 2
      await new Promise(resolve => setTimeout(resolve, 500))
      
      loadingStep.value = 3
      await new Promise(resolve => setTimeout(resolve, 500))
      
      loadingStep.value = 4
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const [worldRankings, stats] = await Promise.all([
      WorldEncyclopedia.generateWorldRankings(playerCharacter.value?.id),
      WorldEncyclopedia.getWorldStats()
    ])

    rankings.value = worldRankings
    worldStats.value = stats
    playerInfo.value = worldRankings.playerInfo

    if (isInitial) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  } catch (error) {
    console.error('Failed to load rankings:', error)
  } finally {
    if (isInitial) {
      initialLoading.value = false
      loadingStep.value = 0
    } else {
      refreshLoading.value = false
    }
  }
}

const refreshRankings = (): void => {
  loadRankings(false)
}

const showCharacterDetails = (character: RankingCharacter): void => {
  selectedCharacter.value = character
  characterDialog.value = true
}


const formatType = (type: string): string => {
  return type.replace(/([A-Z])/g, ' $1').trim()
}

const formatBounty = (bounty: number): string => {
  if (bounty >= 1000000000) {
    return `${(bounty / 1000000000).toFixed(1)}B`
  } else if (bounty >= 1000000) {
    return `${(bounty / 1000000).toFixed(1)}M`
  } else if (bounty >= 1000) {
    return `${(bounty / 1000).toFixed(1)}K`
  }
  return bounty.toString()
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  await loadRankings(true)
})

const getPlayerCardClass = (): string => {
  if (!playerInfo.value) return ''
  
  const rank = playerInfo.value.rank
  if (rank === 1) return 'rank-first'
  if (rank <= 3) return 'rank-top3'
  if (rank <= 10) return 'rank-top10'
  if (rank <= 50) return 'rank-top50'
  return 'rank-normal'
}

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'amber'
  if (rank <= 3) return 'grey-lighten-1'
  if (rank <= 10) return 'blue'
  if (rank <= 50) return 'green'
  return 'grey'
}

const getRankTitle = (rank: number): string => {
  if (rank === 1) return 'LENDA'
  if (rank <= 3) return 'ELITE'
  if (rank <= 10) return 'VETERANO'
  if (rank <= 50) return 'EXPERIENTE'
  if (rank <= 100) return 'COMPETENTE'
  return 'INICIANTE'
}

const getPercentile = (): number => {
  if (!playerInfo.value) return 0
  const { rank, totalInCategory } = playerInfo.value
  return Math.round(((totalInCategory - rank) / totalInCategory) * 100)
}

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

const getProgressToNextRank = (): string => {
  // Lógica para calcular o que falta para o próximo rank
  return 'Melhore suas stats'
}

const getProgressPercentage = (): number => {
  // Lógica para calcular porcentagem de progresso
  return 65 // Exemplo
}

const getAchievementBadge = (): boolean => {
  if (!playerInfo.value) return false
  return playerInfo.value.rank <= 10
}

const getAchievementColor = (): string => {
  if (!playerInfo.value) return 'info'
  const rank = playerInfo.value.rank
  if (rank === 1) return 'amber'
  if (rank <= 3) return 'purple'
  if (rank <= 10) return 'blue'
  return 'info'
}

const getAchievementIcon = (): string => {
  if (!playerInfo.value) return 'mdi-trophy'
  const rank = playerInfo.value.rank
  if (rank === 1) return 'mdi-crown'
  if (rank <= 3) return 'mdi-medal'
  if (rank <= 10) return 'mdi-trophy'
  return 'mdi-star'
}

const getAchievementTitle = (): string => {
  if (!playerInfo.value) return ''
  const rank = playerInfo.value.rank
  if (rank === 1) return '🏆 IMPERADOR DOS MARES!'
  if (rank <= 3) return '⭐ TOP 3 MUNDIAL!'
  if (rank <= 10) return '🎖️ TOP 10 MUNDIAL!'
  return '🌟 Excelente Posição!'
}

const getAchievementDescription = (): string => {
  if (!playerInfo.value) return ''
  const rank = playerInfo.value.rank
  if (rank === 1) return 'Você é o mais poderoso do mundo! Parabéns!'
  if (rank <= 3) return 'Entre os 3 mais fortes do mundo! Incrível!'
  if (rank <= 10) return 'Entre os 10 mais fortes! Continue assim!'
  return 'Você está indo muito bem!'
}
</script>

<style scoped>
.player-position-card {
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.player-position-card.rank-first {
  border-color: #FFC107;
  box-shadow: 0 0 30px rgba(255, 193, 7, 0.3);
}

.player-position-card.rank-top3 {
  border-color: #9E9E9E;
  box-shadow: 0 0 25px rgba(158, 158, 158, 0.3);
}

.player-position-card.rank-top10 {
  border-color: #2196F3;
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.3);
}

.player-header {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  position: relative;
}

.player-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-white-secondary {
  color: rgba(255, 255, 255, 0.7) !important;
}

.poster-container {
  position: relative;
  display: inline-block;
}

.player-poster {
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.3));
}

.player-badge-overlay {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 10;
}

.player-chip {
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.rank-info-section {
  padding: 0 16px;
}

.main-rank {
  text-align: center;
  margin-bottom: 24px;
}

.rank-number {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 12px;
}

.rank-hash {
  font-size: 2rem;
  font-weight: 300;
  color: rgba(0, 0, 0, 0.6);
  margin-right: 4px;
}

.rank-value {
  font-size: 4rem;
  font-weight: bold;
  color: #1976D2;
  line-height: 1;
}

.rank-chip {
  font-size: 1rem !important;
  font-weight: bold;
  padding: 8px 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(25, 118, 210, 0.05);
  border: 1px solid rgba(25, 118, 210, 0.1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(25, 118, 210, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(25, 118, 210, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1976D2;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 2px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-bar {
  border-radius: 4px;
  overflow: hidden;
}

.achievement-alert {
  border-radius: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .rank-number {
    flex-direction: column;
    gap: 8px;
  }
  
  .rank-hash {
    font-size: 1.5rem;
    margin-right: 0;
  }
  
  .rank-value {
    font-size: 3rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}

/* Animations */
@keyframes rankGlow {
  0%, 100% { 
    text-shadow: 0 0 10px rgba(25, 118, 210, 0.3);
  }
  50% { 
    text-shadow: 0 0 20px rgba(25, 118, 210, 0.6);
  }
}

.rank-value {
  animation: rankGlow 3s ease-in-out infinite;
}
.world-encyclopedia-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
}

.loading-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.step-item.completed {
  background-color: rgba(76, 175, 80, 0.1);
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.text-h6 {
  font-weight: 600;
}

.v-btn {
  border-radius: 8px;
  font-weight: 600;
}

.v-chip {
  font-weight: 700 !important;
}

.rank-display {
  text-align: center;
}

.tab-item {
  min-width: 120px;
}

.tab-text {
  display: none;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

/* CORES CUSTOMIZADAS */
.text-blue-darken-3 { color: #1565c0 !important; }
.text-green-darken-3 { color: #2e7d32 !important; }
.text-orange-darken-3 { color: #ef6c00 !important; }
.text-purple-darken-3 { color: #6a1b9a !important; }
.text-red-darken-3 { color: #c62828 !important; }
.text-yellow-darken-4 { color: #f57f17 !important; }
.text-cyan-darken-3 { color: #00838f !important; }
.text-grey-darken-4 { color: #424242 !important; }

.text-blue-darken-2 { color: #1976d2 !important; }
.text-green-darken-2 { color: #388e3c !important; }
.text-orange-darken-2 { color: #f57c00 !important; }
.text-purple-darken-2 { color: #7b1fa2 !important; }
.text-red-darken-2 { color: #d32f2f !important; }
.text-yellow-darken-3 { color: #f9a825 !important; }
.text-cyan-darken-2 { color: #0097a7 !important; }
.text-grey-darken-3 { color: #616161 !important; }

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
  .world-encyclopedia-container {
    padding: 8px;
  }
  
  .tab-text {
    display: inline;
  }
  
  .tab-item {
    min-width: auto;
  }
}

@media (min-width: 769px) {
  .tab-text {
    display: inline;
  }
}
</style>