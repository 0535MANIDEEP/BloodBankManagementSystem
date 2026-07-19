/**
 * @fileoverview Routes for hospital blood requests and dispatches.
 */

'use strict';

const express = require('express');
const router = express.Router();
const RequestController = require('../controllers/requestController');
const { protect, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.route('/')
  .post(protect, authorizeRoles('hospital'), asyncHandler(RequestController.createRequest))
  .get(protect, asyncHandler(RequestController.getRequests));

router.put('/:id/approve', protect, authorizeRoles('admin'), asyncHandler(RequestController.approveRequest));
router.put('/:id/reject', protect, authorizeRoles('admin'), asyncHandler(RequestController.rejectRequest));
router.put('/:id/complete', protect, authorizeRoles('admin'), asyncHandler(RequestController.completeRequest));

module.exports = router;
