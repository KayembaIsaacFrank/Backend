const { Procurement, Produce, Stock } = require('../models');

const getProcurements = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const where = branch_id ? { branch_id } : undefined;
    const rows = await Procurement.findAll({
      where,
      include: [{ model: Produce, attributes: ['name'] }],
      order: [['date', 'DESC'], ['time', 'DESC']],
    });
    const data = rows.map((r) => ({ ...r.toJSON(), produce_name: r.produce?.name }));
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get procurements' });
  }
};

const createProcurement = async (req, res) => {
  try {
    const {
      branch_id,
      produce_id,
      dealer_id,
      dealer_name,
      dealer_phone,
      tonnage,
      cost_per_ton,
      selling_price_per_ton,
      procurement_date,
      procurement_time,
    } = req.body;

    if (!branch_id || !produce_id || !tonnage || !cost_per_ton || !selling_price_per_ton) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const total_cost = parseFloat(tonnage) * parseFloat(cost_per_ton);

    const created = await Procurement.create({
      branch_id,
      produce_id,
      dealer_id: dealer_id || null,
      dealer_name: dealer_name || null,
      dealer_phone: dealer_phone || null,
      tonnage,
      cost_per_ton,
      total_cost,
      selling_price_per_ton,
      created_by: req.user.id,
      procurement_date: procurement_date || new Date().toISOString().slice(0, 10),
      procurement_time: procurement_time || new Date().toTimeString().split(' ')[0],
    });

    // Upsert stock: increment current_tonnage
    const [stock] = await Stock.findOrCreate({
      where: { branch_id, produce_id },
      defaults: { current_tonnage: 0 },
    });
    await stock.update({ current_tonnage: parseFloat(stock.current_tonnage) + parseFloat(tonnage) });

    res.status(201).json({ message: 'Procurement recorded', procurementId: created.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create procurement' });
  }
};

module.exports = {
  getProcurements,
  createProcurement,
};
