// models/rfidCardModel.js
import db from '../db/connection.js';

// Fetch all RFID cards
export const getAllRFIDCards = async () => {
  const [rows] = await db.query('SELECT * FROM rfid');
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

// Fetch RFID card by UID — only active cards (used by ESP32 scans)
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

// Partial update — only updates fields that are provided
export const updateRFIDCard = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.userID    !== undefined) { fields.push('userID = ?');    values.push(data.userID); }
  if (data.rfid_uid  !== undefined) { fields.push('rfid_uid = ?');  values.push(data.rfid_uid); }
  if (data.card_name !== undefined) { fields.push('card_name = ?'); values.push(data.card_name); }
  if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }

  if (fields.length === 0) return;

  values.push(id);
  await db.query(
    `UPDATE rfid SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
};

// Delete RFID card
export const deleteRFIDCard = async (id) => {
  await db.query('DELETE FROM rfid WHERE id = ?', [id]);
};

// Add to models/rfidCardModel.js
export const getUserById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM user WHERE id = ?',
    [id]
  );
  return rows[0];
};