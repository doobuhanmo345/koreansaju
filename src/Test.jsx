import { useState, useRef } from 'react';
import dayStem from '../src/data/dayStem.json';
import dayBranch from '../src/data/dayBranch.json';
import { useLanguage } from './context/useLanguageContext';
import SajuReport from './test/SajuReport';
import LoadingFourPillar from './component/LoadingFourPillar';
import { useAuthContext } from './context/useAuthContext';

export default function Test() {
  const { userData } = useAuthContext();
  const { language } = useLanguage();
  return (
    <>
      <div className="relative w-full max-w-[360px] mx-auto overflow-hidden bg-[#FEFAF7] rounded-[38px] border border-[#F1E9E4] shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
        {/* 상단 포인트 라인 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200"></div>

        <div className="px-7 pt-9 pb-8 text-center">
          {/* 배지 */}
          <div className="inline-flex items-center px-3 py-1 bg-white border border-orange-100 rounded-full mb-5 shadow-sm">
            <span className="text-[10px] font-bold text-orange-500 tracking-tighter uppercase">
              {language === 'en' ? 'Limited Offer' : '한정 이벤트'}
            </span>
            <span className="w-[1px] h-2 bg-orange-200 mx-2"></span>
            <span className="text-[10px] font-medium text-stone-400">Premium</span>
          </div>

          {/* 메인 타이틀 */}
          <h2 className="text-[#3A322F] text-[22px] font-bold leading-tight mb-3 tracking-tight">
            {language === 'en' ? (
              <>
                Get Your <span className="text-[#F47521]">Premium Report</span>
                <br />
                Free on Our Website
              </>
            ) : (
              <>
                지금 홈페이지 방문하면
                <br />
                <span className="text-[#F47521]">프리미엄 리포트가 무료</span>
              </>
            )}
          </h2>

          {/* 핵심 메시지 강조 영역 */}
          <div className="bg-orange-50/50 rounded-2xl py-3 px-4 mb-6">
            <p className="text-[#6D625B] text-sm leading-relaxed">
              {language === 'en' ? (
                <>
                  No hidden fees. <span className="font-bold text-[#4A3428]">100% Free</span> ✨
                  <br />
                  Access all analyses at no extra cost.
                </>
              ) : (
                <>
                  결제 유도 없는 <span className="font-bold text-[#4A3428]">0원 이벤트</span> ✨
                  <br />
                  추가 비용 없이 모든 분석을 확인하세요.
                </>
              )}
            </p>
          </div>

          {/* 콜 투 액션 버튼 */}
          <button
            onClick={() => (window.location.href = '/pay')}
            className="w-full h-[58px] bg-[#3A322F] hover:bg-[#2D2725] text-white rounded-[20px] font-semibold text-base shadow-lg shadow-stone-200 transition-all active:scale-[0.96] flex items-center justify-center gap-2"
          >
            <span>{language === 'en' ? 'Get Free Report' : '무료로 리포트 받기'}</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* 하단 보조 문구 */}
          <p className="mt-4 text-[12px] text-stone-400 font-medium">
            {language === 'en'
              ? '* Report generated instantly after login'
              : '* 로그인 즉시 리포트가 생성됩니다'}
          </p>
        </div>
      </div>
    </>
  );
}
