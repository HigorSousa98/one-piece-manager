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
/* ============================================================
   BattleLogDisplay - Combat message log
   ============================================================ */

.battle-log-display {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 10px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 0.82rem;
  max-height: 260px;
  overflow-y: auto;
  line-height: 1.7;
}

.battle-log-display::-webkit-scrollbar { width: 4px; }
.battle-log-display::-webkit-scrollbar-track { background: transparent; }
.battle-log-display::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.3); border-radius: 2px; }

.log-line {
  padding: 2px 0;
  display: flex;
  gap: 6px;
}

.log-line-timestamp {
  color: #546E7A;
  font-size: 0.72rem;
  flex-shrink: 0;
}

.log-line-text { flex: 1; }

.log-type-hit     { color: #EF9A9A; }
.log-type-crit    { color: #FF5252; font-weight: 700; }
.log-type-miss    { color: #78909C; font-style: italic; }
.log-type-buff    { color: #80CBC4; }
.log-type-debuff  { color: #CE93D8; }
.log-type-heal    { color: #81C784; }
.log-type-system  { color: #8B9DC3; font-style: italic; }
.log-type-victory { color: #FFD700; font-weight: 700; }
.log-type-defeat  { color: #FF5252; font-weight: 700; }
.log-type-xp      { color: #90CAF9; }
.log-type-bounty  { color: #D4AF37; }
</style>