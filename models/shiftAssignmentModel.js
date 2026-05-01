// models/shiftAssignmentModel.js
import db from '../db/connection.js';

// Fetch all shifts (admin — includes draft + published)
export const getAllShifts = async () => {
  const [rows] = await db.query(`
    SELECT s.*, u.fullName AS assignedByName
    FROM shift_assignment s
    LEFT JOIN user u ON s.assignedBy = u.id
    ORDER BY s.startTime ASC
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

// Fetch published shifts for a specific staff (staff view — no drafts)
export const getShiftsByUser = async (userID) => {
  const [rows] = await db.query(`
    SELECT s.*, u.fullName AS assignedByName
    FROM shift_assignment s
    LEFT JOIN user u ON s.assignedBy = u.id
    WHERE s.userID = ? AND s.status = 'published'
    ORDER BY s.startTime ASC
  `, [userID]);
  return rows;
};
// Create a new shift (manual — published immediately)
export const createShift = async (data) => {
  const { userID, assignedBy, startTime, endTime, shiftType, notes } = data;
  const [result] = await db.query(
    'INSERT INTO shift_assignment (userID, assignedBy, startTime, endTime, shiftType, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userID, assignedBy, startTime, endTime, shiftType || 'Morning', 'published', notes]
  );
  return result.insertId;
};

// ── Auto-generate helpers ────────────────────────────────────────────────────

// Check if a draft already exists for a given month (YYYY-MM)
export const hasDraftForMonth = async (month) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS cnt FROM shift_assignment
     WHERE status = 'draft' AND DATE_FORMAT(startTime, '%Y-%m') = ?`,
    [month]
  );
  return rows[0].cnt > 0;
};

// Get active staff eligible for a given month (created on or before that month)
export const getEligibleStaff = async (month) => {
  const [rows] = await db.query(
    `SELECT id, fullName FROM user
     WHERE role = 'staff' AND status = 'active'
       AND DATE_FORMAT(created_at, '%Y-%m') <= ?
     ORDER BY fullName ASC`,
    [month]
  );
  return rows;
};

// Bulk insert draft shifts
export const bulkCreateDrafts = async (assignments) => {
  if (!assignments.length) return;
  const values = assignments.map(a => [
    a.userID, a.assignedBy, a.startTime, a.endTime, a.shiftType, 'draft', a.notes ?? null,
  ]);
  await db.query(
    'INSERT INTO shift_assignment (userID, assignedBy, startTime, endTime, shiftType, status, notes) VALUES ?',
    [values]
  );
};

// Publish all draft shifts for a month + seed attendance records
export const publishDrafts = async (month) => {
  await db.query(
    `UPDATE shift_assignment SET status = 'published'
     WHERE status = 'draft' AND DATE_FORMAT(startTime, '%Y-%m') = ?`,
    [month]
  );
  // Seed attendance for newly published shifts (only those without existing logs)
  await db.query(
    `INSERT INTO shift_attendance_log (shiftID, userID, status)
     SELECT s.id, s.userID, 'Pending'
     FROM shift_assignment s
     LEFT JOIN shift_attendance_log l ON l.shiftID = s.id
     WHERE s.status = 'published'
       AND DATE_FORMAT(s.startTime, '%Y-%m') = ?
       AND l.id IS NULL`,
    [month]
  );
};

// Delete all draft shifts for a month
export const discardDrafts = async (month) => {
  await db.query(
    `DELETE FROM shift_assignment
     WHERE status = 'draft' AND DATE_FORMAT(startTime, '%Y-%m') = ?`,
    [month]
  );
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
  await db.query('DELETE FROM shift_attendance_log WHERE shiftID = ?', [id]);
  await db.query('DELETE FROM shift_assignment WHERE id = ?', [id]);
};

// Fetch the currently active shift for a user (within ±5 min window)
export const getCurrentShiftForUser = async (userID) => {
  const [rows] = await db.query(
    `SELECT * FROM shift_assignment
     WHERE userID = ?
     AND NOW() BETWEEN DATE_SUB(startTime, INTERVAL 5 MINUTE)
                   AND DATE_ADD(endTime, INTERVAL 1 HOUR)
     ORDER BY startTime ASC
     LIMIT 1`,
    [userID]
  );
  return rows[0] || null;
};
