import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/lib/axios';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return data.user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const { data: response } = await api.post('/auth/register', data);
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      updateUser: (updatedUser) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updatedUser } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      /**
       * Si hay token pero isAuthenticated es false (persistencia vieja/corrupta), no rehidratar sesión.
       * Evita que la UI quede “invitado” en navbar pero rutas con token crean sesión fantasma.
       */
      merge: (persistedState, currentState) => {
        try {
          const p = persistedState as Partial<AuthState> | undefined;
          const cur = currentState as AuthState;
          if (!p) return cur;
          const token = p.accessToken ?? null;
          const authOk = !!token && !!p.isAuthenticated;
          return {
            ...cur,
            user: authOk ? (p.user ?? null) : null,
            accessToken: authOk ? token : null,
            refreshToken: authOk ? (p.refreshToken ?? null) : null,
            isAuthenticated: authOk,
          };
        } catch {
          return currentState as AuthState;
        }
      },
    },
  ),
);
