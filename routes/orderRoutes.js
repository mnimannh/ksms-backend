// routes/orderRoutes.js
import express from 'express';
import { createOrder, getOrder, getVariantsForPOS } from '../controllers/orderController.js';

const router = express.Router();

// POST /api/orders
router.post('/', createOrder);

// GET /api/orders/:id
router.get('/:id', getOrder);

// GET /api/variants (POS)
router.get('/variants', getVariantsForPOS);

export default router;