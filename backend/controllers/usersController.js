// CEO/Manager: Permanently remove a sales agent by user ID (manager limited to their branch)
const deleteSalesAgent = async (req, res) => {
  try {
    const { id } = req.params;
    // Only allow deleting sales agents
    const user = await User.findOne({ where: { id, role: 'Sales Agent' } });
    if (!user) return res.status(404).json({ error: 'Sales Agent not found' });
    // Manager can only remove agents from their branch, CEO can remove any agent
    if (req.user.role === 'Manager' && req.user.branch_id !== user.branch_id) {
      return res.status(403).json({ error: 'Not authorized to remove this sales agent' });
    }
    await user.destroy();
    res.json({ message: 'Sales Agent permanently removed from the database' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove sales agent' });
  }
};
const { User, Branch } = require('../models');

const listManagers = async (req, res) => {
  try {
    const managers = await User.findAll({
      where: { role: 'Manager' },
      attributes: { exclude: ['password'] },
      include: [{ model: Branch, attributes: ['id', 'name', 'location'] }],
      order: [['id', 'DESC']],
    });
    res.json(managers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch managers' });
  }
};

const listAgents = async (req, res) => {
  try {
    const agents = await User.findAll({
      where: { role: 'Sales Agent' },
      attributes: { exclude: ['password'] },
      include: [{ model: Branch, attributes: ['id', 'name', 'location'] }],
      order: [['id', 'DESC']],
    });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
};

const listAgentsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const agents = await User.findAll({
      where: { role: 'Sales Agent', branch_id: branchId },
      attributes: { exclude: ['password'] },
      include: [{ model: Branch, attributes: ['id', 'name', 'location'] }],
      order: [['id', 'DESC']],
    });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch branch agents' });
  }
};

// CEO: Permanently remove a manager by user ID
const deleteManager = async (req, res) => {
  try {
    const { id } = req.params;
    // Only allow deleting managers
    const user = await User.findOne({ where: { id, role: 'Manager' } });
    if (!user) return res.status(404).json({ error: 'Manager not found' });
    await user.destroy();
    res.json({ message: 'Manager permanently removed from the database' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove manager' });
  }
};

module.exports = {
  listManagers,
  listAgents,
  listAgentsByBranch,
  deleteManager,
  deleteSalesAgent,
};
