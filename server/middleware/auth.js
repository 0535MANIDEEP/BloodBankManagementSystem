/**
 * @fileoverview Auth middleware checking JWT status and verifying accessibility scopes.
 */

'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthError } = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protect routes - verifies JWT in headers
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AuthError('Not authorized to access this route', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforbloodbank2026');
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      throw new AuthError('User account not found', 401);
    }
    if (req.user.isBanned) {
      throw new AuthError('Your account has been locked. Please contact the administrator.', 403);
    }
    next();
  } catch (error) {
    throw new AuthError('Not authorized to access this route', 401);
  }
});

/**
 * Limit accessibility to specified roles
 * @param {...string} roles 
 */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AuthError(
        `User role '${req.user?.role || 'anonymous'}' is not permitted to perform this operation`,
        403
      );
    }
    next();
  };
};
