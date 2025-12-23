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
} from '@heroicons/react/24/outline';
import { GiYinYang } from 'react-icons/gi';
import { GlobeAltIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../context/useLanguageContext';
import { useTheme } from '../context/useThemeContext';
import { useAuthContext } from '../context/useAuthContext';
import useContactModal from '../hooks/useContactModal';
import ContactModal from './ContactModal';

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
  const { user, login, logout, userData } = useAuthContext();
  const { isContactModalOpen, handleCloseContact, handleShowContact } = useContactModal();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigate = useNavigate();
  const location = useLocation();

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

      {/* [중앙] 데스크탑 메뉴 */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-slate-800/50 p-1 rounded-full backdrop-blur-sm">
          {MAIN_MENUS.map((menu) => {
            const isActive = location.pathname === menu.path;
            return (
              <button
                key={menu.id}
                onClick={() => handleMainNavigate(menu.path)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200
                  ${isActive ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-slate-700/50'}
                `}
              >
                <menu.icon className="w-4 h-4" />
                {language === 'ko' ? menu.ko : menu.en}
              </button>
            );
          })}
        </div>
      </div>

      {/* [오른쪽] 유틸 버튼 그룹 */}
      <div className="flex items-center gap-1">
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
                    className="flex items-center gap-3 px-3 py-3 mb-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 transition-colors"
                  >
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border border-indigo-200 dark:border-indigo-500/30 object-cover"
                    />
                    <div className="flex flex-col min-w-0">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight leading-none mb-1">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                        {userData?.displayName || user?.displayName}
                      </p>
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
      </div>
    </div>
  );
}
