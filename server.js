const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db/connection'); // db connection file

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get('/users', (req, res) => {
  db.query('SELECT * FROM user', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.listen(3000, () => console.log('Server running on http://127.0.0.1:3000'));
