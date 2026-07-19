/**
 * @fileoverview Standardised API response formatter.
 *
 * Demonstrates OOP Principle: Abstraction & Single Responsibility
 * All response shaping is centralised here so controllers never build
 * raw JSON objects—they delegate to ApiResponse instead.
 */

'use strict';

/**
 * @class ApiResponse
 * @description Static utility class that encapsulates the shape of every
 * response sent by the BloodGrid API.  Controllers call the static helpers
 * and never construct raw response objects directly.
 */
class ApiResponse {
  /**
   * Send a successful response.
   * @param {import('express').Response} res
   * @param {object} options
   * @param {*}       options.data       - Payload to return.
   * @param {string}  [options.message]  - Optional human-readable message.
   * @param {number}  [options.status=200] - HTTP status code.
   */
  static success(res, { data, message = 'Success', status = 200 } = {}) {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send a created (201) response.
   * @param {import('express').Response} res
   * @param {object} options
   * @param {*}       options.data
   * @param {string}  [options.message='Created successfully']
   */
  static created(res, { data, message = 'Created successfully' } = {}) {
    return ApiResponse.success(res, { data, message, status: 201 });
  }

  /**
   * Send a paginated list response.
   * @param {import('express').Response} res
   * @param {object} options
   * @param {Array}   options.data
   * @param {number}  options.count
   * @param {string}  [options.message='Fetched successfully']
   */
  static paginated(res, { data, count, message = 'Fetched successfully' } = {}) {
    return res.status(200).json({
      success: true,
      message,
      count,
      data,
    });
  }

  /**
   * Send an error response.
   * @param {import('express').Response} res
   * @param {string} message
   * @param {number} [status=500]
   */
  static error(res, message, status = 500) {
    return res.status(status).json({
      success: false,
      error: message,
    });
  }
}

module.exports = ApiResponse;
