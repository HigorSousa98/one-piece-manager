// stores/battleStore.ts
import { defineStore } from 'pinia'
import { GameLogic } from '@/utils/gameLogic'
import { BattleNarrator } from '@/utils/battleNarrator'
import { WorldSimulator } from '@/utils/worldSimulator'
import { AdventureSystem } from '@/utils/adventureSystem'
import { RecruitmentSystem, type RecruitmentAttempt } from '@/utils/recruitmentSystem'
import { db, Character, Battle, DevilFruit, StyleCombat, Crew } from '@/utils/database'
import { useCharacterStore } from '@/stores/characterStore'
import { GenerationConfig } from '@/utils/generationConfig'
import { CrewNameGenerator } from '@/data/crewNames'
import { ShipNameGenerator } from '@/data/shipNameGenerator'

interface BattleResult {
  winner: Character
  loser: Character
  challenger: Character
  opponent: Character
  experienceGained: number
  bountyChange: number
  treasuryStole: number
  battleLog: string[]
  canShowRecruitment: boolean
  recruitmentData?: RecruitmentAttempt
}

export interface CrewRecruitmentResult {
  recruited: Character[]
  removed: Character[]
  recruitmentAttempts: number
  removalAttempts: number
}

export interface CrewCapacityInfo {
  currentMembers: number
  maxCapacity: number
  hasSpace: boolean
  shipLevel: number
}

export const useBattleStore = defineStore('battle', {
  state: () => ({
    currentBattle: null as Battle | null,
    isSimulating: false,
    battleHistory: [] as Battle[],
  }),

  actions: {
    async simulateBattle(
      char1: Character,
      char2: Character,
      extraReward?: number,
      extraExp?: number,
      withoutHelp?: boolean,
      fromLiberation?: true
    ): Promise<BattleResult> {
      this.isSimulating = true

      try {
        // Buscar Devil Fruits dos personagens (se tiverem)
        const char1DevilFruit = char1.devilFruitId
          ? await db.devilFruits.get(char1.devilFruitId)
          : null
        const char2DevilFruit = char2.devilFruitId
          ? await db.devilFruits.get(char2.devilFruitId)
          : null

        // Buscar Devil Fruits dos personagens (se tiverem)
        const char1StyleCombat = await db.styleCombats.get(char1.styleCombatId)
        const char2StyleCombat = await db.styleCombats.get(char2.styleCombatId)

        // Calcular poder com frutas
        const attackerPower = GameLogic.calculatePower(char1, char1DevilFruit)
        const defenderPower = GameLogic.calculatePower(char2, char2DevilFruit)

        const attackerCrewHelp = withoutHelp ? 0 : await this.calculateCrewHelp(char1, null)
        const defenderCrewHelp = withoutHelp ? 0 : await this.calculateCrewHelp(char2, char1)

        // Aplicar vantagem de tipo
        const typeAdvantage = GameLogic.getTypeAdvantage(char1, char2)
        // Aplicar vantagem de Style Combat
        const styleAdvantage = GameLogic.getsStyleAdvantage(char1StyleCombat, char2StyleCombat)
        const finalAttackerPower = attackerPower * typeAdvantage * styleAdvantage + attackerCrewHelp

        // Calcular probabilidade de vitória
        const totalPower = finalAttackerPower + defenderPower + defenderCrewHelp
        const winChance = finalAttackerPower / totalPower

        const log: string[] = []

        log.push(`🥊 Batalha iniciada entre ${char1.name} e ${char2.name}!`)

        const attackerDice = GameLogic.diceUsed(winChance)
        const defenderDice = GameLogic.diceUsed(1 - winChance)

        // ── Haki values ─────────────────────────────────────────
        const c1arm  = char1.stats.armHaki  ?? 0
        const c2arm  = char2.stats.armHaki  ?? 0
        const c1obs  = char1.stats.obsHaki  ?? 0
        const c2obs  = char2.stats.obsHaki  ?? 0
        const c1king = char1.stats.kingHaki ?? 0
        const c2king = char2.stats.kingHaki ?? 0

        let attackerHp = GameLogic.healthPointsCharacter(char1.level)
        let defenderHp = GameLogic.healthPointsCharacter(char2.level)

        // Arm Haki — coating armor: up to +15% HP
        attackerHp = Math.round(attackerHp * (1 + Math.min(0.15, c1arm * 0.00015)))
        defenderHp = Math.round(defenderHp * (1 + Math.min(0.15, c2arm * 0.00015)))

        // King's Haki — intimidation: reduce opponent starting HP when clearly dominant
        if (c1king >= 50 && winChance > 0.55) {
          const intimidation = Math.min(0.15, c1king * 0.0002)
          defenderHp = Math.round(defenderHp * (1 - intimidation))
          log.push(`👑 ${char1.name} emana o Haki do Conquistador! ${char2.name} sente o peso de sua presença!`)
        }
        if (c2king >= 50 && winChance < 0.45) {
          const intimidation = Math.min(0.15, c2king * 0.0002)
          attackerHp = Math.round(attackerHp * (1 - intimidation))
          log.push(`👑 ${char2.name} emana o Haki do Conquistador! ${char1.name} sente o peso de sua presença!`)
        }

        // Obs Haki — heightened senses
        if (c1obs >= 100 || c2obs >= 100) {
          const hakiUser = c1obs >= c2obs ? char1.name : char2.name
          log.push(`👁️ ${hakiUser} aguça sua percepção com o Haki da Observação!`)
        }

        // Track max HP for pressure narration
        const attackerMaxHp = attackerHp
        const defenderMaxHp = defenderHp

        let fighting = true

        while (fighting) {
          const attackerRoll = GameLogic.rollDice(attackerDice)
          // Obs Haki dodge — defender evades attacker's blow
          const c2DodgeChance = c2obs >= 100 ? Math.min(0.25, (c2obs - 100) * 0.001) : 0
          if (c2obs >= 100 && Math.random() < c2DodgeChance) {
            log.push(BattleNarrator.getDodgeLine(char2.name, char2StyleCombat?.name))
          } else {
            defenderHp -= attackerRoll
            if (attackerRoll > attackerDice) {
              const armCritBonus = c1arm > 0 ? Math.floor(attackerRoll * Math.min(0.4, c1arm * 0.0004)) : 0
              if (armCritBonus > 0) {
                defenderHp -= armCritBonus
                log.push(BattleNarrator.getAttackLine(char1.name, char1StyleCombat?.name, attackerRoll, true, armCritBonus, defenderHp, defenderMaxHp))
              } else {
                log.push(BattleNarrator.getAttackLine(char1.name, char1StyleCombat?.name, attackerRoll, true, 0, defenderHp, defenderMaxHp))
              }
            } else {
              log.push(BattleNarrator.getAttackLine(char1.name, char1StyleCombat?.name, attackerRoll, false, 0, defenderHp, defenderMaxHp))
            }
          }

          if (defenderHp <= 0) {
            fighting = false
            log.push(BattleNarrator.getDefeatLine(char2.name, char2StyleCombat?.name))
          } else {
            const defenderRoll = GameLogic.rollDice(defenderDice)
            // Obs Haki dodge — attacker evades counterattack
            const c1DodgeChance = c1obs >= 100 ? Math.min(0.25, (c1obs - 100) * 0.001) : 0
            if (c1obs >= 100 && Math.random() < c1DodgeChance) {
              log.push(BattleNarrator.getDodgeLine(char1.name, char1StyleCombat?.name))
            } else {
              attackerHp -= defenderRoll
              if (defenderRoll > defenderDice) {
                const armCritBonus = c2arm > 0 ? Math.floor(defenderRoll * Math.min(0.4, c2arm * 0.0004)) : 0
                if (armCritBonus > 0) {
                  attackerHp -= armCritBonus
                  log.push(BattleNarrator.getAttackLine(char2.name, char2StyleCombat?.name, defenderRoll, true, armCritBonus, attackerHp, attackerMaxHp))
                } else {
                  log.push(BattleNarrator.getAttackLine(char2.name, char2StyleCombat?.name, defenderRoll, true, 0, attackerHp, attackerMaxHp))
                }
              } else {
                log.push(BattleNarrator.getAttackLine(char2.name, char2StyleCombat?.name, defenderRoll, false, 0, attackerHp, attackerMaxHp))
              }
            }
            if (attackerHp <= 0) {
              fighting = false
              log.push(BattleNarrator.getDefeatLine(char1.name, char1StyleCombat?.name))
            }
          }
        }

        const char1Wins = defenderHp <= 0 ? true : false

        const result = await this.generateBattleResult(
          char1,
          char2,
          char1Wins,
          attackerPower,
          defenderPower,
          extraReward,
          extraExp,
          log,
        )

        // Salva no banco local
        await this.saveBattleResult(result)

        this.isSimulating = false
        return result
      } catch (error) {
        this.isSimulating = false
        console.error('Erro na simulação de batalha:', error)
        throw error
      }
    },

    async simulateCrewBattle(
      crew1: Crew,
      crew2: Crew,
    ): Promise<{
      winnerCrew: Crew
      loserCrew: Crew
      casualties: number
    } | null> {
      try {
        const allDevilFruits = await db.devilFruits.toArray()

        // Buscar capitães dos crews
        const [captain1, captain2] = await Promise.all([
          db.characters.get(crew1.captainId),
          db.characters.get(crew2.captainId),
        ])

        if (!captain1 || !captain2) return null

        // Calcular poder total dos crews
        const [crew1Members, crew2Members] = await Promise.all([
          db.characters.where('crewId').equals(crew1.id!).toArray(),
          db.characters.where('crewId').equals(crew2.id!).toArray(),
        ])

        // King's Haki captain modifier: up to +10% crew power
        const crew1KingMod = (captain1.stats.kingHaki ?? 0) >= 50
          ? 1 + Math.min(0.1, (captain1.stats.kingHaki ?? 0) * 0.001)
          : 1
        const crew2KingMod = (captain2.stats.kingHaki ?? 0) >= 50
          ? 1 + Math.min(0.1, (captain2.stats.kingHaki ?? 0) * 0.001)
          : 1

        const crew1Wins = this.simulateCrewBattleMembers(crew1Members, crew2Members, allDevilFruits, crew1KingMod, crew2KingMod)

        const winnerCrew = crew1Wins ? crew1 : crew2
        const loserCrew = crew1Wins ? crew2 : crew1

        // Simular batalha entre capitães para XP/Bounty
        const winnerCaptain = crew1Wins ? captain1 : captain2
        const loserCaptain = crew1Wins ? captain2 : captain1

        // Aplicar recompensas ao capitão vencedor
        const expGain = GameLogic.calculateExperienceGain(winnerCaptain, loserCaptain)
        const bountyGain = GameLogic.calculateBountyGain(winnerCaptain, loserCaptain)

        // ✅ Processar capitão e membros em paralelo
        const [captainUpdates, memberUpdates] = await Promise.all([
          this.processCaptainUpdates(winnerCaptain, expGain, bountyGain, true),
          this.processCrewMemberUpdates(
            winnerCaptain,
            expGain,
            bountyGain,
            true,
            GenerationConfig.createEpic().regularCrewSharedGain,
          ),
        ])

        // ✅ Aplicar todas as atualizações em paralelo
        const allUpdates = [
          db.characters.update(winnerCaptain.id!, captainUpdates),
          ...memberUpdates.map((update) => db.characters.update(update.id, update.updates)),
        ]

        await Promise.all(allUpdates)

        // ✅ PROCESSAR RECRUTAMENTO E REMOÇÃO
        const recruitmentResult = await this.processCrewRecruitmentAndRemoval(
          winnerCrew.id!,
          loserCrew.id!,
          false, // Não é player
        )

        // ✅ VERIFICAR SE CREW PERDEDOR FICOU SEM MEMBROS
        const remainingLoserMembers = await db.characters
          .where('crewId')
          .equals(loserCrew.id!)
          .toArray()

        if (remainingLoserMembers.length === 0) {
          // Remover crew vazio
          await db.crews.delete(loserCrew.id!)

          // Remover navio do crew
          const ship = await db.ships.where('crewId').equals(loserCrew.id!).first()
          if (ship) {
            await db.ships.delete(ship.id!)
          }
        }

        // ✅ CRIAR NOVO CREW PARA MEMBROS REMOVIDOS (SE HOUVER SUFICIENTES)
        if (recruitmentResult.removed.length >= 1) {
          const newCrew = await this.createCrewForOrphanMembers(
            recruitmentResult.removed,
            loserCrew.currentIsland,
          )
        }

        // Atualizar reputação dos crews
        winnerCrew.reputation += Math.floor(loserCrew.reputation * 0.1)
        loserCrew.reputation = Math.max(
          0,
          loserCrew.reputation - Math.floor(loserCrew.reputation * 0.05),
        )

        await Promise.all([
          db.crews.update(winnerCrew.id!, { reputation: winnerCrew.reputation }),
          db.crews.update(loserCrew.id!, { reputation: loserCrew.reputation }),
        ])

        // Registrar batalha
        await db.battles.add({
          timestamp: new Date(),
          challenger: winnerCaptain.id!,
          opponent: loserCaptain.id!,
          winner: winnerCaptain.id!,
          loser: loserCaptain.id!,
          experienceGained: expGain,
          bountyGained: bountyGain,
          battleLog: [
            `${winnerCaptain.name} derrotou ${loserCaptain.name} em uma batalha entre crews!`,
          ],
          challengerCrewId: winnerCrew.id!,
          opponentCrewId: loserCrew.id!,
        })

        const casualties = Math.floor(Math.random() * 3) // 0-2 baixas

        return {
          winnerCrew,
          loserCrew,
          casualties,
        }
      } catch (error) {
        console.error('Erro ao simular batalha entre crews:', error)
        return null
      }
    },

    // ✅ SISTEMA DE RECRUTAMENTO E REMOÇÃO
    async processCrewRecruitmentAndRemoval(
      winnerCrewId: number,
      loserCrewId: number,
      isPlayerInvolved: boolean = false,
    ): Promise<CrewRecruitmentResult> {
      try {
        const result: CrewRecruitmentResult = {
          recruited: [],
          removed: [],
          recruitmentAttempts: 0,
          removalAttempts: 0,
        }

        // Se o player estiver envolvido, não aplicar recrutamento automático
        if (isPlayerInvolved) {
          return result
        }

        // Buscar informações dos crews
        const [winnerCrew, loserCrew] = await Promise.all([
          db.crews.get(winnerCrewId),
          db.crews.get(loserCrewId),
        ])

        if (!winnerCrew || !loserCrew) {
          console.error('❌ Crews não encontrados para recrutamento')
          return result
        }

        // Verificar capacidade do crew vencedor
        const winnerCapacity = await this.getCrewCapacityInfo(winnerCrewId)

        if (!winnerCapacity.hasSpace) {
        } else {
          // Processar recrutamento
          const recruitmentResult = await this.processRecruitment(
            winnerCrewId,
            loserCrewId,
            winnerCapacity,
          )

          result.recruited = recruitmentResult.recruited
          result.recruitmentAttempts = recruitmentResult.attempts
        }

        // Processar remoção de membros do crew perdedor
        const removalResult = await this.processCrewMemberRemoval(loserCrewId)
        result.removed = removalResult.removed
        result.removalAttempts = removalResult.attempts

        return result
      } catch (error) {
        console.error('❌ Erro no processamento de recrutamento:', error)
        return {
          recruited: [],
          removed: [],
          recruitmentAttempts: 0,
          removalAttempts: 0,
        }
      }
    },

    // ✅ PROCESSAR RECRUTAMENTO (20% DE CHANCE)
    async processRecruitment(
      winnerCrewId: number,
      loserCrewId: number,
      capacity: CrewCapacityInfo,
    ): Promise<{ recruited: Character[]; attempts: number }> {
      try {
        const recruited: Character[] = []
        let attempts = 0

        // Buscar membros elegíveis do crew perdedor (não capitães)
        const eligibleMembers = await db.characters
          .where('crewId')
          .equals(loserCrewId)
          .and((char) => char.isPlayer !== 1)
          .toArray()

        if (eligibleMembers.length === 0) {
          return { recruited, attempts }
        }

        eligibleMembers.sort((a, b) => a.loyalty - b.loyalty)

        // Tentar recrutar cada membro elegível
        for (const member of eligibleMembers) {
          if (capacity.currentMembers + recruited.length >= capacity.maxCapacity) {
            break
          }

          attempts++

          // 20-40% de chance de recrutamento  depender da loyalty do membro
          const recruitmentChance = 0.2 + (1 - member.loyalty / 100) * 0.1
          const roll = Math.random()

          if (roll <= recruitmentChance) {
            // Sucesso no recrutamento!

            // Atualizar crew do membro
            await db.characters.update(member.id!, {
              crewId: winnerCrewId,
            })

            recruited.push(member)

            // Chance de parar o recrutamento após sucesso (para não recrutar todos)
            if (Math.random() < 0.6) {
              // 60% chance de parar após recrutar alguém
              break
            }
          }
        }

        return { recruited, attempts }
      } catch (error) {
        console.error('❌ Erro no processamento de recrutamento:', error)
        return { recruited: [], attempts: 0 }
      }
    },

    // ✅ PROCESSAR REMOÇÃO DE MEMBROS (10% DE CHANCE)
    async processCrewMemberRemoval(
      loserCrewId: number,
    ): Promise<{ removed: Character[]; attempts: number }> {
      try {
        const removed: Character[] = []
        let attempts = 0

        // Buscar membros elegíveis para remoção (não capitães, não recrutados)
        const eligibleMembers = await db.characters
          .where('crewId')
          .equals(loserCrewId)
          .and((char) => char.isPlayer !== 1)
          .toArray()

        if (eligibleMembers.length === 0) {
          return { removed, attempts }
        }

        // Tentar remover cada membro elegível
        for (const member of eligibleMembers) {
          attempts++

          // 10% de chance de remoção
          const removalChance = 0.1
          const roll = Math.random()

          if (roll <= removalChance) {
            // Sucesso na remoção!
            // Remover do crew (definir crewId como null)
            await db.characters.update(member.id!, {
              crewId: 0,
            })

            removed.push(member)

            // Chance de parar a remoção após sucesso (para não remover muitos)
            if (Math.random() < 0.7) {
              // 70% chance de parar após remover alguém
              break
            }
          }
        }

        return { removed, attempts }
      } catch (error) {
        console.error('❌ Erro no processamento de remoção:', error)
        return { removed: [], attempts: 0 }
      }
    },

    // ✅ CRIAR CREW PARA MEMBROS ÓRFÃOS
    async createCrewForOrphanMembers(
      orphanMembers: Character[],
      originalIslandId: number,
    ): Promise<Crew | null> {
      try {
        if (orphanMembers.length === 0) return null

        // Selecionar capitão (membro com maior level)
        const captain = orphanMembers.reduce((highest, current) =>
          current.level > highest.level ? current : highest,
        )

        const crewName = CrewNameGenerator.generateCrewName(
          captain.type as 'Pirate' | 'Marine' | 'BountyHunter',
        )

        // Criar novo crew
        const newCrewId = await db.crews.add({
          name: crewName,
          type: captain.type as 'Pirate' | 'Marine' | 'BountyHunter',
          captainId: captain.id!,
          currentIsland: originalIslandId,
          docked: 1,
          reputation: Math.floor(captain.level * 10),
          treasury:
            captain.type === 'Marine'
              ? GameLogic.randomBetween(1000000, 50000000)
              : GameLogic.randomBetween(captain.bounty * 0.5, captain.bounty * 10),
          foundedAt: new Date(),
        })

        // Atualizar capitão
        await db.characters.update(captain.id!, {
          crewId: newCrewId,
          position: 'Captain',
        })

        // Atualizar outros membros
        for (const member of orphanMembers) {
          if (member.id !== captain.id) {
            await db.characters.update(member.id!, {
              crewId: newCrewId,
              position: 'Crew Member',
            })
          }
        }

        // Criar navio básico para o novo crew
        await db.ships.add({
          crewId: newCrewId,
          level: GameLogic.determineShipLevel(captain.level) as 1 | 2 | 3 | 4 | 5,
          needRepair: false,
          destroyed: false,
          name: ShipNameGenerator.generateShipNameByCrewType(captain.type),
        })

        const newCrew = await db.crews.get(newCrewId)

        return newCrew ? newCrew : null
      } catch (error) {
        console.error('❌ Erro ao criar crew para órfãos:', error)
        return null
      }
    },

    simulateCrewBattleMembers(
      crew1Members: Character[],
      crew2Members: Character[],
      allDevilFruits: DevilFruit[],
      crew1PowerMod: number = 1,
      crew2PowerMod: number = 1,
    ): boolean {
      const crew1Power = GameLogic.calculateCrewPower(crew1Members, allDevilFruits) * crew1PowerMod
      const crew2Power = GameLogic.calculateCrewPower(crew2Members, allDevilFruits) * crew2PowerMod

      // Determinar vencedor
      const totalPower = crew1Power + crew2Power
      const crew1WinChance = crew1Power / totalPower

      const attackerDice = GameLogic.diceUsed(crew1WinChance)
      const defenderDice = GameLogic.diceUsed(1 - crew1WinChance)

      let attackerCrewLevel = crew1Members.reduce((sum, member) => sum + member.level, 0)

      let defenderCrewLevel = crew2Members.reduce((sum, member) => sum + member.level, 0)

      let attackerHp = GameLogic.healthPointsCharacter(attackerCrewLevel)
      let defenderHp = GameLogic.healthPointsCharacter(defenderCrewLevel)

      let fighting = true

      while (fighting) {
        const attackerRoll = GameLogic.rollDice(attackerDice)
        defenderHp -= attackerRoll
        if (defenderHp <= 0) {
          fighting = false
        } else {
          const defenderRoll = GameLogic.rollDice(defenderDice)
          attackerHp -= defenderRoll
          if (attackerHp <= 0) {
            fighting = false
          }
        }
      }

      const crew1Wins = defenderHp <= 0 ? true : false

      return crew1Wins
    },

    async calculateCrewHelp(char: Character, opponent: Character | null): Promise<number> {
      let crewHelp = 0

      if (!char.crewId || (opponent && opponent.level / char.level <= 2)) {
        return 0
      }

      const crewMembers = await db.characters
        .where('crewId')
        .equals(char.crewId)
        .and((member) => member.id != char.id)
        .toArray()

      const eligibleMembers = crewMembers.filter((m) => m.level / char.level > 2)
      if (eligibleMembers.length === 0) return 0

      // ✅ Batch: busca todos os devil fruits de uma só vez (ao invés de N gets individuais)
      const devilFruitIds = eligibleMembers
        .map((m) => m.devilFruitId)
        .filter((id): id is number => !!id)

      const devilFruits = devilFruitIds.length > 0
        ? await db.devilFruits.bulkGet(devilFruitIds)
        : []

      const devilFruitMap = new Map<number, typeof devilFruits[0]>(
        devilFruitIds.map((id, i) => [id, devilFruits[i]])
      )

      const crewHelpFactor = GenerationConfig.createEpic().regularCrewHelp

      for (const member of eligibleMembers) {
        const devilFruit = member.devilFruitId
          ? (devilFruitMap.get(member.devilFruitId) ?? null)
          : null
        crewHelp += GameLogic.calculatePower(member, devilFruit) * crewHelpFactor
      }

      return Math.round(crewHelp)
    },

    // ✅ VERIFICAR CAPACIDADE DO CREW
    async getCrewCapacityInfo(crewId: number): Promise<CrewCapacityInfo> {
      try {
        
        // Buscar membros atuais
        const currentMembers = await db.characters.where('crewId').equals(crewId).toArray()

        // Buscar navio do crew
        const ship = await db.ships.where('crewId').equals(crewId).first()

        const shipLevel = ship?.level || 1
        const maxCapacity = shipLevel * 3 // Assumindo 3 membros por level do navio

        return {
          currentMembers: currentMembers.length,
          maxCapacity,
          hasSpace: currentMembers.length < maxCapacity,
          shipLevel,
        }
      } catch (error) {
        console.error('❌ Erro ao verificar capacidade do crew:', error)
        return {
          currentMembers: 0,
          maxCapacity: 3,
          hasSpace: false,
          shipLevel: 1,
        }
      }
    },

    async generateBattleResult(
      char1: Character,
      char2: Character,
      char1Wins: boolean,
      char1Power: number,
      char2Power: number,
      extraReward?: number | 0,
      extraExp?: number | 0,
      log?: string[],
    ): Promise<BattleResult> {
      const winner = char1Wins ? char1 : char2
      const loser = char1Wins ? char2 : char1
      const winnerPower = char1Wins ? char1Power : char2Power
      const loserPower = char1Wins ? char2Power : char1Power

      // Calcular experiência ganha
      let experienceGained = Math.ceil(
        GameLogic.calculateExperienceGain(winner, loser) * (1 + Number(extraExp)),
      )

      // Calcular mudança de bounty (apenas para piratas)
      let bountyChange = GameLogic.calculateBountyGain(winner, loser) + Number(extraReward)

      // Gerar log da batalha
      const battleLog = log

      let canShowRecruitment = false
      let recruitmentData: RecruitmentAttempt | undefined
      

        
      const winnerCrew = await db.crews.get(winner.crewId!)
      const loserCrew = await db.crews.get(loser.crewId!)

      const treasuryStole = await this.updateCrewsBattle(winnerCrew, loserCrew)

      if (loserCrew) {
        recruitmentData = await RecruitmentSystem.validateRecruitment(
          winner,
          loser,
          loserCrew,
          'adventure',
        )
        canShowRecruitment = recruitmentData.canRecruit
      }

      return {
        winner,
        loser,
        challenger: char1,
        opponent: char2,
        experienceGained,
        bountyChange,
        treasuryStole,
        battleLog,
        canShowRecruitment,
        recruitmentData,
      }
    },

    async attemptRecruitment(
      recruiter: Character,
      target: Character,
      recruitmentData: RecruitmentAttempt,
    ) {
      return await RecruitmentSystem.attemptRecruitment(recruiter, target, recruitmentData)
    },

    generateBattleLog(
      winner: Character,
      loser: Character,
      damage: number,
      char1Wins: boolean,
    ): string[] {
      const log: string[] = []

      log.push(`🥊 Batalha iniciada entre ${winner.name} e ${loser.name}!`)

      // Adicionar algumas ações da batalha
      const actions = [
        `${winner.name} ataca com força total!`,
        `${loser.name} tenta se defender!`,
        `${winner.name} usa uma técnica especial!`,
        `${loser.name} recua e planeja um contra-ataque!`,
        `${winner.name} domina a batalha!`,
      ]

      // Adicionar 2-3 ações aleatórias
      const numActions = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < numActions; i++) {
        const randomAction = actions[Math.floor(Math.random() * actions.length)]
        log.push(`⚔️ ${randomAction}`)
      }

      // Adicionar resultado final
      log.push(`💥 ${winner.name} causa ${damage} de dano!`)
      log.push(`🏆 ${winner.name} vence a batalha!`)

      return log
    },

    async saveBattleResult(result: BattleResult): Promise<void> {
      try {
        // Salvar batalha no histórico
        const battleData: Omit<Battle, 'id'> = {
          timestamp: new Date(),
          challenger: result.challenger.id!,
          opponent: result.opponent.id!,
          winner: result.winner.id!,
          loser: result.loser.id!,
          experienceGained: result.experienceGained,
          bountyGained: result.bountyChange,
          battleLog: result.battleLog,
          challengerCrewId: result.challenger.crewId || 0,
          opponentCrewId: result.opponent.crewId || 0,
        }

        const battleId = await db.battles.add(battleData)

        // Atualizar stats do vencedor
        await this.updateCharacterAfterBattle(
          result.winner,
          result.experienceGained,
          result.bountyChange,
          true,
        )

        // Atualizar stats do perdedor (pode perder experiência ou bounty)
        await this.updateCharacterAfterBattle(
          result.loser,
          Math.ceil(
            (result.experienceGained *
              GameLogic.randomBetween(1, GenerationConfig.createEpic().lossGain)) /
              100,
          ),
          0,
          false,
        )
      } catch (error) {
        console.error('Erro ao salvar resultado da batalha:', error)
        throw error
      }
    },

    async updateCrewsBattle(
      winner: Crew,
      loser: Crew,
    ): Promise<number> {
      try {
        const treasuryFoundPercentage = GameLogic.randomBetween(5,15) / 100
        const amount = isNaN(Math.floor(loser.treasury * treasuryFoundPercentage)) ? 0 : Math.floor(loser.treasury * treasuryFoundPercentage)
        const updateWinner: Partial<Crew> = {}
        updateWinner.treasury = winner.treasury + amount
        const updateLoser: Partial<Crew> = {}
        updateLoser.treasury = loser.treasury - amount
        // ✅ Aplicar todas as atualizações em paralelo
        const allUpdates = [
          db.crews.update(winner.id!, updateWinner),
          db.crews.update(loser.id!, updateLoser),
        ]

        await Promise.all(allUpdates)

        console.log(
          `✅ ${winner.name} e ${loser.name} atualizados com sucesso. ${winner.name} roubou um total de ${Math.floor(loser.treasury * treasuryFoundPercentage)} berries!`,
        )
        return Math.floor(loser.treasury * treasuryFoundPercentage)
      } catch (error) {
        console.error('❌ Erro ao atualizar personagem após batalha:', error)
        throw error
      }
    },

    async updateCharacterAfterBattle(
      character: Character,
      expGained: number,
      bountyGained: number,
      isWinner: boolean,
    ): Promise<void> {
      try {
        // ✅ Processar capitão e membros em paralelo
        const [captainUpdates, memberUpdates] = await Promise.all([
          this.processCaptainUpdates(character, expGained, bountyGained, isWinner),
          this.processCrewMemberUpdates(
            character,
            expGained,
            bountyGained,
            isWinner,
            GenerationConfig.createEpic().regularCrewSharedGain,
          ),
        ])

        // ✅ Aplicar todas as atualizações em paralelo
        const allUpdates = [
          db.characters.update(character.id!, captainUpdates),
          ...memberUpdates.map((update) => db.characters.update(update.id, update.updates)),
        ]

        await Promise.all(allUpdates)

        if (character.isPlayer === 1) {
          const characterStore = useCharacterStore()
          await characterStore.loadPlayerCharacter()
          character.level = captainUpdates.level || character.level
          character.bounty = captainUpdates.bounty || character.bounty
          character.experience = captainUpdates.experience || character.experience
        }

        console.log(
          `✅ ${character.name} e ${memberUpdates.length} membros atualizados com sucesso`,
        )
      } catch (error) {
        console.error('❌ Erro ao atualizar personagem após batalha:', error)
        throw error
      }
    },

    // ✅ PROCESSAR ATUALIZAÇÕES DO CAPITÃO
    async processCaptainUpdates(
      character: Character,
      expGained: number,
      bountyGained: number,
      isWinner: boolean,
    ): Promise<Partial<Character>> {
      const updates: Partial<Character> = {}

      // ✅ Calcular nova experiência SEM mutar o objeto original
      const newExp = character.experience + expGained
      const tempCharacter = { ...character, experience: newExp } // Cópia para cálculos

      const levelCheck = GameLogic.checkLevelUp(tempCharacter)

      if (levelCheck.shouldLevelUp) {
        // ✅ Level up!
        const newLevel = levelCheck.newLevel!
        const remainingExp = newExp - levelCheck.expNeeded!

        // Buscar dados necessários
        const [devilFruit, styleCombat] = await Promise.all([
          character.devilFruitId ? db.devilFruits.get(character.devilFruitId) : null,
          db.styleCombats.get(character.styleCombatId),
        ])

        if (!styleCombat) {
          throw new Error(`Style Combat não encontrado para o personagem ${character.name}`)
        }

        // ✅ Calcular aumento de stats com o nível correto
        const updatedCharacter = {
          ...character,
          level: newLevel,
          experience: remainingExp,
        }

        updatedCharacter.stats = GameLogic.calculateStatIncrease(updatedCharacter)

        const statIncrease = GameLogic.increaseStats(
          updatedCharacter,
          newLevel,
          styleCombat,
          devilFruit,
        )

        updates.level = newLevel
        updates.experience = remainingExp
        updates.stats = {
          ...character.stats,
          ...statIncrease,
        }
      } else {
        updates.experience = newExp
      }

      // ✅ Atualizar bounty (apenas para piratas vencedores)
      if (isWinner && bountyGained > 0) {
        updates.bounty = character.bounty + bountyGained
      }

      return updates
    },

    // ✅ PROCESSAR ATUALIZAÇÕES DOS MEMBROS DO CREW
    async processCrewMemberUpdates(
      captain: Character,
      expGained: number,
      bountyGained: number,
      isWinner: boolean,
      percentage: number,
    ): Promise<Array<{ id: number; updates: Partial<Character> }>> {
      if (!captain.crewId) return []

      const crewMembers = await db.characters.where('crewId').equals(captain.crewId).toArray()
      const members = crewMembers.filter((member) => member.id !== captain.id)

      if (members.length === 0) return []

      // ✅ Processar todos os membros em paralelo
      const memberUpdatesPromises = members.map(async (member) => {
        const updates: Partial<Character> = {}

        if (isWinner) {
          // ✅ Calcular ganhos dos membros (30-50% do capitão)
          const memberExpGain = Math.floor(
            (expGained * percentage * GameLogic.randomBetween(100, 120)) / 100,
          )
          const memberBountyGain = Math.floor(
            GameLogic.adjustBounty((bountyGained * percentage * GameLogic.randomBetween(100, 120)) / 100)
          )

          // ✅ Calcular nova experiência SEM mutar o objeto original
          const newExpMember = member.experience + memberExpGain
          const tempMember = { ...member, experience: newExpMember }

          const levelCheckMember = GameLogic.checkLevelUp(tempMember)

          if (levelCheckMember.shouldLevelUp) {
            const newLevelMember = levelCheckMember.newLevel!
            const remainingExpMember = newExpMember - levelCheckMember.expNeeded!

            // Buscar dados necessários
            const [devilFruitMember, styleCombatMember] = await Promise.all([
              member.devilFruitId ? db.devilFruits.get(member.devilFruitId) : null,
              db.styleCombats.get(member.styleCombatId),
            ])

            if (!styleCombatMember) {
              throw new Error(`Style Combat não encontrado para o personagem ${member.name}`)
            }

            // ✅ Calcular aumento de stats
            const updatedMember = {
              ...member,
              level: newLevelMember,
              experience: remainingExpMember,
            }

            updatedMember.stats = GameLogic.calculateStatIncrease(updatedMember)

            const statIncreaseMember = GameLogic.increaseStats(
              updatedMember,
              newLevelMember,
              styleCombatMember,
              devilFruitMember,
            )

            updates.level = newLevelMember
            updates.experience = remainingExpMember
            updates.stats = {
              ...member.stats,
              ...statIncreaseMember,
            }
          } else {
            updates.experience = newExpMember
          }

          // Atualizar bounty para piratas
          if (memberBountyGain > 0) {
            updates.bounty = member.bounty + memberBountyGain
          }

          // ✅ Aumentar loyalty por vitória
          updates.loyalty = Math.min(100, member.loyalty + (1 + Math.random() * 3)) // +1 a +4
        } else {
          // ✅ Diminuir loyalty por derrota
          updates.loyalty = Math.max(-100, member.loyalty - (1 + Math.random() * 2)) // -1 a -3
        }

        return {
          id: member.id!,
          updates,
        }
      })

      return Promise.all(memberUpdatesPromises)
    },

    async loadBattleHistory(characterId?: number): Promise<void> {
      try {
        let battles: Battle[]

        if (characterId) {
          // Carregar batalhas de um personagem específico
          battles = await db.battles
            .where('challenger')
            .equals(characterId)
            .or('opponent')
            .equals(characterId)
            .reverse()
            .limit(50)
            .toArray()
        } else {
          // Carregar todas as batalhas recentes
          battles = await db.battles.orderBy('timestamp').reverse().limit(100).toArray()
        }

        this.battleHistory = battles
      } catch (error) {
        console.error('Erro ao carregar histórico de batalhas:', error)
        throw error
      }
    },

    async getBattleById(battleId: number): Promise<Battle | undefined> {
      try {
        return await db.battles.get(battleId)
      } catch (error) {
        console.error('Erro ao buscar batalha:', error)
        return undefined
      }
    },
  },

  getters: {
    recentBattles: (state) => state.battleHistory.slice(0, 10),

    playerBattles: (state) => (playerId: number) =>
      state.battleHistory.filter(
        (battle) => battle.challenger === playerId || battle.opponent === playerId,
      ),

    winRate: (state) => (playerId: number) => {
      const playerBattles = state.battleHistory.filter(
        (battle) => battle.challenger === playerId || battle.opponent === playerId,
      )

      if (playerBattles.length === 0) return 0

      const wins = playerBattles.filter((battle) => battle.winner === playerId).length
      return Math.round((wins / playerBattles.length) * 100)
    },
  },
})
