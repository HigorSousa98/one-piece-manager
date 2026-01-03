// src/stores/bossFightStore.ts
import { defineStore } from 'pinia'
import { BossDetectionSystem } from '@/utils/bossDetectionSystem'
import { BossFightSystem } from '@/utils/bossFightSystem'
import { useBattleStore } from './battleStore'
import { db } from '@/utils/database'
import type { DetectedBoss } from '@/utils/bossDetectionSystem'
import type { BossFight, Character } from '@/utils/database'

export const useBossFightStore = defineStore('bossFight', {
  state: () => ({
    detectedBosses: [] as DetectedBoss[],
    currentBossFight: null as BossFight | null,
    nextOpponent: null as Character | null,
    availableMembers: [] as Character[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    // ✅ GETTERS PRIMEIRO (ANTES DAS ACTIONS)
    hasBossesOnIsland: (state) => state.detectedBosses.length > 0,

    hasActiveBossFight: (state) =>
      state.currentBossFight !== null && !state.currentBossFight.isCompleted,

    currentBattleProgress: (state) => {
      if (!state.currentBossFight) return null

      return {
        current: state.currentBossFight.currentBattleIndex + 1,
        total: state.currentBossFight.totalBattles,
        percentage: Math.round(
          ((state.currentBossFight.currentBattleIndex + 1) / state.currentBossFight.totalBattles) *
            100,
        ),
      }
    },

    bossType: (state) => state.currentBossFight?.bossType || null,

    canSelectFighter: (state) =>
      state.currentBossFight !== null &&
      !state.currentBossFight.isCompleted &&
      state.nextOpponent !== null &&
      state.availableMembers.length > 0,
  },

  actions: {
    // ✅ DETECTAR BOSSES NA ILHA
    async detectBossesOnIsland(islandId: number) {
      this.loading = true
      this.error = null

      try {
        this.detectedBosses = await BossDetectionSystem.detectBossesOnIsland(islandId)
      } catch (error) {
        this.error = 'Erro ao detectar bosses na ilha'
        console.error('Erro ao detectar bosses:', error)
      } finally {
        this.loading = false
      }
    },

    // ✅ VERIFICAR BOSS FIGHT ATIVO
    async checkActiveBossFight(playerCrewId: number) {
      try {
        this.currentBossFight = await BossFightSystem.getCurrentBossFight(playerCrewId)

        if (this.currentBossFight && !this.currentBossFight.isCompleted) {
          await this.loadBossFightData()
        } else {
          this.nextOpponent = null
          this.availableMembers = []
        }
      } catch (error) {
        this.error = 'Erro ao verificar boss fight ativo'
        console.error('Erro ao verificar boss fight:', error)
      }
    },

    // ✅ CARREGAR DADOS DO BOSS FIGHT
    async loadBossFightData() {
      if (!this.currentBossFight) return

      try {
        const [opponent, members] = await Promise.all([
          BossFightSystem.getNextOpponent(this.currentBossFight.id!),
          BossFightSystem.getAvailablePlayerMembers(this.currentBossFight.id!),
        ])

        this.nextOpponent = opponent
        this.availableMembers = members
      } catch (error) {
        console.error('Erro ao carregar dados do boss fight:', error)
      }
    },

    // ✅ INICIAR BOSS FIGHT
    async startBossFight(playerCrewId: number, detectedBoss: DetectedBoss) {
      this.loading = true
      this.error = null

      try {
        const bossFightId = await BossFightSystem.startBossFight(playerCrewId, detectedBoss)

        // ✅ ATUALIZAR ESTADO
        this.currentBossFight = await BossFightSystem.getCurrentBossFight(playerCrewId)

        if (this.currentBossFight) {
          await this.loadBossFightData()
        }

        return bossFightId
      } catch (error) {
        this.error = 'Erro ao iniciar boss fight'
        console.error('Erro ao iniciar boss fight:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // ✅ EXECUTAR BATALHA
    async executeBattle(playerCharacterId: number) {
      if (!this.currentBossFight || !this.nextOpponent) {
        throw new Error('Não há boss fight ativo ou oponente disponível')
      }

      this.loading = true
      this.error = null

      try {
        const battleStore = useBattleStore()

        // ✅ OBTER PERSONAGEM DO PLAYER
        const playerCharacter = await db.characters.get(playerCharacterId)
        if (!playerCharacter) {
          throw new Error('Personagem do player não encontrado')
        }

        // ✅ CALCULAR RECOMPENSAS EXTRAS
        const extraReward = BossFightSystem.calculateBossReward(
          this.currentBossFight.bossType,
          this.nextOpponent.level,
        )
        const extraExp = BossFightSystem.calculateBossExperience(
          this.currentBossFight.bossType,
          this.nextOpponent.level,
        )

        // ✅ EXECUTAR BATALHA USANDO BATTLESTORE
        const battleResult = await battleStore.simulateBattle(
          playerCharacter,
          this.nextOpponent,
          extraReward,
          extraExp,
        )

        // ✅ ATUALIZAR BOSS FIGHT
        const playerWon = battleResult.winner.id === playerCharacterId
        this.currentBossFight = await BossFightSystem.updateBossFightAfterBattle(
          this.currentBossFight.id!,
          playerWon,
          playerCharacterId,
          this.nextOpponent.id!,
        )

        // ✅ ATUALIZAR DADOS SE BOSS FIGHT CONTINUA
        if (this.currentBossFight && !this.currentBossFight.isCompleted) {
          await this.loadBossFightData()
        } else {
          this.nextOpponent = null
          this.availableMembers = []
        }

        return {
          ...battleResult,
          bossFightCompleted: this.currentBossFight?.isCompleted || false,
          playerWonBossFight: this.currentBossFight?.playerWon || false,
        }
      } catch (error) {
        this.error = 'Erro ao executar batalha'
        console.error('Erro ao executar batalha:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // ✅ LIMPAR ESTADO
    clearState() {
      this.detectedBosses = []
      this.currentBossFight = null
      this.nextOpponent = null
      this.availableMembers = []
      this.error = null
    },
  },
})
