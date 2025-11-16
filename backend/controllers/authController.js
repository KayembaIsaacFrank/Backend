const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Branch } = require('../models');

// CEO signup (first-time only, no existing CEO needed)
const ceoSignup = async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    // Check if CEO already exists
    const ceo = await User.findOne({ where: { role: 'CEO' } });
    if (ceo) {
      return res.status(400).json({ error: 'CEO already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await User.create({
      email,
      password: hashedPassword,
      full_name,
      phone,
      role: 'CEO',
    });

    res.status(201).json({ message: 'CEO created successfully', userId: created.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// CEO creates Manager
const createManager = async (req, res) => {
  try {
    const { email, password, full_name, phone, branch_id } = req.body;

    // Only CEO can create managers
    if (req.user.role !== 'CEO') {
      return res.status(403).json({ error: 'Only CEO can create managers' });
    }

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    // Check if branch exists
    const branch = await Branch.findByPk(branch_id);
    if (!branch) return res.status(400).json({ error: 'Branch does not exist' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await User.create({
      email,
      password: hashedPassword,
      full_name,
      phone,
      role: 'Manager',
      branch_id,
      created_by: req.user.id,
    });

    res.status(201).json({ message: 'Manager created successfully', userId: created.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Manager creates Sales Agent
const createSalesAgent = async (req, res) => {
  try {
    const { email, password, full_name, phone, branch_id } = req.body;

    // Only Manager can create sales agents (for their branch)
    if (req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Only Managers can create sales agents' });
    }

    if (req.user.branch_id !== parseInt(branch_id)) {
      return res.status(403).json({ error: 'Can only create agents for your branch' });
    }

    // Check if branch already has a sales agent
    const existingAgent = await User.findOne({ where: { branch_id, role: 'Sales Agent' } });
    if (existingAgent) return res.status(400).json({ error: 'This branch already has a sales agent' });

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await User.create({
      email,
      password: hashedPassword,
      full_name,
      phone,
      role: 'Sales Agent',
      branch_id,
      created_by: req.user.id,
    });

    res.status(201).json({ message: 'Sales Agent created successfully', userId: created.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email, is_active: true } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        branch_id: user.branch_id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  ceoSignup,
  createManager,
  createSalesAgent,
  login,
};
