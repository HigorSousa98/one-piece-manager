// src/workers/worldUpdateWorkerUltraOptimized.ts

import { db } from '../utils/database'
import { Crew, Character, DevilFruit, Island, Ship } from '../utils/database'
import { GenerationConfig } from '../utils/generationConfig'
import { GameLogic } from '../utils/gameLogic'
import { ShipNameGenerator } from '../data/shipNameGenerator'
import { CrewNameGenerator } from '../data/crewNames'
import { NameGenerator } from '../data/characterNames'

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

// ✅ CACHE ULTRA-OTIMIZADO
interface UltraOptimizedCache {
  islands: Island[]
  crews: Crew[]
  characters: Character[]
  devilFruits: DevilFruit[]
  territories: any[]
  styleCombats: any[]
  ships: any[]
  crewsUsed: Set<number>

  // ✅ MAPAS PARA ACESSO RÁPIDO O(1)
  islandMap: Map<number, Island>
  crewMap: Map<number, Crew>
  characterMap: Map<number, Character>
  devilFruitMap: Map<number, DevilFruit>
  shipMap: Map<number, any>

  // ✅ ÍNDICES PARA QUERIES FREQUENTES
  charactersByCrewId: Map<number, Character[]>
  crewsByIslandId: Map<number, Crew[]>

  // ✅ NOVOS ÍNDICES OTIMIZADOS
  dockedCrewsByIsland: Map<number, Crew[]>
  captainsByCrewId: Map<number, Character>
  nonPlayerCrews: Crew[]

  // ✅ CACHE DE RESULTADOS COMPUTADOS
  crewPowerCache: Map<number, { power: number; timestamp: number }>
  characterPowerCache: Map<number, { power: number; timestamp: number }>

  // ✅ CONFIGURAÇÕES DE CACHE
  lastCacheTime: number
  cacheTimeout: number

  // ✅ FLAGS DE CACHE SUJO
  isDirty: {
    crews: boolean
    characters: boolean
    powers: boolean
  }
}

// ✅ SISTEMA DE CACHE DE PODER
class PowerCache {
  private static readonly CACHE_TTL = 60000 // 1 minuto

  static getCharacterPower(character: Character, cache: UltraOptimizedCache): number {
    const cached = cache.characterPowerCache.get(character.id!)
    const now = Date.now()

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.power
    }

    const devilFruit = character.devilFruitId
      ? cache.devilFruitMap.get(character.devilFruitId)
      : undefined

    const power = GameLogic.calculatePower(character, devilFruit)

    cache.characterPowerCache.set(character.id!, { power, timestamp: now })
    return power
  }

  static getCrewPower(crewId: number, cache: UltraOptimizedCache): number {
    const cached = cache.crewPowerCache.get(crewId)
    const now = Date.now()

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.power
    }

    const crewMembers = cache.charactersByCrewId.get(crewId) || []
    const power = GameLogic.calculateCrewPower(crewMembers, cache.devilFruits)

    cache.crewPowerCache.set(crewId, { power, timestamp: now })
    return power
  }

  static clearCache(cache: UltraOptimizedCache): void {
    cache.characterPowerCache.clear()
    cache.crewPowerCache.clear()
  }

  static clearExpired(cache: UltraOptimizedCache): void {
    const now = Date.now()

    for (const [id, cached] of cache.characterPowerCache) {
      if (now - cached.timestamp >= this.CACHE_TTL) {
        cache.characterPowerCache.delete(id)
      }
    }

    for (const [id, cached] of cache.crewPowerCache) {
      if (now - cached.timestamp >= this.CACHE_TTL) {
        cache.crewPowerCache.delete(id)
      }
    }
  }
}

// ✅ BATCH MANAGER ULTRA-OTIMIZADO
class UltraOptimizedBatchManager {
  private characterUpdates: Map<number, Partial<Character>> = new Map()
  private crewUpdates: Map<number, Partial<Crew>> = new Map()
  private battleCreations: Array<any> = []
  private criticalOperations: Promise<any>[] = []

  // ✅ CONFIGURAÇÕES DE PERFORMANCE
  private readonly BATCH_SIZE = 100
  private readonly CRITICAL_BATCH_SIZE = 20
  private readonly CHUNK_DELAY = 1 // ms entre chunks

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

  addCriticalOperation(operation: Promise<any>): void {
    this.criticalOperations.push(operation)

    // ✅ AUTO-FLUSH CRÍTICAS SE ATINGIR LIMITE
    if (this.criticalOperations.length >= this.CRITICAL_BATCH_SIZE) {
      this.flushCriticalOperations()
    }
  }

  // ✅ EXECUTAR OPERAÇÕES CRÍTICAS IMEDIATAMENTE
  private async flushCriticalOperations(): Promise<void> {
    if (this.criticalOperations.length > 0) {
      try {
        await Promise.all(this.criticalOperations)
        this.criticalOperations = []
      } catch (error) {
        console.error('❌ Erro ao executar operações críticas:', error)
        this.criticalOperations = []
      }
    }
  }

  // ✅ EXECUTAR BATCH COM CHUNKING
  async executeBatch(): Promise<void> {
    try {
      // ✅ FLUSH CRÍTICAS PRIMEIRO
      await this.flushCriticalOperations()

      const operations: Promise<any>[] = []

      // ✅ CHARACTER UPDATES EM CHUNKS
      if (this.characterUpdates.size > 0) {
        const chunks = this.chunkMap(this.characterUpdates, this.BATCH_SIZE)
        for (const chunk of chunks) {
          operations.push(this.executeCharacterChunk(chunk))
        }
      }

      // ✅ CREW UPDATES EM CHUNKS
      if (this.crewUpdates.size > 0) {
        const chunks = this.chunkMap(this.crewUpdates, this.BATCH_SIZE)
        for (const chunk of chunks) {
          operations.push(this.executeCrewChunk(chunk))
        }
      }

      // ✅ BATTLE CREATIONS EM CHUNKS
      if (this.battleCreations.length > 0) {
        const chunks = this.chunkArray(this.battleCreations, this.BATCH_SIZE)
        for (const chunk of chunks) {
          operations.push(db.battles.bulkAdd(chunk))
        }
      }

      // ✅ EXECUTAR TODOS OS CHUNKS EM PARALELO
      await Promise.all(operations)
    } catch (error) {
      console.error('❌ Erro ao executar ultra batch:', error)
      throw error
    }
  }

  // ✅ EXECUTAR CHUNK DE CHARACTERS
  private async executeCharacterChunk(chunk: Map<number, Partial<Character>>): Promise<void> {
    const promises: Promise<any>[] = []
    for (const [id, updates] of chunk) {
      promises.push(db.characters.update(id, updates))
    }
    await Promise.all(promises)

    // ✅ PEQUENO DELAY PARA NÃO SOBRECARREGAR
    if (promises.length >= this.BATCH_SIZE) {
      await new Promise((resolve) => setTimeout(resolve, this.CHUNK_DELAY))
    }
  }

  // ✅ EXECUTAR CHUNK DE CREWS
  private async executeCrewChunk(chunk: Map<number, Partial<Crew>>): Promise<void> {
    const promises: Promise<any>[] = []
    for (const [id, updates] of chunk) {
      promises.push(db.crews.update(id, updates))
    }
    await Promise.all(promises)

    if (promises.length >= this.BATCH_SIZE) {
      await new Promise((resolve) => setTimeout(resolve, this.CHUNK_DELAY))
    }
  }

  // ✅ DIVIDIR MAP EM CHUNKS
  private chunkMap<K, V>(map: Map<K, V>, size: number): Map<K, V>[] {
    const chunks: Map<K, V>[] = []
    const entries = Array.from(map.entries())

    for (let i = 0; i < entries.length; i += size) {
      const chunk = new Map(entries.slice(i, i + size))
      chunks.push(chunk)
    }

    return chunks
  }

  // ✅ DIVIDIR ARRAY EM CHUNKS
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  clear(): void {
    this.characterUpdates.clear()
    this.crewUpdates.clear()
    this.battleCreations = []
    // ✅ NÃO LIMPAR CRÍTICAS (ELAS SÃO AUTO-FLUSH)
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

// ✅ CLASSE PRINCIPAL ULTRA-OTIMIZADA
export class UltraOptimizedWorldUpdateWorker {
  private cache: UltraOptimizedCache = {
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
    dockedCrewsByIsland: new Map(),
    captainsByCrewId: new Map(),
    nonPlayerCrews: [],
    crewPowerCache: new Map(),
    characterPowerCache: new Map(),
    lastCacheTime: 0,
    cacheTimeout: 30000,
    crewsUsed: new Set<number>(),
    isDirty: {
      crews: false,
      characters: false,
      powers: false,
    },
  }

  // ✅ AJUSTE DE DADOS OTIMIZADO
  // ✅ AJUSTE DE DADOS OTIMIZADO - VERSÃO CORRIGIDA
  private async adjustData(): Promise<void> {
    try {
      console.log('🔧 Iniciando ajuste de dados ultra-otimizado...')

      const results = await Promise.allSettled([
        db.crews.toArray(),
        db.characters.toArray(),
        db.ships.toArray(),
      ])

      // ✅ EXTRAIR DADOS COM TIPAGEM CORRETA
      const crews = results[0].status === 'fulfilled' ? (results[0].value as Crew[]) : []
      const characters = results[1].status === 'fulfilled' ? (results[1].value as Character[]) : []
      const ships = results[2].status === 'fulfilled' ? (results[2].value as Ship[]) : []
      const playerShip = ships.find(ship => ship.crewId == crews.find(crew => crew.id == (characters.find(char => char.isPlayer == 1).crewId)).id)

      // ✅ CRIAR MAPS PARA PERFORMANCE O(1)
      const crewsWithCharacters = new Set(
        characters.map((char) => char.crewId).filter((crewId) => crewId > 0),
      )

      // ✅ ENCONTRAR CREWS SEM CHARACTERS (MAIS EFICIENTE)
      const toDeleteCrews = crews
        .filter((crew) => !crewsWithCharacters.has(crew.id!))
        .map((crew) => crew.id!)

      // ✅ ENCONTRAR CREWS SEM CAPITÃES
      const newCaptains: { character: Character; crewId: number }[] = []

      crews.forEach((crew) => {
        const members = characters.filter((char) => char.crewId === crew.id)

        if (members.length > 0) {
          const currentCaptain = members.find((char) => char.position === 'Captain')

          if (!currentCaptain) {
            const newCaptain = members.reduce((highest, current) =>
              current.level > highest.level ? current : highest,
            )

            newCaptains.push({
              character: newCaptain,
              crewId: crew.id!,
            })
          }
        }
      })

      // ✅ ENCONTRAR SHIPS ÓRFÃOS
      const crewsToDeleteSet = new Set(toDeleteCrews)
      const toDeleteShips = ships
        .filter((ship) => crewsToDeleteSet.has(ship.crewId))
        .map((ship) => ship.id!)

      const updateShips = []

      ships.forEach((ship) => {
        if (!crewsToDeleteSet.has(ship.crewId) && ship.id != playerShip.id) {
          const crew = crews.find((crew) => crew.id == ship.crewId)
          const members = characters.filter((char) => char.crewId === crew.id)
          const captainLevel = characters.find((char) => char.id === crew.captainId) ? characters.find((char) => char.id === crew.captainId).level : 0
          const highestLevel = members.reduce((highest, current) =>
            current.level > highest.level ? current : highest,
          ).level
          let level = captainLevel > 0 ? captainLevel : highestLevel
          let shipLevel = GameLogic.determineShipLevel(level)
          if (shipLevel > ship.level) {
            const updates: Partial<Ship> = {}
            updates.level = shipLevel as 1 | 2 | 3 | 4 | 5
            updateShips.push({ id: ship.id!, updates })
          }
        }
      })

      // ✅ EXECUTAR OPERAÇÕES EM TRANSAÇÃO
      if (
        newCaptains.length > 0 ||
        toDeleteCrews.length > 0 ||
        toDeleteShips.length > 0 ||
        updateShips.length > 0
      ) {
        await db.transaction('rw', [db.characters, db.crews, db.ships], async () => {
          const promises: Promise<any>[] = []

          // Promover novos capitães
          if (newCaptains.length > 0) {
            newCaptains.forEach(({ character, crewId }) => {
              promises.push(db.characters.update(character.id!, { position: 'Captain' }))
              promises.push(db.crews.update(crewId, { captainId: character.id! }))
            })
          }

          // Deletar crews vazios
          if (toDeleteCrews.length > 0) {
            console.log(`🗑️ Deletando ${toDeleteCrews.length} crews vazios`)
            promises.push(db.crews.bulkDelete(toDeleteCrews))
          }

          // Deletar ships órfãos
          if (toDeleteShips.length > 0) {
            console.log(`🚢 Deletando ${toDeleteShips.length} ships órfãos`)
            promises.push(db.ships.bulkDelete(toDeleteShips))
          }

          if (updateShips.length > 0) {
            console.log(`🚢 Editando ${updateShips.length} ships`)
            updateShips.forEach((shipUpdate) => {
              promises.push(db.ships.update(shipUpdate.id, shipUpdate.updates))
            })
          }

          await Promise.all(promises)
        })

        console.log('✅ Ajuste de dados ultra-otimizado concluído')
      }
    } catch (error) {
      console.error('❌ Erro no ajuste de dados ultra-otimizado:', error)
      throw error
    }
  }

  // ✅ ATUALIZAÇÃO DE CACHE ULTRA-OTIMIZADA
  // ✅ ATUALIZAÇÃO DE CACHE ULTRA-OTIMIZADA - VERSÃO CORRIGIDA
  private async updateCache(full?: boolean): Promise<void> {
    const now = Date.now()

    if (now - this.cache.lastCacheTime > this.cache.cacheTimeout) {
      try {
        console.log('🔄 Atualizando cache ultra-otimizado...')

        if (full) await this.adjustData()

        // ✅ USAR Promise.allSettled PARA NÃO FALHAR SE UMA QUERY DER ERRO
        const results = await Promise.allSettled([
          db.islands.toArray(),
          db.crews.toArray(),
          db.characters.toArray(),
          db.devilFruits.toArray(),
          db.territories.toArray(),
          db.styleCombats.toArray(),
          db.ships.toArray(),
        ])

        // ✅ EXTRAIR DADOS COM TIPAGEM CORRETA
        const islands = results[0].status === 'fulfilled' ? (results[0].value as Island[]) : []
        const crews = results[1].status === 'fulfilled' ? (results[1].value as Crew[]) : []
        const characters =
          results[2].status === 'fulfilled' ? (results[2].value as Character[]) : []
        const devilFruits =
          results[3].status === 'fulfilled' ? (results[3].value as DevilFruit[]) : []
        const territories = results[4].status === 'fulfilled' ? (results[4].value as any[]) : []
        const styleCombats = results[5].status === 'fulfilled' ? (results[5].value as any[]) : []
        const ships = results[6].status === 'fulfilled' ? (results[6].value as any[]) : []

        // ✅ ATUALIZAR ARRAYS
        this.cache.islands = islands
        this.cache.crews = crews
        this.cache.characters = characters
        this.cache.devilFruits = devilFruits
        this.cache.territories = territories
        this.cache.styleCombats = styleCombats
        this.cache.ships = ships

        // ✅ CRIAR MAPAS EM PARALELO
        await Promise.all([
          this.createBasicMaps(islands, crews, characters, devilFruits, ships),
          this.createIndexMaps(characters, crews),
          this.createOptimizedIndexes(crews, characters),
        ])

        this.cache.lastCacheTime = now
        console.log('✅ Cache ultra-otimizado atualizado com sucesso')
      } catch (error) {
        console.error('❌ Erro ao atualizar cache ultra-otimizado:', error)
      }
    }
  }

  // ✅ CRIAR MAPAS BÁSICOS EM PARALELO
  private async createBasicMaps(
    islands: Island[],
    crews: Crew[],
    characters: Character[],
    devilFruits: DevilFruit[],
    ships: any[],
  ): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.cache.islandMap = new Map(islands.map((i) => [i.id!, i]))
        this.cache.crewMap = new Map(crews.map((c) => [c.id!, c]))
        this.cache.characterMap = new Map(characters.map((ch) => [ch.id!, ch]))
        this.cache.devilFruitMap = new Map(devilFruits.map((df) => [df.id!, df]))
        this.cache.shipMap = new Map(ships.map((s) => [s.id!, s]))
        resolve()
      }, 0)
    })
  }

  // ✅ CRIAR ÍNDICES EM PARALELO
  private async createIndexMaps(characters: Character[], crews: Crew[]): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.cache.charactersByCrewId = new Map()
        this.cache.crewsByIslandId = new Map()

        // ✅ USAR FOR LOOP (MAIS RÁPIDO QUE forEach)
        for (let i = 0; i < characters.length; i++) {
          const char = characters[i]
          if (char.crewId) {
            const existing = this.cache.charactersByCrewId.get(char.crewId) || []
            existing.push(char)
            this.cache.charactersByCrewId.set(char.crewId, existing)
          }
        }

        for (let i = 0; i < crews.length; i++) {
          const crew = crews[i]
          const existing = this.cache.crewsByIslandId.get(crew.currentIsland) || []
          existing.push(crew)
          this.cache.crewsByIslandId.set(crew.currentIsland, existing)
        }

        resolve()
      }, 0)
    })
  }

  // ✅ CRIAR ÍNDICES OTIMIZADOS
  private async createOptimizedIndexes(crews: Crew[], characters: Character[]): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // ✅ CACHE DE CREWS DOCKED POR ILHA
        this.cache.dockedCrewsByIsland = new Map()
        for (let i = 0; i < crews.length; i++) {
          const crew = crews[i]
          if (crew.docked === 1) {
            const existing = this.cache.dockedCrewsByIsland.get(crew.currentIsland) || []
            existing.push(crew)
            this.cache.dockedCrewsByIsland.set(crew.currentIsland, existing)
          }
        }

        // ✅ CACHE DE CAPITÃES
        this.cache.captainsByCrewId = new Map()
        for (let i = 0; i < characters.length; i++) {
          const char = characters[i]
          if (char.position === 'Captain') {
            this.cache.captainsByCrewId.set(char.crewId!, char)
          }
        }

        // ✅ CACHE DE CREWS NÃO-JOGADOR
        this.cache.nonPlayerCrews = crews.filter((crew) => {
          const captain = this.cache.captainsByCrewId.get(crew.id!)
          return captain && captain.isPlayer !== 1
        })

        resolve()
      }, 0)
    })
  }

  // ✅ RESET CREWS USADOS
  private async updateCrewsUsed(): Promise<void> {
    this.cache.crewsUsed = new Set<number>()
  }

  // ✅ SIMULAÇÃO DE ENCONTROS ULTRA-OTIMIZADA
  async simulateEncounters(data: any): Promise<any> {
    try {
      await this.updateCache(true)
      await this.updateCrewsUsed()

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

      const batchManager = new UltraOptimizedBatchManager()
      const playerCrewIds = new Set(data.playerCrewIds || [])
      const usedCrewIds = new Set<number>()

      // ✅ PRÉ-FILTRAR CREWS ELEGÍVEIS UMA VEZ
      const eligibleCrewsByIsland = new Map<number, Crew[]>()

      for (const island of this.cache.islands) {
        const dockedCrews = this.cache.dockedCrewsByIsland.get(island.id!) || []
        const eligibleCrews = dockedCrews.filter(
          (crew) => !playerCrewIds.has(crew.id!) && !usedCrewIds.has(crew.id!),
        )

        if (eligibleCrews.length >= 2) {
          eligibleCrewsByIsland.set(island.id!, eligibleCrews)
        }
      }

      // ✅ PROCESSAR ILHAS COM CREWS ELEGÍVEIS
      const islandsWithCrews = Array.from(eligibleCrewsByIsland.entries())
      const chunkSize = 3

      for (let i = 0; i < islandsWithCrews.length; i += chunkSize) {
        const islandChunk = islandsWithCrews.slice(i, i + chunkSize)

        // ✅ PROCESSAR CHUNK EM PARALELO
        await Promise.all(
          islandChunk.map(async ([islandId, crews]) => {
            const island = this.cache.islandMap.get(islandId)!

            // ✅ USAR ALGORITMO MAIS EFICIENTE PARA PAIRINGS
            const availableCrews = crews.filter((crew) => !this.cache.crewsUsed.has(crew.id!))

            while (availableCrews.length >= 2) {
              // ✅ SELECIONAR DOIS CREWS E REMOVER DA LISTA
              const crew1Index = Math.floor(Math.random() * availableCrews.length)
              const crew1 = availableCrews.splice(crew1Index, 1)[0]
              const prioritizedCrews2 = this.filterByLevel(crew1, availableCrews)

              const crew2Index = Math.floor(Math.random() * availableCrews.length)
              const crew2IndexPrioritized = Math.floor(Math.random() * prioritizedCrews2.length)
              const crew2 = prioritizedCrews2.splice(crew2IndexPrioritized, 1)[0] || availableCrews.splice(crew2Index, 1)[0]

              // ✅ USAR CACHE PARA MEMBROS
              const [member1, member2] = [
                this.cache.charactersByCrewId.get(crew1.id!) || [],
                this.cache.charactersByCrewId.get(crew2.id!) || [],
              ]

              if (member1.length === 0 || member2.length === 0) continue

              results.totalEncounters++

              // ✅ DETERMINAR TIPO DE ENCONTRO
              const encounterType = GameLogic.determineEncounterTypeOnly(crew1.type, crew2.type)

              if (encounterType === 'hostile' || encounterType === 'neutral') {
                // ✅ SIMULAR BATALHA
                const battleResult = await this.simulateCrewBattle(crew1, crew2, batchManager)
                if (battleResult) {
                  results.totalBattles++
                }
              }

              // ✅ MARCAR COMO USADOS LOCALMENTE
              this.cache.crewsUsed.add(crew1.id!)
              this.cache.crewsUsed.add(crew2.id!)
            }
          }),
        )

        // ✅ EXECUTAR BATCH A CADA CHUNK
        await batchManager.executeBatch()
        batchManager.clear()

        // ✅ PROGRESS INCREMENTAL
        const progress = 10 + ((i + chunkSize) / islandsWithCrews.length) * 80
        self.postMessage({
          type: 'PROGRESS',
          id: data.id,
          progress: Math.min(progress, 90),
        })

        // ✅ YIELD CONTROL MAIS FREQUENTE
        if (i % chunkSize === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1))
        }
      }

      self.postMessage({
        type: 'PROGRESS',
        id: data.id,
        progress: 100,
      })

      console.log('✅ Encounters ultra-otimizados:', results)
      return results
    } catch (error) {
      console.error('❌ Erro na simulação de encontros ultra-otimizada:', error)
      return {
        totalEncounters: 0,
        totalBattles: 0,
        totalMovements: 0,
        islandReports: [],
      }
    }
  }

  // ✅ SIMULAÇÃO DE BATALHA ULTRA-OTIMIZADA
  private async simulateCrewBattle(
    crew1: Crew,
    crew2: Crew,
    batchManager: UltraOptimizedBatchManager,
  ): Promise<{ winnerCrew: Crew; loserCrew: Crew; casualties: number } | null> {
    try {
      // ✅ BUSCAR DADOS DO CACHE (O(1))
      const crew1Members = this.cache.charactersByCrewId.get(crew1.id!) || []
      const crew2Members = this.cache.charactersByCrewId.get(crew2.id!) || []

      if (crew1Members.length === 0 || crew2Members.length === 0) return null

      const captain1 = crew1Members.find((char) => char.position == 'Captain')
      const captain2 = crew2Members.find((char) => char.position == 'Captain')

      if (!captain1 || !captain2) return null

      // ✅ DETERMINAR VENCEDOR COM CACHE DE PODER
      const crew1Wins = this.simulateCrewBattleMembersOptimized(
        crew1Members,
        crew2Members,
        crew1.id!,
        crew2.id!,
      )
      const winnerCrew = crew1Wins ? crew1 : crew2
      const loserCrew = crew1Wins ? crew2 : crew1
      const winnerCaptain = crew1Wins ? captain1 : captain2
      const loserCaptain = crew1Wins ? captain2 : captain1
      const winnerMembers = crew1Wins ? crew1Members : crew2Members

      // ✅ CALCULAR RECOMPENSAS
      const expGain = GameLogic.calculateExperienceGain(winnerCaptain, loserCaptain)
      const bountyGain = GameLogic.calculateBountyGain(winnerCaptain, loserCaptain)

      // ✅ PROCESSAR UPDATES EM BATCH
      const captainUpdates = await this.processCaptainUpdates(
        winnerCaptain,
        expGain,
        bountyGain,
        true,
      )
      const memberUpdates = await this.processCrewMemberUpdates(
        winnerMembers,
        expGain,
        bountyGain,
        true,
        GenerationConfig.createEpic().regularCrewSharedGain,
      )

      batchManager.addCharacterUpdate(winnerCaptain.id!, captainUpdates)
      memberUpdates.forEach((update) => {
        batchManager.addCharacterUpdate(update.id, update.updates)
      })

      // ✅ PROCESSAR RECRUTAMENTO E REMOÇÃO
      const recruitmentResult = await this.processCrewRecruitmentAndRemoval(
        winnerCrew.id!,
        loserCrew.id!,
        false,
        batchManager,
      )

      // ✅ VERIFICAR CREW VAZIO
      const remainingLoserMembers = this.cache.charactersByCrewId.get(loserCrew.id!) || []
      const actualRemainingMembers = remainingLoserMembers.filter(
        (char) =>
          !recruitmentResult.recruited.find((rec) => rec.id === char.id) &&
          !recruitmentResult.removed.find((rem) => rem.id === char.id),
      )

      // ✅ CRIAR CREW PARA ÓRFÃOS
      if (recruitmentResult.removed.length >= 1) {
        batchManager.addCriticalOperation(
          this.createCrewForOrphanMembers(recruitmentResult.removed, loserCrew.currentIsland),
        )
      }

      // ✅ ATUALIZAR REPUTAÇÃO
      const newWinnerReputation = winnerCrew.reputation + Math.floor(loserCrew.reputation * 0.1)
      const treasuryFoundPercentage = GameLogic.randomBetween(5, 15) / 100
      const amount = isNaN(Math.floor(loserCrew.treasury * treasuryFoundPercentage))
        ? 0
        : Math.floor(loserCrew.treasury * treasuryFoundPercentage)
      const newWinnerTreasury = winnerCrew.treasury + amount
      const newLoserTreasury = loserCrew.treasury - amount
      const newLoserReputation = Math.max(
        0,
        loserCrew.reputation - Math.floor(loserCrew.reputation * 0.05),
      )

      batchManager.addCrewUpdate(winnerCrew.id!, {
        reputation: newWinnerReputation,
        treasury: newWinnerTreasury,
      })
      batchManager.addCrewUpdate(loserCrew.id!, {
        reputation: newLoserReputation,
        treasury: newLoserTreasury,
      })

      // ✅ REGISTRAR BATALHA
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
      console.error('❌ Erro na batalha ultra-otimizada:', error)
      return null
    }
  }

  // ✅ BATALHA DE MEMBROS COM CACHE DE PODER
  private simulateCrewBattleMembersOptimized(
    crew1Members: Character[],
    crew2Members: Character[],
    crew1Id: number,
    crew2Id: number,
  ): boolean {
    // ✅ USAR CACHE EM VEZ DE CALCULAR TODA VEZ
    const crew1Power = PowerCache.getCrewPower(crew1Id, this.cache)
    const crew2Power = PowerCache.getCrewPower(crew2Id, this.cache)

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

  // ✅ PROCESSAR UPDATES DE CAPITÃO
  private async processCaptainUpdates(
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
        ? this.cache.devilFruitMap.get(character.devilFruitId)
        : null
      const styleCombat = this.cache.styleCombats.find((sc) => sc.id === character.styleCombatId)

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

  // ✅ PROCESSAR UPDATES DE MEMBROS
  private async processCrewMemberUpdates(
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
            GameLogic.adjustBounty(
              (bountyGained * percentage * GameLogic.randomBetween(100, 120)) / 100,
            ),
          )

          const newExpMember = member.experience + memberExpGain
          const tempMember = { ...member, experience: newExpMember }
          const levelCheckMember = GameLogic.checkLevelUp(tempMember)

          if (levelCheckMember.shouldLevelUp) {
            const newLevelMember = levelCheckMember.newLevel!
            const remainingExpMember = newExpMember - levelCheckMember.expNeeded!

            const devilFruitMember = member.devilFruitId
              ? this.cache.devilFruitMap.get(member.devilFruitId)
              : null
            const styleCombatMember = this.cache.styleCombats.find(
              (sc) => sc.id === member.styleCombatId,
            )

            if (!styleCombatMember) {
              throw new Error(`Style Combat não encontrado para o personagem ${member.name}`)
            }

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

  // ✅ RECRUTAMENTO E REMOÇÃO
  private async processCrewRecruitmentAndRemoval(
    winnerCrewId: number,
    loserCrewId: number,
    isPlayerInvolved: boolean,
    batchManager: UltraOptimizedBatchManager,
  ): Promise<CrewRecruitmentResult> {
    const result: CrewRecruitmentResult = {
      recruited: [],
      removed: [],
      recruitmentAttempts: 0,
      removalAttempts: 0,
    }

    if (isPlayerInvolved) return result

    const winnerCrew = this.cache.crewMap.get(winnerCrewId)
    const loserCrew = this.cache.crewMap.get(loserCrewId)

    if (!winnerCrew || !loserCrew) return result

    const winnerCapacity = this.getCrewCapacityInfo(winnerCrewId)

    // ✅ PROCESSAR RECRUTAMENTO
    if (
      winnerCapacity.hasSpace &&
      GameLogic.validateTypeCompatibility(winnerCrew.type, loserCrew.type)
    ) {
      const recruitmentResult = await this.processRecruitmentImmediate(
        winnerCrewId,
        loserCrewId,
        winnerCapacity,
      )
      result.recruited = recruitmentResult.recruited
      result.recruitmentAttempts = recruitmentResult.attempts
    }

    // ✅ PROCESSAR REMOÇÃO
    const removalResult = await this.processCrewMemberRemovalImmediate(
      loserCrewId,
      result.recruited,
    )
    result.removed = removalResult.removed
    result.removalAttempts = removalResult.attempts

    return result
  }

  // ✅ OBTER CAPACIDADE DO CREW
  private getCrewCapacityInfo(crewId: number): CrewCapacityInfo {
    const currentMembers = this.cache.charactersByCrewId.get(crewId) || []
    const ship = this.cache.ships.find((s) => s.crewId === crewId)

    const shipLevel = ship?.level || 1
    const maxCapacity = shipLevel * 3

    return {
      currentMembers: currentMembers.length,
      maxCapacity,
      hasSpace: currentMembers.length < maxCapacity,
      shipLevel,
    }
  }

  // ✅ RECRUTAMENTO IMEDIATO
  private async processRecruitmentImmediate(
    winnerCrewId: number,
    loserCrewId: number,
    capacity: CrewCapacityInfo,
  ): Promise<{ recruited: Character[]; attempts: number }> {
    const recruited: Character[] = []
    let attempts = 0

    const winnerCrew = this.cache.crewMap.get(winnerCrewId)

    const eligibleMembers = (this.cache.charactersByCrewId.get(loserCrewId) || [])
      .filter((char) => char.isPlayer !== 1)
      .sort((a, b) => a.loyalty - b.loyalty)

    for (const member of eligibleMembers) {
      if (capacity.currentMembers + recruited.length >= capacity.maxCapacity) break

      attempts++

      const recruitmentChance = 0.2 + (1 - member.loyalty / 100) * 0.1
      if (Math.random() <= recruitmentChance) {
        await db.characters.update(member.id!, {
          crewId: winnerCrewId,
          type: winnerCrew!.type,
          position: 'Crew Member',
        })
        recruited.push(member)

        if (Math.random() < 0.6) break
      }
    }

    return { recruited, attempts }
  }

  // ✅ REMOÇÃO IMEDIATA
  private async processCrewMemberRemovalImmediate(
    loserCrewId: number,
    recruited: Character[],
  ): Promise<{ removed: Character[]; attempts: number }> {
    const removed: Character[] = []
    let attempts = 0

    const eligibleMembers = (this.cache.charactersByCrewId.get(loserCrewId) || []).filter(
      (char) => char.isPlayer !== 1 && !recruited.find((rec) => rec.id == char.id),
    )

    if (eligibleMembers.length > 1) {
      for (const member of eligibleMembers) {
        if (removed.length + 1 < eligibleMembers.length) {
          attempts++

          if (Math.random() <= 0.1) {
            //await db.characters.update(member.id!, { crewId: 0 })
            removed.push(member)

            if (Math.random() < 0.7) break
          }
        }
      }
    }

    return { removed, attempts }
  }

  // ✅ CRIAR CREW PARA ÓRFÃOS
  private async createCrewForOrphanMembers(
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

    await db.characters.update(captain.id!, { crewId: newCrewId, position: 'Captain' })

    for (const member of orphanMembers) {
      if (member.id !== captain.id) {
        await db.characters.update(member.id!, { crewId: newCrewId, position: 'Crew Member' })
      }
    }

    await db.ships.add({
      crewId: newCrewId,
      level: GameLogic.determineShipLevel(captain.level) as 1 | 2 | 3 | 4 | 5,
      needRepair: false,
      destroyed: false,
      name: ShipNameGenerator.generateShipNameByCrewType(captain.type),
    })

    const newCrew = await db.crews.get(newCrewId)
    return newCrew || null
  }

  // ✅ PROCESSAR MOVIMENTO ULTRA-OTIMIZADO
  async processMovement(data: any): Promise<any> {
    try {
      await this.updateCache()

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

      const playerCrewIds = new Set(data.playerCrewIds || [])
      const territoriesCrewIds = new Set(
        this.cache.territories.map((territory) => territory.crewId),
      )

      const availableCrews = this.cache.crews.filter(
        (crew) =>
          !playerCrewIds.has(crew.id!) &&
          !territoriesCrewIds.has(crew.id!) &&
          !this.cache.crewsUsed.has(crew.id!),
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
      await this.updateCache()

      const crewMovementFactor = GenerationConfig.createEpic().crewMovementFactor
      const crewByIslandPower = new Map()

      // ✅ CRIAR MAPA DE CREWS POR ILHA COM PODER CALCULADO
      this.cache.islands.forEach((island) => {
        const crewsInThisIsland = this.cache.crewsByIslandId.get(island.id!) || []
        const crewsWithPower = crewsInThisIsland.map((crew) => {
          const power = PowerCache.getCrewPower(crew.id!, this.cache)
          return { crew, power }
        })

        crewsWithPower.sort((a, b) => b.power - a.power)
        crewByIslandPower.set(island.id!, crewsWithPower)
      })

      const movableCrews = this.cache.crews.filter(
        (crew) =>
          crew.docked === 1 &&
          crew.captainId > 0 &&
          !playerCrewIds.has(crew.id!) &&
          !territoriesCrewIds.has(crew.id!),
      )

      result.totalCrews = movableCrews.length

      // ✅ PROCESSAR MOVIMENTO EM CHUNKS
      const chunkSize = 5
      const movementDecisions: CrewMovementDecision[] = []
      const movementsByDifficulty = { easier: 0, same: 0, harder: 0 }

      for (let i = 0; i < movableCrews.length; i += chunkSize) {
        const crewChunk = movableCrews.slice(i, i + chunkSize)

        for (const crew of crewChunk) {
          if (Math.random() <= crewMovementFactor && !this.cache.crewsUsed.has(crew.id)) {
            const currentIsland = this.cache.islandMap.get(crew.currentIsland)
            if (currentIsland) {
              const crewsWithPower = crewByIslandPower.get(crew.currentIsland) || []
              const currentIndex = crewsWithPower.findIndex((item) => item.crew.id === crew.id) || 0
              const totalCrewsOnIsland = crewsWithPower.length || 1
              const percent = currentIndex / totalCrewsOnIsland

              const destinationDecision = await this.selectDestinationIsland(currentIsland, percent)

              if (destinationDecision) {
                this.cache.crewsUsed.add(crew.id)
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
      const islandReports = await this.generateIslandMovementReport(movementDecisions)

      result.crewsMoved = movementDecisions.length
      result.dockedToggled = toggled
      result.islandReports = islandReports
      result.movementsByDifficulty = movementsByDifficulty

      self.postMessage({
        type: 'PROGRESS',
        id: data.id,
        progress: 100,
      })

      console.log('✅ Movimento ultra-otimizado:', result)
      return result
    } catch (error) {
      console.error('❌ Erro no processamento de movimento ultra-otimizado:', error)
      return {
        totalCrews: 0,
        dockedToggled: 0,
        crewsMoved: 0,
        movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
        islandReports: [],
      }
    }
  }

  // ✅ SELECIONAR ILHA DE DESTINO
  private async selectDestinationIsland(
  currentIsland: Island,
  percent: number,
): Promise<{ island: Island; type: 'easier' | 'same' | 'harder' } | null> {
  try {
    const availableIslands = this.cache.islands.filter((island) => island.id !== currentIsland.id)

    if (availableIslands.length === 0) return null

    // ✅ SEPARAR ILHAS POR DIFICULDADE
    const easierIslands = availableIslands.filter(
      (island) => island.difficulty === currentIsland.difficulty - 1,
    )
    const sameIslands = availableIslands.filter(
      (island) => island.difficulty === currentIsland.difficulty,
    )
    const harderIslands = availableIslands.filter(
      (island) => island.difficulty === currentIsland.difficulty + 1,
    )

    // ✅ CALCULAR POPULAÇÃO ATUAL DAS ILHAS PARA BALANCEAMENTO
    const getIslandPopulation = (islands: Island[]) => {
      return islands.map(island => ({
        island,
        population: (this.cache.crewsByIslandId.get(island.id!) || []).length
      }))
    }

    const easierPopulation = getIslandPopulation(easierIslands)
    const samePopulation = getIslandPopulation(sameIslands)
    const harderPopulation = getIslandPopulation(harderIslands)

    // ✅ CALCULAR PESO DE BALANCEAMENTO (MENOS POPULAÇÃO = MAIOR PESO)
    const calculateBalanceWeight = (population: number, maxPop: number) => {
      if (maxPop === 0) return 1
      return Math.max(0.1, 1 - (population / (maxPop + 1)))
    }

    const allPopulations = [
      ...easierPopulation.map(p => p.population),
      ...samePopulation.map(p => p.population),
      ...harderPopulation.map(p => p.population)
    ]
    const maxPopulation = Math.max(...allPopulations, 1)

    // ✅ NOVA LÓGICA DE SELEÇÃO EQUILIBRADA
    let selectedIslands: { island: Island; weight: number }[] = []
    let movementType: 'easier' | 'same' | 'harder'

    // ✅ CREWS FRACOS (percent >= 0.7) - Preferem mais fácil, mas com balanceamento
    if (percent >= 0.7) {
      const easierWeighted = easierPopulation.map(p => ({
        island: p.island,
        weight: calculateBalanceWeight(p.population, maxPopulation) * 0.5 // 50% de peso para easier
      }))
      
      const sameWeighted = samePopulation.map(p => ({
        island: p.island,
        weight: calculateBalanceWeight(p.population, maxPopulation) * 0.35 // 35% de peso para same
      }))
      
      const harderWeighted = harderPopulation.map(p => ({
        island: p.island,
        weight: calculateBalanceWeight(p.population, maxPopulation) * 0.15 // 15% de peso para harder
      }))

      const allOptions = [...easierWeighted, ...sameWeighted, ...harderWeighted]
      
      if (allOptions.length > 0) {
        const selected = this.weightedRandomSelection(allOptions)
        if (selected) {
          if (easierIslands.some(i => i.id === selected.id)) {
            movementType = 'easier'
          } else if (sameIslands.some(i => i.id === selected.id)) {
            movementType = 'same'
          } else {
            movementType = 'harder'
          }
          return { island: selected, type: movementType }
        }
      }
    }
    
    // ✅ CREWS MÉDIOS (percent 0.3 - 0.69) - Distribuição equilibrada
    else if (percent >= 0.3) {
      const easierWeighted = easierPopulation.map(p => ({
        island: p.island,
        weight: calculateBalanceWeight(p.population, maxPopulation) * 0.25 // 25% easier
      }))
      
      const sameWeighted = samePopulation.map(p => ({
        island: p.island,
        weight: calculateBalanceWeight(p.population, maxPopulation) * 0.5 // 50% same
      }))
      
      const harderWeighted = harderPopulation.map(p => ({
        island: p.island,
        weight: calculateBalanceWeight(p.population, maxPopulation) * 0.25 // 25% harder
      }))

      const allOptions = [...easierWeighted, ...sameWeighted, ...harderWeighted]
      
      if (allOptions.length > 0) {
        const selected = this.weightedRandomSelection(allOptions)
        if (selected) {
          if (easierIslands.some(i => i.id === selected.id)) {
            movementType = 'easier'
          } else if (sameIslands.some(i => i.id === selected.id)) {
            movementType = 'same'
          } else {
            movementType = 'harder'
          }
          return { island: selected, type: movementType }
        }
      }
    }
    
    // ✅ CREWS FORTES (percent < 0.3) - Preferem mais difícil, mas com balanceamento
    else {
      const easierWeighted = easierPopulation.map(p => ({
        island: p.island,
        weight: calculateBalanceWeight(p.population, maxPopulation) * 0.15 // 15% easier
      }))
      
      const sameWeighted = samePopulation.map(p => ({
        island: p.island,
        weight: calculateBalanceWeight(p.population, maxPopulation) * 0.35 // 35% same
      }))
      
      const harderWeighted = harderPopulation.map(p => ({
        island: p.island,
        weight: calculateBalanceWeight(p.population, maxPopulation) * 0.5 // 50% harder
      }))

      const allOptions = [...easierWeighted, ...sameWeighted, ...harderWeighted]
      
      if (allOptions.length > 0) {
        const selected = this.weightedRandomSelection(allOptions)
        if (selected) {
          if (easierIslands.some(i => i.id === selected.id)) {
            movementType = 'easier'
          } else if (sameIslands.some(i => i.id === selected.id)) {
            movementType = 'same'
          } else {
            movementType = 'harder'
          }
          return { island: selected, type: movementType }
        }
      }
    }

    // ✅ FALLBACK - Se não conseguir selecionar com peso, usar distribuição simples
    const allAvailable = [...easierIslands, ...sameIslands, ...harderIslands]
    if (allAvailable.length === 0) return null

    // ✅ Selecionar ilha com menor população como fallback
    const islandPopulations = allAvailable.map(island => ({
      island,
      population: (this.cache.crewsByIslandId.get(island.id!) || []).length
    }))

    // ✅ Ordenar por população (menor primeiro) e pegar uma das 3 menos populosas
    islandPopulations.sort((a, b) => a.population - b.population)
    const leastPopulated = islandPopulations.slice(0, Math.min(3, islandPopulations.length))
    const selectedFallback = leastPopulated[Math.floor(Math.random() * leastPopulated.length)]

    // ✅ Determinar tipo de movimento para fallback
    if (easierIslands.some(i => i.id === selectedFallback.island.id)) {
      movementType = 'easier'
    } else if (sameIslands.some(i => i.id === selectedFallback.island.id)) {
      movementType = 'same'
    } else {
      movementType = 'harder'
    }

    return {
      island: selectedFallback.island,
      type: movementType,
    }

  } catch (error) {
    console.error('❌ Erro ao selecionar ilha de destino equilibrada:', error)
    return null
  }
}

// ✅ FUNÇÃO AUXILIAR PARA SELEÇÃO PONDERADA
private weightedRandomSelection(options: { island: Island; weight: number }[]): Island | null {
  if (options.length === 0) return null

  // ✅ Calcular peso total
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0)
  
  if (totalWeight === 0) {
    // ✅ Se todos os pesos são 0, selecionar aleatoriamente
    return options[Math.floor(Math.random() * options.length)].island
  }

  // ✅ Gerar número aleatório
  let random = Math.random() * totalWeight
  
  // ✅ Selecionar baseado no peso
  for (const option of options) {
    random -= option.weight
    if (random <= 0) {
      return option.island
    }
  }

  // ✅ Fallback - retornar o último
  return options[options.length - 1].island
}

  // ✅ GERAR RELATÓRIO DE MOVIMENTO
  private async generateIslandMovementReport(movements: CrewMovementDecision[]): Promise<
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

      this.cache.islands.forEach((island) => {
        const crewsLeft = movements.filter((m) => m.fromIslandId === island.id).length
        const crewsArrived = movements.filter((m) => m.toIslandId === island.id).length

        const currentCrews = (this.cache.crewsByIslandId.get(island.id!) || []).filter(
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
      console.error('❌ Erro ao gerar relatório de movimento ultra-otimizado:', error)
      return []
    }
  }

  // ✅ ATUALIZAR TERRITÓRIOS ULTRA-OTIMIZADO
  async updateTerritories(data: any): Promise<any> {
    try {
      await this.updateCache()

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

      const allCrews = this.cache.crews.filter((crew) => crew.docked === 1)
      const occupiedTerritories = this.cache.territories.filter(
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
          const power = PowerCache.getCrewPower(crew.id!, this.cache)
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
      console.error('❌ Erro na atualização de territórios ultra-otimizada:', error)
      return { success: false }
    }
  }

  // ✅ REDISTRIBUIR PERSONAGENS ULTRA-OTIMIZADO
  async redistributeCharacters(data: any): Promise<any> {
    try {
      await this.updateCache()

      self.postMessage({
        type: 'PROGRESS',
        id: data.id,
        progress: 25,
      })

      const config = GenerationConfig.createEpic()

      const calculatePowerSafe = (character: Character) => {
        return PowerCache.getCharacterPower(character, this.cache)
      }

      // ✅ FILTRAR E ORDENAR EM PARALELO
      const [pirates, marines, government] = await Promise.all([
        Promise.resolve(
          this.cache.characters
            .filter((char) => char.type === 'Pirate' && char.position === 'Captain')
            .sort((a, b) => GameLogic.calculateCrewPower(this.cache.characters.filter(char => char.crewId == b.crewId), this.cache.devilFruits) - GameLogic.calculateCrewPower(this.cache.characters.filter(char => char.crewId == a.crewId), this.cache.devilFruits)),
        ),
        Promise.resolve(
          this.cache.characters
            .filter((char) => char.type === 'Marine' && char.position === 'Captain')
            .sort((a, b) => GameLogic.calculateCrewPower(this.cache.characters.filter(char => char.crewId == b.crewId), this.cache.devilFruits) - GameLogic.calculateCrewPower(this.cache.characters.filter(char => char.crewId == a.crewId), this.cache.devilFruits)),
        ),
        Promise.resolve(
          this.cache.characters
            .filter((char) => char.type === 'Government' && char.position === 'Captain')
            .sort((a, b) => GameLogic.calculateCrewPower(this.cache.characters.filter(char => char.crewId == b.crewId), this.cache.devilFruits) - GameLogic.calculateCrewPower(this.cache.characters.filter(char => char.crewId == a.crewId), this.cache.devilFruits)),
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
        const crew = this.cache.crewMap.get(character.crewId!)
        if (!crew) {
          return this.cache.islands[0]?.id || 1
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
      const sortedIslands = this.cache.islands.sort((a, b) => a.difficulty - b.difficulty)

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
      console.error('❌ Erro na redistribuição de personagens ultra-otimizada:', error)
      return { success: false }
    }
  }

  filterByLevel(crew1: Crew, opponents: Crew[]): Crew[] {
    const crew1Captain = this.cache.characterMap.get(crew1.captainId)
    const levelRange = this.calculateLevelRange(crew1Captain.level)
    const opponentsCaptains = opponents.map(crew => {
      return this.cache.characterMap.get(crew.captainId)
    })
    const fittableCaptains = opponentsCaptains.filter(
      (opponent) => opponent.level >= levelRange.min && opponent.level <= levelRange.max,
    )
    return opponents.filter(crew => fittableCaptains.find(char => crew.captainId == char.id)).filter(crew => crew.id != crew1.id)
  }

  calculateLevelRange(level: number): { min: number; max: number } {
    const variance = Math.max(5, Math.floor(level * 0.2)) // 20% de variação, mínimo 3

    return {
      min: Math.max(1, level - variance),
      max: level + variance,
    }
  }

  // ✅ CRIAR NOVOS PERSONAGENS ULTRA-OTIMIZADO
  async createNewCharacters(data: any): Promise<any> {
    try {
      self.postMessage({
        type: 'PROGRESS',
        id: data.id,
        progress: 30,
      })

      const count = Math.floor(Math.random() * GenerationConfig.createEpic().maxNewCharacters) + 1
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

          // ✅ CRIAR CREW PRIMEIRO E OBTER ID REAL
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
            this.cache.styleCombats.length > 0
              ? this.cache.styleCombats[
                  GameLogic.randomBetween(0, this.cache.styleCombats.length - 1)
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
              this.cache.styleCombats.find((st) => st.id === styleCombatId)?.name || 'Balanced',
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

          // ✅ ATUALIZAR CREW COM ID DO CAPITÃO E ILHA
          if (crewId !== 0) {
            const selectedIsland =
              this.cache.islands.length > 0
                ? GameLogic.selectIslandForCrew(newCharacter, this.cache.islands)
                : 1

            await db.crews.update(crewId, {
              captainId: characterId,
              currentIsland: selectedIsland,
              treasury:
                type === 'Marine'
                  ? GameLogic.randomBetween(1000000, 50000000)
                  : GameLogic.randomBetween(100000, 1000000),
              type: type as 'Pirate' | 'Marine' | 'BountyHunter' | 'Government',
            })

            // ✅ CRIAR NAVIO PARA O CREW
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
      console.error('❌ Erro na criação de novos personagens ultra-otimizada:', error)
      return {
        success: false,
        created: 0,
        attempted: 0,
      }
    }
  }

  // ✅ EXECUTAR UPDATE COMPLETO ULTRA-OTIMIZADO
  async executeFullWorldUpdate(data: any): Promise<any> {
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

      // ✅ FASE 1: OPERAÇÕES INDEPENDENTES EM PARALELO TOTAL
      const [encountersResult, movementResult, newCharactersResult] = await Promise.all([
        this.simulateEncounters({ ...data, id: `${data.id}_encounters` }),
        this.processMovement({ ...data, id: `${data.id}_movement` }),
        this.createNewCharacters({ ...data, id: `${data.id}_newchars` }),
      ])

      results.encounters = encountersResult
      results.movement = movementResult
      results.newCharacters = newCharactersResult

      self.postMessage({
        type: 'PROGRESS',
        id: data.id,
        progress: 60,
      })

      // ✅ FASE 2: OPERAÇÕES DEPENDENTES EM PARALELO
      const [territoriesResult, charactersResult] = await Promise.all([
        this.updateTerritories({ ...data, id: `${data.id}_territories` }),
        this.redistributeCharacters({ ...data, id: `${data.id}_characters` }),
      ])

      results.territories = territoriesResult
      results.characters = charactersResult

      // ✅ LIMPAR CACHE DE PODER EXPIRADO
      PowerCache.clearExpired(this.cache)

      results.totalTime = Date.now() - startTime

      self.postMessage({
        type: 'PROGRESS',
        id: data.id,
        progress: 100,
      })

      console.log(`✅ Update ultra-otimizado em ${results.totalTime}ms`)
      return results
    } catch (error) {
      console.error('❌ Erro na atualização ultra-otimizada:', error)
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

  // ✅ LIMPAR CACHE
  clearCache(): void {
    this.cache.lastCacheTime = 0
    PowerCache.clearCache(this.cache)
  }

  // ✅ FORÇAR ATUALIZAÇÃO DE CACHE
  async forceUpdateCache(): Promise<void> {
    this.cache.lastCacheTime = 0
    await this.updateCache(true)
  }
}

// ✅ INSTÂNCIA GLOBAL DO WORKER
const ultraOptimizedWorker = new UltraOptimizedWorldUpdateWorker()

// ✅ HANDLER PRINCIPAL DO WORKER ULTRA-OTIMIZADO
self.onmessage = async function (e: MessageEvent<WorkerMessage>) {
  const { type, data, id } = e.data

  try {
    let result: any

    switch (type) {
      case 'SIMULATE_ENCOUNTERS':
        result = await ultraOptimizedWorker.simulateEncounters({ ...data, id })
        break

      case 'PROCESS_MOVEMENT':
        result = await ultraOptimizedWorker.processMovement({ ...data, id })
        break

      case 'UPDATE_TERRITORIES':
        result = await ultraOptimizedWorker.updateTerritories({ ...data, id })
        break

      case 'REDISTRIBUTE_CHARACTERS':
        result = await ultraOptimizedWorker.redistributeCharacters({ ...data, id })
        break

      case 'CREATE_NEW_CHARACTERS':
        result = await ultraOptimizedWorker.createNewCharacters({ ...data, id })
        break

      case 'CLEAR_CACHE':
        ultraOptimizedWorker.clearCache()
        result = { success: true }
        break

      case 'FULL_WORLD_UPDATE':
        result = await ultraOptimizedWorker.executeFullWorldUpdate({ ...data, id })
        break

      case 'UPDATE_CACHE':
        await ultraOptimizedWorker.forceUpdateCache()
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
  console.error('❌ Erro global do worker ultra-otimizado:', error)
}

self.onunhandledrejection = function (event) {
  console.error('❌ Promise rejeitada no worker ultra-otimizado:', event.reason)
}

console.log('✅ World Update Worker Ultra-Otimizado inicializado e pronto para uso!')
