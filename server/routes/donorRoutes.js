/**
 * @fileoverview Routes for donor operations.
 */

'use strict';

const express = require('express');
const router = express.Router();
const DonorController = require('../controllers/donorController');
const { protect, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.route('/')
  .get(protect, asyncHandler(DonorController.getDonors))
  .post(protect, authorizeRoles('donor'), asyncHandler(DonorController.createDonation));

router.get('/eligibility', protect, authorizeRoles('donor'), asyncHandler(DonorController.getEligibility));

router.route('/:id')
  .put(protect, asyncHandler(DonorController.updateDonor));

module.exports = router;
