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

export const getUserByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT id, fullName, email, status FROM user WHERE email = ?',
    [email]
  );
  return rows[0];
};

export const setResetToken = async (userId, token, expiry) => {
  await db.query(
    'UPDATE user SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
    [token, expiry, userId]
  );
};

export const getUserByResetToken = async (token) => {
  const [rows] = await db.query(
    'SELECT id, email, fullName FROM user WHERE reset_token = ? AND reset_token_expiry > NOW() AND status = "active"',
    [token]
  );
  return rows[0];
};

export const consumeResetToken = async (userId, hashedPassword) => {
  await db.query(
    'UPDATE user SET password = ?, is_temp_password = 0, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
    [hashedPassword, userId]
  );
};