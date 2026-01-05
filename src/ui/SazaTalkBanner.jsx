import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { useNavigate } from 'react-router-dom';
const SazaTalkBanner = () => {
  const { language } = useLanguage();
   const navigate = useNavigate();
  return (
    <div className="h-[150px] w-full max-w-lg bg-slate-900 rounded-xl overflow-hidden relative group mx-auto mb-2 shadow-lg border border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 to-slate-900 opacity-100"></div>

      {/* 마스코트 이미지 */}
      <img
        src="/images/sazatalk_banner.png"
        className="absolute bottom-0 right-0 h-full w-auto object-contain transition-transform duration-500 pointer-events-none"
        alt="mascot"
      />

      {/* 콘텐츠 레이어 */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        {/* 왼쪽 영역: 혜택 강조 */}
        <div className="flex flex-col items-start justify-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <div className="text-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <h3 className="text-white text-lg sm:text-xl font-black leading-tight">
              {language === 'ko' ? '무엇이든 물어보사자' : 'Ask Saza Anything'}
            </h3>
            <p className="text-white text-[11px] my-1">
              {language === 'ko' ? (
                <div>
                  <p>명리학자 27인의 지혜를 데이터로 담다,</p>
                  <p>당신의 사주로 풀어낸 AI의 명쾌한 해답</p>
                </div>
              ) : (
                <div>
                  <p>The wisdom of 27 Saju masters,</p>
                  <p>
                    decoded by AI. Clear answers for your life’s path.
                  </p>
                </div>
              )}
            </p>
          </div>

          <button
            className="mt-2 bg-white hover:bg-slate-200 text-black text-[11px] font-black px-6 py-2.5 rounded-full flex items-center gap-1 shadow-2xl transition-all active:scale-95"
            onClick={() => navigate('/sazatalk')}
          >
            {language === 'ko' ? '고민상담하기' : 'Get Answer'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 오른쪽 영역: 텍스트 및 버튼 */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto"></div>
      </div>
    </div>
  );
};

export default SazaTalkBanner;
