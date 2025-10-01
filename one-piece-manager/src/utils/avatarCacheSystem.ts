// src/utils/avatarCacheSystem.ts

import { db } from './database'

interface CacheEntry {
  characterId: number
  svgData: string
  timestamp: number
  accessCount: number
  lastAccessed: number
  size: number
}

interface CacheStats {
  totalEntries: number
  totalSize: number
  hitRate: number
  missRate: number
  averageAccessTime: number
}

export class AvatarCacheSystem {
  
  // ✅ CONFIGURAÇÕES DO CACHE
  private static readonly CACHE_KEY = 'avatar_cache'
  private static readonly MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB
  private static readonly MAX_ENTRIES = 1000
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas
  private static readonly CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hora
  
  // ✅ CACHE EM MEMÓRIA
  private static memoryCache = new Map<number, CacheEntry>()
  private static cacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    totalAccessTime: 0
  }
  
  // ✅ TIMER DE LIMPEZA
  private static cleanupTimer: NodeJS.Timeout | null = null
  
  // ✅ INICIALIZAR SISTEMA DE CACHE
  static async initialize(): Promise<void> {
    try {
      console.log('🚀 Inicializando sistema de cache de avatares...')
      
      // Carregar cache do localStorage
      await this.loadFromStorage()
      
      // Iniciar limpeza automática
      this.startCleanupTimer()
      
      // Estatísticas iniciais
      const stats = await this.getStats()
      console.log('📊 Cache inicializado:', stats)
      
    } catch (error) {
      console.error('❌ Erro ao inicializar cache:', error)
    }
  }
  
  // ✅ OBTER DO CACHE
  static async getFromCache(characterId: number): Promise<string | null> {
    const startTime = performance.now()
    this.cacheStats.totalRequests++
    
    try {
      // Verificar cache em memória primeiro
      let entry = this.memoryCache.get(characterId)
      
      if (!entry) {
        // Tentar carregar do localStorage
        entry = await this.loadFromStorage(characterId)
      }
      
      if (entry && this.isValidEntry(entry)) {
        // Cache hit
        entry.accessCount++
        entry.lastAccessed = Date.now()
        this.memoryCache.set(characterId, entry)
        
        this.cacheStats.hits++
        const accessTime = performance.now() - startTime
        this.cacheStats.totalAccessTime += accessTime
        
        console.log(`✅ Cache HIT para character ${characterId} (${accessTime.toFixed(2)}ms)`)
        return entry.svgData
      }
      
      // Cache miss
      this.cacheStats.misses++
      console.log(`❌ Cache MISS para character ${characterId}`)
      return null
      
    } catch (error) {
      console.error('❌ Erro ao obter do cache:', error)
      this.cacheStats.misses++
      return null
    }
  }
  
  // ✅ ADICIONAR AO CACHE
  static async addToCache(characterId: number, svgData: string): Promise<boolean> {
    try {
      const entry: CacheEntry = {
        characterId,
        svgData,
        timestamp: Date.now(),
        accessCount: 1,
        lastAccessed: Date.now(),
        size: new Blob([svgData]).size
      }
      
      // Verificar limites do cache
      if (await this.shouldEvict(entry)) {
        await this.evictEntries()
      }
      
      // Adicionar ao cache em memória
      this.memoryCache.set(characterId, entry)
      
      // Salvar no localStorage (async)
      this.saveToStorage(characterId, entry)
      
      console.log(`💾 Avatar adicionado ao cache: character ${characterId} (${entry.size} bytes)`)
      return true
      
    } catch (error) {
      console.error('❌ Erro ao adicionar ao cache:', error)
      return false
    }
  }
  
  // ✅ REMOVER DO CACHE
  static removeFromCache(characterId: number): void {
    try {
      this.memoryCache.delete(characterId)
      
      // Remover do localStorage
      const storageKey = `${this.CACHE_KEY}_${characterId}`
      localStorage.removeItem(storageKey)
      
      console.log(`🗑️ Avatar removido do cache: character ${characterId}`)
      
    } catch (error) {
      console.error('❌ Erro ao remover do cache:', error)
    }
  }
  
  // ✅ VERIFICAR SE ENTRADA É VÁLIDA
  private static isValidEntry(entry: CacheEntry): boolean {
    const now = Date.now()
    const age = now - entry.timestamp
    
    return age < this.CACHE_DURATION && entry.svgData && entry.svgData.length > 0
  }
  
  // ✅ VERIFICAR SE DEVE FAZER EVICTION
  private static async shouldEvict(newEntry: CacheEntry): Promise<boolean> {
    const currentSize = await this.getCurrentCacheSize()
    const currentEntries = this.memoryCache.size
    
    return (
      currentSize + newEntry.size > this.MAX_CACHE_SIZE ||
      currentEntries >= this.MAX_ENTRIES
    )
  }
  
  // ✅ REMOVER ENTRADAS ANTIGAS (LRU)
  private static async evictEntries(): Promise<void> {
    try {
      const entries = Array.from(this.memoryCache.entries())
      
      // Ordenar por último acesso (LRU)
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
      
      // Remover 25% das entradas mais antigas
      const toRemove = Math.ceil(entries.length * 0.25)
      
      for (let i = 0; i < toRemove; i++) {
        const [characterId] = entries[i]
        this.removeFromCache(characterId)
      }
      
      console.log(`🧹 Removidas ${toRemove} entradas antigas do cache`)
      
    } catch (error) {
      console.error('❌ Erro ao fazer eviction:', error)
    }
  }
  
  // ✅ OBTER TAMANHO ATUAL DO CACHE
  private static async getCurrentCacheSize(): Promise<number> {
    let totalSize = 0
    
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size
    }
    
    return totalSize
  }
  
  // ✅ CARREGAR DO LOCALSTORAGE
  private static async loadFromStorage(characterId?: number): Promise<CacheEntry | null> {
    try {
      if (characterId) {
        // Carregar entrada específica
        const storageKey = `${this.CACHE_KEY}_${characterId}`
        const data = localStorage.getItem(storageKey)
        
        if (data) {
          const entry: CacheEntry = JSON.parse(data)
          if (this.isValidEntry(entry)) {
            this.memoryCache.set(characterId, entry)
            return entry
          } else {
            // Entrada inválida, remover
            localStorage.removeItem(storageKey)
          }
        }
        
        return null
      } else {
        // Carregar todo o cache
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith(this.CACHE_KEY)
        )
        
        for (const key of keys) {
          const characterIdStr = key.replace(`${this.CACHE_KEY}_`, '')
          const charId = parseInt(characterIdStr)
          
          if (!isNaN(charId)) {
            await this.loadFromStorage(charId)
          }
        }
        
        console.log(`📂 Carregadas ${this.memoryCache.size} entradas do localStorage`)
        return null
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar do localStorage:', error)
      return null
    }
  }
  
  // ✅ SALVAR NO LOCALSTORAGE
  private static async saveToStorage(characterId: number, entry: CacheEntry): Promise<void> {
    try {
      const storageKey = `${this.CACHE_KEY}_${characterId}`
      const data = JSON.stringify(entry)
      
      localStorage.setItem(storageKey, data)
      
    } catch (error) {
      // localStorage pode estar cheio
      console.warn('⚠️ Erro ao salvar no localStorage:', error)
      
      // Tentar limpar espaço
      await this.evictEntries()
      
      // Tentar novamente
      try {
        const storageKey = `${this.CACHE_KEY}_${characterId}`
        const data = JSON.stringify(entry)
        localStorage.setItem(storageKey, data)
      } catch (retryError) {
        console.error('❌ Falha ao salvar no localStorage após limpeza:', retryError)
      }
    }
  }
  
  // ✅ INICIAR TIMER DE LIMPEZA
  private static startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    
    this.cleanupTimer = setInterval(async () => {
      await this.cleanup()
    }, this.CLEANUP_INTERVAL)
    
    console.log('⏰ Timer de limpeza iniciado')
  }
  
  // ✅ LIMPEZA AUTOMÁTICA
  private static async cleanup(): Promise<void> {
    try {
      const before = this.memoryCache.size
      const entries = Array.from(this.memoryCache.entries())
      
      // Remover entradas expiradas
      for (const [characterId, entry] of entries) {
        if (!this.isValidEntry(entry)) {
          this.removeFromCache(characterId)
        }
      }
      
      const after = this.memoryCache.size
      const removed = before - after
      
      if (removed > 0) {
        console.log(`🧹 Limpeza automática: ${removed} entradas removidas`)
      }
      
      // Verificar se precisa fazer eviction por tamanho
      const currentSize = await this.getCurrentCacheSize()
      if (currentSize > this.MAX_CACHE_SIZE * 0.8) { // 80% do limite
        await this.evictEntries()
      }
      
    } catch (error) {
      console.error('❌ Erro na limpeza automática:', error)
    }
  }
  
  // ✅ OBTER ESTATÍSTICAS
  static async getStats(): Promise<CacheStats> {
    const totalSize = await this.getCurrentCacheSize()
    const totalRequests = this.cacheStats.totalRequests
    const hitRate = totalRequests > 0 ? (this.cacheStats.hits / totalRequests) * 100 : 0
    const missRate = totalRequests > 0 ? (this.cacheStats.misses / totalRequests) * 100 : 0
    const averageAccessTime = this.cacheStats.hits > 0 ? 
      this.cacheStats.totalAccessTime / this.cacheStats.hits : 0
    
    return {
      totalEntries: this.memoryCache.size,
      totalSize,
      hitRate,
      missRate,
      averageAccessTime
    }
  }
  
  // ✅ LIMPAR TODO O CACHE
  static async clearAll(): Promise<void> {
    try {
      // Limpar cache em memória
      this.memoryCache.clear()
      
      // Limpar localStorage
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.CACHE_KEY)
      )
      
      for (const key of keys) {
        localStorage.removeItem(key)
      }
      
      // Resetar estatísticas
      this.cacheStats = {
        hits: 0,
        misses: 0,
        totalRequests: 0,
        totalAccessTime: 0
      }
      
      console.log('🗑️ Cache completamente limpo')
      
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error)
    }
  }
  
  // ✅ PRÉ-CARREGAR AVATARES
  static async preloadAvatars(characterIds: number[]): Promise<void> {
    try {
      console.log(`🔄 Pré-carregando ${characterIds.length} avatares...`)
      
      const promises = characterIds.map(async (characterId) => {
        // Verificar se já está no cache
        const cached = await this.getFromCache(characterId)
        if (cached) return
        
        // Buscar do banco e adicionar ao cache
        try {
          const { AvatarGenerationSystem } = await import('./avatarGenerationSystem')
          const svgData = await AvatarGenerationSystem.getAvatarByCharacterId(characterId)
          
          if (svgData) {
            await this.addToCache(characterId, svgData)
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao pré-carregar avatar ${characterId}:`, error)
        }
      })
      
      await Promise.all(promises)
      console.log('✅ Pré-carregamento concluído')
      
    } catch (error) {
      console.error('❌ Erro no pré-carregamento:', error)
    }
  }
  
  // ✅ DESTRUIR SISTEMA DE CACHE
  static destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    
    this.memoryCache.clear()
    console.log('💥 Sistema de cache destruído')
  }
}

// ✅ INICIALIZAR AUTOMATICAMENTE
if (typeof window !== 'undefined') {
  AvatarCacheSystem.initialize()
}