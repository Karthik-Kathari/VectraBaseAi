import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

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
        obsidian: {
          bg:      '#090b10',
          surface: '#111827',
          border:  '#1e293b',
          hover:   '#172033',
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
        purple: {
          accent:  '#9333ea',
          glow:    '#a855f7',
          DEFAULT: '#9333ea',
        },
        red: {
          accent:  '#e11d48',
          danger:  '#dc2626',
          DEFAULT: '#dc2626',
        },
        yellow: {
          highlight: '#f59e0b',
          warning:   '#eab308',
          DEFAULT:   '#eab308',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
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
        'cyan-glow':    '0 0 20px rgba(6, 182, 212, 0.3)',
        'indigo-glow':  '0 0 20px rgba(99, 102, 241, 0.3)',
        'emerald-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'inner-dark':   'inset 0 1px 0 rgba(255,255,255,0.05)',
        'neon-purple':  '0 0 16px rgba(168, 85, 247, 0.35)',
        'neon-red':     '0 0 16px rgba(244, 63, 94, 0.35)',
        'neon-amber':   '0 0 16px rgba(245, 158, 11, 0.35)',
        'neon-cyan':    '0 0 16px rgba(6, 182, 212, 0.35)',
        'neon-emerald': '0 0 16px rgba(16, 185, 129, 0.35)',
      },
    },
  },
  plugins: [forms],
};

export default config;
