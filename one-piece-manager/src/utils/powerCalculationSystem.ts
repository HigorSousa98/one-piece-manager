// src/utils/powerCalculationSystem.ts

import type { Character, DevilFruit } from './database'

// ✅ CONFIGURAÇÕES CENTRALIZADAS ATUALIZADAS
export const POWER_CONFIG = {
  // Pesos dos atributos físicos (rebalanceados)
  physical: {
    attack: 3.5, // Reduzido de 4.0
    defense: 2.2, // Reduzido de 2.5
    speed: 2.8, // Reduzido de 3.0
  },

  // Novos atributos mentais
  mental: {
    intelligence: 2.0, // Novo
    skill: 2.5, // Novo
  },

  // Sistema de Haki (mantido)
  haki: {
    armament: {
      baseMultiplier: 1.5,
      synergyRate: 0.05,
      intelligenceSynergy: 0.02,
      skillSynergy: 0.02, // Nova sinergia com inteligência
    },
    observation: {
      baseMultiplier: 1,
      synergyRate: 0.03,
      intelligenceSynergy: 0.04, // Nova sinergia com inteligência
    },
    conqueror: {
      baseBonus: 8,
      levelMultiplier: 0.2,
      masterThreshold: 150,
      masterBonus: 0.3,
      intelligenceBonus: 0.01, // Bonus baseado em inteligência
    },
  },

  // Sistema de Devil Fruit (expandido)
  devilFruit: {
    basePowerPerLevel: 5.0,
    rarityMultiplier: 0.5,
    typeMultipliers: {
      Logia: 1.2,
      Zoan: 1.1,
      Paramecia: 1.1,
    },
    zoanPhysicalBonus: 0.05,
    parameciaIntelligenceBonus: 0.05,
    logiaSkillBonus: 0.05,
    awakeningMultiplier: 1.35,
    awakeningThreshold: 1,
    // Novos bonus baseados em inteligência e skill
    intelligenceBonus: 0.03, // Inteligência ajuda no controle da fruta
    skillBonus: 0.04, // Skill melhora a eficiência
  },

  // Sistema de Level (mantido)
  level: {
    basePowerPerLevel: 15,
    multiplierPerLevel: 0.0,
    veteranThreshold: 50,
    veteranBonusPerLevel: 25,
  },

  // Sistema de Especialização (expandido)
  specialization: {
    thresholdMultiplier: 1.2,
    bonusMultiplier: 0.4,
    mentalSpecializationBonus: 1.05, // Bonus extra para especialização mental
  },

  // Sistema de Sinergia (expandido)
  synergy: {
    hakiPhysical: 1.5,
    observationSpeed: 1.2,
    devilFruitHaki: 2.0,
    // Novas sinergias
    intelligenceSkill: 1.8, // Inteligência + Skill
    skillPhysical: 1.3, // Skill + Atributos físicos
    intelligenceHaki: 1.6, // Inteligência + Haki
    tacticalCombat: 2.2, // Intelligence + Skill + qualquer Haki
  },

  // Outros fatores (mantidos)
  kindnessInfluence: 0.001,
  bountyLogBase: 2,
} as const

// ✅ INTERFACES ATUALIZADAS
export interface PowerBreakdown {
  physical: number
  mental: number // Novo componente
  haki: number
  devilFruit: number
  level: number
  specialization: number
  synergy: number
  multipliers: {
    conqueror: number
    devilFruit: number
    level: number
    unpredictability: number
  }
  bountyInfluence: number
  total: number
}

export interface PowerAnalysis {
  power: number
  breakdown: PowerBreakdown
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  combatStyle: string // Novo: estilo de combate baseado nos stats
}

export class PowerCalculationSystem {
  // ✅ MÉTODO PRINCIPAL (mantido)
  static calculatePower(character: Character, fruit: DevilFruit | null = null): number {
    const breakdown = this.calculatePowerBreakdown(character, fruit)
    return breakdown.total
  }

  // ✅ CÁLCULO DETALHADO ATUALIZADO
  static calculatePowerBreakdown(
    character: Character,
    fruit: DevilFruit | null = null,
  ): PowerBreakdown {
    const stats = character.stats

    // Calcular cada componente
    const physical = this.calculatePhysicalPower(stats)
    const mental = this.calculateMentalPower(stats) // Novo
    const haki = this.calculateHakiPower(stats)
    const devilFruit = this.calculateDevilFruitPower(stats, fruit, character.level)
    const level = this.calculateLevelPower(character.level)
    const specialization = this.calculateSpecializationBonus(stats)
    const synergy = this.calculateSynergyBonus(stats)

    // Calcular multiplicadores
    const multipliers = this.calculateMultipliers(stats, fruit, character)

    // Calcular influência do bounty
    const bountyInfluence = this.calculateBountyInfluence(character.bounty)

    // Somar componentes base
    let basePower = physical + mental + haki + devilFruit + level + specialization + synergy

    // Aplicar multiplicadores
    let totalPower = basePower
    totalPower *= multipliers.conqueror
    totalPower *= multipliers.devilFruit
    totalPower *= multipliers.level
    totalPower *= multipliers.unpredictability

    // Adicionar influência do bounty
    totalPower += bountyInfluence

    return {
      physical,
      mental,
      haki,
      devilFruit,
      level,
      specialization,
      synergy,
      multipliers,
      bountyInfluence,
      total: Math.max(1, Math.ceil(totalPower)),
    }
  }

  // ✅ ANÁLISE COMPLETA DO PODER
  static analyzePower(character: Character, fruit: DevilFruit | null = null): PowerAnalysis {
    const breakdown = this.calculatePowerBreakdown(character, fruit)
    const analysis = this.generatePowerAnalysis(breakdown, character, fruit)

    return {
      power: breakdown.total,
      breakdown,
      ...analysis,
    }
  }

  // ✅ COMPONENTES INDIVIDUAIS ATUALIZADOS
  private static calculatePhysicalPower(stats: Character['stats']): number {
    const { attack, defense, speed } = stats
    const config = POWER_CONFIG.physical

    return attack * config.attack + defense * config.defense + speed * config.speed
  }

  // ✅ NOVO: CÁLCULO DO PODER MENTAL
  private static calculateMentalPower(stats: Character['stats']): number {
    const { intelligence, skill } = stats
    const config = POWER_CONFIG.mental

    let mentalPower = intelligence * config.intelligence + skill * config.skill

    return mentalPower
  }

  // ✅ HAKI POWER ATUALIZADO COM SINERGIAS MENTAIS
  private static calculateHakiPower(stats: Character['stats']): number {
    const { attack, defense, speed, armHaki, obsHaki, kingHaki, intelligence, skill } = stats
    let hakiPower = 0

    // Armament Haki
    if (armHaki > 0) {
      const config = POWER_CONFIG.haki.armament
      const armamentBonus = armHaki * config.baseMultiplier
      const armamentSynergy = (attack + defense) * (armHaki * config.synergyRate)
      const skillSynergy = skill * (armHaki * config.skillSynergy)
      hakiPower += armamentBonus + armamentSynergy + skillSynergy
    }

    // Observation Haki
    if (obsHaki > 0) {
      const config = POWER_CONFIG.haki.observation
      const observationBonus = obsHaki * config.baseMultiplier
      const observationSynergy = speed * (obsHaki * config.synergyRate)
      const intelligenceSynergy = intelligence * (obsHaki * config.intelligenceSynergy)
      hakiPower += observationBonus + observationSynergy + intelligenceSynergy
    }

    // Conqueror's Haki
    if (kingHaki > 0) {
      const config = POWER_CONFIG.haki.conqueror
      let conquerorPower = kingHaki * config.baseBonus

      // Bonus de inteligência para Conqueror's Haki
      conquerorPower += intelligence * kingHaki * config.intelligenceBonus

      if (kingHaki >= config.masterThreshold) {
        conquerorPower *= 1 + config.masterBonus
      }

      hakiPower += conquerorPower
    }

    return hakiPower
  }

  // ✅ DEVIL FRUIT POWER ATUALIZADO
  private static calculateDevilFruitPower(
    stats: Character['stats'],
    fruit: DevilFruit | null,
    characterLevel: number,
  ): number {
    if (!fruit || stats.devilFruit <= 0) return 0

    const config = POWER_CONFIG.devilFruit
    const { attack, defense, speed, devilFruit, intelligence, skill } = stats

    // Poder base da fruta
    let fruitPower = devilFruit * config.basePowerPerLevel

    // Multiplicador de raridade
    const rarityMultiplier = Math.pow(1 + fruit.rarity * config.rarityMultiplier, 2)

    // Multiplicador por tipo
    const typeMultiplier = config.typeMultipliers[fruit.type] || 1.0

    // Bonus especiais por tipo
    if (fruit.type === 'Zoan') {
      fruitPower +=
        ((attack + defense + speed) / 4) * (devilFruit * config.zoanPhysicalBonus) * fruit.rarity
    }
    if (fruit.type === 'Paramecia') {
      fruitPower +=
        (intelligence * (devilFruit * config.parameciaIntelligenceBonus) * fruit.rarity) / 2
    }
    if (fruit.type === 'Logia') {
      fruitPower += (skill * (devilFruit * config.logiaSkillBonus) * fruit.rarity) / 2
    }

    // Sistema de Despertar
    let awakeningMultiplier = 1.0
    if (fruit.awakeningOn && characterLevel >= fruit.awakeningOn * config.awakeningThreshold) {
      awakeningMultiplier = config.awakeningMultiplier * (Math.pow(fruit.rarity, 2) + 1)

      // Bonus de despertar baseado em inteligência
      awakeningMultiplier += (intelligence / 100) * 0.5
    }

    return fruitPower * rarityMultiplier * typeMultiplier * awakeningMultiplier
  }

  // ✅ FUNÇÃO QUE ESTAVA FALTANDO: CÁLCULO DO PODER POR LEVEL
  private static calculateLevelPower(level: number): number {
    const config = POWER_CONFIG.level
    let levelPower = level * config.basePowerPerLevel

    // Bonus para veteranos
    if (level >= config.veteranThreshold) {
      const veteranLevels = level - config.veteranThreshold + 1
      const factor = 1 + (config.veteranBonusPerLevel - 1) / (100 - (level >= 100 ? 99 : level))
      levelPower += veteranLevels * factor
    }

    return levelPower
  }

  // ✅ ESPECIALIZAÇÃO ATUALIZADA
  private static calculateSpecializationBonus(stats: Character['stats']): number {
    const config = POWER_CONFIG.specialization
    const { attack, defense, speed, armHaki, obsHaki, kingHaki, devilFruit, intelligence, skill } =
      stats

    const allStats = [
      attack,
      defense,
      speed,
      armHaki,
      obsHaki,
      kingHaki,
      devilFruit,
      intelligence,
      skill,
    ]
    const totalStats = allStats.reduce((sum, stat) => sum + stat, 0)
    const avgStat = totalStats / allStats.length

    let specializationBonus = 0

    allStats.forEach((stat) => {
      if (stat > avgStat * config.thresholdMultiplier) {
        specializationBonus += stat * (stat / avgStat - 1) * config.bonusMultiplier
      }
    })

    return specializationBonus
  }

  // ✅ SINERGIA EXPANDIDA
  private static calculateSynergyBonus(stats: Character['stats']): number {
    const config = POWER_CONFIG.synergy
    const { attack, defense, speed, armHaki, obsHaki, devilFruit, intelligence, skill } = stats
    let synergyBonus = 0

    // Sinergias existentes
    if (armHaki > 0 && attack > 0) {
      synergyBonus += Math.min(armHaki, attack) * config.hakiPhysical
    }

    if (obsHaki > 0 && speed > 0) {
      synergyBonus += Math.min(obsHaki, speed) * config.observationSpeed
    }

    if (devilFruit > 0 && (armHaki > 0 || obsHaki > 0)) {
      synergyBonus += Math.min(devilFruit, armHaki + obsHaki) * config.devilFruitHaki
    }

    // Novas sinergias
    if (intelligence > 0 && skill > 0) {
      synergyBonus += Math.min(intelligence, skill) * config.intelligenceSkill
    }

    if (skill > 0) {
      const physicalAvg = (attack + defense + speed) / 3
      synergyBonus += Math.min(skill, physicalAvg) * config.skillPhysical
    }

    if (intelligence > 0 && (armHaki > 0 || obsHaki > 0)) {
      synergyBonus += Math.min(intelligence, armHaki + obsHaki) * config.intelligenceHaki
    }

    // Sinergia tática suprema (Intelligence + Skill + qualquer Haki)
    if (intelligence > 0 && skill > 0 && (armHaki > 0 || obsHaki > 0)) {
      const tacticalBase = Math.min(intelligence, skill, armHaki + obsHaki)
      synergyBonus += tacticalBase * config.tacticalCombat
    }

    return synergyBonus
  }

  // ✅ MULTIPLICADORES ATUALIZADOS
  private static calculateMultipliers(
    stats: Character['stats'],
    fruit: DevilFruit | null,
    character: Character,
  ) {
    const { kingHaki, intelligence, skill } = stats

    // Conqueror's Haki Multiplier (mantido)
    let conqueror = 1.0
    if (kingHaki > 0) {
      const config = POWER_CONFIG.haki.conqueror
      conqueror = 1.0 + (kingHaki * config.levelMultiplier) / 50

      if (kingHaki >= config.masterThreshold) {
        conqueror += config.masterBonus
      }
    }

    // Devil Fruit Multiplier (mantido)
    const devilFruit = 1.0

    // Level Multiplier (mantido)
    const level = 1.0 + character.level * POWER_CONFIG.level.multiplierPerLevel

    // Unpredictability Factor (mantido)
    const unpredictability = 1.0 + Math.abs(character.kindness * POWER_CONFIG.kindnessInfluence)

    return {
      conqueror,
      devilFruit,
      level,
      unpredictability,
    }
  }

  // ✅ OUTROS MÉTODOS MANTIDOS
  private static calculateBountyInfluence(bounty: number): number {
    return Math.pow(POWER_CONFIG.bountyLogBase, Math.log10(bounty + 1))
  }

  // ✅ ANÁLISE EXPANDIDA
  private static generatePowerAnalysis(
    breakdown: PowerBreakdown,
    character: Character,
    fruit: DevilFruit | null,
  ) {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []

    const components = {
      'Poder Físico': breakdown.physical,
      'Poder Mental': breakdown.mental,
      Haki: breakdown.haki,
      'Devil Fruit': breakdown.devilFruit,
      Level: breakdown.level,
      Especialização: breakdown.specialization,
      Sinergia: breakdown.synergy,
    }

    // Identificar pontos fortes e fracos
    const maxComponent = Math.max(...Object.values(components))
    const minComponent = Math.min(...Object.values(components))

    Object.entries(components).forEach(([name, value]) => {
      if (value === maxComponent && value > 0) {
        strengths.push(`${name} excepcional`)
      }
      if (value === minComponent && value < maxComponent * 0.3) {
        weaknesses.push(`${name} precisa de desenvolvimento`)
      }
    })

    // Determinar estilo de combate
    const combatStyle = this.determineCombatStyle(character.stats)

    // Gerar recomendações atualizadas
    if (breakdown.mental < breakdown.physical * 0.5) {
      recommendations.push(
        'Desenvolver inteligência e habilidades técnicas para equilibrar o poder',
      )
    }

    if (breakdown.haki < breakdown.physical * 0.5) {
      recommendations.push('Focar no treinamento de Haki para equilibrar o poder')
    }

    if (!fruit && character.level > 20) {
      recommendations.push(
        'Considerar obter uma Devil Fruit para aumentar significativamente o poder',
      )
    }

    if (breakdown.synergy < breakdown.total * 0.1) {
      recommendations.push('Desenvolver sinergias entre diferentes habilidades')
    }

    if (character.stats.intelligence > 80 && character.stats.skill > 80) {
      recommendations.push('Explorar táticas avançadas de combate para maximizar o potencial')
    }

    return { strengths, weaknesses, recommendations, combatStyle }
  }

  // ✅ NOVO: DETERMINAR ESTILO DE COMBATE
  private static determineCombatStyle(stats: Character['stats']): string {
    const { attack, defense, speed, intelligence, skill, armHaki, obsHaki, devilFruit } = stats

    const physical = attack + defense + speed
    const mental = intelligence + skill
    const haki = armHaki + obsHaki

    if (mental > physical && mental > haki) {
      return 'Estrategista Tático'
    } else if (haki > physical && haki > mental) {
      return 'Especialista em Haki'
    } else if (devilFruit > 80) {
      return 'Usuário de Devil Fruit'
    } else if (attack > defense && attack > speed) {
      return 'Combatente Ofensivo'
    } else if (defense > attack && defense > speed) {
      return 'Combatente Defensivo'
    } else if (speed > attack && speed > defense) {
      return 'Combatente Ágil'
    } else {
      return 'Combatente Equilibrado'
    }
  }

  // ✅ MÉTODOS UTILITÁRIOS MANTIDOS
  static comparePower(
    char1: Character,
    char2: Character,
    fruit1?: DevilFruit,
    fruit2?: DevilFruit,
  ): {
    winner: 'char1' | 'char2' | 'tie'
    powerDifference: number
    winChance: number
  } {
    const power1 = this.calculatePower(char1, fruit1 || null)
    const power2 = this.calculatePower(char2, fruit2 || null)

    const powerDifference = Math.abs(power1 - power2)
    const totalPower = power1 + power2
    const winChance = power1 / totalPower

    let winner: 'char1' | 'char2' | 'tie' = 'tie'
    if (power1 > power2) winner = 'char1'
    else if (power2 > power1) winner = 'char2'

    return {
      winner,
      powerDifference,
      winChance,
    }
  }

  static getPowerRank(power: number): string {
    if (power >= 100000) return 'Yonko'
    if (power >= 50000) return 'Admiral'
    if (power >= 25000) return 'Warlord'
    if (power >= 10000) return 'Supernova'
    if (power >= 5000) return 'Veteran'
    if (power >= 1000) return 'Experienced'
    if (power >= 500) return 'Rookie'
    return 'Beginner'
  }

  static simulatePowerGrowth(character: Character, targetLevel: number): PowerBreakdown[] {
    const growthSimulation: PowerBreakdown[] = []

    for (let level = character.level; level <= targetLevel; level += 5) {
      const tempChar = { ...character, level }
      growthSimulation.push(this.calculatePowerBreakdown(tempChar))
    }

    return growthSimulation
  }
}
