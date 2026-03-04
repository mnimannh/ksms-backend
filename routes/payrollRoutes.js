// routes/payrollRoutes.js
import * as payrollController from '../controllers/payrollController.js';
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getPayrolls,
  getPayroll,
  getPayrollByUser,
  createPayrollRecord,
  updatePayrollRecord,
  deletePayrollRecord
} from '../controllers/payrollController.js';

const router = express.Router();

// ✅ specific routes FIRST
router.get('/my-records', authMiddleware, payrollController.getMyPayroll);
router.get('/user/:userID', getPayrollByUser);

// ✅ general route
router.get('/', getPayrolls);

// ❗ dynamic LAST
router.get('/:id', getPayroll);

router.post('/', createPayrollRecord);
router.put('/:id', updatePayrollRecord);
router.delete('/:id', deletePayrollRecord);

export default router;