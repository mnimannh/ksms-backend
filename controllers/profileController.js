import * as profileModel from '../models/profileModel.js';
import bcrypt from 'bcrypt';
import { uploadToCloudinary } from '../config/cloudinary.js';

export const getProfile = async (req, res) => {
  try {
    const user = await profileModel.getProfile(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id:               user.id,
      fullName:         user.fullName,
      email:            user.email,
      role:             user.role,
      status:           user.status,
      last_login:       user.last_login,
      is_temp_password: !!user.is_temp_password,
      phone:            user.phone,
      address:          user.address,
      matric_no:        user.matric_no,
      course:           user.course,
      year_of_study:    user.year_of_study,
      created_at:       user.created_at,
      profile_picture:  user.profile_picture || null,
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
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await profileModel.changePassword(req.user.id, hashed);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'ksms/profiles',
      public_id: `user-${req.user.id}`,
      overwrite: true,
    });
    await profileModel.updateProfilePicture(req.user.id, result.secure_url);
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save profile picture', error: err.message });
  }
};
