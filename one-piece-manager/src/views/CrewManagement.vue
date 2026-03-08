<!-- src/views/CrewManagement.vue -->
<template>
  <div class="crew-management-container">
    
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
              
              <div class="text-h6 mb-4">Carregando Tripulação</div>
              
              <!-- PROGRESSO DETALHADO -->
              <div class="loading-steps">
                <div class="step-item" :class="{ 'completed': playerCharacterLoaded }">
                  <v-icon :color="playerCharacterLoaded ? 'success' : 'grey'">
                    {{ playerCharacterLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Capitão</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': playerCrewLoaded }">
                  <v-icon :color="playerCrewLoaded ? 'success' : 'grey'">
                    {{ playerCrewLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Crew</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': crewMembersLoaded }">
                  <v-icon :color="crewMembersLoaded ? 'success' : 'grey'">
                    {{ crewMembersLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Membros</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': shipLoaded }">
                  <v-icon :color="shipLoaded ? 'success' : 'grey'">
                    {{ shipLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Navio</span>
                </div>

                <div class="step-item" :class="{ 'completed': styleLoaded }">
                  <v-icon :color="styleLoaded ? 'success' : 'grey'">
                    {{ styleLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon> 
                  <span>Carregando Estilos</span>
                </div>

                <div class="step-item" :class="{ 'completed': devilFruitLoaded }">
                  <v-icon :color="devilFruitLoaded ? 'success' : 'grey'">
                    {{ devilFruitLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon> 
                  <span>Carregando Akumas no mi</span>
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
              <v-icon left size="large">mdi-account-group</v-icon>
              GERENCIAMENTO DE TRIPULAÇÃO
            </v-card-title>
            <v-card-subtitle class="text-center">
              Gerencie sua tripulação e veja informações detalhadas de cada membro
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- INFORMAÇÕES GERAIS DA TRIPULAÇÃO -->
      <v-row>
        <v-col cols="12">
          <v-card variant="elevated" class="mb-4" color="blue-lighten-5">
            <v-card-title class="text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-ship-wheel</v-icon>
              {{ playerCrew?.name || 'Tripulação' }}
            </v-card-title>
            <v-card-text class="pa-4">
              
              <!-- ESTATÍSTICAS GERAIS -->
              <v-row class="mb-4">
                <v-col cols="12" md="2">
                  <v-card variant="outlined" color="green-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="green-darken-2">mdi-account-multiple</v-icon>
                      <div class="text-h6 mt-1 text-green-darken-3">{{ totalMembers }}</div>
                      <div class="text-caption">Total de Membros</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="purple-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="purple-darken-2">mdi-flash</v-icon>
                      <div class="text-h6 mt-1 text-purple-darken-3">{{ totalCrewPower }}</div>
                      <div class="text-caption">Poder Total</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="2">
                  <v-card variant="outlined" color="orange-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="orange-darken-2">mdi-chart-line</v-icon>
                      <div class="text-h6 mt-1 text-orange-darken-3">{{ averageLevel }}</div>
                      <div class="text-caption">Level Médio</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="red-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="red-darken-2">mdi-treasure-chest</v-icon>
                      <div class="text-h6 mt-1 text-red-darken-3">{{ formatBounty(totalBounty) }}</div>
                      <div class="text-caption">Bounty Total</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="2">
                  <v-card variant="outlined" color="amber-darken-1">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="30" color="amber-darken-2">mdi-cash-multiple</v-icon>
                      <div class="text-h6 mt-1 text-amber-darken-3">{{ formatBounty(playerCrew.treasury) }}</div>
                      <div class="text-caption">Treasure Total</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- INFORMAÇÕES DA ILHA ATUAL -->
              <v-card variant="outlined" color="blue-darken-1" class="mb-4">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center">
                    <v-icon color="blue-darken-2" class="mr-2">mdi-island</v-icon>
                    <div>
                      <div class="text-h6 text-blue-darken-3">Localização Atual</div>
                      <div class="text-body-2">{{ currentIslandName || 'Carregando...' }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              
              <!-- ✅ INFORMAÇÕES DO NAVIO CORRIGIDAS -->
              <v-card variant="outlined" color="cyan-darken-1">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-icon color="cyan-darken-2" class="mr-2">mdi-ferry</v-icon>
                      <div>
                        <div class="text-h6 text-cyan-darken-3">
                          {{ playerShip?.name || 'Navio Desconhecido' }}
                        </div>
                        <div class="text-body-2 mb-1">
                          <v-chip 
                            :color="getShipLevelColor(playerShip?.level || 1)" 
                            size="small" 
                            class="mr-2"
                          >
                            Level {{ playerShip?.level || 1 }}
                          </v-chip>
                          <span>{{ getShipLevelName(playerShip?.level || 1) }}</span>
                        </div>
                        <div class="text-body-2">
                          <v-icon size="16" class="mr-1">mdi-account-group</v-icon>
                          {{ totalMembers }}/{{ maxCrewCapacity }} Tripulantes
                          <v-progress-linear
                            :model-value="(totalMembers / maxCrewCapacity) * 100"
                            :color="getCapacityColor(totalMembers, maxCrewCapacity)"
                            height="4"
                            class="mt-1"
                            rounded
                          ></v-progress-linear>
                        </div>
                      </div>
                    </div>
                    
                    <!-- BOTÃO DE UPGRADE CORRIGIDO -->
                    <div>
                      <v-btn
                        :disabled="!canUpgradeShip"
                        :loading="isUpgrading"
                        color="cyan-darken-2"
                        variant="elevated"
                        @click="openUpgradeModal"
                        size="small"
                      >
                        <v-icon left size="16">mdi-arrow-up-bold</v-icon>
                        {{ isUpgrading ? 'Melhorando...' : 'Melhorar Navio' }}
                      </v-btn>
                    </div>
                  </div>
                  
                  <!-- STATUS DO NAVIO -->
                  <div v-if="playerShip?.needRepair" class="mt-2">
                    <v-alert
                      type="warning"
                      density="compact"
                      variant="tonal"
                    >
                      <v-icon left>mdi-wrench</v-icon>
                      Navio precisa de reparos
                    </v-alert>
                  </div>
                  
                  <!-- ✅ PROGRESSO DO UPGRADE CORRIGIDO -->
                  <div v-if="isUpgrading && upgradeTask" class="mt-3">
                    <div class="text-body-2 mb-2">
                      <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
                      {{ upgradeTask.description }}
                    </div>
                    <v-progress-linear
                      :model-value="upgradeProgress"
                      color="cyan-darken-2"
                      height="8"
                      rounded
                    >
                      <template v-slot:default="{ value }">
                        <small class="text-white">{{ Math.ceil(value) }}%</small>
                      </template>
                    </v-progress-linear>
                    <div class="text-caption mt-1 text-center">
                      Tempo restante: {{ formattedTimeRemaining }}
                    </div>
                    
                    <!-- BOTÃO CANCELAR -->
                    <v-btn
                      color="red-darken-2"
                      variant="outlined"
                      size="small"
                      class="mt-2"
                      @click="handleCancelUpgrade"
                    >
                      <v-icon left size="16">mdi-stop</v-icon>
                      Cancelar Upgrade
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
              
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- ALIANÇAS -->
      <v-row>
        <v-col cols="12">
          <v-card variant="elevated" class="mb-4 alliance-card">
            <v-card-title style="background: linear-gradient(135deg,#1A3A5C,#1565C0);" class="d-flex align-center py-3 px-4">
              <v-icon color="#D4AF37" class="me-2">mdi-handshake</v-icon>
              <span class="text-white font-weight-bold">ALIANÇAS</span>
              <v-spacer />
              <v-btn
                size="small"
                variant="tonal"
                color="white"
                prepend-icon="mdi-plus"
                @click="openAllianceModal"
              >
                Nova Aliança
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-3">
              <!-- Active alliances list -->
              <div v-if="activeAlliances.length > 0">
                <div
                  v-for="alliance in activeAlliances"
                  :key="alliance.id"
                  class="alliance-row d-flex align-center gap-2 pa-2 mb-2 rounded"
                >
                  <v-chip
                    :color="alliance.type === 'permanent' ? '#D4AF37' : '#1565C0'"
                    size="small"
                    variant="tonal"
                  >
                    {{ alliance.type === 'permanent' ? 'Permanente' : 'Temporária' }}
                  </v-chip>
                  <span class="alliance-crew-name">{{ allianceCrewName(alliance.alliedCrewId) }}</span>
                  <v-spacer />
                  <v-btn
                    size="x-small"
                    color="error"
                    variant="tonal"
                    @click="dissolveAlliance(alliance.id!)"
                  >
                    Encerrar
                  </v-btn>
                </div>
              </div>

              <!-- Betrayed alliances notification -->
              <div v-if="allAlliancesList.filter(a => a.status === 'betrayed').length > 0">
                <v-alert type="error" density="compact" class="mb-2" variant="tonal">
                  <span v-for="a in allAlliancesList.filter(a => a.status === 'betrayed')" :key="a.id">
                    ⚠️ {{ allianceCrewName(a.alliedCrewId) }} traiu a aliança!
                  </span>
                </v-alert>
              </div>

              <p v-if="activeAlliances.length === 0 && allAlliancesList.filter(a => a.status === 'betrayed').length === 0" class="text-medium-emphasis text-body-2 ma-0 py-1">
                Nenhuma aliança ativa. Proponha uma aliança com crews da mesma ilha.
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- MODAL: PROPOR ALIANÇA -->
      <v-dialog v-model="showAllianceModal" max-width="600" scrollable>
        <v-card>
          <v-card-title style="background: linear-gradient(135deg,#1A3A5C,#1565C0);" class="text-white py-3 px-4 d-flex align-center">
            <v-icon class="me-2">mdi-handshake</v-icon>
            Propor Aliança
            <v-spacer />
            <v-icon @click="showAllianceModal = false" style="cursor:pointer">mdi-close</v-icon>
          </v-card-title>

          <v-card-text class="pa-4">
            <!-- Empty state -->
            <div v-if="eligibleAllies.length === 0" class="text-center py-6">
              <v-icon size="48" color="#546E7A" class="mb-3">mdi-anchor-off</v-icon>
              <p class="text-medium-emphasis">Nenhuma crew elegível na mesma ilha.</p>
              <p class="text-caption text-medium-emphasis">Navegue para uma ilha com crews compatíveis.</p>
            </div>

            <div v-else>
              <!-- Tipo de aliança -->
              <div class="ally-type-selector mb-4">
                <div class="ally-type-label mb-2">Tipo de aliança:</div>
                <div class="d-flex gap-3">
                  <div
                    class="ally-type-card"
                    :class="{ 'ally-type-selected': selectedAllianceType === 'temporary' }"
                    @click="selectedAllianceType = 'temporary'"
                  >
                    <v-icon size="20" color="#1565C0" class="mb-1">mdi-clock-time-four-outline</v-icon>
                    <div class="ally-type-name">Temporária</div>
                    <div class="ally-type-desc">2 horas</div>
                  </div>
                  <div
                    class="ally-type-card"
                    :class="{ 'ally-type-selected': selectedAllianceType === 'permanent' }"
                    @click="selectedAllianceType = 'permanent'"
                  >
                    <v-icon size="20" color="#D4AF37" class="mb-1">mdi-infinity</v-icon>
                    <div class="ally-type-name">Permanente</div>
                    <div class="ally-type-desc">Risco de traição</div>
                  </div>
                </div>
                <v-alert v-if="selectedAllianceType === 'permanent'" type="warning" density="compact" variant="tonal" class="mt-2">
                  Alianças permanentes podem ser traídas a qualquer momento!
                </v-alert>
              </div>

              <!-- Lista de crews como cards com capitão -->
              <div class="ally-type-label mb-2">Selecione uma crew:</div>
              <div class="ally-crew-list">
                <div
                  v-for="entry in eligibleAllyCaptains"
                  :key="entry.crew.id"
                  class="ally-crew-card"
                  :class="{ 'ally-crew-selected': selectedAllyId === entry.crew.id }"
                  @click="selectedAllyId = entry.crew.id ?? null"
                >
                  <!-- Selection indicator -->
                  <div class="ally-select-dot">
                    <v-icon
                      size="18"
                      :color="selectedAllyId === entry.crew.id ? '#D4AF37' : '#546E7A'"
                    >
                      {{ selectedAllyId === entry.crew.id ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                    </v-icon>
                  </div>

                  <!-- Captain avatar placeholder -->
                  <div class="ally-avatar" :style="{ background: crewTypeGradient(entry.crew.type) }">
                    <v-icon size="26" color="white">{{ crewTypeIcon(entry.crew.type) }}</v-icon>
                  </div>

                  <!-- Info -->
                  <div class="ally-info">
                    <div class="ally-crew-name">{{ entry.crew.name }}</div>
                    <div class="ally-captain-name" v-if="entry.captain">
                      <v-icon size="12" color="#D4AF37" class="me-1">mdi-crown</v-icon>
                      {{ entry.captain.name }} · Lv {{ entry.captain.level }}
                    </div>
                    <div class="d-flex align-center gap-2 mt-1 flex-wrap">
                      <v-chip size="x-small" :color="crewTypeColor(entry.crew.type)" variant="tonal">
                        {{ entry.crew.type }}
                      </v-chip>
                      <span class="ally-stat-text">
                        <v-icon size="11" color="#D4AF37">mdi-star</v-icon>
                        {{ entry.crew.reputation?.toLocaleString() ?? 0 }} rep
                      </span>
                    </div>
                  </div>

                  <!-- Betrayal risk -->
                  <div class="ally-betrayal">
                    <div class="ally-betrayal-label">Risco traição</div>
                    <div
                      class="ally-betrayal-val"
                      :class="betrayalRiskClass(entry.crew)"
                    >
                      {{ estimatedBetrayalPercent(entry.crew) }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="pa-3 border-top">
            <v-btn variant="text" @click="showAllianceModal = false">Cancelar</v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              variant="elevated"
              :loading="proposingAlliance"
              :disabled="!selectedAllyId || eligibleAllies.length === 0"
              @click="proposeAlliance"
            >
              <v-icon start>mdi-handshake</v-icon>
              Confirmar Aliança
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- CAPITÃO (JOGADOR) -->
      <v-row>
        <v-col cols="12">
          <v-card variant="elevated" class="mb-4" color="yellow-lighten-5">
            <v-card-title class="text-yellow-darken-4">
              <v-icon left color="yellow-darken-4">mdi-crown</v-icon>
              👑 CAPITÃO
            </v-card-title>
            <v-card-text class="pa-4" v-if="playerCharacter">
              <CrewMemberCard
                :member="playerCharacter"
                :is-captain="true"
                :style="styleCombat(playerCharacter.styleCombatId)"
                :devil-fruit="devilFruit(playerCharacter.devilFruitId) as DevilFruit"
                :item-bonuses="memberItemBonuses.get(playerCharacter.id!)"
                @member-click="showMemberDetails"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- MEMBROS DA TRIPULAÇÃO -->
      <v-row v-if="crewMembers.length > 0">
        <v-col cols="12">
          <v-card variant="elevated" class="mb-4" color="green-lighten-5">
            <v-card-title class="text-green-darken-3">
              <v-icon left color="green-darken-3">mdi-account-group</v-icon>
              👥 MEMBROS DA TRIPULAÇÃO ({{ crewMembers.length }} / {{ maxCrewCapacity - 1 }})
            </v-card-title>
            <v-card-text class="pa-4">
              
              <!-- FILTROS E ORDENAÇÃO -->
              <v-row class="mb-4">
                <v-col cols="12" md="4">
                  <v-select
                    v-model="selectedTypeFilter"
                    :items="typeFilterOptions"
                    label="Filtrar por Tipo"
                    variant="outlined"
                    density="compact"
                    clearable
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-filter</v-icon>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="selectedPositionFilter"
                    :items="positionFilterOptions"
                    label="Filtrar por Posição"
                    variant="outlined"
                    density="compact"
                    clearable
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-account-tie</v-icon>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="sortBy"
                    :items="sortOptions"
                    label="Ordenar por"
                    variant="outlined"
                    density="compact"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-sort</v-icon>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
              
              <!-- GRID DE MEMBROS -->
              <v-row>
                <v-col 
                  v-for="member in filteredAndSortedMembers" 
                  :key="member.id" 
                  cols="12" 
                  lg="6" 
                  xl="4"
                  xs="12"
                >
                  <CrewMemberCard
                    :member="member"
                    :is-captain="false"
                    :style="styleCombat(member.styleCombatId)"
                    :devil-fruit="devilFruit(member.devilFruitId) as DevilFruit"
                    :item-bonuses="memberItemBonuses.get(member.id!)"
                    @member-click="showMemberDetails"
                  />
                </v-col>
              </v-row>
              
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- ESTADO VAZIO -->
      <v-row v-else>
        <v-col cols="12">
          <v-card variant="elevated" class="text-center pa-8">
            <v-icon size="80" color="grey" class="mb-4">mdi-account-off</v-icon>
            <div class="text-h6 mb-2">Nenhum membro na tripulação</div>
            <div class="text-body-2 mb-4">
              Explore o mundo e recrute novos companheiros para sua tripulação!
            </div>
            <v-btn color="primary" size="large" @click="$router.push('/adventure')" variant="elevated">
              <v-icon left>mdi-compass</v-icon>
              Procurar Aventuras
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
      
    </div>
    
    <!-- MODAL DE DETALHES DO MEMBRO -->
    <v-dialog v-model="showDetailsModal" max-width="800">
      <MemberDetailsModal
        v-if="selectedMember"
        :member="selectedMember"
        :is-captain="selectedMember.id === playerCharacter?.id"
        :style="styleCombat(selectedMember.styleCombatId)"
        :devil-fruit="devilFruit(selectedMember.devilFruitId) as DevilFruit"
        :item-bonuses="memberItemBonuses.get(selectedMember.id!)"
        @remove-member="handleRemoveMember"
        @close="closeDetailsModal"
      />
    </v-dialog>
    
    <!-- ✅ MODAL DE UPGRADE DO NAVIO -->
    <v-dialog v-model="showUpgradeModal" max-width="500">
      <ShipUpgradeModal
        v-if="playerShip"
        :ship="playerShip"
        :ship-factor="characterStore.shipFactor"
        :can-upgrade="canUpgradeShip"
        @confirm="confirmUpgrade"
        @close="closeUpgradeModal"
      />
    </v-dialog>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { IslandExplorationSystem } from '@/utils/islandExplorationSystem'
import { ShipUpgradeSystem } from '@/utils/shipUpgradeSystem'
import { useShipUpgrade } from '@/composables/useShipUpgrade'
import { GameLogic } from '@/utils/gameLogic'
import { db } from '@/utils/database'
import CrewMemberCard from '@/components/CrewMemberCard.vue'
import { InventorySystem } from '@/utils/inventorySystem'
import MemberDetailsModal from '@/components/MemberDetailsModal.vue'
import ShipUpgradeModal from '@/components/ShipUpgradeModal.vue'
import { RecruitmentSystem } from '@/utils/recruitmentSystem'
import { AllianceSystem } from '@/utils/allianceSystem'
import type { Character, Ship, DevilFruit, StyleCombat, Task, Alliance, Crew } from '@/utils/database'

const characterStore = useCharacterStore()

// 🔄 LOADING STATES
const playerCharacterLoaded = ref(false)
const playerCrewLoaded = ref(false)
const crewMembersLoaded = ref(false)
const shipLoaded = ref(false)
const styleLoaded = ref(false)
const devilFruitLoaded = ref(false)
const canUpgradeLoaded = ref(false)
const composableInitialized = ref(false)

// 🎯 REACTIVE DATA
const crewMembers = ref<Character[]>([])
const currentIslandName = ref('')
const selectedMember = ref<Character | null>(null)
const showDetailsModal = ref(false)
const playerShip = ref<Ship | null>(null)
const availableStyleCombat = ref<StyleCombat[]>([])
const availableDevilFruit = ref<DevilFruit[]>([])

// 🚢 SHIP UPGRADE DATA
const showUpgradeModal = ref(false)

// ✅ SHIP UPGRADE COMPOSABLE - REFS PARA CONTROLE MANUAL
const shipUpgradeTask = ref<Task | null>(null)
const shipIsUpgrading = ref(false)
const shipUpgradeProgress = ref(0)
const shipTimeRemaining = ref(0)
const shipFormattedTimeRemaining = ref('0m 0s')
const shipCanUpgrade = ref(false)

// ✅ COMPOSABLE INSTANCE
let shipUpgradeComposable: ReturnType<typeof useShipUpgrade> | null = null

// 🗡️ ITEM BONUSES (mapa memberId → bonuses)
const memberItemBonuses = ref<Map<number, Record<string, number>>>(new Map())

// 🤝 ALLIANCES
const activeAlliances = ref<Alliance[]>([])
const allAlliancesList = ref<Alliance[]>([])
const eligibleAllies = ref<Crew[]>([])
const showAllianceModal = ref(false)
const selectedAllyId = ref<number | null>(null)
const selectedAllianceType = ref<'temporary' | 'permanent'>('temporary')
const proposingAlliance = ref(false)
const allianceCrewNames = ref<Map<number, string>>(new Map())
const eligibleAllyCaptains = ref<{ crew: Crew; captain: Character | null }[]>([])

// 🎛️ FILTROS E ORDENAÇÃO
const selectedTypeFilter = ref<string | null>(null)
const selectedPositionFilter = ref<string | null>(null)
const sortBy = ref('power')

// 📊 COMPUTED
const playerCharacter = computed(() => characterStore.playerCharacter)
const playerCrew = computed(() => characterStore.playerCrew)

const allDataLoaded = computed(() => {
  return playerCharacterLoaded.value && 
         playerCrewLoaded.value && 
         crewMembersLoaded.value && 
         shipLoaded.value && 
         styleLoaded.value && 
         canUpgradeLoaded.value && 
         devilFruitLoaded.value &&
         composableInitialized.value
})

const totalMembers = computed(() => {
  return crewMembers.value.length + 1 // +1 para o capitão
})

const maxCrewCapacity = computed(() => {
  if (!playerShip.value) return 3
  const baseCapacity = playerShip.value.level * characterStore.shipFactor
  return Math.max(3, baseCapacity)
})

const totalCrewPower = computed(() => {
  let total = 0
  if (playerCharacter.value) {
    total += GameLogic.calculatePower(playerCharacter.value)
  }
  crewMembers.value.forEach(member => {
    total += GameLogic.calculatePower(member)
  })
  return total
})

const activeTasks = ref<Task[]>([])
const nextTaskToComplete = computed(() => {
  if (activeTasks.value.length === 0) return null
  
  return activeTasks.value
    .filter(task => !task.isCompleted)
    .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())[0]
})

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
  }
}

const averageLevel = computed(() => {
  let totalLevel = 0
  let count = 0
  
  if (playerCharacter.value) {
    totalLevel += playerCharacter.value.level
    count++
  }
  
  crewMembers.value.forEach(member => {
    totalLevel += member.level
    count++
  })
  
  return count > 0 ? Math.round(totalLevel / count) : 0
})

const totalBounty = computed(() => {
  let total = 0
  if (playerCharacter.value) {
    total += playerCharacter.value.bounty
  }
  crewMembers.value.forEach(member => {
    total += member.bounty
  })
  return total
})

// ✅ COMPUTED PARA SHIP UPGRADE (MANUAL)
const upgradeTask = computed(() => shipUpgradeTask.value)
const isUpgrading = computed(() => shipIsUpgrading.value)
const upgradeProgress = computed(() => shipUpgradeProgress.value)
const timeRemaining = computed(() => shipTimeRemaining.value)
const formattedTimeRemaining = computed(() => shipFormattedTimeRemaining.value)

// ✅ COMPUTED PRINCIPAL PARA UPGRADE
const canUpgradeShip = computed(() => {
  if (!playerShip.value || !playerCharacter.value || !composableInitialized.value) {
    console.log('🔧 Dados não disponíveis para upgrade:', {
      ship: !!playerShip.value,
      character: !!playerCharacter.value,
      composable: composableInitialized.value
    })
    return false
  }

  const shipNotUpgrading = !shipIsUpgrading.value
  const shipNotMaxLevel = playerShip.value.level < 5
  const captainLevelAllows = playerShip.value.level < ShipUpgradeSystem.determineShipLevel(playerCharacter.value.level)

  const canUpgrade = shipNotUpgrading && shipNotMaxLevel && captainLevelAllows

  console.log('🔧 Verificação de upgrade:', {
    shipLevel: playerShip.value.level,
    captainLevel: playerCharacter.value.level,
    maxAllowed: ShipUpgradeSystem.determineShipLevel(playerCharacter.value.level),
    shipNotUpgrading,
    shipNotMaxLevel,
    captainLevelAllows,
    finalResult: canUpgrade
  })

  return canUpgrade
})

// ✅ COMPUTED PARA DEBUG
const upgradeDebugInfo = computed(() => {
  if (!playerShip.value || !playerCharacter.value) return null
  
  return {
    shipLevel: playerShip.value.level,
    captainLevel: playerCharacter.value.level,
    maxAllowedLevel: ShipUpgradeSystem.determineShipLevel(playerCharacter.value.level),
    isUpgrading: shipIsUpgrading.value,
    composableReady: composableInitialized.value,
    canUpgrade: canUpgradeShip.value
  }
})

// ... resto dos computed existentes (typeFilterOptions, positionFilterOptions, etc.)
const typeFilterOptions = computed(() => {
  const types = new Set<string>()
  crewMembers.value.forEach(member => types.add(member.type))
  return Array.from(types).map(type => ({ title: type, value: type }))
})

const positionFilterOptions = computed(() => {
  const positions = new Set<string>()
  crewMembers.value.forEach(member => {
    if (member.position) positions.add(member.position)
  })
  return Array.from(positions).map(position => ({ title: position, value: position }))
})

const sortOptions = [
  { title: 'Poder (Maior → Menor)', value: 'power' },
  { title: 'Poder (Menor → Maior)', value: 'power_asc' },
  { title: 'Level (Maior → Menor)', value: 'level' },
  { title: 'Level (Menor → Maior)', value: 'level_asc' },
  { title: 'Bounty (Maior → Menor)', value: 'bounty' },
  { title: 'Bounty (Menor → Maior)', value: 'bounty_asc' },
  { title: 'Nome (A → Z)', value: 'name' },
  { title: 'Nome (Z → A)', value: 'name_desc' },
  { title: 'Loyalty (Maior → Menor)', value: 'loyalty' },
  { title: 'Loyalty (Menor → Maior)', value: 'loyalty_asc' }
]

const filteredAndSortedMembers = computed(() => {
  let filtered = [...crewMembers.value]
  
  if (selectedTypeFilter.value) {
    filtered = filtered.filter(member => member.type === selectedTypeFilter.value)
  }
  
  if (selectedPositionFilter.value) {
    filtered = filtered.filter(member => member.position === selectedPositionFilter.value)
  }
  
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'level':
        return b.level - a.level
      case 'level_asc':
        return a.level - b.level
      case 'power':
        return GameLogic.calculatePower(b, devilFruit(b.devilFruitId)) - GameLogic.calculatePower(a, devilFruit(a.devilFruitId))
      case 'power_asc':
        return GameLogic.calculatePower(a, devilFruit(a.devilFruitId)) - GameLogic.calculatePower(b, devilFruit(b.devilFruitId))
      case 'bounty':
        return b.bounty - a.bounty
      case 'bounty_asc':
        return a.bounty - b.bounty
      case 'name':
        return a.name.localeCompare(b.name)
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'loyalty':
        return (b.loyalty || 0) - (a.loyalty || 0)
      case 'loyalty_asc':
        return (a.loyalty || 0) - (b.loyalty || 0)
      default:
        return 0
    }
  })
  
  return filtered
})

// ✅ FUNÇÃO PARA SINCRONIZAR ESTADOS DO COMPOSABLE
const syncComposableStates = async () => {
  if (!shipUpgradeComposable) return

  shipUpgradeTask.value = shipUpgradeComposable.currentTask.value
  shipIsUpgrading.value = await shipUpgradeComposable.isUpgrading.value
  shipUpgradeProgress.value = shipUpgradeComposable.upgradeProgress.value
  shipTimeRemaining.value = shipUpgradeComposable.timeRemaining.value
  shipFormattedTimeRemaining.value = shipUpgradeComposable.formattedTimeRemaining.value
  shipCanUpgrade.value = shipUpgradeComposable.canUpgrade.value

  console.log('�� Estados sincronizados:', {
    isUpgrading: shipIsUpgrading.value,
    canUpgrade: shipCanUpgrade.value,
    progress: shipUpgradeProgress.value
  })
}

// ✅ INICIALIZAR COMPOSABLE DE SHIP UPGRADE
const initializeShipUpgradeComposable = async () => {
  if (!playerShip.value || !playerCharacter.value) {
    console.log('⚠️ Dados não disponíveis para inicializar composable')
    return
  }

  try {
    console.log('🔧 Inicializando composable de ship upgrade...')
    
    shipUpgradeComposable = useShipUpgrade(
      computed(() => playerShip.value),
      computed(() => playerCharacter.value)
    )

    // Aguardar próximo tick para garantir que o composable foi inicializado
    await nextTick()

    // Sincronizar estados iniciais
    syncComposableStates()

    // Configurar watchers para sincronização contínua
    watch(
      () => shipUpgradeComposable?.canUpgrade.value,
      (newValue) => {
        console.log('🔄 canUpgrade mudou:', newValue)
        syncComposableStates()
      },
      { immediate: true }
    )

    watch(
      () => shipUpgradeComposable?.isUpgrading.value,
      (newValue) => {
        console.log('�� isUpgrading mudou:', newValue)
        syncComposableStates()
      },
      { immediate: true }
    )

    composableInitialized.value = true
    
    console.log('✅ Composable de ship upgrade inicializado e sincronizado')
    console.log('🔧 Estado inicial:', upgradeDebugInfo.value)
    
  } catch (error) {
    console.error('❌ Erro ao inicializar composable:', error)
    composableInitialized.value = true // Marcar como inicializado mesmo com erro
  }
}

// 👀 WATCHERS
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

// ✅ WATCHER PARA RECOMPUTAR UPGRADE QUANDO DADOS MUDAREM
watch([playerShip, playerCharacter], () => {
  if (composableInitialized.value) {
    console.log('🔄 Dados do ship/character mudaram, recomputando...')
    nextTick(() => {
      syncComposableStates()
    })
  }
}, { deep: true })

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
    
    // 2. Carregar nome da ilha
    try {
      currentIslandName.value = await IslandExplorationSystem.getCurrentIsland(playerCrew.value.currentIsland)
    } catch (error) {
      console.error('❌ Erro ao carregar nome da ilha:', error)
      currentIslandName.value = 'Ilha Desconhecida'
    }
    
    // 3. Carregar dados em paralelo
    await Promise.all([
      loadCrewMembers(),
      loadPlayerShip(),
      getStyleCombats(),
      getDevilFruits(),
      loadCanUpgrade(),
      loadAlliances(),
    ])
    
    // 4. ✅ Inicializar composable APÓS todos os dados estarem carregados
    await initializeShipUpgradeComposable()
    
    console.log('✅ Todos os dados carregados!')
    
  } catch (error) {
    console.error('❌ Erro no carregamento sequencial:', error)
  }
}

// 🎮 METHODS (mantendo os existentes)
const loadCanUpgrade = async () => {
  if (playerCharacter.value && playerShip.value) {
    const result = await ShipUpgradeSystem.canUpgradeShip(playerShip.value, playerCharacter.value)
    console.log('result loadCanUpgrade:', result)
    canUpgradeLoaded.value = true
  } else {
    canUpgradeLoaded.value = true
  }
}

const loadCrewMembers = async () => {
  if (!playerCrew.value) {
    console.log('⚠️ PlayerCrew não disponível para carregar membros')
    return
  }
  
  try {
    console.log('🔄 Carregando membros da tripulação...')
    
    const members = await db.characters
      .where('crewId')
      .equals(playerCrew.value.id!)
      .and(char => char.id !== playerCharacter.value?.id)
      .toArray()
    
    crewMembers.value = members
    crewMembersLoaded.value = true

    // Carregar bônus de equipamentos de cada membro (incl. capitão)
    const allChars = playerCharacter.value ? [playerCharacter.value, ...members] : members
    const bonusMap = new Map<number, Record<string, number>>()
    await Promise.all(
      allChars.map(async (c) => {
        if (c.id) bonusMap.set(c.id, await InventorySystem.calculateItemBonuses(c))
      }),
    )
    memberItemBonuses.value = bonusMap

    console.log(`✅ ${members.length} membros da tripulação carregados`)
    
  } catch (error) {
    console.error('❌ Erro ao carregar membros da tripulação:', error)
    crewMembersLoaded.value = true
  }
}

const handleRemoveMember = async (memberId: number) => {
  try {
    console.log('🔄 Removendo membro do crew:', memberId)
    await RecruitmentSystem.removeMemberFromCrew(memberId)
    await loadCrewMembers()
    console.log('✅ Membro removido com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao remover membro:', error)
  }
}

const loadPlayerShip = async () => {
  if (!playerCrew.value) {
    console.log('⚠️ PlayerCrew não disponível para carregar navio')
    return
  }
  
  try {
    console.log('🔄 Carregando navio do jogador...')
    
    const ship = await db.ships
      .where('crewId')
      .equals(playerCrew.value.id!)
      .first()
    
    if (ship) {
      playerShip.value = ship
      console.log(`✅ Navio carregado: ${ship.name} (Level ${ship.level})`)
    } else {
      console.log('⚠️ Nenhum navio encontrado para esta tripulação')
    }
    
    shipLoaded.value = true
    
  } catch (error) {
    console.error('❌ Erro ao carregar navio:', error)
    shipLoaded.value = true
  }
}

const getStyleCombats = async () => {
  try {
    console.log('🔄 Carregando estilos...')
    const styles = await db.styleCombats.toArray()
    if (styles) {
      availableStyleCombat.value = styles
      console.log(`✅ Estilos carregados`)
    }
    styleLoaded.value = true
  } catch (error) {
    console.error('❌ Erro ao carregar estilo:', error)
    styleLoaded.value = true
  }
}

const getDevilFruits = async () => {
  try {
    console.log('🔄 Carregando akumas no mi...')
    const df = await db.devilFruits.toArray()
    if (df) {
      availableDevilFruit.value = df
      console.log(`✅ Akumas no mi carregados`)
    }
    devilFruitLoaded.value = true
  } catch (error) {
    console.error('❌ Erro ao carregar Akuma no mi:', error)
    devilFruitLoaded.value = true
  }
}

// 🚢 SHIP METHODS (mantendo os existentes)
const getShipLevelName = (level: number): string => {
  const levelNames = {
    1: 'Bote Simples',
    2: 'Navio Mercante',
    3: 'Fragata de Guerra',
    4: 'Galeão Poderoso',
    5: 'Navio Lendário'
  }
  return levelNames[level as keyof typeof levelNames] || 'Navio Desconhecido'
}

const getShipLevelColor = (level: number): string => {
  const colors = {
    1: 'grey',
    2: 'green',
    3: 'blue',
    4: 'purple',
    5: 'orange'
  }
  return colors[level as keyof typeof colors] || 'grey'
}

const getCapacityColor = (current: number, max: number): string => {
  const percentage = (current / max) * 100
  if (percentage >= 90) return 'red'
  if (percentage >= 75) return 'orange'
  if (percentage >= 50) return 'yellow'
  return 'green'
}

// ✅ SHIP UPGRADE METHODS SEGUROS
const openUpgradeModal = () => {
  console.log('🔧 Abrindo modal de upgrade. Estado atual:', upgradeDebugInfo.value)
  showUpgradeModal.value = true
}

const closeUpgradeModal = () => {
  showUpgradeModal.value = false
}

const confirmUpgrade = async () => {
  if (!shipUpgradeComposable) {
    console.error('❌ Composable de ship upgrade não inicializado')
    return
  }
  
  try {
    console.log('🔧 Confirmando upgrade do navio...')
    closeUpgradeModal()
    
    const success = await shipUpgradeComposable.startUpgrade()
    
    if (success) {
      console.log('✅ Upgrade iniciado com sucesso!')
      syncComposableStates() // Sincronizar estados após iniciar
    } else {
      console.error('❌ Falha ao iniciar upgrade')
    }
    
  } catch (error) {
    console.error('❌ Erro ao confirmar upgrade:', error)
  }
}

const handleCancelUpgrade = async () => {
  if (!shipUpgradeComposable) {
    console.error('❌ Composable de ship upgrade não inicializado')
    return
  }
  
  try {
    console.log('🛑 Cancelando upgrade...')
    
    const success = await shipUpgradeComposable.cancelUpgrade()
    
    if (success) {
      console.log('✅ Upgrade cancelado com sucesso!')
      syncComposableStates() // Sincronizar estados após cancelar
    } else {
      console.error('❌ Falha ao cancelar upgrade')
    }
    
  } catch (error) {
    console.error('❌ Erro ao cancelar upgrade:', error)
  }
}

// ... resto dos métodos existentes (showMemberDetails, styleCombat, etc.)
const showMemberDetails = (member: Character) => {
  selectedMember.value = member
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedMember.value = null
}

const styleCombat = (combat: number): string => {
  return availableStyleCombat.value.find(comb => comb.id === combat)?.name || 'Desconhecido'
}

const devilFruit = (devilFruit: number): DevilFruit | undefined => {
  return availableDevilFruit.value.find(fruit => fruit.id === devilFruit)
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

// 🤝 ALLIANCE METHODS
const loadAlliances = async () => {
  if (!playerCrew.value?.id) return
  const crewId = playerCrew.value.id
  const [active, all, eligible] = await Promise.all([
    AllianceSystem.getActiveAlliances(crewId),
    AllianceSystem.getAllAlliances(crewId),
    AllianceSystem.getEligibleAllies(crewId),
  ])
  activeAlliances.value = active
  allAlliancesList.value = all
  eligibleAllies.value = eligible

  // Build name map for all involved crews
  const nameMap = new Map<number, string>()
  const crewIds = [...new Set([...active.map(a => a.alliedCrewId), ...all.map(a => a.alliedCrewId)])]
  await Promise.all(crewIds.map(async (id) => {
    const crew = await db.crews.get(id)
    if (crew) nameMap.set(id, crew.name)
  }))
  allianceCrewNames.value = nameMap
}

const proposeAlliance = async () => {
  if (!playerCrew.value?.id || !selectedAllyId.value) return
  proposingAlliance.value = true
  try {
    await AllianceSystem.proposeAlliance(playerCrew.value.id, selectedAllyId.value, selectedAllianceType.value)
    showAllianceModal.value = false
    selectedAllyId.value = null
    await loadAlliances()
  } catch (e: any) {
    console.error('Erro ao propor aliança:', e)
  } finally {
    proposingAlliance.value = false
  }
}

const dissolveAlliance = async (allianceId: number) => {
  await AllianceSystem.dissolveAlliance(allianceId)
  await loadAlliances()
}

const openAllianceModal = async () => {
  if (!playerCrew.value?.id) return
  const allies = await AllianceSystem.getEligibleAllies(playerCrew.value.id)
  eligibleAllies.value = allies

  // Load captain for each eligible crew for rich display
  eligibleAllyCaptains.value = await Promise.all(
    allies.map(async (crew) => {
      const captain = crew.captainId
        ? await db.characters.get(crew.captainId).catch(() => null)
        : null
      return { crew, captain: captain ?? null }
    }),
  )

  selectedAllyId.value = null
  selectedAllianceType.value = 'temporary'
  showAllianceModal.value = true
}

const allianceCrewName = (crewId: number): string => {
  return allianceCrewNames.value.get(crewId) ?? `Crew #${crewId}`
}

const allianceStatusColor = (status: Alliance['status']): string => {
  if (status === 'betrayed') return 'error'
  if (status === 'expired') return 'grey'
  return 'success'
}

const estimatedBetrayalPercent = (crew: Crew): string => {
  const repFactor = Math.min(1, (crew.reputation ?? 0) / 10000)
  const chance = 0.02 + (1 - repFactor) * 0.1
  return (chance * 100).toFixed(1)
}

const crewTypeIcon = (type: string): string => ({
  Pirate: 'mdi-skull-crossbones',
  Marine: 'mdi-anchor',
  BountyHunter: 'mdi-crosshairs',
  Government: 'mdi-shield-crown',
}[type] ?? 'mdi-account-group')

const crewTypeGradient = (type: string): string => ({
  Pirate:       'linear-gradient(135deg,#7F0000,#C62828)',
  Marine:       'linear-gradient(135deg,#0D47A1,#1976D2)',
  BountyHunter: 'linear-gradient(135deg,#4A148C,#7B1FA2)',
  Government:   'linear-gradient(135deg,#1B5E20,#388E3C)',
}[type] ?? 'linear-gradient(135deg,#37474F,#546E7A)')

const crewTypeColor = (type: string): string => ({
  Pirate: '#EF5350', Marine: '#42A5F5',
  BountyHunter: '#CE93D8', Government: '#66BB6A',
}[type] ?? '#78909C')

const betrayalRiskClass = (crew: Crew): string => {
  const pct = parseFloat(estimatedBetrayalPercent(crew))
  if (pct >= 8) return 'betrayal-high'
  if (pct >= 5) return 'betrayal-mid'
  return 'betrayal-low'
}

// 🔄 LIFECYCLE
onMounted(async () => {
  console.log('🚀 Componente CrewManagement montado, iniciando carregamento...')
  await loadDataSequentially()
  
  // ✅ LISTENER PARA CONCLUSÃO DO UPGRADE
  window.addEventListener('shipUpgradeCompleted', async (event: any) => {
    console.log('🎉 Upgrade do navio concluído!', event.detail)
    
    // Recarregar navio
    await loadPlayerShip()
    
    // Recarregar verificação de upgrade
    await loadCanUpgrade()
    
    // Sincronizar estados
    syncComposableStates()
  })
})

onUnmounted(() => {
  // Remover listeners
  window.removeEventListener('shipUpgradeCompleted', () => {})
})
</script>

<style scoped>
/* ============================================================
   Crew Management - Grand Line Crew HQ
   ============================================================ */

.crew-management-container {
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

/* Crew header panel */
.crew-header-panel {
  background: linear-gradient(135deg,
    rgba(212, 175, 55, 0.1),
    rgba(21, 101, 192, 0.08)
  );
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 20px;
  position: relative;
}

.crew-header-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent, #D4AF37, #FFD700, #D4AF37, transparent
  );
  border-radius: 14px 14px 0 0;
}

.crew-name {
  font-family: Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #D4AF37;
  text-shadow: 0 0 16px rgba(212, 175, 55, 0.4);
  letter-spacing: 0.04em;
}

/* Ship info card */
.ship-card {
  background: linear-gradient(135deg, #0F1E33, #132235);
  border: 1px solid rgba(21, 101, 192, 0.35);
  border-radius: 12px;
  overflow: hidden;
}

.ship-card-header {
  background: linear-gradient(135deg,
    rgba(21, 101, 192, 0.15),
    rgba(212, 175, 55, 0.05)
  );
  border-bottom: 1px solid rgba(21, 101, 192, 0.3);
  padding: 12px 16px;
}

.ship-name {
  font-family: Georgia, serif;
  color: #90CAF9;
  font-weight: 700;
  font-size: 1rem;
}

/* Member card grid */
.member-grid-card {
  background: #132235;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 14px;
  transition: all 0.25s ease;
  cursor: pointer;
  height: 100%;
}

.member-grid-card:hover {
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 14px rgba(212, 175, 55, 0.18);
  transform: translateY(-2px);
}

.member-grid-card.is-captain {
  border-color: rgba(212, 175, 55, 0.5);
  background: linear-gradient(135deg,
    rgba(212, 175, 55, 0.08),
    rgba(21, 101, 192, 0.06)
  );
}

.member-grid-name {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #E8D5A3;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.member-grid-role {
  font-size: 0.72rem;
  color: #8B9DC3;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.member-grid-level {
  font-size: 0.8rem;
  color: #D4AF37;
  font-weight: 600;
}

/* Recruitment panel */
.recruitment-panel {
  background: linear-gradient(135deg, #132235, #1A2F45);
  border: 1px solid rgba(46, 125, 50, 0.35);
  border-radius: 14px;
  overflow: hidden;
}

.recruitment-header {
  background: linear-gradient(135deg,
    rgba(46, 125, 50, 0.12),
    rgba(212, 175, 55, 0.05)
  );
  border-bottom: 1px solid rgba(46, 125, 50, 0.25);
  padding: 12px 16px;
}

.recruitment-title {
  font-family: Georgia, serif;
  color: #81C784;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}

/* Combat style badges */
.style-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid rgba(212, 175, 55, 0.3);
  background: rgba(212, 175, 55, 0.08);
  color: #D4AF37;
}

/* Alliance styles */
.alliance-card {
  border: 1px solid rgba(21, 101, 192, 0.4);
}

.alliance-row {
  background: rgba(21, 101, 192, 0.08);
  border: 1px solid rgba(21, 101, 192, 0.2);
}

.alliance-crew-name {
  font-weight: 600;
  color: #E8D5A3;
}

/* Alliance Modal — improved UX */
.ally-type-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #8B9DC3;
  text-transform: uppercase;
}

.ally-type-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 10px;
  border: 2px solid rgba(139, 157, 195, 0.2);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.ally-type-card:hover {
  background: rgba(212, 175, 55, 0.06);
  border-color: rgba(212, 175, 55, 0.3);
}

.ally-type-selected {
  border-color: #D4AF37 !important;
  background: rgba(212, 175, 55, 0.1) !important;
}

.ally-type-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #E8D5A3;
  margin-top: 2px;
}

.ally-type-desc {
  font-size: 0.7rem;
  color: #8B9DC3;
}

.ally-crew-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 340px;
  overflow-y: auto;
  padding-right: 4px;
}

.ally-crew-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 2px solid rgba(139, 157, 195, 0.15);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.ally-crew-card:hover {
  background: rgba(21, 101, 192, 0.07);
  border-color: rgba(21, 101, 192, 0.3);
}

.ally-crew-selected {
  border-color: #D4AF37 !important;
  background: rgba(212, 175, 55, 0.08) !important;
}

.ally-select-dot {
  flex-shrink: 0;
}

.ally-avatar {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ally-info {
  flex: 1;
  min-width: 0;
}

.ally-crew-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #E8D5A3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ally-captain-name {
  font-size: 0.75rem;
  color: #8B9DC3;
  margin-top: 2px;
}

.ally-stat-text {
  font-size: 0.7rem;
  color: #8B9DC3;
  display: flex;
  align-items: center;
  gap: 2px;
}

.ally-betrayal {
  flex-shrink: 0;
  text-align: center;
  min-width: 54px;
}

.ally-betrayal-label {
  font-size: 0.6rem;
  color: #546E7A;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ally-betrayal-val {
  font-size: 0.95rem;
  font-weight: 700;
}

.betrayal-low  { color: #66BB6A; }
.betrayal-mid  { color: #FFA726; }
.betrayal-high { color: #EF5350; }

.border-top {
  border-top: 1px solid rgba(139, 157, 195, 0.15);
}
</style>