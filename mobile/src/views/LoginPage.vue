<template>
  <ion-page>
    <ion-content :fullscreen="true" class="tesla-login">
      <!-- Background -->
      <div class="bg-container">
        <div class="bg-gradient"></div>
        <div class="bg-grid"></div>
        <div class="bg-glow"></div>
      </div>

      <div class="login-container">
        <!-- Logo & Brand -->
        <header class="brand-section">
          <div class="logo-container">
            <div class="logo-ring"></div>
            <ion-icon :icon="mapOutline" class="logo-icon" />
          </div>
          <h1 class="brand-name">IRAY LALANA</h1>
          <p class="brand-tagline">Infrastructure Monitoring System</p>
        </header>

        <!-- Login Card -->
        <main class="login-card">
          <div class="card-accent"></div>
          
          <h2 class="card-title">Sign In</h2>
          
          <form @submit.prevent="handleLogin" class="login-form">
            <!-- Email -->
            <div class="form-group">
              <label class="form-label">EMAIL</label>
              <div class="input-container">
                <ion-icon :icon="mailOutline" class="input-icon" />
                <input 
                  v-model="loginForm.email" 
                  type="email" 
                  placeholder="your@email.com"
                  required
                  class="form-input"
                  autocomplete="email"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label class="form-label">PASSWORD</label>
              <div class="input-container">
                <ion-icon :icon="lockClosedOutline" class="input-icon" />
                <input 
                  v-model="loginForm.password" 
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  class="form-input"
                  autocomplete="current-password"
                />
                <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                  <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" />
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn-primary" :disabled="loading">
              <ion-spinner v-if="loading" name="crescent" class="btn-spinner" />
              <template v-else>
                <span>CONTINUE</span>
                <ion-icon :icon="arrowForwardOutline" class="btn-arrow" />
              </template>
            </button>
          </form>

          <!-- Demo Credentials -->
          <div class="demo-box">
            <div class="demo-header">
              <span class="demo-indicator"></span>
              <span class="demo-label">DEMO ACCOUNT</span>
            </div>
            <div class="demo-credentials">
              <code>manager@Outlook.com</code>
              <code>Admin123!</code>
            </div>
          </div>

          <!-- Divider -->
          <div class="divider">
            <span class="divider-line"></span>
            <span class="divider-text">OR</span>
            <span class="divider-line"></span>
          </div>

          <!-- Guest Button -->
          <button class="btn-secondary" @click="continueAsVisitor">
            <ion-icon :icon="eyeOutline" />
            <span>CONTINUE AS GUEST</span>
          </button>
        </main>

        <!-- Footer -->
        <footer class="footer">
          <div class="footer-location">
            <ion-icon :icon="locationOutline" />
            <span>Antananarivo, Madagascar</span>
          </div>
          <div class="footer-status">
            <span class="status-dot"></span>
            <span>System Online</span>
          </div>
        </footer>
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
  locationOutline,
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
      message: 'Login successful',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
    router.push('/map');
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Login failed',
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
/* ═══════════════════════════════════════════════════════════════════════════
   ⚡ TESLA LOGIN PAGE - Minimalist & Professional
   ═══════════════════════════════════════════════════════════════════════════ */

.tesla-login {
  --background: #000000;
}

/* === Background Effects === */
.bg-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(232, 33, 39, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(0, 82, 136, 0.06) 0%, transparent 40%);
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
}

.bg-glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(232, 33, 39, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

/* === Main Container === */
.login-container {
  position: relative;
  z-index: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  padding-top: max(48px, env(safe-area-inset-top, 24px));
  padding-bottom: max(48px, env(safe-area-inset-bottom, 24px));
}

/* === Brand Section === */
.brand-section {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(232, 33, 39, 0.3);
  border-radius: 50%;
  animation: ringPulse 3s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

.logo-icon {
  font-size: 36px;
  color: #E82127;
  filter: drop-shadow(0 0 20px rgba(232, 33, 39, 0.5));
}

.brand-name {
  font-size: 28px;
  font-weight: 300;
  letter-spacing: 8px;
  color: #FFFFFF;
  margin: 0;
  text-transform: uppercase;
}

.brand-tagline {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 3px;
  color: #6B6B6B;
  margin: 8px 0 0;
  text-transform: uppercase;
}

/* === Login Card === */
.login-card {
  width: 100%;
  max-width: 400px;
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 32px 28px;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #E82127, #E82127 30%, transparent 30%);
}

.card-title {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 2px;
  color: #FFFFFF;
  margin: 0 0 28px;
  text-transform: uppercase;
}

/* === Form === */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #6B6B6B;
  text-transform: uppercase;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 18px;
  color: #6B6B6B;
  pointer-events: none;
  transition: color 0.25s ease;
  z-index: 1;
}

.input-container:focus-within .input-icon {
  color: #E82127;
}

.form-input {
  width: 100%;
  padding: 14px 14px 14px 46px;
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-family: inherit;
  font-size: 15px;
  color: #FFFFFF;
  transition: all 0.25s ease;
  outline: none;
}

.form-input:focus {
  border-color: #E82127;
  background: rgba(26, 26, 26, 1);
  box-shadow: 0 0 0 3px rgba(232, 33, 39, 0.1);
}

.form-input::placeholder {
  color: #4A4A4A;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6B6B6B;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  z-index: 1;
}

.password-toggle:hover {
  color: #FFFFFF;
}

.password-toggle ion-icon {
  font-size: 18px;
}

/* === Buttons === */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px 24px;
  background: #FFFFFF;
  color: #000000;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #E8E8E8;
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  color: #000000;
}

.btn-arrow {
  font-size: 16px;
  transition: transform 0.25s ease;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}

.btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 24px;
  background: transparent;
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-secondary:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.btn-secondary ion-icon {
  font-size: 16px;
}

/* === Demo Box === */
.demo-box {
  margin-top: 24px;
  padding: 14px 16px;
  background: rgba(232, 33, 39, 0.05);
  border: 1px solid rgba(232, 33, 39, 0.15);
  border-radius: 8px;
}

.demo-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.demo-indicator {
  width: 6px;
  height: 6px;
  background: #E82127;
  border-radius: 50%;
  animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.demo-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: #E82127;
  text-transform: uppercase;
}

.demo-credentials {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.demo-credentials code {
  font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* === Divider === */
.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.divider-text {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  color: #6B6B6B;
}

/* === Footer === */
.footer {
  margin-top: 32px;
  text-align: center;
  animation: fadeIn 0.8s ease-out 0.4s both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.footer-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #6B6B6B;
  margin-bottom: 12px;
}

.footer-location ion-icon {
  font-size: 14px;
}

.footer-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1.5px;
  color: #00B140;
  text-transform: uppercase;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #00B140;
  border-radius: 50%;
  box-shadow: 0 0 10px #00B140;
  animation: blink 2s ease-in-out infinite;
}

/* === Responsive === */
@media (max-width: 380px) {
  .login-container {
    padding: 20px 16px;
  }
  
  .brand-name {
    font-size: 22px;
    letter-spacing: 5px;
  }
  
  .login-card {
    padding: 24px 20px;
  }
  
  .form-input {
    padding: 12px 12px 12px 42px;
    font-size: 14px;
  }
  
  .btn-primary {
    padding: 14px 20px;
  }
}

@media (max-height: 700px) {
  .brand-section {
    margin-bottom: 24px;
  }
  
  .logo-container {
    width: 60px;
    height: 60px;
    margin-bottom: 12px;
  }
  
  .logo-icon {
    font-size: 28px;
  }
  
  .brand-name {
    font-size: 22px;
  }
}

/* Landscape */
@media (orientation: landscape) and (max-height: 500px) {
  .login-container {
    flex-direction: row;
    gap: 40px;
    padding: 16px 32px;
  }
  
  .brand-section {
    margin-bottom: 0;
    flex: 1;
  }
  
  .login-card {
    flex: 1;
    max-width: 360px;
  }
  
  .footer {
    position: fixed;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
  }
}
</style>
