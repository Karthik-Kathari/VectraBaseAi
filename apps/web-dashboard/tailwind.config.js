/** @type {import('tailwindcss').Config} */
const forms = require('@tailwindcss/forms');

module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          bg:      '#090A0F',
          surface: '#11131C',
          border:  '#1E2230',
          hover:   '#1A1E2E',
        },
        text: {
          primary: '#F8FAFC',
          muted:   '#94A3B8',
          subtle:  '#64748B',
        },
        cyan: {
          electric: '#06B6D4',
        },
        indigo: {
          accent: '#6366F1',
        },
        emerald: {
          cache: '#10B981',
        },
        amber: {
          warn: '#F59E0B',
        },
        rose: {
          guard: '#F43F5E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':  'spin 4s linear infinite',
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'cyan-glow':   '0 0 20px rgba(6, 182, 212, 0.3)',
        'indigo-glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'emerald-glow':'0 0 20px rgba(16, 185, 129, 0.3)',
        'inner-dark':  'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [forms],
};
