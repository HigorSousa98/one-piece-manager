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
      
      <!-- HEADER DO MEMBRO -->
      <div class="d-flex align-center mb-3">
        <v-avatar size="50" :color="getTypeColor(member.type)" class="mr-3">
          <span class="text-h6">{{ getTypeIcon(member.type) }}</span>
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-h6 mb-1">
            {{ member.name }}
            <v-icon v-if="isCaptain" color="yellow-darken-3" class="ml-1">mdi-crown</v-icon>
            <v-icon v-if="member.devilFruitId != 0" color="teal-darken-3" class="ml-1">mdi-fruit-pineapple</v-icon>
          </div>
          <div class="d-flex gap-2">
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
      <v-row class="mb-3">
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
      
      <!-- PODER E BOUNTY -->
      <div class="d-flex justify-space-between align-center mb-2">
        <v-chip color="purple-darken-2" size="small" variant="elevated">
          <v-icon left size="16">mdi-flash</v-icon>
          <strong>{{ calculatePower(member) }}</strong>
        </v-chip>
        <v-chip color="orange-darken-2" size="small" variant="elevated">
          <v-icon left size="16">mdi-treasure-chest</v-icon>
          <strong>{{ formatBounty(member.bounty) }}</strong>
        </v-chip>
      </div>
      
      <!-- LOYALTY (apenas para membros) -->
      <div v-if="!isCaptain && member.loyalty !== undefined" class="loyalty-section">
        <div class="d-flex align-center justify-space-between">
          <span class="text-caption">Lealdade:</span>
          <v-chip :color="getLoyaltyColor(member.loyalty)" size="x-small" variant="elevated">
            <strong>{{ member.loyalty.toFixed(2) }}</strong>
          </v-chip>
        </div>
        <v-progress-linear
          :model-value="Math.abs(member.loyalty)"
          :color="getLoyaltyColor(member.loyalty)"
          height="4"
          class="mt-1"
          max="100"
          min="-100" 
        ></v-progress-linear>
      </div>
      
      <!-- KINDNESS (apenas para capitão) -->
      <div v-if="isCaptain" class="kindness-section">
        <div class="d-flex align-center justify-space-between">
          <span class="text-caption">Bondade:</span>
          <v-chip :color="getKindnessColor(member.kindness)" size="x-small" variant="elevated">
            <strong>{{ member.kindness }}</strong>
          </v-chip>
        </div>
      </div>
      
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { GameLogic } from '@/utils/gameLogic'
import type { Character } from '@/utils/database'

interface Props {
  member: Character
  isCaptain: boolean
  style: string
}

const props = defineProps<Props>()
defineEmits<{
  'member-click': [member: Character]
}>()

// �� METHODS
const calculatePower = (character: Character): number => {
  return GameLogic.calculatePower(character)
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
    case 'Government': return '🏛️'
    case 'BountyHunter': return '💰'
    default: return '❓'
  }
}

const getLoyaltyColor = (loyalty: number): string => {
  if (loyalty >= 50) return 'green-darken-2'
  if (loyalty >= 0) return 'blue-darken-2'
  if (loyalty >= -50) return 'orange-darken-2'
  return 'red-darken-2'
}

const getKindnessColor = (kindness: number): string => {
  if (kindness >= 50) return 'green-darken-2'
  if (kindness >= 0) return 'blue-darken-2'
  if (kindness >= -50) return 'orange-darken-2'
  return 'red-darken-2'
}
</script>

<style scoped>
.crew-member-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
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

.stat-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
}

.loyalty-section, .kindness-section {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.v-chip {
  font-weight: 700 !important;
}
</style>