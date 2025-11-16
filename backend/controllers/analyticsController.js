const { sequelize } = require('../models');

const getKpis = async (req, res) => {
  try {
    let { branch_id, from_date, to_date } = req.query;

    // Enforce branch scoping for non-CEO users
    if (req.user?.role && req.user.role !== 'CEO') {
      branch_id = req.user.branch_id;
    }

    // Build where clause for date range and branch
    const whereClauses = [];
    const params = [];
    if (branch_id) {
      whereClauses.push('branch_id = ?');
      params.push(branch_id);
    }
    if (from_date) {
      whereClauses.push('sales_date >= ?');
      params.push(from_date);
    }
    if (to_date) {
      whereClauses.push('sales_date <= ?');
      params.push(to_date);
    }
    const where = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Using raw queries via Sequelize for aggregates
    const [salesRows] = await sequelize.query(
      `SELECT COALESCE(SUM(total_amount),0) as total_sales, COALESCE(SUM(tonnage),0) as total_tonnage FROM sales ${where}`,
      { replacements: params }
    );

    const procWhere = where.replace(/sales_date/g, 'procurement_date');
    const [procRows] = await sequelize.query(
      `SELECT COALESCE(SUM(total_cost),0) as total_procurement_cost FROM procurement ${procWhere}`,
      { replacements: params }
    );

    const stockParams = [];
    let stockWhere = '';
    if (branch_id) {
      stockWhere = 'WHERE branch_id = ?';
      stockParams.push(branch_id);
    }
    const [stockRows] = await sequelize.query(
      `SELECT COALESCE(SUM(current_tonnage),0) as total_stock FROM stock ${stockWhere}`,
      { replacements: stockParams }
    );

    // Simple profit estimate
    const total_sales = parseFloat(salesRows[0].total_sales || 0);
    const total_procurement_cost = parseFloat(procRows[0].total_procurement_cost || 0);
    const total_stock = parseFloat(stockRows[0].total_stock || 0);
    const estimated_profit = total_sales - total_procurement_cost;

    res.json({
      kpis: {
        total_sales,
        total_tonnage: parseFloat(salesRows[0].total_tonnage || 0),
        total_procurement_cost,
        total_stock,
        estimated_profit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to compute KPIs' });
  }
};

// CEO: Multi-branch overview with sales & procurement aggregates
const getBranchesOverview = async (req, res) => {
  try {
    if (req.user.role !== 'CEO') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    let { from_date, to_date } = req.query;
    const dateFiltersSales = [];
    const paramsSales = [];
    if (from_date) { dateFiltersSales.push('s.sales_date >= ?'); paramsSales.push(from_date); }
    if (to_date) { dateFiltersSales.push('s.sales_date <= ?'); paramsSales.push(to_date); }
    const dateWhereSales = dateFiltersSales.length ? 'AND ' + dateFiltersSales.join(' AND ') : '';

    const dateFiltersProc = [];
    const paramsProc = [];
    if (from_date) { dateFiltersProc.push('p.procurement_date >= ?'); paramsProc.push(from_date); }
    if (to_date) { dateFiltersProc.push('p.procurement_date <= ?'); paramsProc.push(to_date); }
    const dateWhereProc = dateFiltersProc.length ? 'AND ' + dateFiltersProc.join(' AND ') : '';

    const salesSql = `SELECT b.id as branch_id, b.name as branch_name,
        COALESCE(SUM(s.total_amount),0) as total_sales,
        COALESCE(SUM(s.tonnage),0) as total_tonnage
      FROM branches b
      LEFT JOIN sales s ON s.branch_id = b.id ${dateWhereSales}
      GROUP BY b.id, b.name
      ORDER BY b.name ASC`;
    const [salesRows] = await sequelize.query(salesSql, { replacements: paramsSales });

    const procSql = `SELECT b.id as branch_id, COALESCE(SUM(p.total_cost),0) as total_procurement_cost
      FROM branches b
      LEFT JOIN procurement p ON p.branch_id = b.id ${dateWhereProc}
      GROUP BY b.id`;
    const [procRows] = await sequelize.query(procSql, { replacements: paramsProc });
    const procMap = new Map(procRows.map(r => [r.branch_id, r.total_procurement_cost]));

    const enriched = salesRows.map(r => {
      const total_procurement_cost = parseFloat(procMap.get(r.branch_id) || 0);
      const estimated_profit = parseFloat(r.total_sales || 0) - total_procurement_cost;
      return { ...r, total_procurement_cost, estimated_profit };
    });

    res.json({ branches: enriched });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load branches overview' });
  }
};

// CEO: Top produce performance across all branches
const getTopProduce = async (req, res) => {
  try {
    if (req.user.role !== 'CEO') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    let { from_date, to_date, limit } = req.query;
    limit = parseInt(limit || '5', 10);
    const whereParts = [];
    const params = [];
    if (from_date) { whereParts.push('s.sales_date >= ?'); params.push(from_date); }
    if (to_date) { whereParts.push('s.sales_date <= ?'); params.push(to_date); }
    const where = whereParts.length ? 'WHERE ' + whereParts.join(' AND ') : '';
    const sql = `SELECT p.name as produce_name, COALESCE(SUM(s.total_amount),0) as total_sales, COALESCE(SUM(s.tonnage),0) as total_tonnage
      FROM sales s
      JOIN produce p ON s.produce_id = p.id
      ${where}
      GROUP BY p.name
      ORDER BY total_sales DESC
      LIMIT ${limit}`;
    const [rows] = await sequelize.query(sql, { replacements: params });
    res.json({ top_produce: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load top produce' });
  }
};

// Manager: Agent performance within manager's branch
const getAgentsPerformance = async (req, res) => {
  try {
    if (req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const branch_id = req.user.branch_id;
    let { from_date, to_date } = req.query;
    const whereParts = ['s.branch_id = ?'];
    const params = [branch_id];
    if (from_date) { whereParts.push('s.sales_date >= ?'); params.push(from_date); }
    if (to_date) { whereParts.push('s.sales_date <= ?'); params.push(to_date); }
    const where = 'WHERE ' + whereParts.join(' AND ');
    const sql = `SELECT u.id as agent_id, u.full_name as agent_name, COALESCE(SUM(s.total_amount),0) as total_sales, COALESCE(SUM(s.tonnage),0) as total_tonnage
      FROM users u
      LEFT JOIN sales s ON s.sales_agent_id = u.id AND s.branch_id = ?
      ${where.replace('s.branch_id = ?', '1=1')} -- already handled in JOIN condition
      WHERE u.role = 'Sales Agent' AND u.branch_id = ?
      GROUP BY u.id, u.full_name
      ORDER BY total_sales DESC`;
    // We'll restructure query simpler
    const sql2 = `SELECT u.id as agent_id, u.full_name as agent_name,
        COALESCE(SUM(s.total_amount),0) as total_sales,
        COALESCE(SUM(s.tonnage),0) as total_tonnage
      FROM users u
      LEFT JOIN sales s ON s.sales_agent_id = u.id
        AND s.branch_id = ?
        ${from_date ? 'AND s.sales_date >= ?' : ''}
        ${to_date ? 'AND s.sales_date <= ?' : ''}
      WHERE u.role = 'Sales Agent' AND u.branch_id = ?
      GROUP BY u.id, u.full_name
      ORDER BY total_sales DESC`;
    const agentParams = [branch_id];
    if (from_date) agentParams.push(from_date);
    if (to_date) agentParams.push(to_date);
    agentParams.push(branch_id);
    const [rows] = await sequelize.query(sql2, { replacements: agentParams });
    res.json({ agents: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load agent performance' });
  }
};

module.exports = { getKpis, getBranchesOverview, getTopProduce, getAgentsPerformance };
// Sales trend (aggregated by date) for charts
const getSalesTrend = async (req, res) => {
  try {
    let { branch_id, days, from_date, to_date } = req.query;
    // Non-CEO branch scoping
    if (req.user.role !== 'CEO') branch_id = req.user.branch_id;
    days = parseInt(days || '30', 10);
    let dateFilterSql = '';
    const params = [];
    if (from_date) { dateFilterSql += ' AND s.sales_date >= ?'; params.push(from_date); }
    if (to_date) { dateFilterSql += ' AND s.sales_date <= ?'; params.push(to_date); }
    if (!from_date && !to_date) { // default last N days
      dateFilterSql += ' AND s.sales_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)';
      params.push(days);
    }
    let branchFilterSql = '';
    if (branch_id) { branchFilterSql = ' AND s.branch_id = ?'; params.push(branch_id); }
    const sql = `SELECT s.sales_date as date, COALESCE(SUM(s.total_amount),0) as total_sales, COALESCE(SUM(s.tonnage),0) as total_tonnage
      FROM sales s
      WHERE 1=1 ${dateFilterSql} ${branchFilterSql}
      GROUP BY s.sales_date
      ORDER BY s.sales_date ASC`;
    const [rows] = await sequelize.query(sql, { replacements: params });
    res.json({ trend: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load sales trend' });
  }
};

// Produce breakdown for bar/pie charts
const getProduceBreakdown = async (req, res) => {
  try {
    let { branch_id, from_date, to_date } = req.query;
    if (req.user.role !== 'CEO') branch_id = req.user.branch_id;
    const filters = [];
    const params = [];
    if (branch_id) { filters.push('s.branch_id = ?'); params.push(branch_id); }
    if (from_date) { filters.push('s.sales_date >= ?'); params.push(from_date); }
    if (to_date) { filters.push('s.sales_date <= ?'); params.push(to_date); }
    const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';
    const sql = `SELECT p.name as produce_name, COALESCE(SUM(s.total_amount),0) as total_sales, COALESCE(SUM(s.tonnage),0) as total_tonnage
      FROM sales s
      JOIN produce p ON s.produce_id = p.id
      ${where}
      GROUP BY p.name
      ORDER BY total_sales DESC`;
    const [rows] = await sequelize.query(sql, { replacements: params });
    res.json({ produce_breakdown: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load produce breakdown' });
  }
};

module.exports.getSalesTrend = getSalesTrend;
module.exports.getProduceBreakdown = getProduceBreakdown;
