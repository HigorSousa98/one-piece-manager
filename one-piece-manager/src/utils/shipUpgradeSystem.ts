// src/utils/shipUpgradeSystem.ts - Atualizar para usar Tasks

import { db } from './database'
import type { Ship, Character, Task } from './database'
import { GenerationConfig } from './generationConfig'

export class ShipUpgradeSystem {
  // ✅ VERIFICAR SE PODE FAZER UPGRADE
  static async canUpgradeShip(ship: Ship, character: Character): Promise<boolean> {
    try {
      console.log('candUpgrade')
      // Verificar se já está no nível máximo
      if (ship.level >= 5) {
        console.log('⚠️ Navio já está no nível máximo')
        return false
      }

      // Verificar se há upgrade em andamento
      const hasActiveUpgrade = await this.hasActiveUpgradeTask(ship.crewId)
      if (hasActiveUpgrade) {
        console.log('⚠️ Já há um upgrade em andamento')
        return false
      }

      if (ship.level >= this.determineShipLevel(character.level)) return false

      // Verificar recursos necessários (você pode implementar isso depois)
      // const requiredResources = this.getUpgradeRequirements(ship.level)
      // if (!character.hasResources(requiredResources)) return false

      return true
    } catch (error) {
      console.error('❌ Erro ao verificar se pode fazer upgrade:', error)
      return false
    }
  }

  public static determineShipLevel(captainLevel: number): number {
    if (captainLevel >= 0 && captainLevel < 10) return 1
    if (captainLevel >= 10 && captainLevel < 30) return 2
    if (captainLevel >= 30 && captainLevel < 60) return 3
    if (captainLevel >= 60 && captainLevel < 80) return 4
    if (captainLevel >= 80 && captainLevel <= 100) return 5

    // Fallback para níveis fora do range
    return Math.min(5, Math.max(1, Math.floor(captainLevel / 20) + 1))
  }

  // ✅ VERIFICAR SE HÁ TASK DE UPGRADE ATIVA
  static async hasActiveUpgradeTask(shipId: number): Promise<Task | null> {
    try {
      const now = new Date()

      const activeTask = await db.tasks
        .where('type')
        .equals('ship_upgrade')
        .and((task) => {
          const notCompletedAndActive = !task.isCompleted && task.targetId === shipId

          return notCompletedAndActive
        })
        .first()

      return activeTask || null
    } catch (error) {
      console.error('❌ Erro ao verificar task de upgrade ativa:', error)
      return null
    }
  }

  // ✅ INICIAR UPGRADE DO NAVIO
  static async startShipUpgrade(ship: Ship, characterId: number): Promise<Task | null> {
    try {
      // Verificar se pode fazer upgrade
      const character = await db.characters.get(characterId)
      if (!character) {
        console.error('❌ Personagem não encontrado')
        return null
      }

      const canUpgrade = await this.canUpgradeShip(ship, character)
      if (!canUpgrade) {
        console.log('❌ Não é possível fazer upgrade no momento')
        return null
      }

      // Calcular tempo de upgrade
      const upgradeTimeMinutes = GenerationConfig.createEpic().upgradeShipTime

      // Criar task de upgrade
      const now = new Date()
      const endTime = new Date(now.getTime() + upgradeTimeMinutes * 60 * 1000)

      const upgradeTask: Omit<Task, 'id'> = {
        type: 'ship_upgrade',
        characterId,
        targetId: ship.id!, // ID do navio
        startTime: now,
        endTime: endTime,
        isCompleted: false,
        description: `Melhorando ${ship.name} para Nível ${ship.level + 1}`,
        kindnessReward: 0,
        experienceReward: 0,
        bountyReward: 0,
        duration: upgradeTimeMinutes,
        helpType: '',
        difficulty: 'medium',
        createdAt: now,
        location: `Nível ${ship.level} → ${ship.level + 1}`,
      }

      const taskId = await db.tasks.add(upgradeTask)

      const createdTask = {
        ...upgradeTask,
        id: taskId,
      } as Task

      console.log(`🔧 Upgrade do navio iniciado! Tempo: ${upgradeTimeMinutes} min`)

      return createdTask
    } catch (error) {
      console.error('❌ Erro ao iniciar upgrade do navio:', error)
      return null
    }
  }

  // ✅ COMPLETAR UPGRADE DO NAVIO
  static async completeShipUpgrade(taskId: number): Promise<{
    success: boolean
    newLevel?: number
    ship?: Ship
  }> {
    try {
      const task = await db.tasks.get(taskId)
      if (!task || task.type !== 'ship_upgrade') {
        console.error('❌ Task de upgrade não encontrada')
        return { success: false }
      }

      // Buscar navio
      const ship = await db.ships.get(task.targetId)
      if (!ship) {
        console.error('❌ Navio não encontrado')
        return { success: false }
      }

      // Calcular novo nível
      const newLevel = Math.min(5, ship.level + 1) as 1 | 2 | 3 | 4 | 5

      // Atualizar navio
      await db.ships.update(ship.id!, {
        level: newLevel,
      })

      // Marcar task como completa
      await db.tasks.update(taskId, {
        isCompleted: true,
        description: `${task.description} - CONCLUÍDO`,
      })

      // Buscar navio atualizado
      const updatedShip = await db.ships.get(ship.id!)

      console.log(`✅ Upgrade concluído! Navio agora é Nível ${newLevel}`)

      return {
        success: true,
        newLevel,
        ship: updatedShip,
      }
    } catch (error) {
      console.error('❌ Erro ao completar upgrade:', error)
      return { success: false }
    }
  }

  // ✅ CANCELAR UPGRADE
  static async cancelShipUpgrade(taskId: number): Promise<boolean> {
    try {
      const task = await db.tasks.get(taskId)
      if (!task || task.type !== 'ship_upgrade') {
        return false
      }

      // Remover task do banco
      await db.tasks.delete(taskId)

      console.log('❌ Upgrade cancelado')
      return true
    } catch (error) {
      console.error('❌ Erro ao cancelar upgrade:', error)
      return false
    }
  }

  // ✅ OBTER PROGRESSO DO UPGRADE
  static getUpgradeProgress(task: Task): {
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

  // ✅ OBTER REQUISITOS DE UPGRADE (FUTURO)
  static getUpgradeRequirements(currentLevel: number): {
    gold?: number
    materials?: string[]
    time: number
  } {
    const requirements = {
      1: { time: 30 }, // 30 minutos
      2: { time: 30 },
      3: { time: 30 },
      4: { time: 30 },
      5: { time: 30 },
    }

    return requirements[currentLevel as keyof typeof requirements] || { time: 30 }
  }
}
