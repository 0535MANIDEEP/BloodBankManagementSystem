/**
 * @fileoverview Class-based Donor controller managing profiles and donation requests.
 * 
 * Demonstrates OOP Principle: Separation of Concerns & Abstraction.
 */

'use strict';

const User = require('../models/User');
const Inventory = require('../models/Inventory');
const EligibilityService = require('../services/EligibilityService');
const { ValidationError, NotFoundError, AuthError } = require('../utils/AppError');
const ApiResponse = require('../utils/ApiResponse');

class DonorController {
  /**
   * Fetch list of donors (Admin) or individual profile with history (Donor).
   * @route GET /api/donor
   */
  static async getDonors(req, res) {
    if (req.user.role === 'admin') {
      const donors = await User.find({ role: 'donor' }).sort('-createdAt');
      return ApiResponse.paginated(res, {
        data: donors,
        count: donors.length,
        message: 'Donor directory list retrieved'
      });
    }

    // Donor view
    const donor = await User.findById(req.user.id);
    if (!donor) {
      throw new NotFoundError('Donor profile');
    }
    const history = await Inventory.find({ donor: req.user.id }).sort('-addedDate');

    return ApiResponse.success(res, {
      data: {
        profile: donor,
        history
      },
      message: 'Donor metrics retrieved'
    });
  }

  /**
   * Log a new donation event.
   * @route POST /api/donor
   */
  static async createDonation(req, res) {
    const donor = await User.findById(req.user.id);
    if (!donor) {
      throw new NotFoundError('Donor profile');
    }

    // Run eligibility checks using the utility service
    const eligibility = EligibilityService.check(donor);
    if (!eligibility.isEligible) {
      throw new ValidationError(`Ineligible to donate: ${eligibility.reason}`);
    }

    const { units, idProofUrl } = req.body;
    if (!units || units <= 0) {
      throw new ValidationError('Please enter a valid amount of units (minimum 1)');
    }

    // Update donor document
    if (idProofUrl) {
      donor.idProofUrl = idProofUrl;
    }
    donor.lastDonationDate = new Date();
    await donor.save();

    // Log the blood bag (shelf life 42 days)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 42);

    const inventory = await Inventory.create({
      bloodGroup: donor.bloodGroup,
      units: units,
      status: 'available',
      expiryDate: expiryDate,
      donor: donor._id
    });

    return ApiResponse.created(res, {
      data: inventory,
      message: 'Donation logged successfully'
    });
  }

  /**
   * Update details of a donor user.
   * @route PUT /api/donor/:id
   */
  static async updateDonor(req, res) {
    let user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('Donor profile');
    }

    // Authorization checks
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      throw new AuthError('Not authorized to update this profile', 403);
    }

    const fieldsToUpdate = {};
    const allowedFields = [
      'name', 'phone', 'age', 'weight', 'bloodGroup',
      'healthConditions', 'isBanned', 'lastDonationDate'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    // Validate properties
    if (fieldsToUpdate.age !== undefined && (fieldsToUpdate.age < 18 || fieldsToUpdate.age > 65)) {
      throw new ValidationError('Donor age must be between 18 and 65 years');
    }
    if (fieldsToUpdate.weight !== undefined && fieldsToUpdate.weight < 50) {
      throw new ValidationError('Donor weight must be at least 50 kg');
    }

    user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    return ApiResponse.success(res, {
      data: user,
      message: 'Donor profile updated successfully'
    });
  }

  /**
   * Request dynamic AI-based eligibility metrics.
   * @route GET /api/donor/eligibility
   */
  static async getEligibility(req, res) {
    const donor = await User.findById(req.user.id);
    if (!donor) {
      throw new NotFoundError('Donor profile');
    }

    const assessment = EligibilityService.check(donor);
    return ApiResponse.success(res, {
      data: {
        ...assessment,
        bloodGroup: donor.bloodGroup
      },
      message: 'Eligibility evaluation computed'
    });
  }
}

module.exports = DonorController;
