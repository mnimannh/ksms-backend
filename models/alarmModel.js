// models/alarmModel.js
import db from '../db/connection.js';

export const getAllAlarms = async () => {
  const [rows] = await db.query(`
    SELECT a.id,
           v.variant_name AS variant,
           v.quantity AS stock,
           v.threshold,
           a.is_read,
           a.created_at
    FROM low_stock_alerts a
    JOIN variants v ON a.variant_id = v.id
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