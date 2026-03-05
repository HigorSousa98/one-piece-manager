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
/* ============================================================
   NavalBattleResultModal - Naval combat result
   ============================================================ */

.naval-result-header {
  padding: 20px;
  text-align: center;
  position: relative;
}

.naval-result-header.victory {
  background: linear-gradient(135deg, rgba(46,125,50,0.2), rgba(27,94,32,0.1));
  border-bottom: 1px solid rgba(46,125,50,0.3);
}

.naval-result-header.defeat {
  background: linear-gradient(135deg, rgba(198,40,40,0.2), rgba(183,28,28,0.1));
  border-bottom: 1px solid rgba(198,40,40,0.3);
}

.naval-result-title {
  font-family: Georgia, serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-shadow: 0 0 20px currentColor;
  margin: 0;
}

.naval-result-title.victory { color: #FFD700; }
.naval-result-title.defeat  { color: #FF5252; }

.ship-damage-section {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 14px;
  margin: 12px 0;
}

.damage-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.damage-row:last-child { border-bottom: none; }

.damage-label { color: #8B9DC3; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }

.damage-value { color: #E8D5A3; font-weight: 600; }
.damage-value.loss { color: #EF5350; }
.damage-value.gain { color: #81C784; }
.damage-value.gold { color: #FFD700; }

.naval-reward-card {
  background: rgba(212,175,55,0.06);
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: 10px;
  padding: 14px;
  text-align: center;
}

.naval-reward-value {
  font-family: Georgia, serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255,215,0,0.4);
}
</style>