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

// Create attendance log
export const createAttendance = async (data) => {
  const { shiftID, userID, checkIn, checkOut, status, notes } = data;
  const [result] = await db.query(
    'INSERT INTO shift_attendance_log (shiftID, userID, checkIn, checkOut, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [shiftID, userID, checkIn, checkOut, status || 'Pending', notes]
  );
  return result.insertId;
};

// Update attendance log
export const updateAttendance = async (id, data) => {
  const { checkIn, checkOut, status, notes } = data;
  await db.query(
    'UPDATE shift_attendance_log SET checkIn = ?, checkOut = ?, status = ?, notes = ? WHERE id = ?',
    [checkIn, checkOut, status, notes, id]
  );
};

// Delete attendance log
export const deleteAttendance = async (id) => {
  await db.query('DELETE FROM shift_attendance_log WHERE id = ?', [id]);
};
