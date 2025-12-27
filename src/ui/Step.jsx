import React from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline'; // 아이콘 추가
import { useLanguage } from '../context/useLanguageContext';
const Step = ({ step, totalStep, title, onBack }) => {
  const { language } = useLanguage();
  return (
    <div className="w-full mb-8 px-1 relative">
      {/* 🔙 뒤로가기 버튼 영역 */}
      {/* mb-2로 약간의 숨쉴 공간만 주고, 버튼 자체는 슬림하게 만듭니다 */}

      {/* 텍스트 정보 영역 */}
      <div className="flex items-end justify-between mb-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 tracking-widest uppercase">
            STEP {step.toString().padStart(2, '0')}
          </span>
          <div className="flex">
            <div className="flex items-center ">
              {step > 1 && (
                <button
                  onClick={onBack}
                  className="
        group flex items-center px-2 py-1.5 mx-2 rounded-full 
        transition-all duration-300 ease-out
        /* 배경: 아주 살짝 투명한 흰색/회색 + 블러 */
        bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
        /* 보더: 은은한 선으로 입체감 부여 */
        border border-slate-200/60 dark:border-slate-700/50
        /* 그림자: 둥둥 떠있는 느낌 */
        shadow-sm hover:shadow-md
        /* 텍스트 색상 */
        text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400
      "
                >
                  <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />  
                </button>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {title}
            </h2>
          </div>
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
