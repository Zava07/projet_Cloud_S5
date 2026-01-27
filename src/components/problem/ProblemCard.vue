<template>
  <div class="apple-card" @click="$emit('click', problem)">
    <!-- Header avec badge statut -->
    <div class="card-header">
      <div class="status-badge" :class="`status-${problem.status}`">
        {{ getStatusLabel(problem.status) }}
      </div>
      <div class="card-date">{{ formatDate(problem.reportedAt) }}</div>
    </div>

    <!-- Contenu principal -->
    <div class="card-body">
      <h3 class="card-title">{{ problem.title }}</h3>
      
      <div class="card-location">
        <ion-icon :icon="locationOutline" />
        <span>{{ problem.address }}</span>
      </div>

      <p class="card-description">{{ problem.description }}</p>
    </div>

    <!-- Footer avec infos -->
    <div class="card-footer">
      <div class="card-stats">
        <div class="stat-pill">
          <ion-icon :icon="resizeOutline" />
          <span>{{ problem.surface }} m²</span>
        </div>
        
        <div v-if="problem.budget" class="stat-pill budget">
          <ion-icon :icon="cashOutline" />
          <span>{{ formatBudget(problem.budget) }}</span>
        </div>
      </div>

      <div class="card-author">
        <div class="author-avatar">
          {{ getInitials(problem.reportedByName) }}
        </div>
        <span class="author-name">{{ problem.reportedByName }}</span>
      </div>
    </div>

    <!-- Indicateur de clic -->
    <div class="card-arrow">
      <ion-icon :icon="chevronForwardOutline" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { 
  locationOutline, 
  resizeOutline, 
  cashOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { Problem, ProblemStatus } from '@/types';

interface Props {
  problem: Problem;
}

defineProps<Props>();
defineEmits<{
  click: [problem: Problem];
}>();

const formatDate = (date: Date | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
};

const formatBudget = (amount: number): string => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return `${amount}`;
};

const getInitials = (name: string | undefined): string => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
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
.apple-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06),
              0 0 0 0.5px rgba(0, 0, 0, 0.04);
}

.apple-card:active {
  transform: scale(0.98);
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.status-badge {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.status-new {
  background: #FFF3E0;
  color: #E65100;
}

.status-badge.status-in_progress {
  background: #E3F2FD;
  color: #1565C0;
}

.status-badge.status-completed {
  background: #E8F5E9;
  color: #2E7D32;
}

.card-date {
  font-size: 12px;
  color: #8E8E93;
  font-weight: 500;
}

/* Body */
.card-body {
  margin-bottom: 14px;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1C1C1E;
  margin: 0 0 8px;
  letter-spacing: -0.4px;
  line-height: 1.3;
  padding-right: 24px;
}

.card-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8E8E93;
  margin-bottom: 10px;
}

.card-location ion-icon {
  font-size: 14px;
  color: #FF3B30;
}

.card-description {
  font-size: 14px;
  color: #3C3C43;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 0.5px solid rgba(60, 60, 67, 0.1);
}

.card-stats {
  display: flex;
  gap: 8px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #F2F2F7;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #3C3C43;
}

.stat-pill ion-icon {
  font-size: 14px;
  color: #8E8E93;
}

.stat-pill.budget {
  background: #E8F5E9;
  color: #2E7D32;
}

.stat-pill.budget ion-icon {
  color: #34C759;
}

.card-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: white;
}

.author-name {
  font-size: 12px;
  color: #8E8E93;
  font-weight: 500;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Arrow */
.card-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #C7C7CC;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.apple-card:hover .card-arrow {
  opacity: 1;
}

/* === Mobile Responsive === */
@media (max-width: 420px) {
  .apple-card {
    padding: 14px;
    border-radius: 14px;
  }

  .status-badge {
    padding: 4px 8px;
    font-size: 10px;
  }

  .card-title {
    font-size: 15px;
    padding-right: 20px;
  }

  .card-location {
    font-size: 12px;
  }

  .card-description {
    font-size: 13px;
  }

  .stat-pill {
    padding: 5px 8px;
    font-size: 11px;
  }

  .author-avatar {
    width: 24px;
    height: 24px;
    font-size: 9px;
  }

  .author-name {
    font-size: 11px;
    max-width: 70px;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .apple-card {
    background: #1C1C1E;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2),
                0 0 0 0.5px rgba(255, 255, 255, 0.08);
  }

  .card-title {
    color: #FFFFFF;
  }

  .card-description {
    color: #EBEBF5;
  }

  .stat-pill {
    background: #2C2C2E;
    color: #EBEBF5;
  }

  .stat-pill.budget {
    background: rgba(52, 199, 89, 0.15);
  }

  .card-footer {
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
