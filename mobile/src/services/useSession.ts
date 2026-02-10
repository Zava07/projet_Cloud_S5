import { ref, computed, onUnmounted } from 'vue';
import { auth } from '@/config/firebase';
import { signOut } from 'firebase/auth';

// Configuration de session (en minutes)
const SESSION_DURATION_MINUTES = ref(60); // Défaut: 1 heure
const WARNING_THRESHOLD_MINUTES = 5; // Avertissement 5 minutes avant expiration

// État de session
const lastActivityTimestamp = ref<number>(Date.now());
const sessionExpiresAt = ref<Date | null>(null);
const showExpirationWarning = ref(false);
const showExpiredModal = ref(false);
const minutesUntilExpiration = ref(0);

// Intervalle de vérification
let checkInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Met à jour le timestamp de dernière activité
 */
export function updateActivity() {
  lastActivityTimestamp.value = Date.now();
  sessionExpiresAt.value = new Date(Date.now() + SESSION_DURATION_MINUTES.value * 60 * 1000);
  showExpirationWarning.value = false;
}

/**
 * Configure la durée de session en minutes
 */
export function setSessionDuration(minutes: number) {
  SESSION_DURATION_MINUTES.value = minutes;
  updateActivity(); // Réinitialiser avec la nouvelle durée
}

/**
 * Retourne la durée de session configurée
 */
export function getSessionDuration(): number {
  return SESSION_DURATION_MINUTES.value;
}

/**
 * Vérifie si la session est expirée
 */
export function isSessionExpired(): boolean {
  if (!sessionExpiresAt.value) return false;
  return new Date() >= sessionExpiresAt.value;
}

/**
 * Vérifie si la session est proche de l'expiration
 */
export function isNearExpiration(): boolean {
  if (!sessionExpiresAt.value) return false;
  const warningTime = new Date(sessionExpiresAt.value.getTime() - WARNING_THRESHOLD_MINUTES * 60 * 1000);
  return new Date() >= warningTime;
}

/**
 * Calcule les minutes restantes avant expiration
 */
export function getMinutesUntilExpiration(): number {
  if (!sessionExpiresAt.value) return 0;
  const diffMs = sessionExpiresAt.value.getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / 60000));
}

/**
 * Prolonge la session
 */
export function extendSession() {
  updateActivity();
  showExpirationWarning.value = false;
  showExpiredModal.value = false;
}

/**
 * Déconnexion forcée (session expirée)
 */
export async function forceLogout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
  showExpirationWarning.value = false;
  showExpiredModal.value = false;
}

/**
 * Démarre le monitoring de session
 */
export function startSessionMonitoring(onExpired?: () => void, onWarning?: (minutes: number) => void) {
  // Initialiser la session
  updateActivity();
  
  // Vérifier toutes les 30 secondes
  checkInterval = setInterval(() => {
    if (isSessionExpired()) {
      showExpiredModal.value = true;
      showExpirationWarning.value = false;
      if (onExpired) onExpired();
    } else if (isNearExpiration() && !showExpirationWarning.value) {
      const minutes = getMinutesUntilExpiration();
      minutesUntilExpiration.value = minutes;
      showExpirationWarning.value = true;
      if (onWarning) onWarning(minutes);
    }
  }, 30000);
}

/**
 * Arrête le monitoring de session
 */
export function stopSessionMonitoring() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

/**
 * Composable pour la gestion de session
 */
export function useSessionManager() {
  // Écouter les événements d'activité utilisateur
  const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
  
  const handleActivity = () => {
    updateActivity();
  };
  
  // Enregistrer les listeners d'activité
  const registerActivityListeners = () => {
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
  };
  
  // Supprimer les listeners d'activité
  const unregisterActivityListeners = () => {
    activityEvents.forEach(event => {
      window.removeEventListener(event, handleActivity);
    });
  };

  return {
    // État réactif
    showExpirationWarning: computed(() => showExpirationWarning.value),
    showExpiredModal: computed(() => showExpiredModal.value),
    minutesUntilExpiration: computed(() => minutesUntilExpiration.value),
    sessionDuration: computed(() => SESSION_DURATION_MINUTES.value),
    
    // Méthodes
    updateActivity,
    setSessionDuration,
    getSessionDuration,
    extendSession,
    forceLogout,
    startSessionMonitoring,
    stopSessionMonitoring,
    registerActivityListeners,
    unregisterActivityListeners,
    
    // Pour fermer les modales manuellement
    closeWarning: () => { showExpirationWarning.value = false; },
    closeExpiredModal: () => { showExpiredModal.value = false; }
  };
}

export default useSessionManager;
