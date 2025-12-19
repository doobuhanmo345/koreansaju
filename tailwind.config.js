/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    // ❌ 여기에 screens가 있으면 기본 설정(sm, md 등)이 다 사라집니다!
    extend: {
      // ✅ extend 안에 넣어야 기본 설정 + 커스텀 설정이 합쳐집니다.
      screens: {
        'max-xs': { max: '449px' }, // 449px 이하일 때 적용
      },
    },
  },
  plugins: [],
};
