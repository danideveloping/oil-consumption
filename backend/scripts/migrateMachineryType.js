const database = require('../config/database');

async function migrateMachineryType() {
  try {
    await database.connect();
    
    console.log('🔧 Starting machinery type migration...');
    
    // Check if the type column is currently NOT NULL
    const checkResult = await database.query(`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'machinery' AND column_name = 'type'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Machinery table or type column not found!');
      return;
    }
    
    const columnInfo = checkResult.rows[0];
    console.log(`Current type column: ${columnInfo.column_name}, nullable: ${columnInfo.is_nullable}`);
    
    if (columnInfo.is_nullable === 'NO') {
      console.log('🔄 Making type column nullable...');
      
      // Make the type column nullable
      await database.query(`
        ALTER TABLE machinery 
        ALTER COLUMN type DROP NOT NULL
      `);
      
      console.log('✅ Type column is now nullable!');
    } else {
      console.log('✅ Type column is already nullable!');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrateMachineryType(); 