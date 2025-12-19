import React from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline'; // 아이콘 추가
import { useLanguage } from '../context/useLanguageContext';
const Step = ({ step, totalStep, title, onBack }) => {
  const { language } = useLanguage();
  return (
    <div className="w-full mb-8 px-1 relative">
      {/* 🔙 뒤로가기 버튼 영역 */}
      {/* mb-2로 약간의 숨쉴 공간만 주고, 버튼 자체는 슬림하게 만듭니다 */}
      <div className="flex items-center mb-2 min-h-[24px] fixed top-28">
        {step > 1 && (
          <button
            onClick={onBack}
            className="
          group flex items-center gap-1 pl-2 pr-3 py-1 rounded-full transition-all duration-200
          bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700
          text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400
        "
          >
            <ChevronLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[11px] font-bold pt-0.5">
              {language === 'en' ? 'Back' : '이전 단계'}
            </span>
          </button>
        )}
      </div>
      {/* 텍스트 정보 영역 */}
      <div className="flex items-end justify-between mb-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 tracking-widest uppercase">
            STEP {step.toString().padStart(2, '0')}
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
        </div>

        {/* 숫자 카운터 */}
        <div className="text-xs font-mono font-medium text-slate-400 mb-1">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-base">{step}</span>
          <span className="mx-1">/</span>
          {totalStep}
        </div>
      </div>
      {/* 프로그레스 바 (Segmented Bar) */}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden flex">
        {Array.from({ length: totalStep }).map((_, index) => {
          const isActive = index + 1 <= step;
          return (
            <div
              key={index}
              className={`h-full flex-1 transition-all duration-500 ease-out 
            ${index !== 0 ? 'border-l-2 border-white dark:border-slate-800' : ''} 
            ${
              isActive
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-sm'
                : 'bg-transparent'
            }
          `}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Step;
