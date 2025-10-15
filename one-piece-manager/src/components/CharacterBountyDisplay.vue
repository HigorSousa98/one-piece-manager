<!-- src/components/CharacterBountyDisplay.vue -->
<template>
  <v-chip 
    :color="getBountyColor(character.type)" 
    :size="size" 
    :variant="variant"
    class="character-bounty-chip mb-2"
  >
    <template #prepend>
      <v-icon :size="iconSize">{{ getBountyIcon(character.type) }}</v-icon>
    </template>
    
    <strong>{{ getBountyDisplay(character) }}</strong>
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Character } from '@/utils/database'

// ✅ PROPS
interface Props {
  character: Character
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  variant?: 'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small',
  variant: 'elevated',
  showIcon: true
})

// ✅ COMPUTED
const iconSize = computed(() => {
  switch (props.size) {
    case 'x-small': return 12
    case 'small': return 14
    case 'default': return 16
    case 'large': return 18
    case 'x-large': return 20
    default: return 14
  }
})

// ✅ MÉTODOS PRINCIPAIS
const getBountyDisplay = (character: Character): string => {
  switch (character.type) {
    case 'Pirate':
      return formatPirateBounty(character.bounty)
    
    case 'Marine':
      return formatMarineRank(character.bounty)
    
    case 'BountyHunter':
      return formatPirateBounty(character.bounty)
    
    case 'Government':
      return formatGovernmentRank(character.bounty)
    
    case 'Civillian':
      return 'Civil'
    
    default:
      return formatPirateBounty(character.bounty)
  }
}

const getBountyColor = (type: string): string => {
  switch (type) {
    case 'Pirate': 
      return 'red-darken-2'
    
    case 'Marine': 
      return 'blue-darken-2'
    
    case 'BountyHunter': 
      return 'green-darken-2'
    
    case 'Government': 
      return 'orange-darken-2'
    
    case 'Civillian': 
      return 'grey-darken-1'
    
    default: 
      return 'grey-darken-2'
  }
}

const getBountyIcon = (type: string): string => {
  switch (type) {
    case 'Pirate': 
      return 'mdi-currency-usd'
    
    case 'Marine': 
      return 'mdi-sail-boat'
    
    case 'BountyHunter': 
      return 'mdi-trophy'
    
    case 'Government': 
      return 'mdi-shield-crown'
    
    case 'Civillian': 
      return 'mdi-account'
    
    default: 
      return 'mdi-help'
  }
}

// ✅ FORMATAÇÃO PARA PIRATAS (BOUNTY NORMAL)
const formatPirateBounty = (bounty: number): string => {
  if (bounty === 0) return 'Sem Recompensa'
  
  if (bounty >= 1000000000) {
    return `${(bounty / 1000000000).toFixed(2)}B B$`
  } else if (bounty >= 1000000) {
    return `${(bounty / 1000000).toFixed(2)}M B$`
  } else if (bounty >= 1000) {
    return `${(bounty / 1000).toFixed(2)}K B$`
  }
  return `${bounty} B$`
}

// ✅ FORMATAÇÃO PARA MARINES (ESTRELAS)
const formatMarineRank = (bounty: number): string => {
  if (bounty === 0) return 'Recruta'
  
  // Dividir por 100 milhões para ter escala de 0-5 estrelas
  const starValue = bounty / 100000000
  
  // Limitar entre 0 e 5
  const clampedValue = Math.min(Math.max(starValue, 0), 5)
  
  // Arredondar para 0.5
  const roundedValue = Math.round(clampedValue * 2) / 2
  
  return formatStars(roundedValue)
}

const formatStars = (value: number): string => {
  if (value === 0) return 'Recruta'
  if (value <= 0.5) return '⭐'
  if (value <= 1) return '⭐'
  if (value <= 1.5) return '⭐★'
  if (value <= 2) return '⭐⭐'
  if (value <= 2.5) return '⭐⭐★'
  if (value <= 3) return '⭐⭐⭐'
  if (value <= 3.5) return '⭐⭐⭐★'
  if (value <= 4) return '⭐⭐⭐⭐'
  if (value <= 4.5) return '⭐⭐⭐⭐★'
  if (value <= 5) return '⭐⭐⭐⭐⭐'
  return '⭐⭐⭐⭐⭐'
}

// ✅ FORMATAÇÃO PARA BOUNTY HUNTERS (RANKING)
const formatBountyHunterRank = (bounty: number): string => {
  if (bounty === 0) return 'Iniciante'
  
  // Dividir por 1 bilhão para ter escala similar
  const rankValue = bounty / 1000000000
  
  // 5 níveis de ranking
  if (rankValue < 0.5) return 'Iniciante'
  if (rankValue < 1.5) return 'Renomado'
  if (rankValue < 2.5) return 'Experiente'
  if (rankValue < 4) return 'Veterano'
  return 'Mundial'
}

// ✅ FORMATAÇÃO PARA GOVERNO (HIERARQUIA)
const formatGovernmentRank = (bounty: number): string => {
  if (bounty === 0) return 'Agente'
  
  // Dividir por 100 milhões para ter escala similar
  const rankValue = bounty / 100000000
  
  // 5 níveis hierárquicos
  if (rankValue < 0.5) return 'Agente'
  if (rankValue < 1.5) return 'Oficial'
  if (rankValue < 2.5) return 'Comandante'
  if (rankValue < 4) return 'Diretor'
  return 'Alto Comando'
}

// ✅ MÉTODO PARA OBTER DETALHES COMPLETOS (PARA TOOLTIPS)
const getBountyDetails = (character: Character): {
  display: string
  description: string
  numericValue: number
  type: string
} => {
  const display = getBountyDisplay(character)
  let description = ''
  
  switch (character.type) {
    case 'Pirate':
      description = `Recompensa oficial: ${formatPirateBounty(character.bounty)}`
      break
    
    case 'Marine':
      const starValue = Math.min(Math.max(character.bounty / 1000000000, 0), 5)
      const roundedStars = Math.round(starValue * 2) / 2
      description = `Patente Marine: ${roundedStars} estrela(s)`
      break
    
    case 'BountyHunter':
      description = `Recompensa oficial: ${formatPirateBounty(character.bounty)}`
      break
    
    case 'Government':
      description = `Hierarquia Governamental: ${formatGovernmentRank(character.bounty)}`
      break
    
    default:
      description = 'Sem classificação'
  }
  
  return {
    display,
    description,
    numericValue: character.bounty,
    type: character.type
  }
}

// ✅ EXPOR MÉTODO PARA COMPONENTE PAI (SE NECESSÁRIO)
defineExpose({
  getBountyDetails
})
</script>

<style scoped>
.character-bounty-chip {
  font-weight: 700 !important;
  letter-spacing: 0.5px;
}

.character-bounty-chip .v-icon {
  margin-right: 4px;
}


/* ESTILOS ESPECÍFICOS POR TIPO */
.character-bounty-chip.pirate {
  background: linear-gradient(45deg, #c62828, #d32f2f) !important;
}

.character-bounty-chip.marine {
  background: linear-gradient(45deg, #1565c0, #1976d2) !important;
}

.character-bounty-chip.bounty-hunter {
  background: linear-gradient(45deg, #2e7d32, #388e3c) !important;
}

.character-bounty-chip.government {
  background: linear-gradient(45deg, #ef6c00, #f57c00) !important;
}
</style>