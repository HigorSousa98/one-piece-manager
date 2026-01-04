// src/workers/worldUpdateWorker.ts
import { db } from '../utils/database'
import { Crew, Character, DevilFruit, Island } from '../utils/database'

// ✅ IMPORTS APENAS DE UTILS - SEM STORES
import { GenerationConfig } from '../utils/generationConfig'
import { GameLogic } from '../utils/gameLogic'
import { ShipNameGenerator } from '../data/shipNameGenerator'
import { CrewNameGenerator } from '../data/crewNames'
import { NameGenerator } from '../data/characterNames'
import { AdventureSystem } from '@/utils/adventureSystem'

// Interfaces para comunicação
interface WorkerMessage {
  type: string
  data: any
  id: string
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

export interface CrewMovementDecision {
  crewId: number
  crewName: string
  fromIslandId: number
  toIslandId: number
  fromDifficulty: number
  toDifficulty: number
  movementType: 'easier' | 'same' | 'harder'
}

interface WorkerResponse {
  type: string
  id: string
  success: boolean
  data?: any
  error?: string
  progress?: number
}

// Cache do worker
let workerCache = {
  islands: [],
  crews: [],
  characters: [],
  devilFruits: [],
  territories: [],
  styleCombats: [],
  ships: [],
  lastCacheTime: 0,
  cacheTimeout: 30000,
}

// ✅ FUNÇÃO PARA ATUALIZAR CACHE
async function updateCache() {
  const now = Date.now()

  if (now - workerCache.lastCacheTime > workerCache.cacheTimeout) {
    try {
      workerCache.islands = await db.islands.toArray()
      workerCache.crews = await db.crews.toArray()
      workerCache.characters = await db.characters.toArray()
      workerCache.devilFruits = await db.devilFruits.toArray()
      workerCache.territories = await db.territories.toArray()
      workerCache.styleCombats = await db.styleCombats.toArray()
      workerCache.ships = await db.ships.toArray()
      workerCache.lastCacheTime = now

      console.log('✅ Cache do worker atualizado')
    } catch (error) {
      console.error('❌ Erro ao atualizar cache do worker:', error)
    }
  }
}

// ✅ SIMULAR ENCONTROS - VERSÃO WORKER (SEM PINIA)
async function simulateEncountersWorker(data: any): Promise<any> {
  try {
    await updateCache()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 10,
    })

    const results = {
      totalEncounters: 0,
      totalBattles: 0,
      totalMovements: 0,
      islandReports: [],
    }

    const islands = workerCache.islands
    const crews = workerCache.crews
    const characters = workerCache.characters

    // Processar ilhas em chunks
    const chunkSize = 3
    const maxEncounters = GenerationConfig.createEpic().islandEncounters
    for (let i = 0; i < islands.length; i += chunkSize) {
      const islandChunk = islands.slice(i, i + chunkSize)

      for (const island of islandChunk) {
        // Encontrar crews na ilha
        const crewsOnIsland = crews.filter(
          (crew) => crew.currentIsland === island.id && crew.docked === 1,
        )

        if (crewsOnIsland.length >= 2) {
          // Simular encontros entre crews diferentes
          for (let i = 0; i < Math.min(maxEncounters, crewsOnIsland.length * 2); i++) {
            const crew1 = crewsOnIsland[Math.floor(Math.random() * crewsOnIsland.length)]
            const crew2 = crewsOnIsland[Math.floor(Math.random() * crewsOnIsland.length)]

            if (crew1.id === crew2.id) continue // Mesmo crew

            // Buscar membros representativos de cada crew
            const [member1, member2] = await Promise.all([
              characters.filter((char) => char.crewId == crew1.id),
              characters.filter((char) => char.crewId == crew2.id),
            ])

            if (!member1 || !member2 || member1.length < 1 || member2.length < 1) continue

            results.totalEncounters++

            // Determinar se resulta em batalha
            const encounterType = AdventureSystem.determineEncounterType(member1[0], member2[0])

            if (encounterType === 'hostile') {
              // Simular batalha entre os crews
              const battleResult = await simulateCrewBattle(crew1, crew2)
              if (battleResult) {
                results.totalBattles++
              }
            }
          }
        }
      }

      // Progresso
      const progress = 10 + ((i + chunkSize) / islands.length) * 80
      self.postMessage({
        type: 'PROGRESS',
        id: data.id,
        progress: Math.min(progress, 90),
      })

      await new Promise((resolve) => setTimeout(resolve, 1))
    }

    console.log('Resultados do encounters', results)

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    return results
  } catch (error) {
    console.error('❌ Erro na simulação de encontros (worker):', error)
    return {
      totalEncounters: 0,
      totalBattles: 0,
      totalMovements: 0,
      islandReports: [],
    }
  }
}

async function simulateCrewBattle(
  crew1: Crew,
  crew2: Crew,
): Promise<{
  winnerCrew: Crew
  loserCrew: Crew
  casualties: number
} | null> {
  try {
    const allDevilFruits = workerCache.devilFruits
    const allCharacters = workerCache.characters

    // Buscar capitães dos crews
    const [captain1, captain2] = await Promise.all([
      allCharacters.find((char) => char.id == crew1.captainId),
      allCharacters.find((char) => char.id == crew2.captainId),
    ])

    if (!captain1 || !captain2) return null

    // Calcular poder total dos crews
    const [crew1Members, crew2Members] = await Promise.all([
      allCharacters.filter((char) => char.crewId == crew1.id),
      allCharacters.filter((char) => char.crewId == crew2.id),
    ])

    const crew1Wins = simulateCrewBattleMembers(crew1Members, crew2Members, allDevilFruits)

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
      processCaptainUpdates(winnerCaptain, expGain, bountyGain, true),
      processCrewMemberUpdates(winnerCaptain, expGain, bountyGain, true, 0.3 + Math.random() * 0.2),
    ])

    // ✅ Aplicar todas as atualizações em paralelo
    const allUpdates = [
      db.characters.update(winnerCaptain.id!, captainUpdates),
      ...memberUpdates.map((update) => db.characters.update(update.id, update.updates)),
    ]

    await Promise.all(allUpdates)

    // ✅ PROCESSAR RECRUTAMENTO E REMOÇÃO
    const recruitmentResult = await processCrewRecruitmentAndRemoval(
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
      const newCrew = await createCrewForOrphanMembers(
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
}

async function createCrewForOrphanMembers(
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
      level: 1,
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
}

async function processCrewRecruitmentAndRemoval(
  winnerCrewId: number,
  loserCrewId: number,
  isPlayerInvolved: boolean = false,
): Promise<CrewRecruitmentResult> {
  try {
    const allCrews = workerCache.crews

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
      allCrews.find((c) => c.id == winnerCrewId),
      allCrews.find((c) => c.id == loserCrewId),
    ])

    if (!winnerCrew || !loserCrew) {
      console.error('❌ Crews não encontrados para recrutamento')
      return result
    }

    // Verificar capacidade do crew vencedor
    const winnerCapacity = await getCrewCapacityInfo(winnerCrewId)

    if (!winnerCapacity.hasSpace) {
    } else {
      // Processar recrutamento
      const recruitmentResult = await processRecruitment(winnerCrewId, loserCrewId, winnerCapacity)

      result.recruited = recruitmentResult.recruited
      result.recruitmentAttempts = recruitmentResult.attempts
    }

    // Processar remoção de membros do crew perdedor
    const removalResult = await processCrewMemberRemoval(loserCrewId)
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
}

async function processCrewMemberRemoval(
  loserCrewId: number,
): Promise<{ removed: Character[]; attempts: number }> {
  try {
    const removed: Character[] = []
    let attempts = 0

    const allCharacters = workerCache.characters

    // Buscar membros elegíveis para remoção (não capitães, não recrutados)
    const eligibleMembers = allCharacters.filter(
      (char) => char.crewId == loserCrewId && char.isPlayer !== 1,
    )

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
}

async function processRecruitment(
  winnerCrewId: number,
  loserCrewId: number,
  capacity: CrewCapacityInfo,
): Promise<{ recruited: Character[]; attempts: number }> {
  try {
    const recruited: Character[] = []
    let attempts = 0

    const allCharacters = workerCache.characters

    // Buscar membros elegíveis do crew perdedor (não capitães)
    const eligibleMembers = allCharacters.filter(
      (char) => char.crewId == loserCrewId && char.isPlayer !== 1,
    )

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
}

async function getCrewCapacityInfo(crewId: number): Promise<CrewCapacityInfo> {
  try {
    const allCharacters = workerCache.characters
    const allShips = workerCache.ships

    // Buscar membros atuais
    const currentMembers = allCharacters.find((char) => char.crewId == crewId)

    // Buscar navio do crew
    const ship = allShips.find((s) => s.crewId == crewId)

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
}

async function processCaptainUpdates(
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

  const allDevilFruits = workerCache.devilFruits
  const allStyleCombats = workerCache.styleCombats

  if (levelCheck.shouldLevelUp) {
    // ✅ Level up!
    const newLevel = levelCheck.newLevel!
    const remainingExp = newExp - levelCheck.expNeeded!

    // Buscar dados necessários
    const [devilFruit, styleCombat] = await Promise.all([
      character.devilFruitId ? allDevilFruits.find((df) => df.id == character.devilFruitId) : null,
      allStyleCombats.find((sc) => sc.id == character.styleCombatId),
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
}

async function processCrewMemberUpdates(
  captain: Character,
  expGained: number,
  bountyGained: number,
  isWinner: boolean,
  percentage: number,
): Promise<Array<{ id: number; updates: Partial<Character> }>> {
  if (!captain.crewId) return []

  const allCharacters = workerCache.characters
  const allDevilFruits = workerCache.devilFruits
  const allStyleCombats = workerCache.styleCombats

  const crewMembers = allCharacters.filter((char) => char.crewId == captain.crewId)
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
        (bountyGained * percentage * GameLogic.randomBetween(100, 120)) / 100,
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
          member.devilFruitId ? allDevilFruits.find((df) => df.id == member.devilFruitId) : null,
          allStyleCombats.find((sc) => sc.id == member.styleCombatId),
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
}

function simulateCrewBattleMembers(
  crew1Members: Character[],
  crew2Members: Character[],
  allDevilFruits: DevilFruit[],
): boolean {
  const crew1Power = GameLogic.calculateCrewPower(crew1Members, allDevilFruits)
  const crew2Power = GameLogic.calculateCrewPower(crew2Members, allDevilFruits)

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
}

// ✅ PROCESSAR MOVIMENTO - VERSÃO WORKER (SEM PINIA)
async function processMovementWorker(data: any): Promise<any> {
  try {
    await updateCache()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 15,
    })

    const result = {
      totalCrews: 0,
      dockedToggled: 0,
      crewsMoved: 0,
      movementsByDifficulty: {
        easier: 0,
        same: 0,
        harder: 0,
      },
      islandReports: [],
    }

    let crews = workerCache.crews
    const islands = workerCache.islands
    const territories = workerCache.territories

    // Filtrar crews que podem se mover (sem player - passado via data)
    const playerCrewIds = data.playerCrewIds || []
    const territoriesCrewIds = territories.map((territory) => territory.crewId)

    const avialableCrews = crews.filter(
      (crew) => !playerCrewIds.includes(crew.id) && !territoriesCrewIds.includes(crew.id),
    )

    let toggled = 0
    const updates: Promise<any>[] = []

    for (const crew of avialableCrews) {
      const roll = Math.random()
      let newDockedStatus: number

      if (roll <= 0.1) {
        newDockedStatus = 0
      } else {
        newDockedStatus = 1
      }

      if (crew.docked !== newDockedStatus) {
        updates.push(db.crews.update(crew.id!, { docked: newDockedStatus as 0 | 1 }))
        toggled++
      }
    }

    await Promise.all(updates)

    await updateCache()
    crews = workerCache.crews

    const allCharacters = workerCache.characters
    const allDevilFruits = workerCache.devilFruits
    const crewByIsland = new Map(
      islands.map((island) => {
        const crewsInThisIsland = crews.filter((crews) => crews.currentIsland == island.id)
        const sortedCrews = crewsInThisIsland.sort((a, b) => {
          const crewMembersA = allCharacters.filter((char) => char.crewId == a.id)
          const crewMembersB = allCharacters.filter((char) => char.crewId == b.id)
          return (
            GameLogic.calculateCrewPower(crewMembersB, allDevilFruits) -
            GameLogic.calculateCrewPower(crewMembersA, allDevilFruits)
          )
        })
        return [island.id!, sortedCrews]
      }),
    )

    const movableCrews = crews.filter(
      (crew) =>
        crew.docked === 1 &&
        crew.captainId > 0 &&
        !playerCrewIds.includes(crew.id) &&
        !territoriesCrewIds.includes(crew.id),
    )

    result.totalCrews = movableCrews.length

    // Simular movimento
    const chunkSize = 5
    const movementDecisions: CrewMovementDecision[] = []
    const movementsByDifficulty = { easier: 0, same: 0, harder: 0 }

    for (let i = 0; i < movableCrews.length; i += chunkSize) {
      const crewChunk = movableCrews.slice(i, i + chunkSize)

      for (const crew of crewChunk) {
        // 20% chance de se mover
        if (Math.random() <= 0.2) {
          const currentIsland = islands.find((island) => island.id === crew.currentIsland)
          if (currentIsland) {
            const currentIndex =
              crewByIsland.get(crew.currentIsland)?.findIndex((curr) => curr.id == crew.id) || 0
            const totalCrewsOnIsland = crewByIsland.get(crew.currentIsland)?.length || 1
            const percent = currentIndex / totalCrewsOnIsland

            const destinationDecision = await selectDestinationIsland(
              currentIsland,
              islands,
              percent,
            )

            if (destinationDecision) {
              movementDecisions.push({
                crewId: crew.id!,
                crewName: crew.name,
                fromIslandId: currentIsland.id!,
                toIslandId: destinationDecision.island.id!,
                fromDifficulty: currentIsland.difficulty,
                toDifficulty: destinationDecision.island.difficulty,
                movementType: destinationDecision.type,
              })

              movementsByDifficulty[destinationDecision.type]++
            }
          }
        }
      }

      // Progresso
      const progress = 15 + ((i + chunkSize) / movableCrews.length) * 70
      self.postMessage({
        type: 'PROGRESS',
        id: data.id,
        progress: Math.min(progress, 85),
      })

      await new Promise((resolve) => setTimeout(resolve, 1))
    }

    const movementPromises = movementDecisions.map((decision) => executeCrewMovement(decision))

    await Promise.all(movementPromises)

    const islandReports = await generateIslandMovementReport(islands, movementDecisions)

    result.crewsMoved = movementDecisions.length
    result.dockedToggled = toggled
    result.islandReports = islandReports
    result.movementsByDifficulty = movementsByDifficulty

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    console.log('Resultados do Movements', result)

    return result
  } catch (error) {
    console.error('❌ Erro no processamento de movimento (worker):', error)
    return {
      totalCrews: 0,
      dockedToggled: 0,
      crewsMoved: 0,
      movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
      islandReports: [],
    }
  }
}

async function generateIslandMovementReport(
  allIslands: Island[],
  movements: CrewMovementDecision[],
): Promise<
  Array<{
    islandId: number
    islandName: string
    initialCrews: number
    finalCrews: number
    crewsLeft: number
    crewsArrived: number
  }>
> {
  try {
    const reports: Array<{
      islandId: number
      islandName: string
      initialCrews: number
      finalCrews: number
      crewsLeft: number
      crewsArrived: number
    }> = []

    for (const island of allIslands) {
      const crewsLeft = movements.filter((m) => m.fromIslandId === island.id).length
      const crewsArrived = movements.filter((m) => m.toIslandId === island.id).length

      const currentCrews = workerCache.crews.filter(
        (c) => c.currentIsland == island.id && c.docked === 1,
      ).length

      const initialCrews = currentCrews + crewsLeft - crewsArrived

      if (crewsLeft > 0 || crewsArrived > 0) {
        reports.push({
          islandId: island.id!,
          islandName: island.name,
          initialCrews,
          finalCrews: currentCrews,
          crewsLeft,
          crewsArrived,
        })
      }
    }

    return reports.sort((a, b) => b.crewsLeft + b.crewsArrived - (a.crewsLeft + a.crewsArrived))
  } catch (error) {
    console.error('❌ Erro ao gerar relatório de movimento:', error)
    return []
  }
}

async function executeCrewMovement(decision: CrewMovementDecision): Promise<void> {
  try {
    const fromIsland = workerCache.islands.find((i) => i.id == decision.fromIslandId)
    const toIsland = workerCache.islands.find((i) => i.id == decision.toIslandId)

    if (!fromIsland || !toIsland) {
      console.error(`❌ Ilhas não encontradas: ${decision.fromIslandId} → ${decision.toIslandId}`)
      return
    }

    const validation = validateIslandMovement(fromIsland, toIsland)

    if (!validation.isValid) {
      console.error(`❌ Movimento inválido para ${decision.crewName}: ${validation.reason}`)
      return
    }

    await db.crews.update(decision.crewId, {
      currentIsland: decision.toIslandId,
      docked: 1,
    })
  } catch (error) {
    console.error(`❌ Erro ao mover crew ${decision.crewName}:`, error)
  }
}

function validateIslandMovement(
  fromIsland: Island,
  toIsland: Island,
): {
  isValid: boolean
  reason: string
  movementType: 'easier' | 'same' | 'harder' | 'invalid'
} {
  if (fromIsland.id === toIsland.id) {
    return {
      isValid: false,
      reason: 'Não pode ir para a mesma ilha',
      movementType: 'invalid',
    }
  }

  const difficultyDifference = toIsland.difficulty - fromIsland.difficulty

  if (difficultyDifference === -1) {
    return {
      isValid: true,
      reason: 'Movimento para ilha mais fácil (dif. -1)',
      movementType: 'easier',
    }
  } else if (difficultyDifference === 0) {
    return {
      isValid: true,
      reason: 'Movimento para ilha de mesma dificuldade',
      movementType: 'same',
    }
  } else if (difficultyDifference === 1) {
    return {
      isValid: true,
      reason: 'Movimento para ilha mais difícil (dif. +1)',
      movementType: 'harder',
    }
  } else {
    return {
      isValid: false,
      reason: `Diferença de dificuldade inválida: ${difficultyDifference} (deve ser -1, 0 ou +1)`,
      movementType: 'invalid',
    }
  }
}

async function selectDestinationIsland(
  currentIsland: Island,
  allIslands: Island[],
  percent: number,
): Promise<{ island: Island; type: 'easier' | 'same' | 'harder' } | null> {
  try {
    const availableIslands = allIslands.filter((island) => island.id !== currentIsland.id)

    if (availableIslands.length === 0) {
      console.warn('⚠️ Nenhuma ilha disponível para movimento')
      return null
    }

    const easierIslands = availableIslands.filter(
      (island) => island.difficulty === currentIsland.difficulty - 1,
    )

    const sameIslands = availableIslands.filter(
      (island) => island.difficulty === currentIsland.difficulty,
    )

    const harderIslands = availableIslands.filter(
      (island) => island.difficulty === currentIsland.difficulty + 1,
    )

    let selectedIslands: Island[]
    let movementType: 'easier' | 'same' | 'harder'

    if (percent >= 0.8 && easierIslands.length > 0) {
      selectedIslands = easierIslands
      movementType = 'easier'
    } else if (percent >= 0.1 && sameIslands.length > 0) {
      selectedIslands = sameIslands
      movementType = 'same'
    } else if (harderIslands.length > 0) {
      selectedIslands = harderIslands
      movementType = 'harder'
    } else {
      if (sameIslands.length > 0) {
        selectedIslands = sameIslands
        movementType = 'same'
      } else if (harderIslands.length > 0) {
        selectedIslands = harderIslands
        movementType = 'harder'
      } else if (easierIslands.length > 0) {
        selectedIslands = easierIslands
        movementType = 'easier'
      } else {
        console.warn(
          `❌ Nenhuma ilha com diferença de ±1 ou igual disponível para ${currentIsland.name}`,
        )
        return null
      }
    }

    const selectedIsland = selectedIslands[Math.floor(Math.random() * selectedIslands.length)]

    const difficultyDifference = selectedIsland.difficulty - currentIsland.difficulty

    if (Math.abs(difficultyDifference) > 1 && difficultyDifference !== 0) {
      console.error(
        `❌ ERRO: Diferença de dificuldade inválida: ${difficultyDifference} (deve ser -1, 0 ou +1)`,
      )
      return null
    }

    return {
      island: selectedIsland,
      type: movementType,
    }
  } catch (error) {
    console.error('❌ Erro ao selecionar ilha de destino:', error)
    return null
  }
}

// ✅ ATUALIZAR TERRITÓRIOS - VERSÃO WORKER (SEM PINIA)
async function updateTerritoriesWorker(data: any): Promise<any> {
  try {
    await updateCache()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 20,
    })

    // Receber playerCrewId via data para evitar usar store
    const playerCrewId = data.playerCrewId
    if (!playerCrewId) {
      console.warn('❌ PlayerCrewId não fornecido para worker')
      return { success: false }
    }

    const allCrews = workerCache.crews.filter((crew) => crew.docked === 1)
    const allCharacters = workerCache.characters
    const allDevilFruits = workerCache.devilFruits
    const allTerritories = workerCache.territories

    const occupiedTerritories = allTerritories.filter((territory) => territory.crewId !== 0)
    const mapStrongestCrewByIsland = new Map()

    // Inicializar mapa
    occupiedTerritories.forEach((territory) => {
      mapStrongestCrewByIsland.set(territory.islandId, null)
    })

    // Encontrar crew mais forte em cada ilha
    allCrews.forEach((crew) => {
      if (mapStrongestCrewByIsland.has(crew.currentIsland) && crew.id !== playerCrewId) {
        const currentStrongestCrew = mapStrongestCrewByIsland.get(crew.currentIsland)

        if (currentStrongestCrew) {
          const currentCrewMembers = allCharacters.filter(
            (char) => char.crewId === currentStrongestCrew.id,
          )
          const thisCrewMembers = allCharacters.filter((char) => char.crewId === crew.id)

          const currentCrewPower = GameLogic.calculateCrewPower(currentCrewMembers, allDevilFruits)
          const thisCrewPower = GameLogic.calculateCrewPower(thisCrewMembers, allDevilFruits)

          if (thisCrewPower > currentCrewPower) {
            mapStrongestCrewByIsland.set(crew.currentIsland, crew)
          }
        } else {
          mapStrongestCrewByIsland.set(crew.currentIsland, crew)
        }
      }
    })

    // Atualizar territórios
    const territoryUpdates = []
    for (const [islandId, strongestCrew] of mapStrongestCrewByIsland.entries()) {
      if (strongestCrew) {
        const territory = occupiedTerritories.find((t) => t.islandId === islandId)
        if (territory) {
          territoryUpdates.push(db.territories.update(territory.id!, { crewId: strongestCrew.id }))
        }
      } else {
        const territory = occupiedTerritories.find((t) => t.islandId === islandId)
        if (territory) {
          territoryUpdates.push(db.territories.update(territory.id!, { crewId: 0 }))
        }
      }
    }

    if (territoryUpdates.length > 0) {
      await Promise.all(territoryUpdates)
    }

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    return { success: true }
  } catch (error) {
    console.error('❌ Erro na atualização de territórios (worker):', error)
    return { success: false }
  }
}

// ✅ REDISTRIBUIR PERSONAGENS - VERSÃO WORKER (SEM PINIA)
async function redistributeCharactersWorker(data: any): Promise<any> {
  try {
    await updateCache()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 25,
    })

    const config = GenerationConfig.createEpic()
    const allCrews = workerCache.crews
    const allCharacters = workerCache.characters
    const allDevilFruits = workerCache.devilFruits

    // Criar mapas para performance
    const dfMap = new Map(allDevilFruits.map((df) => [df.id!, df]))
    const crewMap = new Map(allCrews.map((crew) => [crew.id!, crew]))

    const calculatePowerSafe = (character) => {
      const devilFruit = character.devilFruitId ? dfMap.get(character.devilFruitId) : undefined
      return GameLogic.calculatePower(character, devilFruit)
    }

    // Filtrar e ordenar personagens
    const pirates = allCharacters
      .filter((char) => char.type === 'Pirate' && char.position === 'Captain')
      .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a))

    const marines = allCharacters
      .filter((char) => char.type === 'Marine' && char.position === 'Captain')
      .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a))

    const government = allCharacters
      .filter((char) => char.type === 'Government')
      .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a))

    // Limpar tabelas existentes
    await Promise.all([
      db.yonkous.clear(),
      db.shichibukais.clear(),
      db.admirals.clear(),
      db.gorouseis.clear(),
      db.cypherPols.clear(),
    ])

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 50,
    })

    const getBaseIsland = (character) => {
      const crew = crewMap.get(character.crewId!)
      if (!crew) {
        return workerCache.islands[0]?.id || 1
      }
      return crew.currentIsland
    }

    const operations = []

    // Yonkou
    for (let i = 0; i < Math.min(config.yonkouCount, pirates.length); i++) {
      const pirate = pirates[i]
      operations.push(
        db.yonkous.add({
          captainId: pirate.id!,
          baseIsland: getBaseIsland(pirate),
          foundedAt: new Date(),
        }),
      )
    }

    // Shichibukai
    const startIndex = Math.ceil(pirates.length * 0.3)
    const endIndex = Math.min(startIndex + config.schichibukai, pirates.length)
    for (let i = startIndex; i < endIndex; i++) {
      const pirate = pirates[i]
      operations.push(
        db.shichibukais.add({
          captainId: pirate.id!,
          baseIsland: getBaseIsland(pirate),
          foundedAt: new Date(),
        }),
      )
    }

    // Admirais
    for (let i = 0; i < Math.min(config.admiralCount, marines.length); i++) {
      const marine = marines[i]
      operations.push(
        db.admirals.add({
          marineId: marine.id!,
          baseIsland: getBaseIsland(marine),
          foundedAt: new Date(),
        }),
      )
    }

    // Gorosei
    for (let i = 0; i < Math.min(config.gorouseiCount, government.length); i++) {
      const gov = government[i]
      operations.push(
        db.gorouseis.add({
          govId: gov.id!,
          currentIsland: getBaseIsland(gov),
          foundedAt: new Date(),
        }),
      )
    }

    // Cypher Pol
    const cpStartIndex = config.gorouseiCount
    const cpEndIndex = Math.min(cpStartIndex + config.cypherPolCount, government.length)
    const sortedIslands = workerCache.islands.sort((a, b) => a.difficulty - b.difficulty)

    for (let i = cpStartIndex; i < cpEndIndex; i++) {
      const gov = government[i]
      const randomIsland = sortedIslands[GameLogic.randomBetween(0, sortedIslands.length - 1)]

      operations.push(
        db.cypherPols.add({
          captainId: gov.id!,
          reputation: GameLogic.randomBetween(1000, 10000),
          currentIsland: randomIsland.id!,
          foundedAt: new Date(),
        }),
      )
    }

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 75,
    })

    // Executar todas as operações
    await Promise.all(operations)

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    return { success: true }
  } catch (error) {
    console.error('❌ Erro na redistribuição de personagens (worker):', error)
    return { success: false }
  }
}

// ✅ CRIAR NOVOS PERSONAGENS - VERSÃO WORKER (SEM PINIA)
async function createNewCharactersWorker(data: any): Promise<any> {
  try {
    await updateCache()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 30,
    })

    const count = Math.floor(Math.random() * 0) + 1
    let created = 0

    for (let i = 0; i < count; i++) {
      try {
        const characterType = Math.random()
        let type = ''

        if (characterType <= 0.25) {
          type = 'Pirate'
        } else if (characterType <= 0.5) {
          type = 'Marine'
        } else if (characterType <= 0.75) {
          type = 'BountyHunter'
        } else {
          type = 'Government'
        }

        let crewId = 0

        if (type != 'Government') {
          crewId = await db.crews.add({
            name: CrewNameGenerator.generateCrewName(type as 'Pirate' | 'Marine' | 'BountyHunter'),
            type: type as 'Pirate' | 'Marine' | 'BountyHunter',
            captainId: 0,
            currentIsland: 0,
            docked: 1,
            reputation: 0,
            foundedAt: new Date(),
            treasury: 0,
          })
        }

        const styleCombatId =
          workerCache.styleCombats.length > 0
            ? workerCache.styleCombats[
                GameLogic.randomBetween(0, workerCache.styleCombats.length - 1)
              ].id || 0
            : 1

        const potentialToHaveKngHaki = Math.random()

        const newCharacter = {
          name: NameGenerator.generateRandomName(
            type as 'Pirate' | 'Marine' | 'BountyHunter' | 'Civillian' | 'Government',
          ),
          type: type as 'Pirate' | 'Marine' | 'BountyHunter' | 'Civillian' | 'Government',
          level: 1,
          experience: 0,
          bounty: 0,
          stats: GameLogic.generateStats(
            1,
            workerCache.styleCombats.find((st) => st.id == styleCombatId)?.name || 'Balanced',
            potentialToHaveKngHaki,
          ),
          styleCombatId: styleCombatId!,
          devilFruitId: 0,
          crewId: crewId,
          position: 'Captain' as
            | 'Captain'
            | 'First Mate'
            | 'Navigator'
            | 'Cook'
            | 'Sniper'
            | 'Doctor'
            | 'Archaeologist'
            | 'Shipwright'
            | 'Musician'
            | 'Crew Member',
          isPlayer: 0 as 0 | 1,
          kindness: GameLogic.randomBetween(-100, 100),
          potentialToHaveKngHaki: potentialToHaveKngHaki,
          defendingBase: 0 as 0 | 1,
          loyalty: 100,
          createdAt: new Date(),
        }

        const characterId = await db.characters.add(newCharacter)

        if (crewId != 0) {
          const selectedIsland =
            workerCache.islands.length > 0
              ? GameLogic.selectIslandForCrew(newCharacter, workerCache.islands)
              : 1

          await db.crews.update(crewId, {
            captainId: characterId,
            currentIsland: selectedIsland,
          })
        }

        console.log(`Um novo ${type} adentrou nos mares! Seu nome é ${newCharacter.name}!`)

        created++

        // Progresso incremental
        const progress = 30 + ((i + 1) / count) * 60
        self.postMessage({
          type: 'PROGRESS',
          id: data.id,
          progress: Math.round(progress),
        })

        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error('❌ Erro ao criar personagem individual:', error)
      }
    }

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    return {
      success: true,
      created: created,
      attempted: count,
    }
  } catch (error) {
    console.error('❌ Erro na criação de novos personagens (worker):', error)
    return {
      success: false,
      created: 0,
      attempted: 0,
    }
  }
}

// ✅ FUNÇÃO PARA EXECUTAR MÚLTIPLAS OPERAÇÕES EM SEQUÊNCIA
async function executeFullWorldUpdate(data: any): Promise<any> {
  try {
    const results = {
      encounters: null,
      movement: null,
      territories: null,
      characters: null,
      newCharacters: null,
      totalTime: 0,
    }

    const startTime = Date.now()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 0,
    })

    // 1. Simular encontros (30%)
    results.encounters = await simulateEncountersWorker({ ...data, id: `${data.id}_encounters` })
    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 30,
    })

    // 2. Processar movimento (25%)
    results.movement = await processMovementWorker({ ...data, id: `${data.id}_movement` })
    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 55,
    })

    // 3. Atualizar territórios (20%)
    results.territories = await updateTerritoriesWorker({ ...data, id: `${data.id}_territories` })
    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 75,
    })

    // 4. Redistribuir personagens (15%)
    results.characters = await redistributeCharactersWorker({
      ...data,
      id: `${data.id}_characters`,
    })
    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 90,
    })

    // 5. Criar novos personagens (10%)
    results.newCharacters = await createNewCharactersWorker({ ...data, id: `${data.id}_newchars` })

    results.totalTime = Date.now() - startTime

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    return results
  } catch (error) {
    console.error('❌ Erro na atualização completa do mundo (worker):', error)
    return {
      encounters: { totalEncounters: 0, totalBattles: 0, totalMovements: 0, islandReports: [] },
      movement: {
        totalCrews: 0,
        dockedToggled: 0,
        crewsMoved: 0,
        movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
        islandReports: [],
      },
      territories: { success: false },
      characters: { success: false },
      newCharacters: { success: false, created: 0 },
      totalTime: 0,
    }
  }
}

// ✅ HANDLER PRINCIPAL DO WORKER
self.onmessage = async function (e: MessageEvent<WorkerMessage>) {
  const { type, data, id } = e.data

  try {
    let result: any

    switch (type) {
      case 'SIMULATE_ENCOUNTERS':
        result = await simulateEncountersWorker({ ...data, id })
        break

      case 'PROCESS_MOVEMENT':
        result = await processMovementWorker({ ...data, id })
        break

      case 'UPDATE_TERRITORIES':
        result = await updateTerritoriesWorker({ ...data, id })
        break

      case 'REDISTRIBUTE_CHARACTERS':
        result = await redistributeCharactersWorker({ ...data, id })
        break

      case 'CREATE_NEW_CHARACTERS':
        result = await createNewCharactersWorker({ ...data, id })
        break

      case 'CLEAR_CACHE':
        workerCache.lastCacheTime = 0
        result = { success: true }
        break

      case 'FULL_WORLD_UPDATE':
        result = await executeFullWorldUpdate({ ...data, id })
        break

      case 'UPDATE_CACHE':
        await updateCache()
        result = { success: true }
        break

      default:
        throw new Error(`Tipo de tarefa desconhecido: ${type}`)
    }

    // Enviar resultado final
    self.postMessage({
      type: `${type}_COMPLETE`,
      id,
      success: true,
      data: result,
    } as WorkerResponse)
  } catch (error) {
    // Enviar erro
    self.postMessage({
      type: 'ERROR',
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    } as WorkerResponse)
  }
}

// ✅ CONFIGURAR TRATAMENTO DE ERROS
self.onerror = function (error) {
  console.error('❌ Erro global do worker:', error)
}

self.onunhandledrejection = function (event) {
  console.error('❌ Promise rejeitada no worker:', event.reason)
}

console.log('✅ World Update Worker inicializado (versão sem Pinia)')
