// models/shiftAttendanceModel.js
import db from '../db/connection.js';

// Fetch all attendance logs
export const getAllAttendance = async () => {
  const [rows] = await db.query('SELECT * FROM shift_attendance_log');
  return rows;
};

// Fetch attendance by ID
export const getAttendanceById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM shift_attendance_log WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Fetch attendance by shift ID
export const getAttendanceByShiftId = async (shiftID) => {
  const [rows] = await db.query(
    'SELECT * FROM shift_attendance_log WHERE shiftID = ?',
    [shiftID]
  );
  return rows;
};

// Fetch attendance by shift ID + userID (double-tap check for scan logic)
export const getAttendanceByShiftAndUser = async (shiftID, userID) => {
  const [rows] = await db.query(
    'SELECT * FROM shift_attendance_log WHERE shiftID = ? AND userID = ?',
    [shiftID, userID]
  );
  return rows[0];
};

// Create attendance log
export const createAttendance = async (data) => {
  const { shiftID, userID, checkIn, checkOut, status, notes } = data;
  const [result] = await db.query(
    'INSERT INTO shift_attendance_log (shiftID, userID, checkIn, checkOut, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [shiftID, userID, checkIn, checkOut ?? null, status || 'Pending', notes ?? null]
  );
  return result.insertId;
};

// Update attendance log
export const updateAttendance = async (id, data) => {
  const { checkIn, checkOut, status, notes } = data;
  
  // 🔥 FIX: Only update checkOut, status, and notes on second tap
  // Do NOT re-update checkIn!
  await db.query(
    'UPDATE shift_attendance_log SET checkOut = ?, status = ?, notes = ? WHERE id = ?',
    [checkOut ?? null, status, notes ?? null, id]
  );
};

// Delete attendance log
export const deleteAttendance = async (id) => {
  await db.query('DELETE FROM shift_attendance_log WHERE id = ?', [id]);
};

// Fetch attendance logs for a user for a specific month (YYYY-MM)
export const getAttendanceByUserMonth = async (userID, month) => {
  const [rows] = await db.query(
    `SELECT sal.id, sal.shiftID, sal.checkIn, sal.checkOut, sal.status, sal.notes,
            sa.startTime, sa.endTime, sa.shiftType
     FROM shift_attendance_log sal
     JOIN shift_assignment sa ON sal.shiftID = sa.id
     WHERE sal.userID = ? AND DATE_FORMAT(sa.startTime, '%Y-%m') = ?
     ORDER BY sa.startTime ASC`,
    [userID, month]
  );
  return rows;
};