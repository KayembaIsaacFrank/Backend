const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
  };
};

const authorizeBranch = (req, res, next) => {
  // CEO can access all branches, others can only access their own
  if (req.user.role === 'CEO') {
    next();
  } else if (req.user.branch_id === parseInt(req.params.branchId) || req.user.branch_id === parseInt(req.body.branch_id)) {
    next();
  } else {
    res.status(403).json({ error: 'Cannot access other branch data' });
  }
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeBranch,
};
