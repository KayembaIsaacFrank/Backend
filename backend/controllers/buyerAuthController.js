const bcrypt = require('bcryptjs');
const { Buyer } = require('../models');

// Public buyer signup
const buyerSignup = async (req, res) => {
  try {
    const { name, phone, email, location, password, confirm_password } = req.body;
    if (!name || !email || !password || !confirm_password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    // Check if email already exists
    const existing = await Buyer.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    // Hash password (optional, if you want buyers to login)
    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await Buyer.create({
      name,
      phone,
      email,
      location,
      password: hashedPassword, // Add password field to Buyer model if you want login
    });
    res.status(201).json({ message: 'Buyer account created', buyerId: created.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create buyer account' });
  }
};

module.exports = {
  buyerSignup,
};
