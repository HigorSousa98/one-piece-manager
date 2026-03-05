// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import AdSense from './plugins/adsense'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// Tema customizado One Piece - Grand Line Dark Theme
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'grandLineTheme',
    themes: {
      grandLineTheme: {
        dark: true,
        colors: {
          primary: '#D4AF37',    // Ouro antigo - o tesouro, o One Piece
          secondary: '#1E74C8',  // Azul oceano
          accent: '#FF6B35',     // Laranja do Luffy
          error: '#E53935',      // Vermelho da Justiça Marinha
          info: '#29B6F6',       // Azul céu
          success: '#43A047',    // Verde do tesouro pirata
          warning: '#FFA726',    // Âmbar
          background: '#0A1628', // Navy meia-noite - fundo do mar
          surface: '#172D48',    // Azul escuro - interior do navio (mais claro que background)
          'on-background': '#F0E6D8',  // Texto principal — quente, legível
          'on-surface': '#F0E6D8',     // Texto em cards — mesmo nível de brilho
          'pirate-gold': '#FFD700',
          'old-gold': '#D4AF37',
          'crimson-sea': '#8B0000',
          'marine-blue': '#003087',
          'sea-foam': '#00897B',
          'storm-grey': '#78909C',
          'parchment': '#D4AF37',
          'deep-navy': '#060F1E',
        }
      }
    }
  }
})

const pinia = createPinia()

createApp(App)
  .use(pinia)
  .use(router)
  .use(vuetify)
  .use(AdSense, {
    adClient: import.meta.env.VITE_ADSENSE_CLIENT_ID // Substitua pelo seu ID
  })
  .mount('#app')