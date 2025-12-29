import React, { useState, useEffect } from 'react';

function LoadingPage() {
  const [displayedTexts, setDisplayedTexts] = useState([]);

  const loadingTexts = [
    '태어난 날의 천간과 지지를 조합하는 중...',
    '오행의 균형과 기운을 분석하는 중...',
    '인생을 바꿀 대운의 흐름을 계산 중...',
    '사주 명식의 신살과 합충을 풀이하는 중...',
    '운명의 지도를 완성하고 있습니다...',
    '격국과 용신의 향방을 가늠하는 중...',
    '음양의 조화가 이끄는 길을 찾는 중...',
    '타고난 기질과 잠재력을 살피는 중...',
    '사계절의 순환 속 당신의 위치를 확인 중...',
    '곧 당신의 운명 보고서가 도착합니다.',
  ];

  useEffect(() => {
    setDisplayedTexts([loadingTexts[0]]);
    let currentIndex = 1;
    const interval = setInterval(() => {
      if (currentIndex < loadingTexts.length) {
        setDisplayedTexts((prev) => [...prev, loadingTexts[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center  px-6 overflow-hidden">
      {/* 1. 외곽선이 불규칙한 종이 필터 정의 (SVG) */}
      <svg className="absolute w-0 h-0">
        <filter id="paper-edge">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
        </filter>
      </svg>

      <div className="relative w-full max-w-lg animate-in fade-in duration-1000">
        {/* 2. 실제 편지지 몸체 */}
        <div
          className="mt-1 relative z-10 bg-[#fffef5] dark:bg-slate-900 shadow-2xl p-6 md:p-14 border border-stone-200/50 dark:border-slate-800 transition-all duration-500"
          style={{ filter: 'url(#paper-edge)' }} // 불규칙한 종이 테두리 적용
        >
          {/* 종이 질감 오버레이 */}
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>

          {/* 가로줄 가이드 */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[linear-gradient(transparent_31px,#5d4037_32px)] bg-[length:100%_32px]"></div>

          <div className="relative z-10">
            <div className="flex flex-col items-center mb-6 opacity-40">
              <div className="w-10 h-[1px] bg-stone-500 mb-2"></div>
              <span className="text-[10px] tracking-[0.4em] uppercase text-stone-600 font-serif font-bold">
                Heavenly Record
              </span>
            </div>

            {/* 텍스트 영역: min-h 제거 */}
            <div className="flex flex-col gap-1">
              {displayedTexts.map((text, idx) => (
                <div key={idx} className="relative h-8 flex items-center">
                  <p className="font-handwriting text-lg md:text-xl text-slate-800 dark:text-slate-200 leading-none break-keep animate-writing-ink">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 바닥 그림자: 종이가 살짝 뜬 느낌 */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[98%] h-12 bg-stone-800/20 blur-3xl rounded-[100%]"></div>
      </div>

      <div className="mt-14 text-center">
        <p className="text-stone-500 dark:text-slate-400 text-xs tracking-[0.2em] animate-pulse font-serif italic">
          부드러운 필체로 당신의 기운을 적어 내려갑니다...
        </p>
      </div>

      <style>{`
         @import url('https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&display=swap');
  
  .font-handwriting { 
    font-family: 'Nanum Brush Script', cursive; 
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transform: translateZ(0); /* GPU 가속으로 렌더링 최적화 */
    text-rendering: optimizeLegibility;
    font-weight: 500; /* 너무 얇으면 모바일에서 깨져 보이니 두께를 올림 */
    letter-spacing: -0.03em; 
    line-height: 1.6;
    word-break: keep-all;
  }

        .animate-writing-ink {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          mask-image: linear-gradient(to right, black 100%, transparent 100%);
          mask-size: 200% 100%;
          mask-position: 100% 0;
          animation: writing-ink 2.2s ease-out forwards;
        }

        @keyframes writing-ink {
          0% { width: 0; mask-position: 100% 0; opacity: 0; filter: blur(1.5px); transform: translateY(1px); }
          100% { width: 100%; mask-position: 0% 0; opacity: 1; filter: blur(0); transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default LoadingPage;
