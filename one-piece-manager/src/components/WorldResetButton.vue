<!-- src/components/WorldResetButton.vue -->
<template>
  <div class="world-reset-section">
    
    <!-- BOTÃO PRINCIPAL -->
    <v-card variant="outlined" color="red-lighten-5" class="mb-4">
      <v-card-title class="bg-red-darken-2 text-white">
        <v-icon left color="white">mdi-earth</v-icon>
        🌍 Controle do Mundo
      </v-card-title>
      
      <v-card-text class="pa-4">
        <div class="text-h6 mb-3">Novo Mundo</div>
        <div class="text-body-2 mb-4">
          Apaga completamente o mundo atual e permite criar um novo personagem e mundo.
          <strong class="text-red-darken-2">Esta ação não pode ser desfeita!</strong>
        </div>
        
        <!-- STATUS DO JOGO -->
        <v-card variant="outlined" color="blue-lighten-5" class="mb-4">
          <v-card-text class="pa-3">
            <div class="text-subtitle-2 mb-2">Status Atual:</div>
            <div class="status-grid">
              <div class="status-item">
                <v-icon :color="gameStatus.hasGameState ? 'green' : 'red'" class="mr-2">
                  {{ gameStatus.hasGameState ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
                <span>GameState: {{ gameStatus.hasGameState ? 'Ativo' : 'Inativo' }}</span>
              </div>
              
              <div class="status-item">
                <v-icon :color="!gameStatus.needsCharacterCreation ? 'green' : 'orange'" class="mr-2">
                  {{ !gameStatus.needsCharacterCreation ? 'mdi-check' : 'mdi-account-plus' }}
                </v-icon>
                <span>Personagem: {{ !gameStatus.needsCharacterCreation ? 'Criado' : 'Pendente' }}</span>
              </div>
              
              <div class="status-item">
                <v-icon :color="gameStatus.isWorldGenerated ? 'green' : 'orange'" class="mr-2">
                  {{ gameStatus.isWorldGenerated ? 'mdi-check' : 'mdi-earth-plus' }}
                </v-icon>
                <span>Mundo: {{ gameStatus.isWorldGenerated ? 'Gerado' : 'Pendente' }}</span>
              </div>
              
              <div class="status-item">
                <v-icon :color="gameStatus.canStartGame ? 'green' : 'red'" class="mr-2">
                  {{ gameStatus.canStartGame ? 'mdi-play' : 'mdi-pause' }}
                </v-icon>
                <span>Jogo: {{ gameStatus.canStartGame ? 'Pronto' : 'Não Pronto' }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- BOTÕES DE AÇÃO -->
        <div class="action-buttons">
          <v-btn
            color="red-darken-2"
            variant="elevated"
            size="large"
            :loading="isResetting"
            :disabled="isResetting"
            @click="confirmReset"
            class="mr-3"
          >
            <v-icon left>mdi-earth-off</v-icon>
            Resetar Mundo
          </v-btn>
          
          <v-btn
            v-if="gameStatus.needsCharacterCreation"
            color="blue-darken-2"
            variant="elevated"
            size="large"
            @click="goToCharacterCreation"
          >
            <v-icon left>mdi-account-plus</v-icon>
            Criar Personagem
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
    
    <!-- MODAL DE CONFIRMAÇÃO -->
    <v-dialog v-model="showConfirmDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="bg-red-darken-2 text-white">
          <v-icon left color="white">mdi-alert</v-icon>
          Confirmar Reset do Mundo
        </v-card-title>
        
        <v-card-text class="pa-4">
          <div class="text-center">
            <v-icon size="80" color="red-darken-2" class="mb-3">mdi-earth-off</v-icon>
            <div class="text-h6 mb-3">Tem certeza absoluta?</div>
            <div class="text-body-1 mb-4">
              Esta ação irá:
            </div>
            <v-list>
              <v-list-item>
                <v-list-item-title>🗑️ Apagar TODOS os dados do mundo atual</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>👤 Remover seu personagem atual</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>🏴‍☠️ Deletar todos os crews e ilhas</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>⚔️ Limpar histórico de batalhas</v-list-item-title>
              </v-list-item>
            </v-list>
            
            <v-alert type="error" variant="tonal" class="mt-4">
              <strong>Esta ação NÃO pode ser desfeita!</strong>
            </v-alert>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-btn
            color="grey"
            variant="outlined"
            @click="showConfirmDialog = false"
          >
            Cancelar
          </v-btn>
          
          <v-spacer></v-spacer>
          
          <v-btn
            color="red-darken-2"
            variant="elevated"
            :loading="isResetting"
            @click="executeReset"
          >
            <v-icon left>mdi-delete-forever</v-icon>
            Sim, Resetar Tudo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- MODAL DE RESULTADO -->
    <v-dialog v-model="showResultDialog" max-width="600" persistent>
      <v-card>
        <v-card-title :class="lastResult?.success ? 'bg-green-darken-2' : 'bg-red-darken-2'" class="text-white">
          <v-icon left color="white">
            {{ lastResult?.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
          </v-icon>
          {{ lastResult?.success ? 'Sucesso!' : 'Erro!' }}
        </v-card-title>
        
        <v-card-text class="pa-4">
          <div class="text-h6 mb-3">{{ lastResult?.message }}</div>
          
          <div v-if="lastResult?.steps && lastResult.steps.length > 0" class="mb-4">
            <div class="text-subtitle-2 mb-2">Passos executados:</div>
            <v-list>
              <v-list-item v-for="step in lastResult.steps" :key="step">
                <v-list-item-title>{{ step }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
          
          <div v-if="lastResult?.errors && lastResult.errors.length > 0" class="mb-4">
            <div class="text-subtitle-2 mb-2 text-red-darken-2">Erros encontrados:</div>
            <v-list>
              <v-list-item v-for="error in lastResult.errors" :key="error">
                <v-list-item-title class="text-red-darken-2">{{ error }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            @click="closeResultDialog"
          >
            Entendi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { WorldResetSystem, type WorldResetResult } from '@/utils/worldResetSystem'

const router = useRouter()

// Estados
const isResetting = ref(false)
const isGeneratingWorld = ref(false)
const showConfirmDialog = ref(false)
const showResultDialog = ref(false)
const lastResult = ref<WorldResetResult | null>(null)

const gameStatus = ref({
  hasGameState: false,
  needsCharacterCreation: false,
  isWorldGenerated: false,
  canStartGame: false
})

// Métodos
const loadGameStatus = async () => {
  try {
    gameStatus.value = await WorldResetSystem.getGameStatus()
    console.log('📊 Status do jogo carregado:', gameStatus.value)
  } catch (error) {
    console.error('❌ Erro ao carregar status do jogo:', error)
  }
}

const confirmReset = () => {
  showConfirmDialog.value = true
}

const executeReset = async () => {
  try {
    isResetting.value = true
    showConfirmDialog.value = false
    
    console.log('🌍 Executando reset do mundo...')
    const result = await WorldResetSystem.resetWorld()
    
    lastResult.value = result
    showResultDialog.value = true
    
    // Recarregar status
    await loadGameStatus()
    
  } catch (error) {
    console.error('❌ Erro no reset:', error)
    lastResult.value = {
      success: false,
      message: `Erro inesperado: ${error}`,
      steps: [],
      errors: [`${error}`]
    }
    showResultDialog.value = true
  } finally {
    isResetting.value = false
  }
}

const goToCharacterCreation = () => {
  router.push('/character-creation')
}

const closeResultDialog = () => {
  showResultDialog.value = false
  lastResult.value = null
}

// Lifecycle
onMounted(() => {
  loadGameStatus()
})
</script>

<style scoped>
.world-reset-section {
  max-width: 800px;
  margin: 0 auto;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .v-btn {
    width: 100%;
  }
}
</style>