import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadToSupabase } from '../config/supabase.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

// Helper to generate a unique filename
const generateUniqueName = (originalName) => {
  const fileExt = path.extname(originalName);
  return `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
};

// 1. PRODUCT/VARIANT IMAGE UPLOAD
router.post('/product-image', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const uniqueFileName = generateUniqueName(req.file.originalname);

    // Target the 'variant' bucket explicitly
    const publicUrl = await uploadToSupabase(
      req.file.buffer, 
      uniqueFileName, 
      req.file.mimetype,
      'variant' 
    );

    res.json({ url: publicUrl });
  } catch (err) {
    console.error('Supabase variant upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// 2. PROFILE PICTURE UPLOAD
router.post('/profile-picture', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const uniqueFileName = generateUniqueName(req.file.originalname);

    // Target the 'profile' bucket explicitly
    const publicUrl = await uploadToSupabase(
      req.file.buffer, 
      uniqueFileName, 
      req.file.mimetype,
      'profile' 
    );

    res.json({ url: publicUrl });
  } catch (err) {
    console.error('Supabase profile upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;