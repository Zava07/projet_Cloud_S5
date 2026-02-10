-- 1. TABLE USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'utilisateur' CHECK (role IN ('visiteur', 'utilisateur', 'manager')),
    login_attempts INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLE SESSIONS
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLE ENTREPRISES
CREATE TABLE entreprises (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) UNIQUE NOT NULL,
    contact VARCHAR(100),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLE REPORTS
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    firebase_id VARCHAR(255) UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en_cours', 'termine')),
    surface DECIMAL(10, 2),
    budget DECIMAL(15, 2),
    entreprise_id INTEGER REFERENCES entreprises(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP
);

CREATE TABLE histo_reports (
    id_histo_reports SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id),
    status VARCHAR(20) CHECK (status IN ('nouveau', 'en_cours', 'termine')),
    date_changement TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE photo_reports (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLE SYNC_LOG
CREATE TABLE sync_log (
    id SERIAL PRIMARY KEY,
    sync_type VARCHAR(20) CHECK (sync_type IN ('pull', 'push', 'full')),
    records_pulled INTEGER DEFAULT 0,
    records_pushed INTEGER DEFAULT 0,
    conflicts INTEGER DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('success', 'partial', 'failed')),
    error_message TEXT,
    synced_by INTEGER REFERENCES users(id),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLE CONFIG
CREATE TABLE config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test data for projet_Cloud_S5
-- Inserts for users, sessions, entreprises, reports, sync_log, config
-- Locations chosen across Madagascar (Antananarivo, Toamasina, Nosy Be, Fianarantsoa, Toliara)

-- USERS
INSERT INTO users (id, firebase_uid, email, password_hash, first_name, last_name, role, login_attempts, is_blocked, created_at, updated_at)
VALUES
  (1, 'fb_uid_user_1', 'alice@example.com', 'hash_alice', 'Alice', 'Rakoto', 'utilisateur', 0, false, now(), now()),
  (2, 'fb_uid_user_2', 'admin@gmail.com', 'admin', 'admin', 'admin', 'manager', 0, false, now(), now()),
  (3, 'fb_uid_user_3', 'charlie@example.com', 'hash_charlie', 'Charlie', 'Ranaivo', 'visiteur', 0, false, now(), now());




-- Ensure sequence is advanced (if using serial sequences)
SELECT setval(pg_get_serial_sequence('users','id'), (SELECT MAX(id) FROM users));

-- ENTREPRISES
INSERT INTO entreprises (id, nom, contact, email, created_at)
VALUES
  (1, 'Entreprise Antananarivo', '034 12 345 67', 'contact@enta.mg', now()),
  (2, 'Entreprise Toamasina', '033 98 765 43', 'contact@tma.mg', now());

SELECT setval(pg_get_serial_sequence('entreprises','id'), (SELECT MAX(id) FROM entreprises));

-- REPORTS (signalements)
-- Antananarivo (capital)
INSERT INTO reports (id, firebase_id, user_id, latitude, longitude, description, status, surface, budget, entreprise_id, created_at, updated_at, synced_at)
VALUES
  (1, 'fb_report_1', 1, -18.87919000, 47.50790500, 'Affaissement du trottoir près du marché', 'nouveau', 2.50, 150.00, 1, now(), now(), NULL),
  (2, 'fb_report_2', 2, -18.91487400, 47.53160800, 'Poteau électrique tombé', 'en_cours', 0.00, 300.00, 1, now() - interval '2 day', now() - interval '1 day', NULL),
  -- Toamasina (east coast)
  (3, 'fb_report_3', 1, -18.14920000, 49.40230000, 'Inondation sur la route principale après la pluie', 'nouveau', 50.00, 1200.00, 2, now() - interval '7 day', now() - interval '6 day', NULL),
  -- Nosy Be (north)
  (4, 'fb_report_4', 3, -13.33330000, 48.28330000, 'Érosion du littoral près du port', 'termine', 100.00, 5000.00, NULL, now() - interval '30 day', now() - interval '29 day', now() - interval '28 day'),
  -- Fianarantsoa (south-center)
  (5, 'fb_report_5', 2, -21.45250000, 47.08500000, 'Affaissement partiel d''un pont rural', 'en_cours', 10.00, 800.00, NULL, now() - interval '3 day', now() - interval '1 day', NULL),
  -- Toliara (southwest)
  (6, 'fb_report_6', 1, -23.35000000, 43.66700000, 'Fissures importantes sur la chaussée', 'nouveau', 25.00, 600.00, NULL, now() - interval '1 day', now(), NULL);

SELECT setval(pg_get_serial_sequence('reports','id'), (SELECT MAX(id) FROM reports));

-- SESSIONS
INSERT INTO sessions (id, user_id, token, expires_at, created_at)
VALUES
  (1, 1, 'token_user_1_abc', now() + interval '7 day', now()),
  (2, 2, 'token_user_2_def', now() + interval '7 day', now());

SELECT setval(pg_get_serial_sequence('sessions','id'), (SELECT MAX(id) FROM sessions));

-- SYNC_LOG
INSERT INTO sync_log (id, sync_type, records_pulled, records_pushed, conflicts, status, error_message, synced_by, synced_at)
VALUES
  (1, 'full', 6, 0, 0, 'success', NULL, 1, now()),
  (2, 'push', 0, 2, 0, 'partial', 'Some remote rejects', 2, now() - interval '1 day');

SELECT setval(pg_get_serial_sequence('sync_log','id'), (SELECT MAX(id) FROM sync_log));

-- CONFIG
INSERT INTO config (id, key, value, description, updated_at)
VALUES
  (1, 'app.name', 'projet_cloud_s5', 'Application name', now()),
  (2, 'reports.default_status', 'nouveau', 'Default status for new reports', now());


SELECT setval(pg_get_serial_sequence('config','id'), (SELECT MAX(id) FROM config));

INSERT INTO config (id, key, value, description, updated_at)
VALUES
  (3, 'nouveau', '0', 'valuer de calcule avancement', now()),
  (4, 'en_cours', '50', 'valuer de calcule avancement', now()),
  (5, 'termine', '100', 'valuer de calcule avancement', now());

  (2, 'reports.default_status', 'nouveau', 'Default status for new reports', now());

-- Optional: map some users to entreprises if a join table exists (created by JPA many-to-many)
-- Uncomment and adjust if `user_entreprise` table is present in your DB schema
-- INSERT INTO user_entreprise (user_id, entreprise_id) VALUES (1,1), (2,1), (2,2);

-- End of test data
