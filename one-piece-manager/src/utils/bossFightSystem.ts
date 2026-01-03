// src/utils/bossFightSystem.ts
import { db } from './database'
import type { Character, BossFight } from './database'
import type { DetectedBoss } from './bossDetectionSystem'

export class BossFightSystem {
  // ✅ INICIAR COMBATE CONTRA BOSS
  static async startBossFight(playerCrewId: number, detectedBoss: DetectedBoss): Promise<number> {
    try {
      // ✅ VERIFICAR SE JÁ EXISTE COMBATE ATIVO
      const existingFight = await db.bossFights
        .where('playerCrewId')
        .equals(playerCrewId)
        .and((fight) => !fight.isCompleted)
        .first()

      if (existingFight) {
        throw new Error('Já existe um combate contra boss ativo')
      }

      // ✅ CRIAR ORDEM DE BATALHA
      const battleOrder = detectedBoss.crewMembers.map((member) => member.id!)

      // ✅ CRIAR REGISTRO DE BOSS FIGHT
      const bossFightId = await db.bossFights.add({
        playerCrewId,
        bossType: detectedBoss.type,
        bossId: detectedBoss.bossId,
        bossCrewId: detectedBoss.crew.id!,
        currentBattleIndex: 0,
        totalBattles: detectedBoss.crewMembers.length,
        playerDefeatedMembers: [],
        bossDefeatedMembers: [],
        isCompleted: false,
        playerWon: false,
        startedAt: new Date(),
        battleOrder,
      })

      // ✅ CRIAR TASK PARA O BOSS FIGHT
      await db.tasks.add({
        characterId: 0, // Task especial do sistema
        type: 'boss_fight',
        description: `Combate contra ${detectedBoss.type}: ${detectedBoss.captain.name}`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h para completar
        duration: 24 * 60, // 24h em minutos
        difficulty: 'very hard',
        isCompleted: false,
        location: `Boss Fight vs ${detectedBoss.captain.name}`,
        crewId: playerCrewId,
        targetId: bossFightId, // Referência ao BossFight
        createdAt: new Date(),
      })

      return bossFightId
    } catch (error) {
      console.error('Erro ao iniciar boss fight:', error)
      throw error
    }
  }

  // ✅ OBTER STATUS DO COMBATE ATUAL
  static async getCurrentBossFight(playerCrewId: number): Promise<BossFight | null> {
    return (
      (await db.bossFights
        .where('playerCrewId')
        .equals(playerCrewId)
        .and((fight) => !fight.isCompleted)
        .first()) || null
    )
  }

  // ✅ OBTER PRÓXIMO OPONENTE
  static async getNextOpponent(bossFightId: number): Promise<Character | null> {
    const bossFight = await db.bossFights.get(bossFightId)
    if (!bossFight || bossFight.isCompleted) return null

    const nextOpponentId = bossFight.battleOrder[bossFight.currentBattleIndex]
    return (await db.characters.get(nextOpponentId)) || null
  }

  // ✅ OBTER MEMBROS DISPONÍVEIS DO PLAYER
  static async getAvailablePlayerMembers(bossFightId: number): Promise<Character[]> {
    const bossFight = await db.bossFights.get(bossFightId)
    if (!bossFight) return []

    const allMembers = await db.characters.where('crewId').equals(bossFight.playerCrewId).toArray()

    // ✅ FILTRAR MEMBROS DERROTADOS
    return allMembers.filter((member) => !bossFight.playerDefeatedMembers.includes(member.id!))
  }

  // ✅ ATUALIZAR BOSS FIGHT APÓS BATALHA
  static async updateBossFightAfterBattle(
    bossFightId: number,
    playerWon: boolean,
    playerCharacterId: number,
    opponentId: number,
  ): Promise<BossFight> {
    const bossFight = await db.bossFights.get(bossFightId)
    if (!bossFight) {
      throw new Error('Boss fight não encontrado')
    }

    const updates: Partial<BossFight> = {}

    if (playerWon) {
      // ✅ PLAYER VENCEU
      updates.bossDefeatedMembers = [...bossFight.bossDefeatedMembers, opponentId]
      updates.currentBattleIndex = bossFight.currentBattleIndex + 1

      // ✅ VERIFICAR SE DERROTOU TODOS
      if (updates.currentBattleIndex >= bossFight.totalBattles) {
        updates.isCompleted = true
        updates.playerWon = true
        updates.completedAt = new Date()

        // ✅ PROCESSAR VITÓRIA TOTAL
        await this.processBossDefeat(bossFight, bossFight.playerCrewId)
      }
    } else {
      // ✅ PLAYER PERDEU
      updates.playerDefeatedMembers = [...bossFight.playerDefeatedMembers, playerCharacterId]

      // ✅ VERIFICAR SE PERDEU TODOS OS MEMBROS
      const availableMembers = await this.getAvailablePlayerMembers(bossFightId)
      if (availableMembers.length <= 1) {
        // -1 porque o atual acabou de perder
        updates.isCompleted = true
        updates.playerWon = false
        updates.completedAt = new Date()

        // ✅ PROCESSAR DERROTA TOTAL
        await this.processPlayerDefeat(bossFight)
      }
    }

    // ✅ SALVAR ATUALIZAÇÕES
    await db.bossFights.update(bossFightId, updates)

    // ✅ RETORNAR BOSS FIGHT ATUALIZADO
    return (await db.bossFights.get(bossFightId)) as BossFight
  }

  // ✅ CALCULAR RECOMPENSA EXTRA BASEADA NO TIPO DE BOSS
  static calculateBossReward(bossType: string, opponentLevel: number): number {
    const baseReward = opponentLevel * 1000000 // 1M por level

    const multipliers = {
      Yonkou: 5.0, // 5x recompensa
      Admiral: 4.0, // 4x recompensa
      Gorousei: 6.0, // 6x recompensa (mais raro)
      Shichibukai: 3.0, // 3x recompensa
    }

    return Math.floor(baseReward * (multipliers[bossType as keyof typeof multipliers] || 1))
  }

  // ✅ CALCULAR EXPERIÊNCIA EXTRA BASEADA NO TIPO DE BOSS
  static calculateBossExperience(bossType: string, opponentLevel: number): number {
    const baseExp = opponentLevel * 100

    const multipliers = {
      Yonkou: 3.0,
      Admiral: 2.5,
      Gorousei: 4.0,
      Shichibukai: 2.0,
    }

    return Math.floor(baseExp * (multipliers[bossType as keyof typeof multipliers] || 1))
  }

  // ✅ PROCESSAR DERROTA DO BOSS
  private static async processBossDefeat(
    bossFight: BossFight,
    playerCrewId: number,
  ): Promise<void> {
    try {
      // ✅ REMOVER TÍTULO DO BOSS
      switch (bossFight.bossType) {
        case 'Yonkou':
          await db.yonkous.delete(bossFight.bossId)
          break
        case 'Shichibukai':
          await db.shichibukais.delete(bossFight.bossId)
          break
        case 'Admiral':
          await db.admirals.delete(bossFight.bossId)
          break
        case 'Gorousei':
          await db.gorouseis.delete(bossFight.bossId)
          break
      }

      // ✅ RECOMPENSAS EXTRAS PARA TODA A TRIPULAÇÃO
      const crewMembers = await db.characters.where('crewId').equals(playerCrewId).toArray()

      const bonusReward = this.calculateBossReward(bossFight.bossType, 100) // Bonus fixo
      const bonusExp = this.calculateBossExperience(bossFight.bossType, 50) // Bonus fixo

      for (const member of crewMembers) {
        await db.characters.update(member.id!, {
          experience: member.experience + bonusExp,
          bounty: member.bounty + bonusReward,
        })
      }

      // ✅ FINALIZAR TASK
      await db.tasks
        .where('targetId')
        .equals(bossFight.id!)
        .and((task) => task.type === 'boss_fight')
        .modify({ isCompleted: true, completedAt: Date.now() })

      // ✅ CRIAR NOVA INSTÂNCIA DO BOSS (SUCESSÃO)
      await this.createSuccessor(bossFight.bossType)

      console.log(`🎉 ${bossFight.bossType} derrotado! Recompensas distribuídas.`)
    } catch (error) {
      console.error('Erro ao processar derrota do boss:', error)
    }
  }

  // ✅ PROCESSAR DERROTA DO PLAYER
  private static async processPlayerDefeat(bossFight: BossFight): Promise<void> {
    try {
      // ✅ OBTER TRIPULAÇÃO DO PLAYER
      const playerCrew = await db.crews.get(bossFight.playerCrewId)
      if (!playerCrew) return

      // ✅ OBTER ILHA ATUAL
      const currentIsland = await db.islands.get(playerCrew.currentIsland)
      if (!currentIsland) return

      // ✅ ENCONTRAR ILHA DE MENOR DIFICULDADE
      const targetDifficulty = Math.max(1, currentIsland.difficulty - 1)
      const escapeIslands = await db.islands.where('difficulty').equals(targetDifficulty).toArray()

      if (escapeIslands.length === 0) return

      // ✅ SELECIONAR ILHA ALEATÓRIA
      const escapeIsland = escapeIslands[Math.floor(Math.random() * escapeIslands.length)]

      // ✅ CRIAR TASK DE NAVEGAÇÃO FORÇADA
      const crewMembers = await db.characters
        .where('crewId')
        .equals(bossFight.playerCrewId)
        .toArray()

      if (crewMembers.length > 0) {
        await db.tasks.add({
          characterId: crewMembers[0].id!, // Usar primeiro membro disponível
          type: 'navigation',
          description: `Fuga forçada para ${escapeIsland.name} após derrota`,
          startTime: new Date(),
          endTime: new Date(Date.now() + 60 * 60 * 1000), // 1h de navegação
          duration: 60,
          difficulty: 'easy',
          isCompleted: false,
          location: `Navegação para ${escapeIsland.name}`,
          crewId: bossFight.playerCrewId,
          targetId: escapeIsland.id!,
          createdAt: new Date(),
        })
      }

      // ✅ FINALIZAR TASK DE BOSS FIGHT
      await db.tasks
        .where('targetId')
        .equals(bossFight.id!)
        .and((task) => task.type === 'boss_fight')
        .modify({ isCompleted: true, completedAt: Date.now() })

      console.log(`💀 Tripulação derrotada! Fugindo para ${escapeIsland.name}`)
    } catch (error) {
      console.error('Erro ao processar derrota do player:', error)
    }
  }

  // ✅ CRIAR SUCESSOR PARA O TÍTULO VAGO
  private static async createSuccessor(bossType: string): Promise<void> {
    try {
      // ✅ BUSCAR CANDIDATOS ELEGÍVEIS
      const candidates = await this.findSuccessorCandidates(bossType)

      if (candidates.length === 0) {
        console.log(`⚠️ Nenhum candidato encontrado para ${bossType}`)
        return
      }

      // ✅ SELECIONAR CANDIDATO ALEATÓRIO
      const successor = candidates[Math.floor(Math.random() * candidates.length)]

      // ✅ OBTER ILHA ALEATÓRIA PARA O NOVO BOSS
      const islands = await db.islands.toArray()
      const randomIsland = islands[Math.floor(Math.random() * islands.length)]

      // ✅ CRIAR NOVO REGISTRO
      switch (bossType) {
        case 'Yonkou':
          await db.yonkous.add({
            captainId: successor.id!,
            baseIsland: randomIsland.id!,
            foundedAt: new Date(),
          })
          break
        case 'Shichibukai':
          await db.shichibukais.add({
            captainId: successor.id!,
            baseIsland: randomIsland.id!,
            foundedAt: new Date(),
          })
          break
        case 'Admiral':
          await db.admirals.add({
            marineId: successor.id!,
            baseIsland: randomIsland.id!,
            foundedAt: new Date(),
          })
          break
        case 'Gorousei':
          await db.gorouseis.add({
            govId: successor.id!,
            currentIsland: randomIsland.id!,
            foundedAt: new Date(),
          })
          break
      }

      console.log(`👑 ${successor.name} se tornou o novo ${bossType}!`)
    } catch (error) {
      console.error('Erro ao criar sucessor:', error)
    }
  }

  // ✅ ENCONTRAR CANDIDATOS PARA SUCESSÃO
  private static async findSuccessorCandidates(bossType: string): Promise<Character[]> {
    const minLevel = 150 // Nível mínimo para ser boss
    const minBounty = 500000000 // 500M de bounty mínimo

    let typeFilter: string[]

    switch (bossType) {
      case 'Yonkou':
      case 'Shichibukai':
        typeFilter = ['Pirate']
        break
      case 'Admiral':
        typeFilter = ['Marine']
        break
      case 'Gorousei':
        typeFilter = ['Government']
        break
      default:
        typeFilter = ['Pirate', 'Marine', 'Government']
    }

    // ✅ BUSCAR CANDIDATOS ELEGÍVEIS
    const candidates = await db.characters
      .where('level')
      .above(minLevel)
      .and(
        (char) =>
          char.bounty >= minBounty &&
          typeFilter.includes(char.type) &&
          char.position === 'Captain' &&
          char.isPlayer === 0, // Apenas NPCs
      )
      .toArray()

    return candidates
  }
}
