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
.boss-detection-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  border: 2px solid #333;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.boss-detection-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--boss-gradient);
  transition: all 0.3s ease;
}

.boss-detection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  border-color: var(--boss-color);
}

.boss-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.boss-type-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: white;
}

.boss-type-badge.yonkou {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  --boss-color: #ff6b6b;
  --boss-gradient: linear-gradient(90deg, #ff6b6b, #ee5a24);
}

.boss-type-badge.shichibukai {
  background: linear-gradient(135deg, #a55eea, #8b5cf6);
  --boss-color: #a55eea;
  --boss-gradient: linear-gradient(90deg, #a55eea, #8b5cf6);
}

.boss-type-badge.admiral {
  background: linear-gradient(135deg, #26de81, #20bf6b);
  --boss-color: #26de81;
  --boss-gradient: linear-gradient(90deg, #26de81, #20bf6b);
}

.boss-type-badge.gorousei {
  background: linear-gradient(135deg, #feca57, #ff9ff3);
  --boss-color: #feca57;
  --boss-gradient: linear-gradient(90deg, #feca57, #ff9ff3);
}

.boss-name {
  color: #fff;
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  flex: 1;
}

.boss-level {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
}

.boss-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.boss-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #888;
  font-size: 14px;
}

.stat-value {
  color: #fff;
  font-weight: bold;
}

.crew-preview h4 {
  color: #fff;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.crew-members {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.crew-member {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.member-name {
  color: #fff;
  font-size: 14px;
}

.member-level {
  color: #888;
  font-size: 12px;
}

.more-members {
  color: #888;
  font-style: italic;
  text-align: center;
  padding: 8px;
}

.boss-actions {
  display: flex;
  justify-content: center;
}

.challenge-btn {
  background: var(--boss-gradient, linear-gradient(135deg, #667eea, #764ba2));
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
  justify-content: center;
}

.challenge-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.challenge-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .boss-info {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .boss-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .boss-name {
    font-size: 20px;
  }
}
</style>