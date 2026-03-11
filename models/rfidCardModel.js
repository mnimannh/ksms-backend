// models/rfidCardModel.js
import db from '../db/connection.js';

// Fetch all RFID cards
export const getAllRFIDCards = async () => {
  const [rows] = await db.query(`
    SELECT *
    FROM rfid
  `);
  return rows;
};

// Fetch RFID card by ID
export const getRFIDCardById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM rfid WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Fetch RFID card by UID (used when ESP32 sends card scan)
export const getRFIDCardByUID = async (rfid_uid) => {
  const [rows] = await db.query(
    'SELECT * FROM rfid WHERE rfid_uid = ? AND is_active = 1',
    [rfid_uid]
  );
  return rows[0];
};

// Create a new RFID card
export const createRFIDCard = async (data) => {
  const { userID, rfid_uid, card_name } = data;
  const [result] = await db.query(
    'INSERT INTO rfid (userID, rfid_uid, card_name) VALUES (?, ?, ?)',
    [userID, rfid_uid, card_name || null]
  );
  return result.insertId;
};

// Update RFID card (e.g., deactivate lost card)
export const updateRFIDCard = async (id, data) => {
  const { userID, rfid_uid, card_name, is_active } = data;
  await db.query(
    'UPDATE rfid SET userID = ?, rfid_uid = ?, card_name = ?, is_active = ? WHERE id = ?',
    [userID, rfid_uid, card_name, is_active, id]
  );
};

// Delete RFID card
export const deleteRFIDCard = async (id) => {
  await db.query('DELETE FROM rfid WHERE id = ?', [id]);
};
