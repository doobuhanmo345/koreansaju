/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'max-xs': { max: '449px' },
      },
      // ✅ 애니메이션 핵심 설정 추가
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shine: {
          '100%': { left: '125%' },
        },
      },
      animation: {
        // '이름 시간 속도 지연(옵션) 채우기모드'
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'shine': 'shine 1s',
      },
    },
  },
  plugins: [],
};
