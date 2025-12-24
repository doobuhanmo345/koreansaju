import React, { useState, useMemo } from 'react'; // useMemo 추가
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

  const formatBirth = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '정보 없음';
    try {
      const [datePart, timePart] = dateStr.split('T');
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = (timePart || '00:00').split(':');
      return `${year}년 ${month}월 ${day}일 ${hour}:${minute}`;
    } catch (e) {
      return '형식 오류';
    }
  };

  const handleItemClick = (path) => {
    if (!path) {
      alert(language === 'ko' ? '준비중입니다.' : 'Coming soon!');
      return; // path가 없으면 함수 종료
    }
    navigate(path);
    setActiveMenu(null);
  };

  // ✅ useMemo를 사용하여 userData.role에 따라 메뉴를 실시간으로 생성
  const menuData = useMemo(() => {
    // profile 하위 아이템을 위한 임시 배열
    const profileItems = [];

    // 1. 관리자 권한 메뉴 추가
    if (userData?.role === 'admin') {
      profileItems.push({
        name: language === 'ko' ? '관리자 페이지' : 'Admin Page',
        desc: '시스템 제어 및 통계',
        icon: <RiAdminFill className="w-6 h-6 text-rose-500" />,
        path: '/admin',
      });
    }

    // 2. 명리학자 권한 메뉴 추가
    if (userData?.role === 'saju_consultant') {
      profileItems.push({
        name: language === 'ko' ? '명리학자 대시보드' : 'Consultant',
        desc: '상담 요청 관리',
        icon: <GiYinYang className="w-6 h-6 text-indigo-500" />,
        path: '/consultant/dashboard',
      });
    }

    // 3. 공통 메뉴 추가
    profileItems.push(
      {
        name: '프로필 수정',
        desc: '이름, 생년월일 정보 변경',
        icon: <UserCircleIcon className="w-6 h-6" />,
        path: '/editprofile',
      },
      {
        name: '상담 내역',
        desc: '내가 본 운세 기록 확인',
        icon: <PresentationChartLineIcon className="w-6 h-6" />,
        path: null,
      },
    );

    return {
      fortune: {
        title: '운세보기',
        color: 'text-amber-500',
        items: [
          {
            name: '오늘의 운세',
            desc: '오늘 하루 나의 기운 확인',
            icon: <CalendarDaysIcon className="w-6 h-6" />,
            path: '/todaysluck',
          },
          {
            name: '신년 운세',
            desc: '병오년 한 해의 흐름',
            icon: <SparklesIcon className="w-6 h-6" />,
            path: '/2026luck',
          },
          {
            name: '궁합 보기',
            desc: '상대방과의 에너지 조화',
            icon: <UserPlusIcon className="w-6 h-6" />,
            path: '/match',
          },
          {
            name: '재물운',
            desc: '나의 재물운',
            icon: <UserPlusIcon className="w-6 h-6" />,
            path: '/wealth',
          },
        ],
      },
      credits: {
        title: '크레딧 받기',
        color: 'text-emerald-500',
        items: [
          {
            name: '포춘쿠키',
            desc: '하루 1~5개의 무료 크레딧',
            icon: <CircleStackIcon className="w-6 h-6" />,
            path: '/fortunecookie',
          },
          {
            name: '크레딧 상점',
            desc: '유료 크레딧 패키지 구매',
            icon: <CreditCardIcon className="w-6 h-6" />,
            path: '/credits/shop',
          },
        ],
      },
      profile: {
        title: '내 정보 관리',
        color: 'text-indigo-500',
        items: profileItems,
      },
    };
  }, [userData, language]); // userData나 language가 바뀔 때만 재계산

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
                        <p className="text-xs font-bold opacity-70">사용자 이름</p>
                        <p className="text-lg font-black">{userData?.displayName || '선생님'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                      <div>
                        <p className="text-[10px] font-bold opacity-60 uppercase">Gender</p>
                        <p className="font-bold">{userData?.gender === 'male' ? '남성' : '여성'}</p>
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
                    <span className="text-[10px] font-bold text-slate-300">준비 중</span>
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
            <span className="text-[10px] font-black">홈</span>
          </button>

          <button
            onClick={() => setActiveMenu('fortune')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeMenu === 'fortune' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <SparklesIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">운세보기</span>
          </button>

          <button
            onClick={() => setActiveMenu('credits')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeMenu === 'credits' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <CircleStackIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">크레딧</span>
          </button>

          <button
            onClick={() => setActiveMenu('profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeMenu === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <UserCircleIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">내 정보</span>
          </button>
        </div>
      </nav>
    </>
  );
}
