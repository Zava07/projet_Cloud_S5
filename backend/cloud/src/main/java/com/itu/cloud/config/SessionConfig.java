package com.itu.cloud.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration pour la gestion des sessions utilisateur.
 * La durée de session est paramétrable via application.properties:
 * - app.session.duration-minutes (défaut: 60 minutes = 1 heure)
 */
@Configuration
@ConfigurationProperties(prefix = "app.session")
public class SessionConfig {

    /**
     * Durée de la session en minutes (défaut: 60 = 1 heure)
     */
    private int durationMinutes = 60;

    /**
     * Activer le rafraîchissement automatique de session lors des validations
     */
    private boolean autoRefresh = false;

    /**
     * Seuil en minutes avant expiration pour déclencher un avertissement (défaut: 5 minutes)
     */
    private int warningThresholdMinutes = 5;

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public boolean isAutoRefresh() {
        return autoRefresh;
    }

    public void setAutoRefresh(boolean autoRefresh) {
        this.autoRefresh = autoRefresh;
    }

    public int getWarningThresholdMinutes() {
        return warningThresholdMinutes;
    }

    public void setWarningThresholdMinutes(int warningThresholdMinutes) {
        this.warningThresholdMinutes = warningThresholdMinutes;
    }
}
