const express = require('express');
const router = express.Router();
const pool = require('../db');

/** GET /api/medicalrecords - list all medical records with patient & doctor info */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.recordid, m.diagnosis, m.treatment, m.patientid, m.appointmentid,
              p.firstname || ' ' || p.lastname AS patientname,
              d.name AS doctorname
         FROM medicalrecord m
         JOIN patient p ON p.patientid = m.patientid
         JOIN appointment a ON a.patientid = m.patientid AND a.appointmentid = m.appointmentid
         JOIN doctor d ON d.doctorid = a.doctorid
         ORDER BY m.recordid`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/medicalrecords 
 * Create a new medical record. Expects { patientid, appointmentid, diagnosis, treatment }. */
router.post('/', async (req, res) => {
  try {
    const { patientid, appointmentid, diagnosis, treatment } = req.body;
    const insertRes = await pool.query(
      `INSERT INTO medicalrecord (patientid, appointmentid, diagnosis, treatment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [patientid, appointmentid, diagnosis || null, treatment || null]
    );
    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23503') {  // foreign key error (invalid patient/appointment)
      return res.status(400).json({ error: 'Invalid patient or appointment reference' });
    }
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/medicalrecords/:id - delete a medical record by ID */
router.delete('/:id', async (req, res) => {
  const recordId = req.params.id;
  try {
    const result = await pool.query(`DELETE FROM medicalrecord WHERE recordid = $1`, [recordId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    res.json({ message: 'Medical record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
