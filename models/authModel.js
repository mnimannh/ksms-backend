import db from '../db/connection.js';

export const login = (email, password, callback) => {
  const query = 'SELECT userID, email, role FROM user WHERE email = ? AND password = ?';
  db.query(query, [email, password], callback);
};
