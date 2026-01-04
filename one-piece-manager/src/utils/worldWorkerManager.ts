// src/utils/worldWorkerManager.ts
export interface WorkerTask {
  type: string
  data: any
  id: string
  resolve: (value: any) => void
  reject: (error: any) => void
  onProgress?: (progress: number) => void
}

export interface WorkerResult {
  success: boolean
  data?: any
  error?: string
}

export class WorldWorkerManager {
  private static worker: Worker | null = null
  private static pendingTasks = new Map<string, WorkerTask>()
  private static taskQueue: WorkerTask[] = []
  private static isProcessing = false
  private static maxConcurrentTasks = 1

  /**
   * Inicializar o worker
   */
  static initWorker(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (typeof Worker === 'undefined') {
          reject(new Error('Web Workers not supported'))
          return
        }

        if (this.worker) {
          resolve()
          return
        }

        // Criar worker
        this.worker = new Worker(new URL('../workers/worldUpdateWorker.ts', import.meta.url), {
          type: 'module',
        })

        // Configurar handlers
        this.worker.onmessage = this.handleWorkerMessage.bind(this)
        this.worker.onerror = this.handleWorkerError.bind(this)

        // Worker inicializado com sucesso
        console.log('✅ WorldWorkerManager: Worker inicializado')
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Executar tarefa no worker
   */
  static async executeTask(
    type: string,
    data: any = {},
    onProgress?: (progress: number) => void,
  ): Promise<WorkerResult> {
    return new Promise((resolve, reject) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const task: WorkerTask = {
        type,
        data,
        id,
        resolve,
        reject,
        onProgress,
      }

      this.taskQueue.push(task)
      this.processQueue()
    })
  }

  /**
   * ✅ ATUALIZAR MUNDO COMPLETO USANDO ADVENTURESYSTEM
   */
  static async updateWorldComplete(
    onProgress?: (phase: string, progress: number) => void,
    playerData?: any,
  ): Promise<{
    encounters: WorkerResult
    movement: WorkerResult
    territories: WorkerResult
    characters: WorkerResult
    newCharacters: WorkerResult
  }> {
    try {
      // Usar o método de atualização completa do worker com dados do player
      const result = await this.executeTask(
        'FULL_WORLD_UPDATE',
        playerData || {}, // ✅ PASSAR DADOS DO PLAYER
        (progress) => {
          if (onProgress) {
            let phase = 'Processando...'

            if (progress <= 30) {
              phase = 'Simulando encontros...'
            } else if (progress <= 55) {
              phase = 'Processando movimento...'
            } else if (progress <= 75) {
              phase = 'Atualizando territórios...'
            } else if (progress <= 90) {
              phase = 'Redistribuindo personagens...'
            } else {
              phase = 'Criando novos personagens...'
            }

            onProgress(phase, progress)
          }
        },
      )

      if (result.success && result.data) {
        return {
          encounters: { success: true, data: result.data.encounters },
          movement: { success: true, data: result.data.movement },
          territories: { success: true, data: result.data.territories },
          characters: { success: true, data: result.data.characters },
          newCharacters: { success: true, data: result.data.newCharacters },
        }
      } else {
        throw new Error(result.error || 'Falha na atualização completa')
      }
    } catch (error) {
      console.error('❌ Erro na atualização completa via worker:', error)

      // Retornar resultados vazios em caso de erro
      return {
        encounters: { success: false, error: 'Falha na simulação de encontros' },
        movement: { success: false, error: 'Falha no processamento de movimento' },
        territories: { success: false, error: 'Falha na atualização de territórios' },
        characters: { success: false, error: 'Falha na redistribuição de personagens' },
        newCharacters: { success: false, error: 'Falha na criação de personagens' },
      }
    }
  }

  /**
   * ✅ EXECUTAR OPERAÇÕES INDIVIDUAIS
   */
  static async simulateWorldEncounters(): Promise<WorkerResult> {
    return this.executeTask('SIMULATE_ENCOUNTERS')
  }

  static async processWorldMovement(): Promise<WorkerResult> {
    return this.executeTask('PROCESS_MOVEMENT')
  }

  static async updateTerritories(): Promise<WorkerResult> {
    return this.executeTask('UPDATE_TERRITORIES')
  }

  static async redistributeCharacters(): Promise<WorkerResult> {
    return this.executeTask('REDISTRIBUTE_CHARACTERS')
  }

  static async createNewCharacters(): Promise<WorkerResult> {
    return this.executeTask('CREATE_NEW_CHARACTERS')
  }

  /**
   * Limpar cache do worker e AdventureSystem
   */
  static async clearWorkerCache(): Promise<void> {
    if (this.worker) {
      await this.executeTask('CLEAR_CACHE')
      console.log('✅ Cache do worker e AdventureSystem limpo')
    }
  }

  /**
   * Atualizar cache do worker
   */
  static async updateWorkerCache(): Promise<void> {
    if (this.worker) {
      await this.executeTask('UPDATE_CACHE')
      console.log('✅ Cache do worker atualizado')
    }
  }

  /**
   * Terminar worker
   */
  static terminateWorker(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
      this.pendingTasks.clear()
      this.taskQueue = []
      this.isProcessing = false
      console.log('✅ Worker terminado')
    }
  }

  /**
   * Processar fila de tarefas
   */
  private static processQueue(): void {
    if (this.isProcessing || this.taskQueue.length === 0 || !this.worker) {
      return
    }

    if (this.pendingTasks.size >= this.maxConcurrentTasks) {
      return
    }

    this.isProcessing = true
    const task = this.taskQueue.shift()!

    this.pendingTasks.set(task.id, task)

    try {
      this.worker.postMessage({
        type: task.type,
        data: task.data,
        id: task.id,
      })
    } catch (error) {
      this.handleTaskError(task.id, error)
    }

    this.isProcessing = false

    // Processar próxima tarefa se houver
    setTimeout(() => this.processQueue(), 0)
  }

  /**
   * Handler para mensagens do worker
   */
  private static handleWorkerMessage(e: MessageEvent): void {
    const { type, id, success, data, error, progress } = e.data

    const task = this.pendingTasks.get(id)
    if (!task) {
      // Pode ser uma mensagem de progresso de uma subtarefa
      if (type === 'PROGRESS') {
        return
      }
      console.warn('Received message for unknown task:', id)
      return
    }

    if (type === 'PROGRESS') {
      // Atualizar progresso
      if (task.onProgress && typeof progress === 'number') {
        task.onProgress(progress)
      }
      return
    }

    if (type.endsWith('_COMPLETE')) {
      // Tarefa concluída
      this.pendingTasks.delete(id)

      if (success) {
        task.resolve({ success: true, data })
      } else {
        task.reject(new Error(error || 'Worker task failed'))
      }

      // Processar próxima tarefa
      this.processQueue()
    }

    if (type === 'ERROR') {
      // Erro na tarefa
      this.handleTaskError(id, new Error(error || 'Worker error'))
    }
  }

  /**
   * Handler para erros do worker
   */
  private static handleWorkerError(error: ErrorEvent): void {
    console.error('❌ Worker error:', error)

    // Rejeitar todas as tarefas pendentes
    this.pendingTasks.forEach((task) => {
      task.reject(new Error('Worker crashed'))
    })

    this.pendingTasks.clear()
    this.taskQueue = []
    this.isProcessing = false

    // Tentar reinicializar worker
    this.worker = null
    setTimeout(() => {
      this.initWorker().catch(console.error)
    }, 1000)
  }

  /**
   * Handler para erro em tarefa específica
   */
  private static handleTaskError(taskId: string, error: any): void {
    const task = this.pendingTasks.get(taskId)
    if (task) {
      this.pendingTasks.delete(taskId)
      task.reject(error)
    }

    this.processQueue()
  }

  /**
   * Verificar se worker está disponível
   */
  static isWorkerAvailable(): boolean {
    return typeof Worker !== 'undefined' && this.worker !== null
  }

  /**
   * Obter estatísticas do worker
   */
  static getStats(): {
    pendingTasks: number
    queuedTasks: number
    isProcessing: boolean
    workerAvailable: boolean
  } {
    return {
      pendingTasks: this.pendingTasks.size,
      queuedTasks: this.taskQueue.length,
      isProcessing: this.isProcessing,
      workerAvailable: this.isWorkerAvailable(),
    }
  }
}
