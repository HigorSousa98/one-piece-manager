<!-- src/components/CharacterBountyDisplay.vue -->
<template>
  <v-chip 
    :color="GameLogic.getBountyColor(character.type)" 
    :size="size" 
    :variant="variant"
    class="character-bounty-chip mb-2"
  >
    <template #prepend>
      <v-icon :size="iconSize">{{ GameLogic.getBountyIcon(character.type) }}</v-icon>
    </template>
    
    <strong>{{ GameLogic.getBountyDisplay(character) }}</strong>
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Character } from '@/utils/database'
import { GameLogic } from '@/utils/gameLogic'

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