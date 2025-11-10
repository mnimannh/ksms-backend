// controllers/inventoryController.js
import * as inventoryModel from '../models/inventoryModel.js';

// GET all inventory
export const getInventory = async (req, res) => {
  try {
    const items = await inventoryModel.getAllInventory();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET inventory by ID
export const getInventoryItem = async (req, res) => {
  try {
    const item = await inventoryModel.getInventoryById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST create inventory
export const createInventoryItem = async (req, res) => {
  try {
    const insertId = await inventoryModel.createInventory(req.body);
    res.status(201).json({ message: 'Inventory created', id: insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update inventory
export const updateInventoryItem = async (req, res) => {
  try {
    await inventoryModel.updateInventory(req.params.id, req.body);
    res.json({ message: 'Inventory updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE inventory
export const deleteInventoryItem = async (req, res) => {
  try {
    await inventoryModel.deleteInventory(req.params.id);
    res.json({ message: 'Inventory deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
