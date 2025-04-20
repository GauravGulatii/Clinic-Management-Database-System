const express = require('express');
const router = express.Router();
const pool = require('../db');  // PostgreSQL connection pool

// GET /api/staff?name=<fullName> - optional query to find by name
// GET /api/staff - get all staff if no query provided
router.get('/', async (req, res) => {
  try {
    const { name } = req.query;
    if (name) {
      // Find staff by full name (case-insensitive match)
      const result = await pool.query(
        'SELECT staffid, name FROM clinicstaff WHERE LOWER(name) = LOWER($1)',
        [name]
      );
      return res.json(result.rows);
    } else {
      // Return all staff
      const result = await pool.query('SELECT staffid, name FROM clinicstaff');
      res.json(result.rows);
    }
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/staff/:id - get a specific staff by staffID
router.get('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    const result = await pool.query(
      'SELECT staffid, name FROM clinicstaff WHERE staffid = $1',
      [staffId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching staff by ID:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/** POST /api/staff
 *  Add a new staff with a single `name` field.
 *  Returns { staffid, name } on success.
 */
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      `INSERT INTO clinicstaff (name)
       VALUES ($1)
       RETURNING staffid, name`,
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating staff:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/** DELETE /api/staff/:id
 *  Delete a staff record by ID.
 */
router.delete('/:id', async (req, res) => {
  try {
    const staffId = parseInt(req.params.id, 10);
    const result = await pool.query(
      `DELETE FROM clinicstaff
       WHERE staffid = $1`,
      [staffId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    console.error('Error deleting staff:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
