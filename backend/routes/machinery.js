const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all machinery
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await database.query(`
      SELECT m.*, p.name as place_name, p.location as place_location 
      FROM machinery m 
      LEFT JOIN places p ON m.place_id = p.id 
      ORDER BY m.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching machinery:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get machinery by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await database.query(`
      SELECT m.*, p.name as place_name, p.location as place_location 
      FROM machinery m 
      LEFT JOIN places p ON m.place_id = p.id 
      WHERE m.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Machinery not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching machinery:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Create new machinery
router.post('/', [
  authenticateToken,
  body('name').notEmpty().withMessage('Machinery name is required'),
  body('type').optional(),
  body('place_id').notEmpty().withMessage('Place ID is required').isInt({ min: 1 }).withMessage('Place ID must be a valid integer'),
  body('capacity').optional().isFloat({ min: 0 }).withMessage('Capacity must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, place_id, capacity, description } = req.body;
    
    console.log('Creating machinery with data:', { name, type, place_id, capacity, description });
    console.log('Data types:', { 
      name: typeof name, 
      type: typeof type, 
      place_id: typeof place_id, 
      capacity: typeof capacity, 
      description: typeof description 
    });

    // Check if place exists if place_id is provided
    if (place_id) {
      const placeCheck = await database.query('SELECT id FROM places WHERE id = $1', [place_id]);
      if (placeCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Selected place does not exist' });
      }
    }

    const result = await database.query(
      'INSERT INTO machinery (name, type, place_id, capacity, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, type || null, place_id || null, capacity || null, description || null]
    );

    const machineryId = result.rows[0].id;
    
    // Return the created machinery with place details
    const createdMachinery = await database.query(`
      SELECT m.*, p.name as place_name, p.location as place_location 
      FROM machinery m 
      LEFT JOIN places p ON m.place_id = p.id 
      WHERE m.id = $1
    `, [machineryId]);
    
    console.log('Machinery created successfully:', createdMachinery.rows[0]);
    res.status(201).json(createdMachinery.rows[0]);
  } catch (error) {
    console.error('Error creating machinery:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Error creating machinery', details: error.message });
  }
});

// Update machinery
router.put('/:id', [
  authenticateToken,
  body('name').optional().notEmpty().withMessage('Machinery name cannot be empty'),
  body('type').optional(),
  body('place_id').optional().isInt({ min: 1 }).withMessage('Place ID must be a valid integer'),
  body('capacity').optional().isFloat({ min: 0 }).withMessage('Capacity must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, type, place_id, capacity, description } = req.body;

    const result = await database.query(
      'UPDATE machinery SET name = $1, type = $2, place_id = $3, capacity = $4, description = $5 WHERE id = $6',
      [name, type || null, place_id || null, capacity || null, description || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Machinery not found' });
    }

    // Return the updated machinery with place details
    const updatedMachinery = await database.query(`
      SELECT m.*, p.name as place_name, p.location as place_location 
      FROM machinery m 
      LEFT JOIN places p ON m.place_id = p.id 
      WHERE m.id = $1
    `, [id]);
    
    res.json(updatedMachinery.rows[0]);
  } catch (error) {
    console.error('Error updating machinery:', error);
    res.status(500).json({ message: 'Error updating machinery' });
  }
});

// Delete machinery
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await database.query('DELETE FROM machinery WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Machinery not found' });
    }

    res.json({ message: 'Machinery deleted successfully' });
  } catch (error) {
    console.error('Error deleting machinery:', error);
    res.status(500).json({ message: 'Error deleting machinery' });
  }
});

module.exports = router; 