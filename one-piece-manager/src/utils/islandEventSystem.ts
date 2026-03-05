// src/utils/islandEventSystem.ts
import { db } from './database'
import { GameLogic } from './gameLogic'
import type { IslandEvent, IslandEventData, Character, Island, Item } from './database'

export interface IslandEventResult {
  success: boolean
  message: string
  rewards: {
    experience: number
    bounty: number
    reputation: number
    item?: Item
    newMember?: Character
  }
  battleLog?: string[]
}

// Weighted event type selection
const EVENT_WEIGHTS_BY_DIFFICULTY: Record<
  string,
  Record<IslandEvent['type'], number>
> = {
  easy: {
    marine_invasion: 40,
    pirate_festival: 40,
    ancient_shipwreck: 10,
    escaped_prisoner: 10,
  },
  mid: {
    marine_invasion: 30,
    pirate_festival: 25,
    ancient_shipwreck: 30,
    escaped_prisoner: 15,
  },
  hard: {
    marine_invasion: 20,
    pirate_festival: 15,
    ancient_shipwreck: 45,
    escaped_prisoner: 20,
  },
}

const EVENT_TITLES: Record<IslandEvent['type'], string> = {
  marine_invasion: 'Invasão da Marinha',
  pirate_festival: 'Festival Pirata',
  ancient_shipwreck: 'Naufrágio Antigo',
  escaped_prisoner: 'Prisioneiro em Fuga',
}

const EVENT_DESCRIPTIONS: Record<IslandEvent['type'], string> = {
  marine_invasion:
    'A Marinha está atacando a ilha! Defenda os habitantes ou recue para sobreviver.',
  pirate_festival:
    'Um torneio de piratas está acontecendo! Vença 2 de 3 duelos para conquistar o prêmio.',
  ancient_shipwreck:
    'Ruínas de um naufrágio antigo foram descobertas. Explore as profundezas em busca de tesouros.',
  escaped_prisoner:
    'Um prisioneiro de alto nível escapou e está pedindo ajuda. Você pode recrutá-lo!',
}

const DURATIONS_MS: Record<IslandEvent['type'], number> = {
  marine_invasion: 2 * 60 * 60 * 1000,   // 2h
  pirate_festival: 4 * 60 * 60 * 1000,   // 4h
  ancient_shipwreck: 6 * 60 * 60 * 1000, // 6h
  escaped_prisoner: 1 * 60 * 60 * 1000,  // 1h (urgent)
}

// Event generation chance per island per world cycle
const EVENT_CHANCE = 0.05

export class IslandEventSystem {
  private static pickWeightedType(
    weights: Record<IslandEvent['type'], number>,
  ): IslandEvent['type'] {
    const total = Object.values(weights).reduce((a, b) => a + b, 0)
    let rand = Math.random() * total
    for (const [type, weight] of Object.entries(weights) as [IslandEvent['type'], number][]) {
      rand -= weight
      if (rand <= 0) return type
    }
    return 'pirate_festival'
  }

  // Called by worldUpdateWorker — configurable chance per island per cycle
  static async generateEventsForIsland(
    islandId: number,
    island: Island,
    eventChance: number = EVENT_CHANCE,
  ): Promise<IslandEvent | null> {
    // Check if there's already an active event for this island
    const existing = await db.islandEvents
      .where('islandId')
      .equals(islandId)
      .and((e) => e.status === 'active')
      .first()

    if (existing) return null

    if (Math.random() > eventChance) return null

    const difficulty = island.difficulty
    const diffKey = difficulty <= 5 ? 'easy' : difficulty <= 15 ? 'mid' : 'hard'
    const type = this.pickWeightedType(EVENT_WEIGHTS_BY_DIFFICULTY[diffKey])

    const now = new Date()
    const data: IslandEventData = {
      title: EVENT_TITLES[type],
      description: EVENT_DESCRIPTIONS[type],
      difficulty,
      rewards: this.buildRewards(type, difficulty),
      marineStrength:
        type === 'marine_invasion' ? difficulty * 1000 + Math.floor(Math.random() * 500) : undefined,
      prisonerLevel: type === 'escaped_prisoner' ? difficulty * 5 : undefined,
      prisonerType:
        type === 'escaped_prisoner'
          ? (['Pirate', 'BountyHunter', 'Marine'][Math.floor(Math.random() * 3)] as string)
          : undefined,
    }

    const event: Omit<IslandEvent, 'id'> = {
      islandId,
      type,
      status: 'active',
      startedAt: now,
      expiresAt: new Date(now.getTime() + DURATIONS_MS[type]),
      data,
    }

    const id = await db.islandEvents.add(event as IslandEvent)
    return { ...event, id }
  }

  private static buildRewards(
    type: IslandEvent['type'],
    difficulty: number,
  ): IslandEventData['rewards'] {
    const base = difficulty * 100
    switch (type) {
      case 'marine_invasion':
        return {
          experience: base * 5,
          bounty: base * 1000,
          reputation: 50 * difficulty,
        }
      case 'pirate_festival':
        return {
          experience: base * 3,
          bounty: base * 2000,
          reputation: 30 * difficulty,
        }
      case 'ancient_shipwreck':
        return {
          experience: base * 4,
          bounty: 0,
          reputation: 20 * difficulty,
        }
      case 'escaped_prisoner':
        return {
          experience: base * 2,
          bounty: 0,
          reputation: 15 * difficulty,
        }
    }
  }

  // Handle player participation in an event
  static async participateInEvent(
    eventId: number,
    character: Character,
    crewId: number,
    alliedPowerBonus = 0,
  ): Promise<IslandEventResult> {
    const event = await db.islandEvents.get(eventId)
    if (!event || event.status !== 'active') {
      return { success: false, message: 'Evento não está mais disponível.', rewards: { experience: 0, bounty: 0, reputation: 0 } }
    }

    let result: IslandEventResult

    switch (event.type) {
      case 'marine_invasion':
        result = await this.handleMarineInvasion(event, character, crewId, alliedPowerBonus)
        break
      case 'pirate_festival':
        result = await this.handlePirateFestival(event, character)
        break
      case 'ancient_shipwreck':
        result = await this.handleAncientShipwreck(event, character)
        break
      case 'escaped_prisoner':
        result = await this.handleEscapedPrisoner(event, character, crewId)
        break
      default:
        return { success: false, message: 'Tipo de evento desconhecido.', rewards: { experience: 0, bounty: 0, reputation: 0 } }
    }

    // Mark event as completed or failed
    await db.islandEvents.update(eventId, {
      status: result.success ? 'completed' : 'active', // failed events stay active until they expire
      participantCrewId: crewId,
    })

    // Apply rewards to character and crew if success
    if (result.success && (result.rewards.experience > 0 || result.rewards.bounty > 0)) {
      await this.applyRewards(character, crewId, result.rewards)
    }

    return result
  }

  private static async handleMarineInvasion(
    event: IslandEvent,
    character: Character,
    crewId: number,
    alliedPowerBonus: number,
  ): Promise<IslandEventResult> {
    const battleLog: string[] = []
    battleLog.push(`⚓ Invasão da Marinha em andamento!`)

    const members = await db.characters.where('crewId').equals(crewId).toArray()
    const devilFruits = await db.devilFruits.toArray()
    const playerPower = GameLogic.calculateCrewPower(members, devilFruits) + alliedPowerBonus
    const marineStrength = event.data.marineStrength ?? event.data.difficulty * 1000

    battleLog.push(`💪 Seu poder total: ${Math.floor(playerPower)}`)
    if (alliedPowerBonus > 0) battleLog.push(`🤝 Bônus de alianças: +${Math.floor(alliedPowerBonus)}`)
    battleLog.push(`⚔️ Força da Marinha: ${marineStrength}`)

    const totalPower = playerPower + marineStrength
    const winChance = Math.min(0.9, Math.max(0.1, playerPower / totalPower))
    const victory = Math.random() < winChance

    if (victory) {
      battleLog.push(`🎉 Vitória! A Marinha foi repelida!`)
      return {
        success: true,
        message: 'Você repeliu a invasão da Marinha!',
        rewards: {
          experience: event.data.rewards.experience ?? 0,
          bounty: event.data.rewards.bounty ?? 0,
          reputation: event.data.rewards.reputation ?? 0,
        },
        battleLog,
      }
    } else {
      battleLog.push(`💀 A Marinha foi forte demais desta vez...`)
      return {
        success: false,
        message: 'A Marinha foi superior desta vez. Sua reputação sofreu.',
        rewards: { experience: 0, bounty: 0, reputation: -10 },
        battleLog,
      }
    }
  }

  private static async handlePirateFestival(
    event: IslandEvent,
    character: Character,
  ): Promise<IslandEventResult> {
    const battleLog: string[] = []
    battleLog.push(`🎉 Festival Pirata — Torneio de Duelos!`)

    // 3 rounds vs NPCs on the island, win 2/3 to claim prize
    const islandNpcs = await db.characters
      .where('type')
      .notEqual('Civilian')
      .toArray()
    const difficultyLevel = event.data.difficulty * 5

    let wins = 0
    for (let round = 1; round <= 3; round++) {
      const opponentLevel = difficultyLevel + Math.floor(Math.random() * 10) - 5
      const playerScore = character.level + Math.floor(Math.random() * 20)
      const opponentScore = opponentLevel + Math.floor(Math.random() * 20)
      const won = playerScore >= opponentScore
      if (won) wins++

      const opponentName = islandNpcs.length > 0
        ? islandNpcs[Math.floor(Math.random() * islandNpcs.length)].name
        : `Pirata Desconhecido`

      battleLog.push(
        `Round ${round}: vs ${opponentName} (Lv ${opponentLevel}) — ${won ? '✓ Vitória' : '✗ Derrota'}`,
      )
    }

    const victory = wins >= 2
    battleLog.push(victory ? `🏆 Campeão do Festival! (${wins}/3)` : `😔 Eliminado no torneio (${wins}/3)`)

    return {
      success: victory,
      message: victory
        ? `Você venceu o Festival Pirata com ${wins} de 3 duelos!`
        : `Você foi eliminado com ${wins} de 3 vitórias.`,
      rewards: victory
        ? {
            experience: event.data.rewards.experience ?? 0,
            bounty: event.data.rewards.bounty ?? 0,
            reputation: event.data.rewards.reputation ?? 0,
          }
        : {
            experience: Math.floor((event.data.rewards.experience ?? 0) * 0.3 * wins),
            bounty: 0,
            reputation: 0,
          },
      battleLog,
    }
  }

  private static async handleAncientShipwreck(
    event: IslandEvent,
    character: Character,
  ): Promise<IslandEventResult> {
    // No combat — intelligence + level roll
    const roll = (character.stats.intelligence + character.level) / (event.data.difficulty * 10)
    const success = Math.random() < Math.min(0.85, Math.max(0.1, roll))

    let item: Item | undefined

    if (success) {
      // Try to find a rare item from the global items pool
      const rareitems = await db.items
        .filter((i) => i.rarity >= 0.7)
        .toArray()
      if (rareitems.length > 0) {
        item = rareitems[Math.floor(Math.random() * rareitems.length)]
      }
    }

    return {
      success,
      message: success
        ? item
          ? `Incrível! Você encontrou ${item.name} nas ruínas!`
          : 'Você encontrou tesouros valiosos nas ruínas!'
        : 'As profundezas não revelaram seus segredos desta vez.',
      rewards: success
        ? {
            experience: event.data.rewards.experience ?? 0,
            bounty: 0,
            reputation: event.data.rewards.reputation ?? 0,
            item,
          }
        : {
            experience: Math.floor((event.data.rewards.experience ?? 0) * 0.2),
            bounty: 0,
            reputation: 0,
          },
    }
  }

  private static async handleEscapedPrisoner(
    event: IslandEvent,
    character: Character,
    crewId: number,
  ): Promise<IslandEventResult> {
    const prisonerLevel = event.data.prisonerLevel ?? event.data.difficulty * 5
    const prisonerType = (event.data.prisonerType ?? 'Pirate') as Character['type']

    // Generate a special character for the prisoner
    const styleCombats = await db.styleCombats.toArray()
    if (styleCombats.length === 0) {
      return { success: false, message: 'Não foi possível gerar o prisioneiro.', rewards: { experience: 0, bounty: 0, reputation: 0 } }
    }

    const styleId = styleCombats[Math.floor(Math.random() * styleCombats.length)].id!
    const stats = GameLogic.generateStats(prisonerLevel, styleCombats.find(s => s.id === styleId)?.name ?? 'Swordsman', 0.1)

    const prisoner: Omit<Character, 'id'> = {
      name: `Prisioneiro Evadido #${Math.floor(Math.random() * 9000) + 1000}`,
      level: prisonerLevel,
      experience: 0,
      bounty: prisonerLevel * 10000,
      type: prisonerType,
      crewId,
      stats,
      styleCombatId: styleId,
      devilFruitId: 0,
      potentialToHaveKngHaki: 0.1,
      position: 'Crew Member',
      isPlayer: 0,
      createdAt: new Date(),
      defendingBase: 0,
      kindness: 80,  // grateful for rescue
      loyalty: 90,
    }

    // Add prisoner to the crew immediately
    const newMemberId = await db.characters.add(prisoner as Character)
    const newMember = { ...prisoner, id: newMemberId } as Character

    return {
      success: true,
      message: `${newMember.name} juntou-se à sua tripulação!`,
      rewards: {
        experience: event.data.rewards.experience ?? 0,
        bounty: 0,
        reputation: event.data.rewards.reputation ?? 0,
        newMember,
      },
    }
  }

  private static async applyRewards(
    character: Character,
    crewId: number,
    rewards: IslandEventResult['rewards'],
  ): Promise<void> {
    const updates: Promise<any>[] = []

    if (rewards.experience > 0 && character.id) {
      updates.push(
        db.characters.update(character.id, {
          experience: (character.experience || 0) + rewards.experience,
        }),
      )
    }

    if (rewards.bounty > 0 && character.id) {
      updates.push(
        db.characters.update(character.id, {
          bounty: (character.bounty || 0) + rewards.bounty,
        }),
      )
    }

    if (rewards.reputation !== 0) {
      const crew = await db.crews.get(crewId)
      if (crew) {
        const newRep = Math.max(0, (crew.reputation || 0) + rewards.reputation)
        updates.push(db.crews.update(crewId, { reputation: newRep }))
      }
    }

    if (rewards.item) {
      updates.push(db.inventories.add({ crewId, itemId: rewards.item.id!, acquiredAt: new Date() }))
    }

    await Promise.all(updates)
  }

  // Expire old events where expiresAt < now
  static async expireOldEvents(): Promise<void> {
    const now = new Date()
    const activeEvents = await db.islandEvents
      .where('status')
      .equals('active')
      .toArray()

    const expired = activeEvents.filter((e) => new Date(e.expiresAt) < now)
    if (expired.length > 0) {
      await Promise.all(
        expired.map((e) => db.islandEvents.update(e.id!, { status: 'expired' })),
      )
    }
  }

  // Get active events for an island
  static async getActiveEvents(islandId: number): Promise<IslandEvent[]> {
    const now = new Date()
    const events = await db.islandEvents
      .where('islandId')
      .equals(islandId)
      .and((e) => e.status === 'active')
      .toArray()

    // Filter out expired ones (edge case if expireOldEvents wasn't called recently)
    return events.filter((e) => new Date(e.expiresAt) > now)
  }
}
