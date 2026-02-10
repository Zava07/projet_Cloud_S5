#!/bin/sh
set -e

: ${POSTGRES_USER:=postgres}
: ${POSTGRES_PASSWORD:=postgres}
: ${POSTGRES_DB:=cloud_db}
: ${DB_HOST:=db}

# Export password so psql won't prompt
export PGPASSWORD="${POSTGRES_PASSWORD}"

echo "Waiting for Postgres at ${DB_HOST}..."
until pg_isready -h "${DB_HOST}" -U "${POSTGRES_USER}" -d postgres >/dev/null 2>&1; do
  sleep 1
done

echo "Postgres is ready. Checking if database '${POSTGRES_DB}' exists..."
DB_EXISTS=$(psql -h "${DB_HOST}" -U "${POSTGRES_USER}" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'")
if [ "${DB_EXISTS}" != "1" ]; then
  echo "Database ${POSTGRES_DB} does not exist. Creating..."
  psql -h "${DB_HOST}" -U "${POSTGRES_USER}" -d postgres -c "CREATE DATABASE \"${POSTGRES_DB}\";"
else
  echo "Database ${POSTGRES_DB} already exists."
fi

# Run init.sql if present
if [ -f /init/init.sql ]; then
  echo "Executing init.sql on ${POSTGRES_DB}"
  psql -h "${DB_HOST}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -f /init/init.sql
else
  echo "No init.sql found at /init/init.sql"
fi

echo "DB init script finished."