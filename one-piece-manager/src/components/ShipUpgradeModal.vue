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
/* ShipUpgradeModal - Ship enhancement dialog */

.ship-upgrade-header {
  background: linear-gradient(135deg, rgba(21,101,192,0.15), rgba(212,175,55,0.06));
  border-bottom: 1px solid rgba(21,101,192,0.3);
  padding: 16px 20px;
}

.ship-upgrade-title {
  font-family: Georgia, serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #90CAF9;
  letter-spacing: 0.04em;
}

.ship-current-stats {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 16px;
}

.upgrade-option-card {
  background: #132235;
  border: 1px solid rgba(21,101,192,0.25);
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  height: 100%;
}

.upgrade-option-card:hover {
  border-color: rgba(21,101,192,0.55);
  box-shadow: 0 0 12px rgba(21,101,192,0.2);
  transform: translateY(-2px);
}

.upgrade-option-card.selected {
  border-color: #1565C0;
  background: linear-gradient(135deg, rgba(21,101,192,0.15), rgba(212,175,55,0.04));
  box-shadow: 0 0 16px rgba(21,101,192,0.28);
}

.upgrade-name {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #90CAF9;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.upgrade-bonus { font-size: 0.78rem; color: #81C784; font-weight: 600; }

.upgrade-cost {
  font-family: Georgia, serif;
  color: #FFD700;
  font-weight: 700;
  font-size: 0.9rem;
  text-shadow: 0 0 6px rgba(255,215,0,0.3);
}

.confirm-upgrade-btn {
  background: linear-gradient(135deg, #0D47A1, #1565C0) !important;
  color: #fff !important;
  font-weight: 700 !important;
  letter-spacing: 0.05em !important;
  box-shadow: 0 4px 16px rgba(21,101,192,0.3) !important;
}
</style>