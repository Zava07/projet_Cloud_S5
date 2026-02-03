import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/config/firebase';
import { useAuth } from './useAuth';
import { toastController } from '@ionic/vue';

export async function initMessaging() {
  // messaging exported from config (browser), returns undefined on non-web platforms
  if (!messaging) return;

  try {
    const m = getMessaging();
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const token = await getToken(m, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
    if (token) {
      const { registerFcmToken } = useAuth();
      await registerFcmToken(token);
    }

    onMessage(m, async (payload) => {
      const toast = await toastController.create({
        message: payload.notification?.title ? `${payload.notification.title}: ${payload.notification?.body || ''}` : 'Nouvelle notification',
        duration: 4000,
        color: 'primary',
      });
      await toast.present();
    });
  } catch (err) {
    console.error('Erreur messaging init:', err);
  }
}
