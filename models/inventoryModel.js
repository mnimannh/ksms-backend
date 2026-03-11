// models/inventoryModel.js
import db from '../db/connection.js';


// Fetch all inventory items
export const getAllInventory = async () => {
  const [rows] = await db.query(`
    SELECT i.id, i.inventoryName, i.category_id, i.description, i.default_threshold, i.lastUpdated, c.name AS category
    FROM inventory i
    JOIN categories c ON i.category_id = c.id
  `);
  return rows;
};

// Fetch a single inventory item by ID
export const getInventoryById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM inventory WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Create new inventory item
export const createInventory = async (data) => {
  const { inventoryName, category_id, description, default_threshold } = data;
  const [result] = await db.query(
    'INSERT INTO inventory (inventoryName, category_id, description, default_threshold) VALUES (?, ?, ?, ?)',
    [inventoryName, category_id, description, default_threshold || 10]
  );
  return result.insertId;
};

// Update inventory item
export const updateInventory = async (id, data) => {
  const { inventoryName, category_id, description, default_threshold } = data;
  await db.query(
    'UPDATE inventory SET inventoryName = ?, category_id = ?, description = ?, default_threshold = ? WHERE id = ?',
    [inventoryName, category_id, description, default_threshold, id]
  );
};

// Delete inventory item
export const deleteInventory = async (id) => {
  await db.query('DELETE FROM inventory WHERE id = ?', [id]);
};
