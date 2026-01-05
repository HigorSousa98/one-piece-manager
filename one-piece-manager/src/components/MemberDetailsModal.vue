<template>
  <v-card class="member-details-modal">
    <v-card-title class="bg-primary text-white">
      <v-icon left class="text-white">
        {{ isCaptain ? 'mdi-crown' : 'mdi-account' }}
      </v-icon>
      {{ isCaptain ? '👑 Detalhes do Capitão' : '👥 Detalhes do Membro' }}
    </v-card-title>
    
    <v-card-text class="pa-6">
      
      <!-- ✅ WANTED POSTER HERO SECTION -->
      <div class="poster-hero-section mb-6">
        <v-card variant="elevated" class="poster-hero-card" :class="{ 'captain-poster-card': isCaptain }">
          <v-card-text class="pa-4">
            <v-row align="center">
              
              <!-- WANTED POSTER -->
              <v-col cols="12" md="6" class="text-center">
                <div class="poster-container">
                  <WantedPoster
                    :character="member"
                    size="small"
                    :show-actions="false"
                    :show-size-controls="false"
                    class="hero-poster"
                    @download-complete="onPosterDownload"
                    @share-complete="onPosterShare"
                  />
                  
                  <!-- POSTER OVERLAY BADGES -->
                  <div class="poster-overlay-badges">
                    <v-chip 
                      v-if="isCaptain" 
                      size="large"
                      color="amber"
                      variant="elevated"
                      class="captain-hero-badge"
                    >
                      <v-icon size="large" class="mr-2">mdi-crown</v-icon>
                      CAPITÃO DA TRIPULAÇÃO
                    </v-chip>
                    
                    <v-chip 
                      v-if="member.devilFruitId != 0" 
                      size="large"
                      color="teal-darken-2"
                      variant="elevated"
                      class="devil-fruit-hero-badge"
                    >
                      <v-icon size="large" class="mr-2">mdi-fruit-pineapple</v-icon>
                      USUÁRIO DE AKUMA NO MI
                    </v-chip>
                  </div>
                </div>
              </v-col>
              
              <!-- MEMBER INFO -->
              <v-col cols="12" md="5">
                <div class="hero-info">
                  <div class="hero-title mb-3">
                    <h1 class="text-h3 font-weight-bold member-hero-name mb-2">
                      {{ member.name }}
                    </h1>
                    <div class="hero-subtitle">
                      <span class="text-h6 text-medium-emphasis">
                        {{ member.position || 'Membro da Tripulação' }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- BASIC INFO CHIPS -->
                  <div class="hero-chips mb-4">
                    <v-chip :color="getTypeColor(member.type)" variant="elevated" size="large" class="hero-chip">
                      <v-icon left>{{ getTypeIconMdi(member.type) }}</v-icon>
                      {{ member.type }}
                    </v-chip>
                    <v-chip color="orange-darken-2" variant="elevated" size="large" class="hero-chip">
                      <v-icon left>mdi-star</v-icon>
                      Level {{ member.level }}
                    </v-chip>
                    <v-chip v-if="style" color="purple-darken-2" variant="elevated" size="large" class="hero-chip">
                      <v-icon left>mdi-sword</v-icon>
                      {{ style }}
                    </v-chip>
                  </div>
                  
                  <!-- POWER & BOUNTY DISPLAY -->
                  <div class="hero-stats">
                    <v-card variant="outlined" color="purple-darken-1" class="power-display-card mb-3">
                      <v-card-text class="text-center pa-3">
                        <v-icon size="40" color="purple-darken-2">mdi-flash</v-icon>
                        <div class="text-h4 mt-1 text-purple-darken-3 font-weight-bold">
                          {{ calculatePower(member) }}
                        </div>
                        <div class="text-subtitle-1 text-purple-darken-2">Poder Total</div>
                      </v-card-text>
                    </v-card>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>

      <!-- ✅ AKUMA NO MI DETALHADA -->
      <div v-if="member.devilFruitId != 0 && devilFruit" class="devil-fruit-detailed mb-6">
        <v-card variant="elevated" color="teal-lighten-5" class="devil-fruit-card">
          <v-card-title class="bg-teal-darken-2 text-white">
            <v-icon left color="white" size="28">mdi-fruit-pineapple</v-icon>
            Akuma no Mi - {{ devilFruit.name }}
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="4">
                <div class="text-center devil-fruit-info">
                  <div class="devil-fruit-icon-large mb-3">
                    <v-icon size="80" color="teal-darken-2">mdi-fruit-pineapple</v-icon>
                  </div>
                  <div class="text-h5 text-teal-darken-3 font-weight-bold mb-2">
                    {{ devilFruit.name }}
                  </div>
                  <v-chip color="teal-darken-2" variant="elevated" size="large">
                    {{ devilFruit.type }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="outlined" color="teal-darken-1" class="devil-fruit-stat-card">
                  <v-card-text class="text-center pa-4">
                    <v-icon size="40" color="teal-darken-2">mdi-flash</v-icon>
                    <div class="text-h3 mt-2 text-teal-darken-3 font-weight-bold">{{ member.stats.devilFruit }}</div>
                    <div class="text-subtitle-1 text-teal-darken-2">Poder da Fruta</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="outlined" :color="isAwakened ? 'amber-darken-1' : 'grey-lighten-2'" class="awakening-card">
                  <v-card-text class="text-center pa-4">
                    <v-icon size="40" :color="isAwakened ? 'amber-darken-3' : 'grey'">
                      {{ isAwakened ? 'mdi-star' : 'mdi-star-outline' }}
                    </v-icon>
                    <div class="text-h5 mt-2 font-weight-bold" :class="isAwakened ? 'text-amber-darken-4' : 'text-grey'">
                      {{ isAwakened ? 'DESPERTADA' : 'NÃO DESPERTADA' }}
                    </div>
                    <div class="text-subtitle-2" :class="isAwakened ? 'text-amber-darken-3' : 'text-grey'">
                      {{ isAwakened ? 'Poder Máximo Alcançado!' : `Level ${devilFruit.awakeningOn} necessário` }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>

      <!-- ✅ STATS PRINCIPAIS -->
      <div class="stats-section mb-6">
        <h2 class="text-h5 mb-4 section-title">
          <v-icon left color="primary" size="28">mdi-chart-line</v-icon>
          Estatísticas de Combate
        </h2>
        
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card variant="outlined" color="red-darken-1" class="stat-card">
              <v-card-text class="text-center pa-3">
                <v-icon size="35" color="red-darken-2">mdi-sword</v-icon>
                <div class="text-h5 mt-2 text-red-darken-3 font-weight-bold">{{ member.stats.attack }}</div>
                <div class="text-subtitle-2 text-red-darken-2">Ataque</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined" color="blue-darken-1" class="stat-card">
              <v-card-text class="text-center pa-3">
                <v-icon size="35" color="blue-darken-2">mdi-shield</v-icon>
                <div class="text-h5 mt-2 text-blue-darken-3 font-weight-bold">{{ member.stats.defense }}</div>
                <div class="text-subtitle-2 text-blue-darken-2">Defesa</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="2">
            <v-card variant="outlined" color="green-darken-1" class="stat-card">
              <v-card-text class="text-center pa-3">
                <v-icon size="35" color="green-darken-2">mdi-run-fast</v-icon>
                <div class="text-h5 mt-2 text-green-darken-3 font-weight-bold">{{ member.stats.speed }}</div>
                <div class="text-subtitle-2 text-green-darken-2">Velocidade</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="2">
            <v-card variant="outlined" color="blue-grey-darken-1" class="stat-card">
              <v-card-text class="text-center pa-3">
                <v-icon size="35" color="blue-grey-darken-2">mdi-brain</v-icon>
                <div class="text-h5 mt-2 text-blue-grey-darken-3 font-weight-bold">{{ member.stats.intelligence }}</div>
                <div class="text-subtitle-2 text-blue-grey-darken-2">Inteligência</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="2">
            <v-card variant="outlined" color="purple-darken-1" class="stat-card">
              <v-card-text class="text-center pa-3">
                <v-icon size="35" color="purple-darken-2">mdi-feather</v-icon>
                <div class="text-h5 mt-2 text-purple-darken-3 font-weight-bold">{{ member.stats.skill }}</div>
                <div class="text-subtitle-2 text-purple-darken-2">Habilidade</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- ✅ HAKI STATS -->
      <div class="haki-section mb-6" v-if="hasHakiStats">
        <h2 class="text-h5 mb-4 section-title">
          <v-icon left color="orange-darken-2" size="28">mdi-meditation</v-icon>
          Habilidades Haki
        </h2>
        
        <v-row>
          <v-col cols="12" md="4" v-if="member.stats.armHaki > 0">
            <v-card variant="outlined" color="orange-darken-1" class="haki-card armament-haki">
              <v-card-text class="text-center pa-4">
                <v-icon size="45" color="orange-darken-2">mdi-arm-flex</v-icon>
                <div class="text-h4 mt-2 text-orange-darken-3 font-weight-bold">{{ member.stats.armHaki }}</div>
                <div class="text-subtitle-1 text-orange-darken-2">Busoshoku Haki</div>
                <div class="text-caption text-orange-darken-1">Haki do Armamento</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" v-if="member.stats.obsHaki > 0">
            <v-card variant="outlined" color="purple-darken-1" class="haki-card observation-haki">
              <v-card-text class="text-center pa-4">
                <v-icon size="45" color="purple-darken-2">mdi-eye</v-icon>
                <div class="text-h4 mt-2 text-purple-darken-3 font-weight-bold">{{ member.stats.obsHaki }}</div>
                <div class="text-subtitle-1 text-purple-darken-2">Kenbunshoku Haki</div>
                <div class="text-caption text-purple-darken-1">Haki da Observação</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" v-if="member.stats.kingHaki > 0">
            <v-card variant="outlined" color="amber-darken-1" class="haki-card conqueror-haki">
              <v-card-text class="text-center pa-4">
                <v-icon size="45" color="amber-darken-3">mdi-crown</v-icon>
                <div class="text-h4 mt-2 text-amber-darken-4 font-weight-bold">{{ member.stats.kingHaki }}</div>
                <div class="text-subtitle-1 text-amber-darken-3">Haoshoku Haki</div>
                <div class="text-caption text-amber-darken-2">Haki do Rei</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
      
      <!-- ✅ LOYALTY/KINDNESS SECTION -->
      <div class="personality-section mb-6">
        <h2 class="text-h5 mb-4 section-title">
          <v-icon left color="pink-darken-2" size="28">mdi-heart</v-icon>
          {{ isCaptain ? 'Personalidade' : 'Lealdade' }}
        </h2>
        
        <v-row>
          <v-col cols="12">
            <!-- LOYALTY para membros -->
            <v-card v-if="!isCaptain && member.loyalty !== undefined" variant="outlined" :color="getLoyaltyCardColor(member.loyalty)" class="loyalty-card">
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-3">
                  <v-icon size="40" :color="getLoyaltyIconColor(member.loyalty)" class="mr-3">{{ getLoyaltyIcon(member.loyalty) }}</v-icon>
                  <div class="flex-grow-1">
                    <div class="text-h4 font-weight-bold" :class="getLoyaltyTextColor(member.loyalty)">
                      {{ member.loyalty.toFixed(1) }}
                    </div>
                    <div class="text-subtitle-1">Nível de Lealdade</div>
                  </div>
                  <div class="loyalty-status">
                    <v-chip :color="getLoyaltyIconColor(member.loyalty)" variant="elevated" size="large">
                      {{ getLoyaltyStatus(member.loyalty) }}
                    </v-chip>
                  </div>
                </div>
                
                <v-progress-linear
                  :model-value="Math.abs(member.loyalty)"
                  :color="getLoyaltyIconColor(member.loyalty)"
                  height="12"
                  class="mb-3 loyalty-progress"
                  max="100"
                  rounded
                />
                
                <div class="loyalty-description">
                  <p class="text-body-1 text-center">{{ getLoyaltyDescription(member.loyalty) }}</p>
                </div>
              </v-card-text>
            </v-card>
            
            <!-- KINDNESS para capitão -->
            <v-card v-else variant="outlined" :color="getKindnessCardColor(member.kindness)" class="kindness-card">
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-3">
                  <v-icon size="40" :color="getKindnessIconColor(member.kindness)" class="mr-3">
                    {{ getKindnessIcon(member.kindness) }}
                  </v-icon>
                  <div class="flex-grow-1">
                    <div class="text-h4 font-weight-bold" :class="getKindnessTextColor(member.kindness)">
                      {{ member.kindness }}
                    </div>
                    <div class="text-subtitle-1">Nível de Bondade</div>
                  </div>
                  <div class="kindness-status">
                    <v-chip :color="getKindnessIconColor(member.kindness)" variant="elevated" size="large">
                      {{ getKindnessStatus(member.kindness) }}
                    </v-chip>
                  </div>
                </div>
                
                <div class="kindness-description">
                  <p class="text-body-1 text-center">{{ getKindnessDescription(member.kindness) }}</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- ✅ EXPERIÊNCIA DETALHADA -->
      <div class="experience-section mb-6">
        <v-card variant="elevated" color="blue-lighten-5" class="experience-card">
          <v-card-title class="bg-blue-darken-2 text-white">
            <v-icon left color="white" size="28">mdi-trending-up</v-icon>
            Progressão de Experiência
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row align="center">
              <v-col cols="12" md="8">
                <div class="experience-info mb-3">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="text-h6 text-blue-darken-3">
                      <strong>{{ member.experience.toLocaleString() }} XP</strong>
                    </div>
                    <div class="text-h6 text-blue-darken-3">
                      <strong>{{ expForNextLevel.toLocaleString() }} XP</strong>
                    </div>
                  </div>
                  
                  <v-progress-linear
                    :model-value="experiencePercentage"
                    color="blue-darken-2"
                    height="20"
                    rounded
                    class="mb-3"
                  >
                    <template v-slot:default>
                      <strong class="text-white">{{ Math.round(experiencePercentage) }}%</strong>
                    </template>
                  </v-progress-linear>
                </div>
              </v-col>
              <v-col cols="12" md="4" class="text-center">
                <v-chip color="blue-darken-2" variant="elevated" size="large" class="exp-remaining-chip">
                  <v-icon left>mdi-target</v-icon>
                  {{ (expForNextLevel - member.experience).toLocaleString() }} XP restantes
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>

      <!-- ✅ DEBUG INFO (EXPANSÍVEL) -->
      <v-expansion-panels class="mb-4" variant="accordion" v-if="isDev">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon left>mdi-bug</v-icon>
            Dados Técnicos do Personagem
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="debug-section">
              <v-card variant="outlined" class="pa-3">
                <pre class="debug-json">{{ JSON.stringify(member, null, 2) }}</pre>
              </v-card>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      
    </v-card-text>
    
    <!-- ✅ AÇÕES DO MODAL -->
    <v-card-actions class="pa-4 bg-grey-lighten-4">
      <!-- BOTÃO REMOVER (apenas para membros, não capitão) -->
      <v-btn 
        v-if="!isCaptain" 
        color="red-darken-2" 
        @click="openRemoveConfirmation" 
        variant="outlined"
        :disabled="isRemoving"
        size="large"
      >
        <v-icon left>mdi-account-remove</v-icon>
        {{ isRemoving ? 'Removendo...' : 'Retirar do Crew' }}
      </v-btn>
      
      <v-spacer></v-spacer>
      
      <v-btn color="primary" @click="$emit('close')" variant="elevated" size="large">
        <v-icon left>mdi-close</v-icon>
        Fechar
      </v-btn>
    </v-card-actions>
    
    <!-- ✅ MODAL DE CONFIRMAÇÃO -->
    <v-dialog v-model="showRemoveConfirmation" max-width="500" persistent>
      <RemoveMemberConfirmationModal
        :member="member"
        @confirm="handleRemoveConfirmation"
        @cancel="closeRemoveConfirmation"
      />
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { GameLogic } from '@/utils/gameLogic'
import { PowerCalculationSystem } from '@/utils/powerCalculationSystem'
import RemoveMemberConfirmationModal from '@/components/RemoveMemberConfirmationModal.vue'
import type { Character, DevilFruit } from '@/utils/database'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'
import WantedPoster from '@/components/WantedPoster.vue'

interface Props {
  member: Character
  isCaptain: boolean
  style: string
  devilFruit: DevilFruit | null
}

const props = defineProps<Props>()
  const isDev = import.meta.env.DEV

const emit = defineEmits<{
  close: []
  removeMember: [memberId: number]
}>()

// ✅ REACTIVE DATA
const showRemoveConfirmation = ref(false)
const isRemoving = ref(false)

// ✅ COMPUTED
const hasHakiStats = computed(() => {
  return props.member.stats.armHaki > 0 || 
         props.member.stats.obsHaki > 0 || 
         props.member.stats.kingHaki > 0
})

const experiencePercentage = computed(() => {
  const expForNext = GameLogic.nextLevelUp(props.member)
  return (props.member.experience / expForNext) * 100
})

const expForNextLevel = computed(() => {
  return GameLogic.nextLevelUp(props.member)
})

const isAwakened = computed(() => {
  return props.devilFruit && props.member.level >= props.devilFruit.awakeningOn
})

const currentPowerRank = computed(() => {
  const power = calculatePower(props.member)
  return PowerCalculationSystem.getPowerRank(power)
})

// ✅ POSTER EVENTS
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

// ✅ REMOVE MEMBER METHODS
const openRemoveConfirmation = () => {
  showRemoveConfirmation.value = true
}

const closeRemoveConfirmation = () => {
  showRemoveConfirmation.value = false
}

const handleRemoveConfirmation = async () => {
  try {
    isRemoving.value = true
    emit('removeMember', props.member.id!)
    closeRemoveConfirmation()
    emit('close')
  } catch (error) {
    console.error('❌ Erro ao remover membro:', error)
  } finally {
    isRemoving.value = false
  }
}

// 🎮 METHODS
const calculatePower = (character: Character): number => {
  return GameLogic.calculatePower(character, props.devilFruit)
}

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

const getTypeIconMdi = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'mdi-pirate'
    case 'Marine': return 'mdi-anchor'
    case 'Government': return 'mdi-bank'
    case 'BountyHunter': return 'mdi-target'
    default: return 'mdi-account'
  }
}

const getLoyaltyCardColor = (loyalty: number): string => {
  if (loyalty >= 75) return 'green-darken-1'
  if (loyalty >= 50) return 'light-green-darken-1'
  if (loyalty >= 25) return 'blue-darken-1'
  if (loyalty >= 0) return 'blue-grey-darken-1'
  if (loyalty >= -25) return 'orange-darken-1'
  if (loyalty >= -50) return 'deep-orange-darken-1'
  return 'red-darken-1'
}

const getLoyaltyIconColor = (loyalty: number): string => {
  if (loyalty >= 75) return 'green-darken-2'
  if (loyalty >= 50) return 'light-green-darken-2'
  if (loyalty >= 25) return 'blue-darken-2'
  if (loyalty >= 0) return 'blue-grey-darken-2'
  if (loyalty >= -25) return 'orange-darken-2'
  if (loyalty >= -50) return 'deep-orange-darken-2'
  return 'red-darken-2'
}

const getLoyaltyTextColor = (loyalty: number): string => {
  if (loyalty >= 75) return 'text-green-darken-3'
  if (loyalty >= 50) return 'text-light-green-darken-3'
  if (loyalty >= 25) return 'text-blue-darken-3'
  if (loyalty >= 0) return 'text-blue-grey-darken-3'
  if (loyalty >= -25) return 'text-orange-darken-3'
  if (loyalty >= -50) return 'text-deep-orange-darken-3'
  return 'text-red-darken-3'
}

const getLoyaltyIcon = (loyalty: number): string => {
  if (loyalty >= 75) return 'mdi-heart'
  if (loyalty >= 50) return 'mdi-thumb-up'
  if (loyalty >= 25) return 'mdi-handshake'
  if (loyalty >= 0) return 'mdi-minus'
  if (loyalty >= -25) return 'mdi-thumb-down'
  if (loyalty >= -50) return 'mdi-alert'
  return 'mdi-skull'
}

const getLoyaltyStatus = (loyalty: number): string => {
  if (loyalty >= 75) return 'EXTREMAMENTE LEAL'
  if (loyalty >= 50) return 'MUITO LEAL'
  if (loyalty >= 25) return 'LEAL'
  if (loyalty >= 0) return 'NEUTRO'
  if (loyalty >= -25) return 'DESCONTENTE'
  if (loyalty >= -50) return 'HOSTIL'
  return 'REBELDE'
}

const getLoyaltyDescription = (loyalty: number): string => {
  if (loyalty >= 75) return 'Este membro é extremamente leal ao capitão e faria qualquer coisa pela tripulação.'
  if (loyalty >= 50) return 'Um membro muito confiável que sempre apoia as decisões do capitão.'
  if (loyalty >= 25) return 'Membro leal que geralmente segue as ordens sem questionar.'
  if (loyalty >= 0) return 'Neutro em relação ao capitão, mas ainda parte da tripulação.'
  if (loyalty >= -25) return 'Começando a questionar a liderança do capitão.'
  if (loyalty >= -50) return 'Claramente descontente com a direção da tripulação.'
  return 'Perigosamente próximo de se rebelar contra o capitão.'
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

const getKindnessDescription = (kindness: number): string => {
  if (kindness >= 50) return 'Um capitão bondoso e compassivo que se preocupa genuinamente com sua tripulação.'
  if (kindness >= 0) return 'Equilibrado entre bondade e firmeza, tomando decisões justas.'
  if (kindness >= -50) return 'Um capitão rigoroso mas justo, que mantém a disciplina na tripulação.'
  return 'Um capitão cruel e impiedoso que governa através do medo.'
}
</script>

<style scoped>
.member-details-modal {
  max-width: 1200px;
  margin: 0 auto;
}

/* ✅ POSTER HERO SECTION */
.poster-hero-section {
  margin-bottom: 32px;
}

.poster-hero-card {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%);
  border: 2px solid rgba(25, 118, 210, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.captain-poster-card {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.15) 100%);
  border: 3px solid rgba(255, 215, 0, 0.4);
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.2);
}

.poster-container {
  position: relative;
  display: inline-block;
}

.hero-poster {
  filter: drop-shadow(0 12px 35px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.hero-poster:hover {
  transform: scale(1.02) rotate(1deg);
  filter: drop-shadow(0 16px 45px rgba(0, 0, 0, 0.4));
}

.poster-overlay-badges {
  position: absolute;
  top: -15px;
  left: -15px;
  right: -15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 10;
}

.captain-hero-badge {
  background: linear-gradient(45deg, #FFD700, #FFA000) !important;
  color: #8B4513 !important;
  font-weight: bold !important;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4) !important;
}

.devil-fruit-hero-badge {
  background: linear-gradient(45deg, #4DB6AC, #00695C) !important;
  color: white !important;
  font-weight: bold !important;
  box-shadow: 0 6px 20px rgba(77, 182, 172, 0.4) !important;
}

.power-rank-hero-badge {
  font-weight: bold !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
}

/* ✅ HERO INFO */
.hero-info {
  padding: 16px;
}

.member-hero-name {
  color: #1565C0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  line-height: 1.1;
}

.hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-chip {
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

.bounty-display {
  display: flex;
  justify-content: center;
}

/* ✅ SECTION TITLES */
.section-title {
  color: #1565C0;
  border-bottom: 3px solid rgba(25, 118, 210, 0.3);
  padding-bottom: 8px;
  margin-bottom: 24px;
}

/* ✅ DEVIL FRUIT SECTION */
.devil-fruit-card {
  border: 3px solid #4DB6AC;
  box-shadow: 0 8px 25px rgba(77, 182, 172, 0.2);
  animation: devilFruitDetailPulse 4s ease-in-out infinite;
}

@keyframes devilFruitDetailPulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 8px 25px rgba(77, 182, 172, 0.2);
  }
  50% { 
    transform: scale(1.005);
    box-shadow: 0 12px 35px rgba(77, 182, 172, 0.3);
  }
}

.devil-fruit-icon-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(77, 182, 172, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.devil-fruit-stat-card, .awakening-card {
  transition: all 0.3s ease;
  border-width: 2px;
}

.devil-fruit-stat-card:hover, .awakening-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

/* ✅ STATS CARDS */
.stat-card {
  transition: all 0.3s ease;
  border-width: 3px;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 35px rgba(0,0,0,0.2);
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

/* ✅ HAKI CARDS */
.haki-card {
  transition: all 0.3s ease;
  border-width: 2px;
  position: relative;
}

.haki-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.armament-haki { border-color: #ef6c00; }
.observation-haki { border-color: #6a1b9a; }
.conqueror-haki { border-color: #ff8f00; }

/* ✅ LOYALTY/KINDNESS CARDS */
.loyalty-card, .kindness-card {
  border-width: 3px;
  transition: all 0.3s ease;
}

.loyalty-card:hover, .kindness-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.loyalty-progress {
  border-radius: 6px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

/* ✅ EXPERIENCE CARD */
.experience-card {
  border: 3px solid #1976D2;
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.2);
}

.exp-remaining-chip {
  font-weight: bold !important;
  font-size: 1rem !important;
  padding: 8px 16px !important;
}

/* ✅ DEBUG */
.debug-json {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  font-family: 'Courier New', monospace;
}

/* ✅ CHIPS */
.v-chip {
  font-weight: 600 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
}

/* ✅ RESPONSIVE */
@media (max-width: 768px) {
  .poster-hero-card .v-row {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-info {
    margin-top: 16px;
  }
  
  .poster-overlay-badges {
    position: static;
    flex-direction: row;
    justify-content: center;
    margin-top: 16px;
  }
  
  .hero-chips {
    justify-content: center;
  }
  
  .member-hero-name {
    font-size: 2rem;
  }
}

/* ✅ ANIMAÇÕES */
@keyframes modalEntry {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.member-details-modal {
  animation: modalEntry 0.6s ease-out;
}

@keyframes statCardPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.stat-card:hover {
  animation: statCardPulse 2s ease-in-out infinite;
}

/* ✅ CORES CUSTOMIZADAS */
.text-red-darken-3 { color: #c62828 !important; }
.text-blue-darken-3 { color: #1565c0 !important; }
.text-green-darken-3 { color: #2e7d32 !important; }
.text-orange-darken-3 { color: #ef6c00 !important; }
.text-purple-darken-3 { color: #6a1b9a !important; }
.text-amber-darken-4 { color: #ff8f00 !important; }
.text-teal-darken-3 { color: #00695c !important; }
.text-light-green-darken-3 { color: #388e3c !important; }
.text-blue-grey-darken-3 { color: #455a64 !important; }
.text-deep-orange-darken-3 { color: #d84315 !important; }
</style>