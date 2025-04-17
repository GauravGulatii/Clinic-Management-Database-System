// routes/doctors.js
// ─────────────────────────────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const db      = require('../db');           // ← your pg Pool

/* ───────────────  doctors  ─────────────── */

// GET /api/doctors  →  all doctors
router.get('/', async (_, res) => {
  try {
    const { rows } = await db.query(
      `SELECT doctorid      AS "doctorId",
              name,
              specialization
       FROM   Doctor
       ORDER  BY name`
    );
    res.json(rows);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'DB error' });
  }
});

// POST /api/doctors  →  create doctor
router.post('/', async (req, res) => {
  const { name, specialization } = req.body;
  if (!name) return res.status(400).json({ error:'Name required' });
  try {
    const { rows:[doctor] } = await db.query(
      `INSERT INTO Doctor (name,specialization)
       VALUES ($1,$2) RETURNING doctorid AS "doctorId",name,specialization`,
       [name, specialization || null]
    );
    res.status(201).json(doctor);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'DB error' });
  }
});

// DELETE /api/doctors/:id  → remove doctor
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Doctor WHERE doctorid = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'DB error' });
  }
});

/* ──────────────  schedules  ────────────── */

// GET /api/doctors/:id/schedules  → schedules for a doctor
router.get('/:id/schedules', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT scheduleid     AS "scheduleId",
              scheduledate   AS "date",
              starttime      AS "start",
              endtime        AS "end",
              status
       FROM   DoctorSchedule
       WHERE  doctorid = $1
       ORDER  BY scheduledate,starttime`,
       [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'DB error' });
  }
});

// POST /api/doctors/:id/schedules  → add schedule row
router.post('/:id/schedules', async (req, res) => {
  const { date, start, end, status='Available' } = req.body;
  if (!date || !start || !end)
    return res.status(400).json({ error:'date, start, end required' });
  try {
    const { rows:[row] } = await db.query(
      `INSERT INTO DoctorSchedule
         (doctorid,scheduledate,starttime,endtime,status)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING scheduleid AS "scheduleId",doctorid AS "doctorId",
                 scheduledate AS "date",starttime AS "start",
                 endtime AS "end",status`,
      [req.params.id,date,start,end,status]
    );
    res.status(201).json(row);
  } catch (err) {
    console.error(err); res.status(500).json({ error:'DB error' });
  }
});

module.exports = router;
