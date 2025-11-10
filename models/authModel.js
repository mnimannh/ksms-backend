import db from '../db/connection.js';

export const login = async (email, password) => {
  const query = 'SELECT userID, email, role FROM user WHERE email = ? AND password = ?';
  const [rows] = await db.query(query, [email, password]);
  return rows; // returns an array
};