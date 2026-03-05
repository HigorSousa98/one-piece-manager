<template>
  <div class="boss-fight-arena">
    <!-- Header com progresso -->
    <div class="arena-header">
      <div class="boss-info">
        <h2>{{ bossType }} Battle</h2>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress?.percentage || 0}%` }"></div>
          <span class="progress-text">
            {{ progress?.current || 0 }} / {{ progress?.total || 0 }}
          </span>
        </div>
      </div>
      
      <button @click="$emit('exit')" class="exit-btn">
        ❌ Sair
      </button>
    </div>

    <!-- Área de combate atual -->
    <div class="current-battle" v-if="nextOpponent">
      <div class="opponent-card">
        <h3>Próximo Oponente</h3>
        <div class="character-info">
          <div class="character-name">{{ nextOpponent.name }}</div>
          <div class="character-level">Nível {{ nextOpponent.level }}</div>
          <div class="character-bounty">{{ formatBounty(nextOpponent.bounty) }}</div>
          <div class="character-position">{{ nextOpponent.position }}</div>
        </div>
      </div>

      <div class="vs-divider">
        <div class="vs-text">VS</div>
      </div>

      <div class="fighter-selection">
        <h3>Selecione seu Lutador</h3>
        <div class="available-fighters">
          <div 
            v-for="member in availableMembers" 
            :key="member.id"
            @click="selectFighter(member)"
            class="fighter-card"
            :class="{ 'selected': selectedFighter?.id === member.id }"
          >
            <div class="fighter-name">{{ member.name }}</div>
            <div class="fighter-level">Lv. {{ member.level }}</div>
            <div class="fighter-position">{{ member.position }}</div>
            <div class="power-indicator">
              <div class="power-bar">
                <div 
                  class="power-fill" 
                  :style="{ width: `${calculatePowerPercentage(member)}%` }"
                ></div>
              </div>
              <span class="power-text">{{ calculatePower(member) }}</span>
            </div>
          </div>
        </div>

        <div class="battle-actions" v-if="selectedFighter">
          <button 
            @click="startBattle"
            :disabled="loading"
            class="battle-btn"
          >
            <span v-if="loading">⏳ Lutando...</span>
            <span v-else">⚔️ Iniciar Batalha</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Resultado da batalha -->
    <div class="battle-result" v-if="lastBattleResult">
      <div class="result-header" :class="lastBattleResult.playerWon ? 'victory' : 'defeat'">
        <h3>{{ lastBattleResult.playerWon ? '🏆 Vitória!' : '💀 Derrota!' }}</h3>
      </div>
      
      <div class="result-details">
        <div class="battle-summary">
          <p><strong>{{ lastBattleResult.winner }}</strong> derrotou <strong>{{ lastBattleResult.loser }}</strong></p>
          <div class="rewards" v-if="lastBattleResult.playerWon">
            <div class="reward-item">
              <span>💰 Bounty:</span>
              <span>+{{ formatBounty(lastBattleResult.bountyGained) }}</span>
            </div>
            <div class="reward-item">
              <span>⭐ Experiência:</span>
              <span>+{{ lastBattleResult.experienceGained }}</span>
            </div>
          </div>
        </div>

        <div class="battle-log">
          <h4>Log da Batalha:</h4>
          <div class="log-entries">
            <div 
              v-for="(entry, index) in lastBattleResult.battleLog" 
              :key="index"
              class="log-entry"
            >
              {{ entry }}
            </div>
          </div>
        </div>
      </div>

      <button @click="clearResult" class="continue-btn">
        {{ bossFightCompleted ? '🎉 Finalizar' : '➡️ Próxima Batalha' }}
      </button>
    </div>

    <!-- Membros derrotados -->
    <div class="defeated-members" v-if="defeatedMembers.length > 0">
      <h4>Membros Derrotados:</h4>
      <div class="defeated-list">
        <div 
          v-for="member in defeatedMembers" 
          :key="member.id"
          class="defeated-member"
        >
          {{ member.name }} ({{ member.position }})
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Character, BossFight } from '@/utils/database'

interface Props {
  currentBossFight: BossFight | null
  nextOpponent: Character | null
  availableMembers: Character[]
  loading: boolean
  progress: { current: number; total: number; percentage: number } | null
  bossType: string | null
}

interface BattleResult {
  playerWon: boolean
  winner: string
  loser: string
  bountyGained: number
  experienceGained: number
  battleLog: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  exit: []
  battle: [fighterId: number]
}>()

const selectedFighter = ref<Character | null>(null)
const lastBattleResult = ref<BattleResult | null>(null)
const bossFightCompleted = ref(false)
const defeatedMembers = ref<Character[]>([])

const selectFighter = (fighter: Character) => {
  selectedFighter.value = fighter
}

const startBattle = () => {
  if (selectedFighter.value) {
    emit('battle', selectedFighter.value.id!)
  }
}

const clearResult = () => {
  lastBattleResult.value = null
  selectedFighter.value = null
  
  if (bossFightCompleted.value) {
    emit('exit')
  }
}

const calculatePower = (character: Character): number => {
  // Cálculo simplificado de poder
  return Math.floor(
    character.level * 10 + 
    character.stats.attack + 
    character.stats.defense + 
    character.stats.speed
  )
}

const calculatePowerPercentage = (character: Character): number => {
  if (!props.nextOpponent) return 50
  
  const playerPower = calculatePower(character)
  const opponentPower = calculatePower(props.nextOpponent)
  const maxPower = Math.max(playerPower, opponentPower)
  
  return Math.min(100, (playerPower / maxPower) * 100)
}

const formatBounty = (bounty: number): string => {
  if (bounty >= 1000000000) {
    return `${(bounty / 1000000000).toFixed(1)}B`
  } else if (bounty >= 1000000) {
    return `${(bounty / 1000000).toFixed(0)}M`
  } else if (bounty >= 1000) {
    return `${(bounty / 1000).toFixed(0)}K`
  }
  return bounty.toString()
}

// Método para receber resultado da batalha (chamado pelo componente pai)
const setBattleResult = (result: any) => {
  lastBattleResult.value = {
    playerWon: result.winner.id === selectedFighter.value?.id,
    winner: result.winner.name,
    loser: result.loser.name,
    bountyGained: result.bountyChange || 0,
    experienceGained: result.experienceGained || 0,
    battleLog: result.battleLog || []
  }
  
  bossFightCompleted.value = result.bossFightCompleted || false
  
  // Adicionar membro derrotado à lista
  if (!lastBattleResult.value.playerWon && selectedFighter.value) {
    defeatedMembers.value.push(selectedFighter.value)
  }
}

defineExpose({
  setBattleResult
})
</script>

<style scoped>
/* ============================================================
   BossFightArena - Dark battle arena
   ============================================================ */

.battle-arena {
  background: linear-gradient(180deg, #0A0808, #150A0A, #0D1B2E);
  border: 1px solid rgba(198, 40, 40, 0.4);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.arena-stage {
  padding: 20px;
  position: relative;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.arena-stage::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(198, 40, 40, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.combatant-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
}

.combatant-block {
  flex: 1;
  text-align: center;
}

.combatant-name {
  font-family: Georgia, serif;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.combatant-name.player { color: #D4AF37; }
.combatant-name.boss   { color: #FF5252; text-shadow: 0 0 10px rgba(255,82,82,0.4); }

.hp-bar-wrapper { margin: 6px 0; }

.hp-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #8B9DC3;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 4px;
}

.hp-bar-track {
  height: 10px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.04);
}

.hp-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease;
}

.hp-bar-fill.player-hp { background: linear-gradient(90deg, #1B5E20, #4CAF50); }
.hp-bar-fill.boss-hp   { background: linear-gradient(90deg, #B71C1C, #EF5350); }

.skill-btn {
  background: rgba(212, 175, 55, 0.1) !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  color: #D4AF37 !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.skill-btn:hover {
  background: rgba(212, 175, 55, 0.2) !important;
  border-color: rgba(212, 175, 55, 0.6) !important;
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.25) !important;
}

.skill-btn.attack {
  background: linear-gradient(135deg, rgba(198,40,40,0.15), rgba(139,0,0,0.1)) !important;
  border-color: rgba(198, 40, 40, 0.4) !important;
  color: #EF5350 !important;
}

.turn-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  animation: turn-pulse 1.5s ease-in-out infinite;
}

.turn-player { color: #D4AF37; background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.35); }
.turn-boss   { color: #FF5252; background: rgba(239,83,80,0.12);  border: 1px solid rgba(239,83,80,0.35); }

@keyframes turn-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>