import { ref, computed } from 'vue';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Problem, ProblemFilter, ProblemStatus, Statistics } from '@/types';
import { useAuth } from '@/services/useAuth';

// État global des problèmes
const problems = ref<Problem[]>([]);
const selectedProblem = ref<Problem | null>(null);
const loading = ref(false);

// Helper: normaliser le budget venant de Firestore (supporte nombre, string avec 'k'/'K' et suffixes)
const parseBudgetValue = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    // Handle thousand shorthand like '2k' or '2.5k'
    let multiplier = 1;
    let base = s;
    if (s.endsWith('k')) {
      multiplier = 1000;
      base = s.slice(0, -1);
    }
    // Remove non-numeric characters except dot and minus
    const cleaned = base.replace(/[^0-9.-]+/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return null;
    return num * multiplier;
  }
  return null;
};

// Convertir les données Firestore en Problem
const convertFirestoreData = (id: string, data: DocumentData): Problem => {
  return {
    id,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    latitude: data.latitude,
    longitude: data.longitude,
    description: data.description,
    status: data.status as ProblemStatus,
    surface: data.surface,
    budget: parseBudgetValue(data.budget),
    entreprise: data.entreprise,    photos: data.photos || [],    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
    // UI helpers
    title: data.description.substring(0, 50),
    reportedBy: data.userId,
    reportedByName: data.userName,
    reportedAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
  };
};

export function useProblems() {
  // Charger tous les problèmes depuis Firestore
  const loadProblems = async (): Promise<void> => {
    loading.value = true;
    try {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      problems.value = querySnapshot.docs.map(doc => 
        convertFirestoreData(doc.id, doc.data())
      );
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Récupérer tous les problèmes
  const getProblems = (): Problem[] => {
    return problems.value;
  };

  // Filtrer les problèmes (localement)
  const filterProblems = (filter: ProblemFilter): Problem[] => {
    return problems.value.filter(problem => {
      // Filtrer par statut
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(problem.status)) return false;
      }

      // Filtrer par date
      if (filter.dateFrom && problem.createdAt < filter.dateFrom) return false;
      if (filter.dateTo && problem.createdAt > filter.dateTo) return false;

      // Filtrer par budget
      if (filter.minBudget && (!problem.budget || problem.budget < filter.minBudget)) return false;
      if (filter.maxBudget && problem.budget && problem.budget > filter.maxBudget) return false;

      // Filtrer uniquement mes signalements si demandé
      if (filter.mineOnly) {
        const { currentUser } = useAuth();
        const uid = currentUser.value?.uid || currentUser.value?.uid;
        if (!uid) return false;
        if (problem.userId !== uid) return false;
      }

      return true;
    });
  };

  // Récupérer les signalements d'un utilisateur spécifique
  const getProblemsByUser = async (userId: string): Promise<Problem[]> => {
    try {
      const q = query(
        collection(db, 'reports'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => 
        convertFirestoreData(doc.id, doc.data())
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements:', error);
      throw error;
    }
  };

  // Ajouter un nouveau signalement
  const addProblem = async (problemData: {
    userId: string;
    userName: string;
    userEmail: string;
    latitude: number;
    longitude: number;
    description: string;
    surface?: number;
    photos?: string[];
  }): Promise<Problem> => {
    try {
      const now = Timestamp.now();
      const reportData = {
        userId: problemData.userId,
        userName: problemData.userName,
        userEmail: problemData.userEmail,
        latitude: problemData.latitude,
        longitude: problemData.longitude,
        description: problemData.description,
        status: ProblemStatus.NEW,
        surface: problemData.surface || null,
        budget: null,
        entreprise: null,
        photos: problemData.photos || [],
        createdAt: now,
        updatedAt: now,
      };

      console.debug('Creating reportData to send to Firestore:', reportData);
      const docRef = await addDoc(collection(db, 'reports'), reportData);
      
      const newProblem = convertFirestoreData(docRef.id, {
        ...reportData,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      });

      problems.value.unshift(newProblem);
      return newProblem;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du signalement:', error);
      throw error;
    }
  };

  // Mettre à jour un problème (Manager seulement)
  const updateProblem = async (id: string, updates: Partial<Problem>): Promise<void> => {
    try {
      const docRef = doc(db, 'reports', id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Retirer les champs UI helpers
      delete updateData.id;
      delete updateData.title;
      delete updateData.reportedBy;
      delete updateData.reportedByName;
      delete updateData.reportedAt;
      delete updateData.createdAt;

      await updateDoc(docRef, updateData);

      // Mettre à jour localement
      const index = problems.value.findIndex(p => p.id === id);
      if (index !== -1) {
        problems.value[index] = {
          ...problems.value[index],
          ...updates,
          updatedAt: new Date(),
        };
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  };

  // Obtenir un problème par ID
  const getProblemById = (id: string): Problem | undefined => {
    return problems.value.find(p => p.id === id);
  };

  // Calculer les statistiques
  const getStatistics = (filteredProblems?: Problem[]): Statistics => {
    const data = filteredProblems || problems.value;
    
    const totalProblems = data.length;
    const totalSurface = data.reduce((sum, p) => sum + (p.surface || 0), 0);
    const totalBudget = data.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    const byStatus: Record<ProblemStatus, number> = {
      [ProblemStatus.NEW]: 0,
      [ProblemStatus.IN_PROGRESS]: 0,
      [ProblemStatus.COMPLETED]: 0,
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
    const entreprises = problems.value
      .map(p => p.entreprise)
      .filter((name): name is string => name !== null && name !== undefined);
    return Array.from(new Set(entreprises));
  });

  return {
    problems: computed(() => problems.value),
    selectedProblem: computed(() => selectedProblem.value),
    loading: computed(() => loading.value),
    loadProblems,
    getProblems,
    filterProblems,
    getProblemsByUser,
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
