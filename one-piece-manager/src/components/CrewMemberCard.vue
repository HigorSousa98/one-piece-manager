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
              <v-icon size="small" class="mr-1">{{ GameLogic.getTypeIcon(member.type) }}</v-icon>
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
        <h4 class="cm-section-label mb-2">
          <v-icon size="15" class="me-1" color="primary">mdi-sword-cross</v-icon>
          Estatísticas de Combate
        </h4>

        <div class="cm-stats-list">
          <div v-for="stat in combatStats" :key="stat.key" class="cm-stat-row">
            <v-icon :color="stat.color" size="15" class="cm-stat-icon">{{ stat.icon }}</v-icon>
            <span class="cm-stat-name">{{ stat.label }}</span>
            <div class="cm-stat-bar-wrap">
              <div class="cm-stat-bar" :style="{ width: cmStatPercent(stat.value) + '%', background: stat.bg }" />
              <div
                v-if="stat.bonus > 0"
                class="cm-stat-bar cm-stat-bar-bonus"
                :style="{ width: cmStatPercent(stat.bonus) + '%', left: cmStatPercent(stat.value) + '%' }"
              />
            </div>
            <span class="cm-stat-val" :style="{ color: stat.color }">
              {{ stat.value }}<span v-if="stat.bonus > 0" class="cm-stat-bonus-val">+{{ stat.bonus }}</span>
            </span>
          </div>
        </div>

        <!-- Bônus de equipamento -->
        <div v-if="hasEquipmentBonuses" class="cm-equip-bonus-row mt-2">
          <v-icon size="13" color="#D4AF37" class="mr-1">mdi-sword-cross</v-icon>
          <span class="cm-equip-bonus-label">Poder (equipamentos)</span>
          <span class="cm-equip-bonus-power">+{{ PowerCalculationSystem.calculatePowerBreakdown(member, props.devilFruit, props.itemBonuses).equipment }} pwr</span>
        </div>

        <!-- HAKI STATS (se tiver) -->
        <div v-if="hasHakiStats" class="cm-stats-list mt-2">
          <div v-if="member.stats.armHaki > 0" class="cm-stat-row cm-haki-stat-row">
            <v-icon color="deep-purple-lighten-1" size="15" class="cm-stat-icon">mdi-shield-sword</v-icon>
            <span class="cm-stat-name">Armamento</span>
            <div class="cm-stat-bar-wrap">
              <div class="cm-stat-bar" :style="{ width: cmHakiPercent(member.stats.armHaki) + '%', background: 'linear-gradient(90deg,#4A148C,#AB47BC)' }" />
            </div>
            <div class="cm-haki-val-col">
              <span class="cm-stat-val" style="color:#AB47BC">{{ member.stats.armHaki }}</span>
              <span class="cm-haki-tier" :style="{ color: GameLogic.hakiTier(member.stats.armHaki, 'arm').color }">{{ GameLogic.hakiTier(member.stats.armHaki, 'arm').name }}</span>
            </div>
          </div>
          <div v-if="member.stats.obsHaki > 0" class="cm-stat-row cm-haki-stat-row">
            <v-icon color="cyan-lighten-1" size="15" class="cm-stat-icon">mdi-eye-circle</v-icon>
            <span class="cm-stat-name">Observação</span>
            <div class="cm-stat-bar-wrap">
              <div class="cm-stat-bar" :style="{ width: cmHakiPercent(member.stats.obsHaki) + '%', background: 'linear-gradient(90deg,#006064,#26C6DA)' }" />
            </div>
            <div class="cm-haki-val-col">
              <span class="cm-stat-val" style="color:#26C6DA">{{ member.stats.obsHaki }}</span>
              <span class="cm-haki-tier" :style="{ color: GameLogic.hakiTier(member.stats.obsHaki, 'obs').color }">{{ GameLogic.hakiTier(member.stats.obsHaki, 'obs').name }}</span>
            </div>
          </div>
          <div v-if="member.stats.kingHaki > 0" class="cm-stat-row cm-haki-stat-row">
            <v-icon color="amber-lighten-1" size="15" class="cm-stat-icon">mdi-crown</v-icon>
            <span class="cm-stat-name">Do Rei</span>
            <div class="cm-stat-bar-wrap">
              <div class="cm-stat-bar" :style="{ width: cmHakiPercent(member.stats.kingHaki) + '%', background: 'linear-gradient(90deg,#E65100,#FFA726)' }" />
            </div>
            <div class="cm-haki-val-col">
              <span class="cm-stat-val" style="color:#FFA726">{{ member.stats.kingHaki }}</span>
              <span class="cm-haki-tier" :style="{ color: GameLogic.hakiTier(member.stats.kingHaki, 'king').color }">{{ GameLogic.hakiTier(member.stats.kingHaki, 'king').name }}</span>
            </div>
          </div>
        </div>
      </div>
  
      
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
import { PowerCalculationSystem } from '@/utils/powerCalculationSystem'
import type { Character, DevilFruit } from '@/utils/database'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'
import WantedPoster from '@/components/WantedPoster.vue'

interface Props {
  member: Character
  isCaptain: boolean
  style: string
  devilFruit: DevilFruit | null
  itemBonuses?: { attack?: number; defense?: number; speed?: number; intelligence?: number; skill?: number }
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

const combatStats = computed(() => {
  const s = props.member.stats
  const b = props.itemBonuses ?? {}
  return [
    { key: 'attack',       label: 'Ataque',      icon: 'mdi-sword',    color: '#EF5350', bg: 'linear-gradient(90deg,#8B0000,#EF5350)', value: s.attack       || 0, bonus: b.attack       || 0 },
    { key: 'defense',      label: 'Defesa',       icon: 'mdi-shield',   color: '#42A5F5', bg: 'linear-gradient(90deg,#003087,#42A5F5)', value: s.defense      || 0, bonus: b.defense      || 0 },
    { key: 'speed',        label: 'Velocidade',   icon: 'mdi-run-fast', color: '#66BB6A', bg: 'linear-gradient(90deg,#1B5E20,#66BB6A)', value: s.speed        || 0, bonus: b.speed        || 0 },
    { key: 'intelligence', label: 'Inteligência', icon: 'mdi-brain',    color: '#AB47BC', bg: 'linear-gradient(90deg,#4A148C,#AB47BC)', value: s.intelligence || 0, bonus: b.intelligence || 0 },
    { key: 'skill',        label: 'Habilidade',   icon: 'mdi-feather',  color: '#FFA726', bg: 'linear-gradient(90deg,#E65100,#FFA726)', value: s.skill        || 0, bonus: b.skill        || 0 },
  ]
})

const hasEquipmentBonuses = computed(() => {
  const b = props.itemBonuses
  if (!b) return false
  return Object.values(b).some(v => (v ?? 0) > 0)
})

const maxStatValue = computed(() => {
  const values = combatStats.value.map(s => s.value + s.bonus)
  return values.length > 0 ? Math.max(...values) : 1
})

const cmStatPercent = (value: number) => {
  const max = maxStatValue.value
  if (max === 0) return 0
  return Math.min(100, Math.max(0, (value / max) * 100))
}

const cmHakiPercent = (value: number) => {
  const s = props.member.stats
  const maxHaki = Math.max(s.armHaki || 0, s.obsHaki || 0, s.kingHaki || 0)
  if (maxHaki === 0) return 0
  return Math.min(100, Math.max(0, (value / maxHaki) * 100))
}

// ✅ METHODS
const calculatePower = (character: Character): number => {
  return GameLogic.calculatePower(character, props.devilFruit, props.itemBonuses)
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
/* ============================================================
   CrewMemberCard - Member display card
   ============================================================ */

.crew-member-card {
  background: #132235;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.crew-member-card:hover {
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 16px rgba(212, 175, 55, 0.18);
  transform: translateY(-3px);
}

.crew-member-card.is-captain {
  border-color: rgba(255, 215, 0, 0.45);
  background: linear-gradient(135deg, rgba(212,175,55,0.07), #132235);
}

.crew-member-card.is-player {
  border-color: rgba(255, 107, 53, 0.5);
  background: linear-gradient(135deg, rgba(255,107,53,0.07), #132235);
}

.card-avatar-section {
  padding: 16px 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-body { padding: 8px 14px 14px; flex: 1; }

.member-name {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #E8D5A3;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role {
  font-size: 0.7rem;
  color: #8B9DC3;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  text-align: center;
  margin-bottom: 8px;
}

.member-level-badge {
  display: block;
  text-align: center;
  padding: 1px 8px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #D4AF37;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  margin: 0 auto 8px;
}

.member-stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #8B9DC3;
  padding: 3px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.member-stat-row:last-child { border-bottom: none; }

.member-stat-value { color: #E8D5A3; font-weight: 600; }

.combat-style-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #90CAF9;
  background: rgba(144, 202, 249, 0.1);
  border: 1px solid rgba(144, 202, 249, 0.25);
}

.captain-crown {
  position: absolute;
  top: -2px;
  right: -2px;
  background: linear-gradient(135deg, #866700, #FFD700);
  color: #0D1B2E;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  box-shadow: 0 2px 8px rgba(212,175,55,0.4);
}

/* ─── Combat stat bar rows ─── */
.cm-section-label {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #B0BFDA;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(212,175,55,0.15);
}

.cm-stats-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cm-stat-row {
  display: grid;
  grid-template-columns: 18px 82px 1fr 32px;
  align-items: center;
  gap: 7px;
}

.cm-stat-icon { justify-self: center; }

.cm-stat-name {
  font-size: 0.76rem;
  color: #B0BFDA;
  white-space: nowrap;
}

.cm-stat-bar-wrap {
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.cm-stat-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
  position: absolute;
  top: 0;
  left: 0;
}

.cm-stat-bar-bonus {
  background: linear-gradient(90deg, rgba(212,175,55,0.5), rgba(212,175,55,0.85)) !important;
}

.cm-stat-val {
  font-size: 0.76rem;
  font-weight: 700;
  text-align: right;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
}

.cm-stat-bonus-val {
  font-size: 0.62rem;
  color: #D4AF37;
  margin-left: 1px;
  font-weight: 700;
}

.cm-equip-bonus-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 6px;
  background: rgba(212,175,55,0.08);
  border: 1px solid rgba(212,175,55,0.2);
}

.cm-equip-bonus-label {
  font-size: 0.68rem;
  color: #D4AF37;
  flex: 1;
}

.cm-equip-bonus-power {
  font-size: 0.68rem;
  font-weight: 700;
  color: #D4AF37;
}

.cm-haki-stat-row { grid-template-columns: 18px 82px 1fr auto; }

.cm-haki-val-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  min-width: 48px;
}

.cm-haki-tier {
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 1;
  text-align: right;
  letter-spacing: 0.03em;
  opacity: 0.9;
}
</style>