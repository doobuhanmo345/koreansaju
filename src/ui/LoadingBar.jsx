import { UI_TEXT } from '../data/constants';
import { getLoadingText } from '../utils/helpers';
import { useLanguage } from '../context/useLanguageContext';

export default function LoadingBar({ loadingType, progress, isCachedLoading }) {
  const { language } = useLanguage();
  const gradientColors = {
    main: 'bg-gradient-to-r from-violet-500 to-indigo-600',
    year: 'bg-gradient-to-r from-green-400 to-emerald-600',
    compati: 'bg-gradient-to-r from-pink-400 to-rose-500', // 💖 궁합(핑크)
    default: 'bg-gradient-to-r from-yellow-400 to-orange-500', // 그 외(기본)
  };
  return (
    <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-gray-700 shadow-xl animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-2">
        {/* 로딩 멘트 */}
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
            {isCachedLoading
              ? UI_TEXT.loadingCached[language]
              : getLoadingText(progress, language, loadingType)}
          </span>
          <span className="text-sm font-black text-gray-700 dark:text-gray-200">
            {Math.round(progress)}%
          </span>
        </div>

        {/* 프로그레스 바 (독립형) */}
        <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out 
      ${gradientColors[loadingType] || gradientColors.default}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
