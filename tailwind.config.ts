import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/data/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/types/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ekub: {
          blue: '#1d4ed8',
          deep: '#0f172a',
          gold: '#f5c451',
          white: '#f8fbff',
          green: '#22c55e',
        },
      },
      boxShadow: {
        glow: '0 20px 60px rgba(29, 78, 216, 0.25)',
        glass: '0 12px 40px rgba(15, 23, 42, 0.35)',
      },
      backgroundImage: {
        'ekub-gradient': 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #f5c451 130%)',
        'ekub-surface': 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
