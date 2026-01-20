import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguageContext';

const SubIcons = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ko = language === 'ko';

  const subNavItems = [
    {
      label: `${ko ? '포춘 쿠키' : 'Fortune Cookie'}`,
      path: '/fortunecookie',
      isReady: true,
      plusCredit: true,
      desc: ko ? '행운의 메시지를 확인하세요' : 'Check your lucky message',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513c0 1.135.845 2.098 1.976 2.192.773.064 1.55.109 2.33.135m1.694-7.191A49.14 49.14 0 0116.024 8.416c1.131.094 1.976 1.057 1.976 2.192v2.513c0 1.135-.845 2.098-1.976 2.192a48.514 48.514 0 01-3.32.227m-1.694-7.191L12 15.75m0 0v1.5m0-1.5c-1.355 0-2.697-.056-4.024-.166C6.845 15.49 6 14.527 6 13.392V10.88c0-1.135.845-2.098 1.976-2.192.773-.064 1.55-.109 2.33-.135m1.694 7.191c1.131-.094 1.976-1.057 1.976-2.192V10.88c0-1.135-.845-2.098-1.976-2.192a48.514 48.514 0 00-3.32-.227"
        />
      ),
    },
    {
      label: `${ko ? '타로 오늘의 운세' : 'Tarot Luck of the day'}`,
      path: '/tarotdaily',
      isReady: true,
      desc: ko ? '카드로 보는 오늘의 운세' : 'Daily tarot reading',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.456-2.455L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      ),
    },
    {
      label: `${ko ? '타로 연애운' : 'Tarot Love fortune'}`,
      path: '/tarotlove',
      isReady: true,
      desc: ko ? '그 사람과의 연애 궁합' : 'Love compatibility',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      ),
    },
    {
      label: `${ko ? '타로 금전운' : 'Tarot Wealth Luck'}`,
      path: '/tarotmoney',
      isReady: true,
      desc: ko ? '나의 재물 흐름 확인' : 'Check your wealth flow',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m0 1.5v.75m0 1.5v.75m0 1.5V15m15 0v.75m0 1.5v.75m0 1.5v.75m0 1.5V15m-15-10.5h15c.621 0 1.125.504 1.125 1.125v10.5c0 .621-.504 1.125-1.125 1.125h-15a1.125 1.125 0 01-1.125-1.125V5.625c0-.621.504-1.125 1.125-1.125z"
        />
      ),
    },
    {
      label: `${ko ? '타로 고민상담' : 'Tarot Counseling'}`,
      path: '/tarotcounseling',
      isReady: true,
      isAi: true,
      desc: ko ? 'AI 사자가 답해드립니다' : 'AI Tarot counseling',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.255-3.383a.93.93 0 01.865-.501c1.153-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.01z"
        />
      ),
    },
  ];

  const handleNavigation = (item) => {
    if (!item.isReady) return;
    navigate(item.path);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-around gap-3 sm:gap-0  sm:px-0 py-4">
      {subNavItems.map((item) => (
        <button
          key={item.path}
          onClick={() => handleNavigation(item)}
          disabled={!item.isReady}
          className={`group flex flex-row sm:flex-col items-center gap-4 sm:gap-2 p-4 sm:p-0 
                     rounded-3xl bg-white sm:bg-transparent 
                     border border-slate-100 sm:border-none
                     shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] sm:shadow-none
                     transition-all active:scale-[0.97] outline-none
                     ${!item.isReady ? 'opacity-50' : ''}`}
        >
          {/* 아이콘: 원래 코드 유지 */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center text-slate-400 transition-colors group-hover:text-rose-500">
            {item.isAi && (
              <span className="absolute -right-2 -top-1 flex items-center gap-1 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 px-2 py-0.5 text-[8px] font-black tracking-widest text-white ring-2 ring-white dark:ring-slate-900 rounded-full animate-pulse z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                AI
              </span>
            )}

            {!item.isReady && (
              <span className="absolute -top-1 flex items-center justify-center bg-slate-500 px-1.5 py-0.5 text-[7px] font-bold text-white ring-1 ring-white rounded-md z-10">
                준비중
              </span>
            )}

            {item.plusCredit && item.isReady && (
              <span className="absolute -right-2 -top-1 flex items-center justify-center bg-amber-600 px-1.5 py-0.5 text-[8px] font-black italic tracking-tighter text-white ring-2 ring-white rounded-full z-10">
                + CREDIT
              </span>
            )}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-7 w-7"
            >
              {item.icon}
            </svg>
          </div>

          {/* 텍스트 영역 */}
          <div className="flex flex-col items-start sm:items-center text-left sm:text-center overflow-hidden">
            <span className="text-[15px] sm:text-[11px] font-bold text-slate-800 transition-colors group-hover:text-rose-600">
              {item.label}
            </span>
            <span className="sm:hidden text-[12px] text-slate-400 font-medium truncate w-full">
              {item.desc}
            </span>
          </div>

          {/* 모바일 화살표 */}
          <div className="sm:hidden ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3 h-3 text-slate-300"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SubIcons;
