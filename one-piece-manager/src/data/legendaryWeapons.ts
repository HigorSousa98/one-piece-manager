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
  },

  // ===== MEITO SUPREMO — CLASSE S (Saijo O Wazamono) =====
  {
    name: 'Murakumogiri',
    description: 'A bisento colossal de Edward Newgate, o Homem Mais Forte do Mundo',
    type: 'weapon',
    subtype: 'bisento',
    class: 'S',
    rarity: 1,
    statsInfluence: { attack: 95, defense: 20, speed: 10, skill: 25 },
    requirements: { level: 85 },
    isStackable: false,
    weight: 9.0,
    unique: true,
    lore: 'Saijo O Wazamono. Ao golpear o chão, eras acabam.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Ace — A Espada do Rei Pirata',
    description: 'A cutlass lendária de Gol D. Roger, o único homem a conquistar o Grand Line',
    type: 'weapon',
    subtype: 'sword',
    class: 'S',
    rarity: 1,
    statsInfluence: { attack: 90, speed: 35, skill: 40, intelligence: 15 },
    requirements: { level: 90, characterType: ['Pirate'] },
    isStackable: false,
    weight: 3.8,
    unique: true,
    lore: 'Saijo O Wazamono. Empunhada pelo homem que fez o mundo tremer.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Gryphon',
    description: 'A temível espada de Shanks, o Cabelos Vermelhos, que faz os mares silenciarem',
    type: 'weapon',
    subtype: 'sword',
    class: 'S',
    rarity: 1,
    statsInfluence: { attack: 88, speed: 30, skill: 35 },
    requirements: { level: 85, characterType: ['Pirate'] },
    isStackable: false,
    weight: 3.6,
    unique: true,
    lore: 'Saijo O Wazamono. Seu simples sacar detém guerras.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Kikoku',
    description: 'A nodachi sobrenatural de Trafalgar Law, infundida com o Ope Ope no Mi',
    type: 'weapon',
    subtype: 'nodachi',
    class: 'S',
    rarity: 1,
    statsInfluence: { attack: 85, speed: 20, skill: 30, intelligence: 30 },
    requirements: { level: 75, characterType: ['Pirate'] },
    isStackable: false,
    weight: 4.5,
    unique: true,
    lore: 'Saijo O Wazamono. ROOM — a dimensão onde tudo é cortável.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Shodai Kitetsu',
    description: 'A primeira e mais poderosa da linhagem amaldiçoada Kitetsu',
    type: 'weapon',
    subtype: 'sword',
    class: 'S',
    rarity: 1,
    statsInfluence: { attack: 92, defense: 10, speed: 25, skill: 30 },
    requirements: { level: 80, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 3.4,
    unique: true,
    lore: 'Saijo O Wazamono. A maldição mais profunda entre os três Kitetsu.',
    isBreakable: false,
    durability: 100
  },

  // ===== ESPADAS LENDÁRIAS — CLASSE A (O Wazamono) =====
  {
    name: 'Durandal',
    description: 'A elegante espada do Príncipe Pirata Cavendish, famosa por sua beleza letal',
    type: 'weapon',
    subtype: 'sword',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 75, speed: 30, skill: 25 },
    requirements: { level: 60, styleCombatId: [4, 5, 6] },
    isStackable: false,
    weight: 2.7,
    unique: true,
    lore: 'O Wazamono. Tão bela quanto mortal — igual ao seu dono.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Napoleon',
    description: 'A espada-chapéu homie de Charlotte Linlin, Big Mom, imbuída de alma',
    type: 'weapon',
    subtype: 'sword',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 72, intelligence: 30, skill: 20 },
    requirements: { level: 65, characterType: ['Pirate'] },
    isStackable: false,
    weight: 2.0,
    unique: true,
    lore: 'Homie vivo que dá voz ao poder de Big Mom.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Fujitora\'s Gravity Blade',
    description: 'A espada-bengala do Almirante Issho, canal da gravidade absoluta',
    type: 'weapon',
    subtype: 'sword',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 78, defense: 20, intelligence: 25 },
    requirements: { level: 70, characterType: ['Marine', 'Government'] },
    isStackable: false,
    weight: 3.0,
    unique: true,
    lore: 'Cada golpe carrega o peso de meteoros caindo do céu.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Raiu',
    description: 'A espada de execução de Shiryu, outrora chefe de guarda do Impel Down',
    type: 'weapon',
    subtype: 'sword',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 80, speed: 25, skill: 20 },
    requirements: { level: 70, characterType: ['Pirate', 'BountyHunter'] },
    isStackable: false,
    weight: 3.3,
    unique: true,
    lore: 'Afiada pela morte de inúmeros prisioneiros. Sente o cheiro de sangue.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Lâmina de Rayleigh',
    description: 'A espada do Primeiro-Imediato do Rei Pirata, Silvers Rayleigh',
    type: 'weapon',
    subtype: 'sword',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 76, speed: 28, skill: 32, intelligence: 12 },
    requirements: { level: 72, characterType: ['Pirate'] },
    isStackable: false,
    weight: 3.1,
    unique: true,
    lore: 'Usada pelo Rei das Sombras. Cada risco conta uma batalha esquecida.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Machado de Guerra de X Drake',
    description: 'O machado colossal do Supernova X Drake, fundido com sua força dino',
    type: 'weapon',
    subtype: 'axe',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 78, defense: 25 },
    requirements: { level: 65, characterType: ['Pirate', 'Marine'] },
    isStackable: false,
    weight: 7.0,
    unique: true,
    lore: 'Cada golpe deixa crateras no chão.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Lâmina Drenante de Smoothie',
    description: 'A katana de Charlotte Smoothie que suga a essência dos oponentes',
    type: 'weapon',
    subtype: 'sword',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 73, defense: 15, speed: 22 },
    requirements: { level: 65, characterType: ['Pirate'] },
    isStackable: false,
    weight: 2.8,
    unique: true,
    lore: 'Espreme a força do inimigo como se espreme uma fruta.',
    isBreakable: false,
    durability: 100
  },
  {
    name: 'Espingarda Bayoneta de Beckman',
    description: 'A arma polivalente do Primeiro-Imediato de Shanks, Benn Beckman',
    type: 'weapon',
    subtype: 'gun',
    class: 'A',
    rarity: 1,
    statsInfluence: { attack: 68, speed: 25, intelligence: 30 },
    requirements: { level: 60, styleCombatId: [7, 8] },
    isStackable: false,
    weight: 5.5,
    unique: true,
    lore: 'QI em combate mais alto da tripulação de Shanks.',
    isBreakable: false,
    durability: 100
  },

  // ===== ARMAS RARAS — CLASSE B (Wazamono) =====
  {
    name: 'Par de Flintlocks de Izo',
    description: 'As elegantes pistolas gêmeas do comandante de divisão dos Whitebeard Pirates',
    type: 'weapon',
    subtype: 'gun',
    class: 'B',
    rarity: 1,
    statsInfluence: { attack: 55, speed: 25, skill: 20 },
    requirements: { level: 45, styleCombatId: [7, 8] },
    isStackable: false,
    weight: 1.8,
    unique: true,
    lore: 'Dois tiros simultâneos que nenhum inimigo consegue esquivar.',
    isBreakable: false,
    durability: 90
  },
  {
    name: 'Fleur de Lis — Espadas de Vista',
    description: 'O par de espadas do comandante de divisão Vista, o mestre em espadas floridas',
    type: 'weapon',
    subtype: 'sword',
    class: 'B',
    rarity: 1,
    statsInfluence: { attack: 55, defense: 10, speed: 20, skill: 25 },
    requirements: { level: 50, styleCombatId: [5, 6] },
    isStackable: false,
    weight: 2.4,
    unique: true,
    lore: 'Até Mihawk reconheceu o talento por trás dessas lâminas.',
    isBreakable: false,
    durability: 90
  },
  {
    name: 'Lança de Seastone da Marinha',
    description: 'Lança militar impregnada de Kairoseki para neutralizar Akuma no Mi',
    type: 'weapon',
    subtype: 'spear',
    class: 'B',
    rarity: 1,
    statsInfluence: { attack: 50, defense: 20, intelligence: 15 },
    requirements: { level: 40, characterType: ['Marine', 'Government'] },
    isStackable: false,
    weight: 4.0,
    unique: true,
    lore: 'A pedra que suprime o poder das Akuma no Mi. Arma secreta da Marinha.',
    isBreakable: false,
    durability: 90
  },
  {
    name: 'Seis Espadas de Hachi',
    description: 'O conjunto de seis espadas do espadachim de octópode Hachi',
    type: 'weapon',
    subtype: 'sword',
    class: 'B',
    rarity: 1,
    statsInfluence: { attack: 52, speed: 30, skill: 18 },
    requirements: { level: 42, styleCombatId: [5, 6] },
    isStackable: false,
    weight: 3.0,
    unique: true,
    lore: 'Seis lâminas, oito braços — uma dança de aço impossível de acompanhar.',
    isBreakable: false,
    durability: 85
  },
  {
    name: 'Maça de Ferro de Alvida',
    description: 'A maça pesada de Lady Alvida, a pirata mais elegante dos mares',
    type: 'weapon',
    subtype: 'club',
    class: 'B',
    rarity: 1,
    statsInfluence: { attack: 58, defense: 15 },
    requirements: { level: 38, characterType: ['Pirate'] },
    isStackable: false,
    weight: 8.0,
    unique: true,
    lore: 'Tan pesada que o chão racha. Tan elegante quanto sua dona.',
    isBreakable: false,
    durability: 95
  },
  {
    name: 'Garras de Fênix de Marco',
    description: 'Garras incandescentes canalizando a chama regenerativa de Marco',
    type: 'weapon',
    subtype: 'claw',
    class: 'B',
    rarity: 1,
    statsInfluence: { attack: 50, defense: 20, speed: 25 },
    requirements: { level: 52, characterType: ['Pirate'] },
    isStackable: false,
    weight: 1.2,
    unique: true,
    lore: 'Chamas azuis que curam quem as usa e destroem quem as recebe.',
    isBreakable: false,
    durability: 100
  }
]

// ✅ COMBINAÇÃO DE TODAS AS ARMAS
export const ALL_WEAPONS: WeaponConceptData[] = [
  ...LEGENDARY_WEAPONS
]

export default ALL_WEAPONS