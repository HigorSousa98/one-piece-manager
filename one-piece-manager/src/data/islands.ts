// src/data/devilFruits.ts

export interface IslandData {
  names: string[];
  difficulty: number; // 1 - 30
}

export const ISLANDS: IslandData[] = [
  
  { names: ['Foosha Village', 'Shells Town', 'Orange Town', 'Syrup Village'], difficulty: 1 },
    { names: ['Baratie', 'Arlong Park', 'Loguetown', 'Reverse Mountain'], difficulty: 2 },
    { names: ['Dawn Island', 'Goa Kingdom', 'Shimotsuki Village', 'Gecko Islands'], difficulty: 3 },
    { names: ['Sixis', 'Mirrorball Island', 'Nanimonai Island', 'Warship Island'], difficulty: 4 },
    { names: ['Clockwork Island', 'Crown Island', 'Hannabal', 'Lost Island'], difficulty: 5 },

    // Nível 6-15 (Paradise - Primeira metade da Grand Line)
    { names: ['Whisky Peak', 'Little Garden', 'Drum Island', 'Alabasta'], difficulty: 6 },
    { names: ['Jaya', 'Skypiea', 'Long Ring Long Land', 'Water 7'], difficulty: 7 },
    { names: ['Enies Lobby', 'Thriller Bark', 'Sabaody Archipelago', 'Amazon Lily'], difficulty: 8 },
    { names: ['Kuraigana Island', 'Weatheria', 'Kamabakka Kingdom', 'Torino Kingdom'], difficulty: 9 },
    { names: ['Bowin Islands', 'Namakura Island', 'Peachy Island', 'Momoiro Island'], difficulty: 10 },
    { names: ['Baltigo', 'Foolshout Island', 'Minion Island', 'Swallow Island'], difficulty: 11 },
    { names: ['St. Poplar', 'Centaurea', 'Rakesh', 'Kenzan Island'], difficulty: 12 },
    { names: ['Cactus Island', 'Kyuka Island', 'Nanimonai Island', 'Banaro Island'], difficulty: 13 },
    { names: ['Impel Down', 'Marineford', 'Post-War Arc', 'Return to Sabaody'], difficulty: 14 },
    { names: ['Sabaody Park', 'Grove 1', 'Grove 13', 'Grove 46'], difficulty: 15 },

    // Nível 16-25 (New World)
    { names: ['Fishman Island', 'Punk Hazard', 'Dressrosa', 'Green Bit'], difficulty: 16 },
    { names: ['Zou', 'Whole Cake Island', 'Cacao Island', 'Jam Island'], difficulty: 17 },
    { names: ['Nuts Island', 'Cheese Island', 'Biscuits Island', 'Candy Island'], difficulty: 18 },
    { names: ['Wano Country', 'Onigashima', 'Ringo', 'Kuri'], difficulty: 19 },
    { names: ['Udon', 'Kibi', 'Hakumai', 'Flower Capital'], difficulty: 20 },
    { names: ['Egghead', 'Elbaf', 'Hachinosu', 'Winner Island'], difficulty: 21 },
    { names: ['Fullalead', 'Sphinx', 'Foodvalten', 'Broc Coli Island'], difficulty: 22 },
    { names: ['Rusukaina', 'Kuraigana Island', 'Momoiro Island', 'Weatheria'], difficulty: 23 },
    { names: ['Tequila Wolf', 'Karakuri Island', 'Birdie Kingdom', 'Namakura Island'], difficulty: 24 },
    { names: ['God Valley', 'Lodestar Island', 'Risky Red Island', 'Mystoria Island'], difficulty: 25 },

    // Nível 26-30 (End Game)
    { names: ['Beehive Island', 'Pirate Island', 'Navy G-1', 'Revolutionary Army HQ'], difficulty: 26 },
    { names: ['Mary Geoise', 'Pangaea Castle', 'Red Port', 'Holy Land'], difficulty: 27 },
    { names: ['Mariejois Underground', 'Celestial Dragon District', 'Government Facility', 'World Noble Area'], difficulty: 28 },
    { names: ['Imu\'s Chamber', 'Empty Throne Room', 'National Treasure Vault', 'Ancient Weapon Facility'], difficulty: 29 },
    { names: ['Laugh Tale', 'Roadstar Island', 'Final Island', 'One Piece Location'], difficulty: 30 }
];

export default ISLANDS;