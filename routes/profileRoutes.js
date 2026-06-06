import express from 'express';
import multer from 'multer';
import path from 'path';

import authMiddleware from '../middleware/auth.js';

import {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture
} from '../controllers/profileController.js';

const router = express.Router();

router.use(authMiddleware);

// ── Multer Memory Storage (Crucial for Supabase) ──────────────
const storage = multer.memoryStorage();

// ── Upload Config ───────────────────────────────────────────
const upload = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const isValid = allowed.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (!isValid) {
      return cb(new Error('Only jpeg, jpg, png, and webp allowed'));
    }

    cb(null, true);
  },
});

// ── Routes ──────────────────────────────────────────────────
router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);

// Handles the upload to req.file.buffer
router.post(
  '/picture',
  upload.single('image'),
  uploadProfilePicture
);

export default router;