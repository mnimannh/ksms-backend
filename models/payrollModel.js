// models/payrollModel.js
import db from '../db/connection.js';

// Fetch all payroll records
export const getAllPayroll = async () => {
  const [rows] = await db.query('SELECT * FROM payroll');
  return rows;
};

// Fetch payroll by ID
export const getPayrollById = async (id) => {
  const [rows] = await db.query('SELECT * FROM payroll WHERE id = ?', [id]);
  return rows[0];
};

// Fetch payroll by userID
export const getPayrollByUserId = async (userID) => {
  const [rows] = await db.query('SELECT * FROM payroll WHERE userID = ?', [userID]);
  return rows;
};

// Create payroll record
export const createPayroll = async (data) => {
  const { userID, month, hoursWorked, createdBy, isCreated, isReceived, notes } = data;
  const [result] = await db.query(
    'INSERT INTO payroll (userID, month, hoursWorked, createdBy, isCreated, isReceived, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userID, month, hoursWorked, createdBy, isCreated || false, isReceived || false, notes]
  );
  return result.insertId;
};

// Update payroll record
export const updatePayroll = async (id, data) => {
  const { hoursWorked, isCreated, isReceived, notes } = data;
  await db.query(
    'UPDATE payroll SET hoursWorked = ?, isCreated = ?, isReceived = ?, notes = ? WHERE id = ?',
    [hoursWorked, isCreated, isReceived, notes, id]
  );
};

// Delete payroll record
export const deletePayroll = async (id) => {
  await db.query('DELETE FROM payroll WHERE id = ?', [id]);
};

// Fetch payroll records for a specific user with fullName
export const getPayrollWithUser = async (userID) => {
  const [rows] = await db.query(
    `SELECT p.*, u.fullName
     FROM payroll p
     JOIN user u ON p.userID = u.id
     WHERE p.userID = ?
     ORDER BY p.month DESC`,
    [userID]
  );
  return rows;
};