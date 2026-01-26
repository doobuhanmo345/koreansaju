import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { 
  UserIcon, 
  MapIcon, 
  ClockIcon, 
  LightBulbIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function BasicAnaAppeal() {
  const { language } = useLanguage();

  const features = [
    {
      icon: UserIcon,
      title: language === 'ko' ? '나의 본질 (일주)' : 'True Self (Day Pillar)',
      desc: language === 'ko' 
        ? '내가 태어난 날의 기운, 일주(日柱)를 통해 나의 타고난 성향과 기질을 명확히 정의합니다.'
        : 'Define your innate nature and temperament through the Day Pillar, the energy of the day you were born.'
    },
    {
      icon: ClockIcon,
      title: language === 'ko' ? '10년 대운의 흐름' : '10-Year Luck Cycle',
      desc: language === 'ko'
        ? '인생은 10년마다 큰 변화의 파도를 맞이합니다. 현재 나는 어떤 계절을 지나고 있는지 확인하세요.'
        : 'Life meets waves of change every 10 years. Check which season of life you are passing through.'
    },
    {
      icon: MapIcon,
      title: language === 'ko' ? '인생 전략 지도' : 'Life Strategy Map',
      desc: language === 'ko'
        ? '나의 강점을 극대화하고 약점을 보완하는, 오직 당신만을 위한 인생 공략집을 제공합니다.'
        : 'We provide a life strategy guide just for you, maximizing strengths and supplementing weaknesses.'
    }
  ];

  const examples = [
    {
      q: language === 'ko' ? "저는 언제쯤 부자가 될까요?" : "When will I become wealthy?",
      a: language === 'ko' ? "재물운이 들어오는 구체적인 대운의 시기와 활용법을 알려드립니다." : "We inform you of the specific timing and usage of wealth luck cycles."
    },
    {
      q: language === 'ko' ? "제 적성에 맞는 직업은?" : "What career suits me?",
      a: language === 'ko' ? "타고난 오행의 균형을 분석하여 가장 빛날 수 있는 직업군을 추천합니다." : "We recommend careers where you can shine most by analyzing your Five Elements balance."
    },
    {
      q: language === 'ko' ? "지금 이직해도 될까요?" : "Can I change jobs now?",
      a: language === 'ko' ? "현재 대운의 흐름이 변화에 유리한지, 안정이 필요한지 명쾌하게 답해드립니다." : "We clearly answer whether the current luck flow favors change or requires stability."
    }
  ];

  return (
    <div className="w-full bg-indigo-50/30 dark:bg-slate-900 border-t border-indigo-100 dark:border-slate-800">
      
      {/* 1. Hero */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
            <SparklesIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            {language === 'ko' ? (
              <>
                <span className="text-indigo-600 dark:text-indigo-400">운명의 지도</span>를 펼쳐<br/>
                나의 길을 찾으세요
              </>
            ) : (
              <>
                Unfold the <span className="text-indigo-600 dark:text-indigo-400">Map of Destiny</span><br/>
                and find your way
              </>
            )}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base break-keep">
            {language === 'ko' 
              ? '사주는 미신이 아닙니다. 수천 년간 축적된 데이터 통계학입니다. 나를 정확히 아는 것에서부터 인생의 변화는 시작됩니다.'
              : 'Saju is not superstition. It is data statistics accumulated for thousands of years. Life change begins with knowing yourself accurately.'}
          </p>
        </div>
      </section>

      {/* 2. Features */}
      <section className="py-12 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          
          {/* Decorative connector */}
          <div className="hidden md:block absolute top-[2.25rem] left-16 right-16 h-0.5 bg-gradient-to-r from-transparent via-indigo-200 dark:via-indigo-800 to-transparent z-0"></div>

          {features.map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              <div className="p-4 bg-indigo-50 dark:bg-slate-800 rounded-2xl mb-5 text-indigo-500 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-indigo-100 dark:border-slate-700">
                <item.icon className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-3">{item.title}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed break-keep max-w-xs">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Use Cases */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {language === 'ko' ? '가장 근원적인 질문들' : 'Fundamental Questions'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'ko' ? '인생의 해답은 내 안에 있습니다.' : 'The answers to life are within you.'}
            </p>
          </div>
          
          <div className="relative space-y-8 pl-4 sm:pl-0">
            {/* Vertical Line */}
            <div className="absolute left-[1.35rem] sm:left-6 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

            {examples.map((ex, idx) => (
              <div key={idx} className="relative flex gap-5 items-start">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                   <span className="text-lg font-black text-indigo-300 dark:text-indigo-900/50 italic">Q</span>
                </div>
                <div className="pt-1">
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">"{ex.q}"</p>
                  <div className="flex gap-2 items-start">
                    <LightBulbIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{ex.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
