// controllers/shiftAttendanceController.js
import * as attendanceModel from '../models/shiftAttendanceModel.js';
import * as rfidModel from '../models/rfidCardModel.js';
import * as shiftModel from '../models/shiftAssignmentModel.js';

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

// GET attendance by userID + month (YYYY-MM) — admin use
export const getAttendanceByUserMonth = async (req, res) => {
  try {
    const { userID, month } = req.params;
    const logs = await attendanceModel.getAttendanceByUserMonth(userID, month);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET own attendance by month — staff use (userID from JWT)
export const getMyAttendanceByMonth = async (req, res) => {
  try {
    const userID = req.user.id;
    const { month } = req.params;
    const logs = await attendanceModel.getAttendanceByUserMonth(userID, month);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /rfid/scan — called by ESP32 on every card tap
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
    const shift = await shiftModel.getCurrentShiftForUser(userID);

    if (!shift) {
      return res.json({ message: 'No active shift found' });
    }

    const shiftID    = shift.id;
    const shiftStart = new Date(shift.startTime);
    const shiftEnd   = new Date(shift.endTime);
    const now        = new Date();

    let attendance = await attendanceModel.getAttendanceByShiftAndUser(shiftID, userID);

    if (Array.isArray(attendance)) {
      attendance = attendance.length > 0 ? attendance[0] : null;
    }

    console.log("ATTENDANCE STATE:", attendance);

    // ===============================
    // CASE 1: NO RECORD OR PENDING (No check-in yet) → CHECK-IN
    // ===============================
    if (!attendance || attendance.checkIn === null) {
      const earlyLimit = new Date(shiftStart.getTime() - 5 * 60 * 1000);
      
      if (now < earlyLimit) {
        return res.json({
          message: 'Too early to check in. You can check in 5 minutes before shift starts.',
          name: card.card_name || card.name || 'User'
        });
      }

      const isOnTime = now <= shiftStart;
      const status = isOnTime ? 'Completed' : 'Late';
      const notes  = isOnTime ? 'On time check-in' : 'Late check-in';

      if (!attendance) {
        // Fallback just in case publishDrafts didn't run
        await attendanceModel.createAttendance({
          shiftID, userID, checkIn: now, checkOut: null, status, notes
        });
      } else {
        // Update the existing "Pending" record!
        await attendanceModel.updateAttendance(attendance.id, {
          checkIn: now, status, notes
        });
      }

      return res.json({
        message: 'checkin',
        name: card.card_name || card.name || 'User',
        status,
        notes
      });
    }

    // ===============================
    // CASE 2: HAS CHECK-IN, NO CHECK-OUT → CHECK-OUT
    // ===============================
    if (attendance.checkIn !== null && attendance.checkOut === null) {
      if (now < shiftEnd) {
        const minutesLeft = Math.ceil((shiftEnd - now) / 60000);
        return res.json({
          message: 'Too early to check out. Shift ends in ' + minutesLeft + ' minute(s).',
          name: card.card_name || card.name || 'User'
        });
      }

      const graceEnd = new Date(shiftEnd.getTime() + 5 * 60 * 1000);
      const isOnTime = now <= graceEnd;

      const status = (!isOnTime || attendance.status === 'Late') ? 'Late' : 'Completed';
      const notes  = (attendance.notes || '') + (isOnTime ? '; On time check-out' : '; Late check-out');

      await attendanceModel.updateAttendance(attendance.id, {
        checkOut: now, status, notes
      });

      return res.json({
        message: 'checkout',
        name: card.card_name || card.name || 'User',
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
        name: card.card_name || card.name || 'User'
      });
    }

    // ===============================
    // SAFETY FALLBACK (Prevents Hanging)
    // ===============================
    return res.status(200).json({ message: 'Scan received, but no action was matched.' });

  } catch (err) {
    console.error("SCAN ERROR:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};