import express from 'express';
import authMiddleware from '../middleware/auth.js';
import * as hourlyRateController from '../controllers/hourlyRateController.js';

const router = express.Router();

router.get('/my', authMiddleware, hourlyRateController.getMyRates);
router.get('/:userID', hourlyRateController.getByUser);
router.post('/', hourlyRateController.create);
router.delete('/:id', hourlyRateController.remove);

export default router;
