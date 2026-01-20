<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Statistiques</ion-card-title>
    </ion-card-header>

    <ion-card-content>
      <div class="stats-grid">
        <!-- Total des problèmes -->
        <div class="stat-item">
          <ion-icon :icon="alertCircleOutline" class="stat-icon primary" />
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalProblems }}</div>
            <div class="stat-label">Signalements</div>
          </div>
        </div>

        <!-- Surface totale -->
        <div class="stat-item">
          <ion-icon :icon="resizeOutline" class="stat-icon warning" />
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(stats.totalSurface) }} m²</div>
            <div class="stat-label">Surface</div>
          </div>
        </div>

        <!-- Budget total -->
        <div class="stat-item">
          <ion-icon :icon="cashOutline" class="stat-icon success" />
          <div class="stat-content">
            <div class="stat-value">{{ formatBudget(stats.totalBudget) }}</div>
            <div class="stat-label">Budget</div>
          </div>
        </div>

        <!-- Avancement -->
        <div class="stat-item">
          <ion-icon :icon="trendingUpOutline" class="stat-icon tertiary" />
          <div class="stat-content">
            <div class="stat-value">{{ stats.advancementPercentage }}%</div>
            <div class="stat-label">Avancement</div>
          </div>
        </div>
      </div>

      <!-- Répartition par statut -->
      <div class="status-breakdown">
        <h4>Répartition par statut</h4>
        <div class="status-bars">
          <div 
            v-for="(count, status) in stats.byStatus" 
            :key="status"
            class="status-bar-item"
          >
            <div class="status-bar-label">
              <span>{{ getStatusLabel(status as ProblemStatus) }}</span>
              <span class="status-bar-count">{{ count }}</span>
            </div>
            <div class="status-bar">
              <div 
                class="status-bar-fill"
                :class="`status-${status}`"
                :style="{ width: getPercentage(count) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/vue';
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

const props = defineProps<Props>();

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(num);
};

const formatBudget = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M Ar`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K Ar`;
  }
  return `${amount} Ar`;
};

const getStatusLabel = (status: ProblemStatus): string => {
  const labels: Record<ProblemStatus, string> = {
    [ProblemStatus.NEW]: 'Nouveau',
    [ProblemStatus.IN_PROGRESS]: 'En cours',
    [ProblemStatus.COMPLETED]: 'Terminé',
  };
  return labels[status];
};

const getPercentage = (count: number): number => {
  return props.stats.totalProblems > 0 
    ? (count / props.stats.totalProblems) * 100 
    : 0;
};
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-icon.primary {
  color: var(--ion-color-primary);
}

.stat-icon.warning {
  color: var(--ion-color-warning);
}

.stat-icon.success {
  color: var(--ion-color-success);
}

.stat-icon.tertiary {
  color: var(--ion-color-tertiary);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--ion-color-dark);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  text-transform: uppercase;
}

.status-breakdown {
  margin-top: 24px;
}

.status-breakdown h4 {
  margin-bottom: 16px;
  font-size: 1rem;
  color: var(--ion-color-dark);
}

.status-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-bar-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.status-bar-count {
  font-weight: bold;
}

.status-bar {
  height: 8px;
  background: var(--ion-color-light);
  border-radius: 4px;
  overflow: hidden;
}

.status-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.status-bar-fill.status-nouveau {
  background: var(--ion-color-warning);
}

.status-bar-fill.status-en_cours {
  background: var(--ion-color-primary);
}

.status-bar-fill.status-termine {
  background: var(--ion-color-success);
}
</style>
