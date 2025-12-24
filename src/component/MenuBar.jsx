import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 useNavigate 추가
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

export default function MobileNav() {
  const [activeMenu, setActiveMenu] = useState(null);
  const { userData } = useAuthContext();
  const navigate = useNavigate(); // 👈 네비게이트 함수 초기화

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

  // 메뉴 클릭 시 이동 및 메뉴 닫기 처리 함수
  const handleItemClick = (path) => {
    if (!path) {
      alert('준비중입니다.');
    }
    navigate(path); // 👈 페이지 이동
    setActiveMenu(null); // 👈 서브메뉴 닫기
  };

  const menuData = {
    fortune: {
      title: '운세보기',
      color: 'text-amber-500',
      items: [
        {
          name: '오늘의 운세',
          desc: '오늘 하루 나의 기운 확인',
          icon: <CalendarDaysIcon className="w-6 h-6" />,
          path: '/loadingpage', // 👈 이동할 경로 추가
        },
        {
          name: '신년 운세',
          desc: '을사년 한 해의 흐름',
          icon: <SparklesIcon className="w-6 h-6" />,
          path: '/fortune/yearly',
        },
        {
          name: '궁합 보기',
          desc: '상대방과의 에너지 조화',
          icon: <UserPlusIcon className="w-6 h-6" />,
          path: '/fortune/match',
        },
      ],
    },
    credits: {
      title: '크레딧 받기',
      color: 'text-emerald-500',
      items: [
        {
          name: '무료 크레딧 받기',
          desc: '광고 시청 후 10P 충전',
          icon: <CircleStackIcon className="w-6 h-6" />,
          path: '/credits/free',
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
      items: [
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
      ],
    },
  };

  return (
    <>
      {/* 1. 서브메뉴 오버레이 */}
      <div
        className={`fixed inset-0 z-40 bg-white dark:bg-slate-950 transition-transform duration-500 ease-in-out ${
          activeMenu ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {activeMenu && (
          <div className="flex flex-col h-full p-8 pb-32 overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black tracking-tighter dark:text-white">
                {menuData[activeMenu].title}
              </h2>
              <button
                onClick={() => setActiveMenu(null)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full active:scale-90 transition-transform"
              >
                <XMarkIcon className="w-6 h-6 dark:text-white" />
              </button>
            </div>

            {/* 프로필 카드 로직 유지 */}
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
                  onClick={() => handleItemClick(item.path)} // 👈 클릭 시 경로 이동 함수 호출
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
                  <ChevronRightIcon className="w-5 h-5 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button
            onClick={() => {
              setActiveMenu(null);
              navigate('/');
            }} // 👈 홈으로 이동
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
