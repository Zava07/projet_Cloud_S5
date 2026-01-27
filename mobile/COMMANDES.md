# 🛠️ Commandes Utiles

## 📦 Installation

```bash
# Installation des dépendances
npm install

# Installation avec cache clean (si problème)
npm ci
```

## 🚀 Développement

```bash
# Lancer le serveur de développement
npm run dev
# → Accessible sur http://localhost:5173/

# Lancer avec exposition réseau (pour tester sur mobile)
npm run dev -- --host
# → Accessible depuis autre appareil sur même réseau
```

## 🏗️ Build

```bash
# Build pour production
npm run build
# → Génère le dossier dist/

# Prévisualiser le build de production
npm run preview

# Build avec analyse de bundle
npm run build -- --report
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test:unit

# Tests unitaires en mode watch
npm run test:unit -- --watch

# Tests E2E avec Cypress
npm run test:e2e

# Ouvrir Cypress UI
npx cypress open
```

## 🔍 Linting et Formatage

```bash
# Linter le code
npm run lint

# Linter avec auto-fix
npm run lint -- --fix

# TypeScript check
npx vue-tsc --noEmit
```

## 📱 Mobile (Capacitor)

```bash
# Ajouter plateforme Android
npx cap add android

# Ajouter plateforme iOS
npx cap add ios

# Synchroniser le code web avec les plateformes natives
npx cap sync

# Ouvrir dans Android Studio
npx cap open android

# Ouvrir dans Xcode
npx cap open ios

# Build et sync en une commande
npm run build && npx cap sync

# Live reload sur appareil (Android)
npx cap run android -l --external
```

## 🗄️ Base de données (pour plus tard)

```bash
# Si vous utilisez Prisma
npx prisma init
npx prisma migrate dev
npx prisma studio

# Si vous utilisez TypeORM
npm run typeorm migration:generate
npm run typeorm migration:run
```

## 🐳 Docker

```bash
# Lancer le serveur de cartes
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Build et redémarrer
docker-compose up -d --build
```

## 🔧 Maintenance

```bash
# Nettoyer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache Vite
rm -rf node_modules/.vite

# Mettre à jour les dépendances (attention!)
npm update

# Vérifier les dépendances obsolètes
npm outdated

# Audit de sécurité
npm audit
npm audit fix
```

## 📊 Analyse

```bash
# Analyser la taille du bundle
npm run build -- --report
npx vite-bundle-visualizer

# Lighthouse audit
npx lighthouse http://localhost:5173 --view

# Analyser les performances
npx unlighthouse --site http://localhost:5173
```

## 🔍 Debugging

```bash
# Voir les logs Vite en détail
DEBUG=vite:* npm run dev

# TypeScript avec logs détaillés
npx tsc --noEmit --listFiles

# Ionic debug
ionic serve --lab
ionic serve --devapp
```

## 📝 Git

```bash
# Status
git status

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "feat: description du changement"

# Push
git push origin nom-de-la-branche

# Voir l'historique
git log --oneline --graph --all

# Créer une nouvelle branche
git checkout -b feature/nom-feature

# Merge une branche
git checkout main
git merge feature/nom-feature

# Stash (sauvegarder temporairement)
git stash
git stash pop
```

## 🌐 Déploiement

### Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Netlify
```bash
# Installer Netlify CLI
npm i -g netlify-cli

# Déployer
netlify deploy

# Déployer en production
netlify deploy --prod
```

### Firebase Hosting
```bash
# Installer Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Initialiser
firebase init hosting

# Déployer
firebase deploy
```

## 🔐 Variables d'environnement

```bash
# Créer fichier .env
cp .env.example .env

# Éditer avec nano (Linux/Mac)
nano .env

# Éditer avec notepad (Windows)
notepad .env
```

## 📦 Package Management

```bash
# Installer une dépendance
npm install nom-du-package

# Installer en dev dependency
npm install -D nom-du-package

# Désinstaller
npm uninstall nom-du-package

# Voir les packages installés
npm list --depth=0

# Voir les infos d'un package
npm info nom-du-package
```

## 🎨 Génération de composants (si CLI configuré)

```bash
# Générer un composant
ionic generate component NomComposant

# Générer une page
ionic generate page NomPage

# Générer un service
ionic generate service NomService
```

## 🔄 Mise à jour du projet

```bash
# Mettre à jour Ionic
npm install @ionic/vue@latest @ionic/vue-router@latest

# Mettre à jour Vue
npm install vue@latest

# Mettre à jour Vite
npm install -D vite@latest

# Mettre à jour toutes les dépendances (ATTENTION)
npx npm-check-updates -u
npm install
```

## 💡 Trucs et astuces

```bash
# Ouvrir VS Code
code .

# Ouvrir le dossier dans l'explorateur
# Windows
explorer .
# Mac
open .
# Linux
xdg-open .

# Lister les ports utilisés (Windows)
netstat -ano | findstr :5173

# Tuer un processus sur un port (Windows)
npx kill-port 5173

# Vider le cache npm
npm cache clean --force
```

## 🆘 Dépannage

### Erreur "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur TypeScript
```bash
# Redémarrer le serveur TypeScript (VS Code)
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Port déjà utilisé
```bash
# Changer le port dans vite.config.ts
export default defineConfig({
  server: { port: 3000 }
})
```

### Problème de permissions
```bash
# Windows (Exécuter PowerShell en Admin)
Set-ExecutionPolicy RemoteSigned

# Linux/Mac
sudo chown -R $USER:$GROUP ~/.npm
```

## 📚 Documentation en ligne

```bash
# Ouvrir la doc Ionic
npx ionic docs

# Ouvrir la doc Vue
open https://vuejs.org

# Ouvrir la doc TypeScript
open https://typescriptlang.org/docs
```

## 🎯 Raccourcis utiles

| Commande | Alias | Description |
|----------|-------|-------------|
| `npm run dev` | `npm start` | Démarrer dev server |
| `npm test` | `npm t` | Lancer les tests |
| `npm install` | `npm i` | Installer dépendances |
| `npm install --save` | `npm i -S` | Installer en dependency |
| `npm install --save-dev` | `npm i -D` | Installer en devDependency |

---

💡 **Astuce** : Ajouter ces commandes dans un fichier `Makefile` ou créer des scripts npm personnalisés dans `package.json` pour simplifier les commandes fréquentes.

**Exemple** :
```json
{
  "scripts": {
    "start": "npm run dev",
    "clean": "rm -rf node_modules dist .vite",
    "fresh": "npm run clean && npm install",
    "type-check": "vue-tsc --noEmit"
  }
}
```
