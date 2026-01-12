// src/data/equipmentConcepts.ts

export interface EquipmentConceptData {
  name: string
  description: string
  type: 'weapon' | 'clothing' | 'helmet' | 'gloves' | 'boots'
  subtype: string
  class: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  rarity: number // 0-1
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

export const EQUIPMENT_CONCEPTS: EquipmentConceptData[] = [
  // ===== ARMAS (WEAPONS) =====
  // Classe F - Iniciante
  {
    name: 'Rusty Cutlass',
    description: 'Uma velha espada de pirata enferrujada, mas ainda funcional',
    type: 'weapon',
    subtype: 'sword',
    class: 'F',
    rarity: 0.1,
    statsInfluence: { attack: 8, speed: 2 },
    requirements: { level: 1, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 2.5,
    unique: false,
    lore: 'Encontrada em destroços de navios piratas',
    isBreakable: true,
    durability: 60
  },
  {
    name: 'Training Sword',
    description: 'Espada de madeira usada para treinamento básico',
    type: 'weapon',
    subtype: 'sword',
    class: 'F',
    rarity: 0.2,
    statsInfluence: { attack: 5, skill: 3, speed: 3 },
    requirements: { level: 1, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 1.8,
    unique: false,
    lore: 'Usada em dojos para ensinar os fundamentos',
    isBreakable: true,
    durability: 80
  },
  {
    name: 'Flintlock Pistol',
    description: 'Pistola básica de pederneira, comum entre piratas',
    type: 'weapon',
    subtype: 'gun',
    class: 'F',
    rarity: 0.2,
    statsInfluence: { attack: 10, speed: 5 },
    requirements: { level: 3, styleCombatId: [7, 8, 9] },
    isStackable: false,
    weight: 1.5,
    unique: false,
    lore: 'Arma de fogo mais comum nos mares',
    isBreakable: true,
    durability: 70
  },
  {
    name: 'Wooden Club',
    description: 'Porrete simples de madeira para combate próximo',
    type: 'weapon',
    subtype: 'club',
    class: 'F',
    rarity: 0.1,
    statsInfluence: { attack: 6, defense: 2 },
    requirements: { level: 1, styleCombatId: [1, 2, 3] },
    isStackable: false,
    weight: 2.0,
    unique: false,
    lore: 'Simples, mas eficaz',
    isBreakable: true,
    durability: 50
  },

  // Classe E
  {
    name: 'Iron Blade',
    description: 'Espada comum de ferro, confiável para combates básicos',
    type: 'weapon',
    subtype: 'sword',
    class: 'E',
    rarity: 0.3,
    statsInfluence: { attack: 12, defense: 2, speed: 4 },
    requirements: { level: 5, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 3.0,
    unique: false,
    lore: 'Forjada por ferreiros locais',
    isBreakable: true,
    durability: 75
  },
  {
    name: 'Brass Knuckles',
    description: 'Soqueiras de latão para combate próximo',
    type: 'weapon',
    subtype: 'fist',
    class: 'E',
    rarity: 0.3,
    statsInfluence: { attack: 15, speed: 6 },
    requirements: { level: 8, styleCombatId: [1, 2, 3] },
    isStackable: false,
    weight: 0.8,
    unique: false,
    lore: 'Aumenta o poder dos punhos',
    isBreakable: true,
    durability: 90
  },

  // Classe D
  {
    name: 'Steel Katana',
    description: 'Katana de aço bem forjada, popular entre espadachins',
    type: 'weapon',
    subtype: 'sword',
    class: 'D',
    rarity: 0.4,
    statsInfluence: { attack: 18, speed: 8, skill: 3 },
    requirements: { level: 15, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 2.8,
    unique: false,
    lore: 'Inspirada nas técnicas de Wano',
    isBreakable: true,
    durability: 85
  },
  {
    name: 'Combat Staff',
    description: 'Bastão de combate versátil',
    type: 'weapon',
    subtype: 'staff',
    class: 'D',
    rarity: 0.4,
    statsInfluence: { attack: 16, defense: 8, skill: 6 },
    requirements: { level: 18, styleCombatId: [1, 2] },
    isStackable: false,
    weight: 2.0,
    unique: false,
    lore: 'Equilibrio entre ataque e defesa',
    isBreakable: true,
    durability: 85
  },
  {
    name: 'Marine Rifle',
    description: 'Rifle padrão das tropas da Marinha',
    type: 'weapon',
    subtype: 'gun',
    class: 'D',
    rarity: 0.4,
    statsInfluence: { attack: 25, intelligence: 3, skill: 4 },
    requirements: { level: 20, characterType: ['Marine'], styleCombatId: [7, 8] },
    isStackable: false,
    weight: 4.0,
    unique: false,
    lore: 'Precisão e confiabilidade da Marinha',
    isBreakable: true,
    durability: 85
  },

  // Classe C
  {
    name: 'Marine Saber',
    description: 'Sabre padrão dos oficiais da Marinha',
    type: 'weapon',
    subtype: 'sword',
    class: 'C',
    rarity: 0.5,
    statsInfluence: { attack: 22, defense: 5, skill: 5 },
    requirements: { level: 25, characterType: ['Marine'], styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 3.2,
    unique: false,
    lore: 'Símbolo da autoridade marinha',
    isBreakable: true,
    durability: 90
  },
  {
    name: 'Sniper Rifle',
    description: 'Rifle de precisão para tiros de longa distância',
    type: 'weapon',
    subtype: 'gun',
    class: 'C',
    rarity: 0.6,
    statsInfluence: { attack: 35, intelligence: 8, skill: 6 },
    requirements: { level: 30, styleCombatId: [8] },
    isStackable: false,
    weight: 5.5,
    unique: false,
    lore: 'Para aqueles que nunca erram o alvo',
    isBreakable: true,
    durability: 80
  },

  // Classe B
  {
    name: 'Dial Weapon',
    description: 'Arma que utiliza a tecnologia dos Dials de Skypiea',
    type: 'weapon',
    subtype: 'special',
    class: 'B',
    rarity: 0.8,
    statsInfluence: { attack: 30, intelligence: 10, skill: 8 },
    requirements: { level: 40 },
    isStackable: false,
    weight: 2.5,
    unique: false,
    lore: 'Tecnologia avançada das ilhas do céu',
    isBreakable: true,
    durability: 95
  },

  // ===== VESTIMENTAS (CLOTHING) =====
  // Classe F - Roupas básicas
  {
    name: 'Torn Shirt',
    description: 'Camisa rasgada, oferece proteção mínima',
    type: 'clothing',
    subtype: 'shirt',
    class: 'F',
    rarity: 0.1,
    statsInfluence: { defense: 2 },
    requirements: { level: 1 },
    isStackable: false,
    weight: 0.5,
    unique: false,
    lore: 'Melhor que nada',
    isBreakable: true,
    durability: 40
  },
  {
    name: 'Civilian Clothes',
    description: 'Roupas comuns de civil',
    type: 'clothing',
    subtype: 'casual',
    class: 'F',
    rarity: 0.2,
    statsInfluence: { defense: 3, speed: 1 },
    requirements: { level: 1 },
    isStackable: false,
    weight: 1.0,
    unique: false,
    lore: 'Confortável para o dia a dia',
    isBreakable: true,
    durability: 60
  },
  {
    name: 'Pirate Vest',
    description: 'Colete típico de pirata',
    type: 'clothing',
    subtype: 'vest',
    class: 'E',
    rarity: 0.3,
    statsInfluence: { defense: 5, attack: 2, speed: 2 },
    requirements: { level: 5, characterType: ['Pirate'] },
    isStackable: false,
    weight: 1.2,
    unique: false,
    lore: 'Liberdade dos mares',
    isBreakable: true,
    durability: 70
  },
  {
    name: 'Marine Uniform',
    description: 'Uniforme padrão da Marinha',
    type: 'clothing',
    subtype: 'uniform',
    class: 'E',
    rarity: 0.3,
    statsInfluence: { defense: 6, intelligence: 3 },
    requirements: { level: 5, characterType: ['Marine'] },
    isStackable: false,
    weight: 1.5,
    unique: false,
    lore: 'Justiça absoluta',
    isBreakable: true,
    durability: 80
  },
  {
    name: 'Bounty Hunter Coat',
    description: 'Casaco resistente de caçador de recompensas',
    type: 'clothing',
    subtype: 'coat',
    class: 'D',
    rarity: 0.4,
    statsInfluence: { defense: 8, speed: 4, skill: 3 },
    requirements: { level: 15, characterType: ['BountyHunter'] },
    isStackable: false,
    weight: 2.0,
    unique: false,
    lore: 'Para quem vive da caça',
    isBreakable: true,
    durability: 85
  },
  {
    name: 'Government Agent Suit',
    description: 'Terno oficial do Governo Mundial',
    type: 'clothing',
    subtype: 'suit',
    class: 'C',
    rarity: 0.5,
    statsInfluence: { defense: 10, intelligence: 8, skill: 5 },
    requirements: { level: 25, characterType: ['Government'] },
    isStackable: false,
    weight: 1.8,
    unique: false,
    lore: 'Autoridade e poder',
    isBreakable: true,
    durability: 90
  },
  {
    name: 'Reinforced Battle Armor',
    description: 'Armadura de batalha reforçada',
    type: 'clothing',
    subtype: 'armor',
    class: 'B',
    rarity: 0.7,
    statsInfluence: { defense: 25, attack: 5 },
    requirements: { level: 35 },
    isStackable: false,
    weight: 8.0,
    unique: false,
    lore: 'Proteção máxima em combate',
    isBreakable: true,
    durability: 95
  },

  // ===== CAPACETES/ELMOS (HELMET) =====
  {
    name: 'Straw Hat',
    description: 'Chapéu de palha simples',
    type: 'helmet',
    subtype: 'hat',
    class: 'F',
    rarity: 0.1,
    statsInfluence: { speed: 1 },
    requirements: { level: 1 },
    isStackable: false,
    weight: 0.1,
    unique: false,
    lore: 'Protege do sol',
    isBreakable: true,
    durability: 30
  },
  {
    name: 'Pirate Bandana',
    description: 'Bandana típica de pirata',
    type: 'helmet',
    subtype: 'bandana',
    class: 'F',
    rarity: 0.2,
    statsInfluence: { speed: 3, attack: 1 },
    requirements: { level: 1, characterType: ['Pirate'] },
    isStackable: false,
    weight: 0.1,
    unique: false,
    lore: 'Símbolo da pirataria',
    isBreakable: true,
    durability: 50
  },
  {
    name: 'Marine Cap',
    description: 'Quepe oficial da Marinha',
    type: 'helmet',
    subtype: 'cap',
    class: 'E',
    rarity: 0.3,
    statsInfluence: { defense: 4, intelligence: 2 },
    requirements: { level: 5, characterType: ['Marine'] },
    isStackable: false,
    weight: 0.3,
    unique: false,
    lore: 'Disciplina e ordem',
    isBreakable: true,
    durability: 70
  },
  {
    name: 'Bounty Hunter Mask',
    description: 'Máscara para ocultar identidade',
    type: 'helmet',
    subtype: 'mask',
    class: 'D',
    rarity: 0.4,
    statsInfluence: { speed: 5, skill: 4, intelligence: 3 },
    requirements: { level: 15, characterType: ['BountyHunter'] },
    isStackable: false,
    weight: 0.5,
    unique: false,
    lore: 'Anonimato é poder',
    isBreakable: true,
    durability: 80
  },
  {
    name: 'Steel Helmet',
    description: 'Capacete de aço resistente',
    type: 'helmet',
    subtype: 'helmet',
    class: 'C',
    rarity: 0.5,
    statsInfluence: { defense: 12, attack: 2 },
    requirements: { level: 25 },
    isStackable: false,
    weight: 2.0,
    unique: false,
    lore: 'Proteção sólida para a cabeça',
    isBreakable: true,
    durability: 90
  },
  {
    name: 'Combat Visor',
    description: 'Visor tecnológico para combate',
    type: 'helmet',
    subtype: 'visor',
    class: 'B',
    rarity: 0.7,
    statsInfluence: { intelligence: 15, skill: 8, speed: 5 },
    requirements: { level: 35 },
    isStackable: false,
    weight: 0.8,
    unique: false,
    lore: 'Tecnologia avançada de mira',
    isBreakable: true,
    durability: 85
  },

  // ===== LUVAS/MANOPLAS (GLOVES) =====
  {
    name: 'Cloth Gloves',
    description: 'Luvas simples de pano',
    type: 'gloves',
    subtype: 'cloth',
    class: 'F',
    rarity: 0.1,
    statsInfluence: { skill: 1 },
    requirements: { level: 1 },
    isStackable: false,
    weight: 0.2,
    unique: false,
    lore: 'Proteção básica para as mãos',
    isBreakable: true,
    durability: 40
  },
  {
    name: 'Leather Gloves',
    description: 'Luvas de couro resistente',
    type: 'gloves',
    subtype: 'leather',
    class: 'E',
    rarity: 0.3,
    statsInfluence: { skill: 3, defense: 2 },
    requirements: { level: 5 },
    isStackable: false,
    weight: 0.4,
    unique: false,
    lore: 'Durabilidade e destreza',
    isBreakable: true,
    durability: 70
  },
  {
    name: 'Fighter Gloves',
    description: 'Luvas especiais para lutadores',
    type: 'gloves',
    subtype: 'combat',
    class: 'D',
    rarity: 0.4,
    statsInfluence: { attack: 6, skill: 5, speed: 3 },
    requirements: { level: 15, styleCombatId: [1, 2, 3] },
    isStackable: false,
    weight: 0.6,
    unique: false,
    lore: 'Para quem luta com as mãos',
    isBreakable: true,
    durability: 85
  },
  {
    name: 'Marksman Gloves',
    description: 'Luvas que melhoram a precisão',
    type: 'gloves',
    subtype: 'precision',
    class: 'C',
    rarity: 0.5,
    statsInfluence: { skill: 10, intelligence: 5, speed: 4 },
    requirements: { level: 25, styleCombatId: [7, 8, 9] },
    isStackable: false,
    weight: 0.3,
    unique: false,
    lore: 'Precisão milimétrica',
    isBreakable: true,
    durability: 80
  },
  {
    name: 'Power Gauntlets',
    description: 'Manoplas que amplificam força',
    type: 'gloves',
    subtype: 'gauntlets',
    class: 'B',
    rarity: 0.7,
    statsInfluence: { attack: 15, defense: 8, skill: 5 },
    requirements: { level: 35 },
    isStackable: false,
    weight: 2.5,
    unique: false,
    lore: 'Força bruta amplificada',
    isBreakable: true,
    durability: 95
  },

  // ===== BOTAS (BOOTS) =====
  {
    name: 'Old Sandals',
    description: 'Sandálias velhas e gastas',
    type: 'boots',
    subtype: 'sandals',
    class: 'F',
    rarity: 0.1,
    statsInfluence: { speed: 1 },
    requirements: { level: 1 },
    isStackable: false,
    weight: 0.3,
    unique: false,
    lore: 'Melhor que andar descalço',
    isBreakable: true,
    durability: 30
  },
  {
    name: 'Leather Boots',
    description: 'Botas de couro simples',
    type: 'boots',
    subtype: 'leather',
    class: 'E',
    rarity: 0.3,
    statsInfluence: { speed: 3, defense: 2 },
    requirements: { level: 5 },
    isStackable: false,
    weight: 1.0,
    unique: false,
    lore: 'Conforto e proteção básica',
    isBreakable: true,
    durability: 70
  },
  {
    name: 'Marine Boots',
    description: 'Botas militares da Marinha',
    type: 'boots',
    subtype: 'military',
    class: 'D',
    rarity: 0.4,
    statsInfluence: { speed: 5, defense: 4, skill: 2 },
    requirements: { level: 15, characterType: ['Marine'] },
    isStackable: false,
    weight: 1.5,
    unique: false,
    lore: 'Disciplina em cada passo',
    isBreakable: true,
    durability: 85
  },
  {
    name: 'Pirate Boots',
    description: 'Botas altas de pirata',
    type: 'boots',
    subtype: 'pirate',
    class: 'D',
    rarity: 0.4,
    statsInfluence: { speed: 6, attack: 3, skill: 2 },
    requirements: { level: 15, characterType: ['Pirate'] },
    isStackable: false,
    weight: 1.2,
    unique: false,
    lore: 'Liberdade nos mares',
    isBreakable: true,
    durability: 80
  },
  {
    name: 'Speed Boots',
    description: 'Botas especiais que aumentam velocidade',
    type: 'boots',
    subtype: 'speed',
    class: 'C',
    rarity: 0.5,
    statsInfluence: { speed: 12, skill: 4 },
    requirements: { level: 25 },
    isStackable: false,
    weight: 0.8,
    unique: false,
    lore: 'Velocidade é vida',
    isBreakable: true,
    durability: 75
  },
  {
    name: 'Combat Boots',
    description: 'Botas pesadas para combate intenso',
    type: 'boots',
    subtype: 'combat',
    class: 'B',
    rarity: 0.7,
    statsInfluence: { attack: 8, defense: 10, speed: 8 },
    requirements: { level: 35 },
    isStackable: false,
    weight: 2.0,
    unique: false,
    lore: 'Para guerreiros verdadeiros',
    isBreakable: true,
    durability: 95
  }
]

export default EQUIPMENT_CONCEPTS