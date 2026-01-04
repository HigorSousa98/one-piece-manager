// src/utils/fallbackScheduler.ts
/**
 * Sistema de fallback para quando Web Workers não estão disponíveis
 */

export interface ScheduledTask {
  id: string
  fn: () => Promise<any>
  priority: number
  onProgress?: (progress: number) => void
  resolve: (value: any) => void
  reject: (error: any) => void
}

export class FallbackScheduler {
  private static taskQueue: ScheduledTask[] = []
  private static isRunning = false
  private static currentTask: ScheduledTask | null = null

  /**
   * Agendar tarefa com prioridade
   */
  static scheduleTask<T>(
    fn: () => Promise<T>,
    priority: number = 1,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: ScheduledTask = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fn,
        priority,
        onProgress,
        resolve,
        reject
      }

      // Inserir na posição correta baseado na prioridade
      const insertIndex = this.taskQueue.findIndex(t => t.priority < priority)
      if (insertIndex === -1) {
        this.taskQueue.push(task)
      } else {
        this.taskQueue.splice(insertIndex, 0, task)
      }

      this.processQueue()
    })
  }

  /**
   * Processar fila de tarefas usando requestIdleCallback
   */
  private static processQueue(): void {
    if (this.isRunning || this.taskQueue.length === 0) {
      return
    }

    this.isRunning = true
    this.processNextTask()
  }

  /**
   * Processar próxima tarefa
   */
  private static processNextTask(): void {
    if (this.taskQueue.length === 0) {
      this.isRunning = false
      this.currentTask = null
      return
    }

    const task = this.taskQueue.shift()!
    this.currentTask = task

    // Usar requestIdleCallback se disponível
    const scheduleExecution = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 1000 })
      } else {
        setTimeout(callback, 16) // ~60fps fallback
      }
    }

    scheduleExecution(async () => {
      try {
        const result = await this.executeTaskWithTimeSlicing(task)
        task.resolve(result)
      } catch (error) {
        task.reject(error)
      }

      // Processar próxima tarefa
      this.processNextTask()
    })
  }

  /**
   * Executar tarefa com time slicing
   */
  private static async executeTaskWithTimeSlicing(task: ScheduledTask): Promise<any> {
    const TIME_SLICE = 5 // 5ms por slice
    const startTime = performance.now()

    try {
      const result = await task.fn()

      // Se a execução demorou muito, yield
      if (performance.now() - startTime > TIME_SLICE) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }

      return result
    } catch (error) {
      throw error
    }
  }

  /**
   * Cancelar todas as tarefas
   */
  static cancelAllTasks(): void {
    this.taskQueue.forEach(task => {
      task.reject(new Error('Task cancelled'))
    })
    this.taskQueue = []
    this.isRunning = false
    this.currentTask = null
  }

  /**
   * Obter estatísticas
   */
  static getStats(): {
    queuedTasks: number
    isRunning: boolean
    currentTaskId: string | null
  } {
    return {
      queuedTasks: this.taskQueue.length,
      isRunning: this.isRunning,
      currentTaskId: this.currentTask?.id || null
    }
  }

  /**
   * Executar múltiplas tarefas em sequência
   */
  static async executeSequence(
    tasks: Array<{
      fn: () => Promise<any>
      priority?: number
      onProgress?: (progress: number) => void
    }>,
    onOverallProgress?: (progress: number) => void
  ): Promise<any[]> {
    const results: any[] = []
    let completed = 0

    for (const taskConfig of tasks) {
      const result = await this.scheduleTask(
        taskConfig.fn,
        taskConfig.priority || 1,
        taskConfig.onProgress
      )

      results.push(result)
      completed++

      if (onOverallProgress) {
        onOverallProgress((completed / tasks.length) * 100)
      }
    }

    return results
  }
}