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
/* ============================================
   🍎 PROBLEM CARD - APPLE VISION PRO STYLE
   Ultra Premium Glassmorphic Design
   ============================================ */

.apple-card {
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 24px;
  padding: 20px;
  cursor: pointer;
  transition: 
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.4s ease,
    background 0.3s ease;
  box-shadow: 
    0 4px 24px rgba(102, 126, 234, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset,
    0 1px 0 rgba(255, 255, 255, 1) inset;
  border: 1px solid rgba(255, 255, 255, 0.6);
  overflow: hidden;
}

.apple-card::before {
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
  border-radius: 24px 24px 0 0;
  pointer-events: none;
}

.apple-card:active {
  transform: scale(0.97);
  background: rgba(255, 255, 255, 0.95);
}

.apple-card:hover {
  box-shadow: 
    0 20px 60px rgba(102, 126, 234, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.9) inset,
    0 1px 0 rgba(255, 255, 255, 1) inset;
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

.status-badge.status-new {
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.15) 0%, rgba(255, 94, 58, 0.15) 100%);
  color: #e65100;
  border: 1px solid rgba(255, 149, 0, 0.3);
}

.status-badge.status-new::before {
  background: #ff9500;
}

.status-badge.status-in_progress {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(88, 86, 214, 0.15) 100%);
  color: #0056b3;
  border: 1px solid rgba(0, 122, 255, 0.3);
}

.status-badge.status-in_progress::before {
  background: #007aff;
}

.status-badge.status-completed {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.15) 0%, rgba(48, 209, 88, 0.15) 100%);
  color: #1b5e20;
  border: 1px solid rgba(52, 199, 89, 0.3);
}

.status-badge.status-completed::before {
  background: #34c759;
}

.card-date {
  font-size: 12px;
  color: #8E8E93;
  font-weight: 600;
  background: rgba(142, 142, 147, 0.1);
  padding: 4px 10px;
  border-radius: 8px;
}

/* Body */
.card-body {
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 10px;
  letter-spacing: -0.5px;
  line-height: 1.35;
  padding-right: 28px;
}

.card-location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 500;
}

.card-location ion-icon {
  font-size: 16px;
  color: #ff3b30;
  filter: drop-shadow(0 1px 2px rgba(255, 59, 48, 0.3));
}

.card-description {
  font-size: 14px;
  color: #4a4a5a;
  line-height: 1.6;
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
  padding-top: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  position: relative;
  z-index: 1;
}

.card-stats {
  display: flex;
  gap: 10px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #4a4a5a;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.2s ease;
}

.stat-pill:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
}

.stat-pill ion-icon {
  font-size: 15px;
  color: #667eea;
}

.stat-pill.budget {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(48, 209, 88, 0.1) 100%);
  border-color: rgba(52, 199, 89, 0.2);
  color: #1b5e20;
}

.stat-pill.budget ion-icon {
  color: #34c759;
}

.card-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  box-shadow: 
    0 4px 12px rgba(102, 126, 234, 0.3),
    0 0 0 2px rgba(255, 255, 255, 0.8);
}

.author-name {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Arrow */
.card-arrow {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
  opacity: 0.5;
  font-size: 20px;
  transition: all 0.3s ease;
}

.apple-card:hover .card-arrow {
  opacity: 1;
  transform: translateY(-50%) translateX(4px);
}

/* === Mobile Responsive === */
@media (max-width: 420px) {
  .apple-card {
    padding: 16px;
    border-radius: 20px;
  }

  .status-badge {
    padding: 6px 10px;
    font-size: 10px;
    border-radius: 10px;
  }

  .card-title {
    font-size: 16px;
    padding-right: 24px;
  }

  .card-location {
    font-size: 12px;
  }

  .card-description {
    font-size: 13px;
  }

  .stat-pill {
    padding: 6px 10px;
    font-size: 11px;
    border-radius: 10px;
  }

  .author-avatar {
    width: 28px;
    height: 28px;
    font-size: 10px;
    border-radius: 8px;
  }

  .author-name {
    font-size: 11px;
    max-width: 65px;
  }
}

/* === Dark Mode Premium === */
@media (prefers-color-scheme: dark) {
  .apple-card {
    background: rgba(40, 40, 50, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 4px 24px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  }

  .apple-card::before {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  .apple-card:active {
    background: rgba(50, 50, 60, 0.8);
  }

  .apple-card:hover {
    box-shadow: 
      0 20px 60px rgba(102, 126, 234, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.15) inset;
  }

  .card-title {
    color: #ffffff;
  }

  .card-date {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
  }

  .card-location {
    color: rgba(255, 255, 255, 0.6);
  }

  .card-description {
    color: rgba(255, 255, 255, 0.8);
  }

  .stat-pill {
    background: rgba(102, 126, 234, 0.15);
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(102, 126, 234, 0.2);
  }

  .stat-pill ion-icon {
    color: #a5b4fc;
  }

  .stat-pill.budget {
    background: rgba(52, 199, 89, 0.15);
    color: #86efac;
    border-color: rgba(52, 199, 89, 0.2);
  }

  .card-footer {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .author-name {
    color: rgba(255, 255, 255, 0.7);
  }

  .card-arrow {
    color: #a5b4fc;
  }

  .status-badge.status-new {
    background: rgba(255, 149, 0, 0.2);
    color: #ffb347;
  }

  .status-badge.status-in_progress {
    background: rgba(0, 122, 255, 0.2);
    color: #64b5f6;
  }

  .status-badge.status-completed {
    background: rgba(52, 199, 89, 0.2);
    color: #81c784;
  }
}
</style>
