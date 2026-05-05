/** @type {import('tailwindcss').Config} */
export default {
  // Scan app files for Tailwind class usage.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // CareerOS dark-mode palette.
      colors: {
        background: '#0B0F1A',
        'accent-blue': '#3B82F6',
        'accent-purple': '#8B5CF6',
        'accent-cyan': '#06B6D4',
      },
    },
  },
  plugins: [],
}