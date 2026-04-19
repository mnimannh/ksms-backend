import db from '../db/connection.js';

// INV-002: Variants with no sales in the last 30 days (but still in stock)
export const getSlowMovingVariants = async () => {
  const [rows] = await db.query(`
    SELECT v.id, v.variant_name, v.quantity
    FROM variants v
    WHERE v.quantity > 0
      AND v.id NOT IN (
        SELECT DISTINCT oi.variant_id
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      )
  `);
  return rows;
};

// INV-003: Variants with sell-through rate > 90% in the last 7 days
export const getHighSellThroughVariants = async () => {
  const [rows] = await db.query(`
    SELECT v.id, v.variant_name, v.quantity,
           SUM(oi.quantity) AS sold_last_week,
           ROUND(SUM(oi.quantity) / (SUM(oi.quantity) + v.quantity) * 100, 1) AS sell_through_rate
    FROM variants v
    JOIN order_items oi ON oi.variant_id = v.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY v.id, v.variant_name, v.quantity
    HAVING sell_through_rate > 90
  `);
  return rows;
};

// INV-004: Variants with revenue drop > 20% week-over-week
export const getRevenueDroppingVariants = async () => {
  const [rows] = await db.query(`
    SELECT v.id, v.variant_name,
           ROUND(SUM(CASE WHEN o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                          THEN oi.quantity * v.price ELSE 0 END), 2) AS this_week,
           ROUND(SUM(CASE WHEN o.created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
                           AND o.created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
                          THEN oi.quantity * v.price ELSE 0 END), 2) AS last_week
    FROM variants v
    JOIN order_items oi ON oi.variant_id = v.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
    GROUP BY v.id, v.variant_name
    HAVING last_week > 0 AND (this_week - last_week) / last_week < -0.20
  `);
  return rows;
};

// Check if an unread insight already exists for this rule + variant
export const insightExists = async (ruleId, variantId) => {
  const [rows] = await db.query(
    'SELECT id FROM rule_insights WHERE rule_id = ? AND variant_id = ? AND is_read = 0',
    [ruleId, variantId]
  );
  return rows.length > 0;
};

export const insertInsight = async (ruleId, variantId, message, severity) => {
  await db.query(
    'INSERT INTO rule_insights (rule_id, variant_id, message, severity) VALUES (?, ?, ?, ?)',
    [ruleId, variantId, message, severity]
  );
};

export const getAllInsights = async () => {
  const [rows] = await db.query(`
    SELECT ri.id, ri.rule_id, ri.message, ri.severity, ri.is_read, ri.created_at,
           v.variant_name, v.quantity AS stock, v.threshold,
           i.inventoryName AS product_name,
           c.name AS category_name
    FROM rule_insights ri
    JOIN variants v ON ri.variant_id = v.id
    JOIN inventory i ON v.inventory_id = i.id
    JOIN categories c ON i.category_id = c.id
    ORDER BY ri.created_at DESC
  `);
  return rows;
};

export const markInsightAsRead = async (id) => {
  const [result] = await db.query(
    'UPDATE rule_insights SET is_read = 1 WHERE id = ?',
    [id]
  );
  return result.affectedRows;
};
