import { login, getUserByEmail, setResetToken, getUserByResetToken, consumeResetToken } from '../models/authModel.js';
import { sendResetPasswordEmail } from '../utils/mailer.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// POST /auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const result = await login(email, password);

    if (!result.success) {
      const statusCode = result.message.includes('inactive') ? 400 : 401;
      return res.status(statusCode).json({ message: result.message });
    }

    const user = result.user;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      fullName: user.fullName,
      role: user.role,
      last_login: user.last_login,
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await getUserByEmail(email);

    if (user && user.status === 'active') {
      const token = randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await setResetToken(user.id, token, expiry);
      await sendResetPasswordEmail({ to: email, fullName: user.fullName, token });
    }

    // Always succeed to prevent email enumeration
    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /auth/reset-password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  try {
    const user = await getUserByResetToken(token);
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });

    const hashed = await bcrypt.hash(password, 10);
    await consumeResetToken(user.id, hashed);

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /auth/checkSession
export const checkSession = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid or expired token' });
    res.json({ message: 'Session valid', user: decoded });
  });
};
