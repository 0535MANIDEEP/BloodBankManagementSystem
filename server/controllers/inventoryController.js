/**
 * @fileoverview Class-based Inventory controller managing stocks and alerts.
 * 
 * Demonstrates OOP Principle: Separation of Concerns & Abstraction.
 */

'use strict';

const Inventory = require('../models/Inventory');
const User = require('../models/User');
const InventoryAlertService = require('../services/InventoryAlertService');
const { ValidationError, NotFoundError } = require('../utils/AppError');
const ApiResponse = require('../utils/ApiResponse');

class InventoryController {
  /**
   * Fetches active inventory list, stock summary, and smart notifications.
   * @route GET /api/inventory
   */
  static async getInventory(req, res) {
    const rawInventory = await Inventory.find()
      .populate('donor', 'name email bloodGroup')
      .sort('-addedDate');

    const today = new Date();

    // Check & update expired bags dynamically in background on fetch
    for (let item of rawInventory) {
      if (item.status === 'available' && new Date(item.expiryDate) < today) {
        item.status = 'expired';
        await item.save();
      }
    }

    // Call the calculation service
    const { summary, alerts } = InventoryAlertService.processStock(rawInventory);

    return ApiResponse.success(res, {
      data: {
        summary,
        alerts,
        // Only disclose detailed bag records to the Admin workspace
        inventory: req.user.role === 'admin' ? rawInventory : []
      },
      message: 'Inventory report generated successfully'
    });
  }

  /**
   * Log units to inventory stock (Admin).
   * @route POST /api/inventory
   */
  static async addInventory(req, res) {
    const { bloodGroup, units, expiryDate, donorEmail } = req.body;

    if (!bloodGroup || !units || !expiryDate) {
      throw new ValidationError('Please provide bloodGroup, units, and expiryDate');
    }

    let donorUser = null;
    if (donorEmail) {
      donorUser = await User.findOne({ email: donorEmail, role: 'donor' });
    }

    const inventory = await Inventory.create({
      bloodGroup,
      units,
      expiryDate: new Date(expiryDate),
      donor: donorUser ? donorUser._id : null,
      status: 'available'
    });

    return ApiResponse.created(res, {
      data: inventory,
      message: 'Blood bag registered into stock'
    });
  }

  /**
   * Update parameters of a blood bag log (Admin).
   * @route PUT /api/inventory/:id
   */
  static async updateInventory(req, res) {
    let item = await Inventory.findById(req.params.id);
    if (!item) {
      throw new NotFoundError('Inventory record');
    }

    item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    return ApiResponse.success(res, {
      data: item,
      message: 'Blood bag properties updated'
    });
  }

  /**
   * Discards a blood bag from the inventory index (Admin).
   * @route DELETE /api/inventory/:id
   */
  static async deleteInventory(req, res) {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      throw new NotFoundError('Inventory record');
    }

    await item.deleteOne();

    return ApiResponse.success(res, {
      message: 'Blood bag removed from inventory stock'
    });
  }

  /**
   * Auto-clean expired items.
   * @route POST /api/inventory/clean-expired
   */
  static async cleanExpired(req, res) {
    const today = new Date();
    
    // Mark items as expired
    const marked = await Inventory.updateMany(
      { status: 'available', expiryDate: { $lt: today } },
      { status: 'expired' }
    );

    // Hard delete expired logs
    const result = await Inventory.deleteMany({ status: 'expired' });

    return ApiResponse.success(res, {
      message: `Auto-expiry clean complete. Marked: ${marked.modifiedCount}, Discarded: ${result.deletedCount} expired units.`
    });
  }
}

module.exports = InventoryController;
