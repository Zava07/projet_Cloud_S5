
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
- Se connecter avec Firebase (Authentification via Firebase Auth et stockage dans Firestore)
- Signaler un nouveau problème routier
- Ajouter la localisation GPS
- Joindre des photos

### Pour les Managers
- Toutes les fonctionnalités utilisateur
- **Modifier le statut** des signalements (depuis la vue détail d'un signalement)
- **Assigner un budget** et **affecter une entreprise** (depuis la vue détail)
- **Accès aux outils de gestion** : tri avancé, filtres d'administration, et actions massives (selon permissions)
- Gérer les informations de chaque signalement (photos, coordonnées, notes internes)

> Remarque : les actions sensibles (changer le statut, assigner budget/entreprise) sont protégées et visibles seulement aux comptes avec le rôle "manager" ou administrateur.

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
├── scripts/            # Scripts d'initialisation / seed (ex: peupler Firestore pour tests)
└── router/             # Configuration des routes
    └── index.ts
```

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer l'application en développement (navigateur)
ionic serve

# Build web (production)
ionic build

# Ajouter la plateforme Android (à faire une seule fois)
npx cap add android

# Après chaque build : synchroniser les fichiers vers les projets natifs
npx cap sync android

# Ouvrir le projet Android dans Android Studio
npx cap open android
```

## 🔐 Comptes de Test

### Manager par défaut
- **Email:** manager@mairie-tana.mg
- **Mot de passe:** Manager2026!

### Utilisateur test
- **Email:** jean.rakoto@example.mg
- Créez votre compte via l'inscription

## 📊 Données de Test

Les données de l'application sont gérées via **Firestore**. Pour les tests, pré-peupler Firestore avec des documents `reports`, `users` et `entreprises` via la console Firebase ou via des scripts d'initialisation (`scripts/seed-firestore.js` par exemple). Les environnements de test peuvent contenir des jeux de données différentes selon vos besoins.

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

Interaction MARQUEURS / SURVOL & ACTIONS RAPIDES
- Au **survol** (desktop) ou **pression courte** (mobile) d'un marqueur, un aperçu rapide doit s'afficher (titre, date, statut, mini-preview photo).
- Un clic / pression longue ouvre la **vue détail** complète du signalement.
- Les **managers** verront dans la vue détail les contrôles pour **changer le statut**, **attribuer une entreprise** et **allouer un budget**. Ces actions peuvent aussi être proposées en actions rapides depuis le popup du marqueur si vous souhaitez un workflow plus rapide.

> Conseil : Implémenter un comportement tactile (tap / long-press) pour mobile au lieu du survol, et prévoir une animation légère pour rendre l'aperçu plus visible.

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

- **Authentification :** Firebase Auth est intégré et utilisé pour la connexion et l'état de session
- **Données :** Firestore est la source de vérité pour `reports`, `users` et `entreprises`
- **Carte :** Leaflet est intégré dans `MapView.vue` (supporte serveur de tuiles configurable et bascule vers OpenStreetMap si besoin)
- **Backend :** L'application est prête pour une intégration backend (Postgres / API) si nécessaire

## 🎯 Prochaines Étapes

1. Connecter l'application au backend Postgres / API (si besoin d'un stockage relationnel centralisé)
2. Déployer et valider un serveur de tuiles (si utilisation de tuiles locales) ou configurer le fallback OSM
3. Ajouter la synchronisation online/offline et gestion des conflits
4. Implémenter l'upload sécurisé de photos et stockage (Firebase Storage ou backend)
5. Ajouter des scripts de seed et utilitaires de migration pour Firestore
6. Améliorer les tests E2E (Cypress) pour couvrir les scénarios de production

---

## 🧭 Scénarios d'utilisation

### SCÉNARIO 1 : Continuer en tant que visiteur
- **Acteur** : Utilisateur
- **Condition** : aucune
- **Étapes** :
  1. L'utilisateur ouvre l'application
  2. Il clique sur **"Continuer en tant que visiteur"**
  3. La carte s’affiche
  4. Au **survol** (desktop) ou **pression courte** (mobile) sur un marqueur, un aperçu rapide s'affiche (titre, date, statut). Un clic / pression longue ouvre la vue détail.
- **Peut faire** :
  - Voir la carte et les signalements publics
  - Obtenir un aperçu rapide d'un signalement via survol/pression
  - Consulter les détails d'un signalement (date, statut, description, photo, entreprise si renseignée)
  - Parcourir le tableau de statistiques et utiliser les filtres publics
  - Rechercher des signalements par texte
- **Ne peut pas faire** :
  - Signaler un nouveau problème
  - Voir ou utiliser la fonctionnalité **"Mes signalements"**
  - Modifier le statut, assigner une entreprise ou allouer un budget (réservé aux managers)
  - Accéder aux fonctions nécessitant une authentification (édition, signalement privé)

---

### SCÉNARIO 2 : Connexion
- **Acteur** : Utilisateur inscrit
- **Préconditions** :
  - L’utilisateur a déjà un compte
- **Étapes** :
  1. L'utilisateur ouvre l'application
  2. Il clique sur **"Se connecter"**
  3. Il saisit ses identifiants :
     - Email : `manager@outlook.com`
     - Mot de passe : `******`
  4. Il clique sur **"Se connecter"**
  5. Firebase vérifie les identifiants
  6. L'utilisateur accède à l'écran d'accueil
- **Postconditions** :
  - L'utilisateur est authentifié
  - Il peut accéder aux fonctionnalités (signaler, filtrer, voir statistiques)
- **Peut faire** :
  - Signaler de nouveaux problèmes (avec coordonnées GPS) et voir leur statut
  - Utiliser le filtre **"Mes signalements"** pour voir uniquement ses propres rapports
  - Sauvegarder des préférences locales (ex: recherche, filtres)
- **Ne peut pas faire** :
  - Modifier le statut des signalements (si l'utilisateur n'est pas manager)
  - Assigner un budget ni une entreprise (si non-manager)
  - Accéder aux pages de gestion réservées aux managers (sans rôle approprié)

---

### SCÉNARIO 3 : CRÉER UN SIGNALEMENT
- **Description** : Signaler un problème routier
- **Acteur** : Utilisateur connecté
- **Préconditions** :
  - L'utilisateur est connecté
  - GPS activé sur le téléphone (recommandé pour précision)
- **Étapes** :
  1. Écran d'accueil (connecté) :
     - Cliquer sur la position où il y a un problème sur la carte
     - Au **survol** (desktop) ou **pression courte** (mobile) sur un marqueur, un aperçu rapide s'affiche (titre, date, statut). Un clic / pression longue ouvre la vue détail.
  2. Écran de localisation :
     - Carte affichée
     - Bouton **+** pour utiliser la position actuelle
     - Coordonnées GPS affichées
  3. Formulaire de signalement :
     - Position GPS (pré-remplie)
     - Champs : Description, Surface, Budget, Entreprise
     - Bouton **"Signaler"**
  4. Confirmation :
     - Signalement envoyé avec succès
- **Peut faire** :
  - Soumettre un signalement complet (coordonnées, description, photo)
  - Obtenir un aperçu rapide d'un signalement via survol/pression
  - Utiliser la position actuelle via le bouton **+**
  - Voir le signalement dans la liste et dans **"Mes signalements"**
- **Ne peut pas faire** :
  - Assigner une entreprise ou allouer un budget (réservé aux managers)
  - Modifier le statut du signalement (réservé aux managers)
  - Soumettre sans informations minimales (ex: description vide si la validation l'exige)

---

---

## 📁 Structure du mobile (résumé)

```
mobile/src/
├── components/          # Composants réutilisables (auth, map, problem)
│   ├── auth/
│   ├── map/
│   └── problem/        # ProblemCard.vue, FilterModal.vue, etc.
├── views/               # Pages (LoginPage, MapPage, ProblemsListPage, ProblemDetailPage, TabsPage)
├── services/            # useAuth.ts, useProblems.ts (Firestore)
├── config/              # firebase.ts, index.ts (constantes)
├── types/               # Types TS
├── router/              # index.ts
└── theme/               # styles (global, ios-premium, variables)
```

## ⚙️ Configurations nécessaires

1. **Variables d'environnement Firebase** (fichier `.env`, `.env.local` ou via CI) :

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. **Collections Firestore attendues** :
- `reports` : signalements (documents avec champs userId, userName, latitude, longitude, description, status, surface, budget, entreprise, createdAt)
- `users` : utilisateurs (uid, email, displayName)
- `entreprises` (ou `companies`) : listes d'entreprises (id, name, contact, email)

> Remarque : l'application essaie `entreprises` puis `companies` pour permettre différentes conventions.

3. **Démarrage & développement** :

```bash
# Installer
npm install

# Lancer en dev
npm run dev

# Pour mobile (Capacitor)
npx cap add android && npx cap sync
npx cap open android
```

4. **Comptes de test** :
- Assurez-vous d'avoir un compte créé dans Firebase Auth (ex: `manager@outlook.com`) ou ajoutez le via le seed / la console Firebase.

5. **Format d'entrée Budget** :
- Saisir le budget en Ariary (ex: `2000`). Les formats abbrégés (`2k`) sont supportés à la lecture, mais **les affichages et statistiques utilisent toujours la valeur complète en Ariary**.

---

## 🧾 Notes utiles
- Si la collection `entreprises` est vide, l'application utilise des noms d'entreprises dérivés des signalements existants.
- Pour les tests, vous pouvez pré-remplir Firestore avec quelques `reports`, `users` et `entreprises` via la console Firebase ou un script d'import.

---

## 📄 Licence

Projet académique - Promotion 17 - Cloud S5
Date limite: 31 janvier 2026

