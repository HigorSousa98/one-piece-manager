// src/utils/avataaarsConfig.ts
export interface AvataaarsConfig {
  // Características físicas básicas
  skinColor: AvataarsSkinColor
  hairColor: AvataaarsHairColor
  facialHairColor: AvataaarsHairColor
  
  // Estilos de cabelo e acessórios
  topType: AvataaarsTopType
  accessoriesType: AvataaarsAccessoriesType
  hatColor: AvataaarsHatColor
  
  // Roupas
  clotheType: AvataaarsClothesType
  clotheColor: AvataaarsClothesColor
  graphicType: AvataaarsGraphicType
  
  // Características faciais
  eyeType: AvataaarsEyeType
  eyebrowType: AvataaarsEyebrowType
  mouthType: AvataarsMouthType
  facialHairType: AvataarsFacialHairType
}

// 🎨 TIPOS DE CORES DE PELE
export type AvataarsSkinColor = 
  | 'Tanned'
  | 'Yellow'
  | 'Pale'
  | 'Light'
  | 'Brown'
  | 'DarkBrown'
  | 'Black'

// 💇 TIPOS DE CABELO
export type AvataaarsTopType = 
  | 'NoHair'
  | 'Eyepatch'
  | 'Hat'
  | 'Hijab'
  | 'Turban'
  | 'WinterHat1'
  | 'WinterHat2'
  | 'WinterHat3'
  | 'WinterHat4'
  | 'LongHairBigHair'
  | 'LongHairBob'
  | 'LongHairBun'
  | 'LongHairCurly'
  | 'LongHairCurvy'
  | 'LongHairDreads'
  | 'LongHairFrida'
  | 'LongHairFro'
  | 'LongHairFroBand'
  | 'LongHairNotTooLong'
  | 'LongHairShavedSides'
  | 'LongHairMiaWallace'
  | 'LongHairStraight'
  | 'LongHairStraight2'
  | 'LongHairStraightStrand'
  | 'ShortHairDreads01'
  | 'ShortHairDreads02'
  | 'ShortHairFrizzle'
  | 'ShortHairShaggyMullet'
  | 'ShortHairShortCurly'
  | 'ShortHairShortFlat'
  | 'ShortHairShortRound'
  | 'ShortHairShortWaved'
  | 'ShortHairSides'
  | 'ShortHairTheCaesar'
  | 'ShortHairTheCaesarSidePart'

// 🌈 CORES DE CABELO
export type AvataaarsHairColor = 
  | 'Auburn'
  | 'Black'
  | 'Blonde'
  | 'BlondeGolden'
  | 'Brown'
  | 'BrownDark'
  | 'PastelPink'
  | 'Blue'
  | 'Platinum'
  | 'Red'
  | 'SilverGray'

// 🕶️ ACESSÓRIOS
export type AvataaarsAccessoriesType = 
  | 'Blank'
  | 'Kurt'
  | 'Prescription01'
  | 'Prescription02'
  | 'Round'
  | 'Sunglasses'
  | 'Wayfarers'

// �� CORES DE CHAPÉU
export type AvataaarsHatColor = 
  | 'Black'
  | 'Blue01'
  | 'Blue02'
  | 'Blue03'
  | 'Gray01'
  | 'Gray02'
  | 'Heather'
  | 'PastelBlue'
  | 'PastelGreen'
  | 'PastelOrange'
  | 'PastelRed'
  | 'PastelYellow'
  | 'Pink'
  | 'Red'
  | 'White'

// 👕 TIPOS DE ROUPA
export type AvataaarsClothesType = 
  | 'BlazerShirt'
  | 'BlazerSweater'
  | 'CollarSweater'
  | 'GraphicShirt'
  | 'Hoodie'
  | 'Overall'
  | 'ShirtCrewNeck'
  | 'ShirtScoopNeck'
  | 'ShirtVNeck'

// 🎨 CORES DE ROUPA
export type AvataaarsClothesColor = 
  | 'Black'
  | 'Blue01'
  | 'Blue02'
  | 'Blue03'
  | 'Gray01'
  | 'Gray02'
  | 'Heather'
  | 'PastelBlue'
  | 'PastelGreen'
  | 'PastelOrange'
  | 'PastelRed'
  | 'PastelYellow'
  | 'Pink'
  | 'Red'
  | 'White'

// 🖼️ GRÁFICOS NA ROUPA
export type AvataaarsGraphicType = 
  | 'Bat'
  | 'Cumbia'
  | 'Deer'
  | 'Diamond'
  | 'Hola'
  | 'Pizza'
  | 'Resist'
  | 'Selena'
  | 'Bear'
  | 'SkullOutline'
  | 'Skull'

// 👁️ TIPOS DE OLHOS
export type AvataaarsEyeType = 
  | 'Close'
  | 'Cry'
  | 'Default'
  | 'Dizzy'
  | 'EyeRoll'
  | 'Happy'
  | 'Hearts'
  | 'Side'
  | 'Squint'
  | 'Surprised'
  | 'Wink'
  | 'WinkWacky'

// 🤨 TIPOS DE SOBRANCELHA
export type AvataaarsEyebrowType = 
  | 'Angry'
  | 'AngryNatural'
  | 'Default'
  | 'DefaultNatural'
  | 'FlatNatural'
  | 'RaisedExcited'
  | 'RaisedExcitedNatural'
  | 'SadConcerned'
  | 'SadConcernedNatural'
  | 'UnibrowNatural'
  | 'UpDown'
  | 'UpDownNatural'

// 😄 TIPOS DE BOCA
export type AvataarsMouthType = 
  | 'Concerned'
  | 'Default'
  | 'Disbelief'
  | 'Eating'
  | 'Grimace'
  | 'Sad'
  | 'ScreamOpen'
  | 'Serious'
  | 'Smile'
  | 'Tongue'
  | 'Twinkle'
  | 'Vomit'

// 🧔 TIPOS DE BARBA/BIGODE
export type AvataarsFacialHairType = 
  | 'Blank'
  | 'BeardMedium'
  | 'BeardLight'
  | 'BeardMajestic'
  | 'MoustacheFancy'
  | 'MoustacheMagnum'

// �� CONFIGURAÇÕES TEMÁTICAS POR TIPO DE PERSONAGEM
export const AVATAAARS_THEME_CONFIGS = {
  'Pirate': {
    topTypes: ['LongHairStraight', 'LongHairCurly', 'ShortHairShaggyMullet', 'Hat', 'NoHair', 'Eyepatch', 'LongHairDreads', 'LongHairFro', 'LongHairShavedSides', 'ShortHairDreads01', 'ShortHairDreads02', 'ShortHairFrizzle', 'ShortHairShortCurly', 'ShortHairShortFlat', 'ShortHairShortRound', ''] as AvataaarsTopType[],
    clotheTypes: ['BlazerShirt', 'GraphicShirt', 'Overall', 'ShirtCrewNeck', 'Hoodie'] as AvataaarsClothesType[],
    clotheColors: ['Red', 'Black', 'Blue01', 'Brown', 'Gray01', 'Blue02', 'Blue03', 'Gray02', 'Heather', 'PastelBlue', ] as AvataaarsClothesColor[],
    accessoriesTypes: ['Blank', 'Prescription01', 'Round', 'Sunglasses', 'Wayfarers'] as AvataaarsAccessoriesType[],
    hatColors: ['Black', 'Red', 'Blue01', 'Brown', 'Blonde', 'BlondeGolden', 'Platinum', 'SilverGray'] as AvataaarsHatColor[],
    facialHairTypes: ['BeardMedium', 'BeardLight', 'MoustacheFancy', 'MoustacheMagnum', 'Blank', 'BeardMajestic'] as AvataarsFacialHairType[],
    graphicTypes: ['Skull', 'SkullOutline', 'Bear', 'Diamond', 'Resist'] as AvataaarsGraphicType[],
    eyeTypes: ['Default', 'Happy', 'Squint', 'Side', 'Wink'] as AvataaarsEyeType[],
    mouthTypes: ['Smile', 'Default', 'Serious', 'Grimace'] as AvataarsMouthType[]
  },
  
  'Marine': {
    topTypes: ['LongHairStraight', 'LongHairCurly', 'ShortHairShaggyMullet', 'Hat', 'NoHair', 'Eyepatch', 'LongHairDreads', 'LongHairFro', 'LongHairShavedSides', 'ShortHairDreads01', 'ShortHairDreads02', 'ShortHairFrizzle', 'ShortHairShortCurly', 'ShortHairShortFlat', 'ShortHairShortRound', ''] as AvataaarsTopType[],
    clotheTypes: ['BlazerSweater', 'CollarSweater', 'ShirtCrewNeck', 'BlazerShirt'] as AvataaarsClothesType[],
    clotheColors: ['Red', 'Black', 'Blue01', 'Brown', 'Gray01', 'Blue02', 'Blue03', 'Gray02', 'Heather', 'PastelBlue', ] as AvataaarsClothesColor[],
    accessoriesTypes: ['Blank', 'Prescription01', 'Prescription02', 'Round'] as AvataaarsAccessoriesType[],
    hatColors: ['Black', 'Red', 'Blue01', 'Brown', 'Blonde', 'BlondeGolden', 'Platinum', 'SilverGray'] as AvataaarsHatColor[],
    facialHairTypes: ['BeardMedium', 'BeardLight', 'MoustacheFancy', 'MoustacheMagnum', 'Blank', 'BeardMajestic'] as AvataarsFacialHairType[],
    graphicTypes: ['Resist', 'Bear', 'Diamond'] as AvataaarsGraphicType[],
    eyeTypes: ['Default', 'Happy', 'Serious'] as AvataaarsEyeType[],
    mouthTypes: ['Default', 'Smile', 'Serious'] as AvataarsMouthType[]
  },
  
  'Government': {
    topTypes: ['LongHairStraight', 'LongHairCurly', 'ShortHairShaggyMullet', 'Hat', 'NoHair', 'Eyepatch', 'LongHairDreads', 'LongHairFro', 'LongHairShavedSides', 'ShortHairDreads01', 'ShortHairDreads02', 'ShortHairFrizzle', 'ShortHairShortCurly', 'ShortHairShortFlat', 'ShortHairShortRound', ''] as AvataaarsTopType[],
    clotheTypes: ['BlazerSweater', 'BlazerShirt', 'CollarSweater', 'ShirtVNeck'] as AvataaarsClothesType[],
    clotheColors: ['Red', 'Black', 'Blue01', 'Brown', 'Gray01', 'Blue02', 'Blue03', 'Gray02', 'Heather', 'PastelBlue', ] as AvataaarsClothesColor[],
    accessoriesTypes: ['Prescription01', 'Prescription02', 'Round', 'Sunglasses'] as AvataaarsAccessoriesType[],
    hatColors: ['Black', 'Red', 'Blue01', 'Brown', 'Blonde', 'BlondeGolden', 'Platinum', 'SilverGray'] as AvataaarsHatColor[],
    facialHairTypes: ['BeardMedium', 'BeardLight', 'MoustacheFancy', 'MoustacheMagnum', 'Blank', 'BeardMajestic'] as AvataarsFacialHairType[],
    graphicTypes: ['Resist', 'Diamond'] as AvataaarsGraphicType[],
    eyeTypes: ['Default', 'Serious', 'Squint'] as AvataaarsEyeType[],
    mouthTypes: ['Default', 'Serious', 'Concerned'] as AvataarsMouthType[]
  },
  
  'BountyHunter': {
    topTypes: ['LongHairStraight', 'LongHairCurly', 'ShortHairShaggyMullet', 'Hat', 'NoHair', 'Eyepatch', 'LongHairDreads', 'LongHairFro', 'LongHairShavedSides', 'ShortHairDreads01', 'ShortHairDreads02', 'ShortHairFrizzle', 'ShortHairShortCurly', 'ShortHairShortFlat', 'ShortHairShortRound', ''] as AvataaarsTopType[],
    clotheTypes: ['GraphicShirt', 'Overall', 'ShirtCrewNeck', 'BlazerShirt', 'Hoodie'] as AvataaarsClothesType[],
    clotheColors: ['Red', 'Black', 'Blue01', 'Brown', 'Gray01', 'Blue02', 'Blue03', 'Gray02', 'Heather', 'PastelBlue', ] as AvataaarsClothesColor[],
    accessoriesTypes: ['Sunglasses', 'Wayfarers', 'Round', 'Blank'] as AvataaarsAccessoriesType[],
    hatColors: ['Black', 'Red', 'Blue01', 'Brown', 'Blonde', 'BlondeGolden', 'Platinum', 'SilverGray'] as AvataaarsHatColor[],
    facialHairTypes: ['BeardMedium', 'BeardLight', 'MoustacheFancy', 'MoustacheMagnum', 'Blank', 'BeardMajestic'] as AvataarsFacialHairType[],
    graphicTypes: ['Skull', 'SkullOutline', 'Diamond', 'Bear'] as AvataaarsGraphicType[],
    eyeTypes: ['Default', 'Squint', 'Side', 'Happy'] as AvataaarsEyeType[],
    mouthTypes: ['Default', 'Smile', 'Serious', 'Grimace'] as AvataarsMouthType[]
  },
  
  'Civillian': {
    topTypes: ['LongHairStraight', 'LongHairCurly', 'ShortHairShaggyMullet', 'Hat', 'NoHair', 'Eyepatch', 'LongHairDreads', 'LongHairFro', 'LongHairShavedSides', 'ShortHairDreads01', 'ShortHairDreads02', 'ShortHairFrizzle', 'ShortHairShortCurly', 'ShortHairShortFlat', 'ShortHairShortRound', ''] as AvataaarsTopType[],
    clotheTypes: ['ShirtCrewNeck', 'ShirtScoopNeck', 'CollarSweater', 'GraphicShirt'] as AvataaarsClothesType[],
    clotheColors: ['Red', 'Black', 'Blue01', 'Brown', 'Gray01', 'Blue02', 'Blue03', 'Gray02', 'Heather', 'PastelBlue', ] as AvataaarsClothesColor[],
    accessoriesTypes: ['Blank', 'Prescription01', 'Round'] as AvataaarsAccessoriesType[],
    hatColors: ['Black', 'Red', 'Blue01', 'Brown', 'Blonde', 'BlondeGolden', 'Platinum', 'SilverGray'] as AvataaarsHatColor[],
    facialHairTypes: ['BeardMedium', 'BeardLight', 'MoustacheFancy', 'MoustacheMagnum', 'Blank', 'BeardMajestic'] as AvataarsFacialHairType[],
    graphicTypes: ['Bear', 'Pizza', 'Deer', 'Diamond'] as AvataaarsGraphicType[],
    eyeTypes: ['Default', 'Happy', 'Hearts', 'Smile'] as AvataaarsEyeType[],
    mouthTypes: ['Default', 'Smile', 'Happy', 'Twinkle'] as AvataarsMouthType[]
  }
} as const

// �� MAPEAMENTO DE CORES BASEADO EM ATRIBUTOS
export const SKIN_COLOR_MAP: Record<number, AvataarsSkinColor> = {
  0: 'Light',
  1: 'Yellow', 
  2: 'Pale',
  3: 'Tanned',
  4: 'Brown',
  5: 'DarkBrown',
  6: 'Black'
}

export const HAIR_COLOR_MAP: Record<number, AvataaarsHairColor> = {
  0: 'Auburn',
  1: 'Black',
  2: 'Blonde', 
  3: 'BlondeGolden',
  4: 'Brown',
  5: 'BrownDark',
  6: 'PastelPink',
  7: 'Blue',
  8: 'Platinum',
  9: 'Red',
  10: 'SilverGray'
}

// 😊 EXPRESSÕES BASEADAS EM KINDNESS
export const KINDNESS_EXPRESSION_MAP = {
  veryHappy: { // kindness > 75
    eyeType: 'Side' as AvataaarsEyeType,
    eyebrowType: 'RaisedExcited' as AvataaarsEyebrowType,
    mouthType: 'Smile' as AvataarsMouthType
  },
  happy: { // kindness > 25
    eyeType: 'Happy' as AvataaarsEyeType,
    eyebrowType: 'RaisedExcitedNatural' as AvataaarsEyebrowType,
    mouthType: 'Smile' as AvataarsMouthType
  },
  neutral: { // kindness -25 to 25
    eyeType: 'Default' as AvataaarsEyeType,
    eyebrowType: 'Default' as AvataaarsEyebrowType,
    mouthType: 'Default' as AvataarsMouthType
  },
  serious: { // kindness < -25
    eyeType: 'Squint' as AvataaarsEyeType,
    eyebrowType: 'SadConcerned' as AvataaarsEyebrowType,
    mouthType: 'Serious' as AvataarsMouthType
  },
  angry: { // kindness < -75
    eyeType: 'Side' as AvataaarsEyeType,
    eyebrowType: 'Angry' as AvataaarsEyebrowType,
    mouthType: 'Grimace' as AvataarsMouthType
  }
}

// 💪 EXPRESSÕES BASEADAS EM PODER
export const POWER_EXPRESSION_MAP = {
  legendary: { // poder muito alto
    eyeType: 'Hearts' as AvataaarsEyeType,
    eyebrowType: 'RaisedExcited' as AvataaarsEyebrowType
  },
  strong: { // poder alto
    eyeType: 'Happy' as AvataaarsEyeType,
    eyebrowType: 'Default' as AvataaarsEyebrowType
  },
  average: { // poder médio
    eyeType: 'Default' as AvataaarsEyeType,
    eyebrowType: 'DefaultNatural' as AvataaarsEyebrowType
  },
  weak: { // poder baixo
    eyeType: 'Squint' as AvataaarsEyeType,
    eyebrowType: 'SadConcerned' as AvataaarsEyebrowType
  }
}

// 🎯 FUNÇÃO PARA VALIDAR CONFIGURAÇÃO
export function validateAvataaarsConfig(config: AvataaarsConfig): boolean {
  try {
    // Verificar se todos os campos obrigatórios estão presentes
    const requiredFields: (keyof AvataaarsConfig)[] = [
      'skinColor', 'hairColor', 'topType', 'clotheType', 
      'eyeType', 'eyebrowType', 'mouthType'
    ]
    
    for (const field of requiredFields) {
      if (!config[field]) {
        console.warn(`❌ Campo obrigatório ausente: ${field}`)
        return false
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Erro ao validar configuração do avatar:', error)
    return false
  }
}

// 🔧 FUNÇÃO PARA CRIAR CONFIGURAÇÃO PADRÃO
export function createDefaultAvataaarsConfig(): AvataaarsConfig {
  return {
    skinColor: 'Light',
    hairColor: 'Brown',
    facialHairColor: 'Brown',
    topType: 'ShortHairShortFlat',
    accessoriesType: 'Blank',
    hatColor: 'Blue01',
    clotheType: 'ShirtCrewNeck',
    clotheColor: 'Blue01',
    graphicType: 'Bear',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    facialHairType: 'Blank'
  }
}