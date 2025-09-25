<!-- src/views/BattleArena.vue -->
<template>
  <div>
    <v-row>
    <!-- Informações do Jogador -->
      <!-- Seleção de Oponente -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-target</v-icon>
            Escolher Oponente
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedOpponent"
              :items="availableOpponents"
              item-title="name"
              item-value="id"
              label="Selecionar Oponente"
              :loading="loadingOpponents"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-avatar :color="getTypeColor(item.raw.type)">
                      {{ getTypeIcon(item.raw.type) }}
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Level {{ item.raw.level }} | {{ formatBounty(item.raw.bounty) }} | {{ getStyleCombat(item.raw.styleCombatId) }} 
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>

            <v-btn
              color="primary"
              block
              class="mt-3"
              @click="loadRandomOpponents"
              :loading="loadingOpponents"
            >
              <v-icon left>mdi-refresh</v-icon>
              Buscar Novos Oponentes
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Info do Oponente -->
      <v-col cols="12" md="6">
        <v-card v-if="opponentInfo">
          <v-card-title>
            <v-icon left>mdi-account</v-icon>
            {{ opponentInfo.name }}
          </v-card-title>
          <v-card-text>
            <v-chip :color="getTypeColor(opponentInfo.type)" class="mb-2">
              {{ opponentInfo.type }}
            </v-chip>
            <v-chip color="primary" class="mb-2 ml-2">
              Level {{ opponentInfo.level }}
            </v-chip>
            <v-chip color="accent" class="mb-2 ml-2">{{ formatBounty(opponentInfo.bounty) }}</v-chip>

            <v-chip color="accent" class="mb-2 ml-2">{{ opponentStyle.name }}</v-chip>
            
            <v-divider class="my-3"></v-divider>
            
            <!-- Stats do Oponente -->
            <v-row>
              <v-col cols="6">
                <div><strong>⚔️ Attack:</strong> {{ opponentInfo.stats.attack }}</div>
                <div><strong>🛡️ Defense:</strong> {{ opponentInfo.stats.defense }}</div>
                <div><strong>💨 Speed:</strong> {{ opponentInfo.stats.speed }}</div>
              </v-col>
              <v-col cols="6">
                <div><strong>🥊 Busoshoku Haki:</strong> {{ opponentInfo.stats.armHaki }}</div>
                <div><strong>👁️ Kenbunshoku Haki:</strong> {{ opponentInfo.stats.obsHaki }}</div>
                <div><strong>👑 Haoshoku Haki:</strong> {{ opponentInfo.stats.kingHaki }}</div>
              </v-col>
            </v-row>

            <!-- Experiência -->
            <v-progress-linear
              :model-value="experiencePercentageOpp"
              color="primary"
              height="20"
              class="mt-3"
            >
              <template v-slot:default>
                <strong>{{ opponentInfo.experience }} / {{ expForNextLevelOpp }} XP</strong>
              </template>
            </v-progress-linear>

            <div class="text-center mt-4">
              <div class="text-h6 mb-2">Poder Estimado: {{ calculatePower(opponentInfo) }}</div>
              <v-progress-linear
                :model-value="winChance"
                :color="winChance > 60 ? 'success' : winChance > 40 ? 'warning' : 'error'"
                height="20"
              >
                <template v-slot:default>
                  <strong>{{ winChance }}% chance de vitória</strong>
                </template>
              </v-progress-linear>
            </div>
          </v-card-text>
        </v-card>
        
        <v-card v-else>
          <v-card-text class="text-center">
            <div class="text-h6 mb-2">Selecione um oponente</div>
            <v-icon size="64" color="grey">mdi-account-question</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Botão de Batalha -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center">
            <v-btn
              color="error"
              size="x-large"
              :disabled="!selectedOpponent || !playerCharacter || battleStore.isSimulating"
              @click="startBattle"
              :loading="battleStore.isSimulating"
            >
              <v-icon left size="large">mdi-sword-cross</v-icon>
              {{ battleStore.isSimulating ? 'Batalha em Andamento...' : 'INICIAR BATALHA!' }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Resultado da Batalha -->
    <v-row class="mt-4" v-if="lastBattleResult">
      <v-col cols="12">
        <v-card :color="lastBattleResult.winner.id === playerCharacter?.id ? 'success' : 'error'">
          <v-card-title class="text-white">
            <v-icon left class="text-white">
              {{ lastBattleResult.winner.id === playerCharacter?.id ? 'mdi-trophy' : 'mdi-skull' }}
            </v-icon>
            {{ lastBattleResult.winner.id === playerCharacter?.id ? 'VITÓRIA!' : 'DERROTA!' }}
          </v-card-title>
          <v-card-text class="text-white">
            <div class="text-h6 mb-2">
              {{ lastBattleResult.winner.name }} venceu {{ lastBattleResult.loser.name }}!
            </div>
            
            <v-divider class="my-3"></v-divider>
            
            <!-- Recompensas -->
            <div v-if="lastBattleResult.winner.id === playerCharacter?.id">
              <div class="mb-1">
                <v-icon left>mdi-star</v-icon>
                +{{ lastBattleResult.experienceGained }} XP
              </div>
              <div class="mb-1">
                <v-icon left>mdi-treasure-chest</v-icon>
                +{{ formatBounty(lastBattleResult.bountyChange) }}
              </div>
            </div>

            <!-- Log da Batalha -->
            <v-expansion-panels class="mt-3">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon left>mdi-script-text</v-icon>
                  Ver Detalhes da Batalha
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div v-for="(log, index) in lastBattleResult.battleLog" :key="index" class="mb-1">
                    {{ log }}
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { useBattleStore } from '@/stores/battleStore'
import { db, Character } from '@/utils/database'
import {GameLogic} from '@/utils/gameLogic'

const characterStore = useCharacterStore()
const battleStore = useBattleStore()

const selectedOpponent = ref<number | null>(null)
const availableOpponents = ref<Character[]>([])
const availableStyleCombat = ref<StyleCombat[]>([])
const loadingOpponents = ref(false)
const lastBattleResult = ref<any>(null)

const playerCharacter = computed(() => characterStore.playerCharacter)

const opponentInfo = computed(() => {
  if (!selectedOpponent.value) return null
  return availableOpponents.value.find(char => char.id === selectedOpponent.value)
})

const opponentStyle = computed(() => {
  if (!selectedOpponent.value) return null
  return availableStyleCombat.value.find(comb => comb.id === availableOpponents.value.find(char => char.id === selectedOpponent.value).styleCombatId)
})


const winChance = computed(() => {
  if (!playerCharacter.value || !opponentInfo.value) return 0
  
  const playerPower = GameLogic.calculatePower(playerCharacter.value)
  const opponentPower = GameLogic.calculatePower(opponentInfo.value)
  
  const chance = (playerPower / (playerPower + opponentPower)) * 100
  return Math.round(chance)
})

const expForNextLevel = computed(() => {
  if (!playerCharacter.value) return 0
  return GameLogic.nextLevelUp(playerCharacter.value)
})

const expForNextLevelOpp = computed(() => {
  if (!opponentInfo.value) return 0
  return GameLogic.nextLevelUp(opponentInfo.value)
})

const loadRandomOpponents = async () => {
  loadingOpponents.value = true
  
  try {
    // Buscar 10 oponentes aleatórios próximos do level do jogador
    const playerLevel = playerCharacter.value?.level || 1
    const minLevel = Math.max(1, playerLevel - 2)
    const maxLevel = playerLevel + 2
    console.log('searching between', minLevel, maxLevel)
    
    const opponents = await db.characters
       .orderBy('level') // ← Ordem crescente (1, 2, 3, 4...)
  .filter(char => 
    char.level >= minLevel && 
    char.level <= maxLevel && 
    char.isPlayer !== 1
  )
  .limit(50)
  .toArray()
    
    // Embaralhar array
    availableOpponents.value = opponents.sort((a,b) => a.level - b.level)

    const styleCombats = await db.styleCombats.toArray()
    availableStyleCombat.value = styleCombats
    
  } catch (error) {
    console.error('Erro ao carregar oponentes:', error)
  } finally {
    loadingOpponents.value = false
  }
}

const calculatePower = (character: Character): number => {
  return GameLogic.calculatePower(character)
}

const experiencePercentage = computed(() => {
  if (!playerCharacter.value) return 0
  const expForNext = GameLogic.nextLevelUp(playerCharacter.value)
  return (playerCharacter.value.experience / expForNext) * 100
})

const experiencePercentageOpp = computed(() => {
  if (!opponentInfo.value) return 0
  const expForNext = GameLogic.nextLevelUp(opponentInfo.value)
  return (opponentInfo.value.experience / expForNext) * 100
})

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'error'
    case 'Marine': return 'info'
    case 'Government': return 'warning'
    default: return 'grey'
  }
}

const getStyleCombat = (style: string): string => {
  return availableStyleCombat.value.find(item => item.id === style).name
}

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'Pirate': return '🏴‍☠️'
    case 'Marine': return '⚓'
    case 'Government': return '🏛️'
    case 'BountyHunter': return '💰'
    default: return '❓'
  }
}

const formatBounty = (bounty: number): string => {
  if (bounty >= 1000000000) {
    return `${(bounty / 1000000000).toFixed(1)}B Berries`
  } else if (bounty >= 1000000) {
    return `${(bounty / 1000000).toFixed(1)}M Berries`
  } else if (bounty >= 1000) {
    return `${(bounty / 1000).toFixed(1)}K Berries`
  }
  return `${bounty} Berries`
}

const startBattle = async () => {
  if (!playerCharacter.value || !opponentInfo.value) return
  
  try {
    lastBattleResult.value = null
    
    const result = await battleStore.simulateBattle(
      playerCharacter.value,
      opponentInfo.value
    )
    
    lastBattleResult.value = result
    
    // Recarregar personagem do jogador para atualizar stats
    //await characterStore.loadPlayerCharacter()
    await loadRandomOpponents()
    
  } catch (error) {
    console.error('Erro na batalha:', error)
  }
}

// Carregar oponentes quando o componente for montado
onMounted(async () => {
  await loadRandomOpponents()
})

// Recarregar oponentes quando o jogador mudar de level
watch(() => playerCharacter.value?.level, () => {
  loadRandomOpponents()
})
</script>