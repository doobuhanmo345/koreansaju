import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { useNavigate } from 'react-router-dom';

const NewYearBanner = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isKo = language === 'ko';

  return (
    <div
      className="relative w-full max-w-lg h-[180px] mx-auto overflow-hidden my-4 rounded-[2rem] border border-red-100/50 shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer group"
      style={{ backgroundColor: '#FFF2F2' }} // 화사하고 따뜻한 로즈 파스텔 (배경과 확실히 분리됨)
      onClick={() => navigate('/2026luck')}
    >
      {/* 배경 장식: 우측 상단에 은은한 붉은 기운 */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-200/40 blur-3xl rounded-full" />

      {/* 콘텐츠 레이어: 텍스트를 우측으로 배치하여 이미지와 밸런스 조정 */}
      <div className="relative h-full flex flex-col justify-center items-end px-10 z-10 text-right">
        <div className="animate-in fade-in slide-in-from-right-5 duration-1000">
          {/* 상단 메뉴명 */}
          <span className="text-xs font-black uppercase tracking-[0.3em] text-red-400 mb-2 block">
            {/* {isKo ? '2026 신년운세' : '2026 FORTUNE'} */}
          </span>

          {/* 메인 타이틀 */}
          <h2 className="text-xl sm:text-2xl font-light text-slate-900 leading-[1.25] tracking-tight whitespace-pre-line">
            {isKo ? '뜨겁게 타오를' : 'The Blazing 2026'} <br />
            <span className="font-serif italic font-medium text-red-600">
              {isKo ? '병오년 나의 운세는?' : 'Year of the Red Horse'}
            </span>
          </h2>

          {/* 부제 */}
          <p className="mt-2 text-xs font-medium text-slate-500 tracking-tight leading-tight">
            {isKo ? '명리학자들이 분석한 2026년 대운' : 'Full analysis of your upcoming year'}
          </p>

          {/* 안내 태그 */}
      
        </div>
      </div>

      {/* 마스코트 이미지 (좌측 배치) */}
      <img
        src="/images/newyear_banner.png"
        className="absolute bottom-[-5%] left-[-2%] h-[105%] w-auto object-contain transition-all duration-700 pointer-events-none z-0 group-hover:scale-105"
        style={{ filter: 'drop-shadow(0 10px 15px rgba(220, 38, 38, 0.12))' }}
        alt="new year mascot"
      />

      {/* 배경 대형 텍스트 */}
      <div className="absolute left-[5%] bottom-[-5%] text-[80px] font-black opacity-[0.04] italic select-none pointer-events-none text-red-900 whitespace-nowrap">
        {isKo ? '신년운세' : 'LUCK'}
      </div>
    </div>
  );
};

export default NewYearBanner;
