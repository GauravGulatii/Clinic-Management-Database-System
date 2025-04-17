const express = require('express');
const router  = express.Router();
const db      = require('../db');

// POST /api/appointments
router.post('/', async (req, res) => {
  const { patientID, doctorID, date, time, staffID } = req.body;
  try {
    // next sequential appointmentID for this patient
    const { rows } = await db.query(
      'SELECT COALESCE(MAX(appointmentID),0)+1 AS next FROM Appointment WHERE patientID=$1',
      [patientID]
    );
    const appointmentID = rows[0].next;

    await db.query(
      `INSERT INTO Appointment(patientID,appointmentID,appointmentDate,
                                appointmentTime,doctorID,staffID)
       VALUES($1,$2,$3,$4,$5,$6)`,
      [patientID, appointmentID, date, time, doctorID, staffID]
    );

    res.json({ appointmentID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// GET /api/appointments/patient/:id  – upcoming only
router.get('/patient/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT A.appointmentID,A.appointmentDate,A.appointmentTime,
              D.name AS doctorName
       FROM Appointment A
       JOIN Doctor D ON A.doctorID=D.doctorID
       WHERE A.patientID=$1 AND A.appointmentDate >= CURRENT_DATE
       ORDER BY A.appointmentDate,A.appointmentTime`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
