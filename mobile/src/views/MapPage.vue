<template>
  <ion-page>
    <ion-content :fullscreen="true" class="home-content">
      <!-- Welcome Hero Section -->
      <div class="hero-section">
        <!-- Animated Background -->
        <div class="hero-bg">
          <div class="gradient-orb orb-1"></div>
          <div class="gradient-orb orb-2"></div>
          <div class="gradient-orb orb-3"></div>
          <div class="grid-lines"></div>
        </div>
        
        <!-- Header Bar -->
        <header class="top-bar">
          <div class="logo-section">
            <div class="logo-icon">
              <ion-icon :icon="locationOutline" />
            </div>
            <span class="logo-text">IRAY LALANA</span>
          </div>
          <div class="header-actions" v-if="isAuthenticated">
            <!-- Notifications button -->
            <button class="notification-btn" @click="$router.push('/notifications')">
              <ion-icon :icon="notificationsOutline" />
              <span class="notif-badge" v-if="unreadCount > 0">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
            </button>
            <button class="logout-btn" @click="handleLogout">
              <ion-icon :icon="logOutOutline" />
              <span>Logout</span>
            </button>
            <div class="avatar-wrapper">
              <div class="avatar">
                {{ getInitials() }}
              </div>
              <span class="online-dot"></span>
            </div>
          </div>
        </header>

        <!-- Welcome Content -->
        <div class="hero-content">
          <div class="greeting">
            <span class="greeting-label">{{ getGreeting() }}</span>
            <h1 class="greeting-name">{{ getUserName() }}</h1>
          </div>
          
          <!-- Quick Stats -->
          <div class="quick-stats">
            <div class="stat-bubble">
              <span class="stat-number">{{ liveStats.total }}</span>
              <span class="stat-text">Total Issues</span>
            </div>
            <div class="stat-bubble highlight">
              <span class="stat-number">{{ liveStats.new }}</span>
              <span class="stat-text">New Today</span>
            </div>
            <div class="stat-bubble success">
              <span class="stat-number">{{ liveStats.resolved }}</span>
              <span class="stat-text">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Quick Actions - PROMINENT POSITION -->
        <section class="quick-actions-top">
          <!-- New Report - Only for authenticated users -->
          <button v-if="isAuthenticated" class="action-card primary featured" @click="openReportModal">
            <div class="action-icon pulse">
              <ion-icon :icon="addCircleOutline" />
            </div>
            <div class="action-info">
              <span class="action-label">New Report</span>
              <span class="action-desc">Report infrastructure issue</span>
            </div>
            <ion-icon :icon="chevronForwardOutline" class="action-arrow" />
          </button>

          <!-- Login prompt for visitors -->
          <button v-else class="action-card login-prompt" @click="$router.push('/login')">
            <div class="action-icon">
              <ion-icon :icon="personOutline" />
            </div>
            <div class="action-info">
              <span class="action-label">Sign In</span>
              <span class="action-desc">Login to report issues</span>
            </div>
            <ion-icon :icon="chevronForwardOutline" class="action-arrow" />
          </button>

          <button class="action-card stats-card" @click="$router.push('/tabs/problems')">
            <div class="action-icon blue">
              <ion-icon :icon="analyticsOutline" />
            </div>
            <div class="action-info">
              <span class="action-label">Statistics</span>
              <span class="action-desc">View all reports & data</span>
            </div>
            <ion-icon :icon="chevronForwardOutline" class="action-arrow" />
          </button>
        </section>

        <!-- Map Preview Card -->
        <section class="section-block">
          <div class="section-header">
            <h2 class="section-title">
              <ion-icon :icon="mapOutline" />
              Live Map
            </h2>
            <button class="expand-btn" @click="expandMap = !expandMap">
              <ion-icon :icon="expandOutline" />
            </button>
          </div>
          
          <div class="map-card" :class="{ expanded: expandMap }">
            <MapView 
              :tile-url="tileUrl" 
              @map-click="handleMapClick"
              @marker-click="handleMarkerClick"
            />
            <div class="map-overlay" v-if="!expandMap">
              <button class="map-action-btn" @click="expandMap = true">
                <ion-icon :icon="expandOutline" />
                <span>Expand Map</span>
              </button>
            </div>
            <!-- Floating tip -->
            <div class="map-tip" v-if="expandMap && isAuthenticated">
              <div class="tip-pulse"></div>
              <span>Tap to report an issue</span>
            </div>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="section-block">
          <div class="section-header">
            <h2 class="section-title">
              <ion-icon :icon="flashOutline" />
              Recent Activity
            </h2>
            <button class="see-all-btn" @click="$router.push('/tabs/problems')">
              See All
              <ion-icon :icon="arrowForwardOutline" />
            </button>
          </div>

          <div class="activity-timeline">
            <div 
              v-for="(item, index) in recentActivity" 
              :key="item.id"
              class="activity-item"
              :style="{ animationDelay: `${index * 0.1}s` }"
              @click="showProblemDetail(item)"
            >
              <div class="activity-indicator" :class="'status-' + item.status">
                <ion-icon :icon="getActivityIcon(item.status)" />
              </div>
              <div class="activity-content">
                <h4 class="activity-title">{{ item.title || 'Report #' + item.id.slice(0, 6) }}</h4>
                <p class="activity-meta">
                  <span class="activity-location">{{ item.address || 'Location captured' }}</span>
                  <span class="activity-time">{{ formatTimeAgo(item.reportedAt) }}</span>
                </p>
              </div>
              <div class="activity-badge" :class="'badge-' + item.status">
                {{ getShortStatus(item.status) }}
              </div>
            </div>

            <div v-if="recentActivity.length === 0" class="empty-activity">
              <div class="empty-icon-wrapper">
                <ion-icon :icon="leafOutline" />
              </div>
              <p>No recent activity</p>
              <span>Start by reporting an issue on the map</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Report Modal -->
      <ion-modal 
        :is-open="isReportModalOpen" 
        @did-dismiss="closeReportModal"
        class="report-modal"
        :initial-breakpoint="0.9"
        :breakpoints="[0, 0.5, 0.9, 1]"
      >
        <div class="modal-sheet">
          <div class="sheet-header">
            <div class="sheet-handle"></div>
            <div class="sheet-title-row">
              <h2>New Report</h2>
              <button class="close-sheet" @click="closeReportModal">
                <ion-icon :icon="closeOutline" />
              </button>
            </div>
          </div>

          <div class="sheet-body">
            <form @submit.prevent="submitReport">
              <!-- Location Preview -->
              <div class="location-preview">
                <div class="location-map-mini">
                  <div class="pin-marker">
                    <ion-icon :icon="locationOutline" />
                  </div>
                </div>
                <div class="location-info">
                  <span class="location-label">Selected Location</span>
                  <span class="location-coords">{{ reportForm.latitude.toFixed(5) }}°, {{ reportForm.longitude.toFixed(5) }}°</span>
                </div>
                <div class="location-status">
                  <span class="pulse-dot"></span>
                  GPS
                </div>
              </div>

              <!-- Form Fields -->
              <div class="form-stack">
                <div class="input-group">
                  <label>Title</label>
                  <input 
                    v-model="reportForm.title" 
                    type="text"
                    placeholder="e.g., Road damage on Avenue..."
                    required 
                  />
                </div>

                <div class="input-group">
                  <label>Description</label>
                  <textarea 
                    v-model="reportForm.description" 
                    placeholder="Describe the issue in detail..."
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div class="input-row">
                  <div class="input-group">
                    <label>Address</label>
                    <input 
                      v-model="reportForm.address" 
                      type="text"
                      placeholder="Street, area..."
                      required 
                    />
                  </div>
                  <div class="input-group small">
                    <label>Area (m²)</label>
                    <input 
                      v-model.number="reportForm.surface" 
                      type="number"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>

              <!-- Photo Uploader -->
              <PhotoUploader :max="3" 
                @update:photos="handlePhotosUpdate" 
                @uploading="handlePhotoUploading" 
                @error="handlePhotoError" />

              <!-- Submit Button -->
              <button type="submit" class="submit-btn" :disabled="submitting || photoUploading">
                <ion-spinner v-if="submitting" name="crescent" />
                <template v-else>
                  <ion-icon :icon="paperPlaneOutline" />
                  <span>Submit Report</span>
                </template>
              </button>
            </form>
          </div>
        </div>
      </ion-modal>

      <!-- Problem Detail Modal -->
      <ion-modal 
        :is-open="detailModalOpen" 
        @did-dismiss="closeDetailModal"
        class="detail-modal"
        :initial-breakpoint="0.75"
        :breakpoints="[0, 0.5, 0.75, 1]"
      >
        <div class="modal-sheet" v-if="selectedProblem">
          <div class="sheet-header">
            <div class="sheet-handle"></div>
            <div class="detail-status" :class="'status-' + selectedProblem.status">
              {{ getStatusLabel(selectedProblem.status) }}
            </div>
          </div>

          <div class="sheet-body">
            <h2 class="detail-title">{{ selectedProblem.title || 'Report Details' }}</h2>
            <p class="detail-description">{{ selectedProblem.description }}</p>

            <!-- Photos -->
            <div class="detail-photos" v-if="selectedProblem.photos && selectedProblem.photos.length">
              <h3 class="section-label">PHOTOS</h3>
              <div class="photo-grid">
                <a v-for="(p, idx) in selectedProblem.photos" :key="idx" :href="p" target="_blank" rel="noopener noreferrer">
                  <img :src="p" alt="report photo" />
                </a>
              </div>
            </div>

            <div class="detail-grid">
              <div class="detail-cell">
                <ion-icon :icon="locationOutline" />
                <div>
                  <span class="cell-label">Location</span>
                  <span class="cell-value">{{ selectedProblem.address }}</span>
                </div>
              </div>
              <div class="detail-cell">
                <ion-icon :icon="calendarOutline" />
                <div>
                  <span class="cell-label">Reported</span>
                  <span class="cell-value">{{ formatDate(selectedProblem.reportedAt) }}</span>
                </div>
              </div>
              <div class="detail-cell">
                <ion-icon :icon="resizeOutline" />
                <div>
                  <span class="cell-label">Area</span>
                  <span class="cell-value">{{ selectedProblem.surface }} m²</span>
                </div>
              </div>
              <div class="detail-cell" v-if="selectedProblem.budget">
                <ion-icon :icon="cashOutline" class="green" />
                <div>
                  <span class="cell-label">Budget</span>
                  <span class="cell-value green">{{ formatCurrency(selectedProblem.budget) }}</span>
                </div>
              </div>
            </div>

            <button class="close-btn" @click="selectedProblem = null">
              Close
            </button>
          </div>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonModal,
  IonSpinner,
  toastController,
} from '@ionic/vue';
import {
  locationOutline,
  mapOutline,
  expandOutline,
  flashOutline,
  arrowForwardOutline,
  addCircleOutline,
  analyticsOutline,
  chevronForwardOutline,
  closeOutline,
  paperPlaneOutline,
  calendarOutline,
  resizeOutline,
  cashOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
  leafOutline,
  logOutOutline,
  personOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { useAuth } from '@/services/useAuth';
import { useProblems } from '@/services/useProblems';
import { usePushNotifications } from '@/services/usePushNotifications';
import MapView from '@/components/map/MapView.vue';
import PhotoUploader from '@/components/problem/PhotoUploader.vue';
import { TILE_URL } from '@/config';
import { Problem, ProblemStatus } from '@/types';

const router = useRouter();
const { isAuthenticated, currentUser, logout } = useAuth();
const { addProblem, loadProblems, getProblemById, problems, getStatistics } = useProblems();
const { unreadCount } = usePushNotifications();

const tileUrl = TILE_URL || (import.meta.env.VITE_TILE_URL as string) || 'http://localhost:8080/tiles/{z}/{x}/{y}.png';
const center = { lat: -18.9145, lng: 47.5281 };

const expandMap = ref(false);
const isReportModalOpen = ref(false);
const selectedProblem = ref<Problem | null>(null);
const detailModalOpen = ref(false);
const submitting = ref(false);
const uploadedPhotos = ref<string[]>([]);
const photoUploading = ref(false);

const reportForm = ref({
  title: '',
  description: '',
  address: '',
  surface: 10,
  latitude: center.lat,
  longitude: center.lng,
});

// Computed
const liveStats = computed(() => {
  const stats = getStatistics(problems.value);
  return {
    total: stats.totalProblems,
    new: stats.byStatus[ProblemStatus.NEW] || 0,
    resolved: stats.byStatus[ProblemStatus.COMPLETED] || 0,
  };
});

const recentActivity = computed(() => {
  return [...problems.value]
    .sort((a, b) => new Date(b.reportedAt || 0).getTime() - new Date(a.reportedAt || 0).getTime())
    .slice(0, 5);
});

// Methods
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const getUserName = () => {
  if (!currentUser.value) return 'Guest';
  return currentUser.value.displayName || currentUser.value.firstName || 'User';
};

const getInitials = () => {
  const name = getUserName();
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getActivityIcon = (status: ProblemStatus) => {
  switch (status) {
    case ProblemStatus.NEW: return alertCircleOutline;
    case ProblemStatus.IN_PROGRESS: return timeOutline;
    case ProblemStatus.COMPLETED: return checkmarkCircleOutline;
    default: return alertCircleOutline;
  }
};

const getShortStatus = (status: ProblemStatus) => {
  switch (status) {
    case ProblemStatus.NEW: return 'NEW';
    case ProblemStatus.IN_PROGRESS: return 'WIP';
    case ProblemStatus.COMPLETED: return 'DONE';
    default: return status;
  }
};

const getStatusLabel = (status: ProblemStatus) => {
  const labels: Record<ProblemStatus, string> = {
    [ProblemStatus.NEW]: 'New Report',
    [ProblemStatus.IN_PROGRESS]: 'In Progress',
    [ProblemStatus.COMPLETED]: 'Completed',
  };
  return labels[status];
};

const formatTimeAgo = (date: Date | undefined): string => {
  if (!date) return 'Unknown';
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const formatDate = (date: Date | undefined): string => {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number): string => {
  // Always present full Ariary amount (no K/M shorthand)
  const formatted = new Intl.NumberFormat('fr-MG', { maximumFractionDigits: 0 }).format(amount);
  return `${formatted} Ar`;
};

const handleMapClick = (coords: { lat: number; lng: number }) => {
  if (!isAuthenticated.value) {
    router.push('/login');
    return;
  }
  reportForm.value.latitude = coords.lat;
  reportForm.value.longitude = coords.lng;
  openReportModal();
};

const handleMarkerClick = (problemId: string) => {
  const problem = getProblemById(problemId);
  if (problem) {
    selectedProblem.value = problem;
  }
};

const showProblemDetail = (problem: Problem) => {
  console.debug('open detail for', problem?.id);
  selectedProblem.value = problem;
  detailModalOpen.value = true;
};

const closeDetailModal = () => {
  detailModalOpen.value = false;
  selectedProblem.value = null;
};

const openReportModal = () => {
  isReportModalOpen.value = true;
};

const closeReportModal = () => {
  isReportModalOpen.value = false;
  reportForm.value = {
    title: '',
    description: '',
    address: '',
    surface: 10,
    latitude: center.lat,
    longitude: center.lng,
  };
  uploadedPhotos.value = [];
};

const submitReport = async () => {
  if (!currentUser.value) return;

  if (photoUploading.value) {
    const toast = await toastController.create({ message: 'Please wait for photos to finish uploading', duration: 2000, color: 'warning' });
    await toast.present();
    return;
  }

  submitting.value = true;
  try {
    console.log('[MapPage] Submitting report with photos:', uploadedPhotos.value);
    const problemData = {
      userId: currentUser.value.uid,
      userName: currentUser.value.displayName || `${currentUser.value.firstName} ${currentUser.value.lastName}`,
      userEmail: currentUser.value.email,
      latitude: reportForm.value.latitude,
      longitude: reportForm.value.longitude,
      description: reportForm.value.description,
      surface: reportForm.value.surface,
      photos: [...uploadedPhotos.value], // Create a copy to ensure it's not mutated
    };
    console.log('[MapPage] Problem data to submit:', problemData);
    
    await addProblem(problemData);
    console.log('[MapPage] Report submitted successfully!');
    
    // clear uploaded photos on success
    uploadedPhotos.value = [];

    const toast = await toastController.create({
      message: '✓ Report submitted successfully',
      duration: 2500,
      position: 'top',
      cssClass: 'success-toast',
    });
    await toast.present();
    closeReportModal();
  } catch (error) {
    const toast = await toastController.create({
      message: 'Failed to submit report',
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
  router.push('/login');
};

onMounted(async () => {
  try {
    await loadProblems();
  } catch (error) {
    console.error('Error loading problems:', error);
  }
});

const handlePhotosUpdate = (v: string[]) => {
  uploadedPhotos.value = v;
  console.log('[MapPage] Photos updated:', v);
};

const handlePhotoUploading = (isUploading: boolean) => {
  photoUploading.value = isUploading;
  console.log('[MapPage] Photo uploading status:', isUploading);
};

const handlePhotoError = async (errorMessage: string) => {
  console.error('[MapPage] Photo upload error:', errorMessage);
  const toast = await toastController.create({
    message: `Photo error: ${errorMessage}`,
    duration: 3000,
    color: 'danger'
  });
  await toast.present();
};
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   ⚡ HOME PAGE - Premium Dashboard Experience
   ═══════════════════════════════════════════════════════════════════════════ */

.home-content {
  --background: #0A0A0A;
}

/* === HERO SECTION === */
.hero-section {
  position: relative;
  padding: 60px 20px 30px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
}

.orb-1 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #E82127 0%, #FF4444 100%);
  top: -50px;
  right: -50px;
  animation: float-orb 8s ease-in-out infinite;
}

.orb-2 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  bottom: 0;
  left: -30px;
  animation: float-orb 10s ease-in-out infinite reverse;
}

.orb-3 {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #E82127 0%, #AA1419 100%);
  top: 50%;
  left: 50%;
  opacity: 0.3;
  animation: pulse-orb 4s ease-in-out infinite;
}

@keyframes float-orb {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.1); }
}

@keyframes pulse-orb {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* === TOP BAR === */
.top-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #E82127 0%, #B81C21 100%);
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(232, 33, 39, 0.4);
}

.logo-icon ion-icon {
  font-size: 20px;
  color: #FFFFFF;
}

.logo-text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #FFFFFF;
}

/* === HEADER ACTIONS === */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Notification button */
.notification-btn {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-btn ion-icon {
  font-size: 20px;
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.notification-btn:active {
  transform: scale(0.95);
}

.notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b6b 0%, #e82127 100%);
  border: 2px solid #0a0a0a;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, rgba(232, 33, 39, 0.2) 0%, rgba(232, 33, 39, 0.1) 100%);
  border: 1px solid rgba(232, 33, 39, 0.4);
  border-radius: 10px;
  color: #E82127;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn ion-icon {
  font-size: 16px;
}

.logout-btn:hover {
  background: linear-gradient(135deg, rgba(232, 33, 39, 0.3) 0%, rgba(232, 33, 39, 0.2) 100%);
  border-color: #E82127;
  transform: translateY(-1px);
}

.logout-btn:active {
  transform: scale(0.95);
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.online-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #10B981;
  border: 2px solid #0A0A0A;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* === HERO CONTENT === */
.hero-content {
  position: relative;
}

.greeting {
  margin-bottom: 24px;
}

.greeting-label {
  display: block;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.greeting-name {
  font-size: 28px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
}

/* === QUICK STATS === */
.quick-stats {
  display: flex;
  gap: 12px;
}

.stat-bubble {
  flex: 1;
  padding: 14px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-bubble:active {
  transform: scale(0.97);
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 300;
  color: #FFFFFF;
  margin-bottom: 2px;
}

.stat-text {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.stat-bubble.highlight {
  background: rgba(232, 33, 39, 0.15);
  border-color: rgba(232, 33, 39, 0.3);
}

.stat-bubble.highlight .stat-number {
  color: #E82127;
}

.stat-bubble.success {
  background: rgba(0, 177, 64, 0.1);
  border-color: rgba(0, 177, 64, 0.2);
}

.stat-bubble.success .stat-number {
  color: #00B140;
}

/* === MAIN CONTENT === */
.main-content {
  padding: 0 16px 120px;
}

/* === SECTION BLOCK === */
.section-block {
  margin-bottom: 28px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
}

.section-title ion-icon {
  font-size: 18px;
  color: #E82127;
}

.expand-btn,
.see-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.expand-btn ion-icon,
.see-all-btn ion-icon {
  font-size: 14px;
}

.expand-btn:active,
.see-all-btn:active {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(0.97);
}

/* === MAP CARD === */
.map-card {
  position: relative;
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.map-card.expanded {
  height: 350px;
}

.map-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
}

.map-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s ease;
}

.map-action-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.2);
}

.map-tip {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.tip-pulse {
  width: 8px;
  height: 8px;
  background: #E82127;
  border-radius: 50%;
  animation: tip-pulse 2s ease-in-out infinite;
}

@keyframes tip-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(232, 33, 39, 0.5); }
  50% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(232, 33, 39, 0); }
}

.map-tip span {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

/* === ACTIVITY TIMELINE === */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeSlideIn 0.4s ease-out both;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.activity-item:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.06);
}

.activity-indicator {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.activity-indicator ion-icon {
  font-size: 20px;
}

.activity-indicator.status-new {
  background: rgba(0, 119, 181, 0.15);
  color: #0077B5;
}

.activity-indicator.status-in_progress {
  background: rgba(255, 184, 0, 0.15);
  color: #FFB800;
}

.activity-indicator.status-completed {
  background: rgba(0, 177, 64, 0.15);
  color: #00B140;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.activity-location {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.activity-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.activity-badge {
  padding: 4px 10px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 6px;
  flex-shrink: 0;
}

.badge-new {
  background: rgba(0, 119, 181, 0.15);
  color: #0077B5;
}

.badge-in_progress {
  background: rgba(255, 184, 0, 0.15);
  color: #FFB800;
}

.badge-completed {
  background: rgba(0, 177, 64, 0.15);
  color: #00B140;
}

/* Empty State */
.empty-activity {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon-wrapper {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin: 0 auto 16px;
}

.empty-icon-wrapper ion-icon {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.3);
}

.empty-activity p {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 4px;
}

.empty-activity span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

/* === QUICK ACTIONS === */
.quick-actions,
.quick-actions-top {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 20px;
}

/* Top position quick actions - more prominent */
.quick-actions-top {
  margin-bottom: 10px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.action-card:active {
  transform: scale(0.97);
}

/* Featured primary action (New Report) */
.action-card.primary.featured {
  background: linear-gradient(135deg, rgba(232, 33, 39, 0.2) 0%, rgba(232, 33, 39, 0.08) 100%);
  border: 2px solid rgba(232, 33, 39, 0.4);
  padding: 20px 18px;
  box-shadow: 0 4px 20px rgba(232, 33, 39, 0.15);
}

.action-card.primary.featured .action-label {
  font-size: 16px;
}

/* Login prompt for visitors */
.action-card.login-prompt {
  background: linear-gradient(135deg, rgba(255, 184, 0, 0.15) 0%, rgba(255, 184, 0, 0.05) 100%);
  border-color: rgba(255, 184, 0, 0.3);
}

.action-card.login-prompt .action-icon {
  background: rgba(255, 184, 0, 0.2);
}

.action-card.login-prompt .action-icon ion-icon {
  color: #FFB800;
}

/* Statistics card */
.action-card.stats-card {
  background: linear-gradient(135deg, rgba(0, 119, 181, 0.15) 0%, rgba(0, 119, 181, 0.05) 100%);
  border-color: rgba(0, 119, 181, 0.25);
}

.action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(232, 33, 39, 0.15);
  border-radius: 14px;
  flex-shrink: 0;
}

/* Pulse animation for the featured button */
.action-icon.pulse {
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.action-icon ion-icon {
  font-size: 24px;
  color: #E82127;
}

.action-icon.blue {
  background: rgba(0, 119, 181, 0.2);
}

.action-icon.blue ion-icon {
  color: #0AA5FF;
}

.action-info {
  flex: 1;
}

.action-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 3px;
}

.action-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.action-arrow {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.4);
}

/* === MODALS === */
.report-modal,
.detail-modal {
  --background: transparent;
}

.modal-sheet {
  background: #121212;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  height: 100%;
}

.sheet-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin: 0 auto 16px;
}

.sheet-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet-title-row h2 {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
}

.close-sheet {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  cursor: pointer;
}

.sheet-body {
  padding: 16px 20px 30px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  max-height: calc(100vh - 120px);
}

/* Location Preview */
.location-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: rgba(232, 33, 39, 0.08);
  border: 1px solid rgba(232, 33, 39, 0.15);
  border-radius: 14px;
  margin-bottom: 20px;
}

.location-map-mini {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(232, 33, 39, 0.15);
  border-radius: 10px;
  flex-shrink: 0;
}

.pin-marker ion-icon {
  font-size: 22px;
  color: #E82127;
}

.location-info {
  flex: 1;
  min-width: 0;
}

.location-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  margin-bottom: 2px;
}

.location-coords {
  font-size: 12px;
  color: #FFFFFF;
  font-family: 'SF Mono', monospace;
  word-break: break-all;
}

.location-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #00B140;
  flex-shrink: 0;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #00B140;
  border-radius: 50%;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Form Stack */
.form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 14px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-family: inherit;
  font-size: 15px;
  color: #FFFFFF;
  outline: none;
  transition: all 0.3s ease;
  resize: none;
  -webkit-appearance: none;
  appearance: none;
}

.input-group input::placeholder,
.input-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.input-group input:focus,
.input-group textarea:focus {
  border-color: #E82127;
  background: rgba(232, 33, 39, 0.05);
}

.input-row {
  display: flex;
  gap: 10px;
}

.input-row .input-group {
  flex: 1;
}

.input-row .input-group.small {
  flex: 0 0 90px;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: linear-gradient(135deg, #E82127 0%, #B81C21 100%);
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(232, 33, 39, 0.3);
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn ion-icon {
  font-size: 18px;
}

/* Detail Modal */
.detail-status {
  display: inline-block;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 8px;
}

.detail-status.status-new {
  background: rgba(0, 119, 181, 0.15);
  color: #0077B5;
}

.detail-status.status-in_progress {
  background: rgba(255, 184, 0, 0.15);
  color: #FFB800;
}

.detail-status.status-completed {
  background: rgba(0, 177, 64, 0.15);
  color: #00B140;
}

.detail-title {
  font-size: 22px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 10px;
}

.detail-description {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 20px;
}

/* Detail Photos Section */
.detail-photos {
  margin-bottom: 20px;
}

.detail-photos .section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  margin-bottom: 10px;
}

.photo-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.photo-grid a {
  width: 85px;
  height: 85px;
  display: block;
  overflow: hidden;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s;
}

.photo-grid a:active {
  transform: scale(0.95);
}

.photo-grid img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.detail-cell {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.detail-cell ion-icon {
  font-size: 20px;
  color: #E82127;
  margin-top: 2px;
}

.detail-cell ion-icon.green {
  color: #00B140;
}

.cell-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.cell-value {
  font-size: 13px;
  color: #FFFFFF;
}

.cell-value.green {
  color: #00B140;
}

.close-btn {
  width: 100%;
  padding: 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:active {
  background: rgba(255, 255, 255, 0.15);
}

/* === RESPONSIVE === */
@media (max-width: 380px) {
  .greeting-name {
    font-size: 24px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
