// routes/orderRoutes.js
import express from 'express';
import db from '../db/connection.js';
import { deductStock } from '../models/orderModel.js'; // POS-specific model

const router = express.Router();

// POST /api/orders
router.post('/', async (req, res) => {
  const { items } = req.body; // [{ id, quantity }]
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // 1️⃣ Create a new order
    const [order] = await conn.query('INSERT INTO orders (created_at) VALUES (NOW())');
    const orderId = order.insertId;

    // 2️⃣ Insert order_items + deduct stock atomically
    for (const item of items) {
      await deductStock(item.id, item.quantity, conn);

      await conn.query(
        'INSERT INTO order_items (order_id, variant_id, quantity) VALUES (?, ?, ?)',
        [orderId, item.id, item.quantity]
      );
    }

    await conn.commit();
    res.json({ id: orderId });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
});

export default router;