<template>
  <div class="ranking-section">
    <!-- Section Header -->
    <div class="section-header mb-6">
      <h2 class="text-h4 font-weight-bold">{{ title }}</h2>
      <p class="text-subtitle-1 text-medium-emphasis">{{ subtitle }}</p>
      
      <!-- Search Section -->
      <div class="search-section mt-4">
        <v-text-field
          v-model="searchQuery"
          label="Search characters by name..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          class="search-input"
          :placeholder="`Search among ${characters.length} characters`"
        />
        
        <!-- Search Results Info -->
        <div v-if="searchQuery" class="search-info mt-2">
          <v-chip
            v-if="filteredCharacters.length > 0"
            color="success"
            variant="outlined"
            size="small"
          >
            <v-icon start>mdi-check-circle</v-icon>
            {{ filteredCharacters.length }} character{{ filteredCharacters.length !== 1 ? 's' : '' }} found
          </v-chip>
          
          <v-chip
            v-else
            color="warning"
            variant="outlined"
            size="small"
          >
            <v-icon start>mdi-alert-circle</v-icon>
            No characters found for "{{ searchQuery }}"
          </v-chip>
        </div>
      </div>
      
      <!-- Results Counter -->
      <div v-if="maxItems && !searchQuery" class="text-caption mt-2">
        Showing top {{ Math.min(characters.length, maxItems) }} of {{ characters.length }}
      </div>
      
      <div v-else-if="!searchQuery" class="text-caption mt-2">
        Showing {{ displayedCharacters.length }} character{{ displayedCharacters.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="displayedCharacters.length === 0" class="empty-state text-center py-8">
      <v-icon 
        :size="64" 
        :color="searchQuery ? 'orange-lighten-1' : 'grey-lighten-1'"
      >
        {{ searchQuery ? 'mdi-account-search' : 'mdi-account-off' }}
      </v-icon>
      
      <h3 class="mt-4 text-h5">
        {{ searchQuery ? 'No Characters Found' : 'No Characters Available' }}
      </h3>
      
      <p class="text-body-1 text-medium-emphasis">
        <template v-if="searchQuery">
          No characters match "<strong>{{ searchQuery }}</strong>".
          <br>
          <span class="text-caption">Try a different search term or check spelling.</span>
        </template>
        <template v-else>
          No characters match the current criteria.
        </template>
      </p>
      
      <!-- Clear Search Button -->
      <v-btn
        v-if="searchQuery"
        @click="clearSearch"
        color="primary"
        variant="outlined"
        class="mt-4"
      >
        <v-icon start>mdi-refresh</v-icon>
        Clear Search
      </v-btn>
    </div>

    <!-- Character Grid -->
    <div v-else class="character-grid">
      <!-- Search Results Header -->
      <div v-if="searchQuery" class="search-results-header mb-4">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-0"
        >
          <template #prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          
          <div class="d-flex align-center justify-space-between">
            <span>
              Search results for "<strong>{{ searchQuery }}</strong>"
            </span>
            
            <v-btn
              @click="clearSearch"
              size="small"
              variant="text"
              color="primary"
            >
              <v-icon start size="small">mdi-close</v-icon>
              Clear
            </v-btn>
          </div>
        </v-alert>
      </div>
      
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
            :highlight-search="searchQuery"
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
        
        <!-- Pagination Info -->
        <div class="pagination-info text-caption text-center mt-2 w-100">
          Showing {{ paginationStart }}-{{ paginationEnd }} of {{ displayedCharacters.length }} characters
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RankingCharacter } from '@/utils/worldEncyclopedia'
import CharacterRankCard from '@/components/CharacterRankCard.vue'

// Props
interface Props {
  title?: string
  subtitle?: string
  characters: RankingCharacter[]
  maxItems?: number
  specialBadge?: string
  badgeColor?: string
  showPagination?: boolean
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
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
const searchQuery = ref('')

// Methods
const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

// Computed
const filteredCharacters = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.characters
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return props.characters.filter(character => 
    character.name.toLowerCase().includes(query)
  )
})

const displayedCharacters = computed(() => {
  const baseCharacters = filteredCharacters.value
  
  if (props.maxItems && !searchQuery.value) {
    return baseCharacters.slice(0, props.maxItems)
  }
  return baseCharacters
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

const paginationStart = computed(() => {
  if (displayedCharacters.value.length === 0) return 0
  return (currentPage.value - 1) * props.itemsPerPage + 1
})

const paginationEnd = computed(() => {
  const end = currentPage.value * props.itemsPerPage
  return Math.min(end, displayedCharacters.value.length)
})

// Watchers
watch(() => props.characters, () => {
  currentPage.value = 1
})

watch(searchQuery, () => {
  currentPage.value = 1
})

// Expose search functionality for parent components
defineExpose({
  searchQuery,
  clearSearch,
  filteredCharacters
})
</script>

<style scoped>
/* RankingSection - Leaderboard display */

.ranking-section { width: 100%; }

.ranking-section-header {
  background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(21,101,192,0.06));
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ranking-section-title {
  font-family: Georgia, serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 0.04em;
}

.rank-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.rank-entry:hover {
  background: rgba(212,175,55,0.06);
  border-color: rgba(212,175,55,0.2);
}

.rank-entry.rank-player {
  background: rgba(212,175,55,0.08);
  border-color: rgba(212,175,55,0.35);
}

.rank-position {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #D4AF37;
  min-width: 28px;
  font-size: 0.95rem;
  text-align: center;
}

.rank-position.top-1 { color: #FFD700; font-size: 1.1rem; }
.rank-position.top-2 { color: #B0BEC5; }
.rank-position.top-3 { color: #A1887F; }

.rank-entry-name {
  flex: 1;
  font-weight: 600;
  color: #E8D5A3;
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-entry-value {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #D4AF37;
  font-size: 0.88rem;
  white-space: nowrap;
}
</style>