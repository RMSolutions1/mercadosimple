import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (v: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggle: () => {
        const next = !get().isDark;
        set({ isDark: next });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', next);
        }
      },
      setDark: (v: boolean) => {
        set({ isDark: v });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', v);
        }
      },
    }),
    { name: 'ms-theme' }
  )
);
