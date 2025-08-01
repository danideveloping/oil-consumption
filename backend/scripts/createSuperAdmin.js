const bcrypt = require('bcryptjs');
const database = require('../config/database');

async function createSuperAdmin() {
  try {
    await database.connect();
    
    // Prompt for user details
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => {
      return new Promise((resolve) => {
        rl.question(prompt, resolve);
      });
    };

    console.log('🔐 Creating SuperAdmin User');
    console.log('==========================');
    
    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password: ');

    if (!username || !email || !password) {
      console.log('❌ All fields are required!');
      rl.close();
      return;
    }

    // Check if user already exists
    const existingUser = await database.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ User already exists with this email or username!');
      rl.close();
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert superadmin user
    const result = await database.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, 'superadmin']
    );

    const newUser = result.rows[0];
    
    console.log('✅ SuperAdmin user created successfully!');
    console.log('👤 User Details:');
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Username: ${newUser.username}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Role: ${newUser.role}`);
    console.log('');
    console.log('🚀 You can now login with these credentials.');

    rl.close();
  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
  } finally {
    process.exit();
  }
}

createSuperAdmin(); 