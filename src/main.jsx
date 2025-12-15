import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProvider } from './context/AppProvider';
import { AuthContextProvider } from './context/useAuthContext';
import OpenInBrowserPage from './component/OpenInBrowerPage';
import Test from './Test';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. iOS 인앱 탈출 유도 페이지 */}
          <Route path="/open-in-browser" element={<OpenInBrowserPage />} />

          {/* 👈 [2] 여기에 /test 경로를 추가합니다. (AuthContext 영향 없음) */}
          <Route path="/test" element={<Test />} />

          {/* 3. 일반 애플리케이션 페이지 (나머지 모든 경로) */}
          <Route
            path="/*"
            element={
              <AuthContextProvider>
                <App />
              </AuthContextProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
);
