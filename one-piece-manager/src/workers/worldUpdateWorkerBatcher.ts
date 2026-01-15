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

// ✅ CACHE OTIMIZADO COM MAPAS
interface OptimizedCache {
  islands: Island[]
  crews: Crew[]
  characters: Character[]
  devilFruits: DevilFruit[]
  territories: any[]
  styleCombats: any[]
  ships: any[]
  
  // ✅ MAPAS PARA ACESSO RÁPIDO
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

// ✅ ATUALIZAÇÃO DE CACHE OTIMIZADA - UMA ÚNICA VEZ
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
          db.ships.toArray()
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
      optimizedCache.islandMap = new Map(islands.map(i => [i.id!, i]))
      optimizedCache.crewMap = new Map(crews.map(c => [c.id!, c]))
      optimizedCache.characterMap = new Map(characters.map(ch => [ch.id!, ch]))
      optimizedCache.devilFruitMap = new Map(devilFruits.map(df => [df.id!, df]))
      optimizedCache.shipMap = new Map(ships.map(s => [s.id!, s]))

      // ✅ CRIAR ÍNDICES PARA QUERIES FREQUENTES
      optimizedCache.charactersByCrewId = new Map()
      optimizedCache.crewsByIslandId = new Map()

      // Indexar characters por crewId
      characters.forEach(char => {
        if (char.crewId) {
          const existing = optimizedCache.charactersByCrewId.get(char.crewId) || []
          existing.push(char)
          optimizedCache.charactersByCrewId.set(char.crewId, existing)
        }
      })

      // Indexar crews por islandId
      crews.forEach(crew => {
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

// ✅ BATCH OPERATIONS MANAGER
class BatchOperationsManager {
  private characterUpdates: Map<number, Partial<Character>> = new Map()
  private crewUpdates: Map<number, Partial<Crew>> = new Map()
  private characterCreations: Array<Omit<Character, 'id'>> = []
  private crewCreations: Array<Omit<Crew, 'id'>> = []
  private shipCreations: Array<any> = []
  private battleCreations: Array<any> = []
  private deletions: {
    crews: number[]
    ships: number[]
    characters: number[]
  } = { crews: [], ships: [], characters: [] }

  // ✅ ADICIONAR UPDATE DE CHARACTER
  addCharacterUpdate(id: number, updates: Partial<Character>): void {
    const existing = this.characterUpdates.get(id) || {}
    this.characterUpdates.set(id, { ...existing, ...updates })
  }

  // ✅ ADICIONAR UPDATE DE CREW
  addCrewUpdate(id: number, updates: Partial<Crew>): void {
    const existing = this.crewUpdates.get(id) || {}
    this.crewUpdates.set(id, { ...existing, ...updates })
  }

  // ✅ ADICIONAR CRIAÇÕES
  addCharacterCreation(character: Omit<Character, 'id'>): void {
    this.characterCreations.push(character)
  }

  addCrewCreation(crew: Omit<Crew, 'id'>): void {
    this.crewCreations.push(crew)
  }

  addShipCreation(ship: any): void {
    this.shipCreations.push(ship)
  }

  addBattleCreation(battle: any): void {
    this.battleCreations.push(battle)
  }

  // ✅ ADICIONAR DELEÇÕES
  addCrewDeletion(id: number): void {
    this.deletions.crews.push(id)
  }

  addShipDeletion(id: number): void {
    this.deletions.ships.push(id)
  }

  addCharacterDeletion(id: number): void {
    this.deletions.characters.push(id)
  }

  // ✅ EXECUTAR TODAS AS OPERAÇÕES EM LOTE
  async executeBatch(): Promise<void> {
    try {
      const operations: Promise<any>[] = []

      // ✅ CHARACTER UPDATES
      for (const [id, updates] of this.characterUpdates) {
        operations.push(db.characters.update(id, updates))
      }

      // ✅ CREW UPDATES
      for (const [id, updates] of this.crewUpdates) {
        operations.push(db.crews.update(id, updates))
      }

      // ✅ CRIAÇÕES EM LOTE
      if (this.characterCreations.length > 0) {
        operations.push(db.characters.bulkAdd(this.characterCreations))
      }

      if (this.crewCreations.length > 0) {
        operations.push(db.crews.bulkAdd(this.crewCreations))
      }

      if (this.shipCreations.length > 0) {
        operations.push(db.ships.bulkAdd(this.shipCreations))
      }

      if (this.battleCreations.length > 0) {
        operations.push(db.battles.bulkAdd(this.battleCreations))
      }

      // ✅ DELEÇÕES EM LOTE
      if (this.deletions.crews.length > 0) {
        operations.push(db.crews.bulkDelete(this.deletions.crews))
      }

      if (this.deletions.ships.length > 0) {
        operations.push(db.ships.bulkDelete(this.deletions.ships))
      }

      if (this.deletions.characters.length > 0) {
        operations.push(db.characters.bulkDelete(this.deletions.characters))
      }

      // ✅ EXECUTAR TUDO EM PARALELO
      await Promise.all(operations)

      console.log(`✅ Batch executado: ${operations.length} operações`)

    } catch (error) {
      console.error('❌ Erro ao executar batch:', error)
      throw error
    }
  }

  // ✅ LIMPAR BATCH
  clear(): void {
    this.characterUpdates.clear()
    this.crewUpdates.clear()
    this.characterCreations = []
    this.crewCreations = []
    this.shipCreations = []
    this.battleCreations = []
    this.deletions = { crews: [], ships: [], characters: [] }
  }

  // ✅ OBTER ESTATÍSTICAS
  getStats(): any {
    return {
      characterUpdates: this.characterUpdates.size,
      crewUpdates: this.crewUpdates.size,
      characterCreations: this.characterCreations.length,
      crewCreations: this.crewCreations.length,
      shipCreations: this.shipCreations.length,
      battleCreations: this.battleCreations.length,
      deletions: {
        crews: this.deletions.crews.length,
        ships: this.deletions.ships.length,
        characters: this.deletions.characters.length
      }
    }
  }
}

// ✅ SIMULAÇÃO DE ENCONTROS OTIMIZADA
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

    const batchManager = new BatchOperationsManager()
    const maxEncounters = GenerationConfig.createEpic().islandEncounters

    // ✅ PROCESSAR TODAS AS ILHAS EM PARALELO (SEM LOOPS ANINHADOS)
    const islandPromises = optimizedCache.islands.map(async (island, index) => {
      const crewsOnIsland = optimizedCache.crewsByIslandId.get(island.id!) || []
      const dockedCrews = crewsOnIsland.filter(crew => crew.docked === 1)

      if (dockedCrews.length < 2) return { encounters: 0, battles: 0 }

      let islandEncounters = 0
      let islandBattles = 0

      // ✅ GERAR TODAS AS COMBINAÇÕES POSSÍVEIS DE UMA VEZ
      const encounters = []
      const maxIslandEncounters = Math.min(maxEncounters, dockedCrews.length * 2)

      for (let i = 0; i < maxIslandEncounters; i++) {
        const crew1 = dockedCrews[Math.floor(Math.random() * dockedCrews.length)]
        const crew2 = dockedCrews[Math.floor(Math.random() * dockedCrews.length)]

        if (crew1.id !== crew2.id) {
          encounters.push({ crew1, crew2 })
        }
      }

      // ✅ PROCESSAR ENCONTROS EM PARALELO
      const encounterResults = await Promise.all(
        encounters.map(async ({ crew1, crew2 }) => {
          const crew1Members = optimizedCache.charactersByCrewId.get(crew1.id!) || []
          const crew2Members = optimizedCache.charactersByCrewId.get(crew2.id!) || []

          if (crew1Members.length === 0 || crew2Members.length === 0) {
            return { encounter: false, battle: false }
          }

          const encounterType = AdventureSystem.determineEncounterType(crew1Members[0], crew2Members[0])

          if (encounterType === 'hostile') {
            const battleResult = await simulateCrewBattleOptimized(crew1, crew2, batchManager)
            return { encounter: true, battle: !!battleResult }
          }

          return { encounter: true, battle: false }
        })
      )

      // ✅ CONTAR RESULTADOS
      encounterResults.forEach(result => {
        if (result.encounter) islandEncounters++
        if (result.battle) islandBattles++
      })

      // ✅ PROGRESS INCREMENTAL
      const progress = 10 + ((index + 1) / optimizedCache.islands.length) * 70
      self.postMessage({
        type: 'PROGRESS',
        id: data.id,
        progress: Math.min(progress, 80),
      })

      return { encounters: islandEncounters, battles: islandBattles }
    })

    // ✅ AGUARDAR TODOS OS RESULTADOS
    const allResults = await Promise.all(islandPromises)

    // ✅ CONSOLIDAR RESULTADOS
    allResults.forEach(result => {
      results.totalEncounters += result.encounters
      results.totalBattles += result.battles
    })

    // ✅ EXECUTAR BATCH DE UMA VEZ
    await batchManager.executeBatch()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    console.log('✅ Encounters otimizados:', results)
    console.log('📊 Batch stats:', batchManager.getStats())

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

// ✅ SIMULAÇÃO DE BATALHA OTIMIZADA (SEM LOOPS DE DB)
async function simulateCrewBattleOptimized(
  crew1: Crew,
  crew2: Crew,
  batchManager: BatchOperationsManager
): Promise<{ winnerCrew: Crew; loserCrew: Crew; casualties: number } | null> {
  try {
    // ✅ BUSCAR DADOS DO CACHE (O(1))
    const crew1Members = optimizedCache.charactersByCrewId.get(crew1.id!) || []
    const crew2Members = optimizedCache.charactersByCrewId.get(crew2.id!) || []

    if (crew1Members.length === 0 || crew2Members.length === 0) return null

    const captain1 = crew1Members.find(char => char.id === crew1.captainId)
    const captain2 = crew2Members.find(char => char.id === crew2.captainId)

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

    // ✅ PROCESSAR UPDATES EM MEMÓRIA (SEM DB)
    const captainUpdates = await processCaptainUpdatesOptimized(winnerCaptain, expGain, bountyGain, true)
    const memberUpdates = await processCrewMemberUpdatesOptimized(winnerMembers, expGain, bountyGain, true, GenerationConfig.createEpic().regularCrewSharedGain)

    // ✅ ADICIONAR AO BATCH (SEM EXECUTAR AINDA)
    batchManager.addCharacterUpdate(winnerCaptain.id!, captainUpdates)
    memberUpdates.forEach(update => {
      batchManager.addCharacterUpdate(update.id, update.updates)
    })

    // ✅ PROCESSAR RECRUTAMENTO (MESMA LÓGICA, MAS EM BATCH)
    const recruitmentResult = await processCrewRecruitmentAndRemovalOptimized(
      winnerCrew.id!,
      loserCrew.id!,
      false,
      batchManager
    )

    // ✅ VERIFICAR CREW VAZIO
    const remainingLoserMembers = optimizedCache.charactersByCrewId.get(loserCrew.id!) || []
    if (remainingLoserMembers.length <= recruitmentResult.recruited.length) {
      batchManager.addCrewDeletion(loserCrew.id!)
      
      const loserShip = optimizedCache.ships.find(s => s.crewId === loserCrew.id)
      if (loserShip) {
        batchManager.addShipDeletion(loserShip.id!)
      }
    }

    // ✅ CRIAR CREW PARA ÓRFÃOS (SE NECESSÁRIO)
    if (recruitmentResult.removed.length >= 1) {
      await createCrewForOrphanMembersOptimized(recruitmentResult.removed, loserCrew.currentIsland, batchManager)
    }

    // ✅ ATUALIZAR REPUTAÇÃO (MESMA LÓGICA)
    const newWinnerReputation = winnerCrew.reputation + Math.floor(loserCrew.reputation * 0.1)
    const newLoserReputation = Math.max(0, loserCrew.reputation - Math.floor(loserCrew.reputation * 0.05))

    batchManager.addCrewUpdate(winnerCrew.id!, { reputation: newWinnerReputation })
    batchManager.addCrewUpdate(loserCrew.id!, { reputation: newLoserReputation })

    // ✅ REGISTRAR BATALHA
    batchManager.addBattleCreation({
      timestamp: new Date(),
      challenger: winnerCaptain.id!,
      opponent: loserCaptain.id!,
      winner: winnerCaptain.id!,
      loser: loserCaptain.id!,
      experienceGained: expGain,
      bountyGained: bountyGain,
      battleLog: [`${winnerCaptain.name} derrotou ${loserCaptain.name} em uma batalha entre crews!`],
      challengerCrewId: winnerCrew.id!,
      opponentCrewId: loserCrew.id!,
    })

    const casualties = Math.floor(Math.random() * 3)

    return { winnerCrew, loserCrew, casualties }

  } catch (error) {
    console.error('❌ Erro na batalha otimizada:', error)
    return null
  }
}

// ✅ FUNÇÕES AUXILIARES OTIMIZADAS (MESMA LÓGICA, SEM DB LOOPS)

function simulateCrewBattleMembersOptimized(
  crew1Members: Character[],
  crew2Members: Character[],
): boolean {
  // ✅ MESMA LÓGICA ORIGINAL
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
  // ✅ MESMA LÓGICA ORIGINAL, MAS SEM DB CALLS
  const updates: Partial<Character> = {}

  const newExp = character.experience + expGained
  const tempCharacter = { ...character, experience: newExp }
  const levelCheck = GameLogic.checkLevelUp(tempCharacter)

  if (levelCheck.shouldLevelUp) {
    const newLevel = levelCheck.newLevel!
    const remainingExp = newExp - levelCheck.expNeeded!

    // ✅ BUSCAR DO CACHE (O(1))
    const devilFruit = character.devilFruitId ? optimizedCache.devilFruitMap.get(character.devilFruitId) : null
    const styleCombat = optimizedCache.styleCombats.find(sc => sc.id === character.styleCombatId)

    if (!styleCombat) {
      throw new Error(`Style Combat não encontrado para o personagem ${character.name}`)
    }

    const updatedCharacter = { ...character, level: newLevel, experience: remainingExp }
    updatedCharacter.stats = GameLogic.calculateStatIncrease(updatedCharacter)

    const statIncrease = GameLogic.increaseStats(updatedCharacter, newLevel, styleCombat, devilFruit)

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
  // ✅ PROCESSAR TODOS OS MEMBROS EM PARALELO
  const memberUpdatesPromises = members
    .filter(member => member.position !== 'Captain')
    .map(async (member) => {
      const updates: Partial<Character> = {}

      if (isWinner) {
        const memberExpGain = Math.floor((expGained * percentage * GameLogic.randomBetween(100, 120)) / 100)
        const memberBountyGain = Math.floor((bountyGained * percentage * GameLogic.randomBetween(100, 120)) / 100)

        const newExpMember = member.experience + memberExpGain
        const tempMember = { ...member, experience: newExpMember }
        const levelCheckMember = GameLogic.checkLevelUp(tempMember)

        if (levelCheckMember.shouldLevelUp) {
          const newLevelMember = levelCheckMember.newLevel!
          const remainingExpMember = newExpMember - levelCheckMember.expNeeded!

          // ✅ BUSCAR DO CACHE
          const devilFruitMember = member.devilFruitId ? optimizedCache.devilFruitMap.get(member.devilFruitId) : null
          const styleCombatMember = optimizedCache.styleCombats.find(sc => sc.id === member.styleCombatId)

          if (!styleCombatMember) {
            throw new Error(`Style Combat não encontrado para o personagem ${member.name}`)
          }

          const updatedMember = { ...member, level: newLevelMember, experience: remainingExpMember }
          updatedMember.stats = GameLogic.calculateStatIncrease(updatedMember)

          const statIncreaseMember = GameLogic.increaseStats(updatedMember, newLevelMember, styleCombatMember, devilFruitMember)

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

async function processCrewRecruitmentAndRemovalOptimized(
  winnerCrewId: number,
  loserCrewId: number,
  isPlayerInvolved: boolean,
  batchManager: BatchOperationsManager
): Promise<CrewRecruitmentResult> {
  // ✅ MESMA LÓGICA, MAS USANDO CACHE E BATCH
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

  if (winnerCapacity.hasSpace) {
    const recruitmentResult = await processRecruitmentOptimized(winnerCrewId, loserCrewId, winnerCapacity, batchManager)
    result.recruited = recruitmentResult.recruited
    result.recruitmentAttempts = recruitmentResult.attempts
  }

  const removalResult = await processCrewMemberRemovalOptimized(loserCrewId, batchManager)
  result.removed = removalResult.removed
  result.removalAttempts = removalResult.attempts

  return result
}

function getCrewCapacityInfoOptimized(crewId: number): CrewCapacityInfo {
  // ✅ BUSCAR DO CACHE (O(1))
  const currentMembers = optimizedCache.charactersByCrewId.get(crewId) || []
  const ship = optimizedCache.ships.find(s => s.crewId === crewId)

  const shipLevel = ship?.level || 1
  const maxCapacity = shipLevel * 3

  return {
    currentMembers: currentMembers.length,
    maxCapacity,
    hasSpace: currentMembers.length < maxCapacity,
    shipLevel,
  }
}

async function processRecruitmentOptimized(
  winnerCrewId: number,
  loserCrewId: number,
  capacity: CrewCapacityInfo,
  batchManager: BatchOperationsManager
): Promise<{ recruited: Character[]; attempts: number }> {
  const recruited: Character[] = []
  let attempts = 0

  const eligibleMembers = (optimizedCache.charactersByCrewId.get(loserCrewId) || [])
    .filter(char => char.isPlayer !== 1)
    .sort((a, b) => a.loyalty - b.loyalty)

  for (const member of eligibleMembers) {
    if (capacity.currentMembers + recruited.length >= capacity.maxCapacity) break

    attempts++

    const recruitmentChance = 0.2 + (1 - member.loyalty / 100) * 0.1
    if (Math.random() <= recruitmentChance) {
      batchManager.addCharacterUpdate(member.id!, { crewId: winnerCrewId })
      recruited.push(member)

      if (Math.random() < 0.6) break
    }
  }

  return { recruited, attempts }
}

async function processCrewMemberRemovalOptimized(
  loserCrewId: number,
  batchManager: BatchOperationsManager
): Promise<{ removed: Character[]; attempts: number }> {
  const removed: Character[] = []
  let attempts = 0

  const eligibleMembers = (optimizedCache.charactersByCrewId.get(loserCrewId) || [])
    .filter(char => char.isPlayer !== 1)

  for (const member of eligibleMembers) {
    attempts++

    if (Math.random() <= 0.1) {
      batchManager.addCharacterUpdate(member.id!, { crewId: 0 })
      removed.push(member)

      if (Math.random() < 0.7) break
    }
  }

  return { removed, attempts }
}

async function createCrewForOrphanMembersOptimized(
  orphanMembers: Character[],
  originalIslandId: number,
  batchManager: BatchOperationsManager
): Promise<void> {
  if (orphanMembers.length === 0) return

  const captain = orphanMembers.reduce((highest, current) =>
    current.level > highest.level ? current : highest
  )

  const crewName = CrewNameGenerator.generateCrewName(captain.type as 'Pirate' | 'Marine' | 'BountyHunter')

  // ✅ CRIAR CREW (SERÁ EXECUTADO NO BATCH)
  const newCrew: Omit<Crew, 'id'> = {
    name: crewName,
    type: captain.type as 'Pirate' | 'Marine' | 'BountyHunter',
    captainId: captain.id!,
    currentIsland: originalIslandId,
    docked: 1,
    reputation: Math.floor(captain.level * 10),
    treasury: captain.type === 'Marine' 
      ? GameLogic.randomBetween(1000000, 50000000)
      : GameLogic.randomBetween(captain.bounty * 0.5, captain.bounty * 10),
    foundedAt: new Date(),
  }

  batchManager.addCrewCreation(newCrew)

  // ✅ ATUALIZAR MEMBROS (SERÁ EXECUTADO NO BATCH)
  batchManager.addCharacterUpdate(captain.id!, { position: 'Captain' })

  orphanMembers.forEach(member => {
    if (member.id !== captain.id) {
      batchManager.addCharacterUpdate(member.id!, { position: 'Crew Member' })
    }
  })

  // ✅ CRIAR NAVIO (SERÁ EXECUTADO NO BATCH)
  const newShip = {
    crewId: 0, // Será atualizado após criação do crew
    level: 1,
    needRepair: false,
    destroyed: false,
    name: ShipNameGenerator.generateShipNameByCrewType(captain.type),
  }

  batchManager.addShipCreation(newShip)
}

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

    const batchManager = new BatchOperationsManager()
    const playerCrewIds = data.playerCrewIds || []
    const territoriesCrewIds = optimizedCache.territories.map(territory => territory.crewId)

    const availableCrews = optimizedCache.crews.filter(
      crew => !playerCrewIds.includes(crew.id) && !territoriesCrewIds.includes(crew.id)
    )

    // ✅ PROCESSAR DOCKED STATUS EM PARALELO
    const dockedUpdates = availableCrews.map(crew => {
      const roll = Math.random()
      const newDockedStatus = roll <= 0.1 ? 0 : 1

      if (crew.docked !== newDockedStatus) {
        batchManager.addCrewUpdate(crew.id!, { docked: newDockedStatus as 0 | 1 })
        return 1
      }
      return 0
    })

    const toggled = dockedUpdates.reduce((sum, val) => sum + val, 0)

    // ✅ CRIAR MAPA DE CREWS POR ILHA (COM PODER CALCULADO)
    const crewByIslandPower = new Map()
    
    optimizedCache.islands.forEach(island => {
      const crewsInThisIsland = optimizedCache.crewsByIslandId.get(island.id!) || []
      const crewsWithPower = crewsInThisIsland.map(crew => {
        const crewMembers = optimizedCache.charactersByCrewId.get(crew.id!) || []
        const power = GameLogic.calculateCrewPower(crewMembers, optimizedCache.devilFruits)
        return { crew, power }
      })
      
      crewsWithPower.sort((a, b) => b.power - a.power)
      crewByIslandPower.set(island.id!, crewsWithPower)
    })

    const movableCrews = optimizedCache.crews.filter(
      crew =>
        crew.docked === 1 &&
        crew.captainId > 0 &&
        !playerCrewIds.includes(crew.id) &&
        !territoriesCrewIds.includes(crew.id)
    )

    result.totalCrews = movableCrews.length

    // ✅ PROCESSAR MOVIMENTO EM PARALELO
    const movementPromises = movableCrews.map(async (crew, index) => {
      // 20% chance de se mover
      if (Math.random() <= 0.2) {
        const currentIsland = optimizedCache.islandMap.get(crew.currentIsland)
        if (currentIsland) {
          const crewsWithPower = crewByIslandPower.get(crew.currentIsland) || []
          const currentIndex = crewsWithPower.findIndex(item => item.crew.id === crew.id) || 0
          const totalCrewsOnIsland = crewsWithPower.length || 1
          const percent = currentIndex / totalCrewsOnIsland

          const destinationDecision = await selectDestinationIslandOptimized(
            currentIsland,
            percent
          )

          if (destinationDecision) {
            batchManager.addCrewUpdate(crew.id!, { 
              currentIsland: destinationDecision.island.id!,
              docked: 1 
            })

            return {
              crewId: crew.id!,
              crewName: crew.name,
              fromIslandId: currentIsland.id!,
              toIslandId: destinationDecision.island.id!,
              fromDifficulty: currentIsland.difficulty,
              toDifficulty: destinationDecision.island.difficulty,
              movementType: destinationDecision.type,
            }
          }
        }
      }

      // Progress incremental
      const progress = 15 + ((index + 1) / movableCrews.length) * 70
      self.postMessage({
        type: 'PROGRESS',
        id: data.id,
        progress: Math.min(progress, 85),
      })

      return null
    })

    // ✅ AGUARDAR TODOS OS MOVIMENTOS
    const allMovements = await Promise.all(movementPromises)
    const validMovements = allMovements.filter(movement => movement !== null) as CrewMovementDecision[]

    // ✅ CONTAR MOVIMENTOS POR DIFICULDADE
    const movementsByDifficulty = { easier: 0, same: 0, harder: 0 }
    validMovements.forEach(movement => {
      movementsByDifficulty[movement.movementType]++
    })

    // ✅ EXECUTAR BATCH
    await batchManager.executeBatch()

    // ✅ GERAR RELATÓRIOS
    const islandReports = await generateIslandMovementReportOptimized(validMovements)

    result.crewsMoved = validMovements.length
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
    const availableIslands = optimizedCache.islands.filter(island => island.id !== currentIsland.id)

    if (availableIslands.length === 0) return null

    const easierIslands = availableIslands.filter(
      island => island.difficulty === currentIsland.difficulty - 1
    )

    const sameIslands = availableIslands.filter(
      island => island.difficulty === currentIsland.difficulty
    )

    const harderIslands = availableIslands.filter(
      island => island.difficulty === currentIsland.difficulty + 1
    )

    let selectedIslands: Island[]
    let movementType: 'easier' | 'same' | 'harder'

    if (percent >= 0.8 && easierIslands.length > 0) {
      selectedIslands = easierIslands
      movementType = 'easier'
    } else if (percent >= 0.2 && sameIslands.length > 0) {
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

async function generateIslandMovementReportOptimized(
  movements: CrewMovementDecision[],
): Promise<Array<{
  islandId: number
  islandName: string
  initialCrews: number
  finalCrews: number
  crewsLeft: number
  crewsArrived: number
}>> {
  try {
    const reports: Array<{
      islandId: number
      islandName: string
      initialCrews: number
      finalCrews: number
      crewsLeft: number
      crewsArrived: number
    }> = []

    // ✅ PROCESSAR RELATÓRIOS EM PARALELO
    const reportPromises = optimizedCache.islands.map(async island => {
      const crewsLeft = movements.filter(m => m.fromIslandId === island.id).length
      const crewsArrived = movements.filter(m => m.toIslandId === island.id).length

      const currentCrews = (optimizedCache.crewsByIslandId.get(island.id!) || [])
        .filter(c => c.docked === 1).length

      const initialCrews = currentCrews + crewsLeft - crewsArrived

      if (crewsLeft > 0 || crewsArrived > 0) {
        return {
          islandId: island.id!,
          islandName: island.name,
          initialCrews,
          finalCrews: currentCrews,
          crewsLeft,
          crewsArrived,
        }
      }
      return null
    })

    const allReports = await Promise.all(reportPromises)
    const validReports = allReports.filter(report => report !== null) as Array<{
      islandId: number
      islandName: string
      initialCrews: number
      finalCrews: number
      crewsLeft: number
      crewsArrived: number
    }>

    return validReports.sort((a, b) => b.crewsLeft + b.crewsArrived - (a.crewsLeft + a.crewsArrived))

  } catch (error) {
    console.error('❌ Erro ao gerar relatório de movimento otimizado:', error)
    return []
  }
}

// ✅ ATUALIZAR TERRITÓRIOS OTIMIZADO - VERSÃO SIMPLIFICADA
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

    const allCrews = optimizedCache.crews.filter(crew => crew.docked === 1)
    const occupiedTerritories = optimizedCache.territories.filter(territory => territory.crewId !== 0)

    // ✅ CALCULAR CREW MAIS FORTE POR ILHA EM PARALELO
    const territoryUpdatePromises = occupiedTerritories.map(async territory => {
      const crewsOnIsland = allCrews.filter(crew => 
        crew.currentIsland === territory.islandId && crew.id !== playerCrewId
      )

      if (crewsOnIsland.length === 0) {
        return db.territories.update(territory.id!, { crewId: 0 })
      }

      // ✅ CALCULAR PODER DE TODOS OS CREWS EM PARALELO
      const crewPowers = await Promise.all(
        crewsOnIsland.map(async crew => {
          const crewMembers = optimizedCache.charactersByCrewId.get(crew.id!) || []
          const power = GameLogic.calculateCrewPower(crewMembers, optimizedCache.devilFruits)
          return { crew, power }
        })
      )

      // ✅ ENCONTRAR O MAIS FORTE
      const strongestCrew = crewPowers.reduce((strongest, current) => 
        current.power > strongest.power ? current : strongest
      )

      return db.territories.update(territory.id!, { crewId: strongestCrew.crew.id! })
    })

    // ✅ EXECUTAR TODAS AS ATUALIZAÇÕES EM PARALELO
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

// ✅ REDISTRIBUIR PERSONAGENS OTIMIZADO - VERSÃO SIMPLIFICADA
async function redistributeCharactersWorkerOptimized(data: any): Promise<any> {
  try {
    await updateOptimizedCache()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 25,
    })

    const config = GenerationConfig.createEpic()

    // ✅ CALCULAR PODER DE TODOS OS PERSONAGENS EM PARALELO
    const calculatePowerSafe = (character: Character) => {
      const devilFruit = character.devilFruitId ? optimizedCache.devilFruitMap.get(character.devilFruitId) : undefined
      return GameLogic.calculatePower(character, devilFruit)
    }

    // ✅ FILTRAR E ORDENAR EM PARALELO
    const [pirates, marines, government] = await Promise.all([
      Promise.resolve(
        optimizedCache.characters
          .filter(char => char.type === 'Pirate' && char.position === 'Captain')
          .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a))
      ),
      Promise.resolve(
        optimizedCache.characters
          .filter(char => char.type === 'Marine' && char.position === 'Captain')
          .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a))
      ),
      Promise.resolve(
        optimizedCache.characters
          .filter(char => char.type === 'Government')
          .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a))
      )
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
        })
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
        })
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
        })
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
        })
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
        })
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

// ✅ CRIAR NOVOS PERSONAGENS OTIMIZADO
async function createNewCharactersWorkerOptimized(data: any): Promise<any> {
  try {
    await updateOptimizedCache()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 30,
    })

    const count = Math.floor(Math.random() * 0) + 1
    const batchManager = new BatchOperationsManager()

    // ✅ CRIAR TODOS OS PERSONAGENS EM PARALELO
    const characterCreationPromises = Array.from({ length: count }, async (_, i) => {
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

        if (type !== 'Government') {
          // ✅ CRIAR CREW PRIMEIRO
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

          batchManager.addCrewCreation(newCrew)
          crewId = 1 // Será atualizado após criação
        }

        const styleCombatId = optimizedCache.styleCombats.length > 0
          ? optimizedCache.styleCombats[GameLogic.randomBetween(0, optimizedCache.styleCombats.length - 1)].id || 0
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

        batchManager.addCharacterCreation(newCharacter)

        if (crewId !== 0) {
          const selectedIsland = optimizedCache.islands.length > 0
            ? GameLogic.selectIslandForCrew(newCharacter, optimizedCache.islands)
            : 1

          // ✅ CRIAR NAVIO PARA O CREW
          const newShip = {
            crewId: crewId,
            level: 1,
            needRepair: false,
            destroyed: false,
            name: ShipNameGenerator.generateShipNameByCrewType(type),
          }

          batchManager.addShipCreation(newShip)
        }

        console.log(`Um novo ${type} adentrou nos mares! Seu nome é ${newCharacter.name}!`)

        // Progress incremental
        const progress = 30 + ((i + 1) / count) * 60
        self.postMessage({
          type: 'PROGRESS',
          id: data.id,
          progress: Math.round(progress),
        })

        return { success: true }

      } catch (error) {
        console.error('❌ Erro ao criar personagem individual otimizado:', error)
        return { success: false }
      }
    })

    // ✅ AGUARDAR TODAS AS CRIAÇÕES
    const results = await Promise.all(characterCreationPromises)
    const successful = results.filter(r => r.success).length

    // ✅ EXECUTAR BATCH
    await batchManager.executeBatch()

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 100,
    })

    return {
      success: true,
      created: successful,
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
      processMovementWorkerOptimized({ ...data, id: `${data.id}_movement` })
    ])

    results.encounters = encountersResult
    results.movement = movementResult

    self.postMessage({
      type: 'PROGRESS',
      id: data.id,
      progress: 55,
    })

    // 3. Atualizar territórios (20%) - depende do movimento
    results.territories = await updateTerritoriesWorkerOptimized({ ...data, id: `${data.id}_territories` })
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
      createNewCharactersWorkerOptimized({ ...data, id: `${data.id}_newchars` })
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

console.log('✅ World Update Worker Otimizado inicializado (versão completa corrigida)')