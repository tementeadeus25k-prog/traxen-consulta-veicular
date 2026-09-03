import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // Brand — quase-preto navy as the anchor color of the whole system
        navy: {
          950: '#05070D',
          900: '#080B16',
          800: '#0D1220',
          700: '#131A2C',
          600: '#1B2440',
          500: '#293458',
          400: '#4A5578',
          300: '#7680A0',
          200: '#AAB2C8',
          100: '#D6DAE8',
          50: '#EEF0F6',
        },
        // Electric blue accent
        electric: {
          700: '#1734A6',
          600: '#1E44D6',
          500: '#2F5CF5',
          400: '#5A7DFF',
          300: '#8CA4FF',
          200: '#C2CFFF',
          100: '#E3E9FF',
          50: '#F2F5FF',
        },
        ink: '#0A0E1A',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F6F7FB',
          subtle: '#F0F2F8',
          border: '#E4E7F0',
        },
        positive: {
          600: '#0E7A3F',
          500: '#159A4E',
          100: '#DEF6E6',
          50: '#F0FBF4',
        },
        attention: {
          600: '#B4740B',
          500: '#D8930F',
          100: '#FCF0D6',
          50: '#FFF9EC',
        },
        critical: {
          600: '#B3241C',
          500: '#DC3128',
          100: '#FBE2E0',
          50: '#FEF3F2',
        },
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(10, 14, 26, 0.04)',
        soft: '0 1px 2px rgba(10,14,26,0.04), 0 8px 24px -12px rgba(10,14,26,0.10)',
        card: '0 1px 1px rgba(10,14,26,0.03), 0 12px 32px -16px rgba(10,14,26,0.14)',
        lifted: '0 20px 50px -20px rgba(10,14,26,0.35)',
        glow: '0 0 0 1px rgba(47,92,245,0.15), 0 8px 30px -8px rgba(47,92,245,0.35)',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(5,7,13,1) 100%)',
        'radial-glow':
          'radial-gradient(600px circle at var(--x,50%) var(--y,0%), rgba(47,92,245,0.18), transparent 60%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '80%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-60%)' },
          '100%': { transform: 'translateX(160%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.4s ease both',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite',
        'progress-indeterminate': 'progress-indeterminate 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
