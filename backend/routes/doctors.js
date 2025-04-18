const express = require('express');
const router = express.Router();
const pool = require('../db');

/** GET /api/doctors - list all doctors */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM doctor ORDER BY doctorid');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/doctors - create a new doctor { name, specialization } */
router.post('/', async (req, res) => {
  try {
    const { name, specialization } = req.body;
    const insertRes = await pool.query(
      `INSERT INTO doctor (name, specialization) 
       VALUES ($1, $2) RETURNING *`,
      [name, specialization || null]  // specialization may be null
    );
    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/doctors/:id - delete a doctor (cascades to appointments and schedules via FK) */
router.delete('/:id', async (req, res) => {
  const doctorId = req.params.id;
  try {
    const result = await pool.query(`DELETE FROM doctor WHERE doctorid = $1`, [doctorId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    // Deleting a doctor will automatically cascade delete their appointments and schedules (per FK constraints)
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
