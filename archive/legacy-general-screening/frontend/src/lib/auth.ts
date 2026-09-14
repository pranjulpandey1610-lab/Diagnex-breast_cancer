/**
 * Diagnex Frontend — Auth Store
 *
 * Zustand store for authentication state, login/logout,
 * and role-based access helpers.
 */

import { create } from 'zustand';
import api from './api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'patient' | 'doctor' | 'admin' | 'researcher';
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { access_token, refresh_token } = response.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    // Fetch user profile
    await get().fetchUser();
  },

  register: async (email: string, password: string, fullName: string) => {
    await api.post('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false, isLoading: false });
    window.location.href = '/auth/login';
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const response = await api.get('/api/auth/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user, isLoading: false });
  },
}));

// ── Role Helpers ─────────────────────────────────────────────

export const getDashboardPath = (role: string): string => {
  switch (role) {
    case 'patient':
      return '/dashboard/patient';
    case 'doctor':
      return '/dashboard/doctor';
    case 'admin':
      return '/dashboard/admin';
    case 'researcher':
      return '/dashboard/researcher';
    default:
      return '/dashboard/patient';
  }
};
