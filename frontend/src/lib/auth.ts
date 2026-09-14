import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  is_active: boolean;
  email_verified: boolean;
  roles: { id: number; name: string }[];
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      
      setAuth: (user, accessToken, refreshToken) => 
        set({ user, accessToken, refreshToken }),
        
      setTokens: (accessToken, refreshToken) => 
        set((state) => ({ ...state, accessToken, refreshToken })),
        
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'diagnex-auth',
    }
  )
);
