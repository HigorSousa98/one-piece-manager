// src/data/characterNames.ts

export interface NameData {
  firstNames: string[];
  lastNames: string[];
  pirateEpithets: string[];
  marineRanks: string[];
  governmentTitles: string[];
  bountyHunterTitles: string[];
  civilianProfessions: string[];
}

export const CHARACTER_NAMES: NameData = {
  
  // ================================
  // 🏴‍☠️ PRIMEIROS NOMES / SOBRENOMES
  // ================================
  firstNames: [
    // Protagonistas e Aliados
    'Monkey D.', 'Roronoa', 'Portgas D.', 'Trafalgar D.', 'Eustass', 'Basil', 'Scratchmen', 'Jewelry', 'Capone', 'Urouge', 'Killer', 'X', 'Vinsmoke',
    
    // Piratas Famosos
    'Edward', 'Charlotte', 'Kaido', 'Shanks', 'Buggy', 'Dracule', 'Bartholomew', 'Boa', 'Jinbe', 'Marshall D.', 'Crocodile', 'Donquixote', 'Gecko',
    
    // Marines
    'Sengoku', 'Monkey D.', 'Sakazuki', 'Borsalino', 'Kuzan', 'Issho', 'Aramaki', 'Smoker', 'Tashigi', 'Hina', 'Koby', 'Helmeppo',
    
    // Governo Mundial
    'Cipher Pol', 'Rob', 'Spandam', 'Spandine', 'Kaku', 'Kalifa', 'Blueno', 'Jabra', 'Kumadori', 'Fukurou',
    
    // Nomes Japoneses Tradicionais
    'Kozuki', 'Kurozumi', 'Shimotsuki', 'Amatsuki', 'Uzuki', 'Fugetsu', 'Daimyo', 'Yakuza', 'Samurai', 'Ninja',
    
    // Nomes Únicos de One Piece
    'Gol D.', 'Rocks D.', 'Jaguar D.', 'Portgas D.', 'Monkey D.', 'Trafalgar D.', 'Marshall D.', 'Hagwar D.',
    
    // Nomes de Diferentes Culturas
    'Don', 'Sir', 'Captain', 'Admiral', 'Commodore', 'Vice Admiral', 'Rear Admiral', 'Doctor', 'Professor',
    
    // Nomes Exóticos
    'Emporio', 'Bartholomew', 'Dracule', 'Perona', 'Absalom', 'Hogback', 'Ryuma', 'Brook', 'Laboon',
    
    // Nomes de Fishman
    'Fisher', 'Arlong', 'Kuroobi', 'Chew', 'Hatchan', 'Macro', 'Gyaro', 'Tansui', 'Namur',
    
    // Nomes de Sky Island
    'Gan', 'Wyper', 'Braham', 'Genbo', 'Laki', 'Aisa', 'Pagaya', 'Conis', 'McKinley',
    
    // Nomes de Mink
    'Pedro', 'Carrot', 'Wanda', 'Sicilian', 'Concelot', 'Giovanni', 'Yomo', 'Milky', 'Bariete',
    
    // Nomes de Gigantes
    'Dorry', 'Brogy', 'Oimo', 'Kashii', 'Hajrudin', 'Gerth', 'Road', 'Goldberg', 'Stansen',
    
    // Nomes Diversos
    'Bentham', 'Ivankov', 'Inazuma', 'Lightning', 'Newkama', 'Revolutionary', 'Dragon', 'Sabo', 'Koala'
  ],

  // ================================
  // 🎯 ÚLTIMOS NOMES / APELIDOS
  // ================================
  lastNames: [
    // Protagonistas
    'Luffy', 'Zoro', 'Nami', 'Usopp', 'Sanji', 'Chopper', 'Robin', 'Franky', 'Brook', 'Jinbe',
    
    // Piratas Lendários
    'Newgate', 'Roger', 'Rayleigh', 'Scopper', 'Crocus', 'Shanks', 'Buggy', 'Mihawk', 'Crocodile',
    
    // Supernovas
    'Law', 'Kid', 'Killer', 'Hawkins', 'Apoo', 'Bonney', 'Bege', 'Drake', 'Urouge',
    
    // Yonkou e Comandantes
    'Kaido', 'Linlin', 'Teach', 'Marco', 'Ace', 'Vista', 'Jozu', 'Thatch', 'Izo', 'Blamenco',
    
    // Big Mom Pirates
    'Katakuri', 'Smoothie', 'Cracker', 'Perospero', 'Compote', 'Daifuku', 'Oven', 'Galette', 'Opera',
    
    // Beast Pirates
    'King', 'Queen', 'Jack', 'Ulti', 'Page One', 'Who\'s Who', 'Black Maria', 'Sasaki',
    
    // Marines
    'Garp', 'Sengoku', 'Akainu', 'Kizaru', 'Aokiji', 'Fujitora', 'Ryokugyu', 'Tsuru', 'Momonga',
    
    // Shichibukai
    'Kuma', 'Hancock', 'Moria', 'Doflamingo', 'Weevil', 'Law', 'Buggy',
    
    // Revolucionários
    'Dragon', 'Sabo', 'Ivankov', 'Kuma', 'Inazuma', 'Koala', 'Hack', 'Karasu', 'Morley',
    
    // Cipher Pol
    'Lucci', 'Kaku', 'Kalifa', 'Blueno', 'Jabra', 'Kumadori', 'Fukurou', 'Spandam', 'Spandine',
    
    // Wano
    'Oden', 'Toki', 'Momonosuke', 'Hiyori', 'Orochi', 'Kanjuro', 'Raizo', 'Kinemon', 'Denjiro',
    
    // Diversos
    'Vivi', 'Cobra', 'Pell', 'Chaka', 'Igaram', 'Terracotta', 'Chew', 'Kuroobi', 'Hatchan'
  ],

  // ================================
  // 🏴‍☠️ EPÍTETOS DE PIRATAS
  // ================================
  pirateEpithets: [
    // Clássicos
    'Straw Hat', 'Pirate Hunter', 'Cat Burglar', 'God', 'Black Leg', 'Cotton Candy Lover', 'Devil Child', 'Cyborg', 'Soul King', 'Knight of the Sea',
    
    // Yonkou
    'Whitebeard', 'Red Hair', 'Big Mom', 'King of Beasts', 'Blackbeard',
    
    // Supernovas
    'Surgeon of Death', 'Captain', 'Massacre Soldier', 'Magician', 'Roar of the Sea', 'Big Eater', 'Gang', 'Red Flag', 'Mad Monk',
    
    // Poder e Força
    'Iron Fist', 'Diamond', 'Phoenix', 'Fire Fist', 'Flame Emperor', 'Thunder Lord', 'Storm Rider', 'Sea Devil', 'Ocean Master',
    
    // Animais
    'White Tiger', 'Black Panther', 'Golden Eagle', 'Silver Wolf', 'Crimson Dragon', 'Blue Shark', 'Green Serpent', 'Purple Spider',
    
    // Elementos
    'Lightning', 'Thunder', 'Storm', 'Blizzard', 'Inferno', 'Tsunami', 'Earthquake', 'Volcano', 'Tornado', 'Hurricane',
    
    // Armas
    'Sword Saint', 'Gun Master', 'Blade Dancer', 'Arrow Storm', 'Cannon King', 'Bomb Expert', 'Sniper God', 'Fist Fighter',
    
    // Características
    'Demon', 'Angel', 'Ghost', 'Phantom', 'Shadow', 'Light Bringer', 'Dark Lord', 'Blood Moon', 'Golden Sun', 'Silver Star',
    
    // Comportamento
    'Mad Dog', 'Wild Beast', 'Silent Death', 'Laughing', 'Crying', 'Dancing', 'Singing', 'Screaming', 'Whispering',
    
    // Cores + Descrições
    'Crimson Blade', 'Azure Storm', 'Golden Fist', 'Silver Lightning', 'Emerald Wave', 'Ruby Fire', 'Sapphire Ice', 'Onyx Shadow',
    
    // Mitológicos
    'Kraken', 'Leviathan', 'Behemoth', 'Fenrir', 'Jormungandr', 'Bahamut', 'Tiamat', 'Quetzalcoatl', 'Yamata-no-Orochi',
    
    // Únicos
    'Bone Crusher', 'Soul Reaper', 'Dream Eater', 'Time Keeper', 'Space Walker', 'Gravity Master', 'Void Caller', 'Star Breaker'
  ],

  // ================================
  // ⚓ PATENTES MARINES
  // ================================
  marineRanks: [
    // Oficiais Superiores
    'Fleet Admiral', 'Admiral', 'Vice Admiral', 'Rear Admiral', 'Commodore',
    
    // Oficiais Médios
    'Captain', 'Commander', 'Lieutenant Commander', 'Lieutenant', 'Lieutenant Junior Grade', 'Ensign',
    
    // Suboficiais
    'Master Chief Petty Officer', 'Senior Chief Petty Officer', 'Chief Petty Officer', 'Petty Officer First Class', 'Petty Officer Second Class', 'Petty Officer Third Class',
    
    // Praças
    'Seaman First Class', 'Seaman Apprentice', 'Seaman Recruit', 'Chore Boy',
    
    // Especiais
    'Inspector General', 'Chief Instructor', 'Special Forces', 'Elite Squad', 'Black Ops', 'Intelligence Officer'
  ],

  // ================================
  // 🏛️ TÍTULOS DO GOVERNO
  // ================================
  governmentTitles: [
    // Altos Cargos
    'Gorosei', 'Commander-in-Chief', 'Cipher Pol Director', 'World Noble', 'Celestial Dragon',
    
    // Cipher Pol
    'CP0 Agent', 'CP9 Agent', 'CP8 Agent', 'CP7 Agent', 'CP6 Agent', 'CP5 Agent', 'CP4 Agent', 'CP3 Agent', 'CP2 Agent', 'CP1 Agent',
    
    // Especializações
    'Assassin', 'Spy Master', 'Intelligence Agent', 'Black Ops Specialist', 'Infiltrator', 'Interrogator', 'Eliminator',
    
    // Administrativos
    'World Government Official', 'Justice Minister', 'Security Chief', 'Protocol Officer', 'Diplomatic Agent'
  ],

  // ================================
  // 💰 TÍTULOS BOUNTY HUNTERS
  // ================================
  bountyHunterTitles: [
    // Níveis
    'Legendary Hunter', 'Master Hunter', 'Expert Hunter', 'Veteran Hunter', 'Professional Hunter', 'Rookie Hunter', 'Apprentice Hunter',
    
    // Especializações
    'Pirate Specialist', 'Devil Fruit Hunter', 'Treasure Seeker', 'Fugitive Tracker', 'Assassin for Hire', 'Mercenary',
    
    // Características
    'Silent Stalker', 'Quick Draw', 'Dead Shot', 'Trap Master', 'Tracker', 'Interrogator', 'Eliminator', 'Captor'
  ],

  // ================================
  // 👥 PROFISSÕES CIVIS
  // ================================
  civilianProfessions: [
    // Marítimas
    'Fisherman', 'Sailor', 'Navigator', 'Shipwright', 'Dock Worker', 'Harbor Master', 'Lighthouse Keeper',
    
    // Comerciais
    'Merchant', 'Trader', 'Shop Owner', 'Market Vendor', 'Innkeeper', 'Bartender', 'Cook', 'Baker',
    
    // Artesanais
    'Blacksmith', 'Carpenter', 'Tailor', 'Jeweler', 'Clockmaker', 'Instrument Maker', 'Artist', 'Sculptor',
    
    // Intelectuais
    'Scholar', 'Archaeologist', 'Historian', 'Librarian', 'Teacher', 'Doctor', 'Scientist', 'Engineer',
    
    // Entretenimento
    'Musician', 'Dancer', 'Actor', 'Storyteller', 'Circus Performer', 'Magician', 'Comedian',
    
    // Rurais
    'Farmer', 'Rancher', 'Hunter', 'Lumberjack', 'Miner', 'Shepherd', 'Beekeeper',
    
    // Urbanas
    'Mayor', 'Judge', 'Lawyer', 'Banker', 'Accountant', 'Messenger', 'Guard', 'Watchman'
  ]
};

// ================================
// 🎯 FUNÇÕES AUXILIARES
// ================================

export class NameGenerator {
  
  // 🎲 GERAR NOME COMPLETO ALEATÓRIO
  static generateRandomName(type?: 'Pirate' | 'Marine' | 'Government' | 'BountyHunter' | 'Civillian'): string {
    const firstName = this.getRandomElement(CHARACTER_NAMES.firstNames);
    const lastName = this.getRandomElement(CHARACTER_NAMES.lastNames);
    
    let title = '';
    
    switch (type) {
      case 'Pirate':
        if (Math.random() < 0.3) { // 70% chance de ter epíteto
          title = `"${this.getRandomElement(CHARACTER_NAMES.pirateEpithets)}" `;
        }
        break;
        
      case 'Marine':
        if (Math.random() < 0.3) { // 80% chance de ter patente
          title = `${this.getRandomElement(CHARACTER_NAMES.marineRanks)} `;
        }
        break;
        
      case 'Government':
        if (Math.random() < 0.3) { // 60% chance de ter título
          title = `${this.getRandomElement(CHARACTER_NAMES.governmentTitles)} `;
        }
        break;
        
      case 'BountyHunter':
        if (Math.random() < 0.3) { // 50% chance de ter título
          title = `${this.getRandomElement(CHARACTER_NAMES.bountyHunterTitles)} `;
        }
        break;
        
      case 'Civillian':
        if (Math.random() < 0.3) { // 40% chance de ter profissão
          title = `${this.getRandomElement(CHARACTER_NAMES.civilianProfessions)} `;
        }
        break;
    }
    
    return `${title}${firstName} ${lastName}`.trim();
  }
  
  // 🎯 GERAR NOME DE PIRATA
  static generatePirateName(): string {
    return this.generateRandomName('Pirate');
  }
  
  // ⚓ GERAR NOME DE MARINE
  static generateMarineName(): string {
    return this.generateRandomName('Marine');
  }
  
  // 🏛️ GERAR NOME DE AGENTE DO GOVERNO
  static generateGovernmentName(): string {
    return this.generateRandomName('Government');
  }
  
  // 💰 GERAR NOME DE BOUNTY HUNTER
  static generateBountyHunterName(): string {
    return this.generateRandomName('BountyHunter');
  }
  
  // 👥 GERAR NOME DE CIVIL
  static generateCivilianName(): string {
    return this.generateRandomName('Civillian');
  }
  
  // 🎲 ELEMENTO ALEATÓRIO
  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // 📊 ESTATÍSTICAS
  static getStatistics(): {
    firstNames: number;
    lastNames: number;
    pirateEpithets: number;
    marineRanks: number;
    governmentTitles: number;
    bountyHunterTitles: number;
    civilianProfessions: number;
    totalCombinations: number;
  } {
    const stats = {
      firstNames: CHARACTER_NAMES.firstNames.length,
      lastNames: CHARACTER_NAMES.lastNames.length,
      pirateEpithets: CHARACTER_NAMES.pirateEpithets.length,
      marineRanks: CHARACTER_NAMES.marineRanks.length,
      governmentTitles: CHARACTER_NAMES.governmentTitles.length,
      bountyHunterTitles: CHARACTER_NAMES.bountyHunterTitles.length,
      civilianProfessions: CHARACTER_NAMES.civilianProfessions.length,
      totalCombinations: 0
    };
    
    stats.totalCombinations = stats.firstNames * stats.lastNames * 
      (stats.pirateEpithets + stats.marineRanks + stats.governmentTitles + 
       stats.bountyHunterTitles + stats.civilianProfessions + 1); // +1 para sem título
    
    return stats;
  }
}

export default CHARACTER_NAMES;