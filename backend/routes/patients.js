const express = require('express');
const router = express.Router();
const pool = require('../db');

/** GET /api/patients 
 *  Returns a list of all patients. */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM patient ORDER BY patientid');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/patients 
 *  Creates a new patient record. Expects JSON { firstname, lastname, dob }. 
 *  patientid is auto-generated. */
router.post('/', async (req, res) => {
  try {
    const { firstname, lastname, dob } = req.body;
    const insertRes = await pool.query(
      `INSERT INTO patient (firstname, lastname, dob) 
       VALUES ($1, $2, $3) RETURNING *`,
      [firstname, lastname, dob]
    );
    res.status(201).json(insertRes.rows[0]);  // return the new patient record
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/patients/:id 
 *  Deletes a patient and all related data (appointments, etc.). */
router.delete('/:id', async (req, res) => {
  const patientId = req.params.id;
  try {
    // Remove all this patient's appointments first (cascade will remove related prescriptions, records, billing)
    await pool.query(`DELETE FROM appointment WHERE patientid = $1`, [patientId]);
    // Now delete the patient
    const result = await pool.query(`DELETE FROM patient WHERE patientid = $1`, [patientId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
