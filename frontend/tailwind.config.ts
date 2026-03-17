import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Argentina Auténtica
        'arg-celeste': '#74ACDF',      // Celeste de la bandera argentina
        'arg-celeste-dark': '#4A8AC4', // Celeste oscuro para hovers
        'arg-celeste-light': '#E8F4FD',// Celeste muy claro para fondos
        'arg-sol': '#F6B40E',          // Sol de Mayo dorado
        'arg-sol-dark': '#D4960A',     // Sol oscuro
        'arg-blanco': '#FFFFFF',
        'arg-verde': '#007140',        // Verde de la escarapela
        'arg-tierra': '#8B5E3C',       // Tierra pampeana
        'arg-campo': '#6B8F3A',        // Verde campo/agricultura
        'arg-petroleo': '#2C4A6B',     // Azul petróleo/industria
        'arg-mineria': '#7A6652',      // Marrón minerales
        // Mantener compatibilidad
        'ms-blue': '#4A8AC4',
        'ms-yellow': '#F6B40E',
        'ms-green': '#007140',
        'ms-orange': '#E8650A',
        primary: {
          50: '#E8F4FD',
          100: '#C5E1F7',
          200: '#9DCEF0',
          300: '#74ACDF',
          400: '#4A8AC4',
          500: '#2E6DA8',
          600: '#1E5490',
          700: '#153F75',
          800: '#0E2D5A',
          900: '#081E3E',
          DEFAULT: '#4A8AC4',
        },
      },
      fontFamily: {
        sans: ['Lato', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        heading: ['"Raleway"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'arg-flag': 'linear-gradient(180deg, #74ACDF 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #74ACDF 66.66%)',
        'arg-gradient': 'linear-gradient(135deg, #74ACDF 0%, #4A8AC4 50%, #2E6DA8 100%)',
        'arg-hero': 'linear-gradient(160deg, #1E3A5F 0%, #2E6DA8 40%, #4A8AC4 70%, #74ACDF 100%)',
        'sol-radial': 'radial-gradient(circle, #F6B40E 30%, #D4960A 70%)',
      },
      boxShadow: {
        'arg': '0 4px 20px rgba(74, 138, 196, 0.25)',
        'arg-lg': '0 8px 40px rgba(74, 138, 196, 0.30)',
        'sol': '0 4px 20px rgba(246, 180, 14, 0.40)',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
