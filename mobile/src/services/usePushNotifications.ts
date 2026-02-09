import { ref, computed } from 'vue';
import { Capacitor } from '@capacitor/core';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { toastController } from '@ionic/vue';
import router from '@/router';

// État global des notifications
const fcmToken = ref<string | null>(null);
const isRegistered = ref(false);
const permissionGranted = ref(false);

// Interface pour les notifications stockées
export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  receivedAt: Date;
  read: boolean;
}

const storedNotifications = ref<StoredNotification[]>([]);
const unreadCount = computed(() => storedNotifications.value.filter(n => !n.read).length);

// Listeners Firestore actifs
let reportsUnsubscribe: Unsubscribe | null = null;
const reportStatusCache = ref<Map<string, string>>(new Map());

// IDs des reports modifiés localement (pour ne pas se notifier soi-même)
const suppressedReportIds = new Set<string>();

export function usePushNotifications() {
  
  /**
   * Vérifier si les notifications push sont supportées
   */
  const isSupported = (): boolean => {
    return Capacitor.isPluginAvailable('PushNotifications');
  };

  /**
   * Vérifier si les notifications locales sont supportées
   */
  const isLocalNotificationsSupported = (): boolean => {
    return Capacitor.isPluginAvailable('LocalNotifications');
  };

  /**
   * Demander la permission pour les notifications
   */
  const registerForPushNotifications = async (): Promise<void> => {
    try {
      // Pour les plateformes natives, essayer d'utiliser les push notifications
      if (isSupported()) {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        
        let permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive === 'granted') {
          permissionGranted.value = true;
          
          // Setup listeners
          await PushNotifications.addListener('registration', async (token) => {
            console.log('[Push] FCM Token received:', token.value);
            fcmToken.value = token.value;
            await saveFcmTokenToFirestore(token.value);
          });

          await PushNotifications.addListener('registrationError', (error) => {
            console.error('[Push] Registration error:', error);
          });

          await PushNotifications.addListener('pushNotificationReceived', async (notification) => {
            console.log('[Push] Notification received:', notification);
            handleIncomingNotification({
              title: notification.title || 'Notification',
              body: notification.body || '',
              data: notification.data
            });
          });

          await PushNotifications.addListener('pushNotificationActionPerformed', async (action) => {
            const reportId = action.notification.data?.reportId;
            if (reportId) {
              router.push(`/problem/${reportId}`);
            }
          });

          await PushNotifications.register();
          isRegistered.value = true;
          console.log('[Push] Successfully registered for push notifications');
        }
      }

      // Démarrer le listener Firestore pour les changements de statut
      startReportsListener();
      
    } catch (error) {
      console.error('[Push] Error registering:', error);
      // Même si les push notifications échouent, on démarre le listener Firestore
      startReportsListener();
    }
  };

  /**
   * Démarrer le listener Firestore pour surveiller les changements de statut des signalements
   */
  const startReportsListener = (): void => {
    const user = auth.currentUser;
    if (!user) {
      console.log('[Notifications] No user logged in, cannot start listener');
      return;
    }

    // Arrêter le listener précédent s'il existe
    if (reportsUnsubscribe) {
      reportsUnsubscribe();
    }

    console.log('[Notifications] Starting Firestore listener for user:', user.uid);

    // Écouter les changements sur les signalements de l'utilisateur
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, where('userId', '==', user.uid));

    reportsUnsubscribe = onSnapshot(q, (snapshot) => {
      // Ignorer les writes optimistes locaux (pas encore confirmés par le serveur)
      if (snapshot.metadata.hasPendingWrites) {
        console.log('[Notifications] Ignoring local optimistic write');
        return;
      }

      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'modified') {
          const docData = change.doc.data();
          const reportId = change.doc.id;
          const newStatus = docData.status;
          const oldStatus = reportStatusCache.value.get(reportId);

          // Vérifier si le statut a changé
          if (oldStatus && oldStatus !== newStatus) {
            // Ignorer si c'est un changement fait par l'utilisateur lui-même
            if (suppressedReportIds.has(reportId)) {
              console.log(`[Notifications] Skipping self-notification for ${reportId}`);
              suppressedReportIds.delete(reportId);
              reportStatusCache.value.set(reportId, newStatus);
              return;
            }

            console.log(`[Notifications] Status changed for report ${reportId}: ${oldStatus} -> ${newStatus}`);
            
            // Créer et afficher la notification
            const notification = {
              title: '📋 Mise à jour de votre signalement',
              body: `Le statut est passé à: ${getStatusLabel(newStatus)}`,
              data: {
                type: 'status_change',
                reportId: reportId,
                oldStatus: oldStatus,
                newStatus: newStatus,
                status: newStatus,
                description: docData.description?.substring(0, 50)
              }
            };

            await handleIncomingNotification(notification);
          }

          // Mettre à jour le cache
          reportStatusCache.value.set(reportId, newStatus);
        } else if (change.type === 'added') {
          // Initialiser le cache pour les nouveaux documents
          const docData = change.doc.data();
          reportStatusCache.value.set(change.doc.id, docData.status);
        }
      });
    }, (error) => {
      console.error('[Notifications] Firestore listener error:', error);
    });
  };

  /**
   * Arrêter le listener Firestore
   */
  const stopReportsListener = (): void => {
    if (reportsUnsubscribe) {
      reportsUnsubscribe();
      reportsUnsubscribe = null;
      reportStatusCache.value.clear();
      console.log('[Notifications] Firestore listener stopped');
    }
  };

  /**
   * Gérer une notification entrante (push ou locale)
   */
  const handleIncomingNotification = async (notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<void> => {
    // Ajouter à la liste des notifications stockées
    addStoredNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      receivedAt: new Date(),
      read: false
    });

    // Afficher un toast dans l'app
    await showNotificationToast(notification);

    // Essayer d'afficher une notification locale (pour quand l'app est en arrière-plan)
    await showLocalNotification(notification);
  };

  /**
   * Afficher une notification locale
   */
  const showLocalNotification = async (notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<void> => {
    if (!isLocalNotificationsSupported()) return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      // Vérifier les permissions
      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        const requested = await LocalNotifications.requestPermissions();
        if (requested.display !== 'granted') return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: notification.title,
            body: notification.body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'default',
            extra: notification.data
          }
        ]
      });
    } catch (error) {
      console.log('[Notifications] Local notification error:', error);
    }
  };

  /**
   * Traduire le code de statut en libellé
   */
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'nouveau': return 'Nouveau';
      case 'en_cours': return 'En cours de traitement';
      case 'termine': return 'Terminé ✅';
      default: return status;
    }
  };

  /**
   * Sauvegarder le token FCM dans Firestore
   */
  const saveFcmTokenToFirestore = async (token: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token),
        lastFcmToken: token,
        fcmTokenUpdatedAt: serverTimestamp()
      });
      console.log('[Push] FCM token saved');
    } catch (error) {
      console.error('[Push] Error saving FCM token:', error);
    }
  };

  /**
   * Supprimer le token FCM (lors de la déconnexion)
   */
  const removeFcmToken = async (): Promise<void> => {
    const user = auth.currentUser;
    const token = fcmToken.value;
    
    // Toujours arrêter le listener
    stopReportsListener();
    
    if (!user || !token) {
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const tokens = data.fcmTokens as string[] || [];
        const updatedTokens = tokens.filter(t => t !== token);
        
        await updateDoc(userRef, {
          fcmTokens: updatedTokens,
          lastFcmToken: updatedTokens.length > 0 ? updatedTokens[updatedTokens.length - 1] : null
        });
      }
      
      fcmToken.value = null;
      console.log('[Push] FCM token removed');
    } catch (error) {
      console.error('[Push] Error removing FCM token:', error);
    }
  };

  /**
   * Afficher un toast pour la notification
   */
  const showNotificationToast = async (notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<void> => {
    const toast = await toastController.create({
      header: notification.title,
      message: notification.body,
      duration: 5000,
      position: 'top',
      color: 'primary',
      cssClass: 'notification-toast',
      buttons: [
        {
          text: 'Voir',
          handler: () => {
            const reportId = notification.data?.reportId;
            if (reportId) {
              router.push(`/problem/${reportId}`);
            }
          }
        },
        {
          text: 'Fermer',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  };

  /**
   * Ajouter une notification au stockage local
   */
  const addStoredNotification = (notification: StoredNotification): void => {
    storedNotifications.value.unshift(notification);
    // Garder seulement les 50 dernières notifications
    if (storedNotifications.value.length > 50) {
      storedNotifications.value = storedNotifications.value.slice(0, 50);
    }
    saveNotificationsToStorage();
  };

  /**
   * Marquer une notification comme lue
   */
  const markAsRead = (notificationId: string): void => {
    const notif = storedNotifications.value.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
      saveNotificationsToStorage();
    }
  };

  /**
   * Marquer toutes les notifications comme lues
   */
  const markAllAsRead = (): void => {
    storedNotifications.value.forEach(n => n.read = true);
    saveNotificationsToStorage();
  };

  /**
   * Supprimer une notification
   */
  const deleteNotification = (notificationId: string): void => {
    storedNotifications.value = storedNotifications.value.filter(n => n.id !== notificationId);
    saveNotificationsToStorage();
  };

  /**
   * Effacer toutes les notifications
   */
  const clearAllNotifications = (): void => {
    storedNotifications.value = [];
    saveNotificationsToStorage();
  };

  /**
   * Sauvegarder les notifications dans localStorage
   */
  const saveNotificationsToStorage = (): void => {
    try {
      localStorage.setItem('push_notifications', JSON.stringify(storedNotifications.value));
    } catch (error) {
      console.error('[Push] Error saving notifications:', error);
    }
  };

  /**
   * Charger les notifications depuis localStorage
   */
  const loadNotificationsFromStorage = (): void => {
    try {
      const stored = localStorage.getItem('push_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        storedNotifications.value = parsed.map((n: any) => ({
          ...n,
          receivedAt: new Date(n.receivedAt)
        }));
      }
    } catch (error) {
      console.error('[Push] Error loading notifications:', error);
    }
  };

  /**
   * Obtenir le token FCM courant
   */
  const getCurrentToken = (): string | null => {
    return fcmToken.value;
  };

  // Charger les notifications au démarrage
  loadNotificationsFromStorage();

  return {
    // État
    fcmToken,
    isRegistered,
    permissionGranted,
    storedNotifications,
    unreadCount,
    
    // Méthodes
    isSupported,
    registerForPushNotifications,
    removeFcmToken,
    saveFcmTokenToFirestore,
    getCurrentToken,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    loadNotificationsFromStorage,
    startReportsListener,
    stopReportsListener,
    /**
     * Supprimer la notification pour un report qu'on modifie soi-même
     */
    suppressNotificationFor: (reportId: string) => {
      suppressedReportIds.add(reportId);
      // Auto-clear après 10 secondes (au cas où le write échoue)
      setTimeout(() => suppressedReportIds.delete(reportId), 10000);
    }
  };
}
