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
import { usePushNotifications } from '@/services/usePushNotifications';

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
        
        // Enregistrer pour les notifications push après connexion
        try {
          const { registerForPushNotifications, isSupported } = usePushNotifications();
          if (isSupported()) {
            await registerForPushNotifications();
          }
        } catch (pushError) {
          console.log('[Auth] Push notification registration skipped:', pushError);
        }
      } else {
        throw new Error('Données utilisateur introuvables');
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error?.code || '', error?.message || error);

      // Mapper les codes d'erreur Firebase vers des messages utilisateurs lisibles (FR)
      const code = error?.code || error?.message || '';
      let userMessage = 'Erreur lors de la connexion';

      switch (code) {
        case 'auth/wrong-password':
          userMessage = 'Mot de passe incorrect';
          break;
        case 'auth/user-not-found':
          userMessage = 'Aucun compte trouvé pour cet e-mail';
          break;
        case 'auth/invalid-email':
          userMessage = 'Adresse e-mail invalide';
          break;
        case 'auth/too-many-requests':
          userMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
          break;
        case 'auth/invalid-credential':
          userMessage = 'Informations d\'authentification invalides. Réessayez.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Problème de réseau. Vérifiez votre connexion.';
          break;
        default:
          // Si le message contient le code natif (ex: "auth/wrong-password"), essayer de détecter
          if (typeof code === 'string' && code.includes('wrong-password')) {
            userMessage = 'Mot de passe incorrect';
          } else if (typeof code === 'string' && code.includes('user-not-found')) {
            userMessage = 'Aucun compte trouvé pour cet e-mail';
          } else {
            // Fallback: utiliser le message renvoyé par Firebase (mais plus lisible)
            userMessage = (error?.message && typeof error.message === 'string') ? error.message : 'Echec de la connexion';
          }
      }

      throw new Error(userMessage);
    }
  };

  // Déconnexion
  const logout = async (): Promise<void> => {
    try {
      // Supprimer le token FCM avant déconnexion
      try {
        const { removeFcmToken, isSupported } = usePushNotifications();
        if (isSupported()) {
          await removeFcmToken();
        }
      } catch (pushError) {
        console.log('[Auth] FCM token removal skipped:', pushError);
      }
      
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
            
            // Enregistrer pour les notifications push (re-registration on app start)
            try {
              const { registerForPushNotifications, isSupported } = usePushNotifications();
              if (isSupported()) {
                await registerForPushNotifications();
              }
            } catch (pushError) {
              console.log('[Auth] Push notification registration skipped:', pushError);
            }
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
