<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-wrapper">
        <!-- Header avec blur effect -->
        <div class="login-header">
          <div class="app-icon">
            <ion-icon :icon="mapOutline" />
          </div>
          <h1 class="app-title">Iray Lalana</h1>
          <p class="app-subtitle">Signalement routier intelligent</p>
        </div>

        <!-- Card principale -->
        <div class="login-card">
          <!-- Titre de la section -->
          <h2 class="card-title">Connexion</h2>

          <!-- Formulaire de connexion -->
          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="input-group">
              <label class="input-label">Email</label>
              <div class="input-wrapper">
                <ion-icon :icon="mailOutline" class="input-icon" />
                <input 
                  v-model="loginForm.email" 
                  type="email" 
                  placeholder="votre@email.com"
                  required
                  class="apple-input"
                />
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">Mot de passe</label>
              <div class="input-wrapper">
                <ion-icon :icon="lockClosedOutline" class="input-icon" />
                <input 
                  v-model="loginForm.password" 
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  class="apple-input"
                />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" />
                </button>
              </div>
            </div>

            <button type="submit" class="apple-button primary" :disabled="loading">
              <ion-spinner v-if="loading" name="crescent" />
              <span v-else>Se connecter</span>
              <ion-icon v-if="!loading" :icon="arrowForwardOutline" class="btn-icon" />
            </button>

            <div class="demo-info">
              <div class="demo-badge">
                <ion-icon :icon="informationCircleOutline" />
                <span>Compte démo</span>
              </div>
              <p>manager@Outlook.com / Admin123!</p>
            </div>
          </form>

          <!-- Divider -->
          <div class="divider">
            <span>ou</span>
          </div>

          <!-- Bouton visiteur -->
          <button class="apple-button secondary" @click="continueAsVisitor">
            <ion-icon :icon="eyeOutline" class="btn-icon-left" />
            <span>Continuer en tant que visiteur</span>
          </button>
        </div>

        <!-- Footer -->
        <p class="footer-text">
          Antananarivo • Madagascar 🇲🇬
        </p>
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
  IonSpinner,
  IonIcon,
  toastController,
} from '@ionic/vue';
import { 
  mapOutline, 
  mailOutline, 
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { useAuth } from '@/services/useAuth';

const router = useRouter();
const { login } = useAuth();

const loading = ref(false);
const showPassword = ref(false);

const loginForm = ref({
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

const continueAsVisitor = () => {
  router.push('/map');
};
</script>

<style scoped>
/* === Base Styles === */
.login-content {
  --background: linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%);
}

.login-wrapper {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

/* === Header === */
.login-header {
  text-align: center;
  margin-bottom: 12px;
  animation: fadeInDown 0.6s ease-out;
}

.app-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
}

.app-icon ion-icon {
  font-size: 26px;
  color: white;
}

.app-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #1d1d1f;
  margin: 0;
}

.app-subtitle {
  font-size: 12px;
  color: #86868b;
  margin: 0;
  font-weight: 400;
}

/* === Card === */
.login-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.7);
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  text-align: center;
  margin: 0 0 10px;
  letter-spacing: -0.2px;
}

/* === Form === */
.auth-form {
  animation: fadeIn 0.4s ease-out;
}

.input-group {
  margin-bottom: 8px;
}

.input-group.half {
  flex: 1;
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
  letter-spacing: -0.2px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 10px;
  font-size: 16px;
  color: #86868b;
  pointer-events: none;
}

.apple-input {
  width: 100%;
  padding: 10px 10px 10px 34px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  background: #fafafa;
  transition: all 0.2s ease;
  outline: none;
}

.apple-input:focus {
  border-color: #007AFF;
  background: white;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.apple-input::placeholder {
  color: #c7c7cc;
}

.input-group.half .apple-input {
  padding-left: 16px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #86868b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password ion-icon {
  font-size: 20px;
}

/* === Buttons === */
.apple-button {
  width: 100%;
  padding: 11px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  border: none;
}

.apple-button.primary {
  background: linear-gradient(135deg, #007AFF 0%, #0055d4 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
}

.apple-button.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(0, 122, 255, 0.4);
}

.apple-button.primary:active {
  transform: scale(0.98);
}

.apple-button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.apple-button.secondary {
  background: #f5f5f7;
  color: #1d1d1f;
  margin-top: 12px;
}

.apple-button.secondary:hover {
  background: #ebebed;
}

.apple-button.secondary:active {
  transform: scale(0.98);
}

.btn-icon {
  font-size: 18px;
}

.btn-icon-left {
  font-size: 20px;
  margin-right: 4px;
}

/* === Demo Info === */
.demo-info {
  margin-top: 10px;
  padding: 8px 10px;
  background: linear-gradient(135deg, #f0f8ff 0%, #f5f0ff 100%);
  border-radius: 8px;
  border: 1px solid rgba(0, 122, 255, 0.1);
}

.demo-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.demo-badge ion-icon {
  font-size: 12px;
  color: #007AFF;
}

.demo-badge span {
  font-size: 10px;
  font-weight: 600;
  color: #007AFF;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.demo-info p {
  margin: 0;
  font-size: 11px;
  color: #6e6e73;
  font-family: 'SF Mono', 'Menlo', monospace;
}

/* === Divider === */
.divider {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #d2d2d7;
}

.divider span {
  padding: 0 10px;
  font-size: 12px;
  color: #86868b;
  font-weight: 500;
}

/* === Footer === */
.footer-text {
  margin-top: 10px;
  font-size: 11px;
  color: #86868b;
  text-align: center;
  animation: fadeIn 0.6s ease-out 0.3s both;
}

/* === Animations === */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* === Dark Mode === */
@media (prefers-color-scheme: dark) {
  .login-content {
    --background: linear-gradient(180deg, #1c1c1e 0%, #000000 100%);
  }

  .app-title {
    color: #f5f5f7;
  }

  .app-subtitle {
    color: #98989d;
  }

  .login-card {
    background: rgba(44, 44, 46, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .segment-container {
    background: #3a3a3c;
  }

  .segment-btn {
    color: #98989d;
  }

  .segment-btn.active {
    color: #f5f5f7;
  }

  .segment-indicator {
    background: #636366;
  }

  .input-label {
    color: #f5f5f7;
  }

  .apple-input {
    background: #2c2c2e;
    border-color: #3a3a3c;
    color: #f5f5f7;
  }

  .apple-input:focus {
    background: #3a3a3c;
    border-color: #0a84ff;
  }

  .apple-input::placeholder {
    color: #636366;
  }

  .apple-button.secondary {
    background: #2c2c2e;
    color: #f5f5f7;
  }

  .apple-button.secondary:hover {
    background: #3a3a3c;
  }

  .demo-info {
    background: linear-gradient(135deg, rgba(10, 132, 255, 0.1) 0%, rgba(94, 92, 230, 0.1) 100%);
    border-color: rgba(10, 132, 255, 0.2);
  }

  .demo-info p {
    color: #98989d;
  }

  .divider::before,
  .divider::after {
    background: #3a3a3c;
  }

  .divider span {
    color: #98989d;
  }

  .footer-text {
    color: #98989d;
  }
}

/* === Mobile Responsive === */
@media (max-width: 480px) {
  .login-wrapper {
    padding: 16px;
    justify-content: flex-start;
    padding-top: max(60px, env(safe-area-inset-top) + 40px);
  }

  .login-card {
    padding: 24px 20px;
  }

  .app-icon {
    width: 70px;
    height: 70px;
    border-radius: 18px;
  }

  .app-icon ion-icon {
    font-size: 34px;
  }

  .app-title {
    font-size: 28px;
  }

  .input-row {
    flex-direction: column;
    gap: 0;
  }

  .input-group.half {
    flex: none;
  }
}
</style>
