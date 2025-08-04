/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
        'background-secondary': 'var(--color-background-secondary)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        info: 'var(--color-info)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        "background-gradient":
          "background-gradient var(--background-gradient-speed, 15s) cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite",
      },
      keyframes: {
        "background-gradient": {
          "0%, 100%": {
            transform: "translate(0, 0)",
            animationDelay: "var(--background-gradient-delay, 0s)",
          },
          "20%": {
            transform:
              "translate(calc(100% * var(--tx-1, 1)), calc(100% * var(--ty-1, 1)))",
          },
          "40%": {
            transform:
              "translate(calc(100% * var(--tx-2, -1)), calc(100% * var(--ty-2, 1)))",
          },
          "60%": {
            transform:
              "translate(calc(100% * var(--tx-3, 1)), calc(100% * var(--ty-3, -1)))",
          },
          "80%": {
            transform:
              "translate(calc(100% * var(--tx-4, -1)), calc(100% * var(--ty-4, -1)))",
          },
        },
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/line-clamp')
  ],
  daisyui: {
    themes: true, // Enable all themes
    darkTheme: "dark", // Set the default dark theme
    base: true, // Apply base styles
    styled: true, // Apply styled components
    utils: true, // Apply utility classes
    logs: false, // Disable logs
  }
}