/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f9ff',
          100: '#eaf3ff',
          200: '#cfe6ff',
          300: '#add6ff',
          400: '#7cc0ff',
          500: '#3490ff',
          600: '#2178e6',
          700: '#155ec2',
          800: '#0b458f',
          900: '#083064'
        },
        muted: {
          50: '#fafafa',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
        }
      },
      boxShadow: {
        subtle: '0 6px 18px rgba(16,24,40,0.06)',
        focus: '0 6px 24px rgba(52,144,255,0.12)'
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(.2,.9,.2,1)'
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite'
      }
    }
  },
  plugins: [],
};
