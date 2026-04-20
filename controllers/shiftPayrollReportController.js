// controllers/shiftPayrollReportController.js
import {
  getStaffList,
  getPayrollSummaryByMonth,
  getAttendanceLogsByMonth,
} from '../models/shiftPayrollReportModel.js'

function buildStaffRows(payrollSummary, attendanceLogs) {
  return payrollSummary.map(s => {
    const logs        = attendanceLogs.filter(l => l.userID === s.userID)
    const hoursWorked = parseFloat(s.hoursWorked) || 0
    const hourlyRate  = parseFloat(s.hourlyRate)  || 0
    const attended    = logs.filter(l => l.status === 'Completed' || l.status === 'Late').length
    const avgHoursPerShift = attended > 0
      ? parseFloat((hoursWorked / attended).toFixed(2)) : 0
    const payPerShift = parseFloat((hourlyRate * avgHoursPerShift).toFixed(2))
    const totalPay    = parseFloat((hourlyRate * hoursWorked).toFixed(2))

    return {
      userID:          s.userID,
      fullName:        s.fullName,
      email:           s.email,
      hourlyRate,
      shiftsAssigned:  logs.length,
      completed:       logs.filter(l => l.status === 'Completed').length,
      late:            logs.filter(l => l.status === 'Late').length,
      missed:          logs.filter(l => l.status === 'Missed').length,
      hoursWorked,
      avgHoursPerShift,
      payPerShift,
      totalPay,
      payrollCreated:  !!s.isCreated,
      payrollReceived: !!s.isReceived,
    }
  })
}

function buildSummary(staffRows, attendanceLogs) {
  const totalShifts     = attendanceLogs.length
  const completedShifts = attendanceLogs.filter(l => l.status === 'Completed').length
  const lateShifts      = attendanceLogs.filter(l => l.status === 'Late').length
  const missedShifts    = attendanceLogs.filter(l => l.status === 'Missed').length
  const totalHours      = staffRows.reduce((s, r) => s + r.hoursWorked, 0)
  const totalPay        = staffRows.reduce((s, r) => s + r.totalPay,    0)
  const payrollCreated  = staffRows.filter(r => r.payrollCreated).length
  const attendRate      = totalShifts > 0
    ? Math.round(((completedShifts + lateShifts) / totalShifts) * 100) : 0

  return {
    totalStaff:     staffRows.length,
    totalShifts,
    completedShifts,
    lateShifts,
    missedShifts,
    totalHours:     parseFloat(totalHours.toFixed(2)),
    totalPay:       parseFloat(totalPay.toFixed(2)),
    payrollCreated,
    attendRate,
  }
}

// GET /api/reports/shift-payroll/staff
export async function listStaff(req, res) {
  try {
    const staff = await getStaffList()
    res.json({ success: true, data: staff })
  } catch (err) {
    console.error('[ShiftPayrollReport] listStaff error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch staff list.' })
  }
}

// GET /api/reports/shift-payroll?month=2026-04
export async function generateReport(req, res) {
  try {
    const { month } = req.query
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'month query param required (YYYY-MM).' })
    }

    const [payrollSummary, attendanceLogs] = await Promise.all([
      getPayrollSummaryByMonth(month),
      getAttendanceLogsByMonth(month),
    ])

    const staffRows = buildStaffRows(payrollSummary, attendanceLogs)
    const summary   = buildSummary(staffRows, attendanceLogs)

    res.json({
      success: true,
      meta: { month, generatedAt: new Date().toISOString() },
      data: { staffRows, attendanceLogs, summary },
    })
  } catch (err) {
    console.error('[ShiftPayrollReport] generateReport error:', err)
    res.status(500).json({ success: false, message: 'Failed to generate report.' })
  }
}
