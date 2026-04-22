import express from 'express';
import { loginUser, checkSession } from '../controllers/authController.js';

const router = express.Router();

router.post('/login',        loginUser);
router.get('/checkSession',  checkSession);

export default router;
