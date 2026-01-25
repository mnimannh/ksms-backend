// controllers/shiftAssignmentController.js
import * as shiftModel from '../models/shiftAssignmentModel.js';

// GET all shifts
export const getShifts = async (req, res) => {
  try {
    const shifts = await shiftModel.getAllShifts();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET shift by ID
export const getShift = async (req, res) => {
  try {
    const shift = await shiftModel.getShiftById(req.params.id);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });
    res.json(shift);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST create shift
export const createShift = async (req, res) => {
  try {
    const insertId = await shiftModel.createShift(req.body);
    res.status(201).json({ message: 'Shift created', id: insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update shift
export const updateShift = async (req, res) => {
  try {
    await shiftModel.updateShift(req.params.id, req.body);
    res.json({ message: 'Shift updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE shift
export const deleteShift = async (req, res) => {
  try {
    await shiftModel.deleteShift(req.params.id);
    res.json({ message: 'Shift deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
