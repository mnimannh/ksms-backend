import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const slugify = (str) =>
  (str || 'file').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/products/'),
  filename: (req, file, cb) => {
    const product = slugify(req.query.product);
    const variant = slugify(req.query.variant);
    const ts      = Date.now();
    cb(null, `${product}-${variant}-${ts}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

// POST /api/upload/product-image
router.post('/product-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/products/${req.file.filename}` });
});

export default router;
