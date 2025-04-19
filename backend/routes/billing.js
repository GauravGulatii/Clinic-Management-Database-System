// backend/routes/billing.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

/** GET /api/billing
 *  List all appointments with billing info (default Unpaid)
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.patientid,
        a.appointmentid,
        a.appointmentdate,
        a.appointmenttime,
        b.billingid,
        COALESCE(b.amount, 0)        AS amount,
        COALESCE(b.paymentstatus, 'Unpaid') AS paymentstatus,
        b.staffid,
        p.firstname || ' ' || p.lastname AS patientname,
        cs.name                    AS staffname
      FROM appointment a
      JOIN patient p
        ON p.patientid = a.patientid
      LEFT JOIN billing b
        ON b.patientid    = a.patientid
       AND b.appointmentid = a.appointmentid
      LEFT JOIN clinicstaff cs
        ON cs.staffid = b.staffid
      ORDER BY a.appointmentdate, a.appointmenttime
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/billing
 *  Create a new billing record.
 *  Expects { patientid, appointmentid, amount, [paymentstatus], [staffid] }.
 *  Defaults paymentstatus to 'Unpaid'.
 */
router.post('/', async (req, res) => {
  try {
    const { patientid, appointmentid, amount, paymentstatus, staffid } = req.body;
    const insertRes = await pool.query(
      `INSERT INTO billing
         (patientid, appointmentid, amount, paymentstatus, staffid)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        patientid,
        appointmentid,
        amount || 0,
        paymentstatus || 'Unpaid',
        staffid || null,
      ]
    );
    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23503') {
      return res.status(400).json({
        error: 'Invalid reference for patient, appointment or staff',
      });
    }
    res.status(500).json({ error: err.message });
  }
});

/** PUT /api/billing/:id
 *  Update an existing billing record.
 *  Accepts { amount, paymentstatus, [staffid] }.
 */
router.put('/:id', async (req, res) => {
  const billingId = req.params.id;
  try {
    const { amount, paymentstatus, staffid } = req.body;
    const updateRes = await pool.query(
      `UPDATE billing
         SET amount        = $1,
             paymentstatus = $2,
             staffid       = $3
       WHERE billingid = $4
       RETURNING *`,
      [amount, paymentstatus, staffid || null, billingId]
    );
    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: 'Billing record not found' });
    }
    res.json(updateRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/billing/:id
 *  Delete a billing record by billingid
 */
router.delete('/:id', async (req, res) => {
  const billingId = req.params.id;
  try {
    const result = await pool.query(
      `DELETE FROM billing WHERE billingid = $1`,
      [billingId]
    );
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
