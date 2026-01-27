
# projet_Cloud_S5

Documentation swagger pour l'api spring-boot

http://localhost:8080/swagger-ui/index.html 

# Application Mobile - Gestion des Travaux Routiers Antananarivo

Application mobile Ionic Vue pour signaler et suivre les travaux routiers à Antananarivo, Madagascar.

## 📱 Fonctionnalités

### Pour les Visiteurs (non connectés)
- Voir la carte avec tous les problèmes routiers signalés
- Consulter les détails de chaque signalement (date, statut, surface, budget, entreprise)
- Voir le tableau de récapitulation avec statistiques
- Filtrer les signalements par statut, date, entreprise

### Pour les Utilisateurs (connectés)
- Toutes les fonctionnalités visiteur
- Se connecter avec Firebase (simulé)
- Signaler un nouveau problème routier
- Ajouter la localisation GPS
- Joindre des photos

### Pour les Managers
- Toutes les fonctionnalités utilisateur
- Modifier le statut des signalements
- Assigner un budget et une entreprise
- Gérer les informations de chaque signalement

## 🏗️ Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── auth/           # Composants d'authentification
│   ├── map/            # Composants de carte
│   └── problem/        # Composants de gestion des problèmes
│       ├── ProblemCard.vue
│       ├── FilterModal.vue
│       └── StatisticsCard.vue
├── views/              # Pages principales
│   ├── LoginPage.vue
│   ├── MapPage.vue
│   ├── ProblemsListPage.vue
│   ├── ProblemDetailPage.vue
│   └── TabsPage.vue
├── services/           # Services/Composables
│   ├── useAuth.ts      # Gestion authentification
│   └── useProblems.ts  # Gestion des problèmes
├── types/              # Types TypeScript
│   └── index.ts        # Interfaces et enums
├── data/               # Données de test
│   ├── mockProblems.ts # Problèmes de test
│   └── mockUsers.ts    # Utilisateurs de test
└── router/             # Configuration des routes
    └── index.ts
```

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour production
npm run build
```

## 🔐 Comptes de Test

### Manager par défaut
- **Email:** manager@mairie-tana.mg
- **Mot de passe:** Manager2026!

### Utilisateur test
- **Email:** jean.rakoto@example.mg
- Créez votre compte via l'inscription

## 📊 Données de Test

L'application contient 7 problèmes routiers fictifs à Antananarivo avec différents statuts :
- Nouveau (3)
- En cours (2)
- Terminé (1)
- Bloqué (1)

## 🎨 Composants Principaux

### ProblemCard
Carte affichant un résumé d'un problème routier avec :
- Titre et description
- Adresse
- Date de signalement
- Surface affectée
- Budget (si assigné)
- Entreprise (si assignée)
- Statut avec code couleur

### FilterModal
Modal de filtrage permettant de filtrer les problèmes par :
- Statut (multiple)
- Entreprise
- Période (date début/fin)
- Budget

### StatisticsCard
Carte de statistiques affichant :
- Nombre total de signalements
- Surface totale affectée
- Budget total alloué
- Pourcentage d'avancement
- Répartition par statut

## 🗺️ Carte Leaflet (À implémenter)

Le module de carte actuel est un placeholder. Pour l'intégration complète :

1. Installer le serveur de cartes offline sur Docker
2. Télécharger la carte d'Antananarivo
3. Intégrer Leaflet avec :
   ```bash
   npm install leaflet @types/leaflet
   ```
4. Remplacer le placeholder dans `MapPage.vue`

## 📱 Build Mobile

### Android
```bash
npx cap add android
npx cap sync
npx cap open android
```

### iOS
```bash
npx cap add ios
npx cap sync
npx cap open ios
```

## 🔧 Technologies Utilisées

- **Framework:** Ionic Vue 8
- **UI:** Ionic Components
- **Routing:** Vue Router 4
- **Language:** TypeScript
- **Build:** Vite 5
- **Icons:** Ionicons 7

## 📝 Notes de Développement

- L'authentification Firebase est simulée (localStorage)
- Les données sont mockées en mémoire
- La carte Leaflet n'est pas encore intégrée (placeholder)
- Prêt pour l'intégration avec une API backend

## 🎯 Prochaines Étapes

1. Intégrer la vraie authentification Firebase
2. Connecter à l'API backend (Postgres)
3. Intégrer le serveur de cartes Leaflet offline
4. Ajouter la géolocalisation GPS
5. Implémenter l'upload de photos
6. Ajouter la synchronisation online/offline

## 📄 Licence

Projet académique - Promotion 17 - Cloud S5
Date limite: 31 janvier 2026

