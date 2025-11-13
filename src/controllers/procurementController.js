const pool = require('../config/database');

exports.createProcurement = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      produce_id, dealer_id, branch_id, tonnage,
      cost_per_ton, selling_price_per_ton,
      procurement_date, procurement_time, notes
    } = req.body;

    const total_cost = tonnage * cost_per_ton;

    // Insert procurement
    const [result] = await connection.execute(
      `INSERT INTO procurement 
       (produce_id, dealer_id, branch_id, tonnage, cost_per_ton, 
        total_cost, selling_price_per_ton, procurement_date, 
        procurement_time, recorded_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [produce_id, dealer_id, branch_id, tonnage, cost_per_ton,
       total_cost, selling_price_per_ton, procurement_date,
       procurement_time, req.user.id, notes]
    );

    // Update stock
    await connection.execute(
      `INSERT INTO stock (produce_id, branch_id, current_tonnage)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       current_tonnage = current_tonnage + VALUES(current_tonnage)`,
      [produce_id, branch_id, tonnage]
    );

    await connection.commit();
    res.status(201).json({
      message: 'Procurement recorded successfully',
      id: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};
