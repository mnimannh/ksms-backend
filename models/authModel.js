// models/authModel.js
import db from '../db/connection.js';
import bcrypt from 'bcrypt';

export const login = async (email, password) => {
  // 1️⃣ Get user record by email
  const [rows] = await db.query(
    'SELECT id, fullName, email, password, role, last_login, status FROM user WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return { success: false, message: 'Invalid email or password' };
  }

  const user = rows[0];

  // 2️⃣ Check if user is active
  if (user.status !== 'active') {
    return { success: false, message: 'Your account is inactive. Contact admin.' };
  }

  // 3️⃣ Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { success: false, message: 'Invalid email or password' };
  }

  // 4️⃣ Update last_login
  await db.query('UPDATE user SET last_login = NOW() WHERE id = ?', [user.id]);

  // 5️⃣ Return user info (without password)
  const userInfo = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    last_login: new Date(),
    status: user.status
  };

  return { success: true, user: userInfo };
};