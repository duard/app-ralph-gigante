#!/bin/bash

POSTGRES_HOST="192.168.1.9"
POSTGRES_PORT="5432"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="v9bbVDuULUU64xlxznnz2XC38B4m9J6G8WxkPqGVHXAWOXEFQPmqjSX33TW5twd7"
POSTGRES_DB="gigantao"

export PGPASSWORD="$POSTGRES_PASSWORD"

echo "=== PostgreSQL Connection Test ==="
echo "Host: $POSTGRES_HOST"
echo "Port: $POSTGRES_PORT"
echo "Database: $POSTGRES_DB"
echo "User: $POSTGRES_USER"
echo ""

psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT 
    schema_name,
    schema_owner,
    default_character_set_catalog
FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;
"

echo ""
echo "=== Schema Details ==="
psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT 
    nspname as schema_name,
    pg_get_userbyid(nspowner) as owner,
    array_to_string(nspacl, ', ') as privileges
FROM pg_namespace 
WHERE nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY nspname;
"

echo ""
echo "=== Tables in Production Schema ==="
psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'production'
ORDER BY table_name
LIMIT 20;
"

unset PGPASSWORD
echo ""
echo "Connection completed."