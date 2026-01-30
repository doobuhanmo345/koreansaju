import React, { useState, useEffect, lazy, Suspense } from 'react';
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
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Ad from './page/Ad';
import SazaTalkAd from './page/SazaTalkAd';
import SazaTalkAdKr from './page/SazaTalkAdKr';
import NewYearAdKr from './page/NewYearAdKr';
import NewYearAdEn from './page/NewYearAdEn';
import SazaTalkAdEn from './page/SazaTalkAdEn';
import { HelmetProvider } from 'react-helmet-async';

// 🔥 모든 페이지를 lazy loading으로 변경
const SajuExp = lazy(() => import('./page/SajuExp'));
const EditProfile = lazy(() => import('./page/EditProfile'));
const AdminPage = lazy(() => import('./page/AdminPage'));
const ProtectedRoute = lazy(() => import('./routes/ProtectedRoute'));
const ApplySaju = lazy(() => import('./page/ApplySaju'));
const ConsultantDashboard = lazy(() => import('./page/ConsultantDashboard'));
const SplashScreen = lazy(() => import('./page/SplashScreen'));
// const BeforeLogin = lazy(() => import('./page/BeforeLogin'));
const NoBirthday = lazy(() => import('./page/NoBirthday'));
const MenuBar = lazy(() => import('./component/MenuBar'));
const LoadingPage = lazy(() => import('./page/LoadingPage'));
const Wealth = lazy(() => import('./page/Wealth'));
const Match = lazy(() => import('./page/Match'));
const FortuneCookie = lazy(() => import('./page/FortuneCookie'));
const TodaysLuckPage = lazy(() => import('./page/TodaysLuckPage'));
const YearlyLuckPage = lazy(() => import('./page/YearlyLuckPage'));
const SajuResult = lazy(() => import('./component/SajuResult'));
const BasicAnaPage = lazy(() => import('./page/BasicAnaPage'));
const TarotDailyPage = lazy(() => import('./page/TarotDailyPage'));
const TarotMoneyPage = lazy(() => import('./page/TarotMoneyPage'));
const TarotCounselingPage = lazy(() => import('./page/TarotCounselingPage'));
const TarotLovePage = lazy(() => import('./page/TarotLovePage'));
const FeedbackForm = lazy(() => import('./page/FeedbackForm'));
const EditPrompt = lazy(() => import('./page/EditPrompt'));
const SazaTalk = lazy(() => import('./page/SazaTalk'));
const BasicAna = lazy(() => import('./page/BasicAna'));
const PayWall = lazy(() => import('./page/PayWall'));
const TestAnalysisPage = lazy(() => import('./page/TestAnalysisPage'));
const DayLuckPage = lazy(() => import('./page/DayLuckPage'));
const SelDatePage = lazy(() => import('./page/SelDatePage'));
const SelBirthPage = lazy(() => import('./page/SelBirthPage'));
const FirstDatePage = lazy(() => import('./page/FirstDatePage'));
const InterviewPage = lazy(() => import('./page/InterviewPage'));
const MessagesPage = lazy(() => import('./page/MessagesPage'));
 export const specialPaths = [
   '/ad',
   '/paywall',
   '/sazatalkad',
   '/sazatalkadkr',
   '/newyearadkr',
   '/newyearaden',
   '/test2',
   '/open-in-browser',
 ];
import LoginLoadingOverlay from './component/LoginLoadingOverlay';

// 🔥 로딩 컴포넌트 (간단하게)
const LoadingFallback = () => <SplashScreen />;

const RootComponent = () => {
  const { user, userData, loadingUser, isLoggingIn, cancelLogin } = useAuthContext();

  const pathname = window.location.pathname.trim(); // 공백 제거
 

 
  const isSpecialPage = specialPaths.some((path) => pathname === path || pathname.startsWith(path + '/'));

  // 로그 찍어서 false 나오면 정규식/경로 문제임
 
  const isBrowserGuide = pathname.startsWith('/open-in-browser'); // === 대신 startsWith 추천

  // 1. 광고 페이지라면 무조건 여기서 끝냄 (최우선순위 보장)
  if (isSpecialPage) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/ad" element={<Ad />} />
            <Route path="/sazatalkadkr" element={<SazaTalkAdKr />} />
            <Route path="/paywall" element={<PayWall />} />
            <Route path="/sazatalkad" element={<SazaTalkAdEn />} />
            <Route path="/newyearadkr" element={<NewYearAdKr />} />
            <Route path="/newyearaden" element={<NewYearAdEn />} />
            <Route path="/test2" element={<TestAnalysisPage />} />
            <Route path="*" element={<Ad />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  // 2. 광고 페이지가 아닐 때만 나머지 로직 수행
  if (isBrowserGuide) {
    return <OpenInBrowserPage />;
  }

  if (loadingUser) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <SplashScreen />
      </Suspense>
    );
  }
  // 3. 로그아웃 상태 (Guest)
  // if (!user && !isSpecialPage) {
  //   return (
  //     <div className="bg-gray-50 dark:bg-slate-900 animate-in fade-in duration-700">
  //       <Suspense fallback={<LoadingFallback />}>
  //         <BeforeLogin />
  //       </Suspense>
  //     </div>
  //   );
  // }

  // 4. 로그인 되었으나 생일 정보가 없는 경우 (New User)
  if (user && !userData?.birthDate) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 animate-in fade-in duration-700">
        <Suspense fallback={<LoadingFallback />}>
          <NoBirthday />
        </Suspense>
      </div>
    );
  }

  // 4. 정상 상태
  return (
    <div className="min-h-screen relative px-3 bg-gray-50 dark:bg-slate-900 transition-colors animate-in fade-in duration-700">
      <ScrollToTop />
      {isLoggingIn && <LoginLoadingOverlay onCancel={cancelLogin} />}

      <div className="pb-24">
        <NavBar />

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route path="/editprompt" element={<EditPrompt />} />
            </Route>
            <Route path="/sazatalk" element={<SazaTalk />} />
            <Route path="/ana" element={<BasicAna />} />

            <Route path="/feedback" element={<FeedbackForm />} />
            <Route path="/tarotmoney" element={<TarotMoneyPage />} />
            <Route path="/tarotlove" element={<TarotLovePage />} />
            <Route path="/tarotcounseling" element={<TarotCounselingPage />} />
            <Route path="/tarotdaily" element={<TarotDailyPage />} />
            <Route path="/sajuresult" element={<SajuResult />} />
            <Route path="/open-in-browser" element={<OpenInBrowserPage />} />
            <Route path="/basic" element={<BasicAnaPage />} />
            <Route path="/todaysluck" element={<TodaysLuckPage />} />
            <Route path="/dayluck" element={<DayLuckPage />} />
            <Route path="/seldate" element={<SelDatePage />} />
            <Route path="/selbirth" element={<SelBirthPage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/2026luck" element={<YearlyLuckPage />} />
            <Route path="/test" element={<Test />} />
            <Route path="/date" element={<FirstDatePage />} />
            <Route path="/wealth" element={<Wealth />} />
            <Route path="/match" element={<Match />} />
            <Route path="/fortunecookie" element={<FortuneCookie />} />
            <Route path="/editprofile" element={<EditProfile />} />
            <Route path="/messages" element={<MessagesPage />} />

            <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

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
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <MenuBar />
      </Suspense>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <AppProvider>
        <AuthContextProvider>
          <LoadingProvider>
            <BrowserRouter>
              <RootComponent />
            </BrowserRouter>
          </LoadingProvider>
        </AuthContextProvider>
      </AppProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
