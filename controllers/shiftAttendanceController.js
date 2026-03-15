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
    // 1. Look up card — must be active
    const card = await rfidModel.getRFIDCardByUID(uid);
    if (!card) return res.status(404).json({ message: 'Card not registered or inactive' });

    const userID = card.userID;

    // 2. Find an active shift for this user
    //    Window: 5 min before start (early check-in) to 1 hour after end (late check-out)
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
      return res.status(200).json({ message: 'No active shift found for this user' });
    }

    const shift     = rows[0];
    const shiftID   = shift.id;
    const shiftStart = new Date(shift.startTime);
    const shiftEnd   = new Date(shift.endTime);
    const now        = new Date();

    // 3. Get existing attendance record for this shift + user
    const attendance = await attendanceModel.getAttendanceByShiftAndUser(shiftID, userID);

    // ── CHECK-IN ──────────────────────────────────────────────────
    if (!attendance || !attendance.checkIn) {
      // On time = within 5 minutes after shift start
      const isOnTime = now <= new Date(shiftStart.getTime() + 5 * 60 * 1000);
      const status = isOnTime ? 'Completed' : 'Late';
      const notes  = isOnTime ? 'On time check-in' : 'Late check-in';

      await attendanceModel.createAttendance({
        shiftID,
        userID,
        checkIn:  now,
        checkOut: null,
        status,
        notes,
      });

      return res.json({ message: `Check-in recorded`, status, notes });
    }

    // ── CHECK-OUT ─────────────────────────────────────────────────
    if (!attendance.checkOut) {
      // Block early check-out — must wait until shift end
      if (now < shiftEnd) {
        const minutesLeft = Math.ceil((shiftEnd - now) / 60000);
        return res.json({
          message: `Too early to check out. Shift ends in ${minutesLeft} minute(s).`,
        });
      }

      // 5-minute grace period after shift end = still on time
      const graceEnd  = new Date(shiftEnd.getTime() + 5 * 60 * 1000);
      const isOnTime  = now <= graceEnd;
      const existingNotes = attendance.notes || '';

      // Keep Late status if check-in was already Late
      const status = (!isOnTime || attendance.status === 'Late') ? 'Late' : 'Completed';
      const notes  = existingNotes + (isOnTime ? '; On time check-out' : '; Late check-out');

      await attendanceModel.updateAttendance(attendance.id, {
        checkIn:  attendance.checkIn,
        checkOut: now,
        status,
        notes,
      });

      return res.json({ message: `Check-out recorded`, status, notes });
    }

    // ── ALREADY DONE ──────────────────────────────────────────────
    return res.json({
      message: 'Shift already completed',
      status: attendance.status,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};