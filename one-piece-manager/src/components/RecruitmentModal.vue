<!-- src/components/RecruitmentModal.vue -->

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      
      <!-- RESULTADO NÃO MOSTRADO AINDA -->
      <div v-if="!result">
        <!-- CABEÇALHO -->
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            🤝 Tentar Recrutamento
          </h2>
          <p class="text-gray-600">
            {{ recruiter.name }} quer recrutar {{ target.name }}
          </p>
        </div>
        
        <!-- RECRUTAMENTO POSSÍVEL -->
        <div v-if="recruitmentInfo.canRecruit">
          <!-- INFORMAÇÕES DO RECRUTAMENTO -->
          <div class="space-y-4 mb-6">
            
            <!-- CHANCE DE SUCESSO -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold">Chance de Sucesso:</span>
                <span :class="`font-bold ${getRiskColor(recruitmentInfo.riskAssessment)}`">
                  {{ recruitmentInfo.chancePercentage }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  :class="`h-2 rounded-full ${getRiskBarColor(recruitmentInfo.riskAssessment)}`"
                  :style="{ width: `${recruitmentInfo.chancePercentage}%` }"
                />
              </div>
            </div>
            
            <!-- TIPO DE RECRUTAMENTO -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold">Tipo:</span>
                <span :class="recruitmentData.kindnessEffect === 'peaceful' ? 'text-green-600' : 'text-red-600'">
                  {{ recruitmentData.kindnessEffect === 'peaceful' ? '🤝 Pacífico' : '⚔️ Forçado' }}
                </span>
              </div>
              <p class="text-sm text-gray-600">
                Kindness: {{ recruiter.kindness }} ({{ getKindnessDescription(recruiter.kindness) }})
              </p>
            </div>
            
            <!-- LOYALTY INICIAL -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="font-semibold">Loyalty Inicial:</span>
                <span :class="recruitmentInfo.loyaltyPreview >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ recruitmentInfo.loyaltyPreview }}
                </span>
              </div>
            </div>
            
            <!-- DETALHES ADICIONAIS -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-semibold mb-2">📊 Fatores:</h4>
              <div class="text-sm text-gray-600 space-y-1">
                <div class="flex justify-between">
                  <span>Diferença de Level:</span>
                  <span>{{ recruiter.level - target.level > 0 ? '+' : '' }}{{ recruiter.level - target.level }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Loyalty do Alvo:</span>
                  <span>{{ target.loyalty }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Compatibilidade:</span>
                  <span class="text-green-600">✅ {{ recruiter.type }} → {{ target.type }}</span>
                </div>
              </div>
            </div>
            
            <!-- RECOMENDAÇÃO -->
            <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p class="text-sm text-blue-800">
                <strong>Recomendação:</strong> {{ recruitmentInfo.recommendation }}
              </p>
            </div>
            
          </div>
          
          <!-- BOTÕES -->
          <div class="flex space-x-3">
            <button
              @click="handleAttemptRecruitment"
              :disabled="isAttempting"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isAttempting ? '🎲 Tentando...' : '🤝 Tentar Recrutar' }}
            </button>
            
            <button
              @click="$emit('close')"
              class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
        
        <!-- RECRUTAMENTO NÃO POSSÍVEL -->
        <div v-else class="text-center mb-6">
          <div class="text-6xl mb-4">❌</div>
          <p class="text-gray-600 mb-4">
            {{ recruitmentData.reason }}
          </p>
          <button
            @click="$emit('close')"
            class="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
      
      <!-- RESULTADO DO RECRUTAMENTO -->
      <div v-else class="text-center">
        <div class="text-6xl mb-4">
          {{ result.success ? '🎉' : '��' }}
        </div>
        
        <h3 class="text-xl font-bold mb-4">
          {{ result.success ? 'Recrutamento Bem-sucedido!' : 'Recrutamento Falhou' }}
        </h3>
        
        <p class="text-gray-600 mb-4">
          {{ result.message }}
        </p>
        
        <p v-if="result.bonusMessage" class="text-sm text-blue-600 mb-4">
          {{ result.bonusMessage }}
        </p>
        
        <!-- INFORMAÇÕES ADICIONAIS SE BEM-SUCEDIDO -->
        <div v-if="result.success" class="bg-green-50 p-4 rounded-lg mb-4">
          <h4 class="font-semibold text-green-800 mb-2">🎯 Resultado:</h4>
          <div class="text-sm text-green-700 space-y-1">
            <div>• {{ target.name }} agora faz parte do crew de {{ recruiter.name }}</div>
            <div>• Loyalty inicial: {{ result.newLoyalty }}</div>
            <div>• Tipo de recrutamento: {{ recruitmentData.kindnessEffect === 'peaceful' ? 'Pacífico' : 'Forçado' }}</div>
          </div>
        </div>
        
        <button
          @click="$emit('close')"
          class="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continuar
        </button>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RecruitmentSystem, type RecruitmentAttempt } from '@/utils/recruitmentSystem'
import type { Character } from '@/utils/database'

// 🎯 PROPS
interface Props {
  isOpen: boolean
  recruiter: Character
  target: Character
  recruitmentData: RecruitmentAttempt
}

const props = defineProps<Props>()

// �� EMITS
const emit = defineEmits<{
  close: []
  recruitmentSuccess: [target: Character, newLoyalty: number]
  recruitmentFailed: [target: Character]
}>()

// 🎯 REACTIVE DATA
const isAttempting = ref(false)
const result = ref<any>(null)

// �� COMPUTED
const recruitmentInfo = computed(() => {
  return RecruitmentSystem.getRecruitmentInfo(props.recruiter, props.target, props.recruitmentData)
})

// �� METHODS
const getRiskColor = (risk: string): string => {
  switch (risk) {
    case 'low': return 'text-green-600'
    case 'medium': return 'text-yellow-600'
    case 'high': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

const getRiskBarColor = (risk: string): string => {
  switch (risk) {
    case 'low': return 'bg-green-500'
    case 'medium': return 'bg-yellow-500'
    case 'high': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getKindnessDescription = (kindness: number): string => {
  if (kindness >= 50) return 'Muito Bondoso'
  if (kindness >= 0) return 'Bondoso'
  if (kindness >= -50) return 'Neutro/Cruel'
  return 'Muito Cruel'
}

const handleAttemptRecruitment = async (): Promise<void> => {
  isAttempting.value = true
  
  try {
    const recruitmentResult = await RecruitmentSystem.attemptRecruitment(
      props.recruiter,
      props.target,
      props.recruitmentData
    )
    
    result.value = recruitmentResult
    
    // Emitir eventos baseados no resultado
    if (recruitmentResult.success) {
      emit('recruitmentSuccess', props.target, recruitmentResult.newLoyalty!)
    } else {
      emit('recruitmentFailed', props.target)
    }
    
  } catch (error) {
    console.error('Erro no recrutamento:', error)
    result.value = {
      success: false,
      message: 'Erro interno durante o recrutamento'
    }
  } finally {
    isAttempting.value = false
  }
}

// �� WATCH para resetar quando modal abre/fecha
import { watch } from 'vue'

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // Reset quando modal abre
    result.value = null
    isAttempting.value = false
  }
})
</script>

<style scoped>
/* RecruitmentModal - Pirate recruitment dialog */

.recruitment-modal-header {
  background: linear-gradient(135deg, rgba(46,125,50,0.15), rgba(212,175,55,0.06));
  border-bottom: 1px solid rgba(46,125,50,0.3);
  padding: 16px 20px;
}

.recruitment-title {
  font-family: Georgia, serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #81C784;
  letter-spacing: 0.04em;
}

.candidate-preview {
  background: rgba(212,175,55,0.06);
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  margin: 12px 0;
}

.candidate-name {
  font-family: Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #D4AF37;
  margin-bottom: 4px;
}

.candidate-info { font-size: 0.82rem; color: #8B9DC3; }

.recruitment-stats-row {
  display: flex;
  justify-content: space-around;
  gap: 12px;
  padding: 12px 0;
}

.recruitment-stat {
  text-align: center;
  flex: 1;
}

.recruitment-stat-value {
  font-family: Georgia, serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #D4AF37;
  display: block;
  margin-bottom: 2px;
}

.recruitment-stat-label {
  font-size: 0.68rem;
  color: #8B9DC3;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.kindness-bar-track {
  height: 8px;
  background: rgba(10,22,40,0.8);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
  margin: 6px 0;
}

.kindness-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.kindness-positive { background: linear-gradient(90deg, #1B5E20, #4CAF50); }
.kindness-negative { background: linear-gradient(90deg, #B71C1C, #EF5350); }

.recruit-btn {
  background: linear-gradient(135deg, #1B5E20, #2E7D32) !important;
  color: #fff !important;
  font-weight: 700 !important;
  letter-spacing: 0.05em !important;
  box-shadow: 0 4px 16px rgba(46,125,50,0.3) !important;
}
</style>