const ApiResponse = require('../utils/response');

/**
 * Middleware to check if user has required roles
 * @param {...string} roles - Required roles
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Middleware to check if user can access their own resources or is admin
 * @param {string} paramName - Parameter name containing user ID (default: 'id')
 * @returns {Function} Express middleware function
 */
const authorizeOwnerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const resourceUserId = req.params[paramName];
    const currentUserId = req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && resourceUserId !== currentUserId) {
      return ApiResponse.forbidden(res, 'Access denied');
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 * @returns {Function} Express middleware function
 */
const requireAdmin = () => {
  return authorize('admin');
};

/**
 * Middleware to check if user is admin or manager
 * @returns {Function} Express middleware function
 */
const requireManagerOrAdmin = () => {
  return authorize('admin', 'manager');
};

module.exports = {
  authorize,
  authorizeOwnerOrAdmin,
  requireAdmin,
  requireManagerOrAdmin
};
