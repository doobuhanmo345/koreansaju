import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguageContext';
import {
  CloudIcon,
  BoltIcon,
  SparklesIcon,
  ArrowRightIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserIcon,
  GlobeAsiaAustraliaIcon,
} from '@heroicons/react/24/outline';

export default function SajuExplanation() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const TEXT = {
    hero: {
      title:
        language === 'ko'
          ? '내 운명의 날씨를 미리 알 수 있다면?'
          : 'What if you knew the weather of your life?',
      subtitle:
        language === 'ko'
          ? '사주는 당신이 태어난 순간, 우주가 당신에게 부여한 에너지 데이터를 분석하는 통계학입니다.'
          : 'Saju is a statistical analysis of the energy data the universe assigned to you at the moment of your birth.',
    },
    section1: {
      label: language === 'ko' ? '사주란?' : 'What is Saju?',
      title: language === 'ko' ? '시간의 바코드, 사주(四柱)' : 'The Barcode of Time',
      desc:
        language === 'ko'
          ? '우리는 저마다의 "바코드"를 가지고 태어납니다.태어난 연, 월, 일, 시. 이 네 가지 시점의 천문학적 위치가 당신의 기질과 잠재력을 결정하며 전 세계 어디서 태어났든 그 지역의 천문학적 위치를 기준으로  정확한 사주 분석이 이루어집니다'
          : 'Each of us is born with our own unique "barcode." Year, Month, Day, and Hour—the astronomical positions at these four moments determine your temperament and potential. wherever you are born, your Saju analysis is based precisely on the astronomical data of your local region.',
    },
    pillars: {
      year: {
        title: language === 'ko' ? '년(Year)' : 'Year',
        desc:
          language === 'ko'
            ? '나의 뿌리, 초년운, 큰 배경'
            : 'Your roots, early life fortune, and background',
      },
      month: {
        title: language === 'ko' ? '월(Month)' : 'Month',
        desc:
          language === 'ko'
            ? '나의 환경, 직업, 부모 형제'
            : 'Your environment, career, parents, and siblings',
      },
      day: {
        title: language === 'ko' ? '일(Day)' : 'Day',
        desc: language === 'ko' ? '진정한 나 자신, 배우자' : 'Your true self, spouse',
      },
      time: {
        title: language === 'ko' ? '시(Time)' : 'Time',
        desc:
          language === 'ko'
            ? '나의 미래, 자녀, 말년운'
            : 'Your future, children, and late-life fortune',
      },
    },
    elements: {
      title: language === 'ko' ? '세상을 구성하는 5가지 재료' : 'The 5 Elements of the World',
      desc:
        language === 'ko'
          ? '목, 화, 토, 금, 수. 이 다섯 가지 에너지가 당신의 몸과 마음속에서 끊임없이 순환합니다. 어떤 재료가 많고 적은지에 따라 당신의 "사용 설명서"가 달라집니다.'
          : 'Wood, Fire, Earth, Metal, Water. These five energies circulate endlessly within your body and mind. Your personal "user manual" changes depending on the five energies you possess.',
    },
    analogy: {
      title: language === 'ko' ? '예언이 아니라, 전략입니다' : 'Not Prediction, But Strategy',
      desc:
        language === 'ko'
          ? "비가 올 것을 안다면 우산을 챙기듯, 사주는 정해진 운명을 맹신하는 것이 아니라, 다가올 흐름(Flow)을 읽고 나에게 유리한 선택을 하도록 돕는 '인생의 내비게이션'입니다."
          : "Knowing it will rain, you bring an umbrella. Saju isn't about blindly believing in fate; it's a GPS that helps you read the flow and make better choices for yourself, Like ‘Inner navigation.’",
    },
    cta: {
      button: language === 'ko' ? '내 사주 분석하러 가기' : 'Analyze My Saju Now',
    },
  };

  return (
    // 1. 전체 텍스트 톤 다운: text-stone-700 (너무 검지 않게)
    <div className="bg-stone-50 dark:bg-slate-900 text-stone-700 dark:text-stone-300 transition-colors pb-24 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-24 pb-20 px-6 text-center w-full mx-auto flex flex-col items-center">
        {/* 부드러운 그라데이션 배경 */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-indigo-50/60 via-stone-50/50 to-transparent dark:from-slate-800/30 dark:via-slate-900/0 pointer-events-none" />

        <div className="relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-stone-200 dark:border-slate-700 mb-8 px-5">
            <SparklesIcon className="w-5 h-5 text-indigo-500 mr-2" />
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 tracking-widest uppercase">
              Data of Destiny
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-stone-800 dark:text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
            {TEXT.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-stone-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
            {TEXT.hero.subtitle}
          </p>
        </div>
      </section>

      {/* ================= SECTION 1: 4 PILLARS (구조 설명) ================= */}
      {/* 배경을 흰색으로 깔아서 섹션 구분 */}
      <section className="py-20 px-4 bg-white dark:bg-slate-800/30 border-y border-stone-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider">
              {TEXT.section1.label}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-white mt-3 mb-6">
              {TEXT.section1.title}
            </h2>
            <p className="text-lg text-stone-600 dark:text-slate-400 max-w-3xl mx-auto">
              {TEXT.section1.desc}
            </p>
          </div>
          {/* 4개의 기둥 카드 */}

          <div className="grid grid-cols-2  md:grid-cols-4 gap-4 md:gap-6">
            <PillarCard
              icon={<GlobeAsiaAustraliaIcon className="w-8 h-8" />}
              title={TEXT.pillars.year.title}
              desc={TEXT.pillars.year.desc}
              delay="0"
            />
            <PillarCard
              icon={<CalendarDaysIcon className="w-8 h-8" />}
              title={TEXT.pillars.month.title}
              desc={TEXT.pillars.month.desc}
              delay="100"
            />
            <PillarCard
              icon={<UserIcon className="w-8 h-8" />}
              title={TEXT.pillars.day.title}
              desc={TEXT.pillars.day.desc}
              highlight
            />
            <PillarCard
              icon={<ClockIcon className="w-8 h-8" />}
              title={TEXT.pillars.time.title}
              desc={TEXT.pillars.time.desc}
              delay="200"
            />
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: 5 ELEMENTS (오행) ================= */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-800 dark:text-white mb-4">
              {TEXT.elements.title}
            </h2>
            <p className="text-stone-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              {TEXT.elements.desc}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            <ElementCard
              icon="🌳"
              title={language === 'ko' ? '목(Wood)' : 'Wood'}
              subtitle={language === 'ko' ? '성장, 창의력' : 'Growth, Creativity'}
              color="bg-green-50/80 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400"
            />
            <ElementCard
              icon="🔥"
              title={language === 'ko' ? '화(Fire)' : 'Fire'}
              subtitle={language === 'ko' ? '열정, 표현력' : 'Passion, Expression'}
              color="bg-red-50/80 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400"
            />
            <ElementCard
              icon="⛰️"
              title={language === 'ko' ? '토(Earth)' : 'Earth'}
              subtitle={language === 'ko' ? '믿음, 포용력' : 'Trust, Tolerance'}
              color="bg-amber-50/80 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
            />
            <ElementCard
              icon="⚔️"
              title={language === 'ko' ? '금(Metal)' : 'Metal'}
              subtitle={language === 'ko' ? '결단, 원칙' : 'Determination, Principle'}
              color="bg-stone-200/60 text-stone-700 border-stone-300 dark:bg-slate-700/40 dark:text-slate-300"
            />
            <ElementCard
              icon="💧"
              title={language === 'ko' ? '수(Water)' : 'Water'}
              subtitle={language === 'ko' ? '지혜, 유연함' : 'Wisdom, Flexibility'}
              color="bg-blue-50/80 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
            />
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: ANALOGY (비유) ================= */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-14 shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest">
              <CloudIcon className="w-5 h-5" />
              <span>Weather Forecast</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-white leading-tight">
              {TEXT.analogy.title}
            </h2>
            <p className="text-lg text-stone-600 dark:text-slate-300 leading-relaxed">
              {TEXT.analogy.desc}
            </p>
            <div className="h-px w-20 bg-stone-300 dark:bg-slate-600 mt-6" />
          </div>

          {/* 우산 카드 (일러스트 느낌 강화) */}
          <div className="flex-1 w-full max-w-sm">
            <div className="group relative bg-gradient-to-br from-slate-700 to-stone-800 dark:from-indigo-600 dark:to-purple-900 p-8 rounded-[2rem] shadow-2xl text-white overflow-hidden transform transition-all duration-500 hover:-translate-y-2">
              <BoltIcon className="absolute -right-6 -top-6 w-40 h-40 text-white opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative z-10">
                <div className="text-4xl mb-4 bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm">
                  ☔️
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  {language === 'ko' ? '비가 온다면?' : 'If it Rains?'}
                </h3>
                <p className="text-stone-200 dark:text-indigo-100 leading-relaxed text-sm font-medium">
                  {language === 'ko'
                    ? '비를 멈추게 할 순 없지만, 튼튼한 우산을 준비할 순 있습니다. 사주는 위기를 기회로 바꾸는 도구입니다.'
                    : "You can't stop the rain, but you can prepare a sturdy umbrella. Saju is a tool to turn crises into opportunities."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="text-center px-6 mt-16 pb-10">
        <button
          onClick={() => navigate('/')}
          className="relative group inline-flex items-center gap-3 px-10 py-5 bg-stone-800 dark:bg-indigo-600 text-white rounded-full text-lg font-bold shadow-xl shadow-stone-400/20 dark:shadow-indigo-500/30 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
        >
          {TEXT.cta.button}
          <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="mt-5 text-sm font-medium text-stone-400 dark:text-stone-500">
          {language === 'ko'
            ? '💡 간단한 구글 로그인으로 무료로 체험해 보세요'
            : '💡 Try it free with simple Google login.'}
        </p>
      </section>
    </div>
  );
}

// Sub Component: Pillar Card (4기둥 카드)
function PillarCard({ icon, title, desc, highlight, delay }) {
  return (
    <div
      className={`
      relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center h-full
      ${
        highlight
          ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800'
          : 'bg-stone-50 border-stone-100 hover:border-stone-200 dark:bg-slate-700/30 dark:border-slate-700'
      }
    `}
    >
      <div
        className={`mb-4 p-3 rounded-full ${highlight ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500 dark:text-white' : 'bg-white text-stone-500 dark:bg-slate-600 dark:text-stone-300 shadow-sm'}`}
      >
        {icon}
      </div>
      <h3
        className={`font-bold text-lg mb-2 ${highlight ? 'text-indigo-700 dark:text-indigo-300' : 'text-stone-700 dark:text-stone-200'}`}
      >
        {title}
      </h3>
      <p className="text-sm text-stone-500 dark:text-slate-400 leading-snug">{desc}</p>
    </div>
  );
}

// Sub Component: Element Card (오행 카드)
function ElementCard({ icon, title, subtitle, color }) {
  return (
    <div
      className={`
      flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300
      ${color} hover:shadow-lg hover:-translate-y-1 cursor-default
      bg-opacity-60 dark:bg-opacity-20
    `}
    >
      <div className="text-4xl mb-3 drop-shadow-sm filter grayscale-[0.2] hover:grayscale-0 transition-all">
        {icon}
      </div>
      <h3 className="font-bold text-stone-800 dark:text-stone-200 mb-1">{title}</h3>
      <span className="text-xs font-semibold opacity-80 text-stone-600 dark:text-stone-400">
        {subtitle}
      </span>
    </div>
  );
}
