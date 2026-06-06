import * as productImagesModel from '../models/productImagesModel.js';
import { supabase } from '../config/supabase.js'; // Import supabase instance

// Helper function to extract storage path from a public Supabase URL
const getStoragePathFromUrl = (url) => {
  if (!url) return null;
  // Looks for "/storage/v1/object/public/products/" in your URL
  const searchString = '/storage/v1/object/public/products/';
  const index = url.indexOf(searchString);
  if (index !== -1) {
    return url.substring(index + searchString.length);
  }
  return null;
};

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

// DELETE a single product image by ID (UPDATED)
export const deleteProductImage = async (req, res) => {
  try {
    // 1. Find the image record first to get its URL
    const image = await productImagesModel.getProductImageById(req.params.id);
    
    if (image && image.image_url) {
      const filePath = getStoragePathFromUrl(image.image_url);
      if (filePath) {
        // 2. Delete the actual file from your Supabase 'products' bucket
        await supabase.storage.from('products').remove([filePath]);
      }
    }

    // 3. Delete the reference row from MySQL
    await productImagesModel.deleteProductImage(req.params.id);
    res.json({ message: 'Product image deleted from DB and Storage' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE all images for a variant (UPDATED)
export const deleteImagesByVariant = async (req, res) => {
  try {
    // 1. Fetch all image records associated with this variant
    const images = await productImagesModel.getImagesByVariantId(req.params.variant_id);
    
    if (images && images.length > 0) {
      // 2. Build an array of file paths to delete from Supabase
      const pathsToDelete = images
        .map(img => getStoragePathFromUrl(img.image_url))
        .filter(path => path !== null);

      if (pathsToDelete.length > 0) {
        await supabase.storage.from('products').remove(pathsToDelete);
      }
    }

    // 3. Delete all reference rows from MySQL
    await productImagesModel.deleteImagesByVariantId(req.params.variant_id);
    res.json({ message: 'All variant images deleted from DB and Storage' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};