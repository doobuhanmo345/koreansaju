import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  SparklesIcon,
  CircleStackIcon,
  UserCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  CreditCardIcon,
  PresentationChartLineIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';

import { useAuthContext } from '../context/useAuthContext';
import { RiAdminFill } from 'react-icons/ri';
import { GiYinYang } from 'react-icons/gi';
import { useLanguage } from '../context/useLanguageContext';

export default function MobileNav() {
  const [activeMenu, setActiveMenu] = useState(null);
  const { userData } = useAuthContext();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const isKo = language === 'ko';
  useEffect(() => {
    if (activeMenu) {
      // 메뉴가 열리면 body 스크롤 고정
      document.body.style.overflow = 'hidden';
    } else {
      // 메뉴가 닫히면 body 스크롤 복구
      document.body.style.overflow = 'unset';
    }

    // 컴포넌트 언마운트 시 클린업
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeMenu]);

  const formatBirth = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return isKo ? '정보 없음' : 'No Info';
    try {
      const [datePart, timePart] = dateStr.split('T');
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = (timePart || '00:00').split(':');
      return isKo
        ? `${year}년 ${month}월 ${day}일 ${hour}:${minute}`
        : `${month}/${day}/${year} ${hour}:${minute}`;
    } catch (e) {
      return isKo ? '형식 오류' : 'Format Error';
    }
  };

  const handleItemClick = (path) => {
    if (!path) {
      alert(isKo ? '준비중입니다.' : 'Coming soon!');
      return;
    }
    navigate(path);
    setActiveMenu(null);
  };

  const menuData = useMemo(() => {
    const profileItems = [];

    if (userData?.role === 'admin') {
      profileItems.push({
        name: isKo ? '관리자 페이지' : 'Admin Page',
        desc: isKo ? '시스템 제어 및 통계' : 'System Control & Stats',
        icon: <RiAdminFill className="w-6 h-6 text-rose-500" />,
        path: '/admin',
      });
    }

    if (userData?.role === 'saju_consultant') {
      profileItems.push({
        name: isKo ? '명리학자 대시보드' : 'Consultant Dashboard',
        desc: isKo ? '상담 요청 관리' : 'Manage Consultations',
        icon: <GiYinYang className="w-6 h-6 text-indigo-500" />,
        path: '/consultant/dashboard',
      });
    }

    profileItems.push(
      {
        name: isKo ? '프로필 수정' : 'Edit Profile',
        desc: isKo ? '이름, 생년월일 정보 변경' : 'Change Name, Birthdate',
        icon: <UserCircleIcon className="w-6 h-6" />,
        path: '/editprofile',
      },
      {
        name: isKo ? '상담 내역' : 'History',
        desc: isKo ? '내가 본 운세 기록 확인' : 'Check Fortune Records',
        icon: <PresentationChartLineIcon className="w-6 h-6" />,
        path: null,
      },
    );

    return {
      fortune: {
        title: isKo ? '운세보기' : 'Fortunes',
        color: 'text-amber-500',
        sections: [
          {
            subtitle: isKo ? '전통 사주' : 'Traditional Saju',
            items: [
              {
                name: isKo ? '기본 사주 분석' : 'Saju Analysis',
                desc: isKo ? '타고난 성격과 평생의 운명 흐름' : 'Your innate traits and destiny',
                icon: <IdentificationIcon className="w-6 h-6" />,
                path: '/basic',
              },
              {
                name: isKo ? '오늘의 운세' : "Today's Luck",
                desc: isKo ? '오늘 하루 나의 기운 확인' : 'Daily Energy Check',
                icon: <CalendarDaysIcon className="w-6 h-6" />,
                path: '/todaysluck',
              },
              {
                name: isKo ? '신년 운세' : 'New Year Luck',
                desc: isKo ? '병오년 한 해의 흐름' : 'Flow of the Year',
                icon: <SparklesIcon className="w-6 h-6" />,
                path: '/2026luck',
              },
              {
                name: isKo ? '궁합 보기' : 'Compatibility',
                desc: isKo ? '상대방과의 에너지 조화' : 'Match with Others',
                icon: <UserPlusIcon className="w-6 h-6" />,
                path: '/match',
              },
              {
                name: isKo ? '재물운 분석' : 'Wealth Analysis',
                desc: isKo ? '타고난 재복과 부의 흐름' : 'Your innate wealth and financial flow',
                // 돈이 쌓이는 느낌의 아이콘 (CircleStackIcon 또는 BanknotesIcon)
                icon: <CircleStackIcon className="w-6 h-6" />,
                path: '/wealth',
              },
            ],
          },
          {
            subtitle: isKo ? '신비로운 타로' : 'Mystical Tarot',
            items: [
              {
                name: isKo ? '타로 연애운' : 'Tarot Love',
                desc: isKo ? '사랑과 설렘의 향방' : 'Direction of Love',
                icon: <SparklesIcon className="w-6 h-6" />,
                path: '/tarotlove',
              },
              {
                name: isKo ? '타로 오늘의 운세' : "Tarot Today's Luck",
                desc: isKo ? '카드로 보는 오늘 하루' : 'Daily Tarot Reading',
                icon: <CalendarDaysIcon className="w-6 h-6" />,
                path: '/tarotdaily',
              },
              {
                name: isKo ? '타로 금전운' : 'Tarot Wealth',
                desc: isKo ? '나의 재물과 풍요의 흐름' : 'Flow of Wealth',
                icon: <CircleStackIcon className="w-6 h-6" />,
                path: '/tarotmoney',
              },
              {
                name: isKo ? '타로 고민상담' : 'Tarot Counseling',
                desc: isKo ? '해답이 필요한 순간의 조언' : 'Advice for Difficult Moments',
                icon: <PresentationChartLineIcon className="w-6 h-6" />,
                path: '/tarotcounseling',
              },
            ],
          },
        ],
      },
      credits: {
        title: isKo ? '크레딧 받기' : 'Get Credits',
        color: 'text-emerald-500',
        items: [
          {
            name: isKo ? '포춘쿠키' : 'Fortune Cookie',
            desc: isKo ? '하루 1~5개의 무료 크레딧' : 'Free Daily Credits',
            icon: <CircleStackIcon className="w-6 h-6" />,
            path: '/fortunecookie',
          },
          {
            name: isKo ? '크레딧 상점' : 'Credit Shop',
            desc: isKo ? '유료 크레딧 패키지 구매' : 'Buy Credit Packages',
            icon: <CreditCardIcon className="w-6 h-6" />,
            path: '/credits/shop',
          },
        ],
      },
      profile: {
        title: isKo ? '내 정보 관리' : 'Account',
        color: 'text-indigo-500',
        items: profileItems,
      },
    };
  }, [userData, language, isKo]);

  const MenuItem = ({ item, color }) => (
    <button
      onClick={() => handleItemClick(item.path)}
      className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 active:scale-[0.97] transition-all"
    >
      <div className="flex items-center gap-3.5 text-left">
        <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${color}`}>
          {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
        </div>
        <div>
          <p className="font-bold text-[14px] text-slate-900 dark:text-white leading-tight">
            {item.name}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.desc}</p>
        </div>
      </div>
      {item.path ? (
        <ChevronRightIcon className="w-4 h-4 text-slate-300" />
      ) : (
        <span className="text-[9px] font-bold text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
          {isKo ? '준비 중' : 'Soon'}
        </span>
      )}
    </button>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-white dark:bg-slate-950 transition-transform duration-500 ease-in-out ${activeMenu ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {activeMenu &&
          menuData[activeMenu] && ( // 방어 코드 추가
            <div className="flex flex-col h-full p-6 pb-32 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter dark:text-white uppercase">
                  {menuData[activeMenu].title}
                </h2>
                <button
                  onClick={() => setActiveMenu(null)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full active:scale-90"
                >
                  <XMarkIcon className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              {activeMenu === 'profile' && (
                <div className="mb-8">
                  {/* 프로필 카드 UI 영역 */}
                  <div className="relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl">
                    {/* ... 프로필 카드 내용 생략 ... */}
                    <div className="relative z-10 flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <UserCircleIcon className="w-10 h-10" />
                        <div>
                          <p className="text-lg font-black">{userData?.displayName || 'Guest'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-2">
                        <p className="text-xs font-bold">
                          {isKo ? '성별' : 'Gender'}: {userData?.gender}
                        </p>
                        <p className="text-xs font-bold">{formatBirth(userData?.birthDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {activeMenu === 'fortune'
                  ? menuData.fortune.sections.map((section, sIdx) => (
                      <div key={sIdx} className="space-y-3">
                        <div className="flex items-center gap-2 px-2">
                          <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            {section.subtitle}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {section.items.map((item, idx) => (
                            <MenuItem key={idx} item={item} color={menuData.fortune.color} />
                          ))}
                        </div>
                      </div>
                    ))
                  : menuData[activeMenu]?.items?.map(
                      (
                        item,
                        idx, // 옵셔널 체이닝 추가
                      ) => <MenuItem key={idx} item={item} color={menuData[activeMenu].color} />,
                    )}
              </div>
            </div>
          )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button
            onClick={() => {
              setActiveMenu(null);
              navigate('/');
            }}
            className={`flex flex-col items-center gap-1 ${!activeMenu ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">{isKo ? '홈' : 'Home'}</span>
          </button>
          <button
            onClick={() => setActiveMenu('fortune')}
            className={`flex flex-col items-center gap-1 ${activeMenu === 'fortune' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <SparklesIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">{isKo ? '운세보기' : 'Fortune'}</span>
          </button>
          <button
            onClick={() => setActiveMenu('credits')}
            className={`flex flex-col items-center gap-1 ${activeMenu === 'credits' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <CircleStackIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">{isKo ? '크레딧' : 'Credits'}</span>
          </button>
          <button
            onClick={() => setActiveMenu('profile')}
            className={`flex flex-col items-center gap-1 ${activeMenu === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <UserCircleIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">{isKo ? '내 정보' : 'Profile'}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
