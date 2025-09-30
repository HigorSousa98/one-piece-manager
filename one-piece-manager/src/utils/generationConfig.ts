// src/utils/generationConfig.ts

export interface GenerationSettings {
  totalPirates: number
  totalMarines: number
  totalGovernment: number
  totalBountyHunter: number
  totalCivillians: number
  devilFruitDistributionRate: number // Porcentagem (0.0 - 1.0)
  yonkouCount: number
  schichibukai: number
  admiralCount: number
  gorouseiCount: number
  cypherPolCount: number
  totalIslands: number
  difficultyLevels: number
  islandsPerLevel: number
  avgCrewSize: number
  styleCombatCount: number
  maxLevel: number
  minBounty: number
  maxBounty: number
  shipFactor: number
  lastCombats: number
  allowKingHakiFor: number
  dockedFactor: number
  devilFruitDropRate: number
  civillianRecruitmentChance: number
}

export class GenerationConfig {
  
  // 🎯 CONFIGURAÇÕES PADRÃO
  private static readonly DEFAULT_CONFIG: GenerationSettings = {
    totalPirates: 1000,
    totalMarines: 1000,
    totalGovernment: 300,
    totalBountyHunter: 500,
    totalCivillians: 2000,
    devilFruitDistributionRate: 0.002, // 0.2%
    yonkouCount: 4,
    schichibukai: 7,
    admiralCount: 3,
    gorouseiCount: 5,
    cypherPolCount: 90,
    totalIslands: 120,
    difficultyLevels: 30,
    islandsPerLevel: 4,
    avgCrewSize: 10,
    styleCombatCount: 50,
    maxLevel: 100,
    minBounty: 1000,
    maxBounty: 7000000000,
    shipFactor: 3,
    lastCombats: 7,
    allowKingHakiFor: 0.7,
    dockedFactor: 0.7,
    devilFruitDropRate: 0.05,
    civillianRecruitmentChance: 0.3
  }

  // 🎮 CONFIGURAÇÕES PREDEFINIDAS
  private static readonly PRESETS = {
    // Configuração pequena para testes
    SMALL: {
      ...GenerationConfig.DEFAULT_CONFIG,
      totalPirates: 100,
      totalMarines: 100,
      totalGovernment: 30,
      totalBountyHunter: 50,
      totalCivillians: 20,
      totalIslands: 20,
      difficultyLevels: 10,
      islandsPerLevel: 2,
      avgCrewSize: 5,
      styleCombatCount: 15,
      shipFactor: 3,
      lastCombats: 3,
      allowKingHakiFor: 0.5,
      dockedFactor: 0.5,
      devilFruitDropRate: 0.05,
      civillianRecruitmentChance: 0.3
    } as GenerationSettings,

    // Configuração média
    MEDIUM: {
      ...GenerationConfig.DEFAULT_CONFIG,
      totalPirates: 500,
      totalMarines: 500,
      totalGovernment: 150,
      totalBountyHunter: 250,
      totalCivillians: 100,
      totalIslands: 60,
      difficultyLevels: 20,
      islandsPerLevel: 3,
      avgCrewSize: 7,
      styleCombatCount: 30,
      shipFactor: 3,
      lastCombats: 5,
      allowKingHakiFor: 0.6,
      dockedFactor: 0.6,
      devilFruitDropRate: 0.05,
      civillianRecruitmentChance: 0.3
    } as GenerationSettings,

    // Configuração grande (padrão)
    LARGE: GenerationConfig.DEFAULT_CONFIG,

    // Configuração épica para mundo completo
    EPIC: {
      ...GenerationConfig.DEFAULT_CONFIG,
      totalPirates: 8000,
      totalMarines: 8000,
      totalGovernment: 2000,
      totalBountyHunter: 4000,
      totalCivillians: 6000,
      totalIslands: 200,
      difficultyLevels: 30,
      islandsPerLevel: 4,
      avgCrewSize: 10,
      styleCombatCount: 100,
      shipFactor: 3,
      lastCombats: 10,
      allowKingHakiFor: 0.9,
      dockedFactor: 0.8,
      devilFruitDropRate: 0.50,
      civillianRecruitmentChance: 1
    } as GenerationSettings
  }

  private config: GenerationSettings

  // 🏗️ CONSTRUTOR
  constructor(preset: keyof typeof GenerationConfig.PRESETS = 'LARGE', customOverrides?: Partial<GenerationSettings>) {
    this.config = { ...GenerationConfig.PRESETS[preset] }
    
    // Aplicar overrides personalizados se fornecidos
    if (customOverrides) {
      this.config = { ...this.config, ...customOverrides }
    }

    // Validar configuração
    this.validateConfig()
  }

  // 🔍 GETTERS PARA ACESSAR CONFIGURAÇÕES
  get totalPirates(): number { return this.config.totalPirates }
  get totalMarines(): number { return this.config.totalMarines }
  get totalGovernment(): number { return this.config.totalGovernment }
  get totalBountyHunter(): number { return this.config.totalBountyHunter }
  get totalCivillians(): number { return this.config.totalCivillians }
  get devilFruitDistributionRate(): number { return this.config.devilFruitDistributionRate }
  get yonkouCount(): number { return this.config.yonkouCount }
  get schichibukai(): number { return this.config.schichibukai }
  get admiralCount(): number { return this.config.admiralCount }
  get gorouseiCount(): number { return this.config.gorouseiCount }
  get cypherPolCount(): number { return this.config.cypherPolCount }
  get totalIslands(): number { return this.config.totalIslands }
  get difficultyLevels(): number { return this.config.difficultyLevels }
  get islandsPerLevel(): number { return this.config.islandsPerLevel }
  get avgCrewSize(): number { return this.config.avgCrewSize }
  get styleCombatCount(): number { return this.config.styleCombatCount }
  get maxLevel(): number { return this.config.maxLevel }
  get minBounty(): number { return this.config.minBounty }
  get maxBounty(): number { return this.config.maxBounty }
  get shipFactor(): number { return this.config.shipFactor }
  get lastCombats(): number { return this.config.lastCombats }
  get allowKingHakiFor(): number { return this.config.allowKingHakiFor }
  get dockedFactor(): number { return this.config.dockedFactor }
  get devilFruitDropRate(): number { return this.config.devilFruitDropRate }
  get civillianRecruitmentChance(): number { return this.config.civillianRecruitmentChance }

  // 📊 GETTERS CALCULADOS
  get totalCharacters(): number {
    return this.totalPirates + this.totalMarines + this.totalGovernment + 
           this.totalBountyHunter + this.totalCivillians
  }

  get totalCaptains(): number {
    // Estimar número de capitães baseado no tamanho médio dos crews
    return Math.floor(this.totalCharacters / this.avgCrewSize)
  }

  get charactersWithDevilFruit(): number {
    return Math.floor(this.totalCharacters * this.devilFruitDistributionRate)
  }

  get totalSpecialPositions(): number {
    return this.yonkouCount + this.schichibukai + this.admiralCount + 
           this.gorouseiCount + this.cypherPolCount
  }

  // 📈 DISTRIBUIÇÃO POR TIPO
  get characterDistribution(): Record<string, number> {
    return {
      Pirate: this.totalPirates,
      Marine: this.totalMarines,
      Government: this.totalGovernment,
      BountyHunter: this.totalBountyHunter,
      Civillian: this.totalCivillians
    }
  }

  // 🏝️ CONFIGURAÇÕES DE ILHAS
  get islandConfiguration(): {
    totalIslands: number
    difficultyLevels: number
    islandsPerLevel: number
    calculatedIslands: number
  } {
    return {
      totalIslands: this.totalIslands,
      difficultyLevels: this.difficultyLevels,
      islandsPerLevel: this.islandsPerLevel,
      calculatedIslands: this.difficultyLevels * this.islandsPerLevel
    }
  }

  // ⚔️ CONFIGURAÇÕES DE COMBATE
  get combatConfiguration(): {
    styleCombatCount: number
    distributionRate: number
    charactersWithFruit: number
  } {
    return {
      styleCombatCount: this.styleCombatCount,
      distributionRate: this.devilFruitDistributionRate,
      charactersWithFruit: this.charactersWithDevilFruit
    }
  }

  // 🔧 MÉTODOS DE CONFIGURAÇÃO
  updateConfig(updates: Partial<GenerationSettings>): void {
    this.config = { ...this.config, ...updates }
    this.validateConfig()
  }

  resetToPreset(preset: keyof typeof GenerationConfig.PRESETS): void {
    this.config = { ...GenerationConfig.PRESETS[preset] }
    this.validateConfig()
  }

  getFullConfig(): GenerationSettings {
    return { ...this.config }
  }

  // ✅ VALIDAÇÃO DE CONFIGURAÇÃO
  private validateConfig(): void {
    const errors: string[] = []

    // Validações básicas
    if (this.totalCharacters <= 0) {
      errors.push('Total de personagens deve ser maior que 0')
    }

    if (this.devilFruitDistributionRate < 0 || this.devilFruitDistributionRate > 1) {
      errors.push('Taxa de distribuição de Devil Fruits deve estar entre 0 e 1')
    }

    if (this.totalSpecialPositions > this.totalCharacters) {
      errors.push('Posições especiais não podem exceder o total de personagens')
    }

    if (this.avgCrewSize <= 0) {
      errors.push('Tamanho médio de crew deve ser maior que 0')
    }

    if (this.maxLevel <= 0 || this.maxLevel > 200) {
      errors.push('Level máximo deve estar entre 1 e 200')
    }

    if (this.minBounty >= this.maxBounty) {
      errors.push('Bounty mínimo deve ser menor que bounty máximo')
    }

    // Validações de ilhas
    const calculatedIslands = this.difficultyLevels * this.islandsPerLevel
    if (calculatedIslands !== this.totalIslands) {
      console.warn(`⚠️ Aviso: Total de ilhas (${this.totalIslands}) não coincide com cálculo (${calculatedIslands})`)
    }

    if (errors.length > 0) {
      throw new Error(`Configuração inválida:\n${errors.join('\n')}`)
    }
  }

  // 📊 RELATÓRIO DE CONFIGURAÇÃO
  generateReport(): string {
    return `
🎮 CONFIGURAÇÃO DE GERAÇÃO DE DADOS
=====================================

👥 PERSONAGENS:
   • Total: ${this.totalCharacters.toLocaleString()}
   • Piratas: ${this.totalPirates.toLocaleString()}
   • Marines: ${this.totalMarines.toLocaleString()}
   • Governo: ${this.totalGovernment.toLocaleString()}
   • Bounty Hunters: ${this.totalBountyHunter.toLocaleString()}
   • Civis: ${this.totalCivillians.toLocaleString()}

🏴‍☠️ POSIÇÕES ESPECIAIS:
   • Yonkous: ${this.yonkouCount}
   • Shichibukai: ${this.schichibukai}
   • Almirantes: ${this.admiralCount}
   • Gorosei: ${this.gorouseiCount}
   • Cypher Pol: ${this.cypherPolCount}

🍎 DEVIL FRUITS:
   • Taxa de Distribuição: ${(this.devilFruitDistributionRate * 100).toFixed(1)}%
   • Personagens com DF: ${this.charactersWithDevilFruit}

🏝️ ILHAS:
   • Total: ${this.totalIslands}
   • Níveis de Dificuldade: ${this.difficultyLevels}
   • Ilhas por Nível: ${this.islandsPerLevel}

⚔️ COMBATE:
   • Estilos de Combate: ${this.styleCombatCount}
   • Level Máximo: ${this.maxLevel}
   • Bounty: ${this.minBounty.toLocaleString()} - ${this.maxBounty.toLocaleString()}

👥 CREWS:
   • Tamanho Médio: ${this.avgCrewSize}
   • Capitães Estimados: ${this.totalCaptains}
`
  }

  // 🎯 MÉTODOS ESTÁTICOS PARA CRIAÇÃO RÁPIDA
  static createSmall(overrides?: Partial<GenerationSettings>): GenerationConfig {
    return new GenerationConfig('SMALL', overrides)
  }

  static createMedium(overrides?: Partial<GenerationSettings>): GenerationConfig {
    return new GenerationConfig('MEDIUM', overrides)
  }

  static createLarge(overrides?: Partial<GenerationSettings>): GenerationConfig {
    return new GenerationConfig('LARGE', overrides)
  }

  static createEpic(overrides?: Partial<GenerationSettings>): GenerationConfig {
    return new GenerationConfig('EPIC', overrides)
  }

  static createCustom(config: Partial<GenerationSettings>): GenerationConfig {
    return new GenerationConfig('LARGE', config)
  }
}