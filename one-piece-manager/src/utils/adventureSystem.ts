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

      const allCharacters = await db.characters.toArray();

      // Buscar personagens desses crews (exceto o do jogador)
      const potentialOpponents: Character[] = []

      for (const crew of crewsOnIsland) {
        if (crew.id === player.crewId) continue // Pular o próprio crew

        // Buscar membros deste crew
        const crewMembers = allCharacters.filter(char => char.crewId == crew.id!)

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
          return ['Marine', 'Government', 'BountyHunter', 'Pirate'].includes(opponent.type)
        case 'BountyHunter':
          return ['Marine', 'Government', 'BountyHunter', 'Pirate'].includes(opponent.type)
        case 'Government':
          return ['Marine', 'Government', 'BountyHunter', 'Pirate'].includes(opponent.type)
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
          value: GameLogic.adjustBounty(Math.ceil(opponent.level * 50000 * difficultyMultiplier)),
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

  static async onPlayerAction(): Promise<void> {
    await this.updateWorldAfterPlayerActionAsync()
  }

  static async updateWorldAfterPlayerActionAsync(): Promise<void> {
    try {
      const { useWorldStore } = await import('@/stores/worldStore')
      const worldStore = useWorldStore()

      // Executar em background
      worldStore.updateWorldBackground()

      console.log('🌍 Atualização do mundo iniciada em background')
    } catch (error) {
      console.error('❌ Erro ao iniciar update assíncrono do mundo:', error)
    }
  }

}
