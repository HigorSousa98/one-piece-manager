import { db, Character, Crew, Island, DevilFruit, StyleCombat, Yonkou, Shichibukai, Admiral, MarineBase, CypherPol, Gorousei } from './database'
import { GenerationConfig } from '@/utils/generationConfig'
import { useBattleStore } from '@/stores/battleStore'
import { GameLogic } from '@/utils/gameLogic'
import { ShipNameGenerator } from '@/data/shipNameGenerator'
import { CrewNameGenerator } from '@/data/crewNames'
import { useCharacterStore } from '@/stores/characterStore';

export interface AdventureEncounter {
  opponent: Character;
  encounterType: 'hostile' | 'neutral' | 'friendly';
  location: string;
  description: string;
  specialReward?: {
    type: 'item' | 'bounty' | 'reputation' | 'experience';
    value: number;
  };
}

export interface CrewRecruitmentResult {
  recruited: Character[];
  removed: Character[];
  recruitmentAttempts: number;
  removalAttempts: number;
}

export interface CrewCapacityInfo {
  currentMembers: number;
  maxCapacity: number;
  hasSpace: boolean;
  shipLevel: number;
}

export interface IslandMovementResult {
  totalCrews: number;
  dockedToggled: number;
  crewsMoved: number;
  movementsByDifficulty: {
    easier: number;
    same: number;
    harder: number;
  };
  islandReports: Array<{
    islandId: number;
    islandName: string;
    initialCrews: number;
    finalCrews: number;
    crewsLeft: number;
    crewsArrived: number;
  }>;
}

export interface CrewMovementDecision {
  crewId: number;
  crewName: string;
  fromIslandId: number;
  toIslandId: number;
  fromDifficulty: number;
  toDifficulty: number;
  movementType: 'easier' | 'same' | 'harder';
}

export class AdventureSystem {
  
  // 1. 🎯 GERAR AVENTURA BASEADA NO TIPO E LOCALIZAÇÃO
  static async generateAdventure(player: Character): Promise<AdventureEncounter | null> {
    try {
      console.log(`🗺️ Gerando aventura para ${player.type}: ${player.name}`);
      
      // Primeiro, descobrir em que ilha o jogador está
      const playerIsland = await this.getPlayerCurrentIsland(player);
      
      if (!playerIsland) {
        console.log('❌ Jogador não está em nenhuma ilha');
        return null;
      }
      
      console.log(`🏝️ Jogador está na ilha: ${playerIsland.name} - ${playerIsland.id}`);
      
      // Buscar oponente na mesma ilha
      const opponent = await this.findOpponentOnSameIsland(player, playerIsland.id!);
      
      if (!opponent) {
        console.log('❌ Nenhum oponente encontrado na ilha atual');
        return null;
      }
      
      const encounter = this.createEncounter(player, opponent, playerIsland);
      
      console.log(`⚔️ Encontro gerado na ${playerIsland.name}: ${player.name} vs ${opponent.name}`);
      return encounter;
      
    } catch (error) {
      console.error('Erro ao gerar aventura:', error);
      return null;
    }
  }
  
  // 2. 🏝️ DESCOBRIR ILHA ATUAL DO JOGADOR
  private static async getPlayerCurrentIsland(player: Character): Promise<Island | null> {
    try {
      // Buscar o crew do jogador
      const playerCrew = await db.crews.get(player.crewId!);
      
      if (!playerCrew) {
        console.log('❌ Jogador não tem crew');
        return null;
      }
      
      // Buscar a ilha onde o crew está
      const currentIsland = await db.islands.get(playerCrew.currentIsland);
      
      return currentIsland || null;
      
    } catch (error) {
      console.error('Erro ao buscar ilha do jogador:', error);
      return null;
    }
  }
  
  // 3. 🎲 ENCONTRAR OPONENTE NA MESMA ILHA
  private static async findOpponentOnSameIsland(player: Character, islandId: number): Promise<Character | null> {
    try {
      // Buscar todos os crews na mesma ilha
      const crewsOnIsland = await db.crews
        .where('currentIsland')
        .equals(islandId)
        .and(crew => crew.docked == 1)
        .toArray();
      
      if (crewsOnIsland.length <= 1) { // Só tem o crew do jogador
        return null;
      }
      
      // Buscar personagens desses crews (exceto o do jogador)
      const potentialOpponents: Character[] = [];

      const lastCombats = player.crewId ? await db.battles.where('challengerCrewId').equals(player.crewId).reverse().limit(GenerationConfig.createEpic().lastCombats).toArray() : null
      
      for (const crew of crewsOnIsland) {
        if (crew.id === player.crewId) continue; // Pular o próprio crew
        
        // Buscar membros deste crew
        const crewMembers = await db.characters
          .where('crewId')
          .equals(crew.id!)
          .and(char => char.isPlayer !== 1 && !lastCombats?.find(battle => battle.opponentCrewId === char.crewId)) // Não incluir jogadores e nem repetições
          .toArray();
        
        // Filtrar por tipo compatível
        const compatibleMembers = this.filterCompatibleOpponents(player, crewMembers);
        potentialOpponents.push(...compatibleMembers);
      }
      
      if (potentialOpponents.length === 0) {
        return null;
      }
      
      // Filtrar por level compatível
      const levelCompatible = this.filterByLevel(player, potentialOpponents);
      
      if (levelCompatible.length === 0) {
        return potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];
      }
      
      // Priorizar oponentes interessantes
      const prioritized = this.prioritizeOpponents(player, levelCompatible);
      
      // Escolher aleatoriamente entre os 3 melhores
      const topOpponents = prioritized.slice(0, Math.min(12, prioritized.length));
      return topOpponents[Math.floor(Math.random() * topOpponents.length)];
      
    } catch (error) {
      console.error('Erro ao buscar oponente na ilha:', error);
      return null;
    }
  }
  
  // 4. 🎯 FILTRAR OPONENTES COMPATÍVEIS POR TIPO
  private static filterCompatibleOpponents(player: Character, opponents: Character[]): Character[] {
    return opponents.filter(opponent => {
      switch (player.type) {
        case 'Pirate':
          return ['Marine', 'Government', 'BountyHunter', 'Pirate'].includes(opponent.type);
          
        case 'Marine':
          return ['Pirate'].includes(opponent.type);
          
        case 'BountyHunter':
          return ['Pirate', 'BountyHunter'].includes(opponent.type);
          
        case 'Government':
          // Agentes do governo podem encontrar qualquer um com kindness > 0
          return opponent.kindness > 0 && ['Pirate', 'Marine', 'BountyHunter'].includes(opponent.type);
          
        default:
          return true;
      }
    });
  }
  
  // 5. 📊 FILTRAR POR LEVEL COMPATÍVEL
  private static filterByLevel(player: Character, opponents: Character[]): Character[] {
    const levelRange = this.calculateLevelRange(player.level);
    
    return opponents.filter(opponent => 
      opponent.level >= levelRange.min && 
      opponent.level <= levelRange.max
    );
  }
  
  // 6. 🎭 CRIAR ENCONTRO COM NARRATIVA (ATUALIZADO)
  private static createEncounter(player: Character, opponent: Character, island: Island): AdventureEncounter {
    const encounterType = this.determineEncounterType(player, opponent);
    const description = this.generateEncounterDescription(player, opponent, island, encounterType);
    
    return {
      opponent,
      encounterType,
      location: island.name,
      description,
      specialReward: this.generateSpecialReward(player, opponent, island)
    };
  }
  
  // 7. 📖 GERAR DESCRIÇÃO NARRATIVA (CORRIGIDO)
  private static generateEncounterDescription(
    player: Character, 
    opponent: Character, 
    island: Island,
    encounterType: 'hostile' | 'neutral' | 'friendly'
  ): string {
    const playerTypeDesc = this.getTypeDescription(player.type);
    const opponentTypeDesc = this.getTypeDescription(opponent.type);
    
    const encounterStarters: Record<'hostile' | 'neutral' | 'friendly', string[]> = {
      hostile: [
        `Explorando a ${island.name}, você avista ${opponent.name}, ${opponentTypeDesc}. Os olhares se cruzam e a tensão é palpável.`,
        `Na ${island.name}, você se depara com ${opponent.name}. Como ${opponentTypeDesc}, eles claramente não têm boas intenções.`,
        `Caminhando pela ${island.name}, você é surpreendido por ${opponent.name}, ${opponentTypeDesc} conhecido pela sua hostilidade.`,
        `Sua exploração da ${island.name} toma um rumo perigoso quando ${opponent.name} aparece, pronto para o confronto.`
      ],
      neutral: [
        `Na ${island.name}, você encontra ${opponent.name}, ${opponentTypeDesc}. A situação é tensa, mas ainda há espaço para diálogo.`,
        `Durante sua exploração da ${island.name}, você cruza com ${opponent.name}. Como ${opponentTypeDesc}, eles parecem cautelosos.`,
        `Sua jornada pela ${island.name} é interrompida por ${opponent.name}, que observa você com interesse.`
      ],
      friendly: [
        `Na ${island.name}, você tem um encontro inesperado com ${opponent.name}, ${opponentTypeDesc} que parece amigável.`,
        `Sua aventura pela ${island.name} toma um rumo interessante quando você conhece ${opponent.name}.`
      ]
    };
    
    const starters = encounterStarters[encounterType];
    const starter = starters[Math.floor(Math.random() * starters.length)];
    
    // Adicionar contexto da ilha
    let islandContext = '';
    if (island.difficulty > 7) {
      islandContext = ' Esta ilha é conhecida por ser perigosa - você deve estar preparado.';
    } else if (island.difficulty < 3) {
      islandContext = ' Esta ilha é relativamente pacífica, mas ainda assim, cuidado é necessário.';
    }
    
    // Adicionar contexto baseado na diferença de level
    const levelDiff = opponent.level - player.level;
    let levelContext = '';
    
    if (levelDiff > 5) {
      levelContext = ' Você sente uma aura intimidante emanando deles - claramente são mais experientes que você.';
    } else if (levelDiff < -5) {
      levelContext = ' Eles parecem menos experientes, mas isso não significa que devem ser subestimados.';
    } else {
      levelContext = ' Vocês parecem estar em pé de igualdade.';
    }
    
    return starter + islandContext + levelContext + ' O que você fará?';
  }
  
  // 8. 🎁 GERAR RECOMPENSAS ESPECIAIS (ATUALIZADO)
  private static generateSpecialReward(player: Character, opponent: Character, island: Island): any {
    // Chance baseada na dificuldade da ilha
    const baseChance = 0.1 + (island.difficulty * 0.02); // 10% + 2% por dificuldade
    
    if (Math.random() > baseChance) return undefined;
    
    const rewardTypes = ['bounty', 'reputation', 'experience'];
    const rewardType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
    
    const difficultyMultiplier = 1 + (island.difficulty * 0.1);
    
    switch (rewardType) {
      case 'bounty':
        return {
          type: 'bounty',
          value: Math.floor(opponent.level * 50000 * difficultyMultiplier)
        };
      case 'reputation':
        return {
          type: 'reputation',
          value: Math.floor((opponent.level / 10 + 1) * difficultyMultiplier)
        };
      case 'experience':
        return {
          type: 'experience',
          value: Math.floor(Math.random() * difficultyMultiplier)
        };
      default:
        return undefined;
    }
  }
  
  
  // 🛠️ FUNÇÕES AUXILIARES
  private static calculateLevelRange(level: number): { min: number; max: number } {
    const variance = Math.max(5, Math.floor(level * 0.2)); // 20% de variação, mínimo 3
    
    return {
      min: Math.max(1, level - variance),
      max: level + variance
    };
  }
  
  private static prioritizeOpponents(player: Character, opponents: Character[]): Character[] {
    return opponents.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // Priorizar rivais naturais
      if ((player.type === 'Pirate' && a.type === 'Marine') ||
          (player.type === 'Marine' && a.type === 'Pirate') ||
          (player.type === 'BountyHunter' && a.type === 'Pirate')) {
        scoreA += 5;
      }
      
      if ((player.type === 'Pirate' && b.type === 'Marine') ||
          (player.type === 'Marine' && b.type === 'Pirate') ||
          (player.type === 'BountyHunter' && b.type === 'Pirate')) {
        scoreB += 5;
      } 
      
      // Priorizar levels próximos
      const levelDiffA = Math.abs(player.level - a.level);
      const levelDiffB = Math.abs(player.level - b.level);
      scoreA += Math.max(0, 5 - levelDiffA);
      scoreB += Math.max(0, 5 - levelDiffB);
      
      // Priorizar bounties interessantes
      if (a.bounty > player.bounty) scoreA += 5;
      if (b.bounty > player.bounty) scoreB += 5;
      
      return scoreB - scoreA;
    });
  }
  // 🎯 DETERMINAR TIPO DE ENCONTRO
  private static determineEncounterType(player: Character, opponent: Character): 'hostile' | 'neutral' | 'friendly' {
  // Piratas vs Marines = sempre hostil
  if ((player.type === 'Pirate' && opponent.type === 'Marine') ||
      (player.type === 'Marine' && opponent.type === 'Pirate')) {
    return 'hostile';
  }
  
  // BountyHunters vs Piratas = sempre hostil
  if ((player.type === 'BountyHunter' && opponent.type === 'Pirate') ||
      (player.type === 'Pirate' && opponent.type === 'BountyHunter')) {
    return 'hostile';
  }
  
  // Government vs Piratas = sempre hostil
  if ((player.type === 'Government' && opponent.type === 'Pirate') ||
      (player.type === 'Pirate' && opponent.type === 'Government')) {
    return 'hostile';
  }
  
  // Marines vs Government = geralmente neutro/amigável (mesma facção)
  if ((player.type === 'Marine' && opponent.type === 'Government') ||
      (player.type === 'Government' && opponent.type === 'Marine')) {
    return Math.random() < 0.7 ? 'neutral' : 'friendly';
  }
  
  // BountyHunter vs Marine = neutro (podem cooperar contra piratas)
  if ((player.type === 'BountyHunter' && opponent.type === 'Marine') ||
      (player.type === 'Marine' && opponent.type === 'BountyHunter')) {
    return Math.random() < 0.6 ? 'neutral' : 'hostile';
  }
  
  // BountyHunter vs Government = neutro (podem cooperar)
  if ((player.type === 'BountyHunter' && opponent.type === 'Government') ||
      (player.type === 'Government' && opponent.type === 'BountyHunter')) {
    return Math.random() < 0.5 ? 'neutral' : 'hostile';
  }
  
  // Civillian sempre tenta ser pacífico
  if (player.type === 'Civillian' || opponent.type === 'Civillian') {
    return Math.random() < 0.8 ? 'friendly' : 'neutral';
  }
  
  // Mesmo tipo = geralmente neutro
  if (player.type === opponent.type) {
    return Math.random() < 0.6 ? 'neutral' : 'friendly';
  }
  
  // Casos padrão - usar kindness como fator
  const avgKindness = (player.kindness + opponent.kindness) / 2;
  
  if (avgKindness > 7) {
    return 'friendly';
  } else if (avgKindness > 4) {
    return Math.random() < 0.7 ? 'neutral' : 'hostile';
  } else {
    return Math.random() < 0.8 ? 'hostile' : 'neutral';
  }
}
  
  // 🏷️ DESCRIÇÕES DOS TIPOS
  private static getTypeDescription(type: string): string {
    switch (type) {
      case 'Pirate':
        return 'um pirata temido pelos mares';
      case 'Marine':
        return 'um marine dedicado à justiça';
      case 'Government':
        return 'um agente misterioso do governo mundial';
      case 'BountyHunter':
        return 'um caçador de recompensas experiente';
      case 'Civillian':
        return 'um civil pacífico';
      default:
        return 'um indivíduo misterioso';
    }
  }
  
  // 🎮 FUNÇÃO PRINCIPAL PARA INTEGRAÇÃO COM O MUNDO DINÂMICO
  static async simulateIslandEncounters(islandId: number, maxEncounters: number = 5): Promise<{
    encounters: number;
    battles: number;
    crewMovements: number;
  }> {
    try {
      const characterStore = useCharacterStore()
      const player = characterStore.playerCharacter
      console.log(`🏝️ Simulando encontros na ilha ${islandId}...`);
      let encounters = 0;
      let battles = 0;
      let crewMovements = 0;
      if(player){
        // Buscar todos os crews na ilha
        const crewsOnIsland = await db.crews
          .where('currentIsland')
          .equals(islandId)
          .and(crew => crew.docked == 1 && crew.id != player.crewId)
          .toArray();
          if (crewsOnIsland.length < 2) {
          return { encounters: 0, battles: 0, crewMovements: 0 };
        }
        
        
        
        // Simular encontros entre crews diferentes
        for (let i = 0; i < Math.min(maxEncounters, crewsOnIsland.length * 2); i++) {
          const crew1 = crewsOnIsland[Math.floor(Math.random() * crewsOnIsland.length)];
          const crew2 = crewsOnIsland[Math.floor(Math.random() * crewsOnIsland.length)];
          
          if (crew1.id === crew2.id) continue; // Mesmo crew
          
          // Buscar membros representativos de cada crew
          const [member1, member2] = await Promise.all([
            db.characters.where('crewId').equals(crew1.id!).and(char => char.isPlayer !== 1).first(),
            db.characters.where('crewId').equals(crew2.id!).and(char => char.isPlayer !== 1).first()
          ]);
          
          if (!member1 || !member2) continue;
          
          encounters++;
          
          // Determinar se resulta em batalha
          const encounterType = this.determineEncounterType(member1, member2);
          
          if (encounterType === 'hostile') {
            // Simular batalha entre os crews
            const battleResult = await this.simulateCrewBattle(crew1, crew2);
            if (battleResult) {
              battles++;
              
              // 30% chance do crew perdedor deixar a ilha
              /*if (Math.random() < 0.3) {
                await this.moveCrewToRandomIsland(battleResult.loserCrew);
                crewMovements++;
              }*/
            }
          }
        }
        
        console.log(`✅ Ilha ${islandId}: ${encounters} encontros, ${battles} batalhas, ${crewMovements} movimentos`);
      }
      return { encounters, battles, crewMovements };
      
      
    } catch (error) {
      console.error('Erro ao simular encontros na ilha:', error);
      return { encounters: 0, battles: 0, crewMovements: 0 };
    }
  }
  
  // ⚔️ SIMULAR BATALHA ENTRE CREWS
  private static async simulateCrewBattle(crew1: Crew, crew2: Crew): Promise<{
    winnerCrew: Crew;
    loserCrew: Crew;
    casualties: number;
  } | null> {
    try {

      const battleStore = useBattleStore();
      const allDevilFruits = await db.devilFruits.toArray()

      // Buscar capitães dos crews
      const [captain1, captain2] = await Promise.all([
        db.characters.get(crew1.captainId),
        db.characters.get(crew2.captainId)
      ]);
      
      if (!captain1 || !captain2) return null;
      
      // Calcular poder total dos crews
      const [crew1Members, crew2Members] = await Promise.all([
        db.characters.where('crewId').equals(crew1.id!).toArray(),
        db.characters.where('crewId').equals(crew2.id!).toArray()
      ]);
      
      const crew1Power = GameLogic.calculateCrewPower(crew1Members, allDevilFruits);
      const crew2Power = GameLogic.calculateCrewPower(crew2Members, allDevilFruits);
      
      // Determinar vencedor
      const totalPower = crew1Power + crew2Power;
      const crew1WinChance = crew1Power / totalPower;
      
      // Adicionar elemento de sorte
      const luck = (Math.random() * 0.2) - 0.1;
      const finalWinChance = Math.max(0.1, Math.min(0.9, crew1WinChance + luck));
      
      const crew1Wins = Math.random() < finalWinChance;
      const winnerCrew = crew1Wins ? crew1 : crew2;
      const loserCrew = crew1Wins ? crew2 : crew1;
      
      // Simular batalha entre capitães para XP/Bounty
      const winnerCaptain = crew1Wins ? captain1 : captain2;
      const loserCaptain = crew1Wins ? captain2 : captain1;
      
      // Aplicar recompensas ao capitão vencedor
      const expGain = GameLogic.calculateExperienceGain(winnerCaptain, loserCaptain);
      const bountyGain = GameLogic.calculateBountyGain(winnerCaptain, loserCaptain);

      // ✅ Processar capitão e membros em paralelo
        const [captainUpdates, memberUpdates] = await Promise.all([
          battleStore.processCaptainUpdates(winnerCaptain, expGain, bountyGain, true),
          battleStore.processCrewMemberUpdates(winnerCaptain, expGain, bountyGain, true, (0.3 + Math.random() * 0.2))
        ])

      // ✅ Aplicar todas as atualizações em paralelo
        const allUpdates = [
          db.characters.update(winnerCaptain.id!, captainUpdates),
          ...memberUpdates.map(update => 
            db.characters.update(update.id, update.updates)
          )
        ]

        await Promise.all(allUpdates)

        // ✅ PROCESSAR RECRUTAMENTO E REMOÇÃO
      const recruitmentResult = await this.processCrewRecruitmentAndRemoval(
        winnerCrew.id!,
        loserCrew.id!,
        false // Não é player
      );

      // ✅ VERIFICAR SE CREW PERDEDOR FICOU SEM MEMBROS
      const remainingLoserMembers = await db.characters
        .where('crewId')
        .equals(loserCrew.id!)
        .toArray();

      if (remainingLoserMembers.length === 0) {
        console.log(`💀 ${loserCrew.name} foi completamente destruído!`);
        
        // Remover crew vazio
        await db.crews.delete(loserCrew.id!);
        
        // Remover navio do crew
        const ship = await db.ships.where('crewId').equals(loserCrew.id!).first();
        if (ship) {
          await db.ships.delete(ship.id!);
        }
      }

      // ✅ CRIAR NOVO CREW PARA MEMBROS REMOVIDOS (SE HOUVER SUFICIENTES)
      if (recruitmentResult.removed.length >= 1) {
        const newCrew = await this.createCrewForOrphanMembers(
          recruitmentResult.removed,
          loserCrew.currentIsland
        );
        
        if (newCrew) {
          console.log(`🏴‍☠️ Novo crew formado: ${newCrew.name}`);
        }
      }
      
      // Atualizar reputação dos crews
      winnerCrew.reputation += Math.floor(loserCrew.reputation * 0.1);
      loserCrew.reputation = Math.max(0, loserCrew.reputation - Math.floor(loserCrew.reputation * 0.05));
      
      await Promise.all([
        db.crews.update(winnerCrew.id!, { reputation: winnerCrew.reputation }),
        db.crews.update(loserCrew.id!, { reputation: loserCrew.reputation })
      ]);
      
      // Registrar batalha
      await db.battles.add({
        timestamp: new Date(),
        challenger: winnerCaptain.id!,
        opponent: loserCaptain.id!,
        winner: winnerCaptain.id!,
        loser: loserCaptain.id!,
        experienceGained: expGain,
        bountyGained: bountyGain,
        battleLog: [`${winnerCaptain.name} derrotou ${loserCaptain.name} em uma batalha entre crews!`],
        challengerCrewId: winnerCrew.id!,
        opponentCrewId: loserCrew.id!
      });
      
      const casualties = Math.floor(Math.random() * 3); // 0-2 baixas
      
      return {
        winnerCrew,
        loserCrew,
        casualties
      };
      
    } catch (error) {
      console.error('Erro ao simular batalha entre crews:', error);
      return null;
    }
  }
  
  // 🚢 MOVER CREW PARA ILHA ALEATÓRIA
  private static async moveCrewToRandomIsland(crew: Crew): Promise<void> {
    try {
      // Buscar todas as ilhas
      const allIslands = await db.islands.toArray();
      const currentIslandDifficulty = allIslands.find(island => island.id === crew.currentIsland)?.difficulty || 1
      
      if (allIslands.length <= 1) return;
      
      // Escolher ilha aleatória (diferente da atual)
      const availableIslands = allIslands.filter(island => island.id !== crew.currentIsland && island.difficulty >= currentIslandDifficulty && island.difficulty <= currentIslandDifficulty + 2);
      const newIsland = availableIslands[Math.floor(Math.random() * availableIslands.length)];
      
      // Atualizar localização do crew
      await db.crews.update(crew.id!, {
        currentIsland: newIsland.id!,
        docked: 1
      });
      
      console.log(`🚢 ${crew.name} fugiu para ${newIsland.name}`);
      
    } catch (error) {
      console.error('Erro ao mover crew:', error);
    }
  }
  
  // 📈 APLICAR BONUS DE STATS ALEATÓRIO
  private static applyRandomStatBonus(character: Character): void {
    const pointsToDistribute = 3; // 3 pontos por level

    if(character.level >= 50){
      for (let i = 0; i < pointsToDistribute; i++) {
        const statToIncrease = Math.random();
        
        if (statToIncrease < 0.2) {
          character.stats.attack += 1;
        } else if (statToIncrease < 0.4) {
          character.stats.defense += 1;
        } else if (statToIncrease < 0.6) {
          character.stats.speed += 1;
        } else if (statToIncrease < 0.79) {
          character.stats.armHaki += 1;
        } else if (statToIncrease < 0.98) {
          character.stats.obsHaki += 1;
        } else if(character.potentialToHaveKngHaki > 0.8){
          // 2% chance de ganhar Conqueror's Haki
          if (character.stats.kingHaki === 0 && character.level >= 50) {
            character.stats.kingHaki = 1;
          } else {
            character.stats.kingHaki += 1;
          }
        }
        else{
          character.stats.armHaki += 1;
        }
      }
    }else{
      for (let i = 0; i < pointsToDistribute; i++) {
        const statToIncrease = Math.random();
        if (statToIncrease < 0.33) {
          character.stats.attack += 1;
        } else if (statToIncrease < 0.67) {
          character.stats.defense += 1;
        } else {
          character.stats.speed += 1;
        }
      }
    }
  }
  
  // 🌍 SIMULAR MUNDO INTEIRO (TODAS AS ILHAS)
  static async simulateWorldEncounters(): Promise<{
    totalEncounters: number;
    totalBattles: number;
    totalMovements: number;
    islandReports: Array<{
      islandName: string;
      encounters: number;
      battles: number;
      movements: number;
    }>;
  }> {
    try {
      console.log('🌍 Simulando encontros em todas as ilhas...');
      
      const allIslands = await db.islands.toArray();
      const results = {
        totalEncounters: 0,
        totalBattles: 0,
        totalMovements: 0,
        islandReports: [] as Array<{
          islandName: string;
          encounters: number;
          battles: number;
          movements: number;
        }>
      };
      
      for (const island of allIslands) {
        const islandResult = await this.simulateIslandEncounters(island.id!, 5);
        
        results.totalEncounters += islandResult.encounters;
        results.totalBattles += islandResult.battles;
        results.totalMovements += islandResult.crewMovements;
        
        if (islandResult.encounters > 0) {
          results.islandReports.push({
            islandName: island.name,
            encounters: islandResult.encounters,
            battles: islandResult.battles,
            movements: islandResult.crewMovements
          });
        }
      }

      await this.changeTerritories();
      await this.changeTopCharacters();
      
      console.log(`🌍 Simulação mundial concluída: ${results.totalEncounters} encontros, ${results.totalBattles} batalhas`);
      
      return results;
      
    } catch (error) {
      console.error('Erro ao simular mundo:', error);
      return {
        totalEncounters: 0,
        totalBattles: 0,
        totalMovements: 0,
        islandReports: []
      };
    }
  }

  static async changeTopCharacters(): Promise<{success: boolean}> {
  try {
    console.log('👑 Iniciando redistribuição dos personagens mais poderosos...')
    
    // ✅ 1. CARREGAR CONFIGURAÇÕES E DADOS BASE
    const config = GenerationConfig.createEpic()
    console.log('⚙️ Configurações carregadas:', config)
    
    const [allDF, allCrews, allIslands] = await Promise.all([
      db.devilFruits.toArray(),
      db.crews.toArray(),
      db.islands.toArray()
    ])
    
    // ✅ 2. CARREGAR CAPITÃES POR TIPO
    const [pirates, marines, government] = await Promise.all([
      db.characters.where('type').equals('Pirate').and(char => char.position === 'Captain').toArray(),
      db.characters.where('type').equals('Marine').and(char => char.position === 'Captain').toArray(),
      db.characters.where('type').equals('Government').and(char => char.position === 'Captain').toArray()
    ])
    
    console.log(`📊 Capitães encontrados:`, {
      pirates: pirates.length,
      marines: marines.length,
      government: government.length
    })

    // ✅ 3. VALIDAR SE HÁ PERSONAGENS SUFICIENTES
    const requiredPirates = config.yonkouCount + config.schichibukai
    const requiredMarines = config.admiralCount
    const requiredGovernment = config.gorouseiCount + config.cypherPolCount
    
    if (pirates.length < requiredPirates) {
      console.warn(`⚠️ Piratas insuficientes: ${pirates.length} < ${requiredPirates}`)
    }
    if (marines.length < requiredMarines) {
      console.warn(`⚠️ Marines insuficientes: ${marines.length} < ${requiredMarines}`)
    }
    if (government.length < requiredGovernment) {
      console.warn(`⚠️ Governo insuficiente: ${government.length} < ${requiredGovernment}`)
    }

    // ✅ 4. ORDENAR POR PODER (COM CACHE DE DEVIL FRUITS)
    const dfMap = new Map(allDF.map(df => [df.id!, df]))
    const crewMap = new Map(allCrews.map(crew => [crew.id!, crew]))
    
    const calculatePowerSafe = (character: Character): number => {
      const devilFruit = character.devilFruitId ? dfMap.get(character.devilFruitId) : undefined
      return GameLogic.calculatePower(character, devilFruit)
    }
    
    const sortedPirates = pirates
      .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a))
    
    const sortedMarines = marines
      .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a))
    
    const sortedGovernment = government
      .sort((a, b) => calculatePowerSafe(b) - calculatePowerSafe(a))

    console.log('🔄 Personagens ordenados por poder')

    // ✅ 5. LIMPAR TABELAS EXISTENTES
    console.log('🧹 Limpando tabelas existentes...')
    await Promise.all([
      db.yonkous.clear(),
      db.shichibukais.clear(),
      db.admirals.clear(),
      db.gorouseis.clear(),
      db.cypherPols.clear()
    ])

    // ✅ 6. FUNÇÃO HELPER PARA OBTER BASE ISLAND SEGURA
    const getBaseIsland = (character: Character): number => {
      const crew = crewMap.get(character.crewId!)
      if (!crew) {
        console.warn(`⚠️ Crew não encontrado para character ${character.id}`)
        return allIslands[0]?.id || 1 // Fallback para primeira ilha
      }
      return crew.currentIsland
    }

    // ✅ 7. CRIAR YONKOU (4 MAIS FORTES)
    console.log(`👑 Criando ${config.yonkouCount} Yonkou...`)
    const yonkouPromises = []
    for (let i = 0; i < Math.min(config.yonkouCount, sortedPirates.length); i++) {
      const pirate = sortedPirates[i]
      console.log(`👑 Yonkou ${i + 1}: ${pirate.name} (Poder: ${calculatePowerSafe(pirate)})`)
      
      yonkouPromises.push(
        db.yonkous.add({
          captainId: pirate.id!,
          baseIsland: getBaseIsland(pirate),
          foundedAt: new Date()
        })
      )
    }
    await Promise.all(yonkouPromises)

    // ✅ 8. CRIAR SHICHIBUKAI (PRÓXIMOS 7 MAIS FORTES)
    console.log(`⚔️ Criando ${config.schichibukai} Shichibukai...`)
    const shichibukaiPromises = []
    const startIndex = config.yonkouCount
    const endIndex = Math.min(startIndex + config.schichibukai, sortedPirates.length)
    
    for (let i = startIndex; i < endIndex; i++) {
      const pirate = sortedPirates[i]
      console.log(`⚔️ Shichibukai ${i - startIndex + 1}: ${pirate.name} (Poder: ${calculatePowerSafe(pirate)})`)
      
      shichibukaiPromises.push(
        db.shichibukais.add({
          captainId: pirate.id!,
          baseIsland: getBaseIsland(pirate),
          foundedAt: new Date()
        })
      )
    }
    await Promise.all(shichibukaiPromises)

    // ✅ 9. CRIAR ADMIRAIS (3 MAIS FORTES MARINES)
    console.log(`⚓ Criando ${config.admiralCount} Admirais...`)
    const admiralPromises = []
    for (let i = 0; i < Math.min(config.admiralCount, sortedMarines.length); i++) {
      const marine = sortedMarines[i]
      console.log(`⚓ Almirante ${i + 1}: ${marine.name} (Poder: ${calculatePowerSafe(marine)})`)
      
      admiralPromises.push(
        db.admirals.add({
          marineId: marine.id!,
          baseIsland: getBaseIsland(marine),
          foundedAt: new Date()
        })
      )
    }
    await Promise.all(admiralPromises)

    // ✅ 10. CRIAR GOROUSEI (5 MAIS FORTES DO GOVERNO)
    console.log(`🌟 Criando ${config.gorouseiCount} Gorousei...`)
    const gorouseiPromises = []
    for (let i = 0; i < Math.min(config.gorouseiCount, sortedGovernment.length); i++) {
      const gov = sortedGovernment[i]
      console.log(`�� Gorousei ${i + 1}: ${gov.name} (Poder: ${calculatePowerSafe(gov)})`)
      
      gorouseiPromises.push(
        db.gorouseis.add({
          govId: gov.id!,
          currentIsland: getBaseIsland(gov),
          foundedAt: new Date()
        })
      )
    }
    await Promise.all(gorouseiPromises)

    // ✅ 11. CRIAR CYPHER POL (PRÓXIMOS 90 DO GOVERNO)
    console.log(`🕵️ Criando ${config.cypherPolCount} Cypher Pol...`)
    const cypherPolPromises = []
    const cpStartIndex = config.gorouseiCount
    const cpEndIndex = Math.min(cpStartIndex + config.cypherPolCount, sortedGovernment.length)
    
    // ✅ ORDENAR ILHAS POR DIFICULDADE PARA CYPHER POL
    const sortedIslands = allIslands.sort((a, b) => a.difficulty - b.difficulty)
    
    for (let i = cpStartIndex; i < cpEndIndex; i++) {
      const gov = sortedGovernment[i]
      const randomIsland = sortedIslands[this.randomBetween(0, sortedIslands.length - 1)]
      
      console.log(`🕵️ Cypher Pol ${i - cpStartIndex + 1}: ${gov.name} -> Ilha ${randomIsland.name}`)
      
      cypherPolPromises.push(
        db.cypherPols.add({
          captainId: gov.id!,
          reputation: this.randomBetween(1000, 10000),
          currentIsland: randomIsland.id!,
          foundedAt: new Date()
        })
      )
    }
    await Promise.all(cypherPolPromises)

    // ✅ 12. ESTATÍSTICAS FINAIS
    const [finalYonkou, finalShichibukai, finalAdmirals, finalGorousei, finalCypherPol] = await Promise.all([
      db.yonkous.count(),
      db.shichibukais.count(),
      db.admirals.count(),
      db.gorouseis.count(),
      db.cypherPols.count()
    ])

    console.log(`✅ Redistribuição concluída:`, {
      yonkou: finalYonkou,
      shichibukai: finalShichibukai,
      admirals: finalAdmirals,
      gorousei: finalGorousei,
      cypherPol: finalCypherPol
    })

    return { success: true }

  } catch (error) {
    console.error('❌ Erro ao redistribuir personagens mais poderosos:', error)
    return { success: false }
  }
}

  static async changeTerritories(): Promise<{success: boolean;}> {
  try {
    console.log('🏴‍☠️ Iniciando redistribuição de territórios...')
    
    // ✅ 1. CARREGAR DADOS NECESSÁRIOS
    const [allCrews, allDevilFruits, allCharacters, allTerritories] = await Promise.all([
      db.crews.where('docked').equals(1).toArray(),
      db.devilFruits.toArray(),
      db.characters.toArray(),
      db.territories.toArray()
    ])
    
    console.log(`📊 Dados carregados:`, {
      crews: allCrews.length,
      characters: allCharacters.length,
      territories: allTerritories.length
    })

    // ✅ 2. OBTER PLAYER ATUAL
    const characterStore = useCharacterStore()
    const player = characterStore.playerCharacter
    
    if (!player || !player.crewId) {
      console.error('❌ Player ou crewId não encontrado')
      return { success: false }
    }

    // ✅ 3. FILTRAR TERRITÓRIOS OCUPADOS (crewId != 0)
    const occupiedTerritories = allTerritories.filter(territory => territory.crewId !== 0)
    console.log(`🏝️ Territórios ocupados: ${occupiedTerritories.length}`)

    // ✅ 4. MAPA PARA ARMAZENAR O CREW MAIS FORTE POR ILHA
    const mapStrongestCrewByIsland = new Map<number, Crew | null>()

    // ✅ 5. INICIALIZAR MAPA COM ILHAS DOS TERRITÓRIOS OCUPADOS
    occupiedTerritories.forEach(territory => {
      mapStrongestCrewByIsland.set(territory.islandId, null)
    })

    console.log(`🗺️ Ilhas mapeadas: ${mapStrongestCrewByIsland.size}`)

    // ✅ 6. ENCONTRAR O CREW MAIS FORTE EM CADA ILHA
    allCrews.forEach(crew => {
      // Verificar se a ilha do crew está no mapa E não é o crew do player
      if (mapStrongestCrewByIsland.has(crew.currentIsland) && crew.id !== player.crewId) {
        
        const currentStrongestCrew = mapStrongestCrewByIsland.get(crew.currentIsland)
        
        if (currentStrongestCrew) {
          // ✅ COMPARAR PODER DOS CREWS
          const currentCrewMembers = allCharacters.filter(char => char.crewId === currentStrongestCrew.id)
          const thisCrewMembers = allCharacters.filter(char => char.crewId === crew.id)
          
          const currentCrewPower = GameLogic.calculateCrewPower(currentCrewMembers, allDevilFruits)
          const thisCrewPower = GameLogic.calculateCrewPower(thisCrewMembers, allDevilFruits)
          
          console.log(`⚔️ Comparando crews na ilha ${crew.currentIsland}:`, {
            current: { id: currentStrongestCrew.id, power: currentCrewPower },
            challenger: { id: crew.id, power: thisCrewPower }
          })
          
          if (thisCrewPower > currentCrewPower) {
            mapStrongestCrewByIsland.set(crew.currentIsland, crew)
            console.log(`👑 Novo crew mais forte na ilha ${crew.currentIsland}: ${crew.id}`)
          }
        } else {
          // ✅ PRIMEIRA VEZ QUE UM CREW É ENCONTRADO NESTA ILHA
          mapStrongestCrewByIsland.set(crew.currentIsland, crew)
          console.log(`🆕 Primeiro crew encontrado na ilha ${crew.currentIsland}: ${crew.id}`)
        }
      }
    })

    // ✅ 7. PREPARAR ATUALIZAÇÕES DOS TERRITÓRIOS
    const territoryUpdates: Promise<number>[] = []
    
    for (const [islandId, strongestCrew] of mapStrongestCrewByIsland.entries()) {
      if (strongestCrew) {
        // ✅ ENCONTRAR O TERRITÓRIO CORRESPONDENTE À ILHA
        const territory = occupiedTerritories.find(t => t.islandId === islandId)
        
        if (territory) {
          console.log(`🔄 Atualizando território ${territory.id}: ilha ${islandId} -> crew ${strongestCrew.id}`)
          
          // ✅ ATUALIZAR O TERRITÓRIO COM O NOVO CREW
          territoryUpdates.push(
            db.territories.update(territory.id!, { crewId: strongestCrew.id })
          )
        } else {
          console.warn(`⚠️ Território não encontrado para ilha ${islandId}`)
        }
      } else {
        // ✅ NENHUM CREW ENCONTRADO NA ILHA - LIBERAR TERRITÓRIO
        const territory = occupiedTerritories.find(t => t.islandId === islandId)
        if (territory) {
          console.log(`🆓 Liberando território ${territory.id}: ilha ${islandId}`)
          territoryUpdates.push(
            db.territories.update(territory.id!, { crewId: 0 })
          )
        }
      }
    }

    // ✅ 8. EXECUTAR TODAS AS ATUALIZAÇÕES
    if (territoryUpdates.length > 0) {
      console.log(`💾 Executando ${territoryUpdates.length} atualizações...`)
      await Promise.all(territoryUpdates)
      console.log('✅ Todas as atualizações executadas com sucesso!')
    } else {
      console.log('ℹ️ Nenhuma atualização necessária')
    }

    // ✅ 9. ESTATÍSTICAS FINAIS
    const finalTerritories = await db.territories.toArray()
    const occupiedCount = finalTerritories.filter(t => t.crewId !== 0).length
    const freeCount = finalTerritories.filter(t => t.crewId === 0).length
    
    console.log(`📈 Redistribuição concluída:`, {
      territoriosOcupados: occupiedCount,
      territoriosLivres: freeCount,
      total: finalTerritories.length
    })

    return { success: true }

  } catch (error) {
    console.error('❌ Erro ao redistribuir crews nos territórios:', error)
    return { success: false }
  }
}
  
  // 🎯 FUNÇÃO PARA INTEGRAR COM O SISTEMA DE BATALHA DO JOGADOR
  static async updateWorldAfterPlayerAction(): Promise<{
    success: boolean;
    worldEvents: string[];
    summary: string;
  }> {
    try {
      const worldResult = await this.simulateWorldEncounters();
      
      const events: string[] = [];
      
      // Gerar eventos interessantes
      worldResult.islandReports.forEach(report => {
        if (report.battles > 0) {
          events.push(`⚔️ ${report.battles} batalha(s) ocorreram na ${report.islandName}`);
        }
        if (report.movements > 0) {
          events.push(`🚢 ${report.movements} crew(s) fugiram da ${report.islandName}`);
        }
      });
      
      const summary = `🌍 Mundo atualizado: ${worldResult.totalEncounters} encontros, ${worldResult.totalBattles} batalhas, ${worldResult.totalMovements} movimentos de crews`;
      
      return {
        success: true,
        worldEvents: events.slice(0, 5), // Máximo 5 eventos
        summary
      };
      
    } catch (error) {
      console.error('Erro ao atualizar mundo:', error);
      return {
        success: false,
        worldEvents: [],
        summary: 'Erro ao atualizar mundo'
      };
    }
  }
  // ✅ SISTEMA DE RECRUTAMENTO E REMOÇÃO
  static async processCrewRecruitmentAndRemoval(
    winnerCrewId: number, 
    loserCrewId: number,
    isPlayerInvolved: boolean = false
  ): Promise<CrewRecruitmentResult> {
    try {
      console.log(`👥 Processando recrutamento entre crews ${winnerCrewId} vs ${loserCrewId}`);
      
      const result: CrewRecruitmentResult = {
        recruited: [],
        removed: [],
        recruitmentAttempts: 0,
        removalAttempts: 0
      };

      // Se o player estiver envolvido, não aplicar recrutamento automático
      if (isPlayerInvolved) {
        console.log('🎮 Player envolvido - recrutamento manual');
        return result;
      }

      // Buscar informações dos crews
      const [winnerCrew, loserCrew] = await Promise.all([
        db.crews.get(winnerCrewId),
        db.crews.get(loserCrewId)
      ]);

      if (!winnerCrew || !loserCrew) {
        console.error('❌ Crews não encontrados para recrutamento');
        return result;
      }

      // Verificar capacidade do crew vencedor
      const winnerCapacity = await this.getCrewCapacityInfo(winnerCrewId);
      
      if (!winnerCapacity.hasSpace) {
        console.log(`⚠️ ${winnerCrew.name} não tem espaço para recrutar`);
      } else {
        // Processar recrutamento
        const recruitmentResult = await this.processRecruitment(
          winnerCrewId, 
          loserCrewId, 
          winnerCapacity
        );
        
        result.recruited = recruitmentResult.recruited;
        result.recruitmentAttempts = recruitmentResult.attempts;
      }

      // Processar remoção de membros do crew perdedor
      const removalResult = await this.processCrewMemberRemoval(loserCrewId);
      result.removed = removalResult.removed;
      result.removalAttempts = removalResult.attempts;

      console.log(`✅ Recrutamento concluído: ${result.recruited.length} recrutados, ${result.removed.length} removidos`);
      
      return result;

    } catch (error) {
      console.error('❌ Erro no processamento de recrutamento:', error);
      return {
        recruited: [],
        removed: [],
        recruitmentAttempts: 0,
        removalAttempts: 0
      };
    }
  }

  // ✅ VERIFICAR CAPACIDADE DO CREW
  static async getCrewCapacityInfo(crewId: number): Promise<CrewCapacityInfo> {
    try {
      // Buscar membros atuais
      const currentMembers = await db.characters
        .where('crewId')
        .equals(crewId)
        .toArray();

      // Buscar navio do crew
      const ship = await db.ships
        .where('crewId')
        .equals(crewId)
        .first();

      const shipLevel = ship?.level || 1;
      const maxCapacity = shipLevel * 3; // Assumindo 3 membros por level do navio

      return {
        currentMembers: currentMembers.length,
        maxCapacity,
        hasSpace: currentMembers.length < maxCapacity,
        shipLevel
      };

    } catch (error) {
      console.error('❌ Erro ao verificar capacidade do crew:', error);
      return {
        currentMembers: 0,
        maxCapacity: 3,
        hasSpace: false,
        shipLevel: 1
      };
    }
  }

  // ✅ PROCESSAR RECRUTAMENTO (20% DE CHANCE)
  static async processRecruitment(
    winnerCrewId: number, 
    loserCrewId: number, 
    capacity: CrewCapacityInfo
  ): Promise<{ recruited: Character[]; attempts: number }> {
    try {
      console.log(`🎯 Tentando recrutamento para crew ${winnerCrewId}`);
      
      const recruited: Character[] = [];
      let attempts = 0;

      // Buscar membros elegíveis do crew perdedor (não capitães)
      const eligibleMembers = await db.characters
        .where('crewId')
        .equals(loserCrewId)
        .and(char => char.isPlayer !== 1)
        .toArray();

      if (eligibleMembers.length === 0) {
        console.log('⚠️ Nenhum membro elegível para recrutamento');
        return { recruited, attempts };
      }

      eligibleMembers.sort((a, b) => a.loyalty - b.loyalty)

      // Tentar recrutar cada membro elegível
      for (const member of eligibleMembers) {
        if (capacity.currentMembers + recruited.length >= capacity.maxCapacity) {
          console.log(`⚠️ Capacidade máxima atingida (${capacity.maxCapacity})`);
          break;
        }

        attempts++;

        // 20-40% de chance de recrutamento  depender da loyalty do membro
        const recruitmentChance = 0.2 + (1 - member.loyalty / 100) * 0.1;
        const roll = Math.random();

        if (roll <= recruitmentChance) {
          // Sucesso no recrutamento!
          console.log(`✅ ${member.name} foi recrutado!`);

          // Atualizar crew do membro
          await db.characters.update(member.id!, {
            crewId: winnerCrewId
          });

          recruited.push(member);

          // Chance de parar o recrutamento após sucesso (para não recrutar todos)
          if (Math.random() < 0.6) { // 60% chance de parar após recrutar alguém
            break;
          }
        }
      }

      console.log(`📊 Recrutamento finalizado: ${recruited.length}/${attempts} sucessos`);
      
      return { recruited, attempts };

    } catch (error) {
      console.error('❌ Erro no processamento de recrutamento:', error);
      return { recruited: [], attempts: 0 };
    }
  }

  // ✅ PROCESSAR REMOÇÃO DE MEMBROS (10% DE CHANCE)
  static async processCrewMemberRemoval(loserCrewId: number): Promise<{ removed: Character[]; attempts: number }> {
    try {
      console.log(`💔 Processando remoção de membros do crew ${loserCrewId}`);
      
      const removed: Character[] = [];
      let attempts = 0;

      // Buscar membros elegíveis para remoção (não capitães, não recrutados)
      const eligibleMembers = await db.characters
        .where('crewId')
        .equals(loserCrewId)
        .and(char => char.isPlayer !== 1)
        .toArray();

      if (eligibleMembers.length === 0) {
        console.log('⚠️ Nenhum membro elegível para remoção');
        return { removed, attempts };
      }

      // Tentar remover cada membro elegível
      for (const member of eligibleMembers) {
        attempts++;

        // 10% de chance de remoção
        const removalChance = 0.1;
        const roll = Math.random();

        if (roll <= removalChance) {
          // Sucesso na remoção!
          console.log(`💀 ${member.name} abandonou o crew!`);

          // Remover do crew (definir crewId como null)
          await db.characters.update(member.id!, {
            crewId: 0
          });

          removed.push(member);

          // Chance de parar a remoção após sucesso (para não remover muitos)
          if (Math.random() < 0.7) { // 70% chance de parar após remover alguém
            break;
          }
        }
      }

      console.log(`📊 Remoção finalizada: ${removed.length}/${attempts} sucessos`);
      
      return { removed, attempts };

    } catch (error) {
      console.error('❌ Erro no processamento de remoção:', error);
      return { removed: [], attempts: 0 };
    }
  }

  // ✅ CRIAR CREW PARA MEMBROS ÓRFÃOS
  static async createCrewForOrphanMembers(orphanMembers: Character[], originalIslandId: number): Promise<Crew | null> {
    try {
      if (orphanMembers.length === 0) return null;

      console.log(`🏴‍☠️ Criando novo crew para ${orphanMembers.length} membros órfãos`);

      // Selecionar capitão (membro com maior level)
      const captain = orphanMembers.reduce((highest, current) => 
        current.level > highest.level ? current : highest
      );

      const crewName = CrewNameGenerator.generateCrewName(captain.type as 'Pirate' | 'Marine' | 'BountyHunter');

      // Criar novo crew
      const newCrewId = await db.crews.add({
        name: crewName,
        type: captain.type as 'Pirate' | 'Marine' | 'BountyHunter',
        captainId: captain.id!,
        currentIsland: originalIslandId,
        docked: 1,
        reputation: Math.floor(captain.level * 10),
        treasury: captain.type === 'Marine' 
          ? this.randomBetween(1000000, 50000000)
          : this.randomBetween(captain.bounty * 0.5, captain.bounty * 10),
        foundedAt: new Date()
      });

      // Atualizar capitão
      await db.characters.update(captain.id!, {
        crewId: newCrewId,
        position: 'Captain'
      });

      // Atualizar outros membros
      for (const member of orphanMembers) {
        if (member.id !== captain.id) {
          await db.characters.update(member.id!, {
            crewId: newCrewId,
            position: 'Crew Member'
          });
        }
      }

      // Criar navio básico para o novo crew
      await db.ships.add({
        crewId: newCrewId,
        level: 1,
        needRepair: false, 
        destroyed: false,
        name: ShipNameGenerator.generateShipNameByCrewType(captain.type)
      });

      const newCrew = await db.crews.get(newCrewId);
      console.log(`✅ Novo crew criado: ${crewName} com ${orphanMembers.length} membros`);

      return newCrew ? newCrew : null;

    } catch (error) {
      console.error('❌ Erro ao criar crew para órfãos:', error);
      return null;
    }
  }
  
  private static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // ✅ SISTEMA PRINCIPAL DE MOVIMENTAÇÃO MUNDIAL
  static async processWorldMovement(): Promise<IslandMovementResult> {
    try {
      console.log('🌍 Iniciando movimentação mundial de crews...');
      
      const result: IslandMovementResult = {
        totalCrews: 0,
        dockedToggled: 0,
        crewsMoved: 0,
        movementsByDifficulty: {
          easier: 0,
          same: 0,
          harder: 0
        },
        islandReports: []
      };

      // 1. FASE 1: Alternar status docked/undocked
      console.log('⚓ Fase 1: Alternando status docked...');
      const dockedResult = await this.toggleCrewDockedStatus();
      result.dockedToggled = dockedResult.toggled;
      result.totalCrews = dockedResult.totalCrews;

      // 2. FASE 2: Movimentar crews docked
      console.log('🚢 Fase 2: Movimentando crews...');
      const movementResult = await this.moveDockedCrews();
      result.crewsMoved = movementResult.moved;
      result.movementsByDifficulty = movementResult.movementsByDifficulty;
      result.islandReports = movementResult.islandReports;

      console.log(`✅ Movimentação mundial concluída:`, {
        totalCrews: result.totalCrews,
        dockedToggled: result.dockedToggled,
        crewsMoved: result.crewsMoved,
        movements: result.movementsByDifficulty
      });

      return result;

    } catch (error) {
      console.error('❌ Erro na movimentação mundial:', error);
      return {
        totalCrews: 0,
        dockedToggled: 0,
        crewsMoved: 0,
        movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
        islandReports: []
      };
    }
  }

  // ✅ FASE 1: ALTERNAR STATUS DOCKED (10% UNDOCKED, 90% DOCKED)
  static async toggleCrewDockedStatus(): Promise<{
    totalCrews: number;
    toggled: number;
  }> {
    try {
      console.log('⚓ Alternando status docked dos crews...');
      
      // Buscar todos os crews (exceto do player)
      const allCrews = await db.crews
        .where('captainId')
        .above(0)
        .toArray();

      // Filtrar crews do player e crews donos de território
      const playerCrews = await this.getPlayerCrews();
      const playerCrewIds = playerCrews.map(crew => crew.id);
      const territories = await db.territories.toArray()
      const territoriesCrewIds = territories.map(territory => territory.crewId);
      
      const nonPlayerCrews = allCrews.filter(crew => !playerCrewIds.includes(crew.id) && !territoriesCrewIds.includes(crew.id));
      
      if (nonPlayerCrews.length === 0) {
        console.log('⚠️ Nenhum crew não-player encontrado');
        return { totalCrews: 0, toggled: 0 };
      }

      console.log(`🎯 Processando ${nonPlayerCrews.length} crews não-player`);

      let toggled = 0;
      const updates: Promise<any>[] = [];

      for (const crew of nonPlayerCrews) {
        const roll = Math.random();
        let newDockedStatus: number;

        if (roll <= 0.1) {
          // 10% chance de ficar undocked (no mar)
          newDockedStatus = 0;
        } else {
          // 90% chance de ficar docked (na ilha)
          newDockedStatus = 1;
        }

        // Só atualizar se mudou
        if (crew.docked !== newDockedStatus) {
          updates.push(
            db.crews.update(crew.id!, { docked: newDockedStatus as 0 | 1 })
          );
          toggled++;
          
          console.log(`${newDockedStatus === 1 ? '⚓' : '🌊'} ${crew.name}: ${newDockedStatus === 1 ? 'ancorou' : 'partiu para o mar'}`);
        }
      }

      // Aplicar todas as atualizações em paralelo
      await Promise.all(updates);

      console.log(`✅ Status docked atualizado: ${toggled}/${nonPlayerCrews.length} crews alterados`);
      
      return {
        totalCrews: nonPlayerCrews.length,
        toggled
      };

    } catch (error) {
      console.error('❌ Erro ao alternar status docked:', error);
      return { totalCrews: 0, toggled: 0 };
    }
  }

  // ✅ FASE 2: MOVER CREWS DOCKED (40% DE CHANCE DE MOVIMENTO)
  static async moveDockedCrews(): Promise<{
    moved: number;
    movementsByDifficulty: {
      easier: number;
      same: number;
      harder: number;
    };
    islandReports: Array<{
      islandId: number;
      islandName: string;
      initialCrews: number;
      finalCrews: number;
      crewsLeft: number;
      crewsArrived: number;
    }>;
  }> {
    try {
      console.log('🚢 Iniciando movimentação de crews docked...');
      
      // Buscar crews docked (exceto do player)
      const playerCrews = await this.getPlayerCrews();
      const playerCrewIds = playerCrews.map(crew => crew.id);
      
      const dockedCrews = await db.crews
        .where('docked')
        .equals(1)
        .and(crew => !playerCrewIds.includes(crew.id))
        .toArray();

      if (dockedCrews.length === 0) {
        console.log('⚠️ Nenhum crew docked não-player encontrado');
        return {
          moved: 0,
          movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
          islandReports: []
        };
      }

      console.log(`🎯 Avaliando movimento de ${dockedCrews.length} crews docked`);

      const movementDecisions: CrewMovementDecision[] = [];
      const movementsByDifficulty = { easier: 0, same: 0, harder: 0 };

      // Buscar todas as ilhas para referência
      const allIslands = await db.islands.toArray();
      const islandMap = new Map(allIslands.map(island => [island.id!, island]));

      // Decidir quais crews vão se mover
      for (const crew of dockedCrews) {
        const moveRoll = Math.random();
        
        // 40% de chance de se mover
        if (moveRoll <= 0.4) {
          const currentIsland = islandMap.get(crew.currentIsland);
          
          if (!currentIsland) {
            console.warn(`⚠️ Ilha atual não encontrada para ${crew.name}: ${crew.currentIsland}`);
            continue;
          }

          const destinationDecision = await this.selectDestinationIsland(
            currentIsland,
            allIslands
          );

          if (destinationDecision) {
            movementDecisions.push({
              crewId: crew.id!,
              crewName: crew.name,
              fromIslandId: currentIsland.id!,
              toIslandId: destinationDecision.island.id!,
              fromDifficulty: currentIsland.difficulty,
              toDifficulty: destinationDecision.island.difficulty,
              movementType: destinationDecision.type
            });

            movementsByDifficulty[destinationDecision.type]++;
          }
        }
      }

      console.log(`📊 Decisões de movimento: ${movementDecisions.length} crews vão se mover`);
      console.log(`📈 Por dificuldade:`, movementsByDifficulty);

      // Executar movimentos
      const movementPromises = movementDecisions.map(decision => 
        this.executeCrewMovement(decision)
      );

      await Promise.all(movementPromises);

      // Gerar relatório por ilha
      const islandReports = await this.generateIslandMovementReport(allIslands, movementDecisions);

      console.log(`✅ Movimentação concluída: ${movementDecisions.length} crews movidos`);

      return {
        moved: movementDecisions.length,
        movementsByDifficulty,
        islandReports
      };

    } catch (error) {
      console.error('❌ Erro na movimentação de crews:', error);
      return {
        moved: 0,
        movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
        islandReports: []
      };
    }
  }

  // ✅ SELECIONAR ILHA DE DESTINO COM DIFERENÇA EXATA DE 1 NÍVEL
static async selectDestinationIsland(
  currentIsland: Island,
  allIslands: Island[]
): Promise<{ island: Island; type: 'easier' | 'same' | 'harder' } | null> {
  try {
    // Filtrar ilhas disponíveis (exceto a atual)
    const availableIslands = allIslands.filter(island => island.id !== currentIsland.id);
    
    if (availableIslands.length === 0) {
      console.warn('⚠️ Nenhuma ilha disponível para movimento');
      return null;
    }

    // ✅ CATEGORIZAR ILHAS COM DIFERENÇA EXATA DE 1 NÍVEL
    const easierIslands = availableIslands.filter(island => 
      island.difficulty === currentIsland.difficulty - 1  // Exatamente -1
    );
    
    const sameIslands = availableIslands.filter(island => 
      island.difficulty === currentIsland.difficulty       // Exatamente igual
    );
    
    const harderIslands = availableIslands.filter(island => 
      island.difficulty === currentIsland.difficulty + 1   // Exatamente +1
    );

    console.log(`🎯 Opções de movimento da ilha ${currentIsland.name} (dif. ${currentIsland.difficulty}):`);
    console.log(`📉 Mais fáceis (${currentIsland.difficulty - 1}): ${easierIslands.length} ilhas`);
    console.log(`➡️ Mesma dificuldade (${currentIsland.difficulty}): ${sameIslands.length} ilhas`);
    console.log(`📈 Mais difíceis (${currentIsland.difficulty + 1}): ${harderIslands.length} ilhas`);

    // Determinar tipo de movimento baseado nas probabilidades
    const movementRoll = Math.random();
    let selectedIslands: Island[];
    let movementType: 'easier' | 'same' | 'harder';

    if (movementRoll <= 0.2 && easierIslands.length > 0) {
      // 20% chance para ilha de dificuldade -1
      selectedIslands = easierIslands;
      movementType = 'easier';
      console.log(`📉 Selecionado movimento MAIS FÁCIL (${currentIsland.difficulty} → ${currentIsland.difficulty - 1})`);
      
    } else if (movementRoll <= 0.5 && sameIslands.length > 0) {
      // 30% chance para ilha de mesma dificuldade (20% + 30% = 50%)
      selectedIslands = sameIslands;
      movementType = 'same';
      console.log(`➡️ Selecionado movimento MESMA DIFICULDADE (${currentIsland.difficulty} → ${currentIsland.difficulty})`);
      
    } else if (harderIslands.length > 0) {
      // 50% chance para ilha de dificuldade +1
      selectedIslands = harderIslands;
      movementType = 'harder';
      console.log(`📈 Selecionado movimento MAIS DIFÍCIL (${currentIsland.difficulty} → ${currentIsland.difficulty + 1})`);
      
    } else {
      // ✅ FALLBACK: Se não há ilhas da categoria escolhida, tentar outras opções
      console.log(`⚠️ Categoria escolhida não disponível, buscando alternativas...`);
      
      // Prioridade: same > harder > easier
      if (sameIslands.length > 0) {
        selectedIslands = sameIslands;
        movementType = 'same';
        console.log(`🔄 FALLBACK: Usando mesma dificuldade`);
        
      } else if (harderIslands.length > 0) {
        selectedIslands = harderIslands;
        movementType = 'harder';
        console.log(`🔄 FALLBACK: Usando mais difícil`);
        
      } else if (easierIslands.length > 0) {
        selectedIslands = easierIslands;
        movementType = 'easier';
        console.log(`🔄 FALLBACK: Usando mais fácil`);
        
      } else {
        console.warn(`❌ Nenhuma ilha com diferença de ±1 ou igual disponível para ${currentIsland.name}`);
        return null;
      }
    }

    // Selecionar ilha aleatória da categoria
    const selectedIsland = selectedIslands[Math.floor(Math.random() * selectedIslands.length)];

    console.log(`✅ MOVIMENTO CONFIRMADO: ${currentIsland.name} (dif. ${currentIsland.difficulty}) → ${selectedIsland.name} (dif. ${selectedIsland.difficulty}) [${movementType.toUpperCase()}]`);

    // ✅ VALIDAÇÃO FINAL
    const difficultyDifference = selectedIsland.difficulty - currentIsland.difficulty;
    
    if (Math.abs(difficultyDifference) > 1 && difficultyDifference !== 0) {
      console.error(`❌ ERRO: Diferença de dificuldade inválida: ${difficultyDifference} (deve ser -1, 0 ou +1)`);
      return null;
    }

    return {
      island: selectedIsland,
      type: movementType
    };

  } catch (error) {
    console.error('❌ Erro ao selecionar ilha de destino:', error);
    return null;
  }
}

// ✅ MÉTODO PARA VALIDAR SE O MOVIMENTO É VÁLIDO
static validateIslandMovement(fromIsland: Island, toIsland: Island): {
  isValid: boolean;
  reason: string;
  movementType: 'easier' | 'same' | 'harder' | 'invalid';
} {
  // Não pode ir para a mesma ilha
  if (fromIsland.id === toIsland.id) {
    return {
      isValid: false,
      reason: 'Não pode ir para a mesma ilha',
      movementType: 'invalid'
    };
  }

  const difficultyDifference = toIsland.difficulty - fromIsland.difficulty;

  // Deve ser exatamente -1, 0 ou +1
  if (difficultyDifference === -1) {
    return {
      isValid: true,
      reason: 'Movimento para ilha mais fácil (dif. -1)',
      movementType: 'easier'
    };
  } else if (difficultyDifference === 0) {
    return {
      isValid: true,
      reason: 'Movimento para ilha de mesma dificuldade',
      movementType: 'same'
    };
  } else if (difficultyDifference === 1) {
    return {
      isValid: true,
      reason: 'Movimento para ilha mais difícil (dif. +1)',
      movementType: 'harder'
    };
  } else {
    return {
      isValid: false,
      reason: `Diferença de dificuldade inválida: ${difficultyDifference} (deve ser -1, 0 ou +1)`,
      movementType: 'invalid'
    };
  }
}

  // ✅ EXECUTAR MOVIMENTO DO CREW COM VALIDAÇÃO
static async executeCrewMovement(decision: CrewMovementDecision): Promise<void> {
  try {
    // ✅ VALIDAÇÃO ADICIONAL ANTES DE EXECUTAR
    const fromIsland = await db.islands.get(decision.fromIslandId);
    const toIsland = await db.islands.get(decision.toIslandId);

    if (!fromIsland || !toIsland) {
      console.error(`❌ Ilhas não encontradas: ${decision.fromIslandId} → ${decision.toIslandId}`);
      return;
    }

    const validation = this.validateIslandMovement(fromIsland, toIsland);
    
    if (!validation.isValid) {
      console.error(`❌ Movimento inválido para ${decision.crewName}: ${validation.reason}`);
      return;
    }

    // Executar movimento
    await db.crews.update(decision.crewId, {
      currentIsland: decision.toIslandId,
      docked: 1 // Sempre chega docked
    });

    console.log(`✅ ${decision.crewName}: ${fromIsland.name} (${fromIsland.difficulty}) → ${toIsland.name} (${toIsland.difficulty}) [${validation.movementType.toUpperCase()}]`);

  } catch (error) {
    console.error(`❌ Erro ao mover crew ${decision.crewName}:`, error);
  }
}

  // ✅ GERAR RELATÓRIO DE MOVIMENTO POR ILHA
  static async generateIslandMovementReport(
    allIslands: Island[],
    movements: CrewMovementDecision[]
  ): Promise<Array<{
    islandId: number;
    islandName: string;
    initialCrews: number;
    finalCrews: number;
    crewsLeft: number;
    crewsArrived: number;
  }>> {
    try {
      const reports: Array<{
        islandId: number;
        islandName: string;
        initialCrews: number;
        finalCrews: number;
        crewsLeft: number;
        crewsArrived: number;
      }> = [];

      for (const island of allIslands) {
        // Contar crews que saíram desta ilha
        const crewsLeft = movements.filter(m => m.fromIslandId === island.id).length;
        
        // Contar crews que chegaram nesta ilha
        const crewsArrived = movements.filter(m => m.toIslandId === island.id).length;

        // Contar crews atuais na ilha
        const currentCrews = await db.crews
          .where('currentIsland')
          .equals(island.id!)
          .and(crew => crew.docked === 1)
          .count();

        const initialCrews = currentCrews + crewsLeft - crewsArrived;

        // Só incluir ilhas com movimento
        if (crewsLeft > 0 || crewsArrived > 0) {
          reports.push({
            islandId: island.id!,
            islandName: island.name,
            initialCrews,
            finalCrews: currentCrews,
            crewsLeft,
            crewsArrived
          });
        }
      }

      return reports.sort((a, b) => (b.crewsLeft + b.crewsArrived) - (a.crewsLeft + a.crewsArrived));

    } catch (error) {
      console.error('❌ Erro ao gerar relatório de movimento:', error);
      return [];
    }
  }

  // ✅ BUSCAR CREWS DO PLAYER
  static async getPlayerCrews(): Promise<Crew[]> {
    try {
      // Buscar personagens do player
      const playerCharacters = await db.characters
        .where('isPlayer')
        .equals(1)
        .toArray();

      if (playerCharacters.length === 0) return [];

      // Buscar crews únicos dos personagens do player
      const crewIds = [...new Set(playerCharacters.map(char => char.crewId).filter(Boolean))];
      
      const crews = await Promise.all(
        crewIds.map(crewId => db.crews.get(crewId!))
      );

      return crews.filter(Boolean) as Crew[];

    } catch (error) {
      console.error('❌ Erro ao buscar crews do player:', error);
      return [];
    }
  }

  // ✅ MÉTODO PRINCIPAL PARA CHAMAR APÓS MOVIMENTO DO PLAYER
  static async onPlayerIslandChange(): Promise<{
    success: boolean;
    movementResult: IslandMovementResult;
    summary: string;
    worldEvents: string[];
  }> {
    try {
      console.log('🎮 Player mudou de ilha - iniciando movimentação mundial...');

      const worldResult = await this.simulateWorldEncounters();
      var summary = `🌍 Mundo atualizado: ${worldResult.totalEncounters} encontros, ${worldResult.totalBattles} batalhas, ${worldResult.totalMovements} movimentos de crews`;
      // Gerar eventos interessantes
      const worldEvents: string[] = [];
      
      // Gerar eventos interessantes
      worldResult.islandReports.forEach(report => {
        if (report.battles > 0) {
          worldEvents.push(`⚔️ ${report.battles} batalha(s) ocorreram na ${report.islandName}`);
        }
        if (report.movements > 0) {
          worldEvents.push(`🚢 ${report.movements} crew(s) fugiram da ${report.islandName}`);
        }
      });
      
      const movementResult = await this.processWorldMovement();
      
      
      
      if (movementResult.dockedToggled > 0) {
        worldEvents.push(`⚓ ${movementResult.dockedToggled} crews mudaram status de ancoragem`);
      }
      
      if (movementResult.crewsMoved > 0) {
        worldEvents.push(`🚢 ${movementResult.crewsMoved} crews navegaram para outras ilhas`);
        
        if (movementResult.movementsByDifficulty.harder > 0) {
          worldEvents.push(`📈 ${movementResult.movementsByDifficulty.harder} crews buscaram desafios maiores`);
        }
        
        if (movementResult.movementsByDifficulty.easier > 0) {
          worldEvents.push(`📉 ${movementResult.movementsByDifficulty.easier} crews recuaram para águas mais calmas`);
        }
      }

      // Destacar movimentos significativos
      const significantIslands = movementResult.islandReports
        .filter(report => report.crewsLeft + report.crewsArrived >= 2)
        .slice(0, 3);

      significantIslands.forEach(report => {
        if (report.crewsLeft > report.crewsArrived) {
          worldEvents.push(`📤 ${report.islandName}: ${report.crewsLeft} crews partiram`);
        } else if (report.crewsArrived > report.crewsLeft) {
          worldEvents.push(`📥 ${report.islandName}: ${report.crewsArrived} crews chegaram`);
        }
      });

      summary += `; 🌍 Mundo atualizado: ${movementResult.totalCrews} crews processados, ${movementResult.crewsMoved} movimentos realizados`;

      console.log('✅ Movimentação mundial concluída:', summary);

      return {
        success: true,
        movementResult,
        summary,
        worldEvents: worldEvents.slice(0, 5) // Máximo 5 eventos
      };

    } catch (error) {
      console.error('❌ Erro na movimentação mundial após mudança do player:', error);
      return {
        success: false,
        movementResult: {
          totalCrews: 0,
          dockedToggled: 0,
          crewsMoved: 0,
          movementsByDifficulty: { easier: 0, same: 0, harder: 0 },
          islandReports: []
        },
        summary: 'Erro na movimentação mundial',
        worldEvents: []
      };
    }
  }
}