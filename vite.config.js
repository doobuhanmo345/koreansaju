import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // appType: 'spa'는 제거하거나 기본값으로 둡니다.
  // vercel dev가 라우팅 제어를 하도록 맡기는 것이 좋습니다.
  plugins: [react()],

  server: {
    port: 3000,
    strictPort: true, // 포트가 꼬이지 않게 3000번을 고정하거나,
    // vercel dev가 알아서 하도록 설정합니다.
    proxy: {
      // 로컬 개발 환경에서 /api 요청을 처리하기 위한 프록시 설정
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  assetsInclude: ['**/*.html'],
});
