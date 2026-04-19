import db from '../db/connection.js';

export const getRatesByUser = async (userID) => {
  const [rows] = await db.query(
    'SELECT * FROM hourly_rate WHERE userID = ? ORDER BY effective_from DESC',
    [userID]
  );
  return rows;
};

export const createRate = async ({ userID, rate, effective_from }) => {
  const [result] = await db.query(
    'INSERT INTO hourly_rate (userID, rate, effective_from) VALUES (?, ?, ?)',
    [userID, rate, effective_from]
  );
  return result.insertId;
};

export const deleteRate = async (id) => {
  await db.query('DELETE FROM hourly_rate WHERE id = ?', [id]);
};
