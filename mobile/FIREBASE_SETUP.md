# Configuration Firebase - Iray Lalana

## ✅ Intégration complétée

Firebase a été intégré avec succès dans l'application Ionic. L'application utilise maintenant Firebase Authentication et Firestore Database au lieu des données mockées.

## 📋 Fonctionnalités implémentées

### 1. Firebase Authentication
- ✅ Inscription avec email/password (Email/Password Authentication)
- ✅ Connexion avec email/password
- ✅ Déconnexion
- ✅ Gestion de l'état d'authentification persistante
- ✅ Stockage des utilisateurs dans Firestore collection `users`

### 2. Firestore Database
- ✅ Collection `users` pour stocker les profils utilisateurs
- ✅ Collection `reports` pour les signalements de problèmes
- ✅ Ajout de nouveaux signalements
- ✅ Lecture des signalements avec tri par date
- ✅ Mise à jour des signalements (managers uniquement)
- ✅ Filtrage des signalements par utilisateur

### 3. Géolocalisation
- ✅ Capture automatique GPS (latitude/longitude)
- ✅ Affichage sur carte Leaflet
- ✅ Stockage dans Firestore

### 4. Formulaires
- ✅ Inscription : Prénom, Nom, Email, Mot de passe
- ✅ Connexion : Email, Mot de passe
- ✅ Créer un signalement : Titre, Description, Adresse, Surface, GPS
- ✅ Liste des signalements avec filtres

## 🔑 Credentials Firebase

Le projet est configuré avec le projet Firebase **iray-lalana** :

```
Project ID: iray-lalana
API Key: AIzaSyBzPij_NADPbZIh9nWe8iScXv64vk78aig
Auth Domain: iray-lalana.firebaseapp.com
Storage Bucket: iray-lalana.firebasestorage.app
Messaging Sender ID: 302056517170
App ID: 1:302056517170:web:ef1a7b189051d01df8562b
```

## 📁 Structure des données

### Collection `users`
```typescript
{
  uid: string,              // Firebase UID (unique)
  email: string,
  firstName: string,
  lastName: string,
  displayName: string,      // firstName + lastName
  role: "utilisateur" | "manager",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection `reports`
```typescript
{
  id: string,               // Auto-généré par Firestore
  userId: string,           // UID de l'utilisateur
  userName: string,
  userEmail: string,
  latitude: number,
  longitude: number,
  description: string,
  status: "nouveau" | "en_cours" | "termine",
  surface: number | null,
  budget: number | null,
  entreprise: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🚀 Configuration requise dans Firebase Console

### 1. Authentication
- Activer **Email/Password** dans Firebase Console > Authentication > Sign-in method
- Désactiver "Email link (passwordless sign-in)" si non utilisé

### 2. Firestore Database
Créer les collections :
- `users` (créée automatiquement lors de l'inscription)
- `reports` (créée automatiquement lors du premier signalement)

### 3. Règles de sécurité Firestore (recommandées)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection users - Lecture publique, écriture propre
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    // Collection reports - Lecture publique, écriture authentifiée
    match /reports/{reportId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager'
      );
    }
  }
}
```

### 4. Règles de sécurité Storage (si photos ajoutées)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📱 Utilisation

### Démarrer l'application
```bash
npm install
npm run dev
```

### Première utilisation
1. Créer un compte via le formulaire d'inscription
2. Se connecter avec email/password
3. Créer un signalement depuis la carte
4. Voir la liste des signalements

### Créer un Manager (Firebase Console)
1. Créer un utilisateur dans Authentication
2. Dans Firestore, aller dans `users/{uid}`
3. Modifier le champ `role` à `"manager"`

## 🔧 Fichiers modifiés

- `src/config/firebase.ts` - Configuration Firebase
- `src/types/index.ts` - Types adaptés pour Firebase
- `src/services/useAuth.ts` - Authentification Firebase
- `src/services/useProblems.ts` - Opérations Firestore
- `src/views/LoginPage.vue` - Formulaire avec prénom/nom
- `src/views/MapPage.vue` - Création signalement avec données utilisateur
- `src/views/ProblemsListPage.vue` - Chargement depuis Firestore
- `src/App.vue` - Initialisation Firebase Auth state

## 🔒 Sécurité

- Les mots de passe sont gérés par Firebase Authentication (hashage bcrypt)
- Les tokens d'authentification sont stockés de manière sécurisée
- Les règles Firestore empêchent les modifications non autorisées
- Seuls les managers peuvent modifier les signalements des autres utilisateurs

## 📊 Statistiques et rapports

- Total des problèmes
- Répartition par statut (nouveau, en cours, terminé)
- Surface totale affectée
- Budget total alloué
- Pourcentage d'avancement

## 🌍 Fonctionnalités futures

- Upload de photos vers Firebase Storage
- Notifications push avec Firebase Cloud Messaging
- Export PDF des rapports
- Dashboard analytics avec Firebase Analytics
- Synchronisation offline avec Firestore Persistence

---

**Projet:** Iray Lalana - Gestion des travaux routiers  
**Stack:** Ionic Vue 8 + TypeScript + Firebase  
**Date:** Janvier 2026
