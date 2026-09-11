// creates the db if needed, then runs schema.sql and seed.sql
// run with: npm run db:setup
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DATABASE_DIR = path.join(__dirname, '..', '..', '..', 'database');

async function setupDatabase(databaseName = process.env.DB_NAME) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', [databaseName]);
    await connection.query('USE ??', [databaseName]);
    await connection.query(fs.readFileSync(path.join(DATABASE_DIR, 'schema.sql'), 'utf8'));
    await connection.query(fs.readFileSync(path.join(DATABASE_DIR, 'seed.sql'), 'utf8'));
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log(`Database "${process.env.DB_NAME}" is ready with schema and seed data.`);
    })
    .catch((error) => {
      console.error('Database setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
