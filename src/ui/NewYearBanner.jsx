import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { useNavigate } from 'react-router-dom';

const NewYearBanner = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isKo = language === 'ko';

  return (
    <div
      className="relative w-full max-w-lg h-[160px] sm:h-[180px] mx-auto overflow-hidden my-4 rounded-[2rem] border border-red-100/50 shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer group"
      style={{ backgroundColor: '#FFF2F2' }} // 화사하고 따뜻한 로즈 파스텔
      onClick={() => navigate('/2026luck')}
    >
      {/* 배경 장식: 우측 상단에 은은한 붉은 기운 */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-200/40 blur-3xl rounded-full" />

      {/* 콘텐츠 레이어: 패딩 축소 및 가독성 영역 확보 */}
      <div className="relative h-full flex flex-col justify-center items-end px-7 sm:px-10 z-20 text-right">
        <div className="animate-in fade-in slide-in-from-right-5 duration-1000 max-w-[70%] sm:max-w-full">
          {/* 상단 메뉴명 */}
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-1.5 block">
            {/* {isKo ? '2026 신년운세' : '2026 FORTUNE'} */}
          </span>

          {/* 메인 타이틀: 모바일 사이즈 최적화 */}
          <h2 className="text-lg sm:text-2xl font-light text-slate-900 leading-[1.3] tracking-tight whitespace-pre-line">
            {isKo ? '뜨겁게 타오를' : 'The Blazing 2026'} <br />
            <span className="fofnt-serif italic font-medium text-red-600">
              {isKo ? '병오년 나의 운세는?' : 'Year of the Red Horse'}
            </span>
          </h2>

          {/* 부제: break-keep으로 가독성 향상 */}
          <p className="mt-2 text-[11px] sm:text-xs font-medium text-slate-500 tracking-tight leading-snug break-keep">
            {isKo ? '명리학자들이 분석한 2026년 대운' : 'Full analysis of your upcoming year'}
          </p>
        </div>
      </div>

      {/* 마스코트 이미지 (좌측 배치): 모바일 크기 및 위치 조정 */}
      <div className="absolute bottom-0 left-6 h-full w-full flex justify-start items-end pointer-events-none z-10">
        <img
          src="/images/banner/newyear.webp"
          className="h-[100%] sm:h-[115%] w-auto object-contain transition-all duration-700 group-hover:scale-105 origin-bottom-left"
          style={{ 
            filter: 'drop-shadow(5px 5px 15px rgba(220, 38, 38, 0.12))',
            marginLeft: '-5%',
            marginBottom: '-2%'
          }}
          alt="new year mascot"
        />
      </div>

      {/* 배경 대형 텍스트: 모바일에서 더 흐리게 조절 */}
      <div className="absolute left-[5%] bottom-[-5%] text-[70px] sm:text-[80px] font-black opacity-[0.03] sm:opacity-[0.04] italic select-none pointer-events-none text-red-900 whitespace-nowrap z-0">
        {isKo ? '신년운세' : 'LUCK'}
      </div>
    </div>
  );
};

export default NewYearBanner;