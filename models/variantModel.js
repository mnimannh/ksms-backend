// models/variantModel.js
import db from '../db/connection.js';

// Fetch all variants
export const getAllVariants = async () => {
  const [rows] = await db.query(`
    SELECT v.id, v.variant_name, v.quantity, v.price, v.barcode, v.lastUpdated, v.inventory_id, i.inventoryName
    FROM variants v
    JOIN inventory i ON v.inventory_id = i.id
  `);
  return rows;
};

// Fetch variant by ID
export const getVariantById = async (id) => {
  const [rows] = await db.query('SELECT * FROM variants WHERE id = ?', [id]);
  return rows[0];
};

// Fetch variant by barcode
export const getVariantByBarcode = async (barcode) => {
  const [rows] = await db.query(
    'SELECT v.id, v.variant_name, v.price, v.quantity, v.barcode, i.inventoryName, i.category_id ' +
    'FROM variants v ' +
    'JOIN inventory i ON v.inventory_id = i.id ' +
    'WHERE TRIM(v.barcode) = ?',  // trim any extra spaces
    [barcode.trim()]
  );
  return rows[0]; // return single variant
};

// Create a variant
export const createVariant = async (data) => {
  const { inventory_id, variant_name, quantity, price, barcode } = data;
  const [result] = await db.query(
    'INSERT INTO variants (inventory_id, variant_name, quantity, price, barcode) VALUES (?, ?, ?, ?, ?)',
    [inventory_id, variant_name, quantity || 0, price, barcode]
  );
  return result.insertId;
};

// Update a variant
export const updateVariant = async (id, data) => {
  const { inventory_id, variant_name, quantity, price, barcode } = data;
  await db.query(
    'UPDATE variants SET inventory_id = ?, variant_name = ?, quantity = ?, price = ?, barcode = ? WHERE id = ?',
    [inventory_id, variant_name, quantity, price, barcode, id]
  );
};

// Delete a variant
export const deleteVariant = async (id) => {
  await db.query('DELETE FROM variants WHERE id = ?', [id]);
};

// New function specifically for the POS screen
export const getVariantsForPOS = async () => {
  const [rows] = await db.query(`
    SELECT 
        v.id, 
        v.variant_name, 
        v.price, 
        v.quantity,
        v.barcode,
        i.inventoryName, 
        i.category_id,
        v.inventory_id,
        MIN(img.image_url) AS image_url
    FROM variants v
    JOIN inventory i ON v.inventory_id = i.id
    LEFT JOIN product_images img ON v.id = img.variant_id
    GROUP BY 
        v.id, 
        v.variant_name, 
        v.price, 
        v.quantity,
        v.barcode,
        i.inventoryName, 
        i.category_id,
        v.inventory_id
  `);

  return rows;
};