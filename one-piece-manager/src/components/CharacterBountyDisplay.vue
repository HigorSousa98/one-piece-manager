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
/* CharacterBountyDisplay - Bounty chip component */

.bounty-display-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 700;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.bounty-display-chip.size-small {
  font-size: 0.72rem;
  padding: 2px 8px;
}

.bounty-display-chip.size-default {
  font-size: 0.82rem;
}

.bounty-display-chip.size-large {
  font-size: 1rem;
  padding: 4px 14px;
}

.bounty-display-chip.variant-elevated {
  background: rgba(212,175,55,0.15);
  border: 1px solid rgba(212,175,55,0.4);
  color: #FFD700;
}

.bounty-display-chip.variant-flat {
  background: transparent;
  color: #D4AF37;
  border: none;
}

.bounty-icon { flex-shrink: 0; }

.bounty-amount {
  font-family: Georgia, serif;
  text-shadow: 0 0 6px rgba(255,215,0,0.3);
}
</style>