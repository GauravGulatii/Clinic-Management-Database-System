const express = require('express');
const router = express.Router();
const pool = require('../db');

/** GET /api/prescriptions - list all prescriptions with patient & doctor info */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pr.prescriptionid, pr.medication, pr.dosage, pr.patientid, pr.appointmentid,
              p.firstname || ' ' || p.lastname AS patientname,
              d.name AS doctorname
         FROM prescription pr
         JOIN patient p ON p.patientid = pr.patientid
         JOIN appointment a ON a.patientid = pr.patientid AND a.appointmentid = pr.appointmentid
         JOIN doctor d ON d.doctorid = a.doctorid
         ORDER BY pr.prescriptionid`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/prescriptions 
 * Create a new prescription. Expects { patientid, appointmentid, medication, dosage }. */
router.post('/', async (req, res) => {
  try {
    const { patientid, appointmentid, medication, dosage } = req.body;
    const insertRes = await pool.query(
      `INSERT INTO prescription (patientid, appointmentid, medication, dosage)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [patientid, appointmentid, medication, dosage || null]
    );
    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    // If foreign key violation (e.g., invalid patientid/appointmentid combo), send 400
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Invalid patient or appointment reference' });
    }
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/prescriptions/:id - delete a prescription by ID */
router.delete('/:id', async (req, res) => {
  const prescriptionId = req.params.id;
  try {
    const result = await pool.query(`DELETE FROM prescription WHERE prescriptionid = $1`, [prescriptionId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    res.json({ message: 'Prescription deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
