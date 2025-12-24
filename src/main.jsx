import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import NavBar from './component/Navbar';
import App from './App';
import { AppProvider } from './context/AppProvider';
import { AuthContextProvider, useAuthContext } from './context/useAuthContext';
import { LoadingProvider, useLoading } from './context/useLoadingContext';
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
import BeforeLogin from './page/BeforeLogin';
import MenuBar from './component/MenuBar';
import LoadingPage from './page/LoadingPage';

const RootComponent = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const { user, userData } = useAuthContext();
  const { loading } = useLoading(); // 👈 2. 전역 로딩 상태 가져오기

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // 1. 스플래시 화면 (앱 초기 로딩)
  if (isAppLoading) {
    return <SplashScreen />;
  }

  // 2. 분석 중 로딩 화면 (전역 loading이 true일 때 모든 화면 덮기)
  // 어느 페이지에서든 setLoading(true)만 하면 이 화면이 뜹니다.
  if (loading) {
    return <LoadingPage />;
  }

  // 3. 생년월일 데이터가 없는 경우
  if (!userData?.birthDate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 animate-in fade-in duration-700">
        <BeforeLogin />
      </div>
    );
  }

  // 4. 정상 상태
  return (
    <div className="relative px-3 py-6 min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors animate-in fade-in duration-700">
      <NavBar />
      <MenuBar />
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
        {/* /loadingpage 경로는 따로 둘 필요 없이 전역 상태로 관리되지만 유지함 */}
        <Route path="/loadingpage" element={<LoadingPage />} />
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
        {/* 3. LoadingProvider로 감싸서 useLoading을 쓸 수 있게 함 */}
        <LoadingProvider>
          <BrowserRouter>
            <RootComponent />
          </BrowserRouter>
        </LoadingProvider>
      </AuthContextProvider>
    </AppProvider>
  </React.StrictMode>,
);
