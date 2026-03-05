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
/* ============================================================
   Territory Liberation - Grand Line Conquest
   ============================================================ */

.loading-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  max-width: 300px;
  margin-inline: auto;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
  color: #8B9DC3;
  padding: 8px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
}

.step-item.completed {
  color: #D4AF37;
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.25);
}

/* Page header */
.liberation-header {
  background: linear-gradient(135deg,
    rgba(198, 40, 40, 0.1),
    rgba(212, 175, 55, 0.06)
  );
  border: 1px solid rgba(198, 40, 40, 0.3);
  border-radius: 14px;
  padding: 18px 24px;
  margin-bottom: 20px;
  position: relative;
}

.liberation-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent, #C62828, #FF5252, #C62828, transparent
  );
  border-radius: 14px 14px 0 0;
}

.liberation-title {
  font-family: Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #EF5350;
  text-shadow: 0 0 16px rgba(239, 83, 80, 0.35);
  letter-spacing: 0.05em;
}

/* Territory cards */
.territory-card {
  background: #132235;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
  height: 100%;
}

.territory-card:hover {
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 16px rgba(212, 175, 55, 0.18);
  transform: translateY(-2px);
}

.territory-card.liberated {
  border-color: rgba(46, 125, 50, 0.5);
  background: linear-gradient(135deg, #0A2010, #0F2E18);
  box-shadow: 0 0 12px rgba(46, 125, 50, 0.2);
}

.territory-card.occupied {
  border-color: rgba(198, 40, 40, 0.45);
  box-shadow: 0 0 12px rgba(198, 40, 40, 0.15);
}

.territory-card.in-battle {
  border-color: rgba(255, 167, 38, 0.5);
  box-shadow: 0 0 16px rgba(255, 167, 38, 0.2);
  animation: battle-pulse 2s ease-in-out infinite;
}

.territory-card-header {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.territory-name {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #E8D5A3;
  font-size: 0.95rem;
}

.territory-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-top: 4px;
}

.status-liberated { color: #81C784; background: rgba(129, 199, 132, 0.1); border: 1px solid rgba(129, 199, 132, 0.3); }
.status-occupied  { color: #EF5350; background: rgba(239, 83, 80, 0.1);  border: 1px solid rgba(239, 83, 80, 0.3); }
.status-neutral   { color: #78909C; background: rgba(120, 144, 156, 0.1); border: 1px solid rgba(120, 144, 156, 0.25); }
.status-battle    { color: #FFA726; background: rgba(255, 167, 38, 0.1);  border: 1px solid rgba(255, 167, 38, 0.3); }

/* Combat power display */
.power-vs-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}

.power-side {
  flex: 1;
  text-align: center;
}

.power-value {
  font-family: Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.power-value.player { color: #D4AF37; text-shadow: 0 0 10px rgba(212,175,55,0.4); }
.power-value.enemy  { color: #EF5350; text-shadow: 0 0 10px rgba(239,83,80,0.4); }

.vs-text {
  font-family: Georgia, serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #8B9DC3;
}

@keyframes battle-pulse {
  0%, 100% { box-shadow: 0 0 12px rgba(255, 167, 38, 0.2); }
  50%       { box-shadow: 0 0 24px rgba(255, 167, 38, 0.45); }
}
</style>