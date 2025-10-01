<!-- src/components/AdBanner.vue (versão melhorada) -->
<template>
  <div class="ad-container" :class="containerClasses">
    <div class="ad-label" v-if="showLabel">
      <span class="text-caption text-grey">Publicidade</span>
    </div>
    
    <!-- ✅ ANÚNCIO REAL (PRODUÇÃO) -->
    <ins 
      v-if="isProduction && adsenseEnabled"
      class="adsbygoogle"
      :style="adStyle"
      :data-ad-client="adClient"
      :data-ad-slot="adSlot"
      :data-ad-format="adFormat"
      :data-full-width-responsive="fullWidthResponsive"
    ></ins>
    
    <!-- ✅ PLACEHOLDER (DESENVOLVIMENTO) -->
    <div 
      v-else
      class="ad-placeholder"
      :style="adStyle"
    >
      <div class="placeholder-content">
        <v-icon size="48" color="grey-lighten-2">mdi-advertisement</v-icon>
        <div class="text-caption text-grey mt-2">
          Anúncio {{ adSlot }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, inject } from 'vue'

interface Props {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  width?: string | number
  height?: string | number
  fullWidthResponsive?: boolean
  showLabel?: boolean
  centered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  adFormat: 'auto',
  width: 'auto',
  height: 'auto',
  fullWidthResponsive: true,
  showLabel: true,
  centered: true
})

// Injetar função de carregamento
const loadAd = inject('loadAd') as () => void

const adClient = import.meta.env.VITE_ADSENSE_CLIENT_ID
const adsenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true'
const isProduction = import.meta.env.PROD

const containerClasses = computed(() => ({
  'ad-centered': props.centered,
  'ad-banner': true
}))

const adStyle = computed(() => ({
  display: 'block',
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

onMounted(() => {
  if (isProduction && adsenseEnabled) {
    setTimeout(() => {
      if (loadAd) {
        loadAd()
      }
    }, 100)
  }
})
</script>

<style scoped>
.ad-container {
  margin: 16px 0;
  padding: 8px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.ad-centered {
  text-align: center;
}

.ad-label {
  text-align: center;
  margin-bottom: 8px;
}

.ad-banner {
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Responsividade */
@media (max-width: 768px) {
  .ad-container {
    margin: 8px 0;
    padding: 4px;
  }
}

/* Modo escuro */
.v-theme--dark .ad-container {
  background-color: rgba(255, 255, 255, 0.05);
}

.ad-placeholder {
  background: linear-gradient(45deg, #f5f5f5, #eeeeee);
  border: 2px dashed #cccccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.placeholder-content {
  text-align: center;
}

.v-theme--dark .ad-placeholder {
  background: linear-gradient(45deg, #2a2a2a, #1e1e1e);
  border-color: #555555;
}
</style>