// stores/battleStore.ts
import { defineStore } from 'pinia'
import { GameLogic } from '@/utils/gameLogic'
import { WorldSimulator } from '@/utils/worldSimulator';
import { AdventureSystem } from '@/utils/adventureSystem';
import { RecruitmentSystem, type RecruitmentAttempt } from '@/utils/recruitmentSystem'
import { db, Character, Battle, DevilFruit, StyleCombat } from '@/utils/database'
import { useCharacterStore } from '@/stores/characterStore';
import { GenerationConfig } from '@/utils/generationConfig';

interface BattleResult {
  winner: Character;
  loser: Character;
  challenger: Character;
  opponent: Character;
  damage: number;
  experienceGained: number;
  bountyChange: number;
  battleLog: string[];
  canShowRecruitment: boolean;
  recruitmentData?: RecruitmentAttempt;
}

export const useBattleStore = defineStore('battle', {
  state: () => ({
    currentBattle: null as Battle | null,
    isSimulating: false,
    battleHistory: [] as Battle[]
  }),

  actions: {
    async simulateBattle(char1: Character, char2: Character): Promise<BattleResult> {
      this.isSimulating = true;
      
      try {
        // Buscar Devil Fruits dos personagens (se tiverem)
        const char1DevilFruit = char1.devilFruitId ? await db.devilFruits.get(char1.devilFruitId) : null;
        const char2DevilFruit = char2.devilFruitId ? await db.devilFruits.get(char2.devilFruitId) : null;

        // Buscar Devil Fruits dos personagens (se tiverem)
        const char1StyleCombat = await db.styleCombats.get(char1.styleCombatId);
        const char2StyleCombat = await db.styleCombats.get(char2.styleCombatId);
        
        // Calcular poder com frutas
        const attackerPower = GameLogic.calculatePower(char1, char1DevilFruit);
        const defenderPower = GameLogic.calculatePower(char2, char2DevilFruit);

        const attackerCrewHelp = await this.calculateCrewHelp(char1, null)
        const defenderCrewHelp = await this.calculateCrewHelp(char2, char1)

        // Aplicar vantagem de tipo
        const typeAdvantage = GameLogic.getTypeAdvantage(char1, char2);
        // Aplicar vantagem de Style Combat
        const styleAdvantage = GameLogic.getsStyleAdvantage(char1StyleCombat, char2StyleCombat);
        const finalAttackerPower = attackerPower * typeAdvantage * styleAdvantage + attackerCrewHelp;
        
        // Calcular probabilidade de vitória
        const totalPower = finalAttackerPower + defenderPower + defenderCrewHelp;
        const winChance = finalAttackerPower / totalPower ;
        
        // Adicionar elemento de sorte (10% de variação)
        const luck = (Math.random() * 0.1) - 0.05; // -10% a +10%
        const finalWinChance = Math.max(0.05, Math.min(0.95, winChance + luck));
        
        const char1Wins = Math.random() < finalWinChance;
        
        // Simula duração da batalha (1-5 segundos)
        const battleDuration = 1000 ;
        
        await new Promise(resolve => setTimeout(resolve, battleDuration));
        
        const result = await this.generateBattleResult(char1, char2, char1Wins, attackerPower, defenderPower);
        
        // Salva no banco local
        await this.saveBattleResult(result);
        
         // 🌍 ATUALIZAR MUNDO APÓS BATALHA DO JOGADOR
      const worldUpdate = await AdventureSystem.updateWorldAfterPlayerAction();
      
      if (worldUpdate.success) {
      }
        this.isSimulating = false;
        return result;
        
      } catch (error) {
        this.isSimulating = false;
        console.error('Erro na simulação de batalha:', error);
        throw error;
      }
    },

    async calculateCrewHelp(char: Character, opponent: Character | null): Promise<number>{
        let crewHelp = 0
        const crewMember = char.crewId && (char.type != 'Marine' || !opponent || opponent.level / char.level > 2) ? await db.characters.where('crewId').equals(char.crewId).and(member => member.id != char.id).toArray() : null
        crewMember?.forEach(async member => {
          const memberDevilFruit = member.devilFruitId ? await db.devilFruits.get(member.devilFruitId) : null;
          crewHelp += GameLogic.calculatePower(member, memberDevilFruit) * GenerationConfig.createEpic().regularCrewHelp; // 10-30% de ajuda
        })
        return Math.round(crewHelp)
    },
    
    async generateBattleResult(char1: Character, char2: Character, char1Wins: boolean, char1Power: number, char2Power: number): Promise<BattleResult> {
      const winner = char1Wins ? char1 : char2;
      const loser = char1Wins ? char2 : char1;
      const winnerPower = char1Wins ? char1Power : char2Power;
      const loserPower = char1Wins ? char2Power : char1Power;
      
      // Calcular dano baseado na diferença de poder
      const powerDifference = winnerPower - loserPower;
      const baseDamage = Math.max(10, Math.floor(winnerPower * 0.1));
      const damage = baseDamage + Math.floor(powerDifference * 0.05);
      
      // Calcular experiência ganha
      const experienceGained = GameLogic.calculateExperienceGain(winner, loser);
      
      // Calcular mudança de bounty (apenas para piratas)
      let bountyChange = GameLogic.calculateBountyGain(winner, loser);
      
      
      // Gerar log da batalha
      const battleLog = this.generateBattleLog(winner, loser, damage, char1Wins);

      let canShowRecruitment = false;
    let recruitmentData: RecruitmentAttempt | undefined;
    
    const loserCrew = await db.crews.get(loser.crewId!);
      
      if (loserCrew) {
        recruitmentData = await RecruitmentSystem.validateRecruitment(
          winner,
          loser,
          loserCrew,
          'adventure'
        );
        canShowRecruitment = recruitmentData.canRecruit;
      }
      
      return {
        winner,
        loser,
        challenger: char1,
        opponent: char2,
        damage,
        experienceGained,
        bountyChange,
        battleLog,
        canShowRecruitment,
        recruitmentData
      };
    },

    async attemptRecruitment(
        recruiter: Character,
        target: Character,
        recruitmentData: RecruitmentAttempt
    ) {
        return await RecruitmentSystem.attemptRecruitment(recruiter, target, recruitmentData);
    },

    generateBattleLog(winner: Character, loser: Character, damage: number, char1Wins: boolean): string[] {
      const log: string[] = [];
      
      log.push(`🥊 Batalha iniciada entre ${winner.name} e ${loser.name}!`);
      
      // Adicionar algumas ações da batalha
      const actions = [
        `${winner.name} ataca com força total!`,
        `${loser.name} tenta se defender!`,
        `${winner.name} usa uma técnica especial!`,
        `${loser.name} recua e planeja um contra-ataque!`,
        `${winner.name} domina a batalha!`
      ];
      
      // Adicionar 2-3 ações aleatórias
      const numActions = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numActions; i++) {
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        log.push(`⚔️ ${randomAction}`);
      }
      
      // Adicionar resultado final
      log.push(`💥 ${winner.name} causa ${damage} de dano!`);
      log.push(`🏆 ${winner.name} vence a batalha!`);
      
      return log;
    },

    async saveBattleResult(result: BattleResult): Promise<void> {
      try {
        // Salvar batalha no histórico
        const battleData: Omit<Battle, 'id'> = {
          timestamp: new Date(),
          challenger: result.challenger.id!,
          opponent: result.opponent.id!,
          winner: result.winner.id!,
          loser: result.loser.id!,
          experienceGained: result.experienceGained,
          bountyGained: result.bountyChange,
          battleLog: result.battleLog, 
          challengerCrewId: result.challenger.crewId || 0,
          opponentCrewId: result.opponent.crewId || 0
        };
        
        const battleId = await db.battles.add(battleData);
        
        // Atualizar stats do vencedor
        await this.updateCharacterAfterBattle(result.winner, result.experienceGained, result.bountyChange, true);
        
        // Atualizar stats do perdedor (pode perder experiência ou bounty)
        await this.updateCharacterAfterBattle(result.loser, 0, 0, false);
        
      } catch (error) {
        console.error('Erro ao salvar resultado da batalha:', error);
        throw error;
      }
    },

    async updateCharacterAfterBattle(character: Character, expGained: number, bountyGained: number, isWinner: boolean): Promise<void> {
      try {
        // ✅ Processar capitão e membros em paralelo
        const [captainUpdates, memberUpdates] = await Promise.all([
          this.processCaptainUpdates(character, expGained, bountyGained, isWinner),
          this.processCrewMemberUpdates(character, expGained, bountyGained, isWinner, GenerationConfig.createEpic().regularCrewSharedGain)
        ])

        // ✅ Aplicar todas as atualizações em paralelo
        const allUpdates = [
          db.characters.update(character.id!, captainUpdates),
          ...memberUpdates.map(update => 
            db.characters.update(update.id, update.updates)
          )
        ]

        await Promise.all(allUpdates)

        if(character.isPlayer === 1){
          const characterStore = useCharacterStore()
          await characterStore.loadPlayerCharacter()
          character.level = captainUpdates.level || character.level
          character.bounty = captainUpdates.bounty || character.bounty
          character.experience = captainUpdates.experience || character.experience
        }
        
        console.log(`✅ ${character.name} e ${memberUpdates.length} membros atualizados com sucesso`)
        
      } catch (error) {
        console.error('❌ Erro ao atualizar personagem após batalha:', error)
        throw error
      }
    },

    // ✅ PROCESSAR ATUALIZAÇÕES DO CAPITÃO
    async processCaptainUpdates(
      character: Character, 
      expGained: number, 
      bountyGained: number, 
      isWinner: boolean
    ): Promise<Partial<Character>> {
      const updates: Partial<Character> = {}
      
      // ✅ Calcular nova experiência SEM mutar o objeto original
      const newExp = character.experience + expGained
      const tempCharacter = { ...character, experience: newExp } // Cópia para cálculos
      
      const levelCheck = GameLogic.checkLevelUp(tempCharacter)

      if (levelCheck.shouldLevelUp) {
        // ✅ Level up!
        const newLevel = levelCheck.newLevel!
        const remainingExp = newExp - levelCheck.expNeeded!

        // Buscar dados necessários
        const [devilFruit, styleCombat] = await Promise.all([
          character.devilFruitId ? db.devilFruits.get(character.devilFruitId) : null,
          db.styleCombats.get(character.styleCombatId)
        ])

        if (!styleCombat) {
          throw new Error(`Style Combat não encontrado para o personagem ${character.name}`)
        }
        
        // ✅ Calcular aumento de stats com o nível correto
        const updatedCharacter = {
          ...character,
          level: newLevel,
          experience: remainingExp
        }

        updatedCharacter.stats = this.calculateStatIncrease(updatedCharacter)
        
        const statIncrease = GameLogic.increaseStats(updatedCharacter, newLevel, styleCombat, devilFruit)
        
        updates.level = newLevel
        updates.experience = remainingExp
        updates.stats = {
          ...character.stats,
          ...statIncrease
        }      
      } else {
        updates.experience = newExp
      }
      
      // ✅ Atualizar bounty (apenas para piratas vencedores)
      if (isWinner && bountyGained > 0 && character.type === 'Pirate') {
        updates.bounty = character.bounty + bountyGained
      }

      return updates
    },

    // ✅ PROCESSAR ATUALIZAÇÕES DOS MEMBROS DO CREW
    async processCrewMemberUpdates(
      captain: Character, 
      expGained: number, 
      bountyGained: number, 
      isWinner: boolean,
      percentage: number
    ): Promise<Array<{ id: number, updates: Partial<Character> }>> {
      if (!captain.crewId) return []

      const crewMembers = await db.characters.where('crewId').equals(captain.crewId).toArray()
      const members = crewMembers.filter(member => member.id !== captain.id)
      
      if (members.length === 0) return []

      // ✅ Processar todos os membros em paralelo
      const memberUpdatesPromises = members.map(async (member) => {
        const updates: Partial<Character> = {}

        if (isWinner) {
          // ✅ Calcular ganhos dos membros (30-50% do capitão)
          const memberExpGain = Math.floor(expGained * percentage)
          const memberBountyGain = Math.floor(bountyGained * percentage)

          // ✅ Calcular nova experiência SEM mutar o objeto original
          const newExpMember = member.experience + memberExpGain
          const tempMember = { ...member, experience: newExpMember }
          
          const levelCheckMember = GameLogic.checkLevelUp(tempMember)
          
          if (levelCheckMember.shouldLevelUp) {
            const newLevelMember = levelCheckMember.newLevel!
            const remainingExpMember = newExpMember - levelCheckMember.expNeeded!

            // Buscar dados necessários
            const [devilFruitMember, styleCombatMember] = await Promise.all([
              member.devilFruitId ? db.devilFruits.get(member.devilFruitId) : null,
              db.styleCombats.get(member.styleCombatId)
            ])

            if (!styleCombatMember) {
              throw new Error(`Style Combat não encontrado para o personagem ${member.name}`)
            }
            
            // ✅ Calcular aumento de stats
            const updatedMember = {
              ...member,
              level: newLevelMember,
              experience: remainingExpMember
            }

            updatedMember.stats = this.calculateStatIncrease(updatedMember)
            
            
            const statIncreaseMember = GameLogic.increaseStats(updatedMember, newLevelMember, styleCombatMember, devilFruitMember)

            updates.level = newLevelMember
            updates.experience = remainingExpMember
            updates.stats = {
              ...member.stats,
              ...statIncreaseMember
            }
            
          } else {
            updates.experience = newExpMember
          }
          
          // Atualizar bounty para piratas
          if (memberBountyGain > 0 && member.type === 'Pirate') {
            updates.bounty = member.bounty + memberBountyGain
          }
          
          // ✅ Aumentar loyalty por vitória
          updates.loyalty = Math.min(100, member.loyalty + (1 + Math.random() * 3)) // +1 a +4
          
        } else {
          // ✅ Diminuir loyalty por derrota
          updates.loyalty = Math.max(-100, member.loyalty - (1 + Math.random() * 2)) // -1 a -3
        }

        return {
          id: member.id!,
          updates
        }
      })

      return Promise.all(memberUpdatesPromises)
    },

    calculateStatIncrease(character: Character): Character['stats'] {
        // ✅ DEFINIR PONTOS TOTAIS DISPONÍVEIS POR LEVEL
        const pointsPerLevel = 2 + Math.floor(Math.random() * 3); // 2-4 pontos aleatórios
        
        // ✅ STATS BASE ATUAIS
        const currentStats = character.stats || {
          attack: 0,
          defense: 0,
          speed: 0,
          armHaki: 0,
          obsHaki: 0,
          kingHaki: 0,
          devilFruit: 0
        };
        
        // ✅ DEFINIR PRIORIDADES POR TIPO DE PERSONAGEM
        const typePriorities = this.getTypePriorities(character.type);
        
        // ✅ CRIAR POOL DE STATS ELEGÍVEIS
        const eligibleStats = this.getEligibleStats(character);
        
        // ✅ DISTRIBUIR PONTOS ALEATORIAMENTE
        const distributedPoints = this.distributePointsRandomly(pointsPerLevel, eligibleStats, typePriorities);
        
        // ✅ APLICAR AUMENTOS AOS STATS ATUAIS
        return {
          attack: currentStats.attack + (distributedPoints.attack || 0),
          defense: currentStats.defense + (distributedPoints.defense || 0),
          speed: currentStats.speed + (distributedPoints.speed || 0),
          armHaki: currentStats.armHaki + (distributedPoints.armHaki || 0),
          obsHaki: currentStats.obsHaki + (distributedPoints.obsHaki || 0),
          kingHaki: currentStats.kingHaki + (distributedPoints.kingHaki || 0),
          devilFruit: currentStats.devilFruit + (distributedPoints.devilFruit || 0)
        };
      },
      // ✅ DEFINIR PRIORIDADES POR TIPO
      getTypePriorities(type: string): { [key: string]: number } {
        const priorities = {
          'Swordsman': {
            attack: 25,      // 40% chance de receber pontos
            defense: 20,
            speed: 25,
            armHaki: 15,
            obsHaki: 10,
            devilFruit: 5
          },
          'Support': {
            speed: 30,
            obsHaki: 13,
            defense: 20,
            attack: 20,
            armHaki: 12,
            devilFruit: 5
          },
          'Fighter': {
            attack: 30,
            defense: 20,
            speed: 20,
            armHaki: 15,
            obsHaki: 10,
            devilFruit: 5
          },
          'Sniper': {
            attack: 25,
            speed: 35,
            obsHaki: 15,
            defense: 10,
            armHaki: 10,
            devilFruit: 5
          }
        };
        
        return priorities[type as keyof typeof priorities] || {
          attack: 25, defense: 25, speed: 25, armHaki: 15, obsHaki: 15, devilFruit: 10
        };
      },

      // ✅ DETERMINAR STATS ELEGÍVEIS PARA RECEBER PONTOS
      getEligibleStats(character: Character): string[] {
        const eligible: string[] = [];
        
        // Stats básicos sempre elegíveis
        eligible.push('attack', 'defense', 'speed');
        
        // Haki só elegível se já tiver ou se for de alto level
        if (character.stats.armHaki > 0 || character.level >= 50) {
          eligible.push('armHaki');
        }
        
        if (character.stats.obsHaki > 0 || character.level >= 50) {
          eligible.push('obsHaki');
        }
        
        // Devil Fruit só se já tiver ou chance especial
        if (character.stats.devilFruit > 0) {
          eligible.push('devilFruit');
        }
        
        return eligible;
      },

      // ✅ DISTRIBUIR PONTOS ALEATORIAMENTE COM BASE NAS PRIORIDADES
      distributePointsRandomly(
        totalPoints: number, 
        eligibleStats: string[], 
        priorities: { [key: string]: number }
      ): { [key: string]: number } {
        
        const distribution: { [key: string]: number } = {};
        let remainingPoints = totalPoints;
        
        // Inicializar todos os stats elegíveis com 0
        eligibleStats.forEach(stat => {
          distribution[stat] = 0;
        });
        
        // ✅ DISTRIBUIR PONTOS UM POR VEZ
        while (remainingPoints > 0) {
          // Criar array ponderado baseado nas prioridades
          const weightedStats: string[] = [];
          
          eligibleStats.forEach(stat => {
            const weight = priorities[stat] || 10;
            // Adicionar o stat múltiplas vezes baseado no peso
            for (let i = 0; i < weight; i++) {
              weightedStats.push(stat);
            }
          });
          
          // Selecionar stat aleatório do array ponderado
          const selectedStat = weightedStats[Math.floor(Math.random() * weightedStats.length)];
          
          // ✅ APLICAR LIMITADORES PARA EVITAR CONCENTRAÇÃO EXCESSIVA
          const maxPointsPerStat = Math.ceil(totalPoints * 0.6); // Máximo 60% dos pontos em um stat
          
          if (distribution[selectedStat] < maxPointsPerStat) {
            distribution[selectedStat]++;
            remainingPoints--;
          } else {
            // Se o stat atingiu o limite, remover das opções temporariamente
            const statIndex = eligibleStats.indexOf(selectedStat);
            if (statIndex > -1 && eligibleStats.length > 1) {
              eligibleStats.splice(statIndex, 1);
            }
            
            // Se todos os stats atingiram o limite, quebrar o loop
            if (eligibleStats.length === 0) {
              break;
            }
          }
        }
        
        return distribution;
      },

    async loadBattleHistory(characterId?: number): Promise<void> {
      try {
        let battles: Battle[];
        
        if (characterId) {
          // Carregar batalhas de um personagem específico
          battles = await db.battles
            .where('challenger').equals(characterId)
            .or('opponent').equals(characterId)
            .reverse()
            .limit(50)
            .toArray();
        } else {
          // Carregar todas as batalhas recentes
          battles = await db.battles
            .orderBy('timestamp')
            .reverse()
            .limit(100)
            .toArray();
        }
        
        this.battleHistory = battles;
        
      } catch (error) {
        console.error('Erro ao carregar histórico de batalhas:', error);
        throw error;
      }
    },

    async getBattleById(battleId: number): Promise<Battle | undefined> {
      try {
        return await db.battles.get(battleId);
      } catch (error) {
        console.error('Erro ao buscar batalha:', error);
        return undefined;
      }
    }
  },

  getters: {
    recentBattles: (state) => state.battleHistory.slice(0, 10),
    
    playerBattles: (state) => (playerId: number) => 
      state.battleHistory.filter(battle => 
        battle.challenger === playerId || battle.opponent === playerId
      ),
      
    winRate: (state) => (playerId: number) => {
      const playerBattles = state.battleHistory.filter(battle => 
        battle.challenger === playerId || battle.opponent === playerId
      );
      
      if (playerBattles.length === 0) return 0;
      
      const wins = playerBattles.filter(battle => battle.winner === playerId).length;
      return Math.round((wins / playerBattles.length) * 100);
    }
  }
})