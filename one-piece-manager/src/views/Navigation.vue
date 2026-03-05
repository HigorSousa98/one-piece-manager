<!-- src/views/Navigation.vue -->
<template>
  <div class="navigation-view">
    
    <!-- HEADER DA PÁGINA -->
    <div class="page-header mb-6">
      <v-container>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h3 mb-2">
              <v-icon left color="blue-lighten-2" size="large">mdi-compass</v-icon>
              Sistema de Navegação
            </h1>
            <p class="text-h6 text-grey-lighten-4">
              Explore novos mares e descubra ilhas misteriosas
            </p>
          </div>
          
          <!-- NAVEGAÇÃO -->
          <v-btn
            color="primary"
            variant="outlined"
            @click="$router.push('/crew')"
          >
            <v-icon left>mdi-arrow-left</v-icon>
            Voltar ao Crew
          </v-btn>
        </div>
      </v-container>
    </div>

    <!-- SEA BANNER -->
    <div v-if="allDataLoaded && playerCharacter" class="nav-sea-banner" :style="{ background: currentSeaInfo.gradient }">
      <v-container>
        <div class="d-flex align-center flex-wrap gap-3">
          <v-icon color="white" size="22">{{ currentSeaInfo.icon }}</v-icon>
          <span class="nav-sea-name">{{ currentSeaInfo.name }}</span>
          <v-chip v-if="nextSeaInfo" size="small" color="white" text-color="black" variant="elevated">
            <v-icon start size="12">{{ nextSeaInfo.sea.icon }}</v-icon>
            Próximo: {{ nextSeaInfo.sea.name }} — Lv {{ nextSeaInfo.minLevel }} + {{ formatBountyNav(nextSeaInfo.minBounty) }}
          </v-chip>
          <v-chip v-else size="small" color="amber-lighten-1" variant="elevated">
            <v-icon start size="12">mdi-crown</v-icon>
            Mar máximo desbloqueado!
          </v-chip>
        </div>
      </v-container>
    </div>

    <div v-if="!allDataLoaded" class="loading-container">
      <v-container>
        <v-card class="pa-8 text-center">
          <v-progress-circular
            indeterminate
            color="blue-darken-2"
            size="64"
            class="mb-4"
          ></v-progress-circular>
          <div class="text-h6">Carregando dados de navegação...</div>
        </v-card>
      </v-container>
    </div>

    <!-- CONTEÚDO PRINCIPAL -->
    <v-container v-else>
      <v-row>
        
        <!-- COLUNA PRINCIPAL - INTERFACE DE NAVEGAÇÃO -->
        <v-col cols="12" lg="8">
          <NavigationInterface 
            :crew-id="playerCrew?.id || 0"
            :character-id="playerCharacter?.id || 0"
            @navigation-completed="handleNavigationCompleted"
          />
        </v-col>
        
        <!-- SIDEBAR - INFORMAÇÕES -->
        <v-col cols="12" lg="4">
          
          <!-- INFORMAÇÕES DO NAVIO -->
          <v-card variant="elevated" class="mb-4">
            <v-card-title class="bg-purple-darken-2 text-white">
              <v-icon left color="white">mdi-ship</v-icon>
              Informações do Navio
            </v-card-title>
            
            <v-card-text class="pa-4">
              <div v-if="shipInfo" class="ship-details">
                <div class="ship-stat">
                  <v-icon color="purple-darken-2" class="mr-2">mdi-speedometer</v-icon>
                  <span>Nível: <strong>{{ shipInfo.level }}</strong></span>
                </div>
                
                <div class="ship-stat">
                  <v-icon color="blue-darken-2" class="mr-2">mdi-clock-fast</v-icon>
                  <span>Velocidade: <strong>{{ navigationTime }} min/viagem</strong></span>
                </div>
                
                <div class="ship-stat">
                  <v-icon color="green-darken-2" class="mr-2">mdi-account-group</v-icon>
                  <span>Tripulação Máxima: <strong>{{ maxCrewCapacity }}</strong></span>
                </div>
                
                <div class="ship-stat">
                  <v-icon color="orange-darken-2" class="mr-2">mdi-shield</v-icon>
                  <span>Resistência: <strong>{{ getShipResistance(shipInfo.level) }}</strong></span>
                </div>
              </div>
              
              <v-divider class="my-3"></v-divider>
              
              <!-- ✅ PROGRESSO DO UPGRADE (USANDO REFS CORRETOS) -->
              <div v-if="isUpgrading && upgradeTask" class="mb-3">
                <v-alert
                  type="info"
                  variant="tonal"
                  class="mb-3"
                >
                  <v-icon left>mdi-hammer-wrench</v-icon>
                  <strong>Upgrade em andamento!</strong>
                </v-alert>
                
                <div class="text-body-2 mb-2">
                  <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
                  {{ upgradeTask.description }}
                </div>
                
                <v-progress-linear
                  :model-value="upgradeProgress"
                  color="purple-darken-2"
                  height="8"
                  rounded
                >
                  <template v-slot:default="{ value }">
                    <small :class="Math.ceil(value)>= 52 ? 'text-white' : 'text-black'">{{ Math.ceil(value) }}%</small>
                  </template>
                </v-progress-linear>
                
                <div class="text-caption mt-1 text-center">
                  Tempo restante: {{ formattedTimeRemaining }}
                </div>
                
                <v-btn
                  color="red-darken-2"
                  variant="outlined"
                  size="small"
                  class="mt-2"
                  block
                  @click="handleCancelShipUpgrade"
                >
                  <v-icon left size="16">mdi-stop</v-icon>
                  Cancelar Upgrade
                </v-btn>
              </div>
              
              <!-- BOTÃO DE UPGRADE (SE NÃO ESTIVER ATIVO) -->
              <v-btn
                v-else
                color="purple-darken-2"
                variant="outlined"
                size="small"
                block
                @click="openShipUpgradeDialog"
                :disabled="!canUpgradeShip"
              >
                <v-icon left>mdi-hammer-wrench</v-icon>
                {{ canUpgradeShip ? 'Melhorar Navio' : 'Impossível melhorar no momento' }}
              </v-btn>
            </v-card-text>
          </v-card>
          
          <!-- LOCALIZAÇÃO ATUAL -->
          <v-card variant="elevated" class="mb-4">
            <v-card-title class="bg-green-darken-2 text-white">
              <v-icon left color="white">mdi-map-marker</v-icon>
              Localização Atual
            </v-card-title>
            
            <v-card-text class="pa-4">
              <div v-if="currentIsland" class="island-info">
                <div class="d-flex align-center mb-3">
                  <v-avatar 
                    size="60" 
                    :color="getDifficultyColor(currentIsland.difficulty)"
                    class="mr-3"
                  >
                    <v-icon size="30" color="white">mdi-island</v-icon>
                  </v-avatar>
                  
                  <div>
                    <div class="text-h6">{{ currentIsland.name }}</div>
                    <div class="text-body-2 text-grey-darken-1">
                      {{ getDifficultyName(currentIsland.difficulty) }}
                    </div>
                  </div>
                </div>
                
                <div class="island-stats">
                  <v-chip 
                    :color="getDifficultyColor(currentIsland.difficulty)" 
                    size="small" 
                    variant="elevated"
                    class="mr-2 mb-2"
                  >
                    Dificuldade {{ currentIsland.difficulty }}
                  </v-chip>
                  
                  <v-chip 
                    color="blue-darken-2" 
                    size="small" 
                    variant="elevated"
                    class="mr-2 mb-2"
                  >
                    {{ crewsOnIsland }} bandos ativos
                  </v-chip>
                </div>
                
                <v-btn
                  color="green-darken-2"
                  variant="outlined"
                  size="small"
                  block
                  class="mt-3"
                  @click="$router.push('/adventure')"
                >
                  <v-icon left>mdi-sword-cross</v-icon>
                   Se aventurar na ilha
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- HISTÓRICO DE NAVEGAÇÃO -->
          <v-card variant="elevated">
            <v-card-title class="bg-blue-darken-2 text-white">
              <v-icon left color="white">mdi-history</v-icon>
              Histórico de Navegação
            </v-card-title>
            
            <v-card-text class="pa-2">
              <div v-if="navigationHistory.length === 0" class="text-center pa-4">
                <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-ship-wheel</v-icon>
                <div class="text-body-2 text-grey-darken-1">
                  Nenhuma navegação realizada ainda
                </div>
              </div>
              
              <div v-else class="navigation-history-list">
                <div 
                  v-for="navigation in navigationHistory.slice(0, showAllHistory ? navigationHistory.length : 5)" 
                  :key="navigation.id"
                  class="history-item"
                >
                  <div class="d-flex align-center">
                    <v-icon 
                      color="blue-darken-2" 
                      class="mr-2"
                    >
                      mdi-compass
                    </v-icon>
                    
                    <div class="history-info">
                      <div class="history-title">
                        {{ navigation.description }}
                      </div>
                      <div class="history-details">
                        {{ formatDate(navigation.endTime) }} • {{ Math.floor(navigation.duration) }} min
                      </div>
                    </div>
                    
                    <v-chip 
                      color="green" 
                      size="small" 
                      variant="elevated"
                    >
                      Concluído
                    </v-chip>
                  </div>
                </div>
              </div>
              
              <v-btn 
                v-if="navigationHistory.length > 5"
                variant="text" 
                size="small" 
                block 
                class="mt-2"
                @click="showAllHistory = !showAllHistory"
              >
                {{ showAllHistory ? 'Mostrar Menos' : `Ver Todos (${navigationHistory.length})` }}
              </v-btn>
            </v-card-text>
          </v-card>
          
        </v-col>
      </v-row>
    </v-container>
    
    <!-- MODAL DE RESULTADO DE NAVEGAÇÃO -->
    <v-dialog v-model="showNavigationResult" max-width="600" persistent>
      <NavigationResultModal 
        v-if="navigationResult"
        :result="navigationResult"
        @close="closeNavigationResult"
        @start-battle="handleStartBattle"
      />
    </v-dialog>
    
    <!-- ✅ MODAL DE UPGRADE DO NAVIO CORRIGIDO -->
    <v-dialog v-model="showShipUpgrade" max-width="500">
      <ShipUpgradeModal 
        v-if="shipInfo"
        :ship="shipInfo"
        :ship-factor="characterStore.shipFactor"
        :can-upgrade="canUpgradeShip as boolean"
        @close="closeShipUpgradeDialog"
        @confirm="handleShipUpgrade"
      />
    </v-dialog>
    
    <!-- SNACKBAR DE NOTIFICAÇÕES -->
    <v-snackbar
      v-model="showNotification"
      :color="notificationColor"
      timeout="4000"
      location="top"
    >
      <v-icon left>{{ notificationIcon }}</v-icon>
      {{ notificationMessage }}
    </v-snackbar>
  </div>
  <!-- MODAL DE RESULTADO DE NAVEGAÇÃO COM DEBUG -->
<v-dialog v-model="showNavigationResult" max-width="600" persistent>
  
  <NavigationResultModal 
    v-if="navigationResult"
    :result="navigationResult"
    @close="closeNavigationResult"
    @start-battle="handleStartBattle"
  />
  
  <!-- ✅ FALLBACK SE NÃO HÁ RESULTADO -->
  <v-card v-else-if="showNavigationResult" max-width="400">
    <v-card-title class="bg-red-darken-2 text-white">
      <v-icon left>mdi-alert</v-icon>
      Erro no Modal
    </v-card-title>
    <v-card-text class="pa-4">
      <div class="text-center">
        <v-icon size="60" color="red-darken-2" class="mb-3">mdi-bug</v-icon>
        <div class="text-h6 mb-2">Dados não encontrados</div>
        <div class="text-body-2 mb-3">
          O resultado da navegação não foi carregado corretamente.
        </div>
        <v-btn color="red-darken-2" @click="closeNavigationResult">
          Fechar
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</v-dialog>
<!-- MODAL DE RESULTADO DA BATALHA -->
<v-dialog v-model="showBattleResult" max-width="700" persistent>
  <NavalBattleResultModal 
    v-if="battleResult"
    :result="battleResult"
    @close="closeBattleResult"
  />
</v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { NavigationSystem } from '@/utils/navigationSystem'
import { ShipUpgradeSystem } from '@/utils/shipUpgradeSystem'
import { useShipUpgrade } from '@/composables/useShipUpgrade'
import { db } from '@/utils/database'
import NavigationInterface from '@/components/NavigationInterface.vue'
import NavigationResultModal from '@/components/NavigationResultModal.vue'
import ShipUpgradeModal from '@/components/ShipUpgradeModal.vue'
import type { Island, Ship, Task, Crew } from '@/utils/database'
import NavalBattleResultModal from '@/components/NavalBattleResultModal.vue'
import { NavalBattleSystem } from '@/utils/navalBattleSystem'
import type { BattleResult } from '@/utils/navalBattleSystem'
import { GameLogic } from '@/utils/gameLogic'

const characterStore = useCharacterStore()

// 🔄 LOADING STATES
const playerCharacterLoaded = ref(false)
const playerCrewLoaded = ref(false)
const navigationDataLoaded = ref(false)
const composableInitialized = ref(false)

// 📊 REACTIVE DATA
const currentIsland = ref<Island | null>(null)
const shipInfo = ref<Ship | null>(null)
const navigationHistory = ref<Task[]>([])
const crewsOnIsland = ref(0)
const navigationTime = ref(30)
const maxCrewCapacity = ref(3)
const showAllHistory = ref(false)
const showBattleResult = ref(false)
const battleResult = ref<BattleResult | null>(null)
const isBattling = ref(false)

// 🚢 MODALS
const showNavigationResult = ref(false)
const showShipUpgrade = ref(false)
const navigationResult = ref<any>(null)

// 📢 NOTIFICATION SYSTEM
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationColor = ref('success')
const notificationIcon = ref('mdi-check')

// ✅ SHIP UPGRADE COMPOSABLE - REFS COM TIPAGEM CORRETA
const shipUpgradeTask = ref<Task | null>(null)
const shipIsUpgrading = ref<boolean>(false)
const shipUpgradeProgress = ref<number>(0)
const shipTimeRemaining = ref<number>(0)
const shipFormattedTimeRemaining = ref<string>('0m 0s')
const shipCanUpgrade = ref<boolean>(false)

// ✅ COMPOSABLE INSTANCE
let shipUpgradeComposable: ReturnType<typeof useShipUpgrade> | null = null

// 📊 COMPUTED
const playerCharacter = computed(() => characterStore.playerCharacter)
const playerCrew = computed(() => characterStore.playerCrew)

const currentSeaInfo = computed(() => GameLogic.getSea(currentIsland.value?.difficulty ?? 1))
const seaAccessInfo = computed(() => playerCharacter.value ? GameLogic.getSeaAccess(playerCharacter.value) : [])
const nextSeaInfo = computed(() => seaAccessInfo.value.find(sa => !sa.unlocked) ?? null)

const formatBountyNav = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`
  return `${value}`
}

const allDataLoaded = computed(() => {
  return playerCharacterLoaded.value && 
         playerCrewLoaded.value && 
         navigationDataLoaded.value &&
         composableInitialized.value
})

// ✅ COMPUTED PARA SHIP UPGRADE (MANUAL COM TIPAGEM CORRETA)
const upgradeTask = computed((): Task | null => shipUpgradeTask.value)
const isUpgrading = computed((): boolean => shipIsUpgrading.value)
const upgradeProgress = computed((): number => shipUpgradeProgress.value)
const timeRemaining = computed((): number => shipTimeRemaining.value)
const formattedTimeRemaining = computed((): string => shipFormattedTimeRemaining.value)

// ✅ COMPUTED PRINCIPAL PARA UPGRADE
const canUpgradeShip = computed((): boolean => {
  if (!shipInfo.value || !playerCharacter.value || !composableInitialized.value) {
    console.log('🔧 Navigation - Dados não disponíveis para upgrade:', {
      ship: !!shipInfo.value,
      character: !!playerCharacter.value,
      composable: composableInitialized.value
    })
    return false
  }

  const shipNotUpgrading = !shipIsUpgrading.value
  const shipNotMaxLevel = shipInfo.value.level < 5
  const captainLevelAllows = shipInfo.value.level < ShipUpgradeSystem.determineShipLevel(playerCharacter.value.level)

  const canUpgrade = shipNotUpgrading && shipNotMaxLevel && captainLevelAllows

  console.log('🔧 Navigation - Verificação de upgrade:', {
    shipLevel: shipInfo.value.level,
    captainLevel: playerCharacter.value.level,
    maxAllowed: ShipUpgradeSystem.determineShipLevel(playerCharacter.value.level),
    shipNotUpgrading,
    shipNotMaxLevel,
    captainLevelAllows,
    finalResult: canUpgrade
  })

  return canUpgrade
})

// ✅ COMPUTED PARA DEBUG
const upgradeDebugInfo = computed(() => {
  if (!shipInfo.value || !playerCharacter.value) return null
  
  return {
    shipLevel: shipInfo.value.level,
    captainLevel: playerCharacter.value.level,
    maxAllowedLevel: ShipUpgradeSystem.determineShipLevel(playerCharacter.value.level),
    isUpgrading: shipIsUpgrading.value,
    composableReady: composableInitialized.value,
    canUpgrade: canUpgradeShip.value,
    currentTask: shipUpgradeTask.value ? {
      id: shipUpgradeTask.value.id,
      type: shipUpgradeTask.value.type,
      description: shipUpgradeTask.value.description,
      isCompleted: shipUpgradeTask.value.isCompleted
    } : null
  }
})

// ✅ FUNÇÃO PARA SINCRONIZAR ESTADOS DO COMPOSABLE
const syncComposableStates = async () => {
  if (!shipUpgradeComposable) {
    console.log('⚠️ Navigation - Composable não disponível para sincronização')
    return
  }

  try {
    // Sincronizar com verificação de tipo
    shipUpgradeTask.value = shipUpgradeComposable.currentTask.value || null
    shipIsUpgrading.value = await shipUpgradeComposable.isUpgrading.value || false
    shipUpgradeProgress.value = shipUpgradeComposable.upgradeProgress.value || 0
    shipTimeRemaining.value = shipUpgradeComposable.timeRemaining.value || 0
    shipFormattedTimeRemaining.value = shipUpgradeComposable.formattedTimeRemaining.value || '0m 0s'
    shipCanUpgrade.value = shipUpgradeComposable.canUpgrade.value || false

    console.log('🔄 Navigation - Estados sincronizados:', {
      hasTask: !!shipUpgradeTask.value,
      taskType: shipUpgradeTask.value?.type,
      isUpgrading: shipIsUpgrading.value,
      canUpgrade: shipCanUpgrade.value,
      progress: shipUpgradeProgress.value
    })
  } catch (error) {
    console.error('❌ Navigation - Erro ao sincronizar estados:', error)
  }
}

// ✅ INICIALIZAR COMPOSABLE DE SHIP UPGRADE
const initializeShipUpgradeComposable = async (): Promise<void> => {
  if (!shipInfo.value || !playerCharacter.value) {
    console.log('⚠️ Navigation - Dados não disponíveis para inicializar composable')
    return
  }

  try {
    console.log('🔧 Navigation - Inicializando composable de ship upgrade...')
    
    shipUpgradeComposable = useShipUpgrade(
      computed(() => shipInfo.value),
      computed(() => playerCharacter.value)
    )

    // Aguardar próximo tick para garantir que o composable foi inicializado
    await nextTick()

    // Sincronizar estados iniciais
    syncComposableStates()

    // Configurar watchers para sincronização contínua
    watch(
      () => shipUpgradeComposable?.canUpgrade.value,
      (newValue) => {
        console.log('🔄 Navigation - canUpgrade mudou:', newValue)
        syncComposableStates()
      },
      { immediate: true }
    )

    watch(
      () => shipUpgradeComposable?.isUpgrading.value,
      (newValue) => {
        console.log('🔄 Navigation - isUpgrading mudou:', newValue)
        syncComposableStates()
      },
      { immediate: true }
    )

    watch(
      () => shipUpgradeComposable?.currentTask.value,
      (newValue) => {
        console.log('🔄 Navigation - currentTask mudou:', newValue?.type)
        syncComposableStates()
      },
      { immediate: true }
    )

    composableInitialized.value = true
    
    console.log('✅ Navigation - Composable de ship upgrade inicializado e sincronizado')
    console.log('🔧 Navigation - Estado inicial:', upgradeDebugInfo.value)
    
  } catch (error) {
    console.error('❌ Navigation - Erro ao inicializar composable:', error)
    composableInitialized.value = true // Marcar como inicializado mesmo com erro
  }
}

// 🔄 CARREGAMENTO SEQUENCIAL
const loadDataSequentially = async (): Promise<void> => {
  try {
    console.log('🔄 Navigation - Iniciando carregamento de dados de navegação...')
    
    // 1. Aguardar playerCharacter e playerCrew estarem disponíveis
    while (!playerCharacter.value || !playerCrew.value) {
      console.log('⏳ Navigation - Aguardando playerCharacter e playerCrew...')
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    playerCharacterLoaded.value = true
    playerCrewLoaded.value = true
    
    console.log('✅ Navigation - PlayerCharacter e PlayerCrew disponíveis')
    
    // 2. Carregar dados de navegação
    console.log('🔄 Navigation - Carregando dados de navegação...')
    await loadNavigationData()
    
    // 3. ✅ Inicializar composable APÓS todos os dados estarem carregados
    await initializeShipUpgradeComposable()
    
    console.log('✅ Navigation - Todos os dados de navegação carregados!')
    
  } catch (error) {
    console.error('❌ Navigation - Erro no carregamento sequencial:', error)
  }
}

// ✅ CARREGAR DADOS DE NAVEGAÇÃO
const loadNavigationData = async (): Promise<void> => {
  if (!playerCrew.value) {
    console.log('⚠️ Navigation - PlayerCrew não disponível para carregar dados')
    return
  }
  
  try {
    console.log('🔄 Navigation - Carregando dados de navegação...')
    
    // Carregar ilha atual
    const island = await db.islands.get(playerCrew.value.currentIsland)
    currentIsland.value = island || null
    
    // Carregar informações do navio
    const ship = await db.ships.where('crewId').equals(playerCrew.value.id!).first()
    shipInfo.value = ship || null
    
    if (ship) {
      navigationTime.value = NavigationSystem.calculateNavigationTime(ship.level)
      maxCrewCapacity.value = ship.level * characterStore.shipFactor
    }
    
    // Carregar histórico de navegação
    const history = await db.tasks
      .where('type')
      .equals('navigation')
      .and(task => task.isCompleted)
      .reverse()
      .toArray()
    
    navigationHistory.value = history
    
    // Contar crews na ilha atual
    if (island) {
      const crews = await db.crews
        .where('currentIsland')
        .equals(island.id!)
        .and(crew => crew.docked === 1)
        .toArray()
      
      crewsOnIsland.value = crews.length
    }
    
    console.log(`✅ Navigation - Dados carregados: ilha=${island?.name}, navio=nv.${ship?.level}, histórico=${history.length}`)
    
    navigationDataLoaded.value = true
    
  } catch (error) {
    console.error('❌ Navigation - Erro ao carregar dados de navegação:', error)
    navigationDataLoaded.value = true
  }
}

// 🚢 NAVIGATION METHODS
// No handleNavigationCompleted, adicionar recarregamento forçado

const handleNavigationCompleted = async (event: any) => {
  console.log('🎉 Navigation - Navegação concluída!', event)
  
  const eventDetail = event.detail || event
  console.log('📊 Navigation - Event detail:', eventDetail)
  
  if (!eventDetail) {
    console.error('❌ Navigation - Dados do evento não encontrados')
    return
  }
  
  let completeNavigationResult = { ...eventDetail }
  
  // Buscar dados completos se necessário
  if (eventDetail.destinationIslandId && !eventDetail.destinationIsland) {
    try {
      console.log('🔍 Navigation - Buscando ilha de destino:', eventDetail.destinationIslandId)
      const island = await db.islands.get(eventDetail.destinationIslandId)
      if (island) {
        completeNavigationResult.destinationIsland = island
        console.log('✅ Navigation - Ilha encontrada:', island.name)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar ilha de destino:', error)
    }
  }
  
  if (eventDetail.enemyCrewId && !eventDetail.enemyCrew) {
    try {
      console.log('🔍 Navigation - Buscando crew inimigo:', eventDetail.enemyCrewId)
      const enemyCrew = await db.crews.get(eventDetail.enemyCrewId)
      if (enemyCrew) {
        completeNavigationResult.enemyCrew = enemyCrew
        console.log('✅ Navigation - Crew inimigo encontrado:', enemyCrew.name)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar crew inimigo:', error)
    }
  }
  
  console.log('✅ Navigation - Resultado final completo:', completeNavigationResult)
  
  navigationResult.value = completeNavigationResult
  showNavigationResult.value = true
  
  // ✅ RECARREGAMENTO FORÇADO E SEQUENCIAL
  console.log('🔄 Navigation - Iniciando recarregamento de dados...')
  
  try {
    // 1. Recarregar character store
    await characterStore.loadPlayerCharacter()
    await characterStore.loadPlayerCrew()
    console.log('✅ Navigation - Character store recarregado')
    
    // 2. Recarregar dados de navegação
    await loadNavigationData()
    console.log('✅ Navigation - Dados de navegação recarregados')
    
    // 3. Verificar se a localização foi atualizada
    if (playerCrew.value) {
      const updatedCrew = await db.crews.get(playerCrew.value.id!)
      console.log('🔍 Navigation - Crew após recarregamento:', {
        id: updatedCrew?.id,
        name: updatedCrew?.name,
        currentIsland: updatedCrew?.currentIsland,
        expectedIsland: eventDetail.destinationIslandId
      })
      
      if (updatedCrew && updatedCrew.currentIsland === eventDetail.destinationIslandId) {
        console.log('✅ Navigation - Localização atualizada corretamente!')
      } else {
        console.error('❌ Navigation - Localização NÃO foi atualizada!')
        
        // ✅ FORÇAR ATUALIZAÇÃO SE NECESSÁRIO
        if (eventDetail.destinationIslandId) {
          console.log('🔧 Navigation - Forçando atualização da localização...')
          await db.crews.update(playerCrew.value.id!, {
            currentIsland: eventDetail.destinationIslandId,
            docked: 1
          })
          
          // Recarregar novamente
          await characterStore.loadPlayerCrew()
          await loadNavigationData()
          console.log('✅ Navigation - Localização forçada!')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Navigation - Erro no recarregamento:', error)
  }
  
  // Sincronizar estados após recarregar
  if (composableInitialized.value) {
    syncComposableStates()
  }
  
  // Mostrar notificação
  showNotification.value = true
  notificationMessage.value = `Navegação concluída! Chegada em ${completeNavigationResult.destinationIsland?.name || 'nova ilha'}!`
  notificationColor.value = 'success'
  notificationIcon.value = 'mdi-compass'
}

const closeNavigationResult = () => {
  console.log('🔒 Navigation - Fechando modal de resultado')
  showNavigationResult.value = false
  navigationResult.value = null
}

const handleStartBattle = async (battleData: any) => {
  console.log('⚔️ Navigation - Iniciando batalha de crew:', battleData)
  
  if (isBattling.value) return
  
  try {
    isBattling.value = true
    
    // Fechar modal de navegação
    closeNavigationResult()
    
    // Mostrar notificação de início
    showNotification.value = true
    notificationMessage.value = 'Batalha naval iniciada!'
    notificationColor.value = 'warning'
    notificationIcon.value = 'mdi-sword-cross'
    
    // Aguardar um pouco para efeito dramático
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Executar batalha
    console.log('⚔️ Navigation - Executando batalha...')
    const result = await NavalBattleSystem.startNavalBattle(
      playerCrew.value!.id!,
      battleData.enemyCrew,
      battleData.island
    )
    
    console.log('✅ Navigation - Resultado da batalha:', result)
    
    // Mostrar resultado
    battleResult.value = result
    showBattleResult.value = true
    
    // Recarregar dados após batalha
    await Promise.all([
      characterStore.loadPlayerCharacter(),
      characterStore.loadPlayerCrew(),
      loadNavigationData()
    ])
    
  } catch (error) {
    console.error('❌ Navigation - Erro na batalha:', error)
    
    showNotification.value = true
    notificationMessage.value = 'Erro durante a batalha naval!'
    notificationColor.value = 'error'
    notificationIcon.value = 'mdi-alert'
  } finally {
    isBattling.value = false
  }
}

const closeBattleResult = () => {
  showBattleResult.value = false
  battleResult.value = null
}

// ✅ SHIP UPGRADE METHODS SEGUROS
const openShipUpgradeDialog = () => {
  console.log('🔧 Navigation - Abrindo modal de upgrade. Estado atual:', upgradeDebugInfo.value)
  showShipUpgrade.value = true
}

const closeShipUpgradeDialog = () => {
  showShipUpgrade.value = false
}

const handleShipUpgrade = async () => {
  if (!shipUpgradeComposable) {
    console.error('❌ Navigation - Composable de ship upgrade não inicializado')
    return
  }
  
  try {
    console.log('🔧 Navigation - Iniciando upgrade do navio...')
    
    const success = await shipUpgradeComposable.startUpgrade()
    
    if (success) {
      console.log('✅ Navigation - Upgrade iniciado com sucesso!')
      
      closeShipUpgradeDialog()
      syncComposableStates() // Sincronizar estados após iniciar
      
      showNotification.value = true
      notificationMessage.value = 'Upgrade do navio iniciado!'
      notificationColor.value = 'success'
      notificationIcon.value = 'mdi-hammer-wrench'
    } else {
      console.error('❌ Navigation - Falha ao iniciar upgrade')
      
      showNotification.value = true
      notificationMessage.value = 'Erro ao iniciar upgrade do navio'
      notificationColor.value = 'error'
      notificationIcon.value = 'mdi-alert'
    }
    
  } catch (error) {
    console.error('❌ Navigation - Erro ao iniciar upgrade:', error)
    
    showNotification.value = true
    notificationMessage.value = 'Erro ao iniciar upgrade do navio'
    notificationColor.value = 'error'
    notificationIcon.value = 'mdi-alert'
  }
}

const handleCancelShipUpgrade = async () => {
  if (!shipUpgradeComposable) {
    console.error('❌ Navigation - Composable de ship upgrade não inicializado')
    return
  }
  
  try {
    console.log('🛑 Navigation - Cancelando upgrade do navio...')
    
    const success = await shipUpgradeComposable.cancelUpgrade()
    
    if (success) {
      console.log('✅ Navigation - Upgrade cancelado com sucesso!')
      
      syncComposableStates() // Sincronizar estados após cancelar
      
      showNotification.value = true
      notificationMessage.value = 'Upgrade do navio cancelado'
      notificationColor.value = 'warning'
      notificationIcon.value = 'mdi-stop'
    } else {
      console.error('❌ Navigation - Falha ao cancelar upgrade')
      
      showNotification.value = true
      notificationMessage.value = 'Erro ao cancelar upgrade'
      notificationColor.value = 'error'
      notificationIcon.value = 'mdi-alert'
    }
    
  } catch (error) {
    console.error('❌ Navigation - Erro ao cancelar upgrade:', error)
    
    showNotification.value = true
    notificationMessage.value = 'Erro ao cancelar upgrade'
    notificationColor.value = 'error'
    notificationIcon.value = 'mdi-alert'
  }
}

// 🎨 HELPER FUNCTIONS
const getDifficultyName = (difficulty: number): string => {
  if (difficulty <= 2) return 'Fácil'
  if (difficulty <= 4) return 'Médio'
  if (difficulty <= 6) return 'Difícil'
  if (difficulty <= 8) return 'Muito Difícil'
  return 'Extremo'
}

const getDifficultyColor = (difficulty: number): string => {
  if (difficulty <= 2) return 'green'
  if (difficulty <= 4) return 'blue'
  if (difficulty <= 6) return 'orange'
  if (difficulty <= 8) return 'red'
  return 'purple'
}

const getShipResistance = (level: number): string => {
  if (level <= 2) return 'Baixa'
  if (level <= 4) return 'Média'
  if (level <= 6) return 'Alta'
  if (level <= 8) return 'Muito Alta'
  return 'Extrema'
}

const formatDate = (dateString: Date): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ✅ WATCHERS PARA REATIVIDADE
watch([shipInfo, playerCharacter], () => {
  if (composableInitialized.value) {
    console.log('🔄 Navigation - Dados do ship/character mudaram, recomputando...')
    nextTick(() => {
      syncComposableStates()
    })
  }
}, { deep: true })

// ✅ LIFECYCLE
onMounted(async () => {
  console.log('🚀 Navigation - View Navigation montada, iniciando carregamento...')
  await loadDataSequentially()
  
  // ✅ DEBUG TEMPORÁRIO - LISTENER MANUAL
  window.addEventListener('navigationCompleted', (event) => {
    console.log('�� Navigation - Evento navigationCompleted capturado:', event)
    handleNavigationCompleted(event)
  })
  
  // ✅ Listener para upgrade do navio
  window.addEventListener('shipUpgradeCompleted', async (event: any) => {
    console.log('�� Navigation - Upgrade do navio concluído!', event.detail)
    
    // Recarregar dados
    await loadNavigationData()
    
    // Sincronizar estados
    syncComposableStates()
    
    showNotification.value = true
    notificationMessage.value = `Navio melhorado para Nível ${event.detail.newLevel}!`
    notificationColor.value = 'success'
    notificationIcon.value = 'mdi-ship'
  })
})

onUnmounted(() => {
  // Remover listeners
  window.removeEventListener('navigationCompleted', handleNavigationCompleted)
  window.removeEventListener('shipUpgradeCompleted', () => {})
})

// ✅ MÉTODO DE TESTE TEMPORÁRIO
const testNavigationModal = () => {
  console.log('🧪 Navigation - Testando modal...')
  
  navigationResult.value = {
    crewId: playerCrew.value?.id || 1,
    taskId: 999,
    destinationIsland: {
      id: 1,
      name: 'Ilha de Teste',
      difficulty: 3
    },
    enemyCrew: {
      id: 2,
      name: 'Piratas do Teste',
      type: 'Pirate',
      reputation: 1000
    },
    battleStory: 'Esta é uma história de teste para verificar se o modal funciona corretamente.',
    enemyCrewSize: 5,
    encounterType: 'naval_battle',
    success: true
  }
  
  showNavigationResult.value = true
  
  console.log('🧪 Navigation - Modal de teste ativado:', {
    show: showNavigationResult.value,
    result: navigationResult.value
  })
}
</script>

<style scoped>
/* ============================================================
   Navigation - Grand Line Sea Chart
   ============================================================ */

/* Sea banner */
.nav-sea-banner {
  padding: 10px 0;
  margin-bottom: 0;
}

.nav-sea-name {
  font-weight: 700;
  color: white;
  font-size: 1rem;
  letter-spacing: 0.06em;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.loading-container {
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Navigation header */
.navigation-header {
  background: linear-gradient(135deg,
    rgba(21, 101, 192, 0.12),
    rgba(212, 175, 55, 0.06)
  );
  border: 1px solid rgba(21, 101, 192, 0.35);
  border-radius: 14px;
  padding: 18px 24px;
  margin-bottom: 20px;
  position: relative;
}

.navigation-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent, #1565C0, #90CAF9, #1565C0, transparent
  );
  border-radius: 14px 14px 0 0;
}

/* Route / destination cards */
.route-card {
  background: #132235;
  border: 1px solid rgba(21, 101, 192, 0.3);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  height: 100%;
}

.route-card:hover {
  border-color: rgba(21, 101, 192, 0.65);
  box-shadow: 0 0 16px rgba(21, 101, 192, 0.22);
  transform: translateY(-2px);
}

.route-card.selected {
  border-color: #1565C0;
  background: linear-gradient(135deg,
    rgba(21, 101, 192, 0.15),
    rgba(212, 175, 55, 0.06)
  );
  box-shadow: 0 0 20px rgba(21, 101, 192, 0.3);
}

.route-island-name {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #90CAF9;
  font-size: 1rem;
  margin-bottom: 6px;
}

.route-distance {
  font-size: 0.78rem;
  color: #8B9DC3;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.route-distance-value {
  color: #D4AF37;
  font-weight: 600;
}

/* Ship status panel */
.ship-status-panel {
  background: linear-gradient(135deg, #0F1E33, #132235);
  border: 1px solid rgba(21, 101, 192, 0.4);
  border-radius: 14px;
  overflow: hidden;
}

.ship-status-header {
  background: linear-gradient(135deg,
    rgba(21, 101, 192, 0.18),
    rgba(144, 202, 249, 0.05)
  );
  border-bottom: 1px solid rgba(21, 101, 192, 0.3);
  padding: 12px 18px;
}

.ship-status-name {
  font-family: Georgia, serif;
  color: #90CAF9;
  font-weight: 700;
  font-size: 1rem;
}

/* Navigation in progress panel */
.voyage-in-progress {
  background: linear-gradient(135deg, #0A1A2E, #0F2040);
  border: 1px solid rgba(21, 101, 192, 0.5);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
}

.voyage-header {
  background: linear-gradient(135deg,
    rgba(21, 101, 192, 0.2),
    rgba(144, 202, 249, 0.06)
  );
  border-bottom: 1px solid rgba(21, 101, 192, 0.35);
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.voyage-title {
  font-family: Georgia, serif;
  color: #90CAF9;
  font-weight: 700;
  font-size: 1rem;
  animation: voyage-pulse 3s ease-in-out infinite;
}

@keyframes voyage-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Weather / sea condition badge */
.sea-condition {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 16px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sea-calm { color: #66BB6A; background: rgba(102, 187, 106, 0.1); border: 1px solid rgba(102, 187, 106, 0.3); }
.sea-rough { color: #FFA726; background: rgba(255, 167, 38, 0.1); border: 1px solid rgba(255, 167, 38, 0.3); }
.sea-storm { color: #EF5350; background: rgba(239, 83, 80, 0.1); border: 1px solid rgba(239, 83, 80, 0.3); }
</style>