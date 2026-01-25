// routes/shiftAttendanceRoutes.js
import express from 'express';
import {
  getAttendanceLogs,
  getAttendance,
  getAttendanceByShift,
  createAttendanceLog,
  updateAttendanceLog,
  deleteAttendanceLog
} from '../controllers/shiftAttendanceController.js';

const router = express.Router();

// Routes
router.get('/', getAttendanceLogs);
router.get('/:id', getAttendance);
router.get('/shift/:shiftID', getAttendanceByShift);
router.post('/', createAttendanceLog);
router.put('/:id', updateAttendanceLog);
router.delete('/:id', deleteAttendanceLog);

export default router;