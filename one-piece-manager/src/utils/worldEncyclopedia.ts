import { db, DevilFruit, type Character, type Crew, type Island } from '@/utils/database'

export interface RankingCharacter extends Character {
  crewName: string
  currentIslandName: string
  currentIslandDifficulty: number
  rank: number
  specialTitle?: string
  isPlayer: 0 | 1
}

export interface PlayerRankingInfo {
  category: 'pirate' | 'marine' | 'bountyHunter' | 'government'
  rank: number
  totalInCategory: number
  bounty: number
  isInSpecialGroup: boolean // Yonkou, Shichibukai, etc.
  specialTitle?: string
}

export interface WorldRankings {
  yonkou: RankingCharacter[]
  shichibukai: RankingCharacter[]
  admirals: RankingCharacter[]
  gorousei: RankingCharacter[]
  pirates: RankingCharacter[]
  marines: RankingCharacter[]
  bountyHunters: RankingCharacter[]
  government: RankingCharacter[]
  supernovas: RankingCharacter[]
  playerInfo: PlayerRankingInfo | null
  allDevilFruits: DevilFruit[]
}

export class WorldEncyclopedia {
  /**
   * Gera todos os rankings do mundo
   */
  static async generateWorldRankings(playerCharacterId?: number): Promise<WorldRankings> {
    try {
      // Buscar dados base
      const [characters, crews, islands, yonkous, shichibukais, admirals, gorouseis] =
        await Promise.all([
          db.characters.toArray(),
          db.crews.toArray(),
          db.islands.toArray(),
          db.yonkous.toArray(),
          db.shichibukais.toArray(),
          db.admirals.toArray(),
          db.gorouseis.toArray(),
        ])

      // Filtrar apenas capitães
      const captains = characters.filter((char) => char.position === 'Captain')

      // Enriquecer dados dos capitães
      const enrichedCaptains = await this.enrichCaptainData(
        captains,
        crews,
        islands,
        playerCharacterId,
      )
      const enrichedCharacters = await this.enrichCaptainData(
        characters,
        crews,
        islands,
        playerCharacterId,
      )

      // Gerar rankings específicos
      const rankings: WorldRankings = {
        yonkou: await this.getYonkouRanking(enrichedCaptains, yonkous),
        shichibukai: await this.getShichibukaiRanking(enrichedCaptains, shichibukais),
        admirals: await this.getAdmiralRanking(enrichedCaptains, admirals),
        gorousei: await this.getGorouseiRanking(enrichedCaptains, gorouseis),
        pirates: this.getCategoryRanking(enrichedCharacters, 'Pirate'),
        marines: this.getCategoryRanking(enrichedCharacters, 'Marine'),
        bountyHunters: this.getCategoryRanking(enrichedCharacters, 'BountyHunter'),
        government: this.getCategoryRanking(enrichedCharacters, 'Government'),
        supernovas: await this.getSupernovasRanking(enrichedCharacters, crews, islands),
        playerInfo: playerCharacterId
          ? this.getPlayerRankingInfo(enrichedCharacters, playerCharacterId)
          : null,
        allDevilFruits: await db.devilFruits.toArray(),
      }

      return rankings
    } catch (error) {
      console.error('Failed to generate world rankings:', error)
      throw error
    }
  }

  /**
   * Enriquece dados dos capitães com informações adicionais
   */
  private static async enrichCaptainData(
    captains: Character[],
    crews: Crew[],
    islands: Island[],
    playerCharacterId?: number,
  ): Promise<RankingCharacter[]> {
    return captains.map((captain) => {
      const crew = crews.find((c) => c.id === captain.crewId)
      const island = islands.find((i) => i.id === crew?.currentIsland)

      return {
        ...captain,
        crewName: crew?.name || 'Unknown Crew',
        currentIslandName: island?.name || 'Unknown Island',
        currentIslandDifficulty: island?.difficulty || 0,
        rank: 0, // Será calculado depois
        isPlayer: captain.id === playerCharacterId ? 1 : 0,
        specialTitle: undefined,
      }
    })
  }

  /**
   * Ranking dos Yonkou (Top 4 Piratas)
   */
  private static async getYonkouRanking(
    captains: RankingCharacter[],
    yonkous: any[],
  ): Promise<RankingCharacter[]> {
    const yonkouCaptains = captains.filter((captain) =>
      yonkous.some((y) => y.captainId === captain.id),
    )

    return yonkouCaptains
      .sort((a, b) => (b.bounty || 0) - (a.bounty || 0))
      .slice(0, 4)
      .map((captain, index) => ({
        ...captain,
        rank: index + 1,
        specialTitle: 'Yonkou',
      }))
  }

  /**
   * Ranking dos Shichibukai (Top 7 Piratas)
   */
  private static async getShichibukaiRanking(
    captains: RankingCharacter[],
    shichibukais: any[],
  ): Promise<RankingCharacter[]> {
    const shichibukaiCaptains = captains.filter((captain) =>
      shichibukais.some((s) => s.captainId === captain.id),
    )

    return shichibukaiCaptains
      .sort((a, b) => (b.bounty || 0) - (a.bounty || 0))
      .slice(0, 7)
      .map((captain, index) => ({
        ...captain,
        rank: index + 1,
        specialTitle: 'Shichibukai',
      }))
  }

  /**
   * Ranking dos Admirais
   */
  private static async getAdmiralRanking(
    captains: RankingCharacter[],
    admirals: any[],
  ): Promise<RankingCharacter[]> {
    const admiralCaptains = captains.filter((captain) =>
      admirals.some((a) => a.marineId === captain.id),
    )

    return admiralCaptains
      .sort((a, b) => (b.bounty || 0) - (a.bounty || 0))
      .map((captain, index) => ({
        ...captain,
        rank: index + 1,
        specialTitle: 'Admiral',
      }))
  }

  /**
   * Ranking dos Gorousei (Top 5 Governo)
   */
  private static async getGorouseiRanking(
    captains: RankingCharacter[],
    gorouseis: any[],
  ): Promise<RankingCharacter[]> {
    const gorouseiCaptains = captains.filter((captain) =>
      gorouseis.some((g) => g.govId === captain.id),
    )

    return gorouseiCaptains
      .sort((a, b) => (b.bounty || 0) - (a.bounty || 0))
      .slice(0, 5)
      .map((captain, index) => ({
        ...captain,
        rank: index + 1,
        specialTitle: 'Gorousei',
      }))
  }

  /**
   * Ranking por categoria (Pirate, Marine, etc.)
   */
  private static getCategoryRanking(
    captains: RankingCharacter[],
    type: string,
  ): RankingCharacter[] {
    return captains
      .filter((captain) => captain.type === type)
      .sort((a, b) => (b.bounty || 0) - (a.bounty || 0))
      .map((captain, index) => ({
        ...captain,
        rank: index + 1,
      }))
  }

  /**
   * Ranking das Supernovas (Top 10 em ilhas difficulty <= 15)
   */
  private static async getSupernovasRanking(
    captains: RankingCharacter[],
    crews: Crew[],
    islands: Island[],
  ): Promise<RankingCharacter[]> {
    const supernovaCandidates = captains.filter((captain) => {
      return (
        captain.type === 'Pirate' &&
        captain.currentIslandDifficulty <= 14 &&
        captain.currentIslandDifficulty > 0
      )
    })

    return supernovaCandidates
      .sort((a, b) => (b.bounty || 0) - (a.bounty || 0))
      .slice(0, 15)
      .map((captain, index) => ({
        ...captain,
        rank: index + 1,
        specialTitle: 'Supernova Prospect',
      }))
  }

  /**
   * Informações de ranking do player
   */
  private static getPlayerRankingInfo(
    captains: RankingCharacter[],
    playerCharacterId: number,
  ): PlayerRankingInfo | null {
    const playerCaptain = captains.find((c) => c.id === playerCharacterId)
    if (!playerCaptain) return null

    const categoryRanking = this.getCategoryRanking(captains, playerCaptain.type)
    const playerRankInCategory = categoryRanking.findIndex((c) => c.id === playerCharacterId) + 1

    // Verificar se está em grupo especial
    let isInSpecialGroup = false
    let specialTitle = undefined

    // Verificar Yonkou, Shichibukai, etc. (você pode expandir isso)

    return {
      category: playerCaptain.type.toLowerCase() as any,
      rank: playerRankInCategory,
      totalInCategory: categoryRanking.length,
      bounty: playerCaptain.bounty || 0,
      isInSpecialGroup,
      specialTitle,
    }
  }

  /**
   * Buscar ranking específico por categoria
   */
  static async getRankingByCategory(
    category: string,
    playerCharacterId?: number,
  ): Promise<RankingCharacter[]> {
    const rankings = await this.generateWorldRankings(playerCharacterId)

    switch (category) {
      case 'yonkou':
        return rankings.yonkou
      case 'shichibukai':
        return rankings.shichibukai
      case 'admirals':
        return rankings.admirals
      case 'gorousei':
        return rankings.gorousei
      case 'pirates':
        return rankings.pirates
      case 'marines':
        return rankings.marines
      case 'bountyHunters':
        return rankings.bountyHunters
      case 'government':
        return rankings.government
      case 'supernovas':
        return rankings.supernovas
      default:
        return []
    }
  }

  /**
   * Buscar posição específica do player
   */
  static async getPlayerPosition(playerCharacterId: number): Promise<PlayerRankingInfo | null> {
    const rankings = await this.generateWorldRankings(playerCharacterId)
    return rankings.playerInfo
  }

  /**
   * Estatísticas gerais do mundo
   */
  static async getWorldStats(): Promise<{
    totalPirates: number
    totalMarines: number
    totalBountyHunters: number
    totalGovernment: number
    highestBounty: number
    averageBounty: number
  }> {
    const rankings = await this.generateWorldRankings()

    const totalPirates = rankings.pirates.length
    const totalMarines = rankings.marines.length
    const totalBountyHunters = rankings.bountyHunters.length
    const totalGovernment = rankings.government.length

    const allBounties = [
      ...rankings.pirates,
      ...rankings.marines,
      ...rankings.bountyHunters,
      ...rankings.government,
    ]
      .map((c) => c.bounty || 0)
      .filter((b) => b > 0)

    const highestBounty = Math.max(...allBounties, 0)
    const averageBounty =
      allBounties.length > 0 ? allBounties.reduce((a, b) => a + b, 0) / allBounties.length : 0

    return {
      totalPirates,
      totalMarines,
      totalBountyHunters,
      totalGovernment,
      highestBounty,
      averageBounty,
    }
  }
}
