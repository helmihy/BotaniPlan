const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const app = express();

// Set up MySQL connection
const connection = mysql.createConnection({
  host: 'c23-ps261:asia-southeast2:botaniplan',
  user: 'root',
  password: 'rahasia(masukkan-nanti)', // password ganti
  database: 'botaniplan'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// JWT token
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: 'Missing authorization header.' });
  }

  const token = header.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, 'my_secret_key'); // nanti diubah
    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid authorization token.' });
  }
};

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Invalid email or password.' });
  }

  connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error querying users table:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: results[0].id }, 'my_secret_key', { expiresIn: '1h' });

    res.json({ token });
  });
});

// Register endpoint
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  connection.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err, results) => {
    if (err) {
      console.error('Error inserting user into users table:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    const userId = results.insertId;
    const token = jwt.sign({ userId }, 'my_secret_key', { expiresIn: '1h' });

    res.json({ token });
  });
});

// Logout endpoint
app.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logout successful.' });
});

// OpenWeather endpoint
app.get('/openweather', authMiddleware, (req, res) => {
  const { lat, lon } = req.query;

  // TODO: Implementasi untuk mengambil data Suhu, Kelembaban, dan Curah Hujan rata-rata
  
  res.json({ message: 'OpenWeather data retrieved.' });
});

// Open Meteo endpoint
app.get('/openmeteo', authMiddleware, (req, res) => {
  const { lat, lon } = req.query;

  // TODO: Implementasi untuk mengambil data elevation
  
  res.json({ message: 'Open Meteo data retrieved.' });
});

// Flask App Engine endpoint
app.get('/predict', authMiddleware, (req, res) => {
  const { temperature, humidity, rainfall, elevation } = req.query;

  // TODO: Implementasi untuk mengambil prediksi
  
  res.json({ message: 'Predictive data retrieved.' });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});
