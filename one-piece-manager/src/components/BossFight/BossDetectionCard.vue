<template>
  <div class="boss-detection-card">
    <div class="boss-header">
      <div class="boss-type-badge" :class="bossTypeClass">
        {{ boss.type }}
      </div>
      <h3 class="boss-name">{{ boss.captain.name }}</h3>
      <div class="boss-level">Nível {{ boss.captain.level }}</div>
    </div>

    <div class="boss-info">
      <div class="boss-stats">
        <div class="stat-item">
          <span class="stat-label">Bounty:</span>
          <span class="stat-value">{{ formatBounty(boss.captain.bounty) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Tripulação:</span>
          <span class="stat-value">{{ boss.crewMembers.length }} membros</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Crew:</span>
          <span class="stat-value">{{ boss.crew.name }}</span>
        </div>
      </div>

      <div class="crew-preview">
        <h4>Membros da Tripulação:</h4>
        <div class="crew-members">
          <div 
            v-for="(member, index) in boss.crewMembers.slice(0, 3)" 
            :key="member.id"
            class="crew-member"
          >
            <span class="member-name">{{ member.name }}</span>
            <span class="member-level">Lv.{{ member.level }}</span>
          </div>
          <div v-if="boss.crewMembers.length > 3" class="more-members">
            +{{ boss.crewMembers.length - 3 }} mais
          </div>
        </div>
      </div>
    </div>

    <div class="boss-actions">
      <button 
        @click="$emit('challenge', boss)"
        :disabled="loading"
        class="challenge-btn"
        :class="bossTypeClass"
      >
        <span v-if="loading" class="loading-spinner">⏳</span>
        <span v-else>⚔️</span>
        {{ loading ? 'Iniciando...' : 'Desafiar' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DetectedBoss } from '@/utils/bossDetectionSystem'

interface Props {
  boss: DetectedBoss
  loading?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  challenge: [boss: DetectedBoss]
}>()

const bossTypeClass = computed(() => {
  const classes = {
    'Yonkou': 'yonkou',
    'Shichibukai': 'shichibukai', 
    'Admiral': 'admiral',
    'Gorousei': 'gorousei'
  }
  return classes[props.boss.type] || 'default'
})

const formatBounty = (bounty: number): string => {
  if (bounty >= 1000000000) {
    return `${(bounty / 1000000000).toFixed(1)}B`
  } else if (bounty >= 1000000) {
    return `${(bounty / 1000000).toFixed(0)}M`
  } else if (bounty >= 1000) {
    return `${(bounty / 1000).toFixed(0)}K`
  }
  return bounty.toString()
}
</script>

<style scoped>
/* ============================================================
   BossDetectionCard - Alert card for detected bosses
   ============================================================ */

.detection-card {
  background: linear-gradient(135deg, #1A0808, #2A1010);
  border: 1px solid rgba(198, 40, 40, 0.5);
  border-radius: 12px;
  overflow: hidden;
  animation: detection-pulse 3s ease-in-out infinite;
}

.detection-card-header {
  background: linear-gradient(135deg, rgba(198,40,40,0.2), rgba(139,0,0,0.15));
  border-bottom: 1px solid rgba(198,40,40,0.3);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detection-title {
  font-family: Georgia, serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #FF5252;
  text-shadow: 0 0 8px rgba(255,82,82,0.4);
  letter-spacing: 0.04em;
}

.detection-body { padding: 12px 14px; }

.boss-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  color: #E8D5A3;
}

.boss-info-row:last-child { border-bottom: none; }

.boss-info-label {
  color: #8B9DC3;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.7rem;
}

.boss-power-value { color: #FF5252; font-weight: 700; }

.challenge-btn {
  background: linear-gradient(135deg, #B71C1C, #C62828) !important;
  color: #fff !important;
  font-weight: 700 !important;
  width: 100%;
  margin-top: 10px;
  border-radius: 8px !important;
  letter-spacing: 0.06em !important;
  box-shadow: 0 4px 16px rgba(198,40,40,0.3) !important;
}

@keyframes detection-pulse {
  0%, 100% { box-shadow: 0 0 12px rgba(198,40,40,0.25); }
  50%       { box-shadow: 0 0 28px rgba(198,40,40,0.55); }
}
</style>