const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  //ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error(' Failed to connect to database:', err);
  } else {
    console.log(' Successfully connected to database at:', res.rows[0].now);
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// GET endpoint
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM demo');
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err.stack);
    res.status(500).send('Server error');
  }
});

// POST endpoint
app.post('/api/data', async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('INSERT INTO demo (name) VALUES ($1)', [name]);
    res.send('Inserted');
  } catch (err) {
    console.error('Database error:', err.stack);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
