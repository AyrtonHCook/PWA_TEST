const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'PWAtest',
  password: '0928244247',
  port: 5432,
});

app.use(express.static(path.join(__dirname, '../public')));

// Simple GET endpoint to fetch data
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM demo');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Simple POST endpoint to insert data
app.post('/api/data', async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('INSERT INTO demo (name) VALUES ($1)', [name]);
    res.send('Inserted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
