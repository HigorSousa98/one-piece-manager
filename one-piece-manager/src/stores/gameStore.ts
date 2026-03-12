// src/stores/gameStore.ts
import { defineStore } from 'pinia'
import { db } from '@/utils/database'
import { InventorySystem } from '@/utils/inventorySystem'

export const useGameStore = defineStore('game', {
  state: () => ({
    isInitialized: false,
    isInitializing: false,
    currentTime: new Date(),
    gameSpeed: 1,
    _gameLoopInterval: null as ReturnType<typeof setInterval> | null,
    _lastStoreCheck: 0,
  }),

  actions: {
    async initializeGame() {
      if (this.isInitialized || this.isInitializing) return

      this.isInitializing = true

      try {
        console.log('🏴‍☠️ Verificando inicialização do jogo...')

        // Garantir que existe um gameState base (id=1) para o sistema de status funcionar.
        // O mundo em si é gerado pelo WorldResetSystem após a criação do personagem.
        const gameState = await db.gameState.get(1)
        if (!gameState) {
          console.log('🌊 Primeira execução — criando gameState inicial...')
          await db.gameState.add({
            id: 1,
            key: 'initialized',
            value: true,
            worldGenerated: false,
            playerCharacterCreated: false,
            lastWorldUpdate: new Date(),
            updatedAt: new Date(),
          })
        } else {
          console.log('🏴‍☠️ GameState encontrado — carregando jogo...')
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
      if (this._gameLoopInterval) return
      this._gameLoopInterval = setInterval(() => {
        this.currentTime = new Date()
        // Background store refresh check — once per minute, fire-and-forget
        const now = Date.now()
        if (now - this._lastStoreCheck > 60_000) {
          this._lastStoreCheck = now
          InventorySystem.checkAndRefreshAllStores().catch(() => {})
        }
      }, 1000)
    },

    stopGameLoop() {
      if (this._gameLoopInterval) {
        clearInterval(this._gameLoopInterval)
        this._gameLoopInterval = null
      }
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
