// src/utils/worldSimulator.ts
import { GameLogic } from '@/utils/gameLogic'
import { db, Character, Battle } from '@/utils/database'
import { GenerationConfig } from '@/utils/generationConfig'

export class WorldSimulator {
  // 1. 🎯 SIMULAR BATALHAS DE NPCs
  static async simulateNPCBattles(
    playerBattleCount: number = 1,
    char: Character,
  ): Promise<{
    battlesSimulated: Character[]
    levelUps: number
    newYonkos: Character[]
    fallenLegends: Character[]
    summary: string[]
  }> {
    console.log('🌍 Simulando mundo dinâmico...')

    const results = {
      battlesSimulated: [] as Character[],
      levelUps: 0,
      newYonkos: [] as Character[],
      fallenLegends: [] as Character[],
      summary: [] as string[],
    }

    try {
      // Número de batalhas NPC baseado na atividade do jogador
      const npcBattlesToSimulate = this.calculateNPCBattles(playerBattleCount)

      for (let i = 0; i < npcBattlesToSimulate; i++) {
        const battleResult = await this.simulateSingleNPCBattle(char)

        if (battleResult) {
          results.battlesSimulated.push(battleResult.winner)

          // Verificar mudanças importantes
          if (battleResult.levelUp) {
            results.levelUps++
          }

          if (battleResult.newYonko) {
            results.newYonkos.push(battleResult.winner)
            results.summary.push(`🏴‍☠️ ${battleResult.winner.name} se tornou um novo Yonko!`)
          }

          if (battleResult.legendFell) {
            results.fallenLegends.push(battleResult.loser)
            results.summary.push(
              `💀 ${battleResult.loser.name} foi derrotado por ${battleResult.winner.name}!`,
            )
          }

          if (battleResult.kingHakiAwakened) {
            results.summary.push(`👑 ${battleResult.winner.name} manifestou o Haki do Conquistador!`)
          }

          // Adicionar eventos interessantes
          if (battleResult.bountyGain > 100000000) {
            // 100M+
            results.summary.push(
              `💰 ${battleResult.winner.name} ganhou ${this.formatBounty(battleResult.bountyGain)} de bounty!`,
            )
          }
        }

        // Pequena pausa para não sobrecarregar
        if (i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1))
        }
      }

      console.log(`✅ ${results.battlesSimulated.length} batalhas NPC simuladas`)

      // A cada ciclo com 5+ batalhas, rodar atividade de inventário dos NPCs
      if (npcBattlesToSimulate >= 5) {
        try {
          await this.simulateNPCItemActivity()
        } catch {
          // Silencioso
        }
      }

      return results
    } catch (error) {
      console.error('❌ Erro ao simular mundo:', error)
      return results
    }
  }

  // 2. ⚔️ SIMULAR UMA BATALHA NPC
  private static async simulateSingleNPCBattle(char: Character): Promise<{
    winner: Character
    loser: Character
    expGain: number
    bountyGain: number
    levelUp: boolean
    newYonko: boolean
    legendFell: boolean
    kingHakiAwakened: boolean
  } | null> {
    try {
      // Buscar dois NPCs para batalhar
      const [fighter1, fighter2] = await this.findNPCOpponents(char)

      if (!fighter1 || !fighter2) {
        return null
      }

      // Simular batalha usando o sistema existente
      const battleResult = await this.simulateBattle(fighter1, fighter2)

      if (!battleResult) return null

      const { winner, loser } = battleResult

      // Calcular recompensas
      const expGain = GameLogic.calculateExperienceGain(winner, loser)
      const bountyGain = Math.round(GameLogic.calculateBountyGain(winner, loser) * GenerationConfig.createLarge().simulationBountyMultiplier)

      // Aplicar recompensas
      const oldLevel = winner.level
      const oldBounty = winner.bounty

      winner.experience += expGain
      winner.bounty += bountyGain

      // Verificar level up
      const expNeeded = GameLogic.nextLevelUp(winner)
      const levelCheck = winner.experience >= expNeeded
      let levelUp = false
      let kingHakiAwakened = false

      if (levelCheck) {
        winner.level += 1
        winner.experience -= expNeeded
        levelUp = true

        const styleCombat = await db.styleCombats.get(winner.styleCombatId)
        const devilFruit = winner.devilFruitId ? await db.devilFruits.get(winner.devilFruitId) : null
        if (styleCombat) {
          const statIncrease = GameLogic.increaseStats(winner, winner.level, styleCombat, devilFruit ?? null)
          winner.stats = { ...winner.stats, ...statIncrease }
        } else {
          kingHakiAwakened = this.applyLevelUpBonus(winner)
        }
      }

      // Verificar mudanças importantes
      const newYonko = this.checkNewYonko(winner, oldLevel)
      const legendFell = this.checkLegendFell(loser)

      // Salvar mudanças no banco
      await Promise.all([
        db.characters.update(winner.id!, {
          experience: winner.experience,
          level: winner.level,
          bounty: winner.bounty,
          stats: winner.stats,
        }),
        this.saveBattleRecord(winner, loser, expGain, bountyGain),
      ])

      // Roubo de itens pós-batalha NPC
      try {
        const { InventorySystem } = await import('./inventorySystem')
        const theft = await InventorySystem.rollItemTheft(winner.id!, loser.id!)
        if (theft.stolenItems.length > 0) {
          await InventorySystem.optimizeEquipment(winner.id!)
        }
      } catch {
        // Silencioso: não interrompe a simulação
      }

      return {
        winner,
        loser,
        expGain,
        bountyGain,
        levelUp,
        newYonko,
        legendFell,
        kingHakiAwakened,
      }
    } catch (error) {
      console.error('Erro ao simular batalha NPC:', error)
      return null
    }
  }

  // 3. 🎯 ENCONTRAR OPONENTES NPCs
  private static async findNPCOpponents(
    char: Character,
  ): Promise<[Character | null, Character | null]> {
    try {
      // Buscar NPCs ativos (não é jogador)
      const allNPCs = await db.characters.where('isPlayer').equals(0).toArray()

      // Filtrar depois
      const filteredNPCs = allNPCs.filter((npc) => npc.id !== char.id)

      if (filteredNPCs.length < 2) {
        return [null, null]
      }

      // Escolher primeiro lutador aleatoriamente
      const fighter1 = filteredNPCs[Math.floor(Math.random() * filteredNPCs.length)]

      // Encontrar oponente compatível (level similar)
      const levelRange = this.calculateLevelRange(fighter1.level)
      const potentialOpponents = filteredNPCs.filter(
        (npc) =>
          npc.id !== fighter1.id && npc.level >= levelRange.min && npc.level <= levelRange.max,
      )

      if (potentialOpponents.length === 0) {
        // Se não encontrar no range, expandir busca
        const expandedOpponents = filteredNPCs.filter(
          (npc) => npc.id !== fighter1.id && Math.abs(npc.level - fighter1.level) <= 10,
        )

        if (expandedOpponents.length === 0) {
          return [null, null]
        }

        const fighter2 = expandedOpponents[Math.floor(Math.random() * expandedOpponents.length)]
        return [fighter1, fighter2]
      }

      // Priorizar oponentes interessantes
      const prioritizedOpponents = this.prioritizeOpponents(fighter1, potentialOpponents)
      const fighter2 =
        prioritizedOpponents[Math.floor(Math.random() * Math.min(prioritizedOpponents.length, 5))]

      return [fighter1, fighter2]
    } catch (error) {
      console.error('Erro ao encontrar oponentes NPCs:', error)
      return [null, null]
    }
  }

  // 4. 🎲 CALCULAR RANGE DE LEVEL PARA BATALHAS
  private static calculateLevelRange(level: number): { min: number; max: number } {
    const variance = Math.max(2, Math.floor(level * 0.15)) // 15% de variação, mínimo 2

    return {
      min: Math.max(1, level - variance),
      max: level + variance,
    }
  }

  // 5. 🎯 PRIORIZAR OPONENTES INTERESSANTES
  private static prioritizeOpponents(fighter: Character, opponents: Character[]): Character[] {
    return opponents.sort((a, b) => {
      let scoreA = 0
      let scoreB = 0

      // Priorizar tipos diferentes (mais interessante)
      if (a.type !== fighter.type) scoreA += 3
      if (b.type !== fighter.type) scoreB += 3

      // Priorizar rivais (Pirate vs Marine)
      if (
        (fighter.type === 'Pirate' && a.type === 'Marine') ||
        (fighter.type === 'Marine' && a.type === 'Pirate')
      ) {
        scoreA += 5
      }
      if (
        (fighter.type === 'Pirate' && b.type === 'Marine') ||
        (fighter.type === 'Marine' && b.type === 'Pirate')
      ) {
        scoreB += 5
      }

      // Priorizar levels próximos
      const levelDiffA = Math.abs(fighter.level - a.level)
      const levelDiffB = Math.abs(fighter.level - b.level)
      scoreA += Math.max(0, 5 - levelDiffA)
      scoreB += Math.max(0, 5 - levelDiffB)

      // Priorizar bounties altos
      if (a.bounty > 100000000) scoreA += 2
      if (b.bounty > 100000000) scoreB += 2

      return scoreB - scoreA
    })
  }

  // 6. ⚔️ SIMULAR BATALHA (usando lógica existente)
  private static async simulateBattle(
    fighter1: Character,
    fighter2: Character,
  ): Promise<{
    winner: Character
    loser: Character
  } | null> {
    try {
      // Calcular poderes
      const allDevilFruits = await db.devilFruits.toArray()
      const power1 = GameLogic.calculatePower(
        fighter1,
        allDevilFruits.find((df) => df.id === fighter1.devilFruitId),
      )
      const power2 = GameLogic.calculatePower(
        fighter2,
        allDevilFruits.find((df) => df.id === fighter2.devilFruitId),
      )

      // Calcular probabilidade de vitória
      const totalPower = power1 + power2
      const fighter1WinChance = power1 / totalPower

      // Adicionar elemento de sorte (10% de variação)
      const luck = Math.random() * 0.2 - 0.1
      const finalWinChance = Math.max(0.05, Math.min(0.95, fighter1WinChance + luck))

      // Determinar vencedor
      const fighter1Wins = Math.random() < finalWinChance

      return {
        winner: fighter1Wins ? fighter1 : fighter2,
        loser: fighter1Wins ? fighter2 : fighter1,
      }
    } catch (error) {
      console.error('Erro ao simular batalha:', error)
      return null
    }
  }

  // 7. 📈 APLICAR BONUS DE LEVEL UP — retorna true se King's Haki foi despertado
  private static applyLevelUpBonus(character: Character): boolean {
    const pointsToDistribute = 3
    let kingHakiAwakened = false

    for (let i = 0; i < pointsToDistribute; i++) {
      const statToIncrease = Math.random()

      if (statToIncrease < 0.2) {
        character.stats.attack += 1
      } else if (statToIncrease < 0.4) {
        character.stats.defense += 1
      } else if (statToIncrease < 0.6) {
        character.stats.speed += 1
      } else if (statToIncrease < 0.75) {
        character.stats.armHaki += 1
      } else if (statToIncrease < 0.9) {
        character.stats.obsHaki += 1
      } else if (statToIncrease < 0.98) {
        character.stats.devilFruit += 1
      } else {
        // 2% chance de despertar Haki do Conquistador
        if (character.stats.kingHaki === 0 && character.level >= 50 && character.potentialToHaveKngHaki) {
          character.stats.kingHaki = 1
          kingHakiAwakened = true
        } else if (character.stats.kingHaki > 0) {
          character.stats.kingHaki += 1
        }
      }
    }

    return kingHakiAwakened
  }

  // 8. 👑 VERIFICAR NOVO YONKO
  private static checkNewYonko(character: Character, oldLevel: number): boolean {
    return character.level >= 95 && oldLevel < 95 && character.type === 'Pirate'
  }

  // 9. 💀 VERIFICAR QUEDA DE LENDA
  private static checkLegendFell(character: Character): boolean {
    return character.level >= 90 || character.bounty >= 1000000000
  }

  // 10. 📊 CALCULAR NÚMERO DE BATALHAS NPC
  private static calculateNPCBattles(playerBattles: number): number {
    // Para cada batalha do jogador, simular 3-7 batalhas NPC
    const dataSize = GenerationConfig.createEpic().battleSimulatedByTurn
    const baseNPCBattles = playerBattles * GameLogic.randomBetween(dataSize * 0.7, dataSize)

    // Adicionar variação baseada no tempo
    const timeVariation = GameLogic.randomBetween(10, 50)

    return Math.max(baseNPCBattles + timeVariation, dataSize)
  }

  // 11. 💾 SALVAR REGISTRO DE BATALHA
  private static async saveBattleRecord(
    winner: Character,
    loser: Character,
    expGain: number,
    bountyGain: number,
  ): Promise<void> {
    try {
      await db.battles.add({
        timestamp: new Date(),
        challenger: winner.id!,
        opponent: loser.id!,
        winner: winner.id!,
        loser: loser.id!,
        experienceGained: expGain,
        bountyGained: bountyGain,
        battleLog: [],
        challengerCrewId: winner.crewId || 0,
        opponentCrewId: loser.crewId || 0,
      })
    } catch (error) {
      console.error('Erro ao salvar batalha:', error)
    }
  }

  // 12. 🎮 FUNÇÃO PRINCIPAL - CHAMAR APÓS BATALHA DO JOGADOR
  static async updateWorldAfterPlayerBattle(char: Character): Promise<{
    success: boolean
    results?: any
    message: string
  }> {
    try {
      console.log('🌍 Atualizando mundo após batalha do jogador...')

      const results = await this.simulateNPCBattles(1, char)

      let message = `🌍 Mundo atualizado! ${results.battlesSimulated} batalhas simuladas.`

      if (results.newYonkos.length > 0) {
        message += ` 👑 Novos Yonkos: ${results.newYonkos.map((y) => y.name).join(', ')}`
      }

      if (results.fallenLegends.length > 0) {
        message += ` 💀 Lendas caídas: ${results.fallenLegends.map((l) => l.name).join(', ')}`
      }

      return {
        success: true,
        results,
        message,
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar mundo:', error)
      return {
        success: false,
        message: 'Erro ao atualizar mundo',
      }
    }
  }

  // 13. 🛒 ATIVIDADE DE INVENTÁRIO DOS NPCs
  private static async simulateNPCItemActivity(): Promise<void> {
    try {
      const { InventorySystem } = await import('./inventorySystem')

      const playerChar = await db.characters.where('isPlayer').equals(1).first()
      const playerCrewId = playerChar?.crewId ?? -1
      const npcCrews = (await db.crews.toArray()).filter((c) => c.id !== playerCrewId)

      for (const crew of npcCrews) {
        if (!crew.currentIsland || !crew.id) continue

        // 10% de chance por crew por chamada (não sobrecarregar)
        if (Math.random() >= 0.1) continue

        const members = await db.characters.where('crewId').equals(crew.id).toArray()
        if (members.length === 0) continue

        // Escolher membro aleatório para tentar comprar
        const buyer = members[Math.floor(Math.random() * members.length)]
        const bought = await InventorySystem.npcBuyBestItem(
          buyer.id!,
          crew.id,
          crew.currentIsland,
        )
        if (bought) {
          await InventorySystem.optimizeEquipment(buyer.id!)
        }

        // 1% de chance: otimizar equipamento de todos os membros
        if (Math.random() < 0.01) {
          for (const member of members) {
            await InventorySystem.optimizeEquipment(member.id!)
          }
        }
      }
    } catch {
      // Silencioso
    }
  }

  private static formatBounty(bounty: number): string {
    if (bounty >= 1000000000) {
      return `${(bounty / 1000000000).toFixed(1)}B Berries`
    } else if (bounty >= 1000000) {
      return `${(bounty / 1000000).toFixed(1)}M Berries`
    } else if (bounty >= 1000) {
      return `${(bounty / 1000).toFixed(1)}K Berries`
    }
    return `${bounty} Berries`
  }
}
