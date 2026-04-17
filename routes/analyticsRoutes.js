import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

// POST  — trigger rule engine, returns { newInsights: N }
router.post('/run', analyticsController.runRules);

// GET   — fetch all insights
router.get('/insights', analyticsController.getInsights);

// PATCH — mark single insight as read
router.patch('/insights/read/:id', analyticsController.markAsRead);

export default router;
