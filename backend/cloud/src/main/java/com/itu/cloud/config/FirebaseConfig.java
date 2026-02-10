package com.itu.cloud.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.config.path:firebase-service-account.json}")
    private String firebaseConfigPath;

    private volatile Firestore cachedFirestore;

    @PostConstruct
    public void initialize() {
        initializeFirebase();
    }

    /**
     * Initialise FirebaseApp si nécessaire.
     */
    private synchronized void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount;

                // Essayer de charger depuis les ressources classpath
                try {
                    serviceAccount = new ClassPathResource(firebaseConfigPath).getInputStream();
                } catch (IOException e) {
                    // Sinon, essayer depuis le système de fichiers
                    serviceAccount = new FileInputStream(firebaseConfigPath);
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase initialized successfully");
            }
        } catch (IOException e) {
            System.err.println("⚠️ Firebase initialization failed: " + e.getMessage());
            System.err.println("   Make sure firebase-service-account.json is in src/main/resources/");
        }
    }

    /**
     * Supprime l'ancien FirebaseApp et réinitialise tout.
     * Appelé quand le client Firestore est fermé/invalide.
     */
    public synchronized void reinitialize() {
        System.out.println("🔄 Réinitialisation de Firebase...");
        try {
            // Fermer l'ancien Firestore proprement
            if (cachedFirestore != null) {
                try { cachedFirestore.close(); } catch (Exception ignored) { }
                cachedFirestore = null;
            }
            // Supprimer l'ancienne app Firebase
            if (!FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.getInstance().delete();
            }
            // Réinitialiser
            initializeFirebase();
            cachedFirestore = null; // sera recréé au prochain appel
            System.out.println("✅ Firebase réinitialisé avec succès");
        } catch (Exception e) {
            System.err.println("⚠️ Firebase reinitialization failed: " + e.getMessage());
        }
    }

    /**
     * Retourne une instance Firestore valide.
     * Si le client est fermé, réinitialise Firebase et en crée un nouveau.
     */
    public Firestore getFirestore() {
        if (FirebaseApp.getApps().isEmpty()) {
            reinitialize();
        }
        if (cachedFirestore == null) {
            cachedFirestore = FirestoreClient.getFirestore();
        }
        return cachedFirestore;
    }

    /**
     * Réinitialise le cache Firestore (appelé après une erreur "client closed").
     */
    public void invalidateFirestore() {
        cachedFirestore = null;
    }
}
