import React, { useState, useEffect } from 'react'; // useState, useEffect 추가
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
import AdminPage from './page/AdminPage';
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import ApplySaju from './page/ApplySaju';
import ConsultantDashboard from './page/ConsultantDashboard';
import SplashScreen from './page/SplashScreen';
const RootComponent = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // 2.5초 후 로딩 해제
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // 1. 로딩 중일 때는 SplashScreen만 렌더링 (NavBar 안 보임)
  if (isAppLoading) {
    return <SplashScreen />;
  }

  // 2. 로딩 완료 후 전체 앱 구조 렌더링
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
          <RootComponent /> {/* 👈 로직을 분리한 컴포넌트 배치 */}
        </BrowserRouter>
      </AuthContextProvider>
    </AppProvider>
  </React.StrictMode>,
);
