import * as categoryModel from '../models/categoryModel.js';

// ── Get all categories ──
export const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Get single category ──
export const getCategory = async (req, res) => {
  try {
    const category = await categoryModel.getCategoryById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Add new category ──
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const id = await categoryModel.createCategory(name.trim());

    // Return full object for frontend
    res.status(201).json({
      id,
      name: name.trim(),
      created_at: new Date().toISOString()
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Edit category ──
export const editCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const affectedRows = await categoryModel.updateCategory(req.params.id, name.trim());

    if (!affectedRows) return res.status(404).json({ message: 'Category not found' });

    // Return full object for frontend
    res.json({
      id: Number(req.params.id),
      name: name.trim()
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Remove category ──
export const removeCategory = async (req, res) => {
  try {
    const affectedRows = await categoryModel.deleteCategory(req.params.id);

    if (!affectedRows) return res.status(404).json({ message: 'Category not found' });

    res.json({ message: 'Category deleted' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};