<!-- src/views/TerritoryLiberation.vue -->
<template>
  <div class="territory-liberation-view">
    
    <!-- LOADING STATE GLOBAL -->
    <div v-if="!allDataLoaded" class="loading-container">
      <v-row justify="center">
        <v-col cols="12" class="text-center">
          <v-card class="pa-8">
            <v-card-text>
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
                class="mb-4"
              ></v-progress-circular>
              
              <div class="text-h6 mb-4">Carregando Sistema de Liberação</div>
              
              <div class="loading-steps">
                <div class="step-item" :class="{ 'completed': playerLoaded }">
                  <v-icon :color="playerLoaded ? 'success' : 'grey'">
                    {{ playerLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Personagem</span>
                </div>
                
                <div class="step-item" :class="{ 'completed': islandLoaded }">
                  <v-icon :color="islandLoaded ? 'success' : 'grey'">
                    {{ islandLoaded ? 'mdi-check' : 'mdi-loading mdi-spin' }}
                  </v-icon>
                  <span>Carregando Ilha Atual</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <!-- CONTEÚDO PRINCIPAL -->
    <div v-else>
      
      <!-- HEADER DA VIEW -->
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4" variant="elevated">
            <v-card-title class="text-center bg-orange-darken-1 text-white">
              <v-icon left size="large" color="white">mdi-sword-cross</v-icon>
              LIBERAÇÃO DE TERRITÓRIOS
            </v-card-title>
            <v-card-subtitle class="text-center pa-4">
              Liberte ilhas do controle de crews hostis e ganhe recompensas épicas!
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>

      <!-- NAVEGAÇÃO DE ILHAS -->
      <v-row>
        <!-- INTERFACE DE LIBERAÇÃO -->
        <v-col cols="12" lg="12">
          <div v-if="selectedIsland && playerCharacter">
            <TerritoryLiberationInterface 
              :island="selectedIsland"
              :player-character="playerCharacter"
              @task-completed="handleTaskCompleted"
              @island-liberated="handleIslandLiberated"
            />
          </div>
          
          <!-- PLACEHOLDER QUANDO NENHUMA ILHA SELECIONADA -->
          <div v-else>
            <v-card variant="elevated" class="text-center pa-8">
              <v-icon size="120" color="grey-lighten-2" class="mb-4">mdi-island</v-icon>
              <div class="text-h5 mb-4 text-grey-darken-1">Selecione uma Ilha</div>
              <div class="text-body-1 text-grey-darken-2">
                Escolha uma ilha na lista ao lado para começar o processo de liberação
              </div>
            </v-card>
          </div>
        </v-col>
      </v-row>

      <!-- ESTATÍSTICAS GLOBAIS -->
      <v-row>
        <v-col cols="12">
          <v-card variant="elevated" class="mb-4">
            <v-card-title class="bg-green-darken-1 text-white">
              <v-icon left color="white">mdi-chart-line</v-icon>
              Estatísticas de Liberação
            </v-card-title>
            
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="blue-lighten-5">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="40" color="blue-darken-2">mdi-island</v-icon>
                      <div class="text-h4 mt-2 text-blue-darken-3">{{ totalIslands }}</div>
                      <div class="text-body-2 text-blue-darken-3">Total de Ilhas</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="success-lighten-5">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="40" color="success-darken-2">mdi-flag</v-icon>
                      <div class="text-h4 mt-2 text-success-darken-3">{{ liberatedIslands }}</div>
                      <div class="text-body-2 text-success-darken-3">Ilhas Liberadas</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="warning-lighten-5">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="40" color="warning-darken-2">mdi-pirate</v-icon>
                      <div class="text-h4 mt-2 text-warning-darken-3">{{ occupiedIslands }}</div>
                      <div class="text-body-2 text-warning-darken-3">Ilhas Ocupadas</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="3">
                  <v-card variant="outlined" color="purple-lighten-5">
                    <v-card-text class="text-center pa-3">
                      <v-icon size="40" color="purple-darken-2">mdi-progress-check</v-icon>
                      <div class="text-h4 mt-2 text-purple-darken-3">{{ Math.round(liberationPercentage) }}%</div>
                      <div class="text-body-2 text-purple-darken-3">Progresso Total</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- BARRA DE PROGRESSO GLOBAL -->
              <div class="mt-4">
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-1"><strong>Progresso de Liberação Mundial</strong></span>
                  <span class="text-body-2">{{ liberatedIslands }} / {{ totalIslands }}</span>
                </div>
                
                <v-progress-linear
                  :model-value="liberationPercentage"
                  color="success"
                  height="20"
                  rounded
                  class="mb-2"
                >
                  <template v-slot:default>
                    <strong class="text-white">{{ Math.round(liberationPercentage) }}%</strong>
                  </template>
                </v-progress-linear>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { TerritoryLiberationSystem } from '@/utils/territoryLiberationSystem'
import TerritoryLiberationInterface from '@/components/TerritoryLiberationInterface.vue'
import type { Island, Character } from '@/utils/database'
import { db } from '@/utils/database'

// ✅ STORES
const characterStore = useCharacterStore()

// ✅ ESTADOS
const playerLoaded = ref(false)
const islandLoaded = ref(false)
const selectedIsland = ref<Island | null>(null)
const currentIsland = ref<Island | null>(null)
const allIslands = ref<Island[]>([])
const islandStatuses = ref<Map<number, {
  isLiberated: boolean
  completedSteps: number
  maxSteps: number
}>>(new Map())

// ✅ COMPUTED
const playerCharacter = computed(() => characterStore.playerCharacter)

const allDataLoaded = computed(() => {
  return playerLoaded.value && islandLoaded.value
})

const totalIslands = computed(() => allIslands.value.length)

const liberatedIslands = computed(() => {
  return Array.from(islandStatuses.value.values()).filter(status => status.isLiberated).length
})

const occupiedIslands = computed(() => {
  return totalIslands.value - liberatedIslands.value
})

const liberationPercentage = computed(() => {
  if (totalIslands.value === 0) return 0
  return (liberatedIslands.value / totalIslands.value) * 100
})

// ✅ MÉTODOS
const loadPlayerData = async () => {
  try {
    await characterStore.loadPlayerCharacter()
    playerLoaded.value = true
    console.log('✅ Dados do player carregados')
  } catch (error) {
    console.error('❌ Erro ao carregar dados do player:', error)
  }
}

const loadIslandData = async () => {
  try {
    // Carregar todas as ilhas
    allIslands.value = await db.islands.orderBy('difficulty').toArray()
    
    // Descobrir ilha atual do player
    if (playerCharacter.value?.crewId) {
      const playerCrew = await db.crews.get(playerCharacter.value.crewId)
      if (playerCrew) {
        currentIsland.value = await db.islands.get(playerCrew.currentIsland) || null
      }
    }
    
    // Carregar status de cada ilha
    await loadIslandStatuses()
    
    // Selecionar ilha atual por padrão
    if (currentIsland.value) {
      selectedIsland.value = currentIsland.value
    }
    
    islandLoaded.value = true
    console.log('✅ Dados das ilhas carregados')
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados das ilhas:', error)
  }
}

const loadIslandStatuses = async () => {
  try {
    if (!playerCharacter.value) return
    
    const statusMap = new Map()
    
    for (const island of allIslands.value) {
      const progress = await TerritoryLiberationSystem.getLiberationProgress(
        playerCharacter.value.id!,
        island.id!
      )
      
      statusMap.set(island.id!, {
        isLiberated: progress.isLiberated,
        completedSteps: progress.completedSteps,
        maxSteps: progress.maxSteps
      })
    }
    
    islandStatuses.value = statusMap
    console.log('✅ Status das ilhas carregado')
    
  } catch (error) {
    console.error('❌ Erro ao carregar status das ilhas:', error)
  }
}

const selectIsland = (island: Island) => {
  selectedIsland.value = island
  console.log(`🎯 Ilha selecionada: ${island.name}`)
}

const handleTaskCompleted = async () => {
  console.log('✅ Task completada - recarregando status')
  await loadIslandStatuses()
}

const handleIslandLiberated = async (islandId: number) => {
  console.log(`🎉 Ilha ${islandId} foi liberada!`)
  await loadIslandStatuses()
}

// ✅ MÉTODOS AUXILIARES
const getIslandStatusColor = (island: Island): string => {
  const status = islandStatuses.value.get(island.id!)
  if (!status) return 'grey'
  
  if (status.isLiberated) return 'success'
  if (status.completedSteps > 0) return 'warning'
  return 'error'
}

const getIslandStatusIcon = (island: Island): string => {
  const status = islandStatuses.value.get(island.id!)
  if (!status) return 'mdi-help'
  
  if (status.isLiberated) return 'mdi-flag'
  if (status.completedSteps > 0) return 'mdi-progress-check'
  return 'mdi-pirate'
}

const getIslandStatusText = (island: Island): string => {
  const status = islandStatuses.value.get(island.id!)
  if (!status) return 'Carregando...'
  
  if (status.isLiberated) return 'Liberada'
  if (status.completedSteps > 0) return 'Em Progresso'
  return 'Ocupada'
}

const getIslandProgressText = (island: Island): string => {
  const status = islandStatuses.value.get(island.id!)
  if (!status) return '?/?'
  
  return `${status.completedSteps}/${status.maxSteps}`
}

// ✅ LIFECYCLE
onMounted(async () => {
  console.log('🎮 Territory Liberation View montada - iniciando carregamento...')
  
  await Promise.all([
    loadPlayerData(),
    loadIslandData()
  ])
  
  console.log('✅ Territory Liberation View carregada completamente')
})
</script>

<style scoped>
.territory-liberation-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
}

.loading-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.step-item.completed {
  background-color: rgba(76, 175, 80, 0.1);
}

.current-island-section {
  background: rgba(33, 150, 243, 0.05);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.islands-list {
  max-height: 500px;
  overflow-y: auto;
}

.island-list-item {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.island-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
  .territory-liberation-view {
    padding: 8px;
  }
  
  .islands-list {
    max-height: 300px;
  }
}

/* CORES CUSTOMIZADAS */
.text-success-darken-3 { color: #2e7d32 !important; }
.text-warning-darken-3 { color: #ef6c00 !important; }
.text-purple-darken-3 { color: #6a1b9a !important; }
.text-blue-darken-3 { color: #1565c0 !important; }

.success-lighten-5 { background-color: #e8f5e8 !important; }
.warning-lighten-5 { background-color: #fff3e0 !important; }
.purple-lighten-5 { background-color: #f3e5f5 !important; }
.blue-lighten-5 { background-color: #e3f2fd !important; }
</style>