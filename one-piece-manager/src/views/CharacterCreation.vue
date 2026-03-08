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
                  class="mb-2"
                  prepend-inner-icon="mdi-sword"
                  required
                ></v-select>

                <!-- Preview de Stats do Estilo -->
                <v-expand-transition>
                  <v-card
                    v-if="selectedStyle"
                    variant="tonal"
                    color="blue-darken-4"
                    class="mb-4 pa-3"
                  >
                    <div class="text-caption text-blue-lighten-3 mb-2 font-weight-bold">
                      STATS BASE — {{ selectedStyle.name }}
                    </div>
                    <v-row dense>
                      <v-col
                        v-for="row in styleStatRows"
                        :key="row.label"
                        cols="6"
                      >
                        <div class="d-flex align-center ga-2 mb-1">
                          <v-icon size="14" :color="row.color">{{ row.icon }}</v-icon>
                          <span class="text-caption" style="min-width:80px">{{ row.label }}</span>
                          <v-progress-linear
                            :model-value="row.value"
                            :max="100"
                            :color="row.color"
                            height="6"
                            rounded
                            class="flex-1-1"
                          />
                          <span class="text-caption font-weight-bold" :style="{ color: row.color }">
                            {{ row.value }}
                          </span>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-expand-transition>

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
            
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mx-6 mb-2"
              closable
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/characterStore'
import { WorldResetSystem } from '@/utils/worldResetSystem'
import { db } from '@/utils/database'
import { GameDataGenerator } from '@/utils/gameDataGenerator'
import type { StyleCombat } from '@/utils/database'

const router = useRouter()
const characterStore = useCharacterStore()

// Estados
const formValid = ref(false)
const isCreating = ref(false)
const errorMessage = ref('')

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

const combatStyleObjects = ref<Omit<StyleCombat, 'id'>[]>([])
const combatStyles = computed(() => combatStyleObjects.value.map(s => s.name))

const selectedStyle = computed(() =>
  combatStyleObjects.value.find(s => s.name === characterData.value.combatStyle) ?? null
)

const styleStatRows = computed(() => {
  if (!selectedStyle.value) return []
  const s = selectedStyle.value
  return [
    { label: 'Ataque',       value: s.attack,        icon: 'mdi-sword',        color: '#EF5350' },
    { label: 'Defesa',       value: s.defense,       icon: 'mdi-shield',       color: '#42A5F5' },
    { label: 'Velocidade',   value: s.speed,         icon: 'mdi-run-fast',     color: '#66BB6A' },
    { label: 'Habilidade',   value: s.skill,         icon: 'mdi-star-four-points', color: '#FFA726' },
    { label: 'Inteligência', value: s.intelligence,  icon: 'mdi-brain',        color: '#AB47BC' },
    { label: 'Haki Armado',  value: s.armHaki,       icon: 'mdi-arm-flex',     color: '#8D6E63' },
    { label: 'Haki Obs.',    value: s.obsHaki,       icon: 'mdi-eye',          color: '#26C6DA' },
  ]
})

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
    const generator = new GameDataGenerator('EPIC')
    combatStyleObjects.value = generator.mockStyleCombact()
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error)
  }
}

const createCharacter = async () => {
  try {
    isCreating.value = true
    errorMessage.value = ''

    console.log('👤 Criando personagem:', characterData.value)

    const result = await WorldResetSystem.generateWorldAfterCharacterCreation(characterData.value)
    console.log('result', result)

    if (result.success) {
      console.log('✅ Personagem criado, redirecionando...')
      router.push('/')
    } else {
      console.error('❌ Erro na criação:', result.message)
      errorMessage.value = result.message || 'Erro ao criar personagem. Tente novamente.'
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    errorMessage.value = 'Erro inesperado. Verifique o console e tente novamente.'
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
/* ============================================================
   Character Creation - Become a Pirate
   ============================================================ */

.character-creation-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 8px;
}

/* Creation header */
.creation-header {
  background: linear-gradient(135deg,
    rgba(255, 107, 53, 0.1),
    rgba(212, 175, 55, 0.08)
  );
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.creation-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent, #FF6B35, #FFD700, #FF6B35, transparent
  );
}

.creation-title {
  font-family: Georgia, serif;
  font-size: 2rem;
  font-weight: 700;
  color: #FF6B35;
  text-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
  letter-spacing: 0.06em;
  margin: 0 0 8px;
}

.creation-subtitle {
  font-size: 0.95rem;
  color: #8B9DC3;
  letter-spacing: 0.03em;
}

/* Creation steps */
.creation-step-card {
  background: #132235;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 16px;
  position: relative;
}

.creation-step-card.active {
  border-color: rgba(255, 107, 53, 0.5);
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.12);
}

.creation-step-card.completed {
  border-color: rgba(46, 125, 50, 0.4);
  background: linear-gradient(135deg, rgba(46,125,50,0.05), #132235);
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: #D4AF37;
  font-weight: 700;
  font-size: 0.9rem;
  margin-right: 12px;
  flex-shrink: 0;
}

.step-title {
  font-family: Georgia, serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 0.03em;
}

/* Input styling */
.creation-input {
  background: rgba(13, 27, 46, 0.6);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: #E8D5A3;
  font-size: 1rem;
  width: 100%;
  transition: border-color 0.2s ease;
  outline: none;
}

.creation-input:focus {
  border-color: #D4AF37;
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.2);
}

/* Style selection */
.style-option {
  background: #132235;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.style-option:hover {
  border-color: rgba(255, 107, 53, 0.4);
  background: rgba(255, 107, 53, 0.05);
}

.style-option.selected {
  border-color: #FF6B35;
  background: rgba(255, 107, 53, 0.1);
  box-shadow: 0 0 14px rgba(255, 107, 53, 0.2);
}

.style-option-name {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #E8D5A3;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.style-option-desc {
  font-size: 0.75rem;
  color: #8B9DC3;
  line-height: 1.4;
}

/* Avatar preview */
.avatar-preview-container {
  background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(21,101,192,0.06));
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 14px;
  padding: 24px;
  text-align: center;
}

/* Start adventure button */
.start-btn {
  background: linear-gradient(135deg, #866700, #D4AF37, #FFD700) !important;
  color: #0D1B2E !important;
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  letter-spacing: 0.06em !important;
  padding: 14px 40px !important;
  border-radius: 10px !important;
  box-shadow: 0 6px 24px rgba(212, 175, 55, 0.4) !important;
  transition: all 0.25s ease !important;
  text-transform: uppercase !important;
}

.start-btn:hover {
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.65) !important;
  transform: translateY(-2px) !important;
}
</style>