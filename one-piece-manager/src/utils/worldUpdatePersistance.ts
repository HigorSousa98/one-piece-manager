// src/utils/worldUpdatePersistence.ts
export interface WorldUpdateState {
  id: string
  type: 'FULL_WORLD_UPDATE' | 'SIMULATE_ENCOUNTERS' | 'PROCESS_MOVEMENT'
  progress: number
  phase: string
  startTime: number
  data: any
  completed: boolean
  error?: string
}

export class WorldUpdatePersistence {
  private static readonly STORAGE_KEY = 'world_update_state'
  private static readonly MAX_RECOVERY_TIME = 5 * 60 * 1000 // 5 minutos

  // ✅ SALVAR ESTADO DO UPDATE
  static saveState(state: WorldUpdateState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.warn('Erro ao salvar estado do update:', error)
    }
  }

  // ✅ RECUPERAR ESTADO
  static getState(): WorldUpdateState | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (!saved) return null

      const state = JSON.parse(saved) as WorldUpdateState
      
      // Verificar se não é muito antigo
      const now = Date.now()
      if (now - state.startTime > this.MAX_RECOVERY_TIME) {
        this.clearState()
        return null
      }

      return state
    } catch (error) {
      console.warn('Erro ao recuperar estado:', error)
      this.clearState()
      return null
    }
  }

  // ✅ LIMPAR ESTADO
  static clearState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.warn('Erro ao limpar estado:', error)
    }
  }

  // ✅ VERIFICAR SE HÁ RECOVERY PENDENTE
  static hasPendingRecovery(): boolean {
    const state = this.getState()
    return state !== null && !state.completed
  }

  // ✅ MARCAR COMO COMPLETO
  static markCompleted(): void {
    const state = this.getState()
    if (state) {
      state.completed = true
      this.saveState(state)
    }
  }
}