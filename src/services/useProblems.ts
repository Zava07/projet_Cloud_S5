import { ref, computed } from 'vue';
import { Problem, ProblemFilter, ProblemStatus, Statistics } from '@/types';
import { mockProblems } from '@/data/mockProblems';

// État global des problèmes
const problems = ref<Problem[]>([...mockProblems]);
const selectedProblem = ref<Problem | null>(null);

export function useProblems() {
  // Récupérer tous les problèmes
  const getProblems = (): Problem[] => {
    return problems.value;
  };

  // Filtrer les problèmes
  const filterProblems = (filter: ProblemFilter): Problem[] => {
    return problems.value.filter(problem => {
      // Filtrer par statut
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(problem.status)) return false;
      }

      // Filtrer par date
      if (filter.dateFrom && problem.reportedAt < filter.dateFrom) return false;
      if (filter.dateTo && problem.reportedAt > filter.dateTo) return false;

      // Filtrer par entreprise
      if (filter.company && problem.company !== filter.company) return false;

      // Filtrer par budget
      if (filter.minBudget && (!problem.budget || problem.budget < filter.minBudget)) return false;
      if (filter.maxBudget && problem.budget && problem.budget > filter.maxBudget) return false;

      return true;
    });
  };

  // Ajouter un nouveau problème (signalement)
  const addProblem = async (problem: Omit<Problem, 'id' | 'reportedAt' | 'updatedAt'>): Promise<Problem> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProblem: Problem = {
          ...problem,
          id: `problem_${Date.now()}`,
          reportedAt: new Date(),
          updatedAt: new Date(),
        };
        problems.value.unshift(newProblem);
        resolve(newProblem);
      }, 500);
    });
  };

  // Mettre à jour un problème (Manager seulement)
  const updateProblem = async (id: string, updates: Partial<Problem>): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = problems.value.findIndex(p => p.id === id);
        if (index !== -1) {
          problems.value[index] = {
            ...problems.value[index],
            ...updates,
            updatedAt: new Date(),
          };
          resolve();
        } else {
          reject(new Error('Problème non trouvé'));
        }
      }, 500);
    });
  };

  // Obtenir un problème par ID
  const getProblemById = (id: string): Problem | undefined => {
    return problems.value.find(p => p.id === id);
  };

  // Calculer les statistiques
  const getStatistics = (filteredProblems?: Problem[]): Statistics => {
    const data = filteredProblems || problems.value;
    
    const totalProblems = data.length;
    const totalSurface = data.reduce((sum, p) => sum + p.surface, 0);
    const totalBudget = data.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    const byStatus: Record<ProblemStatus, number> = {
      [ProblemStatus.NEW]: 0,
      [ProblemStatus.IN_PROGRESS]: 0,
      [ProblemStatus.COMPLETED]: 0,
      [ProblemStatus.BLOCKED]: 0,
    };

    data.forEach(p => {
      byStatus[p.status]++;
    });

    const advancementPercentage = totalProblems > 0 
      ? Math.round((byStatus[ProblemStatus.COMPLETED] / totalProblems) * 100)
      : 0;

    return {
      totalProblems,
      totalSurface,
      totalBudget,
      byStatus,
      advancementPercentage,
    };
  };

  // Obtenir les entreprises uniques
  const getUniqueCompanies = computed(() => {
    const companies = problems.value
      .map(p => p.company)
      .filter((c): c is string => c !== undefined);
    return Array.from(new Set(companies));
  });

  return {
    problems: computed(() => problems.value),
    selectedProblem: computed(() => selectedProblem.value),
    getProblems,
    filterProblems,
    addProblem,
    updateProblem,
    getProblemById,
    getStatistics,
    getUniqueCompanies,
    setSelectedProblem: (problem: Problem | null) => {
      selectedProblem.value = problem;
    },
  };
}
