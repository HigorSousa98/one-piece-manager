import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    include: ['html-to-image']
  },
  build: {
    commonjsOptions: {
      include: [/html-to-image/, /node_modules/]
    }
  },
  define: {
    global: 'globalThis'
  }
})