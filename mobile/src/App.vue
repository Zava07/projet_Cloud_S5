<template>
  <ion-app>
    <ion-router-outlet />
    
    <!-- Modal d'expiration de session -->
    <SessionExpirationModal
      :is-open="showSessionWarning || showSessionExpired"
      :minutes-left="minutesLeft"
      :is-expired="showSessionExpired"
      :loading="extendingSession"
      @extend="handleExtendSession"
      @logout="handleSessionLogout"
      @reconnect="handleReconnect"
    />
  </ion-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/services/useAuth';
import { useSessionManager } from '@/services/useSession';
import SessionExpirationModal from '@/components/SessionExpirationModal.vue';

const router = useRouter();
const { checkAuthState, isAuthenticated, logout } = useAuth();
const { 
  showExpirationWarning, 
  showExpiredModal,
  minutesUntilExpiration,
  startSessionMonitoring,
  stopSessionMonitoring,
  extendSession,
  forceLogout,
  registerActivityListeners,
  unregisterActivityListeners
} = useSessionManager();

// État local
const showSessionWarning = ref(false);
const showSessionExpired = ref(false);
const minutesLeft = ref(5);
const extendingSession = ref(false);

// Surveiller les changements d'état de session
watch(showExpirationWarning, (newVal: boolean) => {
  showSessionWarning.value = newVal;
});

watch(showExpiredModal, (newVal: boolean) => {
  showSessionExpired.value = newVal;
});

watch(minutesUntilExpiration, (newVal: number) => {
  minutesLeft.value = newVal;
});

// Gérer l'extension de session
const handleExtendSession = async () => {
  extendingSession.value = true;
  try {
    extendSession();
    showSessionWarning.value = false;
  } finally {
    extendingSession.value = false;
  }
};

// Gérer la déconnexion depuis la modale
const handleSessionLogout = async () => {
  await logout();
  showSessionWarning.value = false;
  showSessionExpired.value = false;
  router.replace('/login');
};

// Gérer la reconnexion (session expirée)
const handleReconnect = async () => {
  await forceLogout();
  showSessionExpired.value = false;
  router.replace('/login');
};

// Initialiser l'état d'authentification Firebase au démarrage
onMounted(() => {
  checkAuthState();
  
  // Démarrer le monitoring de session si l'utilisateur est authentifié
  if (isAuthenticated.value) {
    startSessionMonitoring(
      () => {
        // Session expirée
        showSessionExpired.value = true;
        showSessionWarning.value = false;
      },
      (minutes) => {
        // Avertissement avant expiration
        minutesLeft.value = minutes;
        showSessionWarning.value = true;
      }
    );
    registerActivityListeners();
  }
});

// Surveiller les changements d'authentification
watch(isAuthenticated, (authenticated: boolean) => {
  if (authenticated) {
    startSessionMonitoring(
      () => {
        showSessionExpired.value = true;
        showSessionWarning.value = false;
      },
      (minutes) => {
        minutesLeft.value = minutes;
        showSessionWarning.value = true;
      }
    );
    registerActivityListeners();
  } else {
    stopSessionMonitoring();
    unregisterActivityListeners();
    showSessionWarning.value = false;
    showSessionExpired.value = false;
  }
});

onUnmounted(() => {
  stopSessionMonitoring();
  unregisterActivityListeners();
});
</script>
