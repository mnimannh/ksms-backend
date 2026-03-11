// models/productImagesModel.js
import db from '../db/connection.js';

// Fetch all product images with variant info
export const getAllProductImages = async () => {
  const [rows] = await db.query(`
    SELECT product_images.id, product_images.image_url, product_images.is_main, product_images.image_order,
           variants.variant_name, variants.inventory_id
    FROM product_images
    JOIN variants ON product_images.variant_id = variants.id
  `);
  return rows;
};

// Fetch a single product image by ID
export const getProductImageById = async (id) => {
  const [rows] = await db.query('SELECT * FROM product_images WHERE id = ?', [id]);
  return rows[0];
};

// Fetch images for a specific variant
export const getImagesByVariantId = async (variant_id) => {
  const [rows] = await db.query(
    'SELECT * FROM product_images WHERE variant_id = ? ORDER BY image_order ASC',
    [variant_id]
  );
  return rows;
};

// Create a new product image
export const createProductImage = async (data) => {
  const { variant_id, image_url, is_main = 0, image_order = 1 } = data;
  const [result] = await db.query(
    'INSERT INTO product_images (variant_id, image_url, is_main, image_order) VALUES (?, ?, ?, ?)',
    [variant_id, image_url, is_main, image_order]
  );
  return result.insertId;
};

// Update a product image
export const updateProductImage = async (id, data) => {
  const { variant_id, image_url, is_main, image_order } = data;
  await db.query(
    'UPDATE product_images SET variant_id = ?, image_url = ?, is_main = ?, image_order = ? WHERE id = ?',
    [variant_id, image_url, is_main, image_order, id]
  );
};

// Delete a product image by ID
export const deleteProductImage = async (id) => {
  await db.query('DELETE FROM product_images WHERE id = ?', [id]);
};

// Delete all images for a variant  ← new
export const deleteImagesByVariantId = async (variant_id) => {
  await db.query('DELETE FROM product_images WHERE variant_id = ?', [variant_id]);
};