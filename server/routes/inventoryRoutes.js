/**
 * @fileoverview Routes for inventory stock operations.
 */

'use strict';

const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');
const { protect, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.route('/')
  .get(protect, asyncHandler(InventoryController.getInventory))
  .post(protect, authorizeRoles('admin'), asyncHandler(InventoryController.addInventory));

router.post('/clean-expired', protect, authorizeRoles('admin'), asyncHandler(InventoryController.cleanExpired));

router.route('/:id')
  .put(protect, authorizeRoles('admin'), asyncHandler(InventoryController.updateInventory))
  .delete(protect, authorizeRoles('admin'), asyncHandler(InventoryController.deleteInventory));

module.exports = router;
