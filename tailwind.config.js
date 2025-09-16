/** @type {import("tailwindcss").Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(0, 0%, 0%)', // Black
          foreground: 'hsl(0, 0%, 100%)' // White
        },
        secondary: {
          DEFAULT: 'hsl(210, 20%, 90%)', // Light gray
          foreground: 'hsl(210, 20%, 20%)' // Dark gray
        },
        destructive: {
          DEFAULT: 'hsl(0, 80%, 50%)', // Red
          foreground: 'hsl(0, 0%, 100%)' // White
        },
        warning: {
          DEFAULT: 'hsl(30, 80%, 50%)', // Orange
          foreground: 'hsl(0, 0%, 100%)' // White
        },
        success: {
          DEFAULT: 'hsl(120, 80%, 40%)', // Green
          foreground: 'hsl(0, 0%, 100%)' // White
        },
        info: {
          DEFAULT: 'hsl(190, 80%, 50%)', // Cyan
          foreground: 'hsl(0, 0%, 100%)' // White
        },
        border: 'hsl(210, 20%, 80%)',
        input: 'hsl(210, 20%, 80%)',
        ring: 'hsl(0, 0%, 0%)', // Black
        background: 'hsl(0, 0%, 100%)',
        foreground: 'hsl(210, 20%, 20%)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};


