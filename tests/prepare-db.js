require('dotenv').config();

const { Client } = require('pg');

const dbName = process.env.DB_NAME || 'bd_dp_prueba_test';

if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error(`Nombre de base de datos inválido: ${dbName}`);
}

(async () => {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: 'postgres'
    });

    await client.connect();

    const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (exists.rowCount === 0) {
        await client.query(`CREATE DATABASE "${dbName}"`);
        console.log(`Base de datos de pruebas creada: ${dbName}`);
    } else {
        console.log(`Base de datos de pruebas ya existente: ${dbName}`);
    }

    await client.end();
})().catch((error) => {
    console.error('No se pudo preparar la base de datos de pruebas:', error.message);
    process.exit(1);
});
