// routes/shiftAssignmentRoutes.js
import express from 'express';
import {
  getShifts,
  getShift,
  getShiftsForStaff,
  createShift,
  updateShift,
  deleteShift
} from '../controllers/shiftAssignmentController.js';
import authMiddleware from '../middleware/auth.js'; // your auth middleware

const router = express.Router();

// ── STAFF ROUTES ──
// Staff sees only their own assigned shifts
// Place BEFORE /:id so it’s not shadowed
router.get('/staff/me', authMiddleware, getShiftsForStaff);

// ── ADMIN ROUTES ──
// Admin can see all shifts
router.get('/', authMiddleware, getShifts);
router.get('/:id', authMiddleware, getShift);
router.post('/', authMiddleware, createShift);
router.put('/:id', authMiddleware, updateShift);
router.delete('/:id', authMiddleware, deleteShift);

export default router;