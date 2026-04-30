import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'designer' | 'admin';
  credits: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshCredits: () => Promise<void>;
  setCredits: (credits: number) => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'client' | 'designer';
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.token, isLoading: false });
          // Set token for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.response?.data?.error || 'Login failed');
        }
      },

      register: async (registerData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', registerData);
          set({ user: data.user, token: data.token, isLoading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.response?.data?.error || 'Registration failed');
        }
      },

      logout: () => {
        set({ user: null, token: null });
        delete api.defaults.headers.common['Authorization'];
      },

      refreshCredits: async () => {
        try {
          const { data } = await api.get('/users/credits');
          set((state) => ({
            user: state.user ? { ...state.user, credits: data.credits } : null,
          }));
        } catch (err) {
          console.error('Failed to refresh credits:', err);
        }
      },

      setCredits: (credits) => {
        set((state) => ({
          user: state.user ? { ...state.user, credits } : null,
        }));
      },
    }),
    {
      name: 'leadflow-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        // Restore auth header after page refresh
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

export default useAuthStore;
