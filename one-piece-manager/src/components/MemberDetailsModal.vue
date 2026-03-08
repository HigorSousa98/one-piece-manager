<template>
  <v-card class="md-card">
    <!-- Linha decorativa de topo -->
    <div class="md-top-accent" />

    <!-- Header -->
    <div class="md-header">
      <v-icon size="20" color="primary">{{ isCaptain ? 'mdi-crown' : 'mdi-account' }}</v-icon>
      <div>
        <p class="md-title">{{ isCaptain ? 'Detalhes do Capitão' : 'Detalhes do Membro' }}</p>
      </div>
    </div>
    
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
        <h2 class="md-section-title">
          <v-icon size="16" class="me-2" color="primary">mdi-sword-cross</v-icon>
          Estatísticas de Combate
        </h2>

        <div class="md-stats-list">
          <div v-for="stat in memberCombatStats" :key="stat.key" class="md-stat-row">
            <v-icon :color="stat.color" size="18" class="md-stat-icon">{{ stat.icon }}</v-icon>
            <span class="md-stat-name">{{ stat.label }}</span>
            <div class="md-stat-bar-wrap">
              <div class="md-stat-bar" :style="{ width: mdStatPercent(stat.value) + '%', background: stat.bg }" />
              <div v-if="stat.bonus > 0" class="md-stat-bar md-stat-bar-bonus"
                :style="{ width: mdStatPercent(stat.bonus) + '%', left: mdStatPercent(stat.value) + '%' }" />
            </div>
            <span class="md-stat-val" :style="{ color: stat.color }">{{ stat.value }}<span v-if="stat.bonus > 0" class="md-stat-bonus-val">+{{ stat.bonus }}</span></span>
          </div>
        </div>
      </div>

      <!-- ✅ HAKI STATS -->
      <div class="haki-section mb-6" v-if="hasHakiStats">
        <h2 class="md-section-title">
          <v-icon size="16" class="me-2" color="blue-grey-lighten-2">mdi-wave</v-icon>
          Haki
        </h2>

        <div class="md-stats-list">
          <div v-if="member.stats.armHaki > 0" class="md-stat-row">
            <v-icon color="deep-purple-lighten-1" size="18" class="md-stat-icon">mdi-shield-sword</v-icon>
            <span class="md-stat-name">Armamento (Busoshoku)</span>
            <div class="md-stat-bar-wrap">
              <div class="md-stat-bar" :style="{ width: mdHakiPercent(member.stats.armHaki) + '%', background: 'linear-gradient(90deg,#4A148C,#AB47BC)' }" />
            </div>
            <span class="md-stat-val" style="color:#AB47BC">
              {{ member.stats.armHaki }}
              <span class="md-haki-tier" :style="{ color: GameLogic.hakiTier(member.stats.armHaki, 'arm').color }">
                · {{ GameLogic.hakiTier(member.stats.armHaki, 'arm').name }}
              </span>
            </span>
          </div>
          <div v-if="member.stats.obsHaki > 0" class="md-stat-row">
            <v-icon color="cyan-lighten-1" size="18" class="md-stat-icon">mdi-eye-circle</v-icon>
            <span class="md-stat-name">Observação (Kenbunshoku)</span>
            <div class="md-stat-bar-wrap">
              <div class="md-stat-bar" :style="{ width: mdHakiPercent(member.stats.obsHaki) + '%', background: 'linear-gradient(90deg,#006064,#26C6DA)' }" />
            </div>
            <span class="md-stat-val" style="color:#26C6DA">
              {{ member.stats.obsHaki }}
              <span class="md-haki-tier" :style="{ color: GameLogic.hakiTier(member.stats.obsHaki, 'obs').color }">
                · {{ GameLogic.hakiTier(member.stats.obsHaki, 'obs').name }}
              </span>
            </span>
          </div>
          <div v-if="member.stats.kingHaki > 0" class="md-stat-row">
            <v-icon color="amber-lighten-1" size="18" class="md-stat-icon">mdi-crown</v-icon>
            <span class="md-stat-name">Do Rei (Haoshoku)</span>
            <div class="md-stat-bar-wrap">
              <div class="md-stat-bar" :style="{ width: mdHakiPercent(member.stats.kingHaki) + '%', background: 'linear-gradient(90deg,#E65100,#FFA726)' }" />
            </div>
            <span class="md-stat-val" style="color:#FFA726">
              {{ member.stats.kingHaki }}
              <span class="md-haki-tier" :style="{ color: GameLogic.hakiTier(member.stats.kingHaki, 'king').color }">
                · {{ GameLogic.hakiTier(member.stats.kingHaki, 'king').name }}
              </span>
            </span>
          </div>
        </div>
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
    <v-divider style="border-color: rgba(212,175,55,0.2)" />
    <v-card-actions class="md-actions pa-4">
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
  itemBonuses?: Record<string, number>
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

const memberCombatStats = computed(() => {
  const s = props.member.stats
  const b = props.itemBonuses ?? {}
  return [
    { key: 'attack',       label: 'Ataque',      icon: 'mdi-sword',    color: '#EF5350', bg: 'linear-gradient(90deg,#8B0000,#EF5350)', value: s.attack       || 0, bonus: (b.attack       || 0) },
    { key: 'defense',      label: 'Defesa',       icon: 'mdi-shield',   color: '#42A5F5', bg: 'linear-gradient(90deg,#003087,#42A5F5)', value: s.defense      || 0, bonus: (b.defense      || 0) },
    { key: 'speed',        label: 'Velocidade',   icon: 'mdi-run-fast', color: '#66BB6A', bg: 'linear-gradient(90deg,#1B5E20,#66BB6A)', value: s.speed        || 0, bonus: (b.speed        || 0) },
    { key: 'intelligence', label: 'Inteligência', icon: 'mdi-brain',    color: '#AB47BC', bg: 'linear-gradient(90deg,#4A148C,#AB47BC)', value: s.intelligence || 0, bonus: (b.intelligence || 0) },
    { key: 'skill',        label: 'Habilidade',   icon: 'mdi-feather',  color: '#FFA726', bg: 'linear-gradient(90deg,#E65100,#FFA726)', value: s.skill        || 0, bonus: (b.skill        || 0) },
  ]
})

const memberMaxStat = computed(() => {
  const values = memberCombatStats.value.map(s => s.value + s.bonus)
  return values.length > 0 ? Math.max(...values) : 1
})

const mdStatPercent = (value: number) => {
  const max = memberMaxStat.value
  if (max === 0) return 0
  return Math.min(100, Math.max(0, (value / max) * 100))
}

const mdHakiPercent = (value: number) => {
  const s = props.member.stats
  const maxHaki = Math.max(s.armHaki || 0, s.obsHaki || 0, s.kingHaki || 0)
  if (maxHaki === 0) return 0
  return Math.min(100, Math.max(0, (value / maxHaki) * 100))
}

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
  return GameLogic.calculatePower(character, props.devilFruit, props.itemBonuses as any)
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
/* ============================================================
   MemberDetailsModal - Grand Line Dark Theme
   ============================================================ */

.md-card {
  background: #172D48 !important;
  border: 1px solid rgba(212,175,55,0.45) !important;
  border-radius: 14px !important;
  overflow: hidden;
}

.md-top-accent {
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #D4AF37 30%, #FFD700 50%, #D4AF37 70%, transparent 100%);
}

.md-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(10,22,40,0.6) 0%, rgba(212,175,55,0.06) 100%);
  border-bottom: 1px solid rgba(212,175,55,0.15);
}

.md-title {
  font-family: Georgia, serif;
  font-size: 1rem;
  font-weight: 700;
  color: #D4AF37;
  margin: 0;
  letter-spacing: 0.07em;
  text-shadow: 0 0 14px rgba(212,175,55,0.3);
}

/* Section labels */
.md-section-title {
  display: flex;
  align-items: center;
  font-family: Georgia, serif;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #B0BFDA;
  margin-bottom: 14px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(212,175,55,0.18);
}

/* ─── Combat stat bar rows ─── */
.md-stats-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.md-stat-row {
  display: grid;
  grid-template-columns: 22px 160px 1fr 42px;
  align-items: center;
  gap: 10px;
}

.md-stat-icon { justify-self: center; }

.md-stat-name {
  font-size: 0.83rem;
  color: #B0BFDA;
  white-space: nowrap;
}

.md-stat-bar-wrap {
  position: relative;
  height: 7px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  overflow: hidden;
}

.md-stat-bar {
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.md-stat-bar-bonus {
  background: linear-gradient(90deg, #B8860B, #FFD700) !important;
  opacity: 0.85;
}

.md-stat-val {
  font-size: 0.83rem;
  font-weight: 700;
  text-align: right;
  font-family: 'Courier New', monospace;
}

.md-stat-bonus-val {
  font-size: 0.7rem;
  color: #FFD700;
  margin-left: 2px;
}

.md-haki-tier {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-align: right;
  line-height: 1;
  margin-top: 1px;
  font-family: inherit;
}

/* Actions */
.md-actions {
  background: rgba(10,22,40,0.4);
}
</style>