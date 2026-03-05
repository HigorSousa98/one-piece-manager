<!-- src/views/BossFight.vue -->
<template>
  <div class="boss-fight-page">
    <v-row>
      <v-col cols="12">
        <v-card class="boss-fight-header" elevation="4">
          <v-card-title class="text-center">
            <v-icon size="48" color="error" class="mr-4">mdi-skull</v-icon>
            <span class="text-h3 boss-title">Boss Fight Arena</span>
          </v-card-title>
          <v-card-subtitle class="text-center text-h6">
            Desafie os algozes mais poderosos do mundo!
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <BossFightManager
          :player-crew-id="playerCrewId"
          :current-island-id="currentIslandId"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { useGameStore } from '@/stores/gameStore'
import BossFightManager from '@/components/BossFight/BossFightManager.vue'

const characterStore = useCharacterStore()
const gameStore = useGameStore()

const playerCrewId = computed(() => characterStore.playerCharacter?.crewId || 0)
const currentIslandId = computed(() => characterStore.playerCrew?.currentIsland || 1)
</script>

<style scoped>
/* ============================================================
   Boss Fight - Grand Line Inferno
   ============================================================ */

/* Boss fight arena container */
.boss-fight-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 8px;
}

/* Header - danger theme */
.boss-fight-header {
  background: linear-gradient(135deg, #1A0808, #2D1010);
  border: 1px solid rgba(198, 40, 40, 0.5);
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.boss-fight-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent, #C62828, #FF5252, #C62828, transparent
  );
}

.boss-fight-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(198,40,40,0.04) 50%, transparent 70%);
  animation: danger-shimmer 3s infinite;
}

.boss-fight-title {
  font-family: Georgia, serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #FF5252;
  text-shadow: 0 0 20px rgba(255, 82, 82, 0.5);
  letter-spacing: 0.06em;
  margin: 0;
  position: relative;
  z-index: 1;
}

/* Boss card */
.boss-card {
  background: linear-gradient(135deg, #1A0808, #2D1215) !important;
  border: 1px solid rgba(198, 40, 40, 0.55) !important;
  border-radius: 14px !important;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(198, 40, 40, 0.2) !important;
}

.boss-card-header {
  background: linear-gradient(135deg, rgba(198, 40, 40, 0.25), rgba(139, 0, 0, 0.15));
  border-bottom: 1px solid rgba(198, 40, 40, 0.35);
  padding: 14px 18px;
}

.boss-name {
  font-family: Georgia, serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #FF5252;
  text-shadow: 0 0 14px rgba(255, 82, 82, 0.5);
  letter-spacing: 0.04em;
}

.boss-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #EF9A9A;
  background: rgba(239, 83, 80, 0.12);
  border: 1px solid rgba(239, 83, 80, 0.35);
  margin-top: 4px;
}

/* HP bars */
.boss-hp-track {
  height: 14px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 7px;
  overflow: hidden;
  border: 1px solid rgba(198, 40, 40, 0.25);
  margin: 8px 0;
}

.boss-hp-fill {
  height: 100%;
  border-radius: 7px;
  background: linear-gradient(90deg, #B71C1C, #EF5350);
  transition: width 0.6s ease;
  position: relative;
  overflow: hidden;
}

.boss-hp-fill::after {
  content: '';
  position: absolute;
  top: 0; left: -60%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: hp-shimmer 2.5s infinite;
}

.player-hp-track {
  height: 14px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 7px;
  overflow: hidden;
  border: 1px solid rgba(46, 125, 50, 0.3);
  margin: 8px 0;
}

.player-hp-fill {
  height: 100%;
  border-radius: 7px;
  background: linear-gradient(90deg, #1B5E20, #4CAF50);
  transition: width 0.6s ease;
  position: relative;
  overflow: hidden;
}

.player-hp-fill::after {
  content: '';
  position: absolute;
  top: 0; left: -60%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: hp-shimmer 2.5s infinite;
}

/* VS divider */
.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  position: relative;
}

.vs-text {
  font-family: Georgia, serif;
  font-size: 2rem;
  font-weight: 700;
  color: #D4AF37;
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
  z-index: 1;
  padding: 0 20px;
  background: #0D1B2E;
}

.vs-line {
  position: absolute;
  left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent);
}

/* Battle log */
.battle-log {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(198, 40, 40, 0.2);
  border-radius: 10px;
  padding: 14px;
  font-family: 'Courier New', monospace;
  font-size: 0.82rem;
  max-height: 280px;
  overflow-y: auto;
  line-height: 1.7;
}

.battle-log::-webkit-scrollbar-thumb { background: rgba(198, 40, 40, 0.4); }

.log-player  { color: #D4AF37; }
.log-boss    { color: #EF5350; }
.log-system  { color: #8B9DC3; font-style: italic; }
.log-victory { color: #FFD700; font-weight: 700; }
.log-defeat  { color: #FF5252; font-weight: 700; }

/* Action buttons */
.attack-btn {
  background: linear-gradient(135deg, #B71C1C, #C62828) !important;
  color: #fff !important;
  font-weight: 700 !important;
  letter-spacing: 0.06em !important;
  box-shadow: 0 4px 20px rgba(198, 40, 40, 0.4) !important;
  transition: all 0.2s ease !important;
}

.attack-btn:hover {
  box-shadow: 0 6px 28px rgba(198, 40, 40, 0.65) !important;
  transform: translateY(-2px) !important;
}

/* No boss detected state */
.no-boss-container {
  text-align: center;
  padding: 60px 20px;
}

.no-boss-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.3;
}

.no-boss-text {
  font-family: Georgia, serif;
  font-size: 1.2rem;
  color: #546E7A;
}

@keyframes danger-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%);  }
}

@keyframes hp-shimmer {
  0%   { left: -60%; }
  100% { left: 160%; }
}
</style>