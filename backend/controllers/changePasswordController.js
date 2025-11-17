const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { Buyer } = require('../models');

// Change password for all user types (User: CEO, Manager, Sales Agent; Buyer)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    let user;
    let isBuyer = false;
    // Try User table first
    user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      // Try Buyer table
      user = await Buyer.findOne({ where: { id: req.user.id } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      isBuyer = true;
    }
    // Check current password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    // Update password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
};

module.exports = { changePassword };
