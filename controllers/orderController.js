// controllers/orderController.js
import db from '../db/connection.js';
import * as orderModel from '../models/orderModel.js';

/**
 * POST /api/orders
 * Create a new order (POS)
 */
export const createOrder = async (req, res) => {
  const { items } = req.body; // [{ id, quantity }]
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // 1️⃣ Create a new order
    const [order] = await conn.query('INSERT INTO orders (created_at) VALUES (NOW())');
    const orderId = order.insertId;

    // 2️⃣ Loop through items to insert order_items + deduct stock
    for (const item of items) {
      // Deduct stock atomically
      await orderModel.deductStock(item.id, item.quantity, conn);

      // Insert into order_items
      await conn.query(
        'INSERT INTO order_items (order_id, variant_id, quantity) VALUES (?, ?, ?)',
        [orderId, item.id, item.quantity]
      );

      // ✅ Check variant quantity vs threshold
      const [variantRows] = await conn.query(
        'SELECT quantity, threshold FROM variants WHERE id = ?',
        [item.id]
      );
      const variant = variantRows[0];

      if (variant.quantity < variant.threshold) {
        // Insert low stock alert if not already exists (is_read = 0)
        await conn.query(
          `INSERT IGNORE INTO low_stock_alerts (variant_id) VALUES (?)`,
          [item.id]
        );
      }
    }

    // 3️⃣ Commit transaction
    await conn.commit();

    res.status(201).json({ message: 'Order created successfully', id: orderId });

  } catch (err) {
    await conn.rollback();
    console.error('Order creation failed:', err);
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};

/**
 * GET /api/orders/:id
 * Fetch order by ID with items
 */
export const getOrder = async (req, res) => {
  try {
    const order = await orderModel.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/variants (POS)
 * Fetch variants with images for POS frontend
 */
export const getVariantsForPOS = async (req, res) => {
  try {
    const variants = await orderModel.getVariantsForPOS();
    res.json(variants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};