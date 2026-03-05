// utils/gameLogic.ts
import { Character, StyleCombat, DevilFruit, Island } from '@/utils/database'
import { GenerationConfig } from '@/utils/generationConfig'
import { PowerCalculationSystem } from '@/utils/powerCalculationSystem'
import STYLES from '@/data/styleCombats'

export class GameLogic {
  static calculateExperienceGain(winner: Character, loser: Character): number {
    // 1. 📊 EXPERIÊNCIA BASE - Baseada no level do oponente
    const baseExp = 50 + loser.level * 25 // 75 XP no level 1, 300 XP no level 10

    // 2. 📈 FATOR DE DIFERENÇA DE LEVEL
    const levelDifference = loser.level - winner.level
    let levelMultiplier = 1.0

    if (levelDifference > 0) {
      // Oponente mais forte = mais XP (até 3x)
      levelMultiplier = 1.0 + Math.min(levelDifference * 0.3, 2.0)
    } else if (levelDifference < 0) {
      // Oponente mais fraco = menos XP (mínimo 10%)
      const penalty = Math.abs(levelDifference) * 0.15
      levelMultiplier = Math.max(0.1, 1.0 - penalty)
    }

    // 3. ⚔️ FATOR DE DIFERENÇA DE PODER
    const winnerPower = this.calculatePower(winner)
    const loserPower = this.calculatePower(loser)

    let powerMultiplier = 1.0

    if (loserPower > winnerPower) {
      // Derrotar alguém mais forte = bonus de XP
      const powerRatio = loserPower / winnerPower
      powerMultiplier = 1.0 + Math.min((powerRatio - 1.0) * 0.5, 1.5) // Até 2.5x
    } else if (winnerPower > loserPower) {
      powerMultiplier = 1.0
    }

    // 4. 🏆 BONUS POR TIPO DE OPONENTE
    let typeBonus = 1.0

    // Bonus por derrotar tipos específicos
    if (loser.type === 'Government') {
      typeBonus = 1.4 // Governo é mais difícil
    } else if (loser.type === 'Marine' && winner.type === 'Pirate') {
      typeBonus = 1.2 // Piratas vs Marines
    } else if (loser.type === 'Pirate' && winner.type === 'Marine') {
      typeBonus = 1.15 // Marines vs Piratas
    }

    // 5. 🎖️ BONUS POR POSIÇÃO DO OPONENTE
    let positionBonus = 1.1

    switch (loser.position) {
      case 'Captain':
        positionBonus = 1.5
        break
      case 'First Mate':
        positionBonus = 1.3
        break
    }

    // 6. 💰 FATOR BOUNTY - Oponentes famosos dão mais XP
    let bountyMultiplier = 1.0

    if (loser.bounty > 0 || loser.type === 'Marine') {
      // Logarítmico para evitar valores absurdos
      const bountyFactor = Math.log10(loser.bounty / 1000000 + 1) // Base 1M berries
      bountyMultiplier = 1.0 + bountyFactor * 0.2 // Máximo ~40% bonus
    }

    // 7. 🥊 BONUS POR HABILIDADES ESPECIAIS
    let skillBonus = 1.0

    // Bonus por derrotar usuários de Haki avançado
    if (loser.stats.kingHaki > 0) {
      skillBonus += 0.5 // +50% por Conqueror's Haki
    }

    if (loser.stats.armHaki > winner.stats.armHaki || loser.stats.obsHaki > winner.stats.obsHaki) {
      skillBonus += 0.2 // +20% por Haki avançado
    }

    // Bonus por derrotar usuários de Devil Fruit
    if (loser.stats.devilFruit > 0) {
      skillBonus += 0.3 // +30% por Devil Fruit
    }

    // 8. 🎲 FATOR DE DIFICULDADE DA BATALHA
    let difficultyMultiplier = 1.0

    // Se a batalha foi muito difícil (powers próximos), mais XP
    const powerDifference = Math.abs(winnerPower - loserPower)
    const averagePower = (winnerPower + loserPower) / 2
    const difficultyRatio = powerDifference / averagePower

    if (difficultyRatio < 0.2) {
      // Batalha muito equilibrada
      difficultyMultiplier = 1.3
    } else if (difficultyRatio < 0.5) {
      // Batalha equilibrada
      difficultyMultiplier = 1.1
    }

    // 9. 📊 CÁLCULO FINAL
    let finalExp = baseExp

    // Aplicar todos os multiplicadores
    finalExp *= levelMultiplier
    finalExp *= powerMultiplier
    finalExp *= typeBonus
    finalExp *= positionBonus
    finalExp *= bountyMultiplier
    finalExp *= skillBonus
    finalExp *= difficultyMultiplier

    // 12. 🎯 LIMITADORES E BALANCEAMENTO
    const winnerLevel = winner.level

    // Limite máximo baseado no level do vencedor
    const maxExpPerBattle = winnerLevel * 200 // Máximo 200 XP por level

    // Limite mínimo
    const minExpPerBattle = Math.max(40, winnerLevel * 20) // Mínimo 20 XP por level

    // Aplicar limites
    finalExp = Math.min(finalExp, maxExpPerBattle)
    finalExp = Math.max(finalExp, minExpPerBattle)

    return Math.ceil(finalExp)
  }

  static calculateBountyGain(winner: Character, loser: Character): number {
    // 1. 💀 BOUNTY BASE DO OPONENTE
    const loserBounty = loser.bounty
    let bountyGain = 0

    // 2. 📊 FATOR PRINCIPAL - Baseado no bounty do oponente
    if (loserBounty > 0) {
      // Ganho percentual baseado no bounty do oponente
      let percentageGain = 0

      if (loserBounty >= 1000000000) {
        // 1B+ (Yonko level)
        percentageGain = 0.125 // 25% do bounty
      } else if (loserBounty >= 500000000) {
        // 500M+ (Commander level)
        percentageGain = 0.1 // 20% do bounty
      } else if (loserBounty >= 100000000) {
        // 100M+ (Supernova level)
        percentageGain = 0.075 // 15% do bounty
      } else if (loserBounty >= 50000000) {
        // 50M+ (Veteran level)
        percentageGain = 0.06 // 12% do bounty
      } else if (loserBounty >= 10000000) {
        // 10M+ (Rookie level)
        percentageGain = 0.05 // 10% do bounty
      } else {
        percentageGain = 0.08 // 8% para bounties baixos
      }

      bountyGain = loserBounty * percentageGain
    } else {
      // Se o oponente não tem bounty, usar level como base
      bountyGain = loser.level * 50000 // 50K por level
    }

    // 3. 🎖️ MULTIPLICADOR POR TIPO DE OPONENTE
    let typeMultiplier = 1.0

    switch (loser.type) {
      case 'Government':
        typeMultiplier = 2.5 // Atacar o governo é muito grave
        break
      case 'Marine':
        if (winner.type === 'Pirate') {
          typeMultiplier = 1.8 // Piratas vs Marines = bounty alto
        } else {
          typeMultiplier = 1 // Marines matando Marines = bounty baixo
        }
        break
      case 'Pirate':
        if (winner.type === 'Marine') {
          typeMultiplier = 1.3 // Marines matando piratas = pouco bounty
        } else if (winner.type === 'Pirate') {
          typeMultiplier = 1.2 // Pirata vs Pirata = bounty moderado
        }
        break
    }

    // 4. 🏆 BONUS POR POSIÇÃO DO OPONENTE
    let positionMultiplier = 1.0

    switch (loser.position) {
      case 'Captain':
        positionMultiplier = 1.5
        break
      case 'First Mate':
        positionMultiplier = 1.2
        break
    }

    // 5. 📈 FATOR DE DIFERENÇA DE LEVEL
    const levelDifference = loser.level - winner.level
    let levelMultiplier = 1.0

    if (levelDifference > 0) {
      // Derrotar alguém mais forte = mais bounty
      levelMultiplier = 1.0 + levelDifference * 0.1 // 10% por level de diferença
    } else if (levelDifference < 0) {
      // Derrotar alguém mais fraco = menos bounty
      const penalty = Math.abs(levelDifference) * 0.05 // 5% de redução por level
      levelMultiplier = Math.max(0.3, 1.0 - penalty) // Mínimo 30%
    }

    // 6. ⚔️ FATOR DE DIFERENÇA DE PODER
    const winnerPower = this.calculatePower(winner)
    const loserPower = this.calculatePower(loser)
    let powerMultiplier = 1.0

    if (loserPower > winnerPower) {
      // Derrotar alguém mais forte = bonus de bounty
      const powerRatio = loserPower / winnerPower
      powerMultiplier = 1.0 + Math.min((powerRatio - 1.0) * 0.3, 1.0) // Até 2x
    } else if (winnerPower > loserPower) {
      // Derrotar alguém mais fraco = menos bounty
      const powerRatio = winnerPower / loserPower
      const reduction = Math.min((powerRatio - 1.0) * 0.2, 0.6)
      powerMultiplier = Math.max(0.4, 1.0 - reduction) // Mínimo 40%
    }

    // 7. 🌟 BONUS POR HABILIDADES ESPECIAIS DO OPONENTE
    let skillMultiplier = 1.0

    // Bonus por derrotar usuário de Conqueror's Haki
    if (loser.stats.kingHaki > 0) {
      skillMultiplier += 0.5 // +50%
    }

    // Bonus por derrotar usuário de Devil Fruit
    if (loser.stats.devilFruit > 0) {
      skillMultiplier += 0.3 // +30%
    }

    // Bonus por derrotar usuário de Haki avançado
    if (loser.stats.armHaki > 5 || loser.stats.obsHaki > 5) {
      skillMultiplier += 0.2 // +20%
    }

    // 8. 🎯 FATOR DE NOTORIEDADE DO VENCEDOR
    let notorietyMultiplier = 1.0

    // Quanto maior o bounty atual, maior o ganho (mais notório)
    if (winner.bounty > 0) {
      const notorietyFactor = Math.log10(winner.bounty / 1000000 + 1) * 0.1
      notorietyMultiplier = 1.0 + notorietyFactor // Até ~40% bonus
    }

    // 9. 🏴‍☠️ BONUS POR PRIMEIRA VITÓRIA CONTRA ESTE TIPO
    let firstTimeMultiplier = 1.0
    // Aqui você poderia verificar se é a primeira vez derrotando este tipo de oponente
    // firstTimeMultiplier = isFirstTimeAgainstThisType ? 1.5 : 1.0;

    // 10. 🌍 FATOR DE LOCALIZAÇÃO (se implementado)
    let locationMultiplier = 1.0
    // Em certas ilhas, as ações têm mais repercussão
    // locationMultiplier = isImportantIsland ? 1.3 : 1.0;

    // 11. 📊 CÁLCULO FINAL
    bountyGain *= typeMultiplier
    bountyGain *= positionMultiplier
    bountyGain *= levelMultiplier
    bountyGain *= powerMultiplier
    bountyGain *= skillMultiplier
    bountyGain *= notorietyMultiplier
    bountyGain *= firstTimeMultiplier
    bountyGain *= locationMultiplier

    // 12. �� LIMITADORES E BALANCEAMENTO

    // Limite máximo baseado no level do vencedor
    const maxBountyGain = winner.level * 30000 // 50k por level máximo

    // Limite mínimo
    const minBountyGain = Math.max(10000, winner.level * 1000) // 1K por level mínimo

    // Aplicar limites
    bountyGain = Math.min(bountyGain, maxBountyGain)
    bountyGain = Math.max(bountyGain, minBountyGain)

    return GameLogic.adjustBounty(bountyGain)
  }

  static determineEncounterTypeOnly(
    player: string,
    opponent: string,
  ): 'hostile' | 'neutral' | 'friendly' {
    // Piratas vs Marines = sempre hostil
    if (
      (player === 'Pirate' && opponent === 'Marine') ||
      (player === 'Marine' && opponent === 'Pirate')
    ) {
      return 'hostile'
    }

    // BountyHunters vs Piratas = sempre hostil
    if (
      (player === 'BountyHunter' && opponent === 'Pirate') ||
      (player === 'Pirate' && opponent === 'BountyHunter')
    ) {
      return 'hostile'
    }

    // Government vs Piratas = sempre hostil
    if (
      (player === 'Government' && opponent === 'Pirate') ||
      (player === 'Pirate' && opponent === 'Government')
    ) {
      return 'hostile'
    }

    // Marines vs Government = geralmente neutro/amigável (mesma facção)
    if (
      (player === 'Marine' && opponent === 'Government') ||
      (player === 'Government' && opponent === 'Marine')
    ) {
      return Math.random() < 0.7 ? 'neutral' : 'hostile'
    }

    // BountyHunter vs Marine = neutro (podem cooperar contra piratas)
    if (
      (player === 'BountyHunter' && opponent === 'Marine') ||
      (player === 'Marine' && opponent === 'BountyHunter')
    ) {
      return Math.random() < 0.6 ? 'neutral' : 'hostile'
    }

    // BountyHunter vs Government = neutro (podem cooperar)
    if (
      (player === 'BountyHunter' && opponent === 'Government') ||
      (player === 'Government' && opponent === 'BountyHunter')
    ) {
      return Math.random() < 0.5 ? 'neutral' : 'hostile'
    }

    // Civilian sempre tenta ser pacífico
    if (player === 'Civilian' || opponent === 'Civilian') {
      return Math.random() < 0.8 ? 'friendly' : 'neutral'
    }

    // Mesmo tipo = geralmente neutro
    if (player === opponent) {
      return Math.random() < 0.7 ? 'neutral' : 'hostile'
    }

    return 'neutral'
  }

  static validateTypeCompatibility(recruiterType: string, targetType: string): boolean {
    const compatibilityMatrix: Record<string, string[]> = {
      Pirate: ['Pirate', 'BountyHunter'],
      Marine: ['Marine', 'Government'],
      BountyHunter: ['BountyHunter', 'Pirate'],
      Government: ['Government', 'Marine'], // Assumindo que Government pode recrutar Marines
      Civilian: [], // Civis não recrutam ninguém
    }

    return compatibilityMatrix[recruiterType]?.includes(targetType) || false
  }

  // 🎮 Função auxiliar para calcular redução de bounty (para Marines)
  static calculateBountyReduction(marine: Character, defeatedPirate: Character): number {
    if (marine.type !== 'Marine') return 0

    // Marines reduzem bounty ao derrotar piratas
    const reduction = Math.min(defeatedPirate.bounty * 0.1, marine.level * 100000)
    return Math.floor(reduction)
  }

  static calculateBountyIncrease(character: Character, defeated: Character): number {
    const baseBounty = defeated.bounty * 0.1
    const levelBonus = character.level * 1000

    return Math.floor(baseBounty + levelBonus)
  }

  static nextLevelUp(character: Character): number {
    const expRequired = Math.floor(100 * Math.pow(character.level + 1, 1.5) + character.level * 50)
    return expRequired
  }

  static healthPointsCharacter(level: number): number {
    const hpChar = level + 5
    return hpChar
  }

  static diceUsed(percentageOfPower: number): number {
    // ✅ CLAMP para garantir que está entre 0 e 1
    const power = Math.max(0, Math.min(1, percentageOfPower))

    if (power >= 0.85) {
      return 20 // Dominância absoluta (85%+)
    } else if (power >= 0.7) {
      return 16 // Muito superior (70-84%)
    } else if (power >= 0.6) {
      return 12 // Superior (60-69%)
    } else if (power >= 0.5) {
      return 10 // Ligeiramente superior (50-59%)
    } else if (power >= 0.4) {
      return 8 // Ligeiramente inferior (40-49%)
    } else if (power >= 0.25) {
      return 6 // Inferior (25-39%)
    } else if (power >= 0.15) {
      return 4 // Muito inferior (15-24%)
    } else {
      return 3 // Completamente dominado (0-14%)
    }
  }

  static rollDice(dice: number): number {
    let shouldRoll = true
    let result = 0
    while (shouldRoll) {
      let rollResult = this.randomBetween(1, dice)
      result += rollResult
      if (rollResult == dice) {
        shouldRoll = true
      } else {
        shouldRoll = false
      }
    }
    return result
  }

  static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * Retorna o estágio de domínio de um tipo de Haki dado seu valor.
   * Usado em toda a UI e em cálculos narrativos de batalha.
   */
  static hakiTier(
    value: number,
    type: 'arm' | 'obs' | 'king',
  ): { name: string; color: string; tier: number } {
    if (value <= 0) return { name: 'Inativo', color: '#546E7A', tier: 0 }
    const stages: Array<{ min: number; name: string; arm: string; obs: string; king: string }> = [
      { min: 1,    name: 'Iniciante',     arm: '#CE93D8', obs: '#80DEEA', king: '#FFCC80' },
      { min: 100,  name: 'Básico',        arm: '#AB47BC', obs: '#26C6DA', king: '#FFA726' },
      { min: 300,  name: 'Intermediário', arm: '#8E24AA', obs: '#00ACC1', king: '#F57C00' },
      { min: 600,  name: 'Avançado',      arm: '#6A1B9A', obs: '#006064', king: '#E65100' },
      { min: 1000, name: 'Mestre',        arm: '#4A148C', obs: '#003f47', king: '#BF360C' },
    ]
    let idx = 0
    for (let i = 0; i < stages.length; i++) {
      if (value >= stages[i].min) idx = i
    }
    return { name: stages[idx].name, color: stages[idx][type], tier: idx + 1 }
  }

  // ── Sea Progression ─────────────────────────────────────────────────────

  static readonly SEAS = [
    { name: 'East Blue',  range: [1, 5]   as [number, number], color: '#1565C0', gradient: 'linear-gradient(135deg,#0D47A1,#1E88E5)', icon: 'mdi-waves',   index: 0 },
    { name: 'Grand Line', range: [6, 14]  as [number, number], color: '#00695C', gradient: 'linear-gradient(135deg,#004D40,#00897B)', icon: 'mdi-compass', index: 1 },
    { name: 'New World',  range: [15, 24] as [number, number], color: '#B71C1C', gradient: 'linear-gradient(135deg,#7F0000,#E53935)', icon: 'mdi-fire',    index: 2 },
    { name: 'End Game',   range: [25, 30] as [number, number], color: '#4A148C', gradient: 'linear-gradient(135deg,#1A0050,#7B1FA2)', icon: 'mdi-skull',   index: 3 },
  ]

  static readonly SEA_REQUIREMENTS = [
    { minLevel: 1,  minBounty: 0 },
    { minLevel: 20, minBounty: 15_000_000 },
    { minLevel: 50, minBounty: 400_000_000 },
    { minLevel: 80, minBounty: 1_500_000_000 },
  ]

  static getSea(difficulty: number): typeof GameLogic.SEAS[0] {
    for (let i = GameLogic.SEAS.length - 1; i >= 0; i--) {
      if (difficulty >= GameLogic.SEAS[i].range[0]) return GameLogic.SEAS[i]
    }
    return GameLogic.SEAS[0]
  }

  static getSeaAccess(
    character: Character,
    requirements: Array<{ minLevel: number; minBounty: number }> = GameLogic.SEA_REQUIREMENTS,
  ): Array<{
    sea: typeof GameLogic.SEAS[0]
    minLevel: number
    minBounty: number
    unlocked: boolean
  }> {
    return GameLogic.SEAS.map((sea, i) => {
      const req = requirements[i]
      return {
        sea,
        minLevel: req.minLevel,
        minBounty: req.minBounty,
        unlocked: character.level >= req.minLevel && character.bounty >= req.minBounty,
      }
    })
  }

  static getMaxAccessibleDifficulty(
    character: Character,
    requirements: Array<{ minLevel: number; minBounty: number }> = GameLogic.SEA_REQUIREMENTS,
  ): number {
    let maxDiff = 5 // East Blue always accessible
    for (let i = GameLogic.SEAS.length - 1; i >= 0; i--) {
      const req = requirements[i]
      if (character.level >= req.minLevel && character.bounty >= req.minBounty) {
        maxDiff = GameLogic.SEAS[i].range[1]
        break
      }
    }
    return maxDiff
  }

  // ── World Fame ───────────────────────────────────────────────────────────

  private static readonly FAME_TIERS = [
    { minScore: 0,     title: 'Marinheiro Desconhecido', color: '#546E7A', icon: 'mdi-account'              },
    { minScore: 1000,  title: 'Novato dos Mares',         color: '#78909C', icon: 'mdi-sail-boat'           },
    { minScore: 5000,  title: 'Aventureiro',              color: '#1565C0', icon: 'mdi-map-search'          },
    { minScore: 12000, title: 'Reconhecido nos Mares',    color: '#00695C', icon: 'mdi-eye'                 },
    { minScore: 22000, title: 'Supernova',                color: '#F57F17', icon: 'mdi-lightning-bolt'      },
    { minScore: 35000, title: 'Temido pelos Mares',       color: '#E65100', icon: 'mdi-skull-crossbones'    },
    { minScore: 50000, title: 'Lenda dos Mares',          color: '#C62828', icon: 'mdi-crown-outline'       },
    { minScore: 75000, title: '__MAX__',                  color: '#D4AF37', icon: 'mdi-crown'               },
  ]

  private static getFameMaxTitle(type: string): string {
    switch (type) {
      case 'Pirate':       return 'Rei dos Piratas'
      case 'Marine':       return 'Grande Almirante'
      case 'BountyHunter': return 'O Caçador Lendário'
      case 'Government':   return 'Senhor do Mundo'
      default:             return 'Lenda Absoluta'
    }
  }

  static getWorldFame(character: Character, crewReputation: number = 0): {
    score: number
    title: string
    color: string
    icon: string
    nextTitle: string | null
    nextScore: number | null
    progress: number
  } {
    const score = Math.floor(
      Math.log10(character.bounty + 1) * 500
      + character.level * 100
      + Math.log10(crewReputation + 1) * 200,
    )

    const tiers = GameLogic.FAME_TIERS
    let tierIdx = 0
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (score >= tiers[i].minScore) { tierIdx = i; break }
    }

    const current = tiers[tierIdx]
    const title = current.title === '__MAX__' ? GameLogic.getFameMaxTitle(character.type) : current.title

    const next = tierIdx < tiers.length - 1 ? tiers[tierIdx + 1] : null
    const nextTitle = next
      ? (next.title === '__MAX__' ? GameLogic.getFameMaxTitle(character.type) : next.title)
      : null
    const nextScore = next ? next.minScore : null

    const progress = next
      ? Math.min(100, Math.floor(((score - current.minScore) / (next.minScore - current.minScore)) * 100))
      : 100

    return { score, title, color: current.color, icon: current.icon, nextTitle, nextScore, progress }
  }

  static expNeeded(level: number): number {
    const expRequired = Math.floor(100 * Math.pow(level + 1, 1.5) + level * 50)
    return expRequired
  }

  static checkLevelUp(character: Character): {
    shouldLevelUp: boolean
    newLevel?: number
    expNeeded?: number
    levelsGained?: number
    totalExpUsed?: number
  } {
    try {
      let currentLevel = character.level
      let currentExp = character.experience
      let levelsGained = 0
      let totalExpUsed = 0

      // Loop para verificar múltiplos level ups
      while (true) {
        const expNeededForNextLevel = this.expNeeded(character.level)

        if (currentExp >= expNeededForNextLevel) {
          // Pode subir de level
          currentExp -= expNeededForNextLevel
          totalExpUsed += expNeededForNextLevel
          character.level += 1
          currentLevel++
          levelsGained++

          // Limite de segurança para evitar loops infinitos
          if (levelsGained >= 10) {
            console.warn(`⚠️ ${character.name} tentou subir mais de 10 levels de uma vez!`)
            break
          }
        } else {
          // Não tem XP suficiente para o próximo level
          break
        }
      }

      if (levelsGained > 0) {
        return {
          shouldLevelUp: true,
          newLevel: currentLevel,
          expNeeded: totalExpUsed,
          levelsGained,
          totalExpUsed,
        }
      }

      return {
        shouldLevelUp: false,
      }
    } catch (error) {
      console.error('Erro ao verificar level up:', error)
      return {
        shouldLevelUp: false,
      }
    }
  }

  static calculateStatIncrease(character: Character): Character['stats'] {
    // ✅ DEFINIR PONTOS TOTAIS DISPONÍVEIS POR LEVEL
    const pointsPerLevel = 2 + Math.floor(Math.random() * 3) // 2-4 pontos aleatórios

    // ✅ STATS BASE ATUAIS
    const currentStats = character.stats || {
      attack: 0,
      defense: 0,
      speed: 0,
      intelligence: 0,
      skill: 0,
      armHaki: 0,
      obsHaki: 0,
      kingHaki: 0,
      devilFruit: 0,
    }

    // ✅ DEFINIR PRIORIDADES POR TIPO DE PERSONAGEM
    const typePriorities = this.getTypePriorities(character.type)

    // ✅ CRIAR POOL DE STATS ELEGÍVEIS
    const eligibleStats = this.getEligibleStats(character)

    // ✅ DISTRIBUIR PONTOS ALEATORIAMENTE
    const distributedPoints = this.distributePointsRandomly(
      pointsPerLevel,
      eligibleStats,
      typePriorities,
    )

    // ✅ APLICAR AUMENTOS AOS STATS ATUAIS
    return {
      attack: currentStats.attack + (distributedPoints.attack || 0),
      defense: currentStats.defense + (distributedPoints.defense || 0),
      speed: currentStats.speed + (distributedPoints.speed || 0),
      intelligence: currentStats.intelligence + (distributedPoints.intelligence || 0),
      skill: currentStats.skill + (distributedPoints.skill || 0),
      armHaki: currentStats.armHaki + (distributedPoints.armHaki || 0),
      obsHaki: currentStats.obsHaki + (distributedPoints.obsHaki || 0),
      kingHaki: currentStats.kingHaki + (distributedPoints.kingHaki || 0),
      devilFruit: currentStats.devilFruit + (distributedPoints.devilFruit || 0),
    }
  }

  static getTypePriorities(type: string): { [key: string]: number } {
    // ✅ MAPEAMENTO POR CATEGORIA
    const categoryMappings = {
      // COMBATENTES
      'Combatente - Artes marciais': 'martial_artist',
      'Combatente - Mestre em armadilhas': 'trap_master',
      'Combatente - Cyborg': 'cyborg',

      // ESPADACHINS
      'Espadachim - Estilo de 1 espada': 'one_sword',
      'Espadachim - Estilo de 2 espadas': 'two_sword',
      'Espadachim - Estilo de 3 espadas': 'three_sword',

      // ATIRADORES
      'Atirador - Pistola': 'pistol_user',
      'Atirador - Rifle': 'rifle_user',
      'Atirador - Armas improvisadas': 'improvised_weapons',

      // SUPORTE
      'Suporte - Utensílios': 'utility_support',
      'Suporte - Tanque': 'tank_support',
      'Suporte - Cura': 'healer_support',
    }

    const priorities = {
      // ✅ COMBATENTES
      martial_artist: {
        // Haki: armHaki(10) + obsHaki(5) = 15
        armHaki: 10,
        obsHaki: 5,
        // Stats: attack(35) + skill(25) + speed(15) + defense(7) + intelligence(3) = 85
        attack: 35,
        skill: 25,
        speed: 15,
        defense: 7,
        intelligence: 3,
      },

      trap_master: {
        // Haki: armHaki(3) + obsHaki(12) = 15
        armHaki: 3,
        obsHaki: 12,
        // Stats: intelligence(35) + skill(25) + attack(15) + speed(7) + defense(3) = 85
        intelligence: 35,
        skill: 25,
        attack: 15,
        speed: 7,
        defense: 3,
      },

      cyborg: {
        // Haki: armHaki(8) + obsHaki(7) = 15
        armHaki: 8,
        obsHaki: 7,
        // Stats: attack(25) + defense(25) + intelligence(15) + speed(12) + skill(8) = 85
        attack: 25,
        defense: 25,
        intelligence: 15,
        speed: 12,
        skill: 8,
      },

      // ✅ ESPADACHINS
      one_sword: {
        // Haki: armHaki(8) + obsHaki(7) = 15
        armHaki: 8,
        obsHaki: 7,
        // Stats: speed(35) + attack(25) + intelligence(10) + defense(8) + skill(7) = 85
        speed: 35,
        attack: 25,
        intelligence: 10,
        defense: 8,
        skill: 7,
      },

      two_sword: {
        // Haki: armHaki(7) + obsHaki(8) = 15
        armHaki: 7,
        obsHaki: 8,
        // Stats: speed(30) + skill(25) + attack(18) + defense(10) + intelligence(2) = 85
        speed: 30,
        skill: 25,
        attack: 18,
        defense: 10,
        intelligence: 2,
      },

      three_sword: {
        // Haki: armHaki(12) + obsHaki(3) = 15
        armHaki: 12,
        obsHaki: 3,
        // Stats: attack(35) + skill(30) + speed(12) + defense(5) + intelligence(3) = 85
        attack: 35,
        skill: 30,
        speed: 12,
        defense: 5,
        intelligence: 3,
      },

      // ✅ ATIRADORES
      pistol_user: {
        // Haki: armHaki(2) + obsHaki(13) = 15
        armHaki: 2,
        obsHaki: 13,
        // Stats: speed(30) + skill(25) + attack(15) + intelligence(12) + defense(3) = 85
        speed: 30,
        skill: 25,
        attack: 15,
        intelligence: 12,
        defense: 3,
      },

      rifle_user: {
        // Haki: armHaki(4) + obsHaki(11) = 15
        armHaki: 4,
        obsHaki: 11,
        // Stats: attack(35) + intelligence(25) + skill(15) + speed(7) + defense(3) = 85
        attack: 35,
        intelligence: 25,
        skill: 15,
        speed: 7,
        defense: 3,
      },

      improvised_weapons: {
        // Haki: armHaki(2) + obsHaki(13) = 15
        armHaki: 2,
        obsHaki: 13,
        // Stats: intelligence(35) + speed(25) + skill(15) + attack(7) + defense(3) = 85
        intelligence: 35,
        speed: 25,
        skill: 15,
        attack: 7,
        defense: 3,
      },

      // ✅ SUPORTE
      utility_support: {
        // Haki: armHaki(4) + obsHaki(11) = 15
        armHaki: 4,
        obsHaki: 11,
        // Stats: intelligence(35) + skill(25) + defense(15) + speed(7) + attack(3) = 85
        intelligence: 35,
        skill: 25,
        defense: 15,
        speed: 7,
        attack: 3,
      },

      tank_support: {
        // Haki: armHaki(12) + obsHaki(3) = 15
        armHaki: 12,
        obsHaki: 3,
        // Stats: defense(40) + skill(20) + intelligence(15) + attack(7) + speed(3) = 85
        defense: 40,
        skill: 20,
        intelligence: 15,
        attack: 7,
        speed: 3,
      },

      healer_support: {
        // Haki: armHaki(2) + obsHaki(13) = 15
        armHaki: 2,
        obsHaki: 13,
        // Stats: intelligence(35) + defense(25) + speed(15) + skill(8) + attack(2) = 85
        intelligence: 35,
        defense: 25,
        speed: 15,
        skill: 8,
        attack: 2,
      },
    }

    // ✅ BUSCAR CATEGORIA E RETORNAR PRIORIDADES
    const category = categoryMappings[type as keyof typeof categoryMappings]

    if (category && priorities[category as keyof typeof priorities]) {
      return priorities[category as keyof typeof priorities]
    }

    // ✅ FALLBACK EQUILIBRADO
    return {
      attack: 15,
      defense: 15,
      speed: 15,
      intelligence: 15,
      skill: 15,
      armHaki: 12,
      obsHaki: 13,
    }
  }

  static getEligibleStats(character: Character): string[] {
    const eligible: string[] = []

    // Stats básicos sempre elegíveis
    eligible.push('attack', 'defense', 'speed', 'intelligence', 'skill')

    // Haki só elegível se já tiver ou se for de alto level
    if (character.stats.armHaki > 0 || character.level >= 50) {
      eligible.push('armHaki')
    }

    if (character.stats.obsHaki > 0 || character.level >= 50) {
      eligible.push('obsHaki')
    }

    // Devil Fruit só se já tiver ou chance especial
    if (character.stats.devilFruit > 0) {
      eligible.push('devilFruit')
    }

    return eligible
  }

  static distributePointsRandomly(
    totalPoints: number,
    eligibleStats: string[],
    priorities: { [key: string]: number },
  ): { [key: string]: number } {
    const distribution: { [key: string]: number } = {}
    let remainingPoints = totalPoints

    // Inicializar todos os stats elegíveis com 0
    eligibleStats.forEach((stat) => {
      distribution[stat] = 0
    })

    // ✅ DISTRIBUIR PONTOS UM POR VEZ
    while (remainingPoints > 0) {
      // Criar array ponderado baseado nas prioridades
      const weightedStats: string[] = []

      eligibleStats.forEach((stat) => {
        const weight = priorities[stat] || 10
        // Adicionar o stat múltiplas vezes baseado no peso
        for (let i = 0; i < weight; i++) {
          weightedStats.push(stat)
        }
      })

      // Selecionar stat aleatório do array ponderado
      const selectedStat = weightedStats[Math.floor(Math.random() * weightedStats.length)]

      // ✅ APLICAR LIMITADORES PARA EVITAR CONCENTRAÇÃO EXCESSIVA
      const maxPointsPerStat = Math.ceil(totalPoints * 0.6) // Máximo 60% dos pontos em um stat

      if (distribution[selectedStat] < maxPointsPerStat) {
        distribution[selectedStat]++
        remainingPoints--
      } else {
        // Se o stat atingiu o limite, remover das opções temporariamente
        const statIndex = eligibleStats.indexOf(selectedStat)
        if (statIndex > -1 && eligibleStats.length > 1) {
          eligibleStats.splice(statIndex, 1)
        }

        // Se todos os stats atingiram o limite, quebrar o loop
        if (eligibleStats.length === 0) {
          break
        }
      }
    }

    return distribution
  }

  static increaseStats(
    character: Character,
    newLevel: number,
    style: StyleCombat,
    fruit: DevilFruit | null = null,
  ): Partial<Character['stats']> {
    const totalPoints = newLevel
    const styleMultipliers = this.mockStyleCombact().find((st) => st.name == style.name)
    let statsPoints = 0
    let hakiPoints = 0

    for (let stat in styleMultipliers) {
      if (['armHaki', 'obsHaki'].includes(stat)) {
        hakiPoints += styleMultipliers[stat]
      } else if (stat != 'name') {
        statsPoints += styleMultipliers[stat]
      }
    }

    var statsAvailable = statsPoints
    var unlockHaki = false
    if (newLevel >= 50) {
      statsAvailable += hakiPoints
      if (character.potentialToHaveKngHaki > GenerationConfig.createEpic().allowKingHakiFor) {
        if (
          (Math.random() >
            (1 - character.potentialToHaveKngHaki) *
              (1 / GenerationConfig.createEpic().allowKingHakiFor) &&
            character.stats.kingHaki == 0) ||
          character.stats.kingHaki > 0
        ) {
          unlockHaki = true
          statsAvailable += 1
        }
      }
    }
    if (fruit) {
      statsAvailable += 1
    }

    const factor = totalPoints / statsAvailable

    const stats: Partial<Character['stats']> = {}

    stats.attack = character.stats.attack + Math.ceil(style.attack * factor)
    stats.defense = character.stats.defense + Math.ceil(style.defense * factor)
    stats.speed = character.stats.speed + Math.ceil(style.speed * factor)
    stats.intelligence = character.stats.intelligence + Math.ceil(style.intelligence * factor)
    stats.skill = character.stats.skill + Math.ceil(style.skill * factor)
    if (newLevel >= 50) {
      stats.armHaki = character.stats.armHaki + Math.ceil(style.armHaki * factor)
      stats.obsHaki = character.stats.obsHaki + Math.ceil(style.obsHaki * factor)
      if (unlockHaki) {
        stats.kingHaki =
          character.stats.kingHaki + Math.ceil(character.potentialToHaveKngHaki * factor)
      }
    }
    if (fruit) {
      stats.devilFruit = character.stats.devilFruit + Math.ceil(factor)
    }

    return stats
  }
  static mockStyleCombact(): StyleCombat[] {
    const styleCombats: Omit<StyleCombat, 'id'>[] = []

    STYLES.forEach((style) => {
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
  static calculateCrewPower(members: Character[], allFruits: DevilFruit[]): number {
    return members.reduce((total, member) => {
      return (
        total +
        this.calculatePower(
          member,
          allFruits.find((fruit) => member.devilFruitId === fruit.id),
        ) * (0.8 + 0.4 * (member.loyalty + 100 / 200))
      )
    }, 0)
  }

  static calculatePower(character: Character, fruit: DevilFruit | null = null): number {
    return PowerCalculationSystem.calculatePower(character, fruit)
  }

  static adjustBounty(bounty: number): number {
    return Math.ceil(bounty / 10000) * 10000
  }

  static determineShipLevel(captainLevel: number): number {
    if (captainLevel >= 0 && captainLevel < 10) return 1
    if (captainLevel >= 10 && captainLevel < 30) return 2
    if (captainLevel >= 30 && captainLevel < 60) return 3
    if (captainLevel >= 60 && captainLevel < 80) return 4
    if (captainLevel >= 80 && captainLevel <= 100) return 5

    // Fallback para níveis fora do range
    return Math.min(5, Math.max(1, Math.floor(captainLevel / 20) + 1))
  }

  static generateStats(
    level: number,
    styleCombat: string,
    potentialToHaveKngHaki: number,
  ): Character['stats'] {
    // Buscar o estilo de combate (assumindo IDs 1-4)
    const styleMultipliers = this.mockStyleCombact().find((st) => st.name == styleCombat)
    let statsPoints = 0
    let hakiPoints = 0

    for (let stat in styleMultipliers) {
      if (['armHaki', 'obsHaki'].includes(stat)) {
        hakiPoints += styleMultipliers[stat]
      } else if (stat != 'name') {
        statsPoints += styleMultipliers[stat]
      }
    }

    var points = 0

    for (var i = 2; i <= level; i++) {
      points += i
    }

    const quantPoints = points + Math.ceil(level * 1.5)
    const basePoints = quantPoints + statsPoints

    // Distribuir pontos baseado no estilo
    let totalStylePoints = statsPoints + hakiPoints
    if (
      potentialToHaveKngHaki > GenerationConfig.createEpic().allowKingHakiFor &&
      Math.random() <
        (1 - potentialToHaveKngHaki) * (1 / GenerationConfig.createEpic().allowKingHakiFor)
    ) {
      totalStylePoints += 1
    }

    if (level < 50) totalStylePoints = statsPoints

    return {
      attack: Math.ceil((basePoints * styleMultipliers.attack) / totalStylePoints),
      defense: Math.ceil((basePoints * styleMultipliers.defense) / totalStylePoints),
      speed: Math.ceil((basePoints * styleMultipliers.speed) / totalStylePoints),
      intelligence: Math.ceil((basePoints * styleMultipliers.intelligence) / totalStylePoints),
      skill: Math.ceil((basePoints * styleMultipliers.skill) / totalStylePoints),
      armHaki:
        level >= 50 ? Math.ceil((basePoints * styleMultipliers.armHaki) / totalStylePoints) : 0,
      obsHaki:
        level >= 50 ? Math.ceil((basePoints * styleMultipliers.obsHaki) / totalStylePoints) : 0,
      kingHaki:
        level >= 50 && totalStylePoints > statsPoints + hakiPoints
          ? Math.ceil((basePoints * 1) / totalStylePoints)
          : 0,
      devilFruit: 0, // Será calculado depois se tiver Devil Fruit
    }
  }

  static selectIslandForCrew(captain: Character, islands: Island[]): number {
    // Mapeia level → dificuldade alvo (level 1 → 0.3, level 100 → 30)
    const targetDifficulty = captain.level / (100 / 30)

    // Tolerância apertada: ±0.5 — personagens ficam próximos ao tier correto
    const suitableIslands = islands.filter((island) =>
      Math.abs(island.difficulty - targetDifficulty) <= 0.5
    )
    if (suitableIslands.length > 0) {
      return suitableIslands[this.randomBetween(0, suitableIslands.length - 1)]?.id || 1
    }

    // Fallback moderado: ±1.0
    const fallbackIslands = islands.filter((island) =>
      Math.abs(island.difficulty - targetDifficulty) <= 1.0
    )
    if (fallbackIslands.length > 0) {
      return fallbackIslands[this.randomBetween(0, fallbackIslands.length - 1)]?.id || 1
    }

    // Fallback final: ilha mais próxima disponível
    const sorted = [...islands].sort(
      (a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty)
    )
    return sorted[0]?.id || 1
  }

  // 🎯 Função auxiliar para calcular "rating" do personagem
  static getCharacterRating(character: Character, fruit: DevilFruit | null = null): string {
    const power = this.calculatePower(character, fruit)

    if (power >= 10000) return '🌟 Yonko Level'
    if (power >= 7500) return '⭐ Admiral Level'
    if (power >= 5000) return '🔥 Warlord Level'
    if (power >= 2500) return '💪 Veteran Level'
    if (power >= 1000) return '⚔️ Strong Level'
    if (power >= 500) return '🗡️ Skilled Level'
    if (power >= 200) return '👊 Rookie Level'
    return '🌱 Beginner Level'
  }

  // �� Função para calcular vantagem de tipo em batalha
  static getTypeAdvantage(attacker: Character, defender: Character): number {
    // Marines vs Pirates
    if (attacker.type === 'Marine' && defender.type === 'Pirate') {
      return 1.1 // 10% bonus
    }

    // Government vs qualquer um
    if (attacker.type === 'Government') {
      return 1.05 // 5% bonus (recursos superiores)
    }

    // Pirates vs Marines (experiência de combate)
    if (attacker.type === 'Pirate' && defender.type === 'Marine') {
      return 1.05 // 5% bonus
    }

    return 1.0 // Sem vantagem
  }

  // �� Função para calcular vantagem de tipo em batalha
  static getsStyleAdvantage(
    attacker: StyleCombat | null = null,
    defender: StyleCombat | null = null,
  ): number {
    let advantage = 1.0
    if (attacker && defender) {
      // Fighter vs Support
      if (attacker.name === 'Fighter' && defender.name === 'Support') {
        advantage = 1.1 // 10% bonus
      }

      // Swordsman vs Fighter
      if (attacker.name === 'Swordsman' && defender.name === 'Fighter') {
        advantage = 1.1 // 10% bonus
      }

      // Sniper vs Swordman
      if (attacker.name === 'Sniper' && defender.name === 'Swordsman') {
        advantage = 1.1 // 10% bonus
      }

      // Support vs Sniper
      if (attacker.name === 'Support' && defender.name === 'Sniper') {
        advantage = 1.1 // 10% bonus
      }
    }
    return advantage
  }

  static tryToRecruit(character: Character, target: Character): boolean {
    let success = false
    if (character.kindness > 0) {
      const factor = character.kindness / 100 + 1
      if (factor > target.loyalty) {
        success = true
      }
    }
    return success
  }

  // ✅ MÉTODOS PRINCIPAIS
  static getBountyDisplay(character: Character): string {
    switch (character.type) {
      case 'Pirate':
        return this.formatPirateBounty(character.bounty)

      case 'Marine':
        return this.formatMarineRank(character.bounty)

      case 'BountyHunter':
        return this.formatPirateBounty(character.bounty)

      case 'Government':
        return this.formatGovernmentRank(character.bounty)

      case 'Civilian':
        return 'Civil'

      default:
        return this.formatPirateBounty(character.bounty)
    }
  }

  static getBountyColor(type: string): string {
    switch (type) {
      case 'Pirate':
        return 'red-darken-2'

      case 'Marine':
        return 'blue-darken-2'

      case 'BountyHunter':
        return 'green-darken-2'

      case 'Government':
        return 'orange-darken-2'

      case 'Civilian':
        return 'grey-darken-1'

      default:
        return 'grey-darken-2'
    }
  }

  static getBountyIcon(type: string): string {
    switch (type) {
      case 'Pirate':
        return 'mdi-currency-usd'

      case 'Marine':
        return 'mdi-sail-boat'

      case 'BountyHunter':
        return 'mdi-trophy'

      case 'Government':
        return 'mdi-shield-crown'

      case 'Civilian':
        return 'mdi-account'

      default:
        return 'mdi-help'
    }
  }

  // ✅ FORMATAÇÃO PARA PIRATAS (BOUNTY NORMAL)
  static formatPirateBounty(bounty: number): string {
    if (bounty === 0) return 'Sem Recompensa'

    if (bounty >= 1000000000) {
      return `${(bounty / 1000000000).toFixed(2)}B B$`
    } else if (bounty >= 1000000) {
      return `${(bounty / 1000000).toFixed(2)}M B$`
    } else if (bounty >= 1000) {
      return `${(bounty / 1000).toFixed(2)}K B$`
    }
    return `${bounty} B$`
  }

  // ✅ FORMATAÇÃO PARA MARINES (ESTRELAS)
  static formatMarineRank(bounty: number): string {
    if (bounty === 0) return 'Recruta'

    // Dividir por 100 milhões para ter escala de 0-5 estrelas
    const starValue = bounty / 200000000

    // Limitar entre 0 e 5
    const clampedValue = Math.min(Math.max(starValue, 0), 5)

    // Arredondar para 0.5
    const roundedValue = Math.round(clampedValue * 2) / 2

    return this.formatStars(roundedValue)
  }

  static formatStars(value: number): string {
    if (value === 0) return 'Recruta'
    if (value <= 0.5) return '☆'
    if (value <= 1) return '★'
    if (value <= 1.5) return '★☆'
    if (value <= 2) return '★★'
    if (value <= 2.5) return '★★☆'
    if (value <= 3) return '★★★'
    if (value <= 3.5) return '★★★☆'
    if (value <= 4) return '★★★★'
    if (value <= 4.5) return '★★★★☆'
    return '★★★★★'
  }

  // ✅ FORMATAÇÃO PARA BOUNTY HUNTERS (RANKING)
  static formatBountyHunterRank(bounty: number): string {
    if (bounty === 0) return 'Iniciante'

    // Dividir por 1 bilhão para ter escala similar
    const rankValue = bounty / 1000000000

    // 5 níveis de ranking
    if (rankValue < 0.5) return 'Iniciante'
    if (rankValue < 1.5) return 'Renomado'
    if (rankValue < 2.5) return 'Experiente'
    if (rankValue < 4) return 'Veterano'
    return 'Mundial'
  }

  // ✅ FORMATAÇÃO PARA GOVERNO (HIERARQUIA)
  static formatGovernmentRank(bounty: number): string {
    if (bounty === 0) return 'Agente'

    // Dividir por 100 milhões para ter escala similar
    const rankValue = bounty / 100000000

    // 5 níveis hierárquicos
    if (rankValue < 0.5) return 'Agente'
    if (rankValue < 1.5) return 'Oficial'
    if (rankValue < 2.5) return 'Comandante'
    if (rankValue < 4) return 'Diretor'
    return 'Alto Comando'
  }

  static getBountyLabel(type: string): string{
    const labels: Record<string, string> = {
      Pirate: 'Recompensa',
      Marine: 'Patente Marine',
      BountyHunter: 'Rank de Caçador',
      Government: 'Rank Governamental',
    }
    return labels[type] || 'Rank'
  }

  static getTypeIcon(type: string): string{
  switch (type) {
    case 'Pirate': return 'mdi-pirate'
    case 'Marine': return 'mdi-anchor'
    case 'Government': return 'mdi-bank'
    case 'BountyHunter': return 'mdi-target'
    default: return 'mdi-account'
  }
}

static getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    Pirate: 'red-darken-1',
    Marine: 'blue-darken-1',
    BountyHunter: 'green-darken-1',
    Government: 'purple-darken-1',
    Revolutionary: 'orange-darken-1',
    Civilian: 'grey-darken-1'
  }
  return colors[type] || 'grey'
}

static formatType(type: string): string{
  return type.replace(/([A-Z])/g, ' $1').trim()
}

  /**
   * ✅ GERADOR PRINCIPAL COM MÚLTIPLAS OPÇÕES
   */
  static generate(
    min: number = 1,
    max: number = 100,
    distribution: 'gaussian' | 'exponential' | 'weighted' | 'hybrid' | 'normal' = 'normal',
    intensity: 'low' | 'medium' | 'high' = 'medium'
  ): number {
    switch (distribution) {
      case 'gaussian':
        return this.gaussianDistribution(min, max, intensity)
      
      case 'exponential':
        return this.exponentialDistribution(min, max, intensity)
      
      case 'weighted':
        return this.weightedDistribution(min, max, intensity)
      
      case 'hybrid':
        return this.hybridDistribution(min, max, intensity)
      
      default:
        return this.randomBetween(min, max)
    }
  }

  /**
   * ✅ DISTRIBUIÇÃO GAUSSIANA OTIMIZADA
   */
  private static gaussianDistribution(min: number, max: number, intensity: string): number {
    const range = max - min
    
    // ✅ Ajustar parâmetros baseado na intensidade
    let meanPercent: number
    let stdDevPercent: number
    
    switch (intensity) {
      case 'low':
        meanPercent = 0.35 // Média em 35% do range
        stdDevPercent = 0.25 // Desvio de 25%
        break
      case 'medium':
        meanPercent = 0.25 // Média em 25% do range
        stdDevPercent = 0.15 // Desvio de 15%
        break
      case 'high':
        meanPercent = 0.15 // Média em 15% do range
        stdDevPercent = 0.10 // Desvio de 10%
        break
    }
    
    const mean = min + (range * meanPercent)
    const stdDev = range * stdDevPercent
    
    // ✅ Box-Muller Transform
    let u = 0, v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    let result = z * stdDev + mean
    
    // ✅ Clamping com redistribuição
    if (result < min) result = min + Math.random() * (range * 0.1)
    if (result > max) result = max - Math.random() * (range * 0.1)
    
    return Math.round(result)
  }

  /**
   * ✅ DISTRIBUIÇÃO EXPONENCIAL
   */
  private static exponentialDistribution(min: number, max: number, intensity: string): number {
    let curve: number
    
    switch (intensity) {
      case 'low': curve = 1.5; break
      case 'medium': curve = 2.5; break
      case 'high': curve = 4; break
    }
    
    const random = Math.random()
    const curved = 1 - Math.pow(random, curve)
    const result = min + (curved * (max - min))
    
    return Math.round(result)
  }

  /**
   * ✅ DISTRIBUIÇÃO COM PESOS
   */
  private static weightedDistribution(min: number, max: number, intensity: string): number {
    let weights: number[]
    
    switch (intensity) {
      case 'low':
        weights = [40, 30, 20, 8, 2] // Distribuição mais suave
        break
      case 'medium':
        weights = [45, 25, 15, 10, 5] // Distribuição padrão
        break
      case 'high':
        weights = [70, 20, 8, 2] // Distribuição extrema
        break
    }
    
    return this.weightedRandomInternal(min, max, weights)
  }

  /**
   * ✅ DISTRIBUIÇÃO HÍBRIDA (COMBINA GAUSSIANA + EXPONENCIAL)
   */
  private static hybridDistribution(min: number, max: number, intensity: string): number {
    // ✅ 70% gaussiana, 30% exponencial para variação
    if (Math.random() < 0.7) {
      return this.gaussianDistribution(min, max, intensity)
    } else {
      return this.exponentialDistribution(min, max, intensity)
    }
  }

  /**
   * ✅ FUNÇÃO AUXILIAR PARA PESOS
   */
  private static weightedRandomInternal(min: number, max: number, weights: number[]): number {
    const range = max - min + 1
    const segmentSize = Math.ceil(range / weights.length)
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    
    let random = Math.random() * totalWeight
    let selectedSegment = 0
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        selectedSegment = i
        break
      }
    }
    
    const segmentMin = min + (selectedSegment * segmentSize)
    const segmentMax = Math.min(max, segmentMin + segmentSize - 1)
    
    return Math.floor(Math.random() * (segmentMax - segmentMin + 1)) + segmentMin
  }
}
