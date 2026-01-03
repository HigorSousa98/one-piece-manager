// src/utils/civilianRecruitmentSystem.ts
import { db, type Character } from './database'

export interface RecruitmentAnalysis {
  baseChance: number
  kindnessBonus: number
  levelBonus: number
  loyaltyPenalty: number
  totalChance: number
  canAttempt: boolean
  reason?: string
}

export interface RecruitmentResult {
  success: boolean
  message: string
  newLoyalty?: number
  loyaltyChange?: number
}

export class CivilianRecruitmentSystem {
  // ✅ ANALISAR CHANCE DE RECRUTAMENTO
  static async analyzeRecruitmentChance(
    recruiter: Character,
    civilian: Character,
  ): Promise<RecruitmentAnalysis> {
    try {
      console.log('🔍 Analisando chance de recrutamento...')
      console.log(
        'Recruiter:',
        recruiter.name,
        'Kindness:',
        recruiter.kindness,
        'Level:',
        recruiter.level,
      )
      console.log(
        'Civilian:',
        civilian.name,
        'Loyalty:',
        civilian.loyalty,
        'Level:',
        civilian.level,
      )

      // Verificar se pode tentar recrutar
      if (civilian.crewId && civilian.crewId !== 0) {
        return {
          baseChance: 0,
          kindnessBonus: 0,
          levelBonus: 0,
          loyaltyPenalty: 0,
          totalChance: 0,
          canAttempt: false,
          reason: 'Este civil já faz parte de um crew',
        }
      }

      if (recruiter.kindness < 0) {
        return {
          baseChance: 0,
          kindnessBonus: 0,
          levelBonus: 0,
          loyaltyPenalty: 0,
          totalChance: 0,
          canAttempt: false,
          reason: 'Sua kindness deve ser positiva para recrutar',
        }
      }

      // ✅ CÁLCULOS DE CHANCE

      // 1. Chance base (30%)
      const baseChance = 30

      // 2. Bonus por kindness do recruiter (max +40%)
      const kindnessBonus = Math.min(40, recruiter.kindness * 0.5)

      // 3. Bonus por diferença de level (max +20%)
      const levelDifference = recruiter.level - civilian.level
      const levelBonus = Math.min(20, Math.max(0, levelDifference * 2))

      // 4. Penalty por loyalty do civil (quanto maior, mais difícil)
      const loyaltyPenalty = -(civilian.loyalty * 0.3)

      // 5. Chance total
      const totalChance = Math.min(
        95,
        Math.max(5, baseChance + kindnessBonus + levelBonus + loyaltyPenalty),
      )

      const analysis: RecruitmentAnalysis = {
        baseChance,
        kindnessBonus,
        levelBonus,
        loyaltyPenalty,
        totalChance,
        canAttempt: true,
      }

      console.log('📊 Análise completa:', analysis)

      return analysis
    } catch (error) {
      console.error('❌ Erro na análise de recrutamento:', error)
      return {
        baseChance: 0,
        kindnessBonus: 0,
        levelBonus: 0,
        loyaltyPenalty: 0,
        totalChance: 0,
        canAttempt: false,
        reason: 'Erro interno na análise',
      }
    }
  }

  // ✅ TENTAR RECRUTAMENTO
  static async attemptRecruitment(
    recruiter: Character,
    civilian: Character,
  ): Promise<RecruitmentResult> {
    try {
      console.log('🎯 Executando tentativa de recrutamento...')

      // Obter análise atual
      const analysis = await this.analyzeRecruitmentChance(recruiter, civilian)

      if (!analysis.canAttempt) {
        return {
          success: false,
          message: analysis.reason || 'Não é possível recrutar este civil',
        }
      }

      // Rolar dados
      const roll = Math.random() * 100
      const success = roll <= analysis.totalChance

      console.log(
        `🎲 Roll: ${roll.toFixed(2)} vs ${analysis.totalChance.toFixed(2)} = ${success ? 'SUCESSO' : 'FALHA'}`,
      )

      if (success) {
        // ✅ SUCESSO NO RECRUTAMENTO

        // Calcular nova loyalty (baseada na kindness do recruiter)
        const loyaltyIncrease =
          Math.floor(recruiter.kindness * 0.3) + Math.floor(Math.random() * 20) + 10
        const newLoyalty = Math.min(100, civilian.loyalty + loyaltyIncrease)

        // Atualizar civil no banco
        await db.characters.update(civilian.id!, {
          crewId: recruiter.crewId,
          loyalty: newLoyalty,
          type: recruiter.type,
        })

        console.log(`✅ ${civilian.name} recrutado! Nova loyalty: ${newLoyalty}`)

        return {
          success: true,
          message: `${civilian.name} decidiu se juntar ao seu crew!`,
          newLoyalty,
          loyaltyChange: loyaltyIncrease,
        }
      } else {
        // ❌ FALHA NO RECRUTAMENTO

        // Pequena redução na loyalty por tentar recrutar
        const loyaltyDecrease = Math.floor(Math.random() * 5) + 1
        const newLoyalty = Math.max(-100, civilian.loyalty - loyaltyDecrease)

        await db.characters.update(civilian.id!, {
          loyalty: newLoyalty,
        })

        console.log(`❌ Recrutamento falhou. Loyalty reduzida para: ${newLoyalty}`)

        return {
          success: false,
          message: `${civilian.name} agradeceu pela oferta, mas preferiu não se juntar ao seu crew.`,
          newLoyalty,
          loyaltyChange: -loyaltyDecrease,
        }
      }
    } catch (error) {
      console.error('❌ Erro na tentativa de recrutamento:', error)
      return {
        success: false,
        message: 'Erro interno durante o recrutamento',
      }
    }
  }

  // ✅ VERIFICAR SE PODE RECRUTAR
  static async canRecruit(
    recruiter: Character,
    civilian: Character,
  ): Promise<{
    canRecruit: boolean
    reason?: string
  }> {
    try {
      if (civilian.crewId && civilian.crewId !== 0) {
        return {
          canRecruit: false,
          reason: 'Civil já faz parte de um crew',
        }
      }

      if (recruiter.kindness < 0) {
        return {
          canRecruit: false,
          reason: 'Kindness deve ser positiva',
        }
      }

      if (!recruiter.crewId) {
        return {
          canRecruit: false,
          reason: 'Você precisa estar em um crew',
        }
      }

      return { canRecruit: true }
    } catch (error) {
      console.error('❌ Erro ao verificar possibilidade de recrutamento:', error)
      return {
        canRecruit: false,
        reason: 'Erro interno',
      }
    }
  }

  // ✅ OBTER ESTATÍSTICAS DE RECRUTAMENTO
  static async getRecruitmentStatistics(recruiterId: number): Promise<{
    totalAttempts: number
    successfulRecruitments: number
    successRate: number
    averageLoyaltyGained: number
  }> {
    // Implementar se necessário para tracking
    return {
      totalAttempts: 0,
      successfulRecruitments: 0,
      successRate: 0,
      averageLoyaltyGained: 0,
    }
  }
}
