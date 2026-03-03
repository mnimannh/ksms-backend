// models/orderModel.js
import db from '../db/connection.js';

/**
 * Fetch variants for POS screen
 * Returns variants with all images as an array
 */
export const getVariantsForPOS = async () => {
  const [rows] = await db.query(`
    SELECT 
      v.id,
      v.variant_name,
      v.price,
      v.quantity,
      i.inventoryName,
      i.category_id,
      IFNULL(JSON_ARRAYAGG(img.image_url), JSON_ARRAY()) AS images
    FROM variants v
    JOIN inventory i ON v.inventory_id = i.id
    LEFT JOIN product_images img ON v.id = img.variant_id
    GROUP BY v.id, v.variant_name, v.price, v.quantity, i.inventoryName, i.category_id
  `);

  // Parse images JSON array for each variant
  return rows.map(row => ({
    ...row,
    images: JSON.parse(row.images)
  }));
};

/**
 * Deduct stock atomically (transaction-safe)
 * Use conn from transaction when calling
 */
export const deductStock = async (variantId, quantity, conn) => {
  const [result] = await conn.query(
    'UPDATE variants SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
    [quantity, variantId, quantity]
  );

  if (result.affectedRows === 0) {
    throw new Error(`Variant ID ${variantId} stock insufficient`);
  }

  return result;
};

/**
 * Optional: Fetch order by ID with items
 */
export const getOrderById = async (orderId, conn = db) => {
  const [rows] = await conn.query(`
    SELECT o.id AS order_id, o.created_at,
           oi.variant_id, oi.quantity AS ordered_quantity,
           v.variant_name, v.price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN variants v ON oi.variant_id = v.id
    WHERE o.id = ?
  `, [orderId]);

  if (rows.length === 0) return null;

  const order = {
    id: rows[0].order_id,
    created_at: rows[0].created_at,
    items: rows.map(r => ({
      variant_id: r.variant_id,
      variant_name: r.variant_name,
      quantity: r.ordered_quantity,
      price: r.price
    }))
  };

  return order;
};