// routes/productImagesRoutes.js
import express from 'express';
import {
  getProductImages,
  getProductImage,
  getImagesByVariant,
  createProductImage,
  updateProductImage,
  deleteProductImage
} from '../controllers/productImagesController.js';

const router = express.Router();

// Get all product images
router.get('/', getProductImages);

// Get a single product image by ID
router.get('/:id', getProductImage);

// Get all images for a specific variant
router.get('/variant/:variant_id', getImagesByVariant);

// Create a new product image
router.post('/', createProductImage);

// Update a product image by ID
router.put('/:id', updateProductImage);

// Delete a product image by ID
router.delete('/:id', deleteProductImage);

export default router;
