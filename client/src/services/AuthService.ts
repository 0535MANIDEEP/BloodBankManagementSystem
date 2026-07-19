/**
 * @fileoverview Service wrapping all authentication API calls.
 * 
 * Demonstrates OOP Principle: Separation of Concerns & Abstraction.
 */

import api from './api';

export class AuthService {
  /**
   * Submit credentials for user sign-in.
   * 
   * @param {object} credentials - { email, password }
   * @returns {Promise<any>} User details and JWT token container.
   */
  static async login(credentials: any): Promise<any> {
    return api.post('/auth/login', credentials);
  }

  /**
   * Register a new user (donor or hospital facility).
   * 
   * @param {object} userData - Sign-up parameters
   * @returns {Promise<any>} Registered user details and token.
   */
  static async register(userData: any): Promise<any> {
    return api.post('/auth/register', userData);
  }

  /**
   * Retrieve current logged-in user profile details.
   * @returns {Promise<any>} Active user document wrapper.
   */
  static async getProfile(): Promise<any> {
    return api.get('/auth/me');
  }
}

export default AuthService;
