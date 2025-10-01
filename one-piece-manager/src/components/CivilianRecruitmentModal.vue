<!-- src/components/CivilianRecruitmentModal.vue -->
<template>
  <v-card>
    <v-card-title class="text-center bg-primary text-white">
      <v-icon left color="white">mdi-account-plus</v-icon>
      Recrutamento de Civil
    </v-card-title>
    
    <v-card-text class="pa-6">
      
      <!-- INFORMAÇÕES DO CIVIL -->
      <div v-if="civilian && !recruitmentResult" class="civilian-info mb-4">
        <v-card variant="outlined" color="blue-darken-1">
          <v-card-text class="pa-4">
            <div class="d-flex align-center mb-3">
              <v-avatar color="primary" size="60" class="mr-4">
                <span class="text-h5">👤</span>
              </v-avatar>
              <div>
                <div class="text-h6">{{ civilian.name }}</div>
                <div class="text-body-2">{{ civilian.type }} • Level {{ civilian.level }}</div>
              </div>
            </div>
            
            <v-row>
              <v-col cols="6">
                <div class="text-center">
                  <div class="text-caption">Kindness</div>
                  <v-chip :color="getKindnessColor(civilian.kindness)" variant="elevated">
                    {{ civilian.kindness }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="text-center">
                  <div class="text-caption">Loyalty Atual</div>
                  <v-chip :color="getLoyaltyColor(civilian.loyalty)" variant="elevated">
                    {{ civilian.loyalty }}
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
      
      <!-- ANÁLISE DE RECRUTAMENTO -->
      <div v-if="recruitmentAnalysis && !recruitmentResult && !isLoading" class="recruitment-analysis mb-4">
        <v-card variant="outlined" :color="getAnalysisColor(recruitmentAnalysis.baseChance)">
          <v-card-title class="text-center">
            <v-icon left>mdi-calculator</v-icon>
            Análise de Recrutamento
          </v-card-title>
          
          <v-card-text class="pa-4">
            
            <!-- CHANCE TOTAL -->
            <div class="text-h6 mb-3 text-center">
              Chance de Sucesso: 
              <v-chip 
                :color="getChanceColor(recruitmentAnalysis.totalChance)" 
                size="large" 
                variant="elevated"
              >
                <strong>{{ Math.round(recruitmentAnalysis.totalChance) }}%</strong>
              </v-chip>
            </div>
            
            <!-- BARRA DE PROGRESSO VISUAL -->
            <div class="chance-visual mb-4">
              <v-progress-linear
                :model-value="recruitmentAnalysis.totalChance"
                :color="getChanceColor(recruitmentAnalysis.totalChance)"
                height="20"
                rounded
              >
                <template v-slot:default>
                  <strong :class="Math.round(recruitmentAnalysis.totalChance) >= 52 ? 'text-white' : 'text-black'">{{ Math.round(recruitmentAnalysis.totalChance) }}%</strong>
                </template>
              </v-progress-linear>
            </div>
            
            <!-- DICA RÁPIDA -->
            <v-alert 
              :type="getAdviceType(recruitmentAnalysis.totalChance)" 
              variant="tonal"
              class="text-center"
            >
              {{ getAdviceText(recruitmentAnalysis.totalChance) }}
            </v-alert>
            
          </v-card-text>
        </v-card>
      </div>
      
      <!-- LOADING STATE -->
      <div v-if="isLoading" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <div class="text-body-1 mt-2">Carregando análise...</div>
      </div>
      
      <!-- RESULTADO DO RECRUTAMENTO -->
      <div v-if="recruitmentResult" class="recruitment-result">
        <v-card 
          :color="recruitmentResult.success ? 'success-darken-1' : 'error-darken-1'"
          variant="elevated"
          class="text-center pa-6"
        >
          <div class="result-icon mb-4">
            <v-avatar 
              :color="recruitmentResult.success ? 'success' : 'error'" 
              size="80"
            >
              <v-icon size="50" color="white">
                {{ recruitmentResult.success ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
            </v-avatar>
          </div>
          
          <div class="text-h5 mb-3" :class="recruitmentResult.success ? 'text-success-darken-2' : 'text-error-darken-2'">
            {{ recruitmentResult.success ? '🎉 Recrutamento Bem-Sucedido!' : '😔 Recrutamento Falhou' }}
          </div>
          
          <div class="text-h6 mb-4">{{ recruitmentResult.message }}</div>
          
          <!-- INFORMAÇÕES DE LOYALTY -->
          <div v-if="recruitmentResult.newLoyalty !== undefined" class="loyalty-info mb-4">
            <v-card variant="outlined" class="pa-3">
              <div class="text-body-1 mb-2">
                <strong>{{ recruitmentResult.success ? 'Nova Loyalty:' : 'Loyalty após tentativa:' }}</strong>
              </div>
              <v-chip 
                :color="recruitmentResult.success ? 'success' : 'warning'" 
                size="large" 
                variant="elevated"
              >
                <strong>{{ recruitmentResult.newLoyalty }}</strong>
                <span v-if="recruitmentResult.loyaltyChange" class="ml-2">
                  ({{ recruitmentResult.loyaltyChange > 0 ? '+' : '' }}{{ recruitmentResult.loyaltyChange }})
                </span>
              </v-chip>
            </v-card>
          </div>
          
          <!-- MENSAGEM ADICIONAL PARA SUCESSO -->
          <div v-if="recruitmentResult.success" class="success-message">
            <v-alert type="success" variant="tonal">
              <strong>{{ civilian?.name }}</strong> agora faz parte do seu crew!
            </v-alert>
          </div>
          
          <!-- MENSAGEM ADICIONAL PARA FALHA -->
          <div v-if="!recruitmentResult.success" class="failure-message">
            <v-alert type="info" variant="tonal">
              Não desanime! Você pode tentar recrutar outros civis no futuro.
            </v-alert>
          </div>
        </v-card>
      </div>
      
    </v-card-text>
    
    <v-card-actions class="pa-6">
      <!-- BOTÕES ANTES DO RESULTADO -->
      <template v-if="!recruitmentResult">
        <v-btn
          color="grey"
          variant="outlined"
          @click="$emit('close')"
          :disabled="isAttempting"
        >
          Cancelar
        </v-btn>
        
        <v-spacer></v-spacer>
        
        <v-btn
          color="primary"
          variant="elevated"
          @click="attemptRecruitment"
          :disabled="isAttempting || isLoading || !recruitmentAnalysis || attempted"
          :loading="isAttempting"
          size="large"
        >
          <v-icon left>mdi-handshake</v-icon>
          Tentar Recrutar
        </v-btn>
      </template>
      
      <!-- BOTÃO APÓS O RESULTADO -->
      <template v-if="recruitmentResult">
        <v-spacer></v-spacer>
        <v-btn
          :color="recruitmentResult.success ? 'success' : 'primary'"
          variant="elevated"
          @click="closeWithResult"
          size="large"
        >
          <v-icon left>{{ recruitmentResult.success ? 'mdi-check' : 'mdi-close' }}</v-icon>
          {{ recruitmentResult.success ? 'Ótimo!' : 'Entendi' }}
        </v-btn>
        <v-spacer></v-spacer>
      </template>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CivilianRecruitmentSystem, type RecruitmentAnalysis, type RecruitmentResult } from '@/utils/civilianRecruitmentSystem'
import type { Character } from '@/utils/database'

// ✅ PROPS
interface Props {
  recruiter: Character
  civilian: Character
}

const props = defineProps<Props>()

// ✅ EMITS
const emit = defineEmits<{
  close: []
  recruitmentSuccess: [civilian: Character, newLoyalty: number]
  recruitmentFailed: [civilian: Character]
}>()

// ✅ ESTADOS
const isLoading = ref(true)
const isAttempting = ref(false)
const attempted = ref(false)
const recruitmentAnalysis = ref<RecruitmentAnalysis | null>(null)
const recruitmentResult = ref<RecruitmentResult | null>(null)

// ✅ COMPUTED
const civilian = computed(() => props.civilian)
const recruiter = computed(() => props.recruiter)

// ✅ MÉTODOS
const loadRecruitmentAnalysis = async () => {
  try {
    isLoading.value = true
    
    const analysis = await CivilianRecruitmentSystem.analyzeRecruitmentChance(
      recruiter.value,
      civilian.value
    )
    
    recruitmentAnalysis.value = analysis
    
  } catch (error) {
    console.error('❌ Erro ao carregar análise:', error)
  } finally {
    isLoading.value = false
  }
}

const attemptRecruitment = async () => {
  try {
    isAttempting.value = true
    
    const result = await CivilianRecruitmentSystem.attemptRecruitment(
      recruiter.value,
      civilian.value
    )
    
    recruitmentResult.value = result
    attempted.value = true
    
  } catch (error) {
    console.error('❌ Erro na tentativa de recrutamento:', error)
    recruitmentResult.value = {
      success: false,
      message: 'Erro interno durante o recrutamento'
    }
  } finally {
    isAttempting.value = false
  }
}

const closeWithResult = () => {
  if (recruitmentResult.value) {
    if (recruitmentResult.value.success && recruitmentResult.value.newLoyalty !== undefined) {
      emit('recruitmentSuccess', civilian.value, recruitmentResult.value.newLoyalty)
    } else {
      emit('recruitmentFailed', civilian.value)
    }
  }
  
  emit('close')
}

// ✅ MÉTODOS AUXILIARES
const getKindnessColor = (kindness: number): string => {
  if (kindness >= 50) return 'green'
  if (kindness >= 0) return 'blue'
  if (kindness >= -50) return 'orange'
  return 'red'
}

const getLoyaltyColor = (loyalty: number): string => {
  if (loyalty >= 50) return 'green'
  if (loyalty >= 0) return 'blue'
  if (loyalty >= -50) return 'orange'
  return 'red'
}

const getAnalysisColor = (baseChance: number): string => {
  if (baseChance >= 70) return 'green-darken-1'
  if (baseChance >= 40) return 'orange-darken-1'
  return 'red-darken-1'
}

const getChanceColor = (chance: number): string => {
  if (chance >= 70) return 'success'
  if (chance >= 40) return 'warning'
  return 'error'
}

const getAdviceType = (chance: number): 'success' | 'warning' | 'error' | 'info' => {
  if (chance >= 70) return 'success'
  if (chance >= 40) return 'warning'
  return 'error'
}

const getAdviceText = (chance: number): string => {
  if (chance >= 70) {
    return 'Excelente chance de sucesso! 🎯'
  } else if (chance >= 40) {
    return 'Chance moderada. Vale a pena tentar! 🤞'
  } else {
    return 'Chance baixa, mas ainda é possível! 🍀'
  }
}

// ✅ LIFECYCLE
onMounted(async () => {
  await loadRecruitmentAnalysis()
})
</script>

<style scoped>
.civilian-info {
  background: rgba(33, 150, 243, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.recruitment-analysis {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
}

.chance-visual {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 12px;
}

.recruitment-result {
  animation: slideIn 0.5s ease-out;
}

.result-icon {
  animation: bounceIn 0.6s ease-out;
}

.loyalty-info {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
}

@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes bounceIn {
  0% { 
    transform: scale(0.3); 
    opacity: 0; 
  }
  50% { 
    transform: scale(1.05); 
  }
  70% { 
    transform: scale(0.9); 
  }
  100% { 
    transform: scale(1); 
    opacity: 1; 
  }
}

.text-success-darken-2 { color: #2e7d32 !important; }
.text-error-darken-2 { color: #c62828 !important; }
.success-darken-1 { background-color: #e8f5e8 !important; }
.error-darken-1 { background-color: #ffebee !important; }
</style>