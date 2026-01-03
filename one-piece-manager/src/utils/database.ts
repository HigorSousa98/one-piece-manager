// src/utils/database.ts
import Dexie, { Table } from 'dexie'

// ✅ DEFINIR CONSTRAINTS DE RANGE
export const FIELD_CONSTRAINTS = {
  character: {
    kindness: { min: -100, max: 100 },
    loyalty: { min: -100, max: 100 },
    level: { min: 1, max: 200 },
    experience: { min: 0, max: Number.MAX_SAFE_INTEGER },
    bounty: { min: 0, max: Number.MAX_SAFE_INTEGER },
    potentialToHaveKngHaki: { min: 0, max: 1 },
  },
  devilFruit: {
    rarity: { min: 0, max: 1 }, // 0 = comum, 1 = raro
  },
  crew: {
    reputation: { min: 0, max: Number.MAX_SAFE_INTEGER },
    treasury: { min: 0, max: Number.MAX_SAFE_INTEGER },
  },
  island: {
    difficulty: { min: 1, max: 30 },
  },
} as const

export interface AvatarComponents {
  face: {
    shape: 'round' | 'oval' | 'square' | 'heart'
    skinTone: string
    expression: 'neutral' | 'serious' | 'kind' | 'angry' | 'confident' | 'mysterious'
  }
  eyes: {
    shape: 'normal' | 'sharp' | 'round' | 'narrow' | 'wide'
    color: string
    hasGlasses: boolean
    eyepatch: boolean
  }
  hair: {
    style: string
    color: string
    length: 'short' | 'medium' | 'long'
    hasHat: boolean
  }
  clothing: {
    type: 'marine' | 'government' | 'pirate' | 'civilian' | 'bounty_hunter'
    color: string
    accessories: string[]
  }
  scars: {
    face: boolean
    faceType: 'cross' | 'vertical' | 'horizontal' | 'diagonal' | 'none'
    body: boolean
  }
  devilFruit: {
    hasSymbol: boolean
    symbolType: 'paramecia' | 'zoan' | 'logia' | null
    glowEffect: boolean
  }
  background: {
    color: string
    pattern: 'solid' | 'gradient' | 'stars' | 'waves'
  }
}

// ✅ FUNÇÃO PARA VALIDAR CONSTRAINTS
function validateConstraints(tableName: string, data: any): void {
  const constraints = FIELD_CONSTRAINTS[tableName as keyof typeof FIELD_CONSTRAINTS]

  if (!constraints) return

  for (const [field, range] of Object.entries(constraints)) {
    if (data[field] !== undefined && data[field] !== null) {
      const value = data[field]
      const { min, max } = range

      if (value < min || value > max) {
        throw new Error(
          `Campo '${field}' deve estar entre ${min} e ${max}. Valor fornecido: ${value}`,
        )
      }
    }
  }
}

// ✅ FUNÇÃO PARA APLICAR CONSTRAINTS (CLAMP)
function applyConstraints(tableName: string, data: any): any {
  const constraints = FIELD_CONSTRAINTS[tableName as keyof typeof FIELD_CONSTRAINTS]

  if (!constraints) return data

  const clampedData = { ...data }

  for (const [field, range] of Object.entries(constraints)) {
    if (clampedData[field] !== undefined && clampedData[field] !== null) {
      const { min, max } = range
      clampedData[field] = Math.min(max, Math.max(min, clampedData[field]))
    }
  }

  return clampedData
}

export interface Character {
  id?: number
  name: string
  level: number
  experience: number
  bounty: number
  type: 'Pirate' | 'Marine' | 'BountyHunter' | 'Civillian' | 'Government'
  crewId?: number
  stats: {
    attack: number
    defense: number
    speed: number
    skill: number
    intelligence: number
    armHaki: number
    obsHaki: number
    kingHaki: number
    devilFruit: number
  }
  styleCombatId: number
  devilFruitId: number
  potentialToHaveKngHaki: number
  position:
    | 'Captain'
    | 'First Mate'
    | 'Navigator'
    | 'Cook'
    | 'Sniper'
    | 'Doctor'
    | 'Archaeologist'
    | 'Shipwright'
    | 'Musician'
    | 'Crew Member'
  isPlayer: 0 | 1
  createdAt: Date
  defendingBase: 0 | 1
  kindness: number
  loyalty: number
}

export interface Avatar {
  id?: number
  characterId: number
  svgData: string
  components: AvatarComponents
  createdAt: Date
  version: number
}

export interface DevilFruit {
  id?: number
  name: string
  ownerId: number
  awakeningOn: number
  rarity: number
  type: 'Paramecia' | 'Zoan' | 'Logia'
  description: string
}

export interface StyleCombat {
  id?: number
  name: string
  attack: number
  defense: number
  speed: number
  skill: number
  intelligence: number
  armHaki: number
  obsHaki: number
}

export interface Crew {
  id?: number
  name: string
  captainId: number
  treasury: number
  reputation: number
  currentIsland: number
  docked: 0 | 1
  foundedAt: Date
  type: 'Pirate' | 'Marine' | 'BountyHunter' | 'Government'
}

export interface Territory {
  id?: number
  crewId: number
  islandId: number
}

export interface Ship {
  id?: number
  name: string
  crewId: number
  level: 1 | 2 | 3 | 4 | 5
  needRepair: boolean
  destroyed: boolean
}

export interface Yonkou {
  id?: number
  captainId: number
  baseIsland: number
  foundedAt: Date
}

export interface Shichibukai {
  id?: number
  captainId: number
  baseIsland: number
  foundedAt: Date
}

export interface MarineBase {
  id?: number
  captainId: number
  baseIsland: number
  foundedAt: Date
}

export interface Admiral {
  id?: number
  marineId: number
  baseIsland: number
  foundedAt: Date
}

export interface CypherPol {
  id?: number
  captainId: number
  reputation: number
  currentIsland: number
  foundedAt: Date
}

export interface Gorousei {
  id?: number
  govId: number
  currentIsland: number
  foundedAt: Date
}

export interface Battle {
  id?: number
  timestamp: Date
  challenger: number
  opponent: number
  winner: number
  loser: number
  experienceGained: number
  bountyGained: number
  battleLog: string[]
  challengerCrewId: number
  opponentCrewId: number
}

export interface GameState {
  id?: number
  key: string
  playerCharacterCreated?: boolean
  worldGenerated?: boolean
  lastWorldUpdate?: Date
  value: any
  updatedAt: Date
}

export interface Island {
  id?: number
  name: string
  difficulty: number
  npcs: number[]
  description: string
}

export interface Task {
  id?: number
  characterId: number
  helpType?:
    | ''
    | 'help_civilian'
    | 'rescue_mission'
    | 'delivery'
    | 'construction'
    | 'medical_aid'
    | 'liberation'
  type:
    | 'exploration'
    | 'ship_upgrade'
    | 'ship_repair'
    | 'training'
    | 'navigation'
    | 'island_liberation'
    | 'boss_fight'
  description: string
  startTime: Date
  endTime: Date
  duration: number // em minutos
  kindnessReward?: number
  experienceReward?: number
  bountyReward?: number
  targetId?: number // ID do civil ajudado (se aplicável) ou  Id do ship ou id da island
  difficulty: 'easy' | 'medium' | 'hard' | 'very hard'
  completedAt?: number
  createdAt: Date
  isCompleted: boolean
  location: string
  crewId?: number
  step?: number // Para island_liberation
  stepCompleted?: boolean // Para island_liberation
  targetIslandId?: number // Para island_liberation (redundante com targetId mas mais claro)
  targetCrewId?: number // Para island_liberation
}

export interface BossFight {
  id?: number
  playerCrewId: number
  bossType: 'Yonkou' | 'Shichibukai' | 'Admiral' | 'Gorousei'
  bossId: number
  bossCrewId: number
  currentBattleIndex: number
  totalBattles: number
  playerDefeatedMembers: number[]
  bossDefeatedMembers: number[]
  isCompleted: boolean
  playerWon: boolean
  startedAt: Date
  completedAt?: Date
  battleOrder: number[]
}

class OnePieceGameDB extends Dexie {
  characters!: Table<Character>
  devilFruits!: Table<DevilFruit>
  styleCombats!: Table<StyleCombat>
  yonkous!: Table<Yonkou>
  shichibukais!: Table<Shichibukai>
  marineBases!: Table<MarineBase>
  admirals!: Table<Admiral>
  cypherPols!: Table<CypherPol>
  crews!: Table<Crew>
  territories!: Table<Territory>
  ships!: Table<Ship>
  gorouseis!: Table<Gorousei>
  battles!: Table<Battle>
  gameState!: Table<GameState>
  islands!: Table<Island>
  tasks!: Table<Task>
  avatars!: Table<Avatar>
  bossFights!: Table<BossFight>

  constructor() {
    super('OnePieceGameDB')

    this.version(1).stores({
      characters:
        '++id, name, level, crewId, bounty, styleCombatId, devilFruitId, position, type, isPlayer',
      devilFruits: '++id, name, ownerId, number',
      styleCombats: '++id, name',
      yonkous: '++id, captainId, baseIsland',
      shichibukais: '++id, captainId, baseIsland',
      marineBases: '++id, captainId, baseIsland',
      admirals: '++id, marineId, baseIsland',
      cypherPols: '++id, captainId, currentIsland',
      gorouseis: '++id, govId, currentIsland',
      crews: '++id, name, captainId, reputation, currentIsland, docked',
      territories: '++id, crewId, islandId',
      ships: '++id, name, crewId',
      battles: '++id, timestamp, winner, challenger, opponent, challengerCrewId, opponentCrewId',
      gameState: '++id, key',
      islands: '++id, name, difficulty',
      tasks: '++id, characterId, targetId, startTime, endTime, isCompleted, type, helpType, crewId',
      avatars: '++id, characterId, createdAt',
      bossFights: '++id, playerCrewId, bossType, bossId, bossCrewId, isCompleted, startedAt',
    })

    // Hook para CREATE (add)
    this.characters.hook('creating', (primKey, obj, trans) => {
      applyConstraintsToCharacter(obj)
    })

    // Hook para UPDATE
    this.characters.hook('updating', (modifications, primKey, obj, trans) => {
      applyConstraintsToCharacter(modifications)
    })

    // Hook para CREWS
    this.crews.hook('creating', (primKey, obj, trans) => {
      const clampedData = applyConstraints('crew', obj)
      Object.assign(obj, clampedData)
    })

    this.crews.hook('updating', (modifications, primKey, obj, trans) => {
      const clampedData = applyConstraints('crew', modifications)
      Object.assign(modifications, clampedData)
    })

    // Hook para ISLANDS
    this.islands.hook('creating', (primKey, obj, trans) => {
      const clampedData = applyConstraints('island', obj)
      Object.assign(obj, clampedData)
    })

    this.islands.hook('updating', (modifications, primKey, obj, trans) => {
      const clampedData = applyConstraints('island', modifications)
      Object.assign(modifications, clampedData)
    })

    // Hook para DEVIL FRUITS
    this.devilFruits.hook('creating', (primKey, obj, trans) => {
      const clampedData = applyConstraints('devilFruit', obj)
      Object.assign(obj, clampedData)
    })

    this.devilFruits.hook('updating', (modifications, primKey, obj, trans) => {
      const clampedData = applyConstraints('devilFruit', modifications)
      Object.assign(modifications, clampedData)
    })
  }
}

// ✅ FUNÇÃO ESPECÍFICA PARA CHARACTER (mais detalhada)
function applyConstraintsToCharacter(data: Partial<Character>): void {
  if (data.kindness !== undefined) {
    data.kindness = Math.min(100, Math.max(-100, data.kindness))
  }

  if (data.loyalty !== undefined) {
    data.loyalty = Math.min(100, Math.max(-100, data.loyalty))
  }

  if (data.level !== undefined) {
    data.level = Math.min(999, Math.max(1, data.level))
  }

  if (data.experience !== undefined) {
    data.experience = Math.max(0, data.experience)
  }

  if (data.bounty !== undefined) {
    data.bounty = Math.max(0, data.bounty)
  }
  if (data.potentialToHaveKngHaki !== undefined) {
    data.potentialToHaveKngHaki = Math.min(1, Math.max(0, data.potentialToHaveKngHaki))
  }

  // Validar stats se existir
  if (data.stats) {
    const stats = data.stats
    Object.keys(stats).forEach((statKey) => {
      if (stats[statKey as keyof typeof stats] !== undefined) {
        stats[statKey as keyof typeof stats] = Math.min(
          9999,
          Math.max(0, stats[statKey as keyof typeof stats]),
        )
      }
    })
  }
}

export const db = new OnePieceGameDB()
