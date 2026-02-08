package com.itu.cloud.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.config.path:firebase-service-account.json}")
    private String firebaseConfigPath;

    private boolean initialized = false;

    @PostConstruct
    public synchronized void initialize() {
        if (initialized) return;
        
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                // Lire le contenu en mémoire pour éviter les problèmes de stream
                byte[] credentialsBytes;
                try (InputStream is = new ClassPathResource(firebaseConfigPath).getInputStream()) {
                    credentialsBytes = is.readAllBytes();
                }

                GoogleCredentials credentials = GoogleCredentials.fromStream(
                    new ByteArrayInputStream(credentialsBytes)
                );

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase initialized successfully");
            }
            initialized = true;
        } catch (IOException e) {
            System.err.println("⚠️ Firebase initialization failed: " + e.getMessage());
            throw new RuntimeException("Failed to initialize Firebase", e);
        }
    }

    @Bean(destroyMethod = "") // Empêcher Spring de fermer le Firestore
    @Scope("singleton")
    public Firestore firestore() {
        if (!initialized) {
            initialize();
        }
        return FirestoreClient.getFirestore();
    }
}
