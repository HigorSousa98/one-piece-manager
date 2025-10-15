<template>
  <div class="wanted-poster-container" :class="containerClasses">
    <!-- Poster -->
    <div class="wanted-poster" :style="posterStyle" ref="posterRef">
      
      <!-- Background Image -->
      <img 
        src="/wanted-poster-bg.png" 
        alt="Wanted Poster Background"
        class="poster-background"
        @load="onBackgroundLoad"
        @error="onBackgroundError"
      />

      <!-- Content Overlay -->
      <div class="poster-overlay">
        
        <!-- Character Photo -->
        <div class="photo-area" :style="photoAreaStyle">
          <AvataaarsAvatar
            :character="character"
            :size="avatarSize"
            variant="square"
            :show-actions="false"
            :show-status-indicators="false"
            :clickable="false"
            class="character-photo"
          />
        </div>

        <!-- Character Name -->
        <div class="name-area">
          <h2 class="character-name">{{ character.name.toUpperCase() }}</h2>
        </div>

        <!-- Bounty Amount -->
        <div class="bounty-area">
          <div class="bounty-amount">{{ formatBounty(character.bounty || 0) }}</div>
        </div>

      </div>

      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <v-progress-circular indeterminate color="brown" size="32" />
      </div>

    </div>

    <!-- Action Buttons -->
    <div v-if="showActions" class="poster-actions">
      <v-btn
        color="brown"
        variant="elevated"
        prepend-icon="mdi-download"
        @click="downloadPoster"
        :loading="downloading"
        :disabled="!htmlToImageReady"
        class="action-btn"
      >
        {{ htmlToImageReady ? 'Download' : 'Carregando...' }}
      </v-btn>
      
      <v-btn
        color="orange"
        variant="elevated"
        prepend-icon="mdi-share"
        @click="sharePoster"
        :disabled="!htmlToImageReady"
        class="action-btn"
      >
        Compartilhar
      </v-btn>
    </div>

    <!-- Size Controls -->
    <div v-if="showSizeControls" class="size-controls">
      <v-btn-toggle v-model="selectedSize" mandatory color="brown">
        <v-btn value="small" size="small">Pequeno</v-btn>
        <v-btn value="medium" size="small">Médio</v-btn>
        <v-btn value="large" size="small">Grande</v-btn>
        <v-btn value="xl" size="small">Extra Grande</v-btn>
      </v-btn-toggle>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import AvataaarsAvatar from '@/components/AvataaarsAvatar.vue'
import type { Character } from '@/utils/database'

// ✅ IMPORTAÇÃO MAIS SEGURA
const htmlToImageReady = ref(false)
let htmlToImage: any = null

// Props
interface Props {
  character: Character
  size?: 'small' | 'medium' | 'large' | 'xl'
  showActions?: boolean
  showSizeControls?: boolean
  customBounty?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showActions: false,
  showSizeControls: false,
  customBounty: undefined
})

// Emits
const emit = defineEmits<{
  'poster-ready': [element: HTMLElement]
  'download-complete': [success: boolean]
  'share-complete': [success: boolean]
}>()

// State
const loading = ref(true)
const downloading = ref(false)
const selectedSize = ref(props.size)
const posterRef = ref<HTMLElement>()

// Computed
const containerClasses = computed(() => ({
  [`wanted-poster-${selectedSize.value}`]: true,
  'with-actions': props.showActions
}))

const posterStyle = computed(() => {
  const sizes = {
    small: { width: '300px', height: '424px' },
    medium: { width: '400px', height: '566px' },
    large: { width: '500px', height: '707px' },
    xl: { width: '600px', height: '848px' }
  }
  
  const size = sizes[selectedSize.value]
  return {
    width: size.width,
    height: size.height
  }
})

// ✅ TAMANHO DO AVATAR DINÂMICO
const avatarSize = computed(() => {
  const sizeMap = {
    small: 180,    // Aumentado de 120
    medium: 240,   // Aumentado de 160
    large: 300,    // Aumentado de 200
    xl: 360        // Aumentado de 240
  }
  return sizeMap[selectedSize.value]
})

// ✅ ESTILO DA ÁREA DA FOTO DINÂMICO
const photoAreaStyle = computed(() => {
  const sizeMap = {
    small: { width: '180px', height: '180px' },
    medium: { width: '240px', height: '240px' },
    large: { width: '300px', height: '300px' },
    xl: { width: '360px', height: '360px' }
  }
  
  const size = sizeMap[selectedSize.value]
  return {
    width: size.width,
    height: size.height
  }
})

// ✅ FUNÇÃO PARA CARREGAR HTML-TO-IMAGE
const loadHtmlToImage = async () => {
  try {
    console.log('🔄 Tentando carregar html-to-image...')
    
    // Método 1: Import dinâmico
    try {
      htmlToImage = await import('html-to-image')
      console.log('✅ html-to-image carregado via import dinâmico')
      htmlToImageReady.value = true
      return
    } catch (error) {
      console.log('⚠️ Import dinâmico falhou, tentando require...')
    }
    
    // Método 2: Require (fallback)
    try {
      // @ts-ignore
      htmlToImage = require('html-to-image')
      console.log('✅ html-to-image carregado via require')
      htmlToImageReady.value = true
      return
    } catch (error) {
      console.log('⚠️ Require falhou, tentando window...')
    }
    
    // Método 3: Verificar se está no window (fallback)
    // @ts-ignore
    if (window.htmlToImage) {
      // @ts-ignore
      htmlToImage = window.htmlToImage
      console.log('✅ html-to-image encontrado no window')
      htmlToImageReady.value = true
      return
    }
    
    console.error('❌ html-to-image não pôde ser carregado')
    
  } catch (error) {
    console.error('❌ Erro ao carregar html-to-image:', error)
  }
}

// Methods
const formatBounty = (bounty: number): string => {
  if (props.customBounty !== undefined) {
    bounty = props.customBounty
  }
  return bounty.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

const onBackgroundLoad = () => {
  loading.value = false
  if (posterRef.value) {
    emit('poster-ready', posterRef.value)
  }
}

const onBackgroundError = () => {
  console.error('Failed to load wanted poster background')
  loading.value = false
}

const downloadPoster = async () => {
  if (!posterRef.value || !htmlToImage) {
    console.error('❌ html-to-image não está disponível')
    return
  }
  
  try {
    downloading.value = true
    
    const dataUrl = await htmlToImage.toPng(posterRef.value, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: 'transparent',
      useCORS: true
    })
    
    const link = document.createElement('a')
    link.download = `wanted-${props.character.name.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = dataUrl
    link.click()
    
    emit('download-complete', true)
    
  } catch (error) {
    console.error('❌ Erro no download:', error)
    emit('download-complete', false)
  } finally {
    downloading.value = false
  }
}

const sharePoster = async () => {
  if (!posterRef.value || !htmlToImage) {
    console.error('❌ html-to-image não está disponível')
    return
  }
  
  try {
    const dataUrl = await htmlToImage.toPng(posterRef.value, {
      quality: 0.8,
      pixelRatio: 1
    })
    
    if (navigator.share) {
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const file = new File([blob], `wanted-${props.character.name}.png`, { type: 'image/png' })
      
      await navigator.share({
        title: `Wanted: ${props.character.name}`,
        text: `Bounty: ${formatBounty(props.character.bounty || 0)} Berry`,
        files: [file]
      })
      
      emit('share-complete', true)
    } else {
      await navigator.clipboard.writeText(`Wanted: ${props.character.name} - Bounty: ${formatBounty(props.character.bounty || 0)} Berry`)
      emit('share-complete', true)
    }
    
  } catch (error) {
    console.error('❌ Erro no compartilhamento:', error)
    emit('share-complete', false)
  }
}

// Watchers
watch(() => props.size, (newSize) => {
  selectedSize.value = newSize
})

// Lifecycle
onMounted(async () => {
  await loadHtmlToImage()
})
</script>

<style scoped>
.wanted-poster-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.wanted-poster {
  position: relative;
  border-radius: 8px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transform: rotate(-1deg);
  transition: all 0.3s ease;
}

.wanted-poster:hover {
  transform: rotate(0deg) scale(1.02);
  box-shadow: 
    0 12px 48px rgba(0, 0, 0, 0.4),
    0 6px 24px rgba(0, 0, 0, 0.3);
}

.poster-background {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.poster-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/* ✅ ÁREA DA FOTO COM TAMANHO DINÂMICO */
.photo-area {
  position: absolute;
  top: 28%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  /* Tamanho será definido dinamicamente via :style */
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* ✅ AVATAR COM TAMANHO COMPLETO DO CONTAINER */
.character-photo {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* ✅ FORÇAR O COMPONENTE AVATAAARS A USAR O TAMANHO COMPLETO */
.character-photo :deep(.avataaars-avatar) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 8px;
}

.character-photo :deep(.avataaars-avatar svg) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 8px;
}

.character-photo :deep(.avataaars-avatar img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  border-radius: 8px;
}

/* ✅ AJUSTES ESPECÍFICOS POR TAMANHO */
.wanted-poster-small .photo-area {
  top: 21%;
}

.wanted-poster-medium .photo-area {
  top: 21%;
}

.wanted-poster-large .photo-area {
  top: 21%;
}

.wanted-poster-xl .photo-area {
  top: 21%;
}

.name-area {
  position: absolute;
  top: 75%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 2;
  width: 80%;
}

/* ✅ AJUSTES DO NOME POR TAMANHO */
.wanted-poster-small .name-area {
  top: 74%;
}

.wanted-poster-medium .name-area {
  top: 74%;
}

.wanted-poster-large .name-area {
  top: 74%;
}

.wanted-poster-xl .name-area {
  top: 74%;
}

.character-name {
  font-family: 'Open Sans', sans-serif;
  font-weight: bold;
  color: #4a381f;
  margin: 0;
  letter-spacing: 1px;
  line-height: 1.1;
}

/* ✅ TAMANHOS DE FONTE DINÂMICOS PARA O NOME */
.wanted-poster-small .character-name {
  font-size: clamp(12px, 3vw, 18px);
}

.wanted-poster-medium .character-name {
  font-size: clamp(16px, 4vw, 24px);
}

.wanted-poster-large .character-name {
  font-size: clamp(20px, 5vw, 30px);
}

.wanted-poster-xl .character-name {
  font-size: clamp(24px, 6vw, 36px);
}

.bounty-area {
  position: absolute;
  top: 82.5%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 2;
}

/* ✅ AJUSTES DA BOUNTY POR TAMANHO */
.wanted-poster-small .bounty-area {
  top: 82.5%;
}

.wanted-poster-medium .bounty-area {
  top: 82.5%;
}

.wanted-poster-large .bounty-area {
  top: 82.5%;
}

.wanted-poster-xl .bounty-area {
  top: 82.5%;
}

.bounty-amount {
  font-family: 'Pirata One', cursive;
  font-weight: bold;
  color: #4a381f;
  letter-spacing: 2px;
}

/* ✅ TAMANHOS DE FONTE DINÂMICOS PARA A BOUNTY */
.wanted-poster-small .bounty-amount {
  font-size: clamp(14px, 4vw, 20px);
}

.wanted-poster-medium .bounty-amount {
  font-size: clamp(18px, 5vw, 28px);
}

.wanted-poster-large .bounty-amount {
  font-size: clamp(22px, 6vw, 34px);
}

.wanted-poster-xl .bounty-amount {
  font-size: clamp(26px, 7vw, 40px);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(244, 228, 188, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.poster-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-btn {
  font-weight: 600;
  border-radius: 8px;
}

.size-controls {
  display: flex;
  justify-content: center;
}

/* ✅ EFEITOS DE HOVER MELHORADOS */
.photo-area:hover {
  transform: translateX(-50%) scale(1.05);
}

.wanted-poster:hover .photo-area {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

@import url('https://fonts.googleapis.com/css2?family=Creepster&family=Pirata+One&family=Open+Sans:wght@300;400;500;600;700&display=swap');

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50% { transform: translateY(-5px) rotate(1deg); }
}

.wanted-poster:hover {
  animation: float 3s ease-in-out infinite;
}

/* ✅ RESPONSIVIDADE PARA MOBILE */
@media (max-width: 768px) {
  .photo-area {
    top: 32% !important;
  }
  
  .name-area {
    top: 78% !important;
  }
  
  .bounty-area {
    top: 85% !important;
  }
}
</style>