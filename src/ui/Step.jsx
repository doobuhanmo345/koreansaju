import React from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline'; // 아이콘 추가

const Step = ({ step, totalStep, title, onBack }) => {
  return (
    <div className="w-full mb-8 px-1">
      {/* 🔙 뒤로가기 버튼 영역 (1단계가 아닐 때만 노출) */}
      <div className="h-6 mb-1 flex items-center">
        {step > 1 && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors group"
          >
            <ChevronLeftIcon className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            <span>이전 단계</span>
          </button>
        )}
      </div>

      {/* 텍스트 정보 영역 */}
      <div className="flex items-end justify-between mb-2.5">
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
