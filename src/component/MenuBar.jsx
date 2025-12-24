import React, { useState, useMemo } from 'react';
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
        items: [
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
            desc: isKo ? '상상대방과의 에너지 조화' : 'Match with Others',
            icon: <UserPlusIcon className="w-6 h-6" />,
            path: '/match',
          },
          {
            name: isKo ? '재물운' : 'Wealth',
            desc: isKo ? '나의 재물운' : 'Your Money Luck',
            icon: <CircleStackIcon className="w-6 h-6" />,
            path: '/wealth',
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

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-white dark:bg-slate-950 transition-transform duration-500 ease-in-out ${
          activeMenu ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {activeMenu && (
          <div className="flex flex-col h-full p-8 pb-32 overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black tracking-tighter dark:text-white uppercase">
                {menuData[activeMenu].title}
              </h2>
              <button
                onClick={() => setActiveMenu(null)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full active:scale-90 transition-transform"
              >
                <XMarkIcon className="w-6 h-6 dark:text-white" />
              </button>
            </div>

            {activeMenu === 'profile' && (
              <div className="mb-8">
                <div className="relative overflow-hidden p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                  <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl" />
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <UserCircleIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold opacity-70">
                          {isKo ? '사용자 이름' : 'Username'}
                        </p>
                        <p className="text-lg font-black">
                          {userData?.displayName || (isKo ? '선생님' : 'Guest')}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                      <div>
                        <p className="text-[10px] font-bold opacity-60 uppercase">Gender</p>
                        <p className="font-bold">
                          {userData?.gender === 'male'
                            ? isKo
                              ? '남성'
                              : 'Male'
                            : isKo
                              ? '여성'
                              : 'Female'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold opacity-60 uppercase">Birth Time</p>
                        <p className="font-bold text-sm leading-tight">
                          {formatBirth(userData?.birthDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {menuData[activeMenu].items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleItemClick(item.path)}
                  className="w-full flex items-center justify-between p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm ${menuData[activeMenu].color}`}
                    >
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-[11px] text-slate-400 font-bold">{item.desc}</p>
                    </div>
                  </div>
                  {item.path ? (
                    <ChevronRightIcon className="w-5 h-5 text-slate-300" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300">
                      {isKo ? '준비 중' : 'Coming soon'}
                    </span>
                  )}
                </button>
              ))}
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
            className={`flex flex-col items-center gap-1 transition-colors ${!activeMenu ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">{isKo ? '홈' : 'Home'}</span>
          </button>

          <button
            onClick={() => setActiveMenu('fortune')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeMenu === 'fortune' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <SparklesIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">{isKo ? '운세보기' : 'Fortune'}</span>
          </button>

          <button
            onClick={() => setActiveMenu('credits')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeMenu === 'credits' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <CircleStackIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">{isKo ? '크레딧' : 'Credits'}</span>
          </button>

          <button
            onClick={() => setActiveMenu('profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeMenu === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <UserCircleIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">{isKo ? '내 정보' : 'Profile'}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
