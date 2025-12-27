import { useNavigate } from 'react-router-dom';

const SubIcons = () => {
  const navigate = useNavigate();

  const subNavItems = [
    {
      label: '포춘쿠키',
      path: '/fortunecookie',
      isReady: true,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.003 9.003 0 008.34-5.657 5.786 5.786 0 01-6.84-6.84A9.003 9.003 0 005.657 16.84 5.786 5.786 0 0112 21z"
        />
      ),
    },
    {
      label: '타로 연애운',
      path: '/tarot-love',
      isReady: false, // 준비중 상태
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      ),
    },
    {
      label: '타로 오늘의운세',
      path: '/tarot-today',
      isReady: false, // 준비중 상태
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M3 12h2.25m.386-6.364l1.591 1.591M12 18.75a6.75 6.75 0 110-13.5 6.75 6.75 0 010 13.5z"
        />
      ),
    },
    {
      label: '타로 정통',
      path: '/tarot-classic',
      isReady: false, // 준비중 상태
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      ),
    },
  ];

  const handleNavigation = (item) => {
    if (!item.isReady) {
      alert('서비스 준비 중입니다.');
      return;
    }
    navigate(item.path);
  };

  return (
    <div className="flex items-center justify-around py-6">
      {subNavItems.map((item) => (
        <button
          key={item.path}
          onClick={() => handleNavigation(item)}
          className={`group flex flex-col items-center gap-2 transition-all outline-none ${
            !item.isReady ? 'cursor-not-allowed' : ''
          }`}
        >
          {/* 아이콘 컨테이너 */}
          <div
            className={`relative flex h-12 w-12 items-center justify-center transition-colors 
            ${
              item.isReady
                ? 'text-slate-400 group-hover:text-rose-500'
                : 'text-slate-300 opacity-50'
            }`}
          >
            {/* 준비중 배지 */}
            {!item.isReady && (
              <span className="absolute -top-1 flex items-center justify-center bg-slate-500 px-1.5 py-0.5 text-[7px] font-bold text-white ring-1 ring-white rounded-md z-10">
                준비중
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

          {/* 텍스트 */}
          <span
            className={`text-[11px] font-medium transition-colors 
            ${
              item.isReady
                ? 'text-slate-600 group-hover:text-rose-600 dark:text-slate-300'
                : 'text-slate-400'
            }`}
          >
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SubIcons;
