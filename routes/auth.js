import express from 'express';
import { loginUser, checkSession } from '../controllers/authController.js';

const router = express.Router();

// POST /auth/login
router.post('/login', loginUser);

// GET /auth/checkSession
router.get('/checkSession', checkSession);

export default router;
