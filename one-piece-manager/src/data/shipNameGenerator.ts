// src/utils/shipNameGenerator.ts

export class ShipNameGenerator {
  private static readonly SHIP_PREFIXES = [
    // Prefixos Clássicos de Piratas
    'Black',
    'Red',
    'Golden',
    'Silver',
    'Dark',
    'White',
    'Crimson',
    'Azure',
    'Emerald',
    'Ruby',
    'Diamond',
    'Pearl',
    'Storm',
    'Thunder',
    'Lightning',
    'Shadow',
    'Ghost',
    'Phantom',
    'Demon',
    'Angel',
    'Royal',
    'Noble',
    'Wild',
    'Savage',
    'Fierce',
    'Mighty',
    'Grand',
    'Great',
    'Ancient',
    'Mystic',
    'Sacred',
    'Cursed',
    'Blessed',
    'Iron',
    'Steel',
    'Bronze',

    // Elementos da Natureza
    'Ocean',
    'Sea',
    'Wave',
    'Tide',
    'Wind',
    'Gale',
    'Tempest',
    'Hurricane',
    'Typhoon',
    'Cyclone',
    'Frost',
    'Ice',
    'Fire',
    'Flame',
    'Inferno',
    'Solar',
    'Lunar',
    'Star',
    'Comet',
    'Meteor',
    'Aurora',
    'Dawn',
    'Dusk',
    'Twilight',
    'Midnight',
    'Morning',
    'Evening',
    'Sunset',

    // Características Marítimas
    'Deep',
    'Shallow',
    'Calm',
    'Rough',
    'Smooth',
    'Sharp',
    'Swift',
    'Slow',
    'Fast',
    'Quick',
    'Silent',
    'Loud',
    'Roaring',
    'Whispering',
  ]

  private static readonly SHIP_NAMES = [
    // Tipos de Navios
    'Revenge',
    'Vengeance',
    'Justice',
    'Freedom',
    'Liberty',
    'Victory',
    'Glory',
    'Honor',
    'Pride',
    'Fury',
    'Wrath',
    'Rage',
    'Storm',
    'Thunder',
    'Lightning',
    'Hurricane',
    'Typhoon',
    'Tempest',
    'Gale',

    // Animais Marítimos
    'Kraken',
    'Leviathan',
    'Serpent',
    'Dragon',
    'Phoenix',
    'Griffin',
    'Eagle',
    'Hawk',
    'Falcon',
    'Raven',
    'Crow',
    'Shark',
    'Whale',
    'Dolphin',
    'Octopus',
    'Squid',
    'Barracuda',
    'Manta',
    'Stingray',

    // Objetos Piratas
    'Cutlass',
    'Saber',
    'Blade',
    'Sword',
    'Dagger',
    'Pistol',
    'Cannon',
    'Anchor',
    'Compass',
    'Treasure',
    'Gold',
    'Silver',
    'Jewel',
    'Crown',
    'Skull',
    'Bones',
    'Flag',
    'Sail',
    'Mast',
    'Wheel',
    'Helm',

    // Conceitos Abstratos
    'Dream',
    'Hope',
    'Destiny',
    'Fate',
    'Fortune',
    'Luck',
    'Chance',
    'Adventure',
    'Journey',
    'Quest',
    'Discovery',
    'Explorer',
    'Pioneer',
    'Wanderer',
    'Voyager',
    'Seeker',
    'Hunter',
    'Conqueror',
    'Champion',

    // Lugares Místicos
    'Paradise',
    'Haven',
    'Sanctuary',
    'Refuge',
    'Oasis',
    'Mirage',
    'Horizon',
    'Infinity',
    'Eternity',
    'Immortal',
    'Legend',
    'Myth',
    'Saga',
    'Epic',
    'Tale',
    'Story',
    'Chronicle',
    'History',
  ]

  private static readonly SHIP_SUFFIXES = [
    // Sufixos Náuticos
    'Runner',
    'Rider',
    'Sailor',
    'Navigator',
    'Captain',
    'Admiral',
    'Seeker',
    'Hunter',
    'Chaser',
    'Stalker',
    'Prowler',
    'Roamer',
    'Wanderer',
    'Drifter',
    'Voyager',
    'Explorer',
    'Pioneer',
    'Conqueror',

    // Características do Navio
    'Breaker',
    'Crusher',
    'Destroyer',
    'Slayer',
    'Killer',
    'Reaper',
    'Bringer',
    'Bearer',
    'Carrier',
    'Keeper',
    'Guardian',
    'Protector',
    'Defender',
    'Warrior',
    'Fighter',
    'Champion',
    'Hero',
    'Legend',

    // Elementos Místicos
    'Spirit',
    'Soul',
    'Heart',
    'Mind',
    'Will',
    'Power',
    'Force',
    'Energy',
    'Essence',
    'Core',
    'Source',
    'Origin',
    'Beginning',
    'End',
    'Finale',
    'Conclusion',
    'Resolution',
    'Answer',
    'Solution',
  ]

  /**
   * Gera um nome aleatório para um navio
   */
  public static generateShipName(): string {
    const usePrefix = Math.random() > 0.3 // 70% chance de usar prefixo
    const useSuffix = Math.random() > 0.4 // 60% chance de usar sufixo

    let name = ''

    // Adicionar prefixo
    if (usePrefix) {
      const prefix = this.getRandomElement(this.SHIP_PREFIXES)
      name += prefix + ' '
    }

    // Adicionar nome principal (sempre presente)
    const mainName = this.getRandomElement(this.SHIP_NAMES)
    name += mainName

    // Adicionar sufixo
    if (useSuffix) {
      const suffix = this.getRandomElement(this.SHIP_SUFFIXES)
      name += ' ' + suffix
    }

    return name
  }

  /**
   * Gera múltiplos nomes únicos de navios
   */
  public static generateUniqueShipNames(count: number): string[] {
    const names = new Set<string>()
    let attempts = 0
    const maxAttempts = count * 10 // Evitar loop infinito

    while (names.size < count && attempts < maxAttempts) {
      const name = this.generateShipName()
      names.add(name)
      attempts++
    }

    return Array.from(names)
  }

  /**
   * Gera um nome de navio baseado no tipo de tripulação
   */
  public static generateShipNameByCrewType(crewType: string): string {
    let name = this.generateShipName()

    // Adicionar toque especial baseado no tipo
    switch (crewType) {
      case 'Pirate':
        if (Math.random() > 0.7) {
          name = name.replace(/^/, 'Jolly ') // Adicionar "Jolly" às vezes
        }
        break
      case 'Marine':
        if (Math.random() > 0.6) {
          name = name.replace(/^/, 'HMS ') // His/Her Majesty\'s Ship
        }
        break
      case 'Government':
        if (Math.random() > 0.6) {
          name = name.replace(/^/, 'SS ') // State Ship
        }
        break
      case 'BountyHunter':
        if (Math.random() > 0.7) {
          name = name.replace(/^/, 'Hunter ') // Adicionar "Hunter"
        }
        break
    }

    return name
  }

  /**
   * Seleciona um elemento aleatório de um array
   */
  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  /**
   * Gera nomes de navios famosos/lendários (para casos especiais)
   */
  public static generateLegendaryShipName(): string {
    const legendaryNames = [
      'Thousand Sunny',
      'Going Merry',
      'Moby Dick',
      'Red Force',
      "Queen Anne's Revenge",
      'Flying Dutchman',
      'Black Pearl',
      'Interceptor',
      'Endeavour',
      'Silent Mary',
      'Empress',
      'Dauntless',
      'Providence',
      'Nemesis',
      'Leviathan',
      "Poseidon's Wrath",
      "Neptune's Fury",
      "Kraken's Bane",
      'Sea Devil',
      "Ocean's Edge",
      "Horizon's End",
      "Infinity's Call",
    ]

    return this.getRandomElement(legendaryNames)
  }
}
