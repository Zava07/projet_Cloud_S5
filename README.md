# projet_Cloud_S5

Application de signalement de problèmes urbains avec géolocalisation.

## 🚀 Prérequis

- Docker & Docker Compose
- Un fichier de credentials Firebase (voir section Configuration)

## ⚙️ Configuration Firebase (IMPORTANT)

Pour des raisons de sécurité, le fichier de credentials Firebase n'est pas inclus dans le dépôt.

### Étapes pour configurer Firebase :

1. **Obtenir le fichier de credentials** - Contactez un membre de l'équipe pour obtenir le fichier `firebase-service-account.json`, OU créez votre propre projet Firebase :
   - Allez sur [Firebase Console](https://console.firebase.google.com/)
   - Créez un projet ou utilisez le projet `iray-lalana`
   - Allez dans **Paramètres du projet** → **Comptes de service**
   - Cliquez sur **Générer une nouvelle clé privée**
   - Téléchargez le fichier JSON

2. **Placer le fichier** :
   ```
   backend/cloud/src/main/resources/firebase-service-account.json
   ```
   
   Un fichier exemple est fourni : `firebase-service-account.json.example`

3. **Structure attendue du fichier** :
   ```json
   {
     "type": "service_account",
     "project_id": "iray-lalana",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-...@iray-lalana.iam.gserviceaccount.com",
     "client_id": "...",
     ...
   }
   ```

## 🐳 Démarrage avec Docker

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build frontend-dev backend
```

## 📚 Documentation API

Documentation Swagger pour l'API Spring Boot :

http://localhost:8080/swagger-ui/index.html

## 👥 Équipe

Projet scolaire - L3 S5
