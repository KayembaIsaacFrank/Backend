const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { CreditSale, Produce, Branch, Buyer, User } = require('../models');

// List credit sales (optional filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { branch_id, status, from_date, to_date } = req.query;
    const where = {};
    if (branch_id) where.branch_id = branch_id;
    if (status) where.status = status;
    if (from_date) where.sales_date = { ...(where.sales_date || {}), gte: from_date };
    if (to_date) where.sales_date = { ...(where.sales_date || {}), lte: to_date };

    const rows = await CreditSale.findAll({
      where,
      include: [
        { model: Produce, attributes: ['name'] },
        { model: Branch, attributes: ['name'] },
        { model: Buyer, attributes: ['name'] },
        { model: User, as: 'agent', attributes: ['full_name'] },
      ],
      order: [['date', 'DESC']],
    });
    const data = rows.map(r => ({
      ...r.toJSON(),
      branch_name: r.branch?.name,
      produce_name: r.produce?.name,
      buyer_name: r.buyer?.name,
      agent_name: r.agent?.full_name,
    }));
    res.json({ data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch credit sales' });
  }
});

// Create credit sale
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      branch_id,
      produce_id,
      buyer_id,
      buyer_phone,
      buyer_location,
      national_id,
      tonnage,
      price_per_ton,
      due_date,
      sales_date,
    } = req.body;

    if (!branch_id || !produce_id || !tonnage || !price_per_ton || !due_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const total_amount = parseFloat(tonnage) * parseFloat(price_per_ton);
    const amount_due = total_amount; // initial due equals total

    const created = await CreditSale.create({
      branch_id,
      produce_id,
      buyer_id: buyer_id || null,
      buyer_phone: buyer_phone || null,
      buyer_location: buyer_location || null,
      national_id: national_id || null,
      tonnage,
      price_per_ton,
      total_amount,
      amount_due,
      amount_paid: 0,
      due_date,
      status: 'Pending',
      sales_date: sales_date || new Date().toISOString().slice(0, 10),
      sales_agent_id: req.user.id,
    });
    res.status(201).json({ message: 'Credit sale recorded', creditSaleId: created.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create credit sale' });
  }
});

module.exports = router;
