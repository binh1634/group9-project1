const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

router.post('/promote', async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ message: 'Missing email or role' });
  if (!['user','admin','moderator'].includes(role)) return res.status(400).json({ message:'Invalid role' });
  const user = await User.findOneAndUpdate({ email }, { role }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'Updated', user });
});

module.exports = router;