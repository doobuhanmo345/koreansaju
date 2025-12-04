// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppProvider'; // 👈 Provider 임포트

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* 🚀 전역 설정을 여기서 적용합니다. */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
);
