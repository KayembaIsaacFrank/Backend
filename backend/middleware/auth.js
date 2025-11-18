/**
 * Authentication Middleware
 * 
 * Purpose: Provides middleware functions for JWT-based authentication and authorization
 * - Verifies JWT tokens from request headers
 * - Enforces role-based access control (CEO, Manager, Sales Agent)
 * - Restricts branch access based on user assignments
 * 
 * Middleware Functions:
 * - authenticateToken: Requires valid JWT, rejects unauthorized requests
 * - optionalAuth: Sets user if token exists, but allows requests without token
 * - authorizeRole: Checks if user has required role(s)
 * - authorizeBranch: Ensures users can only access their assigned branch (except CEO)
 * 
 * JWT Token Format: Bearer <token> in Authorization header
 */

const jwt = require('jsonwebtoken');

/**
 * Authenticate Token Middleware
 * 
 * Validates JWT token and attaches user info to request
 * Required for all protected routes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];  // Get Authorization header
  const token = authHeader && authHeader.split(' ')[1];  // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Verify token using JWT_SECRET from environment variables
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;  // Attach decoded user info to request
    next();           // Proceed to next middleware or route handler
  });
};

/**
 * Optional Authentication Middleware
 * 
 * Sets user info if valid token exists, but allows request to proceed without token
 * Useful for endpoints that behave differently for authenticated vs. public access
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;  // No token provided, set user to null
    return next();     // Continue without authentication
  }

  // Verify token if provided
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;  // Invalid token, set user to null
    } else {
      req.user = user;  // Valid token, attach user info
    }
    next();             // Continue regardless of token validity
  });
};

/**
 * Role-Based Authorization Middleware
 * 
 * Restricts access to routes based on user role
 * 
 * @param {...string} allowedRoles - Roles that can access the route (e.g., 'CEO', 'Manager')
 * @returns {Function} Middleware function
 * 
 * Usage: authorizeRole('CEO', 'Manager') allows only CEO and Manager roles
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();  // User has required role, proceed
  };
};

/**
 * Branch-Based Authorization Middleware
 * 
 * Ensures users can only access data from their assigned branch
 * Exception: CEO can access all branches
 * 
 * Checks branch_id from:
 * - req.params.branchId (URL parameter)
 * - req.body.branch_id (request body)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authorizeBranch = (req, res, next) => {
  // CEO has access to all branches
  if (req.user.role === 'CEO') {
    next();
  // Managers and Sales Agents can only access their assigned branch
  } else if (req.user.branch_id === parseInt(req.params.branchId) || req.user.branch_id === parseInt(req.body.branch_id)) {
    next();
  } else {
    res.status(403).json({ error: 'Cannot access other branch data' });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorizeRole,
  authorizeBranch,
};
