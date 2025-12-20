import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/useLanguageContext';
import {
  SunIcon,
  CloudIcon,
  BoltIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function SajuExp() {
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
          ? '사주는 단순한 미신이 아닙니다. 당신이 태어난 순간의 우주적 데이터를 분석하는 통계학입니다.'
          : 'Saju is not magic. It is an ancient statistical analysis of the cosmic energy at the moment of your birth.',
    },
    section1: {
      title: language === 'ko' ? '시간의 바코드, 사주(四柱)' : 'The Barcode of Time',
      desc:
        language === 'ko'
          ? '우리는 모두 고유한 에너지 코드를 가지고 태어납니다. 년, 월, 일, 시. 이 4개의 기둥(Four Pillars)에 당신의 성향, 재능, 그리고 흐름이 담겨 있습니다.'
          : "We are all born with a unique energy code based on the Year, Month, Day, and Time. These 'Four Pillars' hold the blueprint of your personality, talents, and life flow.",
    },
    elements: {
      title:
        language === 'ko' ? '세상을 구성하는 5가지 재료' : 'The 5 Elements making up the World',
      desc:
        language === 'ko'
          ? '당신의 사주에는 이 5가지 원소들이 서로 춤을 추고 있습니다. 어떤 기운이 부족하고, 어떤 기운이 넘치나요?'
          : 'Inside your chart, these five elements are dancing together. Which energy is overflowing, and which is missing?',
    },
    analogy: {
      title: language === 'ko' ? '예언이 아니라, 전략입니다' : 'Not a Prediction, But a Strategy',
      desc:
        language === 'ko'
          ? "비가 온다는 것을 알면 우산을 준비할 수 있습니다. 사주는 미래를 정하는 것이 아니라, 다가올 흐름을 읽고 파도를 타는 법을 알려주는 '인생의 내비게이션'입니다."
          : "If you know it's going to rain, you can bring an umbrella. Saju doesn't dictate your future; it acts as a GPS, helping you navigate the waves of life effectively.",
    },
    cta: {
      button: language === 'ko' ? '내 사주 분석하러 가기' : 'Analyze My Saju Now',
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors pb-20">
      {/* 1. Hero Section (도입부) */}
      <section className="relative py-20 px-6 text-center max-w-3xl mx-auto flex flex-col items-center animate-fade-in-up">
        <div className="inline-block p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30 mb-6">
          <SparklesIcon className="w-8 h-8 text-indigo-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
          {TEXT.hero.title}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          {TEXT.hero.subtitle}
        </p>
      </section>

      {/* 2. Visual Elements Section (오행 설명) */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {TEXT.elements.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            {TEXT.elements.desc}
          </p>

          {/* 5행 아이콘 그리드 */}
          <div className="grid grid-cols-5 gap-4 md:gap-8">
            <ElementCard
              icon="🌳"
              label={language === 'ko' ? '목(Wood)' : 'Wood'}
              color="bg-green-100 text-green-600"
            />
            <ElementCard
              icon="🔥"
              label={language === 'ko' ? '화(Fire)' : 'Fire'}
              color="bg-red-100 text-red-600"
            />
            <ElementCard
              icon="⛰️"
              label={language === 'ko' ? '토(Earth)' : 'Earth'}
              color="bg-yellow-100 text-yellow-600"
            />
            <ElementCard
              icon="⚔️"
              label={language === 'ko' ? '금(Metal)' : 'Metal'}
              color="bg-gray-200 text-gray-600"
            />
            <ElementCard
              icon="💧"
              label={language === 'ko' ? '수(Water)' : 'Water'}
              color="bg-blue-100 text-blue-600"
            />
          </div>
        </div>
      </section>

      {/* 3. Analogy Section (날씨 비유) */}
      <section className="py-20 px-6 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-sm tracking-wider">
            <CloudIcon className="w-5 h-5" />
            {language === 'ko' ? '인생 날씨 예보' : 'Life Weather Forecast'}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{TEXT.analogy.title}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {TEXT.analogy.desc}
          </p>
        </div>

        {/* 우산/날씨 일러스트 대용 카드 */}
        <div className="flex-1 w-full max-w-xs">
          <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-600 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BoltIcon className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 text-2xl">
                ☔️
              </div>
              <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2">
                {language === 'ko' ? '비가 올 땐 우산을,' : 'Umbrella for Rain,'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {language === 'ko'
                  ? '해가 뜰 땐 선글라스를. 사주는 당신이 무엇을 준비해야 할지 알려줍니다.'
                  : 'Sunglasses for Sun. Saju tells you exactly what to prepare for.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA Section (바로가기) */}
      <section className="text-center px-6 mt-10">
        <button
          onClick={() => navigate('/')}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-lg font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 dark:hover:bg-indigo-400 hover:scale-105 transition-all duration-300"
        >
          {TEXT.cta.button}
          <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </section>
    </div>
  );
}

// 오행 카드용 작은 컴포넌트
function ElementCard({ icon, label, color }) {
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div
        className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-sm ${color} transition-transform group-hover:scale-110 duration-300`}
      >
        {icon}
      </div>
      <span className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  );
}
