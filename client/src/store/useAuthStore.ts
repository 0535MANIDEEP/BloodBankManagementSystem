/**
 * @fileoverview Zustand auth store coordinating global auth state.
 */

import { create } from 'zustand';
import AuthService from '../services/AuthService';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'donor' | 'hospital';
  bloodGroup?: string;
  phone?: string;
  age?: number;
  weight?: number;
  lastDonationDate?: string;
  healthConditions?: string[];
  idProofUrl?: string;
  licenseNumber?: string;
  address?: string;
  isBanned?: boolean;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  login: (credentials: any) => Promise<UserProfile>;
  register: (userData: any) => Promise<UserProfile>;
  logout: () => void;
  checkAuth: () => Promise<UserProfile | null>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Catch token expiration events dispatched from ApiClient interceptor
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-expired', () => {
      set({ user: null, token: null, initialized: true });
    });
  }

  return {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    initialized: false,
    error: null,

    clearError: () => set({ error: null }),

    login: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const response = await AuthService.login(credentials);
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        set({ token, user, loading: false });
        return user;
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    register: async (userData) => {
      set({ loading: true, error: null });
      try {
        const response = await AuthService.register(userData);
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        set({ token, user, loading: false });
        return user;
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      set({ token: null, user: null, error: null });
    },

    checkAuth: async () => {
      const { token } = get();
      if (!token) {
        set({ initialized: true });
        return null;
      }

      set({ loading: true, error: null });
      try {
        const response = await AuthService.getProfile();
        const user = response.data;
        set({ user, loading: false, initialized: true });
        return user;
      } catch (err: any) {
        localStorage.removeItem('token');
        set({ token: null, user: null, loading: false, initialized: true });
        return null;
      }
    }
  };
});
export default useAuthStore;
