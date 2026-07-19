/**
 * @fileoverview Service wrapping all donor directory API actions.
 * 
 * Demonstrates OOP Principle: Separation of Concerns & Abstraction.
 */

import api from './api';

export class DonorService {
  /**
   * Fetch list of donors (Admin) or individual profile with history logs (Donor).
   * @returns {Promise<any>}
   */
  static async getProfile(): Promise<any> {
    return api.get('/donor');
  }

  /**
   * Log a new donation event.
   * 
   * @param {object} donationData - { units, idProofUrl }
   * @returns {Promise<any>}
   */
  static async submitDonation(donationData: any): Promise<any> {
    return api.post('/donor', donationData);
  }

  /**
   * Request dynamic AI-based eligibility calculation.
   * @returns {Promise<any>}
   */
  static async checkEligibility(): Promise<any> {
    return api.get('/donor/eligibility');
  }

  /**
   * Update donor user profile details.
   * 
   * @param {string} id - Donor target ID.
   * @param {object} profileData - Parameters to update.
   * @returns {Promise<any>}
   */
  static async updateProfile(id: string, profileData: any): Promise<any> {
    return api.put(`/donor/${id}`, profileData);
  }
}

export default DonorService;
