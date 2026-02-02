<template>
  <div class="stats-container">
    <!-- Grid de statistiques -->
    <div class="stats-grid">
      <!-- Total des problèmes -->
      <div class="stat-card">
        <div class="stat-icon-wrapper blue">
          <ion-icon :icon="alertCircleOutline" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalProblems }}</span>
          <span class="stat-label">Signalements</span>
        </div>
      </div>

      <!-- Surface totale -->
      <div class="stat-card">
        <div class="stat-icon-wrapper orange">
          <ion-icon :icon="resizeOutline" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.totalSurface) }}</span>
          <span class="stat-label">m² Surface</span>
        </div>
      </div>

      <!-- Budget total -->
      <div class="stat-card">
        <div class="stat-icon-wrapper green">
          <ion-icon :icon="cashOutline" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatBudget(stats.totalBudget) }}</span>
          <span class="stat-label">Budget</span>
        </div>
      </div>

      <!-- Avancement -->
      <div class="stat-card">
        <div class="stat-icon-wrapper purple">
          <ion-icon :icon="trendingUpOutline" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.advancementPercentage }}%</span>
          <span class="stat-label">Terminés</span>
        </div>
      </div>
    </div>

    <!-- Barre de progression globale -->
    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-title">Progression globale</span>
        <span class="progress-percent">{{ stats.advancementPercentage }}%</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: stats.advancementPercentage + '%' }"
        ></div>
      </div>
      <div class="progress-legend">
        <div 
          v-for="(count, status) in stats.byStatus" 
          :key="status"
          class="legend-item"
        >
          <span class="legend-dot" :class="`dot-${status}`"></span>
          <span class="legend-label">{{ getStatusLabel(status as ProblemStatus) }}</span>
          <span class="legend-count">{{ count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { 
  alertCircleOutline, 
  resizeOutline, 
  cashOutline, 
  trendingUpOutline 
} from 'ionicons/icons';
import { Statistics, ProblemStatus } from '@/types';

interface Props {
  stats: Statistics;
}

defineProps<Props>();

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(num);
};

const formatBudget = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return `${amount}`;
};

const getStatusLabel = (status: ProblemStatus): string => {
  const labels: Record<ProblemStatus, string> = {
    [ProblemStatus.NEW]: 'Nouveau',
    [ProblemStatus.IN_PROGRESS]: 'En cours',
    [ProblemStatus.COMPLETED]: 'Terminé',
  };
  return labels[status];
};
</script>

<style scoped>
/* ============================================
   🍎 STATISTICS CARD - APPLE VISION PRO
   Ultra Premium Dashboard Design
   ============================================ */

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeInStats 0.6s ease-out;
}

@keyframes fadeInStats {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === Grid de Stats Premium === */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 20px;
  box-shadow: 
    0 4px 20px rgba(102, 126, 234, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  border: 1px solid rgba(255, 255, 255, 0.6);
  min-width: 0;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 12px 40px rgba(102, 126, 234, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.9) inset;
}

.stat-card:nth-child(1) { animation: statPop 0.5s ease-out 0.1s both; }
.stat-card:nth-child(2) { animation: statPop 0.5s ease-out 0.15s both; }
.stat-card:nth-child(3) { animation: statPop 0.5s ease-out 0.2s both; }
.stat-card:nth-child(4) { animation: statPop 0.5s ease-out 0.25s both; }

@keyframes statPop {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0) 50%
  );
}

.stat-icon-wrapper.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon-wrapper.orange {
  background: linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%);
  color: white;
}

.stat-icon-wrapper.green {
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
  color: white;
}

.stat-icon-wrapper.purple {
  background: linear-gradient(135deg, #af52de 0%, #bf5af2 100%);
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.8px;
  line-height: 1.2;
}

.stat-label {
  font-size: 11px;
  font-weight: 700;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* === Progression Premium === */
.progress-section {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 
    0 4px 24px rgba(102, 126, 234, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  border: 1px solid rgba(255, 255, 255, 0.6);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.6s ease-out 0.3s both;
}

.progress-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.progress-title {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #1a1a2e 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.3px;
}

.progress-percent {
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-bar {
  height: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(102, 126, 234, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #34c759 0%, #30d158 50%, #a7f3d0 100%);
  background-size: 200% 100%;
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  animation: progressShimmer 2s ease-in-out infinite;
  box-shadow: 
    0 0 20px rgba(52, 199, 89, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

@keyframes progressShimmer {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 100% 0%; }
}

.progress-legend {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.legend-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.legend-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 50%;
  box-shadow: 0 2px 6px currentColor;
}

.legend-dot.dot-new {
  background: linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%);
  box-shadow: 0 2px 8px rgba(255, 149, 0, 0.4);
}

.legend-dot.dot-in_progress {
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.4);
}

.legend-dot.dot-completed {
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.4);
}

.legend-label {
  font-size: 10px;
  color: #666;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.2px;
}

.legend-count {
  font-size: 13px;
  font-weight: 800;
  background: linear-gradient(135deg, #1a1a2e 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-left: auto;
  flex-shrink: 0;
}

/* === Mobile Responsive === */
@media (max-width: 420px) {
  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
    gap: 10px;
    border-radius: 16px;
  }

  .stat-icon-wrapper {
    width: 42px;
    height: 42px;
    min-width: 42px;
    font-size: 18px;
    border-radius: 12px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-label {
    font-size: 9px;
  }

  .progress-section {
    padding: 16px;
    border-radius: 20px;
  }

  .progress-title {
    font-size: 14px;
  }

  .progress-bar {
    height: 10px;
  }

  .legend-item {
    padding: 6px 8px;
  }

  .legend-label {
    font-size: 9px;
  }

  .legend-count {
    font-size: 11px;
  }
}

/* === Dark Mode Premium === */
@media (prefers-color-scheme: dark) {
  .stat-card,
  .progress-section {
    background: rgba(40, 40, 50, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 4px 24px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  }

  .stat-card::before,
  .progress-section::before {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  .stat-card:hover {
    box-shadow: 
      0 12px 40px rgba(102, 126, 234, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.15) inset;
  }

  .stat-value {
    background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    color: rgba(255, 255, 255, 0.6);
  }

  .progress-title {
    background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .progress-bar {
    background: rgba(102, 126, 234, 0.15);
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(102, 126, 234, 0.2);
  }

  .legend-item {
    background: rgba(102, 126, 234, 0.1);
  }

  .legend-item:hover {
    background: rgba(102, 126, 234, 0.2);
  }

  .legend-label {
    color: rgba(255, 255, 255, 0.6);
  }

  .legend-count {
    background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}
</style>
