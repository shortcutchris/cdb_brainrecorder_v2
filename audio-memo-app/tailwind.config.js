/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-dark': '#2563EB',
        'primary-light': '#60A5FA',
        secondary: '#64748B',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        'text-primary': '#1E293B',
        'text-secondary': '#64748B',
        'text-disabled': '#CBD5E1',
      },
    },
  },
  plugins: [],
}

