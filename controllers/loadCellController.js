// controllers/loadCellController.js
import * as loadCellModel from '../models/loadCellModel.js';
import * as alarmModel from '../models/alarmModel.js';

/**
 * GET /api/load-cells
 * List all load cells with variant info
 */
export const getAllLoadCells = async (req, res) => {
  try {
    const loadCells = await loadCellModel.getAllLoadCells();
    res.json(loadCells);
  } catch (err) {
    console.error('Error fetching load cells:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/load-cells/available-variants
 * Get variants that can be assigned to a load cell
 */
export const getAvailableVariants = async (req, res) => {
  try {
    const variants = await loadCellModel.getAvailableVariants();
    res.json(variants);
  } catch (err) {
    console.error('Error fetching available variants:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/load-cells/:id
 * Get a single load cell
 */
export const getLoadCell = async (req, res) => {
  try {
    const loadCell = await loadCellModel.getLoadCellById(req.params.id);
    if (!loadCell) return res.status(404).json({ message: 'Load cell not found' });
    res.json(loadCell);
  } catch (err) {
    console.error('Error fetching load cell:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * POST /api/load-cells
 * Register a new load cell sensor
 */
export const createLoadCell = async (req, res) => {
  try {
    const insertId = await loadCellModel.createLoadCell(req.body);
    res.status(201).json({ message: 'Load cell registered', id: insertId });
  } catch (err) {
    console.error('Error creating load cell:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'A sensor with this UID already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * PUT /api/load-cells/:id
 * Update load cell calibration data
 */
export const updateLoadCell = async (req, res) => {
  try {
    await loadCellModel.updateLoadCell(req.params.id, req.body);
    res.json({ message: 'Load cell updated' });
  } catch (err) {
    console.error('Error updating load cell:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'A sensor with this UID already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * DELETE /api/load-cells/:id
 * Remove a load cell (also resets variant tracking type)
 */
export const deleteLoadCell = async (req, res) => {
  try {
    await loadCellModel.deleteLoadCell(req.params.id);
    res.json({ message: 'Load cell deleted' });
  } catch (err) {
    console.error('Error deleting load cell:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * PATCH /api/load-cells/:id/assign
 * Assign a load cell to a variant
 * Body: { variant_id: Number }
 */
export const assignVariant = async (req, res) => {
  try {
    const { variant_id } = req.body;
    if (!variant_id) return res.status(400).json({ message: 'variant_id is required' });

    await loadCellModel.assignVariant(req.params.id, variant_id);
    res.json({ message: 'Load cell assigned to variant' });
  } catch (err) {
    console.error('Error assigning variant:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * PATCH /api/load-cells/:id/unassign
 * Unassign a load cell from its variant
 */
export const unassignVariant = async (req, res) => {
  try {
    await loadCellModel.unassignVariant(req.params.id);
    res.json({ message: 'Load cell unassigned' });
  } catch (err) {
    console.error('Error unassigning variant:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * POST /api/load-cells/reading/:sensorUid
 * IoT endpoint — receive a weight reading from a hardware sensor
 * Body: { weight: Number }
 *
 * This is the core endpoint that:
 * 1. Records the weight
 * 2. Calculates & updates variant quantity
 * 3. Fires a low stock alert if below threshold
 */
export const recordReading = async (req, res) => {
  try {
    const { sensorUid } = req.params;
    const { weight } = req.body;

    if (weight === undefined || weight === null) {
      return res.status(400).json({ message: 'weight is required' });
    }

    const result = await loadCellModel.recordWeight(sensorUid, parseFloat(weight));

    if (!result) {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    // Fire low stock alert if below threshold
    if (result.belowThreshold) {
      const alreadyAlerted = await alarmModel.activeAlarmExists(result.variantId);
      if (!alreadyAlerted) {
        await alarmModel.createAlarm(result.variantId);
      }
    }

    res.json({
      message: 'Weight recorded',
      data: {
        weight: result.weight,
        calculatedQty: result.calculatedQty,
        threshold: result.threshold,
        alertTriggered: result.belowThreshold,
      },
    });
  } catch (err) {
    console.error('Error recording weight:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/load-cells/:id/logs
 * Get weight history for a load cell
 */
export const getLoadCellLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await loadCellModel.getLoadCellLogs(req.params.id, limit);
    res.json(logs);
  } catch (err) {
    console.error('Error fetching load cell logs:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
