/**
 * @fileoverview Class-based Request controller managing hospital request dispatches.
 * 
 * Demonstrates OOP Principle: Encapsulation & JSDoc typed schemas.
 */

'use strict';

const Request = require('../models/Request');
const Inventory = require('../models/Inventory');
const { ValidationError, NotFoundError } = require('../utils/AppError');
const ApiResponse = require('../utils/ApiResponse');

class RequestController {
  /**
   * Helper to count available stock of a blood group.
   * @private
   * @param {string} bloodGroup 
   * @returns {Promise<number>}
   */
  static async _getAvailableStock(bloodGroup) {
    const items = await Inventory.find({ bloodGroup, status: 'available' });
    return items.reduce((acc, item) => acc + item.units, 0);
  }

  /**
   * Private helper encapsulating the FIFO blood-bag allocation algorithm.
   * Modifies inventory documents by setting status to 'assigned' or splitting bags.
   * 
   * @private
   * @param {string} bloodGroup - Blood type requested
   * @param {number} requiredUnits - Quantity of bags needed
   * @returns {Promise<Array<string>>} List of allocated Inventory bag IDs.
   */
  static async #allocateBags(bloodGroup, requiredUnits) {
    // OLD oldest bags first (FIFO to prevent shelf-expiry)
    const availableBags = await Inventory.find({
      bloodGroup,
      status: 'available'
    }).sort('expiryDate');

    const totalAvailable = availableBags.reduce((acc, bag) => acc + bag.units, 0);
    if (totalAvailable < requiredUnits) {
      throw new ValidationError(
        `Insufficient stock. Required: ${requiredUnits} units, Available: ${totalAvailable} units.`
      );
    }

    let allocatedUnits = 0;
    const assignedBagIds = [];

    for (let bag of availableBags) {
      if (allocatedUnits >= requiredUnits) break;

      const remainingNeeded = requiredUnits - allocatedUnits;

      if (bag.units <= remainingNeeded) {
        // Assign whole bag
        bag.status = 'assigned';
        await bag.save();
        allocatedUnits += bag.units;
        assignedBagIds.push(bag._id);
      } else {
        // Split bag: keep remainder, assign requested portion
        const assignedPortion = remainingNeeded;
        const remainder = bag.units - assignedPortion;

        bag.units = assignedPortion;
        bag.status = 'assigned';
        await bag.save();

        // Create new bag log for the remaining portion
        await Inventory.create({
          bloodGroup: bag.bloodGroup,
          units: remainder,
          status: 'available',
          expiryDate: bag.expiryDate,
          donor: bag.donor
        });

        allocatedUnits += assignedPortion;
        assignedBagIds.push(bag._id);
      }
    }

    return assignedBagIds;
  }

  /**
   * Creates a blood dispatch request (Hospital).
   * @route POST /api/request
   */
  static async createRequest(req, res) {
    const { bloodGroup, units, priority, message } = req.body;

    if (!bloodGroup || !units) {
      throw new ValidationError('Please provide blood group and requested units');
    }

    // Check available stock to generate alerts
    const availableStock = await RequestController._getAvailableStock(bloodGroup);
    let availabilityAlert = null;
    if (availableStock < units) {
      availabilityAlert = `Note: requested ${units} units, but only ${availableStock} units of ${bloodGroup} are currently in stock. This request will be placed on waitlist.`;
    }

    const bloodRequest = await Request.create({
      hospital: req.user.id,
      bloodGroup,
      units,
      priority: priority || 'Normal',
      message,
      status: 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Blood request submitted successfully',
      data: bloodRequest,
      availabilityAlert
    });
  }

  /**
   * Lists requests (Hospitals see theirs, Admin sees all).
   * @route GET /api/request
   */
  static async getRequests(req, res) {
    let query;

    if (req.user.role === 'admin') {
      query = Request.find()
        .populate('hospital', 'name email address phone')
        .sort({ priority: -1, status: 1, createdAt: -1 });
    } else {
      query = Request.find({ hospital: req.user.id })
        .sort('-createdAt');
    }

    const requests = await query;
    return ApiResponse.success(res, {
      data: requests,
      message: 'Dispatch board requests loaded'
    });
  }

  /**
   * Approves a request and triggers the FIFO allocation algorithm (Admin).
   * @route PUT /api/request/:id/approve
   */
  static async approveRequest(req, res) {
    const bloodRequest = await Request.findById(req.params.id);
    if (!bloodRequest) {
      throw new NotFoundError('Blood request record');
    }

    if (bloodRequest.status !== 'Pending') {
      throw new ValidationError('Request has already been processed');
    }

    // Call private allocation algorithm
    const assignedBagIds = await RequestController.#allocateBags(
      bloodRequest.bloodGroup,
      bloodRequest.units
    );

    bloodRequest.status = 'Approved';
    bloodRequest.assignedUnits = assignedBagIds;
    await bloodRequest.save();

    return ApiResponse.success(res, {
      data: bloodRequest,
      message: 'Request approved and blood units assigned successfully'
    });
  }

  /**
   * Rejects a blood dispatch request (Admin).
   * @route PUT /api/request/:id/reject
   */
  static async rejectRequest(req, res) {
    const bloodRequest = await Request.findById(req.params.id);
    if (!bloodRequest) {
      throw new NotFoundError('Blood request record');
    }

    if (bloodRequest.status !== 'Pending') {
      throw new ValidationError('Request has already been processed');
    }

    bloodRequest.status = 'Rejected';
    if (req.body.message) {
      bloodRequest.message = req.body.message;
    }
    await bloodRequest.save();

    return ApiResponse.success(res, {
      data: bloodRequest,
      message: 'Request rejected'
    });
  }

  /**
   * Marks blood package as delivered (Admin).
   * @route PUT /api/request/:id/complete
   */
  static async completeRequest(req, res) {
    const bloodRequest = await Request.findById(req.params.id);
    if (!bloodRequest) {
      throw new NotFoundError('Blood request record');
    }

    if (bloodRequest.status !== 'Approved') {
      throw new ValidationError('Request must be Approved before completing');
    }

    bloodRequest.status = 'Completed';
    await bloodRequest.save();

    return ApiResponse.success(res, {
      data: bloodRequest,
      message: 'Blood request delivery marked as Completed'
    });
  }
}

module.exports = RequestController;
