// src/utils/allianceSystem.ts
import { db } from './database'
import { GameLogic } from './gameLogic'
import type { Alliance, Crew } from './database'

const MAX_ALLIANCES = 3
const TEMPORARY_DURATION_MS = 2 * 60 * 60 * 1000 // 2h

// Types compatible for alliance
const COMPATIBLE_TYPES: Record<string, string[]> = {
  Pirate: ['Pirate', 'BountyHunter'],
  BountyHunter: ['Pirate', 'BountyHunter'],
  Marine: ['Marine', 'Government'],
  Government: ['Marine', 'Government'],
}

export class AllianceSystem {
  // Returns NPC crews on the same island eligible for alliance
  static async getEligibleAllies(playerCrewId: number): Promise<Crew[]> {
    const playerCrew = await db.crews.get(playerCrewId)
    if (!playerCrew) return []

    const compatibleTypes = COMPATIBLE_TYPES[playerCrew.type] ?? [playerCrew.type]

    // Get current active/betrayed alliedCrewIds to exclude
    const existingAlliances = await db.alliances
      .where('playerCrewId')
      .equals(playerCrewId)
      .toArray()
    const excludedCrewIds = new Set(existingAlliances.map((a) => a.alliedCrewId))

    const allCrews = await db.crews
      .where('currentIsland')
      .equals(playerCrew.currentIsland)
      .toArray()

    return allCrews.filter(
      (c) =>
        c.id !== playerCrewId &&
        c.id !== undefined &&
        !excludedCrewIds.has(c.id) &&
        compatibleTypes.includes(c.type),
    )
  }

  // Propose and immediately activate an alliance (NPCs never refuse)
  static async proposeAlliance(
    playerCrewId: number,
    targetCrewId: number,
    type: 'temporary' | 'permanent',
  ): Promise<Alliance> {
    const activeAlliances = await this.getActiveAlliances(playerCrewId)
    if (activeAlliances.length >= MAX_ALLIANCES) {
      throw new Error(`Máximo de ${MAX_ALLIANCES} alianças simultâneas atingido.`)
    }

    const targetCrew = await db.crews.get(targetCrewId)
    if (!targetCrew) throw new Error('Crew aliada não encontrada.')

    // betrayalChance: low reputation crews are more likely to betray
    const reputationFactor = Math.min(1, (targetCrew.reputation ?? 0) / 10000)
    const betrayalChance = 0.02 + (1 - reputationFactor) * 0.1

    const now = new Date()
    const alliance: Omit<Alliance, 'id'> = {
      playerCrewId,
      alliedCrewId: targetCrewId,
      type,
      status: 'active',
      betrayalChance,
      createdAt: now,
      expiresAt: type === 'temporary' ? new Date(now.getTime() + TEMPORARY_DURATION_MS) : undefined,
    }

    const id = await db.alliances.add(alliance as Alliance)
    return { ...alliance, id }
  }

  // Player dissolves an alliance
  static async dissolveAlliance(allianceId: number): Promise<void> {
    await db.alliances.update(allianceId, { status: 'expired' })
  }

  // Returns only active alliances (also expires temporary ones that timed out)
  static async getActiveAlliances(playerCrewId: number): Promise<Alliance[]> {
    const alliances = await db.alliances
      .where('playerCrewId')
      .equals(playerCrewId)
      .and((a) => a.status === 'active')
      .toArray()

    const now = Date.now()
    const expired: number[] = []

    const active = alliances.filter((a) => {
      if (a.type === 'temporary' && a.expiresAt && new Date(a.expiresAt).getTime() < now) {
        if (a.id !== undefined) expired.push(a.id)
        return false
      }
      return true
    })

    if (expired.length > 0) {
      await Promise.all(expired.map((id) => db.alliances.update(id, { status: 'expired' })))
    }

    return active
  }

  // Roll betrayal for permanent alliances — called by worldUpdateWorker each cycle
  // Returns alliances that betrayed this cycle
  static async checkBetrayals(playerCrewId: number): Promise<Alliance[]> {
    const active = await this.getActiveAlliances(playerCrewId)
    const permanentAlliances = active.filter((a) => a.type === 'permanent')

    const betrayed: Alliance[] = []
    for (const alliance of permanentAlliances) {
      if (Math.random() < alliance.betrayalChance) {
        await db.alliances.update(alliance.id!, { status: 'betrayed' })
        betrayed.push({ ...alliance, status: 'betrayed' })
      }
    }

    return betrayed
  }

  // Get all alliances including betrayed (for UI display)
  static async getAllAlliances(playerCrewId: number): Promise<Alliance[]> {
    return db.alliances.where('playerCrewId').equals(playerCrewId).toArray()
  }

  // Sum of allied crew power * 0.5 — used in battle
  static async getAlliedPowerBonus(playerCrewId: number): Promise<number> {
    const active = await this.getActiveAlliances(playerCrewId)
    if (active.length === 0) return 0

    const devilFruits = await db.devilFruits.toArray()
    let totalBonus = 0

    for (const alliance of active) {
      const members = await db.characters
        .where('crewId')
        .equals(alliance.alliedCrewId)
        .toArray()
      const power = GameLogic.calculateCrewPower(members, devilFruits)
      totalBonus += power * 0.5
    }

    return Math.floor(totalBonus)
  }
}
