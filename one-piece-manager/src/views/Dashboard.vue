<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard-container">
    <!-- LOADING STATE GLOBAL -->
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
              
              <div class="text-h6 mb-4">Carregando Dashboard</div>
              
              <!-- PROGRESSO DETALHADO -->
              <div class="loading-steps">
                <div class="step-item" :class="{ 'completed': gameInitialized }">
                  <v-icon :color="gameInitialized ? 'success' : 'grey'">
                    {{ gameInitialized ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Inicializando Jogo</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': characterLoaded }">
                  <v-icon :color="characterLoaded ? 'success' : 'grey'">
                    {{ characterLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Personagem</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <!-- CONTEÚDO PRINCIPAL -->
    <div v-else>
      
      <!-- HEADER DO DASHBOARD -->
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4">
            <v-card-title class="text-center">
              <v-icon left size="large">mdi-view-dashboard</v-icon>
              🎮 DASHBOARD
            </v-card-title>
            <v-card-subtitle class="text-center">
              Central de comando do seu pirata
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>

      <!-- ✅ NOVA SEÇÃO: CONTROLE DO MUNDO -->
      <v-row>
        <v-col cols="12">
          <v-card variant="outlined" class="world-control-panel mb-4">
            <v-card-title class="bg-primary text-white">
              <v-icon left color="white">mdi-earth</v-icon>
              🌍 Controle do Mundo
            </v-card-title>
            
            <v-card-text class="pa-4">
              
              <!-- STATUS COMPACTO -->
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="status-compact">
                  <v-chip
                    :color="worldStatus.canStartGame ? 'success' : 'warning'"
                    :prepend-icon="worldStatus.canStartGame ? 'mdi-check-circle' : 'mdi-alert-circle'"
                    variant="tonal"
                    size="small"
                  >
                    {{ worldStatus.canStartGame ? 'Mundo Pronto' : 'Configuração Pendente' }}
                  </v-chip>
                </div>
                
                <div class="world-actions">
                  <!-- CRIAR PERSONAGEM -->
                  <v-btn
                    v-if="worldStatus.needsCharacterCreation"
                    color="primary"
                    variant="elevated"
                    size="small"
                    prepend-icon="mdi-account-plus"
                    @click="goToCharacterCreation"
                    class="mr-2"
                  >
                    Criar Personagem
                  </v-btn>
                  
                  <!-- RESETAR MUNDO -->
                  <v-btn
                    color="error"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-earth-off"
                    @click="showResetDialog = true"
                  >
                    Novo Mundo
                  </v-btn>
                </div>
              </div>
              
              <!-- DETALHES EXPANSÍVEIS -->
              <v-expansion-panels v-model="worldPanelOpen" variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon left>mdi-information</v-icon>
                    Detalhes do Status Mundial
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="12" md="3">
                        <v-card variant="outlined" class="text-center pa-3">
                          <v-icon :color="worldStatus.hasGameState ? 'success' : 'error'" size="30">
                            {{ worldStatus.hasGameState ? 'mdi-check' : 'mdi-close' }}
                          </v-icon>
                          <div class="text-body-2 mt-1">
                            <strong>GameState</strong>
                          </div>
                          <div class="text-caption">{{ worldStatus.hasGameState ? 'Ativo' : 'Inativo' }}</div>
                        </v-card>
                      </v-col>
                      
                      <v-col cols="12" md="3">
                        <v-card variant="outlined" class="text-center pa-3">
                          <v-icon :color="!worldStatus.needsCharacterCreation ? 'success' : 'warning'" size="30">
                            {{ !worldStatus.needsCharacterCreation ? 'mdi-check' : 'mdi-account-plus' }}
                          </v-icon>
                          <div class="text-body-2 mt-1">
                            <strong>Personagem</strong>
                          </div>
                          <div class="text-caption">{{ !worldStatus.needsCharacterCreation ? 'Criado' : 'Pendente' }}</div>
                        </v-card>
                      </v-col>
                      
                      <v-col cols="12" md="3">
                        <v-card variant="outlined" class="text-center pa-3">
                          <v-icon :color="worldStatus.isWorldGenerated ? 'success' : 'warning'" size="30">
                            {{ worldStatus.isWorldGenerated ? 'mdi-check' : 'mdi-earth-plus' }}
                          </v-icon>
                          <div class="text-body-2 mt-1">
                            <strong>Mundo</strong>
                          </div>
                          <div class="text-caption">{{ worldStatus.isWorldGenerated ? 'Gerado' : 'Pendente' }}</div>
                        </v-card>
                      </v-col>
                      
                      <v-col cols="12" md="3">
                        <v-card variant="outlined" class="text-center pa-3">
                          <v-icon :color="worldStatus.canStartGame ? 'success' : 'error'" size="30">
                            {{ worldStatus.canStartGame ? 'mdi-play' : 'mdi-pause' }}
                          </v-icon>
                          <div class="text-body-2 mt-1">
                            <strong>Jogo</strong>
                          </div>
                          <div class="text-caption">{{ worldStatus.canStartGame ? 'Pronto' : 'Não Pronto' }}</div>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
              
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <v-row>
        <!-- INFORMAÇÕES DO JOGADOR -->
        <v-col cols="12" lg="6">
          <v-card variant="elevated" class="mb-4">
            <v-card-title class="bg-blue-lighten-5 text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-account-circle</v-icon>
              Seu Personagem
            </v-card-title>
            
            <!-- Personagem existe -->
            <v-card-text v-if="playerCharacter" class="pa-4">
              <!-- HEADER DO PERSONAGEM -->
              <div class="character-header mb-4">
                <div class="d-flex align-center mb-3">
                  <v-avatar size="60" :color="getTypeColor(playerCharacter.type)" class="mr-3">
                    <span class="text-h5">{{ getTypeIcon(playerCharacter.type) }}</span>
                  </v-avatar>
                  <div>
                    <div class="text-h5 mb-1">{{ playerCharacter.name }}</div>
                    <div class="d-flex gap-2">
                      <v-chip :color="getTypeColor(playerCharacter.type)" size="small" variant="elevated">
                        <strong>{{ playerCharacter.type }}</strong>
                      </v-chip>
                      <v-chip color="blue-darken-2" size="small" variant="elevated">
                        <strong>Level {{ playerCharacter.level }}</strong>
                      </v-chip>
                      <CharacterBountyDisplay 
                        :character="playerCharacter" 
                        size="small" 
                        variant="elevated" 
                      />
                      <v-chip color="accent-darken-2" size="small" variant="elevated">
                        <strong>{{ playerStyleCombat?.name || 'Carregando...' }}</strong>
                      </v-chip>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- STATS PRINCIPAIS -->
              <v-row class="mb-4">
                <v-col cols="12" md="6">
                  <v-card variant="outlined" color="red-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="red-darken-2">mdi-sword</v-icon>
                      <div class="text-h6 mt-1 text-red-darken-3">{{ playerCharacter.stats.attack }}</div>
                      <div class="text-caption">Attack</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" color="blue-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="blue-darken-2">mdi-shield</v-icon>
                      <div class="text-h6 mt-1 text-blue-darken-3">{{ playerCharacter.stats.defense }}</div>
                      <div class="text-caption">Defense</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- STATS SECUNDÁRIOS -->
              <v-row class="mb-4">
                <v-col cols="4">
                  <v-card variant="outlined" color="green-darken-1">
                    <v-card-text class="text-center pa-2">
                      <v-icon color="green-darken-2">mdi-run-fast</v-icon>
                      <div class="text-body-2 mt-1 text-green-darken-3">
                        <strong>{{ playerCharacter.stats.speed }}</strong>
                      </div>
                      <div class="text-caption">Speed</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="4">
                  <v-card variant="outlined" color="orange-darken-1">
                    <v-card-text class="text-center pa-2">
                      <v-icon color="orange-darken-2">mdi-arm-flex</v-icon>
                      <div class="text-body-2 mt-1 text-orange-darken-3">
                        <strong>{{ playerCharacter.stats.armHaki }}</strong>
                      </div>
                      <div class="text-caption">Busoshoku Haki</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="4">
                  <v-card variant="outlined" color="purple-darken-1">
                    <v-card-text class="text-center pa-2">
                      <v-icon color="purple-darken-2">mdi-eye</v-icon>
                      <div class="text-body-2 mt-1 text-purple-darken-3">
                        <strong>{{ playerCharacter.stats.obsHaki }}</strong>
                      </div>
                      <div class="text-caption">Kenbunshoku Haki</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- Haoshoku Haki E KINDNESS -->
              <v-row class="mb-4">
                <v-col cols="6">
                  <v-card variant="outlined" color="amber-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="25" color="amber-darken-3">mdi-crown</v-icon>
                      <div class="text-h6 mt-1 text-amber-darken-4">{{ playerCharacter.stats.kingHaki }}</div>
                      <div class="text-caption">Haoshoku Haki</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card variant="outlined" :color="getKindnessCardColor(playerCharacter.kindness)">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="25" :color="getKindnessIconColor(playerCharacter.kindness)">
                        {{ getKindnessIcon(playerCharacter.kindness) }}
                      </v-icon>
                      <div class="text-h6 mt-1" :class="getKindnessTextColor(playerCharacter.kindness)">
                        {{ playerCharacter.kindness }}
                      </div>
                      <div class="text-caption">Bondade</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Akuma no Mi -->
              <v-card v-if="playerCharacter.devilFruitId != 0" variant="outlined" color="teal-darken-1" class="mb-4">
                <v-card-text class="text-center pa-3">
                  <v-icon size="35" color="teal-darken-2">mdi-fruit-pineapple</v-icon>
                  <div class="text-h5 mt-1 text-teal-darken-3">
                    <strong>{{ playerCharacter.stats.devilFruit }}</strong>
                  </div>
                  <div class="text-body-2">{{ playerDevilFruit?.name || 'Carregando...' }} - {{ playerDevilFruit?.type || '' }}<strong>{{playerCharacter.level >= (playerDevilFruit?.awakeningOn || 999) ? ' (Despertada)' : ''}}</strong></div>
                </v-card-text>
              </v-card>
              
              <!-- PODER TOTAL -->
              <v-card variant="outlined" color="deep-purple-darken-1" class="mb-4">
                <v-card-text class="text-center pa-3">
                  <v-icon size="35" color="deep-purple-darken-2">mdi-flash</v-icon>
                  <div class="text-h5 mt-1 text-deep-purple-darken-3">
                    <strong>{{ calculatePower(playerCharacter) }}</strong>
                  </div>
                  <div class="text-body-2">Poder Total</div>
                </v-card-text>
              </v-card>
              
              <!-- EXPERIÊNCIA -->
              <div class="experience-section">
                <div class="text-body-1 mb-2">
                  <strong>Experiência:</strong> {{ playerCharacter.experience }} / {{ expForNextLevel }} XP
                </div>
                <v-progress-linear
                  :model-value="experiencePercentage"
                  color="primary"
                  height="20"
                  rounded
                  class="mb-2"
                >
                  <template v-slot:default>
                    <strong :class="Math.round(experiencePercentage) >= 52 ? 'text-white' : 'text-black'">{{ Math.round(experiencePercentage) }}%</strong>
                  </template>
                </v-progress-linear>
                <div class="text-caption text-center">
                  Faltam {{ expForNextLevel - playerCharacter.experience }} XP para o próximo level
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- AÇÕES RÁPIDAS -->
        <v-col cols="12" lg="6">
          <v-card variant="elevated" class="mb-4">
            <v-card-title class="bg-green-darken-1 text-green-darken-3">
              <v-icon left color="green-darken-3">mdi-sword-cross</v-icon>
              Ações Rápidas
            </v-card-title>
            <v-card-text class="pa-4">
              
              <!-- AVENTURAS -->
              <v-card variant="outlined" color="red-darken-1" class="mb-3">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="red-darken-2" class="mr-2">mdi-map</v-icon>
                    <div>
                      <div class="text-h6 text-red-darken-3">Aventuras</div>
                      <div class="text-caption">Encontre oponentes pelo mundo</div>
                    </div>
                  </div>
                  <v-btn 
                    color="red-darken-2" 
                    block 
                    @click="findRandomBattle"
                    :disabled="!playerCharacter || hasActiveTasks"
                    variant="elevated"
                  >
                    <v-icon left>mdi-sail-boat</v-icon>
                    Procurar Aventura
                  </v-btn>
                  <div v-if="hasActiveTasks" class="text-caption text-center mt-1 text-warning">
                    Complete suas tarefas ativas primeiro
                  </div>
                </v-card-text>
              </v-card>

              <v-card variant="outlined" color="grey-darken-1" class="mb-3">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="grey-darken-2" class="mr-2">mdi-sword-cross</v-icon>
                    <div>
                      <div class="text-h6 text-grey-darken-3">Liberação de ilhas</div>
                      <div class="text-caption">Libere a ilha que está da tirania</div>
                    </div>
                  </div>
                  <v-btn 
                    color="grey-darken-2" 
                    block 
                    @click="$router.push('/territory-liberation')"
                    :disabled="!playerCharacter || (hasActiveTasks && taskType != 'island_liberation')"
                    variant="elevated"
                  >
                    <v-icon left>mdi-fencing</v-icon>
                    Liberar ilha!
                  </v-btn>
                  <div v-if="hasActiveTasks && taskType != 'island_liberation'" class="text-caption text-center mt-1 text-warning">
                    Complete suas tarefas ativas primeiro
                  </div>
                </v-card-text>
              </v-card>

              <v-card variant="outlined" color="cyan-darken-1" class="mb-3">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="cyan-darken-2" class="mr-2">mdi-compass</v-icon>
                    <div>
                      <div class="text-h6 text-cyan-darken-3">Navegação</div>
                      <div class="text-caption">Explore novos mares e ilhas</div>
                    </div>
                  </div>
                  <v-btn 
                    color="cyan-darken-2" 
                    block 
                    :disabled="!playerCharacter || (hasActiveTasks && taskType != 'navigation')"
                    @click="$router.push('/navigation')"
                    variant="elevated"
                  >
                    <v-icon left>mdi-ship-wheel</v-icon>
                    Sistema de Navegação
                  </v-btn>
                  <div v-if="hasActiveTasks && taskType != 'navigation'" class="text-caption text-center mt-1 text-warning">
                    Complete suas tarefas ativas primeiro
                  </div>
                </v-card-text>
              </v-card>
              
              <!-- EXPLORAÇÃO DE ILHAS -->
              <v-card variant="outlined" color="blue-darken-1" class="mb-3">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="blue-darken-2" class="mr-2">mdi-island</v-icon>
                    <div>
                      <div class="text-h6 text-blue-darken-3">Exploração</div>
                      <div class="text-caption">Ajude civis e ganhe recompensas</div>
                    </div>
                  </div>
                  <v-btn 
                    color="blue-darken-2" 
                    block 
                    :disabled="!playerCharacter || (hasActiveTasks && taskType != 'exploration')"
                    @click="$router.push('/islands')"
                    variant="elevated"
                  >
                    <v-icon left>mdi-compass</v-icon>
                    Explorar Ilhas
                  </v-btn>
                  <div v-if="hasActiveTasks && taskType != 'exploration'" class="text-caption text-center mt-1 text-warning">
                    Complete suas tarefas ativas primeiro
                  </div>
                </v-card-text>
              </v-card>
              
              <!-- TRIPULAÇÃO -->
              <v-card variant="outlined" color="green-darken-1" class="mb-3">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="green-darken-2" class="mr-2">mdi-account-group</v-icon>
                    <div>
                      <div class="text-h6 text-green-darken-3">Tripulação</div>
                      <div class="text-caption">Gerencie seus companheiros</div>
                    </div>
                  </div>
                  <v-btn 
                    color="green-darken-2" 
                    block
                    :disabled="!playerCharacter"
                    @click="$router.push('/crew')"
                    variant="elevated"
                  >
                    <v-icon left>mdi-account-multiple</v-icon>
                    Gerenciar Crew
                  </v-btn>
                </v-card-text>
              </v-card>

              <!-- TREINO -->
              <v-card variant="outlined" color="brown-darken-1" class="mb-3">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="brown-darken-2" class="mr-2">mdi-dumbbell</v-icon>
                    <div>
                      <div class="text-h6 text-brown-darken-3">Treinamento</div>
                      <div class="text-caption">Treine com seus companheiros</div>
                    </div>
                  </div>
                  <v-btn 
                    color="brown-darken-2" 
                    block
                    :disabled="!playerCharacter || (hasActiveTasks && taskType != 'training')"
                    @click="$router.push('/training')"
                    variant="elevated"
                  >
                    <v-icon left>mdi-handshake</v-icon>
                    Realizar Treino
                  </v-btn>
                  <div v-if="hasActiveTasks && taskType != 'training'" class="text-caption text-center mt-1 text-warning">
                    Complete suas tarefas ativas primeiro
                  </div>
                </v-card-text>
              </v-card>
              
              <!-- STATUS RÁPIDO -->
              <v-card variant="outlined" color="purple-darken-1" v-if="playerCharacter">
                <v-card-text class="pa-3">
                  <div class="text-h6 text-purple-darken-3 mb-2">Status Rápido</div>
                  <div class="d-flex justify-space-between">
                    <v-chip color="blue-darken-2" size="small" variant="elevated">
                      <strong>Level {{ playerCharacter.level }}</strong>
                    </v-chip>
                    <CharacterBountyDisplay 
                      :character="playerCharacter" 
                      size="small" 
                      variant="elevated" 
                    />
                    <v-chip color="deep-purple-darken-2" size="small" variant="elevated">
                      <strong>{{ calculatePower(playerCharacter) }} Power</strong>
                    </v-chip>
                    <v-chip color="accent-darken-2" size="small" variant="elevated">
                      <strong>{{ playerStyleCombat?.name || 'N/A' }}</strong>
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
              
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- SEÇÃO DE DEBUG -->
      <v-row>
        <v-col cols="12">
          <v-card variant="elevated" color="orange-lighten-5">
            <v-card-title class="text-orange-darken-3">
              <v-icon left color="orange-darken-3">mdi-bug</v-icon>
              🔧 Informações de Debug
            </v-card-title>
            <v-card-text class="pa-4">
              
              <!-- DEBUG BÁSICO -->
              <v-row class="mb-4">
                <v-col cols="12" md="4">
                  <v-card variant="outlined">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" :color="gameStore.isInitialized ? 'success' : 'error'">
                        {{ gameStore.isInitialized ? 'mdi-check-circle' : 'mdi-close-circle' }}
                      </v-icon>
                      <div class="text-h6 mt-1">{{ gameStore.isInitialized ? 'Sim' : 'Não' }}</div>
                      <div class="text-caption">Game Initialized</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="outlined">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" :color="characterStore.isLoading ? 'warning' : 'success'">
                        {{ characterStore.isLoading ? 'mdi-loading mdi-spin' : 'mdi-check-circle' }}
                      </v-icon>
                      <div class="text-h6 mt-1">{{ characterStore.isLoading ? 'Carregando' : 'Pronto' }}</div>
                      <div class="text-caption">Character Status</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="outlined">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" :color="hasActiveTasks ? 'warning' : 'success'">
                        {{ hasActiveTasks ? 'mdi-clipboard-list' : 'mdi-check-circle' }}
                      </v-icon>
                      <div class="text-h6 mt-1">{{ activeTasksCount }}</div>
                      <div class="text-caption">Tarefas Ativas</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- INFORMAÇÕES DETALHADAS DO PERSONAGEM -->
              <v-expansion-panels v-if="playerCharacter" class="mb-4">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon left>mdi-account-details</v-icon>
                    Dados Completos do Personagem
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <pre class="debug-json">{{ JSON.stringify(playerCharacter, null, 2) }}</pre>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon left>mdi-calculator</v-icon>
                    Cálculos de Poder
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div class="debug-calculations">
                      <div><strong>Poder Base:</strong> {{ calculateBasePower(playerCharacter) }}</div>
                      <div><strong>Multiplicador Level:</strong> {{ getLevelMultiplier(playerCharacter.level) }}x</div>
                      <div><strong>Bonus Haki:</strong> {{ calculateHakiBonus(playerCharacter) }}</div>
                      <div><strong>Poder Total:</strong> {{ calculatePower(playerCharacter) }}</div>
                      <div class="mt-2">
                        <strong>Fórmula:</strong> (Attack + Defense + Speed + ArmHaki + ObsHaki + KingHaki) × Level × 1.5 + HakiBonus
                      </div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
              
              <!-- AÇÕES DE DEBUG -->
              <div class="debug-actions">
                <v-btn 
                  @click="forceReload" 
                  color="primary" 
                  class="mr-2 mb-2"
                  variant="elevated"
                >
                  <v-icon left>mdi-refresh</v-icon>
                  Recarregar Personagem
                </v-btn>
                
                <v-btn 
                  @click="checkActiveTasks" 
                  color="info" 
                  class="mr-2 mb-2"
                  variant="elevated"
                >
                  <v-icon left>mdi-clipboard-check</v-icon>
                  Verificar Tarefas
                </v-btn>
                
                <v-btn 
                  @click="clearCache" 
                  color="warning" 
                  class="mr-2 mb-2"
                  variant="elevated"
                >
                  <v-icon left>mdi-delete</v-icon>
                  Limpar Cache
                </v-btn>
                
                <v-btn 
                  @click="exportData" 
                  color="success" 
                  class="mb-2"
                  variant="elevated"
                >
                  <v-icon left>mdi-download</v-icon>
                  Exportar Dados
                </v-btn>
              </div>
              
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
    </div>

    <!-- ✅ MODAIS DO CONTROLE DO MUNDO -->
    
    <!-- MODAL DE RESET -->
    <v-dialog v-model="showResetDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon left color="white">mdi-alert</v-icon>
          Confirmar Novo Mundo
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="text-center">
            <v-icon size="80" color="error" class="mb-4">mdi-earth-off</v-icon>
            <div class="text-h5 mb-4">Tem certeza absoluta?</div>
            <div class="text-body-1 mb-4">
              Esta ação irá <strong>apagar completamente</strong> o mundo atual:
            </div>
            
            <v-alert type="error" variant="tonal" class="mb-4">
              <v-list>
                <v-list-item>🗑️ Todos os dados do mundo atual</v-list-item>
                <v-list-item>👤 Seu personagem atual</v-list-item>
                <v-list-item>🏴‍☠️ Todas as tripulações e ilhas</v-list-item>
                <v-list-item>⚔️ Histórico de batalhas</v-list-item>
              </v-list>
            </v-alert>
            
            <v-alert type="warning" variant="tonal">
              <strong>Esta ação NÃO pode ser desfeita!</strong>
            </v-alert>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-btn
            color="grey"
            variant="outlined"
            @click="showResetDialog = false"
          >
            Cancelar
          </v-btn>
          
          <v-spacer></v-spacer>
          
          <v-btn
            color="error"
            variant="elevated"
            :loading="isResetting"
            @click="executeReset"
          >
            <v-icon left>mdi-delete-forever</v-icon>
            Sim, Criar Novo Mundo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- MODAL DE RESULTADO -->
    <v-dialog v-model="showResultDialog" max-width="700" persistent>
      <v-card>
        <v-card-title :class="lastResult?.success ? 'bg-success' : 'bg-error'" class="text-white">
          <v-icon left color="white">
            {{ lastResult?.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
          </v-icon>
          {{ lastResult?.success ? 'Sucesso!' : 'Erro!' }}
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="text-h6 mb-4">{{ lastResult?.message }}</div>
          
          <div v-if="lastResult?.steps && lastResult.steps.length > 0" class="mb-4">
            <div class="text-subtitle-1 mb-2">Passos executados:</div>
            <v-list>
              <v-list-item v-for="step in lastResult.steps" :key="step">
                <v-list-item-title>{{ step }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
          
          <div v-if="lastResult?.errors && lastResult.errors.length > 0" class="mb-4">
            <div class="text-subtitle-1 mb-2 text-error">Erros encontrados:</div>
            <v-list>
              <v-list-item v-for="error in lastResult.errors" :key="error">
                <v-list-item-title class="text-error">{{ error }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            @click="closeResultDialog"
          >
            Entendi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useCharacterStore } from '@/stores/characterStore'
import { IslandExplorationSystem } from '@/utils/islandExplorationSystem'
import { GameLogic } from '@/utils/gameLogic'
import { useRouter } from 'vue-router'
import type { Character, DevilFruit, StyleCombat } from '@/utils/database'
// ✅ IMPORTS PARA CONTROLE DO MUNDO
import { WorldResetSystem, type WorldResetResult } from '@/utils/worldResetSystem'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'

const router = useRouter()

const gameStore = useGameStore()
const characterStore = useCharacterStore()

// 🌍 ESTADOS DO CONTROLE DO MUNDO
const worldPanelOpen = ref(null)
const isResetting = ref(false)
const showResetDialog = ref(false)
const showResultDialog = ref(false)
const lastResult = ref<WorldResetResult | null>(null)

const worldStatus = ref({
  hasGameState: false,
  needsCharacterCreation: false,
  isWorldGenerated: false,
  canStartGame: false
})

// 📊 LOADING STATES
const gameInitialized = ref(false)
const characterLoaded = ref(false)
const hasActiveTasks = ref(false)
const taskType = ref('')
const devilFruitLoaded = ref(false)
const styleCombatLoaded = ref(false)
const activeTasksCount = ref(0)

// 📊 COMPUTED
const playerCharacter = computed(() => characterStore.playerCharacter)

const playerDevilFruit = ref<DevilFruit | null>(null)
const playerStyleCombat = ref<StyleCombat | null>(null)

const allDataLoaded = computed(() => {
  return gameInitialized.value && characterLoaded.value && devilFruitLoaded.value && styleCombatLoaded.value
})

const experiencePercentage = computed(() => {
  if (!playerCharacter.value) return 0
  const expForNext = GameLogic.nextLevelUp(playerCharacter.value)
  return (playerCharacter.value.experience / expForNext) * 100
})

const expForNextLevel = computed(() => {
  if (!playerCharacter.value) return 0
  return GameLogic.nextLevelUp(playerCharacter.value)
})

// 🌍 MÉTODOS DO CONTROLE DO MUNDO
const loadWorldStatus = async () => {
  try {
    worldStatus.value = await WorldResetSystem.getGameStatus()
    console.log('🌍 Status do mundo carregado:', worldStatus.value)
  } catch (error) {
    console.error('❌ Erro ao carregar status do mundo:', error)
  }
}

const executeReset = async () => {
  try {
    isResetting.value = true
    showResetDialog.value = false
    
    console.log('🌍 Executando reset do mundo...')
    const result = await WorldResetSystem.resetWorld()
    
    lastResult.value = result
    showResultDialog.value = true
    
    // Recarregar status
    await loadWorldStatus()
    
  } catch (error) {
    console.error('❌ Erro no reset:', error)
    lastResult.value = {
      success: false,
      message: `Erro inesperado: ${error}`,
      steps: [],
      errors: [`${error}`]
    }
    showResultDialog.value = true
  } finally {
    isResetting.value = false
  }
}

const goToCharacterCreation = () => {
  router.push('/character-creation')
}

const closeResultDialog = () => {
  showResultDialog.value = false
  
  // Se reset foi bem-sucedido, redirecionar para criação de personagem
  if (lastResult.value?.success) {
    setTimeout(() => {
      goToCharacterCreation()
    }, 500)
  }
  
  lastResult.value = null
}

// 🎮 METHODS
const calculatePower = (character: Character): number => {
  return GameLogic.calculatePower(character)
}

const calculateBasePower = (character: Character): number => {
  return character.stats.attack + character.stats.defense + character.stats.speed + 
         character.stats.armHaki + character.stats.obsHaki + character.stats.kingHaki
}

const getLevelMultiplier = (level: number): number => {
  return level * 1.5
}

const calculateHakiBonus = (character: Character): number => {
  return (character.stats.armHaki + character.stats.obsHaki + character.stats.kingHaki) * 2
}

const checkActiveTasks = async () => {
  if (!playerCharacter.value) return
  
  try {
    const tasks = await IslandExplorationSystem.getActiveTasks(playerCharacter.value.id!)
    hasActiveTasks.value = tasks.length > 0
    activeTasksCount.value = tasks.length
    taskType.value = tasks.length > 0 ? tasks[0].type : ''
    console.log('✅ Tarefas ativas verificadas:', tasks.length)
  } catch (error) {
    console.error('❌ Erro ao verificar tarefas:', error)
  }
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

// 🎨 HELPER FUNCTIONS
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

const getKindnessCardColor = (kindness: number): string => {
  if (kindness >= 50) return 'green-darken-1'
  if (kindness >= 0) return 'blue-darken-1'
  if (kindness >= -50) return 'orange-darken-1'
  return 'red-darken-1'
}

const getKindnessIconColor = (kindness: number): string => {
  if (kindness >= 50) return 'green-darken-2'
  if (kindness >= 0) return 'blue-darken-2'
  if (kindness >= -50) return 'orange-darken-2'
  return 'red-darken-2'
}

const getKindnessTextColor = (kindness: number): string => {
  if (kindness >= 50) return 'text-green-darken-3'
  if (kindness >= 0) return 'text-blue-darken-3'
  if (kindness >= -50) return 'text-orange-darken-3'
  return 'text-red-darken-3'
}

const getKindnessIcon = (kindness: number): string => {
  if (kindness >= 50) return 'mdi-heart'
  if (kindness >= 0) return 'mdi-handshake'
  if (kindness >= -50) return 'mdi-sword'
  return 'mdi-skull'
}

// 🔧 DEBUG ACTIONS
const createCharacter = async () => {
  try {
    //await characterStore.createPlayerCharacter('Monkey D. Luffy')
    characterLoaded.value = true
  } catch (error) {
    console.error('❌ Erro ao criar personagem:', error)
  }
}

const findRandomBattle = () => {
  console.log('🗺️ Redirecionando para aventuras...')
  router.push('/adventure')
}

const redirect = () => {
  if(taskType.value == 'exploration') router.push('/island')
  else if(taskType.value == 'training') router.push('/training')
}

const forceReload = async () => {
  console.log('🔄 Forçando reload do personagem...')
  characterLoaded.value = false
  await characterStore.loadPlayerCharacter()
  characterLoaded.value = true
  await checkActiveTasks()
}

const clearCache = () => {
  console.log('🗑️ Limpando cache...')
  localStorage.clear()
  sessionStorage.clear()
  location.reload()
}

const exportData = () => {
  const data = {
    playerCharacter: playerCharacter.value,
    gameInitialized: gameStore.isInitialized,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pirate-game-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 🔄 LIFECYCLE
onMounted(async () => {
  console.log('🎮 Dashboard montado - iniciando carregamento...')
  
  // ✅ CARREGAR STATUS DO MUNDO
  await loadWorldStatus()
  
  // Verificar se o jogo está inicializado
  gameInitialized.value = gameStore.isInitialized
  
  // Carregar personagem
  await characterStore.loadPlayerCharacter()
  characterLoaded.value = true
  
  // Verificar tarefas ativas
  await checkActiveTasks()

  if (playerCharacter.value) {
    const devilFruit = await characterStore.loadDevilFruit(playerCharacter.value.devilFruitId)
    playerDevilFruit.value = devilFruit
    devilFruitLoaded.value = true

    const styleCombat = await characterStore.loadStyleCombat(playerCharacter.value.styleCombatId)
    playerStyleCombat.value = styleCombat
    styleCombatLoaded.value = true
  } else {
    devilFruitLoaded.value = true
    styleCombatLoaded.value = true
  }
})
</script>

<style scoped>
.dashboard-container {
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

/* ✅ ESTILOS PARA CONTROLE DO MUNDO */
.world-control-panel {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(25, 118, 210, 0.2);
}

.status-compact {
  display: flex;
  align-items: center;
}

.world-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .d-flex.align-center.justify-space-between {
    flex-direction: column;
    gap: 16px;
  }
  
  .world-actions {
    width: 100%;
    justify-content: center;
  }
  
  .world-actions .v-btn {
    flex: 1;
  }
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

.character-header {
  border-bottom: 2px solid rgba(0,0,0,0.1);
  padding-bottom: 16px;
}

.experience-section {
  background: rgba(25, 118, 210, 0.05);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.debug-json {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
}

.debug-calculations {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.debug-calculations div {
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
}

.debug-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.v-chip {
  font-weight: 700 !important;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 8px;
  }
  
  .character-header .d-flex {
    flex-direction: column;
    text-align: center;
  }
  
  .debug-actions {
    justify-content: center;
  }
}

/* CORES CUSTOMIZADAS */
.text-red-darken-3 { color: #c62828 !important; }
.text-blue-darken-3 { color: #1565c0 !important; }
.text-green-darken-3 { color: #2e7d32 !important; }
.text-orange-darken-3 { color: #ef6c00 !important; }
.text-purple-darken-3 { color: #6a1b9a !important; }
.text-deep-purple-darken-3 { color: #4527a0 !important; }
.text-yellow-darken-4 { color: #f57f17 !important; }
</style>