const database = require('../config/database');

async function clearDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    // Clear all data from tables (in reverse order of dependencies)
    const tables = [
      'oil_data',
      'machinery', 
      'places',
      'users'
    ];
    
    for (const table of tables) {
      console.log(`Clearing table: ${table}`);
      await database.query(`DELETE FROM ${table}`);
      console.log(`✓ Cleared ${table}`);
    }
    
    // Reset auto-increment sequences
    console.log('Resetting auto-increment sequences...');
    await database.query("SELECT setval('users_id_seq', 1, false)");
    await database.query("SELECT setval('places_id_seq', 1, false)");
    await database.query("SELECT setval('machinery_id_seq', 1, false)");
    await database.query("SELECT setval('oil_data_id_seq', 1, false)");
    console.log('✓ Reset all sequences');
    
    console.log('Database cleanup completed successfully!');
    console.log('All data has been cleared. You can now start fresh.');
    
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await database.end();
  }
}

clearDatabase(); 