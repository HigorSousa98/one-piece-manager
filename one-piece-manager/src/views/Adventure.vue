<!-- src/views/Adventure.vue -->
<template>
  <div class="adventure-container">
    
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
              
              <div class="text-h6 mb-4">Preparando Aventura</div>
              
              <!-- PROGRESSO DETALHADO -->
              <div class="loading-steps">
                <div class="step-item" :class="{ 'completed': playerCharacterLoaded }">
                  <v-icon :color="playerCharacterLoaded ? 'success' : 'grey'">
                    {{ playerCharacterLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Personagem</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': activeTasksLoaded }">
                  <v-icon :color="activeTasksLoaded ? 'success' : 'grey'">
                    {{ activeTasksLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Verificando Tarefas Ativas</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <!-- CONTEÚDO PRINCIPAL -->
    <div v-else>
      
      <!-- Header da Aventura -->
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4">
            <v-card-title class="text-center">
              <v-icon left size="large">mdi-map</v-icon>
              🗺️ AVENTURAS
            </v-card-title>
            <v-card-subtitle class="text-center">
              Explore o mundo e encontre desafios únicos baseado no seu tipo de personagem
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>

      <!-- STATUS DE TAREFAS ATIVAS COM MELHOR DESIGN -->
      <v-row v-if="hasActiveTasks">
        <v-col cols="12">
          <v-alert type="warning" variant="elevated" class="mb-4">
            <div class="d-flex align-center">
              <v-icon left color="orange-darken-2">mdi-clipboard-list</v-icon>
              <div class="flex-grow-1">
                <strong>Você tem {{ activeTasksCount }} tarefa(s) ativa(s)</strong><br>
                <span class="text-body-2">
                  Complete suas tarefas na exploração da ilha antes de iniciar uma nova aventura.
                </span>
                <!-- MOSTRAR TEMPO DA PRÓXIMA TAREFA -->
                <div v-if="nextTaskToComplete" class="mt-2">
                  <v-chip color="orange-darken-2" size="small" variant="elevated">
                    <v-icon left size="small">mdi-clock</v-icon>
                    Próxima tarefa completa em: 
                    <TimeRemaining 
                      :end-time="nextTaskToComplete.endTime"
                      format="compact"
                      :color-coded="false"
                      :show-icon="false"
                      @completed="onTaskCompleted"
                    />
                  </v-chip>
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-btn 
                color="primary" 
                variant="elevated" 
                size="small"
                @click="redirect"
              >
                <v-icon left>{{ iconName() }}</v-icon>
                Ver Tarefas
              </v-btn>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <!-- Botão de Iniciar Aventura -->
      <v-row v-if="!currentEncounter">
        <v-col cols="12">
          <v-card>
            <v-card-text class="text-center py-8">
              <v-icon size="80" color="primary" class="mb-4">mdi-compass</v-icon>
              <div class="text-h5 mb-4">Pronto para uma nova aventura?</div>
              <div class="text-body-1 mb-6">
                Como {{ playerCharacter?.type }}, você pode encontrar diferentes tipos de oponentes pelo mundo.
              </div>
              
              <!-- INFO DO PERSONAGEM COM MELHOR DESIGN -->
              <v-card variant="outlined" class="mb-4 mx-auto" style="max-width: 400px;">
                <v-card-text>
                  <div class="text-h6 mb-2">👤 {{ playerCharacter?.name }}</div>
                  <div class="text-body-2 mb-2">
                    <v-chip :color="getTypeColor(playerCharacter?.type || '')" size="small" variant="elevated" class="mr-2">
                      <strong>{{ playerCharacter?.type }}</strong>
                    </v-chip>
                    <v-chip color="blue-darken-2" size="small" variant="elevated">
                      <strong>Level {{ playerCharacter?.level }}</strong>
                    </v-chip>
                  </div>
                  <div class="text-body-2">
                    <strong>Recompensa:</strong> 
                    <v-chip color="purple-darken-2" size="small" class="ml-2" variant="elevated">
                      <strong>{{ formatBounty(playerCharacter?.bounty || 0) }}</strong>
                    </v-chip>
                  </div>
                  <div class="text-body-2 mt-2">
                    <strong>Kindness:</strong> 
                    <v-chip :color="getKindnessChipColor(playerCharacter?.kindness || 0)" size="small" class="ml-2" variant="elevated">
                      <strong>{{ playerCharacter?.kindness || 0 }}</strong>
                    </v-chip>
                  </div>
                  <div v-if="hasActiveTasks" class="text-body-2 mt-2">
                    <v-chip color="orange-darken-2" size="small" variant="elevated">
                      <strong>{{ activeTasksCount }} Tarefa(s) Ativa(s)</strong>
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
              
              <v-btn
                color="primary"
                size="x-large"
                :disabled="hasActiveTasks || loadingAdventure"
                @click="startAdventure"
                :loading="loadingAdventure"
                variant="elevated"
              >
                <v-icon left>mdi-sail-boat</v-icon>
                {{ loadingAdventure ? 'Explorando...' : 'INICIAR AVENTURA' }}
              </v-btn>
              
              <div v-if="hasActiveTasks" class="mt-2">
                <v-chip color="warning" variant="elevated">
                  <v-icon left size="small">mdi-alert</v-icon>
                  Complete suas tarefas ativas antes de iniciar uma aventura
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Encontro Atual COM DESIGN MELHORADO -->
      <v-row v-if="currentEncounter && !battleStarted">
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-icon left>mdi-map-marker</v-icon>
              Encontro em {{ currentEncounter.location }}
            </v-card-title>
            <v-card-text>
              <!-- Descrição Narrativa -->
              <v-alert 
                :type="currentEncounter.encounterType === 'hostile' ? 'error' : 
                      currentEncounter.encounterType === 'neutral' ? 'warning' : 'success'"
                class="mb-4"
                variant="elevated"
              >
                {{ currentEncounter.description }}
              </v-alert>

              <!-- Info do Oponente COM MELHOR CONTRASTE -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title>
                      <v-avatar :color="getTypeColor(currentEncounter.opponent.type)" class="mr-2">
                        <span>{{ getTypeIcon(currentEncounter.opponent.type) }}</span>
                      </v-avatar>
                      {{ currentEncounter.opponent.name }}
                    </v-card-title>
                    <v-card-text>
                      <v-chip :color="getTypeColor(currentEncounter.opponent.type)" class="mb-2" variant="elevated">
                        <strong>{{ currentEncounter.opponent.type }}</strong>
                      </v-chip>
                      <v-chip color="blue-darken-2" class="mb-2 ml-2" variant="elevated">
                        <strong>Level {{ currentEncounter.opponent.level }}</strong>
                      </v-chip>
                      <v-chip color="purple-darken-2" class="mb-2 ml-2" variant="elevated">
                        <strong>{{ formatBounty(currentEncounter.opponent.bounty) }}</strong>
                      </v-chip>
                      <v-chip color="acent-darken-2" class="mb-2 ml-2" variant="elevated">
                        <strong>{{ opponentStyle(currentEncounter.opponent.styleCombatId) }}</strong>
                      </v-chip>
                      <v-chip v-if="currentEncounter.opponent.devilFruitId != 0"color="amber-darken-2" class="mb-2 ml-2" variant="elevated">
                        <strong>Akuma no Mi User</strong>
                      </v-chip>

                      <v-divider class="my-4"></v-divider>

                      <!-- Stats Resumidos -->
                      <div class="text-center">
                        <div class="text-h6 mb-2">Poder Estimado: {{ calculatePower(currentEncounter.opponent) }}</div>
                        <v-progress-linear
                          :model-value="winChance"
                          :color="winChance > 60 ? 'success' : winChance > 40 ? 'warning' : 'error'"
                          height="20"
                          rounded
                        >
                          <template v-slot:default>
                            <strong :class="winChance > 52 ? 'text-white' : 'text-black'">{{ winChance }}% chance de vitória</strong>
                          </template>
                        </v-progress-linear>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Recompensa Especial -->
                <v-col cols="12" md="6" v-if="currentEncounter.specialReward">
                  <v-card variant="outlined" color="green-lighten-4">
                    <v-card-title class="text-green-darken-3">
                      <v-icon left color="green-darken-3">mdi-treasure-chest</v-icon>
                      Recompensa Especial
                    </v-card-title>
                    <v-card-text>
                      <div class="text-center">
                        <v-icon size="40" color="green-darken-2">mdi-star</v-icon>
                        <div class="text-h6 mt-2 text-green-darken-4">
                          Bonus {{ currentEncounter.specialReward.type }}
                        </div>
                        <div class="text-body-1 text-green-darken-3">
                          +{{ formatSpecialReward(currentEncounter.specialReward) }}
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Ações -->
              <v-row class="mt-4">
                <v-col cols="12" class="text-center">
                  <v-btn
                    color="error"
                    size="large"
                    class="mr-4"
                    @click="startBattle"
                    :disabled="battleStore.isSimulating"
                    variant="elevated"
                  >
                    <v-icon left>mdi-sword-cross</v-icon>
                    LUTAR!
                  </v-btn>

                  <v-btn
                    color="grey"
                    size="large"
                    @click="retreatFromEncounter"
                    :disabled="battleStore.isSimulating"
                    variant="elevated"
                  >
                    <v-icon left>mdi-run</v-icon>
                    Fugir
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- RESULTADO DA BATALHA COM RECRUTAMENTO -->
      <v-row class="mt-4" v-if="lastBattleResult">
        <v-col cols="12">
          
          <!-- RESULTADO PRINCIPAL -->
          <v-card :color="lastBattleResult.winner.id === playerCharacter?.id ? 'success' : 'error'" class="mb-4" variant="elevated">
            <v-card-title class="text-white">
              <v-icon left class="text-white">
                {{ lastBattleResult.winner.id === playerCharacter?.id ? 'mdi-trophy' : 'mdi-skull' }}
              </v-icon>
              {{ lastBattleResult.winner.id === playerCharacter?.id ? '🏆 VITÓRIA!' : '💔 DERROTA!' }}
            </v-card-title>
            
            <v-card-text class="text-white">
              <!-- Informações da Batalha -->
              <v-row>
                <v-col cols="12" md="6">
                  <div class="text-center">
                    <div class="text-h6 mb-2">🏆 Vencedor</div>
                    <v-chip color="white" text-color="success" class="mb-2" variant="elevated">
                      <strong>{{ lastBattleResult.winner.name }}</strong>
                    </v-chip>
                    <div class="text-body-2">
                      {{ lastBattleResult.winner.type }} - Level {{ lastBattleResult.winner.level }}
                    </div>
                  </div>
                </v-col>
                
                <v-col cols="12" md="6">
                  <div class="text-center">
                    <div class="text-h6 mb-2">💔 Perdedor</div>
                    <v-chip color="white" text-color="error" class="mb-2" variant="elevated">
                      <strong>{{ lastBattleResult.loser.name }}</strong>
                    </v-chip>
                    <div class="text-body-2">
                      {{ lastBattleResult.loser.type }} - Level {{ lastBattleResult.loser.level }}
                    </div>
                  </div>
                </v-col>
              </v-row>

              <!-- Recompensas (apenas se jogador venceu) -->
              <div v-if="lastBattleResult.winner.id === playerCharacter?.id">
                <v-divider class="my-4"></v-divider>
                <div class="text-h6 mb-3">🎁 Recompensas Obtidas:</div>
                
                <v-row>
                  <v-col cols="12" md="4">
                    <div class="text-center">
                      <v-icon size="30" class="mb-2">mdi-star</v-icon>
                      <div class="text-h6">+{{ lastBattleResult.experienceGained }}</div>
                      <div class="text-body-2">Experiência</div>
                    </div>
                  </v-col>
                  
                  <v-col cols="12" md="4">
                    <div class="text-center">
                      <v-icon size="30" class="mb-2">mdi-treasure-chest</v-icon>
                      <div class="text-h6">+{{ formatBounty(lastBattleResult.bountyChange) }}</div>
                      <div class="text-body-2">Bounty</div>
                    </div>
                  </v-col>
                  
                  <v-col cols="12" md="4" v-if="currentEncounter?.specialReward">
                    <div class="text-center">
                      <v-icon size="30" class="mb-2">mdi-star-circle</v-icon>
                      <div class="text-h6">+{{ formatSpecialReward(currentEncounter.specialReward) }}</div>
                      <div class="text-body-2">Bonus Especial</div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>

          <!-- SEÇÃO DE RECRUTAMENTO COM DESIGN MELHORADO -->
          <v-card v-if="recruitmentData && lastBattleResult.winner.id === playerCharacter?.id" class="mb-4" color="orange-lighten-4">
            <v-card-title class="text-orange-darken-3">
              <v-icon left color="orange-darken-3">mdi-account-plus</v-icon>
              🤝 Oportunidade de Recrutamento
            </v-card-title>
            
            <v-card-text>
              <!-- Informações do Recrutamento -->
              <v-alert type="info" class="mb-4" variant="elevated">
                <strong>💡 Você pode tentar recrutar {{ lastBattleResult.loser.name }}!</strong><br>
                Como {{ playerCharacter?.type }}, você tem a oportunidade de adicionar este {{ lastBattleResult.loser.type }} ao seu crew.
              </v-alert>

              <!-- Preview das Chances -->
              <v-row v-if="recruitmentInfo">
                <v-col cols="12" md="4">
                  <v-card variant="outlined" class="text-center">
                    <v-card-text>
                      <v-icon size="40" :color="getChanceIconColor(recruitmentInfo.chancePercentage)">
                        mdi-dice-6
                      </v-icon>
                      <div class="text-h6 mt-2">{{ recruitmentInfo.chancePercentage }}%</div>
                      <div class="text-body-2">Chance de Sucesso</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-card variant="outlined" class="text-center">
                    <v-card-text>
                      <v-icon size="40" :color="recruitmentData.kindnessEffect === 'peaceful' ? 'success' : 'error'">
                        {{ recruitmentData.kindnessEffect === 'peaceful' ? 'mdi-handshake' : 'mdi-sword' }}
                      </v-icon>
                      <div class="text-h6 mt-2">
                        {{ recruitmentData.kindnessEffect === 'peaceful' ? 'Pacífico' : 'Forçado' }}
                      </div>
                      <div class="text-body-2">Tipo de Recrutamento</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-card variant="outlined" class="text-center">
                    <v-card-text>
                      <v-icon size="40" :color="recruitmentInfo.loyaltyPreview >= 0 ? 'success' : 'error'">
                        mdi-heart
                      </v-icon>
                      <div class="text-h6 mt-2">{{ recruitmentInfo.loyaltyPreview }}</div>
                      <div class="text-body-2">Loyalty Inicial</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Detalhes do Seu Kindness -->
              <v-card variant="outlined" class="mt-4 mb-4">
                <v-card-text>
                  <div class="text-center">
                    <v-icon size="30" :color="getKindnessIconColor(playerCharacter?.kindness || 0)">
                      {{ getKindnessIcon(playerCharacter?.kindness || 0) }}
                    </v-icon>
                    <div class="text-h6 mt-2">
                      Seu Kindness: 
                      <v-chip :color="getKindnessChipColor(playerCharacter?.kindness || 0)" variant="elevated" class="ml-2">
                        <strong>{{ playerCharacter?.kindness || 0 }}</strong>
                      </v-chip>
                    </div>
                    <div class="text-body-2">
                      {{ getKindnessDescription(playerCharacter?.kindness || 0) }}
                    </div>
                    <div class="text-caption mt-2">
                      {{ recruitmentData.kindnessEffect === 'peaceful' 
                        ? 'Seu carisma permitirá um recrutamento pacífico' 
                        : 'Sua crueldade forçará o recrutamento pela intimidação' }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Botões de Ação -->
              <v-row>
                <v-col cols="12" class="text-center">
                  <v-btn
                    :color="recruitmentData.kindnessEffect === 'peaceful' ? 'success' : 'warning'"
                    size="large"
                    class="mr-4"
                    @click="showRecruitmentModal = true"
                    :disabled="recruitmentAttempting || recruitmentTryed"
                    variant="elevated"
                  >
                    <v-icon left>
                      {{ recruitmentData.kindnessEffect === 'peaceful' ? 'mdi-handshake' : 'mdi-sword' }}
                    </v-icon>
                    {{ recruitmentData.kindnessEffect === 'peaceful' ? 'Recrutar Pacificamente' : 'Forçar Recrutamento' }}
                  </v-btn>
                  
                  <v-btn
                    color="grey"
                    size="large"
                    @click="skipRecruitment"
                    :disabled="recruitmentAttempting || recruitmentTryed"
                    variant="elevated"
                  >
                    <v-icon left>mdi-close</v-icon>
                    Pular Recrutamento
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- RESULTADO DO RECRUTAMENTO -->
          <v-card v-if="recruitmentResult" :color="recruitmentResult.success ? 'success' : 'error'" class="mb-4" variant="elevated">
            <v-card-title class="text-white">
              <v-icon left class="text-white">
                {{ recruitmentResult.success ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              {{ recruitmentResult.success ? '🎉 Recrutamento Bem-sucedido!' : '😔 Recrutamento Falhou' }}
            </v-card-title>
            
            <v-card-text class="text-white">
              <div class="text-h6 mb-3">{{ recruitmentResult.message }}</div>
              
              <div v-if="recruitmentResult.bonusMessage" class="text-body-1 mb-3">
                {{ recruitmentResult.bonusMessage }}
              </div>
              
              <!-- Detalhes se bem-sucedido -->
              <div v-if="recruitmentResult.success" class="mt-4">
                <v-divider class="mb-3"></v-divider>
                <div class="text-h6 mb-2">📋 Detalhes do Novo Membro:</div>
                <v-row>
                  <v-col cols="12" md="6">
                    <div>• <strong>Nome:</strong> {{ lastBattleResult.loser.name }}</div>
                    <div>• <strong>Tipo:</strong> {{ lastBattleResult.loser.type }}</div>
                    <div>• <strong>Level:</strong> {{ lastBattleResult.loser.level }}</div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div>• <strong>Posição:</strong> {{ lastBattleResult.loser.position }}</div>
                    <div>• <strong>Loyalty Inicial:</strong> {{ recruitmentResult.newLoyalty }}</div>
                    <div>• <strong>Método:</strong> {{ recruitmentData?.kindnessEffect === 'peaceful' ? 'Pacífico' : 'Forçado' }}</div>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>

          <!-- BOTÕES FINAIS -->
          <v-card>
            <v-card-text class="text-center">
              <v-btn
                color="primary"
                size="large"
                class="mr-4"
                @click="resetAdventure"
                variant="elevated"
              >
                <v-icon left>mdi-compass</v-icon>
                Nova Aventura
              </v-btn>
              
              <v-btn
                color="secondary"
                size="large"
                @click="viewCrew"
                v-if="recruitmentResult?.success"
                variant="elevated"
              >
                <v-icon left>mdi-account-group</v-icon>
                Ver Meu Crew
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- MODAL DE CONFIRMAÇÃO DE RECRUTAMENTO -->
      <v-dialog v-model="showRecruitmentModal" max-width="600">
        <v-card>
          <v-card-title class="bg-primary text-white">
            <v-icon left class="text-white">mdi-account-plus</v-icon>
            Confirmar Recrutamento
          </v-card-title>
          
          <v-card-text class="pt-4">
            <div class="text-center mb-4">
              <v-avatar size="80" :color="getTypeColor(lastBattleResult?.loser.type || '')">
                <span class="text-h4">{{ getTypeIcon(lastBattleResult?.loser.type || '') }}</span>
              </v-avatar>
              <div class="text-h6 mt-2">{{ lastBattleResult?.loser.name }}</div>
              <div class="text-body-2">{{ lastBattleResult?.loser.type }} - Level {{ lastBattleResult?.loser.level }}</div>
            </div>

            <v-alert :type="recruitmentData?.kindnessEffect === 'peaceful' ? 'success' : 'warning'" class="mb-4" variant="elevated">
              <div class="text-body-1">
                <strong>
                  {{ recruitmentData?.kindnessEffect === 'peaceful' 
                    ? '🤝 Recrutamento Pacífico' 
                    : '⚔️ Recrutamento Forçado' }}
                </strong>
              </div>
              <div class="text-body-2 mt-2">
                {{ recruitmentData?.kindnessEffect === 'peaceful' 
                  ? 'Você tentará convencer o oponente a se juntar ao seu crew através do diálogo e carisma.' 
                  : 'Você forçará o oponente a se juntar ao seu crew através da intimidação e força.' }}
              </div>
            </v-alert>

            <!-- Estatísticas da Tentativa -->
            <v-row>
              <v-col cols="4">
                <div class="text-center">
                  <v-chip :color="getChanceChipColor(recruitmentInfo?.chancePercentage || 0)" variant="elevated">
                    <strong>{{ recruitmentInfo?.chancePercentage || 0 }}%</strong>
                  </v-chip>
                  <div class="text-caption mt-1">Chance</div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="text-center">
                  <v-chip :color="(recruitmentInfo?.loyaltyPreview || 0) >= 0 ? 'green-darken-2' : 'red-darken-2'" variant="elevated">
                    <strong>{{ recruitmentInfo?.loyaltyPreview || 0 }}</strong>
                  </v-chip>
                  <div class="text-caption mt-1">Loyalty</div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="text-center">
                  <v-chip :color="getKindnessChipColor(playerCharacter?.kindness || 0)" variant="elevated">
                    <strong>{{ playerCharacter?.kindness || 0 }}</strong>
                  </v-chip>
                  <div class="text-caption mt-1">Kindness</div>
                </div>
              </v-col>
            </v-row>

            <div class="text-center mt-4">
              <div class="text-body-2 text-grey">
                {{ recruitmentInfo?.recommendation || '' }}
              </div>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey"
              @click="showRecruitmentModal = false"
              :disabled="recruitmentAttempting"
              variant="elevated"
            >
              Cancelar
            </v-btn>
            <v-btn
              :color="recruitmentData?.kindnessEffect === 'peaceful' ? 'success' : 'warning'"
              @click="attemptRecruitment"
              :loading="recruitmentAttempting"
              variant="elevated"
            >
              <v-icon left>
                {{ recruitmentData?.kindnessEffect === 'peaceful' ? 'mdi-handshake' : 'mdi-sword' }}
              </v-icon>
              Confirmar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from 'vue'
import { useTimeRemaining } from '@/composables/useTimeRemaining'
import TimeRemaining from '@/components/TimeRemaining.vue'
import { useCharacterStore } from '@/stores/characterStore'
import { useBattleStore } from '@/stores/battleStore'
import { useRouter } from 'vue-router'
import { AdventureSystem, type AdventureEncounter } from '@/utils/adventureSystem'
import { RecruitmentSystem, type RecruitmentAttempt } from '@/utils/recruitmentSystem'
import { IslandExplorationSystem } from '@/utils/islandExplorationSystem'
import { GameLogic } from '@/utils/gameLogic'
import { db } from '@/utils/database'
import type { Character, Crew, Task, StyleCombat } from '@/utils/database'

const characterStore = useCharacterStore()
const battleStore = useBattleStore()
const router = useRouter()

// 🔄 LOADING STATES
const playerCharacterLoaded = ref(false)
const activeTasksLoaded = ref(false)

// Usar o composable
const { formatTimeRemaining } = useTimeRemaining()

// 🎯 REACTIVE DATA
const currentEncounter = ref<AdventureEncounter | null>(null)
const loadingAdventure = ref(false)
const battleStarted = ref(false)
const lastBattleResult = ref<any>(null)
const availableStyleCombat = ref<StyleCombat[]>([])

// Tarefas ativas
const hasActiveTasks = ref(false)
const activeTasksCount = ref(0)
const activeTaskType = ref('')
const activeTasks = ref<Task[]>([])
const nextTaskToComplete = computed(() => {
  if (activeTasks.value.length === 0) return null
  
  return activeTasks.value
    .filter(task => !task.isCompleted)
    .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())[0]
})

// Recrutamento
const recruitmentData = ref<RecruitmentAttempt | null>(null)
const recruitmentInfo = ref<any>(null)
const showRecruitmentModal = ref(false)
const recruitmentAttempting = ref(false)
const recruitmentTryed = ref(false)
const recruitmentResult = ref<any>(null)

// 📊 COMPUTED
const playerCharacter = computed(() => characterStore.playerCharacter)


// ✅ COMPUTED PARA VERIFICAR SE TODOS OS DADOS ESTÃO CARREGADOS
const allDataLoaded = computed(() => {
  return playerCharacterLoaded.value && activeTasksLoaded.value
})

const redirect = () => {
  if(activeTaskType.value == 'exploration') router.push('/islands')
  else if(activeTaskType.value == 'training') router.push('/training')
  else if(activeTaskType.value == 'ship_upgrade') router.push('/crew')
  else if(activeTaskType.value == 'navigation') router.push('/navigation')
}

const iconName = () => {
  if(activeTaskType.value == 'exploration') return 'mdi-island'
  else if(activeTaskType.value == 'training') return 'mdi-dumbbell'
  else if(activeTaskType.value == 'ship_upgrade') return 'mdi-account-group'
  else if(activeTaskType.value == 'navigation') return 'mdi-compass'
}

// �� WATCHERS PARA DETECTAR QUANDO OS DADOS SÃO CARREGADOS
watch(() => playerCharacter.value, (newValue) => {
  if (newValue) {
    console.log('✅ PlayerCharacter carregado:', newValue.name)
    playerCharacterLoaded.value = true
  }
}, { immediate: true })

// 🔄 CARREGAMENTO SEQUENCIAL
const loadDataSequentially = async () => {
  try {
    console.log('🔄 Iniciando carregamento sequencial...')
    
    // 1. Aguardar playerCharacter estar disponível
    while (!playerCharacter.value) {
      console.log('⏳ Aguardando playerCharacter...')
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('✅ PlayerCharacter disponível')
    
    // 2. Verificar tarefas ativas
    console.log('🔄 Verificando tarefas ativas...')
    await checkActiveTasks()
    const styleCombats = await db.styleCombats.toArray()
    availableStyleCombat.value = styleCombats
    
    console.log('✅ Todos os dados carregados!')
    
  } catch (error) {
    console.error('❌ Erro no carregamento sequencial:', error)
  }
}

// ✅ VERIFICAR TAREFAS ATIVAS (versão melhorada)
const checkActiveTasks = async () => {
  if (!playerCharacter.value) {
    console.log('⚠️ PlayerCharacter não disponível para verificar tarefas')
    return
  }
  
  try {
    console.log('🔄 Verificando tarefas ativas...')
    
    // Carregar tarefas completas para ter dados detalhados
    activeTasks.value = await IslandExplorationSystem.getActiveTasks(playerCharacter.value.id!)
    
    const hasActive = activeTasks.value.length > 0
    const count = activeTasks.value.length

    const taskType = activeTasks.value[0].type
    
    hasActiveTasks.value = hasActive
    activeTasksCount.value = count
    activeTasksLoaded.value = true
    activeTaskType.value = taskType
    
    console.log(`✅ Tarefas ativas verificadas: ${count} ativas`)
    
    // Se há tarefas, configurar timer para recheck quando a próxima completar
    if (hasActive && nextTaskToComplete.value) {
      const timeToComplete = new Date(nextTaskToComplete.value.endTime).getTime() - Date.now()
      if (timeToComplete > 0) {
        setTimeout(() => {
          checkActiveTasks() // Recheck quando a tarefa completar
        }, timeToComplete + 1000) // +1 segundo de buffer
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tarefas ativas:', error)
    hasActiveTasks.value = false
    activeTasksCount.value = 0
    activeTasksLoaded.value = true
  }
}

// 🎯 MÉTODO PARA QUANDO TAREFA É COMPLETADA
const onTaskCompleted = async () => {
  console.log('⏰ Uma tarefa foi completada! Recarregando lista...')
  await checkActiveTasks()
  
  // Se não há mais tarefas ativas, o botão de aventura será habilitado automaticamente
  if (!hasActiveTasks.value) {
    console.log('✅ Todas as tarefas foram completadas! Aventura disponível.')
  }
}

const winChance = ref(0)

watchEffect(async () => {
  if (!playerCharacter.value || !currentEncounter.value) {
    winChance.value = 0
    return
  }

  try {
    
    const playerCrewHelp = await battleStore.calculateCrewHelp(playerCharacter.value, null)
    const opponentCrewHelp = await battleStore.calculateCrewHelp(currentEncounter.value.opponent, playerCharacter.value)
    const playerPower = GameLogic.calculatePower(playerCharacter.value) + playerCrewHelp
    const opponentPower = GameLogic.calculatePower(currentEncounter.value.opponent) + opponentCrewHelp
    
    const chance = (playerPower / (playerPower + opponentPower)) * 100
    winChance.value = Math.round(chance)
    
  } catch (error) {
    console.error('❌ Erro ao calcular chance de vitória:', error)
    winChance.value = 0
  }
})
const startAdventure = async () => {
  if (!playerCharacter.value || hasActiveTasks.value) {
    console.log('❌ Não é possível iniciar aventura: tarefas ativas ou personagem não disponível')
    return
  }
  
  loadingAdventure.value = true
  
  try {
    const encounter = await AdventureSystem.generateAdventure(playerCharacter.value)
    
    if (encounter) {
      currentEncounter.value = encounter
      battleStarted.value = false
      lastBattleResult.value = null
      recruitmentData.value = null
      recruitmentResult.value = null
      console.log('✅ Aventura iniciada:', encounter.opponent.name, encounter.opponent.id)
    } else {
      console.log('🚫 Nenhuma aventura disponível no momento')
    }
    
  } catch (error) {
    console.error('❌ Erro ao iniciar aventura:', error)
  } finally {
    loadingAdventure.value = false
  }
}



const startBattle = async () => {
  if (!playerCharacter.value || !currentEncounter.value) return
  
  battleStarted.value = true
  
  try {
    const result = await battleStore.simulateBattle(
      playerCharacter.value,
      currentEncounter.value.opponent
    )
    
    // Aplicar recompensa especial se venceu
    if (result.winner.id === playerCharacter.value.id && currentEncounter.value.specialReward) {
      const specialReward = currentEncounter.value.specialReward
      
      if (specialReward.type === 'bounty') {
        result.bountyChange += specialReward.value
      }
    }
    
    lastBattleResult.value = result
    
    // 🎯 VERIFICAR POSSIBILIDADE DE RECRUTAMENTO
    if (result.winner.id === playerCharacter.value.id) {
      await checkRecruitmentPossibility(result.loser)
    }
    
    // Recarregar personagem do jogador
    //await characterStore.loadPlayerCharacter()
    
  } catch (error) {
    console.error('❌ Erro na batalha:', error)
  }
}

const checkRecruitmentPossibility = async (loser: Character) => {
  try {
    // Buscar crew do perdedor
    const loserCrew = await db.crews.get(loser.crewId!)
    
    if (loserCrew && playerCharacter.value) {
      const recruitmentValidation = await RecruitmentSystem.validateRecruitment(
        playerCharacter.value,
        loser,
        loserCrew,
        'adventure'
      )
      
      if (recruitmentValidation.canRecruit) {
        recruitmentData.value = recruitmentValidation
        recruitmentInfo.value = await RecruitmentSystem.getRecruitmentInfo(
          playerCharacter.value,
          loser,
          recruitmentValidation
        )
      }
    }
  } catch (error) {
    console.error('❌ Erro ao verificar recrutamento:', error)
  }
}

const attemptRecruitment = async () => {
  if (!playerCharacter.value || !lastBattleResult.value || !recruitmentData.value) return
  
  recruitmentAttempting.value = true
  recruitmentTryed.value = true
  showRecruitmentModal.value = false
  
  try {
    const result = await RecruitmentSystem.attemptRecruitment(
      playerCharacter.value,
      lastBattleResult.value.loser,
      recruitmentData.value
    )
    
    recruitmentResult.value = result
    
    // Se bem-sucedido, recarregar dados do personagem
    if (result.success) {
      await characterStore.loadPlayerCharacter()
    }
    
  } catch (error) {
    console.error('❌ Erro no recrutamento:', error)
    recruitmentResult.value = {
      success: false,
      message: 'Erro interno durante o recrutamento'
    }
  } finally {
    recruitmentAttempting.value = false
  }
}

const skipRecruitment = () => {
  recruitmentData.value = null
  recruitmentInfo.value = null
}

const retreatFromEncounter = () => {
  currentEncounter.value = null
  battleStarted.value = false
  lastBattleResult.value = null
  recruitmentData.value = null
  recruitmentResult.value = null
  recruitmentTryed.value = false
}

const resetAdventure = () => {
  currentEncounter.value = null
  battleStarted.value = false
  lastBattleResult.value = null
  recruitmentData.value = null
  recruitmentResult.value = null
  recruitmentTryed.value = false
}

const viewCrew = () => {
  router.push('/crew')
}

// 🎨 FUNÇÕES DE CORES MELHORADAS
const calculatePower = (character: Character): number => {
  return GameLogic.calculatePower(character)
}

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'red-darken-2'
    case 'Marine': return 'blue-darken-2'
    case 'Government': return 'orange-darken-2'
    case 'BountyHunter': return 'green-darken-2'
    default: return 'grey-darken-2'
  }
}

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'Pirate': return '🏴‍☠️'
    case 'Marine': return '⚓'
    case 'Government': return '🏛️'
    case 'BountyHunter': return '💰'
    default: return '❓'
  }
}

const getChanceIconColor = (chance: number): string => {
  if (chance >= 70) return 'success'
  if (chance >= 40) return 'warning'
  return 'error'
}

const getChanceChipColor = (chance: number): string => {
  if (chance >= 70) return 'green-darken-2'
  if (chance >= 40) return 'orange-darken-2'
  return 'red-darken-2'
}

const getKindnessIconColor = (kindness: number): string => {
  if (kindness >= 50) return 'success'
  if (kindness >= 0) return 'info'
  if (kindness >= -50) return 'warning'
  return 'error'
}

const getKindnessChipColor = (kindness: number): string => {
  if (kindness >= 50) return 'green-darken-2'
  if (kindness >= 0) return 'blue-darken-2'
  if (kindness >= -50) return 'orange-darken-2'
  return 'red-darken-2'
}

const getKindnessIcon = (kindness: number): string => {
  if (kindness >= 50) return 'mdi-heart'
  if (kindness >= 0) return 'mdi-handshake'
  if (kindness >= -50) return 'mdi-sword'
  return 'mdi-skull'
}

const getKindnessDescription = (kindness: number): string => {
  if (kindness >= 50) return 'Muito Bondoso'
  if (kindness >= 0) return 'Bondoso'
  if (kindness >= -50) return 'Neutro/Cruel'
  return 'Muito Cruel'
}

const formatBounty = (bounty: number): string => {
  if (bounty >= 1000000000) {
    return `${(bounty / 1000000000).toFixed(2)}B B$`
  } else if (bounty >= 1000000) {
    return `${(bounty / 1000000).toFixed(2)}M B$`
  } else if (bounty >= 1000) {
    return `${(bounty / 1000).toFixed(2)}K B$`
  }
  return `${bounty} B$`
}

const opponentStyle = (combat: number): string => {
  return availableStyleCombat.value.find(comb => comb.id === combat).name
}

const formatSpecialReward = (reward: any): string => {
  switch (reward.type) {
    case 'bounty':
      return formatBounty(reward.value)
    case 'reputation':
      return `${reward.value} pontos de reputação`
    default:
      return `${reward.value}`
  }
}

// 🔄 LIFECYCLE
onMounted(async () => {
  await loadDataSequentially()
})
</script>

<style scoped>
.adventure-container {
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
.v-chip {
  font-weight: 700 !important;
}

.v-chip .v-chip__content {
  font-weight: 700 !important;
}

/* ANIMAÇÕES */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
  .adventure-container {
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
}

/* CORES CUSTOMIZADAS */
.text-orange-darken-3 {
  color: #e65100 !important;
}

.text-green-darken-3 {
  color: #1b5e20 !important;
}

.text-green-darken-4 {
  color: #0d5016 !important;
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
</style>