import db from '../db/connection.js';
import bcrypt from 'bcrypt';

export const login = async (email, password) => {
  // 1. Get user record by email
  const [rows] = await db.query(
    'SELECT id, email, password, role, last_login, status FROM user WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return { success: false, message: 'Invalid email or password' };
  }

  const user = rows[0];

  // Check if user is active
  if (user.status !== 'active') {
    return { success: false, message: 'Your account is inactive. Contact admin.' };
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { success: false, message: 'Invalid email or password' };
  }

  // 3. Update last_login
  await db.query('UPDATE user SET last_login = NOW() WHERE id = ?', [user.id]);

  // 4. Return user info (without password)
  const [updatedRows] = await db.query(
    'SELECT id, email, role, last_login, status FROM user WHERE id = ?',
    [user.id]
  );

  return { success: true, user: updatedRows[0] };
};
