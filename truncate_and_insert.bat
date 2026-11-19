@echo off
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d test_db -c "TRUNCATE usuarios;"
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d test_db -f "D:\evilore_\Evilore U\Semestres\5 Semestre\Desarrollo en Plataformas\RDA2\2. Semanas 7-11\TEST\insert_users_simple.sql"