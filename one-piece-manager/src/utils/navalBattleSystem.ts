// src/utils/navalBattleSystem.ts

import { db } from './database'
import { GameLogic } from './gameLogic'
import type { Crew, Character, Island } from './database'
import { useCharacterStore } from '@/stores/characterStore'
import { useBattleStore } from '@/stores/battleStore'

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
    enemyCrewId: number, 
    island: Island
  ): Promise<BattleResult> {
    try {
      console.log('⚔️ NavalBattleSystem - Iniciando batalha naval:', {
        playerCrewId,
        enemyCrewId,
        island: island.name
      })
      
      // Buscar crews
      const playerCrew = await db.crews.get(playerCrewId)
      const enemyCrew = await db.crews.get(enemyCrewId)
      
      if (!playerCrew || !enemyCrew) {
        throw new Error('Crews não encontrados para batalha')
      }
      
      // Buscar membros dos crews
      const playerMembers = await db.characters
        .where('crewId')
        .equals(playerCrewId)
        .toArray()
      
      const enemyMembers = await db.characters
        .where('crewId')
        .equals(enemyCrewId)
        .toArray()
      
      console.log('👥 NavalBattleSystem - Membros encontrados:', {
        player: playerMembers.length,
        enemy: enemyMembers.length
      })

      const devilFruits = await db.devilFruits.toArray()
      
      // Calcular poder de combate
      const playerPower = GameLogic.calculateCrewPower(playerMembers, devilFruits)
      const enemyPower = GameLogic.calculateCrewPower(enemyMembers, devilFruits)
      
      console.log('💪 NavalBattleSystem - Poder de combate:', {
        player: playerPower,
        enemy: enemyPower
      })
      
      // Executar batalha
      const battleResult = this.executeBattle(
        playerCrew,
        enemyCrew,
        playerMembers,
        enemyMembers,
        playerPower,
        enemyPower,
        island
      )

      const loserCaptain = enemyMembers.find(char => char.position === 'Captain')
      
      // Aplicar recompensas/penalidades
      if (battleResult.victory && loserCaptain) {
        await this.applyVictoryRewards(playerCrewId, battleResult.rewards!, loserCaptain)
      }
      
      console.log('✅ NavalBattleSystem - Batalha concluída:', {
        victory: battleResult.victory,
        rewards: battleResult.rewards
      })
      
      return battleResult
      
    } catch (error) {
      console.error('❌ NavalBattleSystem - Erro na batalha:', error)
      throw error
    }
  }
  
  // ✅ BONUS DE PODER POR TIPO
  static getTypePowerBonus(type: string): number {
    const bonuses = {
      'Swordsman': 25,
      'Navigator': 15,
      'Cook': 10,
      'Doctor': 12,
      'Sniper': 22,
      'Shipwright': 18,
      'Musician': 8,
      'Archaeologist': 10
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
    island: Island
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
    const winner = playerMembers.find(char => char.position === 'Captain')
    const loser = enemyMembers.find(char => char.position === 'Captain')
    // Calcular recompensas
    const rewards = (victory && winner && loser) ? this.calculateRewards(enemyCrew, island, winner, loser) : undefined
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
      casualties
    }
  }
  
  // ✅ SIMULAR ROUND DE BATALHA
  static simulateRound(playerMembers: Character[], enemyMembers: Character[], round: number): string[] {
    const log: string[] = []
    
    // Selecionar combatentes aleatórios
    const playerFighter = playerMembers[Math.floor(Math.random() * playerMembers.length)]
    const enemyFighter = enemyMembers[Math.floor(Math.random() * enemyMembers.length)]
    
    const actions = [
      `Round ${round}: ${playerFighter.name} ataca com ${this.getRandomAttack(playerFighter.type)}!`,
      `${enemyFighter.name} contra-ataca com ${this.getRandomAttack(enemyFighter.type)}!`,
      `Os navios trocam tiros de canhão!`,
      `${playerFighter.name} e ${enemyFighter.name} duelam no convés!`,
      `Manobras navais intensas acontecem!`
    ]
    
    const randomAction = actions[Math.floor(Math.random() * actions.length)]
    log.push(`⚔️ ${randomAction}`)
    
    return log
  }
  
  // ✅ ATAQUES ALEATÓRIOS POR TIPO
  static getRandomAttack(type: string): string {
    const attacks = {
      'Swordsman': ['Corte Devastador', 'Técnica das Três Espadas', 'Rajada de Lâminas'],
      'Navigator': ['Manobra Evasiva', 'Previsão do Tempo', 'Rota de Fuga'],
      'Cook': ['Chute Flamejante', 'Técnica Culinária', 'Ataque Nutritivo'],
      'Doctor': ['Cirurgia de Campo', 'Tratamento Rápido', 'Análise Médica'],
      'Sniper': ['Tiro Certeiro', 'Rajada Precisa', 'Tiro à Distância'],
      'Shipwright': ['Martelo Devastador', 'Reparo Rápido', 'Técnica de Construção'],
      'Musician': ['Melodia Hipnótica', 'Acorde Ensurdecedor', 'Ritmo de Batalha'],
      'Archaeologist': ['Conhecimento Antigo', 'Técnica Histórica', 'Poder Ancestral']
    }
    
    const typeAttacks = attacks[type as keyof typeof attacks] || ['Ataque Básico', 'Golpe Simples']
    return typeAttacks[Math.floor(Math.random() * typeAttacks.length)]
  }
  
  // ✅ CALCULAR RECOMPENSAS
  static calculateRewards(enemyCrew: Crew, island: Island, winner: Character, loser: Character) {
    const baseExp = GameLogic.calculateExperienceGain(winner, loser) * 5
    const baseRep = 25 + (island.difficulty * 100)
    const baseBounty = GameLogic.calculateBountyGain(winner, loser) * 5
    
    return {
      experience: baseExp,
      reputation: baseRep + Math.floor(Math.random() * 15),
      bounty: baseBounty > 0 ? baseBounty : undefined
    }
  }
  
  // ✅ CALCULAR BAIXAS
  static calculateCasualties(victory: boolean, playerCount: number, enemyCount: number) {
    return {
      playerLosses: victory ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 3) + 1,
      enemyLosses: victory ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2)
    }
  }
  
  // ✅ APLICAR RECOMPENSAS
  static async applyVictoryRewards(playerCrewId: number, rewards: NonNullable<BattleResult['rewards']>, loser: Character) {
    try {
      console.log('🏆 NavalBattleSystem - Aplicando recompensas:', rewards)
      const battleStore = useBattleStore()
      
      // Buscar membros do crew
      const members = await db.characters
        .where('crewId')
        .equals(playerCrewId)
        .and(char => char.position != 'Captain')
        .toArray()

    const captain = await db.characters
        .where('crewId')
        .equals(playerCrewId)
        .and(char => char.position === 'Captain')
        .first()

        if(!captain || !members) return 

        const expGained = Math.floor(rewards.experience / (members.length + 1))

        // ✅ Processar capitão e membros em paralelo
        const [captainUpdates, memberUpdates] = await Promise.all([
            battleStore.processCaptainUpdates(captain, expGained, rewards.bounty || 0, true),
            battleStore.processCrewMemberUpdates(captain, expGained, (rewards.bounty || 0) * (0.5 + Math.random() * 0.3), true, 1)
        ])

        // ✅ Aplicar todas as atualizações em paralelo
        const allUpdates = [
            db.characters.update(captain.id!, captainUpdates),
            ...memberUpdates.map(update => 
            db.characters.update(update.id, update.updates)
            )
        ]

        await Promise.all(allUpdates)

        if(captain.isPlayer === 1){
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
          experience: (member.experience || 0) + expPerMember
        })
      }
      
      // Aplicar reputação ao crew
      const crew = await db.crews.get(playerCrewId)
      if (crew) {
        await db.crews.update(playerCrewId, {
          reputation: (crew.reputation || 0) + rewards.reputation
        })
      }
      
      // Aplicar bounty (se houver)
      if (rewards.bounty) {
        const captain = members.find(m => m.position === 'Captain')
        if (captain) {
          await db.characters.update(captain.id!, {
            bounty: (captain.bounty || 0) + rewards.bounty
          })
        }
      }
      
      console.log('✅ NavalBattleSystem - Recompensas aplicadas com sucesso!')
      
    } catch (error) {
      console.error('❌ NavalBattleSystem - Erro ao aplicar recompensas:', error)
    }
  }
}