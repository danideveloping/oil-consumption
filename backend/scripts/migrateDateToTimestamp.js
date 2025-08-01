const database = require('../config/database');

async function migrateDateToTimestamp() {
  try {
    console.log('Starting migration: DATE to TIMESTAMP...');
    
    // Connect to database
    await database.connect();
    
    // Step 1: Add a new timestamp column
    console.log('Step 1: Adding new timestamp column...');
    await database.query(`
      ALTER TABLE oil_data 
      ADD COLUMN date_timestamp TIMESTAMP;
    `);
    
    // Step 2: Convert existing date data to timestamp (set to midnight)
    console.log('Step 2: Converting existing date data...');
    await database.query(`
      UPDATE oil_data 
      SET date_timestamp = date::timestamp 
      WHERE date_timestamp IS NULL;
    `);
    
    // Step 3: Drop the old date column
    console.log('Step 3: Dropping old date column...');
    await database.query(`
      ALTER TABLE oil_data 
      DROP COLUMN date;
    `);
    
    // Step 4: Rename the new column to 'date'
    console.log('Step 4: Renaming new column to date...');
    await database.query(`
      ALTER TABLE oil_data 
      RENAME COLUMN date_timestamp TO date;
    `);
    
    // Step 5: Make the column NOT NULL
    console.log('Step 5: Making date column NOT NULL...');
    await database.query(`
      ALTER TABLE oil_data 
      ALTER COLUMN date SET NOT NULL;
    `);
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await database.close();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateDateToTimestamp()
    .then(() => {
      console.log('Migration script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateDateToTimestamp; 