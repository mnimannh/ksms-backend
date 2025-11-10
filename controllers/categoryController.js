import * as categoryModel from '../models/categoryModel.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = await categoryModel.getCategoryById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addCategory = async (req, res) => {
  try {
    const id = await categoryModel.createCategory(req.body.name);
    res.status(201).json({ id, message: 'Category created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const editCategory = async (req, res) => {
  try {
    const affectedRows = await categoryModel.updateCategory(req.params.id, req.body.name);
    if (!affectedRows) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeCategory = async (req, res) => {
  try {
    const affectedRows = await categoryModel.deleteCategory(req.params.id);
    if (!affectedRows) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
