<!-- src/components/AvataaarsAvatar.vue -->
<template>
  <div class="avataaars-avatar-container" :class="containerClasses">
    <v-avatar 
      :size="size"
      :class="avatarClasses"
      @click="handleClick"
    >
      <!-- Loading State -->
      <div v-if="loading" class="avatar-loading">
        <v-progress-circular
          indeterminate
          color="primary"
          size="24"
        />
      </div>
      
      <!-- Avatar Image -->
      <img 
        v-else-if="avatarUrl"
        :src="avatarUrl"
        :alt="`Avatar de ${character.name}`"
        @load="handleImageLoad"
        @error="handleImageError"
        class="avatar-image"
      />
      
      <!-- Fallback -->
      <v-icon v-else :size="fallbackIconSize" color="white">
        {{ getFallbackIcon() }}
      </v-icon>
    </v-avatar>

    <!-- Status Indicators -->
    <div v-if="showStatusIndicators" class="status-indicators">
      <v-chip 
        v-if="showLevel" 
        size="x-small" 
        color="primary"
        class="level-indicator"
      >
        {{ character.level }}
      </v-chip>
      
      <v-chip 
        v-if="showPowerRank" 
        size="x-small" 
        :color="getPowerRankColor()"
        class="power-indicator"
      >
        {{ getPowerRank() }}
      </v-chip>
    </div>

    <!-- Action Buttons -->
    <div v-if="showActions" class="avatar-actions">
      <v-btn
        v-if="showRegenerateButton"
        size="x-small"
        color="primary"
        icon
        @click.stop="regenerateAvatar"
        :loading="regenerating"
        class="action-btn"
      >
        <v-icon size="16">mdi-refresh</v-icon>
      </v-btn>
      
      <v-btn
        v-if="showDownloadButton"
        size="x-small"
        color="success"
        icon
        @click.stop="downloadAvatar"
        class="action-btn"
      >
        <v-icon size="16">mdi-download</v-icon>
      </v-btn>
      
      <v-btn
        v-if="showVariationsButton"
        size="x-small"
        color="orange"
        icon
        @click.stop="showVariations = !showVariations"
        class="action-btn"
      >
        <v-icon size="16">mdi-palette</v-icon>
      </v-btn>
    </div>

    <!-- Variations Panel -->
    <v-expand-transition>
      <div v-if="showVariations" class="variations-panel">
        <div class="variations-grid">
          <v-avatar
            v-for="(variation, index) in variations"
            :key="index"
            size="40"
            class="variation-avatar"
            @click="selectVariation(index)"
          >
            <img :src="variation" :alt="`Variação ${index + 1}`" />
          </v-avatar>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { AvataaarsOnePieceSystem } from '@/utils/avataaarsSystem'
import { AvataaarsCache } from '@/utils/avataaarsCache'
import { PowerCalculationSystem } from '@/utils/powerCalculationSystem'
import type { Character } from '@/utils/database'

interface Props {
  character: Character
  size?: string | number
  variant?: 'circle' | 'rounded' | 'square'
  showActions?: boolean
  showRegenerateButton?: boolean
  showDownloadButton?: boolean
  showVariationsButton?: boolean
  showStatusIndicators?: boolean
  showLevel?: boolean
  showPowerRank?: boolean
  cacheEnabled?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'large',
  variant: 'circle',
  showActions: false,
  showRegenerateButton: false,
  showDownloadButton: false,
  showVariationsButton: false,
  showStatusIndicators: false,
  showLevel: false,
  showPowerRank: false,
  cacheEnabled: true,
  clickable: true
})

const emit = defineEmits<{
  'avatar-loaded': [url: string]
  'avatar-error': [error: Error]
  'avatar-regenerated': [url: string]
  'avatar-clicked': [character: Character]
}>()

// Estado reativo
const loading = ref(true)
const regenerating = ref(false)
const avatarUrl = ref<string>('')
const showVariations = ref(false)
const variations = ref<string[]>([])
const currentVariation = ref(0)

// Computed
const containerClasses = computed(() => ({
  'avataaars-clickable': props.clickable,
  'avataaars-with-actions': props.showActions
}))

const avatarClasses = computed(() => ({
  'avataaars-avatar': true,
  [`avataaars-${props.variant}`]: true,
  'avataaars-loading': loading.value
}))

const fallbackIconSize = computed(() => {
  const sizeMap: Record<string, number> = {
    'x-small': 16,
    'small': 20,
    'default': 24,
    'large': 32,
    'x-large': 40
  }
  return sizeMap[props.size as string] || 24
})

// Métodos
const loadAvatar = async () => {
  try {
    loading.value = true
    
    // Tentar buscar do cache primeiro
    if (props.cacheEnabled) {
      const cachedUrl = await AvataaarsCache.getFromCache(props.character.id!, currentVariation.value)
      if (cachedUrl) {
        avatarUrl.value = cachedUrl
        loading.value = false
        emit('avatar-loaded', cachedUrl)
        return
      }
    }

    // Gerar novo avatar
    const config = AvataaarsOnePieceSystem.generateConfig(props.character)
    const newUrl = AvataaarsOnePieceSystem.generateAvatarUrl(config)
    
    // Salvar no cache
    if (props.cacheEnabled) {
      await AvataaarsCache.saveToCache(props.character.id!, newUrl, config, currentVariation.value)
    }

    avatarUrl.value = newUrl
    emit('avatar-loaded', newUrl)

  } catch (error) {
    console.error('❌ Erro ao carregar avatar:', error)
    emit('avatar-error', error as Error)
  } finally {
    loading.value = false
  }
}

const regenerateAvatar = async () => {
  try {
    regenerating.value = true
    currentVariation.value++
    
    const newUrl = AvataaarsOnePieceSystem.generateVariation(props.character, currentVariation.value)
    
    if (props.cacheEnabled) {
      const config = AvataaarsOnePieceSystem.generateConfig(props.character)
      await AvataaarsCache.saveToCache(props.character.id!, newUrl, config, currentVariation.value)
    }

    avatarUrl.value = newUrl
    emit('avatar-regenerated', newUrl)

  } catch (error) {
    console.error('❌ Erro ao regenerar avatar:', error)
    emit('avatar-error', error as Error)
  } finally {
    regenerating.value = false
  }
}

const loadVariations = async () => {
  try {
    const variationUrls: string[] = []
    
    for (let i = 1; i <= 5; i++) {
      const variationUrl = AvataaarsOnePieceSystem.generateVariation(props.character, i)
      variationUrls.push(variationUrl)
    }
    
    variations.value = variationUrls
  } catch (error) {
    console.error('❌ Erro ao carregar variações:', error)
  }
}

const selectVariation = async (index: number) => {
  try {
    currentVariation.value = index + 1
    await loadAvatar()
    showVariations.value = false
  } catch (error) {
    console.error('❌ Erro ao selecionar variação:', error)
  }
}

const downloadAvatar = () => {
  if (avatarUrl.value) {
    const link = document.createElement('a')
    link.href = avatarUrl.value
    link.download = `avatar-${props.character.name}.svg`
    link.click()
  }
}

const handleClick = () => {
  if (props.clickable) {
    emit('avatar-clicked', props.character)
  }
}

const handleImageLoad = () => {
  loading.value = false
}

const handleImageError = () => {
  loading.value = false
  console.warn('⚠️ Erro ao carregar imagem do avatar')
}

const getFallbackIcon = () => {
  const iconMap: Record<string, string> = {
    'Pirate': 'mdi-skull',
    'Marine': 'mdi-anchor',
    'Government': 'mdi-account-tie',
    'BountyHunter': 'mdi-target',
    'Civillian': 'mdi-account'
  }
  return iconMap[props.character.type] || 'mdi-account'
}

const getPowerRank = () => {
  const power = PowerCalculationSystem.calculatePower(props.character)
  return PowerCalculationSystem.getPowerRank(power)
}

const getPowerRankColor = () => {
  const rank = getPowerRank()
  const colorMap: Record<string, string> = {
    'S': 'red',
    'A': 'orange',
    'B': 'yellow',
    'C': 'green',
    'D': 'blue'
  }
  return colorMap[rank] || 'grey'
}

// Watchers
watch(() => props.character.id, () => {
  loadAvatar()
}, { immediate: true })

// Lifecycle
onMounted(() => {
  if (props.showVariationsButton) {
    loadVariations()
  }
})
</script>

<style scoped>
.avataaars-avatar-container {
  position: relative;
  display: inline-block;
}

.avataaars-clickable {
  cursor: pointer;
}

.avataaars-avatar {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.avataaars-circle {
  border-radius: 50%;
}

.avataaars-rounded {
  border-radius: 12px;
}

.avataaars-square {
  border-radius: 4px;
}

.avataaars-avatar:hover {
  transform: scale(1.05);
  border-color: rgba(25, 118, 210, 0.5);
}

.avataaars-loading {
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.status-indicators {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-indicator,
.power-indicator {
  font-size: 10px !important;
  height: 18px !important;
  min-width: 18px !important;
}

.avatar-actions {
  position: absolute;
  bottom: -8px;
  right: -8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avataaars-with-actions:hover .avatar-actions {
  opacity: 1;
}

.action-btn {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
}

.variations-panel {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10;
  margin-top: 8px;
}

.variations-grid {
  display: flex;
  gap: 8px;
}

.variation-avatar {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.variation-avatar:hover {
  border-color: rgba(25, 118, 210, 0.5);
  transform: scale(1.1);
}

/* Animações temáticas */
@keyframes pirateGlow {
  0%, 100% { box-shadow: 0 0 5px rgba(244, 67, 54, 0.5); }
  50% { box-shadow: 0 0 20px rgba(244, 67, 54, 0.8); }
}

@keyframes marineGlow {
  0%, 100% { box-shadow: 0 0 5px rgba(25, 118, 210, 0.5); }
  50% { box-shadow: 0 0 20px rgba(25, 118, 210, 0.8); }
}

.avataaars-avatar[data-type="Pirate"]:hover {
  animation: pirateGlow 2s infinite;
}

.avataaars-avatar[data-type="Marine"]:hover {
  animation: marineGlow 2s infinite;
}
</style>