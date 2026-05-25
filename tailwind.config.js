/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/web/src/**/*.{html,ts}",
    "./apps/android/src/**/*.{html,ts}",
    "./shared/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#627eff',
        secondary: '#53c6e4',
        accent: '#66a6da',
      },
      animation: {
        'fade-in': 'fade-in 1s ease-out',
        'floaty': 'floaty 3s ease-in-out infinite',
        'pulse-whatsapp': 'pulse 1.5s infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'floaty': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.3' },
          '50%': { transform: 'translateY(-20px)', opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
