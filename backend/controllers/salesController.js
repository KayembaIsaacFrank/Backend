const { Sale, Produce, User, Stock, Buyer, sequelize } = require('../models');

const getSales = async (req, res) => {
  try {
    let where = {};
    // CEO: see all sales
    if (req.user.role === 'CEO') {
      // no filter
    } else if (req.user.role === 'Manager') {
      // Manager: only sales for their branch
      if (!req.user.branch_id) return res.status(403).json({ error: 'Manager branch not set' });
      where.branch_id = req.user.branch_id;
    } else if (req.user.role === 'Sales Agent') {
      // Sales Agent: only their own sales
      where.sales_agent_id = req.user.id;
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Optional branch filter for CEO
    if (req.user.role === 'CEO' && req.query.branch_id) {
      where.branch_id = req.query.branch_id;
    }
    const rows = await Sale.findAll({
      where,
      include: [
        { model: Produce, attributes: ['name'] },
        { model: User, as: 'agent', attributes: ['full_name'] },
      ],
      order: [['sales_date', 'DESC'], ['time', 'DESC']],
    });
    const data = rows.map((r) => ({ ...r.toJSON(), produce_name: r.produce?.name, agent_name: r.agent?.full_name }));
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get sales' });
  }
};

const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await Sale.findByPk(id, {
      include: [
        { model: Produce, attributes: ['name'] },
        { model: User, as: 'agent', attributes: ['full_name'] },
      ],
    });
    if (!row) return res.status(404).json({ error: 'Sale not found' });
    const data = { ...row.toJSON(), produce_name: row.produce?.name, agent_name: row.agent?.full_name };
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get sale' });
  }
};

const createSale = async (req, res) => {
  try {
    const {
      branch_id,
      produce_id,
      buyer_id,
      buyer_name,
      buyer_phone,
      tonnage,
      price_per_ton,
      payment_status,
      sales_date,
      sales_time,
    } = req.body;

    if (!branch_id || !produce_id || !tonnage || !price_per_ton) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check stock
    const stockRow = await Stock.findOne({ where: { branch_id, produce_id } });
    const available = stockRow ? parseFloat(stockRow.current_tonnage) : 0;
    if (available < parseFloat(tonnage)) {
      return res.status(400).json({ error: 'Insufficient stock for this sale' });
    }

    const total_amount = parseFloat(tonnage) * parseFloat(price_per_ton);

    // Insert buyer if provided (or use buyer_id)
    let buyerIdToUse = buyer_id || null;
    if (!buyerIdToUse && buyer_name) {
      const newBuyer = await Buyer.create({ name: buyer_name, phone: buyer_phone || null, created_by: req.user.id });
      buyerIdToUse = newBuyer.id;
    }

    // Use transaction for sale+stock update
    await sequelize.transaction(async (t) => {
      const created = await Sale.create({
        branch_id,
        produce_id,
        buyer_id: buyerIdToUse,
        buyer_name: buyer_name || null,
        buyer_phone: buyer_phone || null,
        tonnage,
        price_per_ton,
        total_amount,
        sales_agent_id: req.user.id,
        payment_status: payment_status || 'Paid',
        sales_date: sales_date || new Date().toISOString().slice(0, 10),
        sales_time: sales_time || new Date().toTimeString().split(' ')[0],
      }, { transaction: t });

      // Decrement stock
      const current = await Stock.findOne({ where: { branch_id, produce_id }, transaction: t, lock: t.LOCK.UPDATE });
      if (!current) throw new Error('Stock record missing');
      const newQty = parseFloat(current.current_tonnage) - parseFloat(tonnage);
      if (newQty < 0) throw new Error('Insufficient stock');
      await current.update({ current_tonnage: newQty }, { transaction: t });

      res.status(201).json({ message: 'Sale recorded', saleId: created.id });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
};

module.exports = {
  getSales,
  createSale,
  getSaleById,
};
