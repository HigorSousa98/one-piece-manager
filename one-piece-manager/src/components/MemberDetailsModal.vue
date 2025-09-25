<!-- src/components/MemberDetailsModal.vue -->
<template>
  <v-card>
    <v-card-title class="bg-primary text-white">
      <v-icon left class="text-white">
        {{ isCaptain ? 'mdi-crown' : 'mdi-account' }}
      </v-icon>
      {{ isCaptain ? '👑 Detalhes do Capitão' : '👥 Detalhes do Membro' }}
    </v-card-title>
    
    <v-card-text class="pa-6">
      
      <!-- HEADER DO PERSONAGEM -->
      <div class="character-header mb-4">
        <div class="d-flex align-center mb-3">
          <v-avatar size="80" :color="getTypeColor(member.type)" class="mr-4">
            <span class="text-h4">{{ getTypeIcon(member.type) }}</span>
          </v-avatar>
          <div>
            <div class="text-h4 mb-2">
              {{ member.name }}
              <v-icon v-if="isCaptain" color="yellow-darken-3" class="ml-2">mdi-crown</v-icon>
            </div>
            <div class="d-flex gap-2 mb-2">
              <v-chip :color="getTypeColor(member.type)" variant="elevated">
                <strong>{{ member.type }}</strong>
              </v-chip>
              <v-chip color="blue-darken-2" variant="elevated">
                <strong>Level {{ member.level }}</strong>
              </v-chip>
              <v-chip v-if="member.position" color="green-darken-2" variant="elevated">
                <strong>{{ member.position }}</strong>
              </v-chip>
              <v-chip v-if="style" color="accent-darken-2" variant="elevated">
                <strong>{{ style }}</strong>
              </v-chip>
            </div>
            <v-chip color="purple-darken-2" variant="elevated">
              <v-icon left>mdi-treasure-chest</v-icon>
              <strong>{{ formatBounty(member.bounty) }}</strong>
            </v-chip>
          </div>
        </div>
      </div>

      <!-- PODER TOTAL -->
      <v-card variant="outlined" color="deep-purple-darken-1" class="mb-4">
        <v-card-text class="text-center pa-4">
          <v-icon size="40" color="deep-purple-darken-2">mdi-flash</v-icon>
          <div class="text-h4 mt-2 text-deep-purple-darken-3">
            <strong>{{ calculatePower(member) }}</strong>
          </div>
          <div class="text-body-1">Poder Total</div>
        </v-card-text>
      </v-card>

      <!-- AKUMA NO MI -->
      <div v-if="member.devilFruitId != 0">
        <v-row class="mb-4">
          <v-col cols="4">
            <v-card variant="outlined" color="green-darken-1">
              <v-card-text class="text-center pa-3">
                <v-icon color="teal-darken-2">mdi-fruit-pineapple</v-icon>
                  <div class="text-h5 mt-1 text-teal-darken-3">
                    {{ member.stats.devilFruit }}
                  </div>
                  <div class="text-caption">{{devilFruit.name}} - {{ devilFruit.type }}<strong>{{member.level >= devilFruit.awakeningOn ? ' (Despertada)' : ''}}</strong></div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card variant="outlined" color="red-darken-1">
              <v-card-text class="text-center pa-3">
                <v-icon color="red-darken-2">mdi-sword</v-icon>
                <div class="text-h5 mt-1 text-red-darken-3">{{ member.stats.attack }}</div>
                <div class="text-caption">Attack</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card variant="outlined" color="blue-darken-1">
              <v-card-text class="text-center pa-3">
                <v-icon color="blue-darken-2">mdi-shield</v-icon>
                <div class="text-h5 mt-1 text-blue-darken-3">{{ member.stats.defense }}</div>
                <div class="text-caption">Defense</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
      <!-- stats sem akuma -->
      <div v-else>
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-card variant="outlined" color="red-darken-1">
              <v-card-text class="text-center pa-3">
                <v-icon size="30" color="red-darken-2">mdi-sword</v-icon>
                <div class="text-h5 mt-1 text-red-darken-3">{{ member.stats.attack }}</div>
                <div class="text-caption">Attack</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card variant="outlined" color="blue-darken-1">
              <v-card-text class="text-center pa-3">
                <v-icon size="30" color="blue-darken-2">mdi-shield</v-icon>
                <div class="text-h5 mt-1 text-blue-darken-3">{{ member.stats.defense }}</div>
                <div class="text-caption">Defense</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- STATS DETALHADOS -->
      
      
      <!-- STATS SECUNDÁRIOS -->
      <v-row class="mb-4">
        <v-col cols="4">
          <v-card variant="outlined" color="green-darken-1">
            <v-card-text class="text-center pa-3">
              <v-icon color="green-darken-2">mdi-run-fast</v-icon>
              <div class="text-h6 mt-1 text-green-darken-3">{{ member.stats.speed }}</div>
              <div class="text-caption">Speed</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card variant="outlined" color="orange-darken-1">
            <v-card-text class="text-center pa-3">
              <v-icon color="orange-darken-2">mdi-arm-flex</v-icon>
              <div class="text-h6 mt-1 text-orange-darken-3">{{ member.stats.armHaki }}</div>
              <div class="text-caption">Busoshoku Haki</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card variant="outlined" color="purple-darken-1">
            <v-card-text class="text-center pa-3">
              <v-icon color="purple-darken-2">mdi-eye</v-icon>
              <div class="text-h6 mt-1 text-purple-darken-3">{{ member.stats.obsHaki }}</div>
              <div class="text-caption">Kenbunshoku Haki</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- HAOSHOKU HAKI E LOYALTY/KINDNESS -->
      <v-row class="mb-4">
        <v-col cols="6">
          <v-card variant="outlined" color="amber-darken-1">
            <v-card-text class="text-center pa-3">
              <v-icon size="25" color="amber-darken-3">mdi-crown</v-icon>
              <div class="text-h6 mt-1 text-amber-darken-4">{{ member.stats.kingHaki }}</div>
              <div class="text-caption">Haoshoku Haki</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <!-- LOYALTY para membros -->
          <v-card v-if="!isCaptain && member.loyalty !== undefined" variant="outlined" :color="getLoyaltyCardColor(member.loyalty)">
            <v-card-text class="text-center pa-3">
              <v-icon size="25" :color="getLoyaltyIconColor(member.loyalty)">mdi-heart</v-icon>
              <div class="text-h6 mt-1" :class="getLoyaltyTextColor(member.loyalty)">{{ member.loyalty.toFixed(2) }}</div>
              <div class="text-caption">Lealdade</div>
            </v-card-text>
          </v-card>
          <!-- KINDNESS para capitão -->
          <v-card v-else variant="outlined" :color="getKindnessCardColor(member.kindness)">
            <v-card-text class="text-center pa-3">
              <v-icon size="25" :color="getKindnessIconColor(member.kindness)">
                {{ getKindnessIcon(member.kindness) }}
              </v-icon>
              <div class="text-h6 mt-1" :class="getKindnessTextColor(member.kindness)">{{ member.kindness }}</div>
              <div class="text-caption">Bondade</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- EXPERIÊNCIA (apenas para capitão) -->
      <div class="experience-section mb-4">
        <v-card variant="outlined" color="blue-darken-1">
          <v-card-text class="pa-4">
            <div class="text-h6 mb-2 text-blue-darken-3">Experiência</div>
            <div class="text-body-1 mb-2">
              <strong>{{ member.experience }} / {{ expForNextLevel }} XP</strong>
            </div>
            <v-progress-linear
              :model-value="experiencePercentage"
              color="primary"
              height="15"
              rounded
              class="mb-2"
            >
              <template v-slot:default>
                <strong :class="Math.round(experiencePercentage) > 45 ? 'text-white' : 'text-black'">{{ Math.round(experiencePercentage) }}%</strong>
              </template>
            </v-progress-linear>
            <div class="text-caption text-center">
              Faltam {{ expForNextLevel - member.experience }} XP para o próximo level
            </div>
          </v-card-text>
        </v-card>
      </div>
      
    </v-card-text>
    
    <v-card-actions class="pa-4">
      <!-- ✅ BOTÃO REMOVER (apenas para membros, não capitão) -->
      <v-btn 
        v-if="!isCaptain" 
        color="red-darken-2" 
        @click="openRemoveConfirmation" 
        variant="outlined"
        :disabled="isRemoving"
      >
        <v-icon left>mdi-account-remove</v-icon>
        {{ isRemoving ? 'Removendo...' : 'Retirar do Crew' }}
      </v-btn>
      
      <v-spacer></v-spacer>
      
      <v-btn color="primary" @click="$emit('close')" variant="elevated">
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
import RemoveMemberConfirmationModal from '@/components/RemoveMemberConfirmationModal.vue'
import type { Character, DevilFruit } from '@/utils/database'

interface Props {
  member: Character
  isCaptain: boolean
  style: string
  devilFruit: DevilFruit
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  removeMember: [memberId: number]
}>()

// ✅ REACTIVE DATA
const showRemoveConfirmation = ref(false)
const isRemoving = ref(false)

// �� COMPUTED
const experiencePercentage = computed(() => {
  const expForNext = GameLogic.nextLevelUp(props.member)
  return (props.member.experience / expForNext) * 100
})

const expForNextLevel = computed(() => {
  return GameLogic.nextLevelUp(props.member)
})

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
    
    // Emitir evento para o componente pai
    emit('removeMember', props.member.id!)
    
    // Fechar modal de confirmação
    closeRemoveConfirmation()
    
    // Fechar modal de detalhes
    emit('close')
    
  } catch (error) {
    console.error('❌ Erro ao remover membro:', error)
  } finally {
    isRemoving.value = false
  }
}

// 🎮 METHODS
const calculatePower = (character: Character): number => {
  return GameLogic.calculatePower(character)
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

const getLoyaltyCardColor = (loyalty: number): string => {
  if (loyalty >= 50) return 'green-darken-1'
  if (loyalty >= 0) return 'blue-darken-1'
  if (loyalty >= -50) return 'orange-darken-1'
  return 'red-darken-1'
}

const getLoyaltyIconColor = (loyalty: number): string => {
  if (loyalty >= 50) return 'green-darken-2'
  if (loyalty >= 0) return 'blue-darken-2'
  if (loyalty >= -50) return 'orange-darken-2'
  return 'red-darken-2'
}

const getLoyaltyTextColor = (loyalty: number): string => {
  if (loyalty >= 50) return 'text-green-darken-3'
  if (loyalty >= 0) return 'text-blue-darken-3'
  if (loyalty >= -50) return 'text-orange-darken-3'
  return 'text-red-darken-3'
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
</script>

<style scoped>
.character-header {
  border-bottom: 2px solid rgba(0,0,0,0.1);
  padding-bottom: 16px;
}

.experience-section {
  background: rgba(25, 118, 210, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.v-chip {
  font-weight: 700 !important;
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