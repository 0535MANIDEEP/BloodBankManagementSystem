/**
 * @fileoverview DRY middleware wrapper to capture promise rejections
 * and automatically forward them to Express's global error handler.
 */

'use strict';

/**
 * Wraps an asynchronous middleware/controller function, catching any error
 * and passing it to the `next` callback.
 * 
 * @param {Function} fn - The asynchronous handler to wrap.
 * @returns {Function} Express middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
