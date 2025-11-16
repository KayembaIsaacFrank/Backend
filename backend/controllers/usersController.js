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

module.exports = {
  listManagers,
  listAgents,
  listAgentsByBranch,
};
