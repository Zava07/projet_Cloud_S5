<template>
  <ion-page>
    <!-- Header glassmorphism moderne -->
    <ion-header class="apple-header" :translucent="true">
      <ion-toolbar>
        <ion-title class="apple-title">
          <span class="title-icon">🗺️</span>
          Carte des travaux
        </ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="isAuthenticated" @click="handleLogout" class="logout-btn">
            <ion-icon slot="icon-only" :icon="logOutOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Badge d'aide flottant style Apple -->
      <div v-if="isAuthenticated" class="help-badge-container">
        <div class="help-badge">
          <ion-icon :icon="locationOutline" class="help-icon" />
          <span>Touchez la carte pour signaler</span>
        </div>
      </div>

      <!-- Carte Leaflet intégrée -->
      <MapView 
        :tile-url="tileUrl" 
        @map-click="handleMapClick"
        @marker-click="handleMarkerClick"
      />

      <!-- FAB moderne style Apple -->
      <ion-fab 
        v-if="isAuthenticated" 
        vertical="bottom" 
        horizontal="end" 
        slot="fixed"
        class="apple-fab"
      >
        <ion-fab-button @click="openReportModal" class="apple-fab-button">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>

      <!-- Modal de signalement - Design Apple -->
      <ion-modal 
        :is-open="isReportModalOpen" 
        @did-dismiss="closeReportModal"
        class="apple-modal"
        :initial-breakpoint="0.85"
        :breakpoints="[0, 0.5, 0.85, 1]"
      >
        <div class="modal-content">
          <!-- Header du modal -->
          <div class="modal-header">
            <div class="modal-handle"></div>
            <h2 class="modal-title">Nouveau signalement</h2>
            <p class="modal-subtitle">Décrivez le problème observé</p>
          </div>

          <div class="modal-body">
            <form @submit.prevent="submitReport">
              <!-- Carte GPS style Apple -->
              <div class="gps-card">
                <div class="gps-icon-wrapper">
                  <ion-icon :icon="locationOutline" class="gps-icon" />
                </div>
                <div class="gps-info">
                  <span class="gps-label">Position GPS capturée</span>
                  <span class="gps-coords">{{ reportForm.latitude.toFixed(4) }}°, {{ reportForm.longitude.toFixed(4) }}°</span>
                </div>
                <div class="gps-check">✓</div>
              </div>

              <!-- Champs de formulaire style Apple -->
              <div class="form-section">
                <div class="apple-input-group">
                  <label class="apple-label">Titre du problème</label>
                  <input 
                    v-model="reportForm.title" 
                    class="apple-input"
                    placeholder="Ex: Nid de poule dangereux"
                    required 
                  />
                </div>

                <div class="apple-input-group">
                  <label class="apple-label">Description</label>
                  <textarea 
                    v-model="reportForm.description" 
                    class="apple-textarea"
                    rows="2"
                    placeholder="Décrivez le problème..."
                    required
                  ></textarea>
                </div>

                <div class="apple-input-group">
                  <label class="apple-label">Adresse</label>
                  <input 
                    v-model="reportForm.address" 
                    class="apple-input"
                    placeholder="Rue, quartier, ville..."
                    required 
                  />
                </div>

                <div class="apple-input-group">
                  <label class="apple-label">Surface estimée (m²)</label>
                  <input 
                    v-model.number="reportForm.surface" 
                    class="apple-input"
                    type="number"
                    step="0.1"
                    placeholder="10"
                  />
                </div>
              </div>

              <!-- Boutons d'action -->
              <div class="modal-actions">
                <button type="button" class="apple-btn secondary" @click="closeReportModal">
                  Annuler
                </button>
                <button type="submit" class="apple-btn primary" :disabled="submitting">
                  <ion-spinner v-if="submitting" name="crescent" class="btn-spinner" />
                  <span v-else>Envoyer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </ion-modal>

      <!-- Modal détails du problème - Design Apple -->
      <ion-modal 
        :is-open="!!selectedProblem" 
        @did-dismiss="selectedProblem = null"
        class="apple-modal detail-modal"
        :initial-breakpoint="0.75"
        :breakpoints="[0, 0.5, 0.75, 1]"
      >
        <div class="modal-content" v-if="selectedProblem">
          <!-- Header du modal -->
          <div class="modal-header">
            <div class="modal-handle"></div>
            <div class="detail-status-badge" :class="'status-' + selectedProblem.status">
              {{ getStatusLabel(selectedProblem.status) }}
            </div>
            <h2 class="modal-title">{{ selectedProblem.title }}</h2>
          </div>

          <div class="modal-body">
            <!-- Description -->
            <p class="problem-description">{{ selectedProblem.description }}</p>
            
            <!-- Liste des détails style Apple -->
            <div class="detail-list">
              <div class="detail-item">
                <div class="detail-icon location">
                  <ion-icon :icon="locationOutline" />
                </div>
                <div class="detail-content">
                  <span class="detail-label">Adresse</span>
                  <span class="detail-value">{{ selectedProblem.address }}</span>
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-icon calendar">
                  <ion-icon :icon="calendarOutline" />
                </div>
                <div class="detail-content">
                  <span class="detail-label">Signalé le</span>
                  <span class="detail-value">{{ formatDate(selectedProblem.reportedAt) }}</span>
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-icon person">
                  <ion-icon :icon="personOutline" />
                </div>
                <div class="detail-content">
                  <span class="detail-label">Signalé par</span>
                  <span class="detail-value">{{ selectedProblem.reportedByName }}</span>
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-icon surface">
                  <ion-icon :icon="resizeOutline" />
                </div>
                <div class="detail-content">
                  <span class="detail-label">Surface</span>
                  <span class="detail-value">{{ selectedProblem.surface }} m²</span>
                </div>
              </div>

              <div v-if="selectedProblem.budget" class="detail-item">
                <div class="detail-icon budget">
                  <ion-icon :icon="cashOutline" />
                </div>
                <div class="detail-content">
                  <span class="detail-label">Budget alloué</span>
                  <span class="detail-value budget-value">{{ formatCurrency(selectedProblem.budget) }}</span>
                </div>
              </div>

              <div v-if="selectedProblem.entrepriseId" class="detail-item">
                <div class="detail-icon company">
                  <ion-icon :icon="businessOutline" />
                </div>
                <div class="detail-content">
                  <span class="detail-label">Entreprise assignée</span>
                  <span class="detail-value">Entreprise #{{ selectedProblem.entrepriseId }}</span>
                </div>
              </div>
            </div>

            <!-- Bouton fermer -->
            <div class="modal-actions single">
              <button class="apple-btn primary full" @click="selectedProblem = null">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
  IonSpinner,
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
const { addProblem, loadProblems, getProblemById } = useProblems();

// Charger les problèmes au montage
onMounted(async () => {
  try {
    await loadProblems();
  } catch (error) {
    console.error('Erreur lors du chargement des problèmes:', error);
  }
});

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

// Gérer le clic sur la carte pour créer un signalement
const handleMapClick = (coords: { lat: number; lng: number }) => {
  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!isAuthenticated.value) {
    router.push('/login');
    return;
  }

  // Pré-remplir les coordonnées et ouvrir le modal
  reportForm.value.latitude = coords.lat;
  reportForm.value.longitude = coords.lng;
  openReportModal();
};

// Gérer le clic sur un marqueur pour afficher les détails
const handleMarkerClick = (problemId: string) => {
  const problem = getProblemById(problemId);
  if (problem) {
    selectedProblem.value = problem;
  }
};

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
      userId: currentUser.value.uid,
      userName: currentUser.value.displayName || `${currentUser.value.firstName} ${currentUser.value.lastName}`,
      userEmail: currentUser.value.email,
      latitude: reportForm.value.latitude,
      longitude: reportForm.value.longitude,
      description: reportForm.value.description,
      surface: reportForm.value.surface,
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

const formatDate = (date: Date | undefined): string => {
  if (!date) return 'Date inconnue';
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
/* === Header Apple Style === */
.apple-header {
  --background: transparent;
}

.apple-header ion-toolbar {
  --background: rgba(255, 255, 255, 0.72);
  --border-width: 0 0 0.5px 0;
  --border-color: rgba(60, 60, 67, 0.12);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

.apple-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
}

.logout-btn {
  --color: #007AFF;
}

/* === Badge d'aide flottant === */
.help-badge-container {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-width: calc(100% - 32px);
}

.help-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 18px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1),
              0 0 0 0.5px rgba(0, 0, 0, 0.05);
  font-size: 12px;
  font-weight: 500;
  color: #1C1C1E;
  white-space: nowrap;
}

.help-icon {
  color: #007AFF;
  font-size: 16px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

/* === FAB Apple Style === */
.apple-fab {
  margin: 16px;
  margin-bottom: 24px;
}

.apple-fab-button {
  --background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  --background-activated: linear-gradient(135deg, #0056B3 0%, #3D3BAB 100%);
  --box-shadow: 0 4px 20px rgba(0, 122, 255, 0.4);
  width: 56px;
  height: 56px;
  --border-radius: 16px;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), 
              box-shadow 0.2s ease;
}

.apple-fab-button:active {
  transform: scale(0.92);
}

.apple-fab-button ion-icon {
  font-size: 28px;
}

/* === Modal Apple Style === */
.apple-modal {
  --background: transparent;
  --border-radius: 20px 20px 0 0;
}

.modal-content {
  background: #FFFFFF;
  min-height: 100%;
  border-radius: 20px 20px 0 0;
}

.modal-header {
  padding: 10px 20px 14px;
  text-align: center;
  border-bottom: 0.5px solid rgba(60, 60, 67, 0.1);
}

.modal-handle {
  width: 36px;
  height: 4px;
  background: rgba(60, 60, 67, 0.3);
  border-radius: 2px;
  margin: 0 auto 12px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1C1C1E;
  margin: 0 0 2px;
  letter-spacing: -0.3px;
}

.modal-subtitle {
  font-size: 13px;
  color: #8E8E93;
  margin: 0;
}

.modal-body {
  padding: 14px 16px 24px;
}

/* === GPS Card === */
.gps-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border-radius: 10px;
  margin-bottom: 14px;
}

.gps-icon-wrapper {
  width: 36px;
  height: 36px;
  min-width: 36px;
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gps-icon {
  color: white;
  font-size: 18px;
}

.gps-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.gps-label {
  font-size: 11px;
  font-weight: 600;
  color: #1B5E20;
}

.gps-coords {
  font-size: 10px;
  color: #388E3C;
  font-family: 'SF Mono', monospace;
}

.gps-check {
  width: 22px;
  height: 22px;
  min-width: 22px;
  background: #34C759;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  font-weight: 600;
}

/* === Form Apple Style === */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.apple-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.apple-label {
  font-size: 12px;
  font-weight: 600;
  color: #1C1C1E;
  padding-left: 2px;
}

.apple-input,
.apple-textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: 15px;
  background: #F2F2F7;
  border: none;
  border-radius: 8px;
  outline: none;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  color: #1C1C1E;
  font-family: inherit;
  box-sizing: border-box;
}

.apple-input::placeholder,
.apple-textarea::placeholder {
  color: #8E8E93;
}

.apple-input:focus,
.apple-textarea:focus {
  background: #FFFFFF;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.2);
}

.apple-textarea {
  resize: none;
  min-height: 60px;
}

/* === Boutons Apple === */
.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.modal-actions.single {
  margin-top: 16px;
}

.apple-btn {
  flex: 1;
  padding: 12px 18px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.1s ease, opacity 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.apple-btn:active {
  transform: scale(0.97);
}

.apple-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apple-btn.primary {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
}

.apple-btn.secondary {
  background: #F2F2F7;
  color: #007AFF;
}

.apple-btn.full {
  width: 100%;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  --color: white;
}

/* === Modal Détails === */
.detail-modal .modal-header {
  padding-bottom: 16px;
}

.detail-status-badge {
  display: inline-flex;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.detail-status-badge.status-new {
  background: #FFF3E0;
  color: #E65100;
}

.detail-status-badge.status-in_progress {
  background: #E3F2FD;
  color: #1565C0;
}

.detail-status-badge.status-completed {
  background: #E8F5E9;
  color: #2E7D32;
}

.problem-description {
  font-size: 15px;
  line-height: 1.6;
  color: #3C3C43;
  margin: 0 0 24px;
  padding: 16px;
  background: #F2F2F7;
  border-radius: 12px;
}

/* === Liste des détails === */
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #FFFFFF;
  border-radius: 14px;
  border: 0.5px solid rgba(60, 60, 67, 0.1);
}

.detail-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.detail-icon.location {
  background: #FFE5E5;
  color: #FF3B30;
}

.detail-icon.calendar {
  background: #E8F5FF;
  color: #007AFF;
}

.detail-icon.person {
  background: #F3E5F5;
  color: #AF52DE;
}

.detail-icon.surface {
  background: #FFF8E1;
  color: #FF9500;
}

.detail-icon.budget {
  background: #E8F5E9;
  color: #34C759;
}

.detail-icon.company {
  background: #E3F2FD;
  color: #5856D6;
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 12px;
  color: #8E8E93;
  font-weight: 500;
}

.detail-value {
  font-size: 15px;
  color: #1C1C1E;
  font-weight: 500;
}

.budget-value {
  color: #34C759;
  font-weight: 600;
}

/* === Dark Mode === */
@media (prefers-color-scheme: dark) {
  .apple-header ion-toolbar {
    --background: rgba(28, 28, 30, 0.72);
    --border-color: rgba(255, 255, 255, 0.1);
  }

  .help-badge {
    background: rgba(44, 44, 46, 0.92);
    color: #FFFFFF;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  }

  .modal-content {
    background: #1C1C1E;
  }

  .modal-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .modal-handle {
    background: rgba(255, 255, 255, 0.3);
  }

  .modal-title {
    color: #FFFFFF;
  }

  .gps-card {
    background: linear-gradient(135deg, rgba(52, 199, 89, 0.2) 0%, rgba(48, 209, 88, 0.15) 100%);
  }

  .gps-label {
    color: #30D158;
  }

  .gps-coords {
    color: #34C759;
  }

  .apple-label {
    color: #FFFFFF;
  }

  .apple-input,
  .apple-textarea {
    background: #2C2C2E;
    color: #FFFFFF;
  }

  .apple-input:focus,
  .apple-textarea:focus {
    background: #3A3A3C;
  }

  .apple-btn.secondary {
    background: #2C2C2E;
    color: #0A84FF;
  }

  .problem-description {
    background: #2C2C2E;
    color: #EBEBF5;
  }

  .detail-item {
    background: #2C2C2E;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .detail-value {
    color: #FFFFFF;
  }
}
</style>
