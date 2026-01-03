// src/utils/worldResetSystem.ts

import { db } from './database'
import { GameDataGenerator } from './gameDataGenerator'

export interface WorldResetResult {
  success: boolean
  message: string
  steps: string[]
  errors?: string[]
}

export class WorldResetSystem {
  // ✅ RESETAR MUNDO COMPLETO
  static async resetWorld(): Promise<WorldResetResult> {
    try {
      console.log('🌍 Iniciando reset completo do mundo...')

      const steps: string[] = []
      const errors: string[] = []

      // 1. Limpar todas as tabelas (exceto gameState)
      try {
        await this.clearAllTables()
        steps.push('✅ Todas as tabelas foram limpas')
      } catch (error) {
        const errorMsg = `❌ Erro ao limpar tabelas: ${error}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }

      // 2. Criar gameState inicial
      try {
        await this.createInitialGameState()
        steps.push('✅ GameState inicial criado')
      } catch (error) {
        const errorMsg = `❌ Erro ao criar gameState: ${error}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }

      const success = errors.length === 0
      const message = success
        ? '🎉 Mundo resetado com sucesso! Agora você pode criar seu personagem.'
        : '⚠️ Reset concluído com alguns erros. Verifique os logs.'

      console.log(success ? '✅' : '⚠️', 'Reset do mundo concluído:', { success, steps, errors })

      return {
        success,
        message,
        steps,
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      console.error('❌ Erro crítico no reset do mundo:', error)
      return {
        success: false,
        message: `❌ Erro crítico: ${error}`,
        steps: [],
        errors: [`Erro crítico: ${error}`],
      }
    }
  }

  // ✅ LIMPAR TODAS AS TABELAS (EXCETO GAMESTATE)
  private static async clearAllTables(): Promise<void> {
    console.log('🧹 Limpando todas as tabelas...')

    const tablesToClear = [
      'characters',
      'crews',
      'islands',
      'devilFruits',
      'styleCombats',
      'ships',
      'tasks',
      'battles',
      'yonkous',
      'shichibukais',
      'admirals',
      'marineBases',
      'cypherPols',
      'gorouseis',
      'territories',
    ]

    const clearPromises = tablesToClear.map(async (tableName) => {
      try {
        await (db as any)[tableName].clear()
        console.log(`✅ Tabela ${tableName} limpa`)
      } catch (error) {
        console.error(`❌ Erro ao limpar tabela ${tableName}:`, error)
        throw error
      }
    })

    await Promise.all(clearPromises)
    console.log('✅ Todas as tabelas foram limpas')
  }

  // ✅ CRIAR GAMESTATE INICIAL
  private static async createInitialGameState(): Promise<void> {
    console.log('🎮 Criando gameState inicial...')

    // Limpar gameState existente
    await db.gameState.clear()

    // Criar novo gameState
    const initialGameState = {
      id: 1,
      currentDay: 1,
      worldGenerated: false,
      playerCharacterCreated: false,
      lastWorldUpdate: new Date(),
      gameVersion: '1.0.0',
      createdAt: new Date(),
      key: 'initialized',
      value: true,
      updatedAt: new Date(),
    }

    await db.gameState.add(initialGameState)
    console.log('✅ GameState inicial criado:', initialGameState)
  }

  // ✅ VERIFICAR SE PRECISA CRIAR PERSONAGEM
  static async needsCharacterCreation(): Promise<boolean> {
    try {
      const gameState = await db.gameState.get(1)

      if (!gameState) {
        console.log('⚠️ GameState não encontrado')
        return false
      }

      return !gameState.playerCharacterCreated
    } catch (error) {
      console.error('❌ Erro ao verificar necessidade de criação de personagem:', error)
      return false
    }
  }

  // ✅ VERIFICAR SE MUNDO FOI GERADO
  static async isWorldGenerated(): Promise<boolean> {
    try {
      const gameState = await db.gameState.get(1)

      if (!gameState) {
        console.log('⚠️ GameState não encontrado')
        return false
      }

      return gameState.worldGenerated
    } catch (error) {
      console.error('❌ Erro ao verificar se mundo foi gerado:', error)
      return false
    }
  }

  // ✅ MARCAR PERSONAGEM COMO CRIADO
  static async markPlayerCharacterCreated(): Promise<void> {
    try {
      await db.gameState.update(1, {
        playerCharacterCreated: true,
      })
      console.log('✅ Personagem do player marcado como criado')
    } catch (error) {
      console.error('❌ Erro ao marcar personagem como criado:', error)
      throw error
    }
  }

  // ✅ MARCAR MUNDO COMO GERADO
  static async markWorldGenerated(): Promise<void> {
    try {
      await db.gameState.update(1, {
        worldGenerated: true,
        lastWorldUpdate: new Date(),
      })
      console.log('✅ Mundo marcado como gerado')
    } catch (error) {
      console.error('❌ Erro ao marcar mundo como gerado:', error)
      throw error
    }
  }

  // ✅ GERAR MUNDO APÓS CRIAÇÃO DO PERSONAGEM
  static async generateWorldAfterCharacterCreation(characterData: {
    name: string
    type: string
    combatStyle: string
    devilFruitId?: number
    crewName: string
    shipName: string
  }): Promise<WorldResetResult> {
    try {
      console.log('🌍 Gerando mundo após criação do personagem...')

      const steps: string[] = []
      const errors: string[] = []

      // Gerar mundo completo
      try {
        console.log('🏗️ Iniciando geração do mundo...')
        const generator = new GameDataGenerator('EPIC')
        await generator.generateInitialData(characterData)
        steps.push('✅ Mundo completo gerado')

        // Marcar como gerado
        await this.markWorldGenerated()
        steps.push('✅ Estado do mundo atualizado')
      } catch (error) {
        const errorMsg = `❌ Erro na geração do mundo: ${error}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }

      const success = errors.length === 0
      const message = success
        ? '🎉 Mundo gerado com sucesso! Aventura pode começar!'
        : '⚠️ Geração do mundo concluída com erros.'

      return {
        success,
        message,
        steps,
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      console.error('❌ Erro na geração do mundo:', error)
      return {
        success: false,
        message: `❌ Erro: ${error}`,
        steps: [],
        errors: [`${error}`],
      }
    }
  }

  // ✅ OBTER STATUS DO JOGO
  static async getGameStatus(): Promise<{
    hasGameState: boolean
    needsCharacterCreation: boolean
    isWorldGenerated: boolean
    canStartGame: boolean
  }> {
    try {
      const gameState = await db.gameState.get(1)
      const character = await db.characters.where('isPlayer').equals(1).toArray()

      const hasGameState = !!gameState
      const needsCharacterCreation = !character ? true : false
      const isWorldGenerated = hasGameState ? gameState.worldGenerated : false
      const canStartGame = hasGameState && character && gameState.worldGenerated

      return {
        hasGameState,
        needsCharacterCreation,
        isWorldGenerated,
        canStartGame,
      }
    } catch (error) {
      console.error('❌ Erro ao obter status do jogo:', error)
      return {
        hasGameState: false,
        needsCharacterCreation: false,
        isWorldGenerated: false,
        canStartGame: false,
      }
    }
  }
}
