<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Carte des travaux</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="isAuthenticated" @click="handleLogout">
            <ion-icon slot="icon-only" :icon="logOutOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Carte Leaflet intégrée -->
      <MapView :tile-url="tileUrl" />

      <!-- Bouton pour signaler (utilisateurs connectés) -->
      <ion-fab 
        v-if="isAuthenticated" 
        vertical="bottom" 
        horizontal="end" 
        slot="fixed"
      >
        <ion-fab-button @click="openReportModal">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>

      <!-- Modal de signalement -->
      <ion-modal :is-open="isReportModalOpen" @did-dismiss="closeReportModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Signaler un problème</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeReportModal">Fermer</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <form @submit.prevent="submitReport">
            <ion-item>
              <ion-label position="floating">Titre du problème *</ion-label>
              <ion-input v-model="reportForm.title" required />
            </ion-item>

            <ion-item>
              <ion-label position="floating">Description *</ion-label>
              <ion-textarea 
                v-model="reportForm.description" 
                :rows="4"
                required
              />
            </ion-item>

            <ion-item>
              <ion-label position="floating">Adresse *</ion-label>
              <ion-input v-model="reportForm.address" required />
            </ion-item>

            <ion-item>
              <ion-label position="floating">Surface estimée (m²)</ion-label>
              <ion-input 
                v-model.number="reportForm.surface" 
                type="number"
                step="0.1"
              />
            </ion-item>

            <ion-button 
              expand="block" 
              type="submit"
              :disabled="submitting"
              class="submit-button"
            >
              <ion-spinner v-if="submitting" name="crescent" />
              <span v-else>Envoyer le signalement</span>
            </ion-button>
          </form>
        </ion-content>
      </ion-modal>

      <!-- Modal détails du problème -->
      <ion-modal :is-open="!!selectedProblem" @did-dismiss="selectedProblem = null">
        <ion-header>
          <ion-toolbar>
            <ion-title>Détails du problème</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="selectedProblem = null">Fermer</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding" v-if="selectedProblem">
          <h2>{{ selectedProblem.title }}</h2>
          <p>{{ selectedProblem.description }}</p>
          
          <ion-list>
            <ion-item>
              <ion-icon :icon="locationOutline" slot="start" />
              <ion-label>
                <h3>Adresse</h3>
                <p>{{ selectedProblem.address }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon :icon="calendarOutline" slot="start" />
              <ion-label>
                <h3>Signalé le</h3>
                <p>{{ formatDate(selectedProblem.reportedAt) }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon :icon="personOutline" slot="start" />
              <ion-label>
                <h3>Signalé par</h3>
                <p>{{ selectedProblem.reportedByName }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon :icon="resizeOutline" slot="start" />
              <ion-label>
                <h3>Surface</h3>
                <p>{{ selectedProblem.surface }} m²</p>
              </ion-label>
            </ion-item>

            <ion-item v-if="selectedProblem.budget">
              <ion-icon :icon="cashOutline" slot="start" />
              <ion-label>
                <h3>Budget</h3>
                <p>{{ formatCurrency(selectedProblem.budget) }}</p>
              </ion-label>
            </ion-item>

            <ion-item v-if="selectedProblem.entrepriseId">
              <ion-icon :icon="businessOutline" slot="start" />
              <ion-label>
                <h3>Entreprise</h3>
                <p>Entreprise #{{ selectedProblem.entrepriseId }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h3>Statut</h3>
                <ion-chip :color="getStatusColor(selectedProblem.status)">
                  {{ getStatusLabel(selectedProblem.status) }}
                </ion-chip>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSpinner,
  IonList,
  IonChip,
  toastController,
} from '@ionic/vue';
import {
  addOutline,
  logOutOutline,
  locationOutline,
  calendarOutline,
  personOutline,
  resizeOutline,
  cashOutline,
  businessOutline,
} from 'ionicons/icons';
import { useAuth } from '@/services/useAuth';
import { useProblems } from '@/services/useProblems';
import MapView from '@/components/map/MapView.vue';
import { TILE_URL } from '@/config';
import { Problem, ProblemStatus } from '@/types';

const router = useRouter();
const { isAuthenticated, currentUser, logout } = useAuth();
const { addProblem } = useProblems();

// URL des tuiles du serveur de cartes (configurable via .env)
const tileUrl = TILE_URL || (import.meta.env.VITE_TILE_URL as string) || 'http://localhost:8080/tiles/{z}/{x}/{y}.png';

// Centre de la carte sur Antananarivo
const center = { lat: -18.9145, lng: 47.5281 };

const isReportModalOpen = ref(false);
const selectedProblem = ref<Problem | null>(null);
const submitting = ref(false);

const reportForm = ref({
  title: '',
  description: '',
  address: '',
  surface: 10,
  latitude: center.lat,
  longitude: center.lng,
});

const openReportModal = () => {
  isReportModalOpen.value = true;
};

const closeReportModal = () => {
  isReportModalOpen.value = false;
  // Reset form
  reportForm.value = {
    title: '',
    description: '',
    address: '',
    surface: 10,
    latitude: center.lat,
    longitude: center.lng,
  };
};

const submitReport = async () => {
  if (!currentUser.value) return;

  submitting.value = true;
  try {
    await addProblem({
      ...reportForm.value,
      userId: currentUser.value.id,
      status: ProblemStatus.NEW,
      reportedBy: currentUser.value.id,
      reportedByName: currentUser.value.displayName || '',
    });

    const toast = await toastController.create({
      message: 'Signalement envoyé avec succès !',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
    closeReportModal();
  } catch (error) {
    const toast = await toastController.create({
      message: 'Erreur lors de l\'envoi du signalement',
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  } finally {
    submitting.value = false;
  }
};

const handleLogout = async () => {
  await logout();
  const toast = await toastController.create({
    message: 'Déconnexion réussie',
    duration: 2000,
    color: 'medium',
  });
  await toast.present();
  router.push('/login');
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
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
  };
  return colors[status];
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
.map-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 20px;
}

.map-icon {
  font-size: 80px;
  margin-bottom: 16px;
  opacity: 0.9;
}

.map-info {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: 8px;
}

.markers-list {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  max-height: 200px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 12px;
}

.marker-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  margin-bottom: 8px;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  border-left: 4px solid var(--ion-color-medium);
  transition: transform 0.2s;
}

.marker-item:hover {
  transform: translateX(4px);
}

.marker-item ion-icon {
  font-size: 1.25rem;
}

.marker-item span {
  font-size: 0.875rem;
  color: var(--ion-color-dark);
}

.marker-nouveau {
  border-left-color: var(--ion-color-warning);
}

.marker-en_cours {
  border-left-color: var(--ion-color-primary);
}

.marker-termine {
  border-left-color: var(--ion-color-success);
}

.submit-button {
  margin-top: 24px;
}
</style>
