# 🚀 Guide de Démarrage Rapide

## Installation

```bash
npm install
```

## Lancement de l'application

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:5173/**

## 🔐 Premiers pas

### 1. Page de Login
Au démarrage, vous arrivez sur la page de login avec 3 options :
- **Se connecter** (si vous avez déjà un compte)
- **S'inscrire** (créer un nouveau compte utilisateur)
- **Continuer en tant que visiteur** (accès limité)

### 2. Compte Manager de test
Pour tester les fonctionnalités Manager :
- Email : `manager@mairie-tana.mg`
- Mot de passe : `Manager2026!`

### 3. Navigation

#### Onglet Carte 🗺️
- Voir tous les problèmes routiers sur la carte (placeholder)
- Cliquer sur un marqueur pour voir les détails
- **Bouton +** (si connecté) : Signaler un nouveau problème

#### Onglet Liste 📋
- Voir les statistiques globales
- Filtrer les signalements par :
  - Statut (Nouveau, En cours, Terminé, Bloqué)
  - Entreprise
  - Période (date début/fin)
- Cliquer sur une carte pour voir les détails complets

## 📱 Fonctionnalités par rôle

### Visiteur (non connecté)
✅ Voir la carte avec les problèmes  
✅ Consulter la liste des signalements  
✅ Filtrer les signalements  
✅ Voir les statistiques  
❌ Signaler un problème  

### Utilisateur (connecté)
✅ Toutes les fonctionnalités visiteur  
✅ Signaler un nouveau problème routier  
✅ Ajouter titre, description, adresse, surface  
❌ Modifier le statut ou assigner budget/entreprise  

### Manager
✅ Toutes les fonctionnalités utilisateur  
✅ Modifier le statut des signalements  
✅ Assigner un budget  
✅ Assigner une entreprise  

## 🎨 Codes couleur des statuts

- 🟡 **Jaune** : Nouveau
- 🔵 **Bleu** : En cours
- 🟢 **Vert** : Terminé
- 🔴 **Rouge** : Bloqué

## 📊 Données de test

L'application contient **7 signalements fictifs** à Antananarivo :
1. Nid-de-poule Avenue de l'Indépendance
2. Chaussée dégradée Route de Digue
3. Affaissement Tunnel Ambatonakanga
4. Route inondée Rue Rainitovo
5. Nid-de-poule Avenue Rainilaiarivony
6. Chaussée fissurée Boulevard de l'Europe
7. Dos d'âne endommagé Route d'Ambohimanarina

## 🔧 Commandes utiles

```bash
# Lancer les tests
npm run test:unit

# Build pour production
npm run build

# Prévisualiser le build
npm run preview

# Lint du code
npm run lint

# Tests E2E avec Cypress
npm run test:e2e
```

## 📂 Structure des fichiers

```
src/
├── components/       # Composants réutilisables
├── views/           # Pages de l'application
├── services/        # Logique métier (composables)
├── types/           # Types TypeScript
├── data/            # Données de test (mock)
└── router/          # Configuration des routes
```

## ⚠️ Notes importantes

- **Firebase** : L'authentification est simulée (localStorage)
- **Carte** : Le module Leaflet est un placeholder, à intégrer avec le serveur de cartes Docker
- **API** : Les données sont mockées en mémoire, prêtes pour l'intégration backend
- **Photos** : Fonctionnalité non encore implémentée
- **GPS** : Coordonnées fixes pour le moment

## 🐛 Problèmes courants

### Le serveur ne démarre pas
```bash
# Nettoyer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Erreurs TypeScript avec l'alias @
Assurez-vous que `tsconfig.json` et `vite.config.ts` sont bien présents avec la configuration de l'alias.

### Page blanche après build
Vérifiez le `base` dans `vite.config.ts` selon votre environnement de déploiement.

## 💡 Conseils

1. **Tester d'abord en visiteur** pour voir toutes les données
2. **Créer un compte utilisateur** pour tester les signalements
3. **Utiliser le compte Manager** pour tester les modifications
4. **Utiliser les filtres** pour explorer différentes vues des données

## 📞 Support

Pour toute question sur le projet, consultez le `README.md` principal ou contactez l'équipe de développement.

---

**Bon développement ! 🎉**
