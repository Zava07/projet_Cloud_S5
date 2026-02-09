# Iray Lalana

Application de signalement de problemes urbains.

## Lancer le projet

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build frontend-dev backend
```

## Configuration Firebase

Le fichier `firebase-service-account.json` est envoye par email (pas dans le repo pour des raisons de securite).

A placer dans : `backend/cloud/src/main/resources/firebase-service-account.json`

## Documentation API

Swagger : http://localhost:8080/swagger-ui/index.html
