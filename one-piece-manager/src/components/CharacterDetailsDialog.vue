<template>
  <v-dialog
    v-model="dialog"
    max-width="880"
    transition="dialog-bottom-transition"
    @click:outside="closeDialog"
  >
    <v-card v-if="character" class="cd-card">

      <!-- ── TOP ACCENT LINE ── -->
      <div class="cd-top-accent" />

      <!-- ══════════════════════════════════════
           HERO HEADER: Poster + Identidade
      ══════════════════════════════════════ -->
      <div class="cd-header">
        <!-- Wanted Poster -->
        <div class="cd-poster-wrap">
          <WantedPoster
            :character="character"
            size="small"
            :show-actions="false"
            :show-size-controls="false"
            @download-complete="onPosterDownload"
            @share-complete="onPosterShare"
          />
          <div class="cd-rank-badge">
            <v-icon size="14">mdi-trophy</v-icon>
            #{{ character.rank }}
          </div>
        </div>

        <!-- Identidade -->
        <div class="cd-identity">
          <p class="cd-name">{{ character.name }}</p>

          <div class="cd-crew-row">
            <v-icon size="15" class="cd-crew-icon">mdi-anchor</v-icon>
            <span class="cd-crew-name">{{ character.crewName || 'Sem tripulação' }}</span>
          </div>

          <!-- Chips de status -->
          <div class="cd-chips">
            <v-chip :color="getTypeColor(character.type)" variant="tonal" size="small" density="comfortable">
              {{ formatType(character.type) }}
            </v-chip>
            <v-chip color="blue-grey" variant="tonal" size="small" density="comfortable">
              {{ character.position || 'Capitão' }}
            </v-chip>
            <v-chip v-if="character.isPlayer" color="success" variant="elevated" size="small" density="comfortable" prepend-icon="mdi-account-star">
              YOU
            </v-chip>
            <v-chip v-if="character.specialTitle" color="warning" variant="elevated" size="small" density="comfortable">
              {{ character.specialTitle }}
            </v-chip>
          </div>

          <!-- Localização -->
          <div class="cd-location">
            <v-icon size="14" class="me-1">mdi-map-marker</v-icon>
            <span>{{ character.currentIslandName || 'Desconhecida' }}</span>
            <v-chip
              v-if="character.currentIslandDifficulty"
              :color="getDifficultyColor(character.currentIslandDifficulty)"
              variant="tonal" size="x-small" density="comfortable" class="ms-2"
            >
              Dif. {{ character.currentIslandDifficulty }}
            </v-chip>
          </div>

          <!-- Bounty -->
          <div class="cd-bounty-row">
            <span class="cd-bounty-label">{{ GameLogic.getBountyLabel(character.type) }}</span>
            <CharacterBountyDisplay :character="character" size="default" variant="elevated" />
          </div>
        </div>
      </div>

      <v-divider class="cd-divider" />

      <!-- ══════════════════════════════════════
           CORPO: Stats + Habilidades
      ══════════════════════════════════════ -->
      <v-card-text class="cd-body pa-5">
        <v-row :gutter="0">

          <!-- ── COLUNA ESQUERDA: Stats de Combate ── -->
          <v-col cols="12" md="6" class="pe-md-4">
            <div class="cd-section-label">
              <v-icon size="16" class="me-2" color="primary">mdi-sword-cross</v-icon>
              Estatísticas de Combate
            </div>

            <!-- Level em destaque -->
            <div class="cd-level-card">
              <v-icon size="20" color="amber">mdi-star-four-points</v-icon>
              <span class="cd-level-num">{{ character.level }}</span>
              <span class="cd-level-label">Level</span>
            </div>

            <!-- Stats com barra de progresso -->
            <div class="cd-stats-list">
              <div
                v-for="stat in combatStats"
                :key="stat.key"
                class="cd-stat-row"
              >
                <v-icon :color="stat.color" size="17" class="cd-stat-icon">{{ stat.icon }}</v-icon>
                <span class="cd-stat-name">{{ stat.label }}</span>
                <div class="cd-stat-bar-wrap">
                  <div class="cd-stat-bar" :style="{ width: statPercent(stat.value) + '%', background: stat.bg }" />
                </div>
                <span class="cd-stat-val" :style="{ color: stat.color }">{{ stat.value }}</span>
              </div>
            </div>
          </v-col>

          <!-- ── COLUNA DIREITA: Habilidades especiais ── -->
          <v-col cols="12" md="6" class="ps-md-4 mt-4 mt-md-0">

            <!-- Akuma no Mi -->
            <div v-if="character.devilFruitId" class="cd-df-card">
              <div class="cd-section-label mb-3">
                <v-icon size="16" class="me-2" color="deep-purple-lighten-2">mdi-fruit-grapes</v-icon>
                Akuma no Mi
              </div>
              <div class="cd-df-name">{{ devilFruit(character.devilFruitId)?.name || 'Desconhecida' }}</div>
              <div class="cd-df-type">{{ devilFruit(character.devilFruitId)?.type || '' }}</div>
              <p v-if="devilFruit(character.devilFruitId)?.description" class="cd-df-desc">
                {{ devilFruit(character.devilFruitId)?.description }}
              </p>
            </div>

            <!-- Haki -->
            <div class="cd-section-label" :class="character.devilFruitId ? 'mt-4' : ''">
              <v-icon size="16" class="me-2" color="blue-grey-lighten-2">mdi-wave</v-icon>
              Haki
            </div>
            <div class="cd-haki-grid">
              <div class="cd-haki-item" :class="{ 'cd-haki-active': character.stats?.armHaki > 0 }">
                <v-icon size="18" :color="character.stats?.armHaki > 0 ? 'deep-purple-lighten-1' : 'grey-darken-1'">mdi-shield-sword</v-icon>
                <span class="cd-haki-name">Armamento</span>
                <span v-if="character.stats?.armHaki > 0" class="cd-haki-tier" :style="{ color: GameLogic.hakiTier(character.stats.armHaki, 'arm').color }">{{ GameLogic.hakiTier(character.stats.armHaki, 'arm').name }}</span>
                <span class="cd-haki-val">{{ character.stats?.armHaki || 0 }}</span>
              </div>
              <div class="cd-haki-item" :class="{ 'cd-haki-active': character.stats?.obsHaki > 0 }">
                <v-icon size="18" :color="character.stats?.obsHaki > 0 ? 'cyan-lighten-1' : 'grey-darken-1'">mdi-eye-circle</v-icon>
                <span class="cd-haki-name">Observação</span>
                <span v-if="character.stats?.obsHaki > 0" class="cd-haki-tier" :style="{ color: GameLogic.hakiTier(character.stats.obsHaki, 'obs').color }">{{ GameLogic.hakiTier(character.stats.obsHaki, 'obs').name }}</span>
                <span class="cd-haki-val">{{ character.stats?.obsHaki || 0 }}</span>
              </div>
              <div class="cd-haki-item" :class="{ 'cd-haki-active': character.stats?.kingHaki > 0 }">
                <v-icon size="18" :color="character.stats?.kingHaki > 0 ? 'amber-lighten-1' : 'grey-darken-1'">mdi-crown</v-icon>
                <span class="cd-haki-name">Do Rei</span>
                <span v-if="character.stats?.kingHaki > 0" class="cd-haki-tier" :style="{ color: GameLogic.hakiTier(character.stats.kingHaki, 'king').color }">{{ GameLogic.hakiTier(character.stats.kingHaki, 'king').name }}</span>
                <span class="cd-haki-val">{{ character.stats?.kingHaki || 0 }}</span>
              </div>
            </div>

            <!-- Bondade -->
            <div class="cd-section-label mt-4">
              <v-icon size="16" class="me-2" color="pink-lighten-2">mdi-heart</v-icon>
              Bondade
            </div>
            <div class="cd-kindness-row">
              <v-progress-linear
                :model-value="kindnessPercent"
                color="pink-lighten-1"
                bg-color="rgba(255,255,255,0.06)"
                rounded
                height="10"
              />
              <span class="cd-kindness-val">{{ character.kindness || 0 }}</span>
            </div>

          </v-col>
        </v-row>
      </v-card-text>

      <!-- ── ACTIONS ── -->
      <v-divider class="cd-divider" />
      <v-card-actions class="cd-actions pa-4">
        <v-spacer />
        <v-btn color="primary" variant="elevated" min-width="120" @click="dialog = false">
          Fechar
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEventListener } from '@vueuse/core'
import type { RankingCharacter } from '@/utils/worldEncyclopedia'
import WantedPoster from '@/components/WantedPoster.vue'
import CharacterBountyDisplay from '@/components/CharacterBountyDisplay.vue'
import { DevilFruit } from '@/utils/database'
import { GameLogic } from '@/utils/gameLogic'

// Props
interface Props {
  modelValue: boolean
  character: RankingCharacter | null
  allDevilFruits: DevilFruit[]
}

useEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDialog()
  }
})

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Computed
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const combatStats = computed(() => {
  const s = props.character?.stats
  if (!s) return []
  return [
    { key: 'attack',       label: 'Ataque',      icon: 'mdi-sword',    color: '#EF5350', bg: 'linear-gradient(90deg,#8B0000,#EF5350)', value: s.attack       || 0 },
    { key: 'defense',      label: 'Defesa',       icon: 'mdi-shield',   color: '#42A5F5', bg: 'linear-gradient(90deg,#003087,#42A5F5)', value: s.defense      || 0 },
    { key: 'speed',        label: 'Velocidade',   icon: 'mdi-run-fast', color: '#66BB6A', bg: 'linear-gradient(90deg,#1B5E20,#66BB6A)', value: s.speed        || 0 },
    { key: 'intelligence', label: 'Inteligência', icon: 'mdi-brain',    color: '#AB47BC', bg: 'linear-gradient(90deg,#4A148C,#AB47BC)', value: s.intelligence || 0 },
    { key: 'skill',        label: 'Habilidade',   icon: 'mdi-feather',  color: '#FFA726', bg: 'linear-gradient(90deg,#E65100,#FFA726)', value: s.skill        || 0 },
  ]
})

const kindnessPercent = computed(() => {
  const k = props.character?.kindness ?? 0
  return Math.min(100, Math.max(0, ((k + 100) / 200) * 100))
})

const maxStat = computed(() => {
  const values = combatStats.value.map(s => s.value)
  return values.length > 0 ? Math.max(...values) : 1
})

const statPercent = (value: number) => {
  const max = maxStat.value
  if (max === 0) return 0
  return Math.min(100, Math.max(0, (value / max) * 100))
}

// Methods
const devilFruit = (df: number): DevilFruit | undefined => {
  return props.allDevilFruits.find(devilFruit => devilFruit.id === df)
}

const challengeCharacter = (): void => {
  console.log('Challenge character:', props.character?.name)
  // Implementar lógica de desafio
  dialog.value = false
}

const downloadCharacterPoster = (): void => {
  console.log('Download poster for:', props.character?.name)
  // A função de download será chamada pelo componente WantedPoster
}

const shareCharacterInfo = (): void => {
  if (!props.character) return
  
  const shareText = `🏴‍☠️ ${props.character.name}
Rank: #${props.character.rank}
Tripulação: ${props.character.crewName}
Level: ${props.character.level}`

  if (navigator.share) {
    navigator.share({
      title: `One Piece - ${props.character.name}`,
      text: shareText
    })
  } else {
    navigator.clipboard.writeText(shareText)
  }
}

const onPosterDownload = (success: boolean): void => {
  if (success) {
    console.log('✅ Poster baixado com sucesso!')
  } else {
    console.log('❌ Erro ao baixar poster')
  }
}

const onPosterShare = (success: boolean): void => {
  if (success) {
    console.log('✅ Poster compartilhado com sucesso!')
  } else {
    console.log('❌ Erro ao compartilhar poster')
  }
}

// Helper functions
const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    Pirate: 'red',
    Marine: 'blue',
    BountyHunter: 'green',
    Government: 'purple'
  }
  return colors[type] || 'grey'
}

const getDifficultyColor = (difficulty: number): string => {
  if (difficulty <= 5) return 'success'
  if (difficulty <= 10) return 'warning'
  if (difficulty <= 15) return 'orange'
  return 'error'
}

const formatType = (type: string): string => {
  return type.replace(/([A-Z])/g, ' $1').trim()
}

const closeDialog = () => {
  // Aqui você pode adicionar lógica antes de fechar
  // Por exemplo: salvar dados, mostrar confirmação, etc.
  
  console.log('Dialog fechado ao clicar fora')
  dialog.value = false
}
</script>

<style scoped>
/* ── Grand Line Character Sheet Dialog ── */

.cd-card {
  background: #172D48 !important;
  border: 1px solid rgba(212,175,55,0.5) !important;
  border-radius: 14px !important;
  overflow: hidden;
}

/* Linha decorativa de topo */
.cd-top-accent {
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #D4AF37 30%, #FFD700 50%, #D4AF37 70%, transparent 100%);
}

/* ─── HEADER ─── */
.cd-header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 20px 24px 20px;
  background: linear-gradient(135deg, rgba(10,22,40,0.6) 0%, rgba(212,175,55,0.06) 100%);
}

.cd-poster-wrap {
  position: relative;
  flex-shrink: 0;
}

.cd-rank-badge {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(212,175,55,0.9);
  color: #0A1628;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 2px 10px;
  border-radius: 20px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 3px;
}

/* Identidade */
.cd-identity {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 6px;
}

.cd-name {
  font-family: Georgia, serif;
  font-size: 1.55rem;
  font-weight: 700;
  color: #F0E6D8;
  line-height: 1.2;
  margin: 0;
  text-shadow: 0 0 20px rgba(212,175,55,0.3);
  letter-spacing: 0.02em;
}

.cd-crew-row {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #B0BFDA;
  font-size: 0.88rem;
}

.cd-crew-icon { opacity: 0.7; }

.cd-crew-name {
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cd-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cd-location {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  color: #8B9DC3;
  font-size: 0.82rem;
  gap: 2px;
}

.cd-bounty-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cd-bounty-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: #B0BFDA;
}

/* ─── DIVIDER ─── */
.cd-divider {
  border-color: rgba(212,175,55,0.2) !important;
}

/* ─── BODY ─── */
.cd-body { color: #F0E6D8; }

.cd-section-label {
  display: flex;
  align-items: center;
  font-family: Georgia, serif;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #B0BFDA;
  margin-bottom: 14px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(212,175,55,0.18);
}

/* Level em destaque */
.cd-level-card {
  display: flex;
  align-items: baseline;
  gap: 8px;
  background: rgba(212,175,55,0.08);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 16px;
}

.cd-level-num {
  font-family: Georgia, serif;
  font-size: 2rem;
  font-weight: 700;
  color: #D4AF37;
  line-height: 1;
}

.cd-level-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #B0BFDA;
}

/* Stats com barra */
.cd-stats-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cd-stat-row {
  display: grid;
  grid-template-columns: 20px 90px 1fr 36px;
  align-items: center;
  gap: 8px;
}

.cd-stat-icon { justify-self: center; }

.cd-stat-name {
  font-size: 0.8rem;
  color: #B0BFDA;
  white-space: nowrap;
}

.cd-stat-bar-wrap {
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
}

.cd-stat-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.cd-stat-val {
  font-size: 0.82rem;
  font-weight: 700;
  text-align: right;
  font-family: 'Courier New', monospace;
}

/* ─── Devil Fruit ─── */
.cd-df-card {
  background: rgba(74,20,140,0.12);
  border: 1px solid rgba(171,71,188,0.3);
  border-radius: 10px;
  padding: 14px 16px;
}

.cd-df-name {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #CE93D8;
  font-size: 1rem;
  margin-bottom: 2px;
}

.cd-df-type {
  font-size: 0.68rem;
  color: #8B9DC3;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 6px;
}

.cd-df-desc {
  font-size: 0.78rem;
  color: #B0BFDA;
  line-height: 1.5;
  margin: 0;
}

/* ─── Haki ─── */
.cd-haki-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.cd-haki-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  opacity: 0.45;
  transition: all 0.2s ease;
}

.cd-haki-item.cd-haki-active {
  opacity: 1;
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.12);
}

.cd-haki-name {
  flex: 1;
  font-size: 0.82rem;
  color: #B0BFDA;
}

.cd-haki-val {
  font-size: 0.82rem;
  font-weight: 700;
  color: #F0E6D8;
  font-family: 'Courier New', monospace;
}

.cd-haki-tier {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  opacity: 0.9;
  margin-right: 2px;
}

/* ─── Kindness ─── */
.cd-kindness-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cd-kindness-val {
  font-size: 0.82rem;
  font-weight: 700;
  color: #F48FB1;
  min-width: 30px;
  text-align: right;
  font-family: 'Courier New', monospace;
}

/* ─── Actions ─── */
.cd-actions {
  background: rgba(10,22,40,0.4);
}

/* ─── Responsivo ─── */
@media (max-width: 600px) {
  .cd-header { flex-direction: column; align-items: center; text-align: center; }
  .cd-name   { font-size: 1.2rem; }
  .cd-chips  { justify-content: center; }
  .cd-crew-row, .cd-location, .cd-bounty-row { justify-content: center; }
  .cd-stat-row { grid-template-columns: 20px 80px 1fr 32px; }
}
</style>