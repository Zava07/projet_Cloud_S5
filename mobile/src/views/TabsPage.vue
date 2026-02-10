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
        <ion-tab-button tab="add" class="nav-item center-action-tab" @click.prevent="quickAction">
          <div class="center-action-wrapper">
            <div class="action-button">
              <ion-icon :icon="add" />
            </div>
          </div>
        </ion-tab-button>

        <ion-tab-button tab="activity" href="/tabs/activity" class="nav-item">
          <div class="nav-icon-wrapper">
            <ion-icon :icon="timeOutline" class="nav-icon" />
            <ion-icon :icon="time" class="nav-icon-active" />
          </div>
          <span class="nav-label">Activity</span>
          <div class="nav-indicator"></div>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile" class="nav-item">
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
  height: auto;
  padding: 0 16px 12px;
  border-top: none;
  z-index: 1000;
  contain: initial;
}

.floating-nav::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, rgba(10, 10, 10, 0.95) 30%, transparent);
  pointer-events: none;
  z-index: -1;
}

ion-tab-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 24px;
  padding: 8px 6px 10px;
  margin: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 -4px 30px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Nav Items */
.nav-item {
  --color: #555;
  --color-selected: #FFFFFF;
  --padding-top: 8px;
  --padding-bottom: 6px;
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: 72px;
  background: transparent !important;
  transition: all 0.3s ease;
}

.nav-icon-wrapper {
  position: relative;
  width: 24px;
  height: 24px;
  margin: 0 auto 3px;
}

.nav-icon,
.nav-icon-active {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 21px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-icon {
  opacity: 0.6;
}

.nav-icon-active {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.nav-item.tab-selected .nav-icon {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.nav-item.tab-selected .nav-icon-active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  color: #E82127;
  filter: drop-shadow(0 0 8px rgba(232, 33, 39, 0.5));
}

.nav-label {
  display: block;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.3px;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.nav-item.tab-selected .nav-label {
  opacity: 1;
  color: #FFFFFF;
  font-weight: 600;
}

/* Indicator */
.nav-indicator {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 20px;
  height: 2.5px;
  background: #E82127;
  border-radius: 2px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(232, 33, 39, 0.5);
}

.nav-item.tab-selected .nav-indicator {
  transform: translateX(-50%) scaleX(1);
}

/* Notification Dot */
.notification-dot {
  position: absolute;
  top: 4px;
  right: calc(50% - 15px);
  width: 6px;
  height: 6px;
  background: #E82127;
  border-radius: 50%;
  border: 1.5px solid #121212;
  animation: pulse-dot 2s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(232, 33, 39, 0.7);
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); box-shadow: 0 0 12px rgba(232, 33, 39, 1); }
}

/* ═══ Center Action Button ═══ */
.center-action-tab {
  --color: transparent;
  --color-selected: transparent;
  --padding-top: 0;
  --padding-bottom: 0;
  flex: 0 0 auto !important;
  width: 52px !important;
  max-width: 52px !important;
  overflow: visible !important;
  background: transparent !important;
  margin: 0 4px;
}

.center-action-wrapper {
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -20px;
}

.action-button {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FF3B3B 0%, #E82127 50%, #C41A1F 100%);
  border: none;
  border-radius: 16px;
  pointer-events: none;
  box-shadow: 
    0 6px 20px rgba(232, 33, 39, 0.45),
    0 0 0 2px rgba(232, 33, 39, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.center-action-tab:active .action-button {
  transform: scale(0.92);
  box-shadow: 
    0 3px 12px rgba(232, 33, 39, 0.4),
    0 0 0 2px rgba(232, 33, 39, 0.1);
}

.action-button ion-icon {
  font-size: 24px;
  color: #FFFFFF;
}

/* Tap feedback */
.nav-item:active {
  transform: scale(0.93);
}

/* Safe Area */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .floating-nav {
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
}
</style>