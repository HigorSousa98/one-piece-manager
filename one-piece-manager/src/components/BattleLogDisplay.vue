<!-- src/components/BattleLogDisplay.vue -->
<template>
  <div class="battle-log-display">
    <!-- Header do Log -->
    <div class="battle-log-header">
      <v-icon size="24" color="warning" class="mr-2">mdi-sword-cross</v-icon>
      <span class="text-h6 battle-log-title">Como a Batalha Ocorreu</span>
      <v-spacer></v-spacer>
      <v-btn
        icon
        size="small"
        @click="toggleAutoScroll"
        :color="autoScroll ? 'success' : 'grey'"
        variant="text"
      >
        <v-icon>{{ autoScroll ? 'mdi-play' : 'mdi-pause' }}</v-icon>
      </v-btn>
    </div>

    <!-- Container do Log -->
    <v-card class="battle-log-container" variant="outlined">
      <v-card-text class="pa-0">
        <div 
          ref="logContainer"
          class="battle-log-content"
          :class="{ 'auto-scrolling': autoScroll }"
        >
          <!-- Entrada de Log Individual -->
          <div
            v-for="(entry, index) in displayedEntries"
            :key="`log-${index}`"
            class="battle-log-entry"
            :class="getEntryClass(entry)"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <!-- Ícone da Ação -->
            <div class="log-icon">
              <v-avatar size="20" :color="getActionColor(entry)">
                <v-icon size="12" color="white">
                  {{ getActionIcon(entry) }}
                </v-icon>
              </v-avatar>
            </div>

            <!-- Conteúdo da Mensagem -->
            <div class="log-message">
              <span v-html="formatLogMessage(entry)"></span>
            </div>

            <!-- Efeito de Dano/Cura -->
            <div 
              v-if="getDamageValue(entry)"
              class="damage-indicator"
              :class="getDamageClass(entry)"
            >
              {{ getDamageValue(entry) }}
            </div>
          </div>

          <!-- Loading para próximas entradas -->
          <div v-if="isLoading" class="log-loading">
            <v-progress-circular
              indeterminate
              size="16"
              color="primary"
            ></v-progress-circular>
            <span class="ml-2 text-caption">Processando...</span>
          </div>
        </div>
      </v-card-text>

      <!-- Controles do Log -->
      <v-card-actions class="battle-log-controls">
        <v-btn
          size="small"
          variant="text"
          @click="scrollToTop"
          prepend-icon="mdi-arrow-up"
        >
          Início
        </v-btn>
        
        <v-btn
          size="small"
          variant="text"
          @click="scrollToBottom"
          prepend-icon="mdi-arrow-down"
        >
          Final
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn
          size="small"
          variant="text"
          @click="exportLog"
          prepend-icon="mdi-download"
        >
          Exportar
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Estatísticas da Batalha -->
    <v-row class="mt-3">
      <v-col cols="4">
        <v-card class="battle-stat-card text-center" variant="outlined">
          <v-card-text class="py-2">
            <v-icon size="20" color="error">mdi-sword</v-icon>
            <div class="text-caption">Ataques</div>
            <div class="text-h6 font-weight-bold">{{ battleStats.attacks }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="4">
        <v-card class="battle-stat-card text-center" variant="outlined">
          <v-card-text class="py-2">
            <v-icon size="20" color="warning">mdi-shield</v-icon>
            <div class="text-caption">Defesas</div>
            <div class="text-h6 font-weight-bold">{{ battleStats.defenses }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="4">
        <v-card class="battle-stat-card text-center" variant="outlined">
          <v-card-text class="py-2">
            <v-icon size="20" color="success">mdi-lightning-bolt</v-icon>
            <div class="text-caption">Especiais</div>
            <div class="text-h6 font-weight-bold">{{ battleStats.specials }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import type { Character } from '@/utils/database'

interface Props {
  battleLog: string[]
  playerCharacter?: Character | null
  opponentCharacter?: Character | null
  battleResult?: any
}

const props = defineProps<Props>()

// ✅ STATE
const logContainer = ref<HTMLElement | null>(null)
const displayedEntries = ref<string[]>([])
const autoScroll = ref(true)
const isLoading = ref(false)
const currentIndex = ref(0)

// ✅ COMPUTED
const battleStats = computed(() => {
  const stats = {
    attacks: 0,
    defenses: 0,
    specials: 0
  }
  
  props.battleLog.forEach(entry => {
    if (entry.includes('ataca') || entry.includes('golpeia')) {
      stats.attacks++
    } else if (entry.includes('defende') || entry.includes('bloqueia')) {
      stats.defenses++
    } else if (entry.includes('especial') || entry.includes('habilidade')) {
      stats.specials++
    }
  })
  
  return stats
})

// ✅ METHODS
const getEntryClass = (entry: string) => {
  const classes = ['battle-log-entry-animated']
  
  if (entry.includes('ataca') || entry.includes('golpeia')) {
    classes.push('attack-entry')
  } else if (entry.includes('defende') || entry.includes('bloqueia')) {
    classes.push('defense-entry')
  } else if (entry.includes('especial') || entry.includes('habilidade')) {
    classes.push('special-entry')
  } else if (entry.includes('vence') || entry.includes('vitória')) {
    classes.push('victory-entry')
  } else if (entry.includes('derrota') || entry.includes('perde')) {
    classes.push('defeat-entry')
  } else {
    classes.push('neutral-entry')
  }
  
  return classes.join(' ')
}

const getActionIcon = (entry: string) => {
  if (entry.includes('ataca') || entry.includes('golpeia')) {
    return 'mdi-sword'
  } else if (entry.includes('defende') || entry.includes('bloqueia')) {
    return 'mdi-shield'
  } else if (entry.includes('especial') || entry.includes('habilidade')) {
    return 'mdi-lightning-bolt'
  } else if (entry.includes('vence') || entry.includes('vitória')) {
    return 'mdi-trophy'
  } else if (entry.includes('derrota') || entry.includes('perde')) {
    return 'mdi-skull'
  } else {
    return 'mdi-information'
  }
}

const getActionColor = (entry: string) => {
  if (entry.includes('ataca') || entry.includes('golpeia')) {
    return 'error'
  } else if (entry.includes('defende') || entry.includes('bloqueia')) {
    return 'warning'
  } else if (entry.includes('especial') || entry.includes('habilidade')) {
    return 'purple'
  } else if (entry.includes('vence') || entry.includes('vitória')) {
    return 'success'
  } else if (entry.includes('derrota') || entry.includes('perde')) {
    return 'error'
  } else {
    return 'info'
  }
}

const formatLogMessage = (entry: string) => {
  // Destacar nomes de personagens
  let formatted = entry.replace(/([A-Z][a-zA-Z]+)/g, '<strong class="character-name">$1</strong>')
  
  // Destacar números de dano
  formatted = formatted.replace(/(\d+)/g, '<span class="damage-number">$1</span>')
  
  // Destacar palavras-chave
  const keywords = ['ataca', 'defende', 'golpeia', 'bloqueia', 'especial', 'habilidade', 'vence', 'derrota']
  keywords.forEach(keyword => {
    const regex = new RegExp(`\b${keyword}\b`, 'gi')
    formatted = formatted.replace(regex, `<span class="keyword">${keyword}</span>`)
  })
  
  return formatted
}

const getDamageValue = (entry: string) => {
  const match = entry.match(/(\d+)\s*(dano|cura|vida)/i)
  return match ? match[1] : null
}

const getDamageClass = (entry: string) => {
  if (entry.includes('cura') || entry.includes('vida')) {
    return 'heal-indicator'
  }
  return 'damage-indicator'
}

const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value
}

const scrollToTop = () => {
  if (logContainer.value) {
    logContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const scrollToBottom = () => {
  if (logContainer.value) {
    logContainer.value.scrollTo({ 
      top: logContainer.value.scrollHeight, 
      behavior: 'smooth' 
    })
  }
}

const exportLog = () => {
  const logText = props.battleLog.join('\n')
  const blob = new Blob([logText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `battle-log-${new Date().getTime()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const animateLogEntries = async () => {
  if (currentIndex.value >= props.battleLog.length) return
  
  isLoading.value = true
  
  // Mostrar todas as entradas de uma vez para melhor performance
  displayedEntries.value = [...props.battleLog]
  currentIndex.value = props.battleLog.length
  
  await nextTick()
  
  if (autoScroll.value) {
    scrollToBottom()
  }
  
  isLoading.value = false
}

// ✅ WATCHERS
watch(() => props.battleLog, () => {
  if (props.battleLog.length > 0) {
    displayedEntries.value = []
    currentIndex.value = 0
    animateLogEntries()
  }
}, { immediate: true })

// ✅ LIFECYCLE
onMounted(() => {
  if (props.battleLog.length > 0) {
    animateLogEntries()
  }
})
</script>

<style scoped>
.battle-log-display {
  width: 100%;
}

.battle-log-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.battle-log-title {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.battle-log-container {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.battle-log-content {
  max-height: 250px;
  overflow-y: auto;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
}

.battle-log-content::-webkit-scrollbar {
  width: 6px;
}

.battle-log-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.battle-log-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.battle-log-entry {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.battle-log-entry-animated {
  animation: slideInLeft 0.3s ease-out forwards;
  opacity: 0;
  transform: translateX(-20px);
}

.battle-log-entry:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(2px);
}

/* Tipos de Entrada */
.attack-entry {
  border-left-color: #ff6b6b;
}

.defense-entry {
  border-left-color: #feca57;
}

.special-entry {
  border-left-color: #a55eea;
}

.victory-entry {
  border-left-color: #26de81;
}

.defeat-entry {
  border-left-color: #ff4757;
}

.neutral-entry {
  border-left-color: #74b9ff;
}

.log-icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.log-message {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.3;
}

.character-name {
  color: #26de81;
  font-weight: bold;
}

.damage-number {
  color: #ff6b6b;
  font-weight: bold;
  background: rgba(255, 107, 107, 0.2);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.8em;
}

.keyword {
  color: #feca57;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8em;
}

.damage-indicator {
  margin-left: 8px;
  background: #ff6b6b;
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.75em;
  flex-shrink: 0;
}

.heal-indicator {
  background: #26de81;
}

.log-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: rgba(255, 255, 255, 0.7);
}

.battle-log-controls {
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
}

.battle-stat-card {
  background: rgba(255, 255, 255, 0.05);
  transition: transform 0.2s ease;
}

.battle-stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
}

/* Animações */
@keyframes slideInLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.auto-scrolling {
  scroll-behavior: smooth;
}

/* Responsive */
@media (max-width: 768px) {
  .battle-log-content {
    max-height: 200px;
    font-size: 0.8rem;
  }
  
  .battle-log-entry {
    padding: 4px 6px;
    margin-bottom: 4px;
  }
  
  .log-icon .v-avatar {
    width: 16px !important;
    height: 16px !important;
  }
  
  .log-icon .v-icon {
    font-size: 10px !important;
  }
}
</style>