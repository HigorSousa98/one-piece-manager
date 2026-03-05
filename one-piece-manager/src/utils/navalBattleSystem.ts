// src/utils/navalBattleSystem.ts

import { db } from './database'
import { GameLogic } from './gameLogic'
import type { Crew, Character, Island } from './database'
import { useCharacterStore } from '@/stores/characterStore'
import { useBattleStore } from '@/stores/battleStore'
import { AllianceSystem } from './allianceSystem'
import { BattleNarrator } from './battleNarrator'

export interface BattleResult {
  victory: boolean
  playerCrew: Crew
  enemyCrew: Crew
  battleLog: string[]
  rewards?: {
    experience: number
    reputation: number
    bounty?: number
  }
  casualties?: {
    playerLosses: number
    enemyLosses: number
  }
}

export class NavalBattleSystem {
  // ✅ INICIAR BATALHA NAVAL
  static async startNavalBattle(
    playerCrewId: number,
    enemyCrewData: Crew,
    island: Island,
  ): Promise<BattleResult> {
    try {
      const battleStore = useBattleStore()
      console.log('⚔️ NavalBattleSystem - Iniciando batalha naval:', {
        playerCrewId,
        enemyCrew: enemyCrewData.name,
        island: island.name,
      })

      // Buscar crew do jogador
      const playerCrew = await db.crews.get(playerCrewId)

      if (!playerCrew) {
        throw new Error('Crew do jogador não encontrado para batalha')
      }

      // Usar o objeto do crew inimigo passado diretamente (evita race condition com worldUpdateWorker)
      const enemyCrew = enemyCrewData
      const enemyCrewId = enemyCrew.id!

      // Buscar membros dos crews
      const playerMembers = await db.characters.where('crewId').equals(playerCrewId).toArray()
      const enemyMembers = await db.characters.where('crewId').equals(enemyCrewId).toArray()

      console.log('👥 NavalBattleSystem - Membros encontrados:', {
        player: playerMembers.length,
        enemy: enemyMembers.length,
      })

      const devilFruits = await db.devilFruits.toArray()

      // Calcular poder de combate
      const playerPower = GameLogic.calculateCrewPower(playerMembers, devilFruits)
      const enemyPower = GameLogic.calculateCrewPower(enemyMembers, devilFruits)

      console.log('💪 NavalBattleSystem - Poder de combate:', {
        player: playerPower,
        enemy: enemyPower,
      })

      const battleResult = await battleStore.simulateCrewBattle(playerCrew, enemyCrew)

      // Executar batalha
      let battleResultReturn = <BattleResult>{
        victory: battleResult.winnerCrew.id == playerCrew.id,
        playerCrew: playerCrew,
        enemyCrew: enemyCrew,
      }
      return battleResultReturn
    } catch (error) {
      console.error('❌ NavalBattleSystem - Erro na batalha:', error)
      throw error
    }
  }

  // ✅ BATALHA NAVAL COM CREWS ALIADAS
  static async startNavalBattleWithAllies(
    playerCrewId: number,
    enemyCrewData: Crew,
    island: Island,
  ): Promise<BattleResult> {
    // Get active allied crew IDs and their power bonus
    const allyBonus = await AllianceSystem.getAlliedPowerBonus(playerCrewId)
    const activeAlliances = await AllianceSystem.getActiveAlliances(playerCrewId)

    const result = await this.startNavalBattle(playerCrewId, enemyCrewData, island)

    // Append alliance info to battle log
    if (activeAlliances.length > 0 && result.battleLog) {
      const allyNames = await Promise.all(
        activeAlliances.map(async (a) => {
          const crew = await db.crews.get(a.alliedCrewId)
          return crew?.name ?? `Crew #${a.alliedCrewId}`
        }),
      )
      const allyLog = allyNames.map((name) => `🤝 ${name} junta-se à batalha como aliada!`)
      result.battleLog.splice(1, 0, ...allyLog)

      // Give 20% of rewards to each allied crew
      if (result.victory && result.rewards) {
        const allyExp = Math.floor(result.rewards.experience * 0.2)
        const allyRep = Math.floor(result.rewards.reputation * 0.2)
        await Promise.all(
          activeAlliances.map(async (a) => {
            const allyCrew = await db.crews.get(a.alliedCrewId)
            if (allyCrew) {
              await db.crews.update(a.alliedCrewId, {
                reputation: (allyCrew.reputation || 0) + allyRep,
              })
              const captainMember = await db.characters
                .where('crewId')
                .equals(a.alliedCrewId)
                .and((c) => c.position === 'Captain')
                .first()
              if (captainMember?.id) {
                await db.characters.update(captainMember.id, {
                  experience: (captainMember.experience || 0) + allyExp,
                })
              }
            }
          }),
        )
      }
    }

    return result
  }

  // ✅ BONUS DE PODER POR TIPO
  static getTypePowerBonus(type: string): number {
    const bonuses = {
      Swordsman: 25,
      Navigator: 15,
      Cook: 10,
      Doctor: 12,
      Sniper: 22,
      Shipwright: 18,
      Musician: 8,
      Archaeologist: 10,
    }
    return bonuses[type as keyof typeof bonuses] || 10
  }

  // ✅ EXECUTAR BATALHA
  static executeBattle(
    playerCrew: Crew,
    enemyCrew: Crew,
    playerMembers: Character[],
    enemyMembers: Character[],
    playerPower: number,
    enemyPower: number,
    island: Island,
  ): BattleResult {
    const battleLog: string[] = []

    // Introdução da batalha
    battleLog.push(`🌊 Batalha Naval nas águas de ${island.name}!`)
    battleLog.push(`⚔️ ${playerCrew.name} vs ${enemyCrew.name}`)
    battleLog.push(`👥 ${playerMembers.length} vs ${enemyMembers.length} membros`)
    battleLog.push(`💪 Poder: ${playerPower} vs ${enemyPower}`)
    battleLog.push('')

    // Calcular vantagem
    const powerRatio = playerPower / enemyPower
    const baseChance = 0.5 // 50% base

    // Modificadores
    let winChance = baseChance

    if (powerRatio > 1.5) {
      winChance = 0.8 // 80% se muito mais forte
      battleLog.push('💪 Sua tripulação tem vantagem significativa!')
    } else if (powerRatio > 1.2) {
      winChance = 0.65 // 65% se mais forte
      battleLog.push('⚡ Sua tripulação tem ligeira vantagem!')
    } else if (powerRatio < 0.8) {
      winChance = 0.35 // 35% se mais fraco
      battleLog.push('😰 Vocês estão em desvantagem!')
    } else if (powerRatio < 0.6) {
      winChance = 0.2 // 20% se muito mais fraco
      battleLog.push('💀 A situação é crítica!')
    } else {
      battleLog.push('⚖️ As forças estão equilibradas!')
    }

    battleLog.push('')

    // Simular rounds de batalha
    const rounds = Math.floor(Math.random() * 3) + 3 // 3-5 rounds

    for (let i = 1; i <= rounds; i++) {
      const roundResult = this.simulateRound(playerMembers, enemyMembers, i)
      battleLog.push(...roundResult)
    }

    battleLog.push('')

    // Determinar vencedor
    const victory = Math.random() < winChance

    if (victory) {
      battleLog.push('🎉 VITÓRIA!')
      battleLog.push(`${playerCrew.name} emerge triunfante da batalha naval!`)
      battleLog.push(`${enemyCrew.name} bate em retirada!`)
    } else {
      battleLog.push('💀 DERROTA!')
      battleLog.push(`${enemyCrew.name} provou ser superior!`)
      battleLog.push(`${playerCrew.name} é forçado a recuar!`)
    }
    const winner = playerMembers.find((char) => char.position === 'Captain')
    const loser = enemyMembers.find((char) => char.position === 'Captain')
    // Calcular recompensas
    const rewards =
      victory && winner && loser
        ? this.calculateRewards(enemyCrew, island, winner, loser)
        : undefined
    const casualties = this.calculateCasualties(victory, playerMembers.length, enemyMembers.length)

    if (rewards) {
      battleLog.push('')
      battleLog.push('🏆 RECOMPENSAS:')
      battleLog.push(`💫 Experiência: +${rewards.experience}`)
      battleLog.push(`⭐ Reputação: +${rewards.reputation}`)
      if (rewards.bounty) {
        battleLog.push(`💰 Bounty: +${rewards.bounty.toLocaleString()} B$`)
      }
    }

    return {
      victory,
      playerCrew,
      enemyCrew,
      battleLog,
      rewards,
      casualties,
    }
  }

  // ✅ SIMULAR ROUND DE BATALHA
  static simulateRound(
    playerMembers: Character[],
    enemyMembers: Character[],
    round: number,
  ): string[] {
    const playerFighter = playerMembers[Math.floor(Math.random() * playerMembers.length)]
    const enemyFighter = enemyMembers[Math.floor(Math.random() * enemyMembers.length)]

    return BattleNarrator.getNavalRoundLines(
      { name: playerFighter.name, type: playerFighter.type, position: playerFighter.position },
      { name: enemyFighter.name, type: enemyFighter.type, position: enemyFighter.position },
      round,
    )
  }

  // ✅ CALCULAR RECOMPENSAS
  static calculateRewards(enemyCrew: Crew, island: Island, winner: Character, loser: Character) {
    const baseExp = GameLogic.calculateExperienceGain(winner, loser) * 5
    const baseRep = 25 + island.difficulty * 100
    const baseBounty = GameLogic.calculateBountyGain(winner, loser) * 5

    return {
      experience: baseExp,
      reputation: baseRep + Math.floor(Math.random() * 15),
      bounty: baseBounty > 0 ? baseBounty : undefined,
    }
  }

  // ✅ CALCULAR BAIXAS
  static calculateCasualties(victory: boolean, playerCount: number, enemyCount: number) {
    return {
      playerLosses: victory ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 3) + 1,
      enemyLosses: victory ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2),
    }
  }

  // ✅ APLICAR RECOMPENSAS
  static async applyVictoryRewards(
    playerCrewId: number,
    rewards: NonNullable<BattleResult['rewards']>,
    loser: Character,
  ) {
    try {
      console.log('🏆 NavalBattleSystem - Aplicando recompensas:', rewards)
      const battleStore = useBattleStore()

      // Buscar membros do crew
      const members = await db.characters
        .where('crewId')
        .equals(playerCrewId)
        .and((char) => char.position != 'Captain')
        .toArray()

      const captain = await db.characters
        .where('crewId')
        .equals(playerCrewId)
        .and((char) => char.position === 'Captain')
        .first()

      if (!captain || !members) return

      const expGained = Math.floor(rewards.experience / (members.length + 1))

      // ✅ Processar capitão e membros em paralelo
      const [captainUpdates, memberUpdates] = await Promise.all([
        battleStore.processCaptainUpdates(captain, expGained, rewards.bounty || 0, true),
        battleStore.processCrewMemberUpdates(
          captain,
          expGained,
          (rewards.bounty || 0) * (0.5 + Math.random() * 0.3),
          true,
          1,
        ),
      ])

      // ✅ Aplicar todas as atualizações em paralelo
      const allUpdates = [
        db.characters.update(captain.id!, captainUpdates),
        ...memberUpdates.map((update) => db.characters.update(update.id, update.updates)),
      ]

      await Promise.all(allUpdates)

      if (captain.isPlayer === 1) {
        const characterStore = useCharacterStore()
        await characterStore.loadPlayerCharacter()
        captain.level = captainUpdates.level || captain.level
        captain.bounty = captainUpdates.bounty || captain.bounty
        captain.experience = captainUpdates.experience || captain.experience
      }

      // Aplicar experiência a todos os membros
      for (const member of members) {
        const expPerMember = Math.floor(rewards.experience / members.length)
        await db.characters.update(member.id!, {
          experience: (member.experience || 0) + expPerMember,
        })
      }

      // Aplicar reputação ao crew
      const crew = await db.crews.get(playerCrewId)
      if (crew) {
        await db.crews.update(playerCrewId, {
          reputation: (crew.reputation || 0) + rewards.reputation,
        })
      }

      // Aplicar bounty (se houver)
      if (rewards.bounty) {
        const captain = members.find((m) => m.position === 'Captain')
        if (captain) {
          await db.characters.update(captain.id!, {
            bounty: (captain.bounty || 0) + rewards.bounty,
          })
        }
      }

      console.log('✅ NavalBattleSystem - Recompensas aplicadas com sucesso!')
    } catch (error) {
      console.error('❌ NavalBattleSystem - Erro ao aplicar recompensas:', error)
    }
  }
}
