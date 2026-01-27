# 📋 TODO - Prochaines étapes d'intégration

## 🔥 Priorité Haute (Backend & API)

### 1. Intégration Firebase
- [ ] Installer Firebase SDK
  ```bash
  npm install firebase
  ```
- [ ] Créer projet Firebase Console
- [ ] Configurer Authentication (Email/Password)
- [ ] Remplacer `useAuth.ts` avec vraies API Firebase
- [ ] Gérer les tokens et refresh
- [ ] Implémenter la persistance de session

### 2. API Backend (Postgres)
- [ ] Créer l'API REST (Node.js/Express ou autre)
- [ ] Endpoints problèmes :
  - `GET /api/problems` - Liste tous les problèmes
  - `GET /api/problems/:id` - Détails d'un problème
  - `POST /api/problems` - Créer un signalement
  - `PUT /api/problems/:id` - Modifier (Manager)
  - `DELETE /api/problems/:id` - Supprimer (Manager)
- [ ] Endpoints utilisateurs :
  - `GET /api/users/me` - Profil utilisateur
  - `PUT /api/users/me` - Modifier profil
- [ ] Endpoints statistiques :
  - `GET /api/stats` - Statistiques globales
- [ ] Middleware d'authentification
- [ ] Validation des données (Joi/Zod)
- [ ] Gestion des erreurs

### 3. Serveur de cartes Docker
- [ ] Installer serveur de cartes offline (OpenStreetMap)
- [ ] Télécharger la carte d'Antananarivo
- [ ] Configurer Docker Compose
- [ ] Tester l'accès aux tiles

## 🗺️ Priorité Moyenne (Carte Leaflet)

### 4. Intégration Leaflet
- [ ] Installer Leaflet
  ```bash
  npm install leaflet @types/leaflet vue-leaflet
  ```
- [ ] Créer composant `MapView.vue` dans `components/map/`
- [ ] Intégrer tiles du serveur Docker
- [ ] Afficher les marqueurs des problèmes
- [ ] Popup avec info au clic sur marqueur
- [ ] Clustering des marqueurs (si beaucoup)
- [ ] Géolocalisation utilisateur
- [ ] Sélectionner position pour signalement

### 5. Composant MapView détaillé
```vue
<!-- components/map/MapView.vue -->
<template>
  <div class="map-container">
    <l-map ref="map" :zoom="zoom" :center="center">
      <l-tile-layer :url="tileUrl" />
      <l-marker
        v-for="problem in problems"
        :key="problem.id"
        :lat-lng="[problem.latitude, problem.longitude]"
        @click="$emit('marker-click', problem)"
      >
        <l-icon :icon-url="getMarkerIcon(problem.status)" />
        <l-popup>
          <h4>{{ problem.title }}</h4>
          <p>{{ problem.description }}</p>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>
```

## 📸 Priorité Basse (Fonctionnalités avancées)

### 6. Upload de photos
- [ ] Intégrer Capacitor Camera
  ```bash
  npm install @capacitor/camera
  ```
- [ ] Créer composant `PhotoUploader.vue`
- [ ] Ajouter dans formulaire de signalement
- [ ] Compression d'images côté client
- [ ] Upload vers serveur/Firebase Storage
- [ ] Afficher galerie dans détails

### 7. Géolocalisation GPS
- [ ] Intégrer Capacitor Geolocation
  ```bash
  npm install @capacitor/geolocation
  ```
- [ ] Demander permissions utilisateur
- [ ] Récupérer position actuelle
- [ ] Pré-remplir lat/lng dans signalement
- [ ] Reverse geocoding pour l'adresse
- [ ] Afficher position sur carte

### 8. Mode Offline
- [ ] Service Worker pour PWA
- [ ] Cacher les données localement (IndexedDB)
- [ ] Queue de synchronisation
- [ ] Indicateur online/offline
- [ ] Sync auto quand connexion rétablie

### 9. Notifications Push
- [ ] Installer Capacitor Push Notifications
- [ ] Configurer Firebase Cloud Messaging
- [ ] Notifier nouveau signalement (Manager)
- [ ] Notifier changement statut (Utilisateur)

## 🎨 Améliorations UI/UX

### 10. Composants manquants
- [ ] Composant `UserProfile.vue` - Profil utilisateur
- [ ] Composant `SearchBar.vue` - Recherche signalements
- [ ] Composant `ImageGallery.vue` - Galerie photos
- [ ] Composant `LoadingSpinner.vue` - Loading states
- [ ] Composant `EmptyState.vue` - États vides

### 11. Améliorations Map
- [ ] Couches de carte (standard, satellite)
- [ ] Itinéraire vers problème
- [ ] Zone de dessin pour surface affectée
- [ ] Heat map des problèmes
- [ ] Export carte en PDF

### 12. Améliorations Liste
- [ ] Tri (date, surface, budget)
- [ ] Pagination ou scroll infini
- [ ] Vue grille/liste
- [ ] Export Excel/CSV
- [ ] Graphiques avancés (Chart.js)

## 🧪 Tests et Qualité

### 13. Tests unitaires
- [ ] Tests services (useAuth, useProblems)
- [ ] Tests composants (ProblemCard, FilterModal)
- [ ] Tests utilitaires

### 14. Tests E2E
- [ ] Scénario connexion/inscription
- [ ] Scénario signalement problème
- [ ] Scénario filtrage
- [ ] Scénario actions Manager

### 15. Performance
- [ ] Lazy loading des composants
- [ ] Image optimization
- [ ] Bundle size analysis
- [ ] Lighthouse audit
- [ ] Cache stratégies

## 📱 Build Mobile

### 16. Android
- [ ] Configurer Capacitor Android
- [ ] Icône et splash screen
- [ ] Permissions manifeste
- [ ] Tester sur émulateur
- [ ] Build APK/AAB
- [ ] Préparer pour Play Store

### 17. iOS
- [ ] Configurer Capacitor iOS
- [ ] Icône et splash screen
- [ ] Permissions Info.plist
- [ ] Tester sur simulateur
- [ ] Build IPA
- [ ] Préparer pour App Store

## 📚 Documentation

### 18. Documentation technique
- [ ] Guide d'installation complet
- [ ] Guide de contribution
- [ ] Documentation API
- [ ] Diagrammes (MCD, Use Cases)
- [ ] Architecture détaillée

### 19. Documentation utilisateur
- [ ] Manuel utilisateur
- [ ] FAQ
- [ ] Vidéos tutoriels
- [ ] Screenshots annotés

## 🔒 Sécurité

### 20. Sécurité et Validation
- [ ] Validation côté client et serveur
- [ ] Protection CSRF
- [ ] Rate limiting API
- [ ] Sanitization des inputs
- [ ] Headers de sécurité
- [ ] HTTPS uniquement

## 🚀 Déploiement

### 21. CI/CD
- [ ] GitHub Actions ou GitLab CI
- [ ] Tests automatiques
- [ ] Build automatique
- [ ] Déploiement staging
- [ ] Déploiement production

### 22. Hébergement
- [ ] Choisir hébergeur (Vercel, Netlify, Firebase)
- [ ] Configurer domaine
- [ ] SSL/TLS
- [ ] CDN pour assets
- [ ] Monitoring (Sentry)

## 📊 Analytics

### 23. Suivi utilisateurs
- [ ] Google Analytics ou Mixpanel
- [ ] Événements personnalisés
- [ ] Funnels de conversion
- [ ] Rapports d'usage

## ✅ Checklist avant livraison

- [ ] Tous les tests passent
- [ ] Documentation à jour
- [ ] README complet
- [ ] Code commenté
- [ ] Git history propre
- [ ] .env.example fourni
- [ ] Instructions de déploiement
- [ ] Credentials de test documentés
- [ ] MCD et diagrammes inclus
- [ ] Liste des membres du groupe

---

## 📅 Planning suggéré

### Semaine 1 (19-25 janvier)
✅ Structure du projet (Fait)  
✅ Composants de base (Fait)  
✅ Mock data et navigation (Fait)  
🔜 Intégration Firebase  
🔜 Début API Backend  

### Semaine 2 (26 janvier - 31 janvier)
🔜 Serveur de cartes Docker  
🔜 Intégration Leaflet  
🔜 API Backend complète  
🔜 Tests et finalisation  
🔜 Documentation technique  

**Date limite : 31 janvier 2026**

---

💡 **Conseil** : Prioriser d'abord l'intégration backend et Firebase, puis Leaflet. Les fonctionnalités avancées (photos, GPS) peuvent être ajoutées après si le temps le permet.
