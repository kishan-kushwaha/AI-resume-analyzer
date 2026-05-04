import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'ai-resume-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
