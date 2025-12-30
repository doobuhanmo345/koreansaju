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
      isLimited: true, // Limited 표시 여부 추가
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
      path: '/sazatalk', // 실제 설정하신 경로로 맞추세요,
      isAi:true,
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
    <div className="flex items-center justify-around">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className="group flex flex-col items-center gap-2 transition-all outline-none"
        >
          {/* 아이콘 컨테이너: relative 추가 */}
          <div className="relative flex h-12 w-12 items-center justify-center text-slate-400 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            {/* Limited 배지 추가 */}
            {item.isLimited && (
              <span className="absolute -right-2 -top-1 flex items-center justify-center bg-red-500 px-1.5 py-0.5 text-[8px] font-black italic tracking-tighter text-white ring-2 ring-white dark:ring-slate-900 rounded-full">
                LIMITED
              </span>
            )}
            {/* 2. AI 배지 (신규 추가) */}
            {item.isAi && (
              <span className="absolute -right-2 -top-1 flex items-center gap-1 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 px-2 py-0.5 text-[8px] font-black tracking-widest text-white ring-2 ring-white dark:ring-slate-900 rounded-full animate-pulse z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                {/* 물방울 느낌의 작은 도트 */}
                <span className="w-1.5 h-1.5 bg-white rounded-full shadow-[inset_0_-1px_1px_rgba(0,0,0,0.2)]"></span>
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

          <span className="text-[12px] font-bold text-slate-600 transition-colors group-hover:text-indigo-600 dark:text-slate-300 dark:group-hover:text-indigo-400">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default MainIcons;
