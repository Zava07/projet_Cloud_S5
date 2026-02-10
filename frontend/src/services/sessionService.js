/**
 * Service de gestion des sessions utilisateur
 * Gère le stockage, la validation et l'expiration des sessions
 */

const SESSION_STORAGE_KEY = 'userSession';
const SESSION_CHECK_INTERVAL = 60000; // Vérifier toutes les 60 secondes

/**
 * Récupère la base URL de l'API
 */
const getApiBase = () => import.meta.env.VITE_API_BASE || 'http://localhost:8080';

/**
 * Sauvegarde les informations de session
 */
export const saveSession = (sessionData) => {
  const data = {
    ...sessionData,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
};

/**
 * Récupère les informations de session
 */
export const getSession = () => {
  try {
    const data = localStorage.getItem(SESSION_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Erreur lecture session:', e);
    return null;
  }
};

/**
 * Supprime la session
 */
export const clearSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

/**
 * Vérifie si la session est expirée côté client
 */
export const isSessionExpired = () => {
  const session = getSession();
  if (!session || !session.expiresAt) {
    return true;
  }
  const expiresAt = new Date(session.expiresAt);
  return expiresAt <= new Date();
};

/**
 * Vérifie si la session est proche de l'expiration (5 minutes par défaut)
 */
export const isSessionNearExpiration = (thresholdMinutes = 5) => {
  const session = getSession();
  if (!session || !session.expiresAt) {
    return true;
  }
  const expiresAt = new Date(session.expiresAt);
  const warningTime = new Date(expiresAt.getTime() - thresholdMinutes * 60 * 1000);
  return new Date() >= warningTime;
};

/**
 * Retourne le temps restant avant expiration en minutes
 */
export const getTimeUntilExpiration = () => {
  const session = getSession();
  if (!session || !session.expiresAt) {
    return 0;
  }
  const expiresAt = new Date(session.expiresAt);
  const now = new Date();
  const diffMs = expiresAt - now;
  return Math.max(0, Math.floor(diffMs / 60000));
};

/**
 * Valide la session auprès du serveur
 */
export const validateSessionWithServer = async () => {
  const session = getSession();
  if (!session || !session.token) {
    return { valid: false, error: 'Pas de session' };
  }

  try {
    const response = await fetch(`${getApiBase()}/api/sessions/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.valid) {
      // Mettre à jour expiresAt si le serveur le renvoie
      if (data.expiresAt) {
        const currentSession = getSession();
        saveSession({ ...currentSession, expiresAt: data.expiresAt });
      }
      return {
        valid: true,
        nearExpiration: data.nearExpiration,
        user: data.user,
        session: data.session
      };
    }
    
    return { valid: false, error: data.error || 'Session invalide' };
  } catch (error) {
    console.error('Erreur validation session:', error);
    // En cas d'erreur réseau, on utilise la validation locale
    return {
      valid: !isSessionExpired(),
      error: 'Erreur de connexion au serveur',
      offline: true
    };
  }
};

/**
 * Rafraîchit la session auprès du serveur
 */
export const refreshSession = async () => {
  const session = getSession();
  if (!session || !session.token) {
    return { success: false, error: 'Pas de session' };
  }

  try {
    const response = await fetch(`${getApiBase()}/api/sessions/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      // Mettre à jour la session avec les nouvelles données
      const currentSession = getSession();
      saveSession({
        ...currentSession,
        expiresAt: data.session.expiresAt
      });
      return { success: true, session: data.session };
    }
    
    return { success: false, error: data.error || 'Impossible de prolonger la session' };
  } catch (error) {
    console.error('Erreur rafraîchissement session:', error);
    return { success: false, error: 'Erreur de connexion au serveur' };
  }
};

/**
 * Déconnexion - invalide la session côté serveur et nettoie le stockage local
 */
export const logout = async () => {
  const session = getSession();
  
  if (session && session.token) {
    try {
      await fetch(`${getApiBase()}/api/sessions/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Erreur logout serveur:', error);
    }
  }
  
  clearSession();
};

/**
 * Récupère la configuration de session depuis le serveur
 */
export const getSessionConfig = async () => {
  try {
    const response = await fetch(`${getApiBase()}/api/sessions/config`);
    if (response.ok) {
      return await response.json();
    }
    return { durationMinutes: 60 }; // Valeur par défaut
  } catch (error) {
    return { durationMinutes: 60 }; // Valeur par défaut en cas d'erreur
  }
};

/**
 * Classe pour gérer la vérification périodique de session
 */
export class SessionMonitor {
  constructor(options = {}) {
    this.checkInterval = options.checkInterval || SESSION_CHECK_INTERVAL;
    this.warningThresholdMinutes = options.warningThresholdMinutes || 5; // Seuil d'avertissement en minutes
    this.onSessionExpired = options.onSessionExpired || (() => {});
    this.onSessionNearExpiration = options.onSessionNearExpiration || (() => {});
    this.onSessionValid = options.onSessionValid || (() => {});
    this.intervalId = null;
    this.warningShown = false;
  }

  setWarningThreshold(minutes) {
    this.warningThresholdMinutes = minutes;
  }

  start() {
    if (this.intervalId) {
      return; // Déjà démarré
    }

    this.check(); // Vérification immédiate
    this.intervalId = setInterval(() => this.check(), this.checkInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.warningShown = false;
  }

  async check() {
    const session = getSession();
    
    if (!session || !session.token) {
      this.onSessionExpired('Pas de session active');
      return;
    }

    // Vérification locale d'abord (rapide)
    if (isSessionExpired()) {
      this.onSessionExpired('Session expirée');
      clearSession();
      return;
    }

    // Vérification si proche de l'expiration (utilise le seuil configuré)
    if (isSessionNearExpiration(this.warningThresholdMinutes) && !this.warningShown) {
      this.warningShown = true;
      const minutesLeft = getTimeUntilExpiration();
      console.log(`Session expire dans ${minutesLeft} minutes (seuil: ${this.warningThresholdMinutes})`);
      this.onSessionNearExpiration(minutesLeft);
    }

    // Vérification serveur (moins fréquente, toutes les 5 vérifications)
    if (Math.random() < 0.2) {
      const result = await validateSessionWithServer();
      if (!result.valid && !result.offline) {
        this.onSessionExpired(result.error);
        clearSession();
        return;
      }
    }

    this.onSessionValid();
  }

  resetWarning() {
    this.warningShown = false;
  }
}

export default {
  saveSession,
  getSession,
  clearSession,
  isSessionExpired,
  isSessionNearExpiration,
  getTimeUntilExpiration,
  validateSessionWithServer,
  refreshSession,
  logout,
  getSessionConfig,
  SessionMonitor
};
