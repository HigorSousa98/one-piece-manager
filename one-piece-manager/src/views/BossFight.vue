<!-- src/views/BossFight.vue -->
<template>
  <div class="boss-fight-page">
    <v-row>
      <v-col cols="12">
        <v-card class="boss-fight-header" elevation="4">
          <v-card-title class="text-center">
            <v-icon size="48" color="error" class="mr-4">mdi-skull</v-icon>
            <span class="text-h3 boss-title">Boss Fight Arena</span>
          </v-card-title>
          <v-card-subtitle class="text-center text-h6">
            Desafie os algozes mais poderosos do mundo!
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <BossFightManager
          :player-crew-id="playerCrewId"
          :current-island-id="currentIslandId"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { useGameStore } from '@/stores/gameStore'
import BossFightManager from '@/components/BossFight/BossFightManager.vue'

const characterStore = useCharacterStore()
const gameStore = useGameStore()

const playerCrewId = computed(() => characterStore.playerCharacter?.crewId || 0)
const currentIslandId = computed(() => characterStore.playerCrew?.currentIsland || 1)
</script>

<style scoped>
.boss-fight-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  padding: 20px;
}

.boss-fight-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.boss-fight-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💀</text></svg>') repeat;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.boss-title {
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
</style>