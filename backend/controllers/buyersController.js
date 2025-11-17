const { Buyer } = require('../models');

// Only sales agents can get or create buyers, and only their own
const getBuyers = async (req, res) => {
  try {
    if (req.user.role !== 'Sales Agent') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Only return buyers created by this sales agent
    const rows = await Buyer.findAll({
      where: { created_by: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get buyers' });
  }
};

const createBuyer = async (req, res) => {
  try {
    if (req.user.role !== 'Sales Agent') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { name, phone, email, location } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const created = await Buyer.create({
      name,
      phone: phone || null,
      email: email || null,
      location: location || null,
      created_by: req.user.id,
    });

    res.status(201).json({ message: 'Buyer created', buyerId: created.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create buyer' });
  }
};

module.exports = {
  getBuyers,
  createBuyer,
};
