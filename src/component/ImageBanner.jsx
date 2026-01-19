import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguageContext'; // 언어 컨텍스트 임포트
import { COLOR_THEMES } from '../data/theme';
const ImageBanner = () => {
  const navigate = useNavigate();
  const { language } = useLanguage(); // 현재 언어 상태 가져오기

  const bannerData = [
    {
      id: 0,
      menuTitle: { ko: '오늘의 운세', en: 'Daily' },
      mainTitle: {
        ko: '오늘 당신의\n에너지 점수는?',
        en: 'How is your\nenergy today?',
      },
      accent: { ko: '운세 점수', en: 'Score' },
      bgColor: '#FFFCEB',
      accentColor: '#FBBF24',
      link: '/todaysluck',
    },
    // {
    //   id: 1,
    //   menuTitle: { ko: '오늘의 모임', en: 'Social' },
    //   mainTitle: {
    //     ko: '술자리 모임\n생존 지수 확인',
    //     en: 'Survival index\nfor tonight',
    //   },
    //   accent: { ko: '술자리 바이브', en: 'Vibe' },
    //   bgColor: '#F5F5F5',
    //   accentColor: '#94A3B8',
    //   link: '/',
    // },
    {
      id: 2,
      menuTitle: { ko: '소개팅 지수', en: 'Date' },
      mainTitle: {
        ko: '소개팅과 썸\n그날의 설렘 확인',
        en: 'Your spark on\na first date',
      },
      accent: { ko: '첫만남 스파크', en: 'Spark' },
      bgColor: '#FDF2F2',
      accentColor: '#F87171',
      link: '/date',
    },
    {
      id: 3,
      menuTitle: { ko: '면접 지수', en: 'Interview' },
      mainTitle: {
        ko: '동아리나 직장\n합격의 기운 확인',
        en: 'Will you get\nthe offer?',
      },
      accent: { ko: '합격 패스', en: 'Pass' },
      bgColor: '#F0F9FF',
      accentColor: '#38BDF8',
      link: '/interview',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer;
    if (!isPaused) {
      timer = setInterval(() => {
        setActiveIndex((prev) => (prev === bannerData.length - 1 ? 0 : prev + 1));
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isPaused, bannerData.length]);

  const current = bannerData[activeIndex];
  const isKo = language === 'ko';

  return (
    <div
      className="relative w-full max-w-lg h-[240px] mx-auto flex overflow-hidden transition-all duration-700 ease-in-out my-6 rounded-[2rem] border border-slate-50 dark:border-slate-800 shadow-sm"
      style={{ backgroundColor: current.bgColor }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 메인 콘텐츠 영역 */}
      <div
        className="flex-1 relative flex flex-col justify-center px-10 cursor-pointer group"
        onClick={() => navigate(current.link)}
      >
        <div className="animate-in fade-in slide-in-from-left-5 duration-700">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 block">
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

          <div className="mt-6 flex items-center gap-2">
            <span className="text-[10px] font-bold py-1 px-2 bg-white/50 rounded text-slate-500 uppercase tracking-tighter">
              {isKo ? '지금 확인하기' : 'Check now'}
            </span>
          </div>
        </div>

        {/* 배경 대형 텍스트 */}
        <div className="absolute right-[-5%] bottom-[-5%] text-[80px] sm:text-[100px] font-black opacity-[0.03] italic select-none pointer-events-none">
          {isKo ? current.accent.ko : current.accent.en}
        </div>
      </div>

      {/* 우측 사이드바 메뉴 */}
      <div className="w-24 bg-white/40 backdrop-blur-md border-l border-white/20 flex flex-col">
        {bannerData.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setActiveIndex(index)}
            className={`flex-1 flex flex-col items-start justify-center px-4 transition-all duration-500 relative ${
              activeIndex === index ? 'bg-white/60' : 'hover:bg-white/20'
            }`}
          >
            <span
              className={`text-[9px] font-black tracking-tighter text-left leading-tight ${
                activeIndex === index ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {isKo ? item.menuTitle.ko : item.menuTitle.en}
            </span>

            {/* 진행 상태 바 */}
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
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress linear forwards;
        }
      `,
        }}
      />
    </div>
  );
};

export default ImageBanner;
