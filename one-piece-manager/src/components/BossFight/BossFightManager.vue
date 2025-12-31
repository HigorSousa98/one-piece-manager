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
.boss-fight-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  color: white;
}

.loading-spinner {
  font-size: 48px;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  background: #667eea;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  margin-top: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.boss-detection {
  color: white;
}

.detection-header {
  text-align: center;
  margin-bottom: 32px;
}

.detection-header h2 {
  margin: 0 0 16px 0;
  font-size: 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.no-bosses {
  color: #888;
  font-style: italic;
  font-size: 18px;
}

.detected-bosses {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.detection-actions {
  text-align: center;
}

.refresh-btn {
  background: linear-gradient(135deg, #26de81, #20bf6b);
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(38, 222, 129, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  color: white;
  border: 2px solid #333;
}

.confirm-modal h3 {
  margin: 0 0 16px 0;
  text-align: center;
  color: #ff6b6b;
  font-size: 24px;
}

.warning-info {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.warning-info ul {
  margin: 8px 0 0 20px;
  color: #ccc;
}

.warning-info li {
  margin-bottom: 4px;
}

.modal-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.cancel-btn {
  background: #ff4757;
  color: white;
}

.cancel-btn:hover {
  background: #ff3742;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .detected-bosses {
    grid-template-columns: 1fr;
  }
  
  .confirm-modal {
    padding: 24px;
    margin: 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>