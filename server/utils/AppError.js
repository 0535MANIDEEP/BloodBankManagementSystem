/**
 * @fileoverview Custom error class hierarchy for the BloodGrid API.
 *
 * Demonstrates OOP Principle: Inheritance & Encapsulation
 * All operational errors extend AppError, giving us a single catch point
 * in the global error middleware. Non-operational errors (programmer bugs)
 * are allowed to bubble up and crash the process intentionally.
 */

'use strict';

/**
 * @class AppError
 * @extends Error
 * @description Base class for all operational API errors.
 * Carries an HTTP status code and an `isOperational` flag so the
 * global error handler can distinguish expected failures from bugs.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description.
   * @param {number} statusCode - HTTP status code to send to the client.
   */
  constructor(message, statusCode) {
    super(message);

    /** @type {number} */
    this.statusCode = statusCode;

    /**
     * Operational errors are expected failures (bad input, missing record, etc.).
     * Non-operational errors are programmer mistakes and should crash the process.
     * @type {boolean}
     */
    this.isOperational = true;

    // Capture the stack trace, excluding the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @class ValidationError
 * @extends AppError
 * @description Thrown when request payload fails validation rules (400 Bad Request).
 */
class ValidationError extends AppError {
  /** @param {string} message */
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * @class AuthError
 * @extends AppError
 * @description Thrown when authentication or authorisation fails.
 *   statusCode defaults to 401 Unauthorised; pass 403 for forbidden actions.
 */
class AuthError extends AppError {
  /**
   * @param {string} message
   * @param {number} [statusCode=401]
   */
  constructor(message, statusCode = 401) {
    super(message, statusCode);
    this.name = 'AuthError';
  }
}

/**
 * @class NotFoundError
 * @extends AppError
 * @description Thrown when a requested resource does not exist (404 Not Found).
 */
class NotFoundError extends AppError {
  /** @param {string} [resource='Resource'] */
  constructor(resource = 'Resource') {
    super(`${resource} not found.`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * @class ConflictError
 * @extends AppError
 * @description Thrown on duplicate key violations (409 Conflict).
 */
class ConflictError extends AppError {
  /** @param {string} message */
  constructor(message) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  ConflictError,
};
