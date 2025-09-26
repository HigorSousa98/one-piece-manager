// src/utils/database.ts
import Dexie, { Table } from 'dexie'

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
    armHaki: number
    obsHaki: number
    kingHaki: number
    devilFruit: number
  }
  styleCombatId: number
  devilFruitId: number
  potentialToHaveKngHaki: number
  position: 'Captain' | 'First Mate' | 'Navigator' | 'Cook' | 'Sniper' | 'Doctor' | 'Archaeologist' | 'Shipwright' | 'Musician' | 'Crew Member'
  isPlayer: 0 | 1
  createdAt: Date
  defendingBase: 0 | 1
  kindness: number
  loyalty: number
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
  type: 'Pirate' | 'Marine' | 'BountyHunter'
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
  id?: number;
  characterId: number;
  helpType?: '' | 'help_civilian' | 'rescue_mission' | 'delivery' | 'construction' | 'medical_aid' | 'liberation';
  type: 'exploration'  | 'ship_upgrade' | 'ship_repair' | 'training' | 'navigation' | 'island_liberation';
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number; // em minutos
  kindnessReward?: number;
  experienceReward?: number;
  bountyReward?: number;
  targetId?: number; // ID do civil ajudado (se aplicável) ou  Id do ship ou id da island
  difficulty: 'easy' | 'medium' | 'hard';
  completedAt?: number;
  createdAt: Date;
  isCompleted: boolean;
  location: string;
  crewId?: number;
  step?: number // Para island_liberation
  stepCompleted?: boolean // Para island_liberation
  targetIslandId?: number // Para island_liberation (redundante com targetId mas mais claro)
  targetCrewId?: number // Para island_liberation
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

  constructor() {
    super('OnePieceGameDB')
    
    this.version(1).stores({
      characters: '++id, name, level, crewId, bounty, styleCombatId, devilFruitId, position, type, isPlayer',
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
      tasks: '++id, characterId, targetId, startTime, endTime, isCompleted, type, helpType, crewId' 
    })
  }
}

export const db = new OnePieceGameDB()