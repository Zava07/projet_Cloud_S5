-- Exemple d'initialisation de la base de données. Ce fichier est exécuté automatiquement
-- par l'image officielle Postgres à la création du volume si monté dans /docker-entrypoint-initdb.d

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
