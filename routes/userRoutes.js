import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getUsers,
  getUser,
  addUser,
  editUser,
  removeUser,
  getCurrentUser 
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', addUser);
router.put('/:id', editUser);
router.delete('/:id', removeUser);

// Current logged-in user
router.get('/me', authMiddleware, getCurrentUser);

export default router;