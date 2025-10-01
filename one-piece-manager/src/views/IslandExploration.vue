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

                <div class="step-item" :class="{ 'completed': avatarSystemLoaded }">
                  <v-icon :color="avatarSystemLoaded ? 'success' : 'grey'">
                    {{ avatarSystemLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Inicializando Sistema de Avatares</span>
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
          <v-card class="mb-4 exploration-header">
            <v-card-title class="text-center">
              <v-icon left size="large">mdi-island</v-icon>
              EXPLORAÇÃO DA ILHA
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
          <v-card class="mb-4 active-tasks-card" color="blue-lighten-5">
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
      
      <!-- ✅ SEÇÃO DE EXPLORAÇÃO COM AVATAR DO PLAYER -->
      <v-row v-if="!currentEncounter && activeTasks.length === 0">
        <v-col cols="12">
          <v-card class="exploration-main-card">
            <v-card-text class="text-center py-8">
              
              <!-- ✅ AVATAR DO PLAYER -->
              <div class="player-exploration-avatar mb-4">
                <CharacterAvatar 
                  v-if="playerCharacter"
                  :character="playerCharacter"
                  size="xl"
                  variant="circle"
                  :show-actions="true"
                  :show-regenerate-button="true"
                  :show-download-button="true"
                  :show-status-indicators="true"
                  :show-level="true"
                  :show-power-rank="false"
                  :cache-enabled="true"
                  :clickable="false"
                  class="exploration-avatar"
                  @avatar-regenerated="onPlayerAvatarRegenerated"
                  @avatar-error="onPlayerAvatarError"
                />
              </div>

              <v-icon size="80" color="primary" class="mb-4">mdi-compass</v-icon>
              <div class="text-h5 mb-4">Explorar a Ilha</div>
              <div class="text-body-1 mb-6">
                Caminhe pela ilha e encontre pessoas que precisam de ajuda.
              </div>
              
              <!-- INFO DA ILHA ATUAL -->
              <v-card variant="outlined" class="mb-4 mx-auto island-info-card" style="max-width: 500px;">
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
                class="explore-btn"
              >
                <v-icon left>mdi-walk</v-icon>
                {{ exploring ? 'Explorando...' : 'EXPLORAR ILHA' }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- ✅ ENCONTRO COM CIVIL COM AVATARES -->
      <v-row v-if="currentEncounter">
        <v-col cols="12">
          <v-card class="encounter-card">
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

              <!-- ✅ SEÇÃO DE COMPARAÇÃO PLAYER VS CIVIL -->
              <v-row class="mb-4">
                <v-col cols="12">
                  <v-card variant="outlined" class="encounter-comparison-card">
                    <v-card-title class="text-center">
                      <v-icon left>mdi-handshake</v-icon>
                      Encontro
                    </v-card-title>
                    <v-card-text>
                      <v-row align="center">
                        <!-- PLAYER -->
                        <v-col cols="5" class="text-center">
                          <div class="encounter-participant">
                            <CharacterAvatar 
                              v-if="playerCharacter"
                              :character="playerCharacter"
                              size="lg"
                              variant="circle"
                              :show-actions="false"
                              :show-status-indicators="true"
                              :show-level="true"
                              :show-power-rank="false"
                              :cache-enabled="true"
                              :clickable="false"
                              class="participant-avatar player-participant"
                            />
                            <div class="text-h6 mt-2 text-primary">{{ playerCharacter?.name }}</div>
                            <v-chip color="primary" size="small" variant="elevated" class="mt-1">
                              {{ playerCharacter?.type }}
                            </v-chip>
                            <div class="text-body-2 mt-2">
                              <strong>Kindness: {{ playerCharacter?.kindness || 0 }}</strong>
                            </div>
                          </div>
                        </v-col>

                        <!-- ENCONTRO -->
                        <v-col cols="2" class="text-center">
                          <div class="encounter-symbol">
                            <v-icon size="60" color="success">mdi-handshake</v-icon>
                            <div class="text-h6 text-success font-weight-bold">ENCONTRO</div>
                          </div>
                        </v-col>

                        <!-- CIVIL -->
                        <v-col cols="5" class="text-center">
                          <div class="encounter-participant">
                            <CharacterAvatar 
                              :character="currentEncounter.civilian"
                              size="lg"
                              variant="circle"
                              :show-actions="false"
                              :show-status-indicators="true"
                              :show-level="true"
                              :show-power-rank="false"
                              :cache-enabled="true"
                              :clickable="false"
                              class="participant-avatar civilian-participant"
                            />
                            <div class="text-h6 mt-2 text-success">{{ currentEncounter.civilian.name }}</div>
                            <v-chip color="success" size="small" variant="elevated" class="mt-1">
                              {{ currentEncounter.civilian.type }}
                            </v-chip>
                            <div class="text-body-2 mt-2">
                              <strong>Kindness: {{ currentEncounter.civilian.kindness }}</strong>
                            </div>
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- INFO DO CIVIL -->
              <v-row class="mb-4">
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="civilian-info-card">
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
                  <v-card variant="outlined" class="task-options-card">
                    <v-card-title>
                      <v-icon left>mdi-hand-heart</v-icon>
                      Como Ajudar?
                    </v-card-title>
                    <v-card-text>
                      <div v-for="option in currentEncounter.taskOptions" :key="option.id" class="mb-3">
                        <v-card variant="outlined" :color="getTaskOptionColor(option.difficulty)" class="task-option-card">
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
                              <div>💚 Bondade: +{{ option.kindnessReward }}</div>
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
      
      <!-- ✅ RESULTADO DE TAREFA COMPLETADA COM AVATAR -->
      <v-dialog v-model="showTaskResult" max-width="600">
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
              
              <!-- ✅ OPÇÃO DE RECRUTAMENTO COM AVATAR -->
              <div v-if="taskResult.canRecruit && taskResult.civilian">
                <!-- AVATAR DO CIVIL CANDIDATO -->
                <div class="recruitment-candidate-section mb-4">
                  <CharacterAvatar 
                    :character="taskResult.civilian"
                    size="lg"
                    variant="circle"
                    :show-actions="false"
                    :show-status-indicators="true"
                    :show-level="true"
                    :show-power-rank="false"
                    :cache-enabled="true"
                    :clickable="false"
                    class="recruitment-candidate-avatar"
                  />
                  <div class="text-h6 mt-2">{{ taskResult.civilian.name }}</div>
                </div>

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
      
      <!-- ✅ MODAL DE RECRUTAMENTO DE CIVIL COM AVATARES -->
      <v-dialog v-model="showRecruitmentModal" max-width="700">
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
// ✅ IMPORT DO COMPONENTE DE AVATAR
import CharacterAvatar from '@/components/CharacterAvatar.vue'
import type { Character, Task } from '@/utils/database'

const characterStore = useCharacterStore()
const router = useRouter()

// 🕒 USAR COMPOSABLE DE TIMER
const { formatTimeRemaining } = useTimeRemaining()

// 🔄 LOADING STATES
const playerCharacterLoaded = ref(false)
const playerCrewLoaded = ref(false)
const activeTasksLoaded = ref(false)
const avatarSystemLoaded = ref(false)

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
  return playerCharacterLoaded.value && 
         playerCrewLoaded.value && 
         activeTasksLoaded.value && 
         avatarSystemLoaded.value
})

// ✅ EVENTOS DE AVATAR
const onPlayerAvatarRegenerated = (svgData: string) => {
  console.log('✅ Avatar do player regenerado na exploração')
}

const onPlayerAvatarError = (error: Error) => {
  console.error('❌ Erro no avatar do player na exploração:', error)
}

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

    // 3. ✅ INICIALIZAR SISTEMA DE AVATARES
    console.log('🎨 Inicializando sistema de avatares...')
    await initializeAvatarSystem()
    
    console.log('✅ Todos os dados carregados!')
    
  } catch (error) {
    console.error('❌ Erro no carregamento sequencial:', error)
  }
}

// ✅ INICIALIZAR SISTEMA DE AVATARES
const initializeAvatarSystem = async () => {
  try {
    // Simular inicialização do sistema de avatares
    console.log('🎨 Sistema de avatares inicializando...')
    
    // Aguardar um pouco para simular carregamento
    await new Promise(resolve => setTimeout(resolve, 500))
    
    avatarSystemLoaded.value = true
    console.log('✅ Sistema de avatares inicializado')
    
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de avatares:', error)
    avatarSystemLoaded.value = true // Continuar mesmo com erro
  }
}

// �� METHODS
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

/* ✅ ESTILOS PARA AVATARES */
.player-exploration-avatar {
  position: relative;
  display: inline-block;
}

.exploration-avatar {
  border: 4px solid rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
}

.exploration-avatar:hover {
  border-color: rgba(76, 175, 80, 0.6);
  transform: scale(1.05);
}

/* ✅ ESTILOS PARA COMPARAÇÃO DE ENCONTRO */
.encounter-comparison-card {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
  border: 2px solid rgba(76, 175, 80, 0.3);
}

.encounter-participant {
  padding: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.participant-avatar {
  transition: all 0.3s ease;
}

.player-participant .participant-avatar {
  border: 3px solid rgba(25, 118, 210, 0.4);
}

.civilian-participant .participant-avatar {
  border: 3px solid rgba(76, 175, 80, 0.4);
}

.encounter-symbol {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* ✅ ESTILOS PARA RECRUTAMENTO */
.recruitment-candidate-section {
  padding: 20px;
  background: rgba(25, 118, 210, 0.05);
  border-radius: 16px;
  border: 2px solid rgba(25, 118, 210, 0.2);
}

.recruitment-candidate-avatar {
  border: 3px solid rgba(25, 118, 210, 0.6);
  transition: all 0.3s ease;
}

.recruitment-candidate-avatar:hover {
  transform: scale(1.05);
  border-color: rgba(25, 118, 210, 0.8);
}

/* ✅ CARDS ESPECIAIS */
.exploration-header {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
  border: 2px solid rgba(76, 175, 80, 0.2);
}

.exploration-main-card {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%);
  border: 2px solid rgba(25, 118, 210, 0.2);
}

.encounter-card {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.1) 100%);
  border: 2px solid rgba(76, 175, 80, 0.3);
}

.active-tasks-card {
  border: 2px solid rgba(25, 118, 210, 0.3);
}

.civilian-info-card {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.1) 100%);
  border: 2px solid rgba(76, 175, 80, 0.2);
}

.task-options-card {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 193, 7, 0.1) 100%);
  border: 2px solid rgba(255, 193, 7, 0.2);
}

.task-option-card {
  transition: all 0.3s ease;
}

.task-option-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.island-info-card {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.1) 100%);
  border: 2px solid rgba(76, 175, 80, 0.2);
}

/* ✅ BOTÕES ESPECIAIS */
.explore-btn {
  background: linear-gradient(45deg, #4CAF50, #388E3C) !important;
  color: white !important;
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  padding: 16px 32px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3) !important;
  transition: all 0.3s ease !important;
}

.explore-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4) !important;
}

.pulse-animation {
  animation: pulse-glow 2s infinite;
}

.v-card {
  transition: all 0.3s ease;
  border-radius: 12px !important;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
}

.difficulty-chip .v-chip__content {
  color: white !important;
}

.v-chip {
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
}

.v-chip .v-chip__content {
  font-weight: 700 !important;
}

/* ANIMAÇÕES */
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

/* HOVER EFFECTS */
.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.v-chip:hover {
  transform: scale(1.05);
}

.participant-avatar:hover {
  transform: scale(1.05);
}

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
  .island-exploration {
    padding: 8px;
  }
  
  .v-card-text {
    padding: 12px;
  }
  
  .text-h5 {
    font-size: 1.3rem !important;
  }
  
  .v-btn.v-btn--size-x-large {
    font-size: 1rem;
    padding: 12px 24px;
  }

  .encounter-participant {
    padding: 8px;
  }

  .encounter-symbol {
    padding: 10px;
  }

  .player-exploration-avatar {
    margin-bottom: 16px;
  }

  .encounter-comparison-card .v-row {
    flex-direction: column;
  }

  .encounter-comparison-card .v-col {
    max-width: 100%;
    flex-basis: auto;
  }
}

/* CORES CUSTOMIZADAS */
.text-green-darken-3 {
  color: #1b5e20 !important;
}

.text-green-darken-4 {
  color: #0d5016 !important;
}

.text-blue-darken-3 {
  color: #1565c0 !important;
}

.text-blue-darken-4 {
  color: #0d47a1 !important;
}

/* SOMBRAS CUSTOMIZADAS */
.v-card.v-card--variant-elevated {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.v-alert.v-alert--variant-elevated {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.v-btn.v-btn--variant-elevated {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.v-chip.v-chip--variant-elevated {
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

/* EFEITOS ESPECIAIS PARA AVATARES */
.exploration-avatar {
  position: relative;
}

.exploration-avatar::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: inherit;
  background: linear-gradient(45deg, #4CAF50, #81C784, #4CAF50);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.exploration-avatar:hover::after {
  opacity: 0.3;
}

.participant-avatar {
  position: relative;
  overflow: hidden;
}

.participant-avatar::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s ease;
}

.participant-avatar:hover::before {
  left: 100%;
}

.recruitment-candidate-avatar {
  position: relative;
}

.recruitment-candidate-avatar::after {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: inherit;
  background: linear-gradient(45deg, #1976D2, #42A5F5, #1976D2);
  z-index: -1;
  animation: recruitmentGlow 3s ease-in-out infinite;
}

@keyframes recruitmentGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

/* ESTADOS DE LOADING PARA AVATARES */
.avatar-loading {
  position: relative;
}

.avatar-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* TRANSIÇÕES SUAVES PARA MUDANÇAS DE ESTADO */
.encounter-card {
  transition: all 0.5s ease;
}

.encounter-card.entering {
  opacity: 0;
  transform: translateY(20px);
}

.encounter-card.entered {
  opacity: 1;
  transform: translateY(0);
}

.task-option-card {
  transition: all 0.3s ease;
}

.task-option-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

/* INDICADORES VISUAIS PARA DIFERENTES TIPOS DE ENCONTRO */
.encounter-card[data-urgency="high"] {
  border-left: 5px solid #f44336;
}

.encounter-card[data-urgency="medium"] {
  border-left: 5px solid #ff9800;
}

.encounter-card[data-urgency="low"] {
  border-left: 5px solid #4caf50;
}

/* MELHORIAS PARA ACESSIBILIDADE */
.v-btn:focus {
  outline: 2px solid #1976D2;
  outline-offset: 2px;
}

.participant-avatar:focus {
  outline: 3px solid #1976D2;
  outline-offset: 3px;
}

/* ANIMAÇÕES DE ENTRADA PARA ELEMENTOS */
@keyframes slideInFromLeft {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFromRight {
  0% {
    opacity: 0;
    transform: translateX(30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.player-participant {
  animation: slideInFromLeft 0.6s ease-out;
}

.civilian-participant {
  animation: slideInFromRight 0.6s ease-out;
}

.encounter-symbol {
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.task-option-card {
  animation: fadeInUp 0.5s ease-out;
}

.task-option-card:nth-child(1) { animation-delay: 0.1s; }
.task-option-card:nth-child(2) { animation-delay: 0.2s; }
.task-option-card:nth-child(3) { animation-delay: 0.3s; }

/* EFEITOS PARA DIFERENTES DIFICULDADES DE TAREFA */
.task-option-card[data-difficulty="easy"] {
  border-left: 4px solid #4caf50;
}

.task-option-card[data-difficulty="medium"] {
  border-left: 4px solid #ff9800;
}

.task-option-card[data-difficulty="hard"] {
  border-left: 4px solid #f44336;
}

.task-option-card[data-difficulty="easy"]:hover {
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
}

.task-option-card[data-difficulty="medium"]:hover {
  box-shadow: 0 8px 25px rgba(255, 152, 0, 0.3);
}

.task-option-card[data-difficulty="hard"]:hover {
  box-shadow: 0 8px 25px rgba(244, 67, 54, 0.3);
}
</style>