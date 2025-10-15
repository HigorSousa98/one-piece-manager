<template>
  <div class="ranking-section">
    <!-- Section Header -->
    <div class="section-header mb-6">
      <h2 class="text-h4 font-weight-bold">{{ title }}</h2>
      <p class="text-subtitle-1 text-medium-emphasis">{{ subtitle }}</p>
      <div v-if="maxItems" class="text-caption mt-2">
        Showing top {{ Math.min(characters.length, maxItems) }} of {{ characters.length }}
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="displayedCharacters.length === 0" class="empty-state text-center py-8">
      <v-icon size="64" color="grey-lighten-1">mdi-account-off</v-icon>
      <h3 class="mt-4 text-h5">No Characters Found</h3>
      <p class="text-body-1 text-medium-emphasis">
        No characters match the current criteria.
      </p>
    </div>

    <!-- Character Grid -->
    <div v-else class="character-grid">
      <v-row>
        <v-col
          v-for="character in paginatedCharacters"
          :key="character.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <CharacterRankCard
            :character="character"
            :special-badge="specialBadge"
            :badge-color="badgeColor"
            :show-rank="true"
            @click="$emit('characterClick', character)"
          />
          
        </v-col>
      </v-row>

      <!-- Pagination -->
      <div v-if="showPagination && totalPages > 1" class="d-flex justify-center mt-6">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          color="primary"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RankingCharacter } from '@/utils/worldEncyclopedia'
import CharacterRankCard from '@/components/CharacterRankCard.vue'
import { DevilFruit } from '@/utils/database'

// Props
interface Props {
  title: string
  subtitle: string
  characters: RankingCharacter[]
  maxItems?: number
  specialBadge?: string
  badgeColor?: string
  showPagination?: boolean
  itemsPerPage?: number
  allDevilFruits: DevilFruit[]
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: undefined,
  specialBadge: undefined,
  badgeColor: 'primary',
  showPagination: false,
  itemsPerPage: 12
})

// Emits
defineEmits<{
  characterClick: [character: RankingCharacter]
}>()

// Reactive data
const currentPage = ref(1)

// Computed
const displayedCharacters = computed(() => {
  if (props.maxItems) {
    return props.characters.slice(0, props.maxItems)
  }
  return props.characters
})

const totalPages = computed(() => {
  if (!props.showPagination) return 1
  return Math.ceil(displayedCharacters.value.length / props.itemsPerPage)
})

const paginatedCharacters = computed(() => {
  if (!props.showPagination) {
    return displayedCharacters.value
  }
  
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return displayedCharacters.value.slice(start, end)
})

// Watchers
watch(() => props.characters, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.ranking-section {
  width: 100%;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.character-grid {
  width: 100%;
}

.empty-state {
  padding: 4rem 0;
  opacity: 0.7;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .section-header {
    margin-bottom: 1rem;
  }
}
</style>