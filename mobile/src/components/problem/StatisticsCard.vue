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
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* === Grid de Stats === */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06),
              0 0 0 0.5px rgba(0, 0, 0, 0.04);
  min-width: 0; /* Permet le shrink */
}

.stat-icon-wrapper {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.stat-icon-wrapper.blue {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
  color: #1565C0;
}

.stat-icon-wrapper.orange {
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
  color: #E65100;
}

.stat-icon-wrapper.green {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  color: #2E7D32;
}

.stat-icon-wrapper.purple {
  background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%);
  color: #7B1FA2;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1C1C1E;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.stat-label {
  font-size: 10px;
  font-weight: 600;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* === Progression === */
.progress-section {
  background: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06),
              0 0 0 0.5px rgba(0, 0, 0, 0.04);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-title {
  font-size: 15px;
  font-weight: 600;
  color: #1C1C1E;
}

.progress-percent {
  font-size: 15px;
  font-weight: 700;
  color: #34C759;
}

.progress-bar {
  height: 8px;
  background: #F2F2F7;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 14px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #34C759 0%, #30D158 100%);
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.progress-legend {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.legend-dot {
  width: 6px;
  height: 6px;
  min-width: 6px;
  border-radius: 50%;
}

.legend-dot.dot-new {
  background: #FF9500;
}

.legend-dot.dot-in_progress {
  background: #007AFF;
}

.legend-dot.dot-completed {
  background: #34C759;
}

.legend-label {
  font-size: 10px;
  color: #8E8E93;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-count {
  font-size: 11px;
  font-weight: 600;
  color: #1C1C1E;
  margin-left: auto;
  flex-shrink: 0;
}

/* === Mobile Responsive === */
@media (max-width: 420px) {
  .stats-grid {
    gap: 8px;
  }

  .stat-card {
    padding: 10px;
    gap: 8px;
  }

  .stat-icon-wrapper {
    width: 36px;
    height: 36px;
    min-width: 36px;
    font-size: 16px;
  }

  .stat-value {
    font-size: 16px;
  }

  .stat-label {
    font-size: 9px;
  }

  .progress-section {
    padding: 14px;
  }

  .progress-title {
    font-size: 14px;
  }

  .legend-label {
    font-size: 9px;
  }

  .legend-count {
    font-size: 10px;
  }
}

/* === Dark Mode === */
@media (prefers-color-scheme: dark) {
  .stat-card,
  .progress-section {
    background: #1C1C1E;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2),
                0 0 0 0.5px rgba(255, 255, 255, 0.08);
  }

  .stat-value {
    color: #FFFFFF;
  }

  .progress-title {
    color: #FFFFFF;
  }

  .progress-bar {
    background: #2C2C2E;
  }

  .legend-count {
    color: #FFFFFF;
  }
}
</style>
