const database = require('../config/database');

async function initializeDatabase() {
  try {
    console.log('Initializing PostgreSQL database...');
    console.log('Connecting to database and creating tables...');
    
    // Connect to database and create tables
    await database.connect();
    
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created/verified:');
    console.log('  - users (authentication)');
    console.log('  - places (locations)');
    console.log('  - machinery (equipment)');
    console.log('  - oil_data (consumption tracking)');
    console.log('');
    console.log('🚀 Your oil tank management system is ready!');
    console.log('Start the application with: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Verify database credentials in .env file');
    console.log('3. Ensure the database exists in pgAdmin');
    console.log('4. Check network connectivity to PostgreSQL');
    
    process.exit(1);
  }
}

initializeDatabase(); 