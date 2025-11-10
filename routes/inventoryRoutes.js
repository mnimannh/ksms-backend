// routes/inventoryRoutes.js
import express from 'express';
import {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/', getInventory);
router.get('/:id', getInventoryItem);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

export default router;
