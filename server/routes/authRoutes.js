/**
 * @fileoverview Routes for authentication operations.
 */

'use strict';

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', asyncHandler(AuthController.register));
router.post('/login', asyncHandler(AuthController.login));
router.get('/me', protect, asyncHandler(AuthController.getMe));

module.exports = router;
