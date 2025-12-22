import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import NavBar from './component/Navbar';
import App from './App';
import { AppProvider } from './context/AppProvider';
import { AuthContextProvider } from './context/useAuthContext';
import OpenInBrowserPage from './component/OpenInBrowerPage';
import Test from './Test';
import SajuExp from './page/SajuExp';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EditProfile from './page/EditProfile';
const root = ReactDOM.createRoot(document.getElementById('root'));

// 1. 공통 레이아웃 컴포넌트 정의 (파일로 따로 빼도 됩니다)
const Layout = () => {
  return (
    <div className="relative px-3 py-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* 모든 페이지에 보일 네비게이션 */}
      <NavBar />

      {/* 👈 여기에 자식 Route 컴포넌트(Test, App 등)가 렌더링됩니다 */}
      <Outlet />
    </div>
  );
};
root.render(
  <React.StrictMode>
    <AppProvider>
      {/* 👈 AuthContextProvider를 최상위로 올림 (Navbar에서도 유저 정보 쓰기 위함) */}
      <AuthContextProvider>
        <BrowserRouter>
          <div className="relative px-3 py-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
            {/* 👈 Navbar 위치 */}
            <NavBar />

            <Routes>
              <Route path="/open-in-browser" element={<OpenInBrowserPage />} />
              <Route path="/test" element={<Test />} />
              <Route path="/editprofile" element={<EditProfile />} />
              <Route path="/sajuexp" element={<SajuExp />} />
              {/* 👈 App을 감싸던 AuthProvider는 제거 (위에서 이미 감쌌으므로) */}
              <Route path="/*" element={<App />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthContextProvider>
    </AppProvider>
  </React.StrictMode>,
);
