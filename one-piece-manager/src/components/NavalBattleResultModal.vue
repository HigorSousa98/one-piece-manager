<!-- src/components/NavalBattleResultModal.vue -->
<template>
  <v-card class="naval-battle-result-modal" max-width="700">
    
    <!-- HEADER -->
    <v-card-title :class="result.victory ? 'bg-green-darken-2' : 'bg-red-darken-2'" class="text-white pa-4">
      <v-icon left color="white" size="large">
        {{ result.victory ? 'mdi-trophy' : 'mdi-skull' }}
      </v-icon>
      <span class="text-h5">
        {{ result.victory ? '🎉 VITÓRIA NAVAL!' : '💀 DERROTA NAVAL!' }}
      </span>
    </v-card-title>
    
    <!-- CONTEÚDO PRINCIPAL -->
    <v-card-text class="pa-6">
      
      <!-- RESULTADO DA BATALHA -->
      <div class="battle-summary mb-6">
        <v-row>
          <v-col cols="12" md="6">
            <v-card :color="result.victory ? 'green-darken-5' : 'red-darken-5'" variant="outlined">
              <v-card-text class="text-center pa-4">
                <v-avatar size="60" :color="result.victory ? 'green-darken-2' : 'red-darken-2'" class="mb-3">
                  <span class="text-h5">{{ result.victory ? '👑' : '💀' }}</span>
                </v-avatar>
                <div class="text-h6 mb-2">{{ result.playerCrew.name }}</div>
                <v-chip :color="result.victory ? 'green' : 'red'" variant="elevated">
                  {{ result.victory ? 'VENCEDOR' : 'DERROTADO' }}
                </v-chip>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card :color="result.victory ? 'red-darken-5' : 'green-darken-5'" variant="outlined">
              <v-card-text class="text-center pa-4">
                <v-avatar size="60" :color="result.victory ? 'red-darken-2' : 'green-darken-2'" class="mb-3">
                  <span class="text-h5">{{ getCrewTypeIcon(result.enemyCrew.type || 'Unknown') }}</span>
                </v-avatar>
                <div class="text-h6 mb-2">{{ result.enemyCrew.name }}</div>
                <v-chip :color="result.victory ? 'red' : 'green'" variant="elevated">
                  {{ result.victory ? 'DERROTADO' : 'VENCEDOR' }}
                </v-chip>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
      
      <!-- LOG DA BATALHA -->
      <div class="battle-log mb-6">
        <v-card variant="outlined" color="blue-darken-5">
          <v-card-title class="bg-blue-darken-2 text-white">
            <v-icon left color="white">mdi-script-text</v-icon>
            Relatório da Batalha
          </v-card-title>
          
          <v-card-text class="pa-4">
            <div class="battle-log-content">
              <div 
                v-for="(logEntry, index) in result.battleLog" 
                :key="index"
                class="log-entry"
                :class="getLogEntryClass(logEntry)"
              >
                {{ logEntry }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
      
      <!-- RECOMPENSAS (SE VITÓRIA) -->
      <div v-if="result.victory && result.rewards" class="rewards-section mb-6">
        <v-card variant="outlined" color="green-darken-5">
          <v-card-title class="bg-green-darken-2 text-white">
            <v-icon left color="white">mdi-trophy</v-icon>
            Recompensas da Vitória
          </v-card-title>
          
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="4">
                <div class="reward-item">
                  <v-icon color="blue-darken-2" size="large" class="mb-2">mdi-star</v-icon>
                  <div class="text-h6">{{ result.rewards.experience }}</div>
                  <div class="text-body-2">Experiência</div>
                </div>
              </v-col>
              
              <v-col cols="12" md="4">
                <div class="reward-item">
                  <v-icon color="purple-darken-2" size="large" class="mb-2">mdi-medal</v-icon>
                  <div class="text-h6">{{ result.rewards.reputation }}</div>
                  <div class="text-body-2">Reputação</div>
                </div>
              </v-col>
              
              <v-col v-if="result.rewards.bounty" cols="12" md="4">
                <div class="reward-item">
                  <v-icon color="orange-darken-2" size="large" class="mb-2">mdi-treasure-chest</v-icon>
                  <div class="text-h6">{{ result.rewards.bounty.toLocaleString() }}</div>
                  <div class="text-body-2">Bounty (B$)</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
      
      <!-- BAIXAS -->
      <div v-if="result.casualties" class="casualties-section mb-6">
        <v-card variant="outlined" color="orange-darken-5">
          <v-card-title class="bg-orange-darken-2 text-white">
            <v-icon left color="white">mdi-medical-bag</v-icon>
            Relatório de Baixas
          </v-card-title>
          
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <div class="casualty-item">
                  <v-icon color="red-darken-2" class="mr-2">mdi-account-minus</v-icon>
                  <strong>{{ result.playerCrew.name }}:</strong> {{ result.casualties.playerLosses }} feridos
                </div>
              </v-col>
              
              <v-col cols="12" md="6">
                <div class="casualty-item">
                  <v-icon color="green-darken-2" class="mr-2">mdi-account-remove</v-icon>
                  <strong>{{ result.enemyCrew.name }}:</strong> {{ result.casualties.enemyLosses }} feridos
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
      
    </v-card-text>
    
    <!-- AÇÕES -->
    <v-card-actions class="pa-4 bg-grey-darken-4">
      <v-spacer></v-spacer>
      
      <v-btn
        color="primary"
        variant="elevated"
        size="large"
        @click="handleClose"
      >
        <v-icon left>mdi-check</v-icon>
        Continuar Aventura
      </v-btn>
    </v-card-actions>
    
  </v-card>
</template>

<script setup lang="ts">
import type { BattleResult } from '@/utils/navalBattleSystem'

const props = defineProps<{
  result: BattleResult
}>()

const emit = defineEmits<{
  close: []
}>()

// 🎮 METHODS
const handleClose = () => {
  emit('close')
}

const getCrewTypeIcon = (type: string): string => {
  switch (type) {
    case 'Pirate': return '🏴‍☠️'
    case 'Marine': return '⚓'
    case 'Government': return '🏛️'
    case 'BountyHunter': return '💰'
    default: return '❓'
  }
}

const getLogEntryClass = (logEntry: string): string => {
  if (logEntry.includes('VITÓRIA') || logEntry.includes('triunfante')) {
    return 'victory-log'
  }
  if (logEntry.includes('DERROTA') || logEntry.includes('recuar')) {
    return 'defeat-log'
  }
  if (logEntry.includes('Round') || logEntry.includes('⚔️')) {
    return 'action-log'
  }
  if (logEntry.includes('RECOMPENSAS') || logEntry.includes('🏆')) {
    return 'reward-log'
  }
  return 'normal-log'
}
</script>

<style scoped>
.naval-battle-result-modal {
  border-radius: 16px;
  overflow: hidden;
}

.battle-summary {
  text-align: center;
}

.battle-log-content {
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.log-entry {
  padding: 4px 8px;
  margin-bottom: 2px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.victory-log {
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
  font-weight: 600;
}

.defeat-log {
  background: rgba(244, 67, 54, 0.1);
  color: #c62828;
  font-weight: 600;
}

.action-log {
  background: rgba(33, 150, 243, 0.1);
  color: #1565c0;
}

.reward-log {
  background: rgba(255, 193, 7, 0.1);
  color: #f57f17;
  font-weight: 600;
}

.normal-log {
  color: rgba(0, 0, 0, 0.8);
}

.reward-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.casualty-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  margin-bottom: 8px;
}

.v-card-title {
  font-weight: 600;
}

.v-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
}

/* ANIMAÇÕES */
.naval-battle-result-modal {
  animation: battleSlideUp 0.5s ease-out;
}

@keyframes battleSlideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* RESPONSIVIDADE */
@media (max-width: 768px) {
  .battle-log-content {
    max-height: 200px;
    font-size: 0.8rem;
  }
  
  .reward-item {
    padding: 12px;
  }
  
  .casualty-item {
    flex-direction: column;
    text-align: center;
    gap: 4px;
  }
}
</style>