// src/data/crewNames.ts

export interface CrewNameData {
  pirateCrewPrefixes: string[];
  pirateCrewSuffixes: string[];
  pirateCrewAdjectives: string[];
  pirateCrewNouns: string[];
  
  marineBasePrefixes: string[];
  marineBaseSuffixes: string[];
  marineBaseTypes: string[];
  marineBaseLocations: string[];
  
  bountyHunterOrgPrefixes: string[];
  bountyHunterOrgSuffixes: string[];
  bountyHunterOrgTypes: string[];
  bountyHunterOrgAdjectives: string[];
}

export const CREW_NAMES: CrewNameData = {
  
  // ================================
  // 🏴‍☠️ NOMES DE CREWS PIRATAS
  // ================================
  
  pirateCrewPrefixes: [
    // Clássicos do One Piece
    'Straw Hat', 'Red Hair', 'Whitebeard', 'Big Mom', 'Beast', 'Blackbeard', 'Heart', 'Kid', 'Hawkins', 'Bonney', 'Fallen Monk',
    
    // Cores
    'Crimson', 'Azure', 'Golden', 'Silver', 'Emerald', 'Ruby', 'Sapphire', 'Onyx', 'Pearl', 'Diamond', 'Obsidian', 'Amber',
    'Scarlet', 'Violet', 'Indigo', 'Turquoise', 'Coral', 'Ivory', 'Ebony', 'Bronze', 'Platinum', 'Copper',
    
    // Elementos
    'Fire', 'Ice', 'Lightning', 'Thunder', 'Storm', 'Wind', 'Earth', 'Water', 'Shadow', 'Light', 'Dark', 'Void',
    'Flame', 'Frost', 'Blaze', 'Tempest', 'Gale', 'Tsunami', 'Earthquake', 'Volcano', 'Hurricane', 'Cyclone',
    
    // Animais Marinhos
    'Kraken', 'Leviathan', 'Shark', 'Whale', 'Octopus', 'Seahorse', 'Dolphin', 'Swordfish', 'Barracuda', 'Manta Ray',
    'Sea Dragon', 'Sea Serpent', 'Sea Wolf', 'Sea Tiger', 'Sea Eagle', 'Sea Lion', 'Sea Bear', 'Sea Hawk',
    
    // Mitológicos
    'Phoenix', 'Dragon', 'Griffin', 'Hydra', 'Chimera', 'Sphinx', 'Pegasus', 'Unicorn', 'Basilisk', 'Wyvern',
    'Cerberus', 'Minotaur', 'Banshee', 'Valkyrie', 'Titan', 'Cyclops', 'Medusa', 'Siren',
    
    // Celestiais
    'Star', 'Moon', 'Sun', 'Comet', 'Meteor', 'Galaxy', 'Nebula', 'Constellation', 'Eclipse', 'Aurora',
    'Celestial', 'Cosmic', 'Astral', 'Stellar', 'Lunar', 'Solar', 'Orbital', 'Galactic',
    
    // Características
    'Wild', 'Savage', 'Fierce', 'Brutal', 'Ruthless', 'Merciless', 'Bloodthirsty', 'Vengeful', 'Fearless', 'Reckless',
    'Mad', 'Crazy', 'Insane', 'Chaotic', 'Rebellious', 'Defiant', 'Untamed', 'Free', 'Wandering', 'Roaming'
  ],

  pirateCrewSuffixes: [
    // Clássicos
    'Pirates', 'Crew', 'Gang', 'Band', 'Fleet', 'Armada', 'Squadron', 'Company', 'Brotherhood', 'Alliance',
    
    // Marítimos
    'Sailors', 'Buccaneers', 'Corsairs', 'Privateers', 'Marauders', 'Raiders', 'Plunderers', 'Seafarers', 'Voyagers',
    
    // Grupos
    'Legion', 'Horde', 'Pack', 'Clan', 'Tribe', 'Family', 'Order', 'Society', 'Union', 'Coalition',
    
    // Militares
    'Forces', 'Army', 'Navy', 'Guard', 'Regiment', 'Battalion', 'Division', 'Corps', 'Unit', 'Platoon'
  ],

  pirateCrewAdjectives: [
    'Legendary', 'Infamous', 'Notorious', 'Fearsome', 'Dreaded', 'Mighty', 'Powerful', 'Elite', 'Supreme', 'Ultimate',
    'Ancient', 'Eternal', 'Immortal', 'Divine', 'Cursed', 'Blessed', 'Sacred', 'Forbidden', 'Lost', 'Hidden',
    'Raging', 'Burning', 'Frozen', 'Stormy', 'Thunderous', 'Blazing', 'Roaring', 'Howling', 'Screaming', 'Whispering'
  ],

  pirateCrewNouns: [
    'Treasure', 'Gold', 'Jewel', 'Crown', 'Throne', 'Kingdom', 'Empire', 'Realm', 'Domain', 'Territory',
    'Dream', 'Hope', 'Destiny', 'Fate', 'Glory', 'Honor', 'Pride', 'Freedom', 'Adventure', 'Journey',
    'Blade', 'Sword', 'Cannon', 'Ship', 'Vessel', 'Anchor', 'Compass', 'Map', 'Flag', 'Skull'
  ],

  // ================================
  // ⚓ NOMES DE BASES MARINES
  // ================================
  
  marineBasePrefixes: [
    // Localizações Geográficas
    'North', 'South', 'East', 'West', 'Central', 'Grand Line', 'New World', 'Paradise', 'Calm Belt', 'Red Line',
    
    // Características Geográficas
    'Island', 'Port', 'Harbor', 'Bay', 'Cape', 'Point', 'Rock', 'Reef', 'Atoll', 'Archipelago',
    'Mountain', 'Valley', 'Desert', 'Forest', 'Jungle', 'Tundra', 'Glacier', 'Volcano', 'Canyon', 'Plateau',
    
    // Virtudes Marines
    'Justice', 'Honor', 'Duty', 'Valor', 'Courage', 'Loyalty', 'Discipline', 'Order', 'Peace', 'Victory',
    'Guardian', 'Defender', 'Protector', 'Sentinel', 'Watcher', 'Shield', 'Bastion', 'Fortress', 'Citadel',
    
    // Elementos Navais
    'Admiral', 'Fleet', 'Naval', 'Maritime', 'Oceanic', 'Seaward', 'Coastal', 'Tidal', 'Deep Sea', 'Blue Water'
  ],

  marineBaseSuffixes: [
    'Base', 'Station', 'Outpost', 'Fort', 'Fortress', 'Citadel', 'Stronghold', 'Garrison', 'Compound', 'Installation',
    'Headquarters', 'Command', 'Center', 'Hub', 'Point', 'Post', 'Camp', 'Barracks', 'Academy', 'Training Ground'
  ],

  marineBaseTypes: [
    // Tipos de Instalação
    'Marine Base', 'Naval Station', 'Fleet Command', 'Training Academy', 'Justice Tower', 'Security Outpost',
    'Intelligence Center', 'Communications Hub', 'Supply Depot', 'Repair Facility', 'Medical Center',
    
    // Especializações
    'Anti-Pirate Division', 'Special Forces Base', 'Elite Training Facility', 'Advanced Weapons Testing',
    'Devil Fruit Research', 'Seastone Processing', 'Cipher Pol Liaison', 'World Government Outpost'
  ],

  marineBaseLocations: [
    // Locais Famosos
    'Marineford', 'Enies Lobby', 'Impel Down', 'Mary Geoise', 'Sabaody', 'Water 7', 'Alabasta', 'Drum Island',
    
    // Tipos de Ilha
    'Spring Island', 'Summer Island', 'Autumn Island', 'Winter Island', 'Desert Island', 'Tropical Island',
    'Volcanic Island', 'Ice Island', 'Forest Island', 'Mountain Island', 'Sky Island', 'Underwater Base'
  ],

  // ================================
  // 💰 NOMES DE ORGANIZAÇÕES BOUNTY HUNTER
  // ================================
  
  bountyHunterOrgPrefixes: [
    // Características
    'Elite', 'Professional', 'Expert', 'Master', 'Legendary', 'Notorious', 'Feared', 'Respected', 'Skilled', 'Veteran',
    
    // Animais de Caça
    'Wolf', 'Hawk', 'Eagle', 'Falcon', 'Tiger', 'Panther', 'Lion', 'Bear', 'Shark', 'Viper',
    'Hound', 'Raven', 'Crow', 'Vulture', 'Scorpion', 'Spider', 'Mantis', 'Jaguar', 'Lynx', 'Cheetah',
    
    // Armas/Ferramentas
    'Blade', 'Arrow', 'Bullet', 'Chain', 'Net', 'Trap', 'Snare', 'Cage', 'Lock', 'Key',
    'Rifle', 'Pistol', 'Crossbow', 'Dagger', 'Sword', 'Spear', 'Lance', 'Harpoon', 'Whip', 'Rope',
    
    // Conceitos de Caça
    'Silent', 'Swift', 'Precise', 'Deadly', 'Ruthless', 'Relentless', 'Persistent', 'Patient', 'Cunning', 'Clever',
    'Shadow', 'Ghost', 'Phantom', 'Specter', 'Wraith', 'Spirit', 'Soul', 'Death', 'Doom', 'Fate',
    
    // Elementos
    'Iron', 'Steel', 'Silver', 'Gold', 'Platinum', 'Titanium', 'Chrome', 'Copper', 'Bronze', 'Brass'
  ],

  bountyHunterOrgSuffixes: [
    'Hunters', 'Trackers', 'Stalkers', 'Seekers', 'Finders', 'Catchers', 'Captors', 'Collectors', 'Retrievers',
    'Guild', 'Society', 'Organization', 'Association', 'Union', 'Alliance', 'Coalition', 'Syndicate', 'Consortium',
    'Company', 'Corporation', 'Enterprise', 'Agency', 'Bureau', 'Office', 'Service', 'Operations', 'Solutions',
    'Brotherhood', 'Order', 'Circle', 'Ring', 'Network', 'Web', 'Chain', 'Link', 'Bond', 'Pact'
  ],

  bountyHunterOrgTypes: [
    'Bounty Hunter Guild', 'Mercenary Company', 'Tracking Agency', 'Capture Specialists', 'Fugitive Retrieval',
    'Professional Hunters', 'Elite Trackers', 'Bounty Collectors', 'Reward Seekers', 'Prize Hunters',
    'Manhunter Organization', 'Pursuit Specialists', 'Apprehension Experts', 'Recovery Services'
  ],

  bountyHunterOrgAdjectives: [
    'Independent', 'Freelance', 'Professional', 'Licensed', 'Certified', 'Authorized', 'Official', 'Registered',
    'Elite', 'Premium', 'Exclusive', 'Select', 'Specialized', 'Expert', 'Advanced', 'Superior', 'Prime',
    'Discreet', 'Confidential', 'Private', 'Covert', 'Undercover', 'Secret', 'Hidden', 'Shadow'
  ]
};

// ================================
// 🎯 FUNÇÕES GERADORAS
// ================================

export class CrewNameGenerator {
  
  // 🏴‍☠️ GERAR NOME DE CREW PIRATA
  static generatePirateCrewName(): string {
    const patterns = [
      // Padrão 1: [Prefix] [Suffix]
      () => {
        const prefix = this.getRandomElement(CREW_NAMES.pirateCrewPrefixes);
        const suffix = this.getRandomElement(CREW_NAMES.pirateCrewSuffixes);
        return `${prefix} ${suffix}`;
      },
      
      // Padrão 2: [Adjective] [Prefix] [Suffix]
      () => {
        const adjective = this.getRandomElement(CREW_NAMES.pirateCrewAdjectives);
        const prefix = this.getRandomElement(CREW_NAMES.pirateCrewPrefixes);
        const suffix = this.getRandomElement(CREW_NAMES.pirateCrewSuffixes);
        return `${adjective} ${prefix} ${suffix}`;
      },
      
      // Padrão 3: [Prefix] [Noun] [Suffix]
      () => {
        const prefix = this.getRandomElement(CREW_NAMES.pirateCrewPrefixes);
        const noun = this.getRandomElement(CREW_NAMES.pirateCrewNouns);
        const suffix = this.getRandomElement(CREW_NAMES.pirateCrewSuffixes);
        return `${prefix} ${noun} ${suffix}`;
      },
      
      // Padrão 4: [Prefix] of [Noun]
      () => {
        const prefix = this.getRandomElement(CREW_NAMES.pirateCrewPrefixes);
        const noun = this.getRandomElement(CREW_NAMES.pirateCrewNouns);
        return `${prefix} of ${noun}`;
      },
      
      // Padrão 5: The [Adjective] [Prefix]
      () => {
        const adjective = this.getRandomElement(CREW_NAMES.pirateCrewAdjectives);
        const prefix = this.getRandomElement(CREW_NAMES.pirateCrewPrefixes);
        return `The ${adjective} ${prefix}`;
      }
    ];
    
    const selectedPattern = this.getRandomElement(patterns);
    return selectedPattern();
  }
  
  // ⚓ GERAR NOME DE BASE MARINE
  static generateMarineBaseName(): string {
    const patterns = [
      // Padrão 1: [Prefix] [Suffix]
      () => {
        const prefix = this.getRandomElement(CREW_NAMES.marineBasePrefixes);
        const suffix = this.getRandomElement(CREW_NAMES.marineBaseSuffixes);
        return `${prefix} ${suffix}`;
      },
      
      // Padrão 2: [Location] [Type]
      () => {
        const location = this.getRandomElement(CREW_NAMES.marineBaseLocations);
        const type = this.getRandomElement(CREW_NAMES.marineBaseTypes);
        return `${location} ${type}`;
      },
      
      // Padrão 3: [Prefix] [Location] [Suffix]
      () => {
        const prefix = this.getRandomElement(CREW_NAMES.marineBasePrefixes);
        const location = this.getRandomElement(CREW_NAMES.marineBaseLocations);
        const suffix = this.getRandomElement(CREW_NAMES.marineBaseSuffixes);
        return `${prefix} ${location} ${suffix}`;
      },
      
      // Padrão 4: Marine [Prefix] [Suffix]
      () => {
        const prefix = this.getRandomElement(CREW_NAMES.marineBasePrefixes);
        const suffix = this.getRandomElement(CREW_NAMES.marineBaseSuffixes);
        return `Marine ${prefix} ${suffix}`;
      },
      
      // Padrão 5: [Type] G-[Number]
      () => {
        const type = this.getRandomElement(['Base', 'Station', 'Outpost', 'Fort']);
        const number = Math.floor(Math.random() * 999) + 1;
        return `${type} G-${number}`;
      }
    ];
    
    const selectedPattern = this.getRandomElement(patterns);
    return selectedPattern();
  }
  
  // 💰 GERAR NOME DE ORGANIZAÇÃO BOUNTY HUNTER
  static generateBountyHunterOrgName(): string {
    const patterns = [
      // Padrão 1: [Prefix] [Suffix]
      () => {
        const prefix = this.getRandomElement(CREW_NAMES.bountyHunterOrgPrefixes);
        const suffix = this.getRandomElement(CREW_NAMES.bountyHunterOrgSuffixes);
        return `${prefix} ${suffix}`;
      },
      
      // Padrão 2: [Adjective] [Type]
      () => {
        const adjective = this.getRandomElement(CREW_NAMES.bountyHunterOrgAdjectives);
        const type = this.getRandomElement(CREW_NAMES.bountyHunterOrgTypes);
        return `${adjective} ${type}`;
      },
      
      // Padrão 3: [Adjective] [Prefix] [Suffix]
      () => {
        const adjective = this.getRandomElement(CREW_NAMES.bountyHunterOrgAdjectives);
        const prefix = this.getRandomElement(CREW_NAMES.bountyHunterOrgPrefixes);
        const suffix = this.getRandomElement(CREW_NAMES.bountyHunterOrgSuffixes);
        return `${adjective} ${prefix} ${suffix}`;
      },
      
      // Padrão 4: The [Prefix] [Suffix]
      () => {
        const prefix = this.getRandomElement(CREW_NAMES.bountyHunterOrgPrefixes);
        const suffix = this.getRandomElement(CREW_NAMES.bountyHunterOrgSuffixes);
        return `The ${prefix} ${suffix}`;
      },
      
      // Padrão 5: [Prefix] & [Prefix] [Suffix]
      () => {
        const prefix1 = this.getRandomElement(CREW_NAMES.bountyHunterOrgPrefixes);
        const prefix2 = this.getRandomElement(CREW_NAMES.bountyHunterOrgPrefixes);
        const suffix = this.getRandomElement(CREW_NAMES.bountyHunterOrgSuffixes);
        return `${prefix1} & ${prefix2} ${suffix}`;
      }
    ];
    
    const selectedPattern = this.getRandomElement(patterns);
    return selectedPattern();
  }
  
  // 🎲 GERAR NOME BASEADO NO TIPO
  static generateCrewName(type: 'Pirate' | 'Marine' | 'BountyHunter' | 'Government'): string {
    switch (type) {
      case 'Pirate':
        return this.generatePirateCrewName();
      case 'Marine':
        return this.generateMarineBaseName();
      case 'BountyHunter':
        return this.generateBountyHunterOrgName();
      case 'Government':
        return this.generateBountyHunterOrgName(); // Usar mesmo padrão
      default:
        return this.generatePirateCrewName();
    }
  }
  
  // 🎯 ELEMENTO ALEATÓRIO
  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // 📊 ESTATÍSTICAS
  static getStatistics(): {
    pirateCrewCombinations: number;
    marineBaseCombinations: number;
    bountyHunterOrgCombinations: number;
    totalCombinations: number;
  } {
    const pirateCrewCombinations = 
      CREW_NAMES.pirateCrewPrefixes.length * CREW_NAMES.pirateCrewSuffixes.length * 5; // 5 padrões
    
    const marineBaseCombinations = 
      CREW_NAMES.marineBasePrefixes.length * CREW_NAMES.marineBaseSuffixes.length * 5; // 5 padrões
    
    const bountyHunterOrgCombinations = 
      CREW_NAMES.bountyHunterOrgPrefixes.length * CREW_NAMES.bountyHunterOrgSuffixes.length * 5; // 5 padrões
    
    return {
      pirateCrewCombinations,
      marineBaseCombinations,
      bountyHunterOrgCombinations,
      totalCombinations: pirateCrewCombinations + marineBaseCombinations + bountyHunterOrgCombinations
    };
  }
}

export default CREW_NAMES;