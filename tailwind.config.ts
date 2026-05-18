import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#246978',
          dark:    '#1a4f5a',
          light:   '#3a8a9e',
        },
        lime: {
          DEFAULT: '#CFD357',
          dark:    '#a8ac3a',
          light:   '#dde065',
        },
        cream: {
          DEFAULT: '#F5F3EF',
          dark:    '#e8e4dc',
        },
        gray: {
          DEFAULT: '#6D6E71',
        },
        ink: {
          DEFAULT: '#2C2C2C',
          mid:     '#6D6E71',
          light:   '#9a9b9d',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(2.4rem,5vw,4rem)', { lineHeight: '1.1', fontWeight: '600' }],
        'h2':      ['clamp(1.6rem,3.5vw,2.4rem)', { lineHeight: '1.2', fontWeight: '600' }],
        'h3':      ['1.25rem', { lineHeight: '1.4', fontWeight: '300' }],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,.1), 0 16px 40px rgba(0,0,0,.1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
