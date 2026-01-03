// src/utils/taskMonitoringSystem.ts
import { db, type Task } from './database'
import { TerritoryLiberationSystem } from './territoryLiberationSystem'
import { ShipUpgradeSystem } from './shipUpgradeSystem'
import { IslandExplorationSystem } from './islandExplorationSystem'
import { TrainingSystem } from './trainingSystem'
import { useCharacterStore } from '@/stores/characterStore'

export class TaskMonitoringSystem {
  // ✅ VERIFICAR E PROCESSAR TASKS COMPLETADAS
  static async checkAndProcessCompletedTasks(): Promise<{
    tasksProcessed: number
    results: Array<{
      taskId: number
      type: string
      success: boolean
      message: string
    }>
  }> {
    try {
      const now = new Date()
      const characterStore = useCharacterStore()

      // Buscar tasks que devem estar completas mas ainda não foram processadas
      const completedTasks = await db.tasks
        .where('characterId')
        .equals(characterStore.playerCharacter.id)
        .and((task) => new Date(task.endTime) <= now && task.isCompleted == false)
        .toArray()

      console.log(`⏰ Encontradas ${completedTasks.length} tasks para processar`)

      const results: Array<{
        taskId: number
        type: string
        success: boolean
        message: string
      }> = []

      for (const task of completedTasks) {
        try {
          let result: { success: boolean; message: string }

          switch (task.type) {
            case 'island_liberation':
              const liberationResult = await TerritoryLiberationSystem.completeLiberationTask(
                task.id!,
              )
              result = {
                success: liberationResult.success,
                message: liberationResult.message,
              }
              break

            case 'ship_upgrade':
              const upgradeResult = await ShipUpgradeSystem.completeShipUpgrade(task.id!)
              result = {
                success: upgradeResult.success,
                message: upgradeResult.success ? 'Upgrade concluído!' : 'Erro no upgrade',
              }
              break

            case 'exploration':
              // Implementar quando necessário
              result = { success: true, message: 'Exploração concluída' }
              break

            case 'training':
              // Implementar quando necessário
              result = { success: true, message: 'Treinamento concluído' }
              break

            case 'navigation':
              // Implementar quando necessário
              result = { success: true, message: 'Navegação concluída' }
              break

            default:
              result = { success: false, message: `Tipo de task não reconhecido: ${task.type}` }
          }

          results.push({
            taskId: task.id!,
            type: task.type,
            success: result.success,
            message: result.message,
          })

          console.log(`✅ Task ${task.id} (${task.type}) processada: ${result.message}`)
        } catch (error) {
          console.error(`❌ Erro ao processar task ${task.id}:`, error)
          results.push({
            taskId: task.id!,
            type: task.type,
            success: false,
            message: `Erro: ${error}`,
          })
        }
      }

      return {
        tasksProcessed: completedTasks.length,
        results,
      }
    } catch (error) {
      console.error('❌ Erro no monitoramento de tasks:', error)
      return {
        tasksProcessed: 0,
        results: [],
      }
    }
  }

  // ✅ INICIAR MONITORAMENTO AUTOMÁTICO
  static startTaskMonitoring(intervalMs: number = 30000): NodeJS.Timeout {
    console.log(`🔄 Iniciando monitoramento de tasks (intervalo: ${intervalMs}ms)`)

    return setInterval(async () => {
      const result = await this.checkAndProcessCompletedTasks()

      if (result.tasksProcessed > 0) {
        console.log(`⏰ Monitoramento: ${result.tasksProcessed} tasks processadas`)
      }
    }, intervalMs)
  }

  // ✅ PARAR MONITORAMENTO
  static stopTaskMonitoring(intervalId: NodeJS.Timeout): void {
    clearInterval(intervalId)
    console.log('⏹️ Monitoramento de tasks parado')
  }
}
