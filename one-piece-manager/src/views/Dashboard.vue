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
                  <v-icon left color="primary">mdi-sword-cross</v-icon>
                  Estatísticas de Combate
                </h3>
                <div class="ds-stats-list">
                  <div
                    v-for="stat in playerCombatStats"
                    :key="stat.key"
                    class="ds-stat-row"
                  >
                    <v-icon :color="stat.color" size="17" class="ds-stat-icon">{{ stat.icon }}</v-icon>
                    <span class="ds-stat-name">{{ stat.label }}</span>
                    <div class="ds-stat-bar-wrap">
                      <div class="ds-stat-bar" :style="{ width: dsStatPercent(stat.value) + '%', background: stat.bg }" />
                      <div v-if="stat.bonus > 0" class="ds-stat-bar ds-stat-bar-bonus"
                        :style="{ width: dsStatPercent(stat.bonus) + '%', left: dsStatPercent(stat.value) + '%' }" />
                    </div>
                    <span class="ds-stat-val" :style="{ color: stat.color }">{{ stat.value }}<span v-if="stat.bonus > 0" class="ds-stat-bonus-val">+{{ stat.bonus }}</span></span>
                  </div>
                </div>
              </div>

              <!-- HAKI STATS -->
              <div class="haki-section mb-4" v-if="hasHakiStats">
                <h3 class="text-h6 mb-3 stats-title">
                  <v-icon left color="blue-grey-lighten-2">mdi-wave</v-icon>
                  Haki
                </h3>
                <div class="ds-stats-list">
                  <div v-if="playerCharacter.stats.armHaki > 0" class="ds-stat-row">
                    <v-icon color="deep-purple-lighten-1" size="17" class="ds-stat-icon">mdi-shield-sword</v-icon>
                    <span class="ds-stat-name">Armamento</span>
                    <div class="ds-stat-bar-wrap">
                      <div class="ds-stat-bar" :style="{ width: dsHakiPercent(playerCharacter.stats.armHaki) + '%', background: 'linear-gradient(90deg,#4A148C,#AB47BC)' }" />
                    </div>
                    <span class="ds-stat-val" style="color:#AB47BC">{{ playerCharacter.stats.armHaki }}</span>
                  </div>
                  <div v-if="playerCharacter.stats.obsHaki > 0" class="ds-stat-row">
                    <v-icon color="cyan-lighten-1" size="17" class="ds-stat-icon">mdi-eye-circle</v-icon>
                    <span class="ds-stat-name">Observação</span>
                    <div class="ds-stat-bar-wrap">
                      <div class="ds-stat-bar" :style="{ width: dsHakiPercent(playerCharacter.stats.obsHaki) + '%', background: 'linear-gradient(90deg,#006064,#26C6DA)' }" />
                    </div>
                    <span class="ds-stat-val" style="color:#26C6DA">{{ playerCharacter.stats.obsHaki }}</span>
                  </div>
                  <div v-if="playerCharacter.stats.kingHaki > 0" class="ds-stat-row">
                    <v-icon color="amber-lighten-1" size="17" class="ds-stat-icon">mdi-crown</v-icon>
                    <span class="ds-stat-name">Do Rei</span>
                    <div class="ds-stat-bar-wrap">
                      <div class="ds-stat-bar" :style="{ width: dsHakiPercent(playerCharacter.stats.kingHaki) + '%', background: 'linear-gradient(90deg,#E65100,#FFA726)' }" />
                    </div>
                    <span class="ds-stat-val" style="color:#FFA726">{{ playerCharacter.stats.kingHaki }}</span>
                  </div>
                </div>
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

          <!-- NOTORIEDADE MUNDIAL -->
          <v-card v-if="playerCharacter && playerFame" variant="elevated" class="mb-4 db-fame-card">
            <v-card-title class="text-white pa-3" :style="{ background: playerFame.color }">
              <v-icon class="mr-2">{{ playerFame.icon }}</v-icon>
              Notoriedade Mundial
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-4">
                <v-icon size="52" :color="playerFame.color" class="mr-4">{{ playerFame.icon }}</v-icon>
                <div class="flex-grow-1">
                  <div class="text-h5 font-weight-bold" :style="{ color: playerFame.color }">{{ playerFame.title }}</div>
                  <div class="text-subtitle-2 text-medium-emphasis">{{ playerFame.score.toLocaleString() }} pontos de fama</div>
                </div>
              </div>
              <div v-if="playerFame.nextTitle" class="d-flex justify-space-between mb-1">
                <span class="text-caption text-medium-emphasis">{{ playerFame.title }}</span>
                <span class="text-caption text-medium-emphasis">{{ playerFame.nextTitle }}</span>
              </div>
              <v-progress-linear
                :model-value="playerFame.progress"
                :color="playerFame.color"
                height="10"
                rounded
                class="mb-2"
              />
              <div v-if="playerFame.nextTitle" class="text-caption text-center text-medium-emphasis">
                {{ (playerFame.nextScore! - playerFame.score).toLocaleString() }} pontos para <strong>{{ playerFame.nextTitle }}</strong>
              </div>
              <div v-else class="text-caption text-center font-weight-bold" :style="{ color: playerFame.color }">
                <v-icon size="14">mdi-crown</v-icon> Título máximo alcançado!
              </div>
            </v-card-text>
          </v-card>

          <!-- PROGRESSÃO DE MARES -->
          <v-card v-if="playerCharacter && seaAccess.length" variant="elevated" class="mb-4 db-seas-card">
            <v-card-title class="text-white pa-3" :style="{ background: currentSea.gradient }">
              <v-icon class="mr-2">{{ currentSea.icon }}</v-icon>
              Progressão de Mares — {{ currentSea.name }}
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="db-seas-grid">
                <div
                  v-for="sa in seaAccess"
                  :key="sa.sea.index"
                  class="db-sea-item"
                  :class="{ 'db-sea-current': sa.sea.index === currentSea.index, 'db-sea-locked': !sa.unlocked }"
                >
                  <div class="db-sea-header" :style="{ background: sa.unlocked ? sa.sea.color : '#37474F' }">
                    <v-icon color="white" size="18">{{ sa.sea.icon }}</v-icon>
                    <span class="db-sea-name">{{ sa.sea.name }}</span>
                    <v-icon color="white" size="16">{{ sa.unlocked ? 'mdi-check-circle' : 'mdi-lock' }}</v-icon>
                  </div>
                  <div class="db-sea-body">
                    <div class="text-caption text-medium-emphasis">Dif. {{ sa.sea.range[0] }}–{{ sa.sea.range[1] }}</div>
                    <div v-if="!sa.unlocked" class="db-sea-req mt-1">
                      <span class="text-caption font-weight-bold" :class="(playerCharacter.level ?? 0) >= sa.minLevel ? 'text-success' : 'text-error'">Lv {{ sa.minLevel }}</span>
                      <span class="text-caption mx-1">·</span>
                      <span class="text-caption font-weight-bold" :class="(playerCharacter.bounty ?? 0) >= sa.minBounty ? 'text-success' : 'text-error'">{{ formatBounty(sa.minBounty) }}</span>
                    </div>
                    <div v-else class="text-caption text-success font-weight-bold mt-1">Desbloqueado ✓</div>
                  </div>
                </div>
              </div>
              <div v-if="nextSea" class="text-center mt-3">
                <v-chip size="small" variant="tonal" :color="nextSea.sea.color">
                  <v-icon start size="14">{{ nextSea.sea.icon }}</v-icon>
                  Próximo: {{ nextSea.sea.name }} — Lv {{ nextSea.minLevel }} + {{ formatBounty(nextSea.minBounty) }}
                </v-chip>
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
import { db } from '@/utils/database'
import type { Character, DevilFruit, StyleCombat, Crew } from '@/utils/database'

// ✅ IMPORTS PARA CONTROLE DO MUNDO
import { WorldResetSystem, type WorldResetResult } from '@/utils/worldResetSystem'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'
import { GenerationConfig } from '@/utils/generationConfig'
// ✅ IMPORTS PARA WANTED POSTER
import WantedPoster from '@/components/WantedPoster.vue'
import { useAvatarManager } from '@/composables/useAvataaarsManager'
import { PowerCalculationSystem } from '@/utils/powerCalculationSystem'
import { InventorySystem } from '@/utils/inventorySystem'

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
const playerCrew = ref<Crew | null>(null)
const playerItemBonuses = ref<Record<string, number>>({})

// ✅ COMPUTED PARA HAKI STATS
const hasHakiStats = computed(() => {
  if (!playerCharacter.value) return false
  return playerCharacter.value.stats.armHaki > 0 ||
         playerCharacter.value.stats.obsHaki > 0 ||
         playerCharacter.value.stats.kingHaki > 0
})

// ✅ COMPUTED PARA BARRAS DE STATS
const playerCombatStats = computed(() => {
  const s = playerCharacter.value?.stats
  const b = playerItemBonuses.value
  if (!s) return []
  return [
    { key: 'attack',       label: 'Ataque',      icon: 'mdi-sword',    color: '#EF5350', bg: 'linear-gradient(90deg,#8B0000,#EF5350)', value: s.attack       || 0, bonus: (b.attack       || 0) },
    { key: 'defense',      label: 'Defesa',       icon: 'mdi-shield',   color: '#42A5F5', bg: 'linear-gradient(90deg,#003087,#42A5F5)', value: s.defense      || 0, bonus: (b.defense      || 0) },
    { key: 'speed',        label: 'Velocidade',   icon: 'mdi-run-fast', color: '#66BB6A', bg: 'linear-gradient(90deg,#1B5E20,#66BB6A)', value: s.speed        || 0, bonus: (b.speed        || 0) },
    { key: 'intelligence', label: 'Inteligência', icon: 'mdi-brain',    color: '#AB47BC', bg: 'linear-gradient(90deg,#4A148C,#AB47BC)', value: s.intelligence || 0, bonus: (b.intelligence || 0) },
    { key: 'skill',        label: 'Habilidade',   icon: 'mdi-feather',  color: '#FFA726', bg: 'linear-gradient(90deg,#E65100,#FFA726)', value: s.skill        || 0, bonus: (b.skill        || 0) },
  ]
})

const playerMaxStat = computed(() => {
  const values = playerCombatStats.value.map(s => s.value + s.bonus)
  return values.length > 0 ? Math.max(...values) : 1
})

const dsStatPercent = (value: number) => {
  const max = playerMaxStat.value
  if (max === 0) return 0
  return Math.min(100, Math.max(0, (value / max) * 100))
}

const dsHakiPercent = (value: number) => {
  const s = playerCharacter.value?.stats
  if (!s) return 0
  const maxHaki = Math.max(s.armHaki || 0, s.obsHaki || 0, s.kingHaki || 0)
  if (maxHaki === 0) return 0
  return Math.min(100, Math.max(0, (value / maxHaki) * 100))
}

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

const playerFame = computed(() => {
  if (!playerCharacter.value) return null
  return GameLogic.getWorldFame(playerCharacter.value, playerCrew.value?.reputation ?? 0)
})

const seaAccess = computed(() => {
  if (!playerCharacter.value) return []
  return GameLogic.getSeaAccess(playerCharacter.value)
})

const currentSea = computed(() => {
  if (!playerCharacter.value) return GameLogic.SEAS[0]
  const maxDiff = GameLogic.getMaxAccessibleDifficulty(playerCharacter.value)
  return GameLogic.getSea(Math.max(1, maxDiff))
})

const nextSea = computed(() => seaAccess.value.find(sa => !sa.unlocked) ?? null)

const formatBounty = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return `${value}`
}

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
  return GameLogic.calculatePower(character, playerDevilFruit.value, playerItemBonuses.value as any)
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
    // Carregar Crew do jogador
    if (playerCharacter.value.crewId) {
      playerCrew.value = await db.crews.get(playerCharacter.value.crewId) ?? null
    }

    // Carregar bônus de itens equipados
    const bonuses = await InventorySystem.calculateItemBonuses(playerCharacter.value)
    playerItemBonuses.value = bonuses as Record<string, number>

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
/* ============================================================
   Dashboard - Grand Line Command Center
   ============================================================ */

.dashboard-container {
  max-width: 1400px;
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
  max-width: 280px;
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

/* Dashboard header */
.dashboard-header {
  background: linear-gradient(135deg,
    rgba(212, 175, 55, 0.1) 0%,
    rgba(21, 101, 192, 0.08) 100%
  );
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent, #D4AF37, #FFD700, #D4AF37, transparent
  );
}

/* ─── Combat stat bar rows ─── */
.ds-stats-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ds-stat-row {
  display: grid;
  grid-template-columns: 20px 100px 1fr 38px;
  align-items: center;
  gap: 10px;
}

.ds-stat-icon { justify-self: center; }

.ds-stat-name {
  font-size: 0.82rem;
  color: #B0BFDA;
  white-space: nowrap;
}

.ds-stat-bar-wrap {
  position: relative;
  height: 7px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  overflow: hidden;
}

.ds-stat-bar {
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.ds-stat-bar-bonus {
  background: linear-gradient(90deg, #B8860B, #FFD700) !important;
  opacity: 0.85;
}

.ds-stat-val {
  font-size: 0.82rem;
  font-weight: 700;
  text-align: right;
  font-family: 'Courier New', monospace;
}

.ds-stat-bonus-val {
  font-size: 0.7rem;
  color: #FFD700;
  margin-left: 2px;
}

/* Character panel */
.character-panel {
  background: linear-gradient(135deg, #132235, #1A2F45);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 14px;
  overflow: hidden;
}

.character-panel-header {
  background: linear-gradient(135deg,
    rgba(212, 175, 55, 0.12),
    rgba(21, 101, 192, 0.08)
  );
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  padding: 14px 18px;
}

.character-name {
  font-family: Georgia, serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #D4AF37;
  text-shadow: 0 0 12px rgba(212, 175, 55, 0.35);
}

/* XP / progress bars */
.xp-bar-track {
  height: 10px;
  background: rgba(10, 22, 40, 0.8);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 6px;
}

.xp-bar-fill {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, #866700, #FFD700);
  transition: width 0.6s ease;
  position: relative;
  overflow: hidden;
}

.xp-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -60%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: xp-shimmer 2.5s infinite;
}

/* Ranking section */
.ranking-card {
  background: #132235;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 12px;
  overflow: hidden;
}

.ranking-header {
  background: linear-gradient(135deg,
    rgba(212, 175, 55, 0.1),
    rgba(21, 101, 192, 0.06)
  );
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  padding: 12px 16px;
}

.ranking-title {
  font-family: Georgia, serif;
  color: #D4AF37;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.04em;
}

/* World status panel */
.world-status-card {
  background: linear-gradient(135deg, #132235, #0F1E33);
  border: 1px solid rgba(21, 101, 192, 0.35);
  border-radius: 12px;
  overflow: hidden;
}

.world-status-title {
  font-family: Georgia, serif;
  color: #90CAF9;
  font-weight: 600;
  font-size: 0.95rem;
}

/* Bounty display */
.bounty-display {
  font-family: Georgia, serif;
  color: #FFD700;
  font-weight: 700;
  font-size: 1.1rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
  letter-spacing: 0.02em;
}

@keyframes xp-shimmer {
  0%   { left: -60%; }
  100% { left: 160%; }
}

/* ── Fame card ── */
.db-fame-card {
  border-radius: 12px;
  overflow: hidden;
}

/* ── Seas progression card ── */
.db-seas-card {
  border-radius: 12px;
  overflow: hidden;
}

.db-seas-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

@media (min-width: 600px) {
  .db-seas-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.db-sea-item {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  transition: transform 0.15s;
}

.db-sea-item.db-sea-current {
  border-color: rgba(255,255,255,0.4);
  box-shadow: 0 0 10px rgba(255,255,255,0.15);
  transform: scale(1.03);
}

.db-sea-item.db-sea-locked {
  opacity: 0.65;
}

.db-sea-header {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 8px;
}

.db-sea-name {
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.db-sea-body {
  padding: 6px 8px;
  background: rgba(0,0,0,0.2);
}

.db-sea-req {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
</style>