import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguageContext';

const ImageBanner = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  // 애니메이션 충돌 방지를 위한 ref
  const contentRef = useRef(null);

  const bannerData = [
    {
      id: 0,
      menuTitle: { ko: '오늘의 운세', en: 'Daily' },
      mainTitle: { ko: '오늘 나의\n오행 흐름과 총점은?', en: 'How is your\nenergy today?' },
      accent: { ko: '운세 점수', en: 'Score' },
      bgColor: '#FEF9C3',
      accentColor: '#FBBF24',
      link: '/todaysluck',
      imageUrl: '/images/banner/today.webp',
    },
    {
      id: 1,
      menuTitle: { ko: '길일 선정', en: 'Select Day' },
      mainTitle: { ko: '이사·계약·여행\n언제가 좋을까?', en: 'Best day for\nbig decisions' },
      accent: { ko: '길일 추천', en: 'Good Day' },
      bgColor: '#F0FDF4', // Greenish
      accentColor: '#16A34A',
      link: '/seldate', // Rotue to SelDatePage
      imageUrl: '/images/banner/seldate.webp', // Assuming this or use a placeholder/similar
    },
    {
      id: 2,
      menuTitle: { ko: '만남 지수', en: 'Date' },
      mainTitle: { ko: '소개팅과 썸,\n이뤄질 수 있을까?', en: 'Your spark on\na date' },
      accent: { ko: '첫만남 스파크', en: 'Spark' },
      bgColor: '#FEE2E2',
      accentColor: '#F87171',
      link: '/date',
      imageUrl: '/images/banner/date.webp',
    },
    {
      id: 3,
      menuTitle: { ko: '면접 지수', en: 'Interview' },
      mainTitle: { ko: '떨리는 면접 날\n합격 기운은?', en: 'Will you get\nthe offer?' },
      accent: { ko: '합격 패스', en: 'Pass' },
      bgColor: '#E0F2FE',
      accentColor: '#0EA5E9',
      link: '/interview',
      imageUrl: '/images/banner/interview.webp',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // --- 스와이프 팔로우 로직 상태 ---
  const [touchStartX, setTouchStartX] = useState(null);
  const [translateX, setTranslateX] = useState(0); // 현재 드래그 중인 거리
  const [isDragging, setIsDragging] = useState(false); // 드래그 중인지 여부
  const minSwipeDistance = 60; // 스와이프 인식 최소 거리

  // 1. 터치 시작
  const onTouchStart = (e) => {
    setIsPaused(true); // 드래그 중 자동 넘김 방지
    setTouchStartX(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  // 2. 터치 이동 (손가락 따라 배너 움직이기)
  const onTouchMove = (e) => {
    if (touchStartX === null) return;
    const currentX = e.targetTouches[0].clientX;
    // 이동 거리 계산 (약간의 저항감을 위해 0.8 곱함)
    const diff = (currentX - touchStartX) * 0.8;
    setTranslateX(diff);
  };

  // 3. 터치 종료 (결과 판정)
  const onTouchEnd = () => {
    setIsDragging(false);
    setIsPaused(false);

    if (translateX < -minSwipeDistance) {
      // 왼쪽으로 충분히 밀었음 -> 다음 슬라이드
      handleNext();
    } else if (translateX > minSwipeDistance) {
      // 오른쪽으로 충분히 밀었음 -> 이전 슬라이드
      handlePrev();
    }

    // 중요: 손을 뗐으니 위치를 원상복구 (다음 슬라이드가 자연스럽게 들어오도록)
    setTranslateX(0);
    setTouchStartX(null);
  };
  // -----------------------------------

  useEffect(() => {
    let timer;
    // 드래그 중이 아닐 때만 자동 재생
    if (!isPaused && !isDragging) {
      timer = setInterval(() => {
        handleNext();
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [isPaused, activeIndex, isDragging]); // isDragging 의존성 추가

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
      className="relative z-0 w-full max-w-lg h-[210px] mx-auto flex overflow-hidden transition-all duration-500 ease-in-out my-2 rounded-[1rem]  shadow-xl group hover:shadow-2xl sm:hover:-translate-y-1 touch-pan-y"
      style={{
        // 배경색 그라데이션
        background: `linear-gradient(135deg, ${current.bgColor} 0%, ${current.bgColor} 60%, #ffffff 100%)`,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      // 터치 이벤트 연결
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* 배경 장식 blur */}
      <div
        className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-30 transition-colors duration-700"
        style={{ backgroundColor: current.accentColor }}
      />

      {/* 메인 콘텐츠 영역 (움직이는 대상) 
        - transform으로 위치 이동
        - isDragging 일 때는 transition을 없애서 즉각 반응하게 함
      */}
      <div
        ref={contentRef}
        className="flex-1 relative flex flex-col justify-center px-12 md:px-8 cursor-pointer will-change-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 300ms ease-out, opacity 300ms ease-out',
          // 드래그 중일 때 약간 투명해지게 효과 추가 (선택사항)
          opacity: isDragging ? 0.8 : 1,
        }}
        onClick={() => {
          // 드래그가 아닌 클릭일 때만 이동
          if (Math.abs(translateX) < 5) navigate(current.link);
        }}
      >
        {/* 내부 콘텐츠: 드래그 중에는 기존 CSS 애니메이션 방해 안 받게 key 관리 중요 */}
        <div
          key={isDragging ? 'dragging' : current.id}
          className={
            !isDragging
              ? 'z-10 animate-in fade-in slide-in-from-left-6 duration-700 pointer-events-none'
              : 'pointer-events-none'
          }
        >
          <span
            className="text-sm font-black uppercase tracking-[0.3em] mb-2.5 block"
            style={{ color: current.accentColor }}
          >
            {isKo ? current.menuTitle.ko : current.menuTitle.en}
          </span>

          <h2
            className={`text-2xl sm:text-[1.65rem] font-black text-slate-900 leading-[1.2] tracking-tight whitespace-pre-line  ${isKo ? 'break-keep' : ''}`}
          >
            {(isKo ? current.mainTitle.ko : current.mainTitle.en).split('\n')[0]} <br />
            <span className="relative inline-block mt-0.5">
              <span style={{ color: current.accentColor }}>
                {(isKo ? current.mainTitle.ko : current.mainTitle.en).split('\n')[1]}
              </span>
              <div
                className="absolute bottom-1 left-0 w-full h-2.5 opacity-30 -z-10"
                style={{ backgroundColor: current.accentColor }}
              />
            </span>
          </h2>

          <div className="mt-5 flex items-center">
            <span
              className="text-[11px] font-extrabold py-2 px-5 rounded-full text-white shadow-md transform transition-all group-hover:scale-110"
              style={{ backgroundColor: current.accentColor }}
            >
              {isKo ? '지금 확인하기' : 'Check now'}
            </span>
          </div>
        </div>

        {/* 배경 이미지 */}
        <div className="absolute z-0 right-12 md:right-4 bottom-2 w-36 h-36 pointer-events-none overflow-hidden transition-transform duration-700 group-hover:scale-110">
          <img
            key={isDragging ? 'dragging-img' : `img-${current.id}`}
            src={current.imageUrl}
            alt=""
            className={
              !isDragging
                ? 'w-full h-full object-contain object-right-bottom animate-in fade-in zoom-in-95 slide-in-from-right-10 duration-1000'
                : 'w-full h-full object-contain object-right-bottom'
            }
          />
        </div>
      </div>

       {/* 모바일 전용 네비게이션 버튼 (Left/Right) */}
      <button 
        onClick={handlePrev}
        className="md:hidden absolute left-1 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/40 hover:bg-white/60 backdrop-blur-sm rounded-full text-slate-600 shadow-sm transition-all active:scale-95"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button 
        onClick={handleNext}
        className="md:hidden absolute right-1 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/40 hover:bg-white/60 backdrop-blur-sm rounded-full text-slate-600 shadow-sm transition-all active:scale-95"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 모바일 전용 인디케이터 (점점점) */}
      <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-[5]">
        {bannerData.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-4 bg-slate-800' : 'w-1.5 bg-slate-400/50'}`}
          />
        ))}
      </div>

      {/* 데스크톱 전용 사이드바 */}
      <div className="hidden md:flex w-24 bg-white/50 backdrop-blur-xl border-l border-white/60 flex-col z-10">
        {/* ... (사이드바 코드는 동일) ... */}
        {bannerData.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setActiveIndex(index)}
            className={`flex-1 flex flex-col items-center justify-center px-2 transition-all duration-500 relative ${
              activeIndex === index ? 'bg-white/70 shadow-inner' : 'hover:bg-white/30'
            }`}
          >
            <span
              className={`text-sm font-black tracking-tighter text-center leading-tight transition-all ${activeIndex === index ? 'text-slate-900 scale-105' : 'text-slate-400'}`}
            >
              {isKo ? item.menuTitle.ko : item.menuTitle.en}
            </span>
            {activeIndex === index && (
              <>
                <div
                  className="absolute right-0 top-0 bottom-0 w-[4px] animate-in slide-in-from-right duration-500"
                  style={{ backgroundColor: current.accentColor }}
                />
                <div className="w-full h-[2px] bg-slate-200 mt-2 overflow-hidden rounded-full max-w-[30px]">
                  <div
                    className="h-full animate-progress origin-left"
                    style={{ backgroundColor: current.accentColor, animationDuration: '4.5s' }}
                  />
                </div>
              </>
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
