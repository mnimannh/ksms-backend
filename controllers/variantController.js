// controllers/variantController.js
import * as variantModel from '../models/variantModel.js';

// GET all variants
export const getVariants = async (req, res) => {
  try {
    // We use the new joined function to get image_url and category_id
    const variants = await variantModel.getAllVariants();
    res.json(variants);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET variant by ID
export const getVariant = async (req, res) => {
  try {
    const variant = await variantModel.getVariantById(req.params.id);
    if (!variant) return res.status(404).json({ message: 'Variant not found' });
    res.json(variant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getVariantByBarcodeController = async (req, res) => {
  try {
    const barcode = req.params.barcode;
    const variant = await variantModel.getVariantByBarcode(barcode);

    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    res.json(variant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST create variant
export const createVariantItem = async (req, res) => {
  try {
    const insertId = await variantModel.createVariant(req.body);
    res.status(201).json({ message: 'Variant created', id: insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update variant
export const updateVariantItem = async (req, res) => {
  try {
    await variantModel.updateVariant(req.params.id, req.body);
    res.json({ message: 'Variant updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE variant
export const deleteVariantItem = async (req, res) => {
  try {
    await variantModel.deleteVariant(req.params.id);
    res.json({ message: 'Variant deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET variants for POS (includes image_url, category_id)
export const getPosVariants = async (req, res) => {
  try {
    const variants = await variantModel.getVariantsForPOS();
    res.json(variants);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};