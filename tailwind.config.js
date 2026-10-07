/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#F4F5F7',
        surface: '#FFFFFF',
        line: '#E9EAEE',
        ink: {
          DEFAULT: '#101828',
          soft: '#475467',
          muted: '#98A2B3',
        },
        brand: {
          DEFAULT: '#6C5CE7',
          soft: '#EFEDFF',
          deep: '#4B3BC4',
        },
        income: '#12B76A',
        expense: '#F04438',
        savings: '#F79009',
      },
      borderRadius: {
        '4xl': '28px',
      },
    },
  },
  plugins: [],
};
