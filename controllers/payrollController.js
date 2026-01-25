// controllers/payrollController.js
import * as payrollModel from '../models/payrollModel.js';

// GET all payroll
export const getPayrolls = async (req, res) => {
  try {
    const payrolls = await payrollModel.getAllPayroll();
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET payroll by ID
export const getPayroll = async (req, res) => {
  try {
    const payroll = await payrollModel.getPayrollById(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET payroll by userID
export const getPayrollByUser = async (req, res) => {
  try {
    const payrolls = await payrollModel.getPayrollByUserId(req.params.userID);
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST create payroll
export const createPayrollRecord = async (req, res) => {
  try {
    const insertId = await payrollModel.createPayroll(req.body);
    res.status(201).json({ message: 'Payroll record created', id: insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update payroll
export const updatePayrollRecord = async (req, res) => {
  try {
    await payrollModel.updatePayroll(req.params.id, req.body);
    res.json({ message: 'Payroll record updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE payroll
export const deletePayrollRecord = async (req, res) => {
  try {
    await payrollModel.deletePayroll(req.params.id);
    res.json({ message: 'Payroll record deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
