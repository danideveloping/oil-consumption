const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Register route
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await database.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this username' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await database.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, role',
      [username, hashedPassword]
    );

    const newUser = result.rows[0];
    const token = generateToken({ id: newUser.id, username: newUser.username, role: newUser.role });
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: newUser.id, username: newUser.username, role: newUser.role }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Find user
    const result = await database.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 