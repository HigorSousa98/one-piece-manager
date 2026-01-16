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
          <h2 
            class="character-name"
            :style="getNameStyle(getCleanName(character.name.toUpperCase()))"
          >
            {{ getCleanName(character.name.toUpperCase())}}
          </h2>
        </div>

        <!-- Bounty Amount -->
        <div class="bounty-area">
          <div 
            class="bounty-amount"
            :style="getBountyStyle(formatBounty(character))"
          >
            {{ formatBounty(character) }}
          </div>
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

// ✅ CONFIGURAÇÕES DE LARGURA MÁXIMA POR TAMANHO
const maxWidthConfig = computed(() => {
  const configs = {
    small: { name: 240, bounty: 220 },    // 80% da largura do poster (300px)
    medium: { name: 320, bounty: 300 },   // 80% da largura do poster (400px)
    large: { name: 400, bounty: 380 },    // 80% da largura do poster (500px)
    xl: { name: 480, bounty: 460 }        // 80% da largura do poster (600px)
  }
  return configs[selectedSize.value]
})

// ✅ FUNÇÃO PARA CALCULAR ESTILO DO NOME
const getNameStyle = (name: string) => {
  const charCount = name.length
  const maxWidth = maxWidthConfig.value.name
  
  // Calcular letter-spacing baseado no comprimento
  // Fórmula: quanto maior o texto, menor o espaçamento
  const letterSpacing = (maxWidth / charCount) * 0.28

  
  // Calcular font-size baseado no comprimento
  // Fórmula: quanto maior o texto, menor a fonte
  const baseFontSize = (maxWidth / charCount) * 0.1

  const height = Number(posterStyle.value.height.replace('px', ''))

  const dynamicScaleY = (charCount / height / 0.085) * 13
  
  // Ajustes baseados em caracteres especiais
  let adjustedSpacing = letterSpacing
  let adjustedFontSize = baseFontSize
  let adjustedScaleY = dynamicScaleY
  


  // ✅ AJUSTE BASEADO NO NÚMERO DE LINHAS
  const estimatedLines = Math.ceil((charCount * adjustedFontSize * 0.6) / maxWidth)
  if (estimatedLines > 1) {
    adjustedScaleY /= (estimatedLines * 1.1) // Reduzir scaleY para múltiplas linhas
  }
  
  // Ajuste baseado no tamanho do poster
  const sizeMultipliers = {
    small: 0.7,
    medium: 1,
    large: 1.3,
    xl: 1.6
  }
  
  const sizeMultiplier = sizeMultipliers[selectedSize.value]
  // Garantir que o scaleY não seja menor que 1 nem maior que 3
  adjustedFontSize *= sizeMultiplier
  
  adjustedScaleY *= sizeMultiplier

  const dynamicLineHeight = 0

  
  return {
    fontSize: `${adjustedFontSize}rem`,
    letterSpacing: `${adjustedSpacing}px`,
    maxWidth: `${maxWidth}px`,
    // Manter o scaleY original
    transform:`scaleY(${adjustedScaleY})`,
    transformOrigin: 'center bottom',
    lineHeight: dynamicLineHeight, 
    display: 'inline-block',
    wordBreak: 'break-word',
    hyphens: 'auto',
    whiteSpace: 'nowrap'   
  }
}

// ✅ FUNÇÃO PARA CALCULAR ESTILO DA BOUNTY
const getBountyStyle = (bountyText: string) => {
  const charCount = bountyText.length
  const maxWidth = maxWidthConfig.value.bounty
  
  // Calcular letter-spacing para bounty
  const letterSpacing = Math.max(
    0.5,  // Mínimo
    Math.min(
      12,   // Máximo
      (maxWidth / charCount) * 0.35 - 1
    )
  )
  
  // Calcular font-size para bounty
  const baseFontSize = Math.max(
    0.7,  // Mínimo
    Math.min(
      2.2,  // Máximo
      (maxWidth / charCount) * 0.15 + 0.5
    )
  )
  
  // Ajuste baseado no tamanho do poster
  const sizeMultipliers = {
    small: 0.7,
    medium: 1,
    large: 1.3,
    xl: 1.6
  }
  
  const sizeMultiplier = sizeMultipliers[selectedSize.value]
  const adjustedFontSize = baseFontSize * sizeMultiplier
  
  return {
    fontSize: `${adjustedFontSize}rem`,
    letterSpacing: `${letterSpacing}px`,
    maxWidth: `${maxWidth}px`,
    // Não alterar o transform se houver algum
    wordBreak: 'break-word'
  }
}

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

// ✅ FUNÇÃO PARA REMOVER ALCUNHA
const removeNickname = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string') {
    return fullName || ''
  }
  
  let cleanName = fullName
    .replace(/"[^"]*"/g, '')     // Remove "Alcunha"
    .replace(/'[^']*'/g, '')     // Remove 'Alcunha'
    .replace(/\([^)]*\)/g, '')   // Remove (Alcunha)
    .replace(/\[[^\]]*\]/g, '')  // Remove [Alcunha]
    .replace(/\s+/g, ' ')        // Remove espaços extras
    .trim()                      // Remove espaços nas bordas
  
  // Se ficou muito curto, retorna o original
  if (!cleanName || cleanName.length < 2) {
    return fullName
  }
  
  return cleanName
}

// ✅ FUNÇÃO PARA OBTER NOME LIMPO
const getCleanName = (fullName: string): string => {
  const originalName = fullName.toUpperCase()
  const cleanName = removeNickname(originalName)
  
  // Aplicar substring se necessário (limitação de 30 caracteres)
  const finalName = cleanName
  
  return finalName
}

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
const formatBounty = (character: Character): string => {
    var bounty
    if (props.customBounty !== undefined) {
        bounty = props.customBounty.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + ' - '
    }
    else if(character.type == 'Pirate' || character.type == 'BountyHunter'){
        bounty = character.bounty.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + ' - '
    }
    else if(character.type == 'Marine'){
        bounty = formatMarineRank(character.bounty)
    }
    else{
        bounty = formatGovernmentRank(character.bounty)
    }
  
  return bounty;
}

// ✅ FORMATAÇÃO PARA MARINES (ESTRELAS)
const formatMarineRank = (bounty: number): string => {
  if (bounty === 0) return 'Recruta'
  
  // Dividir por 100 milhões para ter escala de 0-5 estrelas
  const starValue = bounty / 100000000
  
  // Limitar entre 0 e 5
  const clampedValue = Math.min(Math.max(starValue, 0), 5)
  
  // Arredondar para 0.5
  const roundedValue = Math.round(clampedValue * 2) / 2
  
  return formatStars(roundedValue)
}

const formatStars = (value: number): string => {
  if (value === 0) return 'Recruta'
  if (value <= 0.5) return '★'
  if (value <= 1) return '★'
  if (value <= 1.5) return '★*'
  if (value <= 2) return '★★'
  if (value <= 2.5) return '★★*'
  if (value <= 3) return '★★★'
  if (value <= 3.5) return '★★★*'
  if (value <= 4) return '★★★★'
  if (value <= 4.5) return '★★★★*'
  if (value <= 5) return '★★★★★'
  return '★★★★★'
}

// ✅ FORMATAÇÃO PARA GOVERNO (HIERARQUIA)
const formatGovernmentRank = (bounty: number): string => {
  if (bounty === 0) return 'Agente'
  
  // Dividir por 100 milhões para ter escala similar
  const rankValue = bounty / 100000000
  
  // 5 níveis hierárquicos
  if (rankValue < 0.5) return 'Agente'
  if (rankValue < 1.5) return 'Oficial'
  if (rankValue < 2.5) return 'Comandante'
  if (rankValue < 4) return 'Diretor'
  return 'Alto Comando'
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
        text: `Bounty: ${formatBounty(props.character)} Berry`,
        files: [file]
      })
      
      emit('share-complete', true)
    } else {
      await navigator.clipboard.writeText(`Wanted: ${props.character.name} - Bounty: ${formatBounty(props.character)} Berry`)
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

/* ===== BASE STYLES (MOBILE FIRST) ===== */
.wanted-poster-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
}

.wanted-poster {
  position: relative;
  border-radius: 6px;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.25),
    0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transform: rotate(-0.5deg);
  transition: all 0.3s ease;
  width: 100%;
  max-width: 320px; /* Tamanho máximo para mobile */
  margin: 0 auto;
}

.wanted-poster:hover {
  transform: rotate(0deg) scale(1.01);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.2);
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

/* ===== ÁREA DA FOTO (MOBILE FIRST) ===== */
.photo-area {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* ===== AVATAR ===== */
.character-photo {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* ✅ FORÇAR O COMPONENTE AVATAAARS A USAR O TAMANHO COMPLETO */
.character-photo :deep(.avataaars-avatar) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 6px;
}

.character-photo :deep(.avataaars-avatar svg) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 6px;
}

.character-photo :deep(.avataaars-avatar img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  border-radius: 6px;
}

/* ===== ÁREA DO NOME (MOBILE FIRST) ===== */
.name-area {
  position: absolute;
  top: 76%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 2;
  width: 95%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  box-sizing: border-box;
}

.character-name {
  font-family: 'Rye', 'Playfair Display', serif;
  font-weight: bold;
  color: #4a381f;
  text-align: center;
  margin: 0;
  
  /* ✅ Valores base para mobile */
  font-size: 1.2rem;
  letter-spacing: 1px;
  transform: scaleY(2.2);
  transform-origin: center bottom;
  display: inline-block;
  line-height: 0.8;
  
  /* ✅ Quebra inteligente de texto */
  word-break: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
  
  /* ✅ Transição suave */
  transition: all 0.3s ease;
  
  /* ✅ Sombra para legibilidade em mobile */

}

/* ===== ÁREA DA BOUNTY (MOBILE FIRST) ===== */
.bounty-area {
  position: absolute;
  top: 84%;
  left: 55%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 2;
  width: 95%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  box-sizing: border-box;
}

.bounty-amount {
  font-family: 'Pirata One', cursive;
  font-weight: bold;
  color: #4a381f;
  text-align: center;
  margin: 0;
  
  /* ✅ Valores base para mobile */
  font-size: 1rem;
  letter-spacing: 1px;
  
  /* ✅ Quebra inteligente de texto */
  word-break: break-word;
  overflow-wrap: break-word;
  
  /* ✅ Transição suave */
  transition: all 0.3s ease;
  

}

/* ===== CONTROLES E AÇÕES (MOBILE FIRST) ===== */
.poster-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  padding: 0 12px;
  box-sizing: border-box;
}

.action-btn {
  font-weight: 600;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  min-height: 40px; /* ✅ Área de toque adequada para mobile */
}

.size-controls {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
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

/* ===== AJUSTES ESPECÍFICOS POR TAMANHO (MOBILE) ===== */
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

.wanted-poster-small .name-area {
  top: 77%;
}

.wanted-poster-medium .name-area {
  top: 77%;
}

.wanted-poster-large .name-area {
  top: 77%;
}

.wanted-poster-xl .name-area {
  top: 77%;
}

.wanted-poster-small .bounty-area {
  top: 82%;
}

.wanted-poster-medium .bounty-area {
  top: 82%;
}

.wanted-poster-large .bounty-area {
  top: 82%;
}

.wanted-poster-xl .bounty-area {
  top: 82%;
}

/* ===== ANIMAÇÕES (REDUZIDAS PARA MOBILE) ===== */
@keyframes float-mobile {
  0%, 100% { transform: translateY(0px) rotate(-0.5deg); }
  50% { transform: translateY(-2px) rotate(0.5deg); }
}

.wanted-poster:hover {
  animation: float-mobile 2s ease-in-out infinite;
}

/* ===== EFEITOS DE HOVER (REDUZIDOS PARA MOBILE) ===== */
.photo-area:hover {
  transform: translateX(-50%) scale(1.02);
}

.wanted-poster:hover .photo-area {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* ===== TABLET PORTRAIT (481px - 767px) ===== */
@media screen and (min-width: 481px) and (max-width: 767px) {
  .wanted-poster-container {
    gap: 16px;
    padding: 16px;
  }

  .wanted-poster {
    max-width: 400px;
    border-radius: 8px;
    transform: rotate(-0.8deg);
  }

  .wanted-poster:hover {
    transform: rotate(0deg) scale(1.015);
  }

  .photo-area {
    top: 28%;
    border-radius: 10px;
  }

  .character-photo {
    border-radius: 8px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  }

  .name-area {
    top: 75%;
    width: 92%;
  }

  .character-name {
    font-size: 1.5rem;
    letter-spacing: 1.5px;
    transform: scaleY(2.3);
    line-height: 0.9;
  }

  .bounty-area {
    top: 83%;
    width: 92%;
  }

  .bounty-amount {
    font-size: 1.2rem;
    letter-spacing: 1.5px;
  }

  .action-btn {
    padding: 10px 16px;
    font-size: 15px;
  }

  /* ✅ Ajustes específicos por tamanho para tablet */
  .wanted-poster-small .photo-area,
  .wanted-poster-medium .photo-area,
  .wanted-poster-large .photo-area,
  .wanted-poster-xl .photo-area {
    top: 21.5%;
  }

  .wanted-poster-small .name-area,
  .wanted-poster-medium .name-area,
  .wanted-poster-large .name-area,
  .wanted-poster-xl .name-area {
    top: 77%;
  }

  .wanted-poster-small .bounty-area,
  .wanted-poster-medium .bounty-area,
  .wanted-poster-large .bounty-area,
  .wanted-poster-xl .bounty-area {
    top: 82.5%;
  }
}

/* ===== TABLET LANDSCAPE / LAPTOP (768px - 1023px) ===== */
@media screen and (min-width: 768px) and (max-width: 1023px) {
  .wanted-poster-container {
    gap: 20px;
    padding: 20px;
  }

  .wanted-poster {
    max-width: 500px;
    border-radius: 8px;
    transform: rotate(-1deg);
    box-shadow: 
      0 6px 24px rgba(0, 0, 0, 0.25),
      0 3px 12px rgba(0, 0, 0, 0.15);
  }

  .wanted-poster:hover {
    transform: rotate(0deg) scale(1.02);
    box-shadow: 
      0 10px 36px rgba(0, 0, 0, 0.35),
      0 5px 18px rgba(0, 0, 0, 0.25);
  }

  .photo-area {
    top: 28%;
    border-radius: 12px;
  }

  .character-photo {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .name-area {
    top: 75%;
    width: 90%;
  }

  .character-name {
    font-size: 1.6rem;
    letter-spacing: 1.8px;
    transform: scaleY(2.4);
    line-height: 0.95;
  }

  .bounty-area {
    top: 82.5%;
    width: 90%;
  }

  .bounty-amount {
    font-size: 1.3rem;
    letter-spacing: 1.8px;
  }

  .poster-actions {
    gap: 12px;
  }

  .action-btn {
    padding: 12px 20px;
    font-size: 16px;
  }

  /* ✅ Animação melhorada para tablet */
  @keyframes float-tablet {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50% { transform: translateY(-3px) rotate(0.5deg); }
  }

  .wanted-poster:hover {
    animation: float-tablet 2.5s ease-in-out infinite;
  }

  /* ✅ Ajustes específicos por tamanho para tablet landscape */
  .wanted-poster-small .photo-area,
  .wanted-poster-medium .photo-area,
  .wanted-poster-large .photo-area,
  .wanted-poster-xl .photo-area {
    top: 21.2%;
  }

  .wanted-poster-small .name-area,
  .wanted-poster-medium .name-area,
  .wanted-poster-large .name-area,
  .wanted-poster-xl .name-area {
    top: 77%;
  }

  .wanted-poster-small .bounty-area,
  .wanted-poster-medium .bounty-area,
  .wanted-poster-large .bounty-area,
  .wanted-poster-xl .bounty-area {
    top: 82.5%;
  }
}

/* ===== DESKTOP (1024px+) ===== */
@media screen and (min-width: 1024px) {
  .wanted-poster-container {
    gap: 16px;
    padding: 16px;
  }

  .wanted-poster {
    max-width: none; /* ✅ Remover limitação de tamanho */
    border-radius: 8px;
    transform: rotate(-1deg);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      0 4px 16px rgba(0, 0, 0, 0.2);
  }

  .wanted-poster:hover {
    transform: rotate(0deg) scale(1.02);
    box-shadow: 
      0 12px 48px rgba(0, 0, 0, 0.4),
      0 6px 24px rgba(0, 0, 0, 0.3);
  }

  .photo-area {
    top: 28%;
    border-radius: 12px;
  }

  .character-photo {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .name-area {
    top: 75%;
    width: 90%;
  }

  .character-name {
    font-size: 1.8rem;
    letter-spacing: 2px;
    transform: scaleY(2.5);
    line-height: 0;
  }

  .bounty-area {
    top: 82.5%;
    width: 90%;
  }

  .bounty-amount {
    font-size: 1.5rem;
    letter-spacing: 2px;
  }

  .poster-actions {
    gap: 12px;
  }

  .action-btn {
    font-weight: 600;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 16px;
    min-height: auto;
  }

  /* ✅ Animação completa para desktop */
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50% { transform: translateY(-5px) rotate(1deg); }
  }

  .wanted-poster:hover {
    animation: float 3s ease-in-out infinite;
  }

  /* ✅ Efeitos de hover melhorados para desktop */
  .photo-area:hover {
    transform: translateX(-50%) scale(1.05);
  }

  .wanted-poster:hover .photo-area {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  /* ✅ Ajustes específicos por tamanho para desktop (valores originais) */
  .wanted-poster-small .photo-area,
  .wanted-poster-medium .photo-area,
  .wanted-poster-large .photo-area,
  .wanted-poster-xl .photo-area {
    top: 21.2%;
  }

  .wanted-poster-small .name-area,
  .wanted-poster-medium .name-area,
  .wanted-poster-large .name-area,
  .wanted-poster-xl .name-area {
    top: 77%;
  }

  .wanted-poster-small .bounty-area,
  .wanted-poster-medium .bounty-area,
  .wanted-poster-large .bounty-area,
  .wanted-poster-xl .bounty-area {
    top: 82.5%;
  }
}

/* ===== LARGE DESKTOP (1440px+) ===== */
@media screen and (min-width: 1440px) {
  .wanted-poster-container {
    gap: 20px;
    padding: 20px;
  }

  .character-name {
    font-size: 2rem;
    letter-spacing: 2.5px;
  }

  .bounty-amount {
    font-size: 1.7rem;
    letter-spacing: 2.5px;
  }
}

/* ===== ORIENTAÇÃO LANDSCAPE PARA MOBILE ===== */
@media screen and (max-width: 767px) and (orientation: landscape) {
  .wanted-poster-container {
    padding: 8px;
    gap: 8px;
  }

  .wanted-poster {
    max-width: 280px;
    transform: rotate(-0.3deg);
  }

  .photo-area {
    top: 32%;
  }

  .name-area {
    top: 78%;
  }

  .bounty-area {
    top: 86%;
  }

  .character-name {
    font-size: 1rem;
    letter-spacing: 0.8px;
    transform: scaleY(2);
  }

  .bounty-amount {
    font-size: 0.9rem;
    letter-spacing: 0.8px;
  }

  .action-btn {
    padding: 6px 10px;
    font-size: 13px;
  }

  /* ✅ Desabilitar animações em landscape mobile para performance */
  .wanted-poster:hover {
    animation: none;
  }
}

/* ===== TELAS MUITO PEQUENAS (até 375px) ===== */
@media screen and (max-width: 375px) {
  .wanted-poster-container {
    padding: 8px;
    gap: 8px;
  }

  .wanted-poster {
    max-width: 280px;
    border-radius: 4px;
  }

  .photo-area {
    border-radius: 6px;
  }

  .character-photo {
    border-radius: 4px;
  }

  .character-name {
    font-size: 1rem;
    letter-spacing: 0.5px;
    transform: scaleY(2);
  }

  .bounty-amount {
    font-size: 0.8rem;
    letter-spacing: 0.5px;
  }

  .action-btn {
    padding: 6px 8px;
    font-size: 12px;
    border-radius: 4px;
  }
}

/* ===== AJUSTES PARA TEXTOS LONGOS (TODOS OS DISPOSITIVOS) ===== */
.character-name[style*="font-size: 0.8rem"],
.bounty-amount[style*="font-size: 0.7rem"] {
  line-height: 1.1 !important;
  word-spacing: -2px;
}

/* ===== AJUSTES PARA TEXTOS CURTOS (DESKTOP APENAS) ===== */
@media screen and (min-width: 1024px) {
  .character-name[style*="font-size: 2.5rem"],
  .bounty-amount[style*="font-size: 2.2rem"] {
    text-shadow: 
  }
}

/* ===== OTIMIZAÇÕES DE PERFORMANCE PARA MOBILE ===== */
@media screen and (max-width: 767px) {
  /* ✅ Reduzir transições para melhor performance */
  .wanted-poster,
  .photo-area,
  .character-name,
  .bounty-amount {
    transition: all 0.2s ease;
  }
  
  /* ✅ Simplificar sombras para mobile */
  .wanted-poster {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  .wanted-poster:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
}

/* ===== ACESSIBILIDADE ===== */
@media (prefers-reduced-motion: reduce) {
  .wanted-poster,
  .photo-area,
  .character-name,
  .bounty-amount {
    transition: none;
    animation: none !important;
  }
  
  .wanted-poster:hover {
    animation: none !important;
  }
}

</style>