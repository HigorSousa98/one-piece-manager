<!-- src/components/CharacterAvatar.vue -->
<template>
  <div class="character-avatar-container" :class="containerClasses">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { AvataaarsOnePieceSystem } from '@/utils/avataaarsSystem'
import { AvataaarsCache } from '@/utils/avataaarsCache'
import { GameLogic } from '@/utils/gameLogic'
import type { Character } from '@/utils/database'

interface Props {
  character: Character
  size?: string | number
  variant?: 'circle' | 'rounded' | 'square'
  showActions?: boolean
  showRegenerateButton?: boolean
  showDownloadButton?: boolean
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
const currentVariation = ref(0)

// Computed
const containerClasses = computed(() => ({
  'avatar-clickable': props.clickable,
  'avatar-with-actions': props.showActions,
  [`avatar-${props.character.type.toLowerCase()}`]: true
}))

const avatarClasses = computed(() => ({
  'character-avatar': true,
  [`avatar-${props.variant}`]: true,
  'avatar-loading': loading.value
}))

const fallbackIconSize = computed(() => {
  const sizeMap: Record<string, number> = {
    'x-small': 16,
    'small': 20,
    'default': 24,
    'large': 32,
    'x-large': 40,
    'xl': 48
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
    const newUrl = currentVariation.value === 0 
      ? AvataaarsOnePieceSystem.generateAvatar(props.character)
      : AvataaarsOnePieceSystem.generateVariation(props.character, currentVariation.value)
    
    // Salvar no cache
    if (props.cacheEnabled) {
      const config = AvataaarsOnePieceSystem.generateConfig(props.character)
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
  const power = GameLogic.calculatePower(props.character)
  if (power > 1000) return 'S'
  if (power > 750) return 'A'
  if (power > 500) return 'B'
  if (power > 250) return 'C'
  return 'D'
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
  currentVariation.value = 0
  loadAvatar()
}, { immediate: true })

watch(() => [props.character.level, props.character.kindness], () => {
  // Recarregar avatar se atributos mudaram
  loadAvatar()
})

// Lifecycle
onMounted(() => {
  loadAvatar()
})
</script>

<style scoped>
/* ── Grand Line Character Avatar ── */
.character-avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-clickable {
  cursor: pointer;
}

.character-avatar {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.avatar-circle  { border-radius: 50%; }
.avatar-rounded { border-radius: 12px; }
.avatar-square  { border-radius: 4px; }

.character-avatar:hover {
  transform: scale(1.05);
}

/* Themed borders aligned to Grand Line palette */
.avatar-pirate .character-avatar:hover {
  border-color: rgba(255, 107, 53, 0.7);
  box-shadow: 0 0 15px rgba(255, 107, 53, 0.45);
}

.avatar-marine .character-avatar:hover {
  border-color: rgba(0, 48, 135, 0.7);
  box-shadow: 0 0 15px rgba(0, 48, 135, 0.45);
}

.avatar-government .character-avatar:hover {
  border-color: rgba(212, 175, 55, 0.7);
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.45);
}

.avatar-bountyhunter .character-avatar:hover {
  border-color: rgba(0, 137, 123, 0.7);
  box-shadow: 0 0 15px rgba(0, 137, 123, 0.45);
}

.avatar-civillian .character-avatar:hover {
  border-color: rgba(84, 110, 122, 0.7);
  box-shadow: 0 0 15px rgba(84, 110, 122, 0.45);
}

.avatar-loading {
  background: linear-gradient(45deg, #132235, #0d1b2e);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.avatar-with-actions:hover .avatar-actions {
  opacity: 1;
}

.action-btn {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
}
</style>