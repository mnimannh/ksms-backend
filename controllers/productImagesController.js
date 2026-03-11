// controllers/productImagesController.js
import * as productImagesModel from '../models/productImagesModel.js';

// GET all product images
export const getProductImages = async (req, res) => {
  try {
    const images = await productImagesModel.getAllProductImages();
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET product image by ID
export const getProductImage = async (req, res) => {
  try {
    const image = await productImagesModel.getProductImageById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Product image not found' });
    res.json(image);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET images for a specific variant
export const getImagesByVariant = async (req, res) => {
  try {
    const images = await productImagesModel.getImagesByVariantId(req.params.variant_id);
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST create product image
export const createProductImage = async (req, res) => {
  try {
    const insertId = await productImagesModel.createProductImage(req.body);
    res.status(201).json({ message: 'Product image created', id: insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update product image
export const updateProductImage = async (req, res) => {
  try {
    await productImagesModel.updateProductImage(req.params.id, req.body);
    res.json({ message: 'Product image updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE product image by ID
export const deleteProductImage = async (req, res) => {
  try {
    await productImagesModel.deleteProductImage(req.params.id);
    res.json({ message: 'Product image deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Add at the bottom of productImagesController.js
export const deleteImagesByVariant = async (req, res) => {
  try {
    await productImagesModel.deleteImagesByVariantId(req.params.variant_id);
    res.json({ message: 'Images deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};