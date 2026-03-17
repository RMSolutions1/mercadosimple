'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { isDark, toggle, setDark } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply saved preference on mount
    setDark(isDark);
  }, []);

  if (!mounted) return null;

  const isSmall = size === 'sm';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className={`relative inline-flex items-center gap-2 rounded-full transition-all duration-300 focus:outline-none ${
        isSmall ? 'p-1.5' : 'p-2'
      } ${className}`}
      style={{
        background: isDark ? '#1E293B' : '#F1F5F9',
        border: `2px solid ${isDark ? '#334155' : '#E2E8F0'}`,
        boxShadow: isDark ? '0 0 12px rgba(139,92,246,0.3)' : 'none',
      }}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div
        className="relative flex items-center justify-center rounded-full transition-all duration-300"
        style={{
          width: isSmall ? 22 : 28,
          height: isSmall ? 22 : 28,
          background: isDark ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
        }}
      >
        {isDark ? (
          <Moon className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
        ) : (
          <Sun className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
        )}
      </div>
      {!isSmall && (
        <span className="text-xs font-semibold pr-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
          {isDark ? 'Oscuro' : 'Claro'}
        </span>
      )}
    </button>
  );
}
