// src/utils/avataaarsCache.ts
import type { AvataaarsConfig } from './avataaarsConfig'

export interface CachedAvatar {
  id: string
  characterId: number
  url: string
  config: AvataaarsConfig
  createdAt: Date
  lastAccessed: Date
  accessCount: number
  variationIndex: number
}

export class AvataaarsCache {
  private static readonly CACHE_KEY = 'avataaars_cache_v2' // Nova versão
  private static readonly MAX_CACHE_SIZE = 500
  private static readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 dias

  // 💾 SALVAR NO CACHE
  static async saveToCache(characterId: number, url: string, config: AvataaarsConfig, variationIndex: number = 0): Promise<void> {
    try {
      const cache = await this.getCache()
      const id = `${characterId}_${variationIndex}`
      
      const cachedAvatar: CachedAvatar = {
        id,
        characterId,
        url,
        config,
        createdAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 1,
        variationIndex
      }

      cache[id] = cachedAvatar
      
      // Limpar cache se necessário
      await this.cleanupCache(cache)
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
      console.log(`✅ Avatar Avataaars cached: ${id}`)
      
    } catch (error) {
      console.error('❌ Erro ao salvar avatar no cache:', error)
    }
  }

  // 📖 BUSCAR NO CACHE
  static async getFromCache(characterId: number, variationIndex: number = 0): Promise<string | null> {
    try {
      const cache = await this.getCache()
      const id = `${characterId}_${variationIndex}`
      const cachedAvatar = cache[id]

      if (!cachedAvatar) {
        return null
      }

      // Verificar se não expirou
      const now = new Date()
      const age = now.getTime() - new Date(cachedAvatar.createdAt).getTime()
      
      if (age > this.CACHE_DURATION) {
        delete cache[id]
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
        return null
      }

      // Atualizar estatísticas de acesso
      cachedAvatar.lastAccessed = now
      cachedAvatar.accessCount++
      cache[id] = cachedAvatar
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))

      console.log(`✅ Avatar Avataaars found in cache: ${id}`)
      return cachedAvatar.url

    } catch (error) {
      console.error('❌ Erro ao buscar avatar no cache:', error)
      return null
    }
  }

  // 🗑️ LIMPEZA DO CACHE
  private static async cleanupCache(cache: Record<string, CachedAvatar>): Promise<void> {
    const entries = Object.entries(cache)
    
    if (entries.length <= this.MAX_CACHE_SIZE) {
      return
    }

    // Ordenar por último acesso (mais antigo primeiro)
    entries.sort((a, b) => 
      new Date(a[1].lastAccessed).getTime() - new Date(b[1].lastAccessed).getTime()
    )

    // Remover 20% dos mais antigos
    const toRemove = Math.floor(entries.length * 0.2)
    for (let i = 0; i < toRemove; i++) {
      delete cache[entries[i][0]]
    }

    console.log(`🧹 Cache Avataaars cleanup: removed ${toRemove} old entries`)
  }

  // 🔄 OBTER CACHE
  private static async getCache(): Promise<Record<string, CachedAvatar>> {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      return cached ? JSON.parse(cached) : {}
    } catch (error) {
      console.error('❌ Erro ao acessar cache:', error)
      return {}
    }
  }

  // 🗑️ LIMPAR CACHE COMPLETO
  static async clearCache(): Promise<void> {
    try {
      localStorage.removeItem(this.CACHE_KEY)
      console.log('✅ Cache Avataaars limpo completamente')
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error)
    }
  }

  // 📊 ESTATÍSTICAS DO CACHE
  static async getStats(): Promise<{
    totalEntries: number
    totalSize: string
    oldestEntry: Date | null
    mostAccessed: CachedAvatar | null
  }> {
    try {
      const cache = await this.getCache()
      const entries = Object.values(cache)
      
      if (entries.length === 0) {
        return {
          totalEntries: 0,
          totalSize: '0 KB',
          oldestEntry: null,
          mostAccessed: null
        }
      }

      const totalSize = new Blob([JSON.stringify(cache)]).size
      const oldestEntry = entries.reduce((oldest, current) => 
        new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
      )
      const mostAccessed = entries.reduce((most, current) => 
        current.accessCount > most.accessCount ? current : most
      )

      return {
        totalEntries: entries.length,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        oldestEntry: new Date(oldestEntry.createdAt),
        mostAccessed
      }

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do cache:', error)
      return {
        totalEntries: 0,
        totalSize: '0 KB',
        oldestEntry: null,
        mostAccessed: null
      }
    }
  }
}