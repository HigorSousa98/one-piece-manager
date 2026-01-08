// src/utils/adventureSystem.ts
import { db, Character, Crew, Island } from './database'
import { GenerationConfig } from '@/utils/generationConfig'
import { useBattleStore } from '@/stores/battleStore'
import { GameLogic } from '@/utils/gameLogic'
import { ShipNameGenerator } from '@/data/shipNameGenerator'
import { CrewNameGenerator } from '@/data/crewNames'
import { useCharacterStore } from '@/stores/characterStore'
import { NameGenerator } from '@/data/characterNames'
import { GameDataGenerator } from './gameDataGenerator'

export interface AdventureEncounter {
  opponent: Character
  encounterType: 'hostile' | 'neutral' | 'friendly'
  location: string
  description: string
  specialReward?: {
    type: 'bounty' | 'experience'
    value: number
  }
}

export interface IslandMovementResult {
  totalCrews: number
  dockedToggled: number
  crewsMoved: number
  movementsByDifficulty: {
    easier: number
    same: number
    harder: number
  }
  islandReports: Array<{
    islandId: number
    islandName: string
    initialCrews: number
    finalCrews: number
    crewsLeft: number
    crewsArrived: number
  }>
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

// ✅ CACHE PARA OTIMIZAÇÃO
interface AdventureCache {
  islands: Island[]
  crews: Crew[]
  characters: Character[]
  territories: any[]
  devilFruits: any[]
  styleCombats: any[]
  lastCacheTime: number
  cacheTimeout: number
}

export class AdventureSystem {
  // ✅ CACHE ESTÁTICO PARA MELHOR PERFORMANCE
  private static cache: AdventureCache = {
    islands: [],
    crews: [],
    characters: [],
    territories: [],
    devilFruits: [],
    styleCombats: [],
    lastCacheTime: 0,
    cacheTimeout: 30000, // 30 segundos
  }

  // ✅ MÉTODO PARA ATUALIZAR CACHE
  private static async updateCache(force: boolean = false): Promise<void> {
    const now = Date.now()

    if (!force && now - this.cache.lastCacheTime < this.cache.cacheTimeout) {
      return // Cache ainda válido
    }

    try {
      // Carregar dados em paralelo
      const [islands, crews, characters, territories, devilFruits, styleCombats] =
        await Promise.all([
          db.islands.toArray(),
          db.crews.toArray(),
          db.characters.toArray(),
          db.territories.toArray(),
          db.devilFruits.toArray(),
          db.styleCombats.toArray(),
        ])

      this.cache = {
        islands,
        crews,
        characters,
        territories,
        devilFruits,
        styleCombats,
        lastCacheTime: now,
        cacheTimeout: 30000,
      }

      console.log('✅ Cache do AdventureSystem atualizado')
    } catch (error) {
      console.error('❌ Erro ao atualizar cache:', error)
    }
  }

  // ✅ MÉTODO PARA LIMPAR CACHE
  static clearCache(): void {
    this.cache.lastCacheTime = 0
  }

  // 1. 🎯 GERAR AVENTURA BASEADA NO TIPO E LOCALIZAÇÃO (MANTIDO ORIGINAL)
  static async generateAdventure(player: Character): Promise<AdventureEncounter | null> {
    try {
      console.log(`🗺️ Gerando aventura para ${player.type}: ${player.name}`)

      // Primeiro, descobrir em que ilha o jogador está
      const playerIsland = await this.getPlayerCurrentIsland(player)

      if (!playerIsland) {
        console.log('❌ Jogador não está em nenhuma ilha')
        return null
      }

      console.log(`🏝️ Jogador está na ilha: ${playerIsland.name} - ${playerIsland.id}`)

      // Buscar oponente na mesma ilha
      const opponent = await this.findOpponentOnSameIsland(player, playerIsland.id!)

      if (!opponent) {
        console.log('❌ Nenhum oponente encontrado na ilha atual')
        return null
      }

      const encounter = this.createEncounter(player, opponent, playerIsland)

      return encounter
    } catch (error) {
      console.error('Erro ao gerar aventura:', error)
      return null
    }
  }

  // 2. 🏝️ DESCOBRIR ILHA ATUAL DO JOGADOR (MANTIDO ORIGINAL)
  private static async getPlayerCurrentIsland(player: Character): Promise<Island | null> {
    try {
      // Buscar o crew do jogador
      const playerCrew = await db.crews.get(player.crewId!)

      if (!playerCrew) {
        console.log('❌ Jogador não tem crew')
        return null
      }

      // Buscar a ilha onde o crew está
      const currentIsland = await db.islands.get(playerCrew.currentIsland)

      return currentIsland || null
    } catch (error) {
      console.error('Erro ao buscar ilha do jogador:', error)
      return null
    }
  }

  // 3. 🎲 ENCONTRAR OPONENTE NA MESMA ILHA (MANTIDO ORIGINAL)
  private static async findOpponentOnSameIsland(
    player: Character,
    islandId: number,
  ): Promise<Character | null> {
    try {
      // Buscar todos os crews na mesma ilha
      const crewsOnIsland = await db.crews
        .where('currentIsland')
        .equals(islandId)
        .and((crew) => crew.docked == 1)
        .toArray()

      if (crewsOnIsland.length <= 1) {
        // Só tem o crew do jogador
        return null
      }

      // Buscar personagens desses crews (exceto o do jogador)
      const potentialOpponents: Character[] = []

      const lastCombats = player.crewId
        ? await db.battles
            .where('challengerCrewId')
            .equals(player.crewId)
            .reverse()
            .limit(GenerationConfig.createEpic().lastCombats)
            .toArray()
        : null

      for (const crew of crewsOnIsland) {
        if (crew.id === player.crewId) continue // Pular o próprio crew

        // Buscar membros deste crew
        const crewMembers = await db.characters
          .where('crewId')
          .equals(crew.id!)
          .and(
            (char) =>
              char.isPlayer !== 1 &&
              !lastCombats?.find((battle) => battle.opponentCrewId === char.crewId),
          ) // Não incluir jogadores e nem repetições
          .toArray()

        // Filtrar por tipo compatível
        const compatibleMembers = this.filterCompatibleOpponents(player, crewMembers)
        potentialOpponents.push(...compatibleMembers)
      }

      if (potentialOpponents.length === 0) {
        return null
      }

      // Filtrar por level compatível
      const levelCompatible = this.filterByLevel(player, potentialOpponents)

      if (levelCompatible.length === 0) {
        return potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)]
      }

      // Priorizar oponentes interessantes
      const prioritized = this.prioritizeOpponents(player, levelCompatible)

      // Escolher aleatoriamente entre os 3 melhores
      const topOpponents = prioritized.slice(0, Math.min(12, prioritized.length))
      return topOpponents[Math.floor(Math.random() * topOpponents.length)]
    } catch (error) {
      console.error('Erro ao buscar oponente na ilha:', error)
      return null
    }
  }

  // 4-8. MÉTODOS AUXILIARES (MANTIDOS ORIGINAIS)
  private static filterCompatibleOpponents(player: Character, opponents: Character[]): Character[] {
    return opponents.filter((opponent) => {
      switch (player.type) {
        case 'Pirate':
          return ['Marine', 'Government', 'BountyHunter', 'Pirate'].includes(opponent.type)
        case 'Marine':
          return ['Pirate'].includes(opponent.type)
        case 'BountyHunter':
          return ['Pirate', 'BountyHunter'].includes(opponent.type)
        case 'Government':
          return (
            opponent.kindness > 0 && ['Pirate', 'Marine', 'BountyHunter'].includes(opponent.type)
          )
        default:
          return true
      }
    })
  }

  private static filterByLevel(player: Character, opponents: Character[]): Character[] {
    const levelRange = this.calculateLevelRange(player.level)
    return opponents.filter(
      (opponent) => opponent.level >= levelRange.min && opponent.level <= levelRange.max,
    )
  }

  private static createEncounter(
    player: Character,
    opponent: Character,
    island: Island,
  ): AdventureEncounter {
    const encounterType = this.determineEncounterType(player, opponent)
    const description = this.generateEncounterDescription(player, opponent, island, encounterType)

    return {
      opponent,
      encounterType,
      location: island.name,
      description,
      specialReward: this.generateSpecialReward(player, opponent, island),
    }
  }

  private static generateEncounterDescription(
    player: Character,
    opponent: Character,
    island: Island,
    encounterType: 'hostile' | 'neutral' | 'friendly',
  ): string {
    const playerTypeDesc = this.getTypeDescription(player.type)
    const opponentTypeDesc = this.getTypeDescription(opponent.type)

    const encounterStarters: Record<'hostile' | 'neutral' | 'friendly', string[]> = {
      hostile: [
        `Explorando a ${island.name}, você avista ${opponent.name}, ${opponentTypeDesc}. Os olhares se cruzam e a tensão é palpável.`,
        `Na ${island.name}, você se depara com ${opponent.name}. Como ${opponentTypeDesc}, eles claramente não têm boas intenções.`,
        `Caminhando pela ${island.name}, você é surpreendido por ${opponent.name}, ${opponentTypeDesc} conhecido pela sua hostilidade.`,
        `Sua exploração da ${island.name} toma um rumo perigoso quando ${opponent.name} aparece, pronto para o confronto.`,
      ],
      neutral: [
        `Na ${island.name}, você encontra ${opponent.name}, ${opponentTypeDesc}. A situação é tensa, mas ainda há espaço para diálogo.`,
        `Durante sua exploração da ${island.name}, você cruza com ${opponent.name}. Como ${opponentTypeDesc}, eles parecem cautelosos.`,
        `Sua jornada pela ${island.name} é interrompida por ${opponent.name}, que observa você com interesse.`,
      ],
      friendly: [
        `Na ${island.name}, você tem um encontro inesperado com ${opponent.name}, ${opponentTypeDesc} que parece amigável.`,
        `Sua aventura pela ${island.name} toma um rumo interessante quando você conhece ${opponent.name}.`,
      ],
    }

    const starters = encounterStarters[encounterType]
    const starter = starters[Math.floor(Math.random() * starters.length)]

    // Adicionar contexto da ilha
    let islandContext = ''
    if (island.difficulty > 7) {
      islandContext = ' Esta ilha é conhecida por ser perigosa - você deve estar preparado.'
    } else if (island.difficulty < 3) {
      islandContext = ' Esta ilha é relativamente pacífica, mas ainda assim, cuidado é necessário.'
    }

    // Adicionar contexto baseado na diferença de level
    const levelDiff = opponent.level - player.level
    let levelContext = ''

    if (levelDiff > 5) {
      levelContext =
        ' Você sente uma aura intimidante emanando deles - claramente são mais experientes que você.'
    } else if (levelDiff < -5) {
      levelContext =
        ' Eles parecem menos experientes, mas isso não significa que devem ser subestimados.'
    } else {
      levelContext = ' Vocês parecem estar em pé de igualdade.'
    }

    return starter + islandContext + levelContext + ' O que você fará?'
  }

  private static generateSpecialReward(
    player: Character,
    opponent: Character,
    island: Island,
  ): any {
    // Chance baseada na dificuldade da ilha
    const baseChance = 0.2 + island.difficulty * 0.02 // 20% + 2% por dificuldade

    if (Math.random() > baseChance) return undefined

    const rewardTypes = ['bounty', 'experience']
    const rewardType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)]

    const difficultyMultiplier = 1 + island.difficulty * 0.1

    switch (rewardType) {
      case 'bounty':
        return {
          type: 'bounty',
          value: Math.ceil(opponent.level * 50000 * difficultyMultiplier),
        }
      case 'experience':
        return {
          type: 'experience',
          value: (Math.random() * difficultyMultiplier).toFixed(2),
        }
      default:
        return undefined
    }
  }

  // 🛠️ FUNÇÕES AUXILIARES (MANTIDAS ORIGINAIS)
  private static calculateLevelRange(level: number): { min: number; max: number } {
    const variance = Math.max(5, Math.floor(level * 0.2)) // 20% de variação, mínimo 3

    return {
      min: Math.max(1, level - variance),
      max: level + variance,
    }
  }

  private static prioritizeOpponents(player: Character, opponents: Character[]): Character[] {
    return opponents.sort((a, b) => {
      let scoreA = 0
      let scoreB = 0

      // Priorizar rivais naturais
      if (
        (player.type === 'Pirate' && a.type === 'Marine') ||
        (player.type === 'Marine' && a.type === 'Pirate') ||
        (player.type === 'BountyHunter' && a.type === 'Pirate')
      ) {
        scoreA += 5
      }

      if (
        (player.type === 'Pirate' && b.type === 'Marine') ||
        (player.type === 'Marine' && b.type === 'Pirate') ||
        (player.type === 'BountyHunter' && b.type === 'Pirate')
      ) {
        scoreB += 5
      }

      // Priorizar levels próximos
      const levelDiffA = Math.abs(player.level - a.level)
      const levelDiffB = Math.abs(player.level - b.level)
      scoreA += Math.max(0, 5 - levelDiffA)
      scoreB += Math.max(0, 5 - levelDiffB)

      // Priorizar bounties interessantes
      if (a.bounty > player.bounty) scoreA += 5
      if (b.bounty > player.bounty) scoreB += 5

      return scoreB - scoreA
    })
  }

  static determineEncounterType(
    player: Character,
    opponent: Character,
  ): 'hostile' | 'neutral' | 'friendly' {
    // Piratas vs Marines = sempre hostil
    return GameLogic.determineEncounterTypeOnly(player.type, opponent.type)
  }


  private static getTypeDescription(type: string): string {
    switch (type) {
      case 'Pirate':
        return 'um pirata temido pelos mares'
      case 'Marine':
        return 'um marine dedicado à justiça'
      case 'Government':
        return 'um agente misterioso do governo mundial'
      case 'BountyHunter':
        return 'um caçador de recompensas experiente'
      case 'Civillian':
        return 'um civil pacífico'
      default:
        return 'um indivíduo misterioso'
    }
  }

  // ✅ VERSÕES OTIMIZADAS DOS MÉTODOS PRINCIPAIS PARA WORKERS

  // 🎮 SIMULAÇÃO DE ENCONTROS OTIMIZADA
  static async simulateIslandEncounters(
    islandId: number,
    maxEncounters: number = 5,
  ): Promise<{
    encounters: number
    battles: number
    crewMovements: number
  }> {
    try {
      const characterStore = useCharacterStore()
      const battleStore = useBattleStore()
      const player = characterStore.playerCharacter
      let encounters = 0
      let battles = 0
      let crewMovements = 0
      if (player) {
        // Buscar todos os crews na ilha
        const crewsOnIsland = await db.crews
          .where('currentIsland')
          .equals(islandId)
          .and((crew) => crew.docked == 1 && crew.id != player.crewId)
          .toArray()
        if (crewsOnIsland.length < 2) {
          return { encounters: 0, battles: 0, crewMovements: 0 }
        }

        // Simular encontros entre crews diferentes
        for (let i = 0; i < Math.min(maxEncounters, crewsOnIsland.length * 2); i++) {
          const crew1 = crewsOnIsland[Math.floor(Math.random() * crewsOnIsland.length)]
          const crew2 = crewsOnIsland[Math.floor(Math.random() * crewsOnIsland.length)]

          if (crew1.id === crew2.id) continue // Mesmo crew

          // Buscar membros representativos de cada crew
          const [member1, member2] = await Promise.all([
            db.characters
              .where('crewId')
              .equals(crew1.id!)
              .and((char) => char.isPlayer !== 1)
              .first(),
            db.characters
              .where('crewId')
              .equals(crew2.id!)
              .and((char) => char.isPlayer !== 1)
              .first(),
          ])

          if (!member1 || !member2) continue

          encounters++

          // Determinar se resulta em batalha
          const encounterType = GameLogic.determineEncounterTypeOnly(crew1.type, crew2.type)

          if (encounterType === 'hostile') {
            // Simular batalha entre os crews
            const battleResult = await battleStore.simulateCrewBattle(crew1, crew2)
            if (battleResult) {
              battles++
            }
          }
        }
      }
      return { encounters, battles, crewMovements }
    } catch (error) {
      console.error('Erro ao simular encontros na ilha:', error)
      return { encounters: 0, battles: 0, crewMovements: 0 }
    }
  }

  // 🌍 SIMULAÇÃO MUNDIAL OTIMIZADA
  static async simulateWorldEncounters(): Promise<{
    totalEncounters: number
    totalBattles: number
    totalMovements: number
    islandReports: Array<{
      islandName: string
      encounters: number
      battles: number
      movements: number
    }>
  }> {
    try {
      console.log('🌍 Simulando encontros em todas as ilhas (otimizado)...')
      //mudar encontros x worldUpdateWorker

      // Atualizar cache
      await this.updateCache()

      const results = {
        totalEncounters: 0,
        totalBattles: 0,
        totalMovements: 0,
        islandReports: [] as Array<{
          islandName: string
          encounters: number
          battles: number
          movements: number
        }>,
      }

      // Processar ilhas em chunks para melhor performance
      const chunkSize = 5
      const islands = this.cache.islands

      const maxEncounters = GenerationConfig.createEpic().islandEncounters

      for (let i = 0; i < islands.length; i += chunkSize) {
        const islandChunk = islands.slice(i, i + chunkSize)

        // Processar chunk em paralelo
        const chunkPromises = islandChunk.map(async (island) => {
          const islandResult = await this.simulateIslandEncounters(island.id!, maxEncounters)

          return {
            island,
            result: islandResult,
          }
        })

        const chunkResults = await Promise.all(chunkPromises)

        // Processar resultados do chunk
        chunkResults.forEach(({ island, result }) => {
          results.totalEncounters += result.encounters
          results.totalBattles += result.battles

          if (result.encounters > 0) {
            results.islandReports.push({
              islandName: island.name,
              encounters: result.encounters,
              battles: result.battles,
              movements: result.crewMovements,
            })
          }
        })

        // Yield control para não bloquear
        await new Promise((resolve) => setTimeout(resolve, 1))
      }

      return results
    } catch (error) {
      console.error('Erro ao simular mundo:', error)
      return {
        totalEncounters: 0,
        totalBattles: 0,
        totalMovements: 0,
        islandReports: [],
      }
    }
  }

  // ✅ CRIAÇÃO DE PERSONAGEM OTIMIZADA
  static async createNewCharacter(): Promise<{ success: boolean }> {
    try {
      // Atualizar cache se necessário
      await this.updateCache()

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
        this.cache.styleCombats.length > 0
          ? this.cache.styleCombats[GameLogic.randomBetween(0, this.cache.styleCombats.length - 1)]
              .id || 0
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
          this.cache.styleCombats.find((st) => st.id == styleCombatId)?.name || 'Balanced',
          potentialToHaveKngHaki,
        ),
        styleCombatId: styleCombatId!,
        devilFruitId: 0,
        crewId: crewId,
        position: 'Captain',
        isPlayer: 0,
        kindness: GameLogic.randomBetween(-100, 100),
        potentialToHaveKngHaki: potentialToHaveKngHaki,
        defendingBase: 0,
        loyalty: 100,
        createdAt: new Date(),
      }

      const characterId = await db.characters.add(newCharacter)

      if (crewId != 0) {
        const selectedIsland =
          this.cache.islands.length > 0
            ? GameLogic.selectIslandForCrew(newCharacter, this.cache.islands)
            : 1

        await db.crews.update(crewId, {
          captainId: characterId,
          currentIsland: selectedIsland,
        })
      }

      // Limpar cache para próxima atualização
      this.clearCache()

      console.log(`Um novo ${type} adentrou nos mares! Seu nome é ${newCharacter.name}!`)

      return { success: true }
    } catch (error) {
      console.error('❌ Erro ao criar novo personagem:', error)
      return { success: false }
    }
  }

  // ✅ REDISTRIBUIÇÃO DE PERSONAGENS OTIMIZADA
  static async changeTopCharacters(): Promise<{ success: boolean }> {
    try {
      // Atualizar cache
      await this.updateCache()

      const config = GenerationConfig.createEpic()

      // Usar cache para melhor performance
      const dfMap = new Map(this.cache.devilFruits.map((df) => [df.id!, df]))
      const crewMap = new Map(this.cache.crews.map((crew) => [crew.id!, crew]))

      const calculatePowerSafe = (character: Character): number => {
        const devilFruit = character.devilFruitId ? dfMap.get(character.devilFruitId) : undefined
        return GameLogic.calculatePower(character, devilFruit)
      }

      // Filtrar e ordenar personagens do cache
      const pirates = this.cache.characters
        .filter((char) => char.type === 'Pirate' && char.position === 'Captain')
        .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a))

      const marines = this.cache.characters
        .filter((char) => char.type === 'Marine' && char.position === 'Captain')
        .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a))

      const government = this.cache.characters
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

      const getBaseIsland = (character: Character): number => {
        const crew = crewMap.get(character.crewId!)
        if (!crew) {
          return this.cache.islands[0]?.id || 1
        }
        return crew.currentIsland
      }

      // Criar posições importantes (versão otimizada)
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
      const sortedIslands = this.cache.islands.sort((a, b) => a.difficulty - b.difficulty)

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

      // Executar todas as operações em paralelo
      await Promise.all(operations)

      // Limpar cache
      this.clearCache()

      return { success: true }
    } catch (error) {
      console.error('❌ Erro ao redistribuir personagens mais poderosos:', error)
      return { success: false }
    }
  }

  // ✅ ATUALIZAÇÃO DE TERRITÓRIOS OTIMIZADA
  static async changeTerritories(): Promise<{ success: boolean }> {
    try {
      // Atualizar cache
      await this.updateCache()

      const characterStore = useCharacterStore()
      const player = characterStore.playerCharacter

      if (!player || !player.crewId) {
        console.error('❌ Player ou crewId não encontrado')
        return { success: false }
      }

      // Usar cache para melhor performance
      const allCrews = this.cache.crews.filter((crew) => crew.docked === 1)
      const allCharacters = this.cache.characters
      const allDevilFruits = this.cache.devilFruits
      const allTerritories = this.cache.territories

      const occupiedTerritories = allTerritories.filter((territory) => territory.crewId !== 0)
      const mapStrongestCrewByIsland = new Map<number, Crew | null>()

      // Inicializar mapa
      occupiedTerritories.forEach((territory) => {
        mapStrongestCrewByIsland.set(territory.islandId, null)
      })

      // Encontrar crew mais forte em cada ilha (versão otimizada)
      allCrews.forEach((crew) => {
        if (mapStrongestCrewByIsland.has(crew.currentIsland) && crew.id !== player.crewId) {
          const currentStrongestCrew = mapStrongestCrewByIsland.get(crew.currentIsland)

          if (currentStrongestCrew) {
            const currentCrewMembers = allCharacters.filter(
              (char) => char.crewId === currentStrongestCrew.id,
            )
            const thisCrewMembers = allCharacters.filter((char) => char.crewId === crew.id)

            const currentCrewPower = GameLogic.calculateCrewPower(
              currentCrewMembers,
              allDevilFruits,
            )
            const thisCrewPower = GameLogic.calculateCrewPower(thisCrewMembers, allDevilFruits)

            if (thisCrewPower > currentCrewPower) {
              mapStrongestCrewByIsland.set(crew.currentIsland, crew)
            }
          } else {
            mapStrongestCrewByIsland.set(crew.currentIsland, crew)
          }
        }
      })

      // Preparar atualizações
      const territoryUpdates: Promise<number>[] = []

      for (const [islandId, strongestCrew] of mapStrongestCrewByIsland.entries()) {
        if (strongestCrew) {
          const territory = occupiedTerritories.find((t) => t.islandId === islandId)
          if (territory) {
            territoryUpdates.push(
              db.territories.update(territory.id!, { crewId: strongestCrew.id }),
            )
          }
        } else {
          const territory = occupiedTerritories.find((t) => t.islandId === islandId)
          if (territory) {
            territoryUpdates.push(db.territories.update(territory.id!, { crewId: 0 }))
          }
        }
      }

      // Executar atualizações
      if (territoryUpdates.length > 0) {
        await Promise.all(territoryUpdates)
      }

      // Limpar cache
      this.clearCache()

      return { success: true }
    } catch (error) {
      console.error('❌ Erro ao redistribuir crews nos territórios:', error)
      return { success: false }
    }
  }

  // ✅ PROCESSAMENTO DE MOVIMENTO OTIMIZADO
  static async processWorldMovement(): Promise<IslandMovementResult> {
    try {
      // Atualizar cache
      await this.updateCache()

      const result: IslandMovementResult = {
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

      // Fase 1: Alternar status docked (otimizada)
      const dockedResult = await this.toggleCrewDockedStatusOptimized()
      result.dockedToggled = dockedResult.toggled
      result.totalCrews = dockedResult.totalCrews

      // Fase 2: Movimentar crews (otimizada)
      const movementResult = await this.moveDockedCrewsOptimized()
      result.crewsMoved = movementResult.moved
      result.movementsByDifficulty = movementResult.movementsByDifficulty
      result.islandReports = movementResult.islandReports

      return result
    } catch (error) {
      console.error('❌ Erro na movimentação mundial:', error)
      return {
        totalCrews: 0,
        dockedToggled: 0,
        crewsMoved: 0,
        movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
        islandReports: [],
      }
    }
  }

  // ✅ VERSÕES OTIMIZADAS DOS MÉTODOS DE MOVIMENTO
  private static async toggleCrewDockedStatusOptimized(): Promise<{
    totalCrews: number
    toggled: number
  }> {
    try {
      // Usar cache
      const playerCrews = await this.getPlayerCrews()
      const playerCrewIds = playerCrews.map((crew) => crew.id)
      const territoriesCrewIds = this.cache.territories.map((territory) => territory.crewId)

      const nonPlayerCrews = this.cache.crews.filter(
        (crew) =>
          crew.captainId > 0 &&
          !playerCrewIds.includes(crew.id) &&
          !territoriesCrewIds.includes(crew.id),
      )

      if (nonPlayerCrews.length === 0) {
        return { totalCrews: 0, toggled: 0 }
      }

      let toggled = 0
      const updates: Promise<any>[] = []

      // Processar em chunks para melhor performance
      const chunkSize = 10
      for (let i = 0; i < nonPlayerCrews.length; i += chunkSize) {
        const chunk = nonPlayerCrews.slice(i, i + chunkSize)

        chunk.forEach((crew) => {
          const roll = Math.random()
          const newDockedStatus = roll <= 0.1 ? 0 : 1

          if (crew.docked !== newDockedStatus) {
            updates.push(db.crews.update(crew.id!, { docked: newDockedStatus as 0 | 1 }))
            toggled++
          }
        })

        // Yield control
        if (i % (chunkSize * 5) === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1))
        }
      }

      await Promise.all(updates)

      return {
        totalCrews: nonPlayerCrews.length,
        toggled,
      }
    } catch (error) {
      console.error('❌ Erro ao alternar status docked (otimizado):', error)
      return { totalCrews: 0, toggled: 0 }
    }
  }

  private static async moveDockedCrewsOptimized(): Promise<{
    moved: number
    movementsByDifficulty: {
      easier: number
      same: number
      harder: number
    }
    islandReports: Array<{
      islandId: number
      islandName: string
      initialCrews: number
      finalCrews: number
      crewsLeft: number
      crewsArrived: number
    }>
  }> {
    try {
      const playerCrews = await this.getPlayerCrews()
      const playerCrewIds = playerCrews.map((crew) => crew.id)
      const territoriesCrewIds = this.cache.territories.map((territory) => territory.crewId)

      const dockedCrews = this.cache.crews.filter(
        (crew) =>
          crew.docked === 1 &&
          !playerCrewIds.includes(crew.id) &&
          !territoriesCrewIds.includes(crew.id),
      )

      if (dockedCrews.length === 0) {
        return {
          moved: 0,
          movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
          islandReports: [],
        }
      }

      const movementDecisions: CrewMovementDecision[] = []
      const movementsByDifficulty = { easier: 0, same: 0, harder: 0 }
      const islandMap = new Map(this.cache.islands.map((island) => [island.id!, island]))

      // Processar movimentos (versão simplificada)
      for (const crew of dockedCrews) {
        const moveRoll = Math.random()

        if (moveRoll <= 0.2) {
          // 20% chance de movimento
          const currentIsland = islandMap.get(crew.currentIsland)

          if (currentIsland) {
            const destinationDecision = await this.selectDestinationIslandOptimized(currentIsland)

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

      // Executar movimentos em chunks
      const chunkSize = 5
      for (let i = 0; i < movementDecisions.length; i += chunkSize) {
        const chunk = movementDecisions.slice(i, i + chunkSize)

        const chunkPromises = chunk.map((decision) => this.executeCrewMovement(decision))

        await Promise.all(chunkPromises)

        // Yield control
        await new Promise((resolve) => setTimeout(resolve, 1))
      }

      // Gerar relatório simplificado
      const islandReports = this.generateIslandMovementReportOptimized(movementDecisions)

      return {
        moved: movementDecisions.length,
        movementsByDifficulty,
        islandReports,
      }
    } catch (error) {
      console.error('❌ Erro na movimentação de crews (otimizado):', error)
      return {
        moved: 0,
        movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
        islandReports: [],
      }
    }
  }

  private static async selectDestinationIslandOptimized(
    currentIsland: Island,
  ): Promise<{ island: Island; type: 'easier' | 'same' | 'harder' } | null> {
    try {
      const availableIslands = this.cache.islands.filter((island) => island.id !== currentIsland.id)

      if (availableIslands.length === 0) {
        return null
      }

      // Versão simplificada da seleção
      const easierIslands = availableIslands.filter(
        (island) => island.difficulty === currentIsland.difficulty - 1,
      )
      const sameIslands = availableIslands.filter(
        (island) => island.difficulty === currentIsland.difficulty,
      )
      const harderIslands = availableIslands.filter(
        (island) => island.difficulty === currentIsland.difficulty + 1,
      )

      const roll = Math.random()
      let selectedIslands: Island[]
      let movementType: 'easier' | 'same' | 'harder'

      if (roll < 0.2 && easierIslands.length > 0) {
        selectedIslands = easierIslands
        movementType = 'easier'
      } else if (roll < 0.5 && sameIslands.length > 0) {
        selectedIslands = sameIslands
        movementType = 'same'
      } else if (harderIslands.length > 0) {
        selectedIslands = harderIslands
        movementType = 'harder'
      } else if (sameIslands.length > 0) {
        selectedIslands = sameIslands
        movementType = 'same'
      } else if (easierIslands.length > 0) {
        selectedIslands = easierIslands
        movementType = 'easier'
      } else {
        return null
      }

      const selectedIsland = selectedIslands[Math.floor(Math.random() * selectedIslands.length)]

      return {
        island: selectedIsland,
        type: movementType,
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar ilha de destino (otimizado):', error)
      return null
    }
  }

  private static generateIslandMovementReportOptimized(movements: CrewMovementDecision[]): Array<{
    islandId: number
    islandName: string
    initialCrews: number
    finalCrews: number
    crewsLeft: number
    crewsArrived: number
  }> {
    try {
      const reports: Array<{
        islandId: number
        islandName: string
        initialCrews: number
        finalCrews: number
        crewsLeft: number
        crewsArrived: number
      }> = []

      // Usar cache para gerar relatório mais rápido
      const islandMovementMap = new Map<number, { left: number; arrived: number }>()

      movements.forEach((movement) => {
        // Crews que saíram
        const fromData = islandMovementMap.get(movement.fromIslandId) || { left: 0, arrived: 0 }
        fromData.left++
        islandMovementMap.set(movement.fromIslandId, fromData)

        // Crews que chegaram
        const toData = islandMovementMap.get(movement.toIslandId) || { left: 0, arrived: 0 }
        toData.arrived++
        islandMovementMap.set(movement.toIslandId, toData)
      })

      // Gerar relatórios apenas para ilhas com movimento
      for (const [islandId, data] of islandMovementMap.entries()) {
        const island = this.cache.islands.find((i) => i.id === islandId)
        if (island && (data.left > 0 || data.arrived > 0)) {
          // Contar crews atuais (estimativa baseada no cache)
          const currentCrews = this.cache.crews.filter(
            (crew) => crew.currentIsland === islandId && crew.docked === 1,
          ).length

          reports.push({
            islandId: island.id!,
            islandName: island.name,
            initialCrews: currentCrews + data.left - data.arrived,
            finalCrews: currentCrews,
            crewsLeft: data.left,
            crewsArrived: data.arrived,
          })
        }
      }

      return reports.sort((a, b) => b.crewsLeft + b.crewsArrived - (a.crewsLeft + a.crewsArrived))
    } catch (error) {
      console.error('❌ Erro ao gerar relatório de movimento (otimizado):', error)
      return []
    }
  }

  // ✅ MÉTODOS MANTIDOS ORIGINAIS (para compatibilidade)
  static async selectDestinationIsland(
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

  static validateIslandMovement(
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

  static async executeCrewMovement(decision: CrewMovementDecision): Promise<void> {
    try {
      const fromIsland = await db.islands.get(decision.fromIslandId)
      const toIsland = await db.islands.get(decision.toIslandId)

      if (!fromIsland || !toIsland) {
        console.error(`❌ Ilhas não encontradas: ${decision.fromIslandId} → ${decision.toIslandId}`)
        return
      }

      const validation = this.validateIslandMovement(fromIsland, toIsland)

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

  static async generateIslandMovementReport(
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

        const currentCrews = await db.crews
          .where('currentIsland')
          .equals(island.id!)
          .and((crew) => crew.docked === 1)
          .count()

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

  static async getPlayerCrews(): Promise<Crew[]> {
    try {
      const playerCharacters = await db.characters.where('isPlayer').equals(1).toArray()

      if (playerCharacters.length === 0) return []

      const crewIds = [...new Set(playerCharacters.map((char) => char.crewId).filter(Boolean))]

      const crews = await Promise.all(crewIds.map((crewId) => db.crews.get(crewId!)))

      return crews.filter(Boolean) as Crew[]
    } catch (error) {
      console.error('❌ Erro ao buscar crews do player:', error)
      return []
    }
  }

  // ✅ MÉTODOS ORIGINAIS DE MOVIMENTO (mantidos para compatibilidade)
  static async toggleCrewDockedStatus(): Promise<{
    totalCrews: number
    toggled: number
  }> {
    try {
      const allCrews = await db.crews.where('captainId').above(0).toArray()

      const playerCrews = await this.getPlayerCrews()
      const playerCrewIds = playerCrews.map((crew) => crew.id)
      const territories = await db.territories.toArray()
      const territoriesCrewIds = territories.map((territory) => territory.crewId)

      const nonPlayerCrews = allCrews.filter(
        (crew) => !playerCrewIds.includes(crew.id) && !territoriesCrewIds.includes(crew.id),
      )

      if (nonPlayerCrews.length === 0) {
        return { totalCrews: 0, toggled: 0 }
      }

      let toggled = 0
      const updates: Promise<any>[] = []

      for (const crew of nonPlayerCrews) {
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

      return {
        totalCrews: nonPlayerCrews.length,
        toggled,
      }
    } catch (error) {
      console.error('❌ Erro ao alternar status docked:', error)
      return { totalCrews: 0, toggled: 0 }
    }
  }

  static async moveDockedCrews(): Promise<{
    moved: number
    movementsByDifficulty: {
      easier: number
      same: number
      harder: number
    }
    islandReports: Array<{
      islandId: number
      islandName: string
      initialCrews: number
      finalCrews: number
      crewsLeft: number
      crewsArrived: number
    }>
  }> {
    try {
      const playerCrews = await this.getPlayerCrews()
      const playerCrewIds = playerCrews.map((crew) => crew.id)
      const allIslands = await db.islands.toArray()
      const islandMap = new Map(allIslands.map((island) => [island.id!, island]))

      const territoriesCrews = await db.territories.toArray()
      const allCharacters = await db.characters.toArray()
      const allDevilFruits = await db.devilFruits.toArray()
      const allCrews = await db.crews.toArray()
      const crewByIsland = new Map(
        allIslands.map((island) => {
          const crewsInThisIsland = allCrews.filter((crews) => crews.currentIsland == island.id)
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

      const dockedCrews = allCrews.filter(
        (crew) =>
          crew.docked == 1 &&
          !playerCrewIds.includes(crew.id) &&
          !territoriesCrews.find((ter) => ter.crewId == crew.id),
      )

      if (dockedCrews.length === 0) {
        return {
          moved: 0,
          movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
          islandReports: [],
        }
      }

      const movementDecisions: CrewMovementDecision[] = []
      const movementsByDifficulty = { easier: 0, same: 0, harder: 0 }

      for (const crew of dockedCrews) {
        const moveRoll = Math.random()

        if (moveRoll <= 0.2) {
          const currentIsland = islandMap.get(crew.currentIsland)
          const currentIndex =
            crewByIsland.get(crew.currentIsland)?.findIndex((curr) => curr.id == crew.id) || 0
          const totalCrewsOnIsland = crewByIsland.get(crew.currentIsland)?.length || 1
          const percent = currentIndex / totalCrewsOnIsland

          if (!currentIsland) {
            console.warn(`⚠️ Ilha atual não encontrada para ${crew.name}: ${crew.currentIsland}`)
            continue
          }

          const destinationDecision = await this.selectDestinationIsland(
            currentIsland,
            allIslands,
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

      const movementPromises = movementDecisions.map((decision) =>
        this.executeCrewMovement(decision),
      )

      await Promise.all(movementPromises)

      const islandReports = await this.generateIslandMovementReport(allIslands, movementDecisions)

      return {
        moved: movementDecisions.length,
        movementsByDifficulty,
        islandReports,
      }
    } catch (error) {
      console.error('❌ Erro na movimentação de crews:', error)
      return {
        moved: 0,
        movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
        islandReports: [],
      }
    }
  }

  // ✅ MÉTODOS DE INTEGRAÇÃO COM WORLD STORE (OTIMIZADOS)
  static async updateWorldAfterPlayerActionAsync(): Promise<void> {
    try {
      const { useWorldStore } = await import('@/stores/worldStore')
      const worldStore = useWorldStore()

      // Executar em background
      worldStore.updateWorldBackground()

      console.log('🌍 Atualização do mundo iniciada em background')
    } catch (error) {
      console.error('❌ Erro ao iniciar update assíncrono do mundo:', error)
      await this.updateWorldAfterPlayerAction()
    }
  }

  static async updateWorldAfterPlayerAction(): Promise<{
    success: boolean
    worldEvents: string[]
    summary: string
  }> {
    try {
      const worldResult = await this.simulateWorldEncounters()

      const summary = `🌍 Mundo atualizado`

      return {
        success: true,
        worldEvents: [],
        summary,
      }
    } catch (error) {
      console.error('Erro ao atualizar mundo:', error)
      return {
        success: false,
        worldEvents: [],
        summary: 'Erro ao atualizar mundo',
      }
    }
  }

  static async onPlayerAction(): Promise<void> {
    await this.updateWorldAfterPlayerActionAsync()
  }

  static async forceWorldUpdate(): Promise<{
    success: boolean
    worldEvents: string[]
    summary: string
  }> {
    return await this.updateWorldAfterPlayerAction()
  }

  static async onPlayerIslandChange(): Promise<{
    success: boolean
    movementResult: IslandMovementResult
    summary: string
    worldEvents: string[]
  }> {
    try {
      const worldResult = this.simulateWorldEncounters()
      var summary = `🌍 Mundo atualizado`
      const worldEvents: string[] = []

      const movementResult = this.processWorldMovement()

      const fakeMovement = <IslandMovementResult>{}

      console.log('✅ Movimentação mundial concluída:', summary)

      return {
        success: true,
        movementResult: fakeMovement,
        summary,
        worldEvents: worldEvents.slice(0, 5),
      }
    } catch (error) {
      console.error('❌ Erro na movimentação mundial após mudança do player:', error)
      return {
        success: false,
        movementResult: {
          totalCrews: 0,
          dockedToggled: 0,
          crewsMoved: 0,
          movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
          islandReports: [],
        },
        summary: 'Erro na movimentação mundial',
        worldEvents: [],
      }
    }
  }
}
