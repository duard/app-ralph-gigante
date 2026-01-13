#!/bin/bash

# PostgreSQL connection parameters
POSTGRES_HOST="192.168.1.9"
POSTGRES_PORT="5432"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="v9bbVDuULUU64xlxznnz2XC38B4m9J6G8WxkPqGVHXAWOXEFQPmqjSX33TW5twd7"
POSTGRES_DB="gigantao"

export PGPASSWORD="$POSTGRES_PASSWORD"

echo "=== Tables in All Schemas ==="
psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT 
    schemaname,
    tablename,
    table_type
FROM information_schema.tables 
WHERE schemaname IN ('production', 'development', 'auth', 'inspecoes_caixas', 'logistica_emprestimo_controle', 'rh_seguranca', 'test')
    AND table_name NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;
"

echo ""
echo "=== Count of Tables per Schema ==="
psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT 
    schemaname,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE schemaname IN ('production', 'development', 'auth', 'inspecoes_caixas', 'logistica_emprestimo_controle', 'rh_seguranca', 'test')
    AND table_name NOT IN ('pg_catalog', 'information_schema')
GROUP BY schemaname
ORDER BY schemaname;
"

echo ""
echo "=== Looking for Sankhya Tables ==="
psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT 
    schemaname,
    tablename
FROM information_schema.tables 
WHERE schemaname IN ('production', 'development', 'auth', 'inspecoes_caixas', 'logistica_emprestimo_controle', 'rh_seguranca', 'test')
    AND table_name ~* '^[T][G][A-Z][0-9]+.*$'
    AND table_name NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;
"

unset PGPASSWORD