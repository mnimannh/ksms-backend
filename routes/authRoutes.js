import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { loginUser, checkSession, getCurrentUser } from '../controllers/authController.js';

const router = express.Router();

// POST /auth/login
router.post('/login', loginUser);

// GET /auth/checkSession
router.get('/checkSession', checkSession);

// Current logged-in user
router.get('/me', authMiddleware, getCurrentUser);

export default router;
