// src/stores/gameStore.ts - Adicionar estado de loading
import { defineStore } from 'pinia'
import { db, GameState } from '@/utils/database'
import { GameDataGenerator } from '@/utils/gameDataGenerator'

export const useGameStore = defineStore('game', {
  state: () => ({
    isInitialized: false,
    isInitializing: false,
    currentTime: new Date(),
    gameSpeed: 1,
  }),

  actions: {
    async initializeGame() {
      if (this.isInitialized || this.isInitializing) return

      this.isInitializing = true

      try {
        console.log('🏴‍☠️ Verificando inicialização do jogo...')

        // Verificar se o jogo já foi inicializado
        const gameInit = await db.gameState.where('key').equals('initialized').first()

        if (!gameInit) {
          console.log('🌊 Primeira inicialização - gerando mundo de One Piece...')

          const generator = new GameDataGenerator('EPIC')
          //await generator.generateInitialData()

          /*await db.gameState.add({
            key: 'initialized',
            value: true,
            updatedAt: new Date()
          })*/

          console.log('✅ Mundo de One Piece gerado com sucesso!')
        } else {
          console.log('🏴‍☠️ Mundo já existe - carregando dados...')
        }

        this.isInitialized = true
        this.startGameLoop()
      } catch (error) {
        console.error('❌ Erro ao inicializar o jogo:', error)
        throw error
      } finally {
        this.isInitializing = false
      }
    },

    startGameLoop() {
      // Atualizar tempo do jogo a cada segundo
      setInterval(() => {
        this.currentTime = new Date()
      }, 1000)
    },

    async saveGameState(key: string, value: any) {
      const existing = await db.gameState.where('key').equals(key).first()

      if (existing) {
        await db.gameState.update(existing.id!, {
          value,
          updatedAt: new Date(),
        })
      } else {
        await db.gameState.add({
          key,
          value,
          updatedAt: new Date(),
        })
      }
    },

    async loadGameState(key: string) {
      const state = await db.gameState.where('key').equals(key).first()
      return state?.value
    },
  },
})
