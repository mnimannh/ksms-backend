// controllers/shiftAttendanceController.js
import * as attendanceModel from '../models/shiftAttendanceModel.js';
import * as rfidModel from '../models/rfidCardModel.js';
import db from '../db/connection.js';

// GET all attendance logs
export const getAttendanceLogs = async (req, res) => {
  try {
    const logs = await attendanceModel.getAllAttendance();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET attendance by ID
export const getAttendance = async (req, res) => {
  try {
    const log = await attendanceModel.getAttendanceById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Attendance log not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET attendance by shift ID
export const getAttendanceByShift = async (req, res) => {
  try {
    const logs = await attendanceModel.getAttendanceByShiftId(req.params.shiftID);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST create attendance log (manual)
export const createAttendanceLog = async (req, res) => {
  try {
    const insertId = await attendanceModel.createAttendance(req.body);
    res.status(201).json({ message: 'Attendance log created', id: insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update attendance log (manual)
export const updateAttendanceLog = async (req, res) => {
  try {
    await attendanceModel.updateAttendance(req.params.id, req.body);
    res.json({ message: 'Attendance log updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE attendance log
export const deleteAttendanceLog = async (req, res) => {
  try {
    await attendanceModel.deleteAttendance(req.params.id);
    res.json({ message: 'Attendance log deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /rfid/scan — called by ESP32 on every card tap
export const scanRFID = async (req, res) => {
  const uid = req.body?.uid;
  if (!uid) return res.status(400).json({ message: 'UID is required' });

  try {
    const card = await rfidModel.getRFIDCardByUID(uid);
    if (!card) {
      return res.status(404).json({ message: 'Card not registered or inactive' });
    }

    const userID = card.userID;

    // Get current shift
    const [rows] = await db.query(
      `SELECT * FROM shift_assignment
       WHERE userID = ?
       AND NOW() BETWEEN DATE_SUB(startTime, INTERVAL 5 MINUTE)
                     AND DATE_ADD(endTime, INTERVAL 1 HOUR)
       ORDER BY startTime ASC
       LIMIT 1`,
      [userID]
    );

    if (!rows || rows.length === 0) {
      return res.json({ message: 'No active shift found' });
    }

    const shift      = rows[0];
    const shiftID    = shift.id;
    const shiftStart = new Date(shift.startTime);
    const shiftEnd   = new Date(shift.endTime);
    const now        = new Date();

    let attendance = await attendanceModel.getAttendanceByShiftAndUser(shiftID, userID);

    if (Array.isArray(attendance)) {
      attendance = attendance.length > 0 ? attendance[0] : null;
    }

    console.log("ATTENDANCE:", attendance);

    // ===============================
    // CASE 1: NO RECORD → CHECK-IN
    // ===============================
    if (!attendance) {
      // 🔥 CHECK-IN: Only allowed 5 minutes BEFORE startTime
      const earlyLimit = new Date(shiftStart.getTime() - 5 * 60 * 1000);
      
      if (now < earlyLimit) {
        return res.json({
          message: 'Too early to check in. You can check in 5 minutes before shift starts.',
          name: card.name || 'User'
        });
      }

      const isOnTime = now <= shiftStart;
      const status = isOnTime ? 'Completed' : 'Late';
      const notes  = isOnTime ? 'On time check-in' : 'Late check-in';

      await attendanceModel.createAttendance({
        shiftID,
        userID,
        checkIn: now,
        checkOut: null,
        status,
        notes,
      });

      return res.json({
        message: 'checkin',
        name: card.name || 'User',
        status,
        notes
      });
    }

    // ===============================
    // CASE 2: HAS CHECK-IN, NO CHECK-OUT → CHECK-OUT
    // ===============================
    if (attendance.checkIn !== null && attendance.checkOut === null) {

      // 🔥 CHECK-OUT: Only allowed AFTER endTime
      if (now < shiftEnd) {
        const minutesLeft = Math.ceil((shiftEnd - now) / 60000);
        return res.json({
          message: 'Too early to check out. Shift ends in ' + minutesLeft + ' minute(s).',
          name: card.name || 'User'
        });
      }

      const graceEnd = new Date(shiftEnd.getTime() + 5 * 60 * 1000);
      const isOnTime = now <= graceEnd;

      const status = (!isOnTime || attendance.status === 'Late') ? 'Late' : 'Completed';
      const notes  = (attendance.notes || '') +
                     (isOnTime ? '; On time check-out' : '; Late check-out');

      await attendanceModel.updateAttendance(attendance.id, {
        checkOut: now,
        status,
        notes,
      });

      return res.json({
        message: 'checkout',
        name: card.name || 'User',
        status,
        notes
      });
    }

    // ===============================
    // CASE 3: ALREADY CHECKED IN & OUT
    // ===============================
    if (attendance.checkIn !== null && attendance.checkOut !== null) {
      return res.json({
        message: 'Already completed',
        name: card.name || 'User'
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};