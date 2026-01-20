<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <div class="logo-section">
          <ion-icon :icon="mapOutline" class="logo-icon" />
          <h1>Travaux Routiers</h1>
          <p class="subtitle">Antananarivo</p>
        </div>

        <ion-segment v-model="authMode" class="auth-mode-segment">
          <ion-segment-button value="login">
            <ion-label>Connexion</ion-label>
          </ion-segment-button>
          <ion-segment-button value="register">
            <ion-label>Inscription</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Formulaire de connexion -->
        <form v-if="authMode === 'login'" @submit.prevent="handleLogin" class="auth-form">
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input 
              v-model="loginForm.email" 
              type="email" 
              required
              autocomplete="email"
            />
          </ion-item>

          <ion-item>
            <ion-label position="floating">Mot de passe</ion-label>
            <ion-input 
              v-model="loginForm.password" 
              type="password" 
              required
              autocomplete="current-password"
            />
          </ion-item>

          <ion-button 
            expand="block" 
            type="submit" 
            :disabled="loading"
            class="submit-button"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>Se connecter</span>
          </ion-button>

          <div class="demo-credentials">
            <p><strong>Compte Manager par défaut:</strong></p>
            <p>Email: manager@mairie-tana.mg</p>
            <p>Mot de passe: Manager2026!</p>
          </div>
        </form>

        <!-- Formulaire d'inscription -->
        <form v-if="authMode === 'register'" @submit.prevent="handleRegister" class="auth-form">
          <ion-item>
            <ion-label position="floating">Prénom</ion-label>
            <ion-input 
              v-model="registerForm.firstName" 
              type="text" 
              required
              autocomplete="given-name"
            />
          </ion-item>

          <ion-item>
            <ion-label position="floating">Nom</ion-label>
            <ion-input 
              v-model="registerForm.lastName" 
              type="text" 
              required
              autocomplete="family-name"
            />
          </ion-item>

          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input 
              v-model="registerForm.email" 
              type="email" 
              required
              autocomplete="email"
            />
          </ion-item>

          <ion-item>
            <ion-label position="floating">Mot de passe</ion-label>
            <ion-input 
              v-model="registerForm.password" 
              type="password" 
              required
              autocomplete="new-password"
            />
          </ion-item>

          <ion-button 
            expand="block" 
            type="submit" 
            :disabled="loading"
            class="submit-button"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>S'inscrire</span>
          </ion-button>
        </form>

        <!-- Bouton visiteur -->
        <ion-button 
          expand="block" 
          fill="outline" 
          @click="continueAsVisitor"
          class="visitor-button"
        >
          Continuer en tant que visiteur
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonIcon,
  toastController,
} from '@ionic/vue';
import { mapOutline } from 'ionicons/icons';
import { useAuth } from '@/services/useAuth';

const router = useRouter();
const { login, register } = useAuth();

const authMode = ref<'login' | 'register'>('login');
const loading = ref(false);

const loginForm = ref({
  email: '',
  password: '',
});

const registerForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
});

const handleLogin = async () => {
  loading.value = true;
  try {
    await login(loginForm.value.email, loginForm.value.password);
    const toast = await toastController.create({
      message: 'Connexion réussie !',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
    router.push('/map');
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Erreur de connexion',
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  loading.value = true;
  try {
    await register(
      registerForm.value.email,
      registerForm.value.password,
      registerForm.value.firstName,
      registerForm.value.lastName
    );
    const toast = await toastController.create({
      message: 'Inscription réussie !',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
    router.push('/map');
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Erreur lors de l\'inscription',
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};

const continueAsVisitor = () => {
  router.push('/map');
};
</script>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 0 auto;
  padding-top: 60px;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  font-size: 80px;
  color: var(--ion-color-primary);
  margin-bottom: 16px;
}

.logo-section h1 {
  font-size: 2rem;
  font-weight: bold;
  color: var(--ion-color-dark);
  margin: 0;
}

.subtitle {
  color: var(--ion-color-medium);
  font-size: 1.1rem;
  margin-top: 8px;
}

.auth-mode-segment {
  margin-bottom: 32px;
}

.auth-form {
  margin-bottom: 24px;
}

.auth-form ion-item {
  margin-bottom: 16px;
}

.submit-button {
  margin-top: 24px;
  height: 48px;
  font-weight: 600;
}

.visitor-button {
  margin-top: 16px;
}

.demo-credentials {
  margin-top: 24px;
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 8px;
  font-size: 0.875rem;
}

.demo-credentials p {
  margin: 4px 0;
  color: var(--ion-color-medium);
}

.demo-credentials p:first-child {
  color: var(--ion-color-dark);
  margin-bottom: 8px;
}
</style>
