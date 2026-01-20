import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { useNavigate } from 'react-router-dom';

const SazaTalkBanner = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isKo = language === 'ko';

  return (
    <div
      className="relative w-full max-w-lg h-[180px] mx-auto overflow-hidden my-4 rounded-[2rem] border border-indigo-100/50 shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer group"
      style={{ backgroundColor: '#EEF0FF' }} // 농도를 높인 소프트 라벤더 (배경과 확실히 분리됨)
      onClick={() => navigate('/sazatalk')}
    >
      {/* 배경 장식: 좌측 하단에 은은한 보라색 광원 효과 */}
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-200/50 blur-3xl rounded-full" />

      {/* 메인 콘텐츠 영역 */}
      <div className="relative h-full flex flex-col justify-center px-10 z-10">
        <div className="animate-in fade-in slide-in-from-left-5 duration-1000">
          {/* 상단 메뉴명 */}
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80 mb-2 block">
            {/* {isKo ? '사자톡' : 'SAZA TALK'} */}
          </span>

          {/* 메인 타이틀 */}
          <h2 className="text-xl sm:text-2xl font-light text-slate-900 leading-[1.25] tracking-tight whitespace-pre-line">
            {isKo ? '답답한 고민,' : 'Tricky problems,'} <br />
            <span className="font-serif italic font-medium text-indigo-700">
              {isKo ? '무엇이든 물어보사자' : 'Ask Saza Anything'}
            </span>
          </h2>

          {/* 부제 */}
          <p className="mt-2 text-xs font-medium text-slate-500 tracking-tight leading-tight">
            {isKo ? '명리학자 27인의 지혜를 담은 AI 상담' : 'AI with the wisdom of 27 Saju masters'}
          </p>

          {/* 안내 태그 */}
         
        </div>
      </div>

      {/* 마스코트 이미지 */}
      <img
        src="/images/sazatalk_banner.png"
        className="absolute bottom-[-5%] right-[-2%] h-[105%] w-auto object-contain transition-all duration-700 pointer-events-none z-0 group-hover:scale-105"
        style={{ filter: 'drop-shadow(0 10px 15px rgba(79, 70, 229, 0.15))' }}
        alt="mascot"
      />

      {/* 배경 대형 텍스트 (ImageBanner 스타일 유지) */}
      <div className="absolute right-[5%] bottom-[-5%] text-[80px] font-black opacity-[0.04] italic select-none pointer-events-none text-indigo-900 whitespace-nowrap">
        {isKo ? '고민상담' : 'TALK'}
      </div>
    </div>
  );
};

export default SazaTalkBanner;
