// src/utils/territoryLiberationSystem.ts
import { db, type Territory, type Task, type Character, type Crew, type Island, type DevilFruit } from './database'
import { AdventureSystem } from './adventureSystem'
import { GameLogic } from './gameLogic'
import { useBattleStore } from '@/stores/battleStore'
import {GenerationConfig} from '@/utils/generationConfig'
import { useCharacterStore } from '@/stores/characterStore'

export interface LiberationTaskResult {
  success: boolean
  message: string
  task?: Task
  battleResult?: any
  devilFruitDropped?: DevilFruit
  rewardDetails?: {
    experience: number
    bounty: number
    treasury: number
    stepBonus: number
  }
}

export class TerritoryLiberationSystem {
  
  // ✅ VERIFICAR SE ILHA TEM TERRITÓRIO OCUPADO
  static async getIslandTerritory(islandId: number): Promise<Territory | null> {
    try {
      const territory = await db.territories
        .where('islandId')
        .equals(islandId)
        .first()
      
      return territory || null
    } catch (error) {
      console.error('❌ Erro ao buscar território da ilha:', error)
      return null
    }
  }

  // ✅ VERIFICAR SE ILHA ESTÁ OCUPADA
  static async isIslandOccupied(islandId: number): Promise<boolean> {
    try {
      const territory = await this.getIslandTerritory(islandId)
      return territory !== null && territory.crewId !== null
    } catch (error) {
      console.error('❌ Erro ao verificar ocupação da ilha:', error)
      return false
    }
  }

  // ✅ INICIAR PROCESSO DE LIBERAÇÃO
  static async startLiberationProcess(characterId: number, islandId: number): Promise<{
    success: boolean
    message: string
    task?: Task
  }> {
    try {
      console.log(`🏴‍☠️ Iniciando liberação da ilha ${islandId} pelo personagem ${characterId}`)

      // Verificar se personagem existe
      const character = await db.characters.get(characterId)
      if (!character) {
        return { success: false, message: 'Personagem não encontrado' }
      }

      // Verificar se ilha existe
      const island = await db.islands.get(islandId)
      if (!island) {
        return { success: false, message: 'Ilha não encontrada' }
      }

      // Verificar se ilha está ocupada
      const territory = await this.getIslandTerritory(islandId)
      if (!territory || territory.crewId === null) {
        return { success: false, message: 'Esta ilha não está ocupada por nenhum crew' }
      }

      // Verificar se já tem task ativa para esta ilha
      const existingTask = await db.tasks
        .where('characterId')
        .equals(characterId)
        .and(task => 
          task.type === 'island_liberation' && 
          task.targetIslandId === islandId && 
          !task.isCompleted
        )
        .first()

      if (existingTask) {
        return { success: false, message: 'Você já tem uma missão de liberação ativa para esta ilha' }
      }

      // Determinar step inicial
      let currentStep = 1
      
      // Verificar se já completou steps anteriores
      const completedTasks = await db.tasks
        .where('characterId')
        .equals(characterId)
        .and(task => 
          task.type === 'island_liberation' && 
          task.targetIslandId === islandId && 
          task.isCompleted && 
          task.stepCompleted === true
        )
        .toArray()

      currentStep = completedTasks.length + 1

      // Verificar se já liberou a ilha
      if (currentStep > island.difficulty) {
        return { success: false, message: 'Esta ilha já foi completamente liberada por você' }
      }

      // Buscar crew ocupante
      const occupyingCrew = await db.crews.get(territory.crewId)
      if (!occupyingCrew) {
        return { success: false, message: 'Crew ocupante não encontrado' }
      }

      // Criar nova task (seguindo padrão do shipUpgradeSystem)
      const now = new Date()
      const duration= 0.5
      const endTime = new Date(now.getTime() + duration * 60 * 1000) // 5 minutos

      const newTask: Omit<Task, 'id'> = {
        type: 'island_liberation',
        characterId,
        targetId: islandId, // ID da ilha
        startTime: now,
        endTime: endTime,
        isCompleted: false,
        description: `Liberando ${island.name} - Step ${currentStep}/${island.difficulty}`,
        kindnessReward: 0,
        experienceReward: this.calculateExperienceReward(currentStep, island.difficulty),
        bountyReward: await this.calculateBountyReward(occupyingCrew.captainId, character, currentStep, island.difficulty),
        duration: duration, // 5 minutos
        helpType: 'liberation',
        difficulty: this.getDifficultyFromStep(currentStep, island.difficulty),
        location: island.name,
        createdAt: now,
        
        // Campos específicos de liberation
        step: currentStep,
        stepCompleted: false,
        targetIslandId: islandId,
        targetCrewId: territory.crewId
      }

      const taskId = await db.tasks.add(newTask)
      const createdTask = { ...newTask, id: taskId } as Task

      console.log(`✅ Task de liberação criada: Step ${currentStep}/${island.difficulty}`)

      return {
        success: true,
        message: `Missão de liberação iniciada! Step ${currentStep} de ${island.difficulty}`,
        task: createdTask
      }

    } catch (error) {
      console.error('❌ Erro ao iniciar processo de liberação:', error)
      return { success: false, message: `Erro: ${error}` }
    }
  }

  // ✅ PROCESSAR CONCLUSÃO DA TASK (CHAMADO PELO SISTEMA DE MONITORAMENTO)
  static async completeLiberationTask(taskId: number): Promise<LiberationTaskResult> {
    try {
      console.log(`⚔️ Processando conclusão da task de liberação ${taskId}`)

      const task = await db.tasks.get(taskId)
      if (!task || task.type !== 'island_liberation') {
        return { success: false, message: 'Task de liberação não encontrada' }
      }

      const character = await db.characters.get(task.characterId)
      const island = await db.islands.get(task.targetIslandId!)
      const crew = await db.crews.get(task.targetCrewId!)

      if (!character || !island || !crew) {
        return { success: false, message: 'Dados da missão não encontrados' }
      }

      // Determinar oponente
      const isLastStep = task.step === island.difficulty
      let opponent: Character

      if (isLastStep) {
        // Último step = capitão
        opponent = await db.characters.get(crew.captainId)
        if (!opponent) {
          return { success: false, message: 'Capitão do crew não encontrado' }
        }
      } else {
        // Steps anteriores = membro aleatório (não capitão)
        const crewMembers = await db.characters
          .where('crewId')
          .equals(crew.id!)
          .and(char => char.id !== crew.captainId)
          .toArray()

        if (crewMembers.length === 0) {
          return { success: false, message: 'Nenhum membro disponível para batalha' }
        }

        const randomIndex = Math.floor(Math.random() * crewMembers.length)
        opponent = crewMembers[randomIndex]
      }

      console.log(`⚔️ Batalha: ${character.name} vs ${opponent.name} (Step ${task.step})`)

      // ✅ EXECUTAR BATALHA USANDO ADVENTURESYSTEM
      const battleResult = await this.executeLiberationBattle(character, opponent, isLastStep)

      // Calcular recompensas baseadas no step
      const rewardDetails = await this.calculateLiberationRewards(task.step!, island.difficulty, isLastStep, crew.captainId, character)

      let devilFruitDropped: DevilFruit | undefined

      if (battleResult.winner === character.id) {
        // VITÓRIA
        console.log(`🎉 ${character.name} venceu a batalha!`)

        // Marcar step como completado
        await db.tasks.update(taskId, {
          isCompleted: true,
          stepCompleted: true,
          experienceReward: rewardDetails.experience,
          bountyReward: rewardDetails.bounty,
          description: `${task.description} - CONCLUÍDO COM SUCESSO`
        })

        // Aplicar recompensas
        await this.applyLiberationRewards(character.id!, rewardDetails)

        // Chance de dropar Devil Fruit 
        if (Math.random() < GenerationConfig.createEpic().devilFruitDropRate) {
          devilFruitDropped = await this.handleDevilFruitDrop(character.id!)
        }

        // Se foi o último step, liberar território
        if (isLastStep) {
            const allTerritories = await db.territories.toArray()
            const currentTerritory = allTerritories.find(terr => terr.islandId === task.targetIslandId)
            await db.territories.update(currentTerritory!, { crewId: 0 })
            console.log(`🏝️ Ilha ${island.name} foi liberada!`)
        }

        return {
          success: true,
          message: isLastStep 
            ? `🎉 Parabéns! Você liberou a ilha ${island.name}!`
            : `✅ Step ${task.step} concluído! Próximo: ${task.step! + 1}/${island.difficulty}`,
          task,
          battleResult,
          devilFruitDropped,
          rewardDetails
        }

      } else {
        // DERROTA
        console.log(`💀 ${character.name} foi derrotado...`)

        // Marcar task como completada mas step não completado
        await db.tasks.update(taskId, {
          isCompleted: true,
          stepCompleted: false,
          description: `${task.description} - FALHOU`
        })

        return {
          success: false,
          message: `💀 Você foi derrotado! Tente novamente o step ${task.step}.`,
          task,
          battleResult
        }
      }

    } catch (error) {
      console.error('❌ Erro ao processar conclusão da task:', error)
      return { success: false, message: `Erro: ${error}` }
    }
  }

  // ✅ EXECUTAR BATALHA DE LIBERAÇÃO (USANDO ADVENTURESYSTEM)
  private static async executeLiberationBattle(player: Character, opponent: Character, isLastStep: boolean): Promise<any> {
    try {
      const battleStore = useBattleStore()
      const allDevilFruits = await db.devilFruits.toArray()
      const playerCrewMembers = await db.characters.where('crewId').equals(player.crewId).and(char => char.position != 'Captain').toArray()
      const opponenteCrewMembers = await db.characters.where('crewId').equals(opponent.crewId).and(char => char.position != 'Captain').toArray()
      const playerDevilFruit = allDevilFruits.find(df => df.id == player.devilFruitId)
      const opponentDevilFruit = allDevilFruits.find(df => df.id == opponent.devilFruitId)

      // Simular batalha usando lógica similar ao AdventureSystem
      const playerPower = GameLogic.calculatePower(player, playerDevilFruit)
      const opponentPower = GameLogic.calculatePower(opponent, opponentDevilFruit)
      const playerCrewPower = GameLogic.calculateCrewPower(playerCrewMembers, allDevilFruits)
      const opponentCrewPower = GameLogic.calculateCrewPower(opponenteCrewMembers, allDevilFruits)
      
      const totalPower = isLastStep ? playerPower + opponentPower : playerPower + opponentPower + (playerCrewPower + opponentCrewPower) * 1
      const playerWinChance = (isLastStep ? playerPower : (playerPower + playerCrewPower) * 1) / totalPower
      
      // Adicionar elemento de sorte (±10%)
      const luck = (Math.random() * 0.2) - 0.1
      const finalWinChance = Math.max(0.1, Math.min(0.9, playerWinChance + luck))
      
      const playerWins = Math.random() < finalWinChance
      const winner = playerWins ? player : opponent
      const loser = playerWins ? opponent : player

      // Aplicar recompensas se player venceu
      if (playerWins) {
        const expGain = GameLogic.calculateExperienceGain(player, opponent)
        const bountyGain = GameLogic.calculateBountyGain(player, opponent)

        // ✅ Processar capitão e membros em paralelo
        const [captainUpdates, memberUpdates] = await Promise.all([
          battleStore.processCaptainUpdates(player, expGain, bountyGain, true),
          battleStore.processCrewMemberUpdates(player, expGain, bountyGain, true, 1)
        ])

      // ✅ Aplicar todas as atualizações em paralelo
        const allUpdates = [
          db.characters.update(player.id!, captainUpdates),
          ...memberUpdates.map(update => 
            db.characters.update(update.id, update.updates)
          )
        ]

        await Promise.all(allUpdates)

        // Registrar batalha
        await db.battles.add({
          timestamp: new Date(),
          challenger: player.id!,
          opponent: opponent.id!,
          winner: player.id!,
          loser: opponent.id!,
          experienceGained: expGain,
          bountyGained: bountyGain,
          battleLog: [`${player.name} derrotou ${opponent.name} na liberação de território!`],
          challengerCrewId: player.crewId!,
          opponentCrewId: opponent.crewId!
        })
      }

      return {
        winner: winner.id,
        loser: loser.id,
        playerWins,
        battleLog: [`${winner.name} derrotou ${loser.name}!`]
      }

    } catch (error) {
      console.error('❌ Erro na batalha de liberação:', error)
      throw error
    }
  }

  // ✅ CALCULAR RECOMPENSAS
  private static async calculateLiberationRewards(step: number, maxSteps: number, isLastStep: boolean, captainEnemy: number, character: Character): Promise<{
    experience: number
    bounty: number
    treasury: number
    stepBonus: number
  }> {
    // Base rewards aumentam com o step
    const baseExp = this.calculateExperienceReward(step, maxSteps)
    const baseBounty = await this.calculateBountyReward(captainEnemy, character, step, maxSteps)
    const baseTreasury = 5000 + (step * 2500)
    
    // Bonus progressivo
    const stepBonus = step / maxSteps
    
    // Bonus final se for último step
    const finalBonus = isLastStep ? 2 : 1
    
    return {
      experience: Math.floor(baseExp * (1 + stepBonus)),
      bounty: Math.floor(baseBounty * (1 + stepBonus)),
      treasury: Math.floor(baseTreasury * (1 + stepBonus)),
      stepBonus: Math.round(stepBonus * 100)
    }
  }

  // ✅ APLICAR RECOMPENSAS
  private static async applyLiberationRewards(characterId: number, rewards: {
    experience: number
    bounty: number
    treasury: number
  }): Promise<void> {
    try {
      const character = await db.characters.get(characterId)
      if (!character) return


      // Atualizar tesouro do crew
      if (character.crewId) {
        const crew = await db.crews.get(character.crewId)
        if (crew) {
          await db.crews.update(character.crewId, {
            treasury: crew.treasury + rewards.treasury
          })
        }
      }

      const battleStore = useBattleStore()

      // ✅ Processar capitão e membros em paralelo
        const [captainUpdates, memberUpdates] = await Promise.all([
          battleStore.processCaptainUpdates(character, rewards.experience, rewards.bounty, true),
          battleStore.processCrewMemberUpdates(character, rewards.experience, rewards.bounty, true, (0.3 + Math.random() * 0.2))
        ])

      // ✅ Aplicar todas as atualizações em paralelo
        const allUpdates = [
          db.characters.update(character.id!, captainUpdates),
          ...memberUpdates.map(update => 
            db.characters.update(update.id, update.updates)
          )
        ]

        await Promise.all(allUpdates)

      console.log(`💰 Recompensas aplicadas: +${rewards.experience} XP, +${rewards.bounty} bounty, +${rewards.treasury} treasury`)

    } catch (error) {
      console.error('❌ Erro ao aplicar recompensas:', error)
    }
  }

  // ✅ HANDLE DEVIL FRUIT DROP
  private static async handleDevilFruitDrop(characterId: number): Promise<DevilFruit | undefined> {
    try {
      // Buscar Devil Fruit disponível (sem owner)
      const availableFruits = await db.devilFruits
        .where('ownerId')
        .equals(0)
        .toArray()

      if (availableFruits.length === 0) {
        console.log('📦 Nenhuma Devil Fruit disponível para drop')
        return undefined
      }

      // Selecionar fruta aleatória
      const randomIndex = Math.floor(Math.random() * availableFruits.length)
      const droppedFruit = availableFruits[randomIndex]

      console.log(`🍎 Devil Fruit dropada: ${droppedFruit.name}`)

      // Por enquanto, só retorna a fruta
      // A escolha de comer/dar será feita na interface
      return droppedFruit

    } catch (error) {
      console.error('❌ Erro ao processar drop de Devil Fruit:', error)
      return undefined
    }
  }

  // ✅ CONSUMIR DEVIL FRUIT
  static async consumeDevilFruit(characterId: number, devilFruitId: number): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const characterStore = useCharacterStore()
      const character = await db.characters.get(characterId)
      const devilFruit = await db.devilFruits.get(devilFruitId)

      if (!character || !devilFruit) {
        return { success: false, message: 'Personagem ou Devil Fruit não encontrados' }
      }

      if (character.devilFruitId && character.devilFruitId !== 0) {
        return { success: false, message: 'Este personagem já possui uma Devil Fruit' }
      }

      if (devilFruit.ownerId !== 0) {
        return { success: false, message: 'Esta Devil Fruit já tem um dono' }
      }

      // Atribuir Devil Fruit ao personagem
      await db.characters.update(characterId, {
        devilFruitId: devilFruitId,
        stats: {
          ...character.stats,
          devilFruit: 0 // Stats baseados no level
        }
      })

      await db.devilFruits.update(devilFruitId, {
        ownerId: characterId
      })

      console.log(`🍎 ${character.name} consumiu ${devilFruit.name}`)

    await characterStore.loadPlayerCharacter();
    await characterStore.loadPlayerCrew();


      return {
        success: true,
        message: `${character.name} consumiu a ${devilFruit.name}!`
      }

    } catch (error) {
      console.error('❌ Erro ao consumir Devil Fruit:', error)
      return { success: false, message: `Erro: ${error}` }
    }
  }

   // ✅ NOVO MÉTODO PARA DAR DEVIL FRUIT À TRIPULAÇÃO
  static async giveDevilFruitToCrewMember(
    crewMemberId: number,
    devilFruitId: number
  ): Promise<{
    success: boolean
    message: string
  }> {
    try {
      console.log(`🍎 Dando Devil Fruit ${devilFruitId} para membro ${crewMemberId}`)
      
      // Verificar se o membro existe e não tem Devil Fruit
      const crewMember = await db.characters.get(crewMemberId)
      if (!crewMember) {
        return {
          success: false,
          message: 'Membro da tripulação não encontrado'
        }
      }
      
      if (crewMember.devilFruitId && crewMember.devilFruitId !== 0) {
        return {
          success: false,
          message: 'Este membro já possui uma Devil Fruit'
        }
      }
      
      // Verificar se a Devil Fruit existe
      const devilFruit = await db.devilFruits.get(devilFruitId)
      if (!devilFruit) {
        return {
          success: false,
          message: 'Devil Fruit não encontrada'
        }
      }
      
      // Atualizar o membro com a Devil Fruit
      await db.characters.update(crewMemberId, {
        devilFruitId: devilFruitId
      })

      await db.devilFruits.update(devilFruitId, {
        ownerId: crewMemberId
      })
      
      // Aumentar loyalty do membro (receber Devil Fruit é um grande presente)
      const loyaltyIncrease = Math.floor(Math.random() * 20) + 10 // 10-30 pontos
      const newLoyalty = Math.min(100, crewMember.loyalty + loyaltyIncrease)
      
      await db.characters.update(crewMemberId, {
        loyalty: newLoyalty
      })
      
      console.log(`✅ ${crewMember.name} recebeu ${devilFruit.name}`)
      console.log(`📈 Loyalty: ${crewMember.loyalty} → ${newLoyalty} (+${loyaltyIncrease})`)
      
      return {
        success: true,
        message: `${crewMember.name} consumiu a ${devilFruit.name} e sua loyalty aumentou para ${newLoyalty}!`
      }
      
    } catch (error) {
      console.error('❌ Erro ao dar Devil Fruit para membro:', error)
      return {
        success: false,
        message: 'Erro interno ao processar Devil Fruit'
      }
    }
  }

  // ✅ OBTER PROGRESSO DE LIBERAÇÃO
  static async getLiberationProgress(characterId: number, islandId: number): Promise<{
    currentStep: number
    maxSteps: number
    completedSteps: number
    isLiberated: boolean
    canStart: boolean
    occupyingCrew?: Crew
  }> {
    try {
      const island = await db.islands.get(islandId)
      if (!island) {
        return {
          currentStep: 0,
          maxSteps: 0,
          completedSteps: 0,
          isLiberated: false,
          canStart: false
        }
      }

      const territory = await this.getIslandTerritory(islandId)
      const isLiberated = !territory || territory.crewId === 0

      let occupyingCrew: Crew | undefined
      if (territory && territory.crewId) {
        occupyingCrew = await db.crews.get(territory.crewId) || undefined
      }

      const completedTasks = await db.tasks
        .where('characterId')
        .equals(characterId)
        .and(task => 
          task.type === 'island_liberation' && 
          task.targetIslandId === islandId && 
          task.isCompleted && 
          task.stepCompleted === true
        )
        .toArray()

        const hasActiveTask = await db.tasks
        .where('characterId')
        .equals(characterId)
        .and(task => 
          !task.isCompleted
        )
        .toArray()

      const completedSteps = completedTasks.length
      const currentStep = completedSteps + 1
      const canStart = !isLiberated && currentStep <= island.difficulty && hasActiveTask.length == 0

      return {
        currentStep,
        maxSteps: island.difficulty,
        completedSteps,
        isLiberated,
        canStart,
        occupyingCrew
      }

    } catch (error) {
      console.error('❌ Erro ao obter progresso de liberação:', error)
      return {
        currentStep: 0,
        maxSteps: 0,
        completedSteps: 0,
        isLiberated: false,
        canStart: false
      }
    }
  }

  // ✅ VERIFICAR SE TEM TASK ATIVA DE LIBERAÇÃO
  static async hasActiveLiberationTask(characterId: number, islandId?: number): Promise<Task | null> {
    try {
      const now = new Date()
      
      let query = db.tasks
        .where('characterId')
        .equals(characterId)
        .and(task => 
          task.type === 'island_liberation' && 
          !task.isCompleted
        )

      if (islandId) {
        query = query.and(task => task.targetIslandId === islandId)
      }

      const activeTask = await query.first()
      return activeTask || null
      
    } catch (error) {
      console.error('❌ Erro ao verificar task de liberação ativa:', error)
      return null
    }
  }

  // ✅ MÉTODOS AUXILIARES
  public static calculateExperienceReward(step: number, maxSteps: number): number {
    const baseExp = GameLogic.expNeeded(maxSteps * 3)
    return (1 + maxSteps) * 100  + (step * baseExp / maxSteps) + (step === maxSteps ? baseExp / maxSteps : 0) // Bonus no último step
  }

  public static async calculateBountyReward(captainEnemy: number, character: Character, step: number, maxSteps: number): Promise<number> {
    const captain = await db.characters.get(captainEnemy)
    const bountySuggested = GameLogic.calculateBountyGain(character, captain)
    return bountySuggested * step / maxSteps
  }

  private static getDifficultyFromStep(step: number, maxSteps: number): 'easy' | 'medium' | 'hard' {
    const ratio = step / maxSteps
    if (ratio <= 0.33) return 'easy'
    if (ratio <= 0.66) return 'medium'
    return 'hard'
  }

  // ✅ OBTER PROGRESSO DA TASK (PARA INTERFACE)
  static getLiberationTaskProgress(task: Task): {
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

  // ✅ FORMATAR TEMPO
  static formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }
}