const express = require('express');
const router = express.Router();
const pool = require('../db');

/** GET /api/appointments - list all appointments with patient & doctor info */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.patientid, a.appointmentid, a.appointmentdate, a.appointmenttime,
              a.doctorid, a.staffid,
              p.firstname || ' ' || p.lastname AS patientname,
              d.name AS doctorname
         FROM appointment a
         JOIN patient p ON p.patientid = a.patientid
         JOIN doctor d ON d.doctorid = a.doctorid
         ORDER BY a.appointmentdate, a.appointmenttime`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/appointments 
 * Create a new appointment. Expects { patientid, appointmentdate, appointmenttime, doctorid, staffid, [scheduleid] }.
 * Auto-generates the next appointmentid for that patient. */
router.post('/', async (req, res) => {
  try {
    const { patientid, appointmentdate, appointmenttime, doctorid, staffid, scheduleid } = req.body;
    // Determine next appointmentid for this patient (weak entity logic)
    const result = await pool.query(
      'SELECT COALESCE(MAX(appointmentid), 0) AS max_id FROM appointment WHERE patientid = $1',
      [patientid]
    );
    const nextId = Number(result.rows[0].max_id) + 1;
    // Insert new appointment
    const insertRes = await pool.query(
      `INSERT INTO appointment 
         (patientid, appointmentid, appointmentdate, appointmenttime, doctorid, staffid, scheduleid)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [patientid, nextId, appointmentdate, appointmenttime, doctorid, staffid, scheduleid || null]
    );
    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/appointments/:patientid/:appointmentid 
 * Delete a specific appointment (identified by composite key). */
router.delete('/:patientid/:appointmentid', async (req, res) => {
  const { patientid, appointmentid } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM appointment WHERE patientid = $1 AND appointmentid = $2`,
      [patientid, appointmentid]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    // Related prescriptions, records, billing will cascade-delete (FK ON DELETE CASCADE)
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
