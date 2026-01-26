import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { 
  CalendarDaysIcon, 
  FireIcon, 
  ArrowTrendingUpIcon,
  LightBulbIcon,
  MapIcon
} from '@heroicons/react/24/outline';

export default function YearlyLuckAppeal() {
  const { language } = useLanguage();

  const features = [
    {
      icon: FireIcon,
      title: language === 'ko' ? '붉은 말의 2026년' : '2026 Red Horse',
      desc: language === 'ko' 
        ? '역동적인 병오년(丙午年)의 에너지가 당신의 사주 원국과 만나 어떤 화학작용을 일으키는지 분석합니다.'
        : 'Analyze how the dynamic energy of the Red Horse Year interacts with your Saju chart.'
    },
    {
      icon: CalendarDaysIcon,
      title: language === 'ko' ? '12개월의 흐름' : '12-Month Flow',
      desc: language === 'ko'
        ? '한 해의 좋고 나쁨을 한마디로 정의할 수 없습니다. 월별 그래프를 통해 나아갈 때와 물러설 때를 구분하세요.'
        : 'Monthly graphs help you distinguish when to advance and when to retreat.'
    },
    {
      icon: ArrowTrendingUpIcon,
      title: language === 'ko' ? '핵심 기회 포착' : 'Seize Opportunities',
      desc: language === 'ko'
        ? '올해 당신에게 들어오는 가장 큰 기회는 무엇일까요? 재물, 명예, 이동 등 핵심 테마를 집중 조명합니다.'
        : 'What is your biggest opportunity this year? We spotlight key themes like wealth, honor, and movement.'
    }
  ];

  const examples = [
    {
      q: language === 'ko' ? "올해 사업을 확장해도 될까요?" : "Can I expand my business this year?",
      a: language === 'ko' ? "사업운이 상승하는 구체적인 월과 주의해야 할 분기점을 짚어드립니다." : "We pinpoint specific months of rising business luck and critical turning points."
    },
    {
      q: language === 'ko' ? "결혼 계획이 있습니다." : "I plan to get married.",
      a: language === 'ko' ? "애정운의 흐름과 결혼 택일에 유리한 시기를 확인하여 행복을 더하세요." : "Check the flow of love luck and favorable wedding dates."
    },
    {
      q: language === 'ko' ? "건강이 걱정됩니다." : "I'm worried about my health.",
      a: language === 'ko' ? "올해 조심해야 할 신체 부위와 건강 관리 포인트를 미리 체크하세요." : "Check body parts to watch out for and health management points in advance."
    }
  ];

  return (
    <div className="w-full bg-red-50/30 dark:bg-slate-900 border-t border-red-100 dark:border-slate-800">
      
      {/* 1. Hero */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <MapIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            {language === 'ko' ? (
              <>
                <span className="text-red-600 dark:text-red-400">2026년</span>, 당신의 일 년을<br/>
                관통하는 거대한 설계도
              </>
            ) : (
              <>
                The Grand Blueprint<br/>
                for your <span className="text-red-600 dark:text-red-400">2026</span>
              </>
            )}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base break-keep">
            {language === 'ko' 
              ? '한 치 앞도 모르는 미래, 사주라는 네비게이션으로 미리 확인하세요. 2026년 병오년의 뜨거운 에너지를 당신의 성취로 바꾸는 법을 알려드립니다.'
              : 'Check the unknown future with Saza navigation. Turn the hot energy of 2026 into your achievement.'}
          </p>
        </div>
      </section>

      {/* 2. Features */}
      <section className="py-12 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          
          {/* Decorative connector */}
          <div className="hidden md:block absolute top-[2.25rem] left-16 right-16 h-0.5 bg-gradient-to-r from-transparent via-red-200 dark:via-red-800 to-transparent z-0"></div>

          {features.map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              <div className="p-4 bg-red-50 dark:bg-slate-800 rounded-2xl mb-5 text-red-500 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-red-100 dark:border-slate-700">
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
              {language === 'ko' ? '미리 준비하는 지혜' : 'Wisdom to prepare'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'ko' ? '가장 중요한 결정들을 위한 가이드입니다.' : 'A guide for your most important decisions.'}
            </p>
          </div>
          
          <div className="relative space-y-8 pl-4 sm:pl-0">
            {/* Vertical Line */}
            <div className="absolute left-[1.35rem] sm:left-6 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

            {examples.map((ex, idx) => (
              <div key={idx} className="relative flex gap-5 items-start">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                   <span className="text-lg font-black text-red-300 dark:text-red-900/50 italic">Q</span>
                </div>
                <div className="pt-1">
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">"{ex.q}"</p>
                  <div className="flex gap-2 items-start">
                    <LightBulbIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
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
