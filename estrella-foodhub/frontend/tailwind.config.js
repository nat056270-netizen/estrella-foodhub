/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: {
      gray: Object.fromEntries([50,100,200,300,400,500,600,700,800,900].map(shade => [shade, `rgb(var(--gray-${shade}) / <alpha-value>)`])),
      primary: {50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#bc4817',700:'#a73c13',800:'#9a3412',900:'#7c2d12'},
      secondary: {50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534',900:'#14532d'},
    },
    fontFamily: { sans: ['Inter','Segoe UI','system-ui','sans-serif'] },
  } },
  plugins: [],
};
