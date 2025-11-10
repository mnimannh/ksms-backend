import db from '../db/connection.js';

export const fetchAllUsers = async () => {
  const [rows] = await db.query('SELECT * FROM user');
  return rows; // returns array of users
};
