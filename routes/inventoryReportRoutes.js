// routes/inventoryReportRoutes.js
import express from 'express'
import { generateReport, listCategories } from '../controllers/inventoryReportController.js'

const router = express.Router()

// Plug in your auth middleware here if needed:
// import { verifyToken, requireAdmin } from '../middleware/auth.js'
// router.use(verifyToken, requireAdmin)

// GET /api/reports/inventory/categories
router.get('/categories', listCategories)

// GET /api/reports/inventory?year=2025&month=3&categoryId=2
router.get('/', generateReport)

export default router