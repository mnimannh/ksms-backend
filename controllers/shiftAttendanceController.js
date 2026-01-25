import * as attendanceModel from '../models/shiftAttendanceModel.js';

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

// POST create attendance
export const createAttendanceLog = async (req, res) => {
  try {
    const insertId = await attendanceModel.createAttendance(req.body);
    res.status(201).json({ message: 'Attendance log created', id: insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update attendance
export const updateAttendanceLog = async (req, res) => {
  try {
    await attendanceModel.updateAttendance(req.params.id, req.body);
    res.json({ message: 'Attendance log updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE attendance
export const deleteAttendanceLog = async (req, res) => {
  try {
    await attendanceModel.deleteAttendance(req.params.id);
    res.json({ message: 'Attendance log deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
