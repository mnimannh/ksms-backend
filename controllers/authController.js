import { login } from '../models/authModel.js';

export const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  login(email, password, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];

    // Respond with user info including role
    res.json({
      message: 'Login successful',
      userID: user.userID,
      email: user.email,
      role: user.role
    });
  });
};
