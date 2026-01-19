<template>
  <ion-card :class="['problem-card', `status-${problem.status}`]" @click="$emit('click', problem)">
    <ion-card-header>
      <ion-card-subtitle>
        <ion-icon :icon="locationOutline" />
        {{ problem.address }}
      </ion-card-subtitle>
      <ion-card-title>{{ problem.title }}</ion-card-title>
    </ion-card-header>

    <ion-card-content>
      <p class="description">{{ problem.description }}</p>
      
      <div class="problem-info">
        <div class="info-item">
          <ion-icon :icon="calendarOutline" />
          <span>{{ formatDate(problem.reportedAt) }}</span>
        </div>
        
        <div class="info-item">
          <ion-icon :icon="personOutline" />
          <span>{{ problem.reportedByName }}</span>
        </div>
        
        <div class="info-item">
          <ion-icon :icon="resizeOutline" />
          <span>{{ problem.surface }} m²</span>
        </div>
        
        <div v-if="problem.budget" class="info-item">
          <ion-icon :icon="cashOutline" />
          <span>{{ formatCurrency(problem.budget) }}</span>
        </div>
        
        <div v-if="problem.company" class="info-item">
          <ion-icon :icon="businessOutline" />
          <span>{{ problem.company }}</span>
        </div>
      </div>

      <ion-chip :color="getStatusColor(problem.status)">
        <ion-label>{{ getStatusLabel(problem.status) }}</ion-label>
      </ion-chip>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { 
  IonCard, 
  IonCardHeader, 
  IonCardSubtitle, 
  IonCardTitle, 
  IonCardContent,
  IonChip,
  IonLabel,
  IonIcon
} from '@ionic/vue';
import { 
  locationOutline, 
  calendarOutline, 
  personOutline, 
  resizeOutline, 
  cashOutline,
  businessOutline
} from 'ionicons/icons';
import { Problem, ProblemStatus } from '@/types';

interface Props {
  problem: Problem;
}

defineProps<Props>();
defineEmits<{
  click: [problem: Problem];
}>();

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: ProblemStatus): string => {
  const colors: Record<ProblemStatus, string> = {
    [ProblemStatus.NEW]: 'warning',
    [ProblemStatus.IN_PROGRESS]: 'primary',
    [ProblemStatus.COMPLETED]: 'success',
    [ProblemStatus.BLOCKED]: 'danger',
  };
  return colors[status];
};

const getStatusLabel = (status: ProblemStatus): string => {
  const labels: Record<ProblemStatus, string> = {
    [ProblemStatus.NEW]: 'Nouveau',
    [ProblemStatus.IN_PROGRESS]: 'En cours',
    [ProblemStatus.COMPLETED]: 'Terminé',
    [ProblemStatus.BLOCKED]: 'Bloqué',
  };
  return labels[status];
};
</script>

<style scoped>
.problem-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid var(--ion-color-medium);
}

.problem-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.problem-card.status-nouveau {
  border-left-color: var(--ion-color-warning);
}

.problem-card.status-en_cours {
  border-left-color: var(--ion-color-primary);
}

.problem-card.status-termine {
  border-left-color: var(--ion-color-success);
}

.problem-card.status-bloque {
  border-left-color: var(--ion-color-danger);
}

.description {
  color: var(--ion-color-medium);
  margin-bottom: 12px;
}

.problem-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 12px 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: var(--ion-color-step-600);
}

.info-item ion-icon {
  font-size: 1rem;
}
</style>
