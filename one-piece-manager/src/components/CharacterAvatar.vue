<!-- src/components/CharacterAvatar.vue -->
<template>
  <div 
    class="character-avatar" 
    :class="{ 
      loading: isLoading, 
      error: hasError,
      [`size-${sizeClass}`]: true,
      [`variant-${variant}`]: true 
    }"
    :style="containerStyle"
  >
    
    <!-- LOADING STATE -->
    <div v-if="isLoading" class="avatar-loading">
      <v-progress-circular 
        :indeterminate="!generationProgress"
        :model-value="generationProgress"
        :size="loadingSize" 
        :width="3"
        color="primary"
      >
        <span v-if="generationProgress" class="text-caption">
          {{ Math.round(generationProgress) }}%
        </span>
      </v-progress-circular>
      <div class="loading-text text-caption mt-2">
        {{ loadingMessage }}
      </div>
    </div>
    
    <!-- AVATAR CONTENT -->
    <div 
      v-else-if="avatarSvg && !hasError" 
      class="avatar-container"
      :style="avatarStyle"
      v-html="avatarSvg"
      @click="handleClick"
    ></div>
    
    <!-- ERROR/FALLBACK STATE -->
    <div v-else class="avatar-fallback" :style="avatarStyle">
      <v-icon 
        :size="fallbackIconSize" 
        :color="hasError ? 'error' : 'grey'"
      >
        {{ hasError ? 'mdi-alert-circle' : 'mdi-account' }}
      </v-icon>
      <div v-if="hasError" class="error-text text-caption mt-1">
        Erro ao carregar
      </div>
    </div>
    
    <!-- OVERLAY ACTIONS -->
    <div v-if="showActions && !isLoading" class="avatar-actions">
      
      <!-- REGENERATE BUTTON -->
      <v-btn 
        v-if="showRegenerateButton"
        icon
        size="x-small"
        color="primary"
        variant="elevated"
        class="action-btn regenerate-btn"
        @click.stop="regenerateAvatar"
        :loading="isRegenerating"
        v-tooltip="'Regenerar Avatar'"
      >
        <v-icon size="small">mdi-refresh</v-icon>
      </v-btn>
      
      <!-- DOWNLOAD BUTTON -->
      <v-btn 
        v-if="showDownloadButton"
        icon
        size="x-small"
        color="secondary"
        variant="elevated"
        class="action-btn download-btn"
        @click.stop="showDownloadMenu = true"
        v-tooltip="'Download Avatar'"
      >
        <v-icon size="small">mdi-download</v-icon>
      </v-btn>
      
      <!-- CUSTOMIZE BUTTON -->
      <v-btn 
        v-if="showCustomizeButton"
        icon
        size="x-small"
        color="accent"
        variant="elevated"
        class="action-btn customize-btn"
        @click.stop="openCustomization"
        v-tooltip="'Personalizar'"
      >
        <v-icon size="small">mdi-palette</v-icon>
      </v-btn>
      
    </div>
    
    <!-- STATUS INDICATORS -->
    <div v-if="showStatusIndicators" class="status-indicators">
      
      <!-- LEVEL INDICATOR -->
      <v-chip 
        v-if="showLevel"
        size="x-small"
        :color="getLevelColor(character.level)"
        variant="elevated"
        class="status-chip level-chip"
      >
        Lv.{{ character.level }}
      </v-chip>
      
    </div>
    
    <!-- CHARACTER NAME -->
    <div 
      v-if="showName" 
      class="character-name text-caption"
      :class="{ 'name-bottom': namePosition === 'bottom', 'name-overlay': namePosition === 'overlay' }"
    >
      {{ character.name }}
    </div>
    
  </div>
  
  <!-- DOWNLOAD MENU -->
  <v-menu 
    v-model="showDownloadMenu" 
    :activator="downloadMenuActivator"
    location="bottom"
  >
    <v-list density="compact">
      <v-list-item @click="downloadAvatar('png')">
        <v-list-item-title>
          <v-icon start size="small">mdi-file-image</v-icon>
          PNG
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="downloadAvatar('svg')">
        <v-list-item-title>
          <v-icon start size="small">mdi-vector-square</v-icon>
          SVG
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
  
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { AvatarGenerationSystem } from '@/utils/avatarGenerationSystem'
import { AvatarCacheSystem } from '@/utils/avatarCacheSystem'
import { AvatarUtils } from '@/utils/avatarUtils'
import { PowerCalculationSystem } from '@/utils/powerCalculationSystem'
import type { Character } from '@/utils/database'

// ✅ PROPS
interface Props {
  character: Character
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'rounded' | 'square' | 'circle'
  showActions?: boolean
  showRegenerateButton?: boolean
  showDownloadButton?: boolean
  showCustomizeButton?: boolean
  showStatusIndicators?: boolean
  showLevel?: boolean
  showPowerRank?: boolean
  showName?: boolean
  namePosition?: 'bottom' | 'overlay'
  clickable?: boolean
  lazy?: boolean
  cacheEnabled?: boolean
  autoRegenerate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  showActions: false,
  showRegenerateButton: false,
  showDownloadButton: false,
  showCustomizeButton: false,
  showStatusIndicators: false,
  showLevel: false,
  showPowerRank: false,
  showName: false,
  namePosition: 'bottom',
  clickable: false,
  lazy: false,
  cacheEnabled: true,
  autoRegenerate: false
})

// ✅ EMITS
const emit = defineEmits<{
  avatarGenerated: [svgData: string]
  avatarRegenerated: [svgData: string]
  avatarClicked: [character: Character]
  avatarError: [error: Error]
  customizationRequested: [character: Character]
}>()

// ✅ REACTIVE STATE
const isLoading = ref(true)
const isRegenerating = ref(false)
const hasError = ref(false)
const avatarSvg = ref<string | null>(null)
const generationProgress = ref(0)
const loadingMessage = ref('Carregando avatar...')
const showDownloadMenu = ref(false)
const downloadMenuActivator = ref()
const powerRank = ref<string | null>(null)

// ✅ COMPUTED PROPERTIES
const sizeClass = computed(() => {
  if (typeof props.size === 'number') return 'custom'
  return props.size
})

const actualSize = computed(() => {
  if (typeof props.size === 'number') return props.size
  
  const sizeMap = {
    xs: 40,
    sm: 60,
    md: 100,
    lg: 150,
    xl: 200
  }
  
  return sizeMap[props.size] || 100
})

const containerStyle = computed(() => ({
  width: `${actualSize.value}px`,
  height: `${actualSize.value}px`
}))

const avatarStyle = computed(() => ({
  width: '100%',
  height: '100%',
  borderRadius: getVariantBorderRadius()
}))

const loadingSize = computed(() => Math.min(40, actualSize.value * 0.4))
const fallbackIconSize = computed(() => actualSize.value * 0.6)

// ✅ METHODS
const getVariantBorderRadius = (): string => {
  switch (props.variant) {
    case 'circle': return '50%'
    case 'rounded': return '12px'
    case 'square': return '0'
    default: return '8px'
  }
}

const getLevelColor = (level: number): string => {
  if (level >= 50) return 'purple'
  if (level >= 30) return 'blue'
  if (level >= 15) return 'green'
  return 'grey'
}

const getPowerRankColor = (rank: string): string => {
  const colorMap: Record<string, string> = {
    'Yonko': 'deep-purple',
    'Admiral': 'red',
    'Warlord': 'orange',
    'Supernova': 'blue',
    'Veteran': 'green',
    'Experienced': 'teal',
    'Rookie': 'grey',
    'Beginner': 'blue-grey'
  }
  return colorMap[rank] || 'grey'
}

const loadAvatar = async (forceRegenerate: boolean = false) => {
  try {
    isLoading.value = true
    hasError.value = false
    generationProgress.value = 0
    loadingMessage.value = 'Carregando avatar...'
    
    let svgData: string | null = null
    
    if (!forceRegenerate && props.cacheEnabled) {
      // Tentar buscar do cache primeiro
      loadingMessage.value = 'Verificando cache...'
      svgData = await AvatarCacheSystem.getFromCache(props.character.id!)
      generationProgress.value = 25
    }
    
    if (!svgData) {
      // Buscar do banco de dados
      loadingMessage.value = 'Buscando avatar...'
      svgData = await AvatarGenerationSystem.getAvatarByCharacterId(props.character.id!)
      generationProgress.value = 50
      
      if (!svgData || forceRegenerate) {
        // Gerar novo avatar
        loadingMessage.value = 'Gerando avatar...'
        generationProgress.value = 60
        
        const generatedAvatar = await AvatarGenerationSystem.generateAvatar(props.character)
        svgData = generatedAvatar.svgData
        generationProgress.value = 90
        
        emit('avatarGenerated', svgData)
      }
      
      // Adicionar ao cache
      if (props.cacheEnabled && svgData) {
        await AvatarCacheSystem.addToCache(props.character.id!, svgData)
      }
    }
    
    avatarSvg.value = svgData
    generationProgress.value = 100
    
    // Calcular power rank se necessário
    if (props.showPowerRank) {
      const power = PowerCalculationSystem.calculatePower(props.character)
      powerRank.value = PowerCalculationSystem.getPowerRank(power)
    }
    
  } catch (error) {
    console.error('❌ Erro ao carregar avatar:', error)
    hasError.value = true
    emit('avatarError', error as Error)
  } finally {
    // Delay para mostrar 100% antes de esconder loading
    await new Promise(resolve => setTimeout(resolve, 200))
    isLoading.value = false
    generationProgress.value = 0
  }
}

const regenerateAvatar = async () => {
  try {
    isRegenerating.value = true
    
    // Limpar cache
    if (props.cacheEnabled) {
      AvatarCacheSystem.removeFromCache(props.character.id!)
    }
    
    const newAvatar = await AvatarGenerationSystem.regenerateAvatar(props.character.id!)
    
    if (newAvatar) {
      avatarSvg.value = newAvatar.svgData
      
      // Adicionar ao cache
      if (props.cacheEnabled) {
        await AvatarCacheSystem.addToCache(props.character.id!, newAvatar.svgData)
      }
      
      emit('avatarRegenerated', newAvatar.svgData)
    }
    
  } catch (error) {
    console.error('❌ Erro ao regenerar avatar:', error)
    hasError.value = true
  } finally {
    isRegenerating.value = false
  }
}

const downloadAvatar = async (format: 'png' | 'svg') => {
  try {
    showDownloadMenu.value = false
    await AvatarUtils.downloadAvatar(props.character.id!, format)
  } catch (error) {
    console.error('❌ Erro ao fazer download:', error)
  }
}

const openCustomization = () => {
  emit('customizationRequested', props.character)
}

const handleClick = () => {
  if (props.clickable) {
    emit('avatarClicked', props.character)
  }
}

// ✅ WATCHERS
watch(() => props.character.id, async () => {
  if (props.character.id) {
    await loadAvatar()
  }
})

watch(() => props.character.level, async (newLevel, oldLevel) => {
  if (props.autoRegenerate && newLevel && oldLevel && newLevel > oldLevel) {
    // Auto-regenerar a cada 10 levels
    if (newLevel % 10 === 0) {
      await regenerateAvatar()
    }
  }
})

// ✅ LIFECYCLE
onMounted(async () => {
  if (props.character.id) {
    if (props.lazy) {
      // Lazy loading - aguardar próximo tick
      await nextTick()
    }
    await loadAvatar()
  }
})
</script>

<style scoped>
.character-avatar {
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
}

.character-avatar.clickable {
  cursor: pointer;
}

.character-avatar.clickable:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* SIZE VARIANTS */
.character-avatar.size-xs {
  --avatar-size: 40px;
}

.character-avatar.size-sm {
  --avatar-size: 60px;
}

.character-avatar.size-md {
  --avatar-size: 100px;
}

.character-avatar.size-lg {
  --avatar-size: 150px;
}

.character-avatar.size-xl {
  --avatar-size: 200px;
}

/* AVATAR CONTAINER */
.avatar-container {
  border: 2px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: white;
  transition: all 0.3s ease;
  position: relative;
}

.avatar-container:hover {
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-container :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

/* FALLBACK */
.avatar-fallback {
  border: 2px solid #ddd;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.error-text {
  color: #f44336;
  text-align: center;
  margin-top: 4px;
}

/* LOADING */
.avatar-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
}

.loading-text {
  margin-top: 8px;
  text-align: center;
  color: #666;
}

/* ACTIONS */
.avatar-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.character-avatar:hover .avatar-actions {
  opacity: 1;
}

.action-btn {
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

/* STATUS INDICATORS */
.status-indicators {
  position: absolute;
  bottom: 4px;
  left: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-chip {
  backdrop-filter: blur(4px);
  font-size: 0.7rem !important;
  height: 20px !important;
}

/* CHARACTER NAME */
.character-name {
  font-weight: 500;
  text-align: center;
}

.character-name.name-bottom {
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 4px;
  border-radius: 4px;
}

.character-name.name-overlay {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

/* LOADING STATE */
.character-avatar.loading {
  opacity: 0.8;
}

/* ERROR STATE */
.character-avatar.error .avatar-fallback {
  border-color: #f44336;
  background: #ffebee;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .avatar-actions {
    opacity: 1; /* Sempre visível em mobile */
  }
  
  .action-btn {
    transform: scale(0.9);
  }
  
  .status-indicators {
    transform: scale(0.9);
  }
}

/* ANIMATIONS */
@keyframes avatarPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.character-avatar.loading .avatar-loading {
  animation: avatarPulse 2s ease-in-out infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.avatar-container {
  animation: fadeIn 0.5s ease-out;
}
</style>