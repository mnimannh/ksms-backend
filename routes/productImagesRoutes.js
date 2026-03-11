// routes/productImagesRoutes.js
import express from 'express';
import {
  getProductImages,
  getProductImage,
  getImagesByVariant,
  createProductImage,
  updateProductImage,
  deleteProductImage,
  deleteImagesByVariant,
} from '../controllers/productImagesController.js';

const router = express.Router();

router.get('/',                          getProductImages);
router.get('/variant/:variant_id',       getImagesByVariant);      // must be before /:id
router.get('/:id',                       getProductImage);
router.post('/',                         createProductImage);
router.put('/:id',                       updateProductImage);
router.delete('/variant/:variant_id',    deleteImagesByVariant);   // used by AdminInventory.vue
router.delete('/:id',                    deleteProductImage);

export default router;