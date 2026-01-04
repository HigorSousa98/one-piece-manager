<!-- src/App.vue -->
<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      app
      color="primary"
      dark
      width="280"
    >
      <!-- Header do Menu -->
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <span class="text-h4">🏴‍☠️</span>
        </v-list-item-avatar>
        <v-list-item-title class="text-h6">
          One Piece Manager
        </v-list-item-title>
      </v-list-item>

      <v-divider></v-divider>

      <!-- Menu Items -->
      <v-list dense nav>
        <v-list-item
          v-for="item in regularMenuItems"
          :key="item.title"
          :to="item.route"
          link
          color="white"
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>

        <!-- Boss Fight - Aparece apenas quando há bosses detectados -->
        <v-list-item
          v-if="showBossFightMenu"
          :to="'/boss-fight'"
          link
          color="white"
          class="boss-fight-menu-item"
        >
          <template v-slot:prepend>
            <v-icon color="error">mdi-skull</v-icon>
          </template>
          <v-list-item-title>Boss Fight</v-list-item-title>
          <template v-slot:append>
            <v-chip
              color="error"
              size="small"
              variant="elevated"
              class="boss-count-chip"
            >
              {{ detectedBossesCount }}
            </v-chip>
          </template>
        </v-list-item>

        <!-- Divider se houver boss fight -->
        <v-divider v-if="showBossFightMenu" class="my-2"></v-divider>

        <!-- Resto dos menu items -->
        <v-list-item
          v-for="item in bottomMenuItems"
          :key="item.title"
          :to="item.route"
          link
          color="white"
        >
          <template v-slot:prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Player Info no Menu -->
      <template v-slot:append>
        <div class="pa-2" v-if="playerCharacter">
          <v-card color="rgba(255,255,255,0.1)" dark>
            <v-card-text class="py-2">
              <div class="text-caption">{{ playerCharacter.name }}</div>
              <div class="text-body-2">Level {{ playerCharacter.level }}</div>
              <div class="text-caption">Exp {{ playerCharacter.experience }} / {{ expForNextLevel }}</div>
              <div class="text-caption">
                <CharacterBountyDisplay 
                  :character="playerCharacter" 
                  size="small" 
                  variant="elevated" 
                />
              </div>
            </v-card-text>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app color="primary" dark elevation="2">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-toolbar-title class="text-h5">
        🏴‍☠️ One Piece World
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- ✅ INDICADOR DISCRETO DE MUNDO ATUALIZANDO -->
      <v-progress-circular
        v-if="worldStore.isUpdating"
        indeterminate
        size="18"
        width="2"
        color="white"
        class="world-updating-indicator mr-3"
        :title="worldStore.currentPhase || 'Atualizando mundo...'"
      />

      <!-- ✅ INDICADOR DE PERFORMANCE DOS WORKERS -->
      <v-tooltip v-if="showPerformanceIndicator" bottom>
        <template v-slot:activator="{ props }">
          <v-chip
            v-bind="props"
            :color="getPerformanceColor()"
            size="x-small"
            variant="outlined"
            class="performance-indicator mr-2"
          >
            <v-icon size="12" start>{{ getPerformanceIcon() }}</v-icon>
            {{ getPerformanceText() }}
          </v-chip>
        </template>
        <div>
          <div><strong>Método:</strong> {{ worldStore.updateMethod || 'N/A' }}</div>
          <div><strong>Workers:</strong> {{ worldStore.workerStats.available ? 'Ativo' : 'Indisponível' }}</div>
          <div><strong>Updates:</strong> {{ worldStore.performanceStats.totalUpdates }}</div>
          <div><strong>Tempo Médio:</strong> {{ worldStore.performanceStats.averageUpdateTime }}ms</div>
          <div><strong>Worker %:</strong> {{ worldStore.performanceStats.workerPercentage }}%</div>
        </div>
      </v-tooltip>

      <!-- Boss Fight Alert no Header -->
      <v-btn
        v-if="showBossFightMenu"
        icon
        color="error"
        variant="outlined"
        @click="$router.push('/boss-fight')"
        class="boss-fight-header-btn mr-2"
        size="small"
      >
        <v-icon>mdi-skull</v-icon>
        <v-badge
          :content="detectedBossesCount"
          color="error"
          floating
          offset-x="8"
          offset-y="8"
        />
      </v-btn>

      <!-- Status do Jogo -->
      <v-chip 
        v-if="gameStore.isInitialized"
        color="success" 
        variant="elevated"
        class="mb-2"
      >
        <v-icon start>mdi-check-circle</v-icon>
        Jogo Ativo
      </v-chip>

      <!-- Bounty Display -->
      <CharacterBountyDisplay 
        v-if="gameLoaded"
        :character="playerCharacter" 
        size="default" 
        variant="elevated" 
      />

      <!-- Loading Indicator -->
      <v-progress-circular
        v-if="gameStore.isInitializing"
        indeterminate
        color="white"
        size="24"
      ></v-progress-circular>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4">
        <!-- Loading Screen -->
        <div v-if="gameStore.isInitializing" class="text-center py-12">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <div class="text-h6 mt-4">Carregando o mundo de One Piece...</div>
          <div class="text-body-2 mt-2">Gerando piratas, marines e ilhas...</div>
          
          <!-- ✅ PROGRESSO DA INICIALIZAÇÃO DOS WORKERS -->
          <div v-if="worldInitializing" class="mt-4">
            <v-progress-linear
              :model-value="worldInitProgress"
              color="secondary"
              height="6"
              rounded
              class="mb-2"
            />
            <div class="text-caption">{{ worldInitStatus }}</div>
          </div>
        </div>

        <!-- Game Content -->
        <router-view v-else></router-view>
      </v-container>
    </v-main>

    <!-- Snackbar para notificações críticas apenas -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="bottom right"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Boss Fight Notification Toast -->
    <v-snackbar
      v-model="bossNotification.show"
      color="error"
      timeout="5000"
      location="top right"
      variant="elevated"
    >
      <v-icon start>mdi-skull</v-icon>
      {{ bossNotification.text }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="$router.push('/boss-fight')"
        >
          Desafiar
        </v-btn>
        <v-btn
          color="white"
          variant="text"
          @click="bossNotification.show = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useWorldStore } from '@/stores/worldStore'
import { GameLogic } from '@/utils/gameLogic' 
import { BossDetectionSystem } from '@/utils/bossDetectionSystem'
import CharacterBountyDisplay from './components/CharacterBountyDisplay.vue'

const drawer = ref(true)
const gameStore = useGameStore()
const characterStore = useCharacterStore()
const worldStore = useWorldStore()
const gameLoaded = ref(false)

// ✅ BOSS FIGHT STATE
const detectedBossesCount = ref(0)
const lastCheckedIsland = ref<number | null>(null)

const worldInitializing = ref(false)
const worldInitProgress = ref(0)
const worldInitStatus = ref('')

// ✅ PERFORMANCE INDICATORS
const showPerformanceIndicator = ref(false)
const forcingUpdate = ref(false)
const reinitializingWorkers = ref(false)

// ✅ DEVELOPMENT MODE
const isDevelopment = computed(() => import.meta.env.DEV)

const playerCharacter = computed(() => characterStore.playerCharacter)
const playerCrew = computed(() => characterStore.playerCrew)

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
})

// ✅ BOSS NOTIFICATION
const bossNotification = reactive({
  show: false,
  text: ''
})

const expForNextLevel = computed(() => {
  if (!playerCharacter.value) return 0
  return GameLogic.nextLevelUp(playerCharacter.value)
})

// ✅ COMPUTED PARA MOSTRAR BOSS FIGHT
const showBossFightMenu = computed(() => detectedBossesCount.value > 0)

// ✅ COMPUTED PARA ILHA ATUAL
const currentIslandId = computed(() => {
  if (playerCharacter.value?.crewId) {
    return playerCrew.value?.currentIsland || 1
  }
  return null
})


const preferWorkers = computed({
  get: () => worldStore.preferWorkers,
  set: (value) => worldStore.setPreferWorkers(value)
})

// ✅ SEPARAR MENU ITEMS
const regularMenuItems = [
  { 
    title: 'Dashboard', 
    icon: 'mdi-view-dashboard', 
    route: '/' 
  },
  { 
    title: 'Aventuras', 
    icon: 'mdi-map', 
    route: '/adventure' 
  },
  { 
    title: 'Liberação de ilhas', 
    icon: 'mdi-sword-cross', 
    route: '/territory-liberation' 
  },
  { 
    title: 'Navegação', 
    icon: 'mdi-compass', 
    route: '/navigation' 
  },
  { 
    title: 'Explorar Ilhas', 
    icon: 'mdi-island', 
    route: '/islands' 
  },
  { 
    title: 'Tripulação', 
    icon: 'mdi-account-group', 
    route: '/crew' 
  }
]

const bottomMenuItems = [
  { 
    title: 'Treinar', 
    icon: 'mdi-dumbbell', 
    route: '/training' 
  },
  { 
    title: 'Mundo', 
    icon: 'mdi-earth', 
    route: '/encyclopedia' 
  },
  { 
    title: 'Histórico', 
    icon: 'mdi-history', 
    route: '/history' 
  }
]

// ✅ DETECTAR BOSSES NA ILHA ATUAL
const detectBossesOnCurrentIsland = async () => {
  if (!currentIslandId.value || !gameLoaded.value) return
  
  // Evitar detecção repetida na mesma ilha
  if (lastCheckedIsland.value === currentIslandId.value) return
  
  try {
    const bosses = await BossDetectionSystem.detectBossesOnIsland(currentIslandId.value)
    const previousCount = detectedBossesCount.value
    detectedBossesCount.value = bosses.length
    lastCheckedIsland.value = currentIslandId.value
    
    // ✅ MOSTRAR NOTIFICAÇÃO APENAS PARA BOSSES (importante para gameplay)
    if (bosses.length > 0 && previousCount === 0) {
      const bossTypes = [...new Set(bosses.map(b => b.type))].join(', ')
      bossNotification.text = `${bosses.length} algoz(es) detectado(s): ${bossTypes}!`
      bossNotification.show = true
    }
    
  } catch (error) {
    console.error('Erro ao detectar bosses:', error)
    detectedBossesCount.value = 0
  }
}

// ✅ FUNÇÕES DE PERFORMANCE
const getPerformanceColor = (): string => {
  if (!worldStore.workerStats.available) return 'warning'
  
  const workerPercentage = worldStore.performanceStats.workerPercentage
  if (workerPercentage >= 80) return 'success'
  if (workerPercentage >= 50) return 'info'
  return 'warning'
}

const getPerformanceIcon = (): string => {
  if (!worldStore.workerStats.available) return 'mdi-alert-circle'
  
  const workerPercentage = worldStore.performanceStats.workerPercentage
  if (workerPercentage >= 80) return 'mdi-rocket'
  if (workerPercentage >= 50) return 'mdi-speedometer'
  return 'mdi-turtle'
}

const getPerformanceText = (): string => {
  if (!worldStore.workerStats.available) return 'FB'
  
  const workerPercentage = worldStore.performanceStats.workerPercentage
  if (workerPercentage >= 80) return 'WK'
  if (workerPercentage >= 50) return 'MX'
  return 'FB'
}

const showNotification = (text: string, color: string = 'success') => {
  // ✅ APENAS PARA ERROS CRÍTICOS OU MENSAGENS IMPORTANTES DO SISTEMA
  if (color === 'error' || text.includes('Bem-vindo')) {
    snackbar.text = text
    snackbar.color = color
    snackbar.show = true
  }
}

// ✅ INICIALIZAR MUNDO COM WORKERS
const initializeWorldSystem = async () => {
  worldInitializing.value = true
  worldInitProgress.value = 0
  worldInitStatus.value = 'Inicializando sistema de mundo...'

  try {
    // Passo 1: Inicializar workers
    worldInitProgress.value = 25
    worldInitStatus.value = 'Inicializando Web Workers...'
    await worldStore.initializeWorkers()
    
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de mundo:', error)
    worldInitStatus.value = 'Erro na inicialização - usando fallback'
  } finally {
    setTimeout(() => {
      worldInitializing.value = false
    }, 1000)
  }
}

// ✅ WATCHER PARA MUDANÇA DE ILHA
watch(currentIslandId, async (newIslandId) => {
  if (newIslandId && newIslandId !== lastCheckedIsland.value) {
    detectedBossesCount.value = 0 // Reset count
    await detectBossesOnCurrentIsland()
  }
}, { immediate: false })

// ✅ WATCHER PARA MOSTRAR STATUS EM DESENVOLVIMENTO
watch(() => worldStore.isUpdating, (isUpdating) => {
  if (isDevelopment.value && isUpdating) {
    // Mostrar progresso detalhado apenas em dev
    console.log(`🌍 Update iniciado via ${worldStore.updateMethod}`)
  }
})

// ✅ LIFECYCLE PRINCIPAL
onMounted(async () => {
  try {
    // Inicializar o jogo primeiro
    await gameStore.initializeGame()
    
    // Aguardar um pouco para garantir que tudo foi criado
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Carregar personagem do jogador
    await characterStore.loadPlayerCharacter()
    
    if (playerCharacter.value) {
      showNotification(`Bem-vindo de volta, ${playerCharacter.value.name}!`)
      gameLoaded.value = true
      
      // ✅ INICIALIZAR SISTEMA DE MUNDO
      await initializeWorldSystem()
      
      // ✅ DETECTAR BOSSES APÓS CARREGAR O JOGO
      setTimeout(detectBossesOnCurrentIsland, 3000)
      
      // ✅ VERIFICAR PERIODICAMENTE POR NOVOS BOSSES
      setInterval(detectBossesOnCurrentIsland, 60000) // A cada 1 minuto
      
    } else {
      showNotification('Clique em "Criar Personagem" para começar!', 'info')
    }
  } catch (error) {
    console.error('Erro ao inicializar aplicação:', error)
    showNotification('Erro ao carregar o jogo. Tente recarregar a página.', 'error')
  }
})

// ✅ CLEANUP NO UNMOUNT
onUnmounted(() => {
  // Cleanup será feito automaticamente pelos watchers
})
</script>

<style scoped>
.v-navigation-drawer {
  background: linear-gradient(135deg, #FF6B35 0%, #004E89 100%);
}

.v-app-bar {
  background: linear-gradient(90deg, #FF6B35 0%, #FFD23F 100%) !important;
}

.v-main {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* ✅ ESTILOS PARA BOSS FIGHT */
.boss-fight-menu-item {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(238, 90, 36, 0.15));
  border-left: 4px solid #ff6b6b;
  margin: 4px 8px;
  border-radius: 8px;
  position: relative;
}

.boss-fight-menu-item:hover {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.25), rgba(238, 90, 36, 0.25));
}

.boss-fight-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  animation: shimmer 2s infinite;
}

.boss-count-chip {
  animation: pulse 2s infinite;
  font-weight: bold;
}

.boss-fight-header-btn {
  animation: glow 2s ease-in-out infinite alternate;
}

/* ✅ INDICADOR DISCRETO DE MUNDO ATUALIZANDO */
.world-updating-indicator {
  opacity: 0.7;
  animation: fadeInOut 2s ease-in-out infinite;
}

/* ✅ INDICADOR DE PERFORMANCE */
.performance-indicator {
  font-size: 0.7rem !important;
  height: 20px !important;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.performance-indicator:hover {
  opacity: 1;
  transform: scale(1.05);
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px rgba(255, 107, 107, 0.5);
  }
  to {
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.8), 0 0 30px rgba(255, 107, 107, 0.6);
  }
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* ✅ RESPONSIVE */
@media (max-width: 768px) {
  .v-app-bar .v-btn {
    margin: 0 2px;
  }
  
  .v-badge {
    transform: scale(0.8);
  }
  
  .world-updating-indicator {
    margin-right: 8px !important;
    size: 16px;
  }

  .performance-indicator {
    display: none; /* Ocultar em mobile */
  }
}

/* ✅ CARDS DE STATUS */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>