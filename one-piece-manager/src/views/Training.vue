<!-- src/views/Training.vue -->
<template>
  <div class="training-view">
    
    <!-- HEADER DA PÁGINA -->
    <div class="page-header mb-6">
      <v-container>
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h3 mb-2">
              <v-icon left color="orange-darken-2" size="large">mdi-dumbbell</v-icon>
              Centro de Treinamento
            </h1>
            <p class="text-h6 text-grey-lighteen-4">
              Fortaleça sua tripulação através de treinos intensivos
            </p>
          </div>
          
          <!-- NAVEGAÇÃO -->
          <v-btn
            color="primary"
            variant="outlined"
            @click="$router.push('/crew')"
          >
            <v-icon left>mdi-arrow-left</v-icon>
            Voltar ao Crew
          </v-btn>
        </div>
      </v-container>
    </div>

    <!-- LOADING STATE -->
    <div v-if="!allDataLoaded" class="loading-container">
      <v-container>
        <v-card class="pa-8 text-center">
          <v-progress-circular
            indeterminate
            color="orange-darken-2"
            size="64"
            class="mb-4"
          ></v-progress-circular>
          <div class="text-h6">Carregando dados da tripulação...</div>
        </v-card>
      </v-container>
    </div>

    <!-- CONTEÚDO PRINCIPAL -->
    <v-container v-else>
      <v-row>
        
        <!-- COLUNA PRINCIPAL - INTERFACE DE TREINO -->
        <v-col cols="12" lg="8">
          <TrainingInterface 
            :crew-id="playerCrew?.id || 0"
            :character-id="playerCharacter?.id || 0"
            @training-completed="handleTrainingCompleted"
          />
        </v-col>
        
        <!-- SIDEBAR - INFORMAÇÕES DA TRIPULAÇÃO -->
        <v-col cols="12" lg="4">
          
          <!-- INFORMAÇÕES GERAIS -->
          <v-card variant="elevated" class="mb-4">
            <v-card-title class="bg-blue-darken-2 text-white">
              <v-icon left color="white">mdi-information</v-icon>
              Informações da Tripulação
            </v-card-title>
            
            <v-card-text class="pa-4">
              <div class="crew-stats">
                <div class="stat-item">
                  <v-icon color="blue-darken-2" class="mr-2">mdi-account-group</v-icon>
                  <span>Membros: <strong>{{ totalMembers }}</strong></span>
                </div>
                
                <div class="stat-item">
                  <v-icon color="green-darken-2" class="mr-2">mdi-trending-up</v-icon>
                  <span>Nível Médio: <strong>{{ averageLevel }}</strong></span>
                </div>
                
                <div class="stat-item">
                  <v-icon color="purple-darken-2" class="mr-2">mdi-flash</v-icon>
                  <span>Poder Total: <strong>{{ formatNumber(totalPower) }}</strong></span>
                </div>
                
                <div class="stat-item">
                  <v-icon color="orange-darken-2" class="mr-2">mdi-crown</v-icon>
                  <span>Maior Nível: <strong>{{ highestLevel }}</strong></span>
                </div>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- MEMBROS DA TRIPULAÇÃO -->
          <v-card variant="elevated" class="mb-4">
            <v-card-title class="bg-green-darken-2 text-white">
              <v-icon left color="white">mdi-account-multiple</v-icon>
              Membros da Tripulação
            </v-card-title>
            
            <v-card-text class="pa-2">
              <div class="crew-members-list">
                <div 
                  v-for="member in allCrewMembers" 
                  :key="member.id"
                  class="member-item"
                  @click="openMemberDetails(member)"
                >
                  <v-avatar 
                    size="40" 
                    :color="getTypeColor(member.type)" 
                    class="mr-3"
                  >
                    <span class="text-body-2">{{ getTypeIcon(member.type) }}</span>
                  </v-avatar>
                  
                  <div class="member-info">
                    <div class="member-name">
                      {{ member.name }}
                      <v-icon v-if="member.id === playerCharacter?.id" color="yellow-darken-3" size="small">
                        mdi-crown
                      </v-icon>
                    </div>
                    <div class="member-details">
                      Level {{ member.level }} • {{ member.experience }} XP
                    </div>
                  </div>
                  
                  <div class="member-power">
                    <v-chip size="small" color="purple-darken-2" variant="elevated">
                      {{ formatNumber(calculatePower(member)) }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- HISTÓRICO DE TREINOS -->
          <v-card variant="elevated">
            <v-card-title class="bg-purple-darken-2 text-white">
              <v-icon left color="white">mdi-history</v-icon>
              Histórico de Treinos
            </v-card-title>
            
            <v-card-text class="pa-2">
              <div v-if="trainingHistory.length === 0" class="text-center pa-4">
                <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-history</v-icon>
                <div class="text-body-2 text-grey-darken-1">
                  Nenhum treino realizado ainda
                </div>
              </div>
              
              <div v-else class="training-history-list">
                <div 
                  v-for="training in trainingHistory.slice(0, 5)" 
                  :key="training.id"
                  class="history-item"
                >
                  <div class="d-flex align-center">
                    <v-icon 
                      :color="getIntensityColor(getTrainingIntensity(training))" 
                      class="mr-2"
                    >
                      mdi-dumbbell
                    </v-icon>
                    
                    <div class="history-info">
                      <div class="history-title">
                        {{ training.description }}
                      </div>
                      <div class="history-details">
                        {{ formatDate(training.endTime) }} • +{{ training.experienceReward }} EXP
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <v-btn 
                v-if="trainingHistory.length > 5"
                variant="text" 
                size="small" 
                block 
                class="mt-2"
                @click="showAllHistory = !showAllHistory"
              >
                {{ showAllHistory ? 'Mostrar Menos' : `Ver Todos (${trainingHistory.length})` }}
              </v-btn>
            </v-card-text>
          </v-card>
          
        </v-col>
      </v-row>
    </v-container>
    
    <!-- MODAL DE DETALHES DO MEMBRO -->
    <v-dialog v-model="showMemberDetails" max-width="800">
      <MemberDetailsModal 
        v-if="selectedMember"
        :member="selectedMember"
        :is-captain="selectedMember.id === playerCharacter?.id"
        :style="styleCombat(selectedMember.styleCombatId)"
        :devil-fruit="devilFruit(selectedMember.devilFruitId)"
        @close="closeMemberDetails"
        @remove-member="handleRemoveMember"
      />
    </v-dialog>
    
    <!-- SNACKBAR DE NOTIFICAÇÕES -->
    <v-snackbar
      v-model="showNotification"
      :color="notificationColor"
      timeout="4000"
      location="top"
    >
      <v-icon left>{{ notificationIcon }}</v-icon>
      {{ notificationMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { GameLogic } from '@/utils/gameLogic'
import { TrainingSystem } from '@/utils/trainingSystem'
import TrainingInterface from '@/components/TrainingInterface.vue'
import MemberDetailsModal from '@/components/MemberDetailsModal.vue'
import { db, StyleCombat, Character, Task, DevilFruit } from '@/utils/database'

const characterStore = useCharacterStore()

// 🔄 LOADING STATES
const playerCharacterLoaded = ref(false)
const playerCrewLoaded = ref(false)
const crewMembersLoaded = ref(false)
const devilFruitLoaded = ref(false)
const styleLoaded = ref(false)

// �� REACTIVE DATA
const crewMembers = ref<Character[]>([])
const trainingHistory = ref<Task[]>([])
const selectedMember = ref<Character | null>(null)
const showMemberDetails = ref(false)
const showAllHistory = ref(false)
const availableStyleCombat = ref<StyleCombat[]>([])
const availableDevilFruit = ref<DevilFruit[]>([])

// 📢 NOTIFICATION SYSTEM
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationColor = ref('success')
const notificationIcon = ref('mdi-check')

// 📊 COMPUTED
const playerCharacter = computed(() => characterStore.playerCharacter)
const playerCrew = computed(() => characterStore.playerCrew)

const allDataLoaded = computed(() => {
  return playerCharacterLoaded.value && playerCrewLoaded.value && crewMembersLoaded.value
})

const allCrewMembers = computed(() => {
  if (!playerCharacter.value) return crewMembers.value
  
  // Incluir o capitão na lista
  const captain = playerCharacter.value
  const members = crewMembers.value.filter(member => member.id !== captain.id)
  
  return [captain, ...members].sort((a, b) => b.level - a.level)
})

const totalMembers = computed(() => {
  return allCrewMembers.value.length
})

const averageLevel = computed(() => {
  if (allCrewMembers.value.length === 0) return 0
  
  const totalLevel = allCrewMembers.value.reduce((sum, member) => sum + member.level, 0)
  return Math.round(totalLevel / allCrewMembers.value.length)
})

const highestLevel = computed(() => {
  if (allCrewMembers.value.length === 0) return 0
  
  return Math.max(...allCrewMembers.value.map(member => member.level))
})

const totalPower = computed(() => {
  return allCrewMembers.value.reduce((sum, member) => sum + calculatePower(member), 0)
})

// 🔄 CARREGAMENTO SEQUENCIAL
const loadDataSequentially = async () => {
  try {
    console.log('🔄 Iniciando carregamento sequencial...')
    
    // 1. Aguardar playerCharacter e playerCrew estarem disponíveis
    while (!playerCharacter.value || !playerCrew.value) {
      console.log('⏳ Aguardando playerCharacter e playerCrew...')
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    playerCharacterLoaded.value = true
    playerCrewLoaded.value = true
    
    console.log('✅ PlayerCharacter e PlayerCrew disponíveis')
    
    // 2. Carregar membros da tripulação
    console.log('🔄 Carregando membros da tripulação...')
    await loadCrewMembers()
    
    // 3. Carregar histórico de treinos
    console.log('🔄 Carregando histórico de treinos...')
    await loadTrainingHistory()

    console.log('🔄 Carregando estilos de luta...')
    await getStyleCombats()

    console.log('🔄 Carregando akumas no mi...')
    await getDevilFruits()
    
    console.log('✅ Todos os dados carregados!')
    
  } catch (error) {
    console.error('❌ Erro no carregamento sequencial:', error)
  }
}

// ✅ CARREGAR MEMBROS DA TRIPULAÇÃO
const loadCrewMembers = async () => {
  if (!playerCrew.value) {
    console.log('⚠️ PlayerCrew não disponível para carregar membros')
    return
  }
  
  try {
    console.log('🔄 Carregando membros da tripulação...')
    
    const members = await db.characters
      .where('crewId')
      .equals(playerCrew.value.id!)
      .and(character => character.id !== playerCharacter.value?.id) // Excluir capitão
      .toArray()
    
    crewMembers.value = members
    console.log(`✅ ${members.length} membros carregados`)
    
    crewMembersLoaded.value = true
    
  } catch (error) {
    console.error('❌ Erro ao carregar membros:', error)
    crewMembersLoaded.value = true
  }
}

// ✅ CARREGAR HISTÓRICO DE TREINOS
const loadTrainingHistory = async () => {
  try {
    const history = await db.tasks
      .where('type')
      .equals('training')
      .and(task => task.isCompleted)
      .reverse() // Mais recentes primeiro
      .toArray()
    
    trainingHistory.value = history
    console.log(`✅ ${history.length} treinos no histórico`)
    
  } catch (error) {
    console.error('❌ Erro ao carregar histórico:', error)
  }
}

const getStyleCombats = async () => {
    try {
    console.log('🔄 Carregando estilos...')
    
    const styles = await db.styleCombats.toArray()
    if(styles){
      availableStyleCombat.value = styles
      console.log(`✅ Estilos carregados`)
      console.log('estilos', availableStyleCombat.value)
    }
    else {
      console.log('⚠️ Nenhum navio encontrado para esta tripulação')
    }
    
    styleLoaded.value = true
    
  } catch (error) {
    console.error('❌ Erro ao carregar estilo:', error)
    styleLoaded.value = true
  }
}

const getDevilFruits = async () => {
    try {
    console.log('🔄 Carregando akumas no mi...')
    
    const df = await db.devilFruits.toArray()
    if(df){
      availableDevilFruit.value = df
      console.log(`✅ Akumas no mi carregados`)
      console.log('Akumas no mi ', availableDevilFruit.value)
    }
    else {
      console.log('⚠️ Nenhum navio encontrado para esta tripulação')
    }
    
    devilFruitLoaded.value = true
    
  } catch (error) {
    console.error('❌ Erro ao carregar Akuma no mi:', error)
    devilFruitLoaded.value = true
  }
}

// 🎮 MEMBER METHODS
const openMemberDetails = (member: Character) => {
  selectedMember.value = member
  showMemberDetails.value = true
}

const closeMemberDetails = () => {
  selectedMember.value = null
  showMemberDetails.value = false
}

const handleRemoveMember = async (memberId: number) => {
  try {
    console.log('🔄 Removendo membro do crew:', memberId)
    
    // Aqui você chamará sua função do recruitmentModal
    // await recruitmentSystem.removeMemberFromCrew(memberId)
    
    // Recarregar dados da tripulação
    await loadCrewMembers()
    
    showNotification.value = true
    notificationMessage.value = 'Membro removido da tripulação!'
    notificationColor.value = 'success'
    notificationIcon.value = 'mdi-check'
    
    console.log('✅ Membro removido com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao remover membro:', error)
    
    showNotification.value = true
    notificationMessage.value = 'Erro ao remover membro!'
    notificationColor.value = 'error'
    notificationIcon.value = 'mdi-alert'
  }
}

// 🏋️ TRAINING METHODS
const handleTrainingCompleted = async (event: any) => {
  console.log('🎉 Treino concluído!', event.detail)
  
  // Recarregar dados
  await Promise.all([
    characterStore.loadPlayerCharacter(),
    loadCrewMembers(),
    loadTrainingHistory()
  ])
  
  // Mostrar notificação
  showNotification.value = true
  notificationMessage.value = `Treino concluído! +${event.detail.experience} EXP para toda a tripulação!`
  notificationColor.value = 'success'
  notificationIcon.value = 'mdi-dumbbell'
}

// 🎨 HELPER FUNCTIONS
const calculatePower = (character: Character): number => {
  const df = devilFruit(character.devilFruitId)
  return GameLogic.calculatePower(character, df)
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

const formatDate = (dateString: Date): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'Pirate': return 'red-darken-2'
    case 'Marine': return 'blue-darken-2'
    case 'Government': return 'orange-darken-2'
    case 'BountyHunter': return 'green-darken-2'
    default: return 'grey-darken-2'
  }
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

const getIntensityColor = (intensity: number): string => {
  if (intensity <= 1) return 'green'
  if (intensity <= 5) return 'orange'
  if (intensity <= 10) return 'red'
  return 'dark-red'
}

const getTrainingIntensity = (training: Task): number => {
  const startTime = new Date(training.startTime)
  const endTime = new Date(training.endTime)
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60000
  
  if (durationMinutes <= 1) return 1
  if (durationMinutes <= 5) return 5
  if (durationMinutes <= 10) return 10
  return 30
}

const styleCombat = (combat: number): string => {
    return availableStyleCombat.value.find(comb => comb.id === combat).name
}

const devilFruit = (devilFruit: number): DevilFruit => {
    return availableDevilFruit.value.find(fruit => fruit.id === devilFruit)
}

// ✅ LIFECYCLE
onMounted(async () => {
  console.log('🚀 View Training montada, iniciando carregamento...')
  await loadDataSequentially()
  
  // Listener para quando o treino for concluído
  window.addEventListener('trainingCompleted', handleTrainingCompleted)
})

// ✅ WATCHERS
watch([playerCharacter, playerCrew], async () => {
  if (playerCharacter.value && playerCrew.value) {
    await loadDataSequentially()
  }
})
</script>

<style scoped>
/* ============================================================
   Training - Grand Line Dojo
   ============================================================ */

.training-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 8px;
}

/* Page header */
.page-header {
  background: linear-gradient(135deg,
    rgba(21, 101, 192, 0.1),
    rgba(212, 175, 55, 0.06)
  );
  border: 1px solid rgba(21, 101, 192, 0.3);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 8px;
  position: relative;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent, #1565C0, #90CAF9, #1565C0, transparent
  );
  border-radius: 14px 14px 0 0;
}

/* Loading */
.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Member selector card */
.member-card {
  background: #132235;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  padding: 14px;
  position: relative;
  overflow: hidden;
}

.member-card:hover {
  border-color: rgba(212, 175, 55, 0.55);
  box-shadow: 0 0 16px rgba(212, 175, 55, 0.18);
  transform: translateY(-2px);
}

.member-card.selected {
  border-color: #D4AF37;
  background: linear-gradient(135deg,
    rgba(212, 175, 55, 0.12),
    rgba(21, 101, 192, 0.08)
  );
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

.member-name {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #D4AF37;
  font-size: 0.95rem;
}

.member-level {
  font-size: 0.75rem;
  color: #8B9DC3;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

/* Training option cards */
.training-option {
  background: #132235;
  border: 1px solid rgba(21, 101, 192, 0.3);
  border-radius: 12px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.25s ease;
  height: 100%;
}

.training-option:hover {
  border-color: rgba(21, 101, 192, 0.6);
  box-shadow: 0 0 16px rgba(21, 101, 192, 0.2);
  transform: translateY(-2px);
}

.training-option.selected {
  border-color: #1565C0;
  background: linear-gradient(135deg,
    rgba(21, 101, 192, 0.15),
    rgba(212, 175, 55, 0.06)
  );
  box-shadow: 0 0 16px rgba(21, 101, 192, 0.3);
}

.training-option-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  display: block;
}

.training-option-name {
  font-family: Georgia, serif;
  font-size: 1rem;
  font-weight: 700;
  color: #90CAF9;
  margin-bottom: 4px;
}

.training-option-desc {
  font-size: 0.8rem;
  color: #8B9DC3;
  line-height: 1.5;
}

/* Stats panel */
.stats-panel {
  background: linear-gradient(135deg, #132235, #1A2F45);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 14px;
  overflow: hidden;
}

.stats-panel-header {
  background: linear-gradient(135deg,
    rgba(212, 175, 55, 0.1),
    rgba(21, 101, 192, 0.06)
  );
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  padding: 12px 18px;
}

.stats-panel-title {
  font-family: Georgia, serif;
  color: #D4AF37;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 0.85rem;
}

.stat-row:last-child { border-bottom: none; }

.stat-label {
  color: #8B9DC3;
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.07em;
}

.stat-value {
  color: #E8D5A3;
  font-weight: 600;
}

/* Active training progress */
.training-progress-card {
  background: linear-gradient(135deg, #0F1E33, #1A2F45);
  border: 1px solid rgba(21, 101, 192, 0.4);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
}

.training-progress-header {
  background: linear-gradient(135deg,
    rgba(21, 101, 192, 0.2),
    rgba(144, 202, 249, 0.06)
  );
  border-bottom: 1px solid rgba(21, 101, 192, 0.3);
  padding: 12px 18px;
}

.progress-bar-track {
  height: 12px;
  background: rgba(10, 22, 40, 0.8);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.progress-bar-fill {
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, #0D47A1, #42A5F5);
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
}

.progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0; left: -60%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  animation: shimmer 2.5s infinite;
}

@keyframes shimmer {
  0%   { left: -60%; }
  100% { left: 160%; }
}
</style>