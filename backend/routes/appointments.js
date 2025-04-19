const express = require('express');
const router = express.Router();
const pool = require('../db');

/** GET /api/appointments/patients
 *  List all patients (id + full name)
 */
router.get('/patients', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT patientid, firstname || ' ' || lastname AS name
         FROM patient
        ORDER BY lastname, firstname`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/appointments/doctors
 *  List all doctors (id + name)
 */
router.get('/doctors', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT doctorid, name
         FROM doctor
        ORDER BY name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/appointments/availability?doctorid=&date=
 *  Return that doctor's available schedules on the given date
 */
router.get('/availability', async (req, res) => {
  const { doctorid, date } = req.query;
  try {
    const result = await pool.query(
      `SELECT scheduleid, starttime, endtime
         FROM doctorschedule
        WHERE doctorid = $1
          AND scheduledate = $2
          AND status = 'Available'
        ORDER BY starttime`,
      [doctorid, date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/appointments
 *  List all appointments with patient & doctor info
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.patientid, a.appointmentid, a.appointmentdate, a.appointmenttime,
              a.doctorid, a.staffid,
              p.firstname || ' ' || p.lastname AS patientname,
              d.name AS doctorname
         FROM appointment a
         JOIN patient p ON p.patientid = a.patientid
         JOIN doctor d  ON d.doctorid  = a.doctorid
        ORDER BY a.appointmentdate, a.appointmenttime`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/appointments
 *  Create a new appointment.
 *  Expects { patientid, appointmentdate, appointmenttime, doctorid, staffid, scheduleid }
 */
/** POST /api/appointments
 *  Create a new appointment.
 *  Expects { patientid, appointmentdate, appointmenttime, doctorid, staffid, scheduleid }
 */
router.post('/', async (req, res) => {
  try {
    const {
      patientid,
      appointmentdate,
      appointmenttime,
      doctorid,
      staffid,
      scheduleid,
    } = req.body;

    // 1) Check for a conflicting appointment
    const conflict = await pool.query(
      `SELECT 1
         FROM appointment
        WHERE doctorid = $1
          AND appointmentdate = $2
          AND appointmenttime = $3`,
      [doctorid, appointmentdate, appointmenttime]
    );
    if (conflict.rowCount > 0) {
      return res
        .status(409)
        .json({ error: 'That doctor is already booked at this date & time.' });
    }

    // 2) Compute next weak‑entity ID
    const { rows } = await pool.query(
      'SELECT COALESCE(MAX(appointmentid), 0) AS max_id \
       FROM appointment WHERE patientid = $1',
      [patientid]
    );
    const nextId = Number(rows[0].max_id) + 1;

    // 3) Insert new appointment
    const insertRes = await pool.query(
      `INSERT INTO appointment
         (patientid, appointmentid, appointmentdate, appointmenttime,
          doctorid, staffid, scheduleid)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        patientid,
        nextId,
        appointmentdate,
        appointmenttime,
        doctorid,
        staffid,
        scheduleid || null,
      ]
    );

    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


/** DELETE /api/appointments/:patientid/:appointmentid
 */
router.delete('/:patientid/:appointmentid', async (req, res) => {
  const { patientid, appointmentid } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM appointment
         WHERE patientid = $1
           AND appointmentid = $2`,
      [patientid, appointmentid]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
