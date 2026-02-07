<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/map" />
        </ion-buttons>
        <ion-title>Notifications</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="markAllAsRead" v-if="unreadCount > 0">
            <ion-icon :icon="checkmarkDoneOutline" />
          </ion-button>
          <ion-button @click="confirmClearAll" v-if="storedNotifications.length > 0">
            <ion-icon :icon="trashOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="notifications-content">
      <!-- Empty state -->
      <div class="empty-state" v-if="storedNotifications.length === 0">
        <div class="empty-icon">
          <ion-icon :icon="notificationsOffOutline" />
        </div>
        <h3>Aucune notification</h3>
        <p>Vous recevrez des notifications lorsque le statut de vos signalements sera modifié.</p>
      </div>

      <!-- Notifications list -->
      <ion-list v-else>
        <ion-item-sliding v-for="notif in storedNotifications" :key="notif.id">
          <ion-item 
            button 
            @click="handleNotificationClick(notif)"
            :class="{ 'unread': !notif.read }"
          >
            <div class="notif-indicator" slot="start" v-if="!notif.read">
              <div class="indicator-dot"></div>
            </div>
            <ion-icon 
              slot="start" 
              :icon="getStatusIcon(notif.data?.status)" 
              :color="getStatusColor(notif.data?.status)"
              v-else
            />
            
            <ion-label>
              <h2>{{ notif.title }}</h2>
              <p>{{ notif.body }}</p>
              <p class="notif-time">
                <ion-icon :icon="timeOutline" />
                {{ formatTime(notif.receivedAt) }}
              </p>
            </ion-label>

            <ion-badge slot="end" :color="getStatusColor(notif.data?.status)" v-if="notif.data?.status">
              {{ getStatusLabel(notif.data?.status) }}
            </ion-badge>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" @click="deleteNotification(notif.id)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
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
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonIcon,
  IonButtons,
  IonButton,
  IonBackButton,
  IonBadge,
  alertController
} from '@ionic/vue';
import {
  notificationsOffOutline,
  checkmarkDoneOutline,
  trashOutline,
  timeOutline,
  alertCircleOutline,
  syncOutline,
  checkmarkCircleOutline,
  addCircleOutline
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

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'nouveau': return 'warning';
    case 'en_cours': return 'primary';
    case 'termine': return 'success';
    default: return 'medium';
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
.notifications-content {
  --background: #0a0a0a;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60%;
  padding: 32px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon ion-icon {
  font-size: 40px;
  color: rgba(255, 255, 255, 0.3);
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 8px;
}

.empty-state p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  max-width: 280px;
}

/* Notifications list */
ion-list {
  background: transparent;
  padding: 8px 0;
}

ion-item {
  --background: rgba(255, 255, 255, 0.03);
  --border-color: rgba(255, 255, 255, 0.08);
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 8px;
  margin: 0 12px 8px;
  border-radius: 12px;
  overflow: hidden;
}

ion-item.unread {
  --background: rgba(43, 112, 255, 0.08);
  border-left: 3px solid #2b70ff;
}

ion-item h2 {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
}

ion-item p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.notif-time {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 11px !important;
  color: rgba(255, 255, 255, 0.4) !important;
}

.notif-time ion-icon {
  font-size: 12px;
}

/* Indicator dot */
.notif-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2b70ff;
  box-shadow: 0 0 8px rgba(43, 112, 255, 0.5);
}

/* Badge styles */
ion-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

/* Toolbar */
ion-toolbar {
  --background: #0a0a0a;
  --color: #fff;
  --border-color: rgba(255, 255, 255, 0.1);
}

ion-title {
  font-weight: 600;
}
</style>
