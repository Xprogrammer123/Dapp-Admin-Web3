/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'web3-primary': '#3b82f6',
        'web3-secondary': '#10b981',
        'web3-accent': '#f97316',
        'web3-dark': '#111827',
        'web3-light': '#f3f4f6',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};