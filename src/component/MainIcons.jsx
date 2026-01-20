import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguageContext';

const MainIcons = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ko = language === 'ko';

  const navItems = [
    {
      label: `${ko ? '오늘의 운세' : 'Luck of the day'}`,
      path: '/todaysluck',
      desc: ko ? '오늘 하루 나의 기운을 확인하세요' : 'Check your energy for today',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
        />
      ),
    },
    {
      label: `${ko ? '신년 운세' : '2026 Fortune'}`,
      path: '/2026luck',
      isLimited: true,
      desc: ko ? '미리 보는 2026년 병오년 운세' : 'Your 2026 Red Horse Year forecast',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.456-2.455L18 2.25l.259 1.036a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.456 2.455zM16.894 20.567L16.5 22.5l-.394-1.933a2.25 2.25 0 00-1.713-1.713L12.5 18.5l1.933-.394a2.25 2.25 0 001.713-1.713l.394-1.933.394 1.933a2.25 2.25 0 001.713 1.713l1.933.394-1.933.394a2.25 2.25 0 00-1.713 1.713z"
        />
      ),
    },
    {
      label: `${ko ? '궁합 보기' : 'Chemistry'}`,
      path: '/match',
      desc: ko ? '너와 나의 인연 점수는?' : 'Check compatibility with your partner',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      ),
    },
    {
      label: `${ko ? '재물운' : 'Wealth Luck'}`,
      path: '/wealth',
      desc: ko ? '새어 나가는 돈을 막고 행운을' : 'Improve your wealth and fortune',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0v3.75"
        />
      ),
    },
    {
      label: `${ko ? '사자와의 대화' : 'Chat with SAZA'}`,
      path: '/sazatalk',
      isAi: true,
      desc: ko ? '인공지능 사자가 고민을 들어드려요' : 'AI SAZA will listen to your concerns',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.596.596 0 01-.733-.305.591.591 0 01.03-.586 7.747 7.747 0 001.018-4.332A8.332 8.332 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-around gap-3 sm:gap-0 sm:px-0 py-4">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className="group relative flex flex-row sm:flex-col items-center gap-4 sm:gap-2 p-4 sm:p-0 
                     rounded-3xl bg-white sm:bg-transparent 
                     border border-slate-100 sm:border-none
                     shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] sm:shadow-none
                     transition-all active:scale-[0.97] outline-none"
        >
          {/* 아이콘 영역 */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 sm:bg-transparent text-slate-400 transition-colors group-hover:text-indigo-600">
            {item.isLimited && (
              <span className="absolute -right-1 -top-1 sm:-right-2 sm:-top-1 flex items-center justify-center bg-red-500 px-1.5 py-0.5 text-[8px] font-black text-white ring-2 ring-white rounded-full z-10">
                HOT
              </span>
            )}
            {item.isAi && (
              <span className="absolute -right-1 -top-1 sm:-right-2 sm:-top-1 flex items-center justify-center bg-indigo-600 px-1.5 py-0.5 text-[8px] font-black text-white ring-2 ring-white rounded-full z-10">
                AI
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
          <div className="flex flex-col items-start sm:items-center overflow-hidden">
            <span className="text-[15px] sm:text-[12px] font-bold text-slate-800 transition-colors group-hover:text-indigo-600">
              {item.label}
            </span>
            {/* 모바일에서만 보이는 설명: 영역 구분을 위해 아주 연하게 처리 */}
            <span className="sm:hidden text-[12px] text-slate-400 font-medium truncate w-full">
              {item.desc}
            </span>
          </div>

          {/* 모바일 전용: 우측 끝 화살표로 '클릭 가능함'을 암시 */}
          <div className="sm:hidden ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 group-hover:bg-indigo-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3 h-3 text-slate-300 group-hover:text-indigo-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
};

export default MainIcons;
