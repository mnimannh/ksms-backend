import express from 'express';
import * as alarmController from '../controllers/alarmController.js';

const router = express.Router();

// GET all alarms
router.get('/', alarmController.getAlarms);

// PATCH mark as read
router.patch('/read/:id', alarmController.markAsRead);

export default router;