<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/map" />
        </ion-buttons>
        <ion-title>Notifications</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="markAllAsRead" v-if="unreadCount > 0" class="toolbar-action">
            <ion-icon :icon="checkmarkDoneOutline" slot="icon-only" />
          </ion-button>
          <ion-button @click="confirmClearAll" v-if="storedNotifications.length > 0" class="toolbar-action">
            <ion-icon :icon="trashOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <!-- Unread count indicator bar -->
      <div class="header-summary" v-if="storedNotifications.length > 0">
        <span v-if="unreadCount > 0" class="summary-text">
          {{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }}
        </span>
        <span v-else class="summary-text all-read">
          <ion-icon :icon="checkmarkCircleOutline" /> Tout est lu
        </span>
      </div>
    </ion-header>

    <ion-content class="notifications-content">
      <!-- Empty state -->
      <div class="empty-state" v-if="storedNotifications.length === 0">
        <div class="empty-illustration">
          <div class="empty-circle c1"></div>
          <div class="empty-circle c2"></div>
          <div class="empty-icon-wrap">
            <ion-icon :icon="notificationsOffOutline" />
          </div>
        </div>
        <h3>Aucune notification</h3>
        <p>Vous serez notifié lorsqu'un administrateur modifiera le statut de vos signalements.</p>
      </div>

      <!-- Notifications list -->
      <div class="notif-list" v-else>
        <ion-item-sliding v-for="notif in storedNotifications" :key="notif.id">
          <div 
            class="notif-card" 
            :class="{ 'notif-unread': !notif.read }"
            @click="handleNotificationClick(notif)"
          >
            <!-- Status icon -->
            <div class="notif-icon-col">
              <div class="notif-icon-circle" :class="'status-' + (notif.data?.status || 'default')">
                <ion-icon :icon="getStatusIcon(notif.data?.status)" />
              </div>
              <div class="unread-dot" v-if="!notif.read"></div>
            </div>

            <!-- Content -->
            <div class="notif-body">
              <div class="notif-header-row">
                <span class="notif-title">{{ notif.title }}</span>
                <span class="notif-timestamp">{{ formatTime(notif.receivedAt) }}</span>
              </div>
              <p class="notif-message">{{ notif.body }}</p>
              <div class="notif-footer" v-if="notif.data?.status">
                <span class="status-pill" :class="'pill-' + notif.data.status">
                  {{ getStatusLabel(notif.data.status) }}
                </span>
              </div>
            </div>

            <!-- Chevron -->
            <div class="notif-chevron" v-if="notif.data?.reportId">
              <ion-icon :icon="chevronForwardOutline" />
            </div>
          </div>

          <ion-item-options side="end">
            <ion-item-option color="danger" @click="deleteNotification(notif.id)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonButtons,
  IonButton,
  IonBackButton,
  alertController
} from '@ionic/vue';
import {
  notificationsOffOutline,
  checkmarkDoneOutline,
  checkmarkCircleOutline,
  trashOutline,
  alertCircleOutline,
  syncOutline,
  addCircleOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { usePushNotifications, StoredNotification } from '@/services/usePushNotifications';

const router = useRouter();
const { 
  storedNotifications, 
  unreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  clearAllNotifications 
} = usePushNotifications();

const handleNotificationClick = (notif: StoredNotification) => {
  markAsRead(notif.id);
  
  // Navigate to report detail if reportId is present
  if (notif.data?.reportId) {
    router.push(`/problem/${notif.data.reportId}`);
  }
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'nouveau': return addCircleOutline;
    case 'en_cours': return syncOutline;
    case 'termine': return checkmarkCircleOutline;
    default: return alertCircleOutline;
  }
};

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'nouveau': return 'Nouveau';
    case 'en_cours': return 'En cours';
    case 'termine': return 'Terminé';
    default: return status;
  }
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const confirmClearAll = async () => {
  const alert = await alertController.create({
    header: 'Effacer toutes les notifications',
    message: 'Êtes-vous sûr de vouloir supprimer toutes les notifications ?',
    buttons: [
      { text: 'Annuler', role: 'cancel' },
      { 
        text: 'Effacer', 
        role: 'destructive',
        handler: () => clearAllNotifications()
      }
    ]
  });
  await alert.present();
};
</script>

<style scoped>
/* ── Toolbar ── */
ion-toolbar {
  --background: #0a0a0a;
  --color: #fff;
  --border-color: transparent;
}
ion-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.toolbar-action {
  --color: rgba(255, 255, 255, 0.5);
}

/* ── Header Summary ── */
.header-summary {
  background: #0a0a0a;
  padding: 0 20px 12px;
}
.summary-text {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.3px;
}
.summary-text.all-read {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(52, 199, 89, 0.6);
}
.summary-text.all-read ion-icon {
  font-size: 13px;
}

/* ── Content ── */
.notifications-content {
  --background: #0a0a0a;
}

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 65%;
  padding: 32px;
  text-align: center;
}

.empty-illustration {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 28px;
}

.empty-circle {
  position: absolute;
  border-radius: 50%;
}
.empty-circle.c1 {
  inset: 0;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}
.empty-circle.c2 {
  inset: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.empty-icon-wrap {
  position: absolute;
  inset: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-icon-wrap ion-icon {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.2);
}

.empty-state h3 {
  font-size: 17px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 8px;
  letter-spacing: -0.2px;
}
.empty-state p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  max-width: 260px;
  line-height: 1.5;
}

/* ── Notification List ── */
.notif-list {
  padding: 4px 14px 20px;
}

/* ── Notification Card ── */
.notif-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notif-card:active {
  background: rgba(255, 255, 255, 0.05);
}

.notif-card.notif-unread {
  background: rgba(43, 112, 255, 0.04);
  border-color: rgba(43, 112, 255, 0.1);
}

/* ── Icon Column ── */
.notif-icon-col {
  position: relative;
  flex-shrink: 0;
}

.notif-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notif-icon-circle ion-icon {
  font-size: 18px;
}

/* Status variants */
.notif-icon-circle.status-nouveau {
  background: rgba(255, 204, 0, 0.1);
  border: 1px solid rgba(255, 204, 0, 0.15);
}
.notif-icon-circle.status-nouveau ion-icon {
  color: #ffcc00;
}

.notif-icon-circle.status-en_cours {
  background: rgba(43, 112, 255, 0.1);
  border: 1px solid rgba(43, 112, 255, 0.15);
}
.notif-icon-circle.status-en_cours ion-icon {
  color: #5fa8ff;
}

.notif-icon-circle.status-termine {
  background: rgba(52, 199, 89, 0.1);
  border: 1px solid rgba(52, 199, 89, 0.15);
}
.notif-icon-circle.status-termine ion-icon {
  color: #34c759;
}

.notif-icon-circle.status-default {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.notif-icon-circle.status-default ion-icon {
  color: rgba(255, 255, 255, 0.4);
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2b70ff;
  border: 2px solid #0a0a0a;
  box-shadow: 0 0 6px rgba(43, 112, 255, 0.5);
}

/* ── Body ── */
.notif-body {
  flex: 1;
  min-width: 0;
}

.notif-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.notif-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.3;
}

.notif-timestamp {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;
}

.notif-message {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Status Pill ── */
.notif-footer {
  display: flex;
  align-items: center;
}

.status-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.pill-nouveau {
  background: rgba(255, 204, 0, 0.12);
  color: #ffcc00;
  border: 1px solid rgba(255, 204, 0, 0.15);
}
.pill-en_cours {
  background: rgba(43, 112, 255, 0.12);
  color: #5fa8ff;
  border: 1px solid rgba(43, 112, 255, 0.15);
}
.pill-termine {
  background: rgba(52, 199, 89, 0.12);
  color: #34c759;
  border: 1px solid rgba(52, 199, 89, 0.15);
}

/* ── Chevron ── */
.notif-chevron {
  display: flex;
  align-items: center;
  align-self: center;
  flex-shrink: 0;
}
.notif-chevron ion-icon {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.15);
}

/* ── Swipe actions override ── */
ion-item-sliding {
  --background: transparent;
}
ion-item-option {
  border-radius: 12px;
  margin: 4px;
}
</style>
