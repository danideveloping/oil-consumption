const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration for your current database
const currentDbConfig = {
  host: 'localhost', // Update this to your current DB host
  port: 5432,        // Update this to your current DB port
  database: 'nafta', // Update this to your current DB name
  user: 'postgres',  // Update this to your current DB user
  password: '',      // Update this to your current DB password
};

// Tables to migrate
const tables = [
  'places',
  'machinery', 
  'users',
  'oil_data'
];

async function migrateToRender() {
  const currentPool = new Pool(currentDbConfig);
  
  try {
    console.log('🚀 Starting migration to Render...');
    
    // Create migration directory
    const migrationDir = path.join(__dirname, '../migrations');
    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir);
    }
    
    // Export data from each table
    for (const table of tables) {
      console.log(`📊 Exporting ${table}...`);
      
      const result = await currentPool.query(`SELECT * FROM ${table}`);
      const data = result.rows;
      
      if (data.length > 0) {
        // Save as JSON
        const jsonPath = path.join(migrationDir, `${table}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        
        // Save as SQL INSERT statements
        const sqlPath = path.join(migrationDir, `${table}.sql`);
        const insertStatements = generateInsertStatements(table, data);
        fs.writeFileSync(sqlPath, insertStatements);
        
        console.log(`✅ ${table}: ${data.length} records exported`);
      } else {
        console.log(`⚠️  ${table}: No data to export`);
      }
    }
    
    // Create database initialization script
    createInitScript(migrationDir);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📁 Check the migrations/ folder for exported data');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy to Render (database will be created automatically)');
    console.log('2. Use the SQL files in migrations/ to import your data');
    console.log('3. Or use the init script to set up the database structure');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await currentPool.end();
  }
}

function generateInsertStatements(table, data) {
  if (data.length === 0) return '';
  
  const columns = Object.keys(data[0]);
  let sql = `-- Migration script for ${table}\n`;
  sql += `-- Generated on ${new Date().toISOString()}\n\n`;
  
  data.forEach(row => {
    const values = columns.map(col => {
      const value = row[col];
      if (value === null) return 'NULL';
      if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
      if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
      return value;
    });
    
    sql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
  });
  
  return sql;
}

function createInitScript(migrationDir) {
  const initScript = `-- Database initialization script for Render
-- Run this after your database is created on Render

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS machinery (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  place_id INTEGER REFERENCES places(id),
  capacity DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS oil_data (
  id SERIAL PRIMARY KEY,
  machinery_id INTEGER REFERENCES machinery(id),
  date DATE NOT NULL,
  litres DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('consumption', 'refill', 'maintenance')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_oil_data_machinery_id ON oil_data(machinery_id);
CREATE INDEX IF NOT EXISTS idx_oil_data_date ON oil_data(date);
CREATE INDEX IF NOT EXISTS idx_machinery_place_id ON machinery(place_id);

-- Insert sample data (optional)
-- You can replace this with your actual data from the migration files

INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@example.com', '$2b$10$your_hashed_password_here', 'admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO places (name, location, description) VALUES 
('Main Site', 'Central Location', 'Primary construction site')
ON CONFLICT DO NOTHING;

-- After running this script, import your data using the SQL files in migrations/
-- Example: psql -h your-render-host -U nafta_user -d nafta_db -f migrations/places.sql
`;

  fs.writeFileSync(path.join(migrationDir, 'init_database.sql'), initScript);
  console.log('📝 Database initialization script created');
}

// Run migration if called directly
if (require.main === module) {
  migrateToRender();
}

module.exports = { migrateToRender };
