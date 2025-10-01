<!-- src/components/MemberDetailsModal.vue -->
<template>
  <v-card class="member-details-modal">
    <v-card-title class="bg-primary text-white">
      <v-icon left class="text-white">
        {{ isCaptain ? 'mdi-crown' : 'mdi-account' }}
      </v-icon>
      {{ isCaptain ? '👑 Detalhes do Capitão' : '👥 Detalhes do Membro' }}
    </v-card-title>
    
    <v-card-text class="pa-6">
      
      <!-- ✅ HEADER DO PERSONAGEM COM AVATAR -->
      <div class="character-header mb-4">
        <div class="d-flex align-center mb-3">
          
          <!-- ✅ AVATAR GRANDE DO MEMBRO -->
          <div class="avatar-section mr-4">
            <CharacterAvatar 
              :character="member"
              size="xl"
              variant="circle"
              :show-actions="true"
              :show-regenerate-button="true"
              :show-download-button="true"
              :show-status-indicators="true"
              :show-level="true"
              :show-power-rank="true"
              :cache-enabled="true"
              :clickable="false"
              class="member-detail-avatar"
              :class="{ 'captain-detail-avatar': isCaptain }"
              @avatar-regenerated="onAvatarRegenerated"
              @avatar-error="onAvatarError"
            />
            
            <!-- BADGES ESPECIAIS -->
            <div class="detail-avatar-badges">
              <v-chip 
                v-if="isCaptain" 
                size="small"
                color="yellow-darken-3"
                variant="elevated"
                class="captain-detail-badge"
              >
                <v-icon size="small" class="mr-1">mdi-crown</v-icon>
                CAPITÃO
              </v-chip>
              
              <v-chip 
                v-if="member.devilFruitId != 0" 
                size="small"
                color="teal-darken-3"
                variant="elevated"
                class="devil-fruit-detail-badge"
              >
                <v-icon size="small" class="mr-1">mdi-fruit-pineapple</v-icon>
                USUÁRIO DF
              </v-chip>
            </div>
          </div>
          
          <!-- INFORMAÇÕES BÁSICAS -->
          <div class="member-detail-info flex-grow-1">
            <div class="text-h4 mb-2 member-detail-name">
              {{ member.name }}
            </div>
            
            <div class="d-flex gap-2 mb-3 flex-wrap">
              <v-chip :color="getTypeColor(member.type)" variant="elevated" size="large">
                <v-icon left>{{ getTypeIconMdi(member.type) }}</v-icon>
                <strong>{{ member.type }}</strong>
              </v-chip>
              <v-chip color="blue-darken-2" variant="elevated" size="large">
                <v-icon left>mdi-star</v-icon>
                <strong>Level {{ member.level }}</strong>
              </v-chip>
              <v-chip v-if="member.position" color="green-darken-2" variant="elevated" size="large">
                <v-icon left>mdi-account-tie</v-icon>
                <strong>{{ member.position }}</strong>
              </v-chip>
              <v-chip v-if="style" color="accent-darken-2" variant="elevated" size="large">
                <v-icon left>mdi-sword</v-icon>
                <strong>{{ style }}</strong>
              </v-chip>
            </div>
            
            <!-- BOUNTY DESTACADO -->
            <div class="bounty-section">
              <CharacterBountyDisplay 
                :character="member" 
                size="large" 
                variant="elevated" 
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ PODER TOTAL DESTACADO -->
      <v-card variant="elevated" color="deep-purple-darken-1" class="mb-4 power-total-card">
        <v-card-text class="text-center pa-4">
          <v-icon size="50" color="white">mdi-flash</v-icon>
          <div class="text-h3 mt-2 text-white font-weight-bold">
            {{ calculatePower(member) }}
          </div>
          <div class="text-h6 text-white">Poder Total</div>
          
          <!-- RANK DE PODER -->
          <v-chip 
            :color="getPowerRankColor(currentPowerRank)"
            size="large"
            variant="elevated"
            class="mt-3 power-rank-chip"
          >
            <v-icon left>mdi-crown</v-icon>
            <strong>{{ currentPowerRank }}</strong>
          </v-chip>
        </v-card-text>
      </v-card>

      <!-- ✅ AKUMA NO MI DETALHADA -->
      <div v-if="member.devilFruitId != 0 && devilFruit" class="devil-fruit-detailed mb-4">
        <v-card variant="elevated" color="teal-lighten-5" class="devil-fruit-card">
          <v-card-title class="bg-teal-darken-2 text-white">
            <v-icon left color="white">mdi-fruit-pineapple</v-icon>
            Akuma no Mi
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="4">
                <div class="text-center">
                  <v-icon size="60" color="teal-darken-2">mdi-fruit-pineapple</v-icon>
                  <div class="text-h5 mt-2 text-teal-darken-3 font-weight-bold">
                    {{ devilFruit.name }}
                  </div>
                  <v-chip color="teal-darken-2" variant="elevated" class="mt-2">
                    {{ devilFruit.type }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="outlined" color="teal-darken-1">
                  <v-card-text class="text-center pa-3">
                    <v-icon size="30" color="teal-darken-2">mdi-flash</v-icon>
                    <div class="text-h4 mt-1 text-teal-darken-3">{{ member.stats.devilFruit }}</div>
                    <div class="text-caption">Poder da Fruta</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="outlined" :color="isAwakened ? 'amber-darken-1' : 'grey-lighten-2'">
                  <v-card-text class="text-center pa-3">
                    <v-icon size="30" :color="isAwakened ? 'amber-darken-3' : 'grey'">
                      {{ isAwakened ? 'mdi-star' : 'mdi-star-outline' }}
                    </v-icon>
                    <div class="text-h6 mt-1" :class="isAwakened ? 'text-amber-darken-4' : 'text-grey'">
                      {{ isAwakened ? 'DESPERTADA' : 'NÃO DESPERTADA' }}
                    </div>
                    <div class="text-grey">
                      {{ isAwakened ? 'Poder Máximo!' : `Level ${devilFruit.awakeningOn} necessário` }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>

      <!-- ✅ STATS PRINCIPAIS -->
      <div class="stats-section mb-4">
        <h3 class="text-h5 mb-3 text-primary">
          <v-icon left color="primary">mdi-chart-line</v-icon>
          Estatísticas Principais
        </h3>
        
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-card variant="outlined" color="red-darken-1" class="stat-card">
              <v-card-text class="text-center pa-4">
                <v-icon size="40" color="red-darken-2">mdi-sword</v-icon>
                <div class="text-h4 mt-2 text-red-darken-3 font-weight-bold">{{ member.stats.attack }}</div>
                <div class="text-body-1 text-red-darken-2">Attack</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card variant="outlined" color="blue-darken-1" class="stat-card">
              <v-card-text class="text-center pa-4">
                <v-icon size="40" color="blue-darken-2">mdi-shield</v-icon>
                <div class="text-h4 mt-2 text-blue-darken-3 font-weight-bold">{{ member.stats.defense }}</div>
                <div class="text-body-1 text-blue-darken-2">Defense</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- ✅ STATS SECUNDÁRIOS -->
      <div class="secondary-stats mb-4">
        <h3 class="text-h6 mb-3 text-secondary">
          <v-icon left color="secondary">mdi-speedometer</v-icon>
          Estatísticas Secundárias
        </h3>
        
        <v-row class="mb-4">
          <v-col cols="4">
            <v-card variant="outlined" color="green-darken-1" class="stat-card-small">
              <v-card-text class="text-center pa-3">
                <v-icon size="30" color="green-darken-2">mdi-run-fast</v-icon>
                <div class="text-h5 mt-1 text-green-darken-3 font-weight-bold">{{ member.stats.speed }}</div>
                <div class="text-caption">Speed</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card variant="outlined" color="orange-darken-1" class="stat-card-small">
              <v-card-text class="text-center pa-3">
                <v-icon size="30" color="orange-darken-2">mdi-arm-flex</v-icon>
                <div class="text-h5 mt-1 text-orange-darken-3 font-weight-bold">{{ member.stats.armHaki }}</div>
                <div class="text-caption">Busoshoku Haki</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card variant="outlined" color="purple-darken-1" class="stat-card-small">
              <v-card-text class="text-center pa-3">
                <v-icon size="30" color="purple-darken-2">mdi-eye</v-icon>
                <div class="text-h5 mt-1 text-purple-darken-3 font-weight-bold">{{ member.stats.obsHaki }}</div>
                <div class="text-caption">Kenbunshoku Haki</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
      
      <!-- ✅ HAOSHOKU HAKI E LOYALTY/KINDNESS -->
      <v-row class="mb-4">
        <v-col cols="6">
          <v-card variant="outlined" color="amber-darken-1" class="stat-card">
            <v-card-text class="text-center pa-4">
              <v-icon size="35" color="amber-darken-3">mdi-crown</v-icon>
              <div class="text-h5 mt-2 text-amber-darken-4 font-weight-bold">{{ member.stats.kingHaki }}</div>
              <div class="text-body-1">Haoshoku Haki</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <!-- LOYALTY para membros -->
          <v-card v-if="!isCaptain && member.loyalty !== undefined" variant="outlined" :color="getLoyaltyCardColor(member.loyalty)" class="stat-card">
            <v-card-text class="text-center pa-4">
              <v-icon size="35" :color="getLoyaltyIconColor(member.loyalty)">{{ getLoyaltyIcon(member.loyalty) }}</v-icon>
              <div class="text-h5 mt-2 font-weight-bold" :class="getLoyaltyTextColor(member.loyalty)">{{ member.loyalty.toFixed(1) }}</div>
              <div class="text-body-1">Lealdade</div>
              
              <!-- BARRA DE LEALDADE -->
              <v-progress-linear
                :model-value="Math.abs(member.loyalty)"
                :color="getLoyaltyIconColor(member.loyalty).replace('darken-2', 'darken-1')"
                height="8"
                class="mt-2"
                max="100"
                rounded
              ></v-progress-linear>
            </v-card-text>
          </v-card>
          
          <!-- KINDNESS para capitão -->
          <v-card v-else variant="outlined" :color="getKindnessCardColor(member.kindness)" class="stat-card">
            <v-card-text class="text-center pa-4">
              <v-icon size="35" :color="getKindnessIconColor(member.kindness)">
                {{ getKindnessIcon(member.kindness) }}
              </v-icon>
              <div class="text-h5 mt-2 font-weight-bold" :class="getKindnessTextColor(member.kindness)">{{ member.kindness }}</div>
              <div class="text-body-1">Bondade</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ✅ EXPERIÊNCIA DETALHADA -->
      <div class="experience-section mb-4">
        <v-card variant="elevated" color="blue-lighten-5" class="experience-card">
          <v-card-title class="bg-blue-darken-2 text-white">
            <v-icon left color="white">mdi-trending-up</v-icon>
            Progressão de Experiência
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center mb-3">
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
            
            <div class="text-center">
              <v-chip color="blue-darken-2" variant="elevated">
                <v-icon left>mdi-target</v-icon>
                <strong>{{ (expForNextLevel - member.experience).toLocaleString() }} XP restantes</strong>
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- ✅ DEBUG INFO (EXPANSÍVEL) -->
      <v-expansion-panels class="mb-4" variant="accordion">
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
import CharacterAvatar from '@/components/CharacterAvatar.vue'

interface Props {
  member: Character
  isCaptain: boolean
  style: string
  devilFruit: DevilFruit | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  removeMember: [memberId: number]
}>()

// ✅ REACTIVE DATA
const showRemoveConfirmation = ref(false)
const isRemoving = ref(false)

// ✅ COMPUTED
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

// ✅ AVATAR EVENTS
const onAvatarRegenerated = (svgData: string) => {
  console.log('✅ Avatar regenerado no modal de detalhes')
}

const onAvatarError = (error: Error) => {
  console.error('❌ Erro no avatar do modal:', error)
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

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'Pirate': return '🏴‍☠️'
    case 'Marine': return '⚓'
    case 'Government': return '🏛️'
    case 'BountyHunter': return '💰'
    default: return '❓'
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
.member-details-modal {
  max-width: 900px;
  margin: 0 auto;
}

/* ✅ ESTILOS DO AVATAR */
.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.member-detail-avatar {
  transition: all 0.3s ease;
  border: 4px solid rgba(25, 118, 210, 0.2);
}

.captain-detail-avatar {
  border: 4px solid #FFD700;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.5);
  animation: captainAvatarGlow 3s ease-in-out infinite alternate;
}

@keyframes captainAvatarGlow {
  0% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.5); }
  100% { box-shadow: 0 0 35px rgba(255, 215, 0, 0.8); }
}

.detail-avatar-badges {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.captain-detail-badge {
  background: linear-gradient(45deg, #FFD700, #FFA000) !important;
  color: #000 !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4) !important;
}

.devil-fruit-detail-badge {
  background: linear-gradient(45deg, #4DB6AC, #00695C) !important;
  color: white !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 12px rgba(77, 182, 172, 0.4) !important;
}

/* ✅ HEADER */
.character-header {
  border-bottom: 3px solid rgba(25, 118, 210, 0.2);
  padding-bottom: 20px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.member-detail-info {
  min-width: 0;
}

.member-detail-name {
  font-weight: 800;
  color: #1565C0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.bounty-section {
  margin-top: 12px;
}

/* ✅ CARDS DE STATS */
.stat-card {
  transition: all 0.3s ease;
  border-width: 2px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.stat-card-small {
  transition: all 0.3s ease;
  border-width: 2px;
}

.stat-card-small:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

/* ✅ PODER TOTAL */
.power-total-card {
  background: linear-gradient(135deg, #673AB7 0%, #9C27B0 100%) !important;
  border: 3px solid rgba(255,255,255,0.2);
  box-shadow: 0 8px 32px rgba(156, 39, 176, 0.3) !important;
}

.power-rank-chip {
  background: linear-gradient(45deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7)) !important;
  color: #673AB7 !important;
  font-weight: 800 !important;
  font-size: 1.1rem !important;
  height: 36px !important;
}

/* ✅ DEVIL FRUIT */
.devil-fruit-card {
  border: 3px solid #4DB6AC;
  box-shadow: 0 8px 25px rgba(77, 182, 172, 0.2);
}

.devil-fruit-detailed {
  animation: devilFruitDetailPulse 4s ease-in-out infinite;
}

@keyframes devilFruitDetailPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.01); }
}

/* ✅ EXPERIÊNCIA */
.experience-card {
  border: 3px solid #1976D2;
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.2);
}

/* ✅ SEÇÕES */
.stats-section h3,
.secondary-stats h3 {
  border-bottom: 2px solid currentColor;
  padding-bottom: 8px;
  margin-bottom: 16px;
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
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
}

/* ✅ CORES CUSTOMIZADAS */
.text-red-darken-3 { color: #c62828 !important; }
.text-blue-darken-3 { color: #1565c0 !important; }
.text-green-darken-3 { color: #2e7d32 !important; }
.text-orange-darken-3 { color: #ef6c00 !important; }
.text-purple-darken-3 { color: #6a1b9a !important; }
.text-deep-purple-darken-3 { color: #4527a0 !important; }
.text-amber-darken-4 { color: #ff8f00 !important; }
.text-teal-darken-3 { color: #00695c !important; }

/* ✅ RESPONSIVE */
@media (max-width: 768px) {
  .character-header .d-flex {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar-section {
    margin-bottom: 16px;
  }
  
  .member-detail-info {
    width: 100%;
  }
  
  .detail-avatar-badges {
    position: static;
    transform: none;
    justify-content: center;
    margin-top: 12px;
  }
}

/* ✅ ANIMAÇÕES */
@keyframes modalEntry {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.member-details-modal {
  animation: modalEntry 0.5s ease-out;
}
</style>