const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fallback to individual properties if DATABASE_URL is not provided
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

class Database {
  constructor() {
    this.pool = pool;
  }

  async connect() {
    try {
      // Test the connection
      const client = await this.pool.connect();
      console.log('Connected to PostgreSQL database');
      client.release();
      
      // Initialize tables
      await this.initTables();
      return Promise.resolve();
    } catch (err) {
      console.error('Error connecting to PostgreSQL:', err.message);
      return Promise.reject(err);
    }
  }

  async initTables() {
    try {
      const tables = [
        `CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS places (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS machinery (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(255),
          place_id INTEGER REFERENCES places(id),
          capacity DECIMAL(10,2),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS oil_data (
          id SERIAL PRIMARY KEY,
          machinery_id INTEGER NOT NULL REFERENCES machinery(id),
          date TIMESTAMP NOT NULL,
          litres DECIMAL(10,2) NOT NULL,
          type VARCHAR(50) DEFAULT 'consumption',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      ];

      for (const sql of tables) {
        await this.pool.query(sql);
      }
      
      console.log('All tables created successfully');
      return Promise.resolve();
    } catch (err) {
      console.error('Error creating tables:', err.message);
      return Promise.reject(err);
    }
  }

  getPool() {
    return this.pool;
  }

  async query(text, params) {
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (err) {
      console.error('Database query error:', err.message);
      throw err;
    }
  }

  async close() {
    try {
      await this.pool.end();
      console.log('Database connection pool closed');
    } catch (err) {
      console.error('Error closing database connection:', err.message);
    }
  }
}

module.exports = new Database(); 