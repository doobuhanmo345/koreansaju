// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  appType: 'spa',
  resolve: {
    alias: {
      // 리액트가 항상 프로젝트 루트의 node_modules에서만 로드되도록 강제합니다.
      react: path.resolve('./node_modules/react'),
    },
  },
  plugins: [
    react(),
    visualizer({
      // ← 추가
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  // server 설정을 아예 지우거나 아래처럼 비워두세요.
  server: {
    port: 3000,
  },
});
