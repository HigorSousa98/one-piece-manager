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
.boss-fight-arena {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  min-height: 600px;
}

.arena-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid #333;
}

.boss-info h2 {
  margin: 0 0 12px 0;
  color: #fff;
  font-size: 28px;
}

.progress-bar {
  position: relative;
  background: #333;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  min-width: 200px;
}

.progress-fill {
  background: linear-gradient(90deg, #26de81, #20bf6b);
  height: 100%;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

.exit-btn {
  background: #ff4757;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.exit-btn:hover {
  background: #ff3742;
  transform: translateY(-2px);
}

.current-battle {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 32px;
  align-items: start;
  margin-bottom: 32px;
}

.opponent-card, .fighter-selection {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
}

.opponent-card h3, .fighter-selection h3 {
  margin: 0 0 16px 0;
  color: #fff;
  text-align: center;
}

.character-info {
  text-align: center;
}

.character-name {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8px;
}

.character-level, .character-bounty, .character-position {
  margin-bottom: 4px;
  color: #ccc;
}

.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vs-text {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 16px 24px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.available-fighters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.fighter-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fighter-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #667eea;
}

.fighter-card.selected {
  border-color: #26de81;
  background: rgba(38, 222, 129, 0.1);
}

.fighter-name {
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
}

.fighter-level, .fighter-position {
  color: #ccc;
  font-size: 14px;
}

.power-indicator {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.power-bar {
  flex: 1;
  background: #333;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.power-fill {
  background: linear-gradient(90deg, #ff6b6b, #26de81);
  height: 100%;
  transition: width 0.3s ease;
}

.power-text {
  font-size: 12px;
  color: #ccc;
  min-width: 40px;
}

.battle-actions {
  text-align: center;
}

.battle-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.battle-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.battle-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.battle-result {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.result-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 8px;
}

.result-header.victory {
  background: rgba(38, 222, 129, 0.2);
  border: 2px solid #26de81;
}

.result-header.defeat {
  background: rgba(255, 71, 87, 0.2);
  border: 2px solid #ff4757;
}

.result-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;
}

.battle-summary {
  text-align: center;
}

.rewards {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reward-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background: rgba(38, 222, 129, 0.1);
  border-radius: 6px;
}

.battle-log {
  max-height: 200px;
  overflow-y: auto;
}

.log-entries {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
}

.log-entry {
  margin-bottom: 4px;
  color: #ccc;
}

.continue-btn {
  background: linear-gradient(135deg, #26de81, #20bf6b);
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
  transition: all 0.3s ease;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(38, 222, 129, 0.3);
}

.defeated-members {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid #ff4757;
  border-radius: 8px;
  padding: 16px;
}

.defeated-members h4 {
  margin: 0 0 12px 0;
  color: #ff4757;
}

.defeated-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.defeated-member {
  background: rgba(255, 71, 87, 0.2);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  color: #ff4757;
}

@media (max-width: 1024px) {
  .current-battle {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .vs-divider {
    order: 2;
  }
  
  .result-details {
    grid-template-columns: 1fr;
  }
}
</style>