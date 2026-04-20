// models/shiftPayrollReportModel.js
import db from '../db/connection.js'

export async function getStaffList() {
  const [rows] = await db.query(
    `SELECT id, fullName, email FROM user WHERE role = 'staff' ORDER BY fullName`
  )
  return rows
}

export async function getPayrollSummaryByMonth(month) {
  const [rows] = await db.query(
    `SELECT
       u.id AS userID,
       u.fullName,
       u.email,
       COALESCE(ROUND(
         SUM(CASE
           WHEN sal.checkIn IS NOT NULL AND sal.checkOut IS NOT NULL
           THEN TIMESTAMPDIFF(MINUTE, sal.checkIn, sal.checkOut) / 60.0
           ELSE 0
         END), 2), 0) AS hoursWorked,
       (SELECT hr.rate
        FROM hourly_rate hr
        WHERE hr.userID = u.id
          AND DATE_FORMAT(hr.effective_from, '%Y-%m') <= ?
        ORDER BY hr.effective_from DESC
        LIMIT 1) AS hourlyRate,
       p.id          AS payrollId,
       p.totalPay,
       p.isCreated,
       p.isReceived,
       p.notes
     FROM user u
     LEFT JOIN shift_assignment sa
       ON sa.userID = u.id AND DATE_FORMAT(sa.startTime, '%Y-%m') = ?
     LEFT JOIN shift_attendance_log sal ON sal.shiftID = sa.id
     LEFT JOIN payroll p
       ON p.userID = u.id AND DATE_FORMAT(p.month, '%Y-%m') = ?
     WHERE u.role = 'staff'
     GROUP BY u.id, u.fullName, u.email,
              p.id, p.totalPay, p.isCreated, p.isReceived, p.notes
     ORDER BY u.fullName`,
    [month, month, month]
  )
  return rows
}

export async function getAttendanceLogsByMonth(month) {
  const [rows] = await db.query(
    `SELECT
       sal.id,
       sal.shiftID,
       sal.userID,
       u.fullName,
       sal.checkIn,
       sal.checkOut,
       sal.status,
       sal.notes,
       sa.startTime,
       sa.endTime,
       sa.shiftType
     FROM shift_attendance_log sal
     JOIN shift_assignment sa ON sal.shiftID = sa.id
     JOIN user u ON u.id = sal.userID
     WHERE DATE_FORMAT(sa.startTime, '%Y-%m') = ?
     ORDER BY u.fullName, sa.startTime ASC`,
    [month]
  )
  return rows
}
