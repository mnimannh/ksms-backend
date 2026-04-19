import * as payrollModel from '../models/payrollModel.js';

export const getMonthSummary = async (req, res) => {
  try {
    const { month } = req.params; // 'YYYY-MM'
    const rows = await payrollModel.getMonthSummary(month);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const generate = async (req, res) => {
  try {
    const { userID, month, hoursWorked, totalPay, notes } = req.body;
    const createdBy = req.user.id;
    if (!userID || !month || hoursWorked === undefined || totalPay === undefined)
      return res.status(400).json({ message: 'userID, month, hoursWorked, totalPay required' });
    await payrollModel.upsertPayroll({ userID, month, hoursWorked, totalPay, createdBy, notes });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const generateAll = async (req, res) => {
  try {
    const { month, records } = req.body;
    const createdBy = req.user.id;
    if (!month || !Array.isArray(records) || records.length === 0)
      return res.status(400).json({ message: 'month and records[] required' });
    for (const r of records) {
      await payrollModel.upsertPayroll({
        userID: r.userID,
        month,
        hoursWorked: r.hoursWorked,
        totalPay: r.totalPay,
        createdBy,
        notes: r.notes || null,
      });
    }
    res.json({ success: true, count: records.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const markReceived = async (req, res) => {
  try {
    const userID = req.user.id;
    const affected = await payrollModel.markReceived(req.params.id, userID);
    if (!affected) return res.status(404).json({ message: 'Record not found or not eligible' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getMyPayroll = async (req, res) => {
  try {
    const userID = req.user.id;
    const rows = await payrollModel.getMyPayrollHistory(userID);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getPayrolls = async (req, res) => {
  try {
    const payrolls = await payrollModel.getAllPayroll();
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getPayroll = async (req, res) => {
  try {
    const payroll = await payrollModel.getPayrollById(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getPayrollByUser = async (req, res) => {
  try {
    const payrolls = await payrollModel.getPayrollByUserId(req.params.userID);
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const createPayrollRecord = async (req, res) => {
  try {
    const insertId = await payrollModel.createPayroll(req.body);
    res.status(201).json({ message: 'Payroll record created', id: insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updatePayrollRecord = async (req, res) => {
  try {
    await payrollModel.updatePayroll(req.params.id, req.body);
    res.json({ message: 'Payroll record updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deletePayrollRecord = async (req, res) => {
  try {
    await payrollModel.deletePayroll(req.params.id);
    res.json({ message: 'Payroll record deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
