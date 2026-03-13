import db from '../db/connection.js';

// Get all users
export const getAllUsers = async () => {
  const [rows] = await db.query(
    `SELECT u.id, u.fullName, u.email, u.role, u.status, u.created_at, u.last_login,
            r.rfid_uid AS rfidUid
     FROM user u
     LEFT JOIN rfid r ON r.userID = u.id`
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
    [fullName, email, role, status, password]
  );
  return result.insertId;
};



// Update existing user
export const updateUser = async (id, user) => {
  const fields = [];
  const values = [];

  for (const key in user) {
    // Skip undefined values to avoid bad SQL
    if (user[key] === undefined) continue;
    fields.push(`\`${key}\` = ?`);
    values.push(user[key]);
  }

  if (fields.length === 0) return;

  const sql = `UPDATE user SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  await db.query(sql, values);
};

// Delete user
export const deleteUser = async (id) => {
  await db.query('DELETE FROM user WHERE id = ?', [id]);
};

// Upsert RFID — insert if none exists, update if it does
export const upsertRfid = async (userId, rfidUid) => {
  const [existing] = await db.query(
    'SELECT id FROM rfid WHERE userID = ?', [userId]
  );

  if (existing.length > 0) {
    await db.query(
      'UPDATE rfid SET rfid_uid = ?, updated_at = NOW() WHERE userID = ?',
      [rfidUid, userId]
    );
  } else {
    await db.query(
      'INSERT INTO rfid (userID, rfid_uid, is_active) VALUES (?, ?, TRUE)',
      [userId, rfidUid]
    );
  }
};

export const deleteRfidByUser = async (userId) => {
  await db.query('DELETE FROM rfid WHERE userID = ?', [userId]);
};
