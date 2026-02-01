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

// Get all RFID cards
router.get('/', getRFIDCards);

// Get RFID card by ID
router.get('/:id', getRFIDCard);

// Get RFID card by UID (for ESP32 scans)
router.get('/uid/:uid', getRFIDCardByUID);

// Create a new RFID card
router.post('/', createRFIDCard);

// Update RFID card by ID
router.put('/:id', updateRFIDCard);

// Delete RFID card by ID
router.delete('/:id', deleteRFIDCard);

export default router;
