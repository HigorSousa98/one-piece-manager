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
  return 'red'
}

const getTrainingIntensity = (training: Task): number => {
  const startTime = new Date(training.startTime)
  const endTime = new Date(training.endTime)
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60000
  
  if (durationMinutes <= 1) return 1
  if (durationMinutes <= 5) return 5
  return 10
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
.training-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 0;
}

.loading-container {
  padding: 4rem 0;
}

.crew-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  border-left: 3px solid rgba(0, 0, 0, 0.1);
}

.crew-members-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.member-item:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateX(4px);
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.member-details {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

.member-power {
  margin-left: auto;
}

.training-history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border-left: 3px solid rgba(0, 0, 0, 0.1);
}

.history-info {
  flex: 1;
}

.history-title {
  font-weight: 600;
  font-size: 0.875rem;
}

.history-details {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.v-card {
  border-radius: 12px;
  overflow: hidden;
}

.v-card-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.v-btn {
  border-radius: 8px;
  font-weight: 600;
}

/* RESPONSIVIDADE */
@media (max-width: 960px) {
  .page-header {
    padding: 1rem 0;
  }
  
  .page-header .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
  }
  
  .crew-members-list {
    max-height: 300px;
  }
  
  .training-history-list {
    max-height: 200px;
  }
}
</style>