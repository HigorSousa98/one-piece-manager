<!-- src/components/TerritoryLiberationInterface.vue -->
<template>
  <div class="territory-liberation-interface">
    
    <!-- LOADING STATE -->
    <div v-if="isLoading" class="text-center pa-6">
      <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
      <div class="text-h6">Carregando informações da ilha...</div>
    </div>
    
    <!-- CONTEÚDO PRINCIPAL -->
    <div v-else>
      
      <!-- HEADER DA ILHA -->
      <v-card class="mb-4" variant="elevated">
        <v-card-title class="bg-blue-darken-1 text-white">
          <v-icon left color="white">mdi-island</v-icon>
          {{ currentIsland?.name || 'Ilha Desconhecida' }}
          <v-spacer></v-spacer>
          <v-chip color="white" text-color="blue-darken-1" variant="elevated">
            Dificuldade {{ currentIsland?.difficulty || 0 }}
          </v-chip>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <div class="island-status">
            
            <!-- STATUS DA ILHA -->
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-card variant="outlined" :color="liberationProgress.isLiberated ? 'success' : 'warning'">
                  <v-card-text class="text-center pa-3">
                    <v-icon size="40" :color="liberationProgress.isLiberated ? 'success' : 'warning'">
                      {{ liberationProgress.isLiberated ? 'mdi-flag' : 'mdi-pirate' }}
                    </v-icon>
                    <div class="text-h6 mt-2">
                      {{ liberationProgress.isLiberated ? 'LIBERADA' : 'OCUPADA' }}
                    </div>
                    <div class="text-caption">
                      {{ liberationProgress.isLiberated ? 'Esta ilha está livre' : 'Controlada por tiranos' }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-card variant="outlined" color="info">
                  <v-card-text class="text-center pa-3">
                    <v-icon size="40" color="info">mdi-progress-check</v-icon>
                    <div class="text-h6 mt-2">
                      {{ liberationProgress.completedSteps }} / {{ liberationProgress.maxSteps }}
                    </div>
                    <div class="text-caption">Steps Completados</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            
            
            <!-- CREW OCUPANTE -->
            <div v-if="!liberationProgress.isLiberated && liberationProgress.occupyingCrew" class="mb-4">
              <v-card variant="outlined" :color="getCrewCardColor(liberationProgress.occupyingCrew.type)">
                <v-card-title :class="getCrewTitleClass(liberationProgress.occupyingCrew.type)">
                  <v-icon left :color="getCrewIconColor(liberationProgress.occupyingCrew.type)">
                    {{ getCrewIcon(liberationProgress.occupyingCrew.type) }}
                  </v-icon>
                  {{ getCrewTypeLabel(liberationProgress.occupyingCrew.type) }} Ocupante
                </v-card-title>
                <v-row align="center">
                  <v-col cols="12" md="5" class="text-center">
                    <WantedPoster
                        :character="liberationProgress.occupyingCaptain"
                        size="small"
                        :show-actions="false"
                        :show-size-controls="false"
                        class="dashboard-poster"
                      />
                  </v-col>
                  <v-col cols="12" md="7">
                    <v-card-text class="pa-4">
                      <div class="d-flex align-center mb-3">
                        <v-avatar 
                          size="60" 
                          :color="getCrewAvatarColor(liberationProgress.occupyingCrew.type)" 
                          class="mr-4"
                        >
                          <span class="text-h5">{{ getCrewEmoji(liberationProgress.occupyingCrew.type) }}</span>
                        </v-avatar>
                        
                        <div class="flex-grow-1">
                          <div class="text-h6 mb-1" :class="getCrewNameClass(liberationProgress.occupyingCrew.type)">
                            {{ liberationProgress.occupyingCrew.name }}
                          </div>
                          
                          <div class="crew-details">
                            <v-chip 
                              :color="getCrewChipColor(liberationProgress.occupyingCrew.type)" 
                              size="small" 
                              variant="tonal"
                              class="mr-2 mb-1"
                            >
                              <v-icon left size="small">{{ getCrewTypeIcon(liberationProgress.occupyingCrew.type) }}</v-icon>
                              {{ liberationProgress.occupyingCrew.type }}
                            </v-chip>
                            
                            <v-chip 
                              color="amber-darken-2" 
                              size="small" 
                              variant="tonal"
                              class="mr-2 mb-1"
                            >
                              <v-icon left size="small">mdi-star</v-icon>
                              {{ formatReputation(liberationProgress.occupyingCrew.reputation) }}
                            </v-chip>
                            
                            <v-chip 
                              color="green-darken-2" 
                              size="small" 
                              variant="tonal"
                              class="mb-1"
                            >
                              <v-icon left size="small">mdi-treasure-chest</v-icon>
                              {{ formatTreasury(liberationProgress.occupyingCrew.treasury) }}
                            </v-chip>
                          </div>
                        </div>
                      </div>
                      
                      <!-- BARRA DE PODER/AMEAÇA -->
                      <div class="threat-level mb-3">
                        <div class="d-flex justify-space-between mb-2">
                          <span class="text-body-2 text-black"><strong>Nível de Ameaça</strong></span>
                          <span class="text-body-2">{{ getThreatLevel(liberationProgress.occupyingCrew) }}</span>
                        </div>
                        
                        <v-progress-linear
                          :model-value="getThreatPercentage(liberationProgress.occupyingCrew)"
                          :color="getThreatColor(liberationProgress.occupyingCrew)"
                          height="12"
                          rounded
                          class="mb-1"
                        >
                          <template v-slot:default>
                            <strong class="text-white text-caption">
                              {{ getThreatLevel(liberationProgress.occupyingCrew) }}
                            </strong>
                          </template>
                        </v-progress-linear>
                      </div>
                      
                      <!-- DESCRIÇÃO DINÂMICA -->
                      <v-alert 
                        :type="getCrewAlertType(liberationProgress.occupyingCrew.type)" 
                        variant="tonal" 
                        class="mb-0"
                      >
                        <div class="text-body-2">
                          <strong>{{ getCrewDescription(liberationProgress.occupyingCrew) }}</strong>
                        </div>
                        <div class="text-caption mt-1">
                          {{ getCrewWarning(liberationProgress.occupyingCrew) }}
                        </div>
                      </v-alert>
                    </v-card-text>
                  </v-col>
                </v-row>
                
                
                
              </v-card>
            </div>
            
          </div>
        </v-card-text>
      </v-card>
      
      <!-- PROGRESSO DE LIBERAÇÃO -->
      <v-card v-if="!liberationProgress.isLiberated" class="mb-4" variant="elevated">
        <v-card-title class="bg-orange-darken-1 text-white">
          <v-icon left color="white">mdi-sword-cross</v-icon>
          Progresso de Liberação
        </v-card-title>
        
        <v-card-text class="pa-4">
          
          <!-- BARRA DE PROGRESSO -->
          <div class="progress-section mb-4">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-1"><strong>Progresso Geral</strong></span>
              <span class="text-body-2">
                <strong class="text-black">{{ Math.round((liberationProgress.completedSteps / liberationProgress.maxSteps) * 100) }}%</strong>
              </span>
            </div>
            
            <v-progress-linear
              :model-value="(liberationProgress.completedSteps / liberationProgress.maxSteps) * 100"
              color="orange-darken-1"
              height="20"
              rounded
              class="mb-2"
            >
              <template v-slot:default>
                <strong :class="Math.round(Math.round((liberationProgress.completedSteps / liberationProgress.maxSteps) * 100)) >= 52 ? 'text-white' : 'text-black'">
                  {{ liberationProgress.completedSteps }} / {{ liberationProgress.maxSteps }}
                </strong>
              </template>
            </v-progress-linear>
            
            <div class="text-caption text-center">
              {{ liberationProgress.maxSteps - liberationProgress.completedSteps }} steps restantes para libertar a ilha
            </div>
          </div>
          
          <!-- PRÓXIMO STEP -->
          <div v-if="liberationProgress.canStart" class="next-step-section">
            <v-alert type="info" variant="tonal" class="mb-4">
              <div class="text-h6 mb-2">
                <v-icon left>mdi-target</v-icon>
                Próximo Desafio: Step {{ liberationProgress.currentStep }}
              </div>
              <div class="text-body-1 mb-2">
                {{ getStepDescription(liberationProgress.currentStep, liberationProgress.maxSteps) }}
              </div>
              <div class="text-body-2">
                <strong>Duração:</strong> {{ durationTime }} minutos por tentativa
              </div>
            </v-alert>
            
            <!-- BOTÃO DE INICIAR -->
            <div class="text-center">
              <v-btn
                color="orange-darken-1"
                size="large"
                variant="elevated"
                :disabled="hasActiveTask || isStarting"
                :loading="isStarting"
                @click="startLiberationStep"
              >
                <v-icon left>mdi-sword</v-icon>
                {{ hasActiveTask ? 'Missão em Andamento' : `Iniciar Step ${liberationProgress.currentStep}` }}
              </v-btn>
            </div>
          </div>
          
          <!-- ILHA JÁ LIBERADA PELO PLAYER -->
          <div v-else-if="liberationProgress.completedSteps >= liberationProgress.maxSteps" class="text-center">
            <v-alert type="success" variant="tonal">
              <div class="text-h6 mb-2">
                <v-icon left>mdi-trophy</v-icon>
                Parabéns! Você já liberou esta ilha!
              </div>
              <div class="text-body-1">
                Todos os {{ liberationProgress.maxSteps }} steps foram completados com sucesso.
              </div>
            </v-alert>
          </div>
          
        </v-card-text>
      </v-card>
      
      <!-- TASK ATIVA DINÂMICA -->
      <v-card v-if="activeTask" class="mb-4" variant="elevated">
        <v-card-title class="bg-purple-darken-1 text-white">
          <v-icon left color="white">{{ taskDisplayInfo?.statusIcon || 'mdi-timer-sand' }}</v-icon>
          Missão em Andamento
          
          <v-spacer></v-spacer>
          <v-chip 
            :color="taskStatus === 'completed' ? 'success' : 'white'" 
            :text-color="taskStatus === 'completed' ? 'white' : 'purple-darken-1'"
            size="small"
            variant="elevated"
          >
            {{ taskStatus === 'completed' ? 'Concluída!' : 'Em Andamento' }}
          </v-chip>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <div class="active-task-info">
            
            <!-- INFORMAÇÕES DA TASK -->
            <div class="task-details mb-4">
              <div class="text-h6 mb-2">{{ activeTask.description }}</div>
              <div class="text-body-2 mb-3">
                <strong>Step:</strong> {{ activeTask.step }} de {{ liberationProgress.maxSteps }}
              </div>
            </div>
            
            <!-- PROGRESS BAR DINÂMICA -->
            <div class="task-progress mb-4">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-1"><strong>Progresso da Missão</strong></span>
                <span class="text-body-2">{{ Math.round(taskProgress.progress) }}%</span>
              </div>
              
              <v-progress-linear
                :model-value="taskProgress.progress"
                :color="progressColor"
                height="20"
                rounded
                class="mb-2"
                :striped="taskStatus === 'running'"
                :indeterminate="taskStatus === 'pending'"
              >
                <template v-slot:default>
                  <strong :class="Math.round(taskProgress.progress) >= 52 ? 'text-white' : 'text-black'">{{ Math.round(taskProgress.progress) }}%</strong>
                </template>
              </v-progress-linear>
              
              <!-- INFORMAÇÕES DE TEMPO -->
              <div class="time-info d-flex justify-space-between">
                <div class="text-caption">
                  <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                  {{ taskProgress.formattedTimeRemaining }}
                </div>
                <div class="text-caption">
                  <v-icon size="small" class="mr-1">mdi-timer</v-icon>
                  {{ taskProgress.formattedElapsedTime }} / {{ taskProgress.formattedTotalTime }}
                </div>
              </div>
            </div>
            
            <!-- AÇÕES DA TASK -->
            <div class="task-actions text-center">
              <v-btn
                v-if="taskStatus === 'completed'"
                color="success"
                size="large"
                variant="elevated"
                :loading="isProcessing"
                @click="processCompletedTask"
              >
                <v-icon left>mdi-check-circle</v-icon>
                Processar Resultado
              </v-btn>
              
              <v-btn
                v-if="taskStatus !== 'completed'"
                color="error"
                variant="outlined"
                @click="showCancelDialog = true"
              >
                <v-icon left>mdi-close</v-icon>
                Cancelar Missão
              </v-btn>
            </div>
            
          </div>
        </v-card-text>
      </v-card>
      
      <!-- RECOMPENSAS ESTIMADAS -->
      <v-card v-if="!liberationProgress.isLiberated && liberationProgress.canStart" class="mb-4" variant="elevated">
        <v-card-title class="bg-green-darken-1 text-white">
          <v-icon left color="white">mdi-treasure-chest</v-icon>
          Recompensas Estimadas
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" md="4">
              <v-card variant="outlined" color="blue-lighten-5">
                <v-card-text class="text-center pa-3">
                  <v-icon size="30" color="blue-darken-2">mdi-star</v-icon>
                  <div class="text-h6 mt-1 text-blue-darken-3">
                    + de {{ estimatedRewards.experience }} XP
                  </div>
                  <div class="text-caption text-blue-darken-3">Experiência</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-card variant="outlined" color="purple-lighten-5">
                <v-card-text class="text-center pa-3">
                  <v-icon size="30" color="purple-darken-2">mdi-currency-usd</v-icon>
                  <div class="text-h6 mt-1 text-purple-darken-3">
                    {{ formatBounty(estimatedRewards.bounty) }}
                  </div>
                  <div class="text-caption text-purple-darken-3">Bounty</div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-card variant="outlined" color="orange-lighten-5">
                <v-card-text class="text-center pa-3">
                  <v-icon size="30" color="orange-darken-2">mdi-treasure-chest</v-icon>
                  <div class="text-h6 mt-1 text-orange-darken-3">
                    {{ formatBounty(estimatedRewards.treasury) }}
                  </div>
                  <div class="text-caption text-orange-darken-3">Tesouro</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- CHANCE DE DEVIL FRUIT -->
          <v-alert type="warning" variant="tonal" class="mt-4">
            <div class="text-body-1">
              <v-icon left>mdi-fruit-pineapple</v-icon>
              <strong>Chance especial:</strong> Chance de dropar uma Akuma no Mi!
            </div>
          </v-alert>
        </v-card-text>
      </v-card>
      
      <!-- HISTÓRICO DE STEPS -->
      <v-card v-if="completedSteps.length > 0" class="mb-4" variant="elevated">
        <v-card-title class="bg-grey-darken-1 text-white">
          <v-icon left color="white">mdi-history</v-icon>
          Histórico de Steps
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-timeline density="compact">
            <v-timeline-item
              v-for="step in completedSteps"
              :key="step.id"
              :dot-color="step.stepCompleted ? 'success' : 'error'"
              size="small"
            >
              <template #icon>
                <v-icon color="white" size="small">
                  {{ step.stepCompleted ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
              </template>
              
              <div class="step-history-item">
                <div class="text-body-1">
                  <strong>Step {{ step.step }}</strong>
                  <v-chip 
                    :color="step.stepCompleted ? 'success' : 'error'" 
                    size="small" 
                    variant="tonal"
                    class="ml-2"
                  >
                    {{ step.stepCompleted ? 'Sucesso' : 'Falhou' }}
                  </v-chip>
                </div>
                <div class="text-body-2 text-grey-darken-1">
                  {{ step.description }}
                </div>
                <div class="text-caption text-grey-darken-2">
                  {{ formatDate(step.createdAt) }}
                </div>
                
                <!-- RECOMPENSAS -->
                <div v-if="step.stepCompleted && (step.experienceReward || step.bountyReward)" class="mt-2">
                  <v-chip-group>
                    <v-chip v-if="step.experienceReward" color="blue" size="small" variant="tonal">
                      +{{ step.experienceReward }} XP
                    </v-chip>
                    <v-chip v-if="step.bountyReward" color="purple" size="small" variant="tonal">
                      +{{ formatBounty(step.bountyReward) }}
                    </v-chip>
                  </v-chip-group>
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
      
    </div>
    
    <!-- MODAL DE CANCELAMENTO -->
    <v-dialog v-model="showCancelDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon left color="white">mdi-alert</v-icon>
          Cancelar Missão
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="text-center">
            <v-icon size="60" color="error" class="mb-4">mdi-cancel</v-icon>
            <div class="text-h6 mb-4">Tem certeza que deseja cancelar?</div>
            <div class="text-body-1">
              A missão atual será perdida e você precisará começar novamente.
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-btn color="grey" variant="outlined" @click="showCancelDialog = false">
            Continuar Missão
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="elevated" @click="cancelTask">
            Sim, Cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- MODAL DE RESULTADO -->
    <v-dialog v-model="showResultDialog" max-width="700" persistent>
      <v-card>
        <v-card-title :class="lastResult?.success ? 'bg-success' : 'bg-error'" class="text-white">
          <v-icon left color="white">
            {{ lastResult?.success ? 'mdi-check-circle' : 'mdi-close-circle' }}
          </v-icon>
          {{ lastResult?.success ? 'Sucesso!' : 'Derrota!' }}
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-icon 
              size="80" 
              :color="lastResult?.success ? 'success' : 'error'" 
              class="mb-4"
            >
              {{ lastResult?.success ? 'mdi-trophy' : 'mdi-skull' }}
            </v-icon>
            <div class="text-h5 mb-4">{{ lastResult?.message }}</div>
          </div>
          
          <!-- RECOMPENSAS -->
          <div v-if="lastResult?.success && lastResult.rewardDetails" class="rewards-section mb-4">
            <div class="text-h6 mb-3 text-center">Recompensas Obtidas:</div>
            <v-row>
              <v-col cols="4">
                <v-card variant="outlined" color="blue-lighten-5">
                  <v-card-text class="text-center pa-3">
                    <v-icon color="blue-darken-2">mdi-star</v-icon>
                    <div class="text-h6 text-blue-darken-3">
                      +{{ lastResult.rewardDetails.experience }}
                    </div>
                    <div class="text-caption text-blue-darken-3">XP</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card variant="outlined" color="purple-lighten-5">
                  <v-card-text class="text-center pa-3">
                    <v-icon color="purple-darken-2">mdi-currency-usd</v-icon>
                    <div class="text-h6 text-purple-darken-3">
                      +{{ formatBounty(lastResult.rewardDetails.bounty) }}
                    </div>
                    <div class="text-caption text-purple-darken-3">Bounty</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card variant="outlined" color="orange-lighten-5">
                  <v-card-text class="text-center pa-3">
                    <v-icon color="orange-darken-2">mdi-treasure-chest</v-icon>
                    <div class="text-h6 text-orange-darken-3">
                      +{{ formatBounty(lastResult.rewardDetails.treasury) }}
                    </div>
                    <div class="text-caption text-orange-darken-3">Tesouro</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
          
          <!-- DEVIL FRUIT DROPPED -->
          <div v-if="lastResult?.devilFruitDropped" class="devil-fruit-section mb-4">
            <v-alert type="success" variant="tonal" class="mb-4">
              <div class="text-h6 mb-2">
                <v-icon left>mdi-fruit-pineapple</v-icon>
                Devil Fruit Encontrada!
              </div>
              <div class="text-body-1">
                Você encontrou a <strong>{{ lastResult.devilFruitDropped.name }}</strong>!
              </div>
            </v-alert>
            
            <!-- OPÇÕES PARA DEVIL FRUIT -->
            <div class="devil-fruit-actions" v-if="!fruitDecisionMade">
              <div class="text-body-1 mb-3">O que você deseja fazer?</div>
              <v-btn-group variant="outlined" class="d-flex">
                <v-btn 
                  v-if="!playerHasDevilFruit"
                  color="primary" 
                  @click="consumeDevilFruit"
                  :disabled="isProcessingFruit"
                  :loading="isProcessingFruit && selectedAction === 'consume'"
                >
                  <v-icon left>mdi-account</v-icon>
                  Consumir
                </v-btn>
                <v-btn 
                  color="secondary" 
                  @click="showCrewMemberSelection"
                  :disabled="isProcessingFruit"
                >
                  <v-icon left>mdi-account-group</v-icon>
                  Dar à Tripulação
                </v-btn>
                  <v-btn
                    color="primary"
                    variant="elevated"
                    @click="closeResultDialog"
                  >
                     'Continuar' 
                  </v-btn>
              </v-btn-group>
            </div>
            
            <!-- RESULTADO DA DECISÃO -->
            <div v-if="fruitDecisionMade" class="fruit-decision-result">
              <v-alert type="info" variant="tonal">
                <div class="text-body-1">
                  <v-icon left>mdi-check-circle</v-icon>
                  {{ fruitDecisionMessage }}
                </div>
              </v-alert>
            </div>
          </div>
          
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            @click="closeResultDialog"
            :disabled="lastResult?.devilFruitDropped && !fruitDecisionMade"
          >
            {{ lastResult?.devilFruitDropped && !fruitDecisionMade ? 'Decida sobre a Devil Fruit' : 'Continuar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- MODAL DE SELEÇÃO DE MEMBRO DA TRIPULAÇÃO -->
    <v-dialog v-model="showCrewSelection" max-width="600" persistent>
      <v-card>
        <v-card-title class="bg-secondary text-white">
          <v-icon left color="white">mdi-account-group</v-icon>
          Selecionar Membro da Tripulação
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div v-if="eligibleCrewMembers.length === 0" class="text-center">
            <v-icon size="60" color="grey" class="mb-4">mdi-account-off</v-icon>
            <div class="text-h6 mb-2">Nenhum membro elegível</div>
            <div class="text-body-1">
              Todos os membros da sua tripulação já possuem Devil Fruits ou não estão disponíveis.
            </div>
          </div>
          
          <div v-else>
            <div class="text-body-1 mb-4">
              Selecione qual membro da tripulação deve consumir a 
              <strong>{{ lastResult?.devilFruitDropped?.name }}</strong>:
            </div>
            
            <v-list>
              <v-list-item
                v-for="member in eligibleCrewMembers"
                :key="member.id"
                @click="selectCrewMember(member)"
                :class="{ 'selected-member': selectedCrewMember?.id === member.id }"
                class="crew-member-item"
              >
                <template #prepend>
                  <v-avatar :color="getCharacterAvatarColor(member)" size="50">
                    <span class="text-h6">{{ getCharacterEmoji(member) }}</span>
                  </v-avatar>
                </template>
                
                <v-list-item-title>{{ member.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ member.type }} • Level {{ member.level }}
                </v-list-item-subtitle>
                
                <template #append>
                  <div class="member-stats">
                    <v-chip color="blue" size="small" variant="tonal" class="mb-1">
                      Loyalty: {{ member.loyalty }}
                    </v-chip>
                    <div class="text-caption">
                      Sem Devil Fruit
                    </div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
            
            <!-- MEMBRO SELECIONADO -->
            <div v-if="selectedCrewMember" class="selected-member-info mt-4">
              <v-alert type="info" variant="tonal">
                <div class="text-body-1">
                  <v-icon left>mdi-check</v-icon>
                  <strong>{{ selectedCrewMember.name }}</strong> foi selecionado para consumir a Devil Fruit.
                </div>
              </v-alert>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-btn
            color="grey"
            variant="outlined"
            @click="closeCrewSelection"
            :disabled="isProcessingFruit"
          >
            Cancelar
          </v-btn>
          
          <v-spacer></v-spacer>
          
          <v-btn
            v-if="eligibleCrewMembers.length > 0"
            color="secondary"
            variant="elevated"
            @click="giveToSelectedMember"
            :disabled="!selectedCrewMember || isProcessingFruit"
            :loading="isProcessingFruit && selectedAction === 'give'"
          >
            <v-icon left>mdi-fruit-pineapple</v-icon>
            Dar Devil Fruit
          </v-btn>
          
          <v-btn
            v-else
            color="primary"
            variant="elevated"
            @click="closeCrewSelection"
          >
            Entendi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { TerritoryLiberationSystem, type LiberationTaskResult } from '@/utils/territoryLiberationSystem'
import { TaskMonitoringSystem } from '@/utils/taskMonitoringSystem'
import { db } from '@/utils/database'
import type { Island, Task, Character, Crew } from '@/utils/database'
import { useTimeRemaining } from '@/composables/useTimeRemaining'
import { useCharacterStore } from '@/stores/characterStore'
import { GenerationConfig } from '@/utils/generationConfig'
import WantedPoster from './WantedPoster.vue'
import { AdventureSystem } from '@/utils/adventureSystem'

// ✅ PROPS
interface Props {
  island: Island
  playerCharacter: Character
}

const props = defineProps<Props>()
const characterStore = useCharacterStore()

// ✅ DEFINIR TIPO CORRETO PARA LIBERATION PROGRESS
interface LiberationProgressState {
  currentStep: number
  maxSteps: number
  completedSteps: number
  isLiberated: boolean
  canStart: boolean
  occupyingCrew: Crew | null,
  occupyingCaptain: Character | null
}

// ✅ ESTADOS
const isLoading = ref(true)
const isStarting = ref(false)
const isProcessing = ref(false)
const isProcessingFruit = ref(false)
const showCancelDialog = ref(false)
const showResultDialog = ref(false)
const fruitDecisionMade = ref(false)

// ✅ NOVOS ESTADOS PARA SELEÇÃO DE CREW
const showCrewSelection = ref(false)
const eligibleCrewMembers = ref<Character[]>([])
const selectedCrewMember = ref<Character | null>(null)
const selectedAction = ref<'consume' | 'give' | null>(null)
const fruitDecisionMessage = ref('')

const currentIsland = ref<Island | null>(null)
const liberationProgress = ref<LiberationProgressState>({
  currentStep: 0,
  maxSteps: 0,
  completedSteps: 0,
  isLiberated: false,
  canStart: false,
  occupyingCrew: null,
  occupyingCaptain: null
})

const activeTask = ref<Task | null>(null)
const completedSteps = ref<Task[]>([])
const lastResult = ref<LiberationTaskResult | null>(null)
const playerHasDevilFruit = ref(false)

// ✅ MONITORAMENTO
let monitoringInterval: NodeJS.Timeout | null = null

// ✅ COMPUTED
const hasActiveTask = computed(() => activeTask.value !== null)

const durationTime = computed(() => GenerationConfig.createEpic().stepTimeLiberation)

const estimatedRewards = computed(() => {
  if (!liberationProgress.value.canStart) {
    return { experience: 0, bounty: 0, treasury: 0 }
  }
  
  const step = liberationProgress.value.currentStep
  const maxSteps = liberationProgress.value.maxSteps
  const isLastStep = step === maxSteps
  
  const baseExp = TerritoryLiberationSystem.calculateExperienceReward(step, maxSteps)
  const baseBounty = TerritoryLiberationSystem.instaCalculateBountyReward(liberationProgress.value.occupyingCaptain, props.playerCharacter, step, maxSteps)
  const baseTreasury = (5000 + liberationProgress.value.occupyingCaptain.bounty /maxSteps / 10) * (1 + (step + 1) / maxSteps)
  
  const stepBonus = step / maxSteps
  const finalBonus = isLastStep ? 2 : 1
  
  return {
    experience: (1 + maxSteps) * 100 +
      (step * baseExp) / maxSteps +
      (step === maxSteps ? baseExp / maxSteps : 0),
    bounty: baseBounty,
    treasury: Math.floor(baseTreasury * (1 + stepBonus) * finalBonus)
  }
})

// ✅ USAR COMPOSABLE DE TEMPO
const {
  getTaskProgress,
  createTaskProgressComputed,
  getProgressColor,
  getTaskStatus,
  formatDuration,
  getTaskDisplayInfo,
  watchTaskCompletion
} = useTimeRemaining(1000)

// ✅ COMPUTED REATIVO PARA PROGRESSO DA TASK
const taskProgress = createTaskProgressComputed(activeTask)

// ✅ COMPUTED PARA COR DA PROGRESS BAR
const progressColor = computed(() => {
  if (!activeTask.value) return 'grey'
  return getProgressColor(taskProgress.value.progress, taskProgress.value.isCompleted)
})

// ✅ COMPUTED PARA STATUS DA TASK
const taskStatus = computed(() => {
  return getTaskStatus(activeTask.value)
})

// ✅ COMPUTED PARA INFORMAÇÕES DE EXIBIÇÃO
const taskDisplayInfo = computed(() => {
  if (!activeTask.value) return null
  return getTaskDisplayInfo(activeTask.value)
})

// ✅ WATCH PARA DETECTAR CONCLUSÃO AUTOMATICAMENTE
watchTaskCompletion(
  activeTask,
  (completedTask) => {
    console.log('⏰ Task completada detectada:', completedTask.description)
  },
  (progress) => {
    if (progress % 25 === 0) {
      console.log(`📊 Progresso: ${Math.round(progress)}%`)
    }
  }
)

// ✅ MÉTODOS
const loadLiberationData = async () => {
  try {
    isLoading.value = true
    currentIsland.value = props.island
    
    const progress = await TerritoryLiberationSystem.getLiberationProgress(
      props.playerCharacter.id!,
      props.island.id!
    )
    
    liberationProgress.value = {
      currentStep: progress.currentStep,
      maxSteps: progress.maxSteps,
      completedSteps: progress.completedSteps,
      isLiberated: progress.isLiberated,
      canStart: progress.canStart,
      occupyingCrew: progress.occupyingCrew || null,
      occupyingCaptain: progress.occupyingCaptain || null
    }
    
    playerHasDevilFruit.value = props.playerCharacter.devilFruitId !== 0
    
    await loadActiveTask()
    await loadCompletedSteps()
    
    console.log('📊 Dados de liberação carregados:', progress)
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados de liberação:', error)
  } finally {
    isLoading.value = false
  }
}

const loadActiveTask = async () => {
  try {
    const task = await TerritoryLiberationSystem.hasActiveLiberationTask(
      props.playerCharacter.id!,
      props.island.id!
    )
    
    activeTask.value = task
    
  } catch (error) {
    console.error('❌ Erro ao carregar task ativa:', error)
  }
}

const loadCompletedSteps = async () => {
  try {
    const tasks = await db.tasks
      .where('characterId')
      .equals(props.playerCharacter.id!)
      .and(task => 
        task.type === 'island_liberation' && 
        task.targetIslandId === props.island.id! &&
        task.isCompleted
      )
      .reverse()
      .toArray()
    
    completedSteps.value = tasks
    
  } catch (error) {
    console.error('❌ Erro ao carregar steps completados:', error)
  }
}

const startLiberationStep = async () => {
  try {
    isStarting.value = true
    
    const result = await TerritoryLiberationSystem.startLiberationProcess(
      props.playerCharacter.id!,
      props.island.id!
    )
    
    if (result.success) {
      activeTask.value = result.task || null
      console.log('✅ Step iniciado com sucesso')
    } else {
      console.error('❌ Erro ao iniciar step:', result.message)
    }
    
  } catch (error) {
    console.error('❌ Erro ao iniciar liberação:', error)
  } finally {
    isStarting.value = false
  }
}

const processCompletedTask = async () => {
  try {
    isProcessing.value = true
    
    if (!activeTask.value) return
    
    const result = await TerritoryLiberationSystem.completeLiberationTask(activeTask.value.id!)
    for(let i = 0; i <= 5; i++){
      const worldUpdate = await AdventureSystem.onPlayerAction()
    }
    
    lastResult.value = result
    showResultDialog.value = true
    
    activeTask.value = null
    
    await loadLiberationData()
    await characterStore.loadPlayerCharacter()
    
  } catch (error) {
    console.error('❌ Erro ao processar task:', error)
  } finally {
    isProcessing.value = false
  }
}

const cancelTask = async () => {
  try {
    if (!activeTask.value) return
    
    await db.tasks.delete(activeTask.value.id!)
    
    activeTask.value = null
    showCancelDialog.value = false
    
    console.log('❌ Task cancelada')
    
  } catch (error) {
    console.error('❌ Erro ao cancelar task:', error)
  }
}

const consumeDevilFruit = async () => {
  try {
    if (!lastResult.value?.devilFruitDropped) return
    
    selectedAction.value = 'consume'
    isProcessingFruit.value = true
    
    const result = await TerritoryLiberationSystem.consumeDevilFruit(
      props.playerCharacter.id!,
      lastResult.value.devilFruitDropped.id!
    )
    
    if (result.success) {
      fruitDecisionMade.value = true
      playerHasDevilFruit.value = true
      fruitDecisionMessage.value = `Você consumiu a ${lastResult.value.devilFruitDropped.name} e ganhou novos poderes!`
      
      await characterStore.loadPlayerCharacter()
      
      console.log('🍎 Devil Fruit consumida com sucesso')
    } else {
      console.error('❌ Erro ao consumir Devil Fruit:', result.message)
    }
    
  } catch (error) {
    console.error('❌ Erro ao consumir Devil Fruit:', error)
  } finally {
    isProcessingFruit.value = false
    selectedAction.value = null
  }
}

const showCrewMemberSelection = async () => {
  try {
    await loadEligibleCrewMembers()
    showCrewSelection.value = true
  } catch (error) {
    console.error('❌ Erro ao carregar membros da tripulação:', error)
  }
}

const loadEligibleCrewMembers = async () => {
  try {
    const crewMembers = await db.characters
      .where('crewId')
      .equals(props.playerCharacter.crewId!)
      .and(char => 
        char.id !== props.playerCharacter.id && 
        char.devilFruitId === 0
      )
      .toArray()
    
    eligibleCrewMembers.value = crewMembers.sort((a, b) => a.loyalty - b.loyalty)
    
    console.log('👥 Membros elegíveis carregados:', eligibleCrewMembers.value.length)
    
  } catch (error) {
    console.error('❌ Erro ao carregar membros elegíveis:', error)
    eligibleCrewMembers.value = []
  }
}

const selectCrewMember = (member: Character) => {
  selectedCrewMember.value = member
  console.log('👤 Membro selecionado:', member.name)
}

const giveToSelectedMember = async () => {
  try {
    if (!selectedCrewMember.value || !lastResult.value?.devilFruitDropped) return
    
    selectedAction.value = 'give'
    isProcessingFruit.value = true
    
    const result = await TerritoryLiberationSystem.giveDevilFruitToCrewMember(
      selectedCrewMember.value.id!,
      lastResult.value.devilFruitDropped.id!
    )
    
    if (result.success) {
      fruitDecisionMade.value = true
      fruitDecisionMessage.value = `${selectedCrewMember.value.name} consumiu a ${lastResult.value.devilFruitDropped.name} e ganhou novos poderes!`
      
      await characterStore.loadPlayerCharacter()
      
      console.log(`🍎 Devil Fruit dada para ${selectedCrewMember.value.name}`)
    } else {
      console.error('❌ Erro ao dar Devil Fruit:', result.message)
    }
    
    closeCrewSelection()
    
  } catch (error) {
    console.error('❌ Erro ao dar Devil Fruit:', error)
  } finally {
    isProcessingFruit.value = false
    selectedAction.value = null
  }
}

const closeCrewSelection = () => {
  showCrewSelection.value = false
  selectedCrewMember.value = null
  eligibleCrewMembers.value = []
}

const closeResultDialog = () => {
  showResultDialog.value = false
  lastResult.value = null
  fruitDecisionMade.value = false
  fruitDecisionMessage.value = ''
  selectedCrewMember.value = null
  eligibleCrewMembers.value = []
}

// ✅ MÉTODOS AUXILIARES PARA CREW MEMBERS
const getCharacterAvatarColor = (character: Character): string => {
  switch (character.type) {
    case 'Pirate': return 'red-darken-2'
    case 'Marine': return 'blue-darken-2'
    case 'Civilian': return 'green-darken-2'
    default: return 'grey-darken-2'
  }
}

const getCharacterEmoji = (character: Character): string => {
  switch (character.type) {
    case 'Pirate': return '🏴‍☠️'
    case 'Marine': return '⚓'
    case 'Civilian': return '👤'
    default: return '❓'
  }
}

// ✅ MÉTODOS AUXILIARES
const getStepDescription = (step: number, maxSteps: number): string => {
  if (step === maxSteps) {
    return 'Enfrentar o capitão do crew ocupante para libertar definitivamente a ilha!'
  } else {
    return `Enfrentar um membro do crew ocupante (Step ${step} de ${maxSteps})`
  }
}

const formatBounty = (bounty: number): string => {
  if (bounty >= 1000000000) {
    return `${(bounty / 1000000000).toFixed(2)}B`
  } else if (bounty >= 1000000) {
    return `${(bounty / 1000000).toFixed(2)}M`
  } else if (bounty >= 1000) {
    return `${(bounty / 1000).toFixed(2)}K`
  }
  return `${bounty}`
}

const formatTime = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('pt-BR')
}

// ✅ MÉTODOS PARA CREW OCUPANTE
const getCrewCardColor = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'red-lighten-5'
    case 'Marine': return 'blue-lighten-5'
    case 'Government': return 'orange-lighten-5'
    case 'BountyHunter': return 'green-lighten-5'
    default: return 'grey-lighten-5'
  }
}

const getCrewTitleClass = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'text-red-darken-2'
    case 'Marine': return 'text-blue-darken-2'
    case 'Government': return 'text-orange-darken-2'
    case 'BountyHunter': return 'text-green-darken-2'
    default: return 'text-grey-darken-2'
  }
}

const getCrewIconColor = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'red-darken-2'
    case 'Marine': return 'blue-darken-2'
    case 'Government': return 'orange-darken-2'
    case 'BountyHunter': return 'green-darken-2'
    default: return 'grey-darken-2'
  }
}

const getCrewIcon = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'mdi-skull'
    case 'Marine': return 'mdi-anchor'
    case 'Government': return 'mdi-shield-crown'
    case 'BountyHunter': return 'mdi-target'
    default: return 'mdi-help'
  }
}

const getCrewTypeLabel = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'Crew Pirata'
    case 'Marine': return 'Força Naval'
    case 'Government': return 'Agentes do Governo'
    case 'BountyHunter': return 'Caçadores de Recompensa'
    default: return 'Crew'
  }
}

const getCrewAvatarColor = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'red-darken-3'
    case 'Marine': return 'blue-darken-3'
    case 'Government': return 'orange-darken-3'
    case 'BountyHunter': return 'green-darken-3'
    default: return 'grey-darken-3'
  }
}

const getCrewEmoji = (type: string): string => {
  switch (type) {
    case 'Pirate': return '🏴‍☠️'
    case 'Marine': return '⚓'
    case 'Government': return '🏛️'
    case 'BountyHunter': return '💰'
    default: return '❓'
  }
}

const getCrewNameClass = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'text-red-darken-3'
    case 'Marine': return 'text-blue-darken-3'
    case 'Government': return 'text-orange-darken-3'
    case 'BountyHunter': return 'text-green-darken-3'
    default: return 'text-grey-darken-3'
  }
}

const getCrewChipColor = (type: string): string => {
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
    case 'Pirate': return 'mdi-pirate'
    case 'Marine': return 'mdi-shield-account'
    case 'Government': return 'mdi-account-tie'
    case 'BountyHunter': return 'mdi-crosshairs-gps'
    default: return 'mdi-account-group'
  }
}

const getCrewAlertType = (type: string): 'error' | 'warning' | 'info' | 'success' => {
  switch (type) {
    case 'Pirate': return 'error'
    case 'Marine': return 'info'
    case 'Government': return 'warning'
    case 'BountyHunter': return 'warning'
    default: return 'info'
  }
}

// CÁLCULOS DE AMEAÇA
const getThreatLevel = (crew: Crew): string => {
  const reputation = crew.reputation || 0
  
  if (reputation >= 10000) return 'EXTREMO'
  if (reputation >= 5000) return 'ALTO'
  if (reputation >= 2000) return 'MÉDIO'
  if (reputation >= 500) return 'BAIXO'
  return 'MÍNIMO'
}

const getThreatPercentage = (crew: Crew): number => {
  const reputation = crew.reputation || 0
  const maxReputation = 15000
  
  return Math.min(100, (reputation / maxReputation) * 100)
}

const getThreatColor = (crew: Crew): string => {
  const reputation = crew.reputation || 0
  
  if (reputation >= 10000) return 'error'
  if (reputation >= 5000) return 'deep-orange'
  if (reputation >= 2000) return 'orange'
  if (reputation >= 500) return 'yellow-darken-2'
  return 'green'
}

// DESCRIÇÕES DINÂMICAS
const getCrewDescription = (crew: Crew): string => {
  const reputation = crew.reputation || 0
  const type = crew.type
  
  const descriptions = {
    Pirate: {
      high: `Os ${crew.name} são piratas temidos pelos mares, conhecidos por sua brutalidade.`,
      medium: `Os ${crew.name} são um crew pirata respeitado com boa reputação.`,
      low: `Os ${crew.name} são piratas iniciantes ainda construindo sua reputação.`
    },
    Marine: {
      high: `A ${crew.name} é uma força naval de elite com autoridade absoluta.`,
      medium: `A ${crew.name} representa a justiça dos mares com disciplina férrea.`,
      low: `A ${crew.name} é uma unidade naval padrão mantendo a ordem local.`
    },
    Government: {
      high: `Os ${crew.name} são agentes secretos do governo com poderes especiais.`,
      medium: `Os ${crew.name} trabalham nas sombras para o Governo Mundial.`,
      low: `Os ${crew.name} são operativos governamentais de nível básico.`
    },
    BountyHunter: {
      high: `Os ${crew.name} são caçadores lendários que nunca falham em suas missões.`,
      medium: `Os ${crew.name} são caçadores experientes com boa taxa de sucesso.`,
      low: `Os ${crew.name} são caçadores novatos buscando fazer nome.`
    }
  }
  
  const level = reputation >= 5000 ? 'high' : reputation >= 1000 ? 'medium' : 'low'
  return descriptions[type as keyof typeof descriptions]?.[level] || `Os ${crew.name} controlam esta ilha.`
}

const getCrewWarning = (crew: Crew): string => {
  const reputation = crew.reputation || 0
  
  if (reputation >= 10000) {
    return 'CUIDADO: Este é um crew extremamente perigoso. Prepare-se adequadamente!'
  } else if (reputation >= 5000) {
    return 'ATENÇÃO: Crew de alta periculosidade. Recomenda-se cautela extrema.'
  } else if (reputation >= 2000) {
    return 'AVISO: Crew experiente. Certifique-se de estar bem preparado.'
  } else if (reputation >= 500) {
    return 'NOTA: Crew com alguma experiência. Mantenha-se alerta.'
  } else {
    return 'INFO: Crew iniciante, mas ainda assim perigoso. Não subestime.'
  }
}

// FORMATAÇÃO
const formatReputation = (reputation: number): string => {
  if (reputation >= 1000000) {
    return `${(reputation / 1000000).toFixed(1)}M`
  } else if (reputation >= 1000) {
    return `${(reputation / 1000).toFixed(1)}K`
  }
  return `${reputation}`
}

const formatTreasury = (treasury: number): string => {
  if (treasury >= 1000000000) {
    return `${(treasury / 1000000000).toFixed(1)}B B$`
  } else if (treasury >= 1000000) {
    return `${(treasury / 1000000).toFixed(1)}M B$`
  } else if (treasury >= 1000) {
    return `${(treasury / 1000).toFixed(1)}K B$`
  }
  return `${treasury} B$`
}

// ✅ LIFECYCLE
onMounted(async () => {
  await loadLiberationData()
  
  monitoringInterval = setInterval(async () => {
    if (activeTask.value) {
      const progress = taskProgress.value
      if (progress.isCompleted) {
        await loadActiveTask()
      }
    }
  }, 1000)
})

onUnmounted(() => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
  }
})

// ✅ WATCH PARA MUDANÇAS NA ILHA
watch(() => props.island.id, async () => {
  await loadLiberationData()
})
</script>

<style scoped>
/* TerritoryLiberationInterface - Conquest panel */

.liberation-interface { max-width: 100%; }

.island-target-card {
  background: #132235;
  border: 1px solid rgba(198,40,40,0.25);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  height: 100%;
}

.island-target-card:hover {
  border-color: rgba(198,40,40,0.55);
  box-shadow: 0 0 14px rgba(198,40,40,0.18);
  transform: translateY(-2px);
}

.island-target-card.selected {
  border-color: #C62828;
  background: linear-gradient(135deg, rgba(198,40,40,0.12), rgba(139,0,0,0.08));
  box-shadow: 0 0 18px rgba(198,40,40,0.25);
}

.island-target-name {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #E8D5A3;
  font-size: 0.95rem;
  margin-bottom: 6px;
}

.liberation-power-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 0.84rem;
}

.liberation-power-row:last-child { border-bottom: none; }

.power-label { color: #8B9DC3; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.06em; }

.power-value { color: #E8D5A3; font-weight: 700; }
.power-value.player { color: #D4AF37; }
.power-value.enemy  { color: #EF5350; }

.liberation-action-btn {
  background: linear-gradient(135deg, #B71C1C, #C62828) !important;
  color: #fff !important;
  font-weight: 700 !important;
  letter-spacing: 0.06em !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(198,40,40,0.3) !important;
}

.liberation-progress-card {
  background: linear-gradient(135deg, rgba(198,40,40,0.1), rgba(139,0,0,0.06));
  border: 1px solid rgba(198,40,40,0.35);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}
</style>