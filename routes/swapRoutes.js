import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { createSwap, getIncoming, getMine, getAll, respond, approve, reject, cancel } from '../controllers/swapController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/',                 getAll);       // admin
router.get('/incoming',         getIncoming);  // target staff
router.get('/mine',             getMine);      // requester staff
router.post('/',                createSwap);
router.patch('/:id/respond',    respond);      // target accepts/rejects
router.patch('/:id/approve',    approve);      // admin approves
router.patch('/:id/reject',     reject);       // admin rejects
router.delete('/:id',           cancel);       // requester cancels

export default router;
