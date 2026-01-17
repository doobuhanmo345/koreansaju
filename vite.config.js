// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // server 설정을 아예 지우거나 아래처럼 비워두세요.
  server: {
    port: 3000,
  },
});
