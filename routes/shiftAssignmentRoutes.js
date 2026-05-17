import express from 'express';
import {
  getShifts, getShift, getShiftsForStaff, getShiftsByStaffId, // Added here
  createShift, updateShift, deleteShift,
  autoGenerate, publishSchedule, discardDraft,
} from '../controllers/shiftAssignmentController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Staff: own shifts only (published)
router.get('/staff/me', authMiddleware, getShiftsForStaff);

// Staff: colleague shifts for calendar comparison (MUST remain below /staff/me)
router.get('/staff/:id', authMiddleware, getShiftsByStaffId);

// Auto-schedule
router.post('/auto-generate', authMiddleware, autoGenerate);
router.post('/publish',       authMiddleware, publishSchedule);
router.delete('/draft',       authMiddleware, discardDraft);

// Admin CRUD
router.get('/',       authMiddleware, getShifts);
router.get('/:id',    authMiddleware, getShift);
router.post('/',      authMiddleware, createShift);
router.put('/:id',    authMiddleware, updateShift);
router.delete('/:id', authMiddleware, deleteShift);

export default router;