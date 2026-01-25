// routes/shiftAssignmentRoutes.js
import express from 'express';
import {
  getShifts,
  getShift,
  createShift,
  updateShift,
  deleteShift
} from '../controllers/shiftAssignmentController.js';

const router = express.Router();

router.get('/', getShifts);
router.get('/:id', getShift);
router.post('/', createShift);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);

export default router;
