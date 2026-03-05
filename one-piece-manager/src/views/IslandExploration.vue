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
      
      <!-- EVENTOS DINÂMICOS DA ILHA -->
      <v-row v-if="activeEvents.length > 0">
        <v-col cols="12">
          <div class="events-section-header mb-2">
            <v-icon color="#D4AF37" class="me-1">mdi-lightning-bolt</v-icon>
            <span class="events-section-title">EVENTOS ATIVOS NA ILHA</span>
          </div>
          <v-card
            v-for="event in activeEvents"
            :key="event.id"
            class="mb-3 island-event-card"
            :class="`event-type-${event.type}`"
          >
            <v-card-title class="d-flex align-center pa-3">
              <v-icon class="me-2" :color="eventIconColor(event.type)">{{ eventIcon(event.type) }}</v-icon>
              <span class="event-title">{{ event.data.title }}</span>
              <v-spacer />
              <TimeRemaining :end-time="new Date(event.expiresAt)" />
            </v-card-title>
            <v-card-text class="pb-2 pt-1">
              <p class="text-body-2 mb-2">{{ event.data.description }}</p>
              <div class="d-flex flex-wrap gap-2">
                <v-chip size="small" color="orange" variant="tonal">
                  Dificuldade {{ event.data.difficulty }}
                </v-chip>
                <v-chip v-if="event.data.rewards.experience" size="small" color="blue" variant="tonal">
                  +{{ event.data.rewards.experience?.toLocaleString() }} XP
                </v-chip>
                <v-chip v-if="event.data.rewards.bounty" size="small" color="amber" variant="tonal">
                  +{{ event.data.rewards.bounty?.toLocaleString() }} B$
                </v-chip>
                <v-chip v-if="event.data.rewards.reputation" size="small" color="green" variant="tonal">
                  +{{ event.data.rewards.reputation }} Rep
                </v-chip>
              </div>
            </v-card-text>
            <v-card-actions class="pt-0 px-3 pb-3">
              <v-spacer />
              <v-btn
                color="primary"
                variant="elevated"
                size="small"
                :loading="participatingEventId === event.id"
                @click="participateInEvent(event)"
              >
                Participar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- MODAL: RESULTADO DO EVENTO -->
      <v-dialog v-model="showEventResult" max-width="500">
        <v-card v-if="eventResult">
          <v-card-title
            class="py-3 px-4"
            :style="{ background: eventResult.success ? 'linear-gradient(135deg,#1B5E20,#388E3C)' : 'linear-gradient(135deg,#7F0000,#C62828)' }"
          >
            <v-icon class="me-2">{{ eventResult.success ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
            <span class="text-white">{{ eventResult.success ? 'Sucesso!' : 'Falhou!' }}</span>
          </v-card-title>
          <v-card-text class="pa-4">
            <p class="text-body-1 mb-3">{{ eventResult.message }}</p>

            <!-- Battle log -->
            <div v-if="eventResult.battleLog && eventResult.battleLog.length > 0" class="battle-log mb-3">
              <div v-for="(line, i) in eventResult.battleLog" :key="i" class="text-body-2 text-medium-emphasis">
                {{ line }}
              </div>
            </div>

            <!-- Rewards -->
            <div v-if="eventResult.success" class="rewards-section">
              <div class="text-subtitle-2 mb-2">Recompensas:</div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip v-if="eventResult.rewards.experience > 0" size="small" color="blue" variant="tonal">
                  +{{ eventResult.rewards.experience.toLocaleString() }} XP
                </v-chip>
                <v-chip v-if="eventResult.rewards.bounty > 0" size="small" color="amber" variant="tonal">
                  +{{ eventResult.rewards.bounty.toLocaleString() }} B$
                </v-chip>
                <v-chip v-if="eventResult.rewards.reputation > 0" size="small" color="green" variant="tonal">
                  +{{ eventResult.rewards.reputation }} Rep
                </v-chip>
                <v-chip v-if="eventResult.rewards.item" size="small" color="purple" variant="tonal">
                  Item: {{ eventResult.rewards.item.name }}
                </v-chip>
              </div>
            </div>

            <!-- New crew member (escaped_prisoner) -->
            <v-alert v-if="eventResult.rewards.newMember" type="success" density="compact" variant="tonal" class="mt-3">
              🏴‍☠️ {{ eventResult.rewards.newMember.name }} (Lv {{ eventResult.rewards.newMember.level }}) juntou-se à sua tripulação!
            </v-alert>
          </v-card-text>
          <v-card-actions class="pa-3">
            <v-spacer />
            <v-btn color="primary" @click="showEventResult = false">Fechar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

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
import { IslandEventSystem, type IslandEventResult } from '@/utils/islandEventSystem'
import { AllianceSystem } from '@/utils/allianceSystem'
import { useRouter } from 'vue-router'
import TimeRemaining from '@/components/TimeRemaining.vue'
import TaskProgressBar from '@/components/TaskProgressBar.vue'
import CivilianRecruitmentModal from '@/components/CivilianRecruitmentModal.vue'
// ✅ IMPORT DO COMPONENTE DE AVATAR
import CharacterAvatar from '@/components/CharacterAvatar.vue'
import type { Character, Task, IslandEvent } from '@/utils/database'

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

// 🌟 ISLAND EVENTS
const activeEvents = ref<IslandEvent[]>([])
const participatingEventId = ref<number | null>(null)
const showEventResult = ref(false)
const eventResult = ref<IslandEventResult | null>(null)

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
    
    // 2. Carregar tarefas ativas e eventos da ilha em paralelo
    console.log('🔄 Carregando tarefas ativas e eventos...')
    await Promise.all([
      loadActiveTasks(),
      loadActiveEvents(),
    ])

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

// 🌟 ISLAND EVENT METHODS
const loadActiveEvents = async () => {
  if (!playerCrew.value?.currentIsland) return
  activeEvents.value = await IslandEventSystem.getActiveEvents(playerCrew.value.currentIsland)
}

const participateInEvent = async (event: IslandEvent) => {
  if (!playerCharacter.value || !playerCrew.value?.id) return
  participatingEventId.value = event.id!

  try {
    const alliedBonus = await AllianceSystem.getAlliedPowerBonus(playerCrew.value.id)
    const result = await IslandEventSystem.participateInEvent(
      event.id!,
      playerCharacter.value,
      playerCrew.value.id,
      alliedBonus,
    )
    eventResult.value = result
    showEventResult.value = true
    await Promise.all([
      loadActiveEvents(),
      characterStore.loadPlayerCharacter(),
    ])
  } finally {
    participatingEventId.value = null
  }
}

const eventIcon = (type: IslandEvent['type']): string => {
  const icons: Record<IslandEvent['type'], string> = {
    marine_invasion: 'mdi-shield-sword',
    pirate_festival: 'mdi-party-popper',
    ancient_shipwreck: 'mdi-anchor',
    escaped_prisoner: 'mdi-account-arrow-right',
  }
  return icons[type]
}

const eventIconColor = (type: IslandEvent['type']): string => {
  const colors: Record<IslandEvent['type'], string> = {
    marine_invasion: '#EF5350',
    pirate_festival: '#D4AF37',
    ancient_shipwreck: '#42A5F5',
    escaped_prisoner: '#66BB6A',
  }
  return colors[type]
}

// 🔄 LIFECYCLE
onMounted(async () => {
  console.log('🚀 Componente montado, iniciando carregamento...')
  await loadDataSequentially()
})
</script>

<style scoped>
/* ============================================================
   Island Exploration - Grand Line Islands
   ============================================================ */

.loading-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  max-width: 300px;
  margin-inline: auto;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
  color: #8B9DC3;
  padding: 8px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
}

.step-item.completed {
  color: #D4AF37;
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.25);
}

/* Page header */
.exploration-header {
  background: linear-gradient(135deg,
    rgba(0, 137, 123, 0.12),
    rgba(212, 175, 55, 0.06)
  );
  border: 1px solid rgba(0, 137, 123, 0.3);
  border-radius: 14px;
  padding: 18px 24px;
  margin-bottom: 20px;
  position: relative;
}

.exploration-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent, #00897B, #4DB6AC, #00897B, transparent
  );
  border-radius: 14px 14px 0 0;
}

/* Island cards */
.island-card {
  background: #132235;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;
  height: 100%;
}

.island-card:hover {
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 16px rgba(212, 175, 55, 0.18);
  transform: translateY(-2px);
}

.island-card.player-here {
  border-color: #D4AF37;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
  background: linear-gradient(135deg,
    rgba(212, 175, 55, 0.1),
    rgba(21, 101, 192, 0.06)
  );
}

.island-card.hostile {
  border-color: rgba(198, 40, 40, 0.45);
  box-shadow: 0 0 12px rgba(198, 40, 40, 0.15);
}

.island-card.friendly {
  border-color: rgba(46, 125, 50, 0.45);
  box-shadow: 0 0 12px rgba(46, 125, 50, 0.15);
}

.island-card-header {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}

.island-name {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #E8D5A3;
  font-size: 0.95rem;
}

.island-region {
  font-size: 0.72rem;
  color: #8B9DC3;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-top: 2px;
}

.island-card-body {
  padding: 12px 14px;
}

.island-stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-bottom: 5px;
  color: #8B9DC3;
}

.island-stat-value {
  color: #E8D5A3;
  font-weight: 600;
}

/* Detail panel */
.island-detail-panel {
  background: linear-gradient(135deg, #132235, #1A2F45);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 14px;
  overflow: hidden;
}

.island-detail-header {
  background: linear-gradient(135deg,
    rgba(212, 175, 55, 0.12),
    rgba(0, 137, 123, 0.06)
  );
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  padding: 16px 20px;
}

.island-detail-name {
  font-family: Georgia, serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #D4AF37;
  text-shadow: 0 0 12px rgba(212, 175, 55, 0.35);
}

/* Crew list on island */
.crew-on-island-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 6px;
  font-size: 0.85rem;
  color: #E8D5A3;
  transition: background 0.2s ease;
}

.crew-on-island-item:hover {
  background: rgba(212, 175, 55, 0.06);
  border-color: rgba(212, 175, 55, 0.2);
}

.crew-on-island-item.player-crew {
  border-color: rgba(212, 175, 55, 0.4);
  background: rgba(212, 175, 55, 0.07);
}

/* Dynamic Island Events */
.events-section-header {
  display: flex;
  align-items: center;
}

.events-section-title {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #D4AF37;
}

.island-event-card {
  border-left: 4px solid;
}

.event-type-marine_invasion {
  border-left-color: #EF5350;
  background: rgba(239, 83, 80, 0.05);
}

.event-type-pirate_festival {
  border-left-color: #D4AF37;
  background: rgba(212, 175, 55, 0.05);
}

.event-type-ancient_shipwreck {
  border-left-color: #42A5F5;
  background: rgba(66, 165, 245, 0.05);
}

.event-type-escaped_prisoner {
  border-left-color: #66BB6A;
  background: rgba(102, 187, 106, 0.05);
}

.event-title {
  font-weight: 700;
  font-size: 0.95rem;
}

.battle-log {
  max-height: 150px;
  overflow-y: auto;
  background: rgba(0,0,0,0.2);
  border-radius: 6px;
  padding: 8px;
  font-family: monospace;
}

.rewards-section {
  background: rgba(212, 175, 55, 0.06);
  border-radius: 6px;
  padding: 8px 12px;
}
</style>