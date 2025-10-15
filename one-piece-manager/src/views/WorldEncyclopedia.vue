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
          <v-card variant="elevated" class="mb-4" color="yellow-lighten-5">
            <v-card-title class="text-yellow-darken-4">
              <v-icon left color="yellow-darken-4">mdi-account-star</v-icon>
              👑 SUA POSIÇÃO NO MUNDO
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row align="center">
                <v-col cols="12" md="2" class="text-center">
                  <AvataaarsAvatar
                    v-if="playerCharacter"
                    :character="playerCharacter"
                    size="80"
                    variant="circle"
                    :show-status-indicators="false"
                    :show-level="false"
                    :show-power-rank="true"
                    :clickable="false"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <h3 class="text-h5 font-weight-bold mb-2">{{ playerCharacter?.name }}</h3>
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <v-chip
                      :color="getTypeColor(playerInfo.category)"
                      size="small"
                      variant="elevated"
                    >
                      {{ formatType(playerInfo.category) }}
                    </v-chip>
                    <CharacterBountyDisplay
                      v-if="playerCharacter"
                      :character="playerCharacter"
                      size="small"
                      variant="elevated"
                    />
                  </div>
                </v-col>
                <v-col cols="12" md="4" class="text-center">
                  <div class="rank-display">
                    <div class="text-h2 font-weight-bold text-yellow-darken-4">
                      #{{ playerInfo.rank }}
                    </div>
                    <div class="text-body-2 text-yellow-darken-3">
                      de {{ playerInfo.totalInCategory }} {{ formatType(playerInfo.category) }}s
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
              Piratas em ascensão no Paraíso (Ilhas dificuldade ≤ 15)
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

// Helper functions
const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    pirate: 'red',
    marine: 'blue',
    bountyHunter: 'green',
    government: 'purple'
  }
  return colors[type] || 'grey'
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
</script>

<style scoped>
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