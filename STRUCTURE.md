# 📁 Structure Complète du Projet

## Vue d'ensemble

```
projet_Cloud_S5/
├── src/
│   ├── components/           # Composants Vue réutilisables
│   │   ├── auth/            # Composants d'authentification
│   │   ├── map/             # Composants liés à la carte
│   │   └── problem/         # Composants de gestion des problèmes
│   │       ├── ProblemCard.vue          # Carte affichant un problème
│   │       ├── FilterModal.vue          # Modal de filtrage
│   │       └── StatisticsCard.vue       # Carte de statistiques
│   │
│   ├── views/               # Pages principales de l'app
│   │   ├── LoginPage.vue              # Page de connexion/inscription
│   │   ├── MapPage.vue                # Page carte avec signalements
│   │   ├── ProblemsListPage.vue       # Liste des signalements
│   │   ├── ProblemDetailPage.vue      # Détails d'un signalement
│   │   └── TabsPage.vue               # Navigation par onglets
│   │
│   ├── services/            # Services/Composables (logique métier)
│   │   ├── useAuth.ts                 # Gestion authentification
│   │   └── useProblems.ts             # Gestion des problèmes
│   │
│   ├── types/               # Définitions TypeScript
│   │   └── index.ts                   # Interfaces et enums
│   │
│   ├── data/                # Données de test (mock)
│   │   ├── mockProblems.ts            # 7 problèmes fictifs
│   │   └── mockUsers.ts               # Utilisateurs de test
│   │
│   ├── router/              # Configuration Vue Router
│   │   └── index.ts                   # Routes et navigation
│   │
│   ├── theme/               # Styles et variables CSS
│   │   └── variables.css              # Variables Ionic
│   │
│   ├── App.vue              # Composant racine
│   ├── main.ts              # Point d'entrée de l'app
│   └── vite-env.d.ts        # Types Vite
│
├── public/                  # Fichiers statiques
├── .gitignore              # Fichiers ignorés par Git
├── vite.config.ts          # Configuration Vite (alias @, plugins)
├── tsconfig.json           # Configuration TypeScript
├── tsconfig.node.json      # Config TypeScript pour Vite
├── package.json            # Dépendances et scripts
├── README.md               # Documentation principale
└── GUIDE_DEMARRAGE.md      # Guide de démarrage rapide
```

## 📦 Fichiers clés

### Configuration

| Fichier | Description |
|---------|-------------|
| `vite.config.ts` | Config Vite avec plugin Vue et alias @ |
| `tsconfig.json` | Config TypeScript avec path aliases |
| `package.json` | Dépendances et scripts npm |
| `.gitignore` | Exclusion node_modules, dist, etc. |

### Types (`src/types/index.ts`)

```typescript
- User              // Utilisateur (id, email, role, etc.)
- Problem           // Signalement routier
- ProblemStatus     // Enum: NEW, IN_PROGRESS, COMPLETED, BLOCKED
- ProblemFilter     // Critères de filtrage
- Statistics        // Statistiques globales
- MapMarker         // Marqueur sur la carte
```

### Services (`src/services/`)

#### `useAuth.ts`
- `login()` - Connexion utilisateur
- `register()` - Inscription
- `logout()` - Déconnexion
- `checkAuthState()` - Vérifier l'état auth au démarrage
- States: `currentUser`, `isAuthenticated`, `isManager`

#### `useProblems.ts`
- `getProblems()` - Récupérer tous les problèmes
- `filterProblems()` - Filtrer par critères
- `addProblem()` - Ajouter un signalement
- `updateProblem()` - Modifier (Manager)
- `getProblemById()` - Récupérer par ID
- `getStatistics()` - Calculer les stats
- States: `problems`, `selectedProblem`

### Composants réutilisables

#### `ProblemCard.vue`
**Props:** `problem: Problem`  
**Emit:** `click`  
**Usage:** Afficher un résumé d'un problème dans une liste

#### `FilterModal.vue`
**Props:** `modelValue: ProblemFilter`, `companies: string[]`  
**Emit:** `update:modelValue`  
**Usage:** Modal de filtrage avec statuts, dates, entreprise

#### `StatisticsCard.vue`
**Props:** `stats: Statistics`  
**Usage:** Afficher les statistiques en grid + barres

### Pages (`src/views/`)

#### `LoginPage.vue`
- Formulaire de connexion
- Formulaire d'inscription
- Bouton "Continuer en tant que visiteur"
- Affiche les credentials du manager

#### `MapPage.vue`
- Placeholder carte Leaflet avec marqueurs
- Bouton FAB + pour signaler (si connecté)
- Modal de signalement avec formulaire
- Modal de détails d'un problème
- Bouton logout

#### `ProblemsListPage.vue`
- Carte de statistiques
- Bouton de filtrage
- Liste de ProblemCard
- Navigation vers détails

#### `ProblemDetailPage.vue`
- Affichage complet d'un problème
- Actions Manager (si connecté en manager)
  - Changer statut
  - Assigner budget
  - Assigner entreprise

#### `TabsPage.vue`
- 2 onglets: Carte et Liste
- Navigation par tabs Ionic

### Données de test

#### `mockProblems.ts`
7 problèmes routiers à Antananarivo :
1. Avenue de l'Indépendance (Nouveau)
2. Route de Digue (En cours)
3. Tunnel Ambatonakanga (Bloqué)
4. Rue Rainitovo (Nouveau)
5. Avenue Rainilaiarivony (Terminé)
6. Boulevard de l'Europe (En cours)
7. Route d'Ambohimanarina (Nouveau)

#### `mockUsers.ts`
- jean.rakoto@example.mg (Utilisateur)
- marie.andriani@example.mg (Utilisateur)
- manager@mairie-tana.mg (Manager)

### Router (`src/router/index.ts`)

Routes configurées :
```
/                    → Redirect vers /login
/login              → LoginPage
/tabs/              → TabsPage (container)
  ├─ /tabs/map      → MapPage
  └─ /tabs/problems → ProblemsListPage
/map                → Redirect vers /tabs/map
/problems           → Redirect vers /tabs/problems
/problem/:id        → ProblemDetailPage
```

## 🎨 Conventions de code

### Nommage
- **Composants:** PascalCase (`ProblemCard.vue`)
- **Services:** camelCase avec use prefix (`useAuth.ts`)
- **Types:** PascalCase (`Problem`, `ProblemStatus`)
- **Variables:** camelCase (`currentUser`, `filteredProblems`)

### Organisation des imports
```typescript
1. Vue/Ionic imports
2. Ionicons
3. Services/Composables
4. Types
5. Composants locaux
```

### Structure d'un composant Vue
```vue
<template>
  <!-- HTML -->
</template>

<script setup lang="ts">
// Imports
// Props & Emits
// Composables & Services
// Refs & Computed
// Functions
</script>

<style scoped>
/* Styles */
</style>
```

## 🔄 Flux de données

```
main.ts
  └─ App.vue
      └─ Router
          ├─ LoginPage
          │   └─ useAuth → localStorage
          │
          └─ TabsPage
              ├─ MapPage
              │   ├─ useAuth (currentUser, isAuthenticated)
              │   └─ useProblems (problems, addProblem)
              │
              └─ ProblemsListPage
                  ├─ StatisticsCard
                  ├─ FilterModal
                  ├─ ProblemCard (multiple)
                  └─ useProblems (filterProblems, getStatistics)
```

## 📊 État global

### Authentification (useAuth)
```typescript
currentUser: Ref<User | null>
isAuthenticated: Computed<boolean>
isManager: Computed<boolean>
```

### Problèmes (useProblems)
```typescript
problems: Ref<Problem[]>
selectedProblem: Ref<Problem | null>
```

## 🎯 Points d'extension

### Pour ajouter Firebase réel
1. Installer Firebase SDK
2. Remplacer `useAuth.ts` avec vraies API Firebase
3. Configurer Firebase dans `main.ts`

### Pour ajouter Leaflet
1. `npm install leaflet @types/leaflet`
2. Remplacer le placeholder dans `MapPage.vue`
3. Créer `MapView.vue` dans `components/map/`

### Pour connecter une API backend
1. Créer `src/api/` avec axios
2. Remplacer les fonctions mock dans services
3. Ajouter gestion erreurs et loading states

### Pour ajouter upload photos
1. Installer `@capacitor/camera`
2. Utiliser `usePhotoGallery` composable
3. Intégrer dans formulaire de signalement

## 🧪 Tests

Structure recommandée :
```
tests/
├── unit/
│   ├── components/
│   ├── services/
│   └── views/
└── e2e/
    ├── auth.cy.ts
    ├── problems.cy.ts
    └── navigation.cy.ts
```

---

**Cette structure est conçue pour être :**
- ✅ **Modulaire** : Composants réutilisables
- ✅ **Maintenable** : Code organisé et typé
- ✅ **Évolutive** : Facile d'ajouter de nouvelles features
- ✅ **Testable** : Logique séparée de la présentation
