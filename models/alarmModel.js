// models/alarmModel.js
import db from '../db/connection.js';

export const getAllAlarms = async () => {
  const [rows] = await db.query(`
    SELECT a.id,
           v.variant_name AS variant,
           v.quantity AS stock,
           v.threshold,
           i.inventoryName AS product_name,
           c.name AS category_name,
           a.is_read,
           a.created_at
    FROM low_stock_alerts a
    INNER JOIN (
      SELECT variant_id, MAX(id) AS max_id
      FROM low_stock_alerts
      GROUP BY variant_id
    ) latest ON a.id = latest.max_id
    JOIN variants v ON a.variant_id = v.id
    JOIN inventory i ON v.inventory_id = i.id
    JOIN categories c ON i.category_id = c.id
    ORDER BY a.created_at DESC
  `);
  return rows;
};

export const markAlarmAsRead = async (id) => {
  const [result] = await db.query(
    'UPDATE low_stock_alerts SET is_read = 1 WHERE id = ?',
    [id]
  );
  return result.affectedRows;
};

/**
 * FIX 1 — Auto-resolve
 * Marks any UNREAD alarm as read if that variant's stock
 * has since recovered back to or above its threshold.
 * Called automatically every time getAlarms() is fetched.
 */
export const autoResolveAlarms = async () => {
  const [result] = await db.query(`
    DELETE a FROM low_stock_alerts a
    JOIN variants v ON a.variant_id = v.id
    WHERE a.is_read = 0
      AND v.quantity >= v.threshold
  `);
  return result.affectedRows;
};

/**
 * FIX 2 — Re-fireable alarms
 * Checks only UNREAD (active) alarms for a given variant.
 * Once an alarm is resolved (auto or manual), this returns false,
 * allowing a fresh alarm to fire if stock drops again.
 */
export const activeAlarmExists = async (variantId) => {
  const [rows] = await db.query(
    'SELECT id FROM low_stock_alerts WHERE variant_id = ? AND is_read = 0 LIMIT 1',
    [variantId]
  );
  return rows.length > 0;
};

/**
 * Creates a new low stock alarm for a variant.
 * Should be called from wherever stock quantity is updated
 * (e.g. after a sale or stock adjustment).
 */
export const createAlarm = async (variantId) => {
  await db.query(
    'INSERT INTO low_stock_alerts (variant_id, is_read, created_at) VALUES (?, 0, NOW())',
    [variantId]
  );
};