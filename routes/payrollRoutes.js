// routes/payrollRoutes.js
import express from 'express';
import {
  getPayrolls,
  getPayroll,
  getPayrollByUser,
  createPayrollRecord,
  updatePayrollRecord,
  deletePayrollRecord
} from '../controllers/payrollController.js';

const router = express.Router();

router.get('/', getPayrolls);                 // Get all payrolls
router.get('/:id', getPayroll);              // Get payroll by ID
router.get('/user/:userID', getPayrollByUser); // Get all payroll for a user
router.post('/', createPayrollRecord);       // Create payroll
router.put('/:id', updatePayrollRecord);     // Update payroll
router.delete('/:id', deletePayrollRecord);  // Delete payroll

export default router;