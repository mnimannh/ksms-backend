// routes/rfidCardRoutes.js
import express from 'express';
import {
  getRFIDCards,
  getRFIDCard,
  getRFIDCardByUID,
  createRFIDCard,
  updateRFIDCard,
  deleteRFIDCard
} from '../controllers/rfidCardController.js';

const router = express.Router();

router.get('/', getRFIDCards);
router.get('/uid/:uid', getRFIDCardByUID); // specific before /:id — avoids route conflict
router.get('/:id', getRFIDCard);
router.post('/', createRFIDCard);
router.put('/:id', updateRFIDCard);
router.delete('/:id', deleteRFIDCard);

export default router;