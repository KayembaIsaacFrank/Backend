const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Branch } = require('../models');

// CEO signup (first-time only, no existing CEO needed)
const ceoSignup = async (req, res) => {
  try {
    const { email, password, confirm_password, full_name, phone } = req.body;

    // Confirm password match
    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

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
    const { email, password, confirm_password, full_name, phone, branch_id } = req.body;

    // Confirm password match
    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Only CEO can create managers
    if (req.user.role !== 'CEO') {
      return res.status(403).json({ error: 'Only CEO can create managers' });
    }


    // Enforce only one manager per branch
    console.log('Attempting to create manager for branch_id:', branch_id, 'role: Manager');
    const existingManager = await User.findOne({ where: { branch_id, role: 'Manager' } });
    if (existingManager) {
      console.log('Branch already has a manager:', existingManager.id);
      return res.status(400).json({ error: 'This branch already has a manager' });
    }

    // Check if there are already two managers in total
    const managerCount = await User.count({ where: { role: 'Manager' } });
    if (managerCount >= 2) {
      return res.status(400).json({ error: 'Maximum number of managers (2) reached' });
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
    const { email, password, confirm_password, full_name, phone, branch_id } = req.body;

    // Confirm password match
    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Only Manager can create sales agents (for their branch)
    if (req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Only Managers can create sales agents' });
    }

    if (req.user.branch_id !== parseInt(branch_id)) {
      return res.status(403).json({ error: 'Can only create agents for your branch' });
    }

    // Check if there are already two sales agents in total
    const agentCount = await User.count({ where: { role: 'Sales Agent' } });
    if (agentCount >= 2) {
      return res.status(400).json({ error: 'Maximum number of sales agents (2) reached' });
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

      // Try to find user in User table

      console.log('[LOGIN] Attempting login for email:', email);
      let user = await User.findOne({ where: { email, is_active: true } });
      if (user) {
        console.log('[LOGIN] Found user in User table:', user.id, user.role);
      }

      // If not found, try to find in Buyer table
      let isBuyer = false;
      if (!user) {
        const { Buyer } = require('../models');
        user = await Buyer.findOne({ where: { email } });
        if (user) {
          isBuyer = true;
          console.log('[LOGIN] Found user in Buyer table:', user.id);
        }
      }
      if (!user) {
        console.log('[LOGIN] No user found for email:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check password
      let validPassword;
      if (isBuyer) {
        validPassword = await require('bcryptjs').compare(password, user.password);
        console.log('[LOGIN] Buyer password match:', validPassword);
      } else {
        validPassword = await bcrypt.compare(password, user.password);
        console.log('[LOGIN] User password match:', validPassword);
      }
      if (!validPassword) {
        console.log('[LOGIN] Invalid password for email:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Compose token payload
      const payload = isBuyer
        ? {
            id: user.id,
            email: user.email,
            role: 'Buyer',
            full_name: user.name,
          }
        : {
            id: user.id,
            email: user.email,
            role: user.role,
            branch_id: user.branch_id,
            full_name: user.full_name,
          };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

      res.json({
        token,
        user: payload,
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
