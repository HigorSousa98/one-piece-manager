<!-- src/components/BattleResultScreen.vue -->

<template>
  <div class="battle-result-screen p-6">
    <!-- RESULTADO DA BATALHA -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-4">
        {{ battleResult.winner.id === playerCharacter?.id ? '🏆 VITÓRIA!' : '💔 DERROTA!' }}
      </h1>
      
      <div class="bg-white rounded-lg p-6 shadow-lg">
        <div class="grid grid-cols-2 gap-6">
          <!-- VENCEDOR -->
          <div class="text-center">
            <h3 class="text-xl font-semibold text-green-600 mb-2">🏆 Vencedor</h3>
            <div class="bg-green-50 p-4 rounded-lg">
              <p class="font-bold">{{ battleResult.winner.name }}</p>
              <p class="text-sm text-gray-600">{{ battleResult.winner.type }} - Level {{ battleResult.winner.level }}</p>
              <p class="text-sm text-green-600">Bounty: {{ battleResult.winner.bounty.toLocaleString() }}</p>
            </div>
          </div>
          
          <!-- PERDEDOR -->
          <div class="text-center">
            <h3 class="text-xl font-semibold text-red-600 mb-2">💔 Perdedor</h3>
            <div class="bg-red-50 p-4 rounded-lg">
              <p class="font-bold">{{ battleResult.loser.name }}</p>
              <p class="text-sm text-gray-600">{{ battleResult.loser.type }} - Level {{ battleResult.loser.level }}</p>
              <p class="text-sm text-red-600">Bounty: {{ battleResult.loser.bounty.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- RECOMPENSAS -->
    <div v-if="battleRewards" class="bg-blue-50 p-6 rounded-lg mb-6">
      <h3 class="text-xl font-semibold text-blue-800 mb-4">🎁 Recompensas</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-semibold">Experiência:</span>
          <span class="text-green-600 ml-2">+{{ battleRewards.expGained }}</span>
        </div>
        <div>
          <span class="font-semibold">Bounty:</span>
          <span class="text-yellow-600 ml-2">+{{ battleRewards.bountyGained.toLocaleString() }}</span>
        </div>
        <div>
          <span class="font-semibold">Treasury:</span>
          <span class="text-yellow-600 ml-2">+{{ battleRewards.treasuryStole.toLocaleString() }}</span>
        </div>
      </div>
    </div>
    
    <!-- BOTÃO DE RECRUTAMENTO -->
    <div v-if="battleResult.canShowRecruitment && battleResult.winner.id === playerCharacter?.id" class="text-center mb-6">
      <div class="bg-yellow-50 p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
        <p class="text-yellow-800">
          <strong>💡 Oportunidade de Recrutamento!</strong><br>
          Você pode tentar recrutar {{ battleResult.loser.name }} para seu crew.
        </p>
      </div>
      
      <button
        @click="showRecruitmentModal = true"
        class="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold transition-colors"
      >
        �� Tentar Recrutar {{ battleResult.loser.name }}
      </button>
    </div>
    
    <!-- BOTÕES DE AÇÃO -->
    <div class="flex justify-center space-x-4">
      <button
        @click="$emit('continueBattle')"
        class="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
      >
        ⚔️ Continuar Aventura
      </button>
      
      <button
        @click="$emit('returnToBase')"
        class="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
      >
        🏠 Voltar à Base
      </button>
    </div>
    
    <!-- MODAL DE RECRUTAMENTO -->
    <RecruitmentModal
      :is-open="showRecruitmentModal"
      :recruiter="battleResult.winner"
      :target="battleResult.loser"
      :recruitment-data="battleResult.recruitmentData!"
      @close="showRecruitmentModal = false"
      @recruitment-success="handleRecruitmentSuccess"
      @recruitment-failed="handleRecruitmentFailed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RecruitmentModal from './RecruitmentModal.vue'
import type { Character } from '@/utils/database'

// 🎯 INTERFACES
interface BattleResult {
  winner: Character
  loser: Character
  battleType: 'adventure' | 'crew_battle'
  canShowRecruitment: boolean
  recruitmentData?: any
}

interface BattleRewards {
  expGained: number
  bountyGained: number
  treasuryStole: number
  leveledUp?: boolean
  newLevel?: number
}

// 🎯 PROPS
interface Props {
  battleResult: BattleResult
  battleRewards?: BattleRewards
  playerCharacter?: Character
}

const props = defineProps<Props>()

// 🎯 EMITS
const emit = defineEmits<{
  continueBattle: []
  returnToBase: []
  recruitmentCompleted: [success: boolean, target: Character]
}>()

// 🎯 REACTIVE DATA
const showRecruitmentModal = ref(false)

// �� METHODS
const handleRecruitmentSuccess = (target: Character, newLoyalty: number): void => {
  console.log(`🎉 Recrutamento bem-sucedido: ${target.name} com loyalty ${newLoyalty}`)
  showRecruitmentModal.value = false
  emit('recruitmentCompleted', true, target)
}

const handleRecruitmentFailed = (target: Character): void => {
  console.log(`😔 Recrutamento falhou: ${target.name}`)
  showRecruitmentModal.value = false
  emit('recruitmentCompleted', false, target)
}
</script>

<style scoped>
.battle-result-screen {
  max-width: 800px;
  margin: 0 auto;
}

.transition-colors {
  transition: background-color 0.2s ease-in-out;
}
</style>