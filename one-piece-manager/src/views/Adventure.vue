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
      
      <!-- Header da Aventura -->
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4 adventure-header">
            <v-card-title class="text-center">
              <v-icon left size="large">mdi-map</v-icon>
              AVENTURAS
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

      <!-- ✅ SEÇÃO DO PERSONAGEM COM AVATAR -->
      <v-row v-if="!currentEncounter">
        <v-col cols="12">
          <v-card class="player-info-card">
            <v-card-text class="text-center py-8">
              
              <!-- ✅ AVATAR DO PLAYER -->
              <div class="player-avatar-section mb-4">
                <WantedPoster
                  :character="playerCharacter"
                  size="small"
                  :show-actions="false"
                  :show-size-controls="false"
                  class="main-poster"
                />
              </div>

              <v-icon size="80" color="primary" class="mb-4">mdi-compass</v-icon>
              <div class="text-h5 mb-4">Pronto para uma nova aventura?</div>
              <div class="text-body-1 mb-6">
                Como {{ playerCharacter?.type }}, você pode encontrar diferentes tipos de oponentes pelo mundo.
              </div>
              
              <!-- INFO DO PERSONAGEM COM MELHOR DESIGN -->
              <v-card variant="outlined" class="mb-4 mx-auto player-stats-card" style="max-width: 500px;">
                <v-card-text>
                  <div class="text-h6 mb-2">👤 {{ playerCharacter?.name }}</div>
                  <div class="text-body-2 mb-2">
                    <v-chip :color="getTypeColor(playerCharacter?.type || '')" size="small" variant="elevated" class="mr-2">
                      <strong>{{ playerCharacter?.type }}</strong>
                    </v-chip>
                    <v-chip color="blue-darken-2" size="small" variant="elevated" class="mr-2">
                      <strong>Level {{ playerCharacter?.level }}</strong>
                    </v-chip>
                    <v-chip color="purple-darken-2" size="small" variant="elevated">
                      <strong>{{ opponentStyle(playerCharacter?.styleCombatId) }}</strong>
                    </v-chip>
                  </div>
                  <div class="text-body-2">
                    <strong>Recompensa:</strong> 
                    <CharacterBountyDisplay 
                      :character="playerCharacter" 
                      size="small" 
                      variant="elevated" 
                    />
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
                class="adventure-start-btn"
              >
                <v-icon left>mdi-sail-boat</v-icon>
                {{ loadingAdventure ? 'Explorando...' : 'INICIAR AVENTURA' }}
              </v-btn>
              <v-spacer />
              <v-btn
                color="primary"
                size="x-large"
                :disabled="hasActiveTasks || loadingAdventure"
                @click="startAdventureX(10)"
                :loading="loadingAdventure"
                variant="elevated"
                class="adventure-start-btn"
                v-if="isDev"
              >
                <v-icon left>mdi-sail-boat</v-icon>
                {{ loadingAdventure ? 'Explorando...' : 'INICIAR AVENTURA 10X' }}
              </v-btn>
              <v-spacer />
              <v-btn
                color="primary"
                size="x-large"
                :disabled="hasActiveTasks || loadingAdventure"
                @click="startAdventureX(50)"
                :loading="loadingAdventure"
                variant="elevated"
                class="adventure-start-btn"
                v-if="isDev"
              >
                <v-icon left>mdi-sail-boat</v-icon>
                {{ loadingAdventure ? 'Explorando...' : 'INICIAR AVENTURA 50X' }}
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

      <!-- ✅ ENCONTRO ATUAL COM AVATARES -->
      <v-row v-if="currentEncounter && !battleStarted">
        <v-col cols="12">
          <v-card class="encounter-card">
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

              <!-- ✅ COMPARAÇÃO DE AVATARES -->
              <v-row class="mb-4">
                <v-col cols="12">
                  <v-card variant="outlined" class="avatar-comparison-card">
                    <v-card-title class="text-center">
                      <v-icon left>mdi-sword-cross</v-icon>
                      Confronto
                    </v-card-title>
                    <v-card-text>
                      <v-row align="center">
                        <!-- PLAYER -->
                        <v-col cols="5" class="text-center">
                          <div class="combatant-section">
                            <WantedPoster
                              :character="playerCharacter"
                              size="small"
                              :show-actions="false"
                              :show-size-controls="false"
                              class="main-poster"
                            />
                            <div class="text-h6 mt-2 text-primary">{{ playerCharacter?.name }}</div>
                            <div class="text-body-1 mb-6">
                              <div v-if="playerCharacter.position == 'Captain'">Capitão do bando {{ crew(playerCharacter.crewId)?.name }}</div> 
                              <div v-else>Membro do bando {{ crew(playerCharacter.crewId)?.name }}</div>
                            </div>
                            <v-chip :color="getTypeColor(playerCharacter?.type || '')" size="small" variant="elevated" class="mt-1 mr-2">
                              {{ playerCharacter?.type }}
                            </v-chip>
                            <v-chip :color="getTypeColor(playerCharacter.type)" size="small" variant="elevated" class="mt-1 mr-2">
                              Level {{ playerCharacter.level }}
                            </v-chip>
                            <v-chip :color="getTypeColor(playerCharacter.type)" size="small" variant="elevated" class="mt-1">
                              {{ opponentStyle(playerCharacter?.styleCombatId) }}
                            </v-chip>
                            <div class="text-body-2 mt-2">
                              <strong>Poder: {{ calculatePower(playerCharacter!) }}</strong>
                            </div>
                          </div>
                        </v-col>

                        <!-- VS -->
                        <v-col cols="2" class="text-center">
                          <div class="vs-section">
                            <v-icon size="60" color="error">mdi-sword-cross</v-icon>
                            <div class="text-h4 text-error font-weight-bold">VS</div>
                            
                            <!-- CHANCE DE VITÓRIA -->
                            <v-progress-circular
                              :model-value="winChance"
                              :color="winChance > 60 ? 'success' : winChance > 40 ? 'warning' : 'error'"
                              size="60"
                              width="8"
                              class="mt-2"
                            >
                              <span class="text-caption font-weight-bold">{{ winChance }}%</span>
                            </v-progress-circular>
                            <div class="text-caption mt-1">Vitória</div>
                          </div>
                        </v-col>

                        <!-- OPONENTE -->
                        <v-col cols="5" class="text-center">
                          <div class="combatant-section">
                            <WantedPoster
                              :character="currentEncounter.opponent"
                              size="small"
                              :show-actions="false"
                              :show-size-controls="false"
                              class="main-poster"
                            />
                            <div class="text-h6 mt-2 text-error">{{ currentEncounter.opponent.name }}</div>
                            <div class="text-body-1 mb-6">
                              <div v-if="currentEncounter.opponent.position == 'Captain'">Capitão do bando {{ crew(currentEncounter.opponent.crewId)?.name }}</div> 
                              <div v-else>Membro do bando {{ crew(currentEncounter.opponent.crewId)?.name }}</div>
                            </div>
                            <v-chip :color="getTypeColor(currentEncounter.opponent.type)" size="small" variant="elevated" class="mt-1 mr-2">
                              {{ currentEncounter.opponent.type }}
                            </v-chip>
                            <v-chip :color="getTypeColor(currentEncounter.opponent.type)" size="small" variant="elevated" class="mt-1 mr-2">
                              Level {{ currentEncounter.opponent.level }}
                            </v-chip>
                            <v-chip :color="getTypeColor(currentEncounter.opponent.type)" size="small" variant="elevated" class="mt-1">
                              {{ opponentStyle(currentEncounter.opponent.styleCombatId) }}
                            </v-chip>
                            <div class="text-body-2 mt-2">
                              <strong>Poder: {{ calculatePower(currentEncounter.opponent) }}</strong>
                            </div>
                          </div>
                        </v-col>
                      </v-row>
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
                    class="mr-4 battle-btn"
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
                    class="retreat-btn"
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

      <!-- ✅ RESULTADO DA BATALHA COM BATTLE LOG MELHORADO -->
      <v-row class="mt-4" v-if="lastBattleResult">
        <v-col cols="12">
          
          <!-- ✅ RESULTADO PRINCIPAL COM AVATARES -->
          <v-card :color="lastBattleResult.winner.id === playerCharacter?.id ? 'success' : 'error'" class="mb-4 battle-result-card" variant="elevated">
            <v-card-title class="text-white">
              <v-icon left class="text-white">
                {{ lastBattleResult.winner.id === playerCharacter?.id ? 'mdi-trophy' : 'mdi-skull' }}
              </v-icon>
              {{ lastBattleResult.winner.id === playerCharacter?.id ? '🏆 VITÓRIA!' : '💔 DERROTA!' }}
            </v-card-title>
            
            <v-card-text class="text-white">
              <!-- ✅ AVATARES DOS COMBATENTES -->
              <v-row class="mb-4">
                <v-col cols="12">
                  <div class="battle-result-avatars">
                    <v-row align="center">
                      <!-- VENCEDOR -->
                      <v-col cols="5" class="text-center">
                        <div class="result-combatant winner">
                          <WantedPoster
                            :character="lastBattleResult.winner"
                            size="small"
                            :show-actions="false"
                            :show-size-controls="false"
                            class="main-poster"
                          />
                          
                          <div class="text-h6 mt-2">🏆 {{ lastBattleResult.winner.name }}</div>
                          <v-chip color="white" :text-color="lastBattleResult.winner.id === playerCharacter?.id ? 'success' : 'error'" variant="elevated">
                            <strong>VENCEDOR</strong>
                          </v-chip>
                        </div>
                      </v-col>

                      <!-- RESULTADO -->
                      <v-col cols="2" class="text-center">
                        <v-icon size="60" color="white">
                          {{ lastBattleResult.winner.id === playerCharacter?.id ? 'mdi-trophy' : 'mdi-skull' }}
                        </v-icon>
                      </v-col>

                      <!-- PERDEDOR -->
                      <v-col cols="5" class="text-center">
                        <div class="result-combatant loser">
                          <WantedPoster
                            :character="lastBattleResult.loser"
                            size="small"
                            :show-actions="false"
                            :show-size-controls="false"
                            class="main-poster"
                          />
                          <div class="text-h6 mt-2">💔 {{ lastBattleResult.loser.name }}</div>
                          <v-chip color="white" text-color="error" variant="elevated">
                            <strong>PERDEDOR</strong>
                          </v-chip>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </v-col>
              </v-row>

              <!-- Recompensas (apenas se jogador venceu) -->
              <div v-if="lastBattleResult.winner.id === playerCharacter?.id">
                <v-divider class="my-4"></v-divider>
                <div class="text-h6 mb-3">🎁 Recompensas Obtidas:</div>
                
                <v-row>
                  <v-col cols="12" md="3">
                    <div class="text-center">
                      <v-icon size="30" class="mb-2">mdi-star</v-icon>
                      <div class="text-h6">+{{ lastBattleResult.experienceGained }}</div>
                      <div class="text-body-2">Experiência</div>
                    </div>
                  </v-col>

                  <v-col cols="12" md="3">
                    <div class="text-center">
                      <v-icon size="30" class="mb-2">mdi-treasure-chest</v-icon>
                      <div class="text-h6">+{{ formatBounty(lastBattleResult.bountyChange) }}</div>
                      <div class="text-body-2">Bounty</div>
                    </div>
                  </v-col>

                  <v-col cols="12" md="3">
                    <div class="text-center">
                      <v-icon size="30" class="mb-2">mdi-cash-multiple</v-icon>
                      <div class="text-h6">+{{ formatBounty(lastBattleResult.treasuryStole) }}</div>
                      <div class="text-body-2">Treasury</div>
                    </div>
                  </v-col>
                  
                  <v-col cols="12" md="3" v-if="currentEncounter?.specialReward">
                    <div class="text-center">
                      <v-icon size="30" class="mb-2">mdi-star-circle</v-icon>
                      <div class="text-h6">+{{ formatSpecialReward(currentEncounter.specialReward) }}</div>
                      <div class="text-body-2">Bonus Especial</div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- Penalidade de recompensa (jogador perdeu) -->
              <div v-if="lastBattleResult.loser.id === playerCharacter?.id && lastBattleResult.bountyLost && lastBattleResult.bountyLost > 0">
                <v-divider class="my-4"></v-divider>
                <div class="text-h6 mb-3" style="color:#EF5350">⚠️ Penalidade de Derrota:</div>
                <v-row>
                  <v-col cols="12" md="4">
                    <div class="text-center">
                      <v-icon size="30" class="mb-2" color="error">mdi-trending-down</v-icon>
                      <div class="text-h6" style="color:#EF5350">-{{ formatBounty(lastBattleResult.bountyLost) }}</div>
                      <div class="text-body-2">Bounty Perdido</div>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <!-- 🗡️ ITENS ROUBADOS -->
              <div v-if="theftResult && theftResult.stolenItems.length > 0">
                <v-divider class="my-4"></v-divider>
                <div class="text-h6 mb-3">🗡️ Itens Saqueados:</div>
                <v-row>
                  <v-col
                    v-for="item in theftResult.stolenItems"
                    :key="item.id"
                    cols="auto"
                  >
                    <v-chip
                      color="amber-darken-2"
                      variant="elevated"
                      size="small"
                    >
                      <v-icon start size="14">mdi-bag-personal</v-icon>
                      {{ item.name }}
                      <v-chip
                        size="x-small"
                        class="ml-1"
                        :color="item.class === 'S' ? 'yellow-darken-3' : item.class === 'A' ? 'pink-darken-2' : 'blue-darken-1'"
                        variant="elevated"
                      >{{ item.class }}</v-chip>
                    </v-chip>
                  </v-col>
                </v-row>
              </div>

              <!-- ✅ BATTLE LOG MELHORADO -->
              <v-divider class="my-4"></v-divider>
              <BattleLogDisplay
                :battle-log="lastBattleResult.battleLog"
                :player-character="playerCharacter"
                :opponent-character="lastBattleResult.loser"
                :battle-result="lastBattleResult"
                class="mt-4"
              />
            </v-card-text>
          </v-card>

          <!-- ✅ SEÇÃO DE RECRUTAMENTO COM AVATAR DO CANDIDATO -->
          <v-card v-if="recruitmentData && lastBattleResult.winner.id === playerCharacter?.id" class="mb-4 recruitment-card" color="orange-lighten-4">
            <v-card-title class="text-orange-darken-3">
              <v-icon left color="orange-darken-3">mdi-account-plus</v-icon>
              🤝 Oportunidade de Recrutamento
            </v-card-title>
            
            <v-card-text>
              <!-- ✅ AVATAR DO CANDIDATO -->
              <v-row class="mb-4">
                <v-col cols="12" class="text-center">
                  <div class="recruitment-candidate">
                    <WantedPoster
                      :character="lastBattleResult.loser"
                      size="small"
                      :show-actions="false"
                      :show-size-controls="false"
                      class="main-poster"
                    />
                    <div class="text-h6 mt-2">{{ lastBattleResult.loser.name }}</div>
                    <v-chip :color="getTypeColor(lastBattleResult.loser.type)" variant="elevated" class="mt-1">
                      {{ lastBattleResult.loser.type }} - Level {{ lastBattleResult.loser.level }}
                    </v-chip>
                  </div>
                </v-col>
              </v-row>

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
              {{ recruitmentResult.success ? '🎉 Recrutamento Bem-sucedido!' : '💔 Recrutamento Falhou' }}
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

      <!-- ✅ MODAL DE CONFIRMAÇÃO DE RECRUTAMENTO COM AVATAR -->
      <v-dialog v-model="showRecruitmentModal" max-width="600">
        <v-card>
          <v-card-title class="bg-primary text-white">
            <v-icon left class="text-white">mdi-account-plus</v-icon>
            Confirmar Recrutamento
          </v-card-title>
          
          <v-card-text class="pt-4">
            <div class="text-center mb-4">
              <!-- ✅ AVATAR NO MODAL -->
              <CharacterAvatar 
                v-if="lastBattleResult"
                :character="lastBattleResult.loser"
                size="lg"
                variant="circle"
                :show-actions="false"
                :show-status-indicators="true"
                :show-level="true"
                :cache-enabled="true"
                :clickable="false"
                class="modal-candidate-avatar"
              />
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
import { useWorldStore } from '@/stores/worldStore'
import { useRouter } from 'vue-router'
import { AdventureSystem, type AdventureEncounter } from '@/utils/adventureSystem'
import { InventorySystem } from '@/utils/inventorySystem'
import { RecruitmentSystem, type RecruitmentAttempt } from '@/utils/recruitmentSystem'
import { IslandExplorationSystem } from '@/utils/islandExplorationSystem'
import { GameLogic } from '@/utils/gameLogic'
import { db } from '@/utils/database'
import type { Character, Crew, Task, StyleCombat, DevilFruit } from '@/utils/database'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'
// ✅ IMPORTS DOS NOVOS COMPONENTES
import CharacterAvatar from '@/components/CharacterAvatar.vue'
import WantedPoster from '@/components/WantedPoster.vue'
import BattleLogDisplay from '@/components/BattleLogDisplay.vue'


const characterStore = useCharacterStore()
const battleStore = useBattleStore()
const worldStore = useWorldStore()
const router = useRouter()
const isDev = import.meta.env.DEV

// 🔄 LOADING STATES
const playerCharacterLoaded = ref(false)
const activeTasksLoaded = ref(false)
const devilFruitLoaded = ref(false)
const crewsLoaded = ref(false)
const avatarSystemLoaded = ref(false)

// Usar o composable
const { formatTimeRemaining } = useTimeRemaining()

// 🎯 REACTIVE DATA
const currentEncounter = ref<AdventureEncounter | null>(null)
const loadingAdventure = ref(false)
const battleStarted = ref(false)
const lastBattleResult = ref<any>(null)
const theftResult = ref<{ stolenItems: any[]; message: string } | null>(null)
const availableStyleCombat = ref<StyleCombat[]>([])
const availableDevilFruit = ref<DevilFruit[]>([])
const allCrews = ref<Crew[]>([])

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
  return playerCharacterLoaded.value && 
         activeTasksLoaded.value && 
         devilFruitLoaded.value && 
         avatarSystemLoaded.value &&
         crewsLoaded.value
})

// ✅ EVENTOS DE AVATAR
const onPlayerAvatarRegenerated = (svgData: string) => {
  console.log('✅ Avatar do player regenerado na aventura')
}

const onPlayerAvatarError = (error: Error) => {
  console.error('❌ Erro no avatar do player na aventura:', error)
}

const redirect = () => {
  if(activeTaskType.value == 'exploration') router.push('/islands')
  else if(activeTaskType.value == 'training') router.push('/training')
  else if(activeTaskType.value == 'ship_upgrade') router.push('/crew')
  else if(activeTaskType.value == 'navigation') router.push('/navigation')
  else if(activeTaskType.value == 'island_liberation') router.push('/territory-liberation')
}

const iconName = () => {
  if(activeTaskType.value == 'exploration') return 'mdi-island'
  else if(activeTaskType.value == 'training') return 'mdi-dumbbell'
  else if(activeTaskType.value == 'ship_upgrade') return 'mdi-account-group'
  else if(activeTaskType.value == 'navigation') return 'mdi-compass'
  else if(activeTaskType.value == 'island_liberation') return 'mdi-sword-cross'
}

const devilFruit = (devilFruit: number): DevilFruit => {
    return availableDevilFruit.value.find(fruit => fruit.id === devilFruit)
}

const crew = (crew: number): Crew => {
  return allCrews.value.find(cr => cr.id === crew)
}

const getDevilFruits = async () => {
    try {
    
    const df = await db.devilFruits.toArray()
    if(df){
      availableDevilFruit.value = df
    }
    else {
    }
    devilFruitLoaded.value = true
    
  } catch (error) {
    devilFruitLoaded.value = true
  }
}

const getCrews = async () => {
    try {
    const crw = await db.crews.toArray()
    if(crw){
      allCrews.value = crw
    }
    else {
    }
    
    crewsLoaded.value = true
    
  } catch (error) {
    crewsLoaded.value = true
  }
}

// ✅ WATCHERS PARA DETECTAR QUANDO OS DADOS SÃO CARREGADOS
watch(() => playerCharacter.value, (newValue) => {
  if (newValue) {
    playerCharacterLoaded.value = true
  }
}, { immediate: true })

// 🔄 CARREGAMENTO SEQUENCIAL
const loadDataSequentially = async () => {
  try {
    
    // 1. Aguardar playerCharacter estar disponível
        while (!playerCharacter.value) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    
    // 2. Verificar tarefas ativas
    await checkActiveTasks()
    const styleCombats = await db.styleCombats.toArray()
    availableStyleCombat.value = styleCombats

    await getDevilFruits()

    await getCrews()
    

    // 3. ✅ INICIALIZAR SISTEMA DE AVATARES
    await initializeAvatarSystem()
    
  } catch (error) {
    console.error('❌ Erro no carregamento sequencial:', error)
  }
}

// ✅ INICIALIZAR SISTEMA DE AVATARES
const initializeAvatarSystem = async () => {
  try {
    
    // Aguardar um pouco para simular carregamento
    await new Promise(resolve => setTimeout(resolve, 500))
    
    avatarSystemLoaded.value = true
    
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de avatares:', error)
    avatarSystemLoaded.value = true // Continuar mesmo com erro
  }
}

// ✅ VERIFICAR TAREFAS ATIVAS (versão melhorada)
const checkActiveTasks = async () => {
  if (!playerCharacter.value) {
    return
  }
  
  try {
    
    // Carregar tarefas completas para ter dados detalhados
    activeTasks.value = await IslandExplorationSystem.getActiveTasks(playerCharacter.value.id!)
    
    const hasActive = activeTasks.value.length > 0
    const count = activeTasks.value.length

    const taskType = activeTasks.value[0]?.type || ''
    
    hasActiveTasks.value = hasActive
    activeTasksCount.value = count
    activeTasksLoaded.value = true
    activeTaskType.value = taskType
    
    
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
  await checkActiveTasks()
  
  // Se não há mais tarefas ativas, o botão de aventura será habilitado automaticamente
  if (!hasActiveTasks.value) {
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

const startAdventureX = async (times: number) => {
  for(var i =1; i<=times; i++){
    await startAdventure();
    await startBattle();
  }
}

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
    } else {
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
  theftResult.value = null

  try {
    // Aplicar bônus de itens equipados ao personagem do jogador
    const itemBonuses = await InventorySystem.calculateItemBonuses(playerCharacter.value)
    const playerWithItems = {
      ...playerCharacter.value,
      stats: InventorySystem.applyBonusesToStats(playerCharacter.value.stats, itemBonuses),
    }

    const specialBounty = currentEncounter.value.specialReward && currentEncounter.value.specialReward.type === 'bounty' ? currentEncounter.value.specialReward.value : 0
    const specialExp = currentEncounter.value.specialReward && currentEncounter.value.specialReward.type === 'experience' ? currentEncounter.value.specialReward.value : 0
    const result = await battleStore.simulateBattle(
      playerWithItems,
      currentEncounter.value.opponent,
      specialBounty,
      specialExp
    )
    await AdventureSystem.onPlayerAction()

    lastBattleResult.value = result

    // 🎯 VERIFICAR POSSIBILIDADE DE RECRUTAMENTO E ROUBO DE ITENS
    if (result.winner.id === playerCharacter.value.id) {
      await checkRecruitmentPossibility(result.loser)
      // Rolar dados para roubo de itens do perdedor
      const theft = await InventorySystem.rollItemTheft(result.winner.id!, result.loser.id!)
      if (theft.stolenItems.length > 0) {
        theftResult.value = theft
      }
    }

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
  theftResult.value = null
}

const resetAdventure = () => {
  currentEncounter.value = null
  battleStarted.value = false
  lastBattleResult.value = null
  recruitmentData.value = null
  recruitmentResult.value = null
  recruitmentTryed.value = false
  theftResult.value = null
}

const viewCrew = () => {
  router.push('/crew')
}

// 🎨 FUNÇÕES DE CORES MELHORADAS
const calculatePower = (character: Character): number => {
  const df = devilFruit(character.devilFruitId)
  return GameLogic.calculatePower(character, df)
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
  return availableStyleCombat.value.find(comb => comb.id === combat)?.name || 'Desconhecido'
}

const formatSpecialReward = (reward: any): string => {
  switch (reward.type) {
    case 'bounty':
      return formatBounty(reward.value)
    case 'experience':
      return `${reward.value * 100}% de experiencia`
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
/* ============================================================
   Adventure - Grand Line Expedition
   ============================================================ */

.adventure-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 8px;
}

/* Loading */
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
  text-align: left;
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
.adventure-header {
  background: linear-gradient(135deg,
    rgba(255, 107, 53, 0.1),
    rgba(212, 175, 55, 0.06)
  );
  border: 1px solid rgba(255, 107, 53, 0.25);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.adventure-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent, #FF6B35, #FFD700, #FF6B35, transparent
  );
}

.adventure-title {
  font-family: Georgia, serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #FF6B35;
  text-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
  letter-spacing: 0.05em;
  margin: 0;
}

/* Adventure option cards */
.adventure-option-card {
  background: #132235;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  height: 100%;
}

.adventure-option-card:hover {
  border-color: rgba(212, 175, 55, 0.6);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
  transform: translateY(-3px);
}

.adventure-option-card.selected {
  border-color: #D4AF37;
  background: linear-gradient(135deg,
    rgba(212, 175, 55, 0.12),
    rgba(21, 101, 192, 0.08)
  );
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

.adventure-option-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  display: block;
}

.adventure-option-name {
  font-family: Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #D4AF37;
  margin-bottom: 6px;
}

.adventure-option-desc {
  font-size: 0.82rem;
  color: #8B9DC3;
  line-height: 1.5;
}

/* Active task panel */
.active-task-card {
  background: linear-gradient(135deg, #132235, #1A2F45);
  border: 1px solid rgba(255, 107, 53, 0.35);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
}

.active-task-header {
  background: linear-gradient(135deg,
    rgba(255, 107, 53, 0.15),
    rgba(212, 175, 55, 0.06)
  );
  border-bottom: 1px solid rgba(255, 107, 53, 0.25);
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.active-task-title {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #FF6B35;
  font-size: 1rem;
  letter-spacing: 0.03em;
}

/* Result cards */
.result-card-win {
  background: linear-gradient(135deg, #0A2010, #143020) !important;
  border-color: rgba(46, 125, 50, 0.5) !important;
  box-shadow: 0 0 20px rgba(46, 125, 50, 0.2) !important;
}

.result-card-lose {
  background: linear-gradient(135deg, #1A0808, #2D1010) !important;
  border-color: rgba(198, 40, 40, 0.5) !important;
  box-shadow: 0 0 20px rgba(198, 40, 40, 0.2) !important;
}

/* Encounter type badge */
.encounter-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.encounter-badge-hostile {
  color: #EF5350;
  background: rgba(239, 83, 80, 0.12);
  border: 1px solid rgba(239, 83, 80, 0.35);
}

.encounter-badge-friendly {
  color: #66BB6A;
  background: rgba(102, 187, 106, 0.1);
  border: 1px solid rgba(102, 187, 106, 0.3);
}

.encounter-badge-neutral {
  color: #78909C;
  background: rgba(120, 144, 156, 0.1);
  border: 1px solid rgba(120, 144, 156, 0.25);
}

/* Reward display */
.reward-section {
  background: rgba(212, 175, 55, 0.06);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  padding: 14px;
}

.reward-xp {
  font-family: Georgia, serif;
  color: #90CAF9;
  font-weight: 700;
  font-size: 1.1rem;
}

.reward-bounty {
  font-family: Georgia, serif;
  color: #FFD700;
  font-weight: 700;
  font-size: 1.1rem;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
}
</style>