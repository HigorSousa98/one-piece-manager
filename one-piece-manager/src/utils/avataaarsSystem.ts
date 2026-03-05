// src/utils/avataaarsSystem.ts
import type { Character } from '@/utils/database'
import {
  type AvataaarsConfig,
  AVATAAARS_THEME_CONFIGS,
  SKIN_COLOR_MAP,
  HAIR_COLOR_MAP,
  KINDNESS_EXPRESSION_MAP,
  POWER_EXPRESSION_MAP,
  validateAvataaarsConfig,
  createDefaultAvataaarsConfig,
} from './avataaarsConfig'

export class AvataaarsOnePieceSystem {
  // 🎨 GERAR CONFIGURAÇÃO BASEADA NO PERSONAGEM
  static generateConfig(character: Character): AvataaarsConfig {
    try {
      const characterType = character.type as keyof typeof AVATAAARS_THEME_CONFIGS
      const themeConfig =
        AVATAAARS_THEME_CONFIGS[characterType] || AVATAAARS_THEME_CONFIGS['Civilian']

      // Usar ID do personagem como seed para consistência
      const seed = character.id || 1

      const config: AvataaarsConfig = {
        // Características físicas baseadas em atributos
        skinColor: this.getSkinColorFromKindness(character.kindness || 0),
        hairColor: this.getHairColorFromLevel(character.level),
        facialHairColor: this.getHairColorFromLevel(character.level),

        // Estilos baseados no tipo
        topType: this.selectFromArray(themeConfig.topTypes, seed),
        clotheType: this.selectFromArray(themeConfig.clotheTypes, seed + 1),
        clotheColor: this.selectFromArray(themeConfig.clotheColors, seed + 2),
        accessoriesType: this.selectFromArray(themeConfig.accessoriesTypes, seed + 3),
        hatColor: this.selectFromArray(themeConfig.hatColors, seed + 4),
        facialHairType: this.selectFromArray(themeConfig.facialHairTypes, seed + 5),
        graphicType: this.selectFromArray(themeConfig.graphicTypes, seed + 6),

        // Características faciais baseadas em stats
        eyeType: this.getExpressionFromKindness(character.kindness || 0).eyeType,
        eyebrowType: this.getExpressionFromKindness(character.kindness || 0).eyebrowType,
        mouthType: this.getExpressionFromKindness(character.kindness || 0).mouthType,
      }

      // Validar configuração
      if (!validateAvataaarsConfig(config)) {
        console.warn('⚠️ Configuração inválida, usando padrão')
        return createDefaultAvataaarsConfig()
      }

      return config
    } catch (error) {
      console.error('❌ Erro ao gerar configuração:', error)
      return createDefaultAvataaarsConfig()
    }
  }

  // 🌈 CORES BASEADAS EM ATRIBUTOS
  private static getSkinColorFromKindness(kindness: number) {
    const index = Math.abs(kindness + 100) % Object.keys(SKIN_COLOR_MAP).length
    return SKIN_COLOR_MAP[index]
  }

  private static getHairColorFromLevel(level: number) {
    const index = level % Object.keys(HAIR_COLOR_MAP).length
    return HAIR_COLOR_MAP[index]
  }

  // 😊 EXPRESSÕES BASEADAS EM KINDNESS
  private static getExpressionFromKindness(kindness: number) {
    if (kindness > 75) return KINDNESS_EXPRESSION_MAP.veryHappy
    if (kindness > 25) return KINDNESS_EXPRESSION_MAP.happy
    if (kindness > -25) return KINDNESS_EXPRESSION_MAP.neutral
    if (kindness > -75) return KINDNESS_EXPRESSION_MAP.serious
    return KINDNESS_EXPRESSION_MAP.angry
  }

  // 🎲 SELEÇÃO DETERMINÍSTICA
  private static selectFromArray<T>(array: T[], seed: number): T {
    const index = seed % array.length
    return array[index]
  }

  // 🔗 GERAR URL DO AVATAAARS
  static generateAvatarUrl(config: AvataaarsConfig): string {
    const baseUrl = 'https://avataaars.io/'

    const params = new URLSearchParams({
      avatarStyle: 'Transparent',
      topType: config.topType,
      accessoriesType: config.accessoriesType,
      hatColor: config.hatColor,
      hairColor: config.hairColor,
      facialHairType: config.facialHairType,
      facialHairColor: config.facialHairColor,
      clotheType: config.clotheType,
      clotheColor: config.clotheColor,
      graphicType: config.graphicType,
      eyeType: config.eyeType,
      eyebrowType: config.eyebrowType,
      mouthType: config.mouthType,
      skinColor: config.skinColor,
    })

    return `${baseUrl}?${params.toString()}`
  }

  // 🔄 GERAR VARIAÇÃO DO AVATAR
  static generateVariation(character: Character, variationSeed: number = 0): string {
    const baseConfig = this.generateConfig(character)

    // Aplicar variação mantendo a temática
    const characterType = character.type as keyof typeof AVATAAARS_THEME_CONFIGS
    const themeConfig =
      AVATAAARS_THEME_CONFIGS[characterType] || AVATAAARS_THEME_CONFIGS['Civilian']
    const seed = (character.id || 1) + variationSeed

    // Variar apenas alguns elementos
    baseConfig.topType = this.selectFromArray(themeConfig.topTypes, seed + 10)
    baseConfig.clotheColor = this.selectFromArray(themeConfig.clotheColors, seed + 11)
    baseConfig.accessoriesType = this.selectFromArray(themeConfig.accessoriesTypes, seed + 12)

    return this.generateAvatarUrl(baseConfig)
  }

  // 🎯 GERAR AVATAR PRINCIPAL
  static generateAvatar(character: Character): string {
    const config = this.generateConfig(character)
    return this.generateAvatarUrl(config)
  }
}
