// routes/shiftAttendanceRoutes.js
import express from 'express';
import {
  getAttendanceLogs,
  getAttendance,
  getAttendanceByShift,
  createAttendanceLog,
  updateAttendanceLog,
  deleteAttendanceLog,
  scanRFID,
} from '../controllers/shiftAttendanceController.js';

const router = express.Router();

// Specific POST routes must come BEFORE generic ones
router.post('/rfid/scan', scanRFID);   // ESP32 scan endpoint

router.get('/', getAttendanceLogs);
router.get('/shift/:shiftID', getAttendanceByShift);
router.get('/:id', getAttendance);
router.post('/', createAttendanceLog); // generic — after /rfid/scan
router.put('/:id', updateAttendanceLog);
router.delete('/:id', deleteAttendanceLog);

export default router;