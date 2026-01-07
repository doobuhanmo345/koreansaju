import React, { useEffect, useRef, useState } from 'react';

// step === 0.5 구간에 들어갈 컴포넌트 로직
const SajuIntroSection = ({ language, setStep }) => {
  const [visibleItems, setVisibleItems] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.2 },
    );

    const children = containerRef.current.querySelectorAll('.scroll-item');
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className=" flex flex-col gap-20 py-12 px-6 overflow-hidden text-slate-900"
    >
      {/* SECTION 1 */}
      <div
        id="item1"
        className={`scroll-item transition-all duration-1000 transform ${
          visibleItems.item1 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <p className="text-indigo-600 font-black text-[11px] tracking-[0.3em] uppercase mb-4">
          Ancient Logic meets Modern Tech
        </p>

        <h2 className="text-5xl font-black tracking-tighter leading-[0.9] mb-6">
          {language === 'ko' ? '사주는' : 'Saju works'} <br />
          <span className="text-indigo-600 italic">
            {language === 'ko' ? '생년월일부터 시작됩니다' : 'from your birth date.'}
          </span>
        </h2>

        <p className="text-slate-500 text-lg font-medium leading-tight">
          {language === 'ko'
            ? '생년월일로 당신의 선택과 흐름의 패턴을 분석합니다.'
            : 'Your birth date reveals patterns in decisions and timing.'}
        </p>
      </div>

      {/* SECTION 2 */}
      <div className="space-y-16">
        {[
          {
            id: 'item2',
            icon: '📐',
            title: language === 'ko' ? '사주는 무엇을 계산하나' : 'What Saju Calculates',
            desc:
              language === 'ko'
                ? '사주는 당신이 태어난 연·월·일·시를 네 개의 기둥으로 나누고, 그 안의 오행 분포와 상호작용을 계산하는 구조 분석 시스템입니다.'
                : 'Saju breaks your birth year, month, day, and time into four pillars, then calculates how the five elements interact.',
            bg: 'bg-slate-50',
          },
          {
            id: 'item3',
            icon: '🧮',
            title: language === 'ko' ? '왜 생년월일이 필요한가' : 'Why Birth Date Matters',
            desc:
              language === 'ko'
                ? '사주는 성향 분석을 포함하지만, 질문에 답해 결과가 달라지는 성격 테스트는 아닙니다. 태어난 순간의 시간 좌표를 기반으로 고정된 구조를 계산합니다.'
                : 'Saju describes tendencies and personality, but it is not a quiz that changes based on answers. It calculates a fixed structure from your birth data.',
            bg: 'bg-indigo-50',
          },

          {
            id: 'item4',
            icon: '📊',
            title: language === 'ko' ? '점과 다른 방식' : 'Different From Fortune-Telling',
            desc:
              language === 'ko'
                ? '직감으로 해석하는 점과 달리, 사주는 계산된 구조 위에서 해석이 이루어집니다.'
                : 'Unlike intuitive fortune-telling, Saju works from a calculated structure.',
            bg: 'bg-slate-100',
          },
          {
            id: 'item5',
            icon: '🧭',
            title: language === 'ko' ? '사용 방법은 단순합니다' : 'How It Works',
            desc:
              language === 'ko'
                ? '생년월일을 입력하고 결과를 확인하세요.'
                : 'Enter your birth data and view the result.',
            bg: 'bg-emerald-50',
          },
        ].map((card) => (
          <div
            key={card.id}
            id={card.id}
            className={`scroll-item flex flex-col gap-6 transition-all duration-1000 transform ${
              visibleItems[card.id] ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
            }`}
          >
            <div
              className={`w-20 h-20 ${card.bg} rounded-[32px] flex items-center justify-center text-4xl shadow-inner`}
            >
              {card.icon}
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight">{card.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 4 */}
      <div
        id="item7"
        className={`scroll-item text-center space-y-8 transition-all duration-1000 ${
          visibleItems.item7 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <p className="text-slate-400 font-bold text-sm tracking-tighter italic px-4">
          {language === 'ko'
            ? '이제 생년월일을 입력해 분석을 시작하세요.'
            : 'Enter your birth date to begin the analysis.'}
        </p>

        <button
          onClick={() => setStep(1)}
          className="w-full bg-slate-900 text-white font-black py-6 rounded-full text-xl shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span>{language === 'ko' ? '생년월일 입력하기' : 'Enter Birth Date'}</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default SajuIntroSection;
