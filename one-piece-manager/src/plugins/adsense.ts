// src/plugins/adsense.ts
import { App } from 'vue'

interface AdSenseConfig {
  adClient: string
  adSlot?: string
  adFormat?: string
  fullWidthResponsive?: boolean
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default {
  install(app: App, options: AdSenseConfig) {
    // Configuração global do AdSense
    app.config.globalProperties.$adsense = {
      adClient: options.adClient,
      push: () => {
        try {
          if (typeof window !== 'undefined' && window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({})
          }
        } catch (error) {
          console.error('Erro ao carregar anúncio:', error)
        }
      }
    }

    // Método para carregar anúncios
    app.provide('loadAd', () => {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    })
  }
}