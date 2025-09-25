// src/utils/civilianRecruitmentSystem.ts

import { db, type Character, Crew } from './database'
import { GenerationConfig } from '@/utils/generationConfig'

export interface CivilianRecruitmentAttempt {
  canRecruit: boolean;
  reason?: string;
  recruitmentChance: number;
  loyaltyValue: number;
  requirements: {
    kindnessRequired: number;
    hasPositiveKindness: boolean;
  };
}

export class CivilianRecruitmentSystem {
  
  // 🎯 VALIDAR RECRUTAMENTO DE CIVIL
  static async validateCivilianRecruitment(
    recruiter: Character,
    civilian: Character
  ): Promise<CivilianRecruitmentAttempt> {
    
    // ❌ VALIDAÇÕES BÁSICAS
    
    // 1. Só personagens com kindness positivo podem recrutar civis
    if (recruiter.kindness <= 0) {
      return {
        canRecruit: false,
        reason: 'Apenas personagens bondosos (Kindness > 0) podem recrutar civis pacificamente',
        recruitmentChance: 0,
        loyaltyValue: 0,
        requirements: {
          kindnessRequired: 1,
          hasPositiveKindness: false
        }
      };
    }
    
    // 2. Civil não pode já estar em um crew
    if (civilian.crewId) {
      return {
        canRecruit: false,
        reason: 'Este civil já faz parte de um crew',
        recruitmentChance: 0,
        loyaltyValue: 0,
        requirements: {
          kindnessRequired: 1,
          hasPositiveKindness: true
        }
      };
    }
    
    // 3. Não pode recrutar a si mesmo
    if (recruiter.id === civilian.id) {
      return {
        canRecruit: false,
        reason: 'Não é possível recrutar a si mesmo',
        recruitmentChance: 0,
        loyaltyValue: 0,
        requirements: {
          kindnessRequired: 1,
          hasPositiveKindness: true
        }
      };
    }

    if (recruiter.id === civilian.id) {
      return {
        canRecruit: false,
        reason: 'Não é possível recrutar a si mesmo',
        recruitmentChance: 0,
        loyaltyValue: 0,
        requirements: {
          kindnessRequired: 1,
          hasPositiveKindness: true
        }
      };
    }

    if (!await this.validateTargetCrewSize(recruiter.crewId, GenerationConfig.createEpic())) {
        return {
          canRecruit: false,
          reason: 'O seu Crew está cheio!',
          recruitmentChance: 0,
          loyaltyValue: 0,
          requirements: {
            kindnessRequired: 1,
            hasPositiveKindness: true
          }
        };
      }
    
    // ✅ CALCULAR CHANCES E LOYALTY
    const recruitmentData = this.calculateCivilianRecruitmentChance(recruiter, civilian);
    
    return {
      canRecruit: true,
      recruitmentChance: recruitmentData.chance,
      loyaltyValue: recruitmentData.loyalty,
      requirements: {
        kindnessRequired: 1,
        hasPositiveKindness: true
      }
    };
  }

  // 👥 VALIDAR TAMANHO DO CREW ALVO
    private static async validateTargetCrewSize(targetCrew: number | undefined, generator: GenerationConfig): Promise<boolean> {
      const crewMembers = targetCrew ? await db.characters.where('crewId').equals(targetCrew).toArray() : null
      const ship = targetCrew ? await db.ships.where('crewId').equals(targetCrew).limit(1).toArray() : null
      if(crewMembers && ship){
        if(crewMembers.length < (ship[0].level * generator.shipFactor)){
          return true
        }
      }
      return false; // Placeholder - implementar contagem real
    }
  
  // 🎲 CALCULAR CHANCE DE RECRUTAMENTO DE CIVIL
  private static calculateCivilianRecruitmentChance(recruiter: Character, civilian: Character): {
    chance: number;
    loyalty: number;
  } {
    
    // 📊 CHANCE BASE (baseada no kindness)
    let baseChance = Math.min(80, recruiter.kindness * 0.8); // Máximo 80%
    
    // 🎯 AJUSTES BASEADOS EM OUTROS FATORES
    
    // Diferença de level (civis preferem pessoas mais experientes)
    const levelDifference = recruiter.level - civilian.level;
    if (levelDifference > 0) {
      baseChance += Math.min(15, levelDifference * 1.5); // +1.5% por level, máximo +15%
    } else {
      baseChance += Math.max(-10, levelDifference * 0.5); // Pequena penalidade se civil for mais forte
    }
    
    // Bonus por tipo de personagem (civis confiam mais em certos tipos)
    switch (recruiter.type) {
      case 'Marine':
        baseChance += 10; // Civis confiam em marines
        break;
      case 'Pirate':
        baseChance -= 5; // Civis são mais cautelosos com piratas
        break;
      case 'BountyHunter':
        baseChance += 5; // Neutro positivo
        break;
      case 'Government':
        baseChance += 8; // Confiança em autoridade
        break;
    }
    
    // Garantir que a chance fique entre 20% e 90%
    const finalChance = Math.max(20, Math.min(90, baseChance));
    
    // 💖 CALCULAR LOYALTY INICIAL (sempre positivo para civis)
    // Civis recrutados pacificamente sempre começam com loyalty positivo
    const loyalty = Math.min(50, Math.max(10, recruiter.kindness * 0.4 + 10));
    
    return {
      chance: Math.round(finalChance),
      loyalty: Math.round(loyalty)
    };
  }
  
  // 🤝 TENTAR RECRUTAMENTO DE CIVIL
  static async attemptCivilianRecruitment(
    recruiter: Character,
    civilian: Character
  ): Promise<{
    success: boolean;
    message: string;
    newLoyalty?: number;
    bonusMessage?: string;
  }> {
    
    const recruitmentData = await this.validateCivilianRecruitment(recruiter, civilian);
    
    if (!recruitmentData.canRecruit) {
      return {
        success: false,
        message: recruitmentData.reason || 'Recrutamento não é possível'
      };
    }
    
    // 🎲 ROLAR DADOS
    const roll = Math.random() * 100;
    const success = roll <= recruitmentData.recruitmentChance;
    
    if (success) {
      // ✅ RECRUTAMENTO BEM-SUCEDIDO
      
      // Atualizar crew do civil
      await db.characters.update(civilian.id!, {
        crewId: recruiter.crewId,
        loyalty: recruitmentData.loyaltyValue,
        type: recruiter.type
      });
      
      const message = `🤝 ${civilian.name} ficou impressionado com sua bondade e decidiu se juntar ao seu crew!`;
      const bonusMessage = `💚 ${civilian.name} se juntou com loyalty ${recruitmentData.loyaltyValue} (recrutamento pacífico)`;
      
      // Log da ação
      console.log(`🎯 Recrutamento de civil bem-sucedido: ${recruiter.name} recrutou ${civilian.name}`);
      console.log(`📊 Chance: ${recruitmentData.recruitmentChance}% | Roll: ${roll.toFixed(1)}%`);
      console.log(`�� Loyalty inicial: ${recruitmentData.loyaltyValue}`);
      
      return {
        success: true,
        message,
        newLoyalty: recruitmentData.loyaltyValue,
        bonusMessage
      };
      
    } else {
      // ❌ RECRUTAMENTO FALHOU
      
      const failureMessage = `😔 ${civilian.name} agradeceu sua ajuda, mas preferiu continuar sua vida atual na ilha.`;
      
      console.log(`❌ Recrutamento de civil falhou: ${recruiter.name} tentou recrutar ${civilian.name}`);
      console.log(`📊 Chance: ${recruitmentData.recruitmentChance}% | Roll: ${roll.toFixed(1)}%`);
      
      return {
        success: false,
        message: failureMessage
      };
    }
  }
  
  // 📊 OBTER INFORMAÇÕES PARA UI
  static async getCivilianRecruitmentInfo(
    recruiter: Character,
    civilian: Character
  ): Promise<{
    canRecruit: boolean;
    chancePercentage: number;
    loyaltyPreview: number;
    kindnessRequirement: number;
    recommendation: string;
    riskAssessment: 'low' | 'medium' | 'high';
  }> {
    
    const recruitmentData = await this.validateCivilianRecruitment(recruiter, civilian);
    
    if (!recruitmentData.canRecruit) {
      return {
        canRecruit: false,
        chancePercentage: 0,
        loyaltyPreview: 0,
        kindnessRequirement: recruitmentData.requirements.kindnessRequired,
        recommendation: recruitmentData.reason || 'Recrutamento não é possível',
        riskAssessment: 'high'
      };
    }
    
    // Avaliar risco
    let riskAssessment: 'low' | 'medium' | 'high';
    if (recruitmentData.recruitmentChance >= 70) {
      riskAssessment = 'low';
    } else if (recruitmentData.recruitmentChance >= 50) {
      riskAssessment = 'medium';
    } else {
      riskAssessment = 'high';
    }
    
    // Recomendação
    let recommendation: string;
    if (riskAssessment === 'low') {
      recommendation = 'Excelente chance! Sua bondade impressiona.';
    } else if (riskAssessment === 'medium') {
      recommendation = 'Boa chance de sucesso. Vale a pena tentar.';
    } else {
      recommendation = 'Chance moderada. Considere aumentar sua bondade.';
    }
    
    return {
      canRecruit: true,
      chancePercentage: recruitmentData.recruitmentChance,
      loyaltyPreview: recruitmentData.loyaltyValue,
      kindnessRequirement: 1,
      recommendation,
      riskAssessment
    };
  }
}