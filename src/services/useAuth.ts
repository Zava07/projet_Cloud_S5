import { ref, computed } from 'vue';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User } from '@/types';

// État global de l'authentification
const currentUser = ref<User | null>(null);
const isAuthenticated = computed(() => currentUser.value !== null);
const isManager = computed(() => currentUser.value?.role === 'manager');
const loading = ref(true);

export function useAuth() {
  // Inscription d'un nouvel utilisateur avec Firebase
  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Créer le document utilisateur dans Firestore
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        role: 'utilisateur',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      currentUser.value = userData;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }
  };

  // Connexion avec Firebase
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Récupérer les données utilisateur depuis Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        currentUser.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          firstName: userData.firstName,
          lastName: userData.lastName,
          displayName: userData.displayName || `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
          createdAt: userData.createdAt?.toDate?.() || new Date(userData.createdAt),
          updatedAt: userData.updatedAt?.toDate?.() || new Date(userData.updatedAt),
        };
      } else {
        throw new Error('Données utilisateur introuvables');
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      throw new Error(error.message || 'Email ou mot de passe incorrect');
    }
  };

  // Déconnexion
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      currentUser.value = null;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  // Vérifier l'état d'authentification au chargement
  const checkAuthState = (): void => {
    loading.value = true;
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            currentUser.value = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              firstName: userData.firstName,
              lastName: userData.lastName,
              displayName: userData.displayName || `${userData.firstName} ${userData.lastName}`,
              role: userData.role,
              createdAt: userData.createdAt?.toDate?.() || new Date(userData.createdAt),
              updatedAt: userData.updatedAt?.toDate?.() || new Date(userData.updatedAt),
            };
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
          currentUser.value = null;
        }
      } else {
        currentUser.value = null;
      }
      loading.value = false;
    });
  };

  return {
    currentUser: computed(() => currentUser.value),
    isAuthenticated,
    isManager,
    loading: computed(() => loading.value),
    login,
    register,
    logout,
    checkAuthState,
  };
}
