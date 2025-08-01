const database = require('../config/database');

async function checkDatabase() {
  try {
    await database.connect();
    
    console.log('🔍 Checking database structure...');
    
    // Check machinery table structure
    const machineryColumns = await database.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'machinery'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Machinery table structure:');
    machineryColumns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'} ${col.column_default ? `default: ${col.column_default}` : ''}`);
    });
    
    // Check if there are any places
    const placesCount = await database.query('SELECT COUNT(*) as count FROM places');
    console.log(`\n📍 Places count: ${placesCount.rows[0].count}`);
    
    if (placesCount.rows[0].count > 0) {
      const places = await database.query('SELECT id, name, location FROM places LIMIT 5');
      console.log('\n📍 Sample places:');
      places.rows.forEach(place => {
        console.log(`  ID: ${place.id}, Name: ${place.name}, Location: ${place.location || 'N/A'}`);
      });
    }
    
    // Check if there are any machinery
    const machineryCount = await database.query('SELECT COUNT(*) as count FROM machinery');
    console.log(`\n🔧 Machinery count: ${machineryCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    process.exit();
  }
}

checkDatabase(); 