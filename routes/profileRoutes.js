import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import authMiddleware from '../middleware/auth.js';

import {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture
} from '../controllers/profileController.js';

const router = express.Router();

router.use(authMiddleware);

// ── Ensure upload folder exists ─────────────────────────────
const uploadPath = 'uploads/profile';

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ── Multer Storage ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    // example: user-5.jpg
    const fileName = `user-${req.user.id}${ext}`;

    cb(null, fileName);
  },
});

// ── Upload Config ───────────────────────────────────────────
const upload = multer({
  storage,

  limits: {
    fileSize: 3 * 1024 * 1024,
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

router.post(
  '/picture',
  upload.single('image'),
  uploadProfilePicture
);

export default router;