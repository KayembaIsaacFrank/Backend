const { Stock, Produce, Branch } = require('../models');

const getStock = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const where = branch_id ? { branch_id } : {};
    
    const rows = await Stock.findAll({
      where,
      include: [
        { 
          model: Produce, 
          attributes: ['id', 'name'] 
        },
        { 
          model: Branch, 
          attributes: ['id', 'name'] 
        }
      ],
      order: [['branch_id', 'ASC'], ['produce_id', 'ASC']],
    });
    
    const data = rows.map((r) => ({
      id: r.id,
      branch_id: r.branch_id,
      produce_id: r.produce_id,
      current_tonnage: r.current_tonnage,
      quantity: r.current_tonnage, // Alias for compatibility
      produce_name: r.Produce?.name,
      branch_name: r.Branch?.name,
      updatedAt: r.updated_at,
    }));
    
    res.json({ data });
  } catch (error) {
    console.error('Stock fetch error:', error);
    res.status(500).json({ error: 'Failed to get stock' });
  }
};

module.exports = {
  getStock,
};
