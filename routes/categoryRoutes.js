import express from 'express';
import authMiddleware from '../middleware/auth.js';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', categoryController.addCategory);
router.put('/:id', categoryController.editCategory);
router.delete('/:id', categoryController.removeCategory);

export default router;

