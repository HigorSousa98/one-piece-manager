<!-- src/views/IslandExploration.vue -->
<template>
  <div class="island-exploration">
    
    <!-- LOADING STATE -->
    <div v-if="!allDataLoaded" class="loading-container">
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
              
              <div class="text-h6 mb-4">Carregando Exploração da Ilha</div>
              
              <!-- PROGRESSO DETALHADO -->
              <div class="loading-steps">
                <div class="step-item" :class="{ 'completed': playerCharacterLoaded }">
                  <v-icon :color="playerCharacterLoaded ? 'success' : 'grey'">
                    {{ playerCharacterLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Personagem</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': playerCrewLoaded }">
                  <v-icon :color="playerCrewLoaded ? 'success' : 'grey'">
                    {{ playerCrewLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Crew</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': activeTasksLoaded }">
                  <v-icon :color="activeTasksLoaded ? 'success' : 'grey'">
                    {{ activeTasksLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Tarefas Ativas</span>
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
          <v-card class="mb-4">
            <v-card-title class="text-center">
              <v-icon left size="large">mdi-island</v-icon>
              🏝️ EXPLORAÇÃO DA ILHA
            </v-card-title>
            <v-card-subtitle class="text-center">
              Explore a ilha e ajude os habitantes locais
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- TAREFAS ATIVAS COM MELHOR CONTRASTE -->
      <v-row v-if="activeTasks.length > 0">
        <v-col cols="12">
          <v-card class="mb-4" color="blue-lighten-5">
            <v-card-title class="text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-clipboard-list</v-icon>
              Tarefas Ativas ({{ activeTasks.length }})
            </v-card-title>
            <v-card-text>
              <div v-for="task in activeTasks" :key="task.id" class="mb-3">
                <v-alert type="info" variant="outlined" class="mb-2">
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <strong class="text-blue-darken-4">{{ task.description }}</strong>
                      <div class="text-caption text-blue-darken-2">📍 {{ task.location }}</div>
                    </div>
                    <div class="text-right">
                      <!-- CHIP COM MELHOR CONTRASTE -->
                      <v-chip 
                        :color="getTaskDifficultyColor(task.difficulty)" 
                        size="small"
                        variant="elevated"
                        class="difficulty-chip"
                      >
                        <strong>{{ task.difficulty.toUpperCase() }}</strong>
                      </v-chip>
                      <div class="mt-1">
                        <!-- TIMER RESPONSIVO -->
                        <TimeRemaining 
                          :end-time="task.endTime"
                          :start-time="task.startTime"
                          format="short"
                          :color-coded="true"
                          :show-urgency-badge="true"
                          :urgency-threshold="2"
                          @completed="onTaskCompleted(task.id!)"
                          @time-update="onTaskTimeUpdate(task.id!, $event)"
                          @urgent="onTaskUrgent(task.id!, $event)"
                        />
                      </div>
                    </div>
                  </div>
                </v-alert>
                
                <!-- BARRA DE PROGRESSO RESPONSIVA -->
                <TaskProgressBar 
                  :task="task"
                  @progress-update="onTaskProgressUpdate(task.id!, $event)"
                />
                
                <!-- BOTÃO COMPLETAR -->
                <div v-if="getTaskProgress(task) === 100 && task.type =='exploration'" class="text-center mt-2">
                  <v-btn
                    color="success"
                    @click="completeTask(task.id!)"
                    :loading="completingTask === task.id"
                    class="pulse-animation"
                    variant="elevated"
                  >
                    <v-icon left>mdi-check</v-icon>
                    Completar Tarefa
                  </v-btn>
                </div>
                <div v-else-if="getTaskProgress(task) === 100 && task.type =='training'" class="text-center mt-2">
                  <v-btn
                    color="success"
                    @click="goToTraining"
                    class="pulse-animation"
                    variant="elevated"
                  >
                    <v-icon left>mdi-check</v-icon>
                    Ir para Training
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- BOTÃO EXPLORAR -->
      <v-row v-if="!currentEncounter && activeTasks.length === 0">
        <v-col cols="12">
          <v-card>
            <v-card-text class="text-center py-8">
              <v-icon size="80" color="primary" class="mb-4">mdi-compass</v-icon>
              <div class="text-h5 mb-4">Explorar a Ilha</div>
              <div class="text-body-1 mb-6">
                Caminhe pela ilha e encontre pessoas que precisam de ajuda.
              </div>
              
              <!-- INFO DA ILHA ATUAL -->
              <v-card variant="outlined" class="mb-4 mx-auto" style="max-width: 400px;">
                <v-card-text>
                  <div class="text-h6 mb-2">🏝️ Ilha Atual</div>
                  <div class="text-body-2">
                    <strong>Nome:</strong> {{ islandName || 'Desconhecida' }}
                  </div>
                  <div class="text-body-2">
                    <strong>Sua bondade:</strong> 
                    <v-chip :color="getKindnessColor(playerCharacter?.kindness || 0)" size="small" class="ml-2" variant="elevated">
                      <strong>{{ playerCharacter?.kindness || 0 }}</strong>
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
              
              <v-btn
                color="primary"
                size="x-large"
                :disabled="!canExplore"
                @click="exploreIsland"
                :loading="exploring"
                variant="elevated"
              >
                <v-icon left>mdi-walk</v-icon>
                {{ exploring ? 'Explorando...' : 'EXPLORAR ILHA' }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- ENCONTRO COM CIVIL -->
      <v-row v-if="currentEncounter">
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-icon left>mdi-account</v-icon>
              Encontro em {{ currentEncounter.location }}
            </v-card-title>
            
            <v-card-text>
              <!-- DESCRIÇÃO DO ENCONTRO -->
              <v-alert 
                :type="getEncounterAlertType(currentEncounter.urgency) as 'success' | 'error' | 'info' | 'warning'"
                class="mb-4"
                variant="elevated"
              >
                {{ currentEncounter.description }}
              </v-alert>
              
              <!-- INFO DO CIVIL -->
              <v-row class="mb-4">
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title>
                      <v-avatar color="success" class="mr-2">
                        <span>👤</span>
                      </v-avatar>
                      {{ currentEncounter.civilian.name }}
                    </v-card-title>
                    <v-card-text>
                      <v-chip color="green-darken-2" class="mb-2" variant="elevated">
                        <strong>{{ currentEncounter.civilian.type }}</strong>
                      </v-chip>
                      <v-chip color="blue-darken-2" class="mb-2 ml-2" variant="elevated">
                        <strong>Level {{ currentEncounter.civilian.level }}</strong>
                      </v-chip>
                      
                      <v-divider class="my-3"></v-divider>
                      
                      <div class="text-center">
                        <div class="text-body-2">
                          <strong>Kindness do Civil:</strong> 
                          <v-chip :color="getKindnessColor(currentEncounter.civilian.kindness)" size="small" class="ml-1" variant="elevated">
                            <strong>{{ currentEncounter.civilian.kindness }}</strong>
                          </v-chip>
                        </div>
                        <div class="text-body-2 mt-2">
                          <strong>Loyalty Atual:</strong> 
                          <v-chip :color="getLoyaltyColor(currentEncounter.civilian.loyalty)" size="small" class="ml-1" variant="elevated">
                            <strong>{{ currentEncounter.civilian.loyalty }}</strong>
                          </v-chip>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <!-- OPÇÕES DE TAREFA -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title>
                      <v-icon left>mdi-hand-heart</v-icon>
                      Como Ajudar?
                    </v-card-title>
                    <v-card-text>
                      <div v-for="option in currentEncounter.taskOptions" :key="option.id" class="mb-3">
                        <v-card variant="outlined" :color="getTaskOptionColor(option.difficulty)">
                          <v-card-text class="pa-3">
                            <div class="d-flex justify-space-between align-center mb-2">
                              <strong>{{ option.name }}</strong>
                              <v-chip :color="getTaskDifficultyColor(option.difficulty)" size="small" variant="elevated" class="difficulty-chip">
                                <strong>{{ option.difficulty.toUpperCase() }}</strong>
                              </v-chip>
                            </div>
                            
                            <div class="text-body-2 mb-2">
                              {{ option.description }}
                            </div>
                            
                            <div class="text-caption mb-3">
                              <div>⏰ Duração: {{ option.duration }} minutos</div>
                              <div>�� Bondade: +{{ option.kindnessReward }}</div>
                              <div>⭐ Experiência: +{{ option.experienceReward }}</div>
                              <div v-if="option.bountyReward">💰 Bounty: +{{ option.bountyReward }}</div>
                            </div>
                            
                            <v-btn
                              :color="getTaskDifficultyColor(option.difficulty)"
                              size="small"
                              class="mt-2"
                              @click="acceptTask(option)"
                              :disabled="acceptingTask"
                              block
                              variant="elevated"
                            >
                              <v-icon left>mdi-hand-heart</v-icon>
                              Aceitar Ajudar
                            </v-btn>
                          </v-card-text>
                        </v-card>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- AÇÕES -->
              <v-row>
                <v-col cols="12" class="text-center">
                  <v-btn
                    color="error"
                    @click="refuseHelp"
                    :disabled="acceptingTask"
                    class="mr-4"
                    variant="elevated"
                  >
                    <v-icon left>mdi-close</v-icon>
                    Recusar Ajuda
                  </v-btn>
                  
                  <v-btn
                    color="grey"
                    @click="leaveEncounter"
                    :disabled="acceptingTask"
                    variant="elevated"
                  >
                    <v-icon left>mdi-walk</v-icon>
                    Ir Embora
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- RESULTADO DE TAREFA COMPLETADA -->
      <v-dialog v-model="showTaskResult" max-width="500">
        <v-card v-if="taskResult">
          <v-card-title class="text-center">
            <v-icon left size="large" :color="taskResult.success ? 'success' : 'error'">
              {{ taskResult.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
            </v-icon>
            {{ taskResult.success ? 'Tarefa Completada!' : 'Erro na Tarefa' }}
          </v-card-title>
          
          <v-card-text v-if="taskResult.success">
            <div class="text-center mb-4">
              <div class="text-h6 mb-2">{{ taskResult.message }}</div>
              
              <!-- RECOMPENSAS -->
              <v-card variant="outlined" color="success" class="mb-4">
                <v-card-text>
                  <div class="text-h6 mb-2">🎁 Recompensas Recebidas:</div>
                  <div class="text-body-1">
                    <div>⭐ Experiência: +{{ taskResult.rewards?.experience }}</div>
                    <div>💚 Kindness: +{{ taskResult.rewards?.kindness }}</div>
                    <div v-if="taskResult.rewards?.bounty">💰 Bounty: +{{ taskResult.rewards.bounty }}</div>
                  </div>
                </v-card-text>
              </v-card>
              
              <!-- OPÇÃO DE RECRUTAMENTO -->
              <div v-if="taskResult.canRecruit && taskResult.civilian">
                <v-alert type="info" class="mb-4" variant="elevated">
                  <div class="text-center">
                    <strong>🤝 Oportunidade de Recrutamento!</strong><br>
                    {{ taskResult.civilian.name }} ficou muito impressionado com sua ajuda.
                    Você pode tentar recrutá-lo para seu crew!
                  </div>
                </v-alert>
                
                <v-btn
                  color="primary"
                  @click="showRecruitmentOption"
                  block
                  class="mb-2"
                  variant="elevated"
                >
                  <v-icon left>mdi-account-plus</v-icon>
                  Tentar Recrutar {{ taskResult.civilian.name }}
                </v-btn>
              </div>
            </div>
          </v-card-text>
          
          <v-card-text v-else>
            <div class="text-center">
              <div class="text-body-1">{{ taskResult.message }}</div>
            </div>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="closeTaskResult" variant="elevated">
              Continuar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- MODAL DE RECRUTAMENTO DE CIVIL -->
      <v-dialog v-model="showRecruitmentModal" max-width="600">
        <CivilianRecruitmentModal
          v-if="recruitmentTarget"
          :recruiter="playerCharacter!"
          :civilian="recruitmentTarget"
          @close="closeRecruitmentModal"
          @recruitment-success="handleRecruitmentSuccess"
          @recruitment-failed="handleRecruitmentFailed"
        />
      </v-dialog>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { useTimeRemaining } from '@/composables/useTimeRemaining'
import { IslandExplorationSystem, type CivilianEncounter, type TaskOption } from '@/utils/islandExplorationSystem'
import { CivilianRecruitmentSystem } from '@/utils/civilianRecruitmentSystem'
import { useRouter } from 'vue-router'
import TimeRemaining from '@/components/TimeRemaining.vue'
import TaskProgressBar from '@/components/TaskProgressBar.vue'
import CivilianRecruitmentModal from '@/components/CivilianRecruitmentModal.vue'
import type { Character, Task } from '@/utils/database'

const characterStore = useCharacterStore()
const router = useRouter()

// 🕒 USAR COMPOSABLE DE TIMER
const { formatTimeRemaining } = useTimeRemaining()

// 🔄 LOADING STATES
const playerCharacterLoaded = ref(false)
const playerCrewLoaded = ref(false)
const activeTasksLoaded = ref(false)

// 🎯 REACTIVE DATA
const currentEncounter = ref<CivilianEncounter | null>(null)
const activeTasks = ref<Task[]>([])
const exploring = ref(false)
const acceptingTask = ref(false)
const completingTask = ref<number | null>(null)
const canExplore = ref(true)
const nextExplorationTime = ref<Date | null>(null)

// Resultados de tarefa
const showTaskResult = ref(false)
const taskResult = ref<any>(null)
const islandName = ref('')

// Recrutamento
const showRecruitmentModal = ref(false)
const recruitmentTarget = ref<Character | null>(null)

// 📊 COMPUTED
const playerCharacter = computed(() => characterStore.playerCharacter)
const playerCrew = computed(() => characterStore.playerCrew)

// ✅ COMPUTED PARA VERIFICAR SE TODOS OS DADOS ESTÃO CARREGADOS
const allDataLoaded = computed(() => {
  return playerCharacterLoaded.value && playerCrewLoaded.value && activeTasksLoaded.value
})

// 👀 WATCHERS PARA DETECTAR QUANDO OS DADOS SÃO CARREGADOS
watch(() => playerCharacter.value, (newValue) => {
  if (newValue) {
    console.log('✅ PlayerCharacter carregado:', newValue.name)
    playerCharacterLoaded.value = true
  }
}, { immediate: true })

watch(() => playerCrew.value, (newValue) => {
  if (newValue) {
    console.log('✅ PlayerCrew carregado:', newValue.name)
    playerCrewLoaded.value = true
  }
}, { immediate: true })

// 🔄 CARREGAMENTO SEQUENCIAL
const loadDataSequentially = async () => {
  try {
    console.log('🔄 Iniciando carregamento sequencial...')
    
    // 1. Aguardar playerCharacter e playerCrew estarem disponíveis
    while (!playerCharacter.value || !playerCrew.value) {
      console.log('⏳ Aguardando playerCharacter e playerCrew...')
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('✅ PlayerCharacter e PlayerCrew disponíveis')

    // Carregar nome da ilha
    try {
      islandName.value = await IslandExplorationSystem.getCurrentIsland(playerCrew.value.currentIsland)
    } catch (error) {
      console.error('❌ Erro ao carregar nome da ilha:', error)
      islandName.value = 'Ilha Desconhecida'
    }
    
    // 2. Carregar tarefas ativas
    console.log('🔄 Carregando tarefas ativas...')
    await loadActiveTasks()
    
    console.log('✅ Todos os dados carregados!')
    
  } catch (error) {
    console.error('❌ Erro no carregamento sequencial:', error)
  }
}

// 🎮 METHODS
const exploreIsland = async () => {
  console.log('🚀 Iniciando exploração...')
  console.log('Player:', playerCharacter.value?.name)
  console.log('Crew:', playerCrew.value?.name)
  console.log('Ilha atual:', playerCrew.value?.currentIsland)
  
  if (!playerCharacter.value || !playerCrew.value) {
    console.error('❌ Dados necessários não estão disponíveis')
    return
  }
  
  exploring.value = true
  
  try {
    const islandId = playerCrew.value.currentIsland
    
    const result = await IslandExplorationSystem.exploreIsland(playerCharacter.value, islandId)
    console.log('📊 Resultado da exploração:', result)
    
    if (result.success && result.encounterFound && result.encounter) {
      currentEncounter.value = result.encounter
      console.log('👥 Encontro gerado:', result.encounter.civilian.name)
    } else {
      console.log('🚫 Nenhum encontro desta vez')
    }
    
    // Atualizar cooldown de exploração
    nextExplorationTime.value = result.nextExplorationAvailable
    //canExplore.value = new Date() >= result.nextExplorationAvailable
    
  } catch (error) {
    console.error('❌ Erro na exploração:', error)
  } finally {
    exploring.value = false
  }
}

const acceptTask = async (taskOption: TaskOption) => {
  if (!playerCharacter.value || !currentEncounter.value) return
  
  acceptingTask.value = true
  
  try {
    const result = await IslandExplorationSystem.acceptTask(
      playerCharacter.value,
      currentEncounter.value.civilian,
      taskOption,
      currentEncounter.value.location
    )
    
    if (result.success) {
      console.log('✅ Tarefa aceita:', taskOption.name)
      currentEncounter.value = null
      await loadActiveTasks()
      await characterStore.loadPlayerCharacter()
    }
    
  } catch (error) {
    console.error('❌ Erro ao aceitar tarefa:', error)
  } finally {
    acceptingTask.value = false
  }
}

const refuseHelp = async () => {
  if (!playerCharacter.value || !currentEncounter.value) return
  
  try {
    const firstOption = currentEncounter.value.taskOptions[0]
    
    if (firstOption) {
      const result = await IslandExplorationSystem.refuseTask(
        playerCharacter.value,
        currentEncounter.value.civilian,
        firstOption
      )
      
      if (result.success) {
        console.log('💔 Ajuda recusada, kindness reduzido')
        await characterStore.loadPlayerCharacter()
      }
    }
    
    currentEncounter.value = null
    
  } catch (error) {
    console.error('❌ Erro ao recusar ajuda:', error)
  }
}

const leaveEncounter = () => {
  console.log('🚶 Saindo do encontro')
  currentEncounter.value = null
}

const goToTraining = () => {
  router.push('/training')
}

const completeTask = async (taskId: number) => {
  completingTask.value = taskId
  
  try {
    const result = await IslandExplorationSystem.completeTask(taskId)
    
    if (result.success) {
      console.log('✅ Tarefa completada:', result.message)
      taskResult.value = result
      showTaskResult.value = true
      
      await characterStore.loadPlayerCharacter()
      await loadActiveTasks()
      
    }
    
  } catch (error) {
    console.error('❌ Erro ao completar tarefa:', error)
  } finally {
    completingTask.value = null
  }
}

const loadActiveTasks = async () => {
  if (!playerCharacter.value) {
    console.log('⚠️ PlayerCharacter não disponível para carregar tarefas')
    return
  }
  
  try {
    console.log('🔄 Carregando tarefas ativas...')
    activeTasks.value = await IslandExplorationSystem.getActiveTasks(playerCharacter.value.id!)
    activeTasksLoaded.value = true
    console.log(`✅ ${activeTasks.value.length} tarefas ativas carregadas`)
  } catch (error) {
    console.error('❌ Erro ao carregar tarefas ativas:', error)
    activeTasksLoaded.value = true
  }
}

// 🎯 EVENTOS DE TIMER
const onTaskCompleted = async (taskId: number) => {
  console.log(`⏰ Tarefa ${taskId} foi completada automaticamente`)
  await loadActiveTasks()
}

const onTaskTimeUpdate = (taskId: number, remaining: number) => {
  // Opcional: fazer algo quando o tempo atualiza
  if (remaining <= 60000 && remaining > 59000) {
    console.log(`⚠️ Tarefa ${taskId} será completada em 1 minuto!`)
  }
}

const onTaskUrgent = (taskId: number, remaining: number) => {
  console.log(`🚨 Tarefa ${taskId} está urgente! ${Math.floor(remaining / 1000)}s restantes`)
}

const onTaskProgressUpdate = (taskId: number, percentage: number) => {
  // Opcional: fazer algo quando o progresso atualiza
  if (percentage >= 100) {
    console.log(`✅ Tarefa ${taskId} está pronta para ser completada!`)
  }
}

const onExplorationAvailable = () => {
  console.log('✅ Exploração disponível novamente!')
  canExplore.value = true
}

const showRecruitmentOption = () => {
  if (taskResult.value?.civilian) {
    recruitmentTarget.value = taskResult.value.civilian
    showRecruitmentModal.value = true
  }
}

const closeRecruitmentModal = () => {
  showRecruitmentModal.value = false
  recruitmentTarget.value = null
}

const closeTaskResult = () => {
  showTaskResult.value = false
  taskResult.value = null
}

const handleRecruitmentSuccess = async (civilian: Character, newLoyalty: number) => {
  console.log(`🎉 ${civilian.name} foi recrutado com sucesso! Nova loyalty: ${newLoyalty}`)
  
  // Recarregar dados do personagem para refletir mudanças
  await characterStore.loadPlayerCharacter()
  
  // Fechar modais
  closeRecruitmentModal()
  closeTaskResult()
}

const handleRecruitmentFailed = async (civilian: Character) => {
  console.log(`😔 Falha ao recrutar ${civilian.name}`)
  
  // Fechar modal
  closeRecruitmentModal()
}



// 🎨 HELPER FUNCTIONS
const getTaskDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'green-darken-2'
    case 'medium': return 'orange-darken-2'
    case 'hard': return 'red-darken-2'
    default: return 'grey-darken-2'
  }
}

const getTaskOptionColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'green-darken-4'
    case 'medium': return 'orange-darken-4'
    case 'hard': return 'red-darken-4'
    default: return 'grey-darken-4'
  }
}

const getEncounterAlertType = (urgency: string): string => {
  switch (urgency) {
    case 'high': return 'error'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return 'info'
  }
}

const getKindnessColor = (kindness: number): string => {
  if (kindness >= 50) return 'green-darken-2'
  if (kindness >= 0) return 'blue-darken-2'
  if (kindness >= -50) return 'orange-darken-2'
  return 'red-darken-2'
}

const getLoyaltyColor = (loyalty: number): string => {
  if (loyalty >= 50) return 'green-darken-2'
  if (loyalty >= 0) return 'blue-darken-2'
  if (loyalty >= -50) return 'orange-darken-2'
  return 'red-darken-2'
}

const getTaskProgress = (task: Task): number => {
  const now = new Date().getTime()
  const start = new Date(task.startTime).getTime()
  const end = new Date(task.endTime).getTime()
  
  const progress = ((now - start) / (end - start)) * 100
  return Math.min(100, Math.max(0, progress))
}

// 🔄 LIFECYCLE
onMounted(async () => {
  console.log('🚀 Componente montado, iniciando carregamento...')
  await loadDataSequentially()
})
</script>

<style scoped>
.island-exploration {
  max-width: 1200px;
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

.pulse-animation {
  animation: pulse-glow 2s infinite;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.v-progress-linear {
  border-radius: 10px;
}

.text-h6 {
  font-weight: 600;
}

.v-alert {
  border-radius: 12px;
}

.v-btn {
  border-radius: 8px;
  font-weight: 600;
}

/* MELHOR CONTRASTE PARA CHIPS */
.difficulty-chip {
  color: white !important;
  font-weight: 700 !important;
}

.difficulty-chip .v-chip__content {
  color: white !important;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  }
}

.mdi-spin {
  animation: spin 1s linear infinite;
}
</style>