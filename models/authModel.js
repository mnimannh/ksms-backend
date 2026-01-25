import db from '../db/connection.js';

export const login = async (email, password) => {
  // 1. Check if user exists with email + password
  const query = 'SELECT id, email, role, last_login FROM user WHERE email = ? AND password = ?';
  const [rows] = await db.query(query, [email, password]);

  if (rows.length === 0) {
    // Login failed
    return [];
  }

  const userId = rows[0].id;

  // 2. Update last_login to current time
  const updateQuery = 'UPDATE user SET last_login = NOW() WHERE id = ?';
  await db.query(updateQuery, [userId]);

  // 3. Return updated user info including last_login
  const [updatedRows] = await db.query('SELECT id, email, role, last_login FROM user WHERE id = ?', [userId]);
  
  return updatedRows; // returns user info with last_login
};
