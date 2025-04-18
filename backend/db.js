require('dotenv').config();
const { Pool } = require('pg');
// Pool uses DATABASE_URL from .env for PostgreSQL connection
module.exports = new Pool({ connectionString: process.env.DATABASE_URL });
