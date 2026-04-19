import * as HourlyRate from '../models/hourlyRateModel.js';

export const getByUser = async (req, res) => {
  try {
    const rows = await HourlyRate.getRatesByUser(req.params.userID);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { userID, rate, effective_from } = req.body;
    if (!userID || !rate || !effective_from)
      return res.status(400).json({ message: 'userID, rate and effective_from are required' });
    const id = await HourlyRate.createRate({ userID, rate, effective_from });
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await HourlyRate.deleteRate(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
