import express from 'express';
import * as hourlyRateController from '../controllers/hourlyRateController.js';

const router = express.Router();

router.get('/:userID', hourlyRateController.getByUser);
router.post('/', hourlyRateController.create);
router.delete('/:id', hourlyRateController.remove);

export default router;
