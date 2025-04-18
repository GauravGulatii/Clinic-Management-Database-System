const express = require('express');
const router = express.Router();
const pool = require('../db');

/** GET /api/billing - list all billing records with patient & staff info */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.billingid, b.amount, b.paymentstatus, b.patientid, b.appointmentid, b.staffid,
              p.firstname || ' ' || p.lastname AS patientname,
              cs.name AS staffname
         FROM billing b
         JOIN patient p ON p.patientid = b.patientid
         LEFT JOIN clinicstaff cs ON cs.staffid = b.staffid
         ORDER BY b.billingid`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/billing 
 * Create a new billing record. Expects { patientid, appointmentid, amount, paymentstatus, [staffid] }. */
router.post('/', async (req, res) => {
  try {
    const { patientid, appointmentid, amount, paymentstatus, staffid } = req.body;
    const insertRes = await pool.query(
      `INSERT INTO billing (patientid, appointmentid, amount, paymentstatus, staffid)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [patientid, appointmentid, amount || 0, paymentstatus || 'Pending', staffid || null]
    );
    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23503') {  // FK error (invalid patient/appt or staff)
      return res.status(400).json({ error: 'Invalid reference for patient, appointment or staff' });
    }
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/billing/:id - delete a billing record by ID */
router.delete('/:id', async (req, res) => {
  const billingId = req.params.id;
  try {
    const result = await pool.query(`DELETE FROM billing WHERE billingid = $1`, [billingId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Billing record not found' });
    }
    res.json({ message: 'Billing record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
