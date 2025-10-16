// src/utils/powerCalculationSystem.ts

import type { Character, DevilFruit } from './database'

// ✅ CONFIGURAÇÕES CENTRALIZADAS
export const POWER_CONFIG = {
  // Pesos dos atributos físicos
  physical: {
    attack: 4.0,
    defense: 2.5,
    speed: 3.0
  },
  
  // Sistema de Haki
  haki: {
    armament: {
      baseMultiplier: 1.5,
      synergyRate: 0.05
    },
    observation: {
      baseMultiplier: 1,
      synergyRate: 0.03
    },
    conqueror: {
      baseBonus: 8,
      levelMultiplier: 0.2,
      masterThreshold: 150,
      masterBonus: 0.3
    }
  },
  
  // Sistema de Devil Fruit
  devilFruit: {
    basePowerPerLevel: 10.0,
    rarityMultiplier: 0.5,
    typeMultipliers: {
      Logia: 1.2,
      Zoan: 1.1,
      Paramecia: 1.1
    },
    zoanPhysicalBonus: 0.05,
    parameciaAttackBonus: 0.05,
    logiaSpeedBonus: 0.05,
    awakeningMultiplier: 2.0,
    awakeningThreshold: 1 // 80% do level necessário
  },
  
  // Sistema de Level
  level: {
    basePowerPerLevel: 15,
    multiplierPerLevel: 0.0,
    veteranThreshold: 50,
    veteranBonusPerLevel: 25
  },
  
  // Sistema de Especialização
  specialization: {
    thresholdMultiplier: 1.5,
    bonusMultiplier: 1.5
  },
  
  // Sistema de Sinergia
  synergy: {
    hakiPhysical: 1.5,
    observationSpeed: 1.2,
    devilFruitHaki: 2.0
  },
  
  // Outros fatores
  kindnessInfluence: 0.001,
  bountyLogBase: 2
} as const

// ✅ INTERFACES PARA RESULTADOS
export interface PowerBreakdown {
  physical: number
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
}

export class PowerCalculationSystem {
  
  // ✅ MÉTODO PRINCIPAL SIMPLIFICADO
  static calculatePower(character: Character, fruit: DevilFruit | null = null): number {
    const breakdown = this.calculatePowerBreakdown(character, fruit)
    return breakdown.total
  }
  
  // ✅ CÁLCULO DETALHADO COM BREAKDOWN
  static calculatePowerBreakdown(character: Character, fruit: DevilFruit | null = null): PowerBreakdown {
    const stats = character.stats
    
    // Calcular cada componente separadamente
    const physical = this.calculatePhysicalPower(stats)
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
    let basePower = physical + haki + devilFruit + level + specialization + synergy
    
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
      haki,
      devilFruit,
      level,
      specialization,
      synergy,
      multipliers,
      bountyInfluence,
      total: Math.max(1, Math.ceil(totalPower))
    }
  }
  
  // ✅ ANÁLISE COMPLETA DO PODER
  static analyzePower(character: Character, fruit: DevilFruit | null = null): PowerAnalysis {
    const breakdown = this.calculatePowerBreakdown(character, fruit)
    const analysis = this.generatePowerAnalysis(breakdown, character, fruit)
    
    return {
      power: breakdown.total,
      breakdown,
      ...analysis
    }
  }
  
  // ✅ COMPONENTES INDIVIDUAIS
  private static calculatePhysicalPower(stats: Character['stats']): number {
    const { attack, defense, speed } = stats
    const config = POWER_CONFIG.physical
    
    return (attack * config.attack) + (defense * config.defense) + (speed * config.speed)
  }
  
  private static calculateHakiPower(stats: Character['stats']): number {
    const { attack, defense, speed, armHaki, obsHaki, kingHaki } = stats
    let hakiPower = 0
    
    // Armament Haki
    if (armHaki > 0) {
      const config = POWER_CONFIG.haki.armament
      const armamentBonus = armHaki * config.baseMultiplier
      const armamentSynergy = (attack + defense) * (armHaki * config.synergyRate)
      hakiPower += armamentBonus + armamentSynergy
    }
    
    // Observation Haki
    if (obsHaki > 0) {
      const config = POWER_CONFIG.haki.observation
      const observationBonus = obsHaki * config.baseMultiplier
      const observationSynergy = speed * (obsHaki * config.synergyRate)
      hakiPower += observationBonus + observationSynergy
    }
    
    // Conqueror's Haki (apenas bonus base, multiplicador é calculado separadamente)
    if (kingHaki > 0) {
      const config = POWER_CONFIG.haki.conqueror
      hakiPower += kingHaki * config.baseBonus
      
      if (kingHaki >= config.masterThreshold) {
        hakiPower *= (1 + config.masterBonus)
      }
    }
    
    return hakiPower
  }
  
  private static calculateDevilFruitPower(
    stats: Character['stats'], 
    fruit: DevilFruit | null, 
    characterLevel: number
  ): number {
    if (!fruit || stats.devilFruit <= 0) return 0
    
    const config = POWER_CONFIG.devilFruit
    const { attack, defense, speed, devilFruit } = stats
    
    // Poder base da fruta
    let fruitPower = devilFruit * config.basePowerPerLevel
    
    // Multiplicador de raridade
    const rarityMultiplier = Math.pow((1 + fruit.rarity * config.rarityMultiplier),2)
    
    // Multiplicador por tipo
    const typeMultiplier = config.typeMultipliers[fruit.type] || 1.0
    
    // Bonus especial para Zoan
    if (fruit.type === 'Zoan') {
      fruitPower += (attack + defense + speed) / 2 * (devilFruit * config.zoanPhysicalBonus) * fruit.rarity
    }
    if (fruit.type === 'Paramecia') {
      fruitPower += (attack) * (devilFruit * config.parameciaAttackBonus) * fruit.rarity
    }
    if (fruit.type === 'Logia') {
      fruitPower += (speed) * (devilFruit * config.logiaSpeedBonus) * fruit.rarity
    }
    
    // Sistema de Despertar
    let awakeningMultiplier = 1.0
    if (fruit.awakeningOn && characterLevel >= fruit.awakeningOn * config.awakeningThreshold) {
      awakeningMultiplier = config.awakeningMultiplier * (Math.pow(fruit.rarity, 2) + 1)
    }
    
    return fruitPower * rarityMultiplier * typeMultiplier * awakeningMultiplier
  }
  
  private static calculateLevelPower(level: number): number {
    const config = POWER_CONFIG.level
    let levelPower = level * config.basePowerPerLevel
    
    // Bonus para veteranos
    if (level >= config.veteranThreshold) {
      const veteranLevels = level - config.veteranThreshold + 1
      levelPower += veteranLevels * config.veteranBonusPerLevel
    }
    
    return levelPower
  }
  
  private static calculateSpecializationBonus(stats: Character['stats']): number {
    const config = POWER_CONFIG.specialization
    const { attack, defense, speed, armHaki, obsHaki, kingHaki, devilFruit } = stats
    
    const allStats = [attack, defense, speed, armHaki, obsHaki, kingHaki, devilFruit]
    const totalStats = allStats.reduce((sum, stat) => sum + stat, 0)
    const avgStat = totalStats / allStats.length
    
    let specializationBonus = 0
    
    allStats.forEach(stat => {
      if (stat > avgStat * config.thresholdMultiplier) {
        specializationBonus += stat * config.bonusMultiplier
      }
    })
    
    return specializationBonus
  }
  
  private static calculateSynergyBonus(stats: Character['stats']): number {
    const config = POWER_CONFIG.synergy
    const { attack, defense, speed, armHaki, obsHaki, devilFruit } = stats
    let synergyBonus = 0
    
    // Sinergia Armament Haki + Ataque
    if (armHaki > 0 && attack > 0) {
      synergyBonus += Math.min(armHaki, attack) * config.hakiPhysical
    }
    
    // Sinergia Observation Haki + Velocidade
    if (obsHaki > 0 && speed > 0) {
      synergyBonus += Math.min(obsHaki, speed) * config.observationSpeed
    }
    
    // Sinergia Devil Fruit + Haki
    if (devilFruit > 0 && (armHaki > 0 || obsHaki > 0)) {
      synergyBonus += Math.min(devilFruit, armHaki + obsHaki) * config.devilFruitHaki
    }
    
    return synergyBonus
  }
  
  private static calculateMultipliers(
    stats: Character['stats'], 
    fruit: DevilFruit | null, 
    character: Character
  ) {
    const { kingHaki } = stats
    
    // Conqueror's Haki Multiplier
    let conqueror = 1.0
    if (kingHaki > 0) {
      const config = POWER_CONFIG.haki.conqueror
      conqueror = 1.0 + (kingHaki * config.levelMultiplier)/50
      
      if (kingHaki >= config.masterThreshold) {
        conqueror += config.masterBonus
      }
    }
    
    // Devil Fruit Multiplier (atualmente 1.0, mas pode ser expandido)
    const devilFruit = 1.0
    
    // Level Multiplier
    const level = 1.0 + (character.level * POWER_CONFIG.level.multiplierPerLevel)
    
    // Unpredictability Factor
    const unpredictability = 1.0 + Math.abs(character.kindness * POWER_CONFIG.kindnessInfluence)
    
    return {
      conqueror,
      devilFruit,
      level,
      unpredictability
    }
  }
  
  private static calculateBountyInfluence(bounty: number): number {
    return Math.pow(POWER_CONFIG.bountyLogBase, Math.log10(bounty + 1))
  }
  
  // ✅ ANÁLISE E RECOMENDAÇÕES
  private static generatePowerAnalysis(
    breakdown: PowerBreakdown, 
    character: Character, 
    fruit: DevilFruit | null
  ) {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []
    
    const components = {
      'Poder Físico': breakdown.physical,
      'Haki': breakdown.haki,
      'Devil Fruit': breakdown.devilFruit,
      'Level': breakdown.level,
      'Especialização': breakdown.specialization,
      'Sinergia': breakdown.synergy
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
    
    // Gerar recomendações
    if (breakdown.haki < breakdown.physical * 0.5) {
      recommendations.push('Focar no treinamento de Haki para equilibrar o poder')
    }
    
    if (!fruit && character.level > 20) {
      recommendations.push('Considerar obter uma Devil Fruit para aumentar significativamente o poder')
    }
    
    if (breakdown.synergy < breakdown.total * 0.1) {
      recommendations.push('Desenvolver sinergias entre diferentes habilidades')
    }
    
    return { strengths, weaknesses, recommendations }
  }
  
  // ✅ MÉTODOS UTILITÁRIOS
  static comparePower(char1: Character, char2: Character, fruit1?: DevilFruit, fruit2?: DevilFruit): {
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
      winChance
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