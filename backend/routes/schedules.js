const express = require('express');
const router = express.Router();
const pool = require('../db');

/** GET /api/schedules - list all doctor schedules with doctor info */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.scheduleid, s.doctorid, s.scheduledate, s.starttime, s.endtime, s.status,
              d.name AS doctorname
         FROM doctorschedule s
         JOIN doctor d ON d.doctorid = s.doctorid
         ORDER BY s.scheduledate, s.starttime`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/schedules 
 * Create a new schedule entry. Expects { doctorid, scheduledate, starttime, endtime, [status] }.
 * scheduleid is auto-generated. */
router.post('/', async (req, res) => {
  try {
    const { doctorid, scheduledate, starttime, endtime, status } = req.body;
    const insertRes = await pool.query(
      `INSERT INTO doctorschedule (doctorid, scheduledate, starttime, endtime, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [doctorid, scheduledate, starttime, endtime, status || 'Available']
    );
    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/schedules/:id - delete a schedule by ID */
router.delete('/:id', async (req, res) => {
  const scheduleId = req.params.id;
  try {
    const result = await pool.query(`DELETE FROM doctorschedule WHERE scheduleid = $1`, [scheduleId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    // Appointments that referenced this schedule will have scheduleid set to NULL (per FK ON DELETE SET NULL)
    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
