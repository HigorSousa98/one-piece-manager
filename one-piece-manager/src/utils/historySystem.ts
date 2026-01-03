import { db, type Task, type Battle, type Character, type Crew } from '@/utils/database'

export interface HistoryEntry {
  id: number
  source: 'task' | 'battle'
  type: string
  title: string
  description: string
  timestamp: Date
  location?: string
  difficulty?: 'easy' | 'medium' | 'hard' | 'very hard'
  experienceReward?: number
  bountyReward?: number
  kindnessReward?: number
  expanded?: boolean

  // Task specific
  helpType?: string
  duration?: number
  startTime?: Date
  endTime?: Date
  isCompleted?: boolean
  completedAt?: number
  step?: number
  stepCompleted?: boolean

  // Battle specific
  isWinner?: boolean
  opponent?: string
  opponentCrew?: string
  battleLog?: string[]
}

export interface HistoryFilters {
  type?: string | null
  difficulty?: string | null
  location?: string
  dateFrom?: Date
  dateTo?: Date
  isCompleted?: boolean | null
  source?: 'task' | 'battle' | null
}

export interface HistoryStats {
  totalTasks: number
  completedTasks: number
  totalBattles: number
  battlesWon: number
  battlesLost: number
  totalExperience: number
  totalBounty: number
  totalKindness: number
  favoriteLocation: string
  mostCommonTaskType: string
}

export class HistorySystem {
  /**
   * Get all tasks for a specific character
   */
  static async getTasksByCharacter(characterId: number): Promise<Task[]> {
    try {
      const allTasks = await db.tasks.toArray()
      return allTasks.filter((task) => task.characterId === characterId)
    } catch (error) {
      console.error('Failed to get tasks by character:', error)
      return []
    }
  }

  /**
   * Get all battles for a specific character (as challenger or opponent)
   */
  static async getBattlesByCharacter(characterId: number): Promise<Battle[]> {
    try {
      const allBattles = await db.battles.toArray()
      return allBattles.filter(
        (battle) => battle.challenger === characterId || battle.opponent === characterId,
      )
    } catch (error) {
      console.error('Failed to get battles by character:', error)
      return []
    }
  }

  /**
   * Get complete history for a character (tasks + battles)
   */
  static async getCharacterHistory(characterId: number): Promise<HistoryEntry[]> {
    try {
      const [tasks, battles] = await Promise.all([
        this.getTasksByCharacter(characterId),
        this.getBattlesByCharacter(characterId),
      ])

      const allCharacters = await db.characters.toArray()
      const allCrews = await db.crews.toArray()

      const entries: HistoryEntry[] = []

      // Process tasks
      tasks.forEach((task) => {
        entries.push(this.convertTaskToHistoryEntry(task))
      })

      // Process battles
      battles.forEach((battle) => {
        entries.push(this.convertBattleToHistoryEntry(battle, characterId, allCrews, allCharacters))
      })

      // Sort by timestamp (newest first)
      return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } catch (error) {
      console.error('Failed to get character history:', error)
      return []
    }
  }

  /**
   * Get filtered history
   */
  static async getFilteredHistory(
    characterId: number,
    filters: HistoryFilters,
  ): Promise<HistoryEntry[]> {
    try {
      let history = await this.getCharacterHistory(characterId)

      // Apply filters
      if (filters.source) {
        history = history.filter((entry) => entry.source === filters.source)
      }

      if (filters.type) {
        if (filters.type === 'task' || filters.type === 'battle') {
          history = history.filter((entry) => entry.source === filters.type)
        } else {
          history = history.filter((entry) => entry.type === filters.type)
        }
      }

      if (filters.difficulty) {
        history = history.filter((entry) => entry.difficulty === filters.difficulty)
      }

      if (filters.location) {
        history = history.filter((entry) =>
          entry.location?.toLowerCase().includes(filters.location!.toLowerCase()),
        )
      }

      if (filters.dateFrom) {
        history = history.filter((entry) => entry.timestamp >= filters.dateFrom!)
      }

      if (filters.dateTo) {
        history = history.filter((entry) => entry.timestamp <= filters.dateTo!)
      }

      if (filters.isCompleted !== null && filters.isCompleted !== undefined) {
        history = history.filter((entry) => {
          if (entry.source === 'task') {
            return entry.isCompleted === filters.isCompleted
          }
          return true // Battles are always "completed"
        })
      }

      return history
    } catch (error) {
      console.error('Failed to get filtered history:', error)
      return []
    }
  }

  /**
   * Get history statistics for a character
   */
  static async getHistoryStats(characterId: number): Promise<HistoryStats> {
    try {
      const [tasks, battles] = await Promise.all([
        this.getTasksByCharacter(characterId),
        this.getBattlesByCharacter(characterId),
      ])

      const completedTasks = tasks.filter((task) => task.isCompleted)
      const battlesWon = battles.filter((battle) => battle.winner === characterId)
      const battlesLost = battles.filter((battle) => battle.loser === characterId)

      // Calculate totals
      const totalExperience = [
        ...tasks.map((t) => t.experienceReward || 0),
        ...battles.map((b) => (b.challenger === characterId ? b.experienceGained : 0)),
      ].reduce((sum, exp) => sum + exp, 0)

      const totalBounty = [
        ...tasks.map((t) => t.bountyReward || 0),
        ...battles.map((b) => (b.challenger === characterId ? b.bountyGained : 0)),
      ].reduce((sum, bounty) => sum + bounty, 0)

      const totalKindness = tasks
        .map((t) => t.kindnessReward || 0)
        .reduce((sum, kindness) => sum + kindness, 0)

      // Find favorite location
      const locationCounts: Record<string, number> = {}
      tasks.forEach((task) => {
        if (task.location) {
          locationCounts[task.location] = (locationCounts[task.location] || 0) + 1
        }
      })
      const favoriteLocation = Object.keys(locationCounts).reduce(
        (a, b) => (locationCounts[a] > locationCounts[b] ? a : b),
        'Unknown',
      )

      // Find most common task type
      const taskTypeCounts: Record<string, number> = {}
      tasks.forEach((task) => {
        taskTypeCounts[task.type] = (taskTypeCounts[task.type] || 0) + 1
      })
      const mostCommonTaskType = Object.keys(taskTypeCounts).reduce(
        (a, b) => (taskTypeCounts[a] > taskTypeCounts[b] ? a : b),
        'None',
      )

      return {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        totalBattles: battles.length,
        battlesWon: battlesWon.length,
        battlesLost: battlesLost.length,
        totalExperience,
        totalBounty,
        totalKindness,
        favoriteLocation,
        mostCommonTaskType,
      }
    } catch (error) {
      console.error('Failed to get history stats:', error)
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalBattles: 0,
        battlesWon: 0,
        battlesLost: 0,
        totalExperience: 0,
        totalBounty: 0,
        totalKindness: 0,
        favoriteLocation: 'Unknown',
        mostCommonTaskType: 'None',
      }
    }
  }

  /**
   * Get recent activity (last N entries)
   */
  static async getRecentActivity(characterId: number, limit: number = 10): Promise<HistoryEntry[]> {
    try {
      const history = await this.getCharacterHistory(characterId)
      return history.slice(0, limit)
    } catch (error) {
      console.error('Failed to get recent activity:', error)
      return []
    }
  }

  /**
   * Get history by date range
   */
  static async getHistoryByDateRange(
    characterId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<HistoryEntry[]> {
    try {
      const history = await this.getCharacterHistory(characterId)
      return history.filter((entry) => entry.timestamp >= startDate && entry.timestamp <= endDate)
    } catch (error) {
      console.error('Failed to get history by date range:', error)
      return []
    }
  }

  /**
   * Get history grouped by type
   */
  static async getHistoryGroupedByType(
    characterId: number,
  ): Promise<Record<string, HistoryEntry[]>> {
    try {
      const history = await this.getCharacterHistory(characterId)
      const grouped: Record<string, HistoryEntry[]> = {}

      history.forEach((entry) => {
        if (!grouped[entry.type]) {
          grouped[entry.type] = []
        }
        grouped[entry.type].push(entry)
      })

      return grouped
    } catch (error) {
      console.error('Failed to get grouped history:', error)
      return {}
    }
  }

  /**
   * Convert Task to HistoryEntry
   */
  private static convertTaskToHistoryEntry(task: Task): HistoryEntry {
    return {
      id: task.id!,
      source: 'task',
      type: task.type,
      title: this.getTaskTitle(task),
      description: task.description,
      timestamp: task.createdAt,
      location: task.location,
      difficulty: task.difficulty,
      experienceReward: task.experienceReward,
      bountyReward: task.bountyReward,
      kindnessReward: task.kindnessReward,
      helpType: task.helpType,
      duration: task.duration,
      startTime: task.startTime,
      endTime: task.endTime,
      isCompleted: task.isCompleted,
      completedAt: task.completedAt,
      step: task.step,
      stepCompleted: task.stepCompleted,
    }
  }

  /**
   * Convert Battle to HistoryEntry
   */
  private static convertBattleToHistoryEntry(
    battle: Battle,
    characterId: number,
    allCrews: Crew[],
    allCharacter: Character[],
  ): HistoryEntry {
    const isWinner = battle.winner === characterId
    const opponent = battle.challenger === characterId ? battle.opponent : battle.challenger
    const opponentCrewId =
      battle.challenger === characterId ? battle.opponentCrewId : battle.challengerCrewId
    const crewName = allCrews.find((crew) => crew.id === opponentCrewId)?.name || ''
    const opponentName = allCharacter.find((char) => char.id === opponent)?.name || ''

    return {
      id: battle.id!,
      source: 'battle',
      type: 'battle',
      title: isWinner ? 'Victory in Battle' : 'Defeat in Battle',
      description: `Battle against ${crewName}`,
      timestamp: battle.timestamp,
      experienceReward: isWinner ? battle.experienceGained : 0,
      bountyReward: isWinner ? battle.bountyGained : 0,
      isWinner,
      opponent: opponentName,
      opponentCrew: crewName,
      battleLog: battle.battleLog,
    }
  }

  /**
   * Generate task title based on type and data
   */
  private static getTaskTitle(task: Task): string {
    switch (task.type) {
      case 'exploration':
        return `Exploration of ${task.location}`
      case 'training':
        return 'Training Session'
      case 'navigation':
        return `Navigation to ${task.location}`
      case 'ship_upgrade':
        return 'Ship Upgrade'
      case 'ship_repair':
        return 'Ship Repair'
      case 'island_liberation':
        return `Liberation of ${task.location}${task.step ? ` (Step ${task.step})` : ''}`
      default:
        return ''
    }
  }

  /**
   * Export history to JSON (for backup/sharing)
   */
  static async exportHistory(characterId: number): Promise<string> {
    try {
      const history = await this.getCharacterHistory(characterId)
      const stats = await this.getHistoryStats(characterId)

      const exportData = {
        characterId,
        exportDate: new Date().toISOString(),
        stats,
        history,
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Failed to export history:', error)
      throw error
    }
  }

  /**
   * Clear old history entries (keep only last N days)
   */
  static async cleanupOldHistory(characterId: number, daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const tasks = await this.getTasksByCharacter(characterId)
      const battles = await this.getBattlesByCharacter(characterId)

      let deletedCount = 0

      // Delete old completed tasks
      for (const task of tasks) {
        if (task.isCompleted && task.createdAt < cutoffDate) {
          await db.tasks.delete(task.id!)
          deletedCount++
        }
      }

      // Note: Battles are usually kept for historical purposes
      // but you could add similar logic if needed

      return deletedCount
    } catch (error) {
      console.error('Failed to cleanup old history:', error)
      return 0
    }
  }
}
