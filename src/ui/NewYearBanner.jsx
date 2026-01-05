import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { useNavigate } from 'react-router-dom';
const NewYearBanner = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="h-[150px] w-full max-w-lg bg-slate-800 rounded-xl overflow-hidden relative group mx-auto mb-2 shadow-lg border border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-red-900 to-red-950 opacity-100"></div>

      {/* 마스코트 이미지 */}
      <img
        src="/images/newyear_banner.png"
        className="absolute bottom-[-0px] left-[-2px] h-full w-auto object-contain transition-transform duration-500 pointer-events-none"
        alt="mascot"
      />

      {/* 콘텐츠 레이어 */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        {/* 왼쪽 영역: 혜택 강조 */}
        <div className="flex flex-col items-start justify-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"></div>

        {/* 오른쪽 영역: 텍스트 및 버튼 */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div className="text-right drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <h3 className="text-white text-lg sm:text-xl font-black leading-tight">
              {language === 'ko' ? '2026 신년운세' : '2026 New Year Fortune'}
            </h3>
            <p className="text-white text-[11px] my-1">
              {language === 'ko' ? (
                <div>
                  <p>뜨겁게 타오를 2026 병오년</p>
                  <p>명리학자들이 분석한 당신의 운세는?</p>
                </div>
              ) : (
                <div>
                  <p>The Blazing 2026: Year of the Red Horse</p>
                  <p>What do Saju experts foresee for your future?</p>
                </div>
              )}
            </p>
          </div>

          <button
            className="mt-2 bg-white hover:bg-slate-200 text-black text-[11px] font-black px-6 py-2.5 rounded-full flex items-center gap-1 shadow-2xl transition-all active:scale-95"
            onClick={() => navigate('/2026luck')}
          >
            {language === 'ko' ? '무료운세보기' : 'Get Free Reading'}
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
      </div>
    </div>
  );
};

export default NewYearBanner;
