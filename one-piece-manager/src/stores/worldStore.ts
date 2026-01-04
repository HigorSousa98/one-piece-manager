// src/stores/worldStore.ts
import { defineStore } from 'pinia'
import { WorldWorkerManager } from '@/utils/worldWorkerManager'
import { FallbackScheduler } from '@/utils/fallbackScheduler'
import { AdventureSystem } from '@/utils/adventureSystem'
import { db } from '@/utils/database'

export interface WorldUpdateStatus {
  isUpdating: boolean
  currentPhase: string
  progress: number
  startTime: number
  estimatedTimeRemaining: number
  method: 'worker' | 'fallback' | 'legacy'
}

export interface WorldEvent {
  id: string
  type: 'battle' | 'movement' | 'territory' | 'character' | 'general'
  title: string
  description: string
  timestamp: number
  islandName?: string
  charactersInvolved?: string[]
  importance: 'low' | 'medium' | 'high'
}

export interface WorldStats {
  totalEncounters: number
  totalBattles: number
  totalMovements: number
  lastSimulationTime: number
  totalUpdates: number
  averageUpdateTime: number
  workerUpdates: number
  fallbackUpdates: number
}

export const useWorldStore = defineStore('world', {
  state: () => ({
    // Status do update
    updateStatus: {
      isUpdating: false,
      currentPhase: '',
      progress: 0,
      startTime: 0,
      estimatedTimeRemaining: 0,
      method: 'legacy',
    } as WorldUpdateStatus,

    // Fila de updates
    updateQueue: 0,
    lastUpdateTime: 0,
    updateCooldown: 5000, // 5 segundos

    // Eventos do mundo
    worldEvents: [] as WorldEvent[],
    maxEvents: 50,

    // Estatísticas expandidas
    worldStats: {
      totalEncounters: 0,
      totalBattles: 0,
      totalMovements: 0,
      lastSimulationTime: 0,
      totalUpdates: 0,
      averageUpdateTime: 0,
      workerUpdates: 0,
      fallbackUpdates: 0,
    } as WorldStats,

    // Configurações
    autoUpdateEnabled: true,
    updateFrequency: 60000, // 1 minuto
    showNotifications: false, // Desabilitado por padrão para ser silencioso
    preferWorkers: true, // Preferir web workers quando disponível

    // Estado do worker
    workerInitialized: false,
    workerAvailable: false,
    lastWorkerError: null as string | null,
  }),

  actions: {
    /**
     * ✅ INICIALIZAR SISTEMA DE WORKERS
     */
    async initializeWorkers(): Promise<void> {
      if (this.workerInitialized) return

      try {
        if (typeof Worker !== 'undefined' && this.preferWorkers) {
          await WorldWorkerManager.initWorker()
          this.workerAvailable = true
          this.lastWorkerError = null
          console.log('✅ Web Workers inicializados com sucesso')
        } else {
          console.log('📱 Web Workers não disponíveis, usando fallback')
          this.workerAvailable = false
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar workers:', error)
        this.workerAvailable = false
        this.lastWorkerError = error instanceof Error ? error.message : 'Erro desconhecido'
      } finally {
        this.workerInitialized = true
      }
    },

    /**
     * ✅ MÉTODO PRINCIPAL - ATUALIZAR MUNDO EM BACKGROUND (OTIMIZADO)
     */
    async updateWorldBackground(force: boolean = false): Promise<void> {
      // Verificar se pode atualizar
      if (!this.canUpdate && !force) {
        this.updateQueue++
        console.log('🌍 Update enfileirado. Fila atual:', this.updateQueue)
        return
      }

      // Verificar cooldown
      const now = Date.now()
      if (!force && now - this.lastUpdateTime < this.updateCooldown) {
        console.log('🌍 Aguardando cooldown...')
        return
      }

      // Inicializar workers se necessário
      if (!this.workerInitialized) {
        await this.initializeWorkers()
      }

      this.startUpdate()

      try {
        // Escolher método de atualização baseado na disponibilidade
        if (this.workerAvailable) {
          await this.updateWithWorkers()
        } else {
          await this.updateWithFallback()
        }
      } catch (error) {
        console.error('❌ Erro durante update do mundo:', error)

        // Tentar fallback se worker falhou
        if (this.workerAvailable) {
          console.log('🔄 Tentando fallback após erro do worker...')
          this.workerAvailable = false
          this.lastWorkerError = error instanceof Error ? error.message : 'Worker error'

          try {
            await this.updateWithFallback()
          } catch (fallbackError) {
            console.error('❌ Fallback também falhou:', fallbackError)
            this.addWorldEvent({
              type: 'general',
              title: 'Erro na Simulação',
              description: 'Houve um erro durante a atualização do mundo.',
              importance: 'high',
            })
            this.finishUpdate()
          }
        } else {
          this.finishUpdate()
        }
      }
    },

    /**
     * ✅ ATUALIZAÇÃO USANDO WEB WORKERS (PERFORMANCE MÁXIMA)
     */
    async updateWithWorkers(): Promise<void> {
      this.updateStatus.method = 'worker'
      this.updateStatus.currentPhase = 'Inicializando workers...'
      this.updateStatus.progress = 0

      try {
        const updateStartTime = Date.now()

        // ✅ OBTER DADOS DO PLAYER PARA PASSAR AO WORKER
        const playerData = await this.getPlayerDataForWorker()

        // Executar atualização completa usando workers
        const results = await WorldWorkerManager.updateWorldComplete(
          (phase: string, progress: number) => {
            this.updateStatus.currentPhase = phase
            this.updateStatus.progress = progress
            this.updateStatus.estimatedTimeRemaining = this.calculateEstimatedTime(
              progress,
              updateStartTime,
            )
          },
          playerData, // ✅ PASSAR DADOS DO PLAYER
        )

        // Processar resultados
        await this.processWorkerResults(results)

        // Atualizar estatísticas
        const updateTime = Date.now() - updateStartTime
        this.updateStats('worker', updateTime)

        this.worldStats.workerUpdates++
        console.log(`✅ Update via worker concluído em ${updateTime}ms`)
      } catch (error) {
        console.error('❌ Erro no update via worker:', error)
        throw error
      } finally {
        this.finishUpdate()
      }
    },

    /**
     * ✅ ATUALIZAÇÃO USANDO FALLBACK SCHEDULER (BOA PERFORMANCE)
     */
    async updateWithFallback(): Promise<void> {
      this.updateStatus.method = 'fallback'
      this.updateStatus.currentPhase = 'Agendando tarefas...'
      this.updateStatus.progress = 0

      try {
        const updateStartTime = Date.now()

        const tasks = [
          {
            fn: () => this.simulateWorldEncounters(),
            priority: 4,
            name: 'Simulando encontros...',
            weight: 40,
          },
          {
            fn: () => this.processWorldMovement(),
            priority: 3,
            name: 'Processando movimento...',
            weight: 25,
          },
          {
            fn: () => this.updateTerritories(),
            priority: 2,
            name: 'Atualizando territórios...',
            weight: 20,
          },
          {
            fn: () => this.redistributeCharacters(),
            priority: 2,
            name: 'Redistribuindo personagens...',
            weight: 10,
          },
          {
            fn: () => this.createNewCharacters(),
            priority: 1,
            name: 'Criando novos personagens...',
            weight: 5,
          },
        ]

        // Executar tarefas em sequência com scheduler
        await FallbackScheduler.executeSequence(
          tasks.map((task) => ({
            fn: task.fn,
            priority: task.priority,
            onProgress: (progress) => {
              // Progress individual da tarefa não é usado aqui
            },
          })),
          (overallProgress) => {
            this.updateStatus.progress = overallProgress
            this.updateStatus.estimatedTimeRemaining = this.calculateEstimatedTime(
              overallProgress,
              updateStartTime,
            )

            // Determinar fase atual baseada no progresso
            const currentTask = tasks.find((task, index) => {
              const taskStart = tasks.slice(0, index).reduce((sum, t) => sum + t.weight, 0)
              const taskEnd = taskStart + task.weight
              return overallProgress >= taskStart && overallProgress < taskEnd
            })

            if (currentTask) {
              this.updateStatus.currentPhase = currentTask.name
            }
          },
        )

        // Atualizar estatísticas
        const updateTime = Date.now() - updateStartTime
        this.updateStats('fallback', updateTime)

        this.worldStats.fallbackUpdates++
        console.log(`✅ Update via fallback concluído em ${updateTime}ms`)
      } catch (error) {
        console.error('❌ Erro no update via fallback:', error)
        throw error
      } finally {
        this.finishUpdate()
      }
    },

    /**
     * ✅ PROCESSAR RESULTADOS DOS WORKERS
     */
    async processWorkerResults(results: any): Promise<void> {
      try {
        // Processar resultados de encontros
        if (results.encounters?.success && results.encounters.data) {
          const encounterData = results.encounters.data
          this.worldStats.totalEncounters += encounterData.totalEncounters || 0
          this.worldStats.totalBattles += encounterData.totalBattles || 0

          if (encounterData.totalBattles > 0) {
            this.addWorldEvent({
              type: 'battle',
              title: 'Batalhas nos Mares',
              description: `${encounterData.totalBattles} batalhas ocorreram nos mares.`,
              importance: encounterData.totalBattles > 10 ? 'high' : 'medium',
            })
          }
        }

        // Processar resultados de movimento
        if (results.movement?.success && results.movement.data) {
          const movementData = results.movement.data
          this.worldStats.totalMovements += movementData.crewsMoved || 0

          if (movementData.crewsMoved > 0) {
            this.addWorldEvent({
              type: 'movement',
              title: 'Movimentação Naval',
              description: `${movementData.crewsMoved} crews navegaram pelos mares.`,
              importance: movementData.crewsMoved > 20 ? 'high' : 'medium',
            })
          }
        }

        // Processar resultados de territórios
        if (results.territories?.success) {
          this.addWorldEvent({
            type: 'territory',
            title: 'Mudanças Territoriais',
            description: 'Territórios foram atualizados.',
            importance: 'medium',
          })
        }

        // Processar resultados de personagens
        if (results.characters?.success) {
          this.addWorldEvent({
            type: 'character',
            title: 'Redistribuição de Poder',
            description: 'Posições importantes foram atualizadas.',
            importance: 'high',
          })
        }

        // Processar novos personagens
        if (results.newCharacters?.success && results.newCharacters.data?.created > 0) {
          this.addWorldEvent({
            type: 'character',
            title: 'Novos Aventureiros',
            description: `${results.newCharacters.data.created} novos aventureiros chegaram aos mares.`,
            importance: 'low',
          })
        }

        this.worldStats.lastSimulationTime = Date.now()
      } catch (error) {
        console.error('❌ Erro ao processar resultados dos workers:', error)
      }
    },

    /**
     * ✅ CALCULAR TEMPO ESTIMADO RESTANTE
     */
    calculateEstimatedTime(progress: number, startTime: number): number {
      if (progress <= 0) return 10000 // 10 segundos padrão

      const elapsed = Date.now() - startTime
      const total = elapsed / (progress / 100)
      const remaining = total - elapsed

      return Math.max(0, remaining)
    },

    /**
     * ✅ ATUALIZAR ESTATÍSTICAS DE PERFORMANCE
     */
    updateStats(method: 'worker' | 'fallback', updateTime: number): void {
      this.worldStats.totalUpdates++

      // Calcular média móvel do tempo de update
      const currentAverage = this.worldStats.averageUpdateTime
      const newAverage = currentAverage === 0 ? updateTime : currentAverage * 0.8 + updateTime * 0.2 // Média ponderada

      this.worldStats.averageUpdateTime = newAverage
    },

    /**
     * ✅ INICIAR PROCESSO DE UPDATE
     */
    startUpdate(): void {
      this.updateStatus = {
        isUpdating: true,
        currentPhase: 'Preparando...',
        progress: 0,
        startTime: Date.now(),
        estimatedTimeRemaining: 10000,
        method: 'legacy',
      }
      this.lastUpdateTime = Date.now()
    },

    /**
     * ✅ FINALIZAR UPDATE
     */
    finishUpdate(): void {
      this.updateStatus = {
        isUpdating: false,
        currentPhase: '',
        progress: 0,
        startTime: 0,
        estimatedTimeRemaining: 0,
        method: 'legacy',
      }

      // Processar fila se houver
      if (this.updateQueue > 0) {
        this.updateQueue--
        setTimeout(() => {
          this.updateWorldBackground()
        }, 2000)
      }

      // Emitir evento para componentes (apenas se habilitado)
      if (typeof window !== 'undefined' && this.showNotifications) {
        window.dispatchEvent(
          new CustomEvent('worldUpdateComplete', {
            detail: {
              stats: this.worldStats,
              events: this.recentEvents,
            },
          }),
        )
      }
    },

    // ✅ MÉTODOS LEGACY PARA FALLBACK (mantidos do código original)
    async simulateWorldEncounters(): Promise<void> {
      try {
        const result = await AdventureSystem.simulateWorldEncounters()

        this.worldStats.totalEncounters += result.totalEncounters
        this.worldStats.totalBattles += result.totalBattles
        this.worldStats.lastSimulationTime = Date.now()

        if (result.totalBattles > 0) {
          this.addWorldEvent({
            type: 'battle',
            title: 'Batalhas nos Mares',
            description: `${result.totalBattles} batalhas ocorreram em ${result.islandReports.length} ilhas diferentes.`,
            importance: result.totalBattles > 10 ? 'high' : 'medium',
          })
        }
      } catch (error) {
        console.error('❌ Erro na simulação de encontros:', error)
      }
    },

    async processWorldMovement(): Promise<void> {
      try {
        const result = await AdventureSystem.processWorldMovement()

        this.worldStats.totalMovements += result.crewsMoved

        if (result.crewsMoved > 0) {
          this.addWorldEvent({
            type: 'movement',
            title: 'Movimentação Naval',
            description: `${result.crewsMoved} crews navegaram pelos mares.`,
            importance: result.crewsMoved > 20 ? 'high' : 'medium',
          })
        }
      } catch (error) {
        console.error('❌ Erro no movimento do mundo:', error)
      }
    },

    async updateTerritories(): Promise<void> {
      try {
        const result = await AdventureSystem.changeTerritories()

        if (result.success) {
          this.addWorldEvent({
            type: 'territory',
            title: 'Mudanças Territoriais',
            description: 'Alguns territórios mudaram de controle.',
            importance: 'medium',
          })
        }
      } catch (error) {
        console.error('❌ Erro na atualização de territórios:', error)
      }
    },

    async redistributeCharacters(): Promise<void> {
      try {
        const result = await AdventureSystem.changeTopCharacters()

        if (result.success) {
          this.addWorldEvent({
            type: 'character',
            title: 'Redistribuição de Poder',
            description: 'Posições importantes foram atualizadas.',
            importance: 'high',
          })
        }
      } catch (error) {
        console.error('❌ Erro na redistribuição de personagens:', error)
      }
    },

    async createNewCharacters(): Promise<void> {
      try {
        const count = Math.floor(Math.random() * 1) + 1 // 1-2 personagens
        let created = 0

        for (let i = 0; i < count; i++) {
          const result = await AdventureSystem.createNewCharacter()
          if (result.success) created++

          await new Promise((resolve) => setTimeout(resolve, 10))
        }

        if (created > 0) {
          this.addWorldEvent({
            type: 'character',
            title: 'Novos Aventureiros',
            description: `${created} ${created === 1 ? 'novo aventureiro chegou' : 'novos aventureiros chegaram'} aos mares.`,
            importance: 'low',
          })
        }
      } catch (error) {
        console.error('❌ Erro na criação de personagens:', error)
      }
    },

    /**
     * ✅ ADICIONAR EVENTO DO MUNDO
     */
    addWorldEvent(event: Omit<WorldEvent, 'id' | 'timestamp'>): void {
      const newEvent: WorldEvent = {
        ...event,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      }

      this.worldEvents.unshift(newEvent)

      if (this.worldEvents.length > this.maxEvents) {
        this.worldEvents = this.worldEvents.slice(0, this.maxEvents)
      }

      // Emitir notificação apenas se habilitado
      if (this.showNotifications && event.importance === 'high') {
        this.emitNotification(newEvent)
      }
    },

    /**
     * ✅ EMITIR NOTIFICAÇÃO
     */
    emitNotification(event: WorldEvent): void {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('worldEventNotification', {
            detail: event,
          }),
        )
      }
    },

    /**
     * ✅ LIMPAR CACHE DOS WORKERS
     */
    async clearWorkerCache(): Promise<void> {
      if (this.workerAvailable) {
        try {
          await WorldWorkerManager.clearWorkerCache()
          console.log('✅ Cache dos workers limpo')
        } catch (error) {
          console.error('❌ Erro ao limpar cache dos workers:', error)
        }
      }
    },

    /**
     * ✅ REINICIALIZAR WORKERS
     */
    async reinitializeWorkers(): Promise<void> {
      this.workerInitialized = false
      this.workerAvailable = false
      this.lastWorkerError = null

      WorldWorkerManager.terminateWorker()
      await this.initializeWorkers()
    },

    /**
     * ✅ CONFIGURAÇÕES
     */
    setAutoUpdate(enabled: boolean): void {
      this.autoUpdateEnabled = enabled
    },

    setUpdateFrequency(frequency: number): void {
      this.updateFrequency = Math.max(30000, frequency)
    },

    setShowNotifications(show: boolean): void {
      this.showNotifications = show
    },

    setPreferWorkers(prefer: boolean): void {
      this.preferWorkers = prefer
    },

    clearOldEvents(maxAge: number = 24 * 60 * 60 * 1000): void {
      const cutoff = Date.now() - maxAge
      this.worldEvents = this.worldEvents.filter((event) => event.timestamp > cutoff)
    },

    async getPlayerDataForWorker(): Promise<{
      playerCrewId: number | null
      playerCrewIds: number[]
    }> {
      try {
        // Buscar dados do player sem usar characterStore no worker
        const playerCharacters = await db.characters.where('isPlayer').equals(1).toArray()

        const playerCrewIds = [
          ...new Set(playerCharacters.map((char) => char.crewId).filter(Boolean)),
        ]
        const playerCrewId = playerCrewIds[0] || null

        return {
          playerCrewId,
          playerCrewIds,
        }
      } catch (error) {
        console.error('❌ Erro ao obter dados do player para worker:', error)
        return {
          playerCrewId: null,
          playerCrewIds: [],
        }
      }
    },
  },

  getters: {
    canUpdate: (state): boolean => !state.updateStatus.isUpdating,

    isUpdating: (state): boolean => state.updateStatus.isUpdating,

    updateProgress: (state): number => state.updateStatus.progress,

    currentPhase: (state): string => state.updateStatus.currentPhase,

    timeSinceLastUpdate: (state): number => Date.now() - state.lastUpdateTime,

    recentEvents: (state): WorldEvent[] => state.worldEvents.slice(0, 10),

    highImportanceEvents: (state): WorldEvent[] =>
      state.worldEvents.filter((event) => event.importance === 'high').slice(0, 5),

    eventsByType:
      (state) =>
      (type: WorldEvent['type']): WorldEvent[] =>
        state.worldEvents.filter((event) => event.type === type),

    hasQueuedUpdates: (state): boolean => state.updateQueue > 0,

    estimatedTimeRemaining: (state): string => {
      if (!state.updateStatus.isUpdating) return '0s'

      const remaining = state.updateStatus.estimatedTimeRemaining
      return remaining > 1000 ? `${Math.ceil(remaining / 1000)}s` : '<1s'
    },

    // ✅ NOVOS GETTERS PARA PERFORMANCE
    updateMethod: (state): string => state.updateStatus.method,

    workerStats: (state) => ({
      available: state.workerAvailable,
      initialized: state.workerInitialized,
      lastError: state.lastWorkerError,
      workerUpdates: state.worldStats.workerUpdates,
      fallbackUpdates: state.worldStats.fallbackUpdates,
    }),

    performanceStats: (state) => ({
      totalUpdates: state.worldStats.totalUpdates,
      averageUpdateTime: Math.round(state.worldStats.averageUpdateTime),
      workerUpdates: state.worldStats.workerUpdates,
      fallbackUpdates: state.worldStats.fallbackUpdates,
      workerPercentage:
        state.worldStats.totalUpdates > 0
          ? Math.round((state.worldStats.workerUpdates / state.worldStats.totalUpdates) * 100)
          : 0,
    }),
  },
})
