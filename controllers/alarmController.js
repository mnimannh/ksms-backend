import * as alarmModel from '../models/alarmModel.js';

export const getAlarms = async (req, res) => {
  try {
    const alarms = await alarmModel.getAllAlarms();
    res.json(alarms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await alarmModel.markAlarmAsRead(id);

    if (updated === 0) {
      return res.status(404).json({ message: 'Alarm not found' });
    }

    res.json({ message: 'Alarm marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};