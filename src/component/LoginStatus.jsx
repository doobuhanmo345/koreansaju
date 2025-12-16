import { useTimer } from '../hooks/useTimer';
import { UI_TEXT } from '../data/constants';
import { BoltIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '../context/useAuthContext';
import { useLanguage } from '../context/useLanguageContext';

// MAX_EDIT_COUNT는 설정값이므로 prop으로 받거나 기본값을 10으로 둡니다.
export default function LoginStatus({ MAX_EDIT_COUNT }) {
  // 👇 1. 전역 상태 가져오기 (Props 대신 Context 사용)
  const { user, userData, login, logout } = useAuthContext();
  const { language } = useLanguage();

  // 👇 2. DB 유저 정보에서 editCount 추출 (없으면 0)
  const editCount = userData?.editCount || 0;

  // 👇 3. 타이머 훅 연결
  const timeLeft = useTimer(editCount);

  return (
    <div className="bg-white/70 dark:bg-slate-800/60 p-3 my-2 rounded-2xl border border-indigo-50 dark:border-indigo-500/30 shadow-sm backdrop-blur-md max-w-lg m-auto">
      {user ? (
        <div className="flex items-center justify-between">
          {/* 1. 왼쪽: 심플한 프로필 영역 */}
          <div className="flex items-center gap-3">
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-12 h-12 rounded-full border border-indigo-100 dark:border-slate-600"
            />
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none mb-0.5">
                {user.displayName}
                {language === 'ko' && (
                  <span className="font-normal text-xs ml-0.5 text-gray-500">님</span>
                )}
              </span>
              <span className="text-[12px] text-gray-400">{UI_TEXT.welcome[language]}</span>
            </div>
          </div>

          {/* 2. 오른쪽: 통합 컨트롤 바 (한 줄 배치) */}
          <div className="flex items-center">
            {/* 행동력 */}
            <div className="flex items-center gap-2 mr-3 pr-3 border-r border-gray-200 dark:border-gray-700 h-14">
              {/* 아이콘: 중앙 정렬 */}
              <div>
                <div className="flex items-center justify-end leading-none">
                  <BoltIcon className="w-6 h-6 text-amber-500 fill-amber-500/20" />
                  {/* 텍스트 영역: 오른쪽 정렬 */}
                  <div className="flex flex-col items-end justify-center leading-none">
                    {/* 1. 라벨 (CREDIT) */}
                    <span className="text-[12px] font-bold text-amber-600/70 dark:text-amber-500 uppercase tracking-tighter mb-[1px]">
                      Daily Credit
                    </span>
                    {/* 2. 숫자 (3/5) */}
                    <span className="text-md font-black text-gray-700 dark:text-gray-200 font-mono">
                      {MAX_EDIT_COUNT - editCount}
                      <span className="mx-0.5">/</span>
                      {MAX_EDIT_COUNT}
                    </span>
                    {MAX_EDIT_COUNT - editCount === 0 && (
                      <span className="text-[10px] text-red-500 font-bold px-2">
                        {UI_TEXT.lockedMsg[language]}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div>
                    {/* 꽉 차지 않았을 때만 타이머 표시 */}
                    {MAX_EDIT_COUNT - editCount < MAX_EDIT_COUNT && timeLeft ? (
                      <span className="text-[12px]  font-medium text-gray-400 dark:text-gray-500 tracking-tight mt-[1px]">
                        {language === 'en' ? `refill in ${timeLeft}` : `${timeLeft}후에 자동 충전`}
                      </span>
                    ) : (
                      <span className="h-[0px]"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* (B) 액션 버튼 (Actions) - 아이콘 위주 */}
            <div className="flex items-center gap-1">
              {/* 로그아웃 버튼 */}
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all"
                title={UI_TEXT.logout[language]}
              >
                <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // 비로그인 상태
        <div className="w-full text-center">
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold shadow-sm transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"
              />
            </svg>
            <span className="text-sm">{UI_TEXT.googleLogin[language]}</span>
          </button>
          <p className="text-[10px] text-gray-400 mt-2">{UI_TEXT.loginMsg[language]}</p>
        </div>
      )}
    </div>
  );
}
