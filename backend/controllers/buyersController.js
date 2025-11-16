const { Buyer } = require('../models');

const getBuyers = async (req, res) => {
  try {
    const { created_by } = req.query;
    const where = created_by ? { created_by } : undefined;
    const rows = await Buyer.findAll({ where, order: [['created_at', 'DESC']] });
    res.json({ data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get buyers' });
  }
};

const createBuyer = async (req, res) => {
  try {
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
