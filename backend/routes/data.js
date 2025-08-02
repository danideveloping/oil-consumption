const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to add role-based date filtering
const addRoleBasedDateFiltering = (user, query, params, paramCount, hasYearFilter = false) => {
  // If user is not superadmin and no year filter is provided, restrict to current month only
  if (user.role !== 'superadmin' && !hasYearFilter) {
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
      type,
      year,
      month
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
    
    let params = [];
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
    
    // Add year and month filtering
    if (year && month) {
      paramCount++;
      query += ` AND TO_CHAR(od.date, 'YYYY-MM') = $${paramCount}`;
      params.push(`${year}-${month.padStart(2, '0')}`);
    } else if (year) {
      paramCount++;
      query += ` AND EXTRACT(YEAR FROM od.date) = $${paramCount}`;
      params.push(year);
    }
    
    // Apply role-based date filtering
    const filtered = addRoleBasedDateFiltering(req.user, query, params, paramCount, !!(year || month));
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
    
    let countParams = [];
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
    
    // Add year and month filtering for count
    if (year && month) {
      countParamCount++;
      countQuery += ` AND TO_CHAR(od.date, 'YYYY-MM') = $${countParamCount}`;
      countParams.push(`${year}-${month.padStart(2, '0')}`);
    } else if (year) {
      countParamCount++;
      countQuery += ` AND EXTRACT(YEAR FROM od.date) = $${countParamCount}`;
      countParams.push(year);
    }
    
    // Apply role-based date filtering to count query
    const countFiltered = addRoleBasedDateFiltering(req.user, countQuery, countParams, countParamCount, !!(year || month));
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
    
    let params = [];
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
    
    let params = [];
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
  body('date').isISO8601().withMessage('Valid date and time is required (YYYY-MM-DDTHH:mm:ss)'),
  body('litres').isFloat({ min: 0 }).withMessage('Litres must be a positive number'),
  body('type').optional().isIn(['consumption', 'refill', 'maintenance']).withMessage('Type must be consumption, refill, or maintenance')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { machinery_id, date, litres, type = 'consumption', notes } = req.body;

    // Verify machinery exists and get its capacity
    const machineryCheck = await database.query('SELECT id, capacity FROM machinery WHERE id = $1', [machinery_id]);
    
    if (machineryCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Machinery not found' });
    }

    const machinery = machineryCheck.rows[0];
    // Use the original capacity value as entered by the user (e.g., 50 instead of 49.90)
    const capacity = parseFloat(machinery.capacity) || 0;



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
  body('date').optional().isISO8601().withMessage('Valid date and time is required (YYYY-MM-DDTHH:mm:ss)'),
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

    // Get the current entry to check if we're updating a refill
    const currentEntry = await database.query('SELECT machinery_id, litres, type FROM oil_data WHERE id = $1', [id]);
    if (currentEntry.rows.length === 0) {
      return res.status(404).json({ message: 'Oil data entry not found' });
    }

    const currentEntryData = currentEntry.rows[0];
    const targetMachineryId = machinery_id || currentEntryData.machinery_id;
    const targetLitres = litres !== undefined ? litres : currentEntryData.litres;
    const targetType = type || currentEntryData.type;



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

// Get tank capacity analysis
router.get('/tank-analysis/:machinery_id', authenticateToken, async (req, res) => {
  try {
    const { machinery_id } = req.params;
    const { start_date, end_date } = req.query;
    
    // Get machinery details including capacity
    const machineryResult = await database.query(`
      SELECT m.*, p.name as place_name 
      FROM machinery m 
      LEFT JOIN places p ON m.place_id = p.id 
      WHERE m.id = $1
    `, [machinery_id]);
    
    if (machineryResult.rows.length === 0) {
      return res.status(404).json({ message: 'Machinery not found' });
    }
    
    const machinery = machineryResult.rows[0];
    const tankCapacity = machinery.capacity || 0;
    
    // Build date filter
    let dateFilter = '';
    let params = [machinery_id];
    let paramCount = 1;
    
    if (start_date) {
      paramCount++;
      dateFilter += ` AND od.date >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      dateFilter += ` AND od.date <= $${paramCount}`;
      params.push(end_date);
    }
    
    // Get all oil data for this machinery, ordered by date
    const oilDataResult = await database.query(`
      SELECT od.*, m.name as machinery_name, m.type as machinery_type, m.capacity
      FROM oil_data od
      JOIN machinery m ON od.machinery_id = m.id
      WHERE od.machinery_id = $1 ${dateFilter}
      ORDER BY od.date ASC, od.created_at ASC
    `, params);
    
    const oilData = oilDataResult.rows;
    
    // Analyze tank cycles (from refill to refill)
    const tankCycles = [];
    let currentCycle = {
      startDate: null,
      endDate: null,
      refillAmount: 0,
      consumptionAmount: 0,
      expectedConsumption: 0,
      actualConsumption: 0,
      discrepancy: 0,
      discrepancyPercentage: 0,
      entries: []
    };
    
    for (let i = 0; i < oilData.length; i++) {
      const entry = oilData[i];
      
      if (entry.type === 'refill') {
        // If we have a previous cycle, finalize it
        if (currentCycle.startDate && currentCycle.refillAmount > 0) {
          currentCycle.endDate = entry.date;
          currentCycle.actualConsumption = currentCycle.consumptionAmount;
          currentCycle.expectedConsumption = currentCycle.refillAmount;
          currentCycle.discrepancy = currentCycle.actualConsumption - currentCycle.expectedConsumption;
          currentCycle.discrepancyPercentage = currentCycle.expectedConsumption > 0 
            ? (currentCycle.discrepancy / currentCycle.expectedConsumption) * 100 
            : 0;
          
          tankCycles.push({ ...currentCycle });
        }
        
        // Start new cycle
        currentCycle = {
          startDate: entry.date,
          endDate: null,
          refillAmount: entry.litres,
          consumptionAmount: 0,
          expectedConsumption: 0,
          actualConsumption: 0,
          discrepancy: 0,
          discrepancyPercentage: 0,
          entries: [entry]
        };
      } else if (entry.type === 'consumption') {
        currentCycle.consumptionAmount += entry.litres;
        currentCycle.entries.push(entry);
      }
    }
    
    // Handle the last cycle if it doesn't end with a refill
    if (currentCycle.startDate && currentCycle.refillAmount > 0) {
      currentCycle.actualConsumption = currentCycle.consumptionAmount;
      currentCycle.expectedConsumption = currentCycle.refillAmount;
      currentCycle.discrepancy = currentCycle.actualConsumption - currentCycle.expectedConsumption;
      currentCycle.discrepancyPercentage = currentCycle.expectedConsumption > 0 
        ? (currentCycle.discrepancy / currentCycle.expectedConsumption) * 100 
        : 0;
      
      tankCycles.push(currentCycle);
    }
    
    // Calculate current tank status
    let currentTankLevel = tankCapacity;
    let lastRefillDate = null;
    let lastRefillAmount = 0;
    
    // Find the last refill
    for (let i = oilData.length - 1; i >= 0; i--) {
      if (oilData[i].type === 'refill') {
        lastRefillDate = oilData[i].date;
        lastRefillAmount = oilData[i].litres;
        break;
      }
    }
    
    // Calculate consumption since last refill
    let consumptionSinceLastRefill = 0;
    if (lastRefillDate) {
      for (let i = 0; i < oilData.length; i++) {
        if (oilData[i].date >= lastRefillDate && oilData[i].type === 'consumption') {
          consumptionSinceLastRefill += oilData[i].litres;
        }
      }
    }
    
    currentTankLevel = lastRefillAmount - consumptionSinceLastRefill;
    if (currentTankLevel < 0) currentTankLevel = 0;
    
    // Calculate overall statistics
    const totalRefills = oilData.filter(d => d.type === 'refill').length;
    const totalConsumption = oilData.filter(d => d.type === 'consumption').reduce((sum, d) => sum + d.litres, 0);
    const totalRefillAmount = oilData.filter(d => d.type === 'refill').reduce((sum, d) => sum + d.litres, 0);
    const overallDiscrepancy = totalConsumption - totalRefillAmount;
    const overallDiscrepancyPercentage = totalRefillAmount > 0 ? (overallDiscrepancy / totalRefillAmount) * 100 : 0;
    
    res.json({
      machinery: {
        id: machinery.id,
        name: machinery.name,
        type: machinery.type,
        capacity: machinery.capacity,
        place_name: machinery.place_name
      },
      tankCapacity,
      currentTankLevel,
      lastRefillDate,
      lastRefillAmount,
      consumptionSinceLastRefill,
      remainingCapacity: tankCapacity - currentTankLevel,
      tankCycles,
      statistics: {
        totalRefills,
        totalConsumption,
        totalRefillAmount,
        overallDiscrepancy,
        overallDiscrepancyPercentage,
        averageDiscrepancy: tankCycles.length > 0 
          ? tankCycles.reduce((sum, cycle) => sum + cycle.discrepancy, 0) / tankCycles.length 
          : 0,
        averageDiscrepancyPercentage: tankCycles.length > 0 
          ? tankCycles.reduce((sum, cycle) => sum + cycle.discrepancyPercentage, 0) / tankCycles.length 
          : 0
      }
    });
    
  } catch (error) {
    console.error('Error in tank analysis:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get central tank analysis (static tank that supplies all machinery)
router.get('/central-tank-analysis', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Build date filter
    let dateFilter = '';
    let params = [];
    let paramCount = 0;
    
    if (start_date) {
      paramCount++;
      dateFilter += ` AND od.date >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      dateFilter += ` AND od.date <= $${paramCount}`;
      params.push(end_date);
    }
    
    // Get all oil data, ordered by date
    const oilDataResult = await database.query(`
      SELECT od.*, m.name as machinery_name, m.type as machinery_type, m.capacity as machinery_capacity,
             p.name as place_name
      FROM oil_data od
      JOIN machinery m ON od.machinery_id = m.id
      LEFT JOIN places p ON m.place_id = p.id
      WHERE 1=1 ${dateFilter}
      ORDER BY od.date ASC, od.created_at ASC
    `, params);
    
    const oilData = oilDataResult.rows;
    
    // Debug: Log the data we're working with
    console.log('Central Tank Analysis - Total oil data entries:', oilData.length);
    console.log('Central Tank Analysis - Data types found:', [...new Set(oilData.map(d => d.type))]);
    console.log('Central Tank Analysis - Sample data:', oilData.slice(0, 3));
    
    // Debug: Check if we have any refill entries
    const refillEntries = oilData.filter(d => d.type === 'refill');
    console.log('Central Tank Analysis - Refill entries found:', refillEntries.length);
    if (refillEntries.length > 0) {
      console.log('Central Tank Analysis - Sample refill entry:', refillEntries[0]);
    }
    
    // Analyze central tank cycles (from refill to refill)
    const centralTankCycles = [];
    let currentCycle = {
      startDate: null,
      endDate: null,
      refillAmount: 0,
      totalConsumption: 0,
      machineryConsumption: {},
      expectedConsumption: 0,
      actualConsumption: 0,
      discrepancy: 0,
      discrepancyPercentage: 0,
      entries: []
    };
    
    for (let i = 0; i < oilData.length; i++) {
      const entry = oilData[i];
      
      if (entry.type === 'refill') {
        // If we have a previous cycle, finalize it
        if (currentCycle.startDate && currentCycle.refillAmount > 0) {
          currentCycle.endDate = entry.date;
          currentCycle.actualConsumption = currentCycle.totalConsumption;
          currentCycle.expectedConsumption = currentCycle.refillAmount;
          currentCycle.discrepancy = currentCycle.actualConsumption - currentCycle.expectedConsumption;
          currentCycle.discrepancyPercentage = currentCycle.expectedConsumption > 0 
            ? (currentCycle.discrepancy / currentCycle.expectedConsumption) * 100 
            : 0;
          
          centralTankCycles.push({ ...currentCycle });
        }
        
        // Start new cycle
        currentCycle = {
          startDate: entry.date,
          endDate: null,
          refillAmount: entry.litres,
          totalConsumption: 0,
          machineryConsumption: {},
          expectedConsumption: 0,
          actualConsumption: 0,
          discrepancy: 0,
          discrepancyPercentage: 0,
          entries: [entry]
        };
             } else if (entry.type === 'consumption') {
         currentCycle.totalConsumption += parseFloat(entry.litres) || 0;
        
        // Track consumption by machinery
        if (!currentCycle.machineryConsumption[entry.machinery_id]) {
          currentCycle.machineryConsumption[entry.machinery_id] = {
            machinery_name: entry.machinery_name,
            machinery_type: entry.machinery_type,
            place_name: entry.place_name,
            consumption: 0
          };
        }
                 currentCycle.machineryConsumption[entry.machinery_id].consumption += parseFloat(entry.litres) || 0;
        
        currentCycle.entries.push(entry);
      }
    }
    
    // Handle the last cycle if it doesn't end with a refill
    if (currentCycle.startDate && currentCycle.refillAmount > 0) {
      currentCycle.actualConsumption = currentCycle.totalConsumption;
      currentCycle.expectedConsumption = currentCycle.refillAmount;
      currentCycle.discrepancy = currentCycle.actualConsumption - currentCycle.expectedConsumption;
      currentCycle.discrepancyPercentage = currentCycle.expectedConsumption > 0 
        ? (currentCycle.discrepancy / currentCycle.expectedConsumption) * 100 
        : 0;
      
      centralTankCycles.push(currentCycle);
    }
    
    // Calculate current central tank status
    let lastRefillDate = null;
    let lastRefillAmount = 0;
    let consumptionSinceLastRefill = 0;
    
    // Find the last refill (for central tank, we consider all refills as central tank refills)
    for (let i = oilData.length - 1; i >= 0; i--) {
      if (oilData[i].type === 'refill') {
        lastRefillDate = oilData[i].date;
        lastRefillAmount = parseFloat(oilData[i].litres) || 0;
        break;
      }
    }
    
         // Calculate consumption since last refill (all consumption affects central tank)
     if (lastRefillDate) {
       for (let i = 0; i < oilData.length; i++) {
         if (oilData[i].date >= lastRefillDate && oilData[i].type === 'consumption') {
           consumptionSinceLastRefill += parseFloat(oilData[i].litres) || 0;
         }
       }
     }
    
    const currentTankLevel = Math.max(0, lastRefillAmount - consumptionSinceLastRefill);
    
    // Debug: Log central tank calculations
    console.log('Central Tank Analysis - Last refill date:', lastRefillDate);
    console.log('Central Tank Analysis - Last refill amount:', lastRefillAmount);
    console.log('Central Tank Analysis - Consumption since last refill:', consumptionSinceLastRefill);
    console.log('Central Tank Analysis - Current tank level:', currentTankLevel);
    
    // Calculate overall statistics
    const totalRefills = oilData.filter(d => d.type === 'refill').length;
    const totalConsumption = oilData.filter(d => d.type === 'consumption').reduce((sum, d) => sum + (parseFloat(d.litres) || 0), 0);
    const totalRefillAmount = oilData.filter(d => d.type === 'refill').reduce((sum, d) => sum + (parseFloat(d.litres) || 0), 0);
    const overallDiscrepancy = totalConsumption - totalRefillAmount;
    const overallDiscrepancyPercentage = totalRefillAmount > 0 ? (overallDiscrepancy / totalRefillAmount) * 100 : 0;
    
    // Get machinery summary
    const machinerySummary = {};
    oilData.forEach(entry => {
      if (entry.type === 'consumption') {
        if (!machinerySummary[entry.machinery_id]) {
          machinerySummary[entry.machinery_id] = {
            id: entry.machinery_id,
            name: entry.machinery_name,
            type: entry.machinery_type,
            place_name: entry.place_name,
            capacity: entry.machinery_capacity,
            totalConsumption: 0,
            refillCount: 0,
            currentLevel: 0
          };
        }
        machinerySummary[entry.machinery_id].totalConsumption += parseFloat(entry.litres) || 0;
      } else if (entry.type === 'refill') {
        if (!machinerySummary[entry.machinery_id]) {
          machinerySummary[entry.machinery_id] = {
            id: entry.machinery_id,
            name: entry.machinery_name,
            type: entry.machinery_type,
            place_name: entry.place_name,
            capacity: entry.machinery_capacity,
            totalConsumption: 0,
            refillCount: 0,
            currentLevel: 0
          };
        }
        machinerySummary[entry.machinery_id].refillCount += 1;
        machinerySummary[entry.machinery_id].currentLevel += parseFloat(entry.litres) || 0;
      }
    });
    
    // Calculate current levels for each machinery
    Object.values(machinerySummary).forEach(machinery => {
      // Find consumption since last refill for this machinery
      let consumptionSinceLastRefill = 0;
      let lastRefillForMachinery = null;
      
      for (let i = oilData.length - 1; i >= 0; i--) {
        if (oilData[i].machinery_id === machinery.id) {
          if (oilData[i].type === 'refill') {
            lastRefillForMachinery = oilData[i].date;
            break;
          }
        }
      }
      
      if (lastRefillForMachinery) {
        for (let i = 0; i < oilData.length; i++) {
          if (oilData[i].machinery_id === machinery.id && 
              oilData[i].date >= lastRefillForMachinery && 
              oilData[i].type === 'consumption') {
            consumptionSinceLastRefill += parseFloat(oilData[i].litres) || 0;
          }
        }
      }
      
      machinery.currentLevel = Math.max(0, machinery.currentLevel - consumptionSinceLastRefill);
    });
    
    // Debug: Log the final results
    console.log('Central Tank Analysis - Cycles created:', centralTankCycles.length);
    console.log('Central Tank Analysis - Machinery summary entries:', Object.values(machinerySummary).length);
    console.log('Central Tank Analysis - Total refills:', totalRefills);
    console.log('Central Tank Analysis - Total consumption:', totalConsumption);
    
    res.json({
      centralTank: {
        lastRefillDate,
        lastRefillAmount,
        currentTankLevel,
        consumptionSinceLastRefill,
        remainingCapacity: lastRefillAmount - consumptionSinceLastRefill
      },
      centralTankCycles,
      machinerySummary: Object.values(machinerySummary),
      statistics: {
        totalRefills,
        totalConsumption,
        totalRefillAmount,
        overallDiscrepancy,
        overallDiscrepancyPercentage,
        averageDiscrepancy: centralTankCycles.length > 0 
          ? centralTankCycles.reduce((sum, cycle) => sum + cycle.discrepancy, 0) / centralTankCycles.length 
          : 0,
        averageDiscrepancyPercentage: centralTankCycles.length > 0 
          ? centralTankCycles.reduce((sum, cycle) => sum + cycle.discrepancyPercentage, 0) / centralTankCycles.length 
          : 0
      }
    });
    
  } catch (error) {
    console.error('Error in central tank analysis:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router; 