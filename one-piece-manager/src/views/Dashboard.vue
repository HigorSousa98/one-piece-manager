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
                
                <div class="step-item" :class="{ 'completed': avatarLoaded }">
                  <v-icon :color="avatarLoaded ? 'success' : 'grey'">
                    {{ avatarLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Gerando Avatar</span>
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
          <v-card class="mb-4 dashboard-header">
            <v-card-title class="text-center">
              <v-icon left size="large">mdi-view-dashboard</v-icon>
              DASHBOARD
            </v-card-title>
            <v-card-subtitle class="text-center">
              Central de comando do seu pirata
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>

      <!-- ✅ ANÚNCIO BANNER HORIZONTAL NO TOPO -->
      <v-row>
        <v-col cols="12">
          <AdBanner v-if="showAd"
            ad-slot="1234567890"
            ad-format="horizontal"
            :height="90"
            class="mb-4"
          />
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
        <!-- ✅ INFORMAÇÕES DO JOGADOR COM WANTED POSTER -->
        <v-col cols="12" lg="8">
          <v-card variant="elevated" class="mb-4 player-card">
            <v-card-title class="bg-blue-lighten-5 text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-account-circle</v-icon>
              Seu Personagem
            </v-card-title>
            
            <!-- Personagem existe -->
            <v-card-text v-if="playerCharacter" class="pa-4">
              
              <!-- ✅ WANTED POSTER HERO SECTION -->
              <div class="poster-hero-section mb-6">
                <v-row align="center">
                  
                  <!-- WANTED POSTER -->
                  <v-col cols="12" md="5" class="text-center">
                    <div class="poster-container">
                      <WantedPoster
                        :character="playerCharacter"
                        size="small"
                        :show-actions="false"
                        :show-size-controls="false"
                        class="dashboard-poster"
                        @download-complete="onPosterDownload"
                        @share-complete="onPosterShare"
                      />
                      
                      <!-- PLAYER BADGE -->
                      <div class="player-badge-overlay">
                        <v-chip
                          color="success"
                          variant="elevated"
                          size="large"
                          prepend-icon="mdi-account-star"
                          class="player-chip"
                        >
                          VOCÊ
                        </v-chip>
                      </div>
                    </div>
                  </v-col>
                  
                  <!-- CHARACTER INFO -->
                  <v-col cols="12" md="7">
                    <div class="character-dashboard-info">
                      <div class="character-title mb-3">
                        <h2 class="text-h4 font-weight-bold character-name mb-2">
                          {{ playerCharacter.name }}
                        </h2>
                        <div class="character-subtitle">
                          <span class="text-h6 text-medium-emphasis">
                            {{ playerCharacter.position || 'Capitão Pirata' }}
                          </span>
                        </div>
                      </div>
                      
                      <!-- BASIC INFO CHIPS -->
                      <div class="character-chips mb-4">
                        <v-chip :color="getTypeColor(playerCharacter.type)" variant="elevated" size="large" class="info-chip">
                          <v-icon left>{{ getTypeIconMdi(playerCharacter.type) }}</v-icon>
                          {{ playerCharacter.type }}
                        </v-chip>
                        <v-chip color="orange-darken-2" variant="elevated" size="large" class="info-chip">
                          <v-icon left>mdi-star</v-icon>
                          Level {{ playerCharacter.level }}
                        </v-chip>
                        <v-chip v-if="playerStyleCombat" color="purple-darken-2" variant="elevated" size="large" class="info-chip">
                          <v-icon left>mdi-sword</v-icon>
                          {{ playerStyleCombat.name }}
                        </v-chip>
                      </div>
                      
                      <!-- POWER & BOUNTY DISPLAY -->
                      <div class="character-stats-quick">
                        <v-card variant="outlined" color="purple-darken-1" class="power-display-card mb-3">
                          <v-card-text class="text-center pa-3">
                            <v-icon size="30" color="purple-darken-2">mdi-flash</v-icon>
                            <div class="text-h5 mt-1 text-purple-darken-3 font-weight-bold">
                              {{ calculatePower(playerCharacter) }}
                            </div>
                            <div class="text-subtitle-2 text-purple-darken-2">Poder Total</div>
                          </v-card-text>
                        </v-card>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
              
              <!-- STATS PRINCIPAIS -->
              <div class="stats-section mb-4">
                <h3 class="text-h6 mb-3 stats-title">
                  <v-icon left color="primary">mdi-chart-line</v-icon>
                  Estatísticas de Combate
                </h3>
                
                <v-row class="mb-4">
                  <v-col cols="12" md="3">
                    <v-card variant="outlined" color="red-darken-1" class="stat-card">
                      <v-card-text class="text-center pa-3">
                        <v-icon size="35" color="red-darken-2">mdi-sword</v-icon>
                        <div class="text-h5 mt-2 text-red-darken-3 font-weight-bold">{{ playerCharacter.stats.attack }}</div>
                        <div class="text-subtitle-2 text-red-darken-2">Ataque</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-card variant="outlined" color="blue-darken-1" class="stat-card">
                      <v-card-text class="text-center pa-3">
                        <v-icon size="35" color="blue-darken-2">mdi-shield</v-icon>
                        <div class="text-h5 mt-2 text-blue-darken-3 font-weight-bold">{{ playerCharacter.stats.defense }}</div>
                        <div class="text-subtitle-2 text-blue-darken-2">Defesa</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="2">
                    <v-card variant="outlined" color="green-darken-1" class="stat-card">
                      <v-card-text class="text-center pa-3">
                        <v-icon size="35" color="green-darken-2">mdi-run-fast</v-icon>
                        <div class="text-h5 mt-2 text-green-darken-3 font-weight-bold">{{ playerCharacter.stats.speed }}</div>
                        <div class="text-subtitle-2 text-green-darken-2">Velocidade</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="2">
                    <v-card variant="outlined" color="blue-grey-darken-1" class="stat-card">
                      <v-card-text class="text-center pa-3">
                        <v-icon size="35" color="blue-grey-darken-2">mdi-brain</v-icon>
                        <div class="text-h5 mt-2 text-blue-grey-darken-3 font-weight-bold">{{ playerCharacter.stats.intelligence }}</div>
                        <div class="text-subtitle-2 text-blue-grey-darken-2">Inteligência</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="2">
                    <v-card variant="outlined" color="purple-darken-1" class="stat-card">
                      <v-card-text class="text-center pa-3">
                        <v-icon size="35" color="purple-darken-2">mdi-feather</v-icon>
                        <div class="text-h5 mt-2 text-purple-darken-3 font-weight-bold">{{ playerCharacter.stats.skill }}</div>
                        <div class="text-subtitle-2 text-purple-darken-2">Habilidade</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
              
              <!-- HAKI STATS -->
              <div class="haki-section mb-4" v-if="hasHakiStats">
                <h3 class="text-h6 mb-3 stats-title">
                  <v-icon left color="orange-darken-2">mdi-meditation</v-icon>
                  Habilidades Haki
                </h3>
                
                <v-row>
                  <v-col cols="4" v-if="playerCharacter.stats.armHaki > 0">
                    <v-card variant="outlined" color="orange-darken-1" class="haki-card">
                      <v-card-text class="text-center pa-2">
                        <v-icon size="25" color="orange-darken-2">mdi-arm-flex</v-icon>
                        <div class="text-h6 mt-1 text-orange-darken-3 font-weight-bold">{{ playerCharacter.stats.armHaki }}</div>
                        <div class="text-caption text-orange-darken-2">Busoshoku</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="4" v-if="playerCharacter.stats.obsHaki > 0">
                    <v-card variant="outlined" color="purple-darken-1" class="haki-card">
                      <v-card-text class="text-center pa-2">
                        <v-icon size="25" color="purple-darken-2">mdi-eye</v-icon>
                        <div class="text-h6 mt-1 text-purple-darken-3 font-weight-bold">{{ playerCharacter.stats.obsHaki }}</div>
                        <div class="text-caption text-purple-darken-2">Kenbunshoku</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="4" v-if="playerCharacter.stats.kingHaki > 0">
                    <v-card variant="outlined" color="amber-darken-1" class="haki-card">
                      <v-card-text class="text-center pa-2">
                        <v-icon size="25" color="amber-darken-3">mdi-crown</v-icon>
                        <div class="text-h6 mt-1 text-amber-darken-4 font-weight-bold">{{ playerCharacter.stats.kingHaki }}</div>
                        <div class="text-caption text-amber-darken-3">Haoshoku</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <!-- KINDNESS -->
              <div class="kindness-section mb-4">
                <h3 class="text-h6 mb-3 stats-title">
                  <v-icon left color="pink-darken-2">mdi-heart</v-icon>
                  Personalidade
                </h3>
                
                <v-card variant="outlined" :color="getKindnessCardColor(playerCharacter.kindness)" class="kindness-card">
                  <v-card-text class="pa-3">
                    <div class="d-flex align-center">
                      <v-icon size="30" :color="getKindnessIconColor(playerCharacter.kindness)" class="mr-3">
                        {{ getKindnessIcon(playerCharacter.kindness) }}
                      </v-icon>
                      <div class="flex-grow-1">
                        <div class="text-h6 font-weight-bold" :class="getKindnessTextColor(playerCharacter.kindness)">
                          {{ playerCharacter.kindness }}
                        </div>
                        <div class="text-subtitle-2">Nível de Bondade</div>
                      </div>
                      <div class="kindness-status">
                        <v-chip :color="getKindnessIconColor(playerCharacter.kindness)" variant="elevated" size="small">
                          {{ getKindnessStatus(playerCharacter.kindness) }}
                        </v-chip>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <!-- Akuma no Mi -->
              <div v-if="playerCharacter.devilFruitId != 0" class="devil-fruit-section mb-4">
                <h3 class="text-h6 mb-3 stats-title">
                  <v-icon left color="teal-darken-2">mdi-fruit-pineapple</v-icon>
                  Akuma no Mi
                </h3>
                
                <v-card variant="outlined" color="teal-lighten-5" class="devil-fruit-card">
                  <v-card-text class="pa-3">
                    <div class="d-flex align-center">
                      <div class="devil-fruit-icon">
                        <v-icon size="40" color="teal-darken-2">mdi-fruit-pineapple</v-icon>
                      </div>
                      <div class="flex-grow-1 ml-3">
                        <div class="text-h6 font-weight-bold text-teal-darken-3">
                          {{ playerDevilFruit?.name || 'Carregando...' }}
                        </div>
                        <div class="text-subtitle-2 text-teal-darken-2 mb-1">
                          {{ playerDevilFruit?.type || '' }} • Poder: {{ playerCharacter.stats.devilFruit }}
                        </div>
                        <div class="d-flex align-center gap-2">
                          <v-chip 
                            v-if="playerCharacter.level >= (playerDevilFruit?.awakeningOn || 999)"
                            size="small"
                            color="teal-darken-2"
                            variant="elevated"
                          >
                            <v-icon size="small" class="mr-1">mdi-star</v-icon>
                            Despertada
                          </v-chip>
                          <v-chip 
                            size="small"
                            color="teal"
                            variant="tonal"
                          >
                            Nível {{ playerCharacter.stats.devilFruit }}
                          </v-chip>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
              
              <!-- EXPERIÊNCIA -->
              <div class="experience-section">
                <h3 class="text-h6 mb-3 stats-title">
                  <v-icon left color="blue-darken-2">mdi-trending-up</v-icon>
                  Progressão de Experiência
                </h3>
                
                <v-card variant="outlined" color="blue-lighten-5" class="experience-card">
                  <v-card-text class="pa-3">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div class="text-subtitle-1 text-blue-darken-3">
                        <strong>{{ playerCharacter.experience.toLocaleString() }} XP</strong>
                      </div>
                      <div class="text-subtitle-1 text-blue-darken-3">
                        <strong>{{ expForNextLevel.toLocaleString() }} XP</strong>
                      </div>
                    </div>
                    
                    <v-progress-linear
                      :model-value="experiencePercentage"
                      color="blue-darken-2"
                      height="16"
                      rounded
                      class="mb-2"
                    >
                      <template v-slot:default>
                        <strong class="text-white text-caption">{{ Math.round(experiencePercentage) }}%</strong>
                      </template>
                    </v-progress-linear>
                    
                    <div class="text-center">
                      <v-chip color="blue-darken-2" variant="elevated" size="small">
                        <v-icon left size="small">mdi-target</v-icon>
                        {{ (expForNextLevel - playerCharacter.experience).toLocaleString() }} XP restantes
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- ✅ SIDEBAR COM AÇÕES RÁPIDAS E ANÚNCIOS -->
        <v-col cols="12" lg="4">
          
          <!-- ✅ ANÚNCIO VERTICAL STICKY NO TOPO DA SIDEBAR -->
          <div class="sidebar-ad-container mb-4">
            <AdBanner v-if="showAd"
              ad-slot="2345678901"
              ad-format="vertical"
              :width="300"
              :height="250"
              class="sticky-ad"
            />
          </div>

          <!-- AÇÕES RÁPIDAS -->
          <v-card variant="elevated" class="mb-4">
            <v-card-title class="bg-green-darken-1 text-white">
              <v-icon left color="white">mdi-sword-cross</v-icon>
              Ações Rápidas
            </v-card-title>
            <v-card-text class="pa-4">
              
              <!-- AVENTURAS -->
              <v-card variant="outlined" color="red-darken-1" class="mb-3 action-card">
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

              <v-card variant="outlined" color="grey-darken-1" class="mb-3 action-card">
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

              <v-card variant="outlined" color="cyan-darken-1" class="mb-3 action-card">
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
              <v-card variant="outlined" color="blue-darken-1" class="mb-3 action-card">
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
              <v-card variant="outlined" color="green-darken-1" class="mb-3 action-card">
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
              <v-card variant="outlined" color="brown-darken-1" class="mb-3 action-card">
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
              <v-card variant="outlined" color="purple-darken-1" v-if="playerCharacter" class="status-quick-card">
                <v-card-text class="pa-3">
                  <div class="text-h6 text-purple-darken-3 mb-2">Status Rápido</div>
                  <div class="d-flex justify-space-between flex-wrap gap-1">
                    <v-chip color="blue-darken-2" size="x-small" variant="elevated">
                      <strong>Lv.{{ playerCharacter.level }}</strong>
                    </v-chip>
                    <v-chip color="deep-purple-darken-2" size="x-small" variant="elevated">
                      <strong>{{ calculatePower(playerCharacter) }}</strong>
                    </v-chip>
                    <v-chip :color="getPowerRankColor(currentPowerRank)" size="x-small" variant="elevated">
                      <strong>{{ currentPowerRank }}</strong>
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
              
            </v-card-text>
          </v-card>

          <!-- ✅ ANÚNCIO QUADRADO ADICIONAL -->
          <div class="sidebar-ad-container mb-4">
            <AdBanner v-if="showAd"
              ad-slot="3456789012"
              ad-format="rectangle"
              :width="300"
              :height="250"
            />
          </div>

        </v-col>
      </v-row>

      <!-- ✅ ANÚNCIO BANNER HORIZONTAL NO MEIO -->
      <v-row>
        <v-col cols="12">
          <AdBanner v-if="showAd"
            ad-slot="4567890123"
            ad-format="horizontal"
            :height="250"
            class="my-4"
          />
        </v-col>
      </v-row>

      <!-- ✅ NOVA SEÇÃO: ESTATÍSTICAS DE AVATAR -->
      <v-row v-if="showAvatarStats">
        <v-col cols="12">
          <v-card variant="outlined" color="indigo-lighten-5" class="mb-4">
            <v-card-title class="bg-indigo text-white">
              <v-icon left color="white">mdi-account-star</v-icon>
              🎨 Sistema de Avatares
            </v-card-title>
            
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" class="text-center pa-3">
                    <v-icon size="30" color="primary">mdi-cached</v-icon>
                    <div class="text-h6 mt-1">{{ cacheStats.totalEntries }}</div>
                    <div class="text-caption">Avatares em Cache</div>
                  </v-card>
                </v-col>
              </v-row>
              
              <div class="mt-4 d-flex gap-2 flex-wrap">
                <v-btn 
                  @click="updateCacheStats" 
                  color="primary" 
                  size="small"
                  variant="outlined"
                >
                  <v-icon left>mdi-refresh</v-icon>
                  Atualizar Stats
                </v-btn>
                
                <v-btn 
                  @click="clearAvatarCache" 
                  color="warning" 
                  size="small"
                  variant="outlined"
                >
                  <v-icon left>mdi-delete-sweep</v-icon>
                  Limpar Cache
                </v-btn>

              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- SEÇÃO DE DEBUG -->
      <v-row v-if="isDev">
        <v-col cols="12">
          <v-card variant="elevated" color="orange-lighten-5">
            <v-card-title class="text-orange-darken-3">
              <v-icon left color="orange-darken-3">mdi-bug</v-icon>
              🔧 Informações de Debug
            </v-card-title>
            <v-card-text class="pa-4">
              
              <!-- DEBUG BÁSICO -->
              <v-row class="mb-4">
                <v-col cols="12" md="3">
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
                <v-col cols="12" md="3">
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
                <v-col cols="12" md="3">
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
                <v-col cols="12" md="3">
                  <v-card variant="outlined">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" :color="avatarLoaded ? 'success' : 'warning'">
                        {{ avatarLoaded ? 'mdi-check-circle' : 'mdi-account-convert' }}
                      </v-icon>
                      <div class="text-h6 mt-1">{{ avatarLoaded ? 'Carregado' : 'Gerando' }}</div>
                      <div class="text-caption">Avatar Status</div>
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
                      <div><strong>Power Rank:</strong> {{ currentPowerRank }}</div>
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
                  class="mr-2 mb-2"
                  variant="elevated"
                >
                  <v-icon left>mdi-download</v-icon>
                  Exportar Dados
                </v-btn>
                
                <v-btn 
                  @click="showAvatarStats = !showAvatarStats" 
                  color="indigo" 
                  class="mb-2"
                  variant="elevated"
                >
                  <v-icon left>mdi-account-star</v-icon>
                  {{ showAvatarStats ? 'Ocultar' : 'Mostrar' }} Avatar Stats
                </v-btn>
              </div>
              
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ✅ ANÚNCIO BANNER HORIZONTAL NO FINAL -->
      <v-row>
        <v-col cols="12">
          <AdBanner v-if="showAd"
            ad-slot="5678901234"
            ad-format="horizontal"
            :height="90"
            class="mt-4"
          />
        </v-col>
      </v-row>
      
    </div>

    <!-- MODAIS DO CONTROLE DO MUNDO (mantidos iguais) -->
    
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
import { GenerationConfig } from '@/utils/generationConfig'
// ✅ IMPORTS PARA WANTED POSTER
import WantedPoster from '@/components/WantedPoster.vue'
import { useAvatarManager } from '@/composables/useAvataaarsManager'
import { PowerCalculationSystem } from '@/utils/powerCalculationSystem'

// ✅ IMPORT DO COMPONENTE DE ANÚNCIOS
import AdBanner from '@/components/AdBanner.vue'

const router = useRouter()
const isDev = import.meta.env.DEV


const gameStore = useGameStore()
const characterStore = useCharacterStore()

// ✅ COMPOSABLE DE AVATARES
const {
  cacheStats,
  updateCacheStats,
  clearCache: clearAvatarCache,
} = useAvatarManager()

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

// ✅ ESTADOS DO SISTEMA DE AVATARES
const avatarLoaded = ref(false)
const showAvatarStats = ref(false)
const isRegeneratingAvatar = ref(false)

// 📊 LOADING STATES
const gameInitialized = ref(false)
const characterLoaded = ref(false)
const hasActiveTasks = ref(false)
const taskType = ref('')
const devilFruitLoaded = ref(false)
const styleCombatLoaded = ref(false)
const activeTasksCount = ref(0)

// 📱 COMPUTED
const playerCharacter = computed(() => characterStore.playerCharacter)
const showAd = computed(() => GenerationConfig.createEpic().showAd)

const playerDevilFruit = ref<DevilFruit | null>(null)
const playerStyleCombat = ref<StyleCombat | null>(null)

// ✅ COMPUTED PARA HAKI STATS
const hasHakiStats = computed(() => {
  if (!playerCharacter.value) return false
  return playerCharacter.value.stats.armHaki > 0 || 
         playerCharacter.value.stats.obsHaki > 0 || 
         playerCharacter.value.stats.kingHaki > 0
})

// ✅ COMPUTED PARA POWER RANK
const currentPowerRank = computed(() => {
  if (!playerCharacter.value) return 'N/A'
  const power = calculatePower(playerCharacter.value)
  return PowerCalculationSystem.getPowerRank(power)
})

const allDataLoaded = computed(() => {
  return gameInitialized.value && characterLoaded.value && devilFruitLoaded.value && 
         styleCombatLoaded.value && avatarLoaded.value
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

// ✅ MÉTODOS PARA POSTER
const onPosterDownload = (success: boolean) => {
  if (success) {
    console.log('✅ Poster baixado com sucesso!')
  } else {
    console.log('❌ Erro ao baixar poster')
  }
}

const onPosterShare = (success: boolean) => {
  if (success) {
    console.log('✅ Poster compartilhado com sucesso!')
  } else {
    console.log('❌ Erro ao compartilhar poster')
  }
}

// ✅ MÉTODOS PARA POWER RANK
const getPowerRankColor = (rank: string): string => {
  const colorMap: Record<string, string> = {
    'Yonko': 'deep-purple',
    'Admiral': 'red',
    'Warlord': 'orange',
    'Supernova': 'blue',
    'Veteran': 'green',
    'Experienced': 'teal',
    'Rookie': 'grey',
    'Beginner': 'blue-grey'
  }
  return colorMap[rank] || 'grey'
}

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
  return GameLogic.calculatePower(character, playerDevilFruit.value)
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

// �� HELPER FUNCTIONS
const getTypeColor = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'red-darken-2'
    case 'Marine': return 'blue-darken-2'
    case 'Government': return 'orange-darken-2'
    case 'BountyHunter': return 'green-darken-2'
    default: return 'grey-darken-2'
  }
}

const getTypeIconMdi = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'mdi-pirate'
    case 'Marine': return 'mdi-anchor'
    case 'Government': return 'mdi-bank'
    case 'BountyHunter': return 'mdi-target'
    default: return 'mdi-account'
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

const getKindnessStatus = (kindness: number): string => {
  if (kindness >= 50) return 'BONDOSO'
  if (kindness >= 0) return 'EQUILIBRADO'
  if (kindness >= -50) return 'RIGOROSO'
  return 'CRUEL'
}

// 🔧 DEBUG ACTIONS
const findRandomBattle = () => {
  console.log('🗺️ Redirecionando para aventuras...')
  router.push('/adventure')
}

const forceReload = async () => {
  console.log('🔄 Forçando reload do personagem...')
  characterLoaded.value = false
  avatarLoaded.value = false
  
  await characterStore.loadPlayerCharacter()
  characterLoaded.value = true
  
  // Recarregar avatar
  if (playerCharacter.value) {
    try {
      setTimeout(() => {
        if (!avatarLoaded.value) {
          avatarLoaded.value = true
        }
      }, 2000)
    } catch (error) {
      console.error('❌ Erro ao recarregar avatar:', error)
      avatarLoaded.value = true
    }
  }
  
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
    cacheStats: cacheStats.value,
    powerRank: currentPowerRank.value,
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
    // Carregar Devil Fruit
    const devilFruit = await characterStore.loadDevilFruit(playerCharacter.value.devilFruitId)
    playerDevilFruit.value = devilFruit
    devilFruitLoaded.value = true

    // Carregar Style Combat
    const styleCombat = await characterStore.loadStyleCombat(playerCharacter.value.styleCombatId)
    playerStyleCombat.value = styleCombat
    styleCombatLoaded.value = true
    
    // ✅ INICIALIZAR SISTEMA DE AVATARES
    try {
      console.log('🎨 Inicializando sistema de avatares...')
      await updateCacheStats()
      
      // Avatar será carregado pelo componente WantedPoster
      setTimeout(() => {
        if (!avatarLoaded.value) {
          avatarLoaded.value = true
        }
      }, 2000)
      
    } catch (error) {
      console.error('❌ Erro ao inicializar avatares:', error)
      avatarLoaded.value = true
    }
  } else {
    devilFruitLoaded.value = true
    styleCombatLoaded.value = true
    avatarLoaded.value = true
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

/* ✅ HEADER DO DASHBOARD */
.dashboard-header {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.3);
}

/* ✅ ESTILOS PARA CONTROLE DO MUNDO */
.world-control-panel {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(25, 118, 210, 0.2);
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%);
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

/* ✅ PLAYER CARD */
.player-card {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%);
  border: 2px solid rgba(25, 118, 210, 0.2);
  box-shadow: 0 8px 32px rgba(25, 118, 210, 0.1);
}

/* ✅ POSTER HERO SECTION */
.poster-hero-section {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.poster-container {
  position: relative;
  display: inline-block;
}

.dashboard-poster {
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.dashboard-poster:hover {
  transform: scale(1.02) rotate(1deg);
  filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.4));
}

.player-badge-overlay {
  position: absolute;
  top: -10px;
  left: -10px;
  z-index: 10;
}

.power-rank-overlay {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 10;
}

.player-chip {
  background: linear-gradient(45deg, #4CAF50, #388E3C) !important;
  color: white !important;
  font-weight: bold !important;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4) !important;
}

.power-rank-chip {
  font-weight: bold !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

/* ✅ CHARACTER INFO */
.character-dashboard-info {
  padding: 16px;
}

.character-name {
  color: #1565C0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  line-height: 1.1;
}

.character-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-chip {
  font-weight: bold !important;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2) !important;
}

.power-display-card {
  border: 2px solid rgba(156, 39, 176, 0.3);
  transition: all 0.3s ease;
}

.power-display-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(156, 39, 176, 0.3);
}

.bounty-display-dashboard {
  display: flex;
  justify-content: center;
}

/* ✅ SECTION TITLES */
.stats-title {
  color: #1565C0;
  border-bottom: 2px solid rgba(25, 118, 210, 0.3);
  padding-bottom: 4px;
  margin-bottom: 16px;
}

/* ✅ STATS CARDS */
.stat-card {
  transition: all 0.3s ease;
  border-width: 2px;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.stat-card:hover::before {
  left: 100%;
}

.attack-card { border-color: #c62828; }
.defense-card { border-color: #1565c0; }
.speed-card { border-color: #2e7d32; }
.intelligence-card { border-color: #7d652e; }
.skill-card { border-color: #542e7d; }

/* ✅ HAKI CARDS */
.haki-card {
  transition: all 0.3s ease;
  border-width: 2px;
}

.haki-card:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

/* ✅ KINDNESS CARD */
.kindness-card {
  border-width: 2px;
  transition: all 0.3s ease;
}

.kindness-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

/* ✅ DEVIL FRUIT SECTION */
.devil-fruit-card {
  border: 2px solid rgba(77, 182, 172, 0.3);
  animation: devilFruitPulse 4s ease-in-out infinite;
}

@keyframes devilFruitPulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(77, 182, 172, 0.2);
  }
  50% { 
    transform: scale(1.005);
    box-shadow: 0 6px 16px rgba(77, 182, 172, 0.3);
  }
}

.devil-fruit-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(77, 182, 172, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ✅ EXPERIENCE CARD */
.experience-card {
  border: 2px solid #1976D2;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

/* ✅ ACTION CARDS */
.action-card {
  transition: all 0.3s ease;
  border-width: 2px;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.status-quick-card {
  border-width: 2px;
}

/* ✅ ESTILOS PARA ANÚNCIOS */
.sidebar-ad-container {
  display: flex;
  justify-content: center;
  width: 100%;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.sidebar-ad-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.sticky-ad {
  position: sticky;
  top: 20px;
  z-index: 1;
}

/* ✅ LOADING STEPS */
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

/* ✅ DEBUG STYLES */
.debug-json {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  font-family: 'Courier New', monospace;
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

/* ✅ RESPONSIVE */
@media (max-width: 1200px) {
  .sticky-ad {
    position: static;
  }
  
  .sidebar-ad-container {
    margin: 16px 0;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 8px;
  }
  
  .poster-hero-section .v-row {
    flex-direction: column;
    text-align: center;
  }
  
  .character-dashboard-info {
    margin-top: 16px;
  }
  
  .player-badge-overlay, .power-rank-overlay {
    position: static;
    margin-top: 8px;
    display: flex;
    justify-content: center;
  }
  
  .character-chips {
    justify-content: center;
  }
  
  .character-name {
    font-size: 1.8rem;
  }
  
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
  
  .sidebar-ad-container {
    order: -1;
  }
  
  .debug-actions {
    justify-content: center;
  }
}

/* ✅ ANIMAÇÕES */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

@keyframes posterGlow {
  0%, 100% { 
    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.3));
  }
  50% { 
    filter: drop-shadow(0 12px 32px rgba(25, 118, 210, 0.4));
  }
}

.dashboard-poster:hover {
  animation: posterGlow 2s ease-in-out infinite;
}

/* ✅ CORES CUSTOMIZADAS */
.text-red-darken-3 { color: #c62828 !important; }
.text-blue-darken-3 { color: #1565c0 !important; }
.text-green-darken-3 { color: #2e7d32 !important; }
.text-orange-darken-3 { color: #ef6c00 !important; }
.text-purple-darken-3 { color: #6a1b9a !important; }
.text-amber-darken-4 { color: #ff8f00 !important; }
.text-teal-darken-3 { color: #00695c !important; }

/* ✅ HOVER EFFECTS GLOBAIS */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}

.v-btn {
  border-radius: 8px;
  font-weight: 600;
}

.v-chip {
  font-weight: 700 !important;
}

/* ✅ DARK MODE SUPPORT */
.v-theme--dark .sidebar-ad-container {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .poster-hero-section {
  background: rgba(0, 0, 0, 0.1);
}
</style>