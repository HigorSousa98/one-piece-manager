<!-- src/components/NavigationResultModal.vue -->
<template>
  <v-card class="navigation-result-modal" max-width="600">
    
    <!-- HEADER -->
    <v-card-title class="bg-blue-darken-2 text-white pa-4">
      <v-icon left color="white" size="large">mdi-compass</v-icon>
      <span class="text-h5">🏝️ Navegação Concluída!</span>
    </v-card-title>
    
    <!-- CONTEÚDO PRINCIPAL -->
    <v-card-text class="pa-6">
      
      <!-- INFORMAÇÕES DA ILHA DESTINO -->
      <div class="destination-info mb-6">
        <div class="text-center mb-4">
          <v-avatar 
            size="80" 
            :color="getDifficultyColor(result.destinationIsland?.difficulty || 1)"
            class="mb-3"
          >
            <v-icon size="40" color="white">mdi-island</v-icon>
          </v-avatar>
          
          <div class="text-h4 mb-2">{{ result.destinationIsland?.name || 'Ilha Desconhecida' }}</div>
          
          <v-chip 
            :color="getDifficultyColor(result.destinationIsland?.difficulty || 1)" 
            size="large" 
            variant="elevated"
            class="mb-2"
          >
            <v-icon left>mdi-star</v-icon>
            Dificuldade {{ result.destinationIsland?.difficulty || 1 }}
          </v-chip>
          
          <div class="text-body-1 text-grey-darken-1">
            {{ getDifficultyName(result.destinationIsland?.difficulty || 1) }}
          </div>
        </div>
        
        <!-- HISTÓRIA DA NAVEGAÇÃO -->
        <v-card variant="outlined" color="blue-darken-1" class="mb-4">
          <v-card-text class="pa-4">
            <div class="text-h6 mb-3 text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-book-open</v-icon>
              História da Viagem
            </div>
            <div class="story-text">
              {{ result.battleStory || 'Após uma navegação tranquila, vocês chegaram à nova ilha sem intercorrências.' }}
            </div>
          </v-card-text>
        </v-card>
      </div>
      
      <!-- ENCONTRO COM BANDO INIMIGO -->
      <div v-if="result.enemyCrew" class="enemy-encounter mb-6">
        <v-alert
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <v-icon left>mdi-sword-cross</v-icon>
          <strong>Bando Inimigo Avistado!</strong>
        </v-alert>
        
        <v-card variant="outlined" color="red-darken-1" class="mb-4">
          <v-card-text class="pa-4">
            <div class="d-flex align-center mb-3">
              <v-avatar 
                size="60" 
                :color="getCrewTypeColor(result.enemyCrew.type || 'Unknown')"
                class="mr-3"
              >
                <span class="text-h5">{{ getCrewTypeIcon(result.enemyCrew.type || 'Unknown') }}</span>
              </v-avatar>
              
              <div>
                <div class="text-h5 text-red-darken-3">{{ result.enemyCrew.name }}</div>
                <div class="text-body-2 text-grey-darken-1 mb-2">
                  Bando {{ result.enemyCrew.type || 'Desconhecido' }}
                </div>
                <div class="d-flex gap-2">
                  <v-chip 
                    color="red-darken-2" 
                    size="small" 
                    variant="elevated"
                  >
                    Reputação: {{ result.enemyCrew.reputation || 0 }}
                  </v-chip>
                  <v-chip 
                    color="orange-darken-2" 
                    size="small" 
                    variant="elevated"
                  >
                    Membros: {{ result.enemyCrewSize || 1 }}
                  </v-chip>
                </div>
              </div>
            </div>
            
            <!-- OPÇÕES DE BATALHA -->
            <div class="battle-options">
              <div class="text-h6 mb-3 text-red-darken-3">
                <v-icon left color="red-darken-3">mdi-sword</v-icon>
                O que você deseja fazer?
              </div>
              
              <v-row>
                <v-col cols="12" md="6">
                  <v-btn
                    color="red-darken-2"
                    variant="elevated"
                    size="large"
                    block
                    @click="handleStartBattle"
                  >
                    <v-icon left>mdi-sword-cross</v-icon>
                    Iniciar Batalha
                  </v-btn>
                </v-col>
                <v-col cols="12" md="6">
                  <v-btn
                    color="blue-darken-2"
                    variant="outlined"
                    size="large"
                    block
                    @click="handleAvoidBattle"
                  >
                    <v-icon left>mdi-run-fast</v-icon>
                    Evitar Confronto
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </div>
      
      <!-- NAVEGAÇÃO PACÍFICA -->
      <div v-else class="peaceful-arrival mb-6">
        <v-alert
          type="success"
          variant="tonal"
          class="mb-4"
        >
          <v-icon left>mdi-check-circle</v-icon>
          <strong>Chegada Pacífica!</strong> Nenhum bando inimigo foi encontrado durante a viagem.
        </v-alert>
      </div>
      
      <!-- INFORMAÇÕES ADICIONAIS -->
      <v-card variant="outlined" color="green-darken-1">
        <v-card-text class="pa-4">
          <div class="text-h6 mb-3 text-green-darken-3">
            <v-icon left color="green-darken-3">mdi-information</v-icon>
            Informações da Chegada
          </div>
          
          <v-row>
            <v-col cols="12" md="6">
              <div class="info-item">
                <v-icon color="blue-darken-2" class="mr-2">mdi-map-marker</v-icon>
                <strong>Nova Localização:</strong> {{ result.destinationIsland?.name || 'Desconhecida' }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="info-item">
                <v-icon color="green-darken-2" class="mr-2">mdi-clock</v-icon>
                <strong>Tempo de Viagem:</strong> {{ formatTravelTime() }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="info-item">
                <v-icon color="purple-darken-2" class="mr-2">mdi-star</v-icon>
                <strong>Dificuldade:</strong> {{ getDifficultyName(result.destinationIsland?.difficulty || 1) }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="info-item">
                <v-icon color="orange-darken-2" class="mr-2">mdi-compass</v-icon>
                <strong>Status:</strong> Navegação Concluída
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      
    </v-card-text>
    
    <!-- AÇÕES -->
    <v-card-actions class="pa-4 bg-grey-darken-1">
      <v-spacer></v-spacer>
      
      <!-- BOTÃO EXPLORAR (se não há inimigos) -->
      <v-btn
        v-if="!result.enemyCrew"
        color="green-darken-2"
        variant="elevated"
        size="large"
        @click="handleExploreIsland"
      >
        <v-icon left>mdi-compass</v-icon>
        Explorar Ilha
      </v-btn>
      
      <!-- BOTÃO CONTINUAR (sempre disponível) -->
    </v-card-actions>
    
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import router from '@/router'
import type { Island, Crew } from '@/utils/database'

// 📊 PROPS
interface NavigationResult {
  crewId: number
  taskId: number
  destinationIsland?: Island
  enemyCrew?: Crew
  battleStory?: string
  enemyCrewSize?: number
}

const props = defineProps<{
  result: NavigationResult
}>()

// 📢 EMITS
const emit = defineEmits<{
  close: []
  startBattle: [battleData: { enemyCrew: Crew, island: Island }]
}>()

// 🎮 METHODS
const handleStartBattle = () => {
  if (props.result.enemyCrew && props.result.destinationIsland) {
    console.log('⚔️ Iniciando batalha contra:', props.result.enemyCrew.name)
    
    emit('startBattle', {
      enemyCrew: props.result.enemyCrew,
      island: props.result.destinationIsland
    })
  }
}

const handleAvoidBattle = () => {
  console.log('🏃 Evitando confronto...')
  handleClose()
}

const handleExploreIsland = () => {
  console.log('🗺️ Redirecionando para exploração da ilha...')
  router.push('/adventure')
  handleClose()
}

const handleClose = () => {
  emit('close')
}

// 🎨 HELPER FUNCTIONS
const getDifficultyName = (difficulty: number): string => {
  if (difficulty <= 2) return 'Fácil'
  if (difficulty <= 4) return 'Médio'
  if (difficulty <= 6) return 'Difícil'
  if (difficulty <= 8) return 'Muito Difícil'
  return 'Extremo'
}

const getDifficultyColor = (difficulty: number): string => {
  if (difficulty <= 2) return 'green'
  if (difficulty <= 4) return 'blue'
  if (difficulty <= 6) return 'orange'
  if (difficulty <= 8) return 'red'
  return 'purple'
}

const getCrewTypeColor = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'red-darken-2'
    case 'Marine': return 'blue-darken-2'
    case 'Government': return 'orange-darken-2'
    case 'BountyHunter': return 'green-darken-2'
    default: return 'grey-darken-2'
  }
}

const getCrewTypeIcon = (type: string): string => {
  switch (type) {
    case 'Pirate': return '🏴‍☠️'
    case 'Marine': return '⚓'
    case 'Government': return '🏛️'
    case 'BountyHunter': return '💰'
    default: return '❓'
  }
}

const formatTravelTime = (): string => {
  // Você pode calcular baseado nos dados da task se disponível
  return '30 minutos' // Placeholder
}
</script>

<style scoped>
/* NavigationResultModal - Voyage result */

.nav-result-header {
  padding: 20px;
  text-align: center;
  position: relative;
}

.nav-result-header.success {
  background: linear-gradient(135deg, rgba(21,101,192,0.2), rgba(0,137,123,0.1));
  border-bottom: 1px solid rgba(21,101,192,0.3);
}

.nav-result-header.failure {
  background: linear-gradient(135deg, rgba(198,40,40,0.2), rgba(183,28,28,0.1));
  border-bottom: 1px solid rgba(198,40,40,0.3);
}

.nav-result-title {
  font-family: Georgia, serif;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0;
}

.nav-result-title.success { color: #90CAF9; text-shadow: 0 0 16px rgba(144,202,249,0.4); }
.nav-result-title.failure { color: #FF5252; text-shadow: 0 0 16px rgba(255,82,82,0.4); }

.arrival-island-name {
  font-family: Georgia, serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #D4AF37;
  text-shadow: 0 0 10px rgba(212,175,55,0.35);
  margin: 8px 0;
}

.voyage-stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  padding: 7px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.voyage-stat-row:last-child { border-bottom: none; }

.voyage-stat-label { color: #8B9DC3; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.06em; }
.voyage-stat-value { color: #E8D5A3; font-weight: 600; }
.voyage-stat-value.gold { color: #D4AF37; }
</style>