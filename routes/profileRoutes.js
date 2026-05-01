import express from 'express';
import multer from 'multer';
import path from 'path';
import authMiddleware from '../middleware/auth.js';
import { getProfile, updateProfile, changePassword, uploadProfilePicture } from '../controllers/profileController.js';

const router = express.Router();

router.use(authMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

router.get('/',         getProfile);
router.put('/',         updateProfile);
router.put('/password', changePassword);
router.post('/picture', upload.single('image'), uploadProfilePicture);

export default router;
