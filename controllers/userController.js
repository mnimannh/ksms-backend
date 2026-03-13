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

export const addUser = async (req, res) => {
  try {
    const { password, rfidUid, confirmPassword, ...rest } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = await userModel.createUser({ ...rest, password: hashedPassword });

    // Save RFID separately if staff
    if (rest.role === 'staff' && rfidUid) {
      await userModel.upsertRfid(id, rfidUid);
    }

    res.status(201).json({ message: 'User created', id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const editUser = async (req, res) => {
  try {
    const { password, rfidUid, confirmPassword, ...rest } = req.body;

    // Strip rfidUid from user table update
    let updatedData = { ...rest };

    if (password && password.trim() !== '') {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    await userModel.updateUser(req.params.id, updatedData);

    // Handle RFID table separately
    if (rest.role === 'staff' && rfidUid) {
      await userModel.upsertRfid(req.params.id, rfidUid);
    } else if (rest.role !== 'staff') {
      // Remove RFID if role changed away from staff
      await userModel.deleteRfidByUser(req.params.id);
    }

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

