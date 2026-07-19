/**
 * @fileoverview Class-based Auth controller managing register and login operations.
 * 
 * Demonstrates OOP Principle: Encapsulation & Separation of Concerns.
 */

'use strict';

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ValidationError, AuthError, ConflictError } = require('../utils/AppError');
const ApiResponse = require('../utils/ApiResponse');

class AuthController {
  /**
   * Helper to sign JWT token and send formatted API success response.
   * @private
   * @param {object} user - User document
   * @param {number} statusCode - Response code
   * @param {object} res - Express response object
   */
  static _sendTokenResponse(user, statusCode, res) {
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'supersecretjwtkeyforbloodbank2026',
      { expiresIn: '30d' }
    );

    return ApiResponse.success(res, {
      status: statusCode,
      message: 'Authentication successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bloodGroup: user.bloodGroup,
          phone: user.phone
        }
      }
    });
  }

  /**
   * Register a new user (donor/hospital).
   * @route POST /api/auth/register
   */
  static async register(req, res) {
    const {
      email,
      password,
      role,
      name,
      phone,
      age,
      weight,
      bloodGroup,
      lastDonationDate,
      healthConditions,
      idProofUrl,
      licenseNumber,
      address
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ConflictError('Email already registered');
    }

    // Role-based validation
    if (role === 'donor') {
      if (!age || age < 18 || age > 65) {
        throw new ValidationError('Donor age must be between 18 and 65 years');
      }
      if (!weight || weight < 50) {
        throw new ValidationError('Donor weight must be at least 50 kg');
      }
      if (!bloodGroup) {
        throw new ValidationError('Please specify your blood group');
      }
    } else if (role === 'hospital') {
      if (!licenseNumber) {
        throw new ValidationError('Please provide the hospital license number');
      }
      if (!address) {
        throw new ValidationError('Please provide the hospital address');
      }
    } else if (role === 'admin') {
      throw new AuthError('Admin accounts cannot be registered online', 400);
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      name,
      phone,
      age,
      weight,
      bloodGroup,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      healthConditions: healthConditions || [],
      idProofUrl,
      licenseNumber,
      address
    });

    AuthController._sendTokenResponse(user, 201, res);
  }

  /**
   * Login user.
   * @route POST /api/auth/login
   */
  static async login(req, res) {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      throw new ValidationError('Please provide an email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AuthError('Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AuthError('Invalid credentials');
    }

    if (user.isBanned) {
      throw new AuthError('Your account has been banned', 403);
    }

    AuthController._sendTokenResponse(user, 200, res);
  }

  /**
   * Get current logged-in user profile details.
   * @route GET /api/auth/me
   */
  static async getMe(req, res) {
    const user = await User.findById(req.user.id);
    ApiResponse.success(res, {
      data: user,
      message: 'Profile details fetched successfully'
    });
  }
}

module.exports = AuthController;
