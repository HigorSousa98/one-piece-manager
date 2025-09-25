// utils/gameLogic.ts
import { Character, StyleCombat, DevilFruit, Crew } from '@/utils/database'
import {GenerationConfig, GenerationSettings} from '@/utils/generationConfig'

export class GameLogic {
  static calculateExperienceGain(winner: Character, loser: Character): number {
  // 1. 📊 EXPERIÊNCIA BASE - Baseada no level do oponente
  const baseExp = 50 + (loser.level * 25); // 75 XP no level 1, 300 XP no level 10
  
  // 2. 📈 FATOR DE DIFERENÇA DE LEVEL
  const levelDifference = loser.level - winner.level;
  let levelMultiplier = 1.0;
  
  if (levelDifference > 0) {
    // Oponente mais forte = mais XP (até 3x)
    levelMultiplier = 1.0 + Math.min(levelDifference * 0.3, 2.0);
  } else if (levelDifference < 0) {
    // Oponente mais fraco = menos XP (mínimo 10%)
    const penalty = Math.abs(levelDifference) * 0.15;
    levelMultiplier = Math.max(0.1, 1.0 - penalty);
  }
  
  // 3. ⚔️ FATOR DE DIFERENÇA DE PODER
  const winnerPower = this.calculatePower(winner);
  const loserPower = this.calculatePower(loser);
  
  let powerMultiplier = 1.0;
  
  if (loserPower > winnerPower) {
    // Derrotar alguém mais forte = bonus de XP
    const powerRatio = loserPower / winnerPower;
    powerMultiplier = 1.0 + Math.min((powerRatio - 1.0) * 0.5, 1.5); // Até 2.5x
  } else if (winnerPower > loserPower) {
    // Derrotar alguém mais fraco = menos XP
    const powerRatio = winnerPower / loserPower;
    const reduction = Math.min((powerRatio - 1.0) * 0.3, 0.8);
    powerMultiplier = 1.0 //Math.max(0.2, 1.0 - reduction); // Mínimo 20% //editado para 1
  }
  
  // 4. 🏆 BONUS POR TIPO DE OPONENTE
  let typeBonus = 1.0;
  
  // Bonus por derrotar tipos específicos
  if (loser.type === 'Government') {
    typeBonus = 1.4; // Governo é mais difícil
  } else if (loser.type === 'Marine' && winner.type === 'Pirate') {
    typeBonus = 1.2; // Piratas vs Marines
  } else if (loser.type === 'Pirate' && winner.type === 'Marine') {
    typeBonus = 1.15; // Marines vs Piratas
  }
  
  // 5. 🎖️ BONUS POR POSIÇÃO DO OPONENTE
  let positionBonus = 1.1;
  
  switch (loser.position) {
    case 'Captain':
      positionBonus = 1.5;
      break;
    case 'First Mate':
      positionBonus = 1.3;
      break;
  }
  
  // 6. 💰 FATOR BOUNTY - Oponentes famosos dão mais XP
  let bountyMultiplier = 1.0;
  
  if (loser.bounty > 0 || loser.type === 'Marine') {
    // Logarítmico para evitar valores absurdos
    const bountyFactor = Math.log10(loser.bounty / 1000000 + 1); // Base 1M berries
    bountyMultiplier = 1.0 + (bountyFactor * 0.2); // Máximo ~40% bonus
  }
  
  // 7. 🥊 BONUS POR HABILIDADES ESPECIAIS
  let skillBonus = 1.0;
  
  // Bonus por derrotar usuários de Haki avançado
  if (loser.stats.kingHaki > 0) {
    skillBonus += 0.5; // +50% por Conqueror's Haki
  }
  
  if (loser.stats.armHaki > winner.stats.armHaki || loser.stats.obsHaki > winner.stats.obsHaki) {
    skillBonus += 0.2; // +20% por Haki avançado
  }
  
  // Bonus por derrotar usuários de Devil Fruit
  if (loser.stats.devilFruit > 0) {
    skillBonus += 0.3; // +30% por Devil Fruit
  }
  
  // 8. 📚 FATOR DE APRENDIZADO - Baseado na diferença de experiência
  let learningMultiplier = 1.0;
  
  
  // 9. 🎲 FATOR DE DIFICULDADE DA BATALHA
  let difficultyMultiplier = 1.0;
  
  // Se a batalha foi muito difícil (powers próximos), mais XP
  const powerDifference = Math.abs(winnerPower - loserPower);
  const averagePower = (winnerPower + loserPower) / 2;
  const difficultyRatio = powerDifference / averagePower;
  
  if (difficultyRatio < 0.2) { // Batalha muito equilibrada
    difficultyMultiplier = 1.3;
  } else if (difficultyRatio < 0.5) { // Batalha equilibrada
    difficultyMultiplier = 1.1;
  }
  
  // 10. 🌟 BONUS POR PRIMEIRO ENCONTRO
  let firstTimeBonus = 1.0;
  // Aqui você poderia verificar se é a primeira vez lutando contra este oponente
  // firstTimeBonus = hasBeatenBefore ? 1.0 : 1.2;
  
  // 11. 📊 CÁLCULO FINAL
  let finalExp = baseExp;
  
  // Aplicar todos os multiplicadores
  finalExp *= levelMultiplier;
  finalExp *= powerMultiplier;
  finalExp *= typeBonus;
  finalExp *= positionBonus;
  finalExp *= bountyMultiplier;
  finalExp *= skillBonus;
  finalExp *= learningMultiplier;
  finalExp *= difficultyMultiplier;
  finalExp *= firstTimeBonus;
  
  // 12. 🎯 LIMITADORES E BALANCEAMENTO
  const winnerLevel = winner.level;
  
  // Limite máximo baseado no level do vencedor
  const maxExpPerBattle = winnerLevel * 200; // Máximo 200 XP por level
  
  // Limite mínimo
  const minExpPerBattle = Math.max(40, winnerLevel * 20); // Mínimo 20 XP por level
  
  // Aplicar limites
  finalExp = Math.min(finalExp, maxExpPerBattle);
  finalExp = Math.max(finalExp, minExpPerBattle);
  
  return Math.ceil(finalExp);
}

  static calculateBountyGain(winner: Character, loser: Character): number {
  // 1. 💀 BOUNTY BASE DO OPONENTE
  const loserBounty = loser.bounty;
  let bountyGain = 0;
  
  // 2. 📊 FATOR PRINCIPAL - Baseado no bounty do oponente
  if (loserBounty > 0) {
    // Ganho percentual baseado no bounty do oponente
    let percentageGain = 0;
    
    if (loserBounty >= 1000000000) { // 1B+ (Yonko level)
      percentageGain = 0.125; // 25% do bounty
    } else if (loserBounty >= 500000000) { // 500M+ (Commander level)
      percentageGain = 0.1; // 20% do bounty
    } else if (loserBounty >= 100000000) { // 100M+ (Supernova level)
      percentageGain = 0.075; // 15% do bounty
    } else if (loserBounty >= 50000000) { // 50M+ (Veteran level)
      percentageGain = 0.06; // 12% do bounty
    } else if (loserBounty >= 10000000) { // 10M+ (Rookie level)
      percentageGain = 0.05; // 10% do bounty
    } else {
      percentageGain = 0.08; // 8% para bounties baixos
    }
    
    bountyGain = loserBounty * percentageGain;
  } else {
    // Se o oponente não tem bounty, usar level como base
    bountyGain = loser.level * 50000; // 50K por level
  }
  
  // 3. 🎖️ MULTIPLICADOR POR TIPO DE OPONENTE
  let typeMultiplier = 1.0;
  
  switch (loser.type) {
    case 'Government':
      typeMultiplier = 2.5; // Atacar o governo é muito grave
      break;
    case 'Marine':
      if (winner.type === 'Pirate') {
        typeMultiplier = 1.8; // Piratas vs Marines = bounty alto
      } else {
        typeMultiplier = 0.5; // Marines matando Marines = bounty baixo
      }
      break;
    case 'Pirate':
      if (winner.type === 'Marine') {
        typeMultiplier = 0.3; // Marines matando piratas = pouco bounty
      } else if (winner.type === 'Pirate') {
        typeMultiplier = 1.2; // Pirata vs Pirata = bounty moderado
      }
      break;
  }
  
  // 4. 🏆 BONUS POR POSIÇÃO DO OPONENTE
  let positionMultiplier = 1.0;
  
  switch (loser.position) {
    case 'Captain':
      positionMultiplier = 1.5;
      break;
    case 'First Mate':
      positionMultiplier = 1.2;
      break;
  }
  
  // 5. 📈 FATOR DE DIFERENÇA DE LEVEL
  const levelDifference = loser.level - winner.level;
  let levelMultiplier = 1.0;
  
  if (levelDifference > 0) {
    // Derrotar alguém mais forte = mais bounty
    levelMultiplier = 1.0 + (levelDifference * 0.1); // 10% por level de diferença
  } else if (levelDifference < 0) {
    // Derrotar alguém mais fraco = menos bounty
    const penalty = Math.abs(levelDifference) * 0.05; // 5% de redução por level
    levelMultiplier = Math.max(0.3, 1.0 - penalty); // Mínimo 30%
  }
  
  // 6. ⚔️ FATOR DE DIFERENÇA DE PODER
  const winnerPower = this.calculatePower(winner);
  const loserPower = this.calculatePower(loser);
  let powerMultiplier = 1.0;
  
  if (loserPower > winnerPower) {
    // Derrotar alguém mais forte = bonus de bounty
    const powerRatio = loserPower / winnerPower;
    powerMultiplier = 1.0 + Math.min((powerRatio - 1.0) * 0.3, 1.0); // Até 2x
  } else if (winnerPower > loserPower) {
    // Derrotar alguém mais fraco = menos bounty
    const powerRatio = winnerPower / loserPower;
    const reduction = Math.min((powerRatio - 1.0) * 0.2, 0.6);
    powerMultiplier = Math.max(0.4, 1.0 - reduction); // Mínimo 40%
  }
  
  // 7. 🌟 BONUS POR HABILIDADES ESPECIAIS DO OPONENTE
  let skillMultiplier = 1.0;
  
  // Bonus por derrotar usuário de Conqueror's Haki
  if (loser.stats.kingHaki > 0) {
    skillMultiplier += 0.5; // +50%
  }
  
  // Bonus por derrotar usuário de Devil Fruit
  if (loser.stats.devilFruit > 0) {
    skillMultiplier += 0.3; // +30%
  }
  
  // Bonus por derrotar usuário de Haki avançado
  if (loser.stats.armHaki > 5 || loser.stats.obsHaki > 5) {
    skillMultiplier += 0.2; // +20%
  }
  
  // 8. 🎯 FATOR DE NOTORIEDADE DO VENCEDOR
  let notorietyMultiplier = 1.0;
  
  // Quanto maior o bounty atual, maior o ganho (mais notório)
  if (winner.bounty > 0) {
    const notorietyFactor = Math.log10(winner.bounty / 1000000 + 1) * 0.1;
    notorietyMultiplier = 1.0 + notorietyFactor; // Até ~40% bonus
  }
  
  // 9. 🏴‍☠️ BONUS POR PRIMEIRA VITÓRIA CONTRA ESTE TIPO
  let firstTimeMultiplier = 1.0;
  // Aqui você poderia verificar se é a primeira vez derrotando este tipo de oponente
  // firstTimeMultiplier = isFirstTimeAgainstThisType ? 1.5 : 1.0;
  
  // 10. 🌍 FATOR DE LOCALIZAÇÃO (se implementado)
  let locationMultiplier = 1.0;
  // Em certas ilhas, as ações têm mais repercussão
  // locationMultiplier = isImportantIsland ? 1.3 : 1.0;
  
  // 11. 📊 CÁLCULO FINAL
  bountyGain *= typeMultiplier;
  bountyGain *= positionMultiplier;
  bountyGain *= levelMultiplier;
  bountyGain *= powerMultiplier;
  bountyGain *= skillMultiplier;
  bountyGain *= notorietyMultiplier;
  bountyGain *= firstTimeMultiplier;
  bountyGain *= locationMultiplier;
  
  // 12. �� LIMITADORES E BALANCEAMENTO
  
  // Limite máximo baseado no level do vencedor
  const maxBountyGain = winner.level * 100000; // 100k por level máximo
  
  // Limite mínimo
  const minBountyGain = Math.max(10000, winner.level * 1000); // 1K por level mínimo
  
  // Aplicar limites
  bountyGain = Math.min(bountyGain, maxBountyGain);
  bountyGain = Math.max(bountyGain, minBountyGain);
  
  // 13. 🚫 CASOS ESPECIAIS
  
  // Marines não ganham bounty por matar piratas (na verdade, reduzem)
  if (winner.type === 'Marine' && loser.type === 'Pirate') {
    return 0; // Marines não ganham bounty
  }
  
  // Government agents têm bounty reduzido (agem nas sombras)
  if (winner.type === 'Government') {
    bountyGain *= 0.3; // 70% de redução
  }
  
  return Math.floor(bountyGain);
}

// 🎮 Função auxiliar para calcular redução de bounty (para Marines)
static calculateBountyReduction(marine: Character, defeatedPirate: Character): number {
  if (marine.type !== 'Marine') return 0;
  
  // Marines reduzem bounty ao derrotar piratas
  const reduction = Math.min(defeatedPirate.bounty * 0.1, marine.level * 100000);
  return Math.floor(reduction);
}

  static calculateBountyIncrease(character: Character, defeated: Character): number {
    const baseBounty = defeated.bounty * 0.1;
    const levelBonus = character.level * 1000;
    
    return Math.floor(baseBounty + levelBonus);
  }

  static nextLevelUp(character: Character): number {
    const expRequired = Math.floor(100 * Math.pow(character.level + 1, 1.5) + (character.level * 50));
    return expRequired;
  }

  static expNeeded(level: number): number {
    const expRequired = Math.floor(100 * Math.pow(level + 1, 1.5) + (level * 50));
    return expRequired;
  }

  static checkLevelUp(character: Character): {
    shouldLevelUp: boolean;
    newLevel?: number;
    expNeeded?: number;
    levelsGained?: number;
    totalExpUsed?: number;
  } {
    try {

      let currentLevel = character.level;
      let currentExp = character.experience;
      let levelsGained = 0;
      let totalExpUsed = 0;
      const initialLevel = character.level

      
      // Loop para verificar múltiplos level ups
      while (true) {
        const expNeededForNextLevel = this.expNeeded(character.level);
        
        
        if (currentExp >= expNeededForNextLevel) {
          // Pode subir de level
          currentExp -= expNeededForNextLevel;
          totalExpUsed += expNeededForNextLevel;
          character.level += 1;
          currentLevel++;
          levelsGained++;
          
          // Limite de segurança para evitar loops infinitos
          if (levelsGained >= 10) {
            console.warn(`⚠️ ${character.name} tentou subir mais de 10 levels de uma vez!`);
            break;
          }
        } else {
          // Não tem XP suficiente para o próximo level
          break;
        }
      }
      
      if (levelsGained > 0) {
        console.log(`🎉 ${character.name} subiu ${levelsGained} level(s)! ${initialLevel} → ${currentLevel}`);
        
        return {
          shouldLevelUp: true,
          newLevel: currentLevel,
          expNeeded: totalExpUsed,
          levelsGained,
          totalExpUsed
        };
      }
      
      return {
        shouldLevelUp: false
      };
      
    } catch (error) {
      console.error('Erro ao verificar level up:', error);
      return {
        shouldLevelUp: false
      };
    }
  }

  static increaseStats(character: Character, newLevel: number, style: StyleCombat, fruit: DevilFruit | null = null): Partial<Character['stats']> {
    const totalPoints = newLevel
    
    var statsAvailable = 9
    var unlockHaki = false
    if(newLevel >= 50){
        statsAvailable += 6
        if(character.potentialToHaveKngHaki > GenerationConfig.createEpic().allowKingHakiFor){
          if((Math.random() > (1 - character.potentialToHaveKngHaki) && character.stats.kingHaki == 0) || character.stats.kingHaki > 0){
            if(character.stats.kingHaki == 0){
              console.log(character.name + '(' + character.id +') despertou Haki do Rei! Os mares tremem!!!');
            }
            unlockHaki = true
            statsAvailable += 1
          }
        }
    }
    if(fruit){
        statsAvailable += 1
    }

    const factor = totalPoints/statsAvailable;

    const stats: Partial<Character['stats']> = {};

    stats.attack = character.stats.attack + Math.ceil(style.attack * factor)
    stats.defense = character.stats.defense + Math.ceil(style.defense * factor)
    stats.speed = character.stats.speed + Math.ceil(style.speed * factor)
    if(newLevel >= 50){
        stats.armHaki = character.stats.armHaki + Math.ceil(style.armHaki * factor)
        stats.obsHaki = character.stats.obsHaki + Math.ceil(style.obsHaki * factor)
        if(unlockHaki){
            stats.kingHaki = character.stats.kingHaki + Math.ceil(character.potentialToHaveKngHaki * factor)
        }
    }
    if(fruit){
        stats.devilFruit = character.stats.devilFruit + Math.ceil(factor)
    }
    
    return stats;
  }
  static calculateCrewPower(members: Character[], allFruits: DevilFruit[]): number{
    return members.reduce((total, member) => {
      return total + GameLogic.calculatePower(member, allFruits.find(fruit => member.devilFruitId === fruit.id))
    }, 0)
  }

  static calculatePower(character: Character, fruit: DevilFruit | null = null): number {
  const { attack, defense, speed, armHaki, obsHaki, kingHaki, devilFruit } = character.stats;
  
  // 1. ⚔️ PODER BASE - Combinação balanceada dos atributos físicos
  const physicalPower = (attack * 4.0) + (defense * 2.0) + (speed * 3.0);
  
  // 2. 🥊 SISTEMA DE HAKI - Cada tipo tem papel específico
  let hakiPower = 0;
  
  // Armament Haki - Aumenta ataque e defesa
  if (armHaki > 0) {
    const armamentBonus = armHaki * 2.5;
    const armamentSynergy = (attack + defense) * (armHaki * 0.1); // Sinergia com físico
    hakiPower += armamentBonus + armamentSynergy;
  }
  
  // Observation Haki - Aumenta velocidade e precisão
  if (obsHaki > 0) {
    const observationBonus = obsHaki * 2.0;
    const observationSynergy = speed * (obsHaki * 0.15); // Sinergia com velocidade
    hakiPower += observationBonus + observationSynergy;
  }
  
  // Conqueror's Haki - Multiplicador de poder geral (muito raro e poderoso)
  let conquerorMultiplier = 1.0;
  if (kingHaki > 0) {
    conquerorMultiplier = 1.0 + (kingHaki * 0.2); // 20% por nível
    hakiPower += kingHaki * 8; // Bonus base alto
    
    // Bonus especial para Conqueror's Haki avançado
    if (kingHaki >= 5) {
      conquerorMultiplier += 0.5; // +50% para masters
    }
  }
  
  // 3. 🍎 SISTEMA DE DEVIL FRUIT - Complexo e variado
  let devilFruitPower = 0;
  let devilFruitMultiplier = 1.0;
  
  if (fruit && devilFruit > 0) {
    // Poder base da fruta baseado no nível de domínio
    const fruitBasePower = devilFruit * 4.0;
    
    // Multiplicador baseado na raridade da fruta
    const rarityMultiplier = 1.0 + (fruit.rarity * 0.4); // 40% por nível de raridade
    
    // Bonus por tipo de fruta
    let typeMultiplier = 1.0;
    switch (fruit.type) {
      case 'Logia':
        typeMultiplier = 1.8; // Logias são naturalmente mais poderosas
        break;
      case 'Zoan':
        typeMultiplier = 1.2; // Zoans aumentam físico
        // Bonus especial para stats físicos
        devilFruitPower += (attack + defense + speed) * (devilFruit * 0.2);
        break;
      case 'Paramecia':
        typeMultiplier = 1.3; // Paramecias são versáteis
        break;
    }
    
    // Sistema de Despertar (Awakening)
    let awakeningMultiplier = 1.0;
    if (fruit.awakeningOn <= character.level) {
      awakeningMultiplier = 2.2; // Despertar dobra o poder da fruta
      //devilFruitPower += devilFruit * 3 ; // Bonus adicional significativo
    }
    
    // Cálculo final da Devil Fruit
    devilFruitPower += fruitBasePower * rarityMultiplier * typeMultiplier * awakeningMultiplier;
    
    // Multiplicador geral para usuários de Devil Fruit
    devilFruitMultiplier = 1.0 + (devilFruit * 0.1);
  }
  
  // 4. 📈 SISTEMA DE LEVEL E EXPERIÊNCIA
  const levelPower = character.level * 15; // Base por level
  const levelMultiplier = 1.0 + (character.level * 0.05); // 5% por level
  
  // Bonus para levels altos (veteranos)
  let veteranBonus = 0;
  if (character.level >= 50) {
    veteranBonus = (character.level - 49) * 25; // Bonus exponencial para veteranos
  }
  
  // 5. 🎯 SISTEMA DE ESPECIALIZAÇÃO
  let specializationBonus = 0;
  
  // Detectar especialização do personagem
  const totalStats = attack + defense + speed + armHaki + obsHaki + kingHaki + devilFruit;
  const avgStat = totalStats / 7;
  
  // Bonus para especialistas (que focam em poucos atributos)
  [attack, defense, speed, armHaki, obsHaki, kingHaki, devilFruit].forEach(stat => {
    if (stat > avgStat * 1.5) { // Se o stat é 50% acima da média
      specializationBonus += stat * 1.5; // Bonus por especialização
    }
  });
  
  // 6. 🌟 SISTEMA DE SINERGIA ENTRE ATRIBUTOS
  let synergyBonus = 0;
  
  // Sinergia Haki + Físico
  if (armHaki > 0 && attack > 0) {
    synergyBonus += Math.min(armHaki, attack) * 1.5;
  }
  
  if (obsHaki > 0 && speed > 0) {
    synergyBonus += Math.min(obsHaki, speed) * 1.2;
  }
  
  // Sinergia Devil Fruit + Haki (usuários avançados)
  if (devilFruit > 0 && (armHaki > 0 || obsHaki > 0)) {
    synergyBonus += Math.min(devilFruit, armHaki + obsHaki) * 2.0;
  }
  
  // 7. 🏴‍☠️ BONUS POR POSIÇÃO E TIPO
  let positionMultiplier = 1.0;
  
  switch (character.position) {
    case 'Captain':
      positionMultiplier = 1.3; // Líderes são mais fortes
      break;
    case 'First Mate':
      positionMultiplier = 1.2;
      break;
  }
  
  // Bonus por tipo de personagem
  let typeMultiplier = 1.0;
  switch (character.type) {
    case 'Government':
      typeMultiplier = 1.15; // Governo tem recursos superiores
      break;
    case 'Marine':
      typeMultiplier = 1.1; // Marines têm treinamento militar
      break;
    case 'Pirate':
      typeMultiplier = 1.05; // Piratas têm experiência de combate
      break;
  }
  
  
  // 8. 🎲 FATOR IMPREVISIBILIDADE (baseado em kindness)
  const unpredictabilityFactor = 1.0 + Math.abs((character.kindness * 0.02)); // Personagens únicos são mais imprevisíveis
  
  // 9. 📊 CÁLCULO FINAL
  let totalPower = 0;
  
  // Somar todos os componentes base
  totalPower += physicalPower;
  totalPower += hakiPower;
  totalPower += devilFruitPower;
  totalPower += levelPower;
  totalPower += veteranBonus;
  totalPower += specializationBonus;
  totalPower += synergyBonus;
  
  // Aplicar multiplicadores
  totalPower *= conquerorMultiplier;
  totalPower *= devilFruitMultiplier;
  totalPower *= levelMultiplier;
  totalPower *= positionMultiplier;
  totalPower *= typeMultiplier;
  totalPower *= unpredictabilityFactor;
  
  // 10. 🏆 SISTEMA DE BOUNTY INFLUENCE (personagens famosos são mais perigosos)
  const bountyInfluence = Math.log10(character.bounty + 1) * 5; // Influência logarítmica do bounty
  totalPower += bountyInfluence;
  
  // Garantir que o poder mínimo seja 1
  return Math.max(1, Math.ceil(totalPower));
}

// 🎯 Função auxiliar para calcular "rating" do personagem
static getCharacterRating(character: Character, fruit: DevilFruit | null = null): string {
  const power = this.calculatePower(character, fruit);
  
  if (power >= 10000) return '🌟 Yonko Level';
  if (power >= 7500) return '⭐ Admiral Level';
  if (power >= 5000) return '🔥 Warlord Level';
  if (power >= 2500) return '💪 Veteran Level';
  if (power >= 1000) return '⚔️ Strong Level';
  if (power >= 500) return '🗡️ Skilled Level';
  if (power >= 200) return '👊 Rookie Level';
  return '🌱 Beginner Level';
}

// �� Função para calcular vantagem de tipo em batalha
static getTypeAdvantage(attacker: Character, defender: Character): number {
  // Marines vs Pirates
  if (attacker.type === 'Marine' && defender.type === 'Pirate') {
    return 1.1; // 10% bonus
  }
  
  // Government vs qualquer um
  if (attacker.type === 'Government') {
    return 1.05; // 5% bonus (recursos superiores)
  }
  
  // Pirates vs Marines (experiência de combate)
  if (attacker.type === 'Pirate' && defender.type === 'Marine') {
    return 1.05; // 5% bonus
  }
  
  return 1.0; // Sem vantagem
}

// �� Função para calcular vantagem de tipo em batalha
static getsStyleAdvantage(attacker: StyleCombat | null = null, defender: StyleCombat | null = null): number {
    let advantage = 1.0
    if(attacker && defender){
        // Fighter vs Support
        if (attacker.name === 'Fighter' && defender.name === 'Support') {
            advantage = 1.1; // 10% bonus
        }

        // Swordsman vs Fighter
        if (attacker.name === 'Swordsman' && defender.name === 'Fighter') {
            advantage = 1.1; // 10% bonus
        }

        // Sniper vs Swordman
        if (attacker.name === 'Sniper' && defender.name === 'Swordsman') {
            advantage = 1.1; // 10% bonus
        }

        // Support vs Sniper
        if (attacker.name === 'Support' && defender.name === 'Sniper') {
            advantage = 1.1; // 10% bonus
        }
    }
  return advantage; 
}

    static tryToRecruit(character: Character, target: Character ): boolean {
        let success = false
        if(character.kindness > 0){
            const factor = ((character.kindness / 100) + 1);
            if(factor > target.loyalty){
                success = true
            }
        }
        return success  
    }
}