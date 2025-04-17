/*  routes/patients.js
    --------------------------------------------------------------
    CRUD + search for Patient
*/
const express = require('express');
const router  = express.Router();
const db      = require('../db');     // ← your pg Pool instance

/* ---------- helpers -------------------------------------------------- */
const SELECT =
`SELECT patientID,
        firstName,
        lastName,
        dob,
        EXTRACT(year FROM AGE(dob))::int AS age
   FROM Patient`;

/* ---------- GET /api/patients  ---------------------------------------

   • no query‑string  →  all patients
   • ?id=12           →  single patient
   • ?name=smi        →  partial first/last search
------------------------------------------------------------------------ */
router.get('/', async (req, res) => {
  try {
    /* 1) by explicit ID ------------------------------------------------ */
    if (req.query.id) {
      const { rows } = await db.query(
        `${SELECT} WHERE patientID = $1`, [ req.query.id ]);
      return res.json(rows);       // [] or [single obj]
    }

    /* 2) by name fragment --------------------------------------------- */
    if (req.query.name) {
      const like = `%${req.query.name.trim()}%`;
      const { rows } = await db.query(
        `${SELECT}
           WHERE LOWER(firstName) LIKE LOWER($1)
              OR LOWER(lastName)  LIKE LOWER($1)
        ORDER BY lastName, firstName`, [ like ]);
      return res.json(rows);
    }

    /* 3) default: list all patients ----------------------------------- */
    const { rows } = await db.query(
      `${SELECT} ORDER BY patientID`);
    return res.json(rows);

  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

/* ---------- POST /api/patients  --------------------------------------
   body = { firstName, lastName, dob }
------------------------------------------------------------------------ */
router.post('/', async (req, res) => {
  const { firstName, lastName, dob } = req.body || {};
  if (!firstName || !lastName || !dob)
       return res.status(400).json({ error: 'Missing fields' });

  try {
    const { rows } = await db.query(
      `INSERT INTO Patient(firstName,lastName,dob)
       VALUES ($1,$2,$3)
       RETURNING patientID`, [ firstName, lastName, dob ]);
    res.status(201).json({ patientID: rows[0].patientid });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});

/* ---------- PUT /api/patients/:id  (update basic fields) ------------- */
router.put('/:id', async (req,res) => {
  const { firstName, lastName, dob } = req.body || {};
  if(!firstName && !lastName && !dob)
     return res.status(400).json({ error:'Nothing to update' });

  const sets = [], vals = [];
  if(firstName){ vals.push(firstName); sets.push(`firstName=$${vals.length}`);}
  if(lastName ){ vals.push(lastName ); sets.push(`lastName =$${vals.length}`);}
  if(dob      ){ vals.push(dob      ); sets.push(`dob      =$${vals.length}`);}
  vals.push(req.params.id);

  try {
    await db.query(`UPDATE Patient SET ${sets.join(', ')}
                    WHERE patientID=$${vals.length}`, vals);
    res.json({ ok:true });
  } catch(e){ console.error(e); res.status(500).json({error:'DB error'}); }
});

/* ---------- DELETE /api/patients/:id -------------------------------- */
router.delete('/:id', async (req,res)=>{
  try{
    await db.query('DELETE FROM Patient WHERE patientID=$1',[req.params.id]);
    res.status(204).end();
  }catch(e){ console.error(e); res.status(500).json({error:'DB error'});}
});

module.exports = router;
