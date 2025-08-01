const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to add role-based date filtering
const addRoleBasedDateFiltering = (user, query, params, paramCount) => {
  // If user is not superadmin, restrict to current month only
  if (user.role !== 'superadmin') {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    
    // Add current month filtering
    paramCount++;
    query += ` AND EXTRACT(YEAR FROM od.date) = $${paramCount}`;
    params.push(currentYear);
    
    paramCount++;
    query += ` AND EXTRACT(MONTH FROM od.date) = $${paramCount}`;
    params.push(currentMonth);
  }
  
  return { query, params, paramCount };
};

// Get all oil data with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      machinery_id, 
      start_date, 
      end_date, 
      type 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT od.*, m.name as machinery_name, m.type as machinery_type, 
             p.name as place_name, p.location as place_location
      FROM oil_data od
      JOIN machinery m ON od.machinery_id = m.id
      LEFT JOIN places p ON m.place_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (machinery_id) {
      paramCount++;
      query += ` AND od.machinery_id = $${paramCount}`;
      params.push(machinery_id);
    }
    
    if (start_date) {
      paramCount++;
      query += ` AND od.date >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      query += ` AND od.date <= $${paramCount}`;
      params.push(end_date);
    }
    
    if (type) {
      paramCount++;
      query += ` AND od.type = $${paramCount}`;
      params.push(type);
    }
    
    // Apply role-based date filtering
    const filtered = addRoleBasedDateFiltering(req.user, query, params, paramCount);
    query = filtered.query;
    params = filtered.params;
    paramCount = filtered.paramCount;
    
    paramCount++;
    query += ` ORDER BY od.date DESC, od.created_at DESC LIMIT $${paramCount}`;
    params.push(parseInt(limit));
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset));
    
    const result = await database.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM oil_data od
      JOIN machinery m ON od.machinery_id = m.id
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 0;
    
    if (machinery_id) {
      countParamCount++;
      countQuery += ` AND od.machinery_id = $${countParamCount}`;
      countParams.push(machinery_id);
    }
    
    if (start_date) {
      countParamCount++;
      countQuery += ` AND od.date >= $${countParamCount}`;
      countParams.push(start_date);
    }
    
    if (end_date) {
      countParamCount++;
      countQuery += ` AND od.date <= $${countParamCount}`;
      countParams.push(end_date);
    }
    
    if (type) {
      countParamCount++;
      countQuery += ` AND od.type = $${countParamCount}`;
      countParams.push(type);
    }
    
    // Apply role-based date filtering to count query
    const countFiltered = addRoleBasedDateFiltering(req.user, countQuery, countParams, countParamCount);
    countQuery = countFiltered.query;
    countParams = countFiltered.params;
    
    const countResult = await database.query(countQuery, countParams);
    
    res.json({
      data: result.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(countResult.rows[0].total / limit),
        total_records: parseInt(countResult.rows[0].total),
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching oil data:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get daily summary
router.get('/daily', authenticateToken, async (req, res) => {
  try {
    const { date, machinery_id } = req.query;
    
    let query = `
      SELECT 
        od.date,
        od.machinery_id,
        m.name as machinery_name,
        m.type as machinery_type,
        p.name as place_name,
        SUM(od.litres) as total_litres,
        COUNT(*) as record_count,
        od.type
      FROM oil_data od
      JOIN machinery m ON od.machinery_id = m.id
      LEFT JOIN places p ON m.place_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (date) {
      paramCount++;
      query += ` AND od.date = $${paramCount}`;
      params.push(date);
    }
    
    if (machinery_id) {
      paramCount++;
      query += ` AND od.machinery_id = $${paramCount}`;
      params.push(machinery_id);
    }
    
    // Apply role-based date filtering
    const filtered = addRoleBasedDateFiltering(req.user, query, params, paramCount);
    query = filtered.query;
    params = filtered.params;
    
    query += ` GROUP BY od.date, od.machinery_id, od.type, m.name, m.type, p.name ORDER BY od.date DESC`;
    
    const result = await database.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching daily data:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get monthly summary
router.get('/monthly', authenticateToken, async (req, res) => {
  try {
    const { year, month, machinery_id } = req.query;
    
    let query = `
      SELECT 
        TO_CHAR(od.date, 'YYYY-MM') as month,
        od.machinery_id,
        m.name as machinery_name,
        m.type as machinery_type,
        p.name as place_name,
        SUM(od.litres) as total_litres,
        COUNT(*) as record_count,
        AVG(od.litres) as avg_daily_litres,
        od.type
      FROM oil_data od
      JOIN machinery m ON od.machinery_id = m.id
      LEFT JOIN places p ON m.place_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (year && month) {
      paramCount++;
      query += ` AND TO_CHAR(od.date, 'YYYY-MM') = $${paramCount}`;
      params.push(`${year}-${month.padStart(2, '0')}`);
    } else if (year) {
      paramCount++;
      query += ` AND EXTRACT(YEAR FROM od.date) = $${paramCount}`;
      params.push(year);
    }
    
    if (machinery_id) {
      paramCount++;
      query += ` AND od.machinery_id = $${paramCount}`;
      params.push(machinery_id);
    }
    
    // Apply role-based date filtering
    const filtered = addRoleBasedDateFiltering(req.user, query, params, paramCount);
    query = filtered.query;
    params = filtered.params;
    
    query += ` GROUP BY TO_CHAR(od.date, 'YYYY-MM'), od.machinery_id, od.type, m.name, m.type, p.name ORDER BY month DESC`;
    
    const result = await database.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Create new oil data entry
router.post('/', [
  authenticateToken,
  body('machinery_id').isInt({ min: 1 }).withMessage('Valid machinery ID is required'),
  body('date').isISO8601().withMessage('Valid date is required (YYYY-MM-DD)'),
  body('litres').isFloat({ min: 0 }).withMessage('Litres must be a positive number'),
  body('type').optional().isIn(['consumption', 'refill', 'maintenance']).withMessage('Type must be consumption, refill, or maintenance')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { machinery_id, date, litres, type = 'consumption', notes } = req.body;

    // Verify machinery exists
    const machineryCheck = await database.query('SELECT id FROM machinery WHERE id = $1', [machinery_id]);
    
    if (machineryCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Machinery not found' });
    }

    const result = await database.query(
      'INSERT INTO oil_data (machinery_id, date, litres, type, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [machinery_id, date, litres, type, notes || null]
    );

    const dataId = result.rows[0].id;
    
    // Return the created entry with machinery details
    const createdData = await database.query(`
      SELECT od.*, m.name as machinery_name, m.type as machinery_type,
             p.name as place_name, p.location as place_location
      FROM oil_data od
      JOIN machinery m ON od.machinery_id = m.id
      LEFT JOIN places p ON m.place_id = p.id
      WHERE od.id = $1
    `, [dataId]);
    
    res.status(201).json(createdData.rows[0]);
  } catch (error) {
    console.error('Error creating oil data entry:', error);
    res.status(500).json({ message: 'Error creating oil data entry' });
  }
});

// Update oil data entry
router.put('/:id', [
  authenticateToken,
  body('machinery_id').optional().isInt({ min: 1 }).withMessage('Valid machinery ID is required'),
  body('date').optional().isISO8601().withMessage('Valid date is required (YYYY-MM-DD)'),
  body('litres').optional().isFloat({ min: 0 }).withMessage('Litres must be a positive number'),
  body('type').optional().isIn(['consumption', 'refill', 'maintenance']).withMessage('Type must be consumption, refill, or maintenance')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { machinery_id, date, litres, type, notes } = req.body;

    const result = await database.query(
      'UPDATE oil_data SET machinery_id = $1, date = $2, litres = $3, type = $4, notes = $5 WHERE id = $6',
      [machinery_id, date, litres, type, notes || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Oil data entry not found' });
    }

    // Return the updated entry
    const updatedData = await database.query(`
      SELECT od.*, m.name as machinery_name, m.type as machinery_type,
             p.name as place_name, p.location as place_location
      FROM oil_data od
      JOIN machinery m ON od.machinery_id = m.id
      LEFT JOIN places p ON m.place_id = p.id
      WHERE od.id = $1
    `, [id]);
    
    res.json(updatedData.rows[0]);
  } catch (error) {
    console.error('Error updating oil data entry:', error);
    res.status(500).json({ message: 'Error updating oil data entry' });
  }
});

// Delete oil data entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await database.query('DELETE FROM oil_data WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Oil data entry not found' });
    }

    res.json({ message: 'Oil data entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting oil data entry:', error);
    res.status(500).json({ message: 'Error deleting oil data entry' });
  }
});

module.exports = router; 