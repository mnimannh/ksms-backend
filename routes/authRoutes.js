import express from 'express';
import { loginUser, checkSession, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/login',           loginUser);
router.get('/checkSession',     checkSession);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

export default router;
