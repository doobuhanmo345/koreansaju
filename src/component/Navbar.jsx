import React, { useState } from 'react';
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  LanguageIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../context/useLanguageContext';
import logoKorDark from '../assets/Logo_Kor_DarkMode.png';
import logoEngDark from '../assets/Logo_Eng_DarkMode.png';
import logoKor from '../assets/Logo_Kor.png';
import logoEng from '../assets/Logo_Eng.png';
import { GlobeAltIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/useThemeContext';

// 1. 햄버거 메뉴의 추가 항목 리스트를 정의합니다.
// 이 리스트는 객체 형태로, 각 항목의 아이콘, 한국어/영어 텍스트, 클릭 이벤트 핸들러를 포함합니다.
const MENU_ITEMS = [
  // 참고: 테마 토글과 언어 설정은 복잡하여 Map에서 제외하고 개별 항목으로 유지하는 것이 더 효율적입니다.
  // 여기서는 '도움말/문의' 항목만 배열로 관리합니다.
  {
    id: 'help',
    icon: InformationCircleIcon,
    ko: '도움말 / 문의',
    en: 'Help / Contact',
    // 클릭 시 실행할 기본 로직 (여기서는 메뉴만 닫음)
    action: 'SHOW_CONTACT_MODAL',
  },
  //   {
  //     id: 'settings',
  //     icon: Cog6ToothIcon,
  //     ko: '사용자 설정',
  //     en: 'User Settings',
  //     action: () => console.log('User Settings Clicked'),
  //   },
];

export default function NavBar({ onShowContact }) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const { language, setLanguage } = useLanguage();
  // 2. Map 함수를 위한 항목 클릭 핸들러
  const handleItemClick = (item) => {
    if (item.action === 'SHOW_CONTACT_MODAL' && onShowContact) {
      onShowContact(); // 부모에서 받은 문의 팝업 함수 실행
    } else if (typeof item.action === 'function') {
      item.action(); // 기타 함수 실행
    }
    setIsMenuOpen(false); // 메뉴 닫기
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 max-w-xl m-auto relative z-20">
      {/* ✅ 왼쪽: 로고 + 타이틀 그룹 (변동 없음) */}
      {theme === 'dark' ? (
        <div className="flex items-center gap-3">
          <img
            src={language === 'ko' ? logoKorDark : logoEngDark}
            alt="Sajucha Logo"
            className="w-[300px] rounded-xl shadow-sm object-cover"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <img
            src={language === 'ko' ? logoKor : logoEng}
            alt="Sajucha Logo"
            className="w-[300px] rounded-xl shadow-sm object-cover"
          />
        </div>
      )}

      {/* ✅ 오른쪽: 버튼 그룹 (언어 버튼 + 햄버거 메뉴) */}
      <div className="flex items-center gap-2">
        {/* 1. 언어 변경 버튼 (기존 위치 유지) */}
        <button
          onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
          className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2 transition-all"
        >
          {/* 지구본 아이콘 및 텍스트 (기존 로직 유지) */}
          <GlobeAltIcon className="w-5 h-5 text-gray-400 dark:text-gray-400" />
          <div className="flex items-center gap-1.5">
            <span
              className={`transition-colors ${language === 'ko' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-gray-400 dark:text-gray-500 font-medium'}`}
            >
              KO
            </span>
            <span className="text-gray-300 dark:text-gray-600 text-[10px]">|</span>
            <span
              className={`transition-colors ${language === 'en' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-gray-400 dark:text-gray-500 font-medium'}`}
            >
              EN
            </span>
          </div>
        </button>

        {/* 2. 햄버거 메뉴 영역 */}
        <div className="relative">
          {/* 2-1. 햄버거 메뉴 버튼 */}
          <button
            onClick={toggleMenu}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors border border-gray-200 dark:border-gray-600/50"
            aria-label="Toggle Menu"
          >
            <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* 2-2. 드롭다운 메뉴 본체 */}
          {isMenuOpen && (
            <div
              className="absolute right-0 mt-3 w-48 origin-top-right 
                           bg-white dark:bg-slate-700 rounded-lg shadow-2xl 
                           ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
            >
              <div className="p-1.5 space-y-1.5">
                {/* 항목 1: 테마 토글 버튼 (개별 유지 - Prop Setter 사용) */}
                <div
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center justify-between p-3 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <span className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                    {theme === 'dark' ? (
                      <SunIcon className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <MoonIcon className="w-5 h-5 text-gray-500" />
                    )}
                    {language === 'ko' ? '테마 변경' : 'Theme'}
                  </span>
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    {language === 'ko' && theme === 'light' && '다크'}
                    {language === 'ko' && theme === 'dark' && '라이트'}
                    {language === 'en' && theme === 'light' && 'dark'}
                    {language === 'en' && theme === 'dark' && 'light'}
                  </span>
                </div>

                {/* 🚨 항목 2: 추가 메뉴 항목 (MAP으로 반복) 🚨 */}
                {MENU_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)} // 공통 핸들러 사용
                    className="flex items-center p-3 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    {/* 아이콘 컴포넌트를 동적으로 렌더링 */}
                    <item.icon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {language === 'ko' ? item.ko : item.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2-3. 메뉴가 열렸을 때 배경 클릭을 감지하여 닫는 오버레이 */}
          {isMenuOpen && (
            <div className="fixed inset-0 z-[5]" onClick={toggleMenu} aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}
