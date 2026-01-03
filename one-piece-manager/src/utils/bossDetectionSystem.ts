// src/utils/bossDetectionSystem.ts
import { db } from './database'
import type { Character, Crew, Yonkou, Shichibukai, Admiral, Gorousei } from './database'

export interface DetectedBoss {
  type: 'Yonkou' | 'Shichibukai' | 'Admiral' | 'Gorousei'
  bossId: number
  captain: Character
  crew: Crew
  crewMembers: Character[]
}

export class BossDetectionSystem {
  // ✅ DETECTAR ALGOZES NA ILHA ATUAL
  static async detectBossesOnIsland(islandId: number): Promise<DetectedBoss[]> {
    const detectedBosses: DetectedBoss[] = []

    try {
      // ✅ BUSCAR YONKOUS
      const yonkous = await db.yonkous.where('baseIsland').equals(islandId).toArray()
      for (const yonkou of yonkous) {
        const boss = await this.buildBossData('Yonkou', yonkou.id!, yonkou.captainId)
        if (boss) detectedBosses.push(boss)
      }

      // ✅ BUSCAR SHICHIBUKAIS
      const shichibukais = await db.shichibukais.where('baseIsland').equals(islandId).toArray()
      for (const shichibukai of shichibukais) {
        const boss = await this.buildBossData('Shichibukai', shichibukai.id!, shichibukai.captainId)
        if (boss) detectedBosses.push(boss)
      }

      // ✅ BUSCAR ADMIRALS
      const admirals = await db.admirals.where('baseIsland').equals(islandId).toArray()
      for (const admiral of admirals) {
        const boss = await this.buildBossData('Admiral', admiral.id!, admiral.marineId)
        if (boss) detectedBosses.push(boss)
      }

      // ✅ BUSCAR GOROUSEIS
      const gorouseis = await db.gorouseis.where('currentIsland').equals(islandId).toArray()
      for (const gorousei of gorouseis) {
        const boss = await this.buildBossData('Gorousei', gorousei.id!, gorousei.govId)
        if (boss) detectedBosses.push(boss)
      }

      return detectedBosses
    } catch (error) {
      console.error('Erro ao detectar bosses:', error)
      return []
    }
  }

  // ✅ CONSTRUIR DADOS DO BOSS
  private static async buildBossData(
    type: DetectedBoss['type'],
    bossId: number,
    captainId: number,
  ): Promise<DetectedBoss | null> {
    try {
      // ✅ BUSCAR CAPITÃO
      const captain = await db.characters.get(captainId)
      if (!captain) return null

      // ✅ BUSCAR TRIPULAÇÃO
      const crew = await db.crews.where('captainId').equals(captainId).first()
      if (!crew) return null

      // ✅ BUSCAR MEMBROS DA TRIPULAÇÃO
      const crewMembers = await db.characters.where('crewId').equals(crew.id!).toArray()

      return {
        type,
        bossId,
        captain,
        crew,
        crewMembers: this.orderCrewByStrength(crewMembers, captainId),
      }
    } catch (error) {
      console.error(`Erro ao construir dados do boss ${type}:`, error)
      return null
    }
  }

  // ✅ ORDENAR TRIPULAÇÃO POR FORÇA (CAPITÃO SEMPRE ÚLTIMO)
  private static orderCrewByStrength(members: Character[], captainId: number): Character[] {
    const captain = members.find((m) => m.id === captainId)
    const otherMembers = members.filter((m) => m.id !== captainId)

    // ✅ ORDENAR POR FORÇA (LEVEL + BOUNTY)
    otherMembers.sort((a, b) => {
      const strengthA = a.level + a.bounty / 1000000 // Bounty em milhões
      const strengthB = b.level + b.bounty / 1000000
      return strengthB - strengthA // Decrescente
    })

    // ✅ CAPITÃO SEMPRE POR ÚLTIMO
    return captain ? [...otherMembers, captain] : otherMembers
  }
}
