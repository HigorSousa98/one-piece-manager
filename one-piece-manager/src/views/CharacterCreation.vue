<!-- src/views/CharacterCreation.vue -->
<template>
  <div class="character-creation-view">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          
          <v-card variant="elevated">
            <v-card-title class="bg-blue-darken-2 text-white text-center">
              <v-icon left color="white" size="large">mdi-account-plus</v-icon>
              <span class="text-h4">Criar Personagem</span>
            </v-card-title>
            
            <v-card-text class="pa-6">
              <v-form ref="form" v-model="formValid" @submit.prevent="createCharacter">
                
                <!-- Nome -->
                <v-text-field
                  v-model="characterData.name"
                  label="Nome do Personagem"
                  :rules="nameRules"
                  variant="outlined"
                  class="mb-4"
                  prepend-inner-icon="mdi-account"
                  required
                ></v-text-field>
                
                <!-- Tipo -->
                <v-select
                  v-model="characterData.type"
                  :items="characterTypes"
                  label="Tipo de Personagem"
                  :rules="typeRules"
                  variant="outlined"
                  class="mb-4"
                  prepend-inner-icon="mdi-flag"
                  required
                ></v-select>
                
                <!-- Style de Combate -->
                <v-select
                  v-model="characterData.combatStyle"
                  :items="combatStyles"
                  label="Estilo de Combate"
                  :rules="styleRules"
                  variant="outlined"
                  class="mb-4"
                  prepend-inner-icon="mdi-sword"
                  required
                ></v-select>
                
                <!-- Crew Name -->
                <v-text-field
                  v-model="characterData.crewName"
                  label="Nome do seu Bando"
                  :rules="nameRules"
                  variant="outlined"
                  class="mb-4"
                  prepend-inner-icon="mdi-account"
                  required
                ></v-text-field>

                <!-- Ship NAme -->
                <v-text-field
                  v-model="characterData.shipName"
                  label="Nome do seu Navio"
                  :rules="nameRules"
                  variant="outlined"
                  class="mb-4"
                  prepend-inner-icon="mdi-account"
                  required
                ></v-text-field>
                
              </v-form>
            </v-card-text>
            
            <v-card-actions class="pa-6">
              <v-btn
                color="grey"
                variant="outlined"
                @click="goBack"
              >
                <v-icon left>mdi-arrow-left</v-icon>
                Voltar
              </v-btn>
              
              <v-spacer></v-spacer>
              
              <v-btn
                color="blue-darken-2"
                variant="elevated"
                size="large"
                :loading="isCreating"
                :disabled="!formValid || isCreating"
                @click="createCharacter"
              >
                <v-icon left>mdi-account-plus</v-icon>
                Criar Personagem
              </v-btn>
            </v-card-actions>
            
          </v-card>
          
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/characterStore'
import { WorldResetSystem } from '@/utils/worldResetSystem'
import { db } from '@/utils/database'
import { GameDataGenerator } from '@/utils/gameDataGenerator'

const router = useRouter()
const characterStore = useCharacterStore()

// Estados
const formValid = ref(false)
const isCreating = ref(false)

const characterData = ref({
  name: '',
  type: '',
  combatStyle: '',
  devilFruitId: undefined as number | undefined,
  crewName: '',
  shipName: ''
})

const characterTypes = [
  { title: 'Pirata', value: 'Pirate' },
  { title: 'Marine', value: 'Marine' },
  { title: 'Caçador de Recompensas', value: 'BountyHunter' },
  { title: 'Governo Mundial', value: 'Government' }
]

const combatStyles = ref<string[]>([])
const devilFruits = ref<any[]>([])

// Regras de validação
const nameRules = [
  (v: string) => !!v || 'Nome é obrigatório',
  (v: string) => v.length >= 2 || 'Nome deve ter pelo menos 2 caracteres',
  (v: string) => v.length <= 50 || 'Nome deve ter no máximo 50 caracteres'
]

const typeRules = [
  (v: string) => !!v || 'Tipo é obrigatório'
]

const styleRules = [
  (v: string) => !!v || 'Estilo de combate é obrigatório'
]

// Métodos
const loadData = async () => {
  try {
    // Carregar estilos de combate
    const generator = new GameDataGenerator('EPIC')
    const styles = await generator.mockStyleCombact()
    combatStyles.value = styles.map(style => style.name)
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error)
  }
}

const createCharacter = async () => {
  try {
    isCreating.value = true
    
    console.log('👤 Criando personagem:', characterData.value)
    
    const result = await WorldResetSystem.generateWorldAfterCharacterCreation(characterData.value)
    console.log('result', result)
    
    if (result.success) {
      console.log('✅ Personagem criado, redirecionando...')
      router.push('/')
    } else {
      console.error('❌ Erro na criação:', result.message)
      // Aqui você pode mostrar um snackbar ou modal de erro
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  } finally {
    isCreating.value = false
  }
}

const goBack = () => {
  router.push('/')
}

// Lifecycle
onMounted(async () => {
  // Verificar se realmente precisa criar personagem
  const needsCreation = await WorldResetSystem.needsCharacterCreation()
  
  if (!needsCreation) {
    console.log('⚠️ Personagem já existe, redirecionando...')
    router.push('/')
    return
  }
  
  await loadData()
})
</script>

<style scoped>
.character-creation-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 2rem 0;
}

.v-card {
  border-radius: 16px;
  overflow: hidden;
}

.v-card-title {
  padding: 2rem;
}

@media (max-width: 768px) {
  .v-card-title {
    padding: 1rem;
  }
  
  .v-card-text,
  .v-card-actions {
    padding: 1rem !important;
  }
}
</style>