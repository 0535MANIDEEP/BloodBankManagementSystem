/**
 * @fileoverview Encapsulated Axios HTTP Client class.
 * 
 * Demonstrates OOP Principle: Encapsulation & Abstraction.
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configure Axios request/response interceptors.
   * @private
   */
  private setupInterceptors() {
    // Request: Inject Auth Token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response: Handle Errors and Expirations
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('auth-expired'));
        }
        const message = error.response?.data?.error || 'Something went wrong. Please try again.';
        return Promise.reject(new Error(message));
      }
    );
  }

  /**
   * HTTP GET request wrapper.
   */
  public async get<T>(url: string, config = {}): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * HTTP POST request wrapper.
   */
  public async post<T>(url: string, data = {}, config = {}): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * HTTP PUT request wrapper.
   */
  public async put<T>(url: string, data = {}, config = {}): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * HTTP DELETE request wrapper.
   */
  public async delete<T>(url: string, config = {}): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiClient();
export default api;
