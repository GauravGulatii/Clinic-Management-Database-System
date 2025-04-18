// In routes/staff.js (or similar)
router.get('/:id', async (req, res) => {
    const staffId = req.params.id;  // e.g. "S1"
    try {
      const [staff] = await db.query(`SELECT firstName, lastName FROM Staff WHERE staffID = ?`, [staffId]);
      if (!staff) {
        return res.status(404).json({ error: "Staff not found" });
      }
      const fullName = staff.firstName + ' ' + staff.lastName;
      res.json({ id: staffId, name: fullName });
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve staff info" });
    }
  });
  