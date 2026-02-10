<template>
  <ion-modal :is-open="isOpen" :backdrop-dismiss="false" class="session-modal">
    <ion-content class="ion-padding">
      <div class="modal-container">
        <!-- Icône -->
        <div class="modal-icon" :class="{ 'expired': isExpired }">
          <ion-icon :icon="isExpired ? alertCircleOutline : timeOutline" />
        </div>

        <!-- Titre -->
        <h2 class="modal-title">
          {{ isExpired ? 'Session expirée' : 'Session bientôt expirée' }}
        </h2>

        <!-- Message -->
        <p class="modal-message">
          <template v-if="isExpired">
            Votre session a expiré. Veuillez vous reconnecter pour continuer.
          </template>
          <template v-else>
            Votre session expire dans {{ minutesLeft }} minute{{ minutesLeft > 1 ? 's' : '' }}.
            Voulez-vous prolonger votre session ?
          </template>
        </p>

        <!-- Boutons -->
        <div class="modal-actions">
          <template v-if="isExpired">
            <ion-button expand="block" @click="$emit('reconnect')">
              Se reconnecter
            </ion-button>
          </template>
          <template v-else>
            <ion-button fill="outline" @click="$emit('logout')" :disabled="loading">
              Se déconnecter
            </ion-button>
            <ion-button expand="block" @click="$emit('extend')" :disabled="loading">
              <ion-spinner v-if="loading" name="crescent" />
              <span v-else>Prolonger la session</span>
            </ion-button>
          </template>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { 
  IonModal, 
  IonContent, 
  IonButton, 
  IonIcon,
  IonSpinner 
} from '@ionic/vue';
import { alertCircleOutline, timeOutline } from 'ionicons/icons';

defineProps<{
  isOpen: boolean;
  minutesLeft: number;
  isExpired: boolean;
  loading?: boolean;
}>();

defineEmits<{
  (e: 'extend'): void;
  (e: 'logout'): void;
  (e: 'reconnect'): void;
}>();
</script>

<style scoped>
.session-modal {
  --height: auto;
  --max-height: 90%;
  --border-radius: 16px;
}

.modal-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  text-align: center;
}

.modal-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.modal-icon.expired {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.modal-icon ion-icon {
  font-size: 36px;
  color: white;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ion-text-color);
  margin: 0 0 12px;
}

.modal-message {
  font-size: 1rem;
  color: var(--ion-color-medium);
  line-height: 1.5;
  margin: 0 0 24px;
  max-width: 280px;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 280px;
}

.modal-actions ion-button {
  --border-radius: 8px;
}
</style>
