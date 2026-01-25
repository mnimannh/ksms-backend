// models/shiftAssignmentModel.js
import db from '../db/connection.js';

// Fetch all shifts
export const getAllShifts = async () => {
  const [rows] = await db.query(`
    SELECT *
    FROM shift_assignment
  `);
  return rows;
};

// Fetch a shift by ID
export const getShiftById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM shift_assignment WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Create a new shift
export const createShift = async (data) => {
  const { userID, assignedBy, startTime, endTime, shiftType, notes } = data;
  const [result] = await db.query(
    'INSERT INTO shift_assignment (userID, assignedBy, startTime, endTime, shiftType, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [userID, assignedBy, startTime, endTime, shiftType || 'Morning', notes]
  );
  return result.insertId;
};

// Update shift
export const updateShift = async (id, data) => {
  const { userID, assignedBy, startTime, endTime, shiftType, notes } = data;
  await db.query(
    'UPDATE shift_assignment SET userID = ?, assignedBy = ?, startTime = ?, endTime = ?, shiftType = ?, notes = ? WHERE id = ?',
    [userID, assignedBy, startTime, endTime, shiftType, notes, id]
  );
};

// Delete shift
export const deleteShift = async (id) => {
  await db.query('DELETE FROM shift_assignment WHERE id = ?', [id]);
};
