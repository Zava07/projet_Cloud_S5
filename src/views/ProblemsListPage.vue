<template>
  <ion-page>
    <!-- Header Apple Style -->
    <ion-header class="apple-header" :translucent="true">
      <ion-toolbar>
        <ion-title class="apple-title">
          <span class="title-icon">📋</span>
          Signalements
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="apple-content">
      <div class="page-container">
        <!-- Statistiques avec design Apple -->
        <StatisticsCard :stats="currentStats" />

        <!-- Filtres -->
        <FilterModal 
          v-model="activeFilter"
          :companies="uniqueCompanies"
        />

        <!-- Section Liste -->
        <div class="list-section">
          <div class="list-header">
            <h2 class="list-title">Tous les signalements</h2>
            <span class="list-count">{{ filteredProblems.length }}</span>
          </div>

          <!-- État vide -->
          <div v-if="filteredProblems.length === 0" class="empty-state">
            <div class="empty-icon-wrapper">
              <ion-icon :icon="alertCircleOutline" class="empty-icon" />
            </div>
            <h3 class="empty-title">Aucun signalement</h3>
            <p class="empty-text">Les signalements apparaîtront ici</p>
          </div>

          <!-- Liste des cartes -->
          <div v-else class="problems-grid">
            <ProblemCard
              v-for="problem in filteredProblems"
              :key="problem.id"
              :problem="problem"
              @click="viewProblemDetails(problem)"
              class="problem-item"
            />
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
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
} from '@ionic/vue';
import { alertCircleOutline } from 'ionicons/icons';
import { useProblems } from '@/services/useProblems';
import { ProblemFilter, Problem } from '@/types';
import ProblemCard from '@/components/problem/ProblemCard.vue';
import FilterModal from '@/components/problem/FilterModal.vue';
import StatisticsCard from '@/components/problem/StatisticsCard.vue';

const router = useRouter();
const { loadProblems, filterProblems, getStatistics, getUniqueCompanies, setSelectedProblem } = useProblems();

const activeFilter = ref<ProblemFilter>({});

const filteredProblems = computed(() => {
  return filterProblems(activeFilter.value);
});

const currentStats = computed(() => {
  return getStatistics(filteredProblems.value);
});

const uniqueCompanies = computed(() => getUniqueCompanies.value);

const viewProblemDetails = (problem: Problem) => {
  setSelectedProblem(problem);
  router.push(`/problem/${problem.id}`);
};

// Charger les signalements au montage du composant
onMounted(async () => {
  try {
    await loadProblems();
  } catch (error) {
    console.error('Erreur lors du chargement des signalements:', error);
  }
});
</script>

<style scoped>
/* === Header Apple === */
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
  gap: 6px;
}

.title-icon {
  font-size: 18px;
}

/* === Content === */
.apple-content {
  --background: #F2F2F7;
}

.page-container {
  padding: 12px;
  padding-bottom: 100px;
}

/* === Liste Section === */
.list-section {
  margin-top: 24px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}

.list-title {
  font-size: 22px;
  font-weight: 700;
  color: #1C1C1E;
  margin: 0;
  letter-spacing: -0.5px;
}

.list-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 10px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 14px;
}

/* === État Vide === */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  background: white;
  border-radius: 20px;
  margin-top: 20px;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #F2F2F7 0%, #E5E5EA 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon {
  font-size: 40px;
  color: #8E8E93;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #1C1C1E;
  margin: 0 0 8px;
}

.empty-text {
  font-size: 15px;
  color: #8E8E93;
  margin: 0;
}

/* === Grille de Problèmes === */
.problems-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.problem-item {
  animation: slideUp 0.3s ease-out;
  animation-fill-mode: both;
}

.problem-item:nth-child(1) { animation-delay: 0.05s; }
.problem-item:nth-child(2) { animation-delay: 0.1s; }
.problem-item:nth-child(3) { animation-delay: 0.15s; }
.problem-item:nth-child(4) { animation-delay: 0.2s; }
.problem-item:nth-child(5) { animation-delay: 0.25s; }

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === Dark Mode === */
@media (prefers-color-scheme: dark) {
  .apple-header ion-toolbar {
    --background: rgba(28, 28, 30, 0.72);
    --border-color: rgba(255, 255, 255, 0.1);
  }

  .apple-content {
    --background: #000000;
  }

  .list-title {
    color: #FFFFFF;
  }

  .empty-state {
    background: #1C1C1E;
  }

  .empty-icon-wrapper {
    background: linear-gradient(135deg, #2C2C2E 0%, #3A3A3C 100%);
  }

  .empty-title {
    color: #FFFFFF;
  }
}
</style>
