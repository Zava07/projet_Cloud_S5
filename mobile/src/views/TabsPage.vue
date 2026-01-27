<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="apple-tab-bar">
        <ion-tab-button tab="map" href="/tabs/map" class="apple-tab-button">
          <ion-icon aria-hidden="true" :icon="map" />
          <ion-label>Carte</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="problems" href="/tabs/problems" class="apple-tab-button">
          <ion-icon aria-hidden="true" :icon="list" />
          <ion-label>Liste</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { map, list } from 'ionicons/icons';
</script>

<style scoped>
.apple-tab-bar {
  --background: rgba(255, 255, 255, 0.72);
  --border: none;
  border-top: 0.5px solid rgba(60, 60, 67, 0.12);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  height: 80px;
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

.apple-tab-button {
  --color: #8E8E93;
  --color-selected: #007AFF;
  --ripple-color: transparent;
  --background-focused: transparent;
  font-size: 10px;
  letter-spacing: -0.2px;
  transition: transform 0.1s ease;
  max-width: 120px;
}

.apple-tab-button:active {
  transform: scale(0.92);
}

.apple-tab-button ion-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.apple-tab-button ion-label {
  font-weight: 500;
  font-size: 10px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .apple-tab-bar {
    --background: rgba(28, 28, 30, 0.72);
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .apple-tab-button {
    --color: #8E8E93;
    --color-selected: #0A84FF;
  }
}

/* iPhone specific */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .apple-tab-bar {
    padding-bottom: calc(env(safe-area-inset-bottom) + 4px);
  }
}
</style>