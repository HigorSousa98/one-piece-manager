<!-- src/components/CrewMemberCard.vue -->
<template>
  <v-card 
    variant="elevated" 
    class="crew-member-card"
    :class="{ 'captain-card': isCaptain }"
    @click="$emit('member-click', member)"
    style="cursor: pointer;"
  >
    <v-card-text class="pa-3">
      
      <!-- HEADER DO MEMBRO COM AVATAR -->
      <div class="d-flex align-center mb-3">
        
        <!-- ✅ AVATAR DO MEMBRO -->
        <div class="avatar-section mr-3">
          <CharacterAvatar 
            :character="member"
            size="md"
            variant="circle"
            :show-actions="false"
            :show-status-indicators="true"
            :show-level="true"
            :show-power-rank="false"
            :cache-enabled="true"
            :clickable="false"
            class="member-avatar"
            :class="{ 'captain-avatar': isCaptain }"
          />
          
          <!-- INDICADORES ESPECIAIS SOBRE O AVATAR -->
          <div class="avatar-badges">
            <v-chip 
              v-if="isCaptain" 
              size="x-small"
              color="yellow-darken-3"
              variant="elevated"
              class="captain-badge"
            >
              <v-icon size="x-small">mdi-crown</v-icon>
            </v-chip>
            
            <v-chip 
              v-if="member.devilFruitId != 0" 
              size="x-small"
              color="teal-darken-3"
              variant="elevated"
              class="devil-fruit-badge"
            >
              <v-icon size="x-small">mdi-fruit-pineapple</v-icon>
            </v-chip>
          </div>
        </div>
        
        <!-- INFORMAÇÕES BÁSICAS -->
        <div class="flex-grow-1 member-info">
          <div class="text-h6 mb-1 member-name">
            {{ member.name }}
          </div>
          
          <!-- CHIPS DE INFORMAÇÃO -->
          <div class="d-flex gap-1 flex-wrap member-chips">
            <v-chip :color="getTypeColor(member.type)" size="x-small" variant="elevated">
              <strong>{{ member.type }}</strong>
            </v-chip>
            
            <v-chip color="blue-darken-2" size="x-small" variant="elevated">
              <strong>Lv.{{ member.level }}</strong>
            </v-chip>
            
            <v-chip v-if="member.position" color="green-darken-2" size="x-small" variant="elevated">
              <strong>{{ member.position }}</strong>
            </v-chip>
            
            <v-chip v-if="style" color="accent-darken-2" size="x-small" variant="elevated">
              <strong>{{ style }}</strong>
            </v-chip>
          </div>
        </div>
      </div>
      
      <!-- STATS PRINCIPAIS -->
      <v-row class="mb-3 stats-row">
        <v-col cols="4">
          <div class="stat-item">
            <v-icon size="16" color="red-darken-2">mdi-sword</v-icon>
            <span class="ml-1">{{ member.stats.attack }}</span>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="stat-item">
            <v-icon size="16" color="blue-darken-2">mdi-shield</v-icon>
            <span class="ml-1">{{ member.stats.defense }}</span>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="stat-item">
            <v-icon size="16" color="green-darken-2">mdi-run-fast</v-icon>
            <span class="ml-1">{{ member.stats.speed }}</span>
          </div>
        </v-col>
      </v-row>
      
      <!-- STATS SECUNDÁRIOS (HAKI) -->
      <v-row class="mb-3 haki-stats" v-if="hasHakiStats">
        <v-col cols="4">
          <div class="stat-item-small">
            <v-icon size="14" color="orange-darken-2">mdi-arm-flex</v-icon>
            <span class="ml-1 text-caption">{{ member.stats.armHaki }}</span>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="stat-item-small">
            <v-icon size="14" color="purple-darken-2">mdi-eye</v-icon>
            <span class="ml-1 text-caption">{{ member.stats.obsHaki }}</span>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="stat-item-small">
            <v-icon size="14" color="amber-darken-3">mdi-crown</v-icon>
            <span class="ml-1 text-caption">{{ member.stats.kingHaki }}</span>
          </div>
        </v-col>
      </v-row>
      
      <!-- PODER E BOUNTY -->
      <div class="d-flex justify-space-between align-center mb-2 power-section">
        <v-chip color="purple-darken-2" size="small" variant="elevated" class="power-chip">
          <v-icon left size="16">mdi-flash</v-icon>
          <strong>{{ calculatePower(member) }}</strong>
        </v-chip>
        
        <CharacterBountyDisplay 
          :character="member" 
          size="small" 
          variant="elevated" 
        />
      </div>
      
      <!-- DEVIL FRUIT INFO (se tiver) -->
      <div v-if="member.devilFruitId != 0 && devilFruit" class="devil-fruit-section mb-2">
        <v-card variant="outlined" color="teal-lighten-5" class="pa-2">
          <div class="d-flex align-center">
            <v-icon color="teal-darken-2" class="mr-2">mdi-fruit-pineapple</v-icon>
            <div class="flex-grow-1">
              <div class="text-caption font-weight-bold text-teal-darken-3">
                {{ devilFruit.name }}
              </div>
              <div class="text-caption text-teal-darken-2">
                {{ devilFruit.type }} • Poder: {{ member.stats.devilFruit }}
              </div>
            </div>
            <v-chip 
              v-if="member.level >= (devilFruit.awakeningOn || 999)"
              size="x-small"
              color="teal-darken-2"
              variant="elevated"
            >
              Despertada
            </v-chip>
          </div>
        </v-card>
      </div>
      
      <!-- LOYALTY (apenas para membros) -->
      <div v-if="!isCaptain && member.loyalty !== undefined" class="loyalty-section">
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-caption font-weight-medium">Lealdade:</span>
          <v-chip :color="getLoyaltyColor(member.loyalty)" size="x-small" variant="elevated">
            <v-icon size="x-small" class="mr-1">{{ getLoyaltyIcon(member.loyalty) }}</v-icon>
            <strong>{{ member.loyalty.toFixed(1) }}</strong>
          </v-chip>
        </div>
        <v-progress-linear
          :model-value="Math.abs(member.loyalty)"
          :color="getLoyaltyColor(member.loyalty)"
          height="6"
          class="loyalty-bar"
          max="100"
          min="-100"
          rounded
        ></v-progress-linear>
      </div>
      
      <!-- KINDNESS (apenas para capitão) -->
      <div v-if="isCaptain" class="kindness-section">
        <div class="d-flex align-center justify-space-between">
          <span class="text-caption font-weight-medium">Bondade:</span>
          <v-chip :color="getKindnessColor(member.kindness)" size="x-small" variant="elevated">
            <v-icon size="x-small" class="mr-1">{{ getKindnessIcon(member.kindness) }}</v-icon>
            <strong>{{ member.kindness }}</strong>
          </v-chip>
        </div>
      </div>
      
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GameLogic } from '@/utils/gameLogic'
import type { Character, DevilFruit } from '@/utils/database'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'
import CharacterAvatar from '@/components/CharacterAvatar.vue'

interface Props {
  member: Character
  isCaptain: boolean
  style: string
  devilFruit: DevilFruit | null
}

const props = defineProps<Props>()
defineEmits<{
  'member-click': [member: Character]
}>()

// ✅ COMPUTED
const hasHakiStats = computed(() => {
  return props.member.stats.armHaki > 0 || 
         props.member.stats.obsHaki > 0 || 
         props.member.stats.kingHaki > 0
})

// ✅ METHODS
const calculatePower = (character: Character): number => {
  return GameLogic.calculatePower(character, props.devilFruit)
}

const formatBounty = (bounty: number): string => {
  if (bounty >= 1000000000) {
    return `${(bounty / 1000000000).toFixed(1)}B`
  } else if (bounty >= 1000000) {
    return `${(bounty / 1000000).toFixed(1)}M`
  } else if (bounty >= 1000) {
    return `${(bounty / 1000).toFixed(1)}K`
  }
  return `${bounty}`
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
    case 'Government': return '��️'
    case 'BountyHunter': return '��'
    default: return '❓'
  }
}

const getLoyaltyColor = (loyalty: number): string => {
  if (loyalty >= 75) return 'green-darken-2'
  if (loyalty >= 50) return 'light-green-darken-2'
  if (loyalty >= 25) return 'blue-darken-2'
  if (loyalty >= 0) return 'blue-grey-darken-2'
  if (loyalty >= -25) return 'orange-darken-2'
  if (loyalty >= -50) return 'deep-orange-darken-2'
  return 'red-darken-2'
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

const getKindnessColor = (kindness: number): string => {
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
</script>

<style scoped>
.crew-member-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: visible;
}

.crew-member-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: rgba(25, 118, 210, 0.3);
}

.captain-card {
  border: 2px solid #f57f17;
  background: linear-gradient(135deg, #fff9c4 0%, #ffffff 100%);
}

.captain-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #FFD700, #FFA000, #FFD700);
  border-radius: inherit;
  z-index: -1;
  animation: captainGlow 3s ease-in-out infinite alternate;
}

@keyframes captainGlow {
  0% { opacity: 0.5; }
  100% { opacity: 0.8; }
}

/* ✅ ESTILOS DO AVATAR */
.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.member-avatar {
  transition: all 0.3s ease;
}

.captain-avatar {
  border: 3px solid #FFD700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

.avatar-badges {
  position: absolute;
  top: -5px;
  right: -5px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.captain-badge {
  background: linear-gradient(45deg, #FFD700, #FFA000) !important;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4) !important;
}

.devil-fruit-badge {
  background: linear-gradient(45deg, #4DB6AC, #00695C) !important;
  box-shadow: 0 2px 8px rgba(77, 182, 172, 0.4) !important;
}

/* ✅ ESTILOS DAS INFORMAÇÕES */
.member-info {
  min-width: 0;
}

.member-name {
  font-weight: 700;
  color: #1565C0;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.member-chips {
  max-width: 100%;
}

.member-chips .v-chip {
  font-size: 0.7rem !important;
  height: 20px !important;
}

/* ✅ ESTILOS DOS STATS */
.stat-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  background: rgba(25, 118, 210, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(25, 118, 210, 0.1);
}

.stat-item-small {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.03);
  padding: 2px 6px;
  border-radius: 4px;
}

.stats-row, .haki-stats {
  margin-bottom: 12px !important;
}

.haki-stats {
  opacity: 0.8;
}

/* ✅ SEÇÃO DE PODER */
.power-section {
  background: rgba(156, 39, 176, 0.05);
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(156, 39, 176, 0.1);
}

.power-chip {
  background: linear-gradient(45deg, #9C27B0, #673AB7) !important;
  color: white !important;
  font-weight: 700 !important;
}

/* ✅ SEÇÃO DEVIL FRUIT */
.devil-fruit-section {
  animation: devilFruitPulse 3s ease-in-out infinite;
}

@keyframes devilFruitPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* ✅ SEÇÃO DE LEALDADE */
.loyalty-section, .kindness-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid rgba(0,0,0,0.1);
  background: rgba(0, 0, 0, 0.02);
  padding: 8px;
  border-radius: 6px;
}

.loyalty-bar {
  border-radius: 3px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
}

/* ✅ CHIPS GERAIS */
.v-chip {
  font-weight: 700 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}

/* ✅ HOVER EFFECTS */
.crew-member-card:hover .member-avatar {
  transform: scale(1.05);
}

.crew-member-card:hover .member-name {
  color: #0D47A1;
}

.crew-member-card:hover .stat-item {
  background: rgba(25, 118, 210, 0.1);
  transform: translateY(-1px);
}

/* ✅ RESPONSIVE */
@media (max-width: 768px) {
  .member-chips {
    justify-content: center;
  }
  
  .avatar-section {
    margin-bottom: 8px;
  }
  
  .d-flex.align-center.mb-3 {
    flex-direction: column;
    text-align: center;
  }
  
  .member-info {
    width: 100%;
  }
}

/* ✅ ANIMAÇÕES ESPECIAIS */
@keyframes memberCardEntry {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.crew-member-card {
  animation: memberCardEntry 0.5s ease-out;
}

/* ✅ ESTADOS ESPECIAIS */
.crew-member-card.captain-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 35px rgba(255, 215, 0, 0.3);
}

.crew-member-card:active {
  transform: translateY(-2px) scale(0.98);
}
</style>