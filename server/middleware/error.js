/**
 * @fileoverview Centralised error-handling middleware.
 * 
 * Intercepts all bubbled errors. Handles custom AppError subclasses
 * and formats MongoDB-specific errors.
 */

'use strict';

const { AppError } = require('../utils/AppError');
const ApiResponse = require('../utils/ApiResponse');

const errorHandler = (err, req, res, next) => {
  // Log critical bugs (non-operational errors) to the console
  if (!err.isOperational) {
    console.error('CRITICAL SYSTEM ERROR:', err);
  }

  // Handle our custom OOP errors
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  // Handle Mongoose cast errors (invalid ObjectIds)
  if (err.name === 'CastError') {
    return ApiResponse.error(res, `Resource not found with ID of ${err.value}`, 404);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiResponse.error(res, `Duplicate entry: That ${field} is already registered.`, 400);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return ApiResponse.error(res, message, 400);
  }

  // Fallback for general server bugs
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error';
  return ApiResponse.error(res, message, 500);
};

module.exports = errorHandler;
