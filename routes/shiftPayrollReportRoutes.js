// routes/shiftPayrollReportRoutes.js
import express from 'express'
import { listStaff, generateReport } from '../controllers/shiftPayrollReportController.js'

const router = express.Router()

// GET /api/reports/shift-payroll/staff   — staff dropdown for toolbar
router.get('/staff', listStaff)

// GET /api/reports/shift-payroll?month=2026-04  — full report data
router.get('/', generateReport)

export default router
