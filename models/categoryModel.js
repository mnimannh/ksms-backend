import db from '../db/connection.js';

// Get all categories
export const getAllCategories = async () => {
  const [rows] = await db.query('SELECT * FROM categories');
  return rows;
};

// Get category by ID
export const getCategoryById = async (id) => {
  const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0];
};

// Create new category
export const createCategory = async (name) => {
  const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
  return result.insertId;
};

// Update category
export const updateCategory = async (id, name) => {
  const [result] = await db.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  return result.affectedRows;
};

// Delete category
export const deleteCategory = async (id) => {
  const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows;
};
