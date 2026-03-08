<template>
  <div class="world-encyclopedia-container">
    
    <!-- LOADING STATE -->
    <div v-if="initialLoading" class="loading-container">
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
              
              <div class="text-h6 mb-4">Carregando Enciclopédia do Mundo</div>
              
              <!-- PROGRESSO DETALHADO -->
              <div class="loading-steps">
                <div class="step-item" :class="{ 'completed': loadingStep >= 1 }">
                  <v-icon :color="loadingStep >= 1 ? 'success' : 'grey'">
                    {{ loadingStep >= 1 ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Dados dos Personagens</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': loadingStep >= 2 }">
                  <v-icon :color="loadingStep >= 2 ? 'success' : 'grey'">
                    {{ loadingStep >= 2 ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Calculando Rankings</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': loadingStep >= 3 }">
                  <v-icon :color="loadingStep >= 3 ? 'success' : 'grey'">
                    {{ loadingStep >= 3 ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Organizando Grupos Especiais</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': loadingStep >= 4 }">
                  <v-icon :color="loadingStep >= 4 ? 'success' : 'grey'">
                    {{ loadingStep >= 4 ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Gerando Estatísticas</span>
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
          <v-card class="mb-4" variant="elevated">
            <v-card-title class="text-center">
              <v-icon left size="large">mdi-earth</v-icon>
              ENCICLOPÉDIA DO MUNDO
            </v-card-title>
            <v-card-subtitle class="text-center">
              Os personagens mais renomados dos mares
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>

      <!-- POSIÇÃO DO PLAYER HEADER -->
      <v-row v-if="playerInfo">
        <v-col cols="12">
          <div class="pp-card mb-4">

            <!-- Linha decorativa de topo -->
            <div class="pp-top-accent" />

            <!-- Header -->
            <div class="pp-header">
              <v-icon size="22" color="primary">mdi-crown</v-icon>
              <div>
                <p class="pp-title">SUA POSIÇÃO NO MUNDO</p>
                <p class="pp-subtitle">Ranking Global de {{ formatType(playerInfo.category) }}s</p>
              </div>
            </div>

            <!-- Body: poster + info -->
            <div class="pp-body">

              <!-- Poster -->
              <div class="pp-poster-col">
                <WantedPoster
                  :character="playerCharacter"
                  size="small"
                  :show-actions="false"
                  :show-size-controls="false"
                />
                <v-chip
                  color="success"
                  variant="elevated"
                  size="small"
                  prepend-icon="mdi-account-star"
                  class="mt-2"
                >
                  VOCÊ
                </v-chip>
              </div>

              <!-- Info -->
              <div class="pp-info-col">

                <!-- Rank principal -->
                <div class="pp-rank-row">
                  <span class="pp-rank-hash">#</span>
                  <span class="pp-rank-num">{{ playerInfo.rank }}</span>
                  <v-chip
                    :color="getRankColor(playerInfo.rank)"
                    variant="elevated"
                    size="large"
                    class="ms-2"
                  >
                    {{ getRankTitle(playerInfo.rank) }}
                  </v-chip>
                </div>

                <!-- Grid de 4 stats -->
                <div class="pp-stats-grid">
                  <div class="pp-stat-box">
                    <v-icon color="primary" size="20">mdi-account-group</v-icon>
                    <p class="pp-stat-val">{{ playerInfo.totalInCategory }}</p>
                    <p class="pp-stat-lbl">Total {{ formatType(playerInfo.category) }}s</p>
                  </div>
                  <div class="pp-stat-box">
                    <v-icon color="success" size="20">mdi-trending-up</v-icon>
                    <p class="pp-stat-val">{{ getPercentile() }}%</p>
                    <p class="pp-stat-lbl">Top Percentil</p>
                  </div>
                  <div class="pp-stat-box">
                    <v-icon color="warning" size="20">mdi-star-four-points</v-icon>
                    <p class="pp-stat-val">{{ playerCharacter.level }}</p>
                    <p class="pp-stat-lbl">Nível Atual</p>
                  </div>
                  <div class="pp-stat-box">
                    <v-icon :color="getTypeColor(playerInfo.category)" size="20">{{ getTypeIcon(playerInfo.category) }}</v-icon>
                    <p class="pp-stat-val">{{ formatType(playerInfo.category) }}</p>
                    <p class="pp-stat-lbl">Categoria</p>
                  </div>
                </div>

                <!-- Progresso para próximo rank -->
                <div v-if="playerInfo.rank > 1" class="pp-progress-section">
                  <div class="pp-progress-header">
                    <span>Próximo Objetivo: Rank #{{ playerInfo.rank - 1 }}</span>
                    <v-chip size="x-small" color="info" variant="tonal">
                      {{ getProgressToNextRank() }}
                    </v-chip>
                  </div>
                  <v-progress-linear
                    :model-value="getProgressPercentage()"
                    color="primary"
                    bg-color="rgba(255,255,255,0.06)"
                    height="8"
                    rounded
                  />
                </div>

                <!-- Conquista -->
                <div v-if="getAchievementBadge()" class="pp-achievement">
                  <v-icon :color="getAchievementColor()" size="22">{{ getAchievementIcon() }}</v-icon>
                  <div>
                    <p class="pp-ach-title">{{ getAchievementTitle() }}</p>
                    <p class="pp-ach-desc">{{ getAchievementDescription() }}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- ESTATÍSTICAS GERAIS -->
      <v-row v-if="showStats && worldStats">
        <v-col cols="12">
          <v-card variant="elevated" class="mb-4" color="blue-lighten-5">
            <v-card-title class="text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-chart-box</v-icon>
              📊 ESTATÍSTICAS DO MUNDO
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="red-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="red-darken-2">mdi-pirate</v-icon>
                      <div class="text-h6 mt-1 text-red-darken-3">{{ worldStats.totalPirates }}</div>
                      <div class="text-caption">Piratas</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="blue-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="blue-darken-2">mdi-anchor</v-icon>
                      <div class="text-h6 mt-1 text-blue-darken-3">{{ worldStats.totalMarines }}</div>
                      <div class="text-caption">Marines</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="green-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="green-darken-2">mdi-target</v-icon>
                      <div class="text-h6 mt-1 text-green-darken-3">{{ worldStats.totalBountyHunters }}</div>
                      <div class="text-caption">Caçadores</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="purple-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="purple-darken-2">mdi-bank</v-icon>
                      <div class="text-h6 mt-1 text-purple-darken-3">{{ worldStats.totalGovernment }}</div>
                      <div class="text-caption">Governo</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <v-row class="mt-4">
                <v-col cols="12" md="6">
                  <v-card variant="outlined" color="orange-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="orange-darken-2">mdi-trophy</v-icon>
                      <div class="text-h6 mt-1 text-orange-darken-3">{{ formatBounty(worldStats.highestBounty) }}</div>
                      <div class="text-caption">Maior Recompensa</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" color="cyan-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="cyan-darken-2">mdi-calculator</v-icon>
                      <div class="text-h6 mt-1 text-cyan-darken-3">{{ formatBounty(worldStats.averageBounty) }}</div>
                      <div class="text-caption">Recompensa Média</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- CONTROLES -->
      <v-row>
        <v-col cols="12">
          <v-card variant="elevated" class="mb-4">
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-center flex-wrap gap-2">
                <div class="d-flex gap-2">
                  <v-btn
                    color="info"
                    variant="outlined"
                    prepend-icon="mdi-chart-line"
                    @click="showStats = !showStats"
                    :disabled="refreshLoading"
                  >
                    {{ showStats ? 'Ocultar' : 'Mostrar' }} Stats
                  </v-btn>
                </div>
                <div>
                  <v-btn
                    color="primary"
                    variant="elevated"
                    prepend-icon="mdi-refresh"
                    @click="refreshRankings"
                    :loading="refreshLoading"
                  >
                    {{ refreshLoading ? 'Atualizando...' : 'Atualizar Rankings' }}
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- TABS NAVIGATION -->
      <v-row>
        <v-col cols="12">
          <v-card variant="elevated" class="mb-4">
            <v-tabs v-model="activeTab" bg-color="transparent" color="primary" show-arrows>
              <v-tab value="legends" class="tab-item">
                <v-icon class="me-2">mdi-star</v-icon>
                <span class="tab-text">Legends</span>
              </v-tab>
              <v-tab value="yonkou" class="tab-item">
                <v-icon class="me-2">mdi-crown</v-icon>
                <span class="tab-text">Yonkou</span>
              </v-tab>
              <v-tab value="shichibukai" class="tab-item">
                <v-icon class="me-2">mdi-shield-crown</v-icon>
                <span class="tab-text">Shichibukai</span>
              </v-tab>
              <v-tab value="admirals" class="tab-item">
                <v-icon class="me-2">mdi-star-circle</v-icon>
                <span class="tab-text">Admirais</span>
              </v-tab>
              <v-tab value="gorousei" class="tab-item">
                <v-icon class="me-2">mdi-account-star</v-icon>
                <span class="tab-text">Gorousei</span>
              </v-tab>
              <v-tab value="pirates" class="tab-item">
                <v-icon class="me-2">mdi-pirate</v-icon>
                <span class="tab-text">Piratas</span>
              </v-tab>
              <v-tab value="marines" class="tab-item">
                <v-icon class="me-2">mdi-anchor</v-icon>
                <span class="tab-text">Marines</span>
              </v-tab>
              <v-tab value="bountyHunters" class="tab-item">
                <v-icon class="me-2">mdi-target</v-icon>
                <span class="tab-text">Caçadores</span>
              </v-tab>
              <v-tab value="government" class="tab-item">
                <v-icon class="me-2">mdi-bank</v-icon>
                <span class="tab-text">Governo</span>
              </v-tab>
              <v-tab value="supernovas" class="tab-item">
                <v-icon class="me-2">mdi-star-shooting</v-icon>
                <span class="tab-text">Supernovas</span>
              </v-tab>
              <v-tab value="devilFruits" class="tab-item">
                <v-icon class="me-2">mdi-fruit-grapes</v-icon>
                <span class="tab-text">Devil Fruits</span>
              </v-tab>
              <v-tab value="legendaryWeapons" class="tab-item">
                <v-icon class="me-2">mdi-sword-cross</v-icon>
                <span class="tab-text">Armas Lendárias</span>
              </v-tab>
              <v-tab value="famous" class="tab-item">
                <v-icon class="me-2">mdi-star-circle</v-icon>
                <span class="tab-text">Fama Mundial</span>
              </v-tab>
            </v-tabs>
          </v-card>
        </v-col>
      </v-row>

      <!-- CONTENT AREA -->
      <div v-if="refreshLoading" class="loading-container">
        <v-row justify="center">
          <v-col cols="12" class="text-center">
            <v-card class="pa-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
                class="mb-4"
              />
              <div class="text-h6">Atualizando rankings...</div>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- RANKINGS CONTENT -->
      <v-window v-else v-model="activeTab">
        <!-- Legends Tab -->
        <v-window-item value="legends">
          <v-card variant="elevated" color="red-lighten-5">
            <v-card-title class="text-red-darken-3">
              <v-icon left color="red-darken-3">mdi-star</v-icon>
              👑 As lendas dos mares
            </v-card-title>
            <v-card-subtitle class="text-red-darken-2">
              Os personagens mais poderosos do mundo
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.legends"
                :max-items="20"
                special-badge="Legend"
                badge-color="amber"
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Yonkou Tab -->
        <v-window-item value="yonkou">
          <v-card variant="elevated" color="red-lighten-5">
            <v-card-title class="text-red-darken-3">
              <v-icon left color="red-darken-3">mdi-crown</v-icon>
              👑 OS QUATRO IMPERADORES
            </v-card-title>
            <v-card-subtitle class="text-red-darken-2">
              Os piratas mais poderosos do Novo Mundo
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.yonkou"
                :max-items="4"
                special-badge="Yonkou"
                badge-color="red"
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Shichibukai Tab -->
        <v-window-item value="shichibukai">
          <v-card variant="elevated" color="purple-lighten-5">
            <v-card-title class="text-purple-darken-3">
              <v-icon left color="purple-darken-3">mdi-shield-crown</v-icon>
              ⚔️ OS SETE CORSÁRIOS
            </v-card-title>
            <v-card-subtitle class="text-purple-darken-2">
              Piratas sancionados pelo Governo Mundial
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.shichibukai"
                :max-items="7"
                special-badge="Shichibukai"
                badge-color="purple"
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Admirals Tab -->
        <v-window-item value="admirals">
          <v-card variant="elevated" color="blue-lighten-5">
            <v-card-title class="text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-star-circle</v-icon>
              ⭐ ALMIRANTES DA MARINHA
            </v-card-title>
            <v-card-subtitle class="text-blue-darken-2">
              Os oficiais de mais alto escalão da Marinha
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.admirals"
                special-badge="Almirante"
                badge-color="blue"
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Gorousei Tab -->
        <v-window-item value="gorousei">
          <v-card variant="elevated" color="grey-lighten-4">
            <v-card-title class="text-grey-darken-4">
              <v-icon left color="grey-darken-4">mdi-account-star</v-icon>
              🌟 AS CINCO ESTRELAS ANCIÃS
            </v-card-title>
            <v-card-subtitle class="text-grey-darken-3">
              A mais alta autoridade do Governo Mundial
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.gorousei"
                :max-items="5"
                special-badge="Gorousei"
                badge-color="grey-darken-2"
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Pirates Tab -->
        <v-window-item value="pirates">
          <v-card variant="elevated" color="red-lighten-5">
            <v-card-title class="text-red-darken-3">
              <v-icon left color="red-darken-3">mdi-pirate</v-icon>
              🏴‍☠️ RANKING DE PIRATAS
            </v-card-title>
            <v-card-subtitle class="text-red-darken-2">
              Todos os piratas classificados por recompensa
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.pirates"
                show-pagination
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Marines Tab -->
        <v-window-item value="marines">
          <v-card variant="elevated" color="blue-lighten-5">
            <v-card-title class="text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-anchor</v-icon>
              ⚓ RANKING DE MARINES
            </v-card-title>
            <v-card-subtitle class="text-blue-darken-2">
              Todos os marines classificados por patente
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.marines"
                show-pagination
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Bounty Hunters Tab -->
        <v-window-item value="bountyHunters">
          <v-card variant="elevated" color="green-lighten-5">
            <v-card-title class="text-green-darken-3">
              <v-icon left color="green-darken-3">mdi-target</v-icon>
              🎯 RANKING DE CAÇADORES
            </v-card-title>
            <v-card-subtitle class="text-green-darken-2">
              Todos os caçadores de recompensa classificados
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.bountyHunters"
                show-pagination
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Government Tab -->
        <v-window-item value="government">
          <v-card variant="elevated" color="orange-lighten-5">
            <v-card-title class="text-orange-darken-3">
              <v-icon left color="orange-darken-3">mdi-bank</v-icon>
              🏛️ RANKING DO GOVERNO
            </v-card-title>
            <v-card-subtitle class="text-orange-darken-2">
              Todos os agentes governamentais classificados
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.government"
                show-pagination
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Supernovas Tab -->
        <v-window-item value="supernovas">
          <v-card variant="elevated" color="orange-lighten-5">
            <v-card-title class="text-orange-darken-3">
              <v-icon left color="orange-darken-3">mdi-star-shooting</v-icon>
              🌟 CANDIDATOS A SUPERNOVA
            </v-card-title>
            <v-card-subtitle class="text-orange-darken-2">
              Piratas em ascensão no Paraíso (Ilhas dificuldade ≤ 14)
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.supernovas"
                :max-items="15"
                special-badge="Candidato"
                badge-color="orange"
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <v-window-item value="devilFruits">
          <v-card variant="elevated" color="orange-lighten-5">
            <v-card-title class="text-orange-darken-3">
              <v-icon left color="orange-darken-3">mdi-fruit-grapes</v-icon>
              Usuário de Devil Fruit no Mundo
            </v-card-title>
            <v-card-subtitle class="text-orange-darken-2">
              Todos os usuário de Devil Fruit hoje
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.devilFruitsUser"
                special-badge="Devil Fruit User"
                badge-color="orange"
                show-pagination
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Legendary Weapons Tab -->
        <v-window-item value="legendaryWeapons">
          <v-card variant="elevated" style="background: linear-gradient(135deg, #1a0a00 0%, #2d1a00 100%); border: 1px solid rgba(212,175,55,0.4);">
            <v-card-title style="color: #D4AF37;">
              <v-icon left color="#D4AF37">mdi-sword-cross</v-icon>
              ⚔️ ARMAS LENDÁRIAS — DETENTORES
            </v-card-title>
            <v-card-subtitle style="color: #B0BFDA;">
              Os guerreiros que empunham as armas mais poderosas do mundo
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <div v-if="rankings.legendaryWeapons.length === 0" class="text-center pa-8" style="color: #8B9DC3;">
                <v-icon size="60" color="#8B9DC3">mdi-sword-cross</v-icon>
                <p class="mt-3">Nenhuma arma única distribuída ainda.</p>
              </div>

              <template v-else>
                <template v-for="group in legendaryWeaponsByClass" :key="group.cls">
                  <!-- Class section header -->
                  <div class="leg-class-header" :style="{ borderColor: legClassColor(group.cls) }">
                    <v-icon size="16" :color="legClassColor(group.cls)">{{ legClassIcon(group.cls) }}</v-icon>
                    <span class="leg-class-header-cls" :style="{ color: legClassColor(group.cls) }">
                      Classe {{ group.cls }}
                    </span>
                    <span class="leg-class-header-label">{{ legClassLabel(group.cls) }}</span>
                    <span class="leg-class-header-count" :style="{ color: legClassColor(group.cls) }">
                      {{ group.entries.length }} arma{{ group.entries.length !== 1 ? 's' : '' }}
                    </span>
                  </div>

                  <!-- Weapons in this class -->
                  <div class="leg-weapon-list mb-4">
                    <div
                      v-for="entry in group.entries"
                      :key="entry.weapon.id"
                      class="leg-weapon-row"
                      @click="showCharacterDetails(entry.character)"
                    >
                      <!-- Rank -->
                      <div class="leg-rank">
                        <span class="leg-rank-num">#{{ entry.rank }}</span>
                      </div>

                      <!-- Weapon icon -->
                      <div class="leg-weapon-icon">
                        <v-icon size="26" :color="legClassColor(entry.weapon.class)">{{ legClassIcon(entry.weapon.class) }}</v-icon>
                      </div>

                      <!-- Weapon + character info -->
                      <div class="leg-info">
                        <div class="leg-weapon-name">{{ entry.weapon.name }}</div>
                        <div class="leg-weapon-sub">
                          <span
                            class="leg-class-badge"
                            :style="{ background: legClassColor(entry.weapon.class), color: '#0D1B2E' }"
                          >{{ entry.weapon.class }}</span>
                          <span v-if="entry.weapon.subtype" class="leg-subtype-badge">{{ entry.weapon.subtype }}</span>
                          <span v-if="entry.equipped" class="leg-equipped-badge">
                            <v-icon size="10">mdi-sword</v-icon> Equipada
                          </span>
                          <span v-else class="leg-chest-badge">
                            <v-icon size="10">mdi-treasure-chest</v-icon> No baú
                          </span>
                        </div>
                        <div class="leg-char-name">
                          <v-icon size="13" :color="entry.character.isPlayer ? '#D4AF37' : '#B0BFDA'">
                            {{ entry.character.isPlayer ? 'mdi-crown' : 'mdi-account' }}
                          </v-icon>
                          {{ entry.character.name }}
                          <span class="leg-char-meta">· Lv{{ entry.character.level }} · {{ entry.character.type }}</span>
                        </div>
                        <div class="leg-crew-name">{{ entry.character.crewName }}</div>
                        <div v-if="entry.weapon.lore" class="leg-lore">"{{ entry.weapon.lore }}"</div>
                      </div>

                      <!-- Stats preview -->
                      <div class="leg-stats">
                        <div v-for="(val, stat) in legWeaponEffective(entry.weapon)" :key="stat" class="leg-stat-row">
                          <v-icon size="11" :color="legStatColor(stat)">{{ legStatIcon(stat) }}</v-icon>
                          <span class="leg-stat-val" :style="{ color: legClassColor(entry.weapon.class) }">+{{ val }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </template>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Fama Mundial Tab -->
        <v-window-item value="famous">
          <v-card variant="elevated">
            <v-card-title class="text-white pa-3" style="background: linear-gradient(135deg,#B8860B,#D4AF37);">
              <v-icon class="mr-2">mdi-star-circle</v-icon>
              ⭐ FAMA MUNDIAL — TOP 20
            </v-card-title>
            <v-card-subtitle class="pa-3 text-medium-emphasis">
              Classificado por recompensa × level × reputação da tripulação
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <RankingSection
                :characters="rankings.famousCharacters"
                show-pagination
                @character-click="showCharacterDetails"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

      </v-window>
    </div>

    <!-- Character Details Dialog -->
    <CharacterDetailsDialog
      v-model="characterDialog"
      :character="selectedCharacter"
      :all-devil-fruits="rankings.allDevilFruits"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { WorldEncyclopedia, type WorldRankings, type PlayerRankingInfo, type RankingCharacter } from '@/utils/worldEncyclopedia'
import type { Item } from '@/utils/database'
import RankingSection from '@/components/RankingSection.vue'
import CharacterDetailsDialog from '@/components/CharacterDetailsDialog.vue'
import AvataaarsAvatar from '@/components/AvataaarsAvatar.vue'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'
import WantedPoster from '@/components/WantedPoster.vue'
const characterStore = useCharacterStore()

// Loading states
const initialLoading = ref(true)
const refreshLoading = ref(false)
const loadingStep = ref(0)

// Data
const activeTab = ref('yonkou')
const showStats = ref(false)
const rankings = ref<WorldRankings>({
  legends: [],
  yonkou: [],
  shichibukai: [],
  admirals: [],
  gorousei: [],
  pirates: [],
  marines: [],
  bountyHunters: [],
  government: [],
  supernovas: [],
  playerInfo: null,
  allDevilFruits: [],
  devilFruitsUser: [],
  legendaryWeapons: [],
  famousCharacters: [],
})
const worldStats = ref(null)
const playerInfo = ref<PlayerRankingInfo | null>(null)

// Dialog
const characterDialog = ref(false)
const selectedCharacter = ref<RankingCharacter | null>(null)

// Computed
const playerCharacter = computed(() => characterStore.playerCharacter)

// Methods
const loadRankings = async (isInitial = false): Promise<void> => {
  if (isInitial) {
    initialLoading.value = true
    loadingStep.value = 0
  } else {
    refreshLoading.value = true
  }

  try {
    if (isInitial) {
      loadingStep.value = 1
      await new Promise(resolve => setTimeout(resolve, 500))
      
      loadingStep.value = 2
      await new Promise(resolve => setTimeout(resolve, 500))
      
      loadingStep.value = 3
      await new Promise(resolve => setTimeout(resolve, 500))
      
      loadingStep.value = 4
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const [worldRankings, stats] = await Promise.all([
      WorldEncyclopedia.generateWorldRankings(playerCharacter.value?.id),
      WorldEncyclopedia.getWorldStats()
    ])

    rankings.value = worldRankings
    worldStats.value = stats
    playerInfo.value = worldRankings.playerInfo

    if (isInitial) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  } catch (error) {
    console.error('Failed to load rankings:', error)
  } finally {
    if (isInitial) {
      initialLoading.value = false
      loadingStep.value = 0
    } else {
      refreshLoading.value = false
    }
  }
}

const refreshRankings = (): void => {
  loadRankings(false)
}

const showCharacterDetails = (character: RankingCharacter): void => {
  selectedCharacter.value = character
  characterDialog.value = true
}


const formatType = (type: string): string => {
  return type.replace(/([A-Z])/g, ' $1').trim()
}

const formatBounty = (bounty: number): string => {
  if (bounty >= 1000000000) {
    return `${(bounty / 1000000000).toFixed(1)}B`
  } else if (bounty >= 1000000) {
    return `${(bounty / 1000000).toFixed(1)}M`
  } else if (bounty >= 1000) {
    return `${(bounty / 1000).toFixed(1)}K`
  }
  return bounty.toString()
}

// ── Legendary weapons helpers ─────────────────────────────────────────────────
const LEG_CLASS_ORDER = ['S', 'A', 'B', 'C', 'D', 'E', 'F']

const legClassColor = (cls: string): string => ({
  S: '#FFD700', A: '#C0C0C0', B: '#CD7F32', C: '#78909C', D: '#66BB6A', E: '#8B9DC3', F: '#9E9E9E',
}[cls] ?? '#8B9DC3')

const legClassLabel = (cls: string): string => ({
  S: 'Saijo O Wazamono — Supremas',
  A: 'O Wazamono — Grandes',
  B: 'Wazamono — Habilidosas',
  C: 'Ko Wazamono — Boas',
  D: 'Raras', E: 'Incomuns', F: 'Especiais',
}[cls] ?? cls)

const legClassIcon = (cls: string): string => ({
  S: 'mdi-star', A: 'mdi-star-half-full', B: 'mdi-shield-sword',
  C: 'mdi-shield', D: 'mdi-sword', E: 'mdi-knife', F: 'mdi-knife-military',
}[cls] ?? 'mdi-sword')

const legendaryWeaponsByClass = computed(() => {
  const groups = new Map<string, typeof rankings.value.legendaryWeapons>()
  for (const entry of rankings.value.legendaryWeapons) {
    const c = entry.weapon.class
    if (!groups.has(c)) groups.set(c, [])
    groups.get(c)!.push(entry)
  }
  return LEG_CLASS_ORDER
    .filter(c => groups.has(c))
    .map(c => ({ cls: c, entries: groups.get(c)! }))
})

const legWeaponEffective = (item: Item): Record<string, number> => {
  const result: Record<string, number> = {}
  for (const [k, v] of Object.entries(item.statsInfluence)) {
    const eff = Math.round((v ?? 0) * (1 + item.rarity / 100))
    if (eff > 0) result[k] = eff
  }
  return result
}

const legStatIcon = (stat: string): string => ({
  attack: 'mdi-sword', defense: 'mdi-shield', speed: 'mdi-run-fast',
  skill: 'mdi-feather', intelligence: 'mdi-brain',
}[stat] ?? 'mdi-star')

const legStatColor = (stat: string): string => ({
  attack: '#EF5350', defense: '#42A5F5', speed: '#66BB6A',
  skill: '#FFA726', intelligence: '#CE93D8',
}[stat] ?? '#B0BFDA')

// Lifecycle
onMounted(async () => {
  await nextTick()
  await loadRankings(true)
})

const getPlayerCardClass = (): string => {
  if (!playerInfo.value) return ''
  
  const rank = playerInfo.value.rank
  if (rank === 1) return 'rank-first'
  if (rank <= 3) return 'rank-top3'
  if (rank <= 10) return 'rank-top10'
  if (rank <= 50) return 'rank-top50'
  return 'rank-normal'
}

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'amber'
  if (rank <= 3) return 'grey-lighten-1'
  if (rank <= 10) return 'blue'
  if (rank <= 50) return 'green'
  return 'grey'
}

const getRankTitle = (rank: number): string => {
  if (rank === 1) return 'LENDA'
  if (rank <= 3) return 'ELITE'
  if (rank <= 10) return 'VETERANO'
  if (rank <= 50) return 'EXPERIENTE'
  if (rank <= 100) return 'COMPETENTE'
  return 'INICIANTE'
}

const getPercentile = (): number => {
  if (!playerInfo.value) return 0
  const { rank, totalInCategory } = playerInfo.value
  return Math.round(((totalInCategory - rank) / totalInCategory) * 100)
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    Pirate: 'red',
    Marine: 'blue',
    BountyHunter: 'green',
    Government: 'purple'
  }
  return colors[type] || 'grey'
}

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    Pirate: 'mdi-pirate',
    Marine: 'mdi-anchor',
    BountyHunter: 'mdi-target',
    Government: 'mdi-bank'
  }
  return icons[type] || 'mdi-account'
}

const getProgressToNextRank = (): string => {
  // Lógica para calcular o que falta para o próximo rank
  return 'Melhore suas stats'
}

const getProgressPercentage = (): number => {
  // Lógica para calcular porcentagem de progresso
  return 65 // Exemplo
}

const getAchievementBadge = (): boolean => {
  if (!playerInfo.value) return false
  return playerInfo.value.rank <= 10
}

const getAchievementColor = (): string => {
  if (!playerInfo.value) return 'info'
  const rank = playerInfo.value.rank
  if (rank === 1) return 'amber'
  if (rank <= 3) return 'purple'
  if (rank <= 10) return 'blue'
  return 'info'
}

const getAchievementIcon = (): string => {
  if (!playerInfo.value) return 'mdi-trophy'
  const rank = playerInfo.value.rank
  if (rank === 1) return 'mdi-crown'
  if (rank <= 3) return 'mdi-medal'
  if (rank <= 10) return 'mdi-trophy'
  return 'mdi-star'
}

const getAchievementTitle = (): string => {
  if (!playerInfo.value) return ''
  const rank = playerInfo.value.rank
  if (rank === 1) return '🏆 IMPERADOR DOS MARES!'
  if (rank <= 3) return '⭐ TOP 3 MUNDIAL!'
  if (rank <= 10) return '🎖️ TOP 10 MUNDIAL!'
  return '🌟 Excelente Posição!'
}

const getAchievementDescription = (): string => {
  if (!playerInfo.value) return ''
  const rank = playerInfo.value.rank
  if (rank === 1) return 'Você é o mais poderoso do mundo! Parabéns!'
  if (rank <= 3) return 'Entre os 3 mais fortes do mundo! Incrível!'
  if (rank <= 10) return 'Entre os 10 mais fortes! Continue assim!'
  return 'Você está indo muito bem!'
}
</script>

<style scoped>
/* ============================================================
   World Encyclopedia - Grand Line Chronicles
   ============================================================ */

.encyclopedia-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 8px;
}

/* Page header */
.encyclopedia-header {
  background: linear-gradient(135deg,
    rgba(84, 110, 122, 0.12),
    rgba(212, 175, 55, 0.06)
  );
  border: 1px solid rgba(84, 110, 122, 0.3);
  border-radius: 14px;
  padding: 18px 24px;
  margin-bottom: 20px;
  position: relative;
}

.encyclopedia-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent, #546E7A, #90A4AE, #546E7A, transparent
  );
  border-radius: 14px 14px 0 0;
}

.encyclopedia-title {
  font-family: Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #90A4AE;
  letter-spacing: 0.05em;
  margin: 0;
}

/* Category tabs */
.category-tab {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  font-size: 0.85rem;
  color: #8B9DC3;
  font-weight: 600;
}

.category-tab:hover {
  border-color: rgba(212, 175, 55, 0.35);
  color: #D4AF37;
}

.category-tab.active {
  border-color: #D4AF37;
  color: #D4AF37;
  background: rgba(212, 175, 55, 0.08);
}

/* Entry cards */
.entry-card {
  background: #132235;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 11px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
  height: 100%;
}

.entry-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  box-shadow: 0 0 14px rgba(212, 175, 55, 0.16);
  transform: translateY(-2px);
}

.entry-card-header {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
}

.entry-name {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #E8D5A3;
  font-size: 0.9rem;
}

.entry-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-top: 4px;
}

/* Type-specific badge colors */
.type-pirate   { color: #FF8A65; background: rgba(255,138,101,0.1); border: 1px solid rgba(255,138,101,0.3); }
.type-marine   { color: #90CAF9; background: rgba(144,202,249,0.1); border: 1px solid rgba(144,202,249,0.3); }
.type-island   { color: #A5D6A7; background: rgba(165,214,167,0.1); border: 1px solid rgba(165,214,167,0.3); }
.type-crew     { color: #CE93D8; background: rgba(206,147,216,0.1); border: 1px solid rgba(206,147,216,0.3); }
.type-devilfruit { color: #FFCC02; background: rgba(255,204,2,0.1);  border: 1px solid rgba(255,204,2,0.3); }
.type-ship     { color: #80DEEA; background: rgba(128,222,234,0.1); border: 1px solid rgba(128,222,234,0.3); }

/* Entry body */
.entry-card-body {
  padding: 10px 14px;
}

.entry-stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: #8B9DC3;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.entry-stat:last-child { border-bottom: none; }

.entry-stat-value {
  color: #E8D5A3;
  font-weight: 600;
}

.entry-stat-value.gold { color: #D4AF37; }

/* Search bar */
.search-wrapper {
  position: relative;
  margin-bottom: 16px;
}

/* Detail modal overlay */
.entry-detail-panel {
  background: linear-gradient(135deg, #132235, #1A2F45);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 14px;
  padding: 20px;
}

.entry-detail-title {
  font-family: Georgia, serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #D4AF37;
  text-shadow: 0 0 12px rgba(212,175,55,0.35);
  margin-bottom: 16px;
}

/* Stats ranking panel */
.stats-rank-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 6px;
  font-size: 0.84rem;
  color: #E8D5A3;
}

.stats-rank-position {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #D4AF37;
  min-width: 24px;
  font-size: 0.9rem;
}

/* ══════════════════════════════════════════
   Player Position Card  (.pp-*)
   ══════════════════════════════════════════ */

.pp-card {
  background: #172D48;
  border: 1px solid rgba(212,175,55,0.45);
  border-radius: 14px;
  overflow: hidden;
}

.pp-top-accent {
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #D4AF37 30%, #FFD700 50%, #D4AF37 70%, transparent 100%);
}

.pp-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(10,22,40,0.6) 0%, rgba(212,175,55,0.06) 100%);
  border-bottom: 1px solid rgba(212,175,55,0.15);
}

.pp-title {
  font-family: Georgia, serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #D4AF37;
  margin: 0;
  letter-spacing: 0.07em;
  text-shadow: 0 0 16px rgba(212,175,55,0.3);
}

.pp-subtitle {
  font-size: 0.78rem;
  color: #8B9DC3;
  margin: 3px 0 0;
}

/* Body layout */
.pp-body {
  display: flex;
  gap: 28px;
  padding: 22px 24px;
  align-items: flex-start;
}

.pp-poster-col {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.pp-info-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Big rank number */
.pp-rank-row {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.pp-rank-hash {
  font-family: Georgia, serif;
  font-size: 2rem;
  font-weight: 700;
  color: rgba(212,175,55,0.45);
  line-height: 1;
}

.pp-rank-num {
  font-family: Georgia, serif;
  font-size: 3.6rem;
  font-weight: 700;
  color: #D4AF37;
  line-height: 1;
  text-shadow: 0 0 28px rgba(212,175,55,0.45);
}

/* Stats 2×2 grid */
.pp-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.pp-stat-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  transition: border-color 0.2s ease;
}

.pp-stat-box:hover {
  border-color: rgba(212,175,55,0.28);
}

.pp-stat-val {
  font-family: Georgia, serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #F0E6D8;
  margin: 0;
}

.pp-stat-lbl {
  font-size: 0.67rem;
  color: #8B9DC3;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 0;
}

/* Progress */
.pp-progress-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pp-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #B0BFDA;
}

/* Achievement */
.pp-achievement {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(212,175,55,0.07);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 10px;
  padding: 12px 16px;
}

.pp-ach-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #F0E6D8;
  margin: 0 0 2px;
}

.pp-ach-desc {
  font-size: 0.78rem;
  color: #B0BFDA;
  margin: 0;
}

/* Responsive */
@media (max-width: 600px) {
  .pp-body       { flex-direction: column; align-items: center; }
  .pp-info-col   { width: 100%; }
  .pp-rank-num   { font-size: 2.8rem; }
  .pp-stats-grid { grid-template-columns: repeat(2, 1fr); }
}

/* ── Legendary Weapons Tab ───────────────────────────────────────── */

/* Class section header */
.leg-class-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-left: 3px solid;
  background: rgba(255,255,255,0.03);
  border-radius: 0 8px 8px 0;
  margin-bottom: 8px;
}

.leg-class-header-cls {
  font-family: Georgia, serif;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.leg-class-header-label {
  font-size: 0.75rem;
  color: #8B9DC3;
  flex: 1;
}

.leg-class-header-count {
  font-size: 0.72rem;
  font-weight: 600;
  opacity: 0.85;
}

.leg-weapon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.leg-weapon-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(212,175,55,0.15);
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color 0.2s ease, background 0.2s ease;
  cursor: default;
}

.leg-weapon-row:hover {
  background: rgba(212,175,55,0.05);
  border-color: rgba(212,175,55,0.35);
}

/* Rank number column */
.leg-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
}

.leg-rank-num {
  font-family: Georgia, serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #D4AF37;
}

/* Weapon icon */
.leg-weapon-icon {
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

/* Main info column */
.leg-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.leg-weapon-name {
  font-family: Georgia, serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #F0E6D8;
}

.leg-weapon-sub {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.leg-class-badge {
  display: inline-block;
  background: linear-gradient(135deg, #D4AF37, #B8860B);
  color: #0D1B2E;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 1px 7px;
  border-radius: 999px;
  line-height: 1.5;
}

.leg-equipped-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(102,187,106,0.15);
  border: 1px solid rgba(102,187,106,0.4);
  color: #66BB6A;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
  line-height: 1.5;
}

.leg-subtype-badge {
  display: inline-block;
  background: rgba(139,157,195,0.12);
  border: 1px solid rgba(139,157,195,0.25);
  color: #8B9DC3;
  font-size: 0.62rem;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 999px;
  line-height: 1.5;
  text-transform: capitalize;
}

.leg-chest-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(139,157,195,0.12);
  border: 1px solid rgba(139,157,195,0.3);
  color: #8B9DC3;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 999px;
  line-height: 1.5;
}

.leg-char-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #E8D5A3;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.leg-char-meta {
  font-size: 0.72rem;
  color: #8B9DC3;
  font-weight: 400;
}

.leg-crew-name {
  font-size: 0.75rem;
  color: #8B9DC3;
}

.leg-lore {
  font-size: 0.73rem;
  color: #6B7FAA;
  font-style: italic;
  margin-top: 2px;
  line-height: 1.4;
}

/* Stats column */
.leg-stats {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-end;
  min-width: 90px;
}

.leg-stat-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
}

.leg-stat-val {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #D4AF37;
  min-width: 34px;
  text-align: right;
}

@media (max-width: 600px) {
  .leg-weapon-row { flex-wrap: wrap; }
  .leg-stats      { align-items: flex-start; min-width: unset; }
}
</style>