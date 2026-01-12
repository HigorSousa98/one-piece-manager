// src/data/weaponConcepts.ts

export interface WeaponConceptData {
  name: string
  description: string
  type: 'weapon'
  subtype: string
  class: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  rarity: number // 0-1 para armas normais, sempre 1 para armas raras
  statsInfluence: {
    attack?: number
    defense?: number
    speed?: number
    skill?: number
    intelligence?: number
  }
  requirements: {
    level: number
    characterType?: ('Pirate' | 'Marine' | 'Government' | 'BountyHunter')[]
    styleCombatId?: number[]
  }
  isStackable: boolean
  maxStack?: number
  weight?: number
  unique: boolean
  lore?: string
  isBreakable: boolean
  durability?: number
}

// ✅ ARMAS RARAS/LENDÁRIAS (SEMPRE RARITY = 1, ÚNICAS)
export const LEGENDARY_WEAPONS: WeaponConceptData[] = [
  // ===== MEITO (ESPADAS FAMOSAS) - CLASSE S =====
  {
    name: 'Mihawk\'s Yoru',
    description: 'A espada negra do maior espadachim do mundo',
    type: 'weapon',
    subtype: 'sword',
    class: 'S',
    rarity: 1,
    statsInfluence: { attack: 100, speed: 25, skill: 30 },
    requirements: { level: 80, styleCombatId: [4] },
    isStackable: false,
    weight: 4.0,
    unique: true,
    lore: 'Saijo O Wazamono. A lâmina que cortou montanhas.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Shusui',
    description: 'Espada negra lendária de Wano, outrora de Ryuma',
    type: 'weapon',
    subtype: 'sword',
    class: 'S',
    rarity: 1,
    statsInfluence: { attack: 85, defense: 15, speed: 20, skill: 25 },
    requirements: { level: 70, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 3.5,
    unique: true,
    lore: 'O Tesouro Nacional de Wano. Lâmina que bebe sangue.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Enma',
    description: 'A espada que pode cortar até o inferno',
    type: 'weapon',
    subtype: 'sword',
    class: 'S',
    rarity: 1,
    statsInfluence: { attack: 90, speed: 30, skill: 35 },
    requirements: { level: 75, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 3.2,
    unique: true,
    lore: 'O Wazamono que testa o usuário. Sede insaciável por Haki.',
    isBreakable: false,
    durability: 100
  },

  // ===== MEITO CLASSE A =====
  {
    name: 'Wado Ichimonji',
    description: 'Espada branca herdada, símbolo de uma promessa',
    type: 'weapon',
    subtype: 'sword',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 75, speed: 25, skill: 20 },
    requirements: { level: 60, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 3.0,
    unique: true,
    lore: 'O Wazamono que carrega sonhos e memórias.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Sandai Kitetsu',
    description: 'Espada amaldiçoada da família Kitetsu',
    type: 'weapon',
    subtype: 'sword',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 70, speed: 30, skill: 15 },
    requirements: { level: 55, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 2.8,
    unique: true,
    lore: 'Wazamono amaldiçoada. Traz azar... ou será sorte?',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Nidai Kitetsu',
    description: 'Segunda geração da linhagem amaldiçoada Kitetsu',
    type: 'weapon',
    subtype: 'sword',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 80, speed: 28, skill: 18 },
    requirements: { level: 65, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 3.1,
    unique: true,
    lore: 'O Wazamono que sussurra maldições antigas.',
    isBreakable: false,
    durability: 100
  },

  // ===== ARMAS ESPECIAIS DE PERSONAGENS FAMOSOS =====
  {
    name: 'Usopp\'s Kabuto',
    description: 'Estilingue especial do atirador dos Chapéus de Palha',
    type: 'weapon',
    subtype: 'slingshot',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 60, intelligence: 35, skill: 40 },
    requirements: { level: 50, styleCombatId: [9] },
    isStackable: false,
    weight: 1.5,
    unique: true,
    lore: 'Criado com amor e engenhosidade. Nunca erra o alvo importante.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Funkfreed',
    description: 'Espada que comeu a Zou Zou no Mi',
    type: 'weapon',
    subtype: 'sword',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 65, defense: 25, intelligence: 10 },
    requirements: { level: 55, characterType: ['Government'] },
    isStackable: false,
    weight: 4.5,
    unique: true,
    lore: 'Objeto que ganhou vida através de uma Akuma no Mi.',
    isBreakable: false,
    durability: 100
  },

  // ===== ARMAS CLASSE B (RARAS MAS NÃO LENDÁRIAS) =====
  {
    name: 'Kashu',
    description: 'Espada de qualidade superior, bem equilibrada',
    type: 'weapon',
    subtype: 'sword',
    class: 'B',
    rarity: 1,
    statsInfluence: { attack: 50, speed: 18, skill: 12, defense: 8 },
    requirements: { level: 40, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 2.9,
    unique: true,
    lore: 'Forjada por um mestre ferreiro de Wano.',
    isBreakable: false,
    durability: 95
  },
  {
    name: 'Yamaoroshi',
    description: 'Espada com lâmina serrilhada, corta como uma serra',
    type: 'weapon',
    subtype: 'sword',
    class: 'B',
    rarity: 1,
    statsInfluence: { attack: 55, speed: 15, skill: 15 },
    requirements: { level: 45, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 3.3,
    unique: true,
    lore: 'Sua lâmina irregular causa ferimentos devastadores.',
    isBreakable: false,
    durability: 90
  },

  // ===== ARMAS DE FOGO LENDÁRIAS =====
  {
    name: 'Ittoryu Iai: Shishi Sonson Gun',
    description: 'Pistola modificada com técnicas de espadachim',
    type: 'weapon',
    subtype: 'gun',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 70, speed: 35, skill: 25 },
    requirements: { level: 60, styleCombatId: [7, 8] },
    isStackable: false,
    weight: 2.2,
    unique: true,
    lore: 'Fusão única entre arte da espada e armas de fogo.',
    isBreakable: false,
    durability: 95
  },
  {
    name: 'Noland\'s Rifle',
    description: 'Rifle antigo do explorador Noland',
    type: 'weapon',
    subtype: 'gun',
    class: 'B',
    rarity: 1,
    statsInfluence: { attack: 45, intelligence: 20, skill: 18 },
    requirements: { level: 35, styleCombatId: [7, 8] },
    isStackable: false,
    weight: 4.2,
    unique: true,
    lore: 'Carrega a história de um sonhador que alcançou o céu.',
    isBreakable: false,
    durability: 85
  }
]

// ✅ COMBINAÇÃO DE TODAS AS ARMAS
export const ALL_WEAPONS: WeaponConceptData[] = [
  ...LEGENDARY_WEAPONS
]

export default ALL_WEAPONS