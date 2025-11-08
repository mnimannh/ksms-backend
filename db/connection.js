const mysql = require('mysql2');


const db = mysql.createConnection({
  host: 'localhost',    
  user: 'root',     
  password: 'boeing737',   
  database: 'ksms'      
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL!');
});

module.exports = db;