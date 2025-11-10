// routes/variantRoutes.js
import express from 'express';
import {
  getVariants,
  getVariant,
  createVariantItem,
  updateVariantItem,
  deleteVariantItem
} from '../controllers/variantController.js';

const router = express.Router();

router.get('/', getVariants);
router.get('/:id', getVariant);
router.post('/', createVariantItem);
router.put('/:id', updateVariantItem);
router.delete('/:id', deleteVariantItem);

export default router;
