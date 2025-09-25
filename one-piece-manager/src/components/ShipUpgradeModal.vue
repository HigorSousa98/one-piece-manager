<!-- src/components/ShipUpgradeModal.vue -->
<template>
  <v-card class="ship-upgrade-modal">
    <v-card-title class="text-center bg-cyan-darken-2 text-white">
      <v-icon left color="white">mdi-ferry</v-icon>
      Melhorar Navio
    </v-card-title>
    
    <v-card-text class="pa-6">
      
      <!-- INFORMAÇÕES ATUAIS DO NAVIO -->
      <div class="mb-6">
        <div class="text-h6 mb-3 text-center">{{ ship.name }}</div>
        
        <v-row>
          <v-col cols="6">
            <v-card variant="outlined" color="blue-darken-1">
              <v-card-text class="text-center pa-3">
                <div class="text-caption text-blue-darken-2">Nível Atual</div>
                <div class="text-h5 text-blue-darken-3">{{ ship.level }}</div>
                <div class="text-caption">{{ getCurrentLevelName() }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card variant="outlined" color="green-darken-1">
              <v-card-text class="text-center pa-3">
                <div class="text-caption text-green-darken-2">Próximo Nível</div>
                <div class="text-h5 text-green-darken-3">{{ ship.level + 1 }}</div>
                <div class="text-caption">{{ getNextLevelName() }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
      
      <!-- MELHORIAS QUE SERÃO OBTIDAS -->
      <div class="mb-6">
        <div class="text-h6 mb-3 text-center">Melhorias</div>
        
        <v-card variant="outlined" color="purple-darken-1">
          <v-card-text class="pa-4">
            <div class="improvement-item">
              <v-icon color="purple-darken-2" class="mr-2">mdi-account-group</v-icon>
              <span>Capacidade da tripulação: </span>
              <strong>{{ getCurrentCapacity() }} → {{ getNextCapacity() }}</strong>
              <v-chip color="green" size="small" class="ml-2">
                +{{ getNextCapacity() - getCurrentCapacity() }}
              </v-chip>
            </div>
            
            <div class="improvement-item">
              <v-icon color="purple-darken-2" class="mr-2">mdi-speedometer</v-icon>
              <span>Velocidade: </span>
              <strong>{{ getCurrentSpeed() }} → {{ getNextSpeed() }}</strong>
              <v-chip color="green" size="small" class="ml-2">
                +{{ getNextSpeed() - getCurrentSpeed() }}
              </v-chip>
            </div>
            
            <div class="improvement-item">
              <v-icon color="purple-darken-2" class="mr-2">mdi-shield</v-icon>
              <span>Durabilidade: </span>
              <strong>{{ getCurrentDurability() }} → {{ getNextDurability() }}</strong>
              <v-chip color="green" size="small" class="ml-2">
                +{{ getNextDurability() - getCurrentDurability() }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </div>
      
      <!-- TEMPO E CUSTO -->
      <div class="mb-6">
        <v-card variant="outlined" color="orange-darken-1">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon color="orange-darken-2" class="mr-2">mdi-clock-outline</v-icon>
                <span>Tempo necessário:</span>
              </div>
              <strong class="text-orange-darken-3">30 minutos</strong>
            </div>
            
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon color="orange-darken-2" class="mr-2">mdi-treasure-chest</v-icon>
                <span>Custo:</span>
              </div>
              <strong class="text-orange-darken-3">{{ formatCost(getUpgradeCost()) }}</strong>
            </div>
          </v-card-text>
        </v-card>
      </div>
      
      <!-- AVISOS -->
      <div v-if="!canUpgrade" class="mb-4">
        <v-alert
          type="warning"
          variant="tonal"
          density="compact"
        >
          <div v-if="ship.level >= 5">
            Seu navio já está no nível máximo!
          </div>
          <div v-else-if="ship.needRepair">
            Seu navio precisa de reparos antes de ser melhorado.
          </div>
          <div v-else>
            Não é possível melhorar o navio no momento.
          </div>
        </v-alert>
      </div>
      
      <!-- CONFIRMAÇÃO -->
      <div v-else class="mb-4">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
        >
          <v-icon left>mdi-information</v-icon>
          Durante a melhoria, o navio não poderá navegar. Tem certeza que deseja continuar?
        </v-alert>
      </div>
      
    </v-card-text>
    
    <!-- ✅ BOTÕES MOVIDOS PARA FORA DO v-card-text -->
    <v-card-actions class="pa-4 bg-grey-lighten-4">
      <v-row no-gutters>
        <v-col cols="12" md="6" class="pr-md-2">
          <v-btn
            variant="outlined"
            color="grey-darken-1"
            @click="$emit('close')"
            block
            size="large"
          >
            <v-icon left>mdi-close</v-icon>
            Cancelar
          </v-btn>
        </v-col>
        
        <v-col cols="12" md="6" class="pl-md-2 mt-3 mt-md-0">
          <v-btn
            :disabled="!canUpgrade"
            color="cyan-darken-2"
            variant="elevated"
            @click="$emit('confirm')"
            block
            size="large"
          >
            <v-icon left>mdi-hammer</v-icon>
            Confirmar
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
    
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Ship } from '@/utils/database'

interface Props {
  ship: Ship
  shipFactor: number
  canUpgrade: boolean
}

const props = defineProps<Props>()

defineEmits<{
  confirm: []
  close: []
}>()

// SHIP LEVEL DATA
const shipLevelData = {
  1: { name: 'Bote Simples', capacity: 5, speed: 50, durability: 100 },
  2: { name: 'Navio Mercante', capacity: 10, speed: 75, durability: 200 },
  3: { name: 'Fragata de Guerra', capacity: 15, speed: 100, durability: 350 },
  4: { name: 'Galeão Poderoso', capacity: 20, speed: 125, durability: 500 },
  5: { name: 'Navio Lendário', capacity: 25, speed: 150, durability: 750 }
}

// COMPUTED
const getCurrentLevelName = () => {
  return shipLevelData[props.ship.level as keyof typeof shipLevelData]?.name || 'Desconhecido'
}

const getNextLevelName = () => {
  const nextLevel = (props.ship.level + 1) as keyof typeof shipLevelData
  return shipLevelData[nextLevel]?.name || 'Máximo'
}

const getCurrentCapacity = () => {
  return props.shipFactor * props.ship.level || 0 
}

const getNextCapacity = () => {
  const nextLevel = (props.ship.level + 1) as keyof typeof shipLevelData
  return props.shipFactor * nextLevel || 0
}

const getCurrentSpeed = () => {
  return shipLevelData[props.ship.level as keyof typeof shipLevelData]?.speed || 0
}

const getNextSpeed = () => {
  const nextLevel = (props.ship.level + 1) as keyof typeof shipLevelData
  return shipLevelData[nextLevel]?.speed || 0
}

const getCurrentDurability = () => {
  return shipLevelData[props.ship.level as keyof typeof shipLevelData]?.durability || 0
}

const getNextDurability = () => {
  const nextLevel = (props.ship.level + 1) as keyof typeof shipLevelData
  return shipLevelData[nextLevel]?.durability || 0
}

const getUpgradeCost = () => {
  // Custo baseado no nível atual
  const costs = {
    1: 100000,    // 100K para level 2
    2: 500000,    // 500K para level 3
    3: 1000000,   // 1M para level 4
    4: 5000000    // 5M para level 5
  }
  return costs[props.ship.level as keyof typeof costs] || 0
}

const formatCost = (cost: number): string => {
  if (cost >= 1000000) {
    return `${(cost / 1000000).toFixed(1)}M B$`
  } else if (cost >= 1000) {
    return `${(cost / 1000).toFixed(0)}K B$`
  }
  return `${cost} B$`
}
</script>

<style scoped>
.ship-upgrade-modal {
  border-radius: 12px;
  overflow: hidden;
}

.improvement-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
}

.improvement-item:last-child {
  margin-bottom: 0;
}

.v-card-title {
  font-weight: 600;
  font-size: 1.25rem;
}

.v-btn {
  border-radius: 8px;
  font-weight: 600;
}
</style>