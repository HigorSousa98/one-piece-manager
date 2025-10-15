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
    // Protagonistas e Aliados Principais
    'Monkey D.', 'Roronoa', 'Portgas D.', 'Trafalgar D.', 'Eustass', 'Basil', 'Scratchmen', 'Jewelry', 'Capone', 'Urouge', 'Killer', 'X', 'Vinsmoke',
    
    // Piratas Lendários e Yonkou
    'Edward', 'Charlotte', 'Kaido', 'Shanks', 'Buggy', 'Dracule', 'Bartholomew', 'Boa', 'Jinbe', 'Marshall D.', 'Crocodile', 'Donquixote', 'Gecko',
    'Gol D.', 'Rocks D.', 'Jaguar D.', 'Hagwar D.', 'Silvers', 'Scopper', 'Spencer', 'Sunbell', 'Taro', 'Doringo', 'Pankuta', 'Bankuro',
    
    // Marines e Governo
    'Sengoku', 'Sakazuki', 'Borsalino', 'Kuzan', 'Issho', 'Aramaki', 'Smoker', 'Tashigi', 'Hina', 'Koby', 'Helmeppo', 'Momonga',
    'Onigumo', 'Doberman', 'Strawberry', 'Yamakaji', 'Lacroix', 'Ronse', 'Dalmatian', 'Stainless', 'Comil', 'Mozambia',
    'Cipher Pol', 'Rob', 'Spandam', 'Spandine', 'Kaku', 'Kalifa', 'Blueno', 'Jabra', 'Kumadori', 'Fukurou', 'Nero', 'Wanze',
    
    // Nomes Japoneses Tradicionais e Wano
    'Kozuki', 'Kurozumi', 'Shimotsuki', 'Amatsuki', 'Uzuki', 'Fugetsu', 'Daimyo', 'Yakuza', 'Samurai', 'Ninja', 'Tenguyama',
    'Hitokiri', 'Ashura', 'Kyoshiro', 'Shutenmaru', 'Kawamatsu', 'Nekomamushi', 'Inuarashi', 'Hyogoro', 'Yatappe', 'Tsunagoro',
    'Cho', 'Omasa', 'Kiku', 'Shinobu', 'Tama', 'Tsuru', 'Kin\'emon', 'Raizo', 'Kanjuro', 'Denjiro', 'Izo', 'Asura',
    
    // Nomes de Diferentes Culturas e Regiões
    'Don', 'Sir', 'Captain', 'Admiral', 'Commodore', 'Vice Admiral', 'Rear Admiral', 'Doctor', 'Professor', 'Master', 'Lord', 'Lady',
    'Von', 'De', 'Del', 'La', 'Le', 'El', 'Al', 'Ibn', 'Ben', 'Mac', 'O\'', 'Mc', 'Van', 'Saint', 'Santa',
    
    // Nomes Exóticos e Únicos
    'Emporio', 'Bartholomew', 'Perona', 'Absalom', 'Hogback', 'Ryuma', 'Brook', 'Laboon', 'Crocus', 'Yorki', 'Mizuta',
    'Banchina', 'Yasopp', 'Lucky', 'Limejuice', 'Bonk', 'Monster', 'Building', 'Snake', 'Punch', 'Rockstar', 'Masked',
    
    // Fishman e Underwater
    'Fisher', 'Arlong', 'Kuroobi', 'Chew', 'Hatchan', 'Macro', 'Gyaro', 'Tansui', 'Namur', 'Karma', 'Pisaro', 'Octo',
    'Ikaros', 'Dosun', 'Zeo', 'Daruma', 'Hyouzou', 'Hammond', 'Kasagoba', 'Hody', 'Vander', 'Wadatsumi', 'Surume',
    'Neptune', 'Otohime', 'Fukaboshi', 'Ryuboshi', 'Manboshi', 'Shirahoshi', 'Megalo', 'Pappag', 'Camie', 'Keimi',
    
    // Sky Island e Shandians
    'Gan', 'Wyper', 'Braham', 'Genbo', 'Laki', 'Aisa', 'Pagaya', 'Conis', 'McKinley', 'Amazon', 'Hotori', 'Kotori',
    'Satori', 'Shura', 'Gedatsu', 'Ohm', 'Enel', 'Calgara', 'Noland', 'Cricket', 'Masira', 'Shoujou', 'Sarquiss',
    
    // Mink Tribe
    'Pedro', 'Carrot', 'Wanda', 'Sicilian', 'Concelot', 'Giovanni', 'Yomo', 'Milky', 'Bariete', 'Blackback', 'Roddy',
    'BB', 'Tristan', 'Miyagi', 'Lindbergh', 'Bepo', 'Zepo', 'Faust', 'Pekoms', 'Tamago', 'Bobbin',
    
    // Gigantes e Elbaf
    'Dorry', 'Brogy', 'Oimo', 'Kashii', 'Hajrudin', 'Gerth', 'Road', 'Goldberg', 'Stansen', 'Loki', 'Jorul', 'Jarul',
    'Saul', 'Jaguar', 'Lacroix', 'Lonz', 'Ronse', 'Blyue', 'Panz', 'Morley', 'Sanjuan', 'Wolf',
    
    // Revolucionários e Underworld
    'Bentham', 'Ivankov', 'Inazuma', 'Lightning', 'Newkama', 'Revolutionary', 'Dragon', 'Sabo', 'Koala', 'Hack', 'Karasu',
    'Belo', 'Betty', 'Morley', 'Lindbergh', 'Ahiru', 'Bunny', 'Terry', 'Raise', 'Max', 'Ushiano', 'Marumieta',
    
    // Thriller Bark e Zombies
    'Moria', 'Perona', 'Absalom', 'Hogback', 'Cindry', 'Ryuma', 'Jigoro', 'Inuppe', 'Buhichuck', 'Kumashi', 'Hildon',
    'Risky', 'Brothers', 'Gyoro', 'Nin', 'Bao', 'Oars', 'Little', 'Oars', 'Jr.', 'Lola', 'Chiffon',
    
    // Impel Down
    'Magellan', 'Hannyabal', 'Domino', 'Sadi', 'Saldeath', 'Minotaurus', 'Minorhinoceros', 'Minokoala', 'Minozebra', 'Minochihuahua',
    'Shiryu', 'Catarina', 'Devon', 'Avalo', 'Pizarro', 'Laffitte', 'Jesus', 'Burgess', 'Doc', 'Q',
    
    // Marineford e Whitebeard Pirates
    'Marco', 'Jozu', 'Vista', 'Thatch', 'Blamenco', 'Rakuyo', 'Namule', 'Blenheim', 'Curiel', 'Kingdew',
    'Haruta', 'Atmos', 'Speed', 'Jiru', 'Fossa', 'Izo', 'Whitey', 'Bay', 'Little', 'Oars',
    
    // Big Mom Pirates Extended
    'Streusen', 'Tamago', 'Pekoms', 'Bobbin', 'Amande', 'Diesel', 'Randolph', 'Kingbaum', 'Lady', 'Tree',
    'Pound', 'Chiffon', 'Lola', 'Praline', 'Aladine', 'Sun', 'Pirates', 'Wadatsumi', 'Surume', 'Kraken',
    
    // Beast Pirates Extended
    'Yamato', 'Ulti', 'Page', 'One', 'Who\'s', 'Who', 'Black', 'Maria', 'Sasaki', 'X', 'Drake', 'Apoo',
    'Hawkins', 'Holdem', 'Speed', 'Babanuki', 'Daifugo', 'Solitaire', 'Fourtricks', 'Hamlet', 'Goki', 'Alpacaman',
    
    // Dressrosa e Donquixote Family
    'Doflamingo', 'Trebol', 'Diamante', 'Pica', 'Vergo', 'Monet', 'Sugar', 'Violet', 'Giolla', 'Lao',
    'Senor', 'Pink', 'Machvise', 'Dellinger', 'Gladius', 'Buffalo', 'Baby', '5', 'Bellamy', 'Bartolomeo',
    
    // Whole Cake Island
    'Sanji', 'Reiju', 'Ichiji', 'Niji', 'Yonji', 'Judge', 'Sora', 'Cosette', 'Pudding', 'Chiffon',
    'Bege', 'Pez', 'Gotti', 'Vito', 'Gototti', 'Firetank', 'Pirates', 'Caesar', 'Clown', 'Gastino',
    
    // Arabasta
    'Nefertari', 'Cobra', 'Pell', 'Chaka', 'Igaram', 'Terracotta', 'Koza', 'Toto', 'Kohza', 'Farafra',
    'Karoo', 'Carue', 'Eyelashes', 'Matsuge', 'Scissors', 'Hasami', 'Lassoo', 'Mr.', 'Miss', 'Baroque',
    
    // Water 7 e Enies Lobby
    'Iceburg', 'Paulie', 'Peepley', 'Lulu', 'Tilestone', 'Zambai', 'Kiev', 'Schollzo', 'Kop', 'Mozu',
    'Kiwi', 'Yokozuna', 'Gonbe', 'Chimney', 'Kokoro', 'Tom', 'Cutty', 'Flam', 'Franky', 'Baskerville',
    
    // Skypiea Extended
    'Enel', 'Gedatsu', 'Shura', 'Ohm', 'Satori', 'Hotori', 'Kotori', 'Amazon', 'Su', 'Pierre',
    'Holy', 'Fuza', 'Goro', 'Gan', 'Fall', 'Upper', 'Yard', 'God', 'Land', 'Vearth',
    
    // Nomes Místicos e Mitológicos
    'Poseidon', 'Pluton', 'Uranus', 'Void', 'Century', 'Ancient', 'Weapon', 'Joy', 'Boy', 'Im',
    'Imu', 'Sama', 'Gorosei', 'Elder', 'Stars', 'Five', 'World', 'Government', 'Celestial', 'Dragon',
    
    // Nomes de Ilhas e Locais
    'Alabasta', 'Drum', 'Sakura', 'Skypiea', 'Jaya', 'Long', 'Ring', 'Water', 'Enies', 'Thriller',
    'Sabaody', 'Amazon', 'Lily', 'Impel', 'Down', 'Marineford', 'Fishman', 'Punk', 'Hazard', 'Dressrosa',
    
    // Nomes Tecnológicos e Científicos
    'Vegapunk', 'Caesar', 'Queen', 'Judge', 'Franky', 'Usopp', 'Chopper', 'Law', 'Kid', 'Hawkins',
    'Pacifista', 'Seraphim', 'Cyborg', 'Android', 'Robot', 'Mecha', 'Gear', 'Boost', 'Turbo', 'Nitro'
  ],

  // ================================
  // 🎯 ÚLTIMOS NOMES / APELIDOS
  // ================================
  lastNames: [
    // Protagonistas Straw Hats
    'Luffy', 'Zoro', 'Nami', 'Usopp', 'Sanji', 'Chopper', 'Robin', 'Franky', 'Brook', 'Jinbe',
    
    // Piratas Lendários Roger Pirates
    'Roger', 'Rayleigh', 'Scopper', 'Gaban', 'Crocus', 'Seagull', 'Sunbell', 'Taro', 'Doringo', 'Pankuta',
    'Bankuro', 'Yui', 'Rangram', 'Mugren', 'Donquino', 'Shanks', 'Buggy', 'Kozuki', 'Oden', 'Toki',
    
    // Whitebeard Pirates
    'Newgate', 'Marco', 'Ace', 'Vista', 'Jozu', 'Thatch', 'Blamenco', 'Rakuyo', 'Namule', 'Blenheim',
    'Curiel', 'Kingdew', 'Haruta', 'Atmos', 'Speed', 'Jiru', 'Fossa', 'Izo', 'Whitey', 'Bay',
    
    // Supernovas Worst Generation
    'Law', 'Kid', 'Killer', 'Hawkins', 'Apoo', 'Bonney', 'Bege', 'Drake', 'Urouge', 'Zoro',
    'Luffy', 'Blackbeard', 'Teach', 'Burgess', 'Shiryu', 'Laffitte', 'Devon', 'Pizarro', 'Wolf', 'Doc',
    
    // Big Mom Charlotte Family
    'Linlin', 'Katakuri', 'Smoothie', 'Cracker', 'Perospero', 'Compote', 'Daifuku', 'Oven', 'Galette', 'Opera',
    'Counter', 'Cadenza', 'Cabaletta', 'Gala', 'Nusstorte', 'Basskarte', 'Dosmarche', 'Noisette', 'Moscato', 'Mash',
    'Cornstarch', 'Compo', 'Laurin', 'Mont', 'High-Fat', 'Tablet', 'Saint-Marc', 'Basans', 'Melise', 'Dacquoise',
    'Snack', 'Bavarois', 'Prim', 'Praline', 'Chiffon', 'Lola', 'Mobile', 'Marble', 'Myukuru', 'Maple',
    'Brownie', 'Joconde', 'Raisin', 'Panna', 'Mascarpone', 'Joscarpone', 'Yuen', 'Newichi', 'Newji', 'Newsan',
    
    // Beast Pirates Kaido Crew
    'Kaido', 'King', 'Queen', 'Jack', 'Yamato', 'Ulti', 'Page One', 'Who\'s Who', 'Black Maria', 'Sasaki',
    'Holdem', 'Speed', 'Babanuki', 'Daifugo', 'Solitaire', 'Fourtricks', 'Hamlet', 'Goki', 'Alpacaman', 'Madilloman',
    'Poker', 'Mizerka', 'Bao', 'Huang', 'Ginrummy', 'Sheepshead', 'Ginrummy', 'Batman', 'Gazelleman', 'Mouseman',
    
    // Red Hair Pirates
    'Shanks', 'Beckman', 'Roux', 'Yasopp', 'Limejuice', 'Bonk Punch', 'Monster', 'Building Snake', 'Hongo', 'Howling',
    'Rockstar', 'Ideo', 'Blue Gilly', 'Abdullah', 'Jeet', 'Suleiman', 'Orlumbus', 'Cavendish', 'Bartolomeo', 'Leo',
    
    // Marines Headquarters
    'Garp', 'Sengoku', 'Akainu', 'Kizaru', 'Aokiji', 'Fujitora', 'Ryokugyu', 'Tsuru', 'Momonga', 'Onigumo',
    'Doberman', 'Strawberry', 'Yamakaji', 'Lacroix', 'Ronse', 'Dalmatian', 'Stainless', 'Comil', 'Mozambia', 'Cancer',
    'Smoker', 'Tashigi', 'Hina', 'Koby', 'Helmeppo', 'Fullbody', 'Jango', 'Ripper', 'Rokkaku', 'Nezumi',
    
    // Shichibukai Warlords
    'Mihawk', 'Kuma', 'Hancock', 'Moria', 'Doflamingo', 'Crocodile', 'Weevil', 'Law', 'Buggy', 'Jinbe',
    
    // Revolutionary Army
    'Dragon', 'Sabo', 'Ivankov', 'Kuma', 'Inazuma', 'Koala', 'Hack', 'Karasu', 'Morley', 'Lindbergh',
    'Belo Betty', 'Ahiru', 'Bunny Joe', 'Terry Gilteo', 'Raise Max', 'Ushiano', 'Marumieta', 'Gyanbou', 'Jiron', 'Gambo',
    
    // Cipher Pol Agents
    'Lucci', 'Kaku', 'Kalifa', 'Blueno', 'Jabra', 'Kumadori', 'Fukurou', 'Spandam', 'Spandine', 'Nero',
    'Wanze', 'Jerry', 'T-Bone', 'Very Good', 'Shu', 'Sharinguru', 'Berry Good', 'Rust-Rust', 'Wheel-Wheel', 'Ori-Ori',
    
    // Wano Samurai e Ninja
    'Oden', 'Toki', 'Momonosuke', 'Hiyori', 'Orochi', 'Kanjuro', 'Raizo', 'Kinemon', 'Denjiro', 'Ashura',
    'Kawamatsu', 'Nekomamushi', 'Inuarashi', 'Hyogoro', 'Yatappe', 'Tsunagoro', 'Cho', 'Omasa', 'Kiku', 'Shinobu',
    'Tama', 'Tsuru', 'Tenguyama', 'Hitokiri', 'Kyoshiro', 'Shutenmaru', 'Onimaru', 'Gyukimaru', 'Komurasaki', 'Robin',
    
    // Fishman Island
    'Neptune', 'Otohime', 'Fukaboshi', 'Ryuboshi', 'Manboshi', 'Shirahoshi', 'Megalo', 'Pappag', 'Camie', 'Keimi',
    'Arlong', 'Kuroobi', 'Chew', 'Hatchan', 'Macro', 'Gyaro', 'Tansui', 'Namur', 'Karma', 'Pisaro',
    'Ikaros Much', 'Dosun', 'Zeo', 'Daruma', 'Hyouzou', 'Hammond', 'Kasagoba', 'Hody Jones', 'Vander Decken', 'Wadatsumi',
    
    // Sky Island Shandians
    'Wyper', 'Braham', 'Genbo', 'Laki', 'Aisa', 'Kamakiri', 'Pagaya', 'Conis', 'McKinley', 'Amazon',
    'Enel', 'Gedatsu', 'Shura', 'Ohm', 'Satori', 'Hotori', 'Kotori', 'Calgara', 'Noland', 'Cricket',
    
    // Mink Tribe Zou
    'Pedro', 'Carrot', 'Wanda', 'Sicilian', 'Concelot', 'Giovanni', 'Yomo', 'Milky', 'Bariete', 'Blackback',
    'Roddy', 'BB', 'Tristan', 'Miyagi', 'Lindbergh', 'Bepo', 'Zepo', 'Faust', 'Pekoms', 'Tamago',
    
    // Giant Warriors Elbaf
    'Dorry', 'Brogy', 'Oimo', 'Kashii', 'Hajrudin', 'Gerth', 'Road', 'Goldberg', 'Stansen', 'Loki',
    'Jorul', 'Jarul', 'Saul', 'Jaguar D.', 'Lacroix', 'Lonz', 'Ronse', 'Blyue', 'Panz', 'Morley',
    
    // Thriller Bark Zombies
    'Moria', 'Perona', 'Absalom', 'Hogback', 'Cindry', 'Ryuma', 'Jigoro', 'Inuppe', 'Buhichuck', 'Kumashi',
    'Hildon', 'Risky Brothers', 'Gyoro', 'Nin', 'Bao', 'Oars', 'Little Oars Jr.', 'Lola', 'Chiffon', 'Bege',
    
    // Impel Down Staff
    'Magellan', 'Hannyabal', 'Domino', 'Sadi', 'Saldeath', 'Minotaurus', 'Minorhinoceros', 'Minokoala', 'Minozebra', 'Minochihuahua',
    'Shiryu', 'Catarina Devon', 'Avalo Pizarro', 'Laffitte', 'Jesus Burgess', 'Doc Q', 'Van Augur', 'Stronger', 'Kuzan', 'Aokiji',
    
    // Dressrosa Colosseum
    'Doflamingo', 'Trebol', 'Diamante', 'Pica', 'Vergo', 'Monet', 'Sugar', 'Violet', 'Giolla', 'Lao G',
    'Senor Pink', 'Machvise', 'Dellinger', 'Gladius', 'Buffalo', 'Baby 5', 'Bellamy', 'Bartolomeo', 'Cavendish', 'Rebecca',
    'Kyros', 'Riku', 'Viola', 'Scarlett', 'Tank', 'Lepanto', 'Elizabello', 'Dagama', 'Abdullah', 'Jeet',
    
    // Arabasta Kingdom
    'Vivi', 'Cobra', 'Pell', 'Chaka', 'Igaram', 'Terracotta', 'Koza', 'Toto', 'Kohza', 'Farafra',
    'Karoo', 'Carue', 'Eyelashes', 'Matsuge', 'Scissors', 'Hasami', 'Lassoo', 'Funkfreed', 'Smiley', 'Surume',
    
    // Water 7 Galley-La
    'Iceburg', 'Paulie', 'Peepley Lulu', 'Tilestone', 'Zambai', 'Kiev', 'Schollzo', 'Kop', 'Mozu', 'Kiwi',
    'Yokozuna', 'Gonbe', 'Chimney', 'Kokoro', 'Tom', 'Cutty Flam', 'Franky', 'Baskerville', 'Spandam', 'Funkfreed',
    
    // Whole Cake Island Vinsmokes
    'Sanji', 'Reiju', 'Ichiji', 'Niji', 'Yonji', 'Judge', 'Sora', 'Cosette', 'Pudding', 'Chiffon',
    'Bege', 'Pez', 'Gotti', 'Vito', 'Gototti', 'Caesar', 'Clown', 'Gastino', 'Gang', 'Firetank',
    
    // Diversos e Únicos
    'Bentham', 'Bon Clay', 'Mr. 2', 'Ivankov', 'Emporio', 'Newkama', 'Lightning', 'Inazuma', 'Scissors', 'Kamabakka',
    'Laboon', 'Crocus', 'Yorki', 'Mizuta', 'Banchina', 'Yasopp', 'Lucky Roux', 'Limejuice', 'Bonk Punch', 'Monster',
    'Building Snake', 'Rockstar', 'Masked Deuce', 'Skull', 'Mihar', 'Kotatsu', 'Agotogi', 'Cornelia', 'Forliewbs', 'Whitey Bay'
  ],

  // ================================
  // 🏴‍☠️ EPÍTETOS DE PIRATAS (MEGA EXPANSÃO)
  // ================================
  pirateEpithets: [
    // Clássicos Straw Hats
    'Straw Hat', 'Pirate Hunter', 'Cat Burglar', 'God', 'Black Leg', 'Cotton Candy Lover', 'Devil Child', 'Cyborg', 'Soul King', 'Knight of the Sea',
    
    // Yonkou Legendários
    'Whitebeard', 'Red Hair', 'Big Mom', 'King of Beasts', 'Blackbeard', 'Strongest Man in the World', 'Emperor of the Sea', 'World\'s Strongest Creature',
    
    // Supernovas Worst Generation
    'Surgeon of Death', 'Captain', 'Massacre Soldier', 'Magician', 'Roar of the Sea', 'Big Eater', 'Gang', 'Red Flag', 'Mad Monk',
    'Glutton', 'Supernova', 'Worst Generation', 'Eleven Supernovas', 'Rookie', 'Rising Star', 'New Age', 'Future Pirate King',
    
    // Poder e Força Física
    'Iron Fist', 'Diamond', 'Phoenix', 'Fire Fist', 'Flame Emperor', 'Thunder Lord', 'Storm Rider', 'Sea Devil', 'Ocean Master',
    'Steel Body', 'Titanium Bones', 'Granite Crusher', 'Mountain Mover', 'Earth Shaker', 'Sky Splitter', 'Sea Parting', 'World Breaker',
    'Unstoppable Force', 'Immovable Object', 'Infinite Strength', 'Boundless Power', 'Limitless Might', 'Endless Fury', 'Eternal Warrior', 'Immortal Fighter',
    
    // Animais Ferozes
    'White Tiger', 'Black Panther', 'Golden Eagle', 'Silver Wolf', 'Crimson Dragon', 'Blue Shark', 'Green Serpent', 'Purple Spider',
    'Blood Hound', 'Shadow Cat', 'Lightning Hawk', 'Thunder Bear', 'Storm Falcon', 'Blizzard Lion', 'Inferno Fox', 'Tsunami Whale',
    'Earthquake Rhino', 'Volcano Gorilla', 'Tornado Cheetah', 'Hurricane Jaguar', 'Typhoon Leopard', 'Cyclone Lynx', 'Tempest Puma', 'Gale Cougar',
    'Savage Beast', 'Wild Predator', 'Apex Hunter', 'Alpha Predator', 'King of Beasts', 'Lord of the Wild', 'Master of the Hunt', 'Ruler of Nature',
    
    // Elementos Naturais
    'Lightning', 'Thunder', 'Storm', 'Blizzard', 'Inferno', 'Tsunami', 'Earthquake', 'Volcano', 'Tornado', 'Hurricane',
    'Typhoon', 'Cyclone', 'Tempest', 'Gale', 'Whirlwind', 'Maelstrom', 'Avalanche', 'Landslide', 'Mudslide', 'Rockslide',
    'Firestorm', 'Ice Age', 'Heat Wave', 'Cold Front', 'Pressure Drop', 'Sonic Boom', 'Shock Wave', 'Tidal Wave', 'Flash Flood', 'Drought',
    'Solar Flare', 'Lunar Eclipse', 'Meteor Shower', 'Comet Tail', 'Stellar Wind', 'Cosmic Storm', 'Galactic Force', 'Universal Power',
    
    // Armas e Combate
    'Sword Saint', 'Gun Master', 'Blade Dancer', 'Arrow Storm', 'Cannon King', 'Bomb Expert', 'Sniper God', 'Fist Fighter',
    'Dual Wielder', 'Triple Threat', 'Quad Slasher', 'Multi Striker', 'Combo Master', 'Chain Fighter', 'Whip Cracker', 'Staff Spinner',
    'Spear Thrower', 'Axe Chopper', 'Hammer Crusher', 'Mace Smasher', 'Club Basher', 'Knuckle Breaker', 'Gauntlet Puncher', 'Claw Ripper',
    'Blade Storm', 'Bullet Rain', 'Arrow Hail', 'Cannon Barrage', 'Bomb Shower', 'Explosion Master', 'Destruction King', 'Annihilation Lord',
    
    // Características Místicas
    'Demon', 'Angel', 'Ghost', 'Phantom', 'Shadow', 'Light Bringer', 'Dark Lord', 'Blood Moon', 'Golden Sun', 'Silver Star',
    'Void Walker', 'Time Keeper', 'Space Bender', 'Reality Shifter', 'Dimension Hopper', 'Plane Walker', 'Portal Master', 'Warp Driver',
    'Soul Reaper', 'Spirit Guide', 'Essence Thief', 'Life Taker', 'Death Dealer', 'Fate Changer', 'Destiny Maker', 'Fortune Teller',
    'Dream Weaver', 'Nightmare Bringer', 'Sleep Walker', 'Lucid Dreamer', 'Mind Reader', 'Thought Stealer', 'Memory Keeper', 'Consciousness Shifter',
    
    // Comportamento e Personalidade
    'Mad Dog', 'Wild Beast', 'Silent Death', 'Laughing', 'Crying', 'Dancing', 'Singing', 'Screaming', 'Whispering',
    'Gentle Giant', 'Cruel Dwarf', 'Kind Demon', 'Evil Angel', 'Wise Fool', 'Foolish Sage', 'Brave Coward', 'Cowardly Hero',
    'Honest Liar', 'Lying Truth', 'Peaceful Warrior', 'Warlike Pacifist', 'Humble King', 'Arrogant Peasant', 'Rich Beggar', 'Poor Noble',
    'Happy Mourner', 'Sad Celebrant', 'Serious Joker', 'Funny Monk', 'Playful Killer', 'Deadly Player', 'Living Dead', 'Dead Alive',
    
    // Cores e Elementos Visuais
    'Crimson Blade', 'Azure Storm', 'Golden Fist', 'Silver Lightning', 'Emerald Wave', 'Ruby Fire', 'Sapphire Ice', 'Onyx Shadow',
    'Pearl Light', 'Diamond Shine', 'Platinum Gleam', 'Bronze Glow', 'Copper Flash', 'Iron Rust', 'Steel Glint', 'Titanium Spark',
    'Rainbow Warrior', 'Prism Fighter', 'Spectrum Slasher', 'Chromatic Crusher', 'Colorful Killer', 'Vibrant Vanquisher', 'Brilliant Brawler', 'Radiant Ripper',
    'Neon Ninja', 'Glow Guardian', 'Shine Samurai', 'Gleam Gladiator', 'Sparkle Soldier', 'Glitter Gunner', 'Shimmer Shooter', 'Twinkle Trooper',
    
    // Criaturas Mitológicas
    'Kraken', 'Leviathan', 'Behemoth', 'Fenrir', 'Jormungandr', 'Bahamut', 'Tiamat', 'Quetzalcoatl', 'Yamata-no-Orochi',
    'Hydra', 'Chimera', 'Sphinx', 'Griffin', 'Phoenix', 'Dragon', 'Wyvern', 'Drake', 'Wyrm', 'Basilisk',
    'Minotaur', 'Centaur', 'Satyr', 'Cyclops', 'Titan', 'Giant', 'Ogre', 'Troll', 'Goblin', 'Orc',
    'Vampire', 'Werewolf', 'Banshee', 'Wraith', 'Specter', 'Poltergeist', 'Revenant', 'Lich', 'Zombie', 'Skeleton',
    
    // Elementos Únicos e Criativos
    'Bone Crusher', 'Soul Reaper', 'Dream Eater', 'Time Keeper', 'Space Walker', 'Gravity Master', 'Void Caller', 'Star Breaker',
    'Planet Shaker', 'Galaxy Destroyer', 'Universe Ender', 'Reality Bender', 'Dimension Ripper', 'Multiverse Traveler', 'Infinity Walker', 'Eternity Keeper',
    'Chaos Bringer', 'Order Destroyer', 'Balance Keeper', 'Harmony Breaker', 'Peace Shatterer', 'War Ender', 'Battle Master', 'Combat King',
    'Victory Lord', 'Defeat Bringer', 'Success Maker', 'Failure Crusher', 'Hope Giver', 'Despair Taker', 'Joy Spreader', 'Sorrow Ender',
    
    // Epítetos Técnicos e Modernos
    'Cyber Samurai', 'Digital Demon', 'Virtual Villain', 'Binary Beast', 'Code Crusher', 'Data Destroyer', 'System Slasher', 'Network Ninja',
    'Quantum Queller', 'Atomic Annihilator', 'Nuclear Nightmare', 'Molecular Master', 'Chemical Chaos', 'Biological Bane', 'Genetic Giant', 'DNA Destroyer',
    'Nano Nightmare', 'Micro Monster', 'Mini Menace', 'Tiny Terror', 'Small Slayer', 'Little Lunatic', 'Petite Predator', 'Compact Crusher',
    'Mega Machine', 'Giga Giant', 'Tera Titan', 'Peta Predator', 'Exa Emperor', 'Zetta Zealot', 'Yotta Yokai', 'Infinite Invader',
    
    // Epítetos Marítimos
    'Sea King', 'Ocean Lord', 'Wave Rider', 'Tide Turner', 'Current Master', 'Depth Diver', 'Abyss Walker', 'Trench Traveler',
    'Coral Crusher', 'Reef Ripper', 'Kelp Killer', 'Seaweed Slasher', 'Barnacle Breaker', 'Shell Smasher', 'Pearl Plunderer', 'Treasure Taker',
    'Ship Sinker', 'Fleet Destroyer', 'Armada Annihilator', 'Navy Nightmare', 'Marine Menace', 'Sailor Slayer', 'Captain Crusher', 'Admiral Assassin',
    'Port Plunderer', 'Harbor Hunter', 'Dock Destroyer', 'Wharf Wrecker', 'Pier Pulverizer', 'Marina Marauder', 'Anchorage Annihilator', 'Berth Breaker'
  ],

  // ================================
  // ⚓ PATENTES MARINES (EXPANDIDO)
  // ================================
  marineRanks: [
    // Oficiais Superiores
    'Fleet Admiral', 'Admiral', 'Vice Admiral', 'Rear Admiral', 'Commodore',
    'Admiral of the Fleet', 'Grand Admiral', 'Supreme Admiral', 'High Admiral', 'Chief Admiral',
    
    // Oficiais Médios
    'Captain', 'Commander', 'Lieutenant Commander', 'Lieutenant', 'Lieutenant Junior Grade', 'Ensign',
    'Senior Captain', 'Staff Captain', 'Line Captain', 'Ship Captain', 'Fleet Captain',
    'Senior Commander', 'Executive Commander', 'Operations Commander', 'Tactical Commander', 'Strategic Commander',
    
    // Suboficiais
    'Master Chief Petty Officer', 'Senior Chief Petty Officer', 'Chief Petty Officer', 'Petty Officer First Class', 'Petty Officer Second Class', 'Petty Officer Third Class',
    'Command Master Chief', 'Fleet Master Chief', 'Force Master Chief', 'Ship Master Chief', 'Squadron Master Chief',
    
    // Praças
    'Seaman First Class', 'Seaman Apprentice', 'Seaman Recruit', 'Chore Boy',
    'Master Seaman', 'Leading Seaman', 'Able Seaman', 'Ordinary Seaman', 'Naval Cadet',
    
    // Especiais e Técnicos
    'Inspector General', 'Chief Instructor', 'Special Forces', 'Elite Squad', 'Black Ops', 'Intelligence Officer',
    'Naval Aviator', 'Flight Officer', 'Navigator', 'Communications Officer', 'Engineering Officer', 'Medical Officer',
    'Supply Officer', 'Logistics Officer', 'Operations Officer', 'Tactical Officer', 'Strategic Officer', 'Intelligence Analyst',
    
    // Unidades Especiais
    'SWORD Agent', 'Cipher Pol Liaison', 'World Government Representative', 'Celestial Dragon Guard', 'Reverie Security',
    'G-5 Marine', 'G-1 Marine', 'G-2 Marine', 'G-3 Marine', 'G-4 Marine', 'G-6 Marine', 'G-7 Marine', 'G-8 Marine',
    
    // Posições de Comando
    'Base Commander', 'Fort Commander', 'Garrison Commander', 'Patrol Leader', 'Squad Leader', 'Team Leader',
    'Division Chief', 'Department Head', 'Section Leader', 'Unit Commander', 'Group Captain', 'Wing Commander'
  ],

  // ================================
  // 🏛️ TÍTULOS DO GOVERNO (MEGA EXPANSÃO)
  // ================================
  governmentTitles: [
    // Altos Cargos Supremos
    'Gorosei', 'Five Elder Stars', 'Commander-in-Chief', 'Cipher Pol Director', 'World Noble', 'Celestial Dragon',
    'Im-sama', 'Empty Throne Guardian', 'World Government Supreme Leader', 'Pangaea Castle Ruler', 'Mary Geoise Sovereign',
    
    // Cipher Pol Hierarquia Completa
    'CP0 Chief', 'CP0 Agent', 'CP9 Chief', 'CP9 Agent', 'CP8 Chief', 'CP8 Agent', 'CP7 Chief', 'CP7 Agent',
    'CP6 Chief', 'CP6 Agent', 'CP5 Chief', 'CP5 Agent', 'CP4 Chief', 'CP4 Agent', 'CP3 Chief', 'CP3 Agent',
    'CP2 Chief', 'CP2 Agent', 'CP1 Chief', 'CP1 Agent', 'CP0 Masked Agent', 'CP0 Elite', 'CP0 Assassin',
    
    // Especializações de Agentes
    'Master Assassin', 'Elite Spy', 'Deep Cover Agent', 'Infiltration Specialist', 'Extraction Expert', 'Elimination Unit',
    'Intelligence Gatherer', 'Information Broker', 'Code Breaker', 'Cipher Specialist', 'Encryption Expert', 'Decryption Master',
    'Surveillance Chief', 'Reconnaissance Leader', 'Stealth Operative', 'Shadow Agent', 'Ghost Operative', 'Phantom Unit',
    
    // Administrativos e Burocráticos
    'World Government Official', 'Justice Minister', 'Security Chief', 'Protocol Officer', 'Diplomatic Agent',
    'Treasury Secretary', 'Finance Minister', 'Trade Commissioner', 'Commerce Director', 'Economic Advisor',
    'Legal Counsel', 'Court Justice', 'Supreme Judge', 'Tribunal Chief', 'Law Enforcement Director',
    
    // Posições Militares Governamentais
    'World Government General', 'Strategic Command', 'Tactical Operations', 'Special Forces Commander', 'Elite Guard Captain',
    'Palace Guard', 'Royal Protector', 'Noble Escort', 'Dignitary Security', 'VIP Protection',
    
    // Posições Científicas e Técnicas
    'Chief Scientist', 'Research Director', 'Development Head', 'Innovation Leader', 'Technology Advisor',
    'Weapons Specialist', 'Defense Contractor', 'Military Engineer', 'Strategic Analyst', 'Intelligence Coordinator',
    
    // Posições Diplomáticas
    'Ambassador', 'Consul', 'Envoy', 'Emissary', 'Diplomatic Attaché', 'Cultural Liaison', 'Trade Representative',
    'Peace Negotiator', 'Treaty Specialist', 'International Relations', 'Foreign Affairs', 'Global Coordinator'
  ],

  // ================================
  // 💰 TÍTULOS BOUNTY HUNTERS (EXPANDIDO)
  // ================================
  bountyHunterTitles: [
    // Hierarquia de Níveis
    'Legendary Hunter', 'Mythical Tracker', 'Master Hunter', 'Grandmaster Pursuer', 'Expert Hunter', 'Elite Tracker',
    'Veteran Hunter', 'Seasoned Pursuer', 'Professional Hunter', 'Skilled Tracker', 'Rookie Hunter', 'Novice Pursuer',
    'Apprentice Hunter', 'Trainee Tracker', 'Junior Hunter', 'Cadet Pursuer', 'Student Hunter', 'Learning Tracker',
    
    // Especializações por Alvo
    'Pirate Specialist', 'Marine Deserter Hunter', 'Revolutionary Tracker', 'Criminal Pursuer', 'Fugitive Specialist',
    'Devil Fruit Hunter', 'Rare Ability Tracker', 'Power User Pursuer', 'Logia Hunter', 'Paramecia Specialist', 'Zoan Tracker',
    'Treasure Seeker', 'Artifact Hunter', 'Relic Pursuer', 'Ancient Weapon Tracker', 'Poneglyph Seeker', 'Gold Hunter',
    
        // Especializações por Método (continuação)
    'Silent Stalker', 'Shadow Pursuer', 'Stealth Hunter', 'Ghost Tracker', 'Phantom Pursuer', 'Invisible Hunter',
    'Quick Draw', 'Fast Gun', 'Rapid Fire', 'Speed Shooter', 'Lightning Draw', 'Thunder Shot',
    'Dead Shot', 'Perfect Aim', 'Never Miss', 'Bullseye', 'Precision Strike', 'Accurate Fire',
    'Trap Master', 'Snare Specialist', 'Ambush Expert', 'Setup Artist', 'Preparation King', 'Strategy Hunter',
    
    // Características e Habilidades
    'Tracker', 'Pursuer', 'Stalker', 'Hunter', 'Seeker', 'Finder', 'Locator', 'Detector',
    'Interrogator', 'Information Extractor', 'Truth Seeker', 'Secret Revealer', 'Confession Master', 'Mind Reader',
    'Eliminator', 'Terminator', 'Finisher', 'Ender', 'Closer', 'Executioner', 'Destroyer', 'Annihilator',
    'Captor', 'Restrainer', 'Binder', 'Holder', 'Keeper', 'Detainer', 'Imprisoner', 'Jailer',
    
    // Especializações por Região
    'Grand Line Hunter', 'New World Tracker', 'Paradise Pursuer', 'Four Blues Specialist', 'Calm Belt Navigator',
    'Sky Island Seeker', 'Underwater Hunter', 'Deep Sea Tracker', 'Ocean Floor Pursuer', 'Abyss Hunter',
    'Desert Specialist', 'Jungle Tracker', 'Mountain Hunter', 'Arctic Pursuer', 'Volcanic Seeker',
    
    // Títulos por Reputação
    'Feared Hunter', 'Respected Tracker', 'Notorious Pursuer', 'Famous Seeker', 'Renowned Hunter',
    'Infamous Tracker', 'Legendary Pursuer', 'Mythical Seeker', 'Godlike Hunter', 'Divine Tracker',
    'Unstoppable Force', 'Relentless Pursuer', 'Never Gives Up', 'Always Gets Target', 'Perfect Record',
    
    // Títulos por Equipamento
    'Gun Master', 'Sword Specialist', 'Blade Expert', 'Weapon Virtuoso', 'Arsenal King',
    'Technology User', 'Gadget Master', 'Device Expert', 'Tool Specialist', 'Equipment King',
    'Net Thrower', 'Rope Master', 'Chain Specialist', 'Wire Expert', 'Binding King'
  ],

  // ================================
  // 👥 PROFISSÕES CIVIS (MEGA EXPANSÃO)
  // ================================
  civilianProfessions: [
    // Marítimas e Náuticas
    'Fisherman', 'Deep Sea Fisher', 'Tuna Specialist', 'Salmon Hunter', 'Crab Catcher', 'Lobster Trapper',
    'Sailor', 'Merchant Marine', 'Cargo Sailor', 'Passenger Sailor', 'Naval Sailor', 'Fishing Boat Sailor',
    'Navigator', 'Chart Maker', 'Course Plotter', 'Star Reader', 'Compass Master', 'Weather Predictor',
    'Shipwright', 'Hull Builder', 'Mast Maker', 'Sail Stitcher', 'Rope Weaver', 'Anchor Smith',
    'Dock Worker', 'Cargo Loader', 'Ship Unloader', 'Freight Handler', 'Container Mover', 'Crane Operator',
    'Harbor Master', 'Port Authority', 'Customs Officer', 'Immigration Control', 'Quarantine Inspector', 'Safety Officer',
    'Lighthouse Keeper', 'Beacon Tender', 'Signal Master', 'Warning System', 'Coast Guard', 'Sea Rescue',
    
    // Comerciais e Mercantis
    'Merchant', 'Traveling Trader', 'Import Specialist', 'Export Expert', 'Wholesale Dealer', 'Retail Seller',
    'Trader', 'Commodity Broker', 'Stock Dealer', 'Currency Exchanger', 'Precious Metal Dealer', 'Gem Trader',
    'Shop Owner', 'Store Keeper', 'Boutique Manager', 'Department Head', 'Chain Store Owner', 'Franchise Operator',
    'Market Vendor', 'Street Seller', 'Stall Keeper', 'Booth Operator', 'Cart Pusher', 'Mobile Merchant',
    'Innkeeper', 'Hotel Manager', 'Hostel Owner', 'Bed & Breakfast', 'Motel Operator', 'Lodge Keeper',
    'Bartender', 'Tavern Keeper', 'Pub Owner', 'Saloon Master', 'Wine Steward', 'Cocktail Mixer',
    'Cook', 'Chef', 'Sous Chef', 'Pastry Chef', 'Grill Master', 'Soup Maker', 'Bread Baker',
    'Baker', 'Pastry Maker', 'Cake Decorator', 'Bread Specialist', 'Donut Fryer', 'Cookie Baker',
    
    // Artesanais e Manufatureiros
    'Blacksmith', 'Weapon Smith', 'Tool Maker', 'Horseshoe Forger', 'Metal Worker', 'Iron Shaper',
    'Carpenter', 'Furniture Maker', 'Cabinet Builder', 'House Framer', 'Roof Builder', 'Floor Layer',
    'Tailor', 'Dress Maker', 'Suit Fitter', 'Clothing Designer', 'Fabric Cutter', 'Seamstress',
    'Jeweler', 'Ring Maker', 'Necklace Crafter', 'Bracelet Designer', 'Gem Cutter', 'Gold Smith',
    'Clockmaker', 'Watch Repairer', 'Time Keeper', 'Gear Maker', 'Spring Coiler', 'Pendulum Adjuster',
    'Instrument Maker', 'Violin Crafter', 'Piano Tuner', 'Guitar Builder', 'Drum Maker', 'Horn Shaper',
    'Artist', 'Painter', 'Sculptor', 'Drawer', 'Sketch Artist', 'Portrait Painter', 'Landscape Artist',
    'Sculptor', 'Stone Carver', 'Wood Sculptor', 'Metal Sculptor', 'Ice Carver', 'Clay Modeler',
    
    // Intelectuais e Acadêmicos
    'Scholar', 'Researcher', 'Academic', 'Intellectual', 'Thinker', 'Philosopher', 'Theorist',
    'Archaeologist', 'Dig Site Leader', 'Artifact Hunter', 'Ancient Civilization Expert', 'Ruin Explorer', 'Fossil Hunter',
    'Historian', 'Chronicle Keeper', 'Record Maintainer', 'Archive Manager', 'Timeline Creator', 'Event Recorder',
    'Librarian', 'Book Keeper', 'Archive Curator', 'Manuscript Preserver', 'Reading Specialist', 'Information Manager',
    'Teacher', 'Professor', 'Instructor', 'Educator', 'Tutor', 'Mentor', 'Coach', 'Trainer',
    'Doctor', 'Physician', 'Surgeon', 'Medic', 'Healer', 'Nurse', 'Therapist', 'Specialist',
    'Scientist', 'Researcher', 'Experimenter', 'Lab Technician', 'Data Analyst', 'Theory Developer',
    'Engineer', 'Designer', 'Builder', 'Constructor', 'Architect', 'Planner', 'Developer', 'Creator',
    
    // Entretenimento e Artes
    'Musician', 'Singer', 'Instrumentalist', 'Composer', 'Songwriter', 'Conductor', 'Band Leader',
    'Dancer', 'Choreographer', 'Ballet Dancer', 'Folk Dancer', 'Street Performer', 'Stage Dancer',
    'Actor', 'Performer', 'Stage Actor', 'Theater Performer', 'Drama Artist', 'Comedy Actor',
    'Storyteller', 'Narrator', 'Tale Spinner', 'Legend Keeper', 'Myth Teller', 'Fable Creator',
    'Circus Performer', 'Acrobat', 'Juggler', 'Tightrope Walker', 'Fire Breather', 'Sword Swallower',
    'Magician', 'Illusionist', 'Prestidigitator', 'Escape Artist', 'Mind Reader', 'Fortune Teller',
    'Comedian', 'Jester', 'Clown', 'Joke Teller', 'Humor Writer', 'Satirist', 'Mimic',
    
    // Rurais e Agrícolas
    'Farmer', 'Crop Grower', 'Vegetable Farmer', 'Fruit Grower', 'Grain Producer', 'Rice Cultivator',
    'Rancher', 'Cattle Rancher', 'Horse Breeder', 'Sheep Herder', 'Pig Farmer', 'Goat Keeper',
    'Hunter', 'Game Hunter', 'Deer Hunter', 'Bird Hunter', 'Tracker', 'Trapper', 'Poacher',
    'Lumberjack', 'Tree Cutter', 'Wood Chopper', 'Forest Worker', 'Timber Harvester', 'Log Splitter',
    'Miner', 'Coal Miner', 'Gold Prospector', 'Gem Digger', 'Ore Extractor', 'Quarry Worker',
    'Shepherd', 'Flock Tender', 'Sheep Herder', 'Goat Herder', 'Cattle Driver', 'Livestock Guardian',
    'Beekeeper', 'Honey Harvester', 'Hive Tender', 'Pollination Expert', 'Wax Collector', 'Queen Breeder',
    
    // Urbanas e Administrativas
    'Mayor', 'City Leader', 'Town Chief', 'Village Head', 'Municipal Manager', 'Local Governor',
    'Judge', 'Magistrate', 'Justice', 'Court Official', 'Legal Authority', 'Law Interpreter',
    'Lawyer', 'Attorney', 'Legal Counsel', 'Advocate', 'Defender', 'Prosecutor', 'Legal Advisor',
    'Banker', 'Money Lender', 'Credit Officer', 'Loan Specialist', 'Investment Advisor', 'Financial Planner',
    'Accountant', 'Bookkeeper', 'Financial Record Keeper', 'Tax Preparer', 'Auditor', 'Budget Analyst',
    'Messenger', 'Courier', 'Mail Carrier', 'Package Deliverer', 'Information Runner', 'News Bearer',
    'Guard', 'Security Officer', 'Protector', 'Defender', 'Sentry', 'Patrol Officer', 'Bouncer',
    'Watchman', 'Night Guard', 'Day Guard', 'Gate Keeper', 'Door Guard', 'Perimeter Patrol',
    
    // Serviços e Utilidades
    'Cleaner', 'Janitor', 'Housekeeper', 'Maid', 'Custodian', 'Maintenance Worker', 'Repair Person',
    'Barber', 'Hair Cutter', 'Stylist', 'Groomer', 'Beard Trimmer', 'Shave Master', 'Beauty Expert',
    'Launderer', 'Clothes Washer', 'Fabric Cleaner', 'Stain Remover', 'Dry Cleaner', 'Press Operator',
    'Delivery Person', 'Package Handler', 'Goods Transporter', 'Cargo Mover', 'Supply Runner', 'Errand Runner',
    'Taxi Driver', 'Cart Driver', 'Wagon Driver', 'Carriage Driver', 'Transport Operator', 'Vehicle Operator',
    
    // Especializados e Únicos
    'Weather Predictor', 'Fortune Teller', 'Crystal Ball Reader', 'Palm Reader', 'Tarot Card Reader', 'Astrologer',
    'Translator', 'Interpreter', 'Language Expert', 'Communication Specialist', 'Dialect Expert', 'Code Breaker',
    'Mapmaker', 'Cartographer', 'Chart Creator', 'Route Planner', 'Geography Expert', 'Terrain Mapper',
    'Inventor', 'Creator', 'Innovation Specialist', 'Problem Solver', 'Device Maker', 'Gadget Builder',
    'Spy', 'Secret Agent', 'Undercover Operative', 'Information Gatherer', 'Intelligence Collector', 'Surveillance Expert',
    
    // Religiosos e Espirituais
    'Priest', 'Minister', 'Cleric', 'Religious Leader', 'Spiritual Guide', 'Faith Keeper', 'Prayer Leader',
    'Monk', 'Hermit', 'Ascetic', 'Meditation Master', 'Enlightened One', 'Wisdom Keeper', 'Peace Seeker',
    'Oracle', 'Prophet', 'Seer', 'Visionary', 'Divine Speaker', 'Holy Messenger', 'Sacred Voice',
    
    // Médicos e Cura
    'Healer', 'Medicine Man', 'Herb Specialist', 'Potion Maker', 'Remedy Creator', 'Cure Finder',
    'Veterinarian', 'Animal Doctor', 'Beast Healer', 'Creature Caretaker', 'Pet Doctor', 'Livestock Medic',
    'Midwife', 'Birth Assistant', 'Baby Deliverer', 'Pregnancy Helper', 'New Life Bringer', 'Mother\'s Aid',
    
    // Transporte e Logística
    'Caravan Leader', 'Trade Route Manager', 'Supply Chain Coordinator', 'Logistics Expert', 'Distribution Manager',
    'Warehouse Manager', 'Storage Specialist', 'Inventory Keeper', 'Stock Manager', 'Supply Organizer',
    'Travel Guide', 'Tour Leader', 'Path Finder', 'Route Expert', 'Journey Planner', 'Adventure Guide'
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