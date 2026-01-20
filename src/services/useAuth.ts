import { ref, computed } from 'vue';
import { User } from '@/types';
import { mockUsers } from '@/data/mockUsers';

// État global de l'authentification
const currentUser = ref<User | null>(null); // ref: anaovana variable reactive, refa miova ny valeurny de miova ko ny interface
const isAuthenticated = computed(() => currentUser.value !== null); // computed: variable calculer automatiquement
const isManager = computed(() => currentUser.value?.role === 'manager');

export function useAuth() {
  // Simuler la connexion Firebase
  const login = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simuler la vérification des credentials
        const user = mockUsers.find(u => u.email === email);
        
        if (user) {
          currentUser.value = user;
          // Simuler le stockage dans localStorage
          localStorage.setItem('user', JSON.stringify(user));
          resolve();
        } else {
          reject(new Error('Email ou mot de passe incorrect'));
        }
      }, 1000);
    });
  };

  // Inscription d'un nouvel utilisateur
  const register = async (email: string, password: string, displayName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Vérifier si l'email existe déjà
        if (mockUsers.find(u => u.email === email)) {
          reject(new Error('Cet email est déjà utilisé'));
          return;
        }

        const newUser: User = {
          id: `user${Date.now()}`, // atao user + date androany
          email,
          displayName,
          role: 'user',
          createdAt: new Date(),
        };

        mockUsers.push(newUser);
        currentUser.value = newUser;
        localStorage.setItem('user', JSON.stringify(newUser));
        resolve();
      }, 1000);
    });
  };

  // Déconnexion
  const logout = async (): Promise<void> => {
    currentUser.value = null;
    localStorage.removeItem('user');
  };

  // Vérifier si un utilisateur est connecté au chargement
  const checkAuthState = (): void => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        currentUser.value = JSON.parse(storedUser);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        localStorage.removeItem('user');
      }
    }
  };

  return {
    currentUser: computed(() => currentUser.value),
    isAuthenticated,
    isManager,
    login,
    register,
    logout,
    checkAuthState,
  };
}
