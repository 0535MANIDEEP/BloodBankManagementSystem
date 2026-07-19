/**
 * @fileoverview Service managing all hospital request dispatch actions.
 * 
 * Demonstrates OOP Principle: Separation of Concerns & Abstraction.
 */

import api from './api';

export class RequestService {
  /**
   * Submit a new blood supply order (Hospital).
   * 
   * @param {object} requestData - { bloodGroup, units, priority, message }
   * @returns {Promise<any>}
   */
  static async create(requestData: any): Promise<any> {
    return api.post('/request', requestData);
  }

  /**
   * Fetch list of active orders (Hospitals see theirs, Admin sees all).
   * @returns {Promise<any>}
   */
  static async getAll(): Promise<any> {
    return api.get('/request');
  }

  /**
   * Approves a request and runs FIFO allocation (Admin).
   * 
   * @param {string} id - Target request ID.
   * @returns {Promise<any>}
   */
  static async approve(id: string): Promise<any> {
    return api.put(`/request/${id}/approve`);
  }

  /**
   * Rejects a request with an optional details parameter (Admin).
   * 
   * @param {string} id - Target request ID.
   * @param {string} [message] - Rejection explanation.
   * @returns {Promise<any>}
   */
  static async reject(id: string, message?: string): Promise<any> {
    return api.put(`/request/${id}/reject`, { message });
  }

  /**
   * Marks blood package delivery as completed (Admin).
   * 
   * @param {string} id - Target request ID.
   * @returns {Promise<any>}
   */
  static async complete(id: string): Promise<any> {
    return api.put(`/request/${id}/complete`);
  }
}

export default RequestService;
