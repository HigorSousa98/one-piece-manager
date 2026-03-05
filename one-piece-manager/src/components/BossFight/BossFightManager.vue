<template>
  <div class="boss-fight-manager">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">⏳</div>
      <p>Carregando sistema de Boss Fight...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <p>{{ error }}</p>
      <button @click="retry" class="retry-btn">🔄 Tentar Novamente</button>
    </div>

    <!-- Boss Fight Ativo -->
    <BossFightArena
      v-else-if="hasActiveBossFight"
      :current-boss-fight="currentBossFight"
      :next-opponent="nextOpponent"
      :available-members="availableMembers"
      :loading="loading"
      :progress="currentBattleProgress"
      :boss-type="bossType"
      @exit="exitBossFight"
      @battle="executeBattle"
      ref="arenaRef"
    />

    <!-- Detecção de Bosses -->
    <div v-else class="boss-detection">
      <div class="detection-header">
        <h2>🏴‍☠️ Algozes Detectados</h2>
        <p v-if="!hasBossesOnIsland" class="no-bosses">
          Nenhum algoz detectado nesta ilha.
        </p>
      </div>

      <div v-if="hasBossesOnIsland" class="detected-bosses">
        <BossDetectionCard
          v-for="boss in detectedBosses"
          :key="`${boss.type}-${boss.bossId}`"
          :boss="boss"
          :loading="loading"
          @challenge="challengeBoss"
        />
      </div>

      <div class="detection-actions">
        <button @click="refreshDetection" :disabled="loading" class="refresh-btn">
          <span v-if="loading">⏳</span>
          <span v-else>🔄</span>
          {{ loading ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <div class="confirm-modal" @click.stop>
        <h3>⚠️ Confirmar Desafio</h3>
        <p>
          Você está prestes a desafiar <strong>{{ selectedBoss?.captain.name }}</strong> 
          ({{ selectedBoss?.type }}) e sua tripulação.
        </p>
        <div class="warning-info">
          <p>🔥 <strong>Atenção:</strong></p>
          <ul>
            <li>Esta será uma série de batalhas consecutivas</li>
            <li>Membros derrotados não poderão lutar novamente</li>
            <li>Se perder, será expulso da ilha</li>
            <li>Se vencer, receberá recompensas massivas</li>
          </ul>
        </div>
        <div class="modal-actions">
          <button @click="closeConfirmModal" class="cancel-btn">
            ❌ Cancelar
          </button>
          <button @click="confirmChallenge" :disabled="loading" class="confirm-btn">
            <span v-if="loading">⏳ Iniciando...</span>
            <span v-else>⚔️ Confirmar Desafio</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useBossFight } from '@/composables/useBossFight'
import BossDetectionCard from './BossDetectionCard.vue'
import BossFightArena from './BossFightArena.vue'
import type { DetectedBoss } from '@/utils/bossDetectionSystem'

interface Props {
  playerCrewId: number
  currentIslandId: number
}

const props = defineProps<Props>()

const {
  detectedBosses,
  currentBossFight,
  nextOpponent,
  availableMembers,
  loading,
  error,
  hasBossesOnIsland,
  hasActiveBossFight,
  currentBattleProgress,
  bossType,
  detectBosses,
  checkActiveFight,
  startBossFight,
  executeBattle: executeBattleAction,
  clearState
} = useBossFight(props.playerCrewId, props.currentIslandId)

const showConfirmModal = ref(false)
const selectedBoss = ref<DetectedBoss | null>(null)
const arenaRef = ref<InstanceType<typeof BossFightArena> | null>(null)

// ✅ MÉTODOS
const challengeBoss = (boss: DetectedBoss) => {
  selectedBoss.value = boss
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  selectedBoss.value = null
}

const confirmChallenge = async () => {
  if (!selectedBoss.value) return
  
  try {
    await startBossFight(selectedBoss.value)
    closeConfirmModal()
  } catch (error) {
    console.error('Erro ao iniciar boss fight:', error)
  }
}

const executeBattle = async (fighterId: number) => {
  try {
    const result = await executeBattleAction(fighterId)
    
    // ✅ ENVIAR RESULTADO PARA A ARENA
    if (arenaRef.value && result) {
      arenaRef.value.setBattleResult(result)
    }
  } catch (error) {
    console.error('Erro ao executar batalha:', error)
  }
}

const exitBossFight = () => {
  clearState()
}

const refreshDetection = async () => {
  await detectBosses()
}

const retry = async () => {
  await checkActiveFight()
  await detectBosses()
}

// ✅ LIFECYCLE
onMounted(async () => {
  await checkActiveFight()
  await detectBosses()
})

// ✅ WATCHERS
watch(() => props.currentIslandId, async (newIslandId) => {
  if (newIslandId) {
    clearState()
    await detectBosses()
  }
})
</script>

<style scoped>
/* ============================================================
   BossFightManager - Boss fight coordinator
   ============================================================ */

.boss-manager-container {
  max-width: 900px;
  margin: 0 auto;
}

.boss-list-header {
  background: linear-gradient(135deg, rgba(198,40,40,0.12), rgba(139,0,0,0.08));
  border: 1px solid rgba(198,40,40,0.3);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.boss-list-title {
  font-family: Georgia, serif;
  font-size: 1rem;
  font-weight: 700;
  color: #FF5252;
  letter-spacing: 0.04em;
}

.boss-count-badge {
  background: rgba(198,40,40,0.15);
  border: 1px solid rgba(198,40,40,0.35);
  color: #FF5252;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
}

.no-boss-state {
  text-align: center;
  padding: 48px 24px;
  color: #546E7A;
}

.no-boss-icon {
  font-size: 3.5rem;
  opacity: 0.3;
  margin-bottom: 12px;
  display: block;
}

.no-boss-text {
  font-family: Georgia, serif;
  font-size: 1rem;
}
</style>