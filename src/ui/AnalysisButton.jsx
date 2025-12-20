import { LockClosedIcon } from '@heroicons/react/24/solid';
import { TicketIcon } from '@heroicons/react/24/outline';
import EnergyBadge from './EnergyBadge';
import { useLanguage } from '../context/useLanguageContext';
import { useAuthContext } from '../context/useAuthContext';

export default function AnalysisButton({
  energy, //dailyEnergy hook에서 전달된 객체
  handleAnalysis, //handleDailyAnalysis 함수
  loading,
  loadingType,
  isSaved,
  isLocked,
  isAnalysisDone, //isDailyDone, isMainDone, isYearlyDone
  icon,
  buttonType, //loadingType과 비교용 'daily'같은거
  textKo,
  TextEn,
  subTextKo,
  subTextEn,
  colorType, //sky, blue, indigo
  redBadge = false,
  goldBadge = false,
  cost = -1,
  textFree='free',
}) {
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }
  const { user } = useAuthContext();
  const { language } = useLanguage();
  const BUTTON_THEMES = {
    sky: 'bg-gradient-to-br from-blue-500 dark:to-sky-600 to-sky-300 shadow-[0_8px_20px_-6px_rgba(14,165,233,0.5)] border-sky-700/30',
    blue: 'bg-gradient-to-br from-indigo-500 dark:to-blue-600 to-blue-300 shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] border-amber-700/30',
    indigo:
      'bg-gradient-to-br from-violet-500 dark:to-indigo-600 to-indigo-300 shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)] border-purple-700/30',
    pink: 'bg-gradient-to-br from-rose-400 dark:to-rose-600 to-rose-300 shadow-[0_8px_20px_-6px_rgba(244,114,182,0.38)] border-rose-700/25',
    gold: 'bg-gradient-to-br from-orange-200 via-yellow-400 dark:to-amber-700 to-orange-300 shadow-[0_8px_20px_-6px_rgba(150,120,70,0.25)] border-amber-800/20',
    green:
      'bg-gradient-to-br from-emerald-200 via-emerald-400 dark:to-emerald-800 to-teal-400 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.3)] border-emerald-800/20',
  };

  // 구조 및 동작 (공통)
  const BASE_STYLE =
    'flex-1 rounded-2xl font-bold transition-all relative group flex flex-col items-center justify-center gap-1';
  const ACTIVE_INTERACTION =
    'text-white hover:scale-[1.02] active:scale-[0.98] dark:shadow-none border-b-4 active:border-b-0 active:translate-y-1';
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = (loading && !energy.isConsuming) || !user || !isSaved || loading;

  return (
    <button
      onClick={() => energy.triggerConsume(handleAnalysis)}
      disabled={(loading && !energy.isConsuming) || !user || !isSaved}
      className={classNames(
        BASE_STYLE,
        isDisabled
          ? DISABLED_STYLE
          : classNames(
              ACTIVE_INTERACTION, // 눌렀을 때 움직임 효과
              BUTTON_THEMES[colorType], // ⭐️ 핵심: 'blue', 'yellow', 'purple' 키값으로 스타일 자동 적용
            ),
      )}
    >
      {/* 💥 [수정 2] 기간 한정 리본 (Limited Time Badge) */}
      {!loading && user && isSaved && redBadge && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden rounded-tr-2xl">
          <div className="absolute top-0 right-0 h-full w-full flex items-center justify-center bg-transparent">
            <div className="absolute top-[10px] right-[-28px] w-[100px] h-[18px] bg-gradient-to-r from-rose-500 to-red-600 text-white text-[8px] font-black uppercase tracking-widest flex items-center justify-center transform rotate-45 shadow-md z-20 border-y border-white/20">
              Limited
            </div>
          </div>
        </div>
      )}
      {!loading && user && isSaved && goldBadge && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden rounded-tr-2xl">
          <div className="absolute top-0 right-0 h-full w-full flex items-center justify-center bg-transparent">
            <div className="absolute top-[10px] right-[-28px] w-[100px] h-[18px] bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white text-[8px] font-black uppercase tracking-widest flex items-center justify-center transform rotate-45 shadow-md z-20 border-y border-white/30">
              Daily
            </div>
          </div>
        </div>
      )}
      <span className="text-2xl drop-shadow-md mb-1 relative z-10">
        {loading && loadingType === buttonType ? (
          <svg className="animate-spin h-7 w-7 text-white/50" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          icon
        )}
      </span>
      <span className="text-sm font-bold leading-tight relative z-10">
        {language === 'ko' ? textKo : TextEn}
      </span>

      {/* 💥 [수정 1] 설명 문구 추가 */}
      <span className="text-[10px] opacity-80 font-normal leading-tight px-1 break-keep relative z-10">
        {language === 'ko' ? subTextKo : subTextEn}
      </span>

      {/* 하단 뱃지 영역 */}

      {isAnalysisDone && !loading && (
        <div
          className={classNames(
            'mt-1 flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded-full border shadow-sm relative z-10',
            isLocked
              ? 'border-gray-500/50 bg-gray-400/40' // 잠겼을 때 (어둡고 회색)
              : 'border-white/30 bg-white/20', // 열렸을 때 (밝고 투명)
          )}
        >
          <span className="text-[9px] font-bold text-white tracking-wide uppercase">{textFree}</span>
          <TicketIcon className="w-3 h-3 text-white" />
        </div>
      )}
      {!isAnalysisDone && !user && (
        <div className="mt-1 relative z-10">
          <LockClosedIcon className="w-4 h-4 text-amber-500" />
        </div>
      )}
      {!isAnalysisDone && !!user && (
        <div className="mt-1 relative">
          <EnergyBadge
            active={isSaved && user}
            consuming={energy.isConsuming}
            loading={loading && !energy.isConsuming}
            cost ={cost}
          />
        </div>
      )}
    </button>
  );
}
