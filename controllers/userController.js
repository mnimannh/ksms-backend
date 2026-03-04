import * as userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';

export const getUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add user with hashed password
export const addUser = async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const id = await userModel.createUser({ ...rest, password: hashedPassword });
    res.status(201).json({ message: 'User created', id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Edit user, optionally updating password
export const editUser = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    let updatedData = { ...rest };

    if (password && password.trim() !== '') {
      // Hash new password if provided
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    await userModel.updateUser(req.params.id, updatedData);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const removeUser = async (req, res) => {
  try {
    await userModel.deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/user/me
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await userModel.getUserById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Return only necessary info
    res.json({
      id: user.id,
      fullName: user.fullName,   // match your frontend
      email: user.email,
      role: user.role,
      status: user.status,
      last_login: user.last_login
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};