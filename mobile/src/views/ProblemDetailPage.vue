<template>
  <ion-page>
    <!-- Header -->
    <ion-header class="tesla-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <button class="back-button" @click="$router.back()">
            <ion-icon :icon="chevronBackOutline" />
            <span>Back</span>
          </button>
        </ion-buttons>
        <ion-title class="tesla-title">
          <span class="title-text">REPORT DETAILS</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="tesla-content" v-if="problem">
      <div class="page-container">
        <!-- Status Banner -->
        <div class="status-banner" :class="'status-' + problem.status">
          <span class="status-badge">{{ getStatusLabel(problem.status) }}</span>
          <span class="status-date">{{ formatDate(problem.reportedAt) }}</span>
        </div>

        <!-- Title Section -->
        <section class="title-section">
          <h1 class="report-title">{{ problem.title || 'Report #' + problem.id.slice(0, 8) }}</h1>
          <p class="report-description">{{ problem.description }}</p>
        </section>

        <!-- Info Cards -->
        <section class="info-section">
          <h2 class="section-label">INFORMATION</h2>
          
          <div class="info-grid">
            <div class="info-card">
              <div class="info-icon">
                <ion-icon :icon="locationOutline" />
              </div>
              <div class="info-content">
                <span class="info-label">ADDRESS</span>
                <span class="info-value">{{ problem.address || 'Location captured' }}</span>
              </div>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <ion-icon :icon="resizeOutline" />
              </div>
              <div class="info-content">
                <span class="info-label">AFFECTED AREA</span>
                <span class="info-value highlight">{{ problem.surface }} m²</span>
              </div>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <ion-icon :icon="personOutline" />
              </div>
              <div class="info-content">
                <span class="info-label">REPORTED BY</span>
                <span class="info-value">{{ problem.reportedByName || 'Anonymous' }}</span>
              </div>
            </div>

            <div class="info-card" v-if="problem.budget">
              <div class="info-icon success">
                <ion-icon :icon="cashOutline" />
              </div>
              <div class="info-content">
                <span class="info-label">BUDGET ALLOCATED</span>
                <span class="info-value success">{{ formatCurrency(problem.budget) }}</span>
              </div>
            </div>

            <div class="info-card" v-if="problem.entrepriseId">
              <div class="info-icon">
                <ion-icon :icon="businessOutline" />
              </div>
              <div class="info-content">
                <span class="info-label">ASSIGNED COMPANY</span>
                <span class="info-value">{{ getCompanyName(problem.entrepriseId) }}</span>
              </div>
            </div>

            <div class="info-card">
              <div class="info-icon muted">
                <ion-icon :icon="calendarOutline" />
              </div>
              <div class="info-content">
                <span class="info-label">LAST UPDATE</span>
                <span class="info-value muted">{{ formatDate(problem.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Manager Actions -->
        <section class="manager-section" v-if="isManager">
          <h2 class="section-label">MANAGER CONTROLS</h2>
          
          <div class="control-card">
            <!-- Status Update -->
            <div class="control-group">
              <label class="control-label">UPDATE STATUS</label>
              <div class="status-buttons">
                <button 
                  class="status-btn" 
                  :class="{ active: problem.status === ProblemStatus.NEW }"
                  @click="updateStatus(ProblemStatus.NEW)"
                >
                  NEW
                </button>
                <button 
                  class="status-btn" 
                  :class="{ active: problem.status === ProblemStatus.IN_PROGRESS }"
                  @click="updateStatus(ProblemStatus.IN_PROGRESS)"
                >
                  IN PROGRESS
                </button>
                <button 
                  class="status-btn" 
                  :class="{ active: problem.status === ProblemStatus.COMPLETED }"
                  @click="updateStatus(ProblemStatus.COMPLETED)"
                >
                  COMPLETED
                </button>
              </div>
            </div>

            <!-- Budget Input -->
            <div class="control-group">
              <label class="control-label">BUDGET (Ariary)</label>
              <div class="input-wrapper">
                <input 
                  type="number"
                  class="tesla-input"
                  :value="problem.budget"
                  @change="(e) => updateBudget((e.target as HTMLInputElement)?.value)"
                  placeholder="Enter budget amount"
                />
              </div>
            </div>

            <!-- Company Selection -->
            <div class="control-group">
              <label class="control-label">ASSIGN COMPANY</label>
              <div class="select-wrapper">
                <select 
                  class="tesla-select"
                  :value="problem.entrepriseId"
                  @change="(e) => updateEntreprise((e.target as HTMLSelectElement)?.value)"
                >
                  <option value="">-- Select a company --</option>
                  <option 
                    v-for="company in availableCompanies" 
                    :key="company.id" 
                    :value="company.id"
                  >
                    {{ company.name }}
                  </option>
                </select>
                <ion-icon :icon="chevronDownOutline" class="select-icon" />
              </div>
            </div>
          </div>
        </section>

        <!-- Coordinates Section -->
        <section class="coords-section" v-if="problem.latitude && problem.longitude">
          <h2 class="section-label">GPS COORDINATES</h2>
          <div class="coords-card">
            <div class="coord">
              <span class="coord-label">LAT</span>
              <span class="coord-value">{{ problem.latitude.toFixed(6) }}</span>
            </div>
            <div class="coord-divider"></div>
            <div class="coord">
              <span class="coord-label">LNG</span>
              <span class="coord-value">{{ problem.longitude.toFixed(6) }}</span>
            </div>
          </div>
        </section>
      </div>
    </ion-content>

    <!-- Empty State -->
    <ion-content v-else class="tesla-content">
      <div class="empty-state">
        <ion-icon :icon="alertCircleOutline" class="empty-icon" />
        <h3 class="empty-title">Report Not Found</h3>
        <p class="empty-text">This report may have been deleted or doesn't exist</p>
        <button class="tesla-btn" @click="$router.push('/problems')">
          RETURN TO LIST
        </button>
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
  IonIcon,
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
  chevronBackOutline,
  chevronDownOutline,
} from 'ionicons/icons';
import { useAuth } from '@/services/useAuth';
import { useProblems } from '@/services/useProblems';
import { Problem, ProblemStatus } from '@/types';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

const route = useRoute();
const { isManager } = useAuth();
const { getProblemById, updateProblem } = useProblems();

const problem = ref<Problem | null>(null);

// Companies loaded from Firestore (collection 'entreprises' or fallback to 'companies')
const availableCompanies = ref<Array<{ id: number | string; name: string }>>([]);

const loadCompanies = async () => {
  try {
    // Try likely collection names (French and English)
    const collectionsToTry = ['entreprises', 'companies'];
    for (const col of collectionsToTry) {
      const q = query(collection(db, col), orderBy('name'));
      try {
        const qs = await getDocs(q);
        if (qs.empty) continue;
        availableCompanies.value = qs.docs.map(d => {
          const data: any = d.data();
          return {
            id: data.id ?? d.id,
            name: data.name ?? data.nom ?? data.label ?? d.id,
          };
        });
        break;
      } catch (err) {
        // ignore and try next
      }
    }

    // Fallback: derive unique company names from existing problems
    if (availableCompanies.value.length === 0) {
      const { getUniqueCompanies } = useProblems();
      const uniques = getUniqueCompanies.value;
      if (uniques && uniques.length) {
        availableCompanies.value = uniques.map((name, idx) => ({ id: idx + 1, name }));
      }
    }
  } catch (error) {
    console.error('Failed to load companies from Firestore:', error);
  }
};

const getCompanyName = (id: string | number | undefined) => {
  if (!id) return '—';
  const found = availableCompanies.value.find(c => String(c.id) === String(id));
  return found ? found.name : `Company #${id}`;
};

onMounted(async () => {
  const problemId = route.params.id as string;
  const foundProblem = getProblemById(problemId);
  if (foundProblem) {
    problem.value = foundProblem;
  }

  await loadCompanies();
});

const formatDate = (date: Date | undefined): string => {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number): string => {
  // Display full Ariary amount
  const formatted = new Intl.NumberFormat('fr-MG', { maximumFractionDigits: 0 }).format(amount);
  return `${formatted} Ar`;
};

const getStatusLabel = (status: ProblemStatus): string => {
  const labels: Record<ProblemStatus, string> = {
    [ProblemStatus.NEW]: 'NEW',
    [ProblemStatus.IN_PROGRESS]: 'IN PROGRESS',
    [ProblemStatus.COMPLETED]: 'COMPLETED',
  };
  return labels[status];
};

const showToast = async (message: string, color: string = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'bottom',
    color,
    cssClass: 'tesla-toast',
  });
  await toast.present();
};

const updateStatus = async (newStatus: ProblemStatus) => {
  if (!problem.value) return;
  
  try {
    await updateProblem(problem.value.id, { status: newStatus });
    problem.value.status = newStatus;
    await showToast('Status updated');
  } catch (error) {
    await showToast('Update failed', 'danger');
  }
};

const parseBudgetInput = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const s = String(value).trim().toLowerCase();
  let multiplier = 1;
  let base = s;
  if (s.endsWith('k')) {
    multiplier = 1000;
    base = s.slice(0, -1);
  }
  const cleaned = base.replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return num * multiplier;
};

const updateBudget = async (value: string | number | null | undefined) => {
  if (!problem.value) return;
  const budget = parseBudgetInput(value);
  if (budget === null) return;

  try {
    await updateProblem(problem.value.id, { budget });
    problem.value.budget = budget;
    await showToast('Budget updated');
  } catch (error) {
    await showToast('Update failed', 'danger');
  }
};

const updateEntreprise = async (value: string | number | null | undefined) => {
  if (!problem.value || !value) return;
  
  const entrepriseId = typeof value === 'number' ? value : Number(value);
  
  try {
    await updateProblem(problem.value.id, { entrepriseId });
    problem.value.entrepriseId = entrepriseId;
    await showToast('Company updated');
  } catch (error) {
    await showToast('Update failed', 'danger');
  }
};
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   ⚡ TESLA PROBLEM DETAIL - Premium Minimalist Design
   ═══════════════════════════════════════════════════════════════════════════ */

/* === Header === */
.tesla-header {
  --background: transparent;
}

.tesla-header ion-toolbar {
  --background: rgba(0, 0, 0, 0.9);
  --border-width: 0;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-left: 8px;
}

.back-button:hover {
  border-color: #E82127;
  color: #E82127;
  background: rgba(232, 33, 39, 0.1);
}

.back-button:active {
  transform: scale(0.95);
}

.back-button ion-icon {
  font-size: 18px;
}

.back-button span {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.tesla-title .title-text {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 3px;
  color: #FFFFFF;
}

/* === Content === */
.tesla-content {
  --background: #000000;
}

.page-container {
  padding-bottom: 40px;
}

/* === Status Banner === */
.status-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 119, 181, 0.15) 0%, rgba(0, 119, 181, 0.05) 100%);
  border-bottom: 1px solid rgba(0, 119, 181, 0.3);
}

.status-banner.status-new {
  background: linear-gradient(135deg, rgba(0, 119, 181, 0.15) 0%, rgba(0, 119, 181, 0.05) 100%);
  border-color: rgba(0, 119, 181, 0.3);
}

.status-banner.status-in_progress {
  background: linear-gradient(135deg, rgba(255, 184, 0, 0.15) 0%, rgba(255, 184, 0, 0.05) 100%);
  border-color: rgba(255, 184, 0, 0.3);
}

.status-banner.status-completed {
  background: linear-gradient(135deg, rgba(0, 177, 64, 0.15) 0%, rgba(0, 177, 64, 0.05) 100%);
  border-color: rgba(0, 177, 64, 0.3);
}

.status-badge {
  padding: 6px 14px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  border-radius: 4px;
}

.status-banner.status-new .status-badge {
  background: rgba(0, 119, 181, 0.2);
  color: #0077B5;
}

.status-banner.status-in_progress .status-badge {
  background: rgba(255, 184, 0, 0.2);
  color: #FFB800;
}

.status-banner.status-completed .status-badge {
  background: rgba(0, 177, 64, 0.2);
  color: #00B140;
}

.status-date {
  font-size: 12px;
  color: #6B6B6B;
}

/* === Title Section === */
.title-section {
  padding: 24px 20px;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.report-title {
  font-size: 24px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0 0 12px;
  line-height: 1.3;
}

.report-description {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* === Section Label === */
.section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #6B6B6B;
  margin: 0 0 16px;
  padding: 0 20px;
}

/* === Info Section === */
.info-section {
  margin-bottom: 32px;
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: rgba(255, 255, 255, 0.05);
}

.info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: #000000;
}

.info-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  color: #E82127;
  flex-shrink: 0;
}

.info-icon ion-icon {
  font-size: 20px;
}

.info-icon.success { color: #00B140; }
.info-icon.muted { color: #6B6B6B; }

.info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: #6B6B6B;
  text-transform: uppercase;
}

.info-value {
  font-size: 15px;
  color: #FFFFFF;
}

.info-value.highlight { color: #E82127; font-weight: 500; }
.info-value.success { color: #00B140; font-weight: 500; }
.info-value.muted { color: #6B6B6B; }

/* === Manager Section === */
.manager-section {
  margin-bottom: 32px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.control-card {
  margin: 0 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.control-group {
  margin-bottom: 24px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-label {
  display: block;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: #6B6B6B;
  margin-bottom: 12px;
}

.status-buttons {
  display: flex;
  gap: 8px;
}

.status-btn {
  flex: 1;
  padding: 12px 8px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  font-family: inherit;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #6B6B6B;
  cursor: pointer;
  transition: all 0.25s ease;
}

.status-btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: #FFFFFF;
}

.status-btn.active {
  background: #FFFFFF;
  border-color: #FFFFFF;
  color: #000000;
}

.input-wrapper {
  position: relative;
}

.tesla-input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-family: inherit;
  font-size: 15px;
  color: #FFFFFF;
  outline: none;
  transition: all 0.25s ease;
}

.tesla-input::placeholder {
  color: #393939;
}

.tesla-input:focus {
  border-color: #E82127;
  background: rgba(232, 33, 39, 0.05);
}

/* === Select Dropdown === */
.select-wrapper {
  position: relative;
}

.tesla-select {
  width: 100%;
  padding: 14px 40px 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-family: inherit;
  font-size: 15px;
  color: #FFFFFF;
  outline: none;
  transition: all 0.25s ease;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.tesla-select option {
  background: #1A1A1A;
  color: #FFFFFF;
  padding: 12px;
}

.tesla-select option:hover {
  background: #E82127;
}

.tesla-select:focus {
  border-color: #E82127;
  background: rgba(232, 33, 39, 0.05);
}

.select-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
  transition: all 0.25s ease;
}

.select-wrapper:focus-within .select-icon {
  color: #E82127;
}

/* === Coordinates Section === */
.coords-section {
  animation: fadeIn 0.6s ease-out 0.3s both;
}

.coords-card {
  display: flex;
  align-items: center;
  margin: 0 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.coord {
  flex: 1;
  text-align: center;
}

.coord-label {
  display: block;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: #6B6B6B;
  margin-bottom: 6px;
}

.coord-value {
  font-size: 14px;
  font-family: 'SF Mono', 'Monaco', monospace;
  color: #FFFFFF;
}

.coord-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
}

/* === Empty State === */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #393939;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 20px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0 0 8px;
}

.empty-text {
  font-size: 14px;
  color: #6B6B6B;
  margin: 0 0 28px;
}

.tesla-btn {
  padding: 14px 32px;
  background: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: #000000;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tesla-btn:hover {
  background: #E82127;
  color: #FFFFFF;
  transform: translateY(-2px);
}

/* === Responsive === */
@media (max-width: 380px) {
  .report-title {
    font-size: 20px;
  }
  
  .status-buttons {
    flex-direction: column;
  }
  
  .status-btn {
    padding: 14px;
  }
}

@media (min-width: 768px) {
  .page-container {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  
  .status-buttons {
    max-width: 400px;
  }
}
</style>
