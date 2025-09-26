<!-- src/components/WorldControlPanel.vue -->
<template>
  <v-card variant="outlined" class="world-control-panel">
    <v-card-title class="bg-primary text-white">
      <v-icon left color="white">mdi-earth</v-icon>
      🌍 Controle do Mundo
    </v-card-title>
    
    <v-card-text class="pa-4">
      
      <!-- STATUS ATUAL -->
      <div class="status-section mb-4">
        <div class="text-h6 mb-3">Status Atual</div>
        <v-chip
          :color="gameStatus.canStartGame ? 'success' : 'warning'"
          :prepend-icon="gameStatus.canStartGame ? 'mdi-check-circle' : 'mdi-alert-circle'"
          variant="tonal"
          class="mb-2"
        >
          {{ gameStatus.canStartGame ? 'Mundo Pronto' : 'Configuração Pendente' }}
        </v-chip>
        
        <div class="status-details">
          <v-list density="compact">
            <v-list-item>
              <template #prepend>
                <v-icon :color="gameStatus.hasGameState ? 'success' : 'error'">
                  {{ gameStatus.hasGameState ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
              </template>
              <v-list-item-title>GameState: {{ gameStatus.hasGameState ? 'Ativo' : 'Inativo' }}</v-list-item-title>
            </v-list-item>
            
            <v-list-item>
              <template #prepend>
                <v-icon :color="!gameStatus.needsCharacterCreation ? 'success' : 'warning'">
                  {{ !gameStatus.needsCharacterCreation ? 'mdi-check' : 'mdi-account-plus' }}
                </v-icon>
              </template>
              <v-list-item-title>
                Personagem: {{ !gameStatus.needsCharacterCreation ? 'Criado' : 'Pendente' }}
              </v-list-item-title>
            </v-list-item>
            
            <v-list-item>
              <template #prepend>
                <v-icon :color="gameStatus.isWorldGenerated ? 'success' : 'warning'">
                  {{ gameStatus.isWorldGenerated ? 'mdi-check' : 'mdi-earth-plus' }}
                </v-icon>
              </template>
              <v-list-item-title>
                Mundo: {{ gameStatus.isWorldGenerated ? 'Gerado' : 'Pendente' }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </div>
      
      <!-- AÇÕES DISPONÍVEIS -->
      <div class="actions-section">
        <div class="text-h6 mb-3">Ações Disponíveis</div>
        
        <div class="action-buttons">
          
          <!-- CRIAR PERSONAGEM -->
          <v-btn
            v-if="gameStatus.needsCharacterCreation"
            color="primary"
            variant="elevated"
            size="large"
            prepend-icon="mdi-account-plus"
            @click="goToCharacterCreation"
            class="mb-3 mr-3"
          >
            Criar Personagem
          </v-btn>
          
          <!-- JOGAR -->
          <v-btn
            v-if="gameStatus.canStartGame"
            color="success"
            variant="elevated"
            size="large"
            prepend-icon="mdi-play"
            @click="startGame"
            class="mb-3 mr-3"
          >
            Começar Aventura
          </v-btn>
          
          <!-- RESETAR MUNDO -->
          <v-btn
            color="error"
            variant="outlined"
            size="large"
            prepend-icon="mdi-earth-off"
            @click="showResetDialog = true"
            class="mb-3"
          >
            Novo Mundo
          </v-btn>
          
        </div>
      </div>
      
    </v-card-text>
    
    <!-- MODAL DE RESET -->
    <v-dialog v-model="showResetDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon left color="white">mdi-alert</v-icon>
          Confirmar Novo Mundo
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="text-center">
            <v-icon size="80" color="error" class="mb-4">mdi-earth-off</v-icon>
            <div class="text-h5 mb-4">Tem certeza absoluta?</div>
            <div class="text-body-1 mb-4">
              Esta ação irá <strong>apagar completamente</strong> o mundo atual:
            </div>
            
            <v-alert type="error" variant="tonal" class="mb-4">
              <v-list>
                <v-list-item>🗑️ Todos os dados do mundo atual</v-list-item>
                <v-list-item>👤 Seu personagem atual</v-list-item>
                <v-list-item>🏴‍☠️ Todas as tripulações e ilhas</v-list-item>
                <v-list-item>⚔️ Histórico de batalhas</v-list-item>
              </v-list>
            </v-alert>
            
            <v-alert type="warning" variant="tonal">
              <strong>Esta ação NÃO pode ser desfeita!</strong>
            </v-alert>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-btn
            color="grey"
            variant="outlined"
            @click="showResetDialog = false"
          >
            Cancelar
          </v-btn>
          
          <v-spacer></v-spacer>
          
          <v-btn
            color="error"
            variant="elevated"
            :loading="isResetting"
            @click="executeReset"
          >
            <v-icon left>mdi-delete-forever</v-icon>
            Sim, Criar Novo Mundo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- MODAL DE RESULTADO -->
    <v-dialog v-model="showResultDialog" max-width="700" persistent>
      <v-card>
        <v-card-title :class="lastResult?.success ? 'bg-success' : 'bg-error'" class="text-white">
          <v-icon left color="white">
            {{ lastResult?.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
          </v-icon>
          {{ lastResult?.success ? 'Sucesso!' : 'Erro!' }}
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="text-h6 mb-4">{{ lastResult?.message }}</div>
          
          <div v-if="lastResult?.steps && lastResult.steps.length > 0" class="mb-4">
            <div class="text-subtitle-1 mb-2">Passos executados:</div>
            <v-list>
              <v-list-item v-for="step in lastResult.steps" :key="step">
                <v-list-item-title>{{ step }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
          
          <div v-if="lastResult?.errors && lastResult.errors.length > 0" class="mb-4">
            <div class="text-subtitle-1 mb-2 text-error">Erros encontrados:</div>
            <v-list>
              <v-list-item v-for="error in lastResult.errors" :key="error">
                <v-list-item-title class="text-error">{{ error }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-6">
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
    
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { WorldResetSystem, type WorldResetResult } from '@/utils/worldResetSystem'

const router = useRouter()

// Estados
const isResetting = ref(false)
const showResetDialog = ref(false)
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

const executeReset = async () => {
  try {
    isResetting.value = true
    showResetDialog.value = false
    
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

const startGame = () => {
  router.push('/island-exploration') // ou sua rota principal do jogo
}

const closeResultDialog = () => {
  showResultDialog.value = false
  lastResult.value = null
  
  // Se reset foi bem-sucedido, redirecionar para criação de personagem
  if (lastResult.value?.success) {
    setTimeout(() => {
      goToCharacterCreation()
    }, 500)
  }
}

// Lifecycle
onMounted(() => {
  loadGameStatus()
})
</script>

<style scoped>
.world-control-panel {
  border-radius: 12px;
  overflow: hidden;
}

.status-details {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 8px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .v-btn {
    width: 100%;
    margin: 0 0 12px 0 !important;
  }
}
</style>