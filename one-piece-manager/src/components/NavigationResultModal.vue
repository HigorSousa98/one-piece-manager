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
.navigation-result-modal {
  border-radius: 16px;
  overflow: hidden;
}

.destination-info {
  text-align: center;
}

.story-text {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.8);
  font-style: italic;
  background: rgba(255, 255, 255, 0.7);
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid rgba(25, 118, 210, 0.5);
}

.enemy-encounter {
  border-radius: 12px;
}

.battle-options {
  background: rgba(255, 255, 255, 0.8);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.peaceful-arrival {
  text-align: center;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.v-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.v-card-title {
  font-weight: 600;
}

.v-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
}

.v-chip {
  font-weight: 600;
}

.v-alert {
  border-radius: 12px;
  font-weight: 500;
}

/* ANIMAÇÕES */
.navigation-result-modal {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* RESPONSIVIDADE */
@media (max-width: 768px) {
  .v-card-text {
    padding: 16px !important;
  }
  
  .v-card-actions {
    padding: 16px !important;
  }
  
  .story-text {
    font-size: 0.9rem;
    padding: 12px;
  }
  
  .battle-options {
    padding: 12px;
  }
  
  .info-item {
    font-size: 0.875rem;
  }
}

/* CORES CUSTOMIZADAS */
.text-red-darken-3 { color: #c62828 !important; }
.text-blue-darken-3 { color: #1565c0 !important; }
.text-green-darken-3 { color: #2e7d32 !important; }
.text-orange-darken-3 { color: #ef6c00 !important; }
.text-purple-darken-3 { color: #6a1b9a !important; }
</style>