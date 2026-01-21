import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { useNavigate } from 'react-router-dom';

const SazaTalkBanner = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isKo = language === 'ko';

  return (
    <div
      className="relative w-full max-w-lg h-[160px] sm:h-[180px] mx-auto overflow-hidden my-4 rounded-[2rem] border border-indigo-100/50 shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer group"
      style={{ backgroundColor: '#EEF0FF' }}
      onClick={() => navigate('/sazatalk')}
    >
      {/* 배경 장식 */}
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-200/40 blur-3xl rounded-full" />

      {/* 메인 콘텐츠 영역: 패딩을 px-10에서 px-6으로 줄임 */}
      <div className="relative h-full flex flex-col justify-center px-7 sm:px-10 z-10">
        <div className="animate-in fade-in slide-in-from-left-5 duration-1000 max-w-[65%] sm:max-w-full">
          {/* 상단 메뉴명 */}
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80 mb-1.5 block">
            {/* {isKo ? '사자톡' : 'SAZA TALK'} */}
          </span>

          {/* 메인 타이틀: 모바일에서 폰트 사이즈 살짝 조절 */}
          <h2 className="text-lg sm:text-2xl font-light text-slate-900 leading-[1.3] tracking-tight whitespace-pre-line">
            {isKo ? '답답한 고민,' : 'Tricky problems,'} <br />
            <span className="font-serif italic font-medium text-indigo-700">
              {isKo ? '무엇이든 물어보사자' : 'Ask Saza Anything'}
            </span>
          </h2>

          {/* 부제: 텍스트가 이미지에 겹치지 않도록 너비 제한 */}
          <p className="mt-2 text-[11px] sm:text-xs font-medium text-slate-500 tracking-tight leading-snug break-keep">
            {isKo ? '명리학자 27인의 지혜를 담은 AI 상담' : 'AI with the wisdom of 27 Saju masters'}
          </p>
        </div>
      </div>

      {/* 마스코트 이미지: 모바일에서 크기를 줄이고 위치 조정 */}
      <div className="absolute bottom-1 right-6 h-full w-full flex justify-end items-end pointer-events-none z-10">
        <img
          src="/images/banner/ama.webp"
          className="h-[105%] sm:h-[115%] w-auto object-contain transition-all duration-700  origin-bottom-right"
          style={{
            filter: 'drop-shadow(-5px 5px 15px rgba(79, 70, 229, 0.15))',
            marginRight: '-5%',
            marginBottom: '-2%',
          }}
          alt="mascot"
        />
      </div>

      {/* 배경 대형 텍스트: 모바일에서 더 흐리게 처리하여 가독성 확보 */}
      <div className="absolute right-[5%] bottom-[-5%] text-[70px] sm:text-[80px] font-black opacity-[0.03] sm:opacity-[0.04] italic select-none pointer-events-none text-indigo-900 whitespace-nowrap z-0">
        {isKo ? '고민상담' : 'TALK'}
      </div>
    </div>
  );
};

export default SazaTalkBanner;
