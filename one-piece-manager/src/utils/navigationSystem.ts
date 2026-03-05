// src/utils/navigationSystem.ts
import { db } from './database'
import { AdventureSystem } from './adventureSystem'
import type { Task, Character, Crew, Island, Ship } from './database'
import { useCharacterStore } from '@/stores/characterStore'
import { GameLogic } from './gameLogic'
import { GenerationConfig } from '@/utils/generationConfig'

export class NavigationSystem {
  // ✅ VERIFICAR SE PODE NAVEGAR
  static async canStartNavigation(crewId: number): Promise<{
    canNavigate: boolean
    reason?: string
    conflictingTasks?: Task[]
  }> {
    try {
      const now = new Date()

      // Verificar se há alguma task ativa
      const activeTasks = await db.tasks
        .filter((task) => {
          return !task.isCompleted && new Date(task.endTime) > now
        })
        .toArray()

      if (activeTasks.length > 0) {
        return {
          canNavigate: false,
          reason: 'Há tarefas ativas. Complete ou cancele todas as tarefas antes de navegar.',
          conflictingTasks: activeTasks,
        }
      }

      return {
        canNavigate: true,
      }
    } catch (error) {
      console.error('❌ Erro ao verificar se pode navegar:', error)
      return {
        canNavigate: false,
        reason: 'Erro ao verificar tarefas ativas.',
      }
    }
  }

  // ✅ VERIFICAR SE HÁ NAVEGAÇÃO ATIVA
  static async hasActiveNavigationTask(): Promise<Task | null> {
    try {
      const now = new Date()

      const activeTask = await db.tasks
        .where('type')
        .equals('navigation')
        .and((task) => {
          const notCompletedAndActive = !task.isCompleted && new Date(task.endTime) > now
          const justFinished = !task.isCompleted && new Date(task.endTime) <= now

          return notCompletedAndActive || justFinished
        })
        .first()

      return activeTask || null
    } catch (error) {
      console.error('❌ Erro ao verificar navegação ativa:', error)
      return null
    }
  }

  // ✅ CALCULAR TEMPO DE NAVEGAÇÃO
  static calculateNavigationTime(shipLevel: number): number {
    const navigationFactor = GenerationConfig.createEpic().navigationFactor
    const timeInMinutes = Math.max(
      navigationFactor,
      navigationFactor * 5 - (shipLevel - 1) * navigationFactor,
    )
    //const timeInMinutes = 1
    return timeInMinutes
  }

  // ✅ MÉTODO PARA SELECIONAR ILHA DE DESTINO (COM SEA GATING)
  static async selectDestinationIsland(
    currentIslandId: number,
    character?: Character,
  ): Promise<Island | null> {
    try {
      console.log(
        '🔍 NavigationSystem - Selecionando ilha de destino. Ilha atual:',
        currentIslandId,
      )

      // Buscar ilha atual
      const currentIsland = await db.islands.get(currentIslandId)
      if (!currentIsland) {
        console.error('❌ NavigationSystem - Ilha atual não encontrada:', currentIslandId)
        return null
      }

      // Calcular dificuldade máxima acessível
      // NPCs (sem character) têm acesso total; jogadores são limitados pelo mar desbloqueado
      const maxDifficulty = character
        ? Math.max(
            currentIsland.difficulty, // sempre pode sair da ilha atual
            GameLogic.getMaxAccessibleDifficulty(character),
          )
        : 30

      // Buscar ilhas acessíveis (exceto a atual)
      const allIslands = (await db.islands.where('id').notEqual(currentIslandId).toArray())
        .filter((island) => island.difficulty <= maxDifficulty)

      if (allIslands.length === 0) {
        console.error('❌ NavigationSystem - Nenhuma ilha disponível para navegação')
        return null
      }

      console.log(`🏝️ NavigationSystem - Ilhas acessíveis (maxDiff=${maxDifficulty}):`, allIslands.length)

      // Lógica de seleção: 40% mesma dificuldade, 60% dificuldade +1 (dentro do max)
      const random = Math.random()
      let targetDifficulty: number

      if (random < 0.4) {
        targetDifficulty = currentIsland.difficulty
      } else {
        targetDifficulty = Math.min(currentIsland.difficulty + 1, maxDifficulty)
      }

      let candidateIslands = allIslands.filter((island) => island.difficulty === targetDifficulty)

      if (candidateIslands.length === 0) {
        candidateIslands = allIslands
      }

      const randomIndex = Math.floor(Math.random() * candidateIslands.length)
      const selectedIsland = candidateIslands[randomIndex]

      console.log('✅ NavigationSystem - Ilha selecionada:', {
        id: selectedIsland.id,
        name: selectedIsland.name,
        difficulty: selectedIsland.difficulty,
        fromDifficulty: currentIsland.difficulty,
        maxDifficulty,
      })

      return selectedIsland
    } catch (error) {
      console.error('❌ NavigationSystem - Erro ao selecionar ilha de destino:', error)
      return null
    }
  }

  // ✅ INICIAR NAVEGAÇÃO
  static async startNavigation(crewId: number, characterId: number): Promise<Task | null> {
    try {
      // Verificar se pode navegar
      const canNavigate = await this.canStartNavigation(crewId)
      if (!canNavigate.canNavigate) {
        console.log('❌ Não é possível navegar:', canNavigate.reason)
        return null
      }

      // Buscar dados necessários
      const [crew, ship] = await Promise.all([
        db.crews.get(crewId),
        db.ships.where('crewId').equals(crewId).first(),
      ])

      if (!crew || !ship) {
        console.error('❌ Crew ou navio não encontrado')
        return null
      }

      // Selecionar ilha destino (com sea gating para jogadores)
      const character = await db.characters.get(characterId)
      const destinationIsland = await this.selectDestinationIsland(
        crew.currentIsland,
        character ?? undefined,
      )
      if (!destinationIsland) {
        console.error('❌ Não foi possível selecionar ilha destino')
        return null
      }

      // Calcular tempo de navegação
      const navigationTimeMinutes = this.calculateNavigationTime(ship.level)

      // Criar task de navegação
      const now = new Date()
      const endTime = new Date(now.getTime() + navigationTimeMinutes * 60 * 1000)

      const navigationTask: Omit<Task, 'id'> = {
        type: 'navigation',
        characterId,
        targetId: destinationIsland.id!, // ID da ilha destino
        startTime: now,
        endTime,
        isCompleted: false,
        description: `Navegando para ${destinationIsland.name}`,
        kindnessReward: 0,
        experienceReward: 0,
        bountyReward: 0,
        duration: navigationTimeMinutes,
        helpType: '',
        difficulty: 'medium',
        createdAt: now,
        location: destinationIsland.name,
        crewId: crewId,
      }

      const taskId = await db.tasks.add(navigationTask)

      const createdTask = {
        ...navigationTask,
        id: taskId,
      } as Task

      console.log(
        `🚢 Navegação iniciada para ${destinationIsland.name} (${navigationTimeMinutes} min)`,
      )

      return createdTask
    } catch (error) {
      console.error('❌ Erro ao iniciar navegação:', error)
      return null
    }
  }

  // ✅ BUSCAR BANDO INIMIGO (ATUALIZADO COM LÓGICA DO ADVENTURE)
  static async findEnemyCrew(
    originIslandId: number,
    destinationIslandId: number,
    crewId: number,
  ): Promise<Crew | null> {
    try {
      // Buscar crews que estão em alto mar (docked = 0) nas ilhas de origem ou destino
      const devilFruits = await db.devilFruits.toArray()
      const enemyCrews = await db.crews
        .where('docked')
        .equals(0)
        .and(
          (crew) =>
            (crew.currentIsland === originIslandId || crew.currentIsland === destinationIslandId) &&
            crew.id !== crewId, // Excluir o próprio crew
        )
        .toArray()

      if (enemyCrews.length === 0) {
        console.log('⚠️ Nenhum bando inimigo encontrado em alto mar')
        return null
      }

      // Buscar o crew do player para determinar tipo
      const playerCrew = await db.crews.get(crewId)
      if (!playerCrew) {
        console.error('❌ Crew do player não encontrado')
        return null
      }

      // Buscar capitão do player para determinar tipo
      const playerCaptain = await db.characters.get(playerCrew.captainId)
      if (!playerCaptain) {
        console.error('❌ Capitão do player não encontrado')
        return null
      }

      // Filtrar crews compatíveis por tipo (usando lógica do AdventureSystem)
      const compatibleCrews: Crew[] = []

      for (const enemyCrew of enemyCrews) {
        const enemyCaptain = await db.characters.get(enemyCrew.captainId)
        if (!enemyCaptain) continue

        // Aplicar regras de compatibilidade do AdventureSystem
        const isCompatible = this.isCompatibleOpponent(playerCaptain, enemyCaptain)

        if (isCompatible) {
          compatibleCrews.push(enemyCrew)
        }
      }

      if (compatibleCrews.length === 0) {
        console.log('⚠️ Nenhum bando compatível encontrado')
        return null
      }

      // Calcular poder do player crew
      const playerMembers = await db.characters.where('crewId').equals(playerCrew.id!).toArray()

      const playerPower = GameLogic.calculateCrewPower(playerMembers, devilFruits)

      // Calcular poder dos crews inimigos e ordenar por proximidade
      const enemiesWithPower = await Promise.all(
        compatibleCrews.map(async (crew) => {
          const members = await db.characters.where('crewId').equals(crew.id!).toArray()
          const power = GameLogic.calculateCrewPower(members, devilFruits)

          const captain = await db.characters.get(crew.captainId)

          return {
            crew,
            power,
            powerDifference: Math.abs(power - playerPower),
            captain,
          }
        }),
      )

      // Priorizar usando lógica similar ao AdventureSystem
      const prioritizedEnemies = this.prioritizeEnemyCrews(playerCaptain, enemiesWithPower)

      // Selecionar um dos 3 primeiros (ou todos se houver menos)
      const topCandidates = prioritizedEnemies.slice(0, 3)
      const randomIndex = Math.floor(Math.random() * topCandidates.length)

      const selectedEnemy = topCandidates[randomIndex]

      console.log(
        `⚔️ Bando inimigo selecionado: ${selectedEnemy.crew.name} (poder: ${selectedEnemy.power})`,
      )

      return selectedEnemy.crew
    } catch (error) {
      console.error('❌ Erro ao buscar bando inimigo:', error)
      return null
    }
  }

  // ✅ VERIFICAR COMPATIBILIDADE DE OPONENTES (BASEADO NO ADVENTURE SYSTEM)
  static isCompatibleOpponent(playerCaptain: Character, enemyCaptain: Character): boolean {
    switch (playerCaptain.type) {
      case 'Pirate':
        return ['Marine', 'Government', 'BountyHunter', 'Pirate'].includes(enemyCaptain.type)

      case 'Marine':
        return ['Pirate'].includes(enemyCaptain.type)

      case 'BountyHunter':
        return ['Pirate', 'BountyHunter'].includes(enemyCaptain.type)

      case 'Government':
        // Agentes do governo podem encontrar qualquer um com kindness > 0
        return (
          enemyCaptain.kindness > 0 &&
          ['Pirate', 'Marine', 'BountyHunter'].includes(enemyCaptain.type)
        )

      default:
        return true
    }
  }

  // ✅ PRIORIZAR CREWS INIMIGOS (BASEADO NO ADVENTURE SYSTEM)
  static prioritizeEnemyCrews(
    playerCaptain: Character,
    enemiesWithPower: Array<{
      crew: Crew
      power: number
      powerDifference: number
      captain: Character | undefined
    }>,
  ): Array<{
    crew: Crew
    power: number
    powerDifference: number
    captain: Character | undefined
  }> {
    return enemiesWithPower.sort((a, b) => {
      let scoreA = 0
      let scoreB = 0

      if (!a.captain || !b.captain) return 0

      // Priorizar rivais naturais (mesma lógica do AdventureSystem)
      if (
        (playerCaptain.type === 'Pirate' && a.captain.type === 'Marine') ||
        (playerCaptain.type === 'Marine' && a.captain.type === 'Pirate') ||
        (playerCaptain.type === 'BountyHunter' && a.captain.type === 'Pirate')
      ) {
        scoreA += 10
      }

      if (
        (playerCaptain.type === 'Pirate' && b.captain.type === 'Marine') ||
        (playerCaptain.type === 'Marine' && b.captain.type === 'Pirate') ||
        (playerCaptain.type === 'BountyHunter' && b.captain.type === 'Pirate')
      ) {
        scoreB += 10
      }

      // Priorizar levels próximos
      const levelDiffA = Math.abs(playerCaptain.level - a.captain.level)
      const levelDiffB = Math.abs(playerCaptain.level - b.captain.level)
      scoreA += Math.max(0, 10 - levelDiffA)
      scoreB += Math.max(0, 10 - levelDiffB)

      // Priorizar poder próximo
      scoreA += Math.max(0, 10 - a.powerDifference / 1000) // Dividir por 1000 para normalizar
      scoreB += Math.max(0, 10 - b.powerDifference / 1000)

      // Priorizar bounties interessantes
      if (a.captain.bounty > playerCaptain.bounty) scoreA += 5
      if (b.captain.bounty > playerCaptain.bounty) scoreB += 5

      // Priorizar crews com reputação alta
      scoreA += Math.floor(a.crew.reputation / 1000)
      scoreB += Math.floor(b.crew.reputation / 1000)

      return scoreB - scoreA
    })
  }

  // ✅ DETERMINAR TIPO DE ENCONTRO NAVAL (BASEADO NO ADVENTURE SYSTEM)
  static determineNavalEncounterType(
    playerCaptain: Character,
    enemyCaptain: Character,
  ): 'hostile' | 'neutral' | 'friendly' {
    // Piratas vs Marines = sempre hostil
    if (
      (playerCaptain.type === 'Pirate' && enemyCaptain.type === 'Marine') ||
      (playerCaptain.type === 'Marine' && enemyCaptain.type === 'Pirate')
    ) {
      return 'hostile'
    }

    // BountyHunters vs Piratas = sempre hostil
    if (
      (playerCaptain.type === 'BountyHunter' && enemyCaptain.type === 'Pirate') ||
      (playerCaptain.type === 'Pirate' && enemyCaptain.type === 'BountyHunter')
    ) {
      return 'hostile'
    }

    // Government vs Piratas = sempre hostil
    if (
      (playerCaptain.type === 'Government' && enemyCaptain.type === 'Pirate') ||
      (playerCaptain.type === 'Pirate' && enemyCaptain.type === 'Government')
    ) {
      return 'hostile'
    }

    // Marines vs Government = geralmente neutro/amigável (mesma facção)
    if (
      (playerCaptain.type === 'Marine' && enemyCaptain.type === 'Government') ||
      (playerCaptain.type === 'Government' && enemyCaptain.type === 'Marine')
    ) {
      return Math.random() < 0.7 ? 'neutral' : 'friendly'
    }

    // BountyHunter vs Marine = neutro (podem cooperar contra piratas)
    if (
      (playerCaptain.type === 'BountyHunter' && enemyCaptain.type === 'Marine') ||
      (playerCaptain.type === 'Marine' && enemyCaptain.type === 'BountyHunter')
    ) {
      return Math.random() < 0.6 ? 'neutral' : 'hostile'
    }

    // BountyHunter vs Government = neutro (podem cooperar)
    if (
      (playerCaptain.type === 'BountyHunter' && enemyCaptain.type === 'Government') ||
      (playerCaptain.type === 'Government' && enemyCaptain.type === 'BountyHunter')
    ) {
      return Math.random() < 0.5 ? 'neutral' : 'hostile'
    }

    // Mesmo tipo = geralmente neutro
    if (playerCaptain.type === enemyCaptain.type) {
      return Math.random() < 0.6 ? 'neutral' : 'friendly'
    }

    // Casos padrão - usar kindness como fator
    const avgKindness = (playerCaptain.kindness + enemyCaptain.kindness) / 2

    if (avgKindness > 7) {
      return 'friendly'
    } else if (avgKindness > 4) {
      return Math.random() < 0.7 ? 'neutral' : 'hostile'
    } else {
      return Math.random() < 0.8 ? 'hostile' : 'neutral'
    }
  }

  // ✅ GERAR HISTÓRIA DA BATALHA (ATUALIZADA COM TIPOS DE ENCONTRO)
  static generateBattleStory(playerCrew: Crew, enemyCrew: Crew, island: Island): string {
    // Buscar capitães para determinar tipo de encontro
    const getEncounterStory = async () => {
      const [playerCaptain, enemyCaptain] = await Promise.all([
        db.characters.get(playerCrew.captainId),
        db.characters.get(enemyCrew.captainId),
      ])

      if (!playerCaptain || !enemyCaptain) {
        return `Enquanto ${playerCrew.name} se aproximava de ${island.name}, avistaram as velas de ${enemyCrew.name} no horizonte. O confronto era inevitável!`
      }

      const encounterType = this.determineNavalEncounterType(playerCaptain, enemyCaptain)

      const stories: Record<'hostile' | 'neutral' | 'friendly', string[]> = {
        hostile: [
          `Enquanto ${playerCrew.name} se aproximava de ${island.name}, avistaram as velas de ${enemyCrew.name} no horizonte. Como ${this.getTypeDescription(enemyCaptain.type)}, o confronto era inevitável!`,

          `As águas próximas a ${island.name} ecoaram com gritos de guerra quando ${playerCrew.name} cruzou com ${enemyCrew.name}. A rivalidade entre ${this.getTypeDescription(playerCaptain.type)} e ${this.getTypeDescription(enemyCaptain.type)} tornou a batalha naval inevitável!`,

          `${enemyCrew.name} estava patrulhando as águas de ${island.name} quando ${playerCrew.name} apareceu. A tensão entre ${playerCaptain.type}s e ${enemyCaptain.type}s explodiu em combate!`,

          `O destino colocou ${playerCrew.name} e ${enemyCrew.name} em rota de colisão nas águas turbulentas próximas a ${island.name}. A guerra entre facções rivais começou!`,
        ],
        neutral: [
          `${playerCrew.name} encontrou ${enemyCrew.name} nas águas de ${island.name}. Apesar da tensão inicial, a situação escalou para um confronto naval.`,

          `Nas águas próximas a ${island.name}, ${playerCrew.name} e ${enemyCrew.name} se encontraram. O que começou como uma negociação terminou em batalha.`,
        ],
        friendly: [
          `${playerCrew.name} avistou ${enemyCrew.name} perto de ${island.name}. Apesar das intenções pacíficas iniciais, um mal-entendido levou ao confronto naval.`,
        ],
      }

      const encounterStories = stories[encounterType]
      const randomIndex = Math.floor(Math.random() * encounterStories.length)
      return encounterStories[randomIndex]
    }

    // Como esta função é síncrona, vamos usar uma versão simplificada
    const hostileStories = [
      `Enquanto ${playerCrew.name} se aproximava de ${island.name}, avistaram as velas de ${enemyCrew.name} no horizonte. O confronto era inevitável!`,

      `As águas próximas a ${island.name} ecoaram com gritos de guerra quando ${playerCrew.name} cruzou com ${enemyCrew.name}. A batalha naval começou!`,

      `${enemyCrew.name} estava patrulhando as águas de ${island.name} quando ${playerCrew.name} apareceu. Nenhum dos bandos recuou!`,

      `O destino colocou ${playerCrew.name} e ${enemyCrew.name} em rota de colisão nas águas turbulentas próximas a ${island.name}. A guerra começou!`,

      `Sob o céu tempestuoso de ${island.name}, ${playerCrew.name} enfrentou ${enemyCrew.name} em uma batalha épica que ecoou pelos mares!`,
    ]

    const randomIndex = Math.floor(Math.random() * hostileStories.length)
    return hostileStories[randomIndex]
  }

  // ✅ DESCRIÇÕES DOS TIPOS (BASEADO NO ADVENTURE SYSTEM)
  static getTypeDescription(type: string): string {
    switch (type) {
      case 'Pirate':
        return 'um pirata temido pelos mares'
      case 'Marine':
        return 'um marine dedicado à justiça'
      case 'Government':
        return 'um agente misterioso do governo mundial'
      case 'BountyHunter':
        return 'um caçador de recompensas experiente'
      case 'Civillian':
        return 'um civil pacífico'
      default:
        return 'um navegador misterioso'
    }
  }
  static async completeNavigation(taskId: number): Promise<{
    success: boolean
    destinationIsland?: Island
    destinationIslandId?: number
    enemyCrew?: Crew
    enemyCrewId?: number
    battleStory?: string
    enemyCrewSize?: number
    encounterType?: string
  }> {
    try {
      console.log('🔄 NavigationSystem - Completando navegação para task:', taskId)

      const task = await db.tasks.get(taskId)
      if (!task) {
        console.error('❌ NavigationSystem - Task não encontrada:', taskId)
        return { success: false }
      }

      console.log('✅ NavigationSystem - Task encontrada:', task.description)

      // Buscar crew
      const crew = await db.crews.get(task.crewId)
      if (!crew) {
        console.error('❌ NavigationSystem - Crew não encontrado:', task.crewId)
        return { success: false }
      }

      console.log(
        '✅ NavigationSystem - Crew encontrado:',
        crew.name,
        'Ilha atual:',
        crew.currentIsland,
      )

      // Buscar crew
      const destinationIsland = await db.islands.get(task.targetId)
      if (!destinationIsland) {
        console.error(
          '❌ NavigationSystem - Não foi possível determinar ilha de destino',
          task.crewId,
        )
        return { success: false }
      }

      console.log(
        '🏝️ NavigationSystem - Ilha de destino selecionada:',
        destinationIsland.name,
        'ID:',
        destinationIsland.id,
      )

      // ✅ ATUALIZAR LOCALIZAÇÃO DO CREW PRIMEIRO
      console.log('🔄 NavigationSystem - Atualizando localização do crew...')
      const updateResult = await db.crews.update(crew.id!, {
        currentIsland: destinationIsland.id!,
        docked: 1,
      })

      console.log(
        '✅ NavigationSystem - Crew atualizado:',
        updateResult,
        'Nova ilha:',
        destinationIsland.id,
      )

      // Verificar se a atualização foi bem-sucedida
      const updatedCrew = await db.crews.get(crew.id!)
      console.log('🔍 NavigationSystem - Crew após update:', {
        id: updatedCrew?.id,
        name: updatedCrew?.name,
        currentIsland: updatedCrew?.currentIsland,
        docked: updatedCrew?.docked,
      })

      // Verificar encontro com crew inimigo
      const encounterResult = await this.determineNavalEncounter(crew, destinationIsland)

      console.log('⚔️ NavigationSystem - Resultado do encontro:', encounterResult)

      // ✅ MARCAR TASK COMO CONCLUÍDA
      console.log('🔄 NavigationSystem - Marcando task como concluída...')
      const taskUpdateResult = await db.tasks.update(taskId, {
        isCompleted: true,
        endTime: new Date(),
        location: destinationIsland.name,
      })

      console.log('✅ NavigationSystem - Task atualizada:', taskUpdateResult)

      // ✅ VERIFICAR SE TUDO FOI ATUALIZADO CORRETAMENTE
      const finalCrew = await db.crews.get(crew.id!)
      const finalTask = await db.tasks.get(taskId)

      console.log('🔍 NavigationSystem - Estado final:', {
        crew: {
          id: finalCrew?.id,
          name: finalCrew?.name,
          currentIsland: finalCrew?.currentIsland,
          docked: finalCrew?.docked,
        },
        task: {
          id: finalTask?.id,
          isCompleted: finalTask?.isCompleted,
          location: finalTask?.location,
        },
        destinationIsland: {
          id: destinationIsland.id,
          name: destinationIsland.name,
        },
      })

      console.log('✅ NavigationSystem - Navegação completada com sucesso!')

      // 🌍 ATUALIZAR MUNDO APÓS BATALHA DO JOGADOR
      const worldUpdate = await AdventureSystem.onPlayerAction()

      return {
        success: true,
        destinationIsland: destinationIsland,
        destinationIslandId: destinationIsland.id,
        enemyCrew: encounterResult.enemyCrew,
        enemyCrewId: encounterResult.enemyCrew?.id,
        battleStory: encounterResult.battleStory,
        enemyCrewSize: encounterResult.enemyCrewSize,
        encounterType: encounterResult.encounterType,
      }
    } catch (error) {
      console.error('❌ NavigationSystem - Erro ao completar navegação:', error)
      return { success: false }
    }
  }

  // ✅ MÉTODO PARA DETERMINAR ENCONTRO NAVAL
  static async determineNavalEncounter(
    crew: Crew,
    destinationIsland: Island,
  ): Promise<{
    enemyCrew?: Crew
    enemyCrewSize?: number
    battleStory?: string
    encounterType: string
  }> {
    try {
      console.log('🔍 NavigationSystem - Verificando encontros navais...')

      // 30% de chance de encontrar um crew inimigo
      const encounterChance = Math.random()

      if (encounterChance > 0.7) {
        console.log('⚔️ NavigationSystem - Encontro naval detectado!')

        // Buscar crew inimigo compatível
        const enemyCrew = await this.findEnemyCrew(
          crew.currentIsland,
          destinationIsland.id || 0,
          crew.id || 0,
        )

        if (enemyCrew) {
          // Contar membros do crew inimigo
          const enemyMembers = await db.characters.where('crewId').equals(enemyCrew.id!).toArray()

          const battleStory = this.generateBattleStory(crew, enemyCrew, destinationIsland)

          return {
            enemyCrew: enemyCrew,
            enemyCrewSize: enemyMembers.length,
            battleStory: battleStory,
            encounterType: 'naval_battle',
          }
        }
      }

      console.log('🌊 NavigationSystem - Navegação pacífica')
      return {
        encounterType: 'peaceful',
      }
    } catch (error) {
      console.error('❌ NavigationSystem - Erro ao determinar encontro:', error)
      return {
        encounterType: 'error',
      }
    }
  }

  // ✅ OBTER PROGRESSO DA NAVEGAÇÃO
  static getNavigationProgress(task: Task): {
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
      isCompleted,
    }
  }

  // ✅ FORMATAR TEMPO
  static formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }
}
