import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authMiddleware from '../middleware/auth.js';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController.js';
import { updateProfilePicture } from '../models/profileModel.js';
import db from '../db/connection.js';

const slugify = (str) =>
  (str || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const router = express.Router();

router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profile/'),
  filename: (req, file, cb) => {
    db.query('SELECT fullName FROM user WHERE id = ?', [req.user.id])
      .then(([rows]) => {
        const name = slugify(rows[0]?.fullName || `user-${req.user.id}`);
        cb(null, `${name}-${req.user.id}${path.extname(file.originalname).toLowerCase()}`);
      })
      .catch(() => {
        cb(null, `user-${req.user.id}${path.extname(file.originalname).toLowerCase()}`);
      });
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

router.get('/',         getProfile);
router.put('/',         updateProfile);
router.put('/password', changePassword);

router.post('/picture', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const newUrl = `/uploads/profile/${req.file.filename}`;
  try {
    // Delete old file from disk if it exists and is different from the new one
    const [rows] = await db.query('SELECT profile_picture FROM user WHERE id = ?', [req.user.id]);
    const oldUrl = rows[0]?.profile_picture;
    if (oldUrl && oldUrl !== newUrl) {
      const oldPath = path.join('uploads/profile', path.basename(oldUrl));
      fs.unlink(oldPath, () => {}); // fire-and-forget, ignore if already missing
    }

    await updateProfilePicture(req.user.id, newUrl);
    res.json({ url: newUrl });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save profile picture', error: err.message });
  }
});

export default router;
