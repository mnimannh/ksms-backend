// controllers/rfidCardController.js
import * as rfidModel from '../models/rfidCardModel.js';

// GET all RFID cards
export const getRFIDCards = async (req, res) => {
  try {
    const cards = await rfidModel.getAllRFIDCards();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET RFID card by ID
export const getRFIDCard = async (req, res) => {
  try {
    const card = await rfidModel.getRFIDCardById(req.params.id);
    if (!card) return res.status(404).json({ message: 'RFID card not found' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET RFID card by UID (used by ESP32 scans)
export const getRFIDCardByUID = async (req, res) => {
  try {
    const card = await rfidModel.getRFIDCardByUID(req.params.uid);
    if (!card) return res.status(404).json({ message: 'RFID card not found or inactive' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST create a new RFID card
export const createRFIDCard = async (req, res) => {
  try {
    const { userID, rfid_uid, card_name } = req.body;

    if (!userID || !rfid_uid) {
      return res.status(400).json({ message: 'userID and rfid_uid are required' });
    }

    const insertId = await rfidModel.createRFIDCard({ userID, rfid_uid, card_name });
    res.status(201).json({ message: 'RFID card created', id: insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'This RFID UID is already registered' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update RFID card (partial update safe)
export const updateRFIDCard = async (req, res) => {
  try {
    const { userID, rfid_uid, card_name, is_active } = req.body;
    await rfidModel.updateRFIDCard(req.params.id, { userID, rfid_uid, card_name, is_active });
    res.json({ message: 'RFID card updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'This RFID UID is already registered' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE RFID card
export const deleteRFIDCard = async (req, res) => {
  try {
    await rfidModel.deleteRFIDCard(req.params.id);
    res.json({ message: 'RFID card deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};