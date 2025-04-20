require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const app     = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Routes – mounting routers for each module
app.use('/api/patients',      require('./routes/patients'));
app.use('/api/doctors',       require('./routes/doctors'));
app.use('/api/appointments',  require('./routes/appointments'));
app.use('/api/schedules',     require('./routes/schedules'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/medicalrecords', require('./routes/medicalrecords'));
app.use('/api/billing',       require('./routes/billing'));
app.use('/api/staff', require('./routes/staff'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
