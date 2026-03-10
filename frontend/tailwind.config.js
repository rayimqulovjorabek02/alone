// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0f0f13',
        surface:  '#18181f',
        surface2: '#22222c',
        accent:   '#7c3aed',
        accent2:  '#6d28d9',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        xl:  '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      animation: {
        'fade-in':    'fadeIn .3s ease',
        'slide-up':   'slideUp .3s ease',
        'bounce-dot': 'bounceDot 1.2s infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        bounceDot: { '0%,80%,100%': { transform: 'translateY(0)' }, '40%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
}