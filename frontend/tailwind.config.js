/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F9FAFB',
          400: '#8F9E9B',
          500: '#718380',
          700: '#4A5D5A',
        },
        clay: {
          50: '#FFFBF9',
          300: '#E6CBBF',
          500: '#D4A38C',
          700: '#B0745A',
        },
        mineral: {
          50: '#F8FAFC',
          400: '#94A3B8',
          600: '#475569',
          900: '#1E293B',
        },
        surface: '#FAFAF9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(30, 41, 59, 0.05)',
        'glass-hover': '0 12px 36px 0 rgba(30, 41, 59, 0.1)',
      },
    },
  },
  plugins: [],
};
