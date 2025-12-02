/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      // 'max-' 접두사를 붙여 최대 너비 브레이크포인트를 정의합니다.
      'max-xs': { max: '449px' }, // 449px 이하일 때 적용
      // sm, md, lg 등 기존 브레이크포인트는 여기에 정의되지 않도록 주의해야 합니다.
    },
    extend: {},
  },
  plugins: [],
};
