import express from 'express';
import multer from 'multer';
import path from 'path';
import authMiddleware from '../middleware/auth.js';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController.js';
import { updateProfilePicture } from '../models/profileModel.js';

const router = express.Router();

router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profile/'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
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
  const url = `/uploads/profile/${req.file.filename}`;
  try {
    await updateProfilePicture(req.user.id, url);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save profile picture', error: err.message });
  }
});

export default router;
