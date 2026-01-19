<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/problems" />
        </ion-buttons>
        <ion-title>Détails du problème</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding" v-if="problem">
      <!-- Statut Badge -->
      <div class="status-header">
        <ion-chip :color="getStatusColor(problem.status)" class="status-chip">
          <ion-label>{{ getStatusLabel(problem.status) }}</ion-label>
        </ion-chip>
      </div>

      <!-- Titre et description -->
      <h1>{{ problem.title }}</h1>
      <p class="description">{{ problem.description }}</p>

      <!-- Informations détaillées -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Informations</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-icon :icon="locationOutline" slot="start" color="primary" />
              <ion-label>
                <h3>Adresse</h3>
                <p>{{ problem.address }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon :icon="calendarOutline" slot="start" color="primary" />
              <ion-label>
                <h3>Date du signalement</h3>
                <p>{{ formatDate(problem.reportedAt) }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon :icon="calendarOutline" slot="start" color="medium" />
              <ion-label>
                <h3>Dernière mise à jour</h3>
                <p>{{ formatDate(problem.updatedAt) }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon :icon="personOutline" slot="start" color="primary" />
              <ion-label>
                <h3>Signalé par</h3>
                <p>{{ problem.reportedByName }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon :icon="resizeOutline" slot="start" color="primary" />
              <ion-label>
                <h3>Surface affectée</h3>
                <p>{{ problem.surface }} m²</p>
              </ion-label>
            </ion-item>

            <ion-item v-if="problem.budget">
              <ion-icon :icon="cashOutline" slot="start" color="success" />
              <ion-label>
                <h3>Budget alloué</h3>
                <p>{{ formatCurrency(problem.budget) }}</p>
              </ion-label>
            </ion-item>

            <ion-item v-if="problem.company">
              <ion-icon :icon="businessOutline" slot="start" color="primary" />
              <ion-label>
                <h3>Entreprise responsable</h3>
                <p>{{ problem.company }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Actions Manager -->
      <ion-card v-if="isManager">
        <ion-card-header>
          <ion-card-title>Actions Manager</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label>Changer le statut</ion-label>
            <ion-select 
              :value="problem.status"
              @ionChange="updateStatus($event.detail.value)"
              interface="action-sheet"
            >
              <ion-select-option :value="ProblemStatus.NEW">Nouveau</ion-select-option>
              <ion-select-option :value="ProblemStatus.IN_PROGRESS">En cours</ion-select-option>
              <ion-select-option :value="ProblemStatus.COMPLETED">Terminé</ion-select-option>
              <ion-select-option :value="ProblemStatus.BLOCKED">Bloqué</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Budget (Ar)</ion-label>
            <ion-input 
              type="number"
              :value="problem.budget"
              @ionChange="updateBudget($event.detail.value)"
            />
          </ion-item>

          <ion-item>
            <ion-label position="floating">Entreprise</ion-label>
            <ion-input 
              :value="problem.company"
              @ionChange="updateCompany($event.detail.value)"
            />
          </ion-item>
        </ion-card-content>
      </ion-card>
    </ion-content>

    <!-- État vide si problème non trouvé -->
    <ion-content v-else class="ion-padding">
      <div class="empty-state">
        <ion-icon :icon="alertCircleOutline" class="empty-icon" />
        <p>Problème non trouvé</p>
        <ion-button @click="$router.push('/problems')">
          Retour à la liste
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonChip,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonInput,
  toastController,
} from '@ionic/vue';
import {
  locationOutline,
  calendarOutline,
  personOutline,
  resizeOutline,
  cashOutline,
  businessOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { useAuth } from '@/services/useAuth';
import { useProblems } from '@/services/useProblems';
import { Problem, ProblemStatus } from '@/types';

const route = useRoute();
const { isManager } = useAuth();
const { getProblemById, updateProblem } = useProblems();

const problem = ref<Problem | null>(null);

onMounted(() => {
  const problemId = route.params.id as string;
  const foundProblem = getProblemById(problemId);
  if (foundProblem) {
    problem.value = foundProblem;
  }
});

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

const updateStatus = async (newStatus: ProblemStatus) => {
  if (!problem.value) return;
  
  try {
    await updateProblem(problem.value.id, { status: newStatus });
    problem.value.status = newStatus;
    
    const toast = await toastController.create({
      message: 'Statut mis à jour',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  } catch (error) {
    const toast = await toastController.create({
      message: 'Erreur lors de la mise à jour',
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  }
};

const updateBudget = async (value: string | number | null | undefined) => {
  if (!problem.value || !value) return;
  
  const budget = typeof value === 'string' ? parseFloat(value) : value;
  
  try {
    await updateProblem(problem.value.id, { budget });
    problem.value.budget = budget;
    
    const toast = await toastController.create({
      message: 'Budget mis à jour',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  } catch (error) {
    const toast = await toastController.create({
      message: 'Erreur lors de la mise à jour',
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  }
};

const updateCompany = async (value: string | number | null | undefined) => {
  if (!problem.value || !value) return;
  
  const company = value.toString();
  
  try {
    await updateProblem(problem.value.id, { company });
    problem.value.company = company;
    
    const toast = await toastController.create({
      message: 'Entreprise mise à jour',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  } catch (error) {
    const toast = await toastController.create({
      message: 'Erreur lors de la mise à jour',
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  }
};
</script>

<style scoped>
.status-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.status-chip {
  font-weight: 600;
}

h1 {
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--ion-color-dark);
  margin-bottom: 12px;
}

.description {
  font-size: 1rem;
  color: var(--ion-color-medium);
  margin-bottom: 24px;
  line-height: 1.6;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.empty-state p {
  color: var(--ion-color-medium);
  font-size: 1.1rem;
  margin-bottom: 24px;
}
</style>
