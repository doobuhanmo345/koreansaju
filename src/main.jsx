import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import NavBar from './component/Navbar';
import App from './App';
import { AppProvider } from './context/AppProvider';
import { AuthContextProvider, useAuthContext } from './context/useAuthContext'; // 👈 임포트 통합
import OpenInBrowserPage from './component/OpenInBrowerPage';
import Test from './Test';
import SajuExp from './page/SajuExp';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EditProfile from './page/EditProfile';
import AdminPage from './page/AdminPage';
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import ApplySaju from './page/ApplySaju';
import ConsultantDashboard from './page/ConsultantDashboard';
import SplashScreen from './page/SplashScreen';
import BeforeLogin from './page/BeforeLogin'; // 👈 BeforeLogin 직접 임포트 확인

const RootComponent = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const { user, userData } = useAuthContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // 1. 스플래시 화면 (로딩 중)
  if (isAppLoading) {
    return <SplashScreen />;
  }

  // 2. 생년월일 데이터가 없는 경우 (네브바 없이 BeforeLogin만 리턴)
  if (!userData?.birthDate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 animate-in fade-in duration-700">
        <BeforeLogin />
      </div>
    );
  }

  // 3. 정상 상태 (네브바 + 모든 페이지)
  return (
    <div className="relative px-3 py-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors animate-in fade-in duration-700">
      <NavBar />
      <Routes>
        <Route path="/open-in-browser" element={<OpenInBrowserPage />} />
        <Route path="/test" element={<Test />} />
        <Route path="/editprofile" element={<EditProfile />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="/apply-saju-consultant" element={<ApplySaju />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['saju_consultant']} />}>
          <Route path="/consultant/dashboard" element={<ConsultantDashboard />} />
        </Route>
        <Route path="/sajuexp" element={<SajuExp />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AppProvider>
      <AuthContextProvider>
        <BrowserRouter>
          <RootComponent />
        </BrowserRouter>
      </AuthContextProvider>
    </AppProvider>
  </React.StrictMode>,
);
