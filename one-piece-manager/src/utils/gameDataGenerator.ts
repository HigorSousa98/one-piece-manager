// src/utils/gameDataGenerator.ts
import {
  db,
  Character,
  Crew,
  Island,
  DevilFruit,
  StyleCombat,
  Yonkou,
  Shichibukai,
  Admiral,
  MarineBase,
  CypherPol,
  Gorousei,
  Ship,
  Territory,
} from './database'
import { GameLogic } from '@/utils/gameLogic'
import { GenerationConfig, type GenerationSettings } from '@/utils/generationConfig'
import { NameGenerator } from '@/data/characterNames'
import { CrewNameGenerator } from '@/data/crewNames'
import { ShipNameGenerator } from '@/data/shipNameGenerator'
import DEVIL_FRUITS from '@/data/devilFruits'
import ISLANDS from '@/data/islands'
import STYLES from '@/data/styleCombats'
import EQUIPMENT_CONCEPTS from '@/data/equipmentConcept'
import { LEGENDARY_WEAPONS } from '@/data/legendaryWeapons'

export class GameDataGenerator {
  private config: GenerationConfig

  constructor(
    configPreset: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EPIC' = 'LARGE',
    customOverrides?: Partial<GenerationSettings>,
  ) {
    this.config = new GenerationConfig(configPreset, customOverrides)

    // Mostrar relatório de configuração
    console.log(this.config.generateReport())
  }
  public async generateInitialData(characterData: {
    name: string
    type: string
    combatStyle: string
    devilFruitId?: number
    crewName: string
    shipName: string
  }): Promise<void> {
    console.log('🏴‍☠️ Iniciando geração do mundo de One Piece...')

    try {
      // 1. Limpar dados existentes
      await this.clearExistingData()

      // 2. Gerar dados fixos
      await this.generateStyleCombats()
      await this.generateIslands()
      await this.generateDevilFruits()

      // 2.5. Criar personagem do jogador PRIMEIRO
      await this.createPlayerCharacter(characterData)

      // 3. Gerar personagens
      console.log('⚔️ Gerando personagens...')
      const pirates = await this.generatePirates()
      const bountyHunters = await this.generateBountyHunters()
      const marines = await this.generateMarines()
      const government = await this.generateGovernment()
      const civillians = await this.generateCivillian()

      // 4. Organizar hierarquias
      console.log('👑 Organizando hierarquias...')
      await this.organizeHierarchies(pirates, marines, government)

      // 5. Distribuir Devil Fruits
      console.log('🍎 Distribuindo Devil Fruits...')
      await this.distributeDevilFruits()

      // 6. Criar tripulações e bases
      console.log('🚢 Criando tripulações e bases...')
      await this.createCrewsAndBases()

      // 7. Criar territorios e bases
      console.log('🏝️ Criando territórios')
      await this.createTerritories()

      // 8. Gerar navios para todas as tripulações
      console.log('⛵ Gerando navios para as tripulações...')
      await this.generateShipsForAllCrews()

      /*// 8. Distribuir personagens nas ilhas
      console.log('🏝️ Distribuindo personagens nas ilhas...')
      await this.distributeCharactersOnIslands()*/

      // 9. Gerar itens, distribuir únicos e popular lojas
      console.log('🗡️ Gerando itens e lojas...')
      await this.generateItems()
      await this.distributeUniqueItems()
      await this.distributeCommonItems()
      await this.populateIslandStores()

      console.log('✅ Mundo de One Piece gerado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao gerar dados iniciais:', error)
      throw error
    }
  }

  private async clearExistingData(): Promise<void> {
    await Promise.all([
      db.characters.clear(),
      db.crews.clear(),
      db.ships.clear(),
      db.yonkous.clear(),
      db.shichibukais.clear(),
      db.admirals.clear(),
      db.marineBases.clear(),
      db.cypherPols.clear(),
      db.gorouseis.clear(),
      db.devilFruits.clear(),
      db.styleCombats.clear(),
      db.islands.clear(),
      db.battles.clear(),
      db.tasks.clear(),
      db.items.clear(),
      db.inventories.clear(),
      db.stores.clear(),
    ])
  }

  async createPlayerCharacter(characterData: {
    name: string
    type: string
    combatStyle: string
    devilFruitId?: number
    crewName: string
    shipName: string
  }) {
    try {
      console.log('👤 Criando personagem do player:', characterData)

      // Verificar se já existe personagem do player
      const existingPlayer = await db.characters.where('isPlayer').equals(1).first()

      if (existingPlayer) {
        console.log('⚠️ Removendo personagem existente:', existingPlayer.name)
        await db.characters.delete(existingPlayer.id!)

        // Remover crew se existir
        if (existingPlayer.crewId) {
          await db.crews.delete(existingPlayer.crewId)
        }
      }

      // Buscar style de combate
      const combatStyle = await db.styleCombats
        .where('name')
        .equals(characterData.combatStyle)
        .first()

      if (!combatStyle) {
        throw new Error(`Style de combate não encontrado: ${characterData.combatStyle}`)
      }

      const allIslands = await db.islands.toArray()

      // Criar crew para o personagem
      const crewId = await db.crews.add({
        name: characterData.crewName,
        type: characterData.type as 'Pirate' | 'Marine' | 'BountyHunter',
        captainId: 0, // Será atualizado depois
        currentIsland: 0, // Ilha inicial
        docked: 1,
        reputation: 0,
        foundedAt: new Date(),
        treasury: 0,
      })

      const newCharacter: Omit<Character, 'id'> = {
        name: characterData.name,
        type: characterData.type as
          | 'Pirate'
          | 'Marine'
          | 'BountyHunter'
          | 'Civillian'
          | 'Government',
        level: 1,
        experience: 0,
        bounty: 0,
        stats: {
          attack: combatStyle.attack * 2,
          defense: combatStyle.defense * 2,
          speed: combatStyle.speed * 2,
          intelligence: combatStyle.intelligence * 2,
          skill: combatStyle.skill * 2,
          armHaki: 0,
          obsHaki: 0,
          kingHaki: 0,
          devilFruit: characterData.devilFruitId ? 5 : 0,
        },
        styleCombatId: combatStyle.id!, // ✅ PROPRIEDADE FALTANTE
        devilFruitId: 0,
        crewId: crewId,
        position: 'Captain',
        isPlayer: 1,
        kindness: 70 + Math.ceil(Math.random() * 30),
        potentialToHaveKngHaki: 1,
        defendingBase: 0,
        loyalty: 100,
        createdAt: new Date(),
      }

      const characterId = await db.characters.add(newCharacter)

      // Atualizar crew com o ID do capitão
      await db.crews.update(crewId, {
        captainId: characterId,
        currentIsland: this.selectIslandForCrew(newCharacter, allIslands),
      })

      // Criar navio inicial
      await db.ships.add({
        crewId: crewId,
        level: 1 as 1 | 2 | 3 | 4 | 5,
        name: characterData.shipName,
        needRepair: false,
        destroyed: false,
      })
    } catch (error) {
      console.error('❌ Erro ao criar personagem do player:', error)
    }
  }
  private async generateStyleCombats(): Promise<void> {
    const styleCombats: Omit<StyleCombat, 'id'>[] = []

    STYLES.forEach((style, index) => {
      styleCombats.push({
        name: style.name,
        attack: style.attack,
        defense: style.defense,
        speed: style.speed,
        skill: style.skill,
        intelligence: style.intelligence,
        armHaki: style.armHaki,
        obsHaki: style.obsHaki,
      })
    })

    await db.styleCombats.bulkAdd(styleCombats)
  }

  public mockStyleCombact(): StyleCombat[] {
    const styleCombats: Omit<StyleCombat, 'id'>[] = []

    STYLES.forEach((style, index) => {
      styleCombats.push({
        name: style.name,
        attack: style.attack,
        defense: style.defense,
        speed: style.speed,
        skill: style.skill,
        intelligence: style.intelligence,
        armHaki: style.armHaki,
        obsHaki: style.obsHaki,
      })
    })
    return styleCombats
  }

  private async generateIslands(): Promise<void> {
    const islandsToAdd: Omit<Island, 'id'>[] = []

    ISLANDS.forEach((level, index) => {
      level.names.forEach((name) => {
        islandsToAdd.push({
          name,
          difficulty: level.difficulty,
          npcs: [],
          description: `Ilha do nível ${level.difficulty} - ${this.getIslandDescription(level.difficulty)}`,
        })
      })
    })

    await db.islands.bulkAdd(islandsToAdd)
  }

  private getIslandDescription(difficulty: number): string {
    if (difficulty <= 5) return 'East Blue - Mar mais fraco'
    if (difficulty <= 15) return 'Paradise - Primeira metade da Grand Line'
    if (difficulty <= 25) return 'New World - Segunda metade da Grand Line'
    return 'End Game - Localização final'
  }

  private async generateDevilFruits(): Promise<void> {
    const devilFruitsToAdd: Omit<DevilFruit, 'id'>[] = DEVIL_FRUITS.map((df) => ({
      name: df.name,
      ownerId: 0, // Será atribuído depois
      awakeningOn: Math.floor(df.rarity * 75),
      rarity: df.rarity,
      description: df.description,
      type: df.type,
    }))

    await db.devilFruits.bulkAdd(devilFruitsToAdd)
  }

  private async generatePirates(): Promise<Character[]> {
    const pirates: Omit<Character, 'id'>[] = []
    const allStyleCombat = await db.styleCombats.toArray()

    for (let i = 0; i < this.config.totalPirates; i++) {
      const level = GameLogic.generate(1, 100, 'weighted', 'medium')
      const styleCombatId =
        allStyleCombat[GameLogic.randomBetween(0, allStyleCombat.length - 1)].id || 0

      const potentialToHaveKngHaki = Math.random()

      pirates.push({
        name: NameGenerator.generateRandomName('Pirate'),
        level,
        experience: 0,
        bounty: GameLogic.adjustBounty(this.calculateBounty(level, 'Pirate')),
        type: 'Pirate',
        stats: GameLogic.generateStats(
          level,
          allStyleCombat.find((st) => st.id == styleCombatId).name,
          potentialToHaveKngHaki,
        ),
        styleCombatId,
        devilFruitId: 0, // Será atribuído depois
        potentialToHaveKngHaki: potentialToHaveKngHaki,
        position:
          i < Math.floor(this.config.totalPirates / this.config.avgCrewSize)
            ? 'Captain'
            : 'Crew Member', // Primeiros 50 são capitães
        isPlayer: 0,
        createdAt: new Date(),
        defendingBase: 0,
        kindness: GameLogic.randomBetween(-100, 100),
        loyalty: GameLogic.randomBetween(-100, 100),
      })
    }

    const pirateIds = (await db.characters.bulkAdd(pirates, { allKeys: true })) as number[]
    return pirates.map((pirate, index) => ({ ...pirate, id: pirateIds[index] }))
  }

  private async generateBountyHunters(): Promise<Character[]> {
    const bountyHunters: Omit<Character, 'id'>[] = []
    const allStyleCombat = await db.styleCombats.toArray()

    for (let i = 0; i < this.config.totalBountyHunter; i++) {
      const level = GameLogic.generate(1, 100, 'weighted', 'medium')
      const styleCombatId =
        allStyleCombat[GameLogic.randomBetween(0, allStyleCombat.length - 1)].id || 0
      const potentialToHaveKngHaki = Math.random()

      bountyHunters.push({
        name: NameGenerator.generateRandomName('BountyHunter'),
        level,
        experience: 0,
        bounty: GameLogic.adjustBounty(this.calculateBounty(level, 'BountyHunter')),
        type: 'BountyHunter',
        stats: GameLogic.generateStats(
          level,
          allStyleCombat.find((st) => st.id == styleCombatId).name,
          potentialToHaveKngHaki,
        ),
        styleCombatId,
        devilFruitId: 0, // Será atribuído depois
        potentialToHaveKngHaki: potentialToHaveKngHaki,
        position:
          i < Math.floor(this.config.totalBountyHunter / this.config.avgCrewSize)
            ? 'Captain'
            : 'Crew Member', // Primeiros 50 são capitães
        isPlayer: 0,
        createdAt: new Date(),
        defendingBase: 0,
        kindness: GameLogic.randomBetween(-100, 100),
        loyalty: GameLogic.randomBetween(-100, 100),
      })
    }

    const bountyHuntersId = (await db.characters.bulkAdd(bountyHunters, {
      allKeys: true,
    })) as number[]
    return bountyHunters.map((bountyHunter, index) => ({
      ...bountyHunter,
      id: bountyHuntersId[index],
    }))
  }

  private async generateMarines(): Promise<Character[]> {
    const marines: Omit<Character, 'id'>[] = []
    const allStyleCombat = await db.styleCombats.toArray()

    for (let i = 0; i < this.config.totalMarines; i++) {
      const level = GameLogic.generate(1, 100, 'weighted', 'medium')
      const styleCombatId =
        allStyleCombat[GameLogic.randomBetween(0, allStyleCombat.length - 1)].id || 0
      const potentialToHaveKngHaki = Math.random()

      marines.push({
        name: NameGenerator.generateRandomName('Marine'),
        level,
        experience: 0,
        bounty: GameLogic.adjustBounty(this.calculateBounty(level, 'Marine')),
        type: 'Marine',
        stats: GameLogic.generateStats(
          level,
          allStyleCombat.find((st) => st.id == styleCombatId).name,
          potentialToHaveKngHaki,
        ),
        styleCombatId,
        devilFruitId: 0,
        potentialToHaveKngHaki: potentialToHaveKngHaki,
        position:
          i < Math.floor(this.config.totalMarines / this.config.avgCrewSize)
            ? 'Captain'
            : 'Crew Member',
        isPlayer: 0,
        createdAt: new Date(),
        defendingBase: 0,
        kindness: GameLogic.randomBetween(-20, 80), // Marines tendem a ser mais bondosos
        loyalty: GameLogic.randomBetween(0, 100),
      })
    }

    const marineIds = (await db.characters.bulkAdd(marines, { allKeys: true })) as number[]
    return marines.map((marine, index) => ({ ...marine, id: marineIds[index] }))
  }

  private async generateGovernment(): Promise<Character[]> {
    const government: Omit<Character, 'id'>[] = []
    const allStyleCombat = await db.styleCombats.toArray()

    for (let i = 0; i < this.config.totalGovernment; i++) {
      const level = GameLogic.generate(1, 100, 'weighted', 'medium')
      const styleCombatId =
        allStyleCombat[GameLogic.randomBetween(0, allStyleCombat.length - 1)].id || 0
      const potentialToHaveKngHaki = Math.random()

      government.push({
        name: NameGenerator.generateRandomName('Government'),
        level,
        experience: 0,
        bounty: GameLogic.adjustBounty(this.calculateBounty(level, 'Government')),
        type: 'Government',
        stats: GameLogic.generateStats(
          level,
          allStyleCombat.find((st) => st.id == styleCombatId).name,
          potentialToHaveKngHaki,
        ),
        styleCombatId,
        devilFruitId: 0,
        potentialToHaveKngHaki: potentialToHaveKngHaki,
        position: 'Crew Member',
        isPlayer: 0,
        createdAt: new Date(),
        defendingBase: 0,
        kindness: GameLogic.randomBetween(-50, 50), // Governo tende a ser menos bondoso
        loyalty: GameLogic.randomBetween(0, 100),
      })
    }

    const govIds = (await db.characters.bulkAdd(government, { allKeys: true })) as number[]
    return government.map((gov, index) => ({ ...gov, id: govIds[index] }))
  }

  private async generateCivillian(): Promise<Character[]> {
    const civillian: Omit<Character, 'id'>[] = []
    const allStyleCombat = await db.styleCombats.toArray()

    for (let i = 0; i < this.config.totalCivillians; i++) {
      const level = GameLogic.generate(1, 100, 'weighted', 'medium')
      const styleCombatId =
        allStyleCombat[GameLogic.randomBetween(0, allStyleCombat.length - 1)].id || 0
      const potentialToHaveKngHaki = Math.random()
      civillian.push({
        name: NameGenerator.generateRandomName('Civillian'),
        level,
        experience: 0,
        bounty: 0,
        type: 'Civillian',
        stats: GameLogic.generateStats(
          level,
          allStyleCombat.find((st) => st.id == styleCombatId).name,
          potentialToHaveKngHaki,
        ),
        styleCombatId,
        devilFruitId: 0,
        potentialToHaveKngHaki: potentialToHaveKngHaki,
        position: 'Crew Member',
        isPlayer: 0,
        createdAt: new Date(),
        defendingBase: 0,
        kindness: GameLogic.randomBetween(0, 100), // pessoas tendem a ser neutras
        loyalty: GameLogic.randomBetween(0, 100),
      })
    }

    const civIds = (await db.characters.bulkAdd(civillian, { allKeys: true })) as number[]
    return civillian.map((civ, index) => ({ ...civ, id: civIds[index] }))
  }

  private calculateBounty(level: number, type: string): number {
    let baseBounty = 0

    if (level >= 95) {
      baseBounty = GameLogic.randomBetween(2000000000, 5500000000) // 3B - 5.5B
    } else if (level >= 90) {
      baseBounty = GameLogic.randomBetween(1000000000, 2000000000) // 1B - 3B
    } else if (level >= 70) {
      baseBounty = GameLogic.randomBetween(400000000, 1200000000) // 500M - 1.2B
    } else if (level >= 50) {
      baseBounty = GameLogic.randomBetween(250000000, 400000000) // 300M - 700M
    } else if (level >= 40) {
      baseBounty = GameLogic.randomBetween(140000000, 250000000) // 150M - 400M
    } else if (level >= 30) {
      baseBounty = GameLogic.randomBetween(70000000, 175000000) // 80M - 200M
    } else if (level >= 15) {
      baseBounty = GameLogic.randomBetween(30000000, 80000000) // 40M - 100M
    } else if (level >= 10) {
      baseBounty = GameLogic.randomBetween(10000000, 30000000) // 20M - 50M
    } else if (level >= 5) {
      baseBounty = GameLogic.randomBetween(4000000, 12000000) // 10M - 30M
    } else if (level >= 4) {
      baseBounty = GameLogic.randomBetween(800000, 5000000) // 5M - 15M
    } else if (level >= 2) {
      baseBounty = GameLogic.randomBetween(100000, 1000000) // 1M - 8M
    } else {
      baseBounty = GameLogic.randomBetween(10000, 2000000) // 10K - 2M
    }

    return Math.floor(baseBounty)
  }

  private async organizeHierarchies(
    pirates: Character[],
    marines: Character[],
    government: Character[],
  ): Promise<void> {
    // Organizar piratas por bounty (mais forte = maior bounty)
    const sortedPirates = pirates.sort(
      (a, b) => GameLogic.calculatePower(b) - GameLogic.calculatePower(a),
    )
    const allIslands = await db.islands
      .toArray()
      .then((islands) => islands.sort((a, b) => a.difficulty - b.difficulty))
    console.log('allIslands', allIslands)
    var usedIsland = []
    // Yonkou (4 mais fortes)
    for (let i = 0; i < this.config.yonkouCount; i++) {
      const pirate = sortedPirates[i]
      var islandIndex = this.getHighestDifficultyIslandId()
      while (usedIsland.includes(islandIndex)) {
        islandIndex = this.getHighestDifficultyIslandId()
      }
      usedIsland.push(islandIndex)
      await db.yonkous.add({
        captainId: pirate.id!,
        baseIsland: allIslands[islandIndex].id,
        foundedAt: new Date(),
      })

      // Atualizar posição
      await db.characters.update(pirate.id!, { position: 'Captain' })
    }

    // Shichibukai (próximos 7 mais fortes)
    for (let i = 0; i < this.config.schichibukai; i++) {
      const pirate = sortedPirates.filter((item) => item.level <= this.config.shichibukaiMaxLevel)[
        i
      ]
      var islandIndex = this.getMidHighDifficultyIslandId()
      while (usedIsland.includes(islandIndex)) {
        islandIndex = this.getMidHighDifficultyIslandId()
      }
      usedIsland.push(islandIndex)
      await db.shichibukais.add({
        captainId: pirate.id!,
        baseIsland: allIslands[islandIndex].id,
        foundedAt: new Date(),
      })

      await db.characters.update(pirate.id!, { position: 'Captain' })
    }

    // Organizar marines por level
    const sortedMarines = marines.sort(
      (a, b) => GameLogic.calculatePower(b) - GameLogic.calculatePower(a),
    )

    // Admirais (3 mais fortes)
    for (let i = 0; i < this.config.admiralCount; i++) {
      const marine = sortedMarines[i]
      var islandIndex = this.getHighDifficultyIslandId()
      while (usedIsland.includes(islandIndex)) {
        islandIndex = this.getHighDifficultyIslandId()
      }
      usedIsland.push(islandIndex)
      const baseIslandId = allIslands[islandIndex].id

      await db.admirals.add({
        marineId: marine.id!,
        baseIsland: baseIslandId,
        foundedAt: new Date(),
      })

      await db.marineBases.add({
        captainId: marine.id!,
        baseIsland: baseIslandId,
        foundedAt: new Date(),
      })

      await db.characters.update(marine.id!, { position: 'Captain' })
    }

    // Organizar governo por level
    const sortedGovernment = government.sort(
      (a, b) => GameLogic.calculatePower(b) - GameLogic.calculatePower(a),
    )

    // Gorousei (5 mais fortes)
    for (let i = 0; i < this.config.gorouseiCount; i++) {
      const gov = sortedGovernment[i]
      var islandIndex = this.getHighDifficultyIslandId()
      while (usedIsland.includes(islandIndex)) {
        islandIndex = this.getHighDifficultyIslandId()
      }
      usedIsland.push(islandIndex)
      await db.gorouseis.add({
        govId: gov.id!,
        currentIsland: allIslands[islandIndex].id,
        foundedAt: new Date(),
      })

      await db.characters.update(gov.id!, { position: 'Captain' })
    }

    // Cypher Pol (próximos 90 mais fortes)
    for (
      let i = this.config.gorouseiCount;
      i < this.config.gorouseiCount + this.config.cypherPolCount;
      i++
    ) {
      const gov = sortedGovernment[i]
      await db.cypherPols.add({
        captainId: gov.id!,
        reputation: GameLogic.randomBetween(1000, 10000),
        currentIsland: allIslands[GameLogic.randomBetween(0, 119)].id,
        foundedAt: new Date(),
      })

      await db.characters.update(gov.id!, { position: 'Captain' })
    }
  }

  private async distributeDevilFruits(): Promise<void> {
    const allCharacters = await db.characters.toArray()
    const allDevilFruits = await db.devilFruits.toArray()
    const allCharactersFiltered = allCharacters.filter((char) => char.type != 'Civillian')

    // Calcular quantos personagens devem ter Devil Fruit
    const charactersWithDF = Math.floor(
      allDevilFruits.length * this.config.devilFruitDistributionRate,
    )
    const shuffledDF = this.shuffleArray([...allDevilFruits])

    // Selecionar personagens aleatoriamente
    const shuffledCharacters = this.shuffleArray([...allCharactersFiltered])
    const selectedCharacters = shuffledCharacters.slice(
      0,
      Math.min(charactersWithDF, allDevilFruits.length),
    )

    // Distribuir Devil Fruits
    for (let i = 0; i < selectedCharacters.length; i++) {
      const character = selectedCharacters[i]
      const devilFruit = shuffledDF[i]

      // Atualizar Devil Fruit owner
      await db.devilFruits.update(devilFruit.id!, { ownerId: character.id! })

      // Atualizar character com Devil Fruit
      const dfStats = Math.floor(
        GameLogic.randomBetween(character.level * 0.5, character.level * 2),
      ) // Stats de Devil Fruit
      await db.characters.update(character.id!, {
        devilFruitId: devilFruit.id!,
        stats: {
          ...character.stats,
          devilFruit: dfStats,
        },
      })
    }
  }

  private async createTerritories(): Promise<void> {
    console.log('🏴‍☠️ Criando territorios...')
    try {
      const allIslands = await db.islands.toArray()
      const allCrews = await db.crews.where('docked').equals(1).toArray()
      const allDevilFruits = await db.devilFruits.toArray()
      const allCharacters = await db.characters.toArray()
      const mapStrongestCrewByIsland = new Map<number, Crew | null>()

      allIslands.forEach((island) => {
        mapStrongestCrewByIsland.set(island.id, null)
      })

      allCrews.forEach((crew) => {
        if (mapStrongestCrewByIsland.has(crew.currentIsland)) {
          if (mapStrongestCrewByIsland.get(crew.currentIsland)) {
            const currentCrew = mapStrongestCrewByIsland.get(crew.currentIsland)
            const currentCrewPower = GameLogic.calculateCrewPower(
              allCharacters.filter((char) => char.crewId === currentCrew.id),
              allDevilFruits,
            )
            const thisCrewPower = GameLogic.calculateCrewPower(
              allCharacters.filter((char) => char.crewId === crew.id),
              allDevilFruits,
            )
            if (thisCrewPower > currentCrewPower) {
              mapStrongestCrewByIsland.set(crew.currentIsland, crew)
            }
          } else {
            mapStrongestCrewByIsland.set(crew.currentIsland, crew)
          }
        }
      })

      const territories = await this.generateTerritories(
        Array.from(mapStrongestCrewByIsland.values()).filter((c): c is Crew => c !== null),
      )
    } catch (error) {
      console.error('❌ Erro ao criar territórios:', error)
      throw error
    }
  }

  private async generateTerritories(crews: Crew[]): Promise<Territory[]> {
    const territory: Omit<Territory, 'id'>[] = []

    for (let i = 0; i < crews.length; i++) {
      const crew = crews[i]
      if (!crew || !crew.id || !crew.currentIsland) continue
      territory.push({
        islandId: crew.currentIsland,
        crewId: crew.id,
      })
    }
    const territoriesIds = (await db.territories.bulkAdd(territory, { allKeys: true })) as number[]
    return territory.map((civ, index) => ({ ...civ, id: territoriesIds[index] }))
  }

  private async createCrewsAndBases(): Promise<void> {
    console.log('🏴‍☠️ Criando tripulações e bases...')

    try {
      // Buscar todos os capitães e dados necessários
      const [
        pirateCaptains,
        marineCaptains,
        bountyHuntersCaptains,
        govCaptains,
        allIslands,
        allCharacters,
        yonkous,
        shichibukais,
        admirals,
        gorouseis,
      ] = await Promise.all([
        db.characters
          .where('type')
          .equals('Pirate')
          .and((char) => char.position === 'Captain' && char.isPlayer != 1)
          .toArray(),
        db.characters
          .where('type')
          .equals('Marine')
          .and((char) => char.position === 'Captain' && char.isPlayer != 1)
          .toArray(),
        db.characters
          .where('type')
          .equals('BountyHunter')
          .and((char) => char.position === 'Captain' && char.isPlayer != 1)
          .toArray(),
        db.characters
          .where('type')
          .equals('Government')
          .and((char) => char.position === 'Captain' && char.isPlayer != 1)
          .toArray(),
        db.islands.toArray(),
        db.characters.toArray(), // Buscar todos NPCs
        db.yonkous.toArray(),
        db.shichibukais.toArray(),
        db.admirals.toArray(),
        db.gorouseis.toArray(),
      ])

      console.log(
        `🎯 Encontrados ${pirateCaptains.length} capitães piratas, ${marineCaptains.length} capitães marines, ${bountyHuntersCaptains.length} capitães bounty hunters, ${govCaptains.length} capitães de agentes do governo`,
      )

      // Separar membros disponíveis por tipo (excluindo capitães e jogadores)
      const availableMembers = {
        Pirate: allCharacters.filter(
          (char) =>
            char.type === 'Pirate' &&
            char.position !== 'Captain' &&
            char.isPlayer !== 1 &&
            !char.crewId, // Não está em nenhum crew ainda
        ),
        Marine: allCharacters.filter(
          (char) =>
            char.type === 'Marine' &&
            char.position !== 'Captain' &&
            char.isPlayer !== 1 &&
            !char.crewId,
        ),
        BountyHunter: allCharacters.filter(
          (char) =>
            char.type === 'BountyHunter' &&
            char.position !== 'Captain' &&
            char.isPlayer !== 1 &&
            !char.crewId,
        ),
        Government: allCharacters.filter(
          (char) =>
            char.type === 'Government' &&
            char.position !== 'Captain' &&
            char.isPlayer !== 1 &&
            !char.crewId,
        ),
      }

      console.log(
        `👥 Membros disponíveis: ${availableMembers.Pirate.length} piratas, ${availableMembers.Marine.length} marines, ${availableMembers.BountyHunter.length} bounty hunters, ${availableMembers.Government.length} agentes do governo`,
      )

      // Função para criar crew e associar membros
      const createCrewWithMembers = async (
        captains: Character[],
        type: 'Pirate' | 'Marine' | 'BountyHunter' | 'Government',
      ) => {
        const islandDecider = (captain: Character): number => {
          const yonkou = yonkous.find((char) => char.captainId === captain.id)
          const shichibukai = shichibukais.find((char) => char.captainId === captain.id)
          const admiral = admirals.find((char) => char.marineId === captain.id)
          const gorousei = gorouseis.find((char) => char.govId === captain.id)

          if (yonkou) {
            return yonkou.baseIsland
          } else if (shichibukai) {
            return shichibukai.baseIsland
          } else if (admiral) {
            return admiral.baseIsland
          } else if (gorousei) {
            return gorousei.currentIsland
          } else {
            return this.selectIslandForCrew(captain, allIslands)
          }
        }

        // ✅ Helper para criar dados do crew
        const createCrewData = (captain: Character): Omit<Crew, 'id'> => ({
          name:
            type === 'Marine'
              ? CrewNameGenerator.generateMarineBaseName()
              : type === 'Pirate'
                ? CrewNameGenerator.generatePirateCrewName()
                : CrewNameGenerator.generateBountyHunterOrgName(),
          captainId: captain.id!,
          treasury:
            type === 'Marine' || type === 'Government'
              ? GameLogic.randomBetween(1000000, 50000000)
              : GameLogic.randomBetween(captain.bounty * 0.5, captain.bounty * 10),
          reputation:
            type === 'Marine' || type === 'Government'
              ? GameLogic.randomBetween(5000, 100000)
              : GameLogic.randomBetween(captain.bounty * 0.3, captain.bounty * 1.5),
          currentIsland: islandDecider(captain),
          docked: Math.random() < this.config.dockedFactor ? 1 : 0,
          foundedAt: new Date(),
          type,
        })

        // ✅ Identificar personagens sem crew do tipo específico
        const usedCharacterIds = new Set<number>()

        // Marcar capitães como usados
        captains.forEach((captain) => usedCharacterIds.add(captain.id!))

        // ✅ Criar crews para capitães principais
        const mainCrews = captains.map(createCrewData)
        const mainCrewIds = await db.crews.bulkAdd(mainCrews, { allKeys: true })

        // ✅ Preparar atualizações e associar membros
        const characterUpdates: Array<{ id: number; crewId: number }> = []

        // Adicionar capitães às atualizações
        captains.forEach((captain, index) => {
          characterUpdates.push({
            id: captain.id!,
            crewId: mainCrewIds[index] as number,
          })
        })

        // ✅ Associar membros aos crews (apenas NPCs)
        for (let i = 0; i < captains.length; i++) {
          const captain = captains[i]
          const crewId = mainCrewIds[i] as number

          if (captain.isPlayer !== 1) {
            // Buscar membros compatíveis
            const compatibleMembers = availableMembers[type].filter(
              (member) =>
                member.level <= captain.level &&
                member.id !== captain.id &&
                !usedCharacterIds.has(member.id!),
            )

            // ✅ Usar shipFactor corretamente
            const maxCrewSize = this.calculateCrewSize(captain.level)
            const selectedMembers = this.selectCrewMembers(
              compatibleMembers,
              maxCrewSize - 1,
              captain,
            )

            // Adicionar membros às atualizações e marcar como usados
            selectedMembers.forEach((member) => {
              characterUpdates.push({
                id: member.id!,
                crewId,
              })
              usedCharacterIds.add(member.id!)

              // Remover da lista disponível
              const memberIndex = availableMembers[type].findIndex((m) => m.id === member.id)
              if (memberIndex > -1) {
                availableMembers[type].splice(memberIndex, 1)
              }
            })

            //console.log(`⚓ ${captain.name} agora comanda ${selectedMembers.length} membros (max: ${maxCrewSize} - 1 [Ele mesmo])`)
          }
        }

        // ✅ Identificar personagens sem crew (mais eficiente)
        const charactersWithoutCrew = allCharacters.filter(
          (char) => char.type === type && char.isPlayer !== 1 && !usedCharacterIds.has(char.id!),
        )

        // ✅ Criar crews solo se necessário
        let soloCrewIds: unknown[] = []
        if (charactersWithoutCrew.length > 0) {
          const soloCrews = charactersWithoutCrew.map(createCrewData)
          soloCrewIds = await db.crews.bulkAdd(soloCrews, { allKeys: true })

          // Adicionar capitães solo às atualizações
          charactersWithoutCrew.forEach((captain, index) => {
            characterUpdates.push({
              id: captain.id!,
              crewId: soloCrewIds[index] as number,
            })
          })
        }

        // ✅ Aplicar todas as atualizações em uma operação
        await Promise.all(
          characterUpdates.map((update) =>
            db.characters.update(update.id, { crewId: update.crewId }),
          ),
        )

        // ✅ Calcular estatísticas
        const membersAssigned =
          characterUpdates.length - captains.length - charactersWithoutCrew.length
        const totalCrews = mainCrews.length + charactersWithoutCrew.length

        return {
          crewsCreated: totalCrews,
          membersAssigned: Math.max(0, membersAssigned),
        }
      }

      // Criar crews para cada tipo
      const [pirateResult, marineResult, bountyHunterResult, governmentResult] = await Promise.all([
        createCrewWithMembers(pirateCaptains, 'Pirate'),
        createCrewWithMembers(marineCaptains, 'Marine'),
        createCrewWithMembers(bountyHuntersCaptains, 'BountyHunter'),
        createCrewWithMembers(govCaptains, 'Government'),
      ])

      const totalCrews =
        pirateResult.crewsCreated + marineResult.crewsCreated + bountyHunterResult.crewsCreated
      const totalMembers =
        pirateResult.membersAssigned +
        marineResult.membersAssigned +
        bountyHunterResult.membersAssigned +
        governmentResult.membersAssigned

      console.log(`✅ ${totalCrews} tripulações/bases criadas com sucesso!`)
      console.log(
        `   - ${pirateResult.crewsCreated} tripulações piratas (${pirateResult.membersAssigned} membros)`,
      )
      console.log(
        `   - ${bountyHunterResult.crewsCreated} organizações bounty hunter (${bountyHunterResult.membersAssigned} membros)`,
      )
      console.log(
        `   - ${marineResult.crewsCreated} bases marines (${marineResult.membersAssigned} membros)`,
      )
      console.log(
        `   - ${governmentResult.crewsCreated} bases do governo (${governmentResult.membersAssigned} membros)`,
      )
      console.log(`👥 Total de ${totalMembers} membros associados às tripulações`)
    } catch (error) {
      console.error('❌ Erro ao criar tripulações e bases:', error)
      throw error
    }
  }

  // ✅ NOVO MÉTODO: GERAR NAVIOS PARA TODAS AS TRIPULAÇÕES
  private async generateShipsForAllCrews(): Promise<void> {
    console.log('🚢 Gerando navios para todas as tripulações...')

    try {
      // Buscar todas as tripulações
      const allCrews = await db.crews.toArray()
      const allCharacters = await db.characters.toArray()
      const allCaptains = []
      console.log(`🎯 Encontradas ${allCrews.length} tripulações para gerar navios`)

      // ✅ Map de capitães: O(1) lookup ao invés de O(n) find() em cada iteração
      const characterMap = new Map<number, Character>(
        allCharacters.map((char) => [char.id!, char])
      )

      const ships: Omit<Ship, 'id'>[] = []
      const captainsUpdate = []
      let shipsGenerated = 0
      let legendaryShips = 0

      for (const crew of allCrews) {
        try {
          // ✅ O(1) lookup via Map
          const captain = crew.captainId ? characterMap.get(crew.captainId) : undefined

          if (!captain) {
            console.warn(`⚠️ Capitão não encontrado para crew ${crew.id}`)
            continue
          }
          allCaptains.push(captain)

          // Determinar nível do navio baseado no capitão
          const shipLevel = GameLogic.determineShipLevel(captain.level)

          // Gerar nome do navio baseado no tipo da tripulação
          let shipName: string
          const isLegendary = this.shouldGenerateLegendaryShip(captain, crew)

          if (isLegendary) {
            shipName = ShipNameGenerator.generateLegendaryShipName()
            legendaryShips++
          } else {
            shipName = ShipNameGenerator.generateShipNameByCrewType(crew.type || 'Pirate')
          }

          // Determinar estado inicial baseado no nível
          const initialCondition = this.determineInitialShipCondition(shipLevel, isLegendary)

          // Criar objeto do navio
          const ship: Omit<Ship, 'id'> = {
            name: shipName,
            crewId: crew.id!,
            level: (isLegendary ? Math.max(4, shipLevel) : shipLevel) as 1 | 2 | 3 | 4 | 5, // Navios lendários têm nível mínimo 4
            needRepair: initialCondition.needRepair,
            destroyed: false, // Navios sempre começam não destruídos
          }

          ships.push(ship)
          shipsGenerated++

          if (shipsGenerated % 100 === 0) {
            console.log(`🚢 ${shipsGenerated} navios gerados...`)
          }
        } catch (error) {
          console.error(`❌ Erro ao gerar navio para crew ${crew.id}:`, error)
        }
      }

      await Promise.all(
          allCharacters.map((update) =>
            db.characters.update(update.id, { position: 'Crew Member' }),
          ),
        )

      await Promise.all(
          allCaptains.map((update) =>
            db.characters.update(update.id, { position: 'Captain' }),
          ),
        )

      // Inserir todos os navios no banco de dados
      if (ships.length > 0) {
        await db.ships.bulkAdd(ships)
        console.log(`✅ ${ships.length} navios gerados com sucesso!`)
        console.log(`   - ${ships.length - legendaryShips} navios normais`)
        console.log(`   - ${legendaryShips} navios lendários`)

        // Estatísticas por nível
        const levelStats = ships.reduce(
          (acc, ship) => {
            acc[ship.level] = (acc[ship.level] || 0) + 1
            return acc
          },
          {} as Record<number, number>,
        )

        console.log('📊 Distribuição por nível:')
        Object.entries(levelStats).forEach(([level, count]) => {
          const levelInfo = this.getShipLevelInfo(parseInt(level))
          console.log(`   - Level ${level} (${levelInfo.name}): ${count} navios`)
        })
      }
    } catch (error) {
      console.error('❌ Erro ao gerar navios para as tripulações:', error)
      throw error
    }
  }

  // 🌟 VERIFICAR SE DEVE GERAR NAVIO LENDÁRIO
  private shouldGenerateLegendaryShip(captain: Character, crew: Crew): boolean {
    // Critérios para navio lendário:
    // 1. Capitão de alto nível (80+)
    // 2. Yonkou, Shichibukai ou Admiral
    // 3. Chance aleatória muito baixa para outros

    if (captain.level >= 90) {
      return Math.random() < 0.4 // 40% chance para níveis 90+
    }

    if (captain.level >= 80) {
      return Math.random() < 0.2 // 20% chance para níveis 80+
    }

    if (captain.level >= 70) {
      return Math.random() < 0.05 // 5% chance para níveis 70+
    }

    // Chance muito baixa para outros
    return Math.random() < 0.01 // 1% chance geral
  }

  // 🔧 DETERMINAR CONDIÇÃO INICIAL DO NAVIO
  private determineInitialShipCondition(
    shipLevel: number,
    isLegendary: boolean,
  ): {
    needRepair: boolean
  } {
    if (isLegendary) {
      return { needRepair: false } // Navios lendários começam em perfeito estado
    }

    // Navios de nível mais alto têm menor chance de precisar de reparo inicial
    const repairChance = Math.max(0.05, 0.4 - shipLevel * 0.06)

    return {
      needRepair: Math.random() < repairChance,
    }
  }

  // 📋 INFORMAÇÕES SOBRE OS NÍVEIS DE NAVIO
  private getShipLevelInfo(level: number): {
    name: string
    description: string
    durability: number
    speed: number
  } {
    const levelInfo = {
      1: {
        name: 'Bote Simples',
        description: 'Um pequeno bote para navegação básica',
        durability: 100,
        speed: 50,
      },
      2: {
        name: 'Navio Mercante',
        description: 'Um navio robusto para viagens médias',
        durability: 200,
        speed: 75,
      },
      3: {
        name: 'Fragata de Guerra',
        description: 'Um navio de guerra bem equipado',
        durability: 350,
        speed: 100,
      },
      4: {
        name: 'Galeão Poderoso',
        description: 'Um grande navio com capacidades avançadas',
        durability: 500,
        speed: 125,
      },
      5: {
        name: 'Navio Lendário',
        description: 'Uma embarcação de poder incomparável',
        durability: 750,
        speed: 150,
      },
    }

    return levelInfo[level as keyof typeof levelInfo] || levelInfo[1]
  }

  // 🏝️ SELECIONAR ILHA PARA O CREW
  private selectIslandForCrew(captain: Character, islands: Island[]): number {
    // Mapeia level → dificuldade alvo (level 1 → 0.3, level 100 → 30)
    const targetDifficulty = captain.level / (100 / 30)

    // Tolerância apertada: ±0.5 — personagens ficam próximos ao tier correto
    // Isso evita que personagens de level alto apareçam em ilhas iniciais
    const suitableIslands = islands.filter((island) =>
      Math.abs(island.difficulty - targetDifficulty) <= 0.5
    )
    if (suitableIslands.length > 0) {
      return suitableIslands[GameLogic.randomBetween(0, suitableIslands.length - 1)]?.id || 1
    }

    // Fallback moderado: ±1.0
    const fallbackIslands = islands.filter((island) =>
      Math.abs(island.difficulty - targetDifficulty) <= 1.0
    )
    if (fallbackIslands.length > 0) {
      return fallbackIslands[GameLogic.randomBetween(0, fallbackIslands.length - 1)]?.id || 1
    }

    // Fallback final: ilha mais próxima disponível (nunca força island 1 para personagens fortes)
    const sorted = [...islands].sort(
      (a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty)
    )
    return sorted[0]?.id || 1
  }

  // 👥 CALCULAR TAMANHO DA TRIPULAÇÃO BASEADO NO LEVEL
  private calculateCrewSize(captainLevel: number): number {
    return GameLogic.determineShipLevel(captainLevel) * this.config.shipFactor
  }

  // 🎯 SELECIONAR MEMBROS DA TRIPULAÇÃO
  private selectCrewMembers(
    availableMembers: Character[],
    crewSize: number,
    captain: Character,
  ): Character[] {
    if (availableMembers.length === 0) return []

    // Ordenar membros por prioridade
    const prioritizedMembers = availableMembers.sort((a, b) => {
      let scoreA = 0
      let scoreB = 0

      // Priorizar levels próximos ao capitão (mas inferiores)
      const levelDiffA = captain.level - a.level
      const levelDiffB = captain.level - b.level

      if (levelDiffA >= 0 && levelDiffA <= 10) scoreA += 10 - levelDiffA
      if (levelDiffB >= 0 && levelDiffB <= 10) scoreB += 10 - levelDiffB

      // Priorizar posições importantes
      const importantPositions = ['First Mate', 'Navigator', 'Cook', 'Doctor', 'Sniper']
      if (importantPositions.includes(a.position)) scoreA += 5
      if (importantPositions.includes(b.position)) scoreB += 5

      // Priorizar stats altos
      const powerA = this.calculateCharacterPower(a)
      const powerB = this.calculateCharacterPower(b)
      scoreA += Math.floor(powerA / 1000)
      scoreB += Math.floor(powerB / 1000)

      return scoreB - scoreA
    })

    // Selecionar os melhores membros disponíveis
    const selectedMembers: Character[] = []
    const positionsUsed = new Set<string>()

    for (const member of prioritizedMembers) {
      if (selectedMembers.length >= crewSize) break

      // Evitar posições duplicadas importantes
      const importantPositions = ['First Mate', 'Navigator', 'Cook', 'Doctor', 'Sniper']
      if (importantPositions.includes(member.position) && positionsUsed.has(member.position)) {
        continue
      }

      selectedMembers.push(member)
      positionsUsed.add(member.position)
    }

    // Se ainda precisar de mais membros, pegar qualquer um restante
    if (selectedMembers.length < crewSize) {
      const remainingMembers = prioritizedMembers.filter((m) => !selectedMembers.includes(m))
      const additionalMembers = remainingMembers.slice(0, crewSize - selectedMembers.length)
      selectedMembers.push(...additionalMembers)
    }

    return selectedMembers
  }

  // ⚡ CALCULAR PODER DO PERSONAGEM (SIMPLIFICADO)
  private calculateCharacterPower(character: Character): number {
    const stats = character.stats
    return (
      stats.attack +
      stats.defense +
      stats.speed +
      stats.armHaki +
      stats.obsHaki +
      stats.kingHaki +
      stats.devilFruit
    )
  }

  private async distributeCharactersOnIslands(): Promise<void> {
    const allCharacters = await db.characters.toArray()
    const allIslands = await db.islands.toArray()

    // ✅ Map de ilhas para lookup O(1) (antes era find() O(n) dentro do loop)
    const islandMap = new Map<number, Island>(
      allIslands.map((island) => [island.id!, { ...island, npcs: [...(island.npcs || [])] }])
    )

    // ✅ Acumular mudanças em memória — zero writes intermediários no DB
    for (const character of allCharacters) {
      let targetIslandId: number

      if (character.level >= 90) {
        targetIslandId = this.getIslandByDifficultyRange(25, 30)
      } else if (character.level >= 70) {
        targetIslandId = this.getIslandByDifficultyRange(20, 29)
      } else if (character.level >= 50) {
        targetIslandId = this.getIslandByDifficultyRange(15, 24)
      } else if (character.level >= 30) {
        targetIslandId = this.getIslandByDifficultyRange(10, 19)
      } else {
        targetIslandId = this.getIslandByDifficultyRange(1, 14)
      }

      const island = islandMap.get(targetIslandId)
      if (island) {
        island.npcs!.push(character.id!)
      }
    }

    // ✅ Um único bulkPut ao invés de N updates individuais
    await db.islands.bulkPut([...islandMap.values()])
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  private getHighDifficultyIslandId(): number {
    return this.getIslandByDifficultyRange(25, 30)
  }

  private getMidHighDifficultyIslandId(): number {
    return this.getIslandByDifficultyRange(15, 25)
  }

  private getHighestDifficultyIslandId(): number {
    return this.getIslandByDifficultyRange(29, 30)
  }

  private getIslandByDifficultyRange(minDiff: number, maxDiff: number): number {
    // Retorna um ID de ilha aleatório dentro do range de dificuldade
    const difficultyRange = maxDiff - minDiff + 1
    const selectedDifficulty = minDiff + Math.floor(Math.random() * difficultyRange)
    const islandIndex = (selectedDifficulty - 1) * 4 + Math.floor(Math.random() * 4)
    return islandIndex
  }

  // ✅ MÉTODO PÚBLICO PARA GERAR NAVIO PARA TRIPULAÇÃO ESPECÍFICA
  public async generateShipForSpecificCrew(crewId: number): Promise<Ship | null> {
    try {
      // Verificar se a tripulação já tem um navio
      const existingShip = await db.ships.where('crewId').equals(crewId).first()
      if (existingShip) {
        console.log(`⚠️ Tripulação ${crewId} já possui um navio: ${existingShip.name}`)
        return existingShip
      }

      // Buscar dados da tripulação
      const crew = await db.crews.get(crewId)
      if (!crew) {
        console.error(`❌ Tripulação ${crewId} não encontrada`)
        return null
      }

      // Buscar capitão
      const captain = await db.characters.get(crew.captainId)
      if (!captain) {
        console.error(`❌ Capitão da tripulação ${crewId} não encontrado`)
        return null
      }

      // Gerar navio
      const shipLevel = GameLogic.determineShipLevel(captain.level)
      const isLegendary = this.shouldGenerateLegendaryShip(captain, crew)

      let shipName: string
      if (isLegendary) {
        shipName = ShipNameGenerator.generateLegendaryShipName()
      } else {
        shipName = ShipNameGenerator.generateShipNameByCrewType(crew.type || 'Pirate')
      }

      const initialCondition = this.determineInitialShipCondition(shipLevel, isLegendary)

      const ship: Omit<Ship, 'id'> = {
        name: shipName,
        crewId: crewId,
        level: (isLegendary ? Math.max(4, shipLevel) : shipLevel) as 1 | 2 | 3 | 4 | 5,
        needRepair: initialCondition.needRepair,
        destroyed: false,
      }

      const shipId = await db.ships.add(ship)

      console.log(`🚢 Navio gerado para tripulação ${crewId}: "${shipName}" (Level ${ship.level})`)

      return {
        ...ship,
        id: shipId,
      } as Ship
    } catch (error) {
      console.error(`❌ Erro ao gerar navio para tripulação ${crewId}:`, error)
      return null
    }
  }

  // ── Sistema de Itens ────────────────────────────────────────────────────────

  private async generateItems(): Promise<void> {
    // Mapear IDs hardcoded (posição 1-based) para IDs reais no banco.
    // Os estilos são inseridos em ordem pelo generateStyleCombats(),
    // então o estilo de índice 0 tem ID real = styles[0].id, etc.
    const styles = await db.styleCombats.orderBy('id').toArray()
    // hardcodedIndex → realId  (hardcoded usa 1-based: id=1 → styles[0])
    const styleIdMap = new Map<number, number>()
    styles.forEach((s, i) => { styleIdMap.set(i + 1, s.id!) })

    const remap = (ids?: number[]): number[] | undefined => {
      if (!ids?.length) return ids
      return ids.map(id => styleIdMap.get(id) ?? id)
    }

    const allConcepts = [
      ...EQUIPMENT_CONCEPTS.map(e => ({
        ...e,
        createdAt: new Date(),
        requirements: {
          ...e.requirements,
          styleCombatId: remap(e.requirements?.styleCombatId),
        },
      })),
      ...LEGENDARY_WEAPONS.map(w => ({
        ...w,
        createdAt: new Date(),
        requirements: {
          ...w.requirements,
          styleCombatId: remap(w.requirements?.styleCombatId),
        },
      })),
    ]
    await db.items.bulkAdd(allConcepts as any)
    console.log(`🗡️ ${allConcepts.length} itens inseridos no banco.`)
  }

  private async distributeUniqueItems(): Promise<void> {
    const uniqueItems = await db.items.filter(item => item.unique === true).toArray()
    if (uniqueItems.length === 0) return

    // Buscar personagens de alto nível (não civis) ordenados por poder
    const highLevelChars = (await db.characters.toArray())
      .filter(c => c.type !== 'Civillian' && c.isPlayer === 0)
      .sort((a, b) => b.level - a.level)

    const sClass = uniqueItems.filter(i => i.class === 'S')
    const aClass = uniqueItems.filter(i => i.class === 'A')
    const bClass = uniqueItems.filter(i => i.class === 'B')

    // Itens S → personagens mais poderosos (um item por personagem, garante todos distribuídos)
    const topForS = highLevelChars.slice(0, sClass.length)
    for (let i = 0; i < Math.min(sClass.length, topForS.length); i++) {
      const char = topForS[i]
      if (!char.crewId) continue
      await db.inventories.add({
        crewId: char.crewId,
        itemId: sClass[i].id!,
        acquiredAt: new Date(),
      })
    }

    // Itens A → personagens logo abaixo dos que receberam S
    const aStart = sClass.length
    const topForA = this.shuffleArray([...highLevelChars.slice(aStart, aStart + aClass.length + 5)])
    for (let i = 0; i < Math.min(aClass.length, topForA.length); i++) {
      const char = topForA[i]
      if (!char.crewId) continue
      await db.inventories.add({
        crewId: char.crewId,
        itemId: aClass[i].id!,
        acquiredAt: new Date(),
      })
    }

    // Itens B únicos → personagens de nível intermediário
    const bStart = aStart + aClass.length + 5
    const topForB = this.shuffleArray([...highLevelChars.slice(bStart, bStart + bClass.length + 10)])
    for (let i = 0; i < Math.min(bClass.length, topForB.length); i++) {
      const char = topForB[i]
      if (!char.crewId) continue
      await db.inventories.add({
        crewId: char.crewId,
        itemId: bClass[i].id!,
        acquiredAt: new Date(),
      })
    }

    console.log(`🏆 ${uniqueItems.length} itens únicos distribuídos.`)
  }

  // Distribui 1-3 itens comuns (C/D/E/F) para NPCs com base no nível do personagem
  private async distributeCommonItems(): Promise<void> {
    const commonItems = await db.items.filter((item) => item.unique === false).toArray()
    if (commonItems.length === 0) return

    // Separar itens por classe
    const byClass: Record<string, typeof commonItems> = {}
    for (const item of commonItems) {
      if (!byClass[item.class]) byClass[item.class] = []
      byClass[item.class].push(item)
    }

    // Classe de item para cada faixa de nível
    const classForLevel = (level: number): string => {
      if (level >= 81) return 'C'
      if (level >= 61) return 'D'
      if (level >= 41) return 'E'
      if (level >= 21) return 'F'
      return 'F'
    }

    const npcs = (await db.characters.toArray()).filter(
      (c) => c.type !== 'Civillian' && c.isPlayer === 0 && c.crewId,
    )

    const inventoryEntries: { crewId: number; itemId: number; acquiredAt: Date }[] = []

    for (const char of npcs) {
      const cls = classForLevel(char.level)
      const pool = byClass[cls] ?? byClass['F'] ?? []
      if (pool.length === 0) continue

      const count = Math.floor(Math.random() * 2) + 1 // 1 ou 2 itens por NPC
      const shuffled = this.shuffleArray([...pool])
      for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        inventoryEntries.push({
          crewId: char.crewId!,
          itemId: shuffled[i].id!,
          acquiredAt: new Date(),
        })
      }
    }

    if (inventoryEntries.length > 0) {
      await db.inventories.bulkAdd(inventoryEntries as any)
    }
    console.log(`🎒 ${inventoryEntries.length} itens comuns distribuídos para ${npcs.length} NPCs.`)
  }

  private async populateIslandStores(): Promise<void> {
    const islands = await db.islands.toArray()
    const allItems = await db.items.filter(item => item.unique === false).toArray()

    // Mapeamento de dificuldade → classes permitidas
    const classesForDifficulty = (difficulty: number): string[] => {
      if (difficulty <= 5)  return ['F', 'E']
      if (difficulty <= 10) return ['E', 'D']
      if (difficulty <= 15) return ['D', 'C']
      if (difficulty <= 20) return ['C', 'B']
      return ['B', 'A']
    }

    // Preço base por classe (calibrado com economia real: bounty min = level × 1.000 Berry)
    const basePrice: Record<string, number> = {
      F: 6_000_000, E: 30_000_000, D: 120_000_000,
      C: 450_000_000, B: 1_500_000_000, A: 4_500_000_000,
    }

    const calcPrice = (item: { class: string; rarity: number }): number => {
      const bp = basePrice[item.class] ?? 5_000
      return Math.round(bp * (0.5 + item.rarity))
    }

    const storeEntries: { currentIslandId: number; itemId: number; price: number }[] = []

    for (const island of islands) {
      const allowedClasses = classesForDifficulty(island.difficulty)
      const eligible = allItems.filter(item => allowedClasses.includes(item.class))
      const shuffled = this.shuffleArray([...eligible])
      const count = GameLogic.randomBetween(12, 18)
      const selected = shuffled.slice(0, Math.min(count, shuffled.length))

      for (const item of selected) {
        storeEntries.push({
          currentIslandId: island.id!,
          itemId: item.id!,
          price: calcPrice(item),
        })
      }
    }

    await db.stores.bulkAdd(storeEntries)
    console.log(`🏪 ${storeEntries.length} entradas de loja criadas para ${islands.length} ilhas.`)
  }
}
