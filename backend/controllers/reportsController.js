const { sequelize } = require('../models');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const exportSalesCsv = async (req, res) => {
  try {
    const { branch_id, from_date, to_date, agent_id } = req.query;
    const params = [];
    const where = [];
    if (branch_id) {
      where.push('s.branch_id = ?');
      params.push(branch_id);
    }
    if (from_date) {
      where.push('s.sales_date >= ?');
      params.push(from_date);
    }
    if (to_date) {
      where.push('s.sales_date <= ?');
      params.push(to_date);
    }
    if (agent_id) {
      where.push('s.sales_agent_id = ?');
      params.push(agent_id);
    }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const sql = `SELECT s.id, s.sales_date, s.sales_time, b.name as branch_name, p.name as produce_name, s.tonnage, s.price_per_ton, s.total_amount, u.full_name as agent_name, s.buyer_name, s.buyer_phone
      FROM sales s
      JOIN branches b ON s.branch_id = b.id
      JOIN produce p ON s.produce_id = p.id
      JOIN users u ON s.sales_agent_id = u.id
      ${whereSql}
      ORDER BY s.sales_date DESC, s.sales_time DESC`;

    const [rows] = await sequelize.query(sql, { replacements: params });

    // Build CSV
    const headers = ['id', 'sales_date', 'sales_time', 'branch_name', 'produce_name', 'tonnage', 'price_per_ton', 'total_amount', 'agent_name', 'buyer_name', 'buyer_phone'];
    const csvLines = [headers.join(',')];
    for (const r of rows) {
      const line = headers.map((h) => {
        let v = r[h];
        if (v === null || v === undefined) return '';
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(',');
      csvLines.push(line);
    }

    const csv = csvLines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sales_report.csv"`);
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export sales CSV' });
  }
};

module.exports = { exportSalesCsv };
 
// Export Sales as Excel (XLSX)
const exportSalesXlsx = async (req, res) => {
  try {
    const { branch_id, from_date, to_date, agent_id } = req.query;
    const params = [];
    const where = [];
    if (branch_id) { where.push('s.branch_id = ?'); params.push(branch_id); }
    if (from_date) { where.push('s.sales_date >= ?'); params.push(from_date); }
    if (to_date) { where.push('s.sales_date <= ?'); params.push(to_date); }
    if (agent_id) { where.push('s.sales_agent_id = ?'); params.push(agent_id); }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const sql = `SELECT s.id, s.sales_date, s.sales_time, b.name as branch_name, p.name as produce_name, s.tonnage, s.price_per_ton, s.total_amount, u.full_name as agent_name, s.buyer_name, s.buyer_phone
      FROM sales s
      JOIN branches b ON s.branch_id = b.id
      JOIN produce p ON s.produce_id = p.id
      JOIN users u ON s.sales_agent_id = u.id
      ${whereSql}
      ORDER BY s.sales_date DESC, s.sales_time DESC`;

    const [rows] = await sequelize.query(sql, { replacements: params });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sales');
    const headers = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Date', key: 'sales_date', width: 12 },
      { header: 'Time', key: 'sales_time', width: 10 },
      { header: 'Branch', key: 'branch_name', width: 20 },
      { header: 'Produce', key: 'produce_name', width: 18 },
      { header: 'Tonnage', key: 'tonnage', width: 12 },
      { header: 'Price/Ton', key: 'price_per_ton', width: 14 },
      { header: 'Total Amount', key: 'total_amount', width: 16 },
      { header: 'Agent', key: 'agent_name', width: 18 },
      { header: 'Buyer', key: 'buyer_name', width: 18 },
      { header: 'Buyer Phone', key: 'buyer_phone', width: 16 },
    ];
    sheet.columns = headers;

    rows.forEach((r) => sheet.addRow(r));

    // Format currency columns as plain numbers (UGX) for now
    ['price_per_ton', 'total_amount'].forEach((key) => {
      const col = sheet.getColumn(key);
      col.numFmt = '#,##0';
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="sales_report.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export sales Excel' });
  }
};

module.exports.exportSalesXlsx = exportSalesXlsx;

// Export Sales as PDF
const exportSalesPdf = async (req, res) => {
  try {
    const { branch_id, from_date, to_date, agent_id } = req.query;
    const params = [];
    const where = [];
    if (branch_id) { where.push('s.branch_id = ?'); params.push(branch_id); }
    if (from_date) { where.push('s.sales_date >= ?'); params.push(from_date); }
    if (to_date) { where.push('s.sales_date <= ?'); params.push(to_date); }
    if (agent_id) { where.push('s.sales_agent_id = ?'); params.push(agent_id); }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const sql = `SELECT s.id, s.sales_date, s.sales_time, b.name as branch_name, p.name as produce_name, s.tonnage, s.price_per_ton, s.total_amount, u.full_name as agent_name, s.buyer_name, s.buyer_phone
      FROM sales s
      JOIN branches b ON s.branch_id = b.id
      JOIN produce p ON s.produce_id = p.id
      JOIN users u ON s.sales_agent_id = u.id
      ${whereSql}
      ORDER BY s.sales_date DESC, s.sales_time DESC`;

    const [rows] = await sequelize.query(sql, { replacements: params });

    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="sales_report.pdf"');
    doc.pipe(res);

    // Title
    doc.fontSize(16).text('Sales Report', { align: 'center' });
    doc.moveDown(0.5);

    // Filters summary
    const filters = [];
    if (branch_id) filters.push(`Branch: ${branch_id}`);
    if (from_date) filters.push(`From: ${from_date}`);
    if (to_date) filters.push(`To: ${to_date}`);
    if (agent_id) filters.push(`Agent ID: ${agent_id}`);
    if (filters.length) doc.fontSize(10).text(filters.join('  |  '), { align: 'center' });
    doc.moveDown(1);

    // Table header
    const headers = ['Date', 'Branch', 'Produce', 'Tonnage', 'Price/Ton', 'Total', 'Buyer'];
    const colWidths = [70, 80, 80, 60, 70, 70, 90];
    const startX = doc.page.margins.left;
    let y = doc.y;

    const drawRow = (vals, isHeader = false) => {
      let x = startX;
      vals.forEach((v, i) => {
        const w = colWidths[i];
        if (isHeader) doc.font('Helvetica-Bold'); else doc.font('Helvetica');
        doc.fontSize(9).text(String(v ?? ''), x + 2, y, { width: w - 4, ellipsis: true });
        x += w;
      });
      y += 16;
      // draw line
      doc.moveTo(startX, y - 2).lineTo(startX + colWidths.reduce((a,b)=>a+b,0), y - 2).strokeColor('#dddddd').stroke();
    };

    drawRow(headers, true);

    rows.forEach(r => {
      if (y > doc.page.height - doc.page.margins.bottom - 40) {
        doc.addPage();
        y = doc.page.margins.top;
        drawRow(headers, true);
      }
      drawRow([
        r.sales_date,
        r.branch_name,
        r.produce_name,
        r.tonnage,
        Number(r.price_per_ton).toLocaleString(),
        Number(r.total_amount).toLocaleString(),
        r.buyer_name || '-',
      ]);
    });

    // Totals
    const totalAmount = rows.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(11).text(`Total Amount: ${totalAmount.toLocaleString()} UGX`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export sales PDF' });
  }
};

module.exports.exportSalesPdf = exportSalesPdf;
