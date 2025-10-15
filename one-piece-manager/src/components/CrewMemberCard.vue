<template>
  <v-card 
    variant="elevated" 
    class="crew-member-card"
    :class="{ 'captain-card': isCaptain }"
    @click="$emit('member-click', member)"
    style="cursor: pointer;"
  >
    <v-card-text class="pa-3">
      
      <!-- WANTED POSTER SECTION -->
      <div class="poster-section mb-3">
        <div class="poster-container">
          <WantedPoster
            :character="member"
            size="small"
            :show-actions="false"
            :show-size-controls="false"
            class="member-poster"
          />
          
          <!-- OVERLAY BADGES -->
          <div class="poster-badges">
            <v-chip 
              v-if="isCaptain" 
              size="small"
              color="amber"
              variant="elevated"
              class="captain-badge"
            >
              <v-icon size="small" class="mr-1">mdi-crown</v-icon>
              CAPITÃO
            </v-chip>
            
            <v-chip 
              v-if="member.devilFruitId != 0" 
              size="small"
              color="teal-darken-2"
              variant="elevated"
              class="devil-fruit-badge"
            >
              <v-icon size="small" class="mr-1">mdi-fruit-pineapple</v-icon>
              AKUMA NO MI
            </v-chip>
            
            <v-chip 
              :color="getTypeColor(member.type)" 
              size="small" 
              variant="elevated"
              class="type-badge"
            >
              <v-icon size="small" class="mr-1">{{ getTypeIcon(member.type) }}</v-icon>
              {{ member.type.toUpperCase() }}
            </v-chip>
          </div>
        </div>
      </div>
      
      <!-- MEMBER INFO HEADER -->
      <div class="member-header mb-3">
        <div class="member-title">
          <h3 class="text-h6 font-weight-bold member-name mb-1">
            {{ member.name }}
          </h3>
          <div class="member-subtitle">
            <span class="text-caption text-medium-emphasis">
              {{ member.position || 'Membro da Tripulação' }}
            </span>
            <v-chip 
              v-if="style" 
              color="purple-darken-2" 
              size="x-small" 
              variant="tonal"
              class="ml-2"
            >
              {{ style }}
            </v-chip>
          </div>
        </div>
        
        <!-- LEVEL & POWER -->
        <div class="member-power">
          <v-chip color="orange-darken-2" size="small" variant="elevated" class="level-chip">
            <v-icon left size="16">mdi-star</v-icon>
            Lv.{{ member.level }}
          </v-chip>
          <v-chip color="purple-darken-2" size="small" variant="elevated" class="power-chip">
            <v-icon left size="16">mdi-flash</v-icon>
            {{ calculatePower(member) }}
          </v-chip>
        </div>
      </div>
      
      <!-- STATS GRID -->
      <div class="stats-section mb-3">
        <h4 class="text-subtitle-2 font-weight-bold mb-2 stats-title">
          <v-icon size="16" class="mr-1">mdi-chart-line</v-icon>
          Estatísticas de Combate
        </h4>
        
        <v-row class="stats-grid">
          <v-col cols="4">
            <div class="stat-card attack-stat">
              <v-icon size="18" color="red-darken-2">mdi-sword</v-icon>
              <div class="stat-content">
                <div class="stat-value">{{ member.stats.attack }}</div>
                <div class="stat-label">ATK</div>
              </div>
            </div>
          </v-col>
          <v-col cols="4">
            <div class="stat-card defense-stat">
              <v-icon size="18" color="blue-darken-2">mdi-shield</v-icon>
              <div class="stat-content">
                <div class="stat-value">{{ member.stats.defense }}</div>
                <div class="stat-label">DEF</div>
              </div>
            </div>
          </v-col>
          <v-col cols="4">
            <div class="stat-card speed-stat">
              <v-icon size="18" color="green-darken-2">mdi-run-fast</v-icon>
              <div class="stat-content">
                <div class="stat-value">{{ member.stats.speed }}</div>
                <div class="stat-label">SPD</div>
              </div>
            </div>
          </v-col>
        </v-row>
        
        <!-- HAKI STATS (se tiver) -->
        <v-row v-if="hasHakiStats" class="haki-stats mt-2">
          <v-col cols="4" v-if="member.stats.armHaki > 0">
            <div class="haki-card armament">
              <v-icon size="16" color="orange-darken-2">mdi-arm-flex</v-icon>
              <div class="haki-content">
                <div class="haki-value">{{ member.stats.armHaki }}</div>
                <div class="haki-label">ARM</div>
              </div>
            </div>
          </v-col>
          <v-col cols="4" v-if="member.stats.obsHaki > 0">
            <div class="haki-card observation">
              <v-icon size="16" color="purple-darken-2">mdi-eye</v-icon>
              <div class="haki-content">
                <div class="haki-value">{{ member.stats.obsHaki }}</div>
                <div class="haki-label">OBS</div>
              </div>
            </div>
          </v-col>
          <v-col cols="4" v-if="member.stats.kingHaki > 0">
            <div class="haki-card conqueror">
              <v-icon size="16" color="amber-darken-3">mdi-crown</v-icon>
              <div class="haki-content">
                <div class="haki-value">{{ member.stats.kingHaki }}</div>
                <div class="haki-label">CON</div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
      
      <!-- BOUNTY SECTION -->
      <!--
      <div class="bounty-section mb-3">
        <div class="bounty-header">
          <span class="text-subtitle-2 font-weight-bold">
            <v-icon size="16" class="mr-1">{{ getBountyIcon(member.type) }}</v-icon>
            {{ getBountyLabel(member.type) }}
          </span>
        </div>
        <CharacterBountyDisplay 
          :character="member" 
          size="default" 
          variant="elevated" 
          class="bounty-display"
        />
      </div>-->
      
      <!-- DEVIL FRUIT INFO (se tiver) -->
      <div v-if="member.devilFruitId != 0 && devilFruit" class="devil-fruit-section mb-3">
        <v-card variant="outlined" color="teal-lighten-5" class="devil-fruit-card">
          <v-card-text class="pa-3">
            <div class="d-flex align-center">
              <div class="devil-fruit-icon">
                <v-icon color="teal-darken-2" size="24">mdi-fruit-pineapple</v-icon>
              </div>
              <div class="flex-grow-1 ml-3">
                <div class="text-subtitle-2 font-weight-bold text-teal-darken-3">
                  {{ devilFruit.name }}
                </div>
                <div class="text-caption text-teal-darken-2 mb-1">
                  {{ devilFruit.type }} • Poder: {{ member.stats.devilFruit }}
                </div>
                <div class="d-flex align-center gap-2">
                  <v-chip 
                    v-if="member.level >= (devilFruit.awakeningOn || 999)"
                    size="x-small"
                    color="teal-darken-2"
                    variant="elevated"
                  >
                    <v-icon size="x-small" class="mr-1">mdi-star</v-icon>
                    Despertada
                  </v-chip>
                  <v-chip 
                    size="x-small"
                    color="teal"
                    variant="tonal"
                  >
                    Nível {{ member.stats.devilFruit }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
      
      <!-- LOYALTY (apenas para membros) -->
      <div v-if="!isCaptain && member.loyalty !== undefined" class="loyalty-section mb-3">
        <div class="loyalty-header mb-2">
          <span class="text-subtitle-2 font-weight-bold">
            <v-icon size="16" class="mr-1">mdi-heart</v-icon>
            Lealdade
          </span>
          <v-chip :color="getLoyaltyColor(member.loyalty)" size="small" variant="elevated">
            <v-icon size="small" class="mr-1">{{ getLoyaltyIcon(member.loyalty) }}</v-icon>
            {{ member.loyalty.toFixed(1) }}
          </v-chip>
        </div>
        <v-progress-linear
          :model-value="Math.abs(member.loyalty)"
          :color="getLoyaltyColor(member.loyalty)"
          height="8"
          class="loyalty-bar"
          max="100"
          rounded
        />
        <div class="loyalty-description mt-1">
          <span class="text-caption text-medium-emphasis">
            {{ getLoyaltyDescription(member.loyalty) }}
          </span>
        </div>
      </div>
      
      <!-- KINDNESS (apenas para capitão) -->
      <div v-if="isCaptain" class="kindness-section">
        <div class="kindness-header">
          <span class="text-subtitle-2 font-weight-bold">
            <v-icon size="16" class="mr-1">mdi-heart-outline</v-icon>
            Bondade
          </span>
          <v-chip :color="getKindnessColor(member.kindness)" size="small" variant="elevated">
            <v-icon size="small" class="mr-1">{{ getKindnessIcon(member.kindness) }}</v-icon>
            {{ member.kindness }}
          </v-chip>
        </div>
        <div class="kindness-description mt-1">
          <span class="text-caption text-medium-emphasis">
            {{ getKindnessDescription(member.kindness) }}
          </span>
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
import WantedPoster from '@/components/WantedPoster.vue'

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
    case 'Pirate': return 'mdi-pirate'
    case 'Marine': return 'mdi-anchor'
    case 'Government': return 'mdi-bank'
    case 'BountyHunter': return 'mdi-target'
    default: return 'mdi-account'
  }
}

const getBountyIcon = (type: string): string => {
  const icons: Record<string, string> = {
    Pirate: 'mdi-currency-usd',
    Marine: 'mdi-star',
    BountyHunter: 'mdi-trophy',
    Government: 'mdi-shield-crown'
  }
  return icons[type] || 'mdi-help'
}

const getBountyLabel = (type: string): string => {
  const labels: Record<string, string> = {
    Pirate: 'Recompensa',
    Marine: 'Patente',
    BountyHunter: 'Ranking',
    Government: 'Posição'
  }
  return labels[type] || 'Rank'
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

const getLoyaltyDescription = (loyalty: number): string => {
  if (loyalty >= 75) return 'Extremamente leal ao capitão'
  if (loyalty >= 50) return 'Muito leal e confiável'
  if (loyalty >= 25) return 'Leal à tripulação'
  if (loyalty >= 0) return 'Neutro em relação ao capitão'
  if (loyalty >= -25) return 'Questionando a liderança'
  if (loyalty >= -50) return 'Descontente com o capitão'
  return 'Pronto para se rebelar'
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

const getKindnessDescription = (kindness: number): string => {
  if (kindness >= 50) return 'Capitão bondoso e compassivo'
  if (kindness >= 0) return 'Equilibrado entre bondade e firmeza'
  if (kindness >= -50) return 'Capitão rigoroso mas justo'
  return 'Capitão cruel e impiedoso'
}
</script>

<style scoped>
.crew-member-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: visible;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.crew-member-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 35px rgba(0,0,0,0.2);
  border-color: rgba(25, 118, 210, 0.4);
}

.captain-card {
  border: 3px solid #f57f17;
  background: linear-gradient(135deg, #fff9c4 0%, #ffffff 100%);
  position: relative;
}

.captain-card::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(45deg, #FFD700, #FFA000, #FFD700, #FFA000);
  background-size: 400% 400%;
  border-radius: inherit;
  z-index: -1;
  animation: captainGlow 3s ease-in-out infinite;
}

@keyframes captainGlow {
  0%, 100% { 
    background-position: 0% 50%;
    opacity: 0.6;
  }
  50% { 
    background-position: 100% 50%;
    opacity: 0.9;
  }
}

/* POSTER SECTION */
.poster-section {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.poster-container {
  position: relative;
  display: inline-block;
}

.member-poster {
  filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.25));
  transition: all 0.3s ease;
}

.crew-member-card:hover .member-poster {
  transform: scale(1.02) rotate(1deg);
  filter: drop-shadow(0 8px 25px rgba(0, 0, 0, 0.35));
}

.poster-badges {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 10;
}

.captain-badge {
  background: linear-gradient(45deg, #FFD700, #FFA000) !important;
  color: #8B4513 !important;
  font-weight: bold !important;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4) !important;
}

.devil-fruit-badge {
  background: linear-gradient(45deg, #4DB6AC, #00695C) !important;
  color: white !important;
  font-weight: bold !important;
  box-shadow: 0 4px 12px rgba(77, 182, 172, 0.4) !important;
}

.type-badge {
  font-weight: bold !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

/* MEMBER HEADER */
.member-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  background: rgba(25, 118, 210, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(25, 118, 210, 0.1);
}

.member-name {
  color: #1565C0;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  line-height: 1.2;
}

.member-subtitle {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.member-power {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.level-chip, .power-chip {
  font-weight: bold !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

/* STATS SECTION */
.stats-section {
  background: rgba(0, 0, 0, 0.02);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stats-title {
  color: #424242;
  border-bottom: 2px solid rgba(25, 118, 210, 0.2);
  padding-bottom: 4px;
}

.stats-grid .v-col {
  padding: 4px !important;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #1565C0;
  line-height: 1;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
  margin-top: 2px;
}

/* HAKI STATS */
.haki-stats .v-col {
  padding: 2px !important;
}

.haki-card {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.haki-content {
  text-align: center;
  flex: 1;
}

.haki-value {
  font-size: 0.9rem;
  font-weight: bold;
  color: #424242;
  line-height: 1;
}

.haki-label {
  font-size: 0.6rem;
  color: rgba(0, 0, 0, 0.5);
  font-weight: 500;
}

/* BOUNTY SECTION */
.bounty-section {
  background: rgba(139, 69, 19, 0.05);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.bounty-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #8B4513;
}

.bounty-display {
  display: flex;
  justify-content: center;
}

/* DEVIL FRUIT SECTION */
.devil-fruit-section {
  animation: devilFruitPulse 4s ease-in-out infinite;
}

@keyframes devilFruitPulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(77, 182, 172, 0.2);
  }
  50% { 
    transform: scale(1.01);
    box-shadow: 0 4px 16px rgba(77, 182, 172, 0.4);
  }
}

.devil-fruit-card {
  border: 2px solid rgba(77, 182, 172, 0.3) !important;
}

.devil-fruit-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(77, 182, 172, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* LOYALTY & KINDNESS SECTIONS */
.loyalty-section, .kindness-section {
  background: rgba(0, 0, 0, 0.02);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.loyalty-header, .kindness-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #424242;
}

.loyalty-bar {
  border-radius: 4px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
}

.loyalty-description, .kindness-description {
  text-align: center;
}

/* CHIPS GERAIS */
.v-chip {
  font-weight: 600 !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
}

/* HOVER EFFECTS */
.crew-member-card:hover .member-name {
  color: #0D47A1;
  transform: scale(1.02);
}

.crew-member-card:hover .stat-card {
  background: rgba(25, 118, 210, 0.08);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .member-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
  
  .member-power {
    flex-direction: row;
    align-items: center;
  }
  
  .poster-badges {
    position: static;
    flex-direction: row;
    justify-content: center;
    margin-top: 8px;
  }
  
  .stats-grid {
    margin-top: 8px;
  }
}

/* ANIMAÇÕES DE ENTRADA */
@keyframes memberCardEntry {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.crew-member-card {
  animation: memberCardEntry 0.6s ease-out;
}

/* ESTADOS ESPECIAIS */
.crew-member-card.captain-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 45px rgba(255, 215, 0, 0.4);
}

.crew-member-card:active {
  transform: translateY(-2px) scale(0.98);
}

/* SCROLL ANIMATIONS */
.crew-member-card:nth-child(odd) {
  animation-delay: 0.1s;
}

.crew-member-card:nth-child(even) {
  animation-delay: 0.2s;
}
</style>