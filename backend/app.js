// app.js
// ─────────────────────────────────────────────────────────────────────
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');      // request/response logger

const app = express();

/* ───── middleware ───── */
app.use(cors());
app.use(express.json());

// pretty log:  GET /patients 200 436 - 5.22 ms
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// extra body echo for debugging write methods
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('  ↳ body:', JSON.stringify(req.body));
  }
  next();
});

/* ───── routes ───── */
app.use('/api/doctors',      require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/patients',     require('./routes/patients'));
app.use('/api/schedules',  require('./routes/schedules'));


/* ───── start server ───── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`API server running at http://localhost:${PORT}`)
);
