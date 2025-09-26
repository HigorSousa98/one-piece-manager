<!-- src/components/NavigationInterface.vue -->
<template>
  <v-card variant="elevated" class="navigation-interface">
    <v-card-title class="bg-blue-darken-2 text-white">
      <v-icon left color="white">mdi-compass</v-icon>
      🧭 Sistema de Navegação
    </v-card-title>
    
    <v-card-text class="pa-4">
      
      <!-- ✅ TAREFAS CONFLITANTES -->
      <div v-if="hasConflicts && !isNavigating" class="conflicts-section mb-4">
        <v-alert
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <v-icon left>mdi-alert-circle</v-icon>
          <strong>Não é possível navegar no momento</strong>
        </v-alert>
        
        <v-card variant="outlined" color="orange-darken-1" class="mb-4">
          <v-card-title class="bg-orange-darken-1 text-white">
            <v-icon left color="white">mdi-clipboard-alert</v-icon>
            Tarefas Ativas
          </v-card-title>
          
          <v-card-text class="pa-4">
            <div class="text-body-1 mb-3">
              {{ canNavigateReason }}
            </div>
            
            <div v-if="conflictingTasks.length > 0" class="conflicting-tasks">
              <div 
                v-for="task in conflictingTasks" 
                :key="task.id"
                class="conflict-item"
              >
                <div class="d-flex align-center mb-2">
                  <v-icon 
                    :color="getTaskInfo(task).color + '-darken-2'" 
                    class="mr-3"
                  >
                    {{ getTaskInfo(task).icon }}
                  </v-icon>
                  
                  <div class="task-info">
                    <div class="task-title">
                      {{ getTaskInfo(task).title }}
                    </div>
                    <div class="task-details">
                      Tempo restante: {{ getTaskInfo(task).timeRemaining }}
                    </div>
                  </div>
                  
                  <v-chip 
                    :color="getTaskInfo(task).color" 
                    size="small" 
                    variant="elevated"
                  >
                    {{ getTaskInfo(task).progress }}%
                  </v-chip>
                </div>
                
                <v-progress-linear
                  :model-value="getTaskInfo(task).progress"
                  :color="getTaskInfo(task).color + '-darken-2'"
                  height="6"
                  rounded
                  class="mb-2"
                ></v-progress-linear>
              </div>
            </div>
            
            <v-btn
              color="blue-darken-2"
              variant="outlined"
              size="small"
              @click="checkNavigationConflicts"
              class="mt-3"
            >
              <v-icon left>mdi-refresh</v-icon>
              Verificar Novamente
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
      
      <!-- NAVEGAÇÃO ATIVA -->
      <div v-else-if="isNavigating && currentTask" class="navigation-active mb-4">
        
        <!-- ✅ ESTADO DE FINALIZAÇÃO -->
        <v-alert
          v-if="isCompleting"
          type="success"
          variant="tonal"
          class="mb-4"
        >
          <v-icon left>mdi-check-circle</v-icon>
          <strong>Chegando ao destino e processando encontros...</strong>
        </v-alert>
        
        <!-- ESTADO NORMAL DE NAVEGAÇÃO -->
        <v-alert
          v-else
          type="info"
          variant="tonal"
          class="mb-4"
        >
          <v-icon left>mdi-ship-wheel</v-icon>
          <strong>Navegação em andamento!</strong>
        </v-alert>
        
        <v-card variant="outlined" color="blue-darken-1">
          <v-card-text class="pa-4">
            <div class="text-h6 mb-2 text-blue-darken-3">
              {{ currentTask.description }}
            </div>
            
            <div v-if="destinationIsland" class="destination-info mb-3">
              <v-card variant="outlined" color="green-darken-1" class="pa-3">
                <div class="d-flex align-center">
                  <v-icon color="green-darken-2" size="large" class="mr-3">mdi-island</v-icon>
                  <div>
                    <div class="text-h6 text-green-darken-3">
                      {{ destinationIsland.name }}
                    </div>
                    <div class="text-body-2 text-green-darken-2">
                      Dificuldade: {{ destinationIsland.difficulty }} • {{ getDifficultyName(destinationIsland.difficulty) }}
                    </div>
                  </div>
                  <v-spacer></v-spacer>
                  <v-chip 
                    :color="getDifficultyColor(destinationIsland.difficulty)" 
                    variant="elevated"
                    size="small"
                  >
                    Nível {{ destinationIsland.difficulty }}
                  </v-chip>
                </div>
              </v-card>
            </div>
            
            <div class="d-flex align-center gap-2 mb-3">
              <v-chip color="blue-darken-2" variant="elevated" size="small">
                <v-icon left>mdi-clock</v-icon>
                {{ Math.floor(currentTask.duration) }} min
              </v-chip>
              <v-chip color="purple-darken-2" variant="elevated" size="small">
                <v-icon left>mdi-ship</v-icon>
                Navio Nv. {{ shipLevel }}
              </v-chip>
            </div>
            
            <v-progress-linear
              :model-value="navigationProgress"
              color="blue-darken-2"
              height="12"
              rounded
              class="mb-2"
            >
              <template v-slot:default>
                <strong :class="navigationPercentage >= 52 ? 'text-white' : 'text-black'">{{ navigationPercentage }}%</strong>
              </template>
            </v-progress-linear>
            
            <div class="text-center text-caption">
              {{ isCompleting ? 'Processando chegada...' : `Tempo restante: ${formattedTimeRemaining}` }}
            </div>
          </v-card-text>
          
          <v-card-actions class="pa-4">
            <v-btn
              color="blue-darken-2"
              variant="outlined"
              disabled
              size="small"
            >
              <v-icon left>mdi-loading mdi-spin</v-icon>
              Processando...
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
      
      <!-- INICIAR NAVEGAÇÃO -->
      <div v-else class="navigation-selection">
        <div class="text-h6 mb-4 text-center">
          Explore novos mares e ilhas
        </div>
        
        <!-- INFORMAÇÕES DO NAVIO -->
        <v-card variant="outlined" color="blue-darken-1" class="mb-4">
          <v-card-text class="pa-4">
            <div class="text-h6 mb-2 text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-ship</v-icon>
              Informações do Navio
            </div>
            
            <div class="ship-info">
              <div class="info-item">
                <v-icon color="blue-darken-2" class="mr-2">mdi-speedometer</v-icon>
                <span>Nível do Navio: <strong>{{ shipLevel }}</strong></span>
              </div>
              
              <div class="info-item">
                <v-icon color="green-darken-2" class="mr-2">mdi-clock-fast</v-icon>
                <span>Tempo de Navegação: <strong>{{ navigationTime }} minutos</strong></span>
              </div>
              
              <div class="info-item">
                <v-icon color="purple-darken-2" class="mr-2">mdi-target</v-icon>
                <span>Destino: <strong>Ilha aleatória (40% mesma dif. / 60% +1 dif.)</strong></span>
              </div>
              
              <div class="info-item">
                <v-icon color="orange-darken-2" class="mr-2">mdi-sword-cross</v-icon>
                <span>Encontros: <strong>Possível batalha naval automática</strong></span>
              </div>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- ILHA ATUAL -->
        <v-card v-if="currentIsland" variant="outlined" color="green-darken-1" class="mb-4">
          <v-card-text class="pa-4">
            <div class="text-h6 mb-2 text-green-darken-3">
              <v-icon left color="green-darken-3">mdi-map-marker</v-icon>
              Localização Atual
            </div>
            
            <div class="d-flex align-center">
              <v-icon color="green-darken-2" size="large" class="mr-3">mdi-island</v-icon>
              <div>
                <div class="text-h6 text-green-darken-3">
                  {{ currentIsland.name }}
                </div>
                <div class="text-body-2 text-green-darken-2">
                  Dificuldade: {{ currentIsland.difficulty }} • {{ getDifficultyName(currentIsland.difficulty) }}
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-chip 
                :color="getDifficultyColor(currentIsland.difficulty)" 
                variant="elevated"
                size="small"
              >
                Nível {{ currentIsland.difficulty }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- AVISO IMPORTANTE -->
        <v-alert
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <v-icon left>mdi-alert</v-icon>
          <strong>Atenção:</strong> Durante a navegação, todas as outras ações ficam bloqueadas. 
          Ao chegar ao destino, você pode encontrar outros bandos em alto mar!
        </v-alert>
        
        <!-- BOTÃO NAVEGAR -->
        <v-btn
          color="blue-darken-2"
          variant="elevated"
          size="large"
          block
          class="mt-4"
          @click="confirmStartNavigation"
          :disabled="!canNavigate || hasConflicts"
          :loading="isStarting"
        >
          <v-icon left>mdi-compass</v-icon>
          {{ isStarting ? 'Preparando navegação...' : 'Iniciar Navegação' }}
        </v-btn>
        
        <!-- AVISO SE NÃO PODE NAVEGAR -->
        <v-alert
          v-if="hasConflicts"
          type="error"
          variant="tonal"
          class="mt-4"
        >
          <v-icon left>mdi-block-helper</v-icon>
          <strong>{{ canNavigateReason }}</strong>
        </v-alert>
      </div>
      
    </v-card-text>
    
    <!-- MODAL DE CANCELAMENTO -->
    <v-dialog v-model="showCancelDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="bg-red-darken-2 text-white">
          <v-icon left color="white">mdi-alert</v-icon>
          Cancelar Navegação
        </v-card-title>
        
        <v-card-text class="pa-4">
          <div class="text-center">
            <v-icon size="60" color="red-darken-2" class="mb-3">mdi-ship-wheel</v-icon>
            <div class="text-h6 mb-2">Tem certeza?</div>
            <div class="text-body-2 mb-3">
              A navegação será cancelada e você permanecerá na ilha atual.
            </div>
            
            <!-- INFORMAÇÕES DA NAVEGAÇÃO ATUAL -->
            <v-card variant="outlined" color="blue-darken-1" class="pa-3">
              <div class="text-body-2">
                <strong>Destino:</strong> {{ destinationIsland?.name || 'Desconhecido' }}
              </div>
              <div class="text-body-2">
                <strong>Progresso:</strong> {{ navigationPercentage }}%
              </div>
              <div class="text-body-2">
                <strong>Tempo Restante:</strong> {{ formattedTimeRemaining }}
              </div>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNavigation } from '@/composables/useNavigation'
import { NavigationSystem } from '@/utils/navigationSystem'
import { TrainingSystem } from '@/utils/trainingSystem'
import { db } from '@/utils/database'
import type { Island, Ship } from '@/utils/database'
import { useTimeRemaining } from '@/composables/useTimeRemaining'

interface Props {
  crewId: number
  characterId: number
}

const props = defineProps<Props>()


const emit = defineEmits<{
  navigationCompleted: [event: any]
}>()

// ✅ NAVIGATION COMPOSABLE
const {
  currentTask,
  isNavigating,
  navigationProgress,
  timeRemaining,
  formattedTimeRemaining,
  navigationPercentage,
  canNavigate,
  isCompleting,
  conflictingTasks,
  canNavigateReason,
  hasConflicts,
  destinationIsland,
  startNavigation,
  checkNavigationConflicts
} = useNavigation(props.crewId, props.characterId)

// ✅ REACTIVE DATA
const showCancelDialog = ref(false)
const isStarting = ref(false)
const isCanceling = ref(false)
const currentIsland = ref<Island | null>(null)
const shipLevel = ref(1)
const navigationTime = ref(30)

// ✅ COMPUTED
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

// ✅ METHODS
const loadNavigationData = async () => {
  try {
    // Carregar ilha atual
    const crew = await db.crews.get(props.crewId)
    if (crew) {
      const island = await db.islands.get(crew.currentIsland)
      currentIsland.value = island || null
    }
    
    // Carregar informações do navio
    const ship = await db.ships.where('crewId').equals(props.crewId).first()
    if (ship) {
      shipLevel.value = ship.level
      navigationTime.value = NavigationSystem.calculateNavigationTime(ship.level)
    }
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados de navegação:', error)
  }
}

const confirmStartNavigation = async () => {
  if (isStarting.value) return
  
  try {
    isStarting.value = true
    console.log('🚢 Iniciando navegação...')
    
    const success = await startNavigation()
    
    if (success) {
      console.log('✅ Navegação iniciada com sucesso!')
    } else {
      console.error('❌ Falha ao iniciar navegação')
    }
  } catch (error) {
    console.error('❌ Erro ao iniciar navegação:', error)
  } finally {
    isStarting.value = false
  }
}


// ✅ HELPER FUNCTIONS
const getTaskInfo = (task: any) => {
  return TrainingSystem.formatTaskInfo(task)
}

// ✅ LIFECYCLE
onMounted(async () => {
  console.log('🔄 NavigationInterface montado')
  
  await loadNavigationData()
  
  // Listener para quando a navegação for concluída
  window.addEventListener('navigationCompleted', (event) => {
    console.log('�� NavigationInterface recebeu evento de conclusão:', event)
    emit('navigationCompleted', event)
  })
})
</script>

<style scoped>
.navigation-interface {
  border-radius: 12px;
  overflow: hidden;
}

/* CONFLITOS */
.conflicts-section {
  border-radius: 8px;
}

.conflicting-tasks {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conflict-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border-left: 4px solid #ff9800;
}

.task-info {
  flex: 1;
}

.task-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.task-details {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
}

/* INFORMAÇÕES */
.ship-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  border-left: 3px solid rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.9);
}

.destination-info {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* COMPONENTES */
.v-card-title {
  font-weight: 600;
}

.v-btn {
  border-radius: 8px;
  font-weight: 600;
}

/* ANIMAÇÃO DE LOADING */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

/* CORES CUSTOMIZADAS */
.text-blue-darken-3 { color: #1565c0 !important; }
.text-green-darken-3 { color: #2e7d32 !important; }
.text-orange-darken-3 { color: #ef6c00 !important; }
.text-red-darken-3 { color: #c62828 !important; }

/* RESPONSIVIDADE */
@media (max-width: 960px) {
  .conflict-item {
    padding: 8px;
  }
  
  .task-title {
    font-size: 0.9rem;
  }
  
  .task-details {
    font-size: 0.8rem;
  }
  
  .ship-info {
    gap: 8px;
  }
  
  .info-item {
    padding: 6px;
    font-size: 0.875rem;
  }
}
</style>