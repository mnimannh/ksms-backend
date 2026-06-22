// models/loadCellModel.js
import db from '../db/connection.js';

/**
 * Get all load cells with their assigned variant + product info
 */
export const getAllLoadCells = async () => {
  const [rows] = await db.query(`
    SELECT lc.*,
           v.variant_name,
           v.quantity AS variant_quantity,
           v.threshold AS variant_threshold,
           v.barcode AS variant_barcode,
           i.inventoryName AS product_name
    FROM load_cells lc
    LEFT JOIN variants v ON lc.variant_id = v.id
    LEFT JOIN inventory i ON v.inventory_id = i.id
    ORDER BY lc.created_at DESC
  `);
  return rows;
};

/**
 * Get a single load cell by ID
 */
export const getLoadCellById = async (id) => {
  const [rows] = await db.query(`
    SELECT lc.*,
           v.variant_name,
           v.quantity AS variant_quantity,
           v.threshold AS variant_threshold,
           v.barcode AS variant_barcode,
           i.inventoryName AS product_name
    FROM load_cells lc
    LEFT JOIN variants v ON lc.variant_id = v.id
    LEFT JOIN inventory i ON v.inventory_id = i.id
    WHERE lc.id = ?
  `, [id]);
  return rows[0];
};

/**
 * Get a load cell by its hardware sensor UID
 */
export const getLoadCellBySensorUid = async (sensorUid) => {
  const [rows] = await db.query(
    'SELECT * FROM load_cells WHERE sensor_uid = ?',
    [sensorUid]
  );
  return rows[0];
};

/**
 * Register a new load cell sensor
 */
export const createLoadCell = async (data) => {
  const { sensor_uid, calibration_factor, empty_weight, unit_weight } = data;
  const [result] = await db.query(
    `INSERT INTO load_cells (sensor_uid, calibration_factor, empty_weight, unit_weight, status)
     VALUES (?, ?, ?, ?, 'unassigned')`,
    [sensor_uid, calibration_factor || null, empty_weight || 0, unit_weight || 0]
  );
  return result.insertId;
};

/**
 * Update load cell calibration / metadata
 */
export const updateLoadCell = async (id, data) => {
  const { sensor_uid, calibration_factor, empty_weight, unit_weight } = data;
  await db.query(
    `UPDATE load_cells
     SET sensor_uid = ?, calibration_factor = ?, empty_weight = ?, unit_weight = ?
     WHERE id = ?`,
    [sensor_uid, calibration_factor, empty_weight, unit_weight, id]
  );
};

/**
 * Delete a load cell — also resets the variant's tracking type if assigned
 */
export const deleteLoadCell = async (id) => {
  // First check if it's assigned to a variant
  const [rows] = await db.query('SELECT variant_id FROM load_cells WHERE id = ?', [id]);
  if (rows[0]?.variant_id) {
    await db.query(
      "UPDATE variants SET stock_tracking_type = 'manual' WHERE id = ?",
      [rows[0].variant_id]
    );
  }
  await db.query('DELETE FROM load_cells WHERE id = ?', [id]);
};

/**
 * Assign a load cell to a variant
 * Sets the load cell status to 'active' and the variant's tracking type to 'load_cell'
 */
export const assignVariant = async (id, variantId) => {
  // Update load cell
  await db.query(
    "UPDATE load_cells SET variant_id = ?, status = 'active' WHERE id = ?",
    [variantId, id]
  );
  // Update variant tracking type
  await db.query(
    "UPDATE variants SET stock_tracking_type = 'load_cell' WHERE id = ?",
    [variantId]
  );
};

/**
 * Unassign a load cell from its variant
 * Resets load cell status to 'unassigned' and variant's tracking type back to 'manual'
 */
export const unassignVariant = async (id) => {
  // Get current variant_id before unassigning
  const [rows] = await db.query('SELECT variant_id FROM load_cells WHERE id = ?', [id]);
  const variantId = rows[0]?.variant_id;

  // Unassign load cell
  await db.query(
    "UPDATE load_cells SET variant_id = NULL, status = 'unassigned' WHERE id = ?",
    [id]
  );

  // Reset variant tracking type
  if (variantId) {
    await db.query(
      "UPDATE variants SET stock_tracking_type = 'manual' WHERE id = ?",
      [variantId]
    );
  }
};

/**
 * Record a weight reading from an IoT sensor
 * This is the core function called by the hardware endpoint.
 *
 * Steps:
 * 1. Look up sensor by UID
 * 2. Calculate quantity from weight using calibration
 * 3. Update load_cells table (latest_weight, calculated_quantity, last_seen)
 * 4. Sync variant quantity
 * 5. Insert weight log
 * 6. Return data needed for alert checking
 */
export const recordWeight = async (sensorUid, weight) => {
  // 1. Look up the sensor
  const sensor = await getLoadCellBySensorUid(sensorUid);
  if (!sensor) return null;
  if (!sensor.variant_id) return { error: 'Sensor not assigned to any variant' };

  // 1b. Get the variant's unit_weight (preferred) or fall back to the load cell's
  const [variantData] = await db.query(
    'SELECT unit_weight FROM variants WHERE id = ?',
    [sensor.variant_id]
  );
  const variantUnitWeight = parseFloat(variantData[0]?.unit_weight) || 0;
  const sensorUnitWeight = parseFloat(sensor.unit_weight) || 0;
  const unitWeight = variantUnitWeight || sensorUnitWeight;
  const emptyWeight = parseFloat(sensor.empty_weight) || 0;

  // 2. Calculate quantity
  let calculatedQty = 0;
  if (unitWeight > 0) {
    calculatedQty = Math.max(0, Math.floor((weight - emptyWeight) / unitWeight));
  }

  // 3. Update load cell record
  await db.query(
    `UPDATE load_cells
     SET latest_weight = ?, calculated_quantity = ?, last_seen = NOW()
     WHERE id = ?`,
    [weight, calculatedQty, sensor.id]
  );

  // 4. Sync the variant's quantity
  await db.query(
    'UPDATE variants SET quantity = ? WHERE id = ?',
    [calculatedQty, sensor.variant_id]
  );

  // 5. Insert weight log
  await db.query(
    'INSERT INTO load_cell_logs (load_cell_id, weight, quantity) VALUES (?, ?, ?)',
    [sensor.id, weight, calculatedQty]
  );

  // 6. Get variant threshold for alert checking
  const [variantRows] = await db.query(
    'SELECT quantity, threshold FROM variants WHERE id = ?',
    [sensor.variant_id]
  );

  return {
    loadCellId: sensor.id,
    variantId: sensor.variant_id,
    weight,
    calculatedQty,
    threshold: variantRows[0]?.threshold || 0,
    belowThreshold: calculatedQty < (variantRows[0]?.threshold || 0),
  };
};

/**
 * Get recent weight logs for a specific load cell
 */
export const getLoadCellLogs = async (loadCellId, limit = 50) => {
  const [rows] = await db.query(
    'SELECT * FROM load_cell_logs WHERE load_cell_id = ? ORDER BY recorded_at DESC LIMIT ?',
    [loadCellId, limit]
  );
  return rows;
};

/**
 * Get variants available for assignment (manual tracking type and not already assigned to another load cell)
 */
export const getAvailableVariants = async () => {
  const [rows] = await db.query(`
    SELECT v.id, v.variant_name, v.barcode, v.quantity, v.threshold,
           i.inventoryName AS product_name
    FROM variants v
    JOIN inventory i ON v.inventory_id = i.id
    WHERE v.stock_tracking_type = 'manual'
      AND v.id NOT IN (SELECT variant_id FROM load_cells WHERE variant_id IS NOT NULL)
    ORDER BY i.inventoryName, v.variant_name
  `);
  return rows;
};
