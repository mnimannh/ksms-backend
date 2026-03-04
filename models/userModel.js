import db from '../db/connection.js';

// Get all users
export const getAllUsers = async () => {
  const [rows] = await db.query(
    'SELECT id, fullName, email, role, status, created_at, last_login FROM user'
  );
  return rows;
};

// Get user by ID
export const getUserById = async (id) => {
  const [rows] = await db.query(
    'SELECT id, fullName, email, role, status, created_at, last_login FROM user WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Create new user
export const createUser = async (user) => {
  const { fullName, email, role, status, password } = user;
  const [result] = await db.query(
    'INSERT INTO user (fullName, email, role, status, password) VALUES (?, ?, ?, ?, ?)',
    [fullName, email, role, status, password] // password is already hashed in controller
  );
  return result.insertId;
};

// Update existing user
export const updateUser = async (id, user) => {
  const fields = [];
  const values = [];

  // Build dynamic query based on provided fields
  for (const key in user) {
    fields.push(`${key} = ?`);
    values.push(user[key]);
  }

  if (fields.length === 0) return; // nothing to update

  const sql = `UPDATE user SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  await db.query(sql, values);
};

// Delete user
export const deleteUser = async (id) => {
  await db.query('DELETE FROM user WHERE id = ?', [id]);
};