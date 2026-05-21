import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#FAF7F2',
        foreground: '#1C1917',
        panel: '#FFFFFF',
        border: '#E8E3D9',
        map: '#EDE8DF',
        road: '#D4CFC5',
        primary: {
          DEFAULT: '#1D9E75',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#185FA5',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#BA7517',
          foreground: '#FFFFFF',
        },
        stack: {
          DEFAULT: '#993556',
          foreground: '#FFFFFF',
        },
        alu: {
          DEFAULT: '#0F6E56',
          foreground: '#FFFFFF',
        },
        muted: '#78716C',
        dim: '#A8A29E',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
