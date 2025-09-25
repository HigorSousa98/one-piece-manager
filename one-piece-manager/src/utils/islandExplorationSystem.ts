// src/utils/islandExplorationSystem.ts

import { db, type Character, type Task } from './database'
import { GameLogic } from './gameLogic';

export interface CivilianEncounter {
  civilian: Character;
  location: string;
  encounterType: 'help_request' | 'emergency' | 'casual_meeting';
  taskOptions: TaskOption[];
  description: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface TaskOption {
  id: string;
  helpType: Task['helpType'];
  type: Task['type'];
  name: string;
  description: string;
  duration: number; // em minutos
  difficulty: 'easy' | 'medium' | 'hard';
  kindnessReward: number;
  experienceReward: number;
  bountyReward?: number;
  requirements?: {
    minLevel?: number;
    maxLevel?: number;
    kindness?: number;
  };
}

export interface ExplorationResult {
  success: boolean;
  encounterFound: boolean;
  encounter?: CivilianEncounter;
  message: string;
  nextExplorationAvailable: Date;
}

export class IslandExplorationSystem {
  
  // 🏝️ EXPLORAR ILHA
  static async exploreIsland(character: Character, islandId: number): Promise<ExplorationResult> {
    
    // ❌ VERIFICAR SE PODE EXPLORAR
    const canExplore = await this.canCharacterExplore(character);
    if (!canExplore.allowed) {
      return {
        success: false,
        encounterFound: false,
        message: canExplore.reason!,
        nextExplorationAvailable: canExplore.nextAvailable!
      };
    }
    
    // 🎲 CALCULAR CHANCE DE ENCONTRO
    const encounterChance = this.calculateEncounterChance(character);
    const roll = Math.random() * 100;

    console.log('encounterChance', encounterChance)
    console.log('roll', roll)
    
    if (roll <= encounterChance) {
      // ✅ ENCONTRO COM CIVIL
      const encounter = await this.generateCivilianEncounter(character, islandId);
      
      if (encounter) {
        return {
          success: true,
          encounterFound: true,
          encounter,
          message: `Você encontrou ${encounter.civilian.name} em ${encounter.location}!`,
          nextExplorationAvailable: new Date(Date.now() + 30 * 60 * 1000) // 30 min
        };
      }
    }
    
    // ❌ NENHUM ENCONTRO
    return {
      success: true,
      encounterFound: false,
      message: 'Você explorou a ilha mas não encontrou ninguém interessante.',
      nextExplorationAvailable: new Date(Date.now() + 15 * 60 * 1000) // 15 min
    };
  }
  
  // 🚫 VERIFICAR SE PODE EXPLORAR
  private static async canCharacterExplore(character: Character): Promise<{
    allowed: boolean;
    reason?: string;
    nextAvailable?: Date;
  }> {
    
    // Verificar se tem tarefas ativas
    const activeTasks = await db.tasks
      .where('characterId')
      .equals(character.id!)
      .and(task => !task.isCompleted && new Date(task.endTime) > new Date())
      .toArray();
    
    if (activeTasks.length > 0) {
      const nextTask = activeTasks.sort((a, b) => 
        new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
      )[0];
      
      return {
        allowed: false,
        reason: `Você está ocupado com: ${nextTask.description}`,
        nextAvailable: new Date(nextTask.endTime)
      };
    }
    
    return { allowed: true };
  }
  
  // 🎲 CALCULAR CHANCE DE ENCONTRO
  private static calculateEncounterChance(character: Character): number {
    let baseChance = 70; // 30% base
    
    // Bonus por kindness (pessoas bondosas encontram mais quem precisa de ajuda)
    if (character.kindness > 0) {
      baseChance += Math.min(20, character.kindness * 0.2);
    }
    
    // Bonus por level (mais experientes encontram mais situações)
    baseChance += Math.min(10, character.level * 0.1);
    
    return Math.min(90, baseChance); // Máximo 70%
  }
  
  // 👥 GERAR ENCONTRO COM CIVIL
  private static async generateCivilianEncounter(
    character: Character, 
    islandId: number
  ): Promise<CivilianEncounter | null> {
    
    // Buscar civis compatíveis (level similar)
    const civilians = await db.characters
      .where('type')
      .equals('Civillian')
      .and(char => 
        char.level >= character.level - 10 && 
        char.level <= character.level + 5 &&
        !char.crewId // Não está em crew
      )
      .toArray();
    
    if (civilians.length === 0) return null;
    
    // Selecionar civil aleatório
    const civilian = civilians[Math.floor(Math.random() * civilians.length)];
    
    // Gerar encontro
    const encounterTypes: CivilianEncounter['encounterType'][] = [
      'help_request', 'emergency', 'casual_meeting'
    ];
    
    const encounterType = encounterTypes[Math.floor(Math.random() * encounterTypes.length)];
    
    const encounter: CivilianEncounter = {
      civilian,
      location: this.generateLocation(),
      encounterType,
      taskOptions: this.generateTaskOptions(encounterType, character, civilian),
      description: this.generateEncounterDescription(encounterType, civilian),
      urgency: this.calculateUrgency(encounterType)
    };
    
    return encounter;
  }
  
  // 📍 GERAR LOCALIZAÇÃO
  private static generateLocation(): string {
    const locations = [
      'Praça Central', 'Porto', 'Mercado', 'Taverna Local', 'Praia', 
      'Floresta Próxima', 'Montanha', 'Vila Pesqueira', 'Fazenda', 
      'Oficina', 'Hospital', 'Escola', 'Igreja', 'Biblioteca'
    ];
    
    return locations[Math.floor(Math.random() * locations.length)];
  }
  
  // 📝 GERAR OPÇÕES DE TAREFA
  private static generateTaskOptions(
    encounterType: CivilianEncounter['encounterType'],
    character: Character,
    civilian: Character
  ): TaskOption[] {
    
    const baseOptions: TaskOption[] = [];
    
    switch (encounterType) {
      case 'help_request':
        baseOptions.push(
          {
            id: 'help_delivery',
            helpType: 'delivery',
            type: 'exploration',
            name: 'Fazer Entrega',
            description: `Ajudar ${civilian.name} a entregar suprimentos importantes`,
            duration: 1,
            difficulty: 'easy',
            kindnessReward: 1,
            experienceReward: 100
          },
          {
            id: 'help_construction',
            helpType: 'construction',
            type: 'exploration',
            name: 'Ajudar na Construção',
            description: `Auxiliar ${civilian.name} a reparar sua casa`,
            duration: 1,
            difficulty: 'medium',
            kindnessReward: 2,
            experienceReward: 200,
            requirements: { minLevel: 10 }
          }
        );
        break;
        
      case 'emergency':
        baseOptions.push(
          {
            id: 'rescue_mission',
            helpType: 'rescue_mission',
            type: 'exploration',
            name: 'Missão de Resgate',
            description: `${civilian.name} precisa de ajuda urgente para resgatar alguém`,
            duration: 1,
            difficulty: 'hard',
            kindnessReward: 4,
            experienceReward: 400,
            bountyReward: 1000,
            requirements: { minLevel: 15 }
          },
          {
            id: 'medical_aid',
            helpType: 'medical_aid',
            type: 'exploration',
            name: 'Primeiros Socorros',
            description: `Ajudar ${civilian.name} a cuidar de feridos`,
            duration: 1,
            difficulty: 'medium',
            kindnessReward: 3,
            experienceReward: 250
          }
        );
        break;
        
      case 'casual_meeting':
        baseOptions.push(
          {
            id: 'help_civilian',
            helpType: 'help_civilian',
            type: 'exploration',
            name: 'Conversar e Ajudar',
            description: `Passar tempo ajudando ${civilian.name} com tarefas cotidianas`,
            duration: 1,
            difficulty: 'easy',
            kindnessReward: 1,
            experienceReward: 50
          }
        );
        break;
    }
    
    // Filtrar opções baseadas nos requisitos
    return baseOptions.filter(option => {
      if (option.requirements?.minLevel && character.level < option.requirements.minLevel) {
        return false;
      }
      if (option.requirements?.maxLevel && character.level > option.requirements.maxLevel) {
        return false;
      }
      if (option.requirements?.kindness && character.kindness < option.requirements.kindness) {
        return false;
      }
      return true;
    });
  }
  
  // 📖 GERAR DESCRIÇÃO DO ENCONTRO
  private static generateEncounterDescription(
    encounterType: CivilianEncounter['encounterType'],
    civilian: Character
  ): string {
    
    switch (encounterType) {
      case 'help_request':
        return `${civilian.name} se aproxima de você com um olhar esperançoso. Parece que precisa de ajuda com algo importante.`;
        
      case 'emergency':
        return `${civilian.name} corre em sua direção, claramente desesperado! Algo urgente aconteceu e você pode ser a única esperança.`;
        
      case 'casual_meeting':
        return `Você encontra ${civilian.name} realizando suas atividades diárias. Uma conversa amigável pode levar a algo interessante.`;
        
      default:
        return `Você encontrou ${civilian.name}.`;
    }
  }
  
  // ⚡ CALCULAR URGÊNCIA
  private static calculateUrgency(encounterType: CivilianEncounter['encounterType']): CivilianEncounter['urgency'] {
    switch (encounterType) {
      case 'emergency': return 'high';
      case 'help_request': return 'medium';
      case 'casual_meeting': return 'low';
      default: return 'low';
    }
  }
  
  // ✅ ACEITAR TAREFA
  static async acceptTask(
    character: Character,
    civilian: Character,
    taskOption: TaskOption,
    location: string
  ): Promise<{
    success: boolean;
    task?: Task;
    message: string;
  }> {
    
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + taskOption.duration * 60 * 1000);
      
      const task: Omit<Task, 'id'> = {
        characterId: character.id!,
        helpType: taskOption.helpType,
        type: taskOption.type,
        description: taskOption.description,
        duration: taskOption.duration,
        startTime: now,
        endTime,
        isCompleted: false,
        kindnessReward: taskOption.kindnessReward,
        experienceReward: taskOption.experienceReward,
        bountyReward: taskOption.bountyReward,
        targetId: civilian.id!,
        location,
        difficulty: taskOption.difficulty,
        createdAt: now
      };
      
      const taskId = await db.tasks.add(task);
      
      console.log(`📋 ${character.name} aceitou tarefa: ${taskOption.name}`);
      console.log(`⏰ Duração: ${taskOption.duration} minutos`);
      
      return {
        success: true,
        task: { ...task, id: taskId },
        message: `Você aceitou ajudar ${civilian.name}! A tarefa levará ${taskOption.duration} minutos.`
      };
      
    } catch (error) {
      console.error('Erro ao aceitar tarefa:', error);
      return {
        success: false,
        message: 'Erro ao aceitar a tarefa. Tente novamente.'
      };
    }
  }
  
  // ❌ RECUSAR TAREFA
  static async refuseTask(
    character: Character,
    civilian: Character,
    taskOption: TaskOption
  ): Promise<{
    success: boolean;
    kindnessLoss: number;
    message: string;
  }> {
    
    try {
      // Perder kindness por recusar ajuda
      const kindnessLoss = Math.floor(taskOption.kindnessReward * 1.5); // 50% do que ganharia
      const newKindness = character.kindness - kindnessLoss;
      
      await db.characters.update(character.id!, {
        kindness: newKindness
      });

      character.kindness = newKindness
      
      console.log(`💔 ${character.name} recusou ajudar ${civilian.name}`);
      console.log(`📉 Kindness: ${character.kindness} → ${newKindness} (-${kindnessLoss})`);
      
      return {
        success: true,
        kindnessLoss,
        message: `Você decidiu não ajudar ${civilian.name}. Sua bondade diminuiu.`
      };
      
    } catch (error) {
      console.error('Erro ao recusar tarefa:', error);
      return {
        success: false,
        kindnessLoss: 0,
        message: 'Erro interno. Tente novamente.'
      };
    }
  }
  
  // ✅ COMPLETAR TAREFA
  static async completeTask(taskId: number): Promise<{
    success: boolean;
    rewards?: {
      experience: number;
      kindness: number;
      bounty?: number;
    };
    canRecruit?: boolean;
    civilian?: Character;
    message: string;
  }> {
    
    try {
      const task = await db.tasks.get(taskId);
      if (!task) {
        return {
          success: false,
          message: 'Tarefa não encontrada.'
        };
      }
      
      // Verificar se a tarefa já foi completada
      if (task.isCompleted) {
        return {
          success: false,
          message: 'Esta tarefa já foi completada.'
        };
      }
      
      // Verificar se o tempo passou
      if (new Date() < new Date(task.endTime)) {
        return {
          success: false,
          message: 'A tarefa ainda não foi finalizada. Aguarde mais um pouco.'
        };
      }
      
      // Buscar personagem e civil
      const character = await db.characters.get(task.characterId);
      const civilian = task.targetId ? await db.characters.get(task.targetId) : null;
      
      if (!character) {
        return {
          success: false,
          message: 'Personagem não encontrado.'
        };
      }

      const updates: Partial<Character> = {};

      const newExp = character.experience + (task.experienceReward || 0);
      const newKindness = character.kindness + (task.kindnessReward || 0);
      const newBounty = character.bounty + (task.bountyReward || 0);
      character.experience = newExp;
      const levelCheck = GameLogic.checkLevelUp(character);
              
              
      if (levelCheck.shouldLevelUp) {
        // Level up!
        const newLevel = levelCheck.newLevel!;
        const remainingExp = newExp - levelCheck.expNeeded!;

        const devilFruit = character.devilFruitId ? await db.devilFruits.get(character.devilFruitId) : null;
        const styleCombat = await db.styleCombats.get(character.styleCombatId);

          if (!styleCombat) {
              console.error(`Style Combat com ID ${character.styleCombatId} não encontrado!`);
              // Usar um style padrão ou lançar erro
              throw new Error(`Style Combat não encontrado para o personagem ${character.name}`);
          }
        
        // Aumentar stats no level up
        const statIncrease = GameLogic.increaseStats(character, newLevel, styleCombat, devilFruit);
        
        updates.level = newLevel;
        updates.experience = remainingExp;
        updates.stats = {
          ...character.stats,
          ...statIncrease
        };
        character.level = updates.level;
      } else {
        updates.experience = newExp;
      }
      updates.bounty = newBounty;
      updates.kindness = newKindness
      character.experience = updates.experience;
      character.bounty = updates.bounty || 0
      character.kindness = updates.kindness || 0
      
      // Aplicar atualizações
      await db.characters.update(character.id!, updates);
      
      // Marcar tarefa como completada
      await db.tasks.update(taskId, {
        isCompleted: true
      });
      
      // Verificar possibilidade de recrutamento
      const canRecruit = (civilian && 
                        character.kindness >= 0 && // Só kindness positivo
                        !civilian.crewId && // Civil não está em crew
                        Math.random() < 0.3) || false; // 30% de chance
      
      console.log(`✅ ${character.name} completou tarefa: ${task.description}`);
      console.log(`🎁 Recompensas: +${task.experienceReward} EXP, +${task.kindnessReward} Kindness`);
      
      return {
        success: true,
        rewards: {
          experience: (task.experienceReward || 0),
          kindness: (task.kindnessReward || 0),
          bounty: (task.bountyReward || 0)
        },
        canRecruit,
        civilian: civilian || undefined,
        message: `Tarefa completada com sucesso! ${civilian?.name || 'A pessoa'} ficou muito grata.`
      };
      
    } catch (error) {
      console.error('Erro ao completar tarefa:', error);
      return {
        success: false,
        message: 'Erro ao completar a tarefa.'
      };
    }
  }
  
  // 📋 OBTER TAREFAS ATIVAS
  static async getActiveTasks(characterId: number): Promise<Task[]> {
    return await db.tasks
      .where('characterId')
      .equals(characterId)
      .and(task => !task.isCompleted)
      .toArray();
  }

  static async getCurrentIsland(islandId: number): Promise<string> {
    const islands = await db.islands.toArray();
    return islands.find(island => island.id === islandId)?.name || ''
  }

  static async existActiveTask(characterId: number): Promise<boolean> {
    let exist = false
    const activeTasks = await this.getActiveTasks(characterId);
    if(activeTasks.length > 0){
      exist = true
    }
    return exist;
  }

  static async getActiveTasksCount(characterId: number): Promise<number> {
    try {
      const activeTasks = await this.getActiveTasks(characterId);
      return activeTasks.length;
    } catch (error) {
      console.error('Erro ao contar tarefas ativas:', error);
      return 0;
    }
  }
  
  // 📊 OBTER ESTATÍSTICAS DE TAREFAS
  static async getTaskStatistics(characterId: number): Promise<{
    totalCompleted: number;
    totalKindnessGained: number;
    totalExperienceGained: number;
    averageTaskDuration: number;
    tasksByType: Record<string, number>;
  }> {
    
    const completedTasks = await db.tasks
      .where('characterId')
      .equals(characterId)
      .and(task => task.isCompleted)
      .toArray();
    
    const totalKindnessGained = completedTasks.reduce((sum, task) => sum + (task.kindnessReward || 0), 0);
    const totalExperienceGained = completedTasks.reduce((sum, task) => sum + (task.experienceReward || 0), 0);
    const averageTaskDuration = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => sum + task.duration, 0) / completedTasks.length 
      : 0;
    
    const tasksByType: Record<string, number> = {};
    completedTasks.forEach(task => {
      tasksByType[task.type] = (tasksByType[task.type] || 0) + 1;
    });
    
    return {
      totalCompleted: completedTasks.length,
      totalKindnessGained,
      totalExperienceGained,
      averageTaskDuration: Math.round(averageTaskDuration),
      tasksByType
    };
  }
}