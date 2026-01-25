import db from '../db/connection.js';
import bcrypt from 'bcrypt';

export const login = async (email, password) => {
  // 1. Get user record by email
  const [rows] = await db.query('SELECT id, email, password, role, last_login FROM user WHERE email = ?', [email]);

  if (rows.length === 0) {
    // User not found
    return [];
  }

  const user = rows[0];

  // 2. Compare submitted password with hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // Password does not match
    return [];
  }

  const userId = user.id;

  // 3. Update last_login to current time
  await db.query('UPDATE user SET last_login = NOW() WHERE id = ?', [userId]);

  // 4. Return updated user info including last_login (excluding password)
  const [updatedRows] = await db.query(
    'SELECT id, email, role, last_login FROM user WHERE id = ?',
    [userId]
  );

  return updatedRows;
};
