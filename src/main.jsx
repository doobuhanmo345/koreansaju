import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProvider } from './context/AppProvider';
import { AuthContextProvider } from './context/useAuthContext';
import OpenInBrowserPage from './component/OpenInBrowerPage'; // 경로 수정 확인
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // 👈 [추가] 라우터 import

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AppProvider>
      {/* 👈 [추가] BrowserRouter로 전체를 감쌉니다. */}
      <BrowserRouter>
        {/* AuthContextProvider 내에서 리다이렉트가 발생하므로, 
          /open-in-browser 경로와 AuthProvider가 필요한 나머지 페이지를 분리합니다.
        */}
        <Routes>
          {/* 1. iOS 인앱 탈출 유도 페이지 (AuthContext가 필요 없음) */}
          <Route path="/open-in-browser" element={<OpenInBrowserPage />} />

          {/* 2. 일반 애플리케이션 페이지 (AuthContext가 필요) */}
          <Route
            path="/*" // 나머지 모든 경로를 의미
            element={
              <AuthContextProvider>
                <App /> {/* App 컴포넌트 내부에 다른 라우팅이 있을 수 있습니다. */}
              </AuthContextProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
);
