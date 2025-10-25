<!-- src/components/TrainingInterface.vue -->
<template>
  <v-card variant="elevated" class="training-interface">
    <v-card-title class="bg-orange-darken-2 text-white">
      <v-icon left color="white">mdi-dumbbell</v-icon>
      Centro de Treinamento
    </v-card-title>
    
    <v-card-text class="pa-4">
      
      <!-- TREINO ATIVO -->
      <div v-if="isTraining && currentTask" class="training-active mb-4">
        
        <!-- ✅ ESTADO DE FINALIZAÇÃO -->
        <v-alert
          v-if="isCompleting"
          type="success"
          variant="tonal"
          class="mb-4"
        >
          <v-icon left>mdi-check-circle</v-icon>
          <strong>Finalizando treino e aplicando recompensas...</strong>
        </v-alert>
        
        <!-- ESTADO NORMAL DE TREINO -->
        <v-alert
          v-else
          type="info"
          variant="tonal"
          class="mb-4"
        >
          <v-icon left>mdi-dumbbell</v-icon>
          <strong>Treino em andamento!</strong>
        </v-alert>
        
        <v-card variant="outlined" color="orange-darken-1">
          <v-card-text class="pa-4">
            <div class="text-h6 mb-2 text-orange-darken-3">
              {{ currentTask.description }}
            </div>
            
            <div class="d-flex align-center gap-2 mb-3">
              <v-chip 
                :color="getIntensityColor(currentIntensity || 1)" 
                variant="elevated"
                size="small"
              >
                {{ getIntensityDisplayName(currentIntensity || 1) }}
              </v-chip>
              <v-chip color="blue-darken-2" variant="elevated" size="small">
                +{{ currentTask.experienceReward }} EXP
              </v-chip>
            </div>
            
            <v-progress-linear
              :model-value="trainingProgress"
              color="orange-darken-2"
              height="12"
              rounded
              class="mb-2"
            >
              <template v-slot:default>
                <strong :class="trainingPercentage >= 52 ? 'text-white' : 'text-black'">{{ trainingPercentage }}%</strong>
              </template>
            </v-progress-linear>
            
            <div class="text-center text-caption">
              {{ isCompleting ? 'Aplicando recompensas...' : `Tempo restante: ${formattedTimeRemaining}` }}
            </div>
          </v-card-text>
          
          <v-card-actions class="pa-4">
            <v-btn
              v-if="!isCompleting"
              color="red-darken-2"
              variant="outlined"
              @click="openCancelDialog"
              size="small"
            >
              <v-icon left>mdi-stop</v-icon>
              Cancelar Treino
            </v-btn>
            
            <v-btn
              v-else
              color="orange-darken-2"
              variant="outlined"
              disabled
              size="small"
            >
              <v-icon left>mdi-loading mdi-spin</v-icon>
              Finalizando...
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
      
      <!-- SELEÇÃO DE TREINO -->
      <div v-else class="training-selection">
        <div class="text-h6 mb-4 text-center">
          Escolha a intensidade do treino
        </div>
        
        <v-row>
          <v-col 
            v-for="intensity in intensityOptions" 
            :key="intensity.value"
            cols="12" 
            md="3"
          >
            <v-card 
              variant="outlined" 
              :color="intensity.color + '-darken-1'"
              class="training-option"
              @click="selectIntensity(intensity.value)"
              :class="{ 'selected': selectedIntensity === intensity.value }"
            >
              <v-card-text class="text-center pa-4">
                <v-icon 
                  size="40" 
                  :color="intensity.color + '-darken-2'" 
                  class="mb-2"
                >
                  {{ intensity.icon }}
                </v-icon>
                
                <div class="text-h6 mb-1" :class="`text-${intensity.color}-darken-3`">
                  {{ intensity.name }}
                </div>
                
                <div class="text-body-2 mb-2">
                  {{ intensity.duration }}
                </div>
                
                <v-chip 
                  :color="intensity.color" 
                  variant="elevated" 
                  size="small"
                >
                  {{ intensity.value }}x
                </v-chip>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <!-- INFORMAÇÕES DO TREINO -->
        <v-card v-if="selectedIntensity" variant="outlined" color="blue-darken-1" class="mt-4">
          <v-card-text class="pa-4">
            <div class="text-h6 mb-2 text-blue-darken-3">
              <v-icon left color="blue-darken-3">mdi-information</v-icon>
              Informações do Treino
            </div>
            
            <div class="training-info">
              <div class="info-item">
                <v-icon color="blue-darken-2" class="mr-2">mdi-clock-outline</v-icon>
                <span>Duração: <strong>{{ selectedIntensity }} minuto(s)</strong></span>
              </div>
              
              <div class="info-item">
                <v-icon color="green-darken-2" class="mr-2">mdi-star</v-icon>
                <span>Experiência: <strong>Variável (baseada no nível mais alto)</strong></span>
              </div>
              
              <div class="info-item">
                <v-icon color="purple-darken-2" class="mr-2">mdi-account-group</v-icon>
                <span>Beneficiários: <strong>Toda a tripulação</strong></span>
              </div>
              
              <div class="info-item">
                <v-icon color="orange-darken-2" class="mr-2">mdi-information-outline</v-icon>
                <span>Multiplicador: <strong>1x a 5x (aleatório)</strong></span>
              </div>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- BOTÃO INICIAR -->
        <v-btn
          v-if="selectedIntensity"
          color="orange-darken-2"
          variant="elevated"
          size="large"
          block
          class="mt-4"
          @click="confirmStartTraining"
          :disabled="!canTrain"
          :loading="isStarting"
        >
          <v-icon left>mdi-play</v-icon>
          {{ isStarting ? 'Iniciando...' : `Iniciar Treino ${getIntensityDisplayName(selectedIntensity)}` }}
        </v-btn>
        
        <!-- AVISO SE NÃO PODE TREINAR -->
        <v-alert
          v-if="!canTrain && !isTraining"
          type="warning"
          variant="tonal"
          class="mt-4"
        >
          <v-icon left>mdi-alert</v-icon>
          <strong>Não é possível treinar no momento.</strong>
          Verifique se não há exploração ativa ou outro treino em andamento.
        </v-alert>
      </div>
      
    </v-card-text>
    
    <!-- MODAL DE CANCELAMENTO -->
    <v-dialog v-model="showCancelDialog" max-width="400" persistent>
  <v-card>
    <v-card-title class="bg-red-darken-2 text-white">
      <v-icon left color="white">mdi-alert</v-icon>
      Cancelar Treino
    </v-card-title>
    
    <v-card-text class="pa-4">
      <div class="text-center">
        <v-icon size="60" color="red-darken-2" class="mb-3">mdi-stop-circle</v-icon>
        <div class="text-h6 mb-2">Tem certeza?</div>
        <div class="text-body-2 mb-3">
          O treino será cancelado e nenhuma experiência será ganha.
        </div>
        
        <!-- INFORMAÇÕES DO TREINO ATUAL -->
        <v-card variant="outlined" color="orange-lighten-4" class="pa-3">
          <div class="text-body-2">
            <strong>Treino Atual:</strong> {{ currentTask?.description }}
          </div>
          <div class="text-body-2">
            <strong>Progresso:</strong> {{ trainingPercentage }}%
          </div>
          <div class="text-body-2">
            <strong>EXP a Perder:</strong> {{ currentTask?.experienceReward }} pontos
          </div>
        </v-card>
      </div>
    </v-card-text>
    
    <!-- ✅ v-card-actions DENTRO do v-card -->
    <v-card-actions class="pa-4 bg-grey-lighten-4">
      <v-row no-gutters>
        <v-col cols="12" class="mb-2">
          <v-btn 
            color="grey-darken-1" 
            variant="outlined" 
            @click="closeCancelDialog"
            block
            size="large"
          >
            <v-icon left>mdi-arrow-left</v-icon>
            Continuar Treino
          </v-btn>
        </v-col>
        
        <v-col cols="12">
          <v-btn 
            color="red-darken-2" 
            variant="elevated" 
            @click="confirmCancelTraining"
            block
            size="large"
            :loading="isCanceling"
          >
            <v-icon left>mdi-stop</v-icon>
            {{ isCanceling ? 'Cancelando...' : 'Cancelar Treino' }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
    
  </v-card>
</v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTraining } from '@/composables/useTraining'
import { TrainingSystem } from '@/utils/trainingSystem'

interface Props {
  crewId: number
  characterId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  trainingCompleted: [event: any]
}>()

// ✅ TRAINING COMPOSABLE
const {
  currentTask,
  isTraining,
  trainingProgress,
  timeRemaining,
  formattedTimeRemaining,
  trainingPercentage,
  canTrain,
  currentIntensity,
  isCompleting, // ✅ NOVO: Estado de finalização
  startTraining,
  cancelTraining
} = useTraining(props.crewId, props.characterId)

// ✅ REACTIVE DATA
const selectedIntensity = ref<1 | 5 | 10 | 30 | null>(null)
const showCancelDialog = ref(false)
const isStarting = ref(false)
const isCanceling = ref(false)

// ✅ COMPUTED
const intensityOptions = computed(() => [
  {
    value: 1 as const,
    name: 'Leve',
    duration: '1 minuto',
    icon: 'mdi-walk',
    color: 'green'
  },
  {
    value: 5 as const,
    name: 'Moderado',
    duration: '5 minutos',
    icon: 'mdi-run',
    color: 'orange'
  },
  {
    value: 10 as const,
    name: 'Intenso',
    duration: '10 minutos',
    icon: 'mdi-fire',
    color: 'red'
  },
  {
    value: 30 as const,
    name: 'Muito Intenso',
    duration: '30 minutos',
    icon: 'mdi-fire',
    color: 'dark-red'
  }
])

// ✅ METHODS
const selectIntensity = (intensity: 1 | 5 | 10 | 30) => {
  selectedIntensity.value = intensity
}

const confirmStartTraining = async () => {
  if (!selectedIntensity.value || isStarting.value) return
  
  try {
    isStarting.value = true
    console.log(`🏋️ Iniciando treino ${selectedIntensity.value}x...`)
    
    const success = await startTraining(selectedIntensity.value)
    
    if (success) {
      selectedIntensity.value = null
      console.log('✅ Treino iniciado com sucesso!')
    } else {
      console.error('❌ Falha ao iniciar treino')
    }
  } catch (error) {
    console.error('❌ Erro ao iniciar treino:', error)
  } finally {
    isStarting.value = false
  }
}

const openCancelDialog = () => {
  showCancelDialog.value = true
}

const closeCancelDialog = () => {
  showCancelDialog.value = false
}

const confirmCancelTraining = async () => {
  if (isCanceling.value) return
  
  try {
    isCanceling.value = true
    console.log('🛑 Cancelando treino...')
    
    const success = await cancelTraining()
    
    if (success) {
      closeCancelDialog()
      console.log('✅ Treino cancelado com sucesso')
    } else {
      console.error('❌ Falha ao cancelar treino')
    }
  } catch (error) {
    console.error('❌ Erro ao cancelar treino:', error)
  } finally {
    isCanceling.value = false
  }
}

// ✅ HELPER FUNCTIONS
const getIntensityDisplayName = (intensity: 1 | 5 | 10 | 30): string => {
  switch (intensity) {
    case 1: return 'Leve'
    case 5: return 'Moderado'
    case 10: return 'Intenso'
    case 30: return 'Muito Intenso'
    default: return 'Desconhecido'
  }
}

const getIntensityName = (intensity: 1 | 5 | 10): string => {
  return TrainingSystem.getIntensityName(intensity)
}

const getIntensityColor = (intensity: 1 | 5 | 10): string => {
  return TrainingSystem.getIntensityColor(intensity)
}

// ✅ LIFECYCLE
onMounted(async () => {
  console.log('🔄 TrainingInterface montado')
  
  // Listener para quando o treino for concluído
  window.addEventListener('trainingCompleted', (event) => {
    console.log('🎉 TrainingInterface recebeu evento de conclusão:', event)
    emit('trainingCompleted', event)
  })
})
</script>

<style scoped>
.training-interface {
  border-radius: 12px;
  overflow: hidden;
}

.training-option {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.training-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.training-option.selected {
  border-color: #ff9800;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.training-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  border-left: 3px solid rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.9);
}

.v-card-title {
  font-weight: 600;
}

.v-btn {
  border-radius: 8px;
  font-weight: 600;
}

/* ANIMAÇÃO DE LOADING */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

/* CORES CUSTOMIZADAS */
.text-orange-darken-3 { color: #ef6c00 !important; }
.text-blue-darken-3 { color: #1565c0 !important; }
.text-green-darken-3 { color: #2e7d32 !important; }
.text-red-darken-3 { color: #c62828 !important; }

/* RESPONSIVIDADE */
@media (max-width: 960px) {
  .training-option {
    margin-bottom: 8px;
  }
  
  .training-info {
    gap: 8px;
  }
  
  .info-item {
    padding: 6px;
    font-size: 0.875rem;
  }
}
</style>