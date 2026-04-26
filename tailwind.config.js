/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rotalog: {
          background: '#0a0a0a', // Dark background from the mock
          card: '#141414', // Card surface color
          primary: '#00ff66', // Neon green accent
          border: '#222222',
        },
        brand: {
          50: '#f8f7f2',
          100: '#ece9db',
          200: '#ddd6bc',
          300: '#cec39d',
          400: '#b59f69',
          500: '#9c7d3d',
          600: '#806533',
          700: '#5f4c27',
          800: '#3f331b',
          900: '#201a0e',
        },
        neutral: {
          50: '#f7f7f8',
          100: '#ececef',
          200: '#d8d9de',
          300: '#b8bac3',
          400: '#9194a1',
          500: '#6e7282',
          600: '#525664',
          700: '#3d404b',
          800: '#282a32',
          900: '#16171d',
        },
        success: '#0f766e',
        warning: '#b45309',
        danger: '#b91c1c',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      borderRadius: {
        xl2: '1rem',
      },
      boxShadow: {
        card: '0 10px 30px -15px rgba(0, 0, 0, 0.25)',
      },
      screens: {
        xs: '480px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}
