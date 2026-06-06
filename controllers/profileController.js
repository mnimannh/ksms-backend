import * as profileModel from '../models/profileModel.js';
import { uploadToSupabase, supabase } from '../config/supabase.js'; // Import Supabase utils
import path from 'path';
import bcrypt from 'bcrypt';

// Helper to safely strip the file path out of a profile public URL
const getProfileStoragePath = (url) => {
  if (!url) return null;
  const searchString = '/storage/v1/object/public/profile/';
  const index = url.indexOf(searchString);
  if (index !== -1) {
    return url.substring(index + searchString.length);
  }
  return null;
};

export const getProfile = async (req, res) => {
  try {
    const user = await profileModel.getProfile(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      last_login: user.last_login,
      is_temp_password: !!user.is_temp_password,
      phone: user.phone,
      address: user.address,
      matric_no: user.matric_no,
      course: user.course,
      year_of_study: user.year_of_study,
      created_at: user.created_at,
      profile_picture: user.profile_picture || null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    await profileModel.updateProfile(req.user.id, req.body);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await profileModel.changePassword(req.user.id, hashed);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── NEW SUPABASE PROFILE UPLOAD LOGIC ───────────────────────
export const uploadProfilePicture = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const userId = req.user.id;

    // 1. Check if the user already has an existing avatar file in Supabase
    const oldImageUrl = await profileModel.getProfilePictureUrl(userId);
    if (oldImageUrl) {
      const oldFilePath = getProfileStoragePath(oldImageUrl);
      if (oldFilePath) {
        // Remove old avatar file asynchronously to save space
        await supabase.storage.from('profile').remove([oldFilePath]);
      }
    }

    // 2. Generate a fresh, unique name for the new file
    const fileExt = path.extname(req.file.originalname);
    const uniqueFileName = `user-${userId}-${Date.now()}${fileExt}`;

    // 3. Upload buffer to 'profile' bucket
    const publicUrl = await uploadToSupabase(
      req.file.buffer,
      uniqueFileName,
      req.file.mimetype,
      'profile'
    );

    // 4. Update the SQL database string reference
    await profileModel.updateProfilePicture(userId, publicUrl);

    res.json({
      message: 'Profile picture updated successfully',
      url: publicUrl,
    });
  } catch (err) {
    console.error('Supabase profile upload error:', err);
    res.status(500).json({
      message: 'Failed to save profile picture',
      error: err.message,
    });
  }
};