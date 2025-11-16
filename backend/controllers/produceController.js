const { Produce } = require('../models');

const listProduce = async (req, res) => {
  try {
    const items = await Produce.findAll({ order: [['name', 'ASC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch produce types' });
  }
};

module.exports = { listProduce };
