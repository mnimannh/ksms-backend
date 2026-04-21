import db from '../db/connection.js';

export const getMonthSummary = async (monthStr) => {
  // monthStr format: 'YYYY-MM'
  const [rows] = await db.query(
    `SELECT
       u.id AS userID, u.fullName, u.email,
       COALESCE(ROUND(SUM(
         CASE WHEN sal.checkIn IS NOT NULL AND sal.checkOut IS NOT NULL
           THEN TIMESTAMPDIFF(MINUTE, sal.checkIn, sal.checkOut) / 60.0
           ELSE 0 END
       ), 2), 0) AS hoursWorked,
       (SELECT hr.rate FROM hourly_rate hr
        WHERE hr.userID = u.id
          AND DATE_FORMAT(hr.effective_from, '%Y-%m') <= ?
        ORDER BY hr.effective_from DESC LIMIT 1) AS hourlyRate,
       p.id AS payrollId, p.totalPay, p.isCreated, p.isReceived, p.notes,
       p.created_at AS payrollCreatedAt
     FROM user u
     LEFT JOIN shift_assignment sa
       ON sa.userID = u.id AND DATE_FORMAT(sa.startTime, '%Y-%m') = ?
     LEFT JOIN shift_attendance_log sal ON sal.shiftID = sa.id
     LEFT JOIN payroll p
       ON p.userID = u.id AND DATE_FORMAT(p.month, '%Y-%m') = ?
     WHERE u.role = 'staff'
     GROUP BY u.id, u.fullName, u.email, p.id, p.totalPay, p.isCreated, p.isReceived, p.notes, p.created_at
     ORDER BY u.fullName`,
    [monthStr, monthStr, monthStr]
  );
  return rows;
};

export const upsertPayroll = async ({ userID, month, hoursWorked, totalPay, createdBy, notes }) => {
  const [result] = await db.query(
    `INSERT INTO payroll (userID, month, hoursWorked, totalPay, createdBy, isCreated, isReceived, notes)
     VALUES (?, ?, ?, ?, ?, 1, 0, ?)
     ON DUPLICATE KEY UPDATE
       hoursWorked = VALUES(hoursWorked),
       totalPay    = VALUES(totalPay),
       createdBy   = VALUES(createdBy),
       isCreated   = 1,
       notes       = VALUES(notes)`,
    [userID, month + '-01', hoursWorked, totalPay, createdBy, notes || null]
  );
  return result.insertId || result.affectedRows;
};

export const markReceived = async (id, userID) => {
  const [result] = await db.query(
    'UPDATE payroll SET isReceived = 1 WHERE id = ? AND userID = ? AND isCreated = 1',
    [id, userID]
  );
  return result.affectedRows;
};

export const getMyPayrollHistory = async (userID) => {
  const [rows] = await db.query(
    `SELECT p.*,
       (SELECT hr.rate FROM hourly_rate hr
        WHERE hr.userID = p.userID
          AND DATE_FORMAT(hr.effective_from, '%Y-%m') <= DATE_FORMAT(p.month, '%Y-%m')
        ORDER BY hr.effective_from DESC LIMIT 1) AS hourlyRate,
       a.fullName AS generatedByName
     FROM payroll p
     LEFT JOIN user a ON a.id = p.createdBy
     WHERE p.userID = ?
     ORDER BY p.month DESC`,
    [userID]
  );
  return rows;
};

export const getAllPayroll = async () => {
  const [rows] = await db.query('SELECT * FROM payroll');
  return rows;
};

export const getPayrollById = async (id) => {
  const [rows] = await db.query('SELECT * FROM payroll WHERE id = ?', [id]);
  return rows[0];
};

export const getPayrollByUserId = async (userID) => {
  const [rows] = await db.query('SELECT * FROM payroll WHERE userID = ?', [userID]);
  return rows;
};

export const createPayroll = async (data) => {
  const { userID, month, hoursWorked, createdBy, isCreated, isReceived, notes } = data;
  const [result] = await db.query(
    'INSERT INTO payroll (userID, month, hoursWorked, createdBy, isCreated, isReceived, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userID, month, hoursWorked, createdBy, isCreated || false, isReceived || false, notes]
  );
  return result.insertId;
};

export const updatePayroll = async (id, data) => {
  const { hoursWorked, isCreated, isReceived, notes } = data;
  await db.query(
    'UPDATE payroll SET hoursWorked = ?, isCreated = ?, isReceived = ?, notes = ? WHERE id = ?',
    [hoursWorked, isCreated, isReceived, notes, id]
  );
};

export const deletePayroll = async (id) => {
  await db.query('DELETE FROM payroll WHERE id = ?', [id]);
};

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
