const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/appointments/patients
router.get('/patients', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT patientid,
             firstname || ' ' || lastname AS name
      FROM patient
      ORDER BY lastname, firstname
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/appointments/doctors
router.get('/doctors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT doctorid, name
      FROM doctor
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/appointments/availability?doctorid=&date=
router.get('/availability', async (req, res) => {
  const { doctorid, date } = req.query;
  try {
    const result = await pool.query(`
      SELECT scheduleid, starttime, endtime
      FROM doctorschedule
      WHERE doctorid    = $1
        AND scheduledate = $2
        AND status      = 'Available'
      ORDER BY starttime
    `, [doctorid, date]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/appointments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.patientid,
        a.appointmentid,
        a.appointmentdate,
        a.appointmenttime,
        a.doctorid,
        a.staffid,
        a.scheduleid,
        p.firstname || ' ' || p.lastname AS patientname,
        d.name AS doctorname
      FROM appointment a
      JOIN patient p ON p.patientid = a.patientid
      JOIN doctor  d ON d.doctorid  = a.doctorid
      ORDER BY a.appointmentdate, a.appointmenttime
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/appointments
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

    // conflict check
    const conflict = await pool.query(`
      SELECT 1
      FROM appointment
      WHERE doctorid        = $1
        AND appointmentdate = $2
        AND appointmenttime = $3
    `, [doctorid, appointmentdate, appointmenttime]);

    if (conflict.rowCount > 0) {
      return res
        .status(409)
        .json({ error: 'Doctor is already booked at that date & time.' });
    }

    // compute next weak entity ID
    const { rows } = await pool.query(`
      SELECT COALESCE(MAX(appointmentid), 0) AS max_id
      FROM appointment
      WHERE patientid = $1
    `, [patientid]);
    const nextId = Number(rows[0].max_id) + 1;

    // insert
    const insertRes = await pool.query(`
      INSERT INTO appointment
        (patientid, appointmentid, appointmentdate, appointmenttime, doctorid, staffid, scheduleid)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      patientid,
      nextId,
      appointmentdate,
      appointmenttime,
      doctorid,
      staffid,
      scheduleid || null,
    ]);

    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/appointments/:patientid/:appointmentid
// — if we try to move to a slot already booked,
//     delete that old booking and then update this one.
router.put('/:patientid/:appointmentid', async (req, res) => {
  const { patientid, appointmentid } = req.params;
  const {
    appointmentdate,
    appointmenttime,
    doctorid,
    staffid,
    scheduleid,
  } = req.body;

  try {
    // find any other appointment at that slot
    const conflicted = await pool.query(`
      SELECT patientid, appointmentid
      FROM appointment
      WHERE doctorid        = $1
        AND appointmentdate = $2
        AND appointmenttime = $3
        AND NOT (patientid = $4 AND appointmentid = $5)
    `, [doctorid, appointmentdate, appointmenttime, patientid, appointmentid]);

    // delete them first
    for (let row of conflicted.rows) {
      await pool.query(`
        DELETE FROM appointment
        WHERE patientid     = $1
          AND appointmentid = $2
      `, [row.patientid, row.appointmentid]);
    }

    // now update this one
    const upd = await pool.query(`
      UPDATE appointment
      SET appointmentdate = $1,
          appointmenttime = $2,
          doctorid        = $3,
          staffid         = $4,
          scheduleid      = $5
      WHERE patientid     = $6
        AND appointmentid = $7
      RETURNING *
    `, [
      appointmentdate,
      appointmenttime,
      doctorid,
      staffid,
      scheduleid || null,
      patientid,
      appointmentid,
    ]);

    if (upd.rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(upd.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/appointments/:patientid/:appointmentid
router.delete('/:patientid/:appointmentid', async (req, res) => {
  const { patientid, appointmentid } = req.params;
  try {
    const del = await pool.query(`
      DELETE FROM appointment
      WHERE patientid     = $1
        AND appointmentid = $2
    `, [patientid, appointmentid]);

    if (del.rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
