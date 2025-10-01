// src/utils/avatarGenerationSystem.ts

import { db, type Character, type DevilFruit, type AvatarComponents, type Avatar } from './database'

export interface GeneratedAvatar {
  id: string
  characterId: number
  svgData: string
  components: AvatarComponents
  createdAt: Date
  version: number
}

export class AvatarGenerationSystem {
  
  // ✅ GERAR AVATAR COMPLETO
  static async generateAvatar(character: Character): Promise<GeneratedAvatar> {
    try {
      // Verificar se já existe avatar
      const existingAvatar = await this.getExistingAvatar(character.id!)
      if (existingAvatar) {
        return {
          id: existingAvatar.id!.toString(),
          characterId: existingAvatar.characterId,
          svgData: existingAvatar.svgData,
          components: existingAvatar.components,
          createdAt: existingAvatar.createdAt,
          version: existingAvatar.version
        }
      }
      
      // Gerar componentes baseados no personagem
      const components = await this.generateComponents(character)
      
      // Construir SVG
      const svgData = this.buildSVG(components)
      
      // Salvar no banco
      const avatar: Omit<Avatar, 'id'> = {
        characterId: character.id!,
        svgData,
        components,
        createdAt: new Date(),
        version: 1
      }
      
      const avatarId = await db.avatars.add(avatar)
      
      return {
        id: avatarId.toString(),
        characterId: character.id!,
        svgData,
        components,
        createdAt: new Date(),
        version: 1
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar avatar:', error)
      throw error
    }
  }
  
  // ✅ GERAR COMPONENTES BASEADOS NO PERSONAGEM
  private static async generateComponents(character: Character): Promise<AvatarComponents> {
    const seed = this.createSeed(character)
    const devilFruit = character.devilFruitId ? await db.devilFruits.get(character.devilFruitId) : null
    
    return {
      face: this.generateFace(character, seed),
      eyes: this.generateEyes(character, seed),
      hair: this.generateHair(character, seed),
      clothing: this.generateClothing(character, seed),
      scars: this.generateScars(character, seed),
      devilFruit: this.generateDevilFruitElements(character, devilFruit, seed),
      background: this.generateBackground(character, seed)
    }
  }
  
  // ✅ CRIAR SEED BASEADO NO PERSONAGEM
  private static createSeed(character: Character): number {
    const nameHash = character.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const statsHash = Object.values(character.stats).reduce((acc, stat) => acc + stat, 0)
    return nameHash + statsHash + character.level + character.kindness
  }
  
  // ✅ GERAR ROSTO
  private static generateFace(character: Character, seed: number): AvatarComponents['face'] {
    const random = this.seededRandom(seed, 'face')
    
    const shapes = ['round', 'oval', 'square', 'heart'] as const
    const shape = shapes[Math.floor(random() * shapes.length)]
    
    // Tons de pele variados
    const skinTones = [
      '#FDBCB4', '#F1C27D', '#E0AC69', '#C68642', 
      '#8D5524', '#A0522D', '#DEB887', '#F5DEB3'
    ]
    const skinTone = skinTones[Math.floor(random() * skinTones.length)]
    
    // Expressão baseada em kindness e tipo
    let expression: AvatarComponents['face']['expression'] = 'neutral'
    
    if (character.kindness > 50) expression = 'kind'
    else if (character.kindness < -20) expression = 'angry'
    else if (character.type === 'Marine') expression = 'serious'
    else if (character.type === 'Government') expression = 'mysterious'
    else if (character.level > 30) expression = 'confident'
    
    return { shape, skinTone, expression }
  }
  
  // ✅ GERAR OLHOS
  private static generateEyes(character: Character, seed: number): AvatarComponents['eyes'] {
    const random = this.seededRandom(seed, 'eyes')
    
    const shapes = ['normal', 'sharp', 'round', 'narrow', 'wide'] as const
    const shape = shapes[Math.floor(random() * shapes.length)]
    
    // Cores de olhos variadas
    const eyeColors = [
      '#8B4513', '#654321', '#2E8B57', '#4169E1', 
      '#32CD32', '#FF6347', '#9932CC', '#000000'
    ]
    const color = eyeColors[Math.floor(random() * eyeColors.length)]
    
    // Óculos baseado em inteligência (stats de observation haki)
    const hasGlasses = character.stats.obsHaki > 20 && random() > 0.7
    
    // Tapa-olho para piratas veteranos
    const eyepatch = character.type === 'Pirate' && character.level > 40 && random() > 0.85
    
    return { shape, color, hasGlasses, eyepatch }
  }
  
  // ✅ GERAR CABELO
  private static generateHair(character: Character, seed: number): AvatarComponents['hair'] {
    const random = this.seededRandom(seed, 'hair')
    
    // Estilos de cabelo anime
    const hairStyles = [
      'spiky', 'straight', 'wavy', 'curly', 'messy', 'slicked', 
      'ponytail', 'short_messy', 'long_straight', 'afro', 'buzz_cut'
    ]
    const style = hairStyles[Math.floor(random() * hairStyles.length)]
    
    // Cores de cabelo anime
    const hairColors = [
      '#000000', '#8B4513', '#FFD700', '#FF6347', '#32CD32', 
      '#4169E1', '#9932CC', '#FF1493', '#00CED1', '#FFA500'
    ]
    const color = hairColors[Math.floor(random() * hairColors.length)]
    
    const lengths = ['short', 'medium', 'long'] as const
    const length = lengths[Math.floor(random() * lengths.length)]
    
    // Chapéu baseado no tipo
    let hasHat = false
    if (character.type === 'Marine' && random() > 0.3) hasHat = true
    else if (character.type === 'Pirate' && random() > 0.6) hasHat = true
    else if (character.type === 'Government' && random() > 0.8) hasHat = true
    
    return { style, color, length, hasHat }
  }
  
  // ✅ GERAR ROUPAS
  private static generateClothing(character: Character, seed: number): AvatarComponents['clothing'] {
    const random = this.seededRandom(seed, 'clothing')
    
    let type: AvatarComponents['clothing']['type']
    let color: string
    let accessories: string[] = []
    
    switch (character.type) {
      case 'Marine':
        type = 'marine'
        color = random() > 0.5 ? '#000080' : '#FFFFFF' // Azul marinho ou branco
        accessories = ['anchor_pin', 'rank_insignia']
        if (character.level > 30) accessories.push('medals')
        break
        
      case 'Government':
        type = 'government'
        color = random() > 0.5 ? '#000000' : '#2F4F4F' // Preto ou cinza escuro
        accessories = ['government_badge', 'tie']
        if (character.level > 25) accessories.push('sunglasses')
        break
        
      case 'Pirate':
        type = 'pirate'
        const pirateColors = ['#8B0000', '#000000', '#4B0082', '#8B4513']
        color = pirateColors[Math.floor(random() * pirateColors.length)]
        accessories = ['belt', 'bandana']
        if (random() > 0.7) accessories.push('vest')
        break
        
      case 'BountyHunter':
        type = 'bounty_hunter'
        const hunterColors = ['#556B2F', '#8B4513', '#2F4F4F', '#000000']
        color = hunterColors[Math.floor(random() * hunterColors.length)]
        accessories = ['holster', 'belt', 'gloves']
        break
        
      default: // Civilian
        type = 'civilian'
        const civilColors = ['#87CEEB', '#DDA0DD', '#98FB98', '#F0E68C']
        color = civilColors[Math.floor(random() * civilColors.length)]
        accessories = []
        if (random() > 0.8) accessories.push('necklace')
    }
    
    return { type, color, accessories }
  }
  
  // ✅ GERAR CICATRIZES
  private static generateScars(character: Character, seed: number): AvatarComponents['scars'] {
    const random = this.seededRandom(seed, 'scars')
    
    // Chance de cicatrizes baseada em level e tipo
    let scarChance = 0.1
    if (character.type === 'Pirate') scarChance += 0.2
    if (character.type === 'BountyHunter') scarChance += 0.15
    if (character.level > 30) scarChance += 0.2
    if (character.level > 50) scarChance += 0.3
    
    const face = random() < scarChance
    const faceTypes = ['cross', 'vertical', 'horizontal', 'diagonal', 'none'] as const
    const faceType = face ? faceTypes[Math.floor(random() * (faceTypes.length - 1))] : 'none'
    
    const body = random() < scarChance * 0.5
    
    return { face, faceType, body }
  }
  
  // ✅ GERAR ELEMENTOS DE DEVIL FRUIT
  private static generateDevilFruitElements(
    character: Character, 
    devilFruit: DevilFruit | null, 
    seed: number
  ): AvatarComponents['devilFruit'] {
    if (!devilFruit || character.stats.devilFruit === 0) {
      return { hasSymbol: false, symbolType: null, glowEffect: false }
    }
    
    const random = this.seededRandom(seed, 'devilFruit')
    
    return {
      hasSymbol: random() > 0.3, // 70% chance de mostrar símbolo
      symbolType: devilFruit.type.toLowerCase() as 'paramecia' | 'zoan' | 'logia',
      glowEffect: character.stats.devilFruit > 15 // Efeito brilho para usuários avançados
    }
  }
  
  // ✅ GERAR BACKGROUND
  private static generateBackground(character: Character, seed: number): AvatarComponents['background'] {
    const random = this.seededRandom(seed, 'background')
    
    // Cores baseadas no tipo
    const backgroundColors = {
      Marine: ['#000080', '#4169E1', '#1E90FF'],
      Government: ['#2F4F4F', '#696969', '#000000'],
      Pirate: ['#8B0000', '#DC143C', '#4B0082'],
      BountyHunter: ['#556B2F', '#8FBC8F', '#2E8B57'],
      Civillian: ['#87CEEB', '#B0C4DE', '#F0F8FF']
    }
    
    const colors = backgroundColors[character.type] || backgroundColors.Civillian
    const color = colors[Math.floor(random() * colors.length)]
    
    const patterns = ['solid', 'gradient', 'stars', 'waves'] as const
    const pattern = patterns[Math.floor(random() * patterns.length)]
    
    return { color, pattern }
  }
  
  // ✅ CONSTRUIR SVG ANIME MELHORADO
  private static buildSVG(components: AvatarComponents): string {
    const width = 300
    const height = 300
    
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`
    
    // Definições para gradientes e filtros
    svg += this.renderDefinitions(components)
    
    // Background
    svg += this.renderBackground(components.background, width, height)
    
    // Hair (parte de trás)
    svg += this.renderHairBack(components.hair, width, height)
    
    // Face e pescoço
    svg += this.renderFaceAndNeck(components.face, width, height)
    
    // Eyes (mais detalhados)
    svg += this.renderAnimeEyes(components.eyes, width, height)
    
    // Nose (sutil)
    svg += this.renderNose(components.face, width, height)
    
    // Mouth (mais expressivo)
    svg += this.renderAnimeMouth(components.face.expression, width, height)
    
    // Scars
    if (components.scars.face) {
      svg += this.renderFaceScars(components.scars, width, height)
    }
    
    // Hair (parte da frente)
    svg += this.renderHairFront(components.hair, width, height)
    
    // Clothing (mais detalhado)
    svg += this.renderAnimeClothing(components.clothing, width, height)
    
    // Devil Fruit effects
    if (components.devilFruit.hasSymbol) {
      svg += this.renderDevilFruitSymbol(components.devilFruit, width, height)
    }
    
    svg += '</svg>'
    
    return svg
  }
  
  // ✅ DEFINIÇÕES PARA GRADIENTES E FILTROS
  private static renderDefinitions(components: AvatarComponents): string {
    return `
      <defs>
        <!-- Gradientes para cabelo -->
        <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${components.hair.color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${this.darkenColor(components.hair.color, 0.3)};stop-opacity:1" />
        </linearGradient>
        
        <!-- Gradiente para pele -->
        <radialGradient id="skinGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:${this.lightenColor(components.face.skinTone, 0.1)};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${components.face.skinTone};stop-opacity:1" />
        </radialGradient>
        
        <!-- Gradiente para íris -->
        <radialGradient id="irisGradient" cx="30%" cy="30%" r="70%">
          <stop offset="0%" style="stop-color:${this.lightenColor(components.eyes.color, 0.4)};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${this.darkenColor(components.eyes.color, 0.2)};stop-opacity:1" />
        </radialGradient>
        
        <!-- Sombra suave -->
        <filter id="softShadow">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
        
        <!-- Brilho nos olhos -->
        <filter id="eyeGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    `
  }
  
  // ✅ RENDERIZAR BACKGROUND
  private static renderBackground(background: AvatarComponents['background'], width: number, height: number): string {
    let bgSvg = ''
    
    switch (background.pattern) {
      case 'solid':
        bgSvg = `<rect width="${width}" height="${height}" fill="${background.color}"/>`
        break
        
      case 'gradient':
        const gradientId = 'bg-gradient'
        bgSvg = `
          <defs>
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${background.color};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${this.darkenColor(background.color, 0.3)};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#${gradientId})"/>
        `
        break
        
      case 'stars':
        bgSvg = `<rect width="${width}" height="${height}" fill="${background.color}"/>`
        // Adicionar estrelas
        for (let i = 0; i < 15; i++) {
          const x = Math.random() * width
          const y = Math.random() * height
          const size = Math.random() * 3 + 1
          bgSvg += `<circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="0.7"/>`
        }
        break
        
      case 'waves':
        bgSvg = `
          <rect width="${width}" height="${height}" fill="${background.color}"/>
          <path d="M0,${height*0.8} Q${width*0.25},${height*0.7} ${width*0.5},${height*0.8} T${width},${height*0.8} L${width},${height} L0,${height} Z" 
                fill="${this.lightenColor(background.color, 0.2)}" opacity="0.5"/>
        `
        break
    }
    
    return bgSvg
  }
  
  // ✅ RENDERIZAR ROSTO E PESCOÇO ANIME
  private static renderFaceAndNeck(face: AvatarComponents['face'], width: number, height: number): string {
    const centerX = width / 2
    const centerY = height / 2
    const faceWidth = width * 0.45
    const faceHeight = height * 0.55
    
    let faceSvg = ''
    
    // Pescoço
    faceSvg += `
      <ellipse cx="${centerX}" cy="${centerY + faceHeight/2 + 25}" rx="30" ry="40" 
               fill="${this.darkenColor(face.skinTone, 0.1)}" 
               filter="url(#softShadow)"/>
    `
    
    // Rosto principal
    switch (face.shape) {
      case 'round':
        faceSvg += `
          <ellipse cx="${centerX}" cy="${centerY}" rx="${faceWidth/2}" ry="${faceHeight/2}" 
                   fill="url(#skinGradient)" 
                   stroke="none"/>
        `
        break
        
      case 'oval':
        faceSvg += `
          <ellipse cx="${centerX}" cy="${centerY}" rx="${faceWidth/2.2}" ry="${faceHeight/1.8}" 
                   fill="url(#skinGradient)" 
                   stroke="none"/>
        `
        break
        
      case 'square':
        faceSvg += `
          <rect x="${centerX - faceWidth/2}" y="${centerY - faceHeight/2}" 
                width="${faceWidth}" height="${faceHeight}" rx="20" 
                fill="url(#skinGradient)" 
                stroke="none"/>
        `
        break
        
      case 'heart':
        faceSvg += `
          <path d="M${centerX},${centerY + faceHeight/3} 
                   Q${centerX - faceWidth/2},${centerY - faceHeight/4} ${centerX - faceWidth/3},${centerY - faceHeight/2}
                   Q${centerX},${centerY - faceHeight/1.5} ${centerX + faceWidth/3},${centerY - faceHeight/2}
                   Q${centerX + faceWidth/2},${centerY - faceHeight/4} ${centerX},${centerY + faceHeight/3} Z" 
                fill="url(#skinGradient)" 
                stroke="none"/>
        `
        break
    }
    
    // Sombras faciais sutis
    faceSvg += `
      <!-- Sombra sob o queixo -->
      <ellipse cx="${centerX}" cy="${centerY + faceHeight/3}" rx="${faceWidth/3}" ry="10" 
               fill="${this.darkenColor(face.skinTone, 0.15)}" 
               opacity="0.4"/>
      
      <!-- Sombras laterais -->
      <ellipse cx="${centerX - faceWidth/3}" cy="${centerY}" rx="15" ry="${faceHeight/3}" 
               fill="${this.darkenColor(face.skinTone, 0.1)}" 
               opacity="0.3"/>
      <ellipse cx="${centerX + faceWidth/3}" cy="${centerY}" rx="15" ry="${faceHeight/3}" 
               fill="${this.darkenColor(face.skinTone, 0.1)}" 
               opacity="0.3"/>
    `
    
    return faceSvg
  }
  
  // ✅ RENDERIZAR OLHOS ANIME DETALHADOS
  private static renderAnimeEyes(eyes: AvatarComponents['eyes'], width: number, height: number): string {
    const centerX = width / 2
    const centerY = height / 2 - height * 0.08
    const eyeSpacing = width * 0.12
    
    let eyesSvg = ''
    
    // Olho esquerdo
    if (!eyes.eyepatch) {
      eyesSvg += this.renderDetailedAnimeEye(centerX - eyeSpacing, centerY, eyes, 'left')
    } else {
      // Tapa-olho estilizado
      eyesSvg += `
        <ellipse cx="${centerX - eyeSpacing}" cy="${centerY}" rx="30" ry="22" 
                 fill="#1a1a1a" stroke="#333" stroke-width="3"/>
        <path d="M${centerX - eyeSpacing - 25},${centerY - 15} L${centerX - eyeSpacing + 25},${centerY + 15}" 
              stroke="#666" stroke-width="2"/>
        <circle cx="${centerX - eyeSpacing}" cy="${centerY}" r="4" fill="#444"/>
      `
    }
    
    // Olho direito
    eyesSvg += this.renderDetailedAnimeEye(centerX + eyeSpacing, centerY, eyes, 'right')
    
    // Óculos estilizados
    if (eyes.hasGlasses) {
      eyesSvg += this.renderAnimeGlasses(centerX, centerY, eyeSpacing)
    }
    
    return eyesSvg
  }
  
  // ✅ RENDERIZAR UM OLHO ANIME DETALHADO
  private static renderDetailedAnimeEye(x: number, y: number, eyes: AvatarComponents['eyes'], side: 'left' | 'right'): string {
    let eyeSvg = ''
    
    switch (eyes.shape) {
      case 'normal':
        eyeSvg = `
          <!-- Base do olho -->
          <ellipse cx="${x}" cy="${y}" rx="28" ry="20" fill="white" stroke="#000" stroke-width="2"/>
          
          <!-- Íris -->
          <circle cx="${x}" cy="${y}" r="15" fill="url(#irisGradient)"/>
          
          <!-- Pupila -->
          <circle cx="${x}" cy="${y}" r="6" fill="#000"/>
          
          <!-- Brilho principal -->
          <circle cx="${x-4}" cy="${y-4}" r="4" fill="white"/>
          
          <!-- Brilho secundário -->
          <circle cx="${x+3}" cy="${y+3}" r="2" fill="white" opacity="0.8"/>
          
          <!-- Reflexo na íris -->
          <ellipse cx="${x-1}" cy="${y+6}" rx="10" ry="3" fill="white" opacity="0.4"/>
          
          <!-- Cílios superiores -->
          <path d="M${x-25},${y-15} Q${x-20},${y-25} ${x-15},${y-18}" 
                stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M${x-8},${y-18} Q${x},${y-28} ${x+8},${y-18}" 
                stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M${x+15},${y-18} Q${x+20},${y-25} ${x+25},${y-15}" 
                stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
        `
        break
        
      case 'sharp':
        eyeSvg = `
          <!-- Formato afiado -->
          <path d="M${x-30},${y} L${x+22},${y-15} L${x+22},${y+15} Z" 
                fill="white" stroke="#000" stroke-width="2"/>
          
          <!-- Íris -->
          <circle cx="${x-4}" cy="${y}" r="12" fill="url(#irisGradient)"/>
          
          <!-- Pupila -->
          <circle cx="${x-4}" cy="${y}" r="5" fill="#000"/>
          
          <!-- Brilho -->
          <circle cx="${x-6}" cy="${y-3}" r="3" fill="white"/>
          
          <!-- Cílios afiados -->
          <path d="M${x-25},${y-8} L${x-20},${y-18} L${x-15},${y-12}" 
                stroke="#000" stroke-width="2" fill="none"/>
          <path d="M${x+15},${y-12} L${x+20},${y-18} L${x+25},${y-8}" 
                stroke="#000" stroke-width="2" fill="none"/>
        `
        break
        
      case 'round':
        eyeSvg = `
          <!-- Olho grande e redondo -->
          <circle cx="${x}" cy="${y}" r="32" fill="white" stroke="#000" stroke-width="2"/>
          
          <!-- Íris grande -->
          <circle cx="${x}" cy="${y}" r="22" fill="url(#irisGradient)"/>
          
          <!-- Pupila -->
          <circle cx="${x}" cy="${y}" r="10" fill="#000"/>
          
          <!-- Brilho grande -->
          <circle cx="${x-6}" cy="${y-6}" r="6" fill="white"/>
          
          <!-- Brilho secundário -->
          <circle cx="${x+4}" cy="${y+4}" r="3" fill="white" opacity="0.7"/>
          
          <!-- Reflexo -->
          <ellipse cx="${x}" cy="${y+8}" rx="15" ry="4" fill="white" opacity="0.3"/>
        `
        break
        
      case 'narrow':
        eyeSvg = `
          <!-- Olho estreito -->
          <ellipse cx="${x}" cy="${y}" rx="25" ry="10" fill="white" stroke="#000" stroke-width="2"/>
          
          <!-- Íris -->
          <ellipse cx="${x}" cy="${y}" rx="15" ry="8" fill="url(#irisGradient)"/>
          
          <!-- Pupila -->
          <ellipse cx="${x}" cy="${y}" rx="5" ry="4" fill="#000"/>
          
          <!-- Brilho -->
          <ellipse cx="${x-3}" cy="${y-2}" rx="3" ry="2" fill="white"/>
        `
        break
        
      case 'wide':
        eyeSvg = `
          <!-- Olho arregalado -->
          <circle cx="${x}" cy="${y}" r="35" fill="white" stroke="#000" stroke-width="3"/>
          
          <!-- Íris -->
          <circle cx="${x}" cy="${y}" r="25" fill="url(#irisGradient)"/>
          
          <!-- Pupila -->
          <circle cx="${x}" cy="${y}" r="12" fill="#000"/>
          
          <!-- Brilho dramático -->
          <circle cx="${x-7}" cy="${y-7}" r="8" fill="white"/>
          <circle cx="${x+5}" cy="${y+5}" r="4" fill="white" opacity="0.6"/>
          
          <!-- Reflexo intenso -->
          <ellipse cx="${x}" cy="${y+10}" rx="18" ry="5" fill="white" opacity="0.4"/>
        `
        break
    }
    
    // Sobrancelha detalhada
    const browY = y - 35
    eyeSvg += `
      <path d="M${x-22},${browY+3} Q${x},${browY-3} ${x+22},${browY+3}" 
            stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/>
    `
    
    return eyeSvg
  }
  
  // ✅ RENDERIZAR NARIZ SUTIL
  private static renderNose(face: AvatarComponents['face'], width: number, height: number): string {
    const centerX = width / 2
    const centerY = height / 2 + 15
    
    return `
      <!-- Sombra do nariz -->
      <ellipse cx="${centerX + 3}" cy="${centerY}" rx="4" ry="10" 
               fill="${this.darkenColor(face.skinTone, 0.2)}" 
               opacity="0.5"/>
      
      <!-- Narinas sutis -->
      <ellipse cx="${centerX - 2}" cy="${centerY + 6}" rx="2" ry="3" 
               fill="${this.darkenColor(face.skinTone, 0.3)}" 
               opacity="0.7"/>
      <ellipse cx="${centerX + 4}" cy="${centerY + 6}" rx="2" ry="3" 
               fill="${this.darkenColor(face.skinTone, 0.3)}" 
               opacity="0.7"/>
    `
  }
  
  // ✅ RENDERIZAR BOCA ANIME EXPRESSIVA
  private static renderAnimeMouth(expression: AvatarComponents['face']['expression'], width: number, height: number): string {
    const centerX = width / 2
    const centerY = height / 2 + height * 0.18
    let mouthSvg = ''
    
    switch (expression) {
      case 'neutral':
        mouthSvg = `
          <ellipse cx="${centerX}" cy="${centerY}" rx="10" ry="4" 
                   fill="#CD5C5C" stroke="#000" stroke-width="1"/>
        `
        break
        
      case 'kind':
        mouthSvg = `
          <!-- Sorriso gentil -->
          <path d="M${centerX-18},${centerY} Q${centerX},${centerY+12} ${centerX+18},${centerY}" 
                stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
          
          <!-- Lábios -->
          <ellipse cx="${centerX}" cy="${centerY+4}" rx="15" ry="5" 
                   fill="#FF9999" opacity="0.7"/>
          
          <!-- Brilho no lábio -->
          <ellipse cx="${centerX}" cy="${centerY+2}" rx="8" ry="2" 
                   fill="white" opacity="0.6"/>
        `
        break
        
      case 'serious':
        mouthSvg = `
          <line x1="${centerX-15}" y1="${centerY}" x2="${centerX+15}" y2="${centerY}" 
                stroke="#000" stroke-width="4" stroke-linecap="round"/>
          
          <!-- Sombra -->
          <line x1="${centerX-15}" y1="${centerY+2}" x2="${centerX+15}" y2="${centerY+2}" 
                stroke="#000" stroke-width="1" opacity="0.3"/>
        `
        break
        
      case 'angry':
        mouthSvg = `
          <!-- Boca zangada -->
          <path d="M${centerX-20},${centerY+10} Q${centerX},${centerY-8} ${centerX+20},${centerY+10}" 
                stroke="#000" stroke-width="4" fill="none" stroke-linecap="round"/>
          
          <!-- Interior da boca -->
          <ellipse cx="${centerX}" cy="${centerY+2}" rx="12" ry="6" 
                   fill="#8B0000"/>
          
          <!-- Dentes visíveis -->
          <rect x="${centerX-12}" y="${centerY}" width="24" height="8" 
                fill="white" stroke="#000" stroke-width="1"/>
          
          <!-- Separação dos dentes -->
          <line x1="${centerX-6}" y1="${centerY}" x2="${centerX-6}" y2="${centerY+8}" 
                stroke="#000" stroke-width="0.8"/>
          <line x1="${centerX}" y1="${centerY}" x2="${centerX}" y2="${centerY+8}" 
                stroke="#000" stroke-width="0.8"/>
          <line x1="${centerX+6}" y1="${centerY}" x2="${centerX+6}" y2="${centerY+8}" 
                stroke="#000" stroke-width="0.8"/>
        `
        break
        
      case 'confident':
        mouthSvg = `
          <!-- Sorriso confiante -->
          <path d="M${centerX-22},${centerY} Q${centerX},${centerY+15} ${centerX+22},${centerY}" 
                stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
          
          <!-- Interior da boca -->
          <ellipse cx="${centerX}" cy="${centerY+5}" rx="15" ry="8" 
                   fill="#8B0000"/>
          
          <!-- Dentes -->
          <rect x="${centerX-18}" y="${centerY+2}" width="36" height="10" 
                fill="white" stroke="#000" stroke-width="1" rx="4"/>
          
          <!-- Língua -->
          <ellipse cx="${centerX}" cy="${centerY+8}" rx="10" ry="4" 
                   fill="#FF6B6B" opacity="0.8"/>
          
          <!-- Brilho nos dentes -->
          <ellipse cx="${centerX}" cy="${centerY+4}" rx="12" ry="3" 
                   fill="white" opacity="0.6"/>
        `
        break
        
      case 'mysterious':
        mouthSvg = `
          <!-- Sorriso misterioso -->
          <path d="M${centerX-12},${centerY} Q${centerX+6},${centerY+8} ${centerX+18},${centerY+3}" 
                stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
          
          <ellipse cx="${centerX+4}" cy="${centerY+3}" rx="10" ry="4" 
                   fill="#8B4B4B" opacity="0.9"/>
          
          <!-- Sombra misteriosa -->
          <ellipse cx="${centerX+4}" cy="${centerY+5}" rx="8" ry="2" 
                   fill="#000" opacity="0.3"/>
        `
        break
    }
    
    return mouthSvg
  }
  
  // ✅ RENDERIZAR CABELO ANIME ESTILIZADO
  private static renderHairBack(hair: AvatarComponents['hair'], width: number, height: number): string {
    if (hair.hasHat) return ''
    
    const centerX = width / 2
    const centerY = height / 2
    let hairSvg = ''
    
    switch (hair.style) {
      case 'spiky':
        hairSvg = `
          <g fill="url(#hairGradient)" stroke="#000" stroke-width="2">
            <!-- Espinhos principais -->
            <path d="M${centerX-90},${centerY-20} 
                     L${centerX-70},${centerY-100} 
                     L${centerX-50},${centerY-80} 
                     L${centerX-30},${centerY-110} 
                     L${centerX-10},${centerY-105} 
                     L${centerX+10},${centerY-110} 
                     L${centerX+30},${centerY-105} 
                     L${centerX+50},${centerY-80} 
                     L${centerX+70},${centerY-100} 
                     L${centerX+90},${centerY-20} 
                     Q${centerX+100},${centerY+20} ${centerX+80},${centerY+50}
                     Q${centerX},${centerY+60} ${centerX-80},${centerY+50}
                     Q${centerX-100},${centerY+20} ${centerX-90},${centerY-20} Z"/>
            
            <!-- Espinhos menores -->
            <path d="M${centerX-60},${centerY-70} L${centerX-55},${centerY-90} L${centerX-45},${centerY-75} Z"/>
            <path d="M${centerX-15},${centerY-95} L${centerX-10},${centerY-115} L${centerX-5},${centerY-100} Z"/>
            <path d="M${centerX+5},${centerY-100} L${centerX+10},${centerY-115} L${centerX+15},${centerY-95} Z"/>
            <path d="M${centerX+45},${centerY-75} L${centerX+55},${centerY-90} L${centerX+60},${centerY-70} Z"/>
          </g>
        `
        break
        
      case 'long_straight':
        hairSvg = `
          <g fill="url(#hairGradient)" stroke="#000" stroke-width="2">
            <path d="M${centerX-100},${centerY-10} 
                     Q${centerX-110},${centerY-70} ${centerX-80},${centerY-100}
                     Q${centerX},${centerY-110} ${centerX+80},${centerY-100}
                     Q${centerX+110},${centerY-70} ${centerX+100},${centerY-10}
                     L${centerX+105},${centerY+100}
                     Q${centerX+95},${centerY+140} ${centerX+70},${centerY+150}
                     Q${centerX},${centerY+160} ${centerX-70},${centerY+150}
                     Q${centerX-95},${centerY+140} ${centerX-105},${centerY+100} Z"/>
            
            <!-- Mechas detalhadas -->
            <path d="M${centerX-70},${centerY-90} Q${centerX-75},${centerY+60} ${centerX-80},${centerY+140}" 
                  stroke="${this.darkenColor(hair.color, 0.3)}" stroke-width="2" fill="none"/>
            <path d="M${centerX-30},${centerY-100} Q${centerX-35},${centerY+70} ${centerX-40},${centerY+150}" 
                  stroke="${this.darkenColor(hair.color, 0.3)}" stroke-width="2" fill="none"/>
            <path d="M${centerX+30},${centerY-100} Q${centerX+35},${centerY+70} ${centerX+40},${centerY+150}" 
                  stroke="${this.darkenColor(hair.color, 0.3)}" stroke-width="2" fill="none"/>
            <path d="M${centerX+70},${centerY-90} Q${centerX+75},${centerY+60} ${centerX+80},${centerY+140}" 
                  stroke="${this.darkenColor(hair.color, 0.3)}" stroke-width="2" fill="none"/>
          </g>
        `
        break
        
      case 'afro':
        hairSvg = `
          <g fill="url(#hairGradient)" stroke="#000" stroke-width="2">
            <circle cx="${centerX}" cy="${centerY-40}" r="85"/>
            
            <!-- Textura do afro -->
            ${this.generateAfroTexture(centerX, centerY-40, 85, hair.color)}
          </g>
        `
        break
        
      case 'ponytail':
        hairSvg = `
          <g fill="url(#hairGradient)" stroke="#000" stroke-width="2">
            <!-- Base do cabelo -->
            <ellipse cx="${centerX}" cy="${centerY-50}" rx="75" ry="60"/>
            
            <!-- Rabo de cavalo -->
            <ellipse cx="${centerX+70}" cy="${centerY+30}" rx="22" ry="50"/>
            
            <!-- Elástico -->
            <ellipse cx="${centerX+70}" cy="${centerY-5}" rx="25" ry="10" 
                     fill="#333" stroke="#000" stroke-width="2"/>
            
            <!-- Mechas do rabo -->
            <path d="M${centerX+60},${centerY+10} Q${centerX+65},${centerY+50} ${centerX+70},${centerY+75}" 
                  stroke="${this.darkenColor(hair.color, 0.3)}" stroke-width="2" fill="none"/>
            <path d="M${centerX+80},${centerY+10} Q${centerX+75},${centerY+50} ${centerX+70},${centerY+75}" 
                  stroke="${this.darkenColor(hair.color, 0.3)}" stroke-width="2" fill="none"/>
          </g>
        `
        break
        
      default:
        hairSvg = `
          <g fill="url(#hairGradient)" stroke="#000" stroke-width="2">
            <path d="M${centerX-90},${centerY} 
                     Q${centerX-100},${centerY-60} ${centerX-70},${centerY-90}
                     Q${centerX},${centerY-100} ${centerX+70},${centerY-90}
                     Q${centerX+100},${centerY-60} ${centerX+90},${centerY}
                     Q${centerX+95},${centerY+30} ${centerX+80},${centerY+55}
                     Q${centerX},${centerY+65} ${centerX-80},${centerY+55}
                     Q${centerX-95},${centerY+30} ${centerX-90},${centerY} Z"/>
          </g>
        `
    }
    
    return hairSvg
  }
  
  // ✅ RENDERIZAR CABELO (PARTE DA FRENTE)
  private static renderHairFront(hair: AvatarComponents['hair'], width: number, height: number): string {
    const centerX = width / 2
    const centerY = height / 2
    let hairSvg = ''
    
    // Franja baseada no estilo
    if (!hair.hasHat) {
      switch (hair.style) {
        case 'spiky':
          hairSvg = `
            <g fill="url(#hairGradient)" stroke="#000" stroke-width="2">
              <path d="M${centerX-50},${centerY-60} 
                       L${centerX-40},${centerY-75} 
                       L${centerX-20},${centerY-65} 
                       L${centerX-10},${centerY-80} 
                       L${centerX},${centerY-78} 
                       L${centerX+10},${centerY-80} 
                       L${centerX+20},${centerY-65} 
                       L${centerX+40},${centerY-75} 
                       L${centerX+50},${centerY-60}" 
                    stroke="${hair.color}" stroke-width="10" fill="none" stroke-linecap="round"/>
            </g>
          `
          break
          
        case 'straight':
          hairSvg = `
            <g fill="url(#hairGradient)" stroke="#000" stroke-width="2">
              <rect x="${centerX-55}" y="${centerY-55}" width="110" height="15" 
                                        fill="${hair.color}" stroke="#000" stroke-width="2" rx="5"/>
            </g>
          `
          break
          
        case 'messy':
          hairSvg = `
            <g fill="url(#hairGradient)" stroke="#000" stroke-width="2">
              <path d="M${centerX-45},${centerY-50} 
                       Q${centerX-30},${centerY-70} ${centerX-15},${centerY-55}
                       Q${centerX},${centerY-75} ${centerX+15},${centerY-55}
                       Q${centerX+30},${centerY-70} ${centerX+45},${centerY-50}" 
                    fill="${hair.color}" stroke="#000" stroke-width="2"/>
            </g>
          `
          break
      }
    }
    
    // Chapéu
    if (hair.hasHat) {
      hairSvg += this.renderHat(centerX, centerY - 60, hair.color)
    }
    
    return hairSvg
  }
  
  // ✅ GERAR TEXTURA PARA AFRO
  private static generateAfroTexture(centerX: number, centerY: number, radius: number, color: string): string {
    let texture = ''
    const darkColor = this.darkenColor(color, 0.4)
    
    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60
      const r = radius * (0.2 + Math.random() * 0.7)
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r
      const size = 3 + Math.random() * 4
      
      texture += `<circle cx="${x}" cy="${y}" r="${size}" fill="${darkColor}" opacity="0.7"/>`
    }
    
    return texture
  }
  
  // ✅ RENDERIZAR CHAPÉU
  private static renderHat(x: number, y: number, hairColor: string): string {
    return `
      <g fill="#333" stroke="#000" stroke-width="2">
        <!-- Aba do chapéu -->
        <ellipse cx="${x}" cy="${y}" rx="80" ry="18" fill="#333"/>
        
        <!-- Copa do chapéu -->
        <ellipse cx="${x}" cy="${y-15}" rx="60" ry="30" fill="#333"/>
        
        <!-- Faixa do chapéu -->
        <ellipse cx="${x}" cy="${y-5}" rx="62" ry="8" fill="#8B4513"/>
        
        <!-- Emblema -->
        <circle cx="${x}" cy="${y-5}" r="6" fill="#FFD700" stroke="#000" stroke-width="1"/>
      </g>
    `
  }
  
  // ✅ RENDERIZAR ROUPAS ANIME DETALHADAS
  private static renderAnimeClothing(clothing: AvatarComponents['clothing'], width: number, height: number): string {
    const centerX = width / 2
    const centerY = height / 2
    let clothingSvg = ''
    
    switch (clothing.type) {
      case 'marine':
        clothingSvg = `
          <g stroke="#000" stroke-width="2">
            <!-- Uniforme de marinha detalhado -->
            <rect x="${centerX-70}" y="${centerY+65}" width="140" height="100" 
                  fill="${clothing.color}" rx="8"/>
            
            <!-- Gola alta -->
            <rect x="${centerX-30}" y="${centerY+50}" width="60" height="25" 
                  fill="white" stroke="#000" stroke-width="2"/>
            
            <!-- Botões dourados -->
            <circle cx="${centerX-20}" cy="${centerY+80}" r="4" fill="#FFD700" stroke="#000" stroke-width="1"/>
            <circle cx="${centerX-10}" cy="${centerY+80}" r="4" fill="#FFD700" stroke="#000" stroke-width="1"/>
            <circle cx="${centerX}" cy="${centerY+80}" r="4" fill="#FFD700" stroke="#000" stroke-width="1"/>
            <circle cx="${centerX+10}" cy="${centerY+80}" r="4" fill="#FFD700" stroke="#000" stroke-width="1"/>
            <circle cx="${centerX+20}" cy="${centerY+80}" r="4" fill="#FFD700" stroke="#000" stroke-width="1"/>
            
            <!-- Insígnia da marinha -->
            <rect x="${centerX-25}" y="${centerY+100}" width="50" height="20" 
                  fill="#FFD700" stroke="#000" stroke-width="1" rx="3"/>
            <text x="${centerX}" y="${centerY+113}" text-anchor="middle" font-size="10" font-weight="bold" fill="#000">MARINE</text>
            
            <!-- Mangas -->
            <ellipse cx="${centerX-75}" cy="${centerY+85}" rx="18" ry="30" 
                     fill="${clothing.color}" stroke="#000" stroke-width="2"/>
            <ellipse cx="${centerX+75}" cy="${centerY+85}" rx="18" ry="30" 
                     fill="${clothing.color}" stroke="#000" stroke-width="2"/>
            
            <!-- Punhos -->
            <ellipse cx="${centerX-75}" cy="${centerY+110}" rx="20" ry="8" 
                     fill="white" stroke="#000" stroke-width="1"/>
            <ellipse cx="${centerX+75}" cy="${centerY+110}" rx="20" ry="8" 
                     fill="white" stroke="#000" stroke-width="1"/>
            
            <!-- Âncora no peito -->
            <g transform="translate(${centerX+30},${centerY+90})">
              <path d="M0,-8 L0,8 M-6,4 L6,4 M-4,6 Q-6,8 -4,10 M4,6 Q6,8 4,10" 
                    stroke="#000080" stroke-width="2" fill="none"/>
            </g>
          </g>
        `
        break
        
      case 'government':
        clothingSvg = `
          <g stroke="#000" stroke-width="2">
            <!-- Terno do governo -->
            <rect x="${centerX-65}" y="${centerY+65}" width="130" height="100" 
                  fill="${clothing.color}" rx="5"/>
            
            <!-- Camisa branca -->
            <rect x="${centerX-25}" y="${centerY+50}" width="50" height="30" 
                  fill="white" stroke="#000" stroke-width="1"/>
            
            <!-- Gravata -->
            <rect x="${centerX-6}" y="${centerY+50}" width="12" height="50" 
                  fill="#8B0000" stroke="#000" stroke-width="1"/>
            
            <!-- Paletó -->
            <rect x="${centerX-60}" y="${centerY+70}" width="120" height="80" 
                  fill="${this.lightenColor(clothing.color, 0.1)} " stroke="#000" stroke-width="1"/>
            
            <!-- Lapelas -->
            <path d="M${centerX-25},${centerY+70} L${centerX-35},${centerY+90} L${centerX-25},${centerY+100}" 
                  fill="${this.darkenColor(clothing.color, 0.2)}" stroke="#000" stroke-width="1"/>
            <path d="M${centerX+25},${centerY+70} L${centerX+35},${centerY+90} L${centerX+25},${centerY+100}" 
                  fill="${this.darkenColor(clothing.color, 0.2)}" stroke="#000" stroke-width="1"/>
            
            <!-- Botões do paletó -->
            <circle cx="${centerX-15}" cy="${centerY+90}" r="3" fill="#333" stroke="#000" stroke-width="1"/>
            <circle cx="${centerX-15}" cy="${centerY+110}" r="3" fill="#333" stroke="#000" stroke-width="1"/>
            
            <!-- Emblema do governo -->
            <circle cx="${centerX+35}" cy="${centerY+85}" r="8" fill="#FFD700" stroke="#000" stroke-width="1"/>
            <text x="${centerX+35}" y="${centerY+88}" text-anchor="middle" font-size="8" font-weight="bold" fill="#000">WG</text>
          </g>
        `
        break
        
      case 'pirate':
        clothingSvg = `
          <g stroke="#000" stroke-width="2">
            <!-- Roupa de pirata -->
            <rect x="${centerX-60}" y="${centerY+65}" width="120" height="100" 
                  fill="${clothing.color}" rx="10"/>
            
            <!-- Colete -->
            <path d="M${centerX-35},${centerY+55} L${centerX-35},${centerY+120} 
                     L${centerX+35},${centerY+120} L${centerX+35},${centerY+55} 
                     Q${centerX},${centerY+45} ${centerX-35},${centerY+55}" 
                  fill="${this.darkenColor(clothing.color, 0.3)}" stroke="#000" stroke-width="2"/>
            
            <!-- Camisa por baixo -->
            <rect x="${centerX-30}" y="${centerY+55}" width="60" height="30" 
                  fill="white" stroke="#000" stroke-width="1"/>
            
            <!-- Cordões do colete -->
            <line x1="${centerX-20}" y1="${centerY+70}" x2="${centerX+20}" y2="${centerY+70}" 
                  stroke="#8B4513" stroke-width="2"/>
            <line x1="${centerX-20}" y1="${centerY+85}" x2="${centerX+20}" y2="${centerY+85}" 
                  stroke="#8B4513" stroke-width="2"/>
            <line x1="${centerX-20}" y1="${centerY+100}" x2="${centerX+20}" y2="${centerY+100}" 
                  stroke="#8B4513" stroke-width="2"/>
            
            <!-- Cinto largo -->
            <rect x="${centerX-65}" y="${centerY+110}" width="130" height="15" 
                  fill="#8B4513" stroke="#000" stroke-width="2"/>
            
            <!-- Fivela grande -->
            <rect x="${centerX-12}" y="${centerY+107}" width="24" height="21" 
                  fill="#FFD700" stroke="#000" stroke-width="2" rx="3"/>
            <circle cx="${centerX}" cy="${centerY+117}" r="4" fill="#8B4513"/>
            
            <!-- Mangas largas -->
            <ellipse cx="${centerX-65}" cy="${centerY+85}" rx="20" ry="35" 
                     fill="white" stroke="#000" stroke-width="2"/>
            <ellipse cx="${centerX+65}" cy="${centerY+85}" rx="20" ry="35" 
                     fill="white" stroke="#000" stroke-width="2"/>
            
            <!-- Punhos -->
            <ellipse cx="${centerX-65}" cy="${centerY+115}" rx="22" ry="10" 
                     fill="${clothing.color}" stroke="#000" stroke-width="2"/>
            <ellipse cx="${centerX+65}" cy="${centerY+115}" rx="22" ry="10" 
                     fill="${clothing.color}" stroke="#000" stroke-width="2"/>
          </g>
        `
        break
        
      case 'bounty_hunter':
        clothingSvg = `
          <g stroke="#000" stroke-width="2">
            <!-- Roupa de caçador -->
            <rect x="${centerX-65}" y="${centerY+65}" width="130" height="100" 
                  fill="${clothing.color}" rx="8"/>
            
            <!-- Colete tático -->
            <rect x="${centerX-50}" y="${centerY+70}" width="100" height="70" 
                  fill="${this.darkenColor(clothing.color, 0.2)}" stroke="#000" stroke-width="2"/>
            
            <!-- Bolsos -->
            <rect x="${centerX-40}" y="${centerY+85}" width="15" height="20" 
                  fill="${this.darkenColor(clothing.color, 0.3)}" stroke="#000" stroke-width="1"/>
            <rect x="${centerX+25}" y="${centerY+85}" width="15" height="20" 
                  fill="${this.darkenColor(clothing.color, 0.3)}" stroke="#000" stroke-width="1"/>
            
            <!-- Cinto com equipamentos -->
            <rect x="${centerX-70}" y="${centerY+120}" width="140" height="12" 
                  fill="#654321" stroke="#000" stroke-width="2"/>
            
            <!-- Coldres -->
            <ellipse cx="${centerX-45}" cy="${centerY+135}" rx="8" ry="15" 
                     fill="#654321" stroke="#000" stroke-width="1"/>
            <ellipse cx="${centerX+45}" cy="${centerY+135}" rx="8" ry="15" 
                     fill="#654321" stroke="#000" stroke-width="1"/>
            
            <!-- Fivela -->
            <rect x="${centerX-8}" y="${centerY+118}" width="16" height="16" 
                  fill="#FFD700" stroke="#000" stroke-width="1"/>
            
            <!-- Mangas -->
            <ellipse cx="${centerX-70}" cy="${centerY+90}" rx="15" ry="25" 
                     fill="${clothing.color}" stroke="#000" stroke-width="2"/>
            <ellipse cx="${centerX+70}" cy="${centerY+90}" rx="15" ry="25" 
                     fill="${clothing.color}" stroke="#000" stroke-width="2"/>
          </g>
        `
        break
        
      default: // civilian
        clothingSvg = `
          <g stroke="#000" stroke-width="2">
            <!-- Roupa casual -->
            <rect x="${centerX-55}" y="${centerY+65}" width="110" height="100" 
                  fill="${clothing.color}" rx="15"/>
            
            <!-- Gola -->
            <ellipse cx="${centerX}" cy="${centerY+60}" rx="30" ry="12" 
                     fill="${this.lightenColor(clothing.color, 0.3)}" stroke="#000" stroke-width="1"/>
            
            <!-- Mangas -->
            <ellipse cx="${centerX-60}" cy="${centerY+85}" rx="12" ry="20" 
                     fill="${clothing.color}" stroke="#000" stroke-width="2"/>
            <ellipse cx="${centerX+60}" cy="${centerY+85}" rx="12" ry="20" 
                     fill="${clothing.color}" stroke="#000" stroke-width="2"/>
          </g>
        `
    }
    
    // Adicionar acessórios
    clothingSvg += this.renderAccessories(clothing.accessories, centerX, centerY)
    
    return clothingSvg
  }
  
  // ✅ RENDERIZAR ACESSÓRIOS
  private static renderAccessories(accessories: string[], centerX: number, centerY: number): string {
    let accessorySvg = ''
    
    accessories.forEach(accessory => {
      switch (accessory) {
        case 'anchor_pin':
          accessorySvg += `
            <g transform="translate(${centerX-35},${centerY+75})">
              <circle cx="0" cy="0" r="8" fill="#FFD700" stroke="#000" stroke-width="1"/>
              <path d="M-4,-3 L4,-3 M0,-3 L0,3 M-3,3 L3,3" stroke="#000080" stroke-width="2"/>
            </g>
          `
          break
          
        case 'government_badge':
          accessorySvg += `
            <rect x="${centerX-10}" y="${centerY+82}" width="20" height="15" 
                  fill="#FFD700" stroke="#000" stroke-width="1" rx="2"/>
            <text x="${centerX}" y="${centerY+92}" text-anchor="middle" font-size="6" font-weight="bold" fill="#000">GOV</text>
          `
          break
          
        case 'belt':
          accessorySvg += `
            <rect x="${centerX-60}" y="${centerY+110}" width="120" height="10" 
                  fill="#654321" stroke="#000" stroke-width="1"/>
            <rect x="${centerX-6}" y="${centerY+108}" width="12" height="14" 
                  fill="#FFD700" stroke="#000" stroke-width="1"/>
          `
          break
          
        case 'holster':
          accessorySvg += `
            <ellipse cx="${centerX+50}" cy="${centerY+125}" rx="10" ry="18" 
                     fill="#654321" stroke="#000" stroke-width="1"/>
            <rect x="${centerX+47}" y="${centerY+115}" width="6" height="12" 
                  fill="#333" stroke="#000" stroke-width="1"/>
          `
          break
          
        case 'medals':
          accessorySvg += `
            <circle cx="${centerX-20}" cy="${centerY+95}" r="4" fill="#FFD700" stroke="#000" stroke-width="1"/>
            <circle cx="${centerX-10}" cy="${centerY+95}" r="4" fill="#C0C0C0" stroke="#000" stroke-width="1"/>
            <circle cx="${centerX}" cy="${centerY+95}" r="4" fill="#CD7F32" stroke="#000" stroke-width="1"/>
          `
          break
      }
    })
    
    return accessorySvg
  }
  
  // ✅ RENDERIZAR ÓCULOS ANIME
  private static renderAnimeGlasses(centerX: number, centerY: number, eyeSpacing: number): string {
    return `
      <g stroke="#333" stroke-width="3" fill="none">
        <!-- Armação dos óculos -->
        <circle cx="${centerX - eyeSpacing}" cy="${centerY}" r="32"/>
        <circle cx="${centerX + eyeSpacing}" cy="${centerY}" r="32"/>
        
        <!-- Ponte -->
        <line x1="${centerX - eyeSpacing + 32}" y1="${centerY}" 
              x2="${centerX + eyeSpacing - 32}" y2="${centerY}"/>
        
        <!-- Hastes -->
        <line x1="${centerX - eyeSpacing - 32}" y1="${centerY}" 
              x2="${centerX - eyeSpacing - 55}" y2="${centerY - 10}"/>
        <line x1="${centerX + eyeSpacing + 32}" y1="${centerY}" 
              x2="${centerX + eyeSpacing + 55}" y2="${centerY - 10}"/>
        
        <!-- Reflexo nas lentes -->
        <ellipse cx="${centerX - eyeSpacing - 10}" cy="${centerY - 10}" rx="15" ry="10" 
                 fill="white" opacity="0.7"/>
        <ellipse cx="${centerX + eyeSpacing - 10}" cy="${centerY - 10}" rx="15" ry="10" 
                 fill="white" opacity="0.7"/>
      </g>
    `
  }
  
  // ✅ RENDERIZAR CICATRIZES NO ROSTO
  private static renderFaceScars(scars: AvatarComponents['scars'], width: number, height: number): string {
    if (!scars.face || scars.faceType === 'none') return ''
    
    const centerX = width / 2
    const centerY = height / 2
    let scarSvg = ''
    
    switch (scars.faceType) {
      case 'cross':
        scarSvg = `
          <line x1="${centerX-18}" y1="${centerY-18}" x2="${centerX+18}" y2="${centerY+18}" 
                stroke="#8B0000" stroke-width="4" opacity="0.8" stroke-linecap="round"/>
          <line x1="${centerX-18}" y1="${centerY+18}" x2="${centerX+18}" y2="${centerY-18}" 
                stroke="#8B0000" stroke-width="4" opacity="0.8" stroke-linecap="round"/>
        `
        break
        
      case 'vertical':
        scarSvg = `
          <line x1="${centerX+12}" y1="${centerY-25}" x2="${centerX+12}" y2="${centerY+15}" 
                stroke="#8B0000" stroke-width="4" opacity="0.8" stroke-linecap="round"/>
        `
        break
        
      case 'horizontal':
        scarSvg = `
          <line x1="${centerX-25}" y1="${centerY+8}" x2="${centerX+25}" y2="${centerY+8}" 
                stroke="#8B0000" stroke-width="4" opacity="0.8" stroke-linecap="round"/>
        `
        break
        
      case 'diagonal':
        scarSvg = `
          <line x1="${centerX-30}" y1="${centerY-15}" x2="${centerX+15}" y2="${centerY+25}" 
                stroke="#8B0000" stroke-width="4" opacity="0.8" stroke-linecap="round"/>
        `
        break
    }
    
    return scarSvg
  }
  
  // ✅ RENDERIZAR SÍMBOLO DE DEVIL FRUIT
  private static renderDevilFruitSymbol(devilFruit: AvatarComponents['devilFruit'], width: number, height: number): string {
    if (!devilFruit.hasSymbol || !devilFruit.symbolType) return ''
    
    const x = width - 40
    const y = 40
    let symbolSvg = ''
    
    // Efeito brilho se for usuário avançado
    if (devilFruit.glowEffect) {
      symbolSvg += `
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      `
    }
    
    const glowAttr = devilFruit.glowEffect ? 'filter="url(#glow)"' : ''
    
    switch (devilFruit.symbolType) {
      case 'paramecia':
        symbolSvg += `
          <circle cx="${x}" cy="${y}" r="18" fill="#FF6B6B" stroke="#000" stroke-width="3" ${glowAttr}/>
          <path d="M${x-8},${y-8} L${x+8},${y+8} M${x-8},${y+8} L${x+8},${y-8}" 
                stroke="white" stroke-width="3" stroke-linecap="round"/>
        `
        break
        
      case 'zoan':
        symbolSvg += `
          <circle cx="${x}" cy="${y}" r="18" fill="#4ECDC4" stroke="#000" stroke-width="3" ${glowAttr}/>
          <circle cx="${x-6}" cy="${y-3}" r="3" fill="white"/>
          <circle cx="${x+6}" cy="${y-3}" r="3" fill="white"/>
          <path d="M${x-6},${y+6} Q${x},${y+10} ${x+6},${y+6}" 
                stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
        `
        break
        
      case 'logia':
        symbolSvg += `
          <circle cx="${x}" cy="${y}" r="18" fill="#45B7D1" stroke="#000" stroke-width="3" ${glowAttr}/>
          <path d="M${x},${y-12} L${x-4},${y-3} L${x+4},${y-3} L${x},${y+12} L${x+4},${y+3} L${x-4},${y+3} Z" 
                fill="white" stroke="white" stroke-width="1"/>
        `
        break
    }
    
    return symbolSvg
  }
  
  // ✅ MÉTODOS UTILITÁRIOS PARA CORES
  private static lightenColor(color: string, factor: number): string {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    const newR = Math.min(255, Math.floor(r + (255 - r) * factor))
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor))
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor))
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }
  
  private static darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    const newR = Math.floor(r * (1 - factor))
    const newG = Math.floor(g * (1 - factor))
    const newB = Math.floor(b * (1 - factor))
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }
  
  // ✅ GERADOR DE NÚMEROS ALEATÓRIOS COM SEED
  private static seededRandom(seed: number, salt: string): () => number {
    const saltedSeed = seed + salt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    let currentSeed = saltedSeed
    
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280
      return currentSeed / 233280
    }
  }
  
  // ✅ VERIFICAR SE AVATAR EXISTE
  private static async getExistingAvatar(characterId: number): Promise<Avatar | null> {
    try {
      const avatar = await db.avatars
        .where('characterId')
        .equals(characterId)
        .first()
      
      return avatar || null
    } catch (error) {
      console.error('❌ Erro ao buscar avatar existente:', error)
      return null
    }
  }
  
  // ✅ REGENERAR AVATAR (quando personagem evolui)
  static async regenerateAvatar(characterId: number): Promise<GeneratedAvatar | null> {
    try {
      // Remover avatar existente
      await db.avatars
        .where('characterId')
        .equals(characterId)
        .delete()
      
      // Gerar novo avatar
      const character = await db.characters.get(characterId)
      if (!character) return null
      
      return await this.generateAvatar(character)
      
    } catch (error) {
      console.error('❌ Erro ao regenerar avatar:', error)
      return null
    }
  }
  
  // ✅ OBTER AVATAR POR CHARACTER ID
  static async getAvatarByCharacterId(characterId: number): Promise<string | null> {
    try {
      const avatar = await db.avatars
        .where('characterId')
        .equals(characterId)
        .first()
      
      return avatar?.svgData || null
    } catch (error) {
      console.error('❌ Erro ao buscar avatar:', error)
      return null
    }
  }
  
  // ✅ OBTER COMPONENTES DO AVATAR
  static async getAvatarComponents(characterId: number): Promise<AvatarComponents | null> {
    try {
      const avatar = await db.avatars
        .where('characterId')
        .equals(characterId)
        .first()
      
      return avatar?.components || null
    } catch (error) {
      console.error('❌ Erro ao buscar componentes do avatar:', error)
      return null
    }
  }
  
  // ✅ ATUALIZAR AVATAR QUANDO PERSONAGEM EVOLUI
  static async updateAvatarIfNeeded(character: Character): Promise<boolean> {
    try {
      const existingAvatar = await this.getExistingAvatar(character.id!)
      
      if (!existingAvatar) {
        // Não existe avatar, gerar um novo
        await this.generateAvatar(character)
        return true
      }
      
      // Verificar se precisa atualizar baseado em mudanças significativas
      const shouldUpdate = this.shouldUpdateAvatar(character, existingAvatar)
      
      if (shouldUpdate) {
        await this.regenerateAvatar(character.id!)
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Erro ao atualizar avatar:', error)
      return false
    }
  }
  
  // ✅ VERIFICAR SE DEVE ATUALIZAR AVATAR
  private static shouldUpdateAvatar(character: Character, existingAvatar: Avatar): boolean {
    const levelThreshold = 10
    const currentLevel = character.level
    const avatarDate = existingAvatar.createdAt
    const daysSinceCreation = (Date.now() - avatarDate.getTime()) / (1000 * 60 * 60 * 24)
    
    // Atualizar a cada 10 levels ou se passou muito tempo
    if (currentLevel % levelThreshold === 0 && daysSinceCreation > 1) {
      return true
    }
    
    // Atualizar se ganhou Devil Fruit
    if (character.devilFruitId > 0 && !existingAvatar.components.devilFruit.hasSymbol) {
      return true
    }
    
    return false
  }
  
  // ✅ GERAR VARIAÇÃO DO AVATAR (para diferentes contextos)
  static async generateAvatarVariation(
    character: Character, 
    variation: 'battle' | 'formal' | 'casual' | 'injured'
  ): Promise<string> {
    try {
      const baseComponents = await this.generateComponents(character)
      
      // Modificar componentes baseado na variação
      const modifiedComponents = this.applyVariation(baseComponents, variation)
      
      return this.buildSVG(modifiedComponents)
    } catch (error) {
      console.error('❌ Erro ao gerar variação do avatar:', error)
      return ''
    }
  }
  
  // ✅ APLICAR VARIAÇÃO AOS COMPONENTES
  private static applyVariation(
    components: AvatarComponents, 
    variation: 'battle' | 'formal' | 'casual' | 'injured'
  ): AvatarComponents {
    const modifiedComponents = { ...components }
    
    switch (variation) {
      case 'battle':
        modifiedComponents.face.expression = 'serious'
        modifiedComponents.scars.face = true
        modifiedComponents.scars.faceType = 'diagonal'
        modifiedComponents.clothing.accessories.push('battle_gear')
        break
        
      case 'formal':
        modifiedComponents.scars.face = false
        modifiedComponents.face.expression = 'confident'
        if (modifiedComponents.clothing.type === 'pirate') {
          modifiedComponents.clothing.color = '#000000'
          modifiedComponents.clothing.accessories = ['formal_tie']
        }
        break
        
      case 'casual':
        modifiedComponents.face.expression = 'kind'
        modifiedComponents.clothing.color = '#87CEEB'
        modifiedComponents.hair.hasHat = false
        break
        
      case 'injured':
        modifiedComponents.face.expression = 'serious'
        modifiedComponents.scars.face = true
        modifiedComponents.scars.body = true
        modifiedComponents.scars.faceType = 'cross'
        modifiedComponents.eyes.shape = 'narrow'
        break
    }
    
    return modifiedComponents
  }
}