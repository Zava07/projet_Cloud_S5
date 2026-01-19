<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Liste des signalements</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Statistiques -->
      <StatisticsCard :stats="currentStats" />

      <!-- Filtres -->
      <FilterModal 
        v-model="activeFilter"
        :companies="uniqueCompanies"
      />

      <!-- Liste des problèmes -->
      <div class="problems-list">
        <h2 class="list-title">
          {{ filteredProblems.length }} signalement(s)
        </h2>

        <div v-if="filteredProblems.length === 0" class="empty-state">
          <ion-icon :icon="alertCircleOutline" class="empty-icon" />
          <p>Aucun signalement trouvé</p>
        </div>

        <ProblemCard
          v-for="problem in filteredProblems"
          :key="problem.id"
          :problem="problem"
          @click="viewProblemDetails(problem)"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
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
const { filterProblems, getStatistics, getUniqueCompanies, setSelectedProblem } = useProblems();

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
</script>

<style scoped>
.problems-list {
  margin-top: 24px;
}

.list-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--ion-color-dark);
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
}
</style>
