import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
const FortuneBanner = () => {
  const { language } = useLanguage();
  return (
    <div className=" rounded-2xl  max-w-lg m-auto">
      {/* 배너 컨테이너: 
          라이트모드 - 흰색 배경,연한 회색 테두리, 일반 그림자
          다크모드 - 다크 네이비 배경, 골드 테두리, 골드 빛 그림자 */}
      <div
        className="relative overflow-hidden rounded-2xl border 
                      border-slate-100 bg-white p-4 shadow-sm
                      transition-colors duration-300
                      dark:border-yellow-500/30 dark:bg-[#1a1b2e] dark:shadow-[0_0_15px_rgba(234,179,8,0.1)]"
      >
        {/* 배경 장식 (빛나는 느낌): 모드별 색상 변경 */}
        <div
          className="absolute -right-4 -top-4 h-24 w-24 rounded-full 
                        bg-indigo-500/5 blur-2xl 
                        dark:bg-yellow-500/10"
        ></div>

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* 포춘쿠키 아이콘 영역: 그라디언트는 유지하되 그림자만 약간 조정 */}
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl 
                            bg-gradient-to-br from-yellow-400 to-orange-500 
                            text-2xl shadow-md dark:shadow-lg"
            >
              🥠
            </div>

            {/* 텍스트 영역 */}
            {language === 'ko' ? (
              <div>
                <h4 className="text-[15px] font-bold text-slate-900 dark:text-white">
                                  포춘쿠키 열고  
                  <span className="text-amber-600 dark:text-yellow-400">무료 크레딧</span> 받기!    
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  오늘의 행운이 기다리고 있어요
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-[15px] font-bold text-slate-900 dark:text-white">
                  Open your Fortune Cookie &
                  <span className="text-amber-600 dark:text-yellow-400"> Get Free Credits!</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Your luck for today is waiting.
                </p>
              </div>
            )}
          </div>

          {/* 버튼 영역: 노란색 버튼은 유지 (라이트/다크 모두 잘 어울림) */}
          <button
            className="flex-shrink-0 flex items-center justify-center rounded-lg 
                             bg-yellow-500 px-3.5 py-2 text-xs font-bold 
                             text-slate-950 transition-all 
                             hover:bg-yellow-400 hover:scale-105 active:scale-95"
          >
            지금 확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default FortuneBanner;
