// src/utils/trainingSystem.ts
import { db } from './database'
import { GameLogic } from './gameLogic'
import { useBattleStore } from '@/stores/battleStore'
import type { Task, Character, Crew } from './database'

export class TrainingSystem {
  
  // ✅ VERIFICAR SE PODE INICIAR TREINO
  static async canStartTraining(crewId: number): Promise<boolean> {
    try {
      // Verificar se há alguma task de exploração ativa
      const activeExplorationTask = await db.tasks
        .where('type')
        .anyOf(['exploration', 'ship_upgrade', 'navigation']) 
        .and(task => {
            const now = new Date()
          return !task.isCompleted && new Date(task.endTime) > now
        })
        .first()
      
      if (activeExplorationTask) {
        console.log('❌ Não é possível treinar: exploração ativa')
        return false
      }
      
      // Verificar se já há treino ativo
      const activeTrainingTask = await db.tasks
        .where('type')
        .equals('training')
        .and(task => {
          const now = new Date()
          return !task.isCompleted && new Date(task.endTime) > now
        })
        .first()
      
      if (activeTrainingTask) {
        console.log('❌ Já existe um treino ativo')
        return false
      }
      
      return true
      
    } catch (error) {
      console.error('❌ Erro ao verificar se pode treinar:', error)
      return false
    }
  }
  
  // ✅ VERIFICAR SE JÁ EXISTE TASK DE TREINO ATIVA
  static async hasActiveTrainingTask(): Promise<Task | null> {
    try {
        const now = new Date()
        
        // ✅ Buscar task de treino que não foi completada OU que acabou de ser completada
        const activeTask = await db.tasks
        .where('type')
        .equals('training')
        .and(task => {
            // Task não completada E ainda não passou do tempo
            const notCompletedAndActive = !task.isCompleted && new Date(task.endTime) > now
            
            // Task que acabou de completar (tempo passou mas ainda não foi marcada como completa)
            const justFinished = !task.isCompleted && new Date(task.endTime) <= now
            
            return notCompletedAndActive || justFinished
        })
        .first()
        
        return activeTask || null
        
    } catch (error) {
        console.error('❌ Erro ao verificar task ativa:', error)
        return null
    }
}
 // ✅ VERIFICAR TODAS AS TASKS ATIVAS (NOVA FUNÇÃO)
  static async getActiveTasks(): Promise<{
    explorationTasks: Task[]
    trainingTasks: Task[]
    otherTasks: Task[]
    hasConflicts: boolean
  }> {
    try {
      const now = new Date()
      
      // Buscar todas as tasks ativas
      const activeTasks = await db.tasks
        .filter(task => {
          return !task.isCompleted && new Date(task.endTime) > now
        })
        .toArray()
      
      // Separar por tipo
      const explorationTasks = activeTasks.filter(task => task.type === 'exploration')
      const trainingTasks = activeTasks.filter(task => task.type === 'training')
      const otherTasks = activeTasks.filter(task => 
        task.type !== 'exploration' && task.type !== 'training'
      )
      
      // Verificar se há conflitos (exploração ativa impede treino)
      const hasConflicts = explorationTasks.length > 0 || trainingTasks.length > 0
      
      console.log('📋 Tasks ativas encontradas:', {
        exploration: explorationTasks.length,
        training: trainingTasks.length,
        other: otherTasks.length,
        hasConflicts
      })
      
      return {
        explorationTasks,
        trainingTasks,
        otherTasks,
        hasConflicts
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar tasks ativas:', error)
      return {
        explorationTasks: [],
        trainingTasks: [],
        otherTasks: [],
        hasConflicts: false
      }
    }
  }
  
  // ✅ CALCULAR EXPERIÊNCIA DO TREINO
  static async calculateTrainingExperience(crewId: number, intensity: 1 | 5 | 10): Promise<number> {
    try {
      // Buscar todos os membros da tripulação (incluindo capitão)
      const crewMembers = await db.characters
        .where('crewId')
        .equals(crewId)
        .toArray()
      
      if (crewMembers.length === 0) {
        return 0
      }
      
      // Encontrar o membro de maior nível
      const highestLevelMember = crewMembers.reduce((highest, current) => 
        current.level > highest.level ? current : highest
      )
      
      // Calcular experiência necessária para o próximo nível do membro de maior nível
      const expForNextLevel = GameLogic.nextLevelUp(highestLevelMember)
      
      // Calcular 1% da experiência necessária
      const baseExp = Math.ceil(expForNextLevel * 0.01)
      
      // Multiplicar pela intensidade
      const intensityExp = baseExp * intensity
      
      // Aplicar multiplicador aleatório (1-5)
      const randomMultiplier = Math.floor(Math.random() * 5) + 1
      
      const finalExp = intensityExp * randomMultiplier
      
      console.log(`🏋️ Cálculo de EXP:`)
      console.log(`- Membro maior nível: ${highestLevelMember.name} (Level ${highestLevelMember.level})`)
      console.log(`- EXP para próximo nível: ${expForNextLevel}`)
      console.log(`- Base (1%): ${baseExp}`)
      console.log(`- Intensidade ${intensity}x: ${intensityExp}`)
      console.log(`- Multiplicador aleatório: ${randomMultiplier}`)
      console.log(`- EXP final: ${finalExp}`)
      
      return finalExp
      
    } catch (error) {
      console.error('❌ Erro ao calcular experiência:', error)
      return 0
    }
  }
  
  // ✅ INICIAR TREINO (CRIAR TASK)
  static async startTraining(
    crewId: number, 
    characterId: number, 
    intensity: 1 | 5 | 10
  ): Promise<Task | null> {
    try {
      // Verificar se pode treinar
      const canTrain = await this.canStartTraining(crewId)
      if (!canTrain) {
        console.log('❌ Não é possível iniciar treino')
        return null
      }
      
      // Calcular experiência
      const experience = await this.calculateTrainingExperience(crewId, intensity)
      const crew = await db.crews.get(crewId)
      const island = await db.islands.get(crew?.currentIsland)
      
      // Criar nova task de treino
      const now = new Date()
      const endTime = new Date(now.getTime() + intensity * 60 * 1000) // intensity em minutos
      
      const trainingTask: Omit<Task, 'id'> = {
        type: 'training',
        characterId,
        targetId: crewId, // Usar crewId como targetId
        startTime: now,
        endTime: endTime,
        isCompleted: false,
        description: `Treino ${intensity}x - Intensidade ${this.getIntensityName(intensity)}`,
        kindnessReward: 0,
        experienceReward: experience, 
        bountyReward: 0, 
        duration: intensity as number,
        helpType: '',
        difficulty: this.getIntensityName(intensity) as 'easy' | 'medium' | 'hard',
        createdAt: now,
        location: island?.name || ''
      }

      
      const taskId = await db.tasks.add(trainingTask)
      
      const createdTask = {
        ...trainingTask,
        id: taskId
      } as Task
      
      console.log(`��️ Treino iniciado: ${intensity}x (${intensity} min) - ${experience} EXP`)
      
      return createdTask
      
    } catch (error) {
      console.error('❌ Erro ao iniciar treino:', error)
      return null
    }
  }
  
  // ✅ COMPLETAR TREINO
  static async completeTraining(taskId: number): Promise<boolean> {
    try {
        const battleStore = useBattleStore();
      const task = await db.tasks.get(taskId)
      if (!task || task.type !== 'training' || !task.targetId) {
        console.error('❌ Task de treino não encontrada')
        return false
      }
      
      // Buscar todos os membros da tripulação
      const crewMembers = await db.characters
        .where('crewId')
        .equals(task.targetId) // targetId é o crewId
        .toArray()
      
      if (crewMembers.length === 0) {
        console.error('❌ Nenhum membro encontrado na tripulação')
        return false
      }

      const crewCaptain = crewMembers.find(char => char.position === 'Captain')

      if(crewCaptain){
    // Aplicar experiência a todos os membros
        const experienceGained = task.experienceReward

        // ✅ Processar capitão e membros em paralelo
            const [captainUpdates, memberUpdates] = await Promise.all([
            battleStore.processCaptainUpdates(crewCaptain, (experienceGained || 0), 0, true),
            battleStore.processCrewMemberUpdates(crewCaptain, (experienceGained || 0), 0, true, 1)
            ])

        // ✅ Aplicar todas as atualizações em paralelo
            const allUpdates = [
            db.characters.update(crewCaptain.id!, captainUpdates),
            ...memberUpdates.map(update => 
                db.characters.update(update.id, update.updates)
            ),db.tasks.update(taskId, { 
            isCompleted: true,
            description: `${task.description} - CONCLUÍDO (+${experienceGained} EXP)`
            })
            ]

            await Promise.all(allUpdates)
        console.log(`✅ Treino completado! Todos os ${crewMembers.length} membros ganharam ${experienceGained} EXP`)
      }
      
      
      return true
      
    } catch (error) {
      console.error('❌ Erro ao completar treino:', error)
      return false
    }
  }
  
  // ✅ CANCELAR TREINO
  static async cancelTraining(taskId: number): Promise<boolean> {
    try {
      const task = await db.tasks.get(taskId)
      if (!task || task.type !== 'training') {
        return false
      }
      
      // Remover task do banco
      await db.tasks.delete(taskId)
      
      console.log('❌ Treino cancelado')
      return true
      
    } catch (error) {
      console.error('❌ Erro ao cancelar treino:', error)
      return false
    }
  }
  
  // ✅ OBTER PROGRESSO DA TASK
  static getTaskProgress(task: Task): {
    progress: number
    timeRemaining: number
    isCompleted: boolean
  } {
    const now = new Date()
    const startTime = new Date(task.startTime)
    const endTime = new Date(task.endTime)
    
    const totalTime = endTime.getTime() - startTime.getTime()
    const elapsed = now.getTime() - startTime.getTime()
    const remaining = endTime.getTime() - now.getTime()
    
    const progress = Math.min(100, Math.max(0, (elapsed / totalTime) * 100))
    const isCompleted = now >= endTime
    
    return {
      progress,
      timeRemaining: Math.max(0, remaining),
      isCompleted
    }
  }
  
  // ✅ OBTER NOME DA INTENSIDADE
  static getIntensityName(intensity: 1 | 5 | 10): string {
    switch (intensity) {
      case 1: return 'easy'
      case 5: return 'medium'
      case 10: return 'hard'
      default: return 'easy'
    }
  }
  
  // ✅ OBTER COR DA INTENSIDADE
  static getIntensityColor(intensity: 1 | 5 | 10): string {
    switch (intensity) {
      case 1: return 'green'
      case 5: return 'orange'
      case 10: return 'red'
      default: return 'grey'
    }
  }
  
  // ✅ FORMATAR TEMPO
  static formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }
  
  // ✅ OBTER DURAÇÃO EM MINUTOS
  static getIntensityDuration(intensity: 1 | 5 | 10): number {
    return intensity // Retorna diretamente a intensidade em minutos
  }

  static formatTaskInfo(task: Task): {
    title: string
    timeRemaining: string
    progress: number
    icon: string
    color: string
  } {
    const now = new Date()
    const endTime = new Date(task.endTime)
    const startTime = new Date(task.startTime)
    
    const totalTime = endTime.getTime() - startTime.getTime()
    const elapsed = now.getTime() - startTime.getTime()
    const remaining = endTime.getTime() - now.getTime()
    
    const progress = Math.min(100, Math.max(0, (elapsed / totalTime) * 100))
    const timeRemaining = this.formatTime(Math.max(0, remaining))
    
    let title = task.description || 'Tarefa'
    let icon = 'mdi-clipboard-list'
    let color = 'blue'
    
    switch (task.type) {
      case 'exploration':
        icon = 'mdi-compass'
        color = 'green'
        title = task.description || 'Exploração'
        break
        
      case 'training':
        icon = 'mdi-dumbbell'
        color = 'orange'
        title = task.description || 'Treino'
        break
        
      case 'navigation':
        icon = 'mdi-ship-wheel'
        color = 'blue'
        title = task.description || 'Navegação'
        break
        
      case 'ship_upgrade':
        icon = 'mdi-hammer-wrench'
        color = 'purple'
        title = task.description || 'Upgrade do Navio'
        break
        
      default:
        icon = 'mdi-clipboard-list'
        color = 'grey'
        title = task.description || 'Tarefa Desconhecida'
    }
    
    return {
      title,
      timeRemaining,
      progress: Math.round(progress),
      icon,
      color
    }
  }
}