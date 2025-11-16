const { Branch } = require('../models');

const listBranches = async (req, res) => {
  try {
    if (req.user.role === 'CEO') {
      const branches = await Branch.findAll({ order: [['id', 'ASC']] });
      return res.json(branches);
    }
    if (req.user.branch_id) {
      const branch = await Branch.findByPk(req.user.branch_id);
      return res.json(branch ? [branch] : []);
    }
    return res.json([]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'CEO' && parseInt(id) !== req.user.branch_id) {
      return res.status(403).json({ error: 'Cannot access other branch data' });
    }
    const branch = await Branch.findByPk(id);
    if (!branch) return res.status(404).json({ error: 'Branch not found' });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch branch' });
  }
};

module.exports = {
  listBranches,
  getBranchById,
};
