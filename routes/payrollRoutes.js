import express from 'express';
import authMiddleware from '../middleware/auth.js';
import * as payrollController from '../controllers/payrollController.js';

const router = express.Router();

// Staff: own records + mark received
router.get('/my-records', authMiddleware, payrollController.getMyPayroll);
router.patch('/:id/received', authMiddleware, payrollController.markReceived);

// Admin: month summary + generate
router.get('/month/:month', payrollController.getMonthSummary);
router.post('/generate', authMiddleware, payrollController.generate);
router.post('/generate-all', authMiddleware, payrollController.generateAll);

// User-specific
router.get('/user/:userID', payrollController.getPayrollByUser);

// General CRUD
router.get('/', payrollController.getPayrolls);
router.get('/:id', payrollController.getPayroll);
router.post('/', payrollController.createPayrollRecord);
router.put('/:id', payrollController.updatePayrollRecord);
router.delete('/:id', payrollController.deletePayrollRecord);

export default router;
