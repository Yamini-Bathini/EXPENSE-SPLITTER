import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        surface: '#f8fafc',
        panel: '#f8fafc',
        muted: '#6b7280',
        border: '#e5e7eb',
      },
    },
  },
  plugins: [],
} satisfies Config;
