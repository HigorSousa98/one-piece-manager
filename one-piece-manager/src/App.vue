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
          v-for="item in menuItems"
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
                <v-icon small>mdi-treasure-chest</v-icon>
                {{ playerCharacter.bounty.toLocaleString() + ' B$' }}
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

      <!-- Status do Jogo -->
      <v-chip 
        v-if="gameStore.isInitialized"
        color="success" 
        variant="elevated"
        class="mr-2"
      >
        <v-icon start>mdi-check-circle</v-icon>
        Jogo Ativo
      </v-chip>

      <!-- Bounty Display -->
      <v-chip 
        v-if="playerCharacter"
        color="accent" 
        variant="elevated"
        class="mr-2"
      >
        <v-icon start>mdi-treasure-chest</v-icon>
        {{ formatBounty(playerCharacter.bounty) }}
      </v-chip>

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
        </div>

        <!-- Game Content -->
        <router-view v-else></router-view>
      </v-container>
    </v-main>

    <!-- Snackbar para notificações -->
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
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useCharacterStore } from '@/stores/characterStore'
import { GameLogic } from '@/utils/gameLogic' 

const drawer = ref(true)
const gameStore = useGameStore()
const characterStore = useCharacterStore()

const playerCharacter = computed(() => characterStore.playerCharacter)

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
})

const expForNextLevel = computed(() => {
  if (!playerCharacter.value) return 0
  return GameLogic.nextLevelUp(playerCharacter.value)
})

const menuItems = [
  { 
    title: 'Dashboard', 
    icon: 'mdi-view-dashboard', 
    route: '/' 
  },
  { 
    title: 'Aventuras', 
    icon: 'mdi-map', 
    route: '/adventure' 
  },{ 
    title: 'Navegação', 
    icon: 'mdi-compass', 
    route: '/navigation' 
  },{ 
    title: 'Explorar Ilhas', 
    icon: 'mdi-island', 
    route: '/islands' 
  },
  { 
    title: 'Tripulação', 
    icon: 'mdi-account-group', 
    route: '/crew' 
  },
  
  
  { 
    title: 'Treinar', 
    icon: 'mdi-dumbbell', 
    route: '/training' 
  },
  
  { 
    title: 'Histórico', 
    icon: 'mdi-history', 
    route: '/history' 
  }
]

const formatBounty = (bounty: number): string => {
  if (bounty >= 1000000000) {
    return `${(bounty / 1000000000).toFixed(2)}B B$`
  } else if (bounty >= 1000000) {
    return `${(bounty / 1000000).toFixed(2)}M B$`
  } else if (bounty >= 1000) {
    return `${(bounty / 1000).toFixed(2)}K B$`
  }
  return `${bounty} B$`
}

const showNotification = (text: string, color: string = 'success') => {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

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
    } else {
      showNotification('Clique em "Criar Personagem" para começar!', 'info')
    }
  } catch (error) {
    console.error('Erro ao inicializar aplicação:', error)
    showNotification('Erro ao carregar o jogo. Tente recarregar a página.', 'error')
  }
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
</style>