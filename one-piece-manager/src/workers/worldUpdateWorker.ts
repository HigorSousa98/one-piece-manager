// src/workers/worldUpdateWorker.ts
import { db } from '../utils/database'
import { Crew, Character, DevilFruit, Island } from '../utils/database'
import { GenerationConfig } from '../utils/generationConfig'
import { GameLogic } from '../utils/gameLogic'
import { ShipNameGenerator } from '../data/shipNameGenerator'
import { CrewNameGenerator } from '../data/crewNames'
import { NameGenerator } from '../data/characterNames'
import { AdventureSystem } from '@/utils/adventureSystem'

// ✅ INTERFACES (mantidas iguais)
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

// ✅ CACHE OTIMIZADO COM MAPAS E ÍNDICES
interface OptimizedCache {
  islands: Island[]
  crews: Crew[]
  characters: Character[]
  devilFruits: DevilFruit[]
  territories: any[]
  styleCombats: any[]
  ships: any[]

  // ✅ MAPAS PARA ACESSO RÁPIDO O(1)
  islandMap: Map<number, Island>
  crewMap: Map<number, Crew>
  characterMap: Map<number, Character>
  devilFruitMap: Map<number, DevilFruit>
  shipMap: Map<number, any>

  // ✅ ÍNDICES PARA QUERIES FREQUENTES
  charactersByCrewId: Map<number, Character[]>
  crewsByIslandId: Map<number, Crew[]>

  lastCacheTime: number
  cacheTimeout: number
}

let optimizedCache: OptimizedCache = {
  islands: [],
  crews: [],
  characters: [],
  devilFruits: [],
  territories: [],
  styleCombats: [],
  ships: [],
  islandMap: new Map(),
  crewMap: new Map(),
  characterMap: new Map(),
  devilFruitMap: new Map(),
  shipMap: new Map(),
  charactersByCrewId: new Map(),
  crewsByIslandId: new Map(),
  lastCacheTime: 0,
  cacheTimeout: 30000,
}

// ✅ BATCH MANAGER INTELIGENTE
class IntelligentBatchManager {
  private characterUpdates: Map<number, Partial<Character>> = new Map()
  private crewUpdates: Map<number, Partial<Crew>> = new Map()
  private battleCreations: Array<any> = []

  // ✅ OPERAÇÕES CRÍTICAS QUE PRECISAM SER IMEDIATAS
  private criticalOperations: Promise<any>[] = []

  addCharacterUpdate(id: number, updates: Partial<Character>): void {
    const existing = this.characterUpdates.get(id) || {}
    this.characterUpdates.set(id, { ...existing, ...updates })
  }

  addCrewUpdate(id: number, updates: Partial<Crew>): void {
    const existing = this.crewUpdates.get(id) || {}
    this.crewUpdates.set(id, { ...existing, ...updates })
  }

  addBattleCreation(battle: any): void {
    this.battleCreations.push(battle)
  }

  // ✅ OPERAÇÕES CRÍTICAS EXECUTADAS IMEDIATAMENTE
  addCriticalOperation(operation: Promise<any>): void {
    this.criticalOperations.push(operation)
  }

  async executeBatch(): Promise<void> {
    try {
      const operations: Promise<any>[] = []

      // ✅ EXECUTAR OPERAÇÕES CRÍTICAS PRIMEIRO
      if (this.criticalOperations.length > 0) {
        await Promise.all(this.criticalOperations)
        this.criticalOperations = []
      }

      // ✅ CHARACTER UPDATES EM BATCH
      for (const [id, updates] of this.characterUpdates) {
        operations.push(db.characters.update(id, updates))
      }

      // ✅ CREW UPDATES EM BATCH
      for (const [id, updates] of this.crewUpdates) {
        operations.push(db.crews.update(id, updates))
      }

      // ✅ BATTLE CREATIONS EM BATCH
      if (this.battleCreations.length > 0) {
        operations.push(db.battles.bulkAdd(this.battleCreations))
      }

      // ✅ EXECUTAR TUDO EM PARALELO
      await Promise.all(operations)

      console.log(`✅ Intelligent batch executado: ${operations.length} operações`)
    } catch (error) {
      console.error('❌ Erro ao executar intelligent batch:', error)
      throw error
    }
  }

  clear(): void {
    this.characterUpdates.clear()
    this.crewUpdates.clear()
    this.battleCreations = []
    this.criticalOperations = []
  }

  getStats(): any {
    return {
      characterUpdates: this.characterUpdates.size,
      crewUpdates: this.crewUpdates.size,
      battleCreations: this.battleCreations.length,
      criticalOperations: this.criticalOperations.length,
    }
  }
}

// ✅ ATUALIZAÇÃO DE CACHE OTIMIZADA
async function updateOptimizedCache(): Promise<void> {
  const now = Date.now()

  if (now - optimizedCache.lastCacheTime > optimizedCache.cacheTimeout) {
    try {
      console.log('🔄 Atualizando cache otimizado...')

      // ✅ BUSCAR TODOS OS DADOS EM PARALELO
      const [islands, crews, characters, devilFruits, territories, styleCombats, ships] =
        await Promise.all([
          db.islands.toArray(),
          db.crews.toArray(),
          db.characters.toArray(),
          db.devilFruits.toArray(),
          db.territories.toArray(),
          db.styleCombats.toArray(),
          db.ships.toArray(),
        ])

      // ✅ ATUALIZAR ARRAYS
      optimizedCache.islands = islands
      optimizedCache.crews = crews
      optimizedCache.characters = characters
      optimizedCache.devilFruits = devilFruits
      optimizedCache.territories = territories
      optimizedCache.styleCombats = styleCombats
      optimizedCache.ships = ships

      // ✅ CRIAR MAPAS PARA ACESSO O(1)
      optimizedCache.islandMap = new Map(islands.map((i) => [i.id!, i]))
      optimizedCache.crewMap = new Map(crews.map((c) => [c.id!, c]))
      optimizedCache.characterMap = new Map(characters.map((ch) => [ch.id!, ch]))
      optimizedCache.devilFruitMap = new Map(devilFruits.map((df) => [df.id!, df]))
      optimizedCache.shipMap = new Map(ships.map((s) => [s.id!, s]))

      // ✅ CRIAR ÍNDICES PARA QUERIES FREQUENTES
      optimizedCache.charactersByCrewId = new Map()
      optimizedCache.crewsByIslandId = new Map()

      // Indexar characters por crewId
      characters.forEach((char) => {
        if (char.crewId) {
          const existing = optimizedCache.charactersByCrewId.get(char.crewId) || []
          existing.push(char)
          optimizedCache.charactersByCrewId.set(char.crewId, existing)
        }
      })

      // Indexar crews por islandId
      crews.forEach((crew) => {
        const existing = optimizedCache.crewsByIslandId.get(crew.currentIsland) || []
        existing.push(crew)
        optimizedCache.crewsByIslandId.set(crew.currentIsland, existing)
      })

      optimizedCache.lastCacheTime = now
      console.log('✅ Cache otimizado atualizado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao atualizar cache otimizado:', error)
    }
  }
}

// ✅ SIMULAÇÃO DE ENCONTROS OTIMIZADA (HÍBRIDA)
async function simulateEncountersWorkerOptimized(data: any): Promise<any> {
  try {
    await updateOptimizedCache()

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

    const batchManager = new IntelligentBatchManager()
    const maxEncounters = GenerationConfig.createEpic().islandEncounters
    const playerCrewIds = data.playerCrewIds || []

    // ✅ PROCESSAR ILHAS EM CHUNKS PARA BALANCEAR PERFORMANCE E CONSISTÊNCIA
    const chunkSize = 3
    for (let i = 0; i < optimizedCache.islands.length; i += chunkSize) {
      const islandChunk = optimizedCache.islands.slice(i, i + chunkSize)

      for (const island of islandChunk) {
        const crewsOnIsland = optimizedCache.crewsByIslandId.get(island.id!) || []
        const dockedCrews = crewsOnIsland.filter(
          (crew) => crew.docked === 1 && !playerCrewIds.includes(crew.id),
        )

        if (dockedCrews.length >= 2) {
          let encounters = []

          // ✅ GERAR ENCONTROS (MESMA LÓGICA DO SEU CÓDIGO)
          for (let j = 0; j < Math.min(maxEncounters, dockedCrews.length * 2); j++) {
            const crew1 = dockedCrews[Math.floor(Math.random() * dockedCrews.length)]
            const crew2 = dockedCrews[Math.floor(Math.random() * dockedCrews.length)]

            if (
              crew1.id === crew2.id ||
              encounters.filter((enc) => enc.crew1.id == crew1.id || enc.crew2.id == crew1.id)
                .length > 0 ||
              encounters.filter((enc) => enc.crew1.id == crew2.id || enc.crew2.id == crew2.id)
                .length > 0
            )
              continue

            const [member1, member2] = [
              optimizedCache.charactersByCrewId.get(crew1.id!) || [],
              optimizedCache.charactersByCrewId.get(crew2.id!) || [],
            ]

            if (member1.length === 0 || member2.length === 0) continue

            results.totalEncounters++
            encounters.push({ crew1, crew2 })

            // ✅ DETERMINAR TIPO DE ENCONTRO
            const encounterType = GameLogic.determineEncounterTypeOnly(crew1.type, crew2.type)

            if (encounterType === 'hostile' || encounterType === 'neutral') {
              // ✅ SIMULAR BATALHA COM BATCH INTELIGENTE
              const battleResult = await simulateCrewBattleHybrid(crew1, crew2, batchManager)
              if (battleResult) {
                results.totalBattles++
              }
            }
          }
        }
      }

      // ✅ EXECUTAR BATCH A CADA CHUNK
      await batchManager.executeBatch()
      batchManager.clear()

      // ✅ PROGRESS INCREMENTAL
      const progress = 10 + ((i + chunkSize) / optimizedCache.islands.length) * 80
      self.postMessage({
        type: 'PROGRESS',
        id: data.id,
        progress: Math.min(progress, 90),
      })

      await new Promise((resolve) => setTimeout(resolve, 1))
    }

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    console.log('✅ Encounters otimizados:', results)

    return results
  } catch (error) {
    console.error('❌ Erro na simulação de encontros otimizada:', error)
    return {
      totalEncounters: 0,
      totalBattles: 0,
      totalMovements: 0,
      islandReports: [],
    }
  }
}

// ✅ SIMULAÇÃO DE BATALHA HÍBRIDA (BATCH INTELIGENTE + DB DIRETO PARA CRÍTICOS)
async function simulateCrewBattleHybrid(
  crew1: Crew,
  crew2: Crew,
  batchManager: IntelligentBatchManager,
): Promise<{ winnerCrew: Crew; loserCrew: Crew; casualties: number } | null> {
  try {
    // ✅ BUSCAR DADOS DO CACHE (O(1))
    const crew1Members = optimizedCache.charactersByCrewId.get(crew1.id!) || []
    const crew2Members = optimizedCache.charactersByCrewId.get(crew2.id!) || []

    if (crew1Members.length === 0 || crew2Members.length === 0) return null

    const captain1 = crew1Members.find((char) => char.id === crew1.captainId)
    const captain2 = crew2Members.find((char) => char.id === crew2.captainId)

    if (!captain1 || !captain2) return null

    // ✅ DETERMINAR VENCEDOR (MESMA LÓGICA)
    const crew1Wins = simulateCrewBattleMembersOptimized(crew1Members, crew2Members)
    const winnerCrew = crew1Wins ? crew1 : crew2
    const loserCrew = crew1Wins ? crew2 : crew1
    const winnerCaptain = crew1Wins ? captain1 : captain2
    const loserCaptain = crew1Wins ? captain2 : captain1
    const winnerMembers = crew1Wins ? crew1Members : crew2Members

    // ✅ CALCULAR RECOMPENSAS (MESMA LÓGICA)
    const expGain = GameLogic.calculateExperienceGain(winnerCaptain, loserCaptain)
    const bountyGain = GameLogic.calculateBountyGain(winnerCaptain, loserCaptain)

    // ✅ PROCESSAR UPDATES EM BATCH
    const captainUpdates = await processCaptainUpdatesOptimized(
      winnerCaptain,
      expGain,
      bountyGain,
      true,
    )
    const memberUpdates = await processCrewMemberUpdatesOptimized(
      winnerMembers,
      expGain,
      bountyGain,
      true,
      0.3 + Math.random() * 0.2,
    )

    batchManager.addCharacterUpdate(winnerCaptain.id!, captainUpdates)
    memberUpdates.forEach((update) => {
      batchManager.addCharacterUpdate(update.id, update.updates)
    })

    // ✅ PROCESSAR RECRUTAMENTO E REMOÇÃO (CRÍTICO - EXECUTAR IMEDIATAMENTE)
    const recruitmentResult = await processCrewRecruitmentAndRemovalHybrid(
      winnerCrew.id!,
      loserCrew.id!,
      false,
      batchManager,
    )

    // ✅ VERIFICAR CREW VAZIO (CRÍTICO - EXECUTAR IMEDIATAMENTE)
    const remainingLoserMembers = optimizedCache.charactersByCrewId.get(loserCrew.id!) || []
    const actualRemainingMembers = remainingLoserMembers.filter(
      (char) =>
        !recruitmentResult.recruited.find((rec) => rec.id === char.id) &&
        !recruitmentResult.removed.find((rem) => rem.id === char.id),
    )

    if (actualRemainingMembers.length === 0) {
      // ✅ OPERAÇÃO CRÍTICA - EXECUTAR IMEDIATAMENTE
      batchManager.addCriticalOperation(db.crews.delete(loserCrew.id!))

      const loserShip = optimizedCache.ships.find((s) => s.crewId === loserCrew.id)
      if (loserShip) {
        batchManager.addCriticalOperation(db.ships.delete(loserShip.id!))
      }
    }
    else if(actualRemainingMembers.filter(char => char.position == 'Captain').length == 0){
      const newCaptain = actualRemainingMembers.reduce((highest, current) =>
        current.level > highest.level ? current : highest,
      )
        batchManager.addCriticalOperation(db.characters.update(newCaptain.id!, { crewId: loserCrew.id, position: 'Captain' }))

      for (const member of actualRemainingMembers) {
        if (member.id !== newCaptain.id) {
          batchManager.addCriticalOperation(db.characters.update(member.id!, { crewId: loserCrew.id, position: 'Crew Member' }))
        }
      }
    }

    // ✅ CRIAR CREW PARA ÓRFÃOS (CRÍTICO - EXECUTAR IMEDIATAMENTE)
    if (recruitmentResult.removed.length >= 1) {
      batchManager.addCriticalOperation(
        createCrewForOrphanMembersOptimized(recruitmentResult.removed, loserCrew.currentIsland),
      )
    }

    // ✅ ATUALIZAR REPUTAÇÃO (BATCH)
    const newWinnerReputation = winnerCrew.reputation + Math.floor(loserCrew.reputation * 0.1)
    const treasuryFoundPercentage = GameLogic.randomBetween(5,15) / 100
    const amount = isNaN(Math.floor(loserCrew.treasury * treasuryFoundPercentage)) ? 0 : Math.floor(loserCrew.treasury * treasuryFoundPercentage)
    const newWinnerTreasury = winnerCrew.treasury + amount
    const newLoserTreasury = loserCrew.treasury - amount
    const newLoserReputation = Math.max(
      0,
      loserCrew.reputation - Math.floor(loserCrew.reputation * 0.05),
    )

    batchManager.addCrewUpdate(winnerCrew.id!, { reputation: newWinnerReputation, treasury: newWinnerTreasury })
    batchManager.addCrewUpdate(loserCrew.id!, { reputation: newLoserReputation, treasury: newLoserTreasury })

    // ✅ REGISTRAR BATALHA (BATCH)
    batchManager.addBattleCreation({
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

    const casualties = Math.floor(Math.random() * 3)

    return { winnerCrew, loserCrew, casualties }
  } catch (error) {
    console.error('❌ Erro na batalha híbrida:', error)
    return null
  }
}

// ✅ FUNÇÕES AUXILIARES OTIMIZADAS

function simulateCrewBattleMembersOptimized(
  crew1Members: Character[],
  crew2Members: Character[],
): boolean {
  const crew1Power = GameLogic.calculateCrewPower(crew1Members, optimizedCache.devilFruits)
  const crew2Power = GameLogic.calculateCrewPower(crew2Members, optimizedCache.devilFruits)

  const totalPower = crew1Power + crew2Power
  const crew1WinChance = crew1Power / totalPower

  const attackerDice = GameLogic.diceUsed(crew1WinChance)
  const defenderDice = GameLogic.diceUsed(1 - crew1WinChance)

  const attackerCrewLevel = crew1Members.reduce((sum, member) => sum + member.level, 0)
  const defenderCrewLevel = crew2Members.reduce((sum, member) => sum + member.level, 0)

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

  return defenderHp <= 0
}

async function processCaptainUpdatesOptimized(
  character: Character,
  expGained: number,
  bountyGained: number,
  isWinner: boolean,
): Promise<Partial<Character>> {
  const updates: Partial<Character> = {}

  const newExp = character.experience + expGained
  const tempCharacter = { ...character, experience: newExp }
  const levelCheck = GameLogic.checkLevelUp(tempCharacter)

  if (levelCheck.shouldLevelUp) {
    const newLevel = levelCheck.newLevel!
    const remainingExp = newExp - levelCheck.expNeeded!

    const devilFruit = character.devilFruitId
      ? optimizedCache.devilFruitMap.get(character.devilFruitId)
      : null
    const styleCombat = optimizedCache.styleCombats.find((sc) => sc.id === character.styleCombatId)

    if (!styleCombat) {
      throw new Error(`Style Combat não encontrado para o personagem ${character.name}`)
    }

    const updatedCharacter = { ...character, level: newLevel, experience: remainingExp }
    updatedCharacter.stats = GameLogic.calculateStatIncrease(updatedCharacter)

    const statIncrease = GameLogic.increaseStats(
      updatedCharacter,
      newLevel,
      styleCombat,
      devilFruit,
    )

    updates.level = newLevel
    updates.experience = remainingExp
    updates.stats = { ...character.stats, ...statIncrease }
  } else {
    updates.experience = newExp
  }

  if (isWinner && bountyGained > 0) {
    updates.bounty = character.bounty + bountyGained
  }

  return updates
}

async function processCrewMemberUpdatesOptimized(
  members: Character[],
  expGained: number,
  bountyGained: number,
  isWinner: boolean,
  percentage: number,
): Promise<Array<{ id: number; updates: Partial<Character> }>> {
  const memberUpdatesPromises = members
    .filter((member) => member.position !== 'Captain')
    .map(async (member) => {
      const updates: Partial<Character> = {}

      if (isWinner) {
        const memberExpGain = Math.floor(
          (expGained * percentage * GameLogic.randomBetween(100, 120)) / 100,
        )
        const memberBountyGain = Math.floor(
          (bountyGained * percentage * GameLogic.randomBetween(100, 120)) / 100,
        )

        const newExpMember = member.experience + memberExpGain
        const tempMember = { ...member, experience: newExpMember }
        const levelCheckMember = GameLogic.checkLevelUp(tempMember)

        if (levelCheckMember.shouldLevelUp) {
          const newLevelMember = levelCheckMember.newLevel!
          const remainingExpMember = newExpMember - levelCheckMember.expNeeded!

          const devilFruitMember = member.devilFruitId
            ? optimizedCache.devilFruitMap.get(member.devilFruitId)
            : null
          const styleCombatMember = optimizedCache.styleCombats.find(
            (sc) => sc.id === member.styleCombatId,
          )

          if (!styleCombatMember) {
            throw new Error(`Style Combat não encontrado para o personagem ${member.name}`)
          }

          const updatedMember = { ...member, level: newLevelMember, experience: remainingExpMember }
          updatedMember.stats = GameLogic.calculateStatIncrease(updatedMember)

          const statIncreaseMember = GameLogic.increaseStats(
            updatedMember,
            newLevelMember,
            styleCombatMember,
            devilFruitMember,
          )

          updates.level = newLevelMember
          updates.experience = remainingExpMember
          updates.stats = { ...member.stats, ...statIncreaseMember }
        } else {
          updates.experience = newExpMember
        }

        if (memberBountyGain > 0) {
          updates.bounty = member.bounty + memberBountyGain
        }

        updates.loyalty = Math.min(100, member.loyalty + (1 + Math.random() * 3))
      } else {
        updates.loyalty = Math.max(-100, member.loyalty - (1 + Math.random() * 2))
      }

      return { id: member.id!, updates }
    })

  return Promise.all(memberUpdatesPromises)
}

// ✅ RECRUTAMENTO E REMOÇÃO HÍBRIDO (CRÍTICO - EXECUTAR IMEDIATAMENTE)
async function processCrewRecruitmentAndRemovalHybrid(
  winnerCrewId: number,
  loserCrewId: number,
  isPlayerInvolved: boolean,
  batchManager: IntelligentBatchManager,
): Promise<CrewRecruitmentResult> {
  const result: CrewRecruitmentResult = {
    recruited: [],
    removed: [],
    recruitmentAttempts: 0,
    removalAttempts: 0,
  }

  if (isPlayerInvolved) return result

  const winnerCrew = optimizedCache.crewMap.get(winnerCrewId)
  const loserCrew = optimizedCache.crewMap.get(loserCrewId)

  if (!winnerCrew || !loserCrew) return result

  const winnerCapacity = getCrewCapacityInfoOptimized(winnerCrewId)

  // ✅ PROCESSAR RECRUTAMENTO (CRÍTICO - EXECUTAR IMEDIATAMENTE)
  if (winnerCapacity.hasSpace && GameLogic.validateTypeCompatibility(winnerCrew.type, loserCrew.type)) {
    const recruitmentResult = await processRecruitmentImmediate(
      winnerCrewId,
      loserCrewId,
      winnerCapacity,
    )
    result.recruited = recruitmentResult.recruited
    result.recruitmentAttempts = recruitmentResult.attempts
  }

  // ✅ PROCESSAR REMOÇÃO (CRÍTICO - EXECUTAR IMEDIATAMENTE)
  const removalResult = await processCrewMemberRemovalImmediate(loserCrewId, result.recruited)
  result.removed = removalResult.removed
  result.removalAttempts = removalResult.attempts

  return result
}

function getCrewCapacityInfoOptimized(crewId: number): CrewCapacityInfo {
  const currentMembers = optimizedCache.charactersByCrewId.get(crewId) || []
  const ship = optimizedCache.ships.find((s) => s.crewId === crewId)

  const shipLevel = ship?.level || 1
  const maxCapacity = shipLevel * 3

  return {
    currentMembers: currentMembers.length,
    maxCapacity,
    hasSpace: currentMembers.length < maxCapacity,
    shipLevel,
  }
}

// ✅ RECRUTAMENTO IMEDIATO (PARA MANTER CONSISTÊNCIA)
async function processRecruitmentImmediate(
  winnerCrewId: number,
  loserCrewId: number,
  capacity: CrewCapacityInfo,
): Promise<{ recruited: Character[]; attempts: number }> {
  const recruited: Character[] = []
  let attempts = 0

  const winnerCrew = optimizedCache.crewMap.get(winnerCrewId)

  const eligibleMembers = (optimizedCache.charactersByCrewId.get(loserCrewId) || [])
    .filter((char) => char.isPlayer !== 1)
    .sort((a, b) => a.loyalty - b.loyalty)

  for (const member of eligibleMembers) {
    if (capacity.currentMembers + recruited.length >= capacity.maxCapacity) break

    attempts++

    const recruitmentChance = 0.2 + (1 - member.loyalty / 100) * 0.1
    if (Math.random() <= recruitmentChance) {
      // ✅ EXECUTAR IMEDIATAMENTE PARA MANTER CONSISTÊNCIA
      await db.characters.update(member.id!, { crewId: winnerCrewId, type: winnerCrew.type, position: 'Crew Member' })
      recruited.push(member)

      if (Math.random() < 0.6) break
    }
  }

  return { recruited, attempts }
}

// ✅ REMOÇÃO IMEDIATA (PARA MANTER CONSISTÊNCIA)
async function processCrewMemberRemovalImmediate(
  loserCrewId: number,
  recruited: Character[],
): Promise<{ removed: Character[]; attempts: number }> {
  const removed: Character[] = []
  let attempts = 0

  const eligibleMembers = (optimizedCache.charactersByCrewId.get(loserCrewId) || []).filter(
    (char) => char.isPlayer !== 1 && !recruited.find((rec) => rec.id == char.id),
  )

  if (eligibleMembers.length > 1) {
    for (const member of eligibleMembers) {
      if (removed.length + 1 < eligibleMembers.length) {
        attempts++

        if (Math.random() <= 0.1) {
          // ✅ EXECUTAR IMEDIATAMENTE PARA MANTER CONSISTÊNCIA
          await db.characters.update(member.id!, { crewId: 0 })
          removed.push(member)

          if (Math.random() < 0.7) break
        }
      }
    }
  }

  return { removed, attempts }
}

// ✅ CRIAR CREW PARA ÓRFÃOS (CRÍTICO - EXECUTAR IMEDIATAMENTE)
async function createCrewForOrphanMembersOptimized(
  orphanMembers: Character[],
  originalIslandId: number,
): Promise<Crew | null> {
  if (orphanMembers.length === 0) return null

  const captain = orphanMembers.reduce((highest, current) =>
    current.level > highest.level ? current : highest,
  )

  const crewName = CrewNameGenerator.generateCrewName(
    captain.type as 'Pirate' | 'Marine' | 'BountyHunter' | 'Government',
  )

  // ✅ EXECUTAR IMEDIATAMENTE PARA MANTER CONSISTÊNCIA
  const newCrewId = await db.crews.add({
    name: crewName,
    type: captain.type as 'Pirate' | 'Marine' | 'BountyHunter' | 'Government',
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

  // ✅ ATUALIZAR MEMBROS IMEDIATAMENTE
  await db.characters.update(captain.id!, { crewId: newCrewId, position: 'Captain' })

  for (const member of orphanMembers) {
    if (member.id !== captain.id) {
      await db.characters.update(member.id!, { crewId: newCrewId, position: 'Crew Member' })
    }
  }

  // ✅ CRIAR NAVIO IMEDIATAMENTE
  await db.ships.add({
    crewId: newCrewId,
    level: 1,
    needRepair: false,
    destroyed: false,
    name: ShipNameGenerator.generateShipNameByCrewType(captain.type),
  })

  const newCrew = await db.crews.get(newCrewId)
  return newCrew || null
}



// ✅ OUTRAS FUNÇÕES OTIMIZADAS (MANTENDO LÓGICA ORIGINAL)

// ✅ PROCESSAR MOVIMENTO OTIMIZADO
async function processMovementWorkerOptimized(data: any): Promise<any> {
  try {
    await updateOptimizedCache()

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

    const playerCrewIds = data.playerCrewIds || []
    const territoriesCrewIds = optimizedCache.territories.map((territory) => territory.crewId)

    const availableCrews = optimizedCache.crews.filter(
      (crew) => !playerCrewIds.includes(crew.id) && !territoriesCrewIds.includes(crew.id),
    )

    // ✅ PROCESSAR DOCKED STATUS EM BATCH
    const dockedUpdates: Promise<any>[] = []
    let toggled = 0

    for (const crew of availableCrews) {
      const roll = Math.random()
      const newDockedStatus = roll <= 0.1 ? 0 : 1

      if (crew.docked !== newDockedStatus) {
        dockedUpdates.push(db.crews.update(crew.id!, { docked: newDockedStatus as 0 | 1 }))
        toggled++
      }
    }

    await Promise.all(dockedUpdates)

    // ✅ ATUALIZAR CACHE APÓS MUDANÇAS
    await updateOptimizedCache()

    const crewMovementFactor = GenerationConfig.createEpic().crewMovementFactor
    const crewByIslandPower = new Map()

    // ✅ CRIAR MAPA DE CREWS POR ILHA (COM PODER CALCULADO)
    optimizedCache.islands.forEach((island) => {
      const crewsInThisIsland = optimizedCache.crewsByIslandId.get(island.id!) || []
      const crewsWithPower = crewsInThisIsland.map((crew) => {
        const crewMembers = optimizedCache.charactersByCrewId.get(crew.id!) || []
        const power = GameLogic.calculateCrewPower(crewMembers, optimizedCache.devilFruits)
        return { crew, power }
      })

      crewsWithPower.sort((a, b) => b.power - a.power)
      crewByIslandPower.set(island.id!, crewsWithPower)
    })

    const movableCrews = optimizedCache.crews.filter(
      (crew) =>
        crew.docked === 1 &&
        crew.captainId > 0 &&
        !playerCrewIds.includes(crew.id) &&
        !territoriesCrewIds.includes(crew.id),
    )

    result.totalCrews = movableCrews.length

    // ✅ PROCESSAR MOVIMENTO EM CHUNKS
    const chunkSize = 5
    const movementDecisions: CrewMovementDecision[] = []
    const movementsByDifficulty = { easier: 0, same: 0, harder: 0 }

    for (let i = 0; i < movableCrews.length; i += chunkSize) {
      const crewChunk = movableCrews.slice(i, i + chunkSize)

      for (const crew of crewChunk) {
        if (Math.random() <= crewMovementFactor) {
          const currentIsland = optimizedCache.islandMap.get(crew.currentIsland)
          if (currentIsland) {
            const crewsWithPower = crewByIslandPower.get(crew.currentIsland) || []
            const currentIndex = crewsWithPower.findIndex((item) => item.crew.id === crew.id) || 0
            const totalCrewsOnIsland = crewsWithPower.length || 1
            const percent = currentIndex / totalCrewsOnIsland

            const destinationDecision = await selectDestinationIslandOptimized(
              currentIsland,
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

      // ✅ PROGRESS INCREMENTAL
      const progress = 15 + ((i + chunkSize) / movableCrews.length) * 70
      self.postMessage({
        type: 'PROGRESS',
        id: data.id,
        progress: Math.min(progress, 85),
      })

      await new Promise((resolve) => setTimeout(resolve, 1))
    }

    // ✅ EXECUTAR MOVIMENTOS EM BATCH
    const movementPromises = movementDecisions.map((decision) =>
      db.crews.update(decision.crewId, {
        currentIsland: decision.toIslandId,
        docked: 1,
      }),
    )

    await Promise.all(movementPromises)

    // ✅ GERAR RELATÓRIOS
    const islandReports = await generateIslandMovementReportOptimized(movementDecisions)

    result.crewsMoved = movementDecisions.length
    result.dockedToggled = toggled
    result.islandReports = islandReports
    result.movementsByDifficulty = movementsByDifficulty

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    console.log('✅ Movimento otimizado:', result)

    return result
  } catch (error) {
    console.error('❌ Erro no processamento de movimento otimizado:', error)
    return {
      totalCrews: 0,
      dockedToggled: 0,
      crewsMoved: 0,
      movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
      islandReports: [],
    }
  }
}

async function selectDestinationIslandOptimized(
  currentIsland: Island,
  percent: number,
): Promise<{ island: Island; type: 'easier' | 'same' | 'harder' } | null> {
  try {
    const availableIslands = optimizedCache.islands.filter(
      (island) => island.id !== currentIsland.id,
    )

    if (availableIslands.length === 0) return null

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
        return null
      }
    }

    const selectedIsland = selectedIslands[Math.floor(Math.random() * selectedIslands.length)]

    return {
      island: selectedIsland,
      type: movementType,
    }
  } catch (error) {
    console.error('❌ Erro ao selecionar ilha de destino otimizada:', error)
    return null
  }
}

async function generateIslandMovementReportOptimized(movements: CrewMovementDecision[]): Promise<
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

    optimizedCache.islands.forEach((island) => {
      const crewsLeft = movements.filter((m) => m.fromIslandId === island.id).length
      const crewsArrived = movements.filter((m) => m.toIslandId === island.id).length

      const currentCrews = (optimizedCache.crewsByIslandId.get(island.id!) || []).filter(
        (c) => c.docked === 1,
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
    })

    return reports.sort((a, b) => b.crewsLeft + b.crewsArrived - (a.crewsLeft + a.crewsArrived))
  } catch (error) {
    console.error('❌ Erro ao gerar relatório de movimento otimizado:', error)
    return []
  }
}

// ✅ ATUALIZAR TERRITÓRIOS OTIMIZADO
async function updateTerritoriesWorkerOptimized(data: any): Promise<any> {
  try {
    await updateOptimizedCache()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 20,
    })

    const playerCrewId = data.playerCrewId
    if (!playerCrewId) {
      console.warn('❌ PlayerCrewId não fornecido para worker')
      return { success: false }
    }

    const allCrews = optimizedCache.crews.filter((crew) => crew.docked === 1)
    const occupiedTerritories = optimizedCache.territories.filter(
      (territory) => territory.crewId !== 0,
    )

    // ✅ CALCULAR CREW MAIS FORTE POR ILHA EM PARALELO
    const territoryUpdatePromises = occupiedTerritories.map(async (territory) => {
      const crewsOnIsland = allCrews.filter(
        (crew) => crew.currentIsland === territory.islandId && crew.id !== playerCrewId,
      )

      if (crewsOnIsland.length === 0) {
        return db.territories.update(territory.id!, { crewId: 0 })
      }

      const crewPowers = crewsOnIsland.map((crew) => {
        const crewMembers = optimizedCache.charactersByCrewId.get(crew.id!) || []
        const power = GameLogic.calculateCrewPower(crewMembers, optimizedCache.devilFruits)
        return { crew, power }
      })

      const strongestCrew = crewPowers.reduce((strongest, current) =>
        current.power > strongest.power ? current : strongest,
      )

      return db.territories.update(territory.id!, { crewId: strongestCrew.crew.id! })
    })

    await Promise.all(territoryUpdatePromises)

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    return { success: true }
  } catch (error) {
    console.error('❌ Erro na atualização de territórios otimizada:', error)
    return { success: false }
  }
}

// ✅ REDISTRIBUIR PERSONAGENS OTIMIZADO
async function redistributeCharactersWorkerOptimized(data: any): Promise<any> {
  try {
    await updateOptimizedCache()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 25,
    })

    const config = GenerationConfig.createEpic()

    const calculatePowerSafe = (character: Character) => {
      const devilFruit = character.devilFruitId
        ? optimizedCache.devilFruitMap.get(character.devilFruitId)
        : undefined
      return GameLogic.calculatePower(character, devilFruit)
    }

    // ✅ FILTRAR E ORDENAR EM PARALELO
    const [pirates, marines, government] = await Promise.all([
      Promise.resolve(
        optimizedCache.characters
          .filter((char) => char.type === 'Pirate' && char.position === 'Captain')
          .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a)),
      ),
      Promise.resolve(
        optimizedCache.characters
          .filter((char) => char.type === 'Marine' && char.position === 'Captain')
          .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a)),
      ),
      Promise.resolve(
        optimizedCache.characters
          .filter((char) => char.type === 'Government')
          .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a)),
      ),
    ])

    // ✅ LIMPAR TABELAS EM PARALELO
    const clearOperations = [
      db.yonkous.clear(),
      db.shichibukais.clear(),
      db.admirals.clear(),
      db.gorouseis.clear(),
      db.cypherPols.clear(),
    ]

    await Promise.all(clearOperations)

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 50,
    })

    const getBaseIsland = (character: Character) => {
      const crew = optimizedCache.crewMap.get(character.crewId!)
      if (!crew) {
        return optimizedCache.islands[0]?.id || 1
      }
      return crew.currentIsland
    }

    // ✅ CRIAR TODAS AS ENTRADAS EM PARALELO
    const creationPromises: Promise<any>[] = []

    // Yonkou
    for (let i = 0; i < Math.min(config.yonkouCount, pirates.length); i++) {
      const pirate = pirates[i]
      creationPromises.push(
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
      creationPromises.push(
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
      creationPromises.push(
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
      creationPromises.push(
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
    const sortedIslands = optimizedCache.islands.sort((a, b) => a.difficulty - b.difficulty)

    for (let i = cpStartIndex; i < cpEndIndex; i++) {
      const gov = government[i]
      const randomIsland = sortedIslands[GameLogic.randomBetween(0, sortedIslands.length - 1)]

      creationPromises.push(
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

    // ✅ EXECUTAR TODAS AS CRIAÇÕES EM PARALELO
    await Promise.all(creationPromises)

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    return { success: true }
  } catch (error) {
    console.error('❌ Erro na redistribuição de personagens otimizada:', error)
    return { success: false }
  }
}

// ✅ CRIAR NOVOS PERSONAGENS - VERSÃO CORRIGIDA (DB DIRETO)
async function createNewCharactersWorkerOptimized(data: any): Promise<any> {
  try {
    await updateOptimizedCache()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 30,
    })

    const count = Math.floor(Math.random() * 3) + 1
    let created = 0

    // ✅ PROCESSAR CADA PERSONAGEM SEQUENCIALMENTE PARA LIDAR COM DEPENDÊNCIAS DE ID
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

        let characterId = 0

        // ✅ CRIAR CREW PRIMEIRO (SE NECESSÁRIO) E OBTER ID REAL
          const newCrew: Omit<Crew, 'id'> = {
            name: CrewNameGenerator.generateCrewName(type as 'Pirate' | 'Marine' | 'BountyHunter'),
            type: type as 'Pirate' | 'Marine' | 'BountyHunter',
            captainId: 0,
            currentIsland: 0,
            docked: 1,
            reputation: 0,
            foundedAt: new Date(),
            treasury: 0,
          }

          const crewId = await db.crews.add(newCrew)

        const styleCombatId =
          optimizedCache.styleCombats.length > 0
            ? optimizedCache.styleCombats[
                GameLogic.randomBetween(0, optimizedCache.styleCombats.length - 1)
              ].id || 0
            : 1

        const potentialToHaveKngHaki = Math.random()

        const newCharacter: Omit<Character, 'id'> = {
          name: NameGenerator.generateRandomName(
            type as 'Pirate' | 'Marine' | 'BountyHunter' | 'Civillian' | 'Government',
          ),
          type: type as 'Pirate' | 'Marine' | 'BountyHunter' | 'Civillian' | 'Government',
          level: 1,
          experience: 0,
          bounty: 0,
          stats: GameLogic.generateStats(
            1,
            optimizedCache.styleCombats.find((st) => st.id === styleCombatId)?.name || 'Balanced',
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

        // ✅ CRIAR PERSONAGEM E OBTER ID REAL
        characterId = await db.characters.add(newCharacter)

        // ✅ ATUALIZAR CREW COM ID DO CAPITÃO E ILHA (SE CREW FOI CRIADO)
        if (crewId !== 0) {
          const selectedIsland =
            optimizedCache.islands.length > 0
              ? GameLogic.selectIslandForCrew(newCharacter, optimizedCache.islands)
              : 1

          await db.crews.update(crewId, {
            captainId: characterId,
            currentIsland: selectedIsland,
            treasury:
              type === 'Marine'
                ? GameLogic.randomBetween(1000000, 50000000)
                : GameLogic.randomBetween(100000, 1000000),
                type: type as 'Pirate' | 'Marine' | 'BountyHunter' | 'Government'
          })

          // ✅ CRIAR NAVIO PARA O CREW COM ID REAL
          await db.ships.add({
            crewId: crewId,
            level: 1,
            needRepair: false,
            destroyed: false,
            name: ShipNameGenerator.generateShipNameByCrewType(type),
          })
        }

        console.log(`🎉 Um novo ${type} adentrou nos mares! Seu nome é ${newCharacter.name}!`)
        created++

        // ✅ PROGRESS INCREMENTAL
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
    console.error('❌ Erro na criação de novos personagens otimizada:', error)
    return {
      success: false,
      created: 0,
      attempted: 0,
    }
  }
}

// ✅ FUNÇÃO PARA EXECUTAR MÚLTIPLAS OPERAÇÕES EM SEQUÊNCIA OTIMIZADA
async function executeFullWorldUpdateOptimized(data: any): Promise<any> {
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

    // ✅ EXECUTAR ALGUMAS FASES EM PARALELO QUANDO POSSÍVEL
    const [encountersResult, movementResult] = await Promise.all([
      // 1. Simular encontros (30%)
      simulateEncountersWorkerOptimized({ ...data, id: `${data.id}_encounters` }),
      // 2. Processar movimento (25%) - pode ser paralelo aos encontros
      processMovementWorkerOptimized({ ...data, id: `${data.id}_movement` }),
    ])

    results.encounters = encountersResult
    results.movement = movementResult

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 55,
    })

    // 3. Atualizar territórios (20%) - depende do movimento
    results.territories = await updateTerritoriesWorkerOptimized({
      ...data,
      id: `${data.id}_territories`,
    })
    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 75,
    })

    // ✅ EXECUTAR ÚLTIMAS FASES EM PARALELO
    const [charactersResult, newCharactersResult] = await Promise.all([
      // 4. Redistribuir personagens (15%)
      redistributeCharactersWorkerOptimized({ ...data, id: `${data.id}_characters` }),
      // 5. Criar novos personagens (10%) - pode ser paralelo
      createNewCharactersWorkerOptimized({ ...data, id: `${data.id}_newchars` }),
    ])

    results.characters = charactersResult
    results.newCharacters = newCharactersResult

    results.totalTime = Date.now() - startTime

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    console.log(`✅ Update completo otimizado em ${results.totalTime}ms`)

    return results
  } catch (error) {
    console.error('❌ Erro na atualização completa do mundo otimizada:', error)
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

// ✅ HANDLER PRINCIPAL DO WORKER (OTIMIZADO)
self.onmessage = async function (e: MessageEvent<WorkerMessage>) {
  const { type, data, id } = e.data

  try {
    let result: any

    switch (type) {
      case 'SIMULATE_ENCOUNTERS':
        result = await simulateEncountersWorkerOptimized({ ...data, id })
        break

      case 'PROCESS_MOVEMENT':
        result = await processMovementWorkerOptimized({ ...data, id })
        break

      case 'UPDATE_TERRITORIES':
        result = await updateTerritoriesWorkerOptimized({ ...data, id })
        break

      case 'REDISTRIBUTE_CHARACTERS':
        result = await redistributeCharactersWorkerOptimized({ ...data, id })
        break

      case 'CREATE_NEW_CHARACTERS':
        result = await createNewCharactersWorkerOptimized({ ...data, id })
        break

      case 'CLEAR_CACHE':
        optimizedCache.lastCacheTime = 0
        result = { success: true }
        break

      case 'FULL_WORLD_UPDATE':
        result = await executeFullWorldUpdateOptimized({ ...data, id })
        break

      case 'UPDATE_CACHE':
        await updateOptimizedCache()
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
  console.error('❌ Erro global do worker otimizado:', error)
}

self.onunhandledrejection = function (event) {
  console.error('❌ Promise rejeitada no worker otimizado:', event.reason)
}

console.log('✅ World Update Worker Otimizado inicializado (versão híbrida corrigida)')
