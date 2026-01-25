// models/productImagesModel.js
import db from '../db/connection.js';

// Fetch all product images with variant info (no aliases)
export const getAllProductImages = async () => {
  const [rows] = await db.query(`
    SELECT product_images.id, product_images.image_url, variants.variant_name, variants.inventory_id
    FROM product_images
    JOIN variants ON product_images.variant_id = variants.id
  `);
  return rows;
};

// Fetch a single product image by ID
export const getProductImageById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM product_images WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Fetch images for a specific variant
export const getImagesByVariantId = async (variant_id) => {
  const [rows] = await db.query(
    'SELECT * FROM product_images WHERE variant_id = ?',
    [variant_id]
  );
  return rows;
};

// Create a new product image
export const createProductImage = async (data) => {
  const { variant_id, image_url } = data;
  const [result] = await db.query(
    'INSERT INTO product_images (variant_id, image_url) VALUES (?, ?)',
    [variant_id, image_url]
  );
  return result.insertId;
};

// Update a product image
export const updateProductImage = async (id, data) => {
  const { variant_id, image_url } = data;
  await db.query(
    'UPDATE product_images SET variant_id = ?, image_url = ? WHERE id = ?',
    [variant_id, image_url, id]
  );
};

// Delete a product image
export const deleteProductImage = async (id) => {
  await db.query('DELETE FROM product_images WHERE id = ?', [id]);
};
