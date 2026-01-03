// src/utils/avatarUtils.ts

import { AvatarGenerationSystem } from './avatarGenerationSystem'
import type { Character } from './database'

export class AvatarUtils {
  // ✅ CACHE EM MEMÓRIA PARA AVATARES
  private static avatarCache = new Map<number, string>()
  private static cacheExpiry = new Map<number, number>()
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  // ✅ OBTER AVATAR COM CACHE
  static async getAvatarWithCache(characterId: number): Promise<string | null> {
    try {
      // Verificar cache
      const cached = this.avatarCache.get(characterId)
      const expiry = this.cacheExpiry.get(characterId)

      if (cached && expiry && Date.now() < expiry) {
        return cached
      }

      // Buscar do banco
      const svgData = await AvatarGenerationSystem.getAvatarByCharacterId(characterId)

      if (svgData) {
        // Adicionar ao cache
        this.avatarCache.set(characterId, svgData)
        this.cacheExpiry.set(characterId, Date.now() + this.CACHE_DURATION)
      }

      return svgData
    } catch (error) {
      console.error('❌ Erro ao obter avatar com cache:', error)
      return null
    }
  }

  // ✅ LIMPAR CACHE
  static clearCache(characterId?: number): void {
    if (characterId) {
      this.avatarCache.delete(characterId)
      this.cacheExpiry.delete(characterId)
    } else {
      this.avatarCache.clear()
      this.cacheExpiry.clear()
    }
  }

  // ✅ CONVERTER SVG PARA PNG (usando Canvas)
  static async svgToPng(svgData: string, size: number = 200): Promise<string | null> {
    try {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          resolve(null)
          return
        }

        canvas.width = size
        canvas.height = size

        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, size, size)
          resolve(canvas.toDataURL('image/png'))
        }

        img.onerror = () => resolve(null)

        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        img.src = url
      })
    } catch (error) {
      console.error('❌ Erro ao converter SVG para PNG:', error)
      return null
    }
  }

  // ✅ DOWNLOAD DO AVATAR
  static async downloadAvatar(characterId: number, format: 'svg' | 'png' = 'png'): Promise<void> {
    try {
      const svgData = await AvatarGenerationSystem.getAvatarByCharacterId(characterId)
      if (!svgData) return

      let dataUrl: string
      let filename: string

      if (format === 'svg') {
        const base64 = btoa(unescape(encodeURIComponent(svgData)))
        dataUrl = `data:image/svg+xml;base64,${base64}`
        filename = `avatar_${characterId}.svg`
      } else {
        const pngData = await this.svgToPng(svgData)
        if (!pngData) return
        dataUrl = pngData
        filename = `avatar_${characterId}.png`
      }

      // Criar link de download
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('❌ Erro ao fazer download do avatar:', error)
    }
  }

  // ✅ VALIDAR COMPONENTES DO AVATAR
  static validateAvatarComponents(components: any): boolean {
    try {
      const required = ['face', 'eyes', 'hair', 'clothing', 'scars', 'devilFruit', 'background']

      for (const key of required) {
        if (!components[key]) {
          console.warn(`⚠️ Componente ${key} ausente`)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('❌ Erro ao validar componentes:', error)
      return false
    }
  }
}
