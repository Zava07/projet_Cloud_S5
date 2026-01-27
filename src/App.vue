<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useAuth } from '@/services/useAuth';

const { checkAuthState } = useAuth();

// Initialiser l'état d'authentification Firebase au démarrage
onMounted(() => {
  checkAuthState();
});
</script>
