import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import NavBar from './component/Navbar';
import App from './App';
import ScrollToTop from './utils/ScrollToTop';
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
import Wealth from './page/Wealth';
import Match from './page/Match';
import FortuneCookie from './page/FortuneCookie';
import SajuAnalysisPage from './page/SajuAnalysisPage';
import TodaysLuckPage from './page/TodaysLuckPage';
import YearlyLuckPage from './page/YearlyLuckPage';
import SajuResult from './component/SajuResult';
import BasicAnaPage from './page/BasicAnaPage';
import TarotDailyPage from './page/TarotDailyPage';
import TarotMoneyPage from './page/TarotMoneyPage';
import TarotCounselingPage from './page/TarotCounselingPage';
import TarotLovePage from './page/TarotLovePage';
import FeedbackForm from './page/FeedbackForm';
import EditPrompt from './page/EditPrompt';
import SazaTalk from './page/SazaTalk';
import Ad from './page/Ad';
const RootComponent = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const { user, userData } = useAuthContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);
  // 수정 제안
  const pathname = window.location.pathname;
  const isAdPage = pathname.startsWith('/ad');
  const isBrowserGuide = pathname === '/open-in-browser';

  // 1. 광고 페이지라면 무조건 여기서 끝냄 (최우선순위 보장)
  if (isAdPage) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Routes>
          <Route path="/ad" element={<Ad />} />
          <Route path="*" element={<Ad />} />
        </Routes>
      </div>
    );
  }

  // 2. 광고 페이지가 아닐 때만 나머지 로직 수행
  if (isBrowserGuide) {
    return <OpenInBrowserPage />;
  }

  if (isAppLoading) {
    return <SplashScreen />;
  }

  // 3. 생년월일 데이터가 없는 경우
  if (!isAdPage && !userData?.birthDate) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 animate-in fade-in duration-700">
        <BeforeLogin />
      </div>
    );
  }

  // 4. 정상 상태
  return (
    <div className="min-h-screen relative px-3 py-6 bg-gray-50 dark:bg-slate-900 transition-colors animate-in fade-in duration-700">
      <ScrollToTop />

      <div className="pb-24">
        <NavBar />
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="/editprompt" element={<EditPrompt />} />
          </Route>
          <Route path="/sazatalk" element={<SazaTalk />} />

          <Route path="/feedback" element={<FeedbackForm />} />
          <Route path="/tarotmoney" element={<TarotMoneyPage />} />
          <Route path="/tarotlove" element={<TarotLovePage />} />
          <Route path="/tarotcounseling" element={<TarotCounselingPage />} />
          <Route path="/tarotdaily" element={<TarotDailyPage />} />
          <Route path="/sajuresult" element={<SajuResult />} />
          <Route path="/open-in-browser" element={<OpenInBrowserPage />} />
          <Route path="/basic" element={<BasicAnaPage />} />
          <Route path="/todaysluck" element={<TodaysLuckPage />} />
          <Route path="/2026luck" element={<YearlyLuckPage />} />
          <Route path="/test" element={<Test />} />
          <Route path="/wealth" element={<Wealth />} />
          <Route path="/match" element={<Match />} />
          {/* <Route path="/basic" element={<SajuAnalysisPage />} /> */}
          <Route path="/fortunecookie" element={<FortuneCookie />} />
          <Route path="/editprofile" element={<EditProfile />} />

          <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
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
      <MenuBar />
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
