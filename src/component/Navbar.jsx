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
// ... (상단 import 생략)

export default function NavBar() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user, login, logout, userData, isCookieDone } = useAuthContext();
  const { isContactModalOpen, handleCloseContact, handleShowContact } = useContactModal();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const { editCount, MAX_EDIT_COUNT } = useUsageLimit(user, userData, language);
  const navigate = useNavigate();
  const location = useLocation();
  const { setLoading, setLoadingType } = useLoading();

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
    setLoading(true);
    setLoadingType('fCookie');
    try {
      // 쿠키 로직 실행
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
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
        {/* 크레딧 & 포춘쿠키 미니바 */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 mr-1">
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
          <button
            onClick={() => navigate('/fortunecookie')}
            disabled={isCookieDone}
            className={`relative flex items-center justify-center transition-transform active:scale-90 ${isCookieDone ? 'opacity-40 grayscale' : 'animate-bounce'}`}
          >
            <span className="text-sm">🥠</span>
            {!isCookieDone && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        </div>

        {/* 알림 리스트 아이콘 */}
        <NotificationList />

        {/* 햄버거 버튼 */}
        <div className="relative ml-1">
          <button
            onClick={() => toggleMenu()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 origin-top-right bg-white dark:bg-slate-800 rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-2 space-y-1">
                {/* 3. 메뉴 리스트 */}
                <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Menu
                </p>
                {MAIN_MENUS.map((menu) => (
                  <div
                    key={menu.id}
                    onClick={() => handleMainNavigate(menu.path)}
                    className={`flex items-center p-3 cursor-pointer rounded-xl transition-colors ${location.pathname === menu.path ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50'}`}
                  >
                    <menu.icon className="w-5 h-5 mr-3" />
                    <span>{language === 'ko' ? menu.ko : menu.en}</span>
                  </div>
                ))}

                <div className="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-2" />

                {/* 4. 설정 섹션 (언어 선택 포함) */}
                <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Settings
                </p>

                {/* [언어 선택 버튼 추가] */}
                <div
                  onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
                  className="flex items-center p-3 cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-200"
                >
                  <GlobeAltIcon className="w-5 h-5 mr-3 text-indigo-500" />
                  <div className="flex-1 font-medium">
                    {language === 'ko' ? '언어 변경' : 'Language'}
                  </div>
                  <div className="flex gap-1 text-[10px] font-black">
                    <span className={language === 'ko' ? 'text-indigo-600' : 'text-gray-400'}>
                      KO
                    </span>
                    <span className="text-gray-300">/</span>
                    <span className={language === 'en' ? 'text-indigo-600' : 'text-gray-400'}>
                      EN
                    </span>
                  </div>
                </div>

                {/* 테마 변경 */}
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
                  className={`flex items-center p-3 cursor-pointer rounded-xl transition-colors ${user ? 'text-red-500 hover:bg-red-50' : 'text-indigo-600 hover:bg-indigo-50'}`}
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
        </div>
      </div>
    </div>
  );
}
