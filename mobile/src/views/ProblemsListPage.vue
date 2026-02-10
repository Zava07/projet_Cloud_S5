<template>
  <ion-page>
    <ion-content :fullscreen="true" class="reports-content">
      <!-- Header with Gradient -->
      <div class="page-header">
        <div class="header-bg">
          <div class="header-orb"></div>
        </div>
        <div class="page-back">
          <button class="back-button" @click="$router.back()">
            <ion-icon :icon="chevronBackOutline" />
            <span>Back</span>
          </button>
        </div>
        <div class="header-content">
          <h1 class="page-title">Reports</h1>
          <p class="page-subtitle">Infrastructure monitoring dashboard</p>
        </div>
      </div>

      <!-- Statistics Dashboard -->
      <div class="stats-dashboard">
        <!-- Main Stats Row -->
        <div class="stats-main">
          <div class="stat-card total">
            <div class="stat-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" class="ring-bg" />
                <circle cx="50" cy="50" r="45" class="ring-progress" :style="{ strokeDashoffset: totalProgress }" />
              </svg>
              <span class="ring-value">{{ statistics.totalProblems }}</span>
            </div>
            <span class="stat-name">Total Reports</span>
          </div>

          <div class="stats-breakdown">
            <div class="breakdown-item new" @click="setFilter(ProblemStatus.NEW)">
              <div class="breakdown-bar">
                <div class="bar-fill" :style="{ width: getPercentage(ProblemStatus.NEW) + '%' }"></div>
              </div>
              <div class="breakdown-info">
                <span class="breakdown-count">{{ statistics.byStatus[ProblemStatus.NEW] || 0 }}</span>
                <span class="breakdown-label">New</span>
              </div>
            </div>

            <div class="breakdown-item progress" @click="setFilter(ProblemStatus.IN_PROGRESS)">
              <div class="breakdown-bar">
                <div class="bar-fill" :style="{ width: getPercentage(ProblemStatus.IN_PROGRESS) + '%' }"></div>
              </div>
              <div class="breakdown-info">
                <span class="breakdown-count">{{ statistics.byStatus[ProblemStatus.IN_PROGRESS] || 0 }}</span>
                <span class="breakdown-label">In Progress</span>
              </div>
            </div>

            <div class="breakdown-item completed" @click="setFilter(ProblemStatus.COMPLETED)">
              <div class="breakdown-bar">
                <div class="bar-fill" :style="{ width: getPercentage(ProblemStatus.COMPLETED) + '%' }"></div>
              </div>
              <div class="breakdown-info">
                <span class="breakdown-count">{{ statistics.byStatus[ProblemStatus.COMPLETED] || 0 }}</span>
                <span class="breakdown-label">Resolved</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Metrics -->
        <div class="metrics-row">
          <div class="metric-card">
            <ion-icon :icon="trendingUpOutline" class="metric-icon green" />
            <div class="metric-info">
              <span class="metric-value">{{ resolutionRate }}%</span>
              <span class="metric-label">Resolution Rate</span>
            </div>
          </div>
          <div class="metric-card">
            <ion-icon :icon="layersOutline" class="metric-icon blue" />
            <div class="metric-info">
              <span class="metric-value">{{ totalArea.toLocaleString() }}</span>
              <span class="metric-label">Total Area (m²)</span>
            </div>
          </div>
          <div class="metric-card">
            <ion-icon :icon="walletOutline" class="metric-icon gold" />
            <div class="metric-info">
              <span class="metric-value">{{ formatBudget(totalBudget) }}</span>
              <span class="metric-label">Budget Allocated</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-header">
          <h2 class="filter-title">
            <ion-icon :icon="filterOutline" />
            Filter Reports
          </h2>
          <button class="clear-filter" v-if="hasActiveFilter" @click="clearFilters">
            <ion-icon :icon="closeCircleOutline" />
            Clear
          </button>
        </div>

        <!-- Status Filter Pills -->
        <div class="filter-pills">
          <button 
            class="filter-pill" 
            :class="{ active: !activeFilter.status || activeFilter.status.length === 0 }"
            @click="clearFilters"
          >
            <ion-icon :icon="gridOutline" />
            All
          </button>
          <button 
            class="filter-pill mine" 
            :class="{ active: showMyReportsOnly }"
            @click="toggleMyReports"
          >
            <ion-icon :icon="personOutline" />
            My Reports
          </button>
          <button 
            class="filter-pill new" 
            :class="{ active: isStatusActive(ProblemStatus.NEW) }"
            @click="toggleStatusFilter(ProblemStatus.NEW)"
          >
            <div class="pill-dot"></div>
            New
          </button>
          <button 
            class="filter-pill progress" 
            :class="{ active: isStatusActive(ProblemStatus.IN_PROGRESS) }"
            @click="toggleStatusFilter(ProblemStatus.IN_PROGRESS)"
          >
            <div class="pill-dot"></div>
            In Progress
          </button>
          <button 
            class="filter-pill completed" 
            :class="{ active: isStatusActive(ProblemStatus.COMPLETED) }"
            @click="toggleStatusFilter(ProblemStatus.COMPLETED)"
          >
            <div class="pill-dot"></div>
            Resolved
          </button>
        </div>

        <!-- Search Bar -->
        <div class="search-bar">
          <ion-icon :icon="searchOutline" class="search-icon" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search reports..."
            class="search-input"
          />
          <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
            <ion-icon :icon="closeOutline" />
          </button>
        </div>

        <!-- Sort Options -->
        <div class="sort-options">
          <span class="sort-label">Sort by:</span>
          <button 
            class="sort-btn" 
            :class="{ active: sortBy === 'date' }"
            @click="sortBy = 'date'"
          >
            <ion-icon :icon="calendarOutline" />
            Date
          </button>
          <button 
            class="sort-btn" 
            :class="{ active: sortBy === 'area' }"
            @click="sortBy = 'area'"
          >
            <ion-icon :icon="resizeOutline" />
            Area
          </button>
          <button 
            class="sort-btn" 
            :class="{ active: sortBy === 'budget' }"
            @click="sortBy = 'budget'"
          >
            <ion-icon :icon="cashOutline" />
            Budget
          </button>
        </div>
      </div>

      <!-- Results Count -->
      <div class="results-header">
        <span class="results-count">
          <strong>{{ filteredAndSortedProblems.length }}</strong> reports found
        </span>
        <button class="refresh-btn" @click="refreshData">
          <ion-icon :icon="refreshOutline" :class="{ spinning: isRefreshing }" />
        </button>
      </div>

      <!-- Reports List -->
      <div class="reports-list">
        <!-- Empty State -->
        <div v-if="filteredAndSortedProblems.length === 0" class="empty-state">
          <div class="empty-illustration">
            <div class="empty-circle">
              <ion-icon :icon="documentTextOutline" />
            </div>
            <div class="empty-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
          <h3>No Reports Found</h3>
          <p>Try adjusting your filters or search query</p>
          <button class="reset-btn" @click="clearFilters">
            Reset Filters
          </button>
        </div>

        <!-- Report Cards -->
        <div 
          v-for="(report, index) in filteredAndSortedProblems" 
          :key="report.id"
          class="report-card"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="viewDetails(report)"
        >
          <!-- Card Header -->
          <div class="card-top">
            <div class="status-indicator" :class="'status-' + report.status">
              <ion-icon :icon="getStatusIcon(report.status)" />
            </div>
            <div class="card-meta">
              <span class="card-id">#{{ report.id.slice(0, 8) }}</span>
              <span class="card-date">{{ formatDate(report.reportedAt) }}</span>
            </div>
            <div class="priority-badge" :class="getPriorityClass(report.surface)">
              {{ getPriorityLabel(report.surface) }}
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body-row">
            <div class="card-text">
              <h3 class="card-title">{{ report.title || 'Infrastructure Report' }}</h3>
              <p class="card-description">{{ truncate(report.description, 100) }}</p>
            </div>
            <!-- Photo thumbnail -->
            <div class="card-thumbnail" v-if="report.photos && report.photos.length > 0">
              <img :src="report.photos[0]" alt="Report photo" />
              <span class="photo-count" v-if="report.photos.length > 1">+{{ report.photos.length - 1 }}</span>
            </div>
          </div>

          <!-- Card Stats -->
          <div class="card-stats">
            <div class="stat">
              <ion-icon :icon="locationOutline" />
              <span>{{ report.address || 'Location captured' }}</span>
            </div>
            <div class="stat">
              <ion-icon :icon="resizeOutline" />
              <span>{{ report.surface }} m²</span>
            </div>
            <div class="stat" v-if="report.budget">
              <ion-icon :icon="cashOutline" class="green" />
              <span class="green">{{ formatCurrency(report.budget) }}</span>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <div class="reporter">
              <div class="reporter-avatar">
                {{ getInitials(report.reportedByName) }}
              </div>
              <span>{{ report.reportedByName || 'Anonymous' }}</span>
            </div>
            <button class="view-btn">
              View
              <ion-icon :icon="arrowForwardOutline" />
            </button>
          </div>
        </div>
      </div>
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
} from '@ionic/vue';
import {
  trendingUpOutline,
  layersOutline,
  walletOutline,
  filterOutline,
  closeCircleOutline,
  gridOutline,
  searchOutline,
  closeOutline,
  calendarOutline,
  resizeOutline,
  cashOutline,
  refreshOutline,
  documentTextOutline,
  locationOutline,
  arrowForwardOutline,
  alertCircleOutline,
  timeOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  personOutline,
} from 'ionicons/icons';
import { useProblems } from '@/services/useProblems';
import { useAuth } from '@/services/useAuth';
import type { ProblemFilter, Problem } from '@/types';
import { ProblemStatus } from '@/types';

const router = useRouter();
const { loadProblems, filterProblems, getStatistics, setSelectedProblem, problems } = useProblems();
const { currentUser } = useAuth();

const activeFilter = ref<ProblemFilter>({});
const searchQuery = ref('');
const sortBy = ref<'date' | 'area' | 'budget'>('date');
const isRefreshing = ref(false);
const showMyReportsOnly = ref(false);

// Toggle my reports filter
const toggleMyReports = () => {
  showMyReportsOnly.value = !showMyReportsOnly.value;
};

// Computed
const statistics = computed(() => getStatistics(problems.value));

const totalProgress = computed(() => {
  const total = statistics.value.totalProblems;
  const resolved = statistics.value.byStatus[ProblemStatus.COMPLETED] || 0;
  if (total === 0) return 283;
  const progress = (resolved / total) * 100;
  return 283 - (283 * progress) / 100;
});

const resolutionRate = computed(() => {
  const total = statistics.value.totalProblems;
  const resolved = statistics.value.byStatus[ProblemStatus.COMPLETED] || 0;
  if (total === 0) return 0;
  return Math.round((resolved / total) * 100);
});

const totalArea = computed(() => {
  return problems.value.reduce((sum, p) => sum + (p.surface || 0), 0);
});

const totalBudget = computed(() => {
  return problems.value.reduce((sum, p) => sum + (p.budget || 0), 0);
});

const hasActiveFilter = computed(() => {
  return (activeFilter.value.status && activeFilter.value.status.length > 0) || searchQuery.value;
});

const filteredAndSortedProblems = computed(() => {
  let result = filterProblems(activeFilter.value);
  
  // Apply "My Reports" filter
  if (showMyReportsOnly.value && currentUser.value) {
    result = result.filter(p => p.userId === currentUser.value?.uid);
  }
  
  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      (p.title?.toLowerCase().includes(query)) ||
      (p.description?.toLowerCase().includes(query)) ||
      (p.address?.toLowerCase().includes(query))
    );
  }
  
  // Apply sort
  result = [...result].sort((a, b) => {
    switch (sortBy.value) {
      case 'date':
        return new Date(b.reportedAt || 0).getTime() - new Date(a.reportedAt || 0).getTime();
      case 'area':
        return (b.surface || 0) - (a.surface || 0);
      case 'budget':
        return (b.budget || 0) - (a.budget || 0);
      default:
        return 0;
    }
  });
  
  return result;
});

// Methods
const getPercentage = (status: ProblemStatus): number => {
  const total = statistics.value.totalProblems;
  if (total === 0) return 0;
  return Math.round(((statistics.value.byStatus[status] || 0) / total) * 100);
};

const setFilter = (status: ProblemStatus) => {
  activeFilter.value.status = [status];
};

const toggleStatusFilter = (status: ProblemStatus) => {
  if (!activeFilter.value.status) {
    activeFilter.value.status = [status];
  } else if (activeFilter.value.status.includes(status)) {
    activeFilter.value.status = activeFilter.value.status.filter(s => s !== status);
    if (activeFilter.value.status.length === 0) {
      activeFilter.value.status = undefined;
    }
  } else {
    activeFilter.value.status = [...activeFilter.value.status, status];
  }
};

const isStatusActive = (status: ProblemStatus): boolean => {
  return activeFilter.value.status?.includes(status) || false;
};

const clearFilters = () => {
  activeFilter.value = {};
  searchQuery.value = '';
};

const refreshData = async () => {
  isRefreshing.value = true;
  try {
    await loadProblems();
  } finally {
    setTimeout(() => {
      isRefreshing.value = false;
    }, 500);
  }
};

const viewDetails = (report: Problem) => {
  setSelectedProblem(report);
  router.push(`/problem/${report.id}`);
};

const formatDate = (date: Date | undefined): string => {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
  });
};

const formatCurrency = (amount: number): string => {
  // Always show full value in Ariary without shorthand
  const formatted = new Intl.NumberFormat('fr-MG', { maximumFractionDigits: 0 }).format(amount);
  return `${formatted} Ar`;
};

const formatBudget = (amount: number): string => {
  // Show budget as full Ariary value (for consistency in metrics)
  const formatted = new Intl.NumberFormat('fr-MG', { maximumFractionDigits: 0 }).format(amount);
  return `${formatted} Ar`;
};

const truncate = (text: string, length: number): string => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

const getStatusIcon = (status: ProblemStatus) => {
  switch (status) {
    case ProblemStatus.NEW: return alertCircleOutline;
    case ProblemStatus.IN_PROGRESS: return timeOutline;
    case ProblemStatus.COMPLETED: return checkmarkCircleOutline;
    default: return alertCircleOutline;
  }
};

const getPriorityClass = (surface: number | null): string => {
  const s = surface || 0;
  if (s >= 100) return 'high';
  if (s >= 50) return 'medium';
  return 'low';
};

const getPriorityLabel = (surface: number | null): string => {
  const s = surface || 0;
  if (s >= 100) return 'HIGH';
  if (s >= 50) return 'MED';
  return 'LOW';
};

const getInitials = (name: string | undefined): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

onMounted(async () => {
  try {
    await loadProblems();
  } catch (error) {
    console.error('Error loading reports:', error);
  }
});
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   ⚡ REPORTS DASHBOARD - Premium Statistics & Filters
   ═══════════════════════════════════════════════════════════════════════════ */

.reports-content {
  --background: #0A0A0A;
  --padding-bottom: 100px;
}

/* === PAGE HEADER === */
.page-header {
  position: relative;
  padding: 60px 20px 30px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  inset: 0;
}

.header-orb {
  position: absolute;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(232, 33, 39, 0.3) 0%, transparent 70%);
  top: -100px;
  right: -50px;
  animation: pulse-header 4s ease-in-out infinite;
}

@keyframes pulse-header {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.7; }
}

.header-content {
  position: relative;
}

.page-back {
  position: absolute;
  top: 18px;
  left: 16px;
  z-index: 10;
}

.page-back .back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: #FFFFFF;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-back .back-button ion-icon {
  font-size: 18px;
  color: #E82127;
}

.page-back .back-button span {
  font-size: 13px;
  margin-left: 4px;
  color: #FFFFFF;
}

.page-back .back-button:hover {
  background: rgba(232, 33, 39, 0.08);
  border-color: #E82127;
  color: #E82127;
  box-shadow: 0 6px 18px rgba(232, 33, 39, 0.12);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 0 6px;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* === STATS DASHBOARD === */
.stats-dashboard {
  padding: 0 16px;
  margin-bottom: 24px;
}

.stats-main {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card.total {
  flex: 0 0 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgba(232, 33, 39, 0.1);
  border: 1px solid rgba(232, 33, 39, 0.2);
  border-radius: 20px;
}

.stat-ring {
  position: relative;
  width: 70px;
  height: 70px;
  margin-bottom: 8px;
}

.stat-ring svg {
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: #E82127;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1s ease-out;
}

.ring-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 600;
  color: #FFFFFF;
}

.stat-name {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  text-align: center;
}

.stats-breakdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.breakdown-item:active {
  transform: scale(0.98);
}

.breakdown-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease-out;
}

.breakdown-item.new .bar-fill { background: #0077B5; }
.breakdown-item.progress .bar-fill { background: #FFB800; }
.breakdown-item.completed .bar-fill { background: #00B140; }

.breakdown-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 50px;
}

.breakdown-count {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
}

.breakdown-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

/* Metrics Row */
.metrics-row {
  display: flex;
  gap: 10px;
}

.metric-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
}

.metric-icon {
  font-size: 22px;
}

.metric-icon.green { color: #00B140; }
.metric-icon.blue { color: #0077B5; }
.metric-icon.gold { color: #FFB800; }

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
}

.metric-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

/* === FILTER SECTION === */
.filter-section {
  padding: 0 16px;
  margin-bottom: 20px;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
}

.filter-title ion-icon {
  font-size: 16px;
  color: #E82127;
}

.clear-filter {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(232, 33, 39, 0.1);
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  color: #E82127;
  cursor: pointer;
}

/* Filter Pills */
.filter-pills {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.filter-pills::-webkit-scrollbar { display: none; }

.filter-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.filter-pill ion-icon {
  font-size: 14px;
}

.filter-pill:active {
  transform: scale(0.97);
}

.filter-pill.active {
  background: #FFFFFF;
  border-color: #FFFFFF;
  color: #000000;
}

.pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.filter-pill.new .pill-dot { background: #0077B5; }
.filter-pill.progress .pill-dot { background: #FFB800; }
.filter-pill.completed .pill-dot { background: #00B140; }

.filter-pill.new.active { background: #0077B5; border-color: #0077B5; color: #FFFFFF; }
.filter-pill.progress.active { background: #FFB800; border-color: #FFB800; color: #000000; }
.filter-pill.completed.active { background: #00B140; border-color: #00B140; color: #FFFFFF; }

/* My Reports Filter */
.filter-pill.mine {
  background: rgba(232, 33, 39, 0.08);
  border-color: rgba(232, 33, 39, 0.3);
  color: rgba(232, 33, 39, 0.8);
}

.filter-pill.mine ion-icon {
  color: #E82127;
}

.filter-pill.mine.active {
  background: linear-gradient(135deg, #E82127 0%, #B81C21 100%);
  border-color: #E82127;
  color: #FFFFFF;
  box-shadow: 0 4px 15px rgba(232, 33, 39, 0.4);
}

.filter-pill.mine.active ion-icon {
  color: #FFFFFF;
}

/* Search Bar */
.search-bar {
  position: relative;
  margin-bottom: 14px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: rgba(255, 255, 255, 0.3);
}

.search-input {
  width: 100%;
  padding: 14px 40px 14px 44px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  color: #FFFFFF;
  outline: none;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.search-input:focus {
  border-color: #E82127;
  background: rgba(232, 33, 39, 0.05);
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: #FFFFFF;
  cursor: pointer;
}

/* Sort Options */
.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-right: 4px;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-btn ion-icon {
  font-size: 12px;
}

.sort-btn.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

/* === RESULTS HEADER === */
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 14px;
}

.results-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.results-count strong {
  color: #FFFFFF;
}

.refresh-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #FFFFFF;
  cursor: pointer;
}

.refresh-btn ion-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.refresh-btn ion-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* === REPORTS LIST === */
.reports-list {
  padding: 0 16px 120px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Empty State */
.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-illustration {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
}

.empty-circle {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  margin: 0 auto;
}

.empty-circle ion-icon {
  font-size: 32px;
  color: rgba(255, 255, 255, 0.2);
}

.empty-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
}

.empty-dots span {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 8px;
}

.empty-state p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 20px;
}

.reset-btn {
  padding: 12px 24px;
  background: rgba(232, 33, 39, 0.1);
  border: 1px solid rgba(232, 33, 39, 0.2);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #E82127;
  cursor: pointer;
}

/* Report Cards */
.report-card {
  padding: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: cardSlideIn 0.4s ease-out both;
}

@keyframes cardSlideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.report-card:active {
  transform: scale(0.98);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.status-indicator {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.status-indicator ion-icon {
  font-size: 18px;
}

.status-indicator.status-new {
  background: rgba(0, 119, 181, 0.15);
  color: #0077B5;
}

.status-indicator.status-in_progress {
  background: rgba(255, 184, 0, 0.15);
  color: #FFB800;
}

.status-indicator.status-completed {
  background: rgba(0, 177, 64, 0.15);
  color: #00B140;
}

.card-meta {
  flex: 1;
}

.card-id {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'SF Mono', monospace;
}

.card-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.priority-badge {
  padding: 4px 10px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-radius: 6px;
}

.priority-badge.high {
  background: rgba(232, 33, 39, 0.15);
  color: #E82127;
}

.priority-badge.medium {
  background: rgba(255, 184, 0, 0.15);
  color: #FFB800;
}

.priority-badge.low {
  background: rgba(0, 177, 64, 0.15);
  color: #00B140;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 8px;
}

.card-description {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 14px;
}

/* Card body with thumbnail */
.card-body-row {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.card-text {
  flex: 1;
  min-width: 0;
}

.card-text .card-title {
  margin-bottom: 6px;
}

.card-text .card-description {
  margin-bottom: 0;
}

.card-thumbnail {
  position: relative;
  width: 70px;
  height: 70px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-thumbnail .photo-count {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.card-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}

.card-stats .stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.card-stats .stat ion-icon {
  font-size: 14px;
}

.card-stats .stat ion-icon.green,
.card-stats .stat span.green {
  color: #00B140;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.reporter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reporter-avatar {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  color: #FFFFFF;
}

.reporter span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn ion-icon {
  font-size: 12px;
}

.view-btn:active {
  background: rgba(255, 255, 255, 0.1);
}

/* === RESPONSIVE === */
@media (max-width: 380px) {
  .page-title {
    font-size: 26px;
  }
  
  .stats-main {
    flex-direction: column;
  }
  
  .stat-card.total {
    flex-direction: row;
    justify-content: center;
    gap: 20px;
  }
  
  .metrics-row {
    flex-wrap: wrap;
  }
  
  .metric-card {
    flex: 1 1 calc(50% - 5px);
  }
}
</style>
