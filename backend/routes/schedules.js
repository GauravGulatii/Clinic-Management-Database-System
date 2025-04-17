const express = require('express');
const router  = express.Router();
const db      = require('../db');

/* ------------------------------------------------------------------
   GET /api/doctors/:doctorID/schedules     (preferred)
   GET /api/schedules?doctorID=123          (legacy support)
------------------------------------------------------------------ */
router.get(['/', '/doctors/:doctorID/schedules'], async (req, res) => {
  try {
    const doctorID = req.params.doctorID || req.query.doctorID;
    const { rows } = await db.query(
      `SELECT scheduleID, doctorID, scheduleDate, startTime, endTime, status
         FROM DoctorSchedule
        ${doctorID ? 'WHERE doctorID = $1' : ''}
        ORDER BY scheduleDate, startTime`,
      doctorID ? [doctorID] : []
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/* ------------------------------------------------------------------
   POST /api/doctors/:doctorID/schedules    (preferred)
   POST /api/schedules                      (legacy)
------------------------------------------------------------------ */
router.post(['/', '/doctors/:doctorID/schedules'], async (req, res) => {
  try {
    const doctorID = req.params.doctorID || req.body.doctorID;
    const { scheduleDate, startTime, endTime, status = 'Available' } = req.body;

    if (!doctorID || !scheduleDate || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const { rows: [row] } = await db.query(
      `INSERT INTO DoctorSchedule
         (doctorID, scheduleDate, startTime, endTime, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [doctorID, scheduleDate, startTime, endTime, status]
    );
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/* ------------------------------------------------------------------
   PUT  /api/schedules/:scheduleID          – update a slot
------------------------------------------------------------------ */
router.put('/:scheduleID', async (req, res) => {
  try {
    const { scheduleID } = req.params;
    const { scheduleDate, startTime, endTime, status } = req.body;

    const { rows: [row] } = await db.query(
      `UPDATE DoctorSchedule
          SET scheduleDate = COALESCE($2, scheduleDate),
              startTime    = COALESCE($3, startTime),
              endTime      = COALESCE($4, endTime),
              status       = COALESCE($5, status)
        WHERE scheduleID = $1
        RETURNING *`,
      [scheduleID, scheduleDate, startTime, endTime, status]
    );

    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/* ------------------------------------------------------------------
   DELETE /api/schedules/:scheduleID        
------------------------------------------------------------------ */
router.delete('/:scheduleID', async (req, res) => {
  try {
    const { scheduleID } = req.params;
    const { rowCount } = await db.query(
      `DELETE FROM DoctorSchedule WHERE scheduleID = $1`, [scheduleID]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
