<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      
      <!-- Navigation Bottom Bar - Floating Design -->
      <ion-tab-bar slot="bottom" class="floating-nav">
        <ion-tab-button tab="map" href="/tabs/map" class="nav-item">
          <div class="nav-icon-wrapper">
            <ion-icon :icon="mapOutline" class="nav-icon" />
            <ion-icon :icon="map" class="nav-icon-active" />
          </div>
          <span class="nav-label">Explore</span>
          <div class="nav-indicator"></div>
        </ion-tab-button>

        <ion-tab-button tab="problems" href="/tabs/problems" class="nav-item">
          <div class="nav-icon-wrapper">
            <ion-icon :icon="statsChartOutline" class="nav-icon" />
            <ion-icon :icon="statsChart" class="nav-icon-active" />
          </div>
          <span class="nav-label">Reports</span>
          <div class="nav-indicator"></div>
          <span class="notification-dot"></span>
        </ion-tab-button>

        <!-- Center Action Button -->
        <div class="center-action-wrapper">
          <button class="action-button" @click="quickAction">
            <ion-icon :icon="add" />
          </button>
        </div>

        <ion-tab-button tab="activity" href="/tabs/problems" class="nav-item">
          <div class="nav-icon-wrapper">
            <ion-icon :icon="timeOutline" class="nav-icon" />
            <ion-icon :icon="time" class="nav-icon-active" />
          </div>
          <span class="nav-label">Activity</span>
          <div class="nav-indicator"></div>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/map" class="nav-item">
          <div class="nav-icon-wrapper">
            <ion-icon :icon="personOutline" class="nav-icon" />
            <ion-icon :icon="person" class="nav-icon-active" />
          </div>
          <span class="nav-label">Profile</span>
          <div class="nav-indicator"></div>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { 
  mapOutline, map,
  statsChartOutline, statsChart,
  timeOutline, time,
  personOutline, person,
  add
} from 'ionicons/icons';

const quickAction = () => {
  console.log('Quick action triggered');
};
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   ⚡ FLOATING NAVIGATION BAR - Premium Mobile Experience
   ═══════════════════════════════════════════════════════════════════════════ */

.floating-nav {
  --background: transparent;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: auto;
  padding: 0 12px 16px;
  border-top: none;
  z-index: 1000;
}

.floating-nav::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.98) 40%, transparent);
  pointer-events: none;
  z-index: -1;
}

ion-tab-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(20, 20, 20, 0.98);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 28px;
  padding: 10px 8px;
  margin: 0 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 -10px 50px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 4px 20px rgba(232, 33, 39, 0.1);
}

/* Nav Items */
.nav-item {
  --color: #6B6B6B;
  --color-selected: #FFFFFF;
  --padding-top: 6px;
  --padding-bottom: 6px;
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: 64px;
  background: transparent !important;
}

.nav-icon-wrapper {
  position: relative;
  width: 26px;
  height: 26px;
  margin: 0 auto 4px;
}

.nav-icon,
.nav-icon-active {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 22px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-icon {
  opacity: 1;
}

.nav-icon-active {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.7);
}

.nav-item.tab-selected .nav-icon {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.7);
}

.nav-item.tab-selected .nav-icon-active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  color: #E82127;
  filter: drop-shadow(0 0 10px rgba(232, 33, 39, 0.6));
}

.nav-label {
  display: block;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
  opacity: 0.5;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.nav-item.tab-selected .nav-label {
  opacity: 1;
  color: #FFFFFF;
}

/* Indicator */
.nav-indicator {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 24px;
  height: 3px;
  background: linear-gradient(90deg, #E82127, #FF5555);
  border-radius: 2px;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 12px rgba(232, 33, 39, 0.6);
}

.nav-item.tab-selected .nav-indicator {
  transform: translateX(-50%) scaleX(1);
}

/* Notification Dot */
.notification-dot {
  position: absolute;
  top: 2px;
  right: calc(50% - 16px);
  width: 8px;
  height: 8px;
  background: #E82127;
  border-radius: 50%;
  border: 2px solid #141414;
  animation: pulse-dot 2s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(232, 33, 39, 0.8);
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); box-shadow: 0 0 8px rgba(232, 33, 39, 0.8); }
  50% { transform: scale(1.3); box-shadow: 0 0 16px rgba(232, 33, 39, 1); }
}

/* Center Action Button */
.center-action-wrapper {
  flex: 0 0 auto;
  width: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -28px 8px 0;
}

.action-button {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #E82127 0%, #B81C21 100%);
  border: none;
  border-radius: 18px;
  cursor: pointer;
  box-shadow: 
    0 8px 28px rgba(232, 33, 39, 0.5),
    0 0 0 3px rgba(232, 33, 39, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-button:active {
  transform: scale(0.9);
  box-shadow: 
    0 4px 16px rgba(232, 33, 39, 0.4),
    0 0 0 3px rgba(232, 33, 39, 0.15);
}

.action-button ion-icon {
  font-size: 28px;
  color: #FFFFFF;
}

/* Tap feedback */
.nav-item:active {
  transform: scale(0.92);
}

/* Safe Area */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .floating-nav {
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }
}
</style>