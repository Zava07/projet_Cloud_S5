# Déploiement Docker (Spring Boot + React + Postgres) ✅

## Prérequis
- Docker & Docker Compose installés
- Copier `.env.example` -> `.env` et mettre vos valeurs

## Structure générée
- `docker-compose.yml` : orchestre `db` (Postgres), `backend` (Spring Boot) et `frontend` (React + nginx)
- `backend/Dockerfile` : multi-stage Maven build + Java 17 runtime
- `frontend/Dockerfile` : build Node 22 + nginx pour servir la `build`
- `postgres/init.sql` : script d'initialisation exemple

## Lancer l'application
1. Copier les variables d'environnement :

   cp .env.example .env
   # modifier .env si nécessaire

2. Démarrer (build + run) :

   docker compose up --build

3. Accéder aux services :
- Backend : http://localhost:8080
- Frontend : http://localhost:3000

## Notes & conseils
- Le `backend/Dockerfile` suppose un projet Maven. Si vous utilisez Gradle, adaptez le Dockerfile.
- Pour le développement frontend, vous pouvez démarrer en local avec `npm start` (Node 22) et proxy vers l'API.
- Pour la connexion Spring Boot -> Postgres, les variables `SPRING_DATASOURCE_*` sont injectées depuis `docker-compose.yml`.

---
Si vous voulez, j'adapte le Dockerfile `backend` pour Gradle, ou j'ajoute un `docker-compose.override.yml` pour le développement front/back (live reload). 🔧
