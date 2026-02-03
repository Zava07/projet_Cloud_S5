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