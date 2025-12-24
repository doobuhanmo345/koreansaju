import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  InformationCircleIcon,
  HomeIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { useLoading } from '../context/useLoadingContext';
import { GiYinYang } from 'react-icons/gi';
import { GlobeAltIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../context/useLanguageContext';
import { useTheme } from '../context/useThemeContext';
import { useAuthContext } from '../context/useAuthContext';
import useContactModal from '../hooks/useContactModal';
import ContactModal from './ContactModal';
import { useUsageLimit } from '../context/useUsageLimit';
import NotificationList from '../context/NotificationList';
// 로고 이미지 import
import logoKorDark from '../assets/Logo_Kor_DarkMode.png';
import logoEngDark from '../assets/Logo_Eng_DarkMode.png';
import logoKor from '../assets/Logo_Kor.png';
import logoEng from '../assets/Logo_Eng.png';
import { RiAdminFill } from 'react-icons/ri';

const MAIN_MENUS = [
  { id: 'home', ko: '홈', en: 'Home', path: '/', icon: HomeIcon },
  { id: 'fortune', ko: '사주란?', en: 'Saju?', path: '/sajuexp', icon: SparklesIcon },
];

const UTILITY_ITEMS = [
  {
    id: 'help',
    icon: InformationCircleIcon,
    ko: '도움말 / 문의',
    en: 'Help / Contact',
    action: 'SHOW_CONTACT_MODAL',
  },
];

export default function NavBar() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user, login, logout, userData, isCookieDone } = useAuthContext();
  const { isContactModalOpen, handleCloseContact, handleShowContact } = useContactModal();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const {
    editCount,
    setEditCount, // 필요시 수동 조작용 (모달 등에서 사용)
    MAX_EDIT_COUNT,
    isLocked,
    incrementUsage,
    checkLimit,
  } = useUsageLimit(user, userData, language);
  const navigate = useNavigate();
  const location = useLocation();
  // 어떤 파일이든 상단에서 이렇게 한 줄 쓰면 끝
  const {
    loading,
    setLoading,
    loadingType,
    setLoadingType,
    isCachedLoading,
    setIsCachedLoading,
    progress,
    setProgress,
  } = useLoading();
  const handleMainNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleUtilityClick = (item) => {
    if (item.action === 'SHOW_CONTACT_MODAL' && handleShowContact) {
      handleShowContact();
    }
    setIsMenuOpen(false);
  };

  const handleAuthAction = () => {
    if (user) {
      if (window.confirm(language === 'ko' ? '로그아웃 하시겠습니까?' : 'Do you want to logout?')) {
        logout();
      }
    } else {
      login();
    }
    setIsMenuOpen(false);
  };
  const onFortuneClick = async () => {
    // if (!user) return alert(UI_TEXT.loginReq[language]);

    setLoading(true);
    setLoadingType('fCookie');
    setResultType('fCookie');

    try {
      // openModal();
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };
  return (
    <div className="flex items-center justify-between py-3 max-w-xl m-auto relative z-20 px-2">
      {isContactModalOpen && (
        <ContactModal onClose={handleCloseContact} email="doobuhanmo3@gmail.com" />
      )}

      {/* [왼쪽] 로고 영역 */}
      <div
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/')}
      >
        <img
          src={
            theme === 'dark'
              ? language === 'ko'
                ? logoKorDark
                : logoEngDark
              : language === 'ko'
                ? logoKor
                : logoEng
          }
          alt="Logo"
          className="h-[40px] object-cover"
        />
      </div>

      {/* [오른쪽] 유틸 버튼 그룹 */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          {/* 1. 크레딧 카운터: 아이콘 + 남은 숫자 */}
          <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
            <BoltIcon
              className={`w-4 h-4 ${MAX_EDIT_COUNT - editCount === 0 ? 'text-red-500' : 'text-amber-500'} fill-current`}
            />
            <span
              className={`text-[11px] font-black font-mono ${MAX_EDIT_COUNT - editCount === 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}
            >
              {MAX_EDIT_COUNT - editCount}
            </span>
          </div>

          {/* 2. 포춘쿠키 미니 버튼: 클릭 시 바로 실행 */}
          <button
            onClick={onFortuneClick}
            disabled={isCookieDone}
            className={`relative flex items-center justify-center transition-transform active:scale-90 ${isCookieDone ? 'opacity-40 grayscale' : 'animate-bounce'}`}
          >
            <span className="text-sm">🥠</span>
            {/* 쿠키 안받았을 때만 우측 상단에 작은 점 알림 */}
            {!isCookieDone && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        </div>

        {/* 언어 버튼 */}

        <button
          onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
          className="px-3 py-2 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
        >
          <GlobeAltIcon className="w-4 h-4" />
          <span className={language === 'ko' ? 'text-indigo-600 dark:text-indigo-400' : ''}>
            KO
          </span>
          <span className="opacity-30">|</span>
          <span className={language === 'en' ? 'text-indigo-600 dark:text-indigo-400' : ''}>
            EN
          </span>
        </button>

        {/* 햄버거 버튼 (로그인 후에도 고정 노출) */}
        <div className="relative">
          <button
            onClick={() => toggleMenu()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* 드롭다운 메뉴 */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 origin-top-right bg-white dark:bg-slate-800 rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-2 space-y-1">
                {/* 1. 로그인 유저 정보 (이미지 + 이름 가로 배치 + 클릭 시 이동) */}
                {user && (
                  <div
                    onClick={() => {
                      navigate('/editprofile');
                      setIsMenuOpen(false);
                    }}
                    className="group flex flex-col gap-3 p-4 mb-4 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-[2rem] cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md"
                  >
                    {/* 상단: 유저 정보 영역 */}
                    <div className="flex items-center gap-3">
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border-2 border-indigo-100 dark:border-indigo-800 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                          Logged in as
                        </p>
                        <p className="text-base font-black text-gray-900 dark:text-white truncate">
                          {userData?.displayName || user?.displayName}
                        </p>
                      </div>
                    </div>

                    {/* 하단: 누가 봐도 '수정'임을 알리는 버튼 영역 */}
                    <div className="flex items-center justify-center gap-2 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl group-hover:bg-indigo-600 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors"
                      >
                        <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.154-1.262a.5.5 0 00.153-.122L16.12 6.447a.75.75 0 000-1.06l-2.122-2.122a.75.75 0 00-1.061 0L2.817 14.61a.5.5 0 00-.122.153z" />
                      </svg>
                      <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 group-hover:text-white transition-colors">
                        프로필 수정하기
                      </span>
                    </div>
                  </div>
                )}
                {userData?.role === 'admin' && (
                  <div
                    key={'admin'}
                    onClick={() => handleMainNavigate('/admin')}
                    className={`flex items-center p-3 cursor-pointer rounded-xl transition-colors ${location.pathname === '/admin' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 font-bold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                  >
                    <RiAdminFill className="w-5 h-5 mr-3" />
                    <span>{language === 'ko' ? '관리자' : 'admin'}</span>
                  </div>
                )}
                {userData?.role === 'saju_consultant' && (
                  <div
                    key={'sajuconsultant'}
                    onClick={() => handleMainNavigate('/consultant/dashboard')}
                    className={`flex items-center p-3 cursor-pointer rounded-xl transition-colors ${
                      location.pathname === '/consultant/dashboard' // 경로 조건 수정
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 font-bold'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {/* 명리학자 전용 아이콘 */}
                    <GiYinYang className="w-5 h-5 mr-3 text-indigo-500" />
                    <span>{language === 'ko' ? '명리학자 대시보드' : 'Consultant'}</span>
                  </div>
                )}

                {/* 모바일 전용 네비게이션 */}
                <div className="md:hidden">
                  <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Menu
                  </p>
                  {MAIN_MENUS.map((menu) => (
                    <div
                      key={menu.id}
                      onClick={() => handleMainNavigate(menu.path)}
                      className={`flex items-center p-3 cursor-pointer rounded-xl transition-colors ${location.pathname === menu.path ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 font-bold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                      <menu.icon className="w-5 h-5 mr-3" />
                      <span>{language === 'ko' ? menu.ko : menu.en}</span>
                    </div>
                  ))}
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-2" />
                </div>

                {/* 설정 메뉴 */}
                <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Settings
                </p>
                <div
                  onClick={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center p-3 cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-200"
                >
                  {theme === 'dark' ? (
                    <SunIcon className="w-5 h-5 mr-3 text-yellow-500" />
                  ) : (
                    <MoonIcon className="w-5 h-5 mr-3 text-gray-400" />
                  )}
                  <span className="font-medium">{language === 'ko' ? '테마 변경' : 'Theme'}</span>
                </div>

                {UTILITY_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleUtilityClick(item)}
                    className="flex items-center p-3 cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-200"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{language === 'ko' ? item.ko : item.en}</span>
                  </div>
                ))}

                <div className="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-2" />

                {/* 로그인 / 로그아웃 */}
                <div
                  onClick={() => handleAuthAction()}
                  className={`flex items-center p-3 cursor-pointer rounded-xl transition-colors ${user ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'}`}
                >
                  {user ? (
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                  ) : (
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                  )}
                  <span className="font-bold">
                    {user
                      ? language === 'ko'
                        ? '로그아웃'
                        : 'Logout'
                      : language === 'ko'
                        ? '로그인'
                        : 'Login'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 오버레이 */}
          {isMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
          )}
        </div>
        <NotificationList />
      </div>
    </div>
  );
}
