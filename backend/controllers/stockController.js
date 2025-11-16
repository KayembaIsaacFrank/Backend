const { Stock, Produce } = require('../models');

const getStock = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const where = branch_id ? { branch_id } : undefined;
    const rows = await Stock.findAll({
      where,
      include: [{ model: Produce, attributes: ['name'] }],
      order: [[{ model: Produce, as: 'produce' }, 'name', 'ASC']],
    });
    const data = rows.map((r) => ({ ...r.toJSON(), produce_name: r.produce?.name }));
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get stock' });
  }
};

module.exports = {
  getStock,
};
