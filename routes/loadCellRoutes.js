// routes/loadCellRoutes.js
import express from 'express';
import * as loadCellController from '../controllers/loadCellController.js';

const router = express.Router();

// List all load cells
router.get('/', loadCellController.getAllLoadCells);

// Get variants available for assignment
router.get('/available-variants', loadCellController.getAvailableVariants);

// IoT endpoint — receive weight reading (no auth — called by hardware)
router.post('/reading/:sensorUid', loadCellController.recordReading);

// Get a single load cell
router.get('/:id', loadCellController.getLoadCell);

// Register a new load cell
router.post('/', loadCellController.createLoadCell);

// Update load cell calibration
router.put('/:id', loadCellController.updateLoadCell);

// Delete a load cell
router.delete('/:id', loadCellController.deleteLoadCell);

// Assign / unassign variant
router.patch('/:id/assign', loadCellController.assignVariant);
router.patch('/:id/unassign', loadCellController.unassignVariant);

// Get weight logs for a load cell
router.get('/:id/logs', loadCellController.getLoadCellLogs);

export default router;
