// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// Tema customizado One Piece
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
    defaultTheme: 'onePieceTheme',
    themes: {
      onePieceTheme: {
        dark: false,
        colors: {
          primary: '#FF6B35', // Laranja vibrante (chapéu do Luffy)
          secondary: '#004E89', // Azul oceano
          accent: '#866700ff', // Dourado (tesouro)
          error: '#B71C1C',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FF9800',
          background: '#F5F5F5',
          surface: '#FFFFFF',
          'pirate-gold': '#FFD700',
          'ocean-blue': '#006994',
          'devil-fruit': '#8B0000',
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
  .mount('#app')