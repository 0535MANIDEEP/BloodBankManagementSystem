/**
 * @fileoverview Service managing all inventory stock API actions.
 * 
 * Demonstrates OOP Principle: Separation of Concerns & Abstraction.
 */

import api from './api';

export class InventoryService {
  /**
   * Fetch stock summaries, active inventory details, and smart AI warnings.
   * @returns {Promise<any>}
   */
  static async getInventory(): Promise<any> {
    return api.get('/inventory');
  }

  /**
   * Add a new blood bag into stock (Admin).
   * 
   * @param {object} bagData - { bloodGroup, units, expiryDate, donorEmail }
   * @returns {Promise<any>}
   */
  static async addBag(bagData: any): Promise<any> {
    return api.post('/inventory', bagData);
  }

  /**
   * Discards a blood bag log from the index (Admin).
   * 
   * @param {string} id - Target inventory item ID.
   * @returns {Promise<any>}
   */
  static async deleteBag(id: string): Promise<any> {
    return api.delete(`/inventory/${id}`);
  }

  /**
   * Triggers the backend auto-expiry cleanup scheduler (Admin).
   * @returns {Promise<any>}
   */
  static async cleanExpired(): Promise<any> {
    return api.post('/inventory/clean-expired');
  }
}

export default InventoryService;
