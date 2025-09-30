// src/utils/recruitmentSystem.ts

import { db, Character, Crew, Ship } from '@/utils/database'
import { GenerationConfig } from '@/utils/generationConfig'
import { CrewNameGenerator } from '@/data/crewNames'
import { GameLogic } from './gameLogic';

export interface RecruitmentAttempt {
  canRecruit: boolean;
  reason?: string;
  recruitmentChance: number;
  loyaltyValue: number;
  kindnessEffect: 'peaceful' | 'forceful';
}

export class RecruitmentSystem {
  // 🎯 VALIDAR SE PODE RECRUTAR
  static async validateRecruitment(
    recruiter: Character, 
    target: Character, 
    targetCrew: Crew,
    battleType: 'adventure' | 'crew_battle'
  ): Promise<RecruitmentAttempt> {
    
    // ❌ VALIDAÇÕES BÁSICAS
    
    // 1. Só funciona em aventuras individuais
    if (battleType === 'crew_battle') {
      return {
        canRecruit: false,
        reason: 'Recrutamento não é possível em batalhas de crews no mar',
        recruitmentChance: 0,
        loyaltyValue: 0,
        kindnessEffect: 'peaceful'
      };
    }
    
    // 2. Não pode recrutar a si mesmo
    if (recruiter.id === target.id) {
      return {
        canRecruit: false,
        reason: 'Não é possível recrutar a si mesmo',
        recruitmentChance: 0,
        loyaltyValue: 0,
        kindnessEffect: 'peaceful'
      };
    }
    
    // 3. Não pode recrutar se já estão no mesmo crew
    if (recruiter.crewId === target.crewId) {
      return {
        canRecruit: false,
        reason: 'Já fazem parte do mesmo crew',
        recruitmentChance: 0,
        loyaltyValue: 0,
        kindnessEffect: 'peaceful'
      };
    }
    
    // 4. Validar tamanho do crew do alvo
    if (!await this.validateTargetCrewSize(recruiter.crewId, GenerationConfig.createEpic())) {
      return {
        canRecruit: false,
        reason: 'O seu Crew está cheio!',
        recruitmentChance: 0,
        loyaltyValue: 0,
        kindnessEffect: 'peaceful'
      };
    }
    
    // 5. Validar compatibilidade de tipos
    if (!this.validateTypeCompatibility(recruiter.type, target.type)) {
      return {
        canRecruit: false,
        reason: `${recruiter.type} não pode recrutar ${target.type}`,
        recruitmentChance: 0,
        loyaltyValue: 0,
        kindnessEffect: 'peaceful'
      };
    }


    
    // ✅ CALCULAR CHANCES E LOYALTY
    const recruitmentData = this.calculateRecruitmentChance(recruiter, target);
    
    return {
      canRecruit: true,
      recruitmentChance: recruitmentData.chance,
      loyaltyValue: recruitmentData.loyalty,
      kindnessEffect: recruitmentData.effect
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
  
  // 🎭 VALIDAR COMPATIBILIDADE DE TIPOS
  private static validateTypeCompatibility(recruiterType: string, targetType: string): boolean {
    const compatibilityMatrix: Record<string, string[]> = {
      'Pirate': ['Pirate', 'BountyHunter'],
      'Marine': ['Marine', 'BountyHunter'],
      'BountyHunter': ['BountyHunter', 'Pirate', 'Marine'],
      'Government': ['Government', 'Marine'], // Assumindo que Government pode recrutar Marines
      'Civillian': [] // Civis não recrutam ninguém
    };
    
    return compatibilityMatrix[recruiterType]?.includes(targetType) || false;
  }
  
  // 🎲 CALCULAR CHANCE DE RECRUTAMENTO E LOYALTY
  private static calculateRecruitmentChance(recruiter: Character, target: Character): {
    chance: number;
    loyalty: number;
    effect: 'peaceful' | 'forceful';
  } {
    const kindness = recruiter.kindness;
    
    // 📊 CALCULAR CHANCE BASE (0-100%)
    const kindnessAbs = Math.abs(kindness);
    const baseChance = Math.min(100, kindnessAbs); // Quanto maior o absoluto, maior a chance
    
    // 🎯 AJUSTES BASEADOS EM OUTROS FATORES
    let finalChance = baseChance;
    
    // Diferença de level (mais fácil recrutar quem é mais fraco)
    const levelDifference = recruiter.level - target.level;
    if (levelDifference > 0) {
      finalChance += Math.min(20, levelDifference * 2); // +2% por level de diferença, máximo +20%
    } else {
      finalChance += Math.max(-30, levelDifference); // Penalidade se o alvo for mais forte
    }
    
    // Loyalty do alvo (mais difícil recrutar quem é leal ao crew atual)
    finalChance -= Math.max(0, target.loyalty * 0.3); // -0.3% por ponto de loyalty
    
    // Garantir que a chance fique entre 5% e 95%
    finalChance = Math.max(5, Math.min(95, finalChance));
    
    // 💖 CALCULAR LOYALTY INICIAL
    let loyalty: number;
    let effect: 'peaceful' | 'forceful';
    
    if (kindness >= 0) {
      // Recrutamento pacífico
      effect = 'peaceful';
      loyalty = Math.max(-20, kindness - 100); // Varia de -20 a 0
    } else {
      // Recrutamento forçado
      effect = 'forceful';
      loyalty = Math.min(-50, kindness); // Varia de -100 a -50
    }
    
    return {
      chance: Math.round(finalChance),
      loyalty: Math.round(loyalty),
      effect
    };
  }
  
  // 🎲 TENTAR RECRUTAMENTO
  static async attemptRecruitment(
    recruiter: Character,
    target: Character,
    recruitmentData: RecruitmentAttempt
  ): Promise<{
    success: boolean;
    message: string;
    newLoyalty?: number;
    bonusMessage?: string;
  }> {
    
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
      
      // Atualizar crew do target
      await db.characters.update(target.id!, {
        crewId: recruiter.crewId,
        loyalty: recruitmentData.loyaltyValue,
        type: recruiter.type, 
        position: 'Crew Member'
      });

      //retirar o target do seu crew caso seja capitão e definir um novo capitão

      const crews = await db.crews.toArray()
      const characters = await db.characters.toArray()
      const actualCrew = crews.find(crew => crew.captainId === target.id);
      const allDevilFruits = await db.devilFruits.toArray()

      if(actualCrew){
        const characterOnCrew = characters.filter(char => char.crewId === actualCrew.id && char.id != target.id)
        if(characterOnCrew && characterOnCrew.length>0){
          characterOnCrew.sort((a, b) => {
            let aDF = allDevilFruits.find(df => df.id === a.devilFruitId)
            let bDF = allDevilFruits.find(df => df.id === b.devilFruitId)
            return GameLogic.calculatePower(b, bDF) - GameLogic.calculatePower(a, aDF)
          })
          await db.crews.update(actualCrew.id!, {
            captainId: characterOnCrew[0].id
          });
        }
        else{
          await db.crews.update(actualCrew.id!, {
            captainId: 0,
            currentIsland: 0
          });
        }
      }
      
      
      // Mensagens baseadas no tipo de recrutamento
      let message: string;
      let bonusMessage: string | undefined;
      
      if (recruitmentData.kindnessEffect === 'peaceful') {
        message = `🤝 ${target.name} se juntou pacificamente ao crew de ${recruiter.name}!`;
        bonusMessage = `💚 Loyalty inicial: ${recruitmentData.loyaltyValue} (recrutamento pacífico)`;
      } else {
        message = `⚔️ ${target.name} foi forçado a se juntar ao crew de ${recruiter.name}!`;
        bonusMessage = `💔 Loyalty inicial: ${recruitmentData.loyaltyValue} (recrutamento forçado)`;
      }
      
      // Log da ação
      console.log(`🎯 Recrutamento bem-sucedido: ${recruiter.name} recrutou ${target.name}`);
      console.log(`📊 Chance: ${recruitmentData.recruitmentChance}% | Roll: ${roll.toFixed(1)}%`);
      
      return {
        success: true,
        message,
        newLoyalty: recruitmentData.loyaltyValue,
        bonusMessage
      };
      
    } else {
      // ❌ RECRUTAMENTO FALHOU
      
      let failureMessage: string;
      
      if (recruitmentData.kindnessEffect === 'peaceful') {
        failureMessage = `😔 ${target.name} recusou educadamente o convite de ${recruiter.name}`;
      } else {
        failureMessage = `😠 ${target.name} resistiu à tentativa de recrutamento forçado de ${recruiter.name}!`;
      }
      
      console.log(`❌ Recrutamento falhou: ${recruiter.name} tentou recrutar ${target.name}`);
      console.log(`📊 Chance: ${recruitmentData.recruitmentChance}% | Roll: ${roll.toFixed(1)}%`);
      
      return {
        success: false,
        message: failureMessage
      };
    }
  }

  private static createCrewData = (captain: Character, currentIsland: number): Omit<Crew, 'id'> => ({
    name: captain.type === 'Marine' ? CrewNameGenerator.generateMarineBaseName() : captain.type === 'Pirate' ? CrewNameGenerator.generatePirateCrewName() : CrewNameGenerator.generateBountyHunterOrgName(),
    captainId: captain.id!,
    treasury: captain.type === 'Marine' 
      ? this.randomBetween(1000000, 50000000)
      : this.randomBetween(captain.bounty * 0.5, captain.bounty * 10),
    reputation: captain.type === 'Marine'
      ? this.randomBetween(5000, 100000)
      : this.randomBetween(captain.bounty * 0.3, captain.bounty * 1.5),
    currentIsland: currentIsland,
    docked: Math.random() < GenerationConfig.createEpic().dockedFactor ? 1 : 0,
    foundedAt: new Date(),
    type: captain.type as "Pirate" | "Marine" | "BountyHunter" 
  })

  private static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  static async removeMemberFromCrew(memberId: number){
    const character = await db.characters.get(memberId)
    if(character){
      const actualCrew = await db.crews.get(character.crewId)
      if(actualCrew){
        const newCrew = this.createCrewData(character, actualCrew.currentIsland)
        const crewId = await db.crews.add(newCrew) as number

        await db.characters.update(memberId!, {
          crewId: crewId,
          loyalty: 100,
          type: character.type, 
          position: 'Captain'
        });
      }
    } 
  }
    
  
  // 📊 OBTER INFORMAÇÕES DETALHADAS PARA UI
  static getRecruitmentInfo(
    recruiter: Character,
    target: Character,
    recruitmentData: RecruitmentAttempt
  ): {
    canRecruit: boolean;
    chancePercentage: number;
    loyaltyPreview: number;
    effectDescription: string;
    riskAssessment: 'low' | 'medium' | 'high';
    recommendation: string;
  } {
    
    if (!recruitmentData.canRecruit) {
      return {
        canRecruit: false,
        chancePercentage: 0,
        loyaltyPreview: 0,
        effectDescription: recruitmentData.reason || '',
        riskAssessment: 'high',
        recommendation: 'Recrutamento não é possível'
      };
    }
    
    // Avaliar risco
    let riskAssessment: 'low' | 'medium' | 'high';
    if (recruitmentData.recruitmentChance >= 70) {
      riskAssessment = 'low';
    } else if (recruitmentData.recruitmentChance >= 40) {
      riskAssessment = 'medium';
    } else {
      riskAssessment = 'high';
    }
    
    // Descrição do efeito
    const effectDescription = recruitmentData.kindnessEffect === 'peaceful'
      ? `Recrutamento pacífico - ${target.name} se juntará com loyalty ${recruitmentData.loyaltyValue}`
      : `Recrutamento forçado - ${target.name} se juntará com loyalty ${recruitmentData.loyaltyValue}`;
    
    // Recomendação
    let recommendation: string;
    if (riskAssessment === 'low') {
      recommendation = 'Alta chance de sucesso - Recomendado!';
    } else if (riskAssessment === 'medium') {
      recommendation = 'Chance moderada - Considere os riscos';
    } else {
      recommendation = 'Baixa chance - Alto risco de falha';
    }
    
    return {
      canRecruit: true,
      chancePercentage: recruitmentData.recruitmentChance,
      loyaltyPreview: recruitmentData.loyaltyValue,
      effectDescription,
      riskAssessment,
      recommendation
    };
  }
}