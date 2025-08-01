const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all places
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await database.query('SELECT * FROM places ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get place by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await database.query('SELECT * FROM places WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Place not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching place:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Create new place
router.post('/', [
  authenticateToken,
  body('name').notEmpty().withMessage('Place name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, location, description } = req.body;

    const result = await database.query(
      'INSERT INTO places (name, location, description) VALUES ($1, $2, $3) RETURNING *',
      [name, location || null, description || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating place:', error);
    res.status(500).json({ message: 'Error creating place' });
  }
});

// Update place
router.put('/:id', [
  authenticateToken,
  body('name').optional().notEmpty().withMessage('Place name cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, location, description } = req.body;

    const result = await database.query(
      'UPDATE places SET name = $1, location = $2, description = $3 WHERE id = $4 RETURNING *',
      [name, location || null, description || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating place:', error);
    res.status(500).json({ message: 'Error updating place' });
  }
});

// Delete place
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if place is referenced by any machinery
    const machineryCheck = await database.query('SELECT COUNT(*) as count FROM machinery WHERE place_id = $1', [id]);

    if (parseInt(machineryCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete place as it is referenced by machinery. Please reassign or delete the machinery first.' 
      });
    }

    // Delete the place
    const result = await database.query('DELETE FROM places WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.json({ message: 'Place deleted successfully' });
  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(500).json({ message: 'Error deleting place' });
  }
});

// Get machinery for a specific place
router.get('/:id/machinery', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await database.query('SELECT * FROM machinery WHERE place_id = $1 ORDER BY created_at DESC', [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching machinery for place:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router; 