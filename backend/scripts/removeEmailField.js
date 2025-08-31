const database = require('../config/database');

async function removeEmailField() {
  try {
    console.log('🗑️ Removing email field from users table...');
    
    // Connect to database
    await database.connect();
    
    // Remove email column from users table
    console.log('📝 Dropping email column...');
    await database.query('ALTER TABLE users DROP COLUMN IF EXISTS email');
    
    // Update any existing users to ensure username is unique
    console.log('🔍 Checking for duplicate usernames...');
    const duplicateCheck = await database.query(`
      SELECT username, COUNT(*) 
      FROM users 
      GROUP BY username 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateCheck.rows.length > 0) {
      console.log('⚠️ Found duplicate usernames, keeping only the first occurrence:');
      duplicateCheck.rows.forEach(row => {
        console.log(`  - ${row.username}: ${row.count} occurrences`);
      });
      
      // Keep only the first occurrence of each username
      await database.query(`
        DELETE FROM users 
        WHERE id NOT IN (
          SELECT DISTINCT ON (username) id 
          FROM users 
          ORDER BY username, created_at
        )
      `);
      console.log('✅ Duplicate usernames resolved');
    }
    
    // Ensure username column is unique
    console.log('🔒 Adding unique constraint to username...');
    try {
      await database.query('ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username)');
      console.log('✅ Username unique constraint added');
    } catch (error) {
      if (error.code === '42710') {
        console.log('ℹ️ Username unique constraint already exists');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Email field removal completed successfully!');
    console.log('📊 Users table now has: id, username, password, role, created_at');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing email field:', error.message);
    process.exit(1);
  }
}

removeEmailField();
