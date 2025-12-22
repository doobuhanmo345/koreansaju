import { useTimer } from '../hooks/useTimer';
import { BoltIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '../context/useAuthContext';
import { useLanguage } from '../context/useLanguageContext';

export default function LoginStatus({ MAX_EDIT_COUNT = 10, onFortuneClick }) {
  const { user, userData } = useAuthContext();
  const { language } = useLanguage();

  const editCount = userData?.editCount || 0;
  const remainingCredit = MAX_EDIT_COUNT - editCount;
  const timeLeft = useTimer(editCount);

  if (!user) return null;

  return (
    <div className="max-w-lg m-auto">
      {/* 기존 인디고 블러 스타일 유지 */}
      <div className="flex items-center justify-between bg-white/70 dark:bg-slate-800/60 p-3 px-4 rounded-2xl border border-indigo-50 dark:border-indigo-500/30 shadow-sm backdrop-blur-md">
        {/* 1. 왼쪽: 제목 + 아이콘 + 숫자/타이머 */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex-shrink-0">
            <BoltIcon className="w-5 h-5 text-amber-500 fill-amber-500/20" />
          </div>
          <div className="flex flex-col justify-center">
            {/* [추가] 너의 오늘 크레딧 제목 */}
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-0.5 whitespace-nowrap">
              {language === 'ko' ? '오늘의 크레딧' : "Today's Credit"}
            </span>
            <span className="text-[8px] text-gray-500 dark:text-gray-400 mb-0.5 whitespace-nowrap">
              {language === 'ko' ? '(00시 자동충전)' : 'Daily reset at Midnight'}
            </span>
            <div className="flex items-baseline gap-1 leading-none">
              <span
                className={`text-base font-black font-mono ${remainingCredit === 0 ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`}
              >
                {remainingCredit}
              </span>
              <span className="text-[10px] font-bold text-gray-400">/ {MAX_EDIT_COUNT}</span>
            </div>
            {/* 다음 충전 타이머 */}
            {remainingCredit < MAX_EDIT_COUNT && timeLeft && (
              <span className="text-[9px] font-bold text-amber-600/80 dark:text-amber-500/80 mt-1 whitespace-nowrap">
                {language === 'ko' ? `충전까지 ${timeLeft}` : `Refill in ${timeLeft}`}
              </span>
            )}
          </div>
        </div>

        {/* 중앙 구분선 */}
        <div className="w-px h-14 bg-indigo-100 dark:bg-indigo-500/20 mx-5" />

        {/* 2. 오른쪽: 포춘쿠키 섹션 (직관적인 문구와 버튼) */}
        <div className="flex items-center gap-1 flex-1 justify-end">
          <div className="text-4xl">🥠</div>
          <div className="flex flex-col items-end mr-1">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[12px] font-bold text-slate-700 dark:text-white whitespace-nowrap">
                {language === 'ko' ? '포춘쿠키(1일 1회)' : 'Fortune(once a day)'}
              </span>
              <span className="text-[9px] font-medium text-indigo-500 dark:text-indigo-400 whitespace-nowrap">
                {language === 'ko' ? '1~5 추가 크레딧' : 'Get Free Credit'}
              </span>
            </div>
            <button
              onClick={onFortuneClick}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-[11px] font-extrabold px-3 py-1 my-2 rounded-lg shadow-sm transition-all active:scale-95"
            >
              {language === 'ko' ? '받기' : 'Open'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
