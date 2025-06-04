const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

// Initialize app
const app = express();
const port = process.env.PORT || 3000;

// -------------------- Middlewares --------------------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// -------------------- Database Connection --------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Uncomment below if needed for production SSL
  // ssl: { rejectUnauthorized: false }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Failed to connect to database:', err);
  } else {
    console.log('Successfully connected to database at:', res.rows[0].now);
  }
});

// -------------------- Routes --------------------

// GET: Fetch data
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM demo');
    res.json(result.rows);
  } catch (err) {
    console.error('Database error (GET /api/data):', err.stack);
    res.status(500).send('Server error');
  }
});

// POST: Insert data
app.post('/api/data', async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).send('Invalid input');
  }

  try {
    await pool.query('INSERT INTO demo (name) VALUES ($1)', [name.trim()]);
    res.send('Inserted');
  } catch (err) {
    console.error('Database error (POST /api/data):', err.stack);
    res.status(500).send('Server error');
  }
});

// -------------------- Server Start --------------------
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
