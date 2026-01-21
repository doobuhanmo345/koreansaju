import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguageContext';

const ImageBanner = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const bannerData = [
    {
      id: 0,
      menuTitle: { ko: '오늘의 운세', en: 'Daily' },
      mainTitle: { ko: '오늘 나의\n오행 흐름과 총점은?', en: 'How is your\nenergy today?' },
      accent: { ko: '운세 점수', en: 'Score' },
      bgColor: '#FFFCEB',
      accentColor: '#FBBF24',
      link: '/todaysluck',
      imageUrl: '/images/banner/today.webp',
    },
    {
      id: 2,
      menuTitle: { ko: '만남 지수', en: 'Date' },
      mainTitle: { ko: '소개팅과 썸,\n이뤄질 수 있을까?', en: 'Your spark on\na date' },
      accent: { ko: '첫만남 스파크', en: 'Spark' },
      bgColor: '#FDF2F2',
      accentColor: '#F87171',
      link: '/date',
      imageUrl: '/images/banner/date.webp',
    },
    {
      id: 3,
      menuTitle: { ko: '면접 지수', en: 'Interview' },
      mainTitle: { ko: '떨리는 면접 날\n합격 기운은?', en: 'Will you get\nthe offer?' },
      accent: { ko: '합격 패스', en: 'Pass' },
      bgColor: '#F0F9FF',
      accentColor: '#38BDF8',
      link: '/interview',
      imageUrl: '/images/banner/interview.webp',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer;
    if (!isPaused) {
      timer = setInterval(() => {
        handleNext();
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isPaused, activeIndex]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? bannerData.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev === bannerData.length - 1 ? 0 : prev + 1));
  };

  const current = bannerData[activeIndex];
  const isKo = language === 'ko';

  return (
    <div
      className="relative w-full max-w-lg h-[240px] mx-auto flex overflow-hidden transition-all duration-700 ease-in-out my-6 rounded-[2rem] border border-slate-50 dark:border-slate-800 shadow-sm group"
      style={{ backgroundColor: current.bgColor }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 메인 콘텐츠 영역 (모바일에서는 전체 너비 사용) */}
      <div
        className="flex-1 relative flex flex-col justify-center px-8 sm:px-10 cursor-pointer z-10"
        onClick={() => navigate(current.link)}
      >
        <div key={current.id} className="animate-in fade-in slide-in-from-left-5 duration-700 p-3">
          <span className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-2 sm:mb-3 block">
            {isKo ? current.menuTitle.ko : current.menuTitle.en}
          </span>
          <h2
            className={`text-2xl sm:text-3xl font-light text-slate-900 leading-[1.2] tracking-tight whitespace-pre-line ${isKo ? 'break-keep' : ''}`}
          >
            {(isKo ? current.mainTitle.ko : current.mainTitle.en).split('\n')[0]} <br />
            <span className="font-serif italic font-medium" style={{ color: current.accentColor }}>
              {(isKo ? current.mainTitle.ko : current.mainTitle.en).split('\n')[1]}
            </span>
          </h2>

          <div className="mt-5 sm:mt-6 flex items-center gap-2">
            <span className="text-[10px] font-bold py-1.5 px-3 bg-white/60 rounded-full text-slate-500 uppercase tracking-tighter shadow-sm border border-white/50">
              {isKo ? '지금 확인하기' : 'Check now'}
            </span>
          </div>
        </div>

        {/* 배경 이미지 */}
        <div className="absolute right-6 bottom-3 w-36 h-36 sm:w-44 sm:h-44 pointer-events-none overflow-hidden rounded-br-[2rem]">
          <img
            key={`img-${current.id}`}
            src={current.imageUrl}
            alt=""
            className="w-full h-full object-contain object-right-bottom animate-in fade-in zoom-in-95 slide-in-from-right-10 duration-1000 opacity-80"
          />
        </div>
      </div>

      {/* 모바일 전용 화살표 네비게이션 (md 미만에서만 표시) */}
      <div className="flex md:hidden absolute inset-y-0 inset-x-2 items-center justify-between z-10 pointer-events-none">
        <button
          onClick={handlePrev}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-sm pointer-events-auto hover:bg-white/50 transition-colors text-slate-600"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-sm pointer-events-auto hover:bg-white/50 transition-colors text-slate-600"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* 모바일 전용 인디케이터 (점) */}
      <div className="md:hidden absolute bottom-4 left-8 flex gap-1.5 z-10">
        {bannerData.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-4 bg-slate-800' : 'w-1 bg-slate-300'}`}
          />
        ))}
      </div>

      {/* 데스크톱 전용 사이드바 메뉴 (md 이상에서만 표시) */}
      <div className="hidden md:flex w-24 bg-white/40 backdrop-blur-md border-l border-white/20 flex-col z-10">
        {bannerData.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setActiveIndex(index)}
            className={`flex-1 flex flex-col items-start justify-center px-4 transition-all duration-500 relative ${
              activeIndex === index ? 'bg-white/60' : 'hover:bg-white/20'
            }`}
          >
            <span
              className={`text-xs font-black tracking-tighter text-left leading-tight ${activeIndex === index ? 'text-slate-900' : 'text-slate-400'}`}
            >
              {isKo ? item.menuTitle.ko : item.menuTitle.en}
            </span>
            {activeIndex === index && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-slate-900 animate-in fade-in duration-500" />
            )}
            {activeIndex === index && (
              <div className="w-full h-[1px] bg-slate-100 mt-2 overflow-hidden">
                <div
                  className="h-full bg-slate-900 animate-progress origin-left"
                  style={{ animationDuration: '4s' }}
                />
              </div>
            )}
          </button>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .animate-progress { animation: progress linear forwards; }
      `,
        }}
      />
    </div>
  );
};

export default ImageBanner;
