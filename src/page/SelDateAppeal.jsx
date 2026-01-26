import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function SelDateAppeal() {
  const { language } = useLanguage();

  const features = [
    {
      icon: ClockIcon,
      title: language === 'ko' ? '최적의 타이밍' : 'Optimal Timing',
      desc: language === 'ko' 
        ? '이사, 개업, 계약 등 중요한 시작의 순간. 당신의 사주와 가장 조화로운 날짜를 찾아드립니다.'
        : 'Important beginnings like moving, opening, contracts. We find the date most harmonious with your Saju.'
    },
    {
      icon: CheckBadgeIcon,
      title: language === 'ko' ? '흉운 회피' : 'Avoiding Bad Luck',
      desc: language === 'ko'
        ? '누구에게나 피해야 할 날이 있습니다. 예상치 못한 장애물이나 손실을 예방하는 것이 성공의 첫걸음입니다.'
        : 'Everyone has days to avoid. Preventing unexpected obstacles or losses is the first step to success.'
    },
    {
      icon: ArrowTrendingUpIcon,
      title: language === 'ko' ? '성공 에너지 증폭' : 'Amplify Success',
      desc: language === 'ko'
        ? '단순히 나쁜 날을 피하는 것을 넘어, 당신이 가진 긍정적인 기운을 200% 활용할 수 있는 날을 제안합니다.'
        : 'Beyond avoiding bad days, we suggest days where you can utilize your positive energy by 200%.'
    }
  ];

  const examples = [
    {
      q: language === 'ko' ? "이사는 손 없는 날이면 되나요?" : "Is 'No Ghost Day' enough for moving?",
      a: language === 'ko' ? "손 없는 날도 좋지만, 거주자의 사주와 집의 방향이 맞는 날이 진짜 길일입니다." : "'No Ghost Day' is good, but the real lucky day matches the resident's Saju and house direction."
    },
    {
      q: language === 'ko' ? "결혼 날짜, 주말만 가능한데..." : "Wedding date, only weekends possible...",
      a: language === 'ko' ? "한정된 기간 내에서 두 사람의 기운이 충돌하지 않고 서로를 생(生)하는 날을 찾아드립니다." : "Within a limited period, we find a day where your energies don't clash but support each other."
    },
    {
      q: language === 'ko' ? "급하게 계약해야 해요." : "I need to sign a contract urgently.",
      a: language === 'ko' ? "짧은 기간 안에서도 실수를 줄이고 이익을 극대화할 수 있는 최선의 시간대를 알려드립니다." : "Even within a short period, we inform you of the best time slot to minimize mistakes and maximize profit."
    }
  ];

  return (
    <div className="w-full bg-emerald-50/30 dark:bg-slate-900 border-t border-emerald-100 dark:border-slate-800">
      
      {/* 1. Hero */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
            <CalendarDaysIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            {language === 'ko' ? (
              <>
                <span className="text-emerald-600 dark:text-emerald-400">성공의 시작</span>은<br/>
                좋은 날짜를 잡는 것입니다
              </>
            ) : (
              <>
                Success begins with<br/>
                picking the <span className="text-emerald-600 dark:text-emerald-400">Right Date</span>
              </>
            )}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base break-keep">
            {language === 'ko' 
              ? '모든 일에는 때가 있습니다. 천지 기운이 당신을 돕는 그 순간을 놓치지 마세요.'
              : 'There is a time for everything. Do not miss the moment when the energy of heaven and earth helps you.'}
          </p>
        </div>
      </section>

      {/* 2. Features */}
      <section className="py-12 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          
          {/* Decorative connector */}
          <div className="hidden md:block absolute top-[2.25rem] left-16 right-16 h-0.5 bg-gradient-to-r from-transparent via-emerald-200 dark:via-emerald-800 to-transparent z-0"></div>

          {features.map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              <div className="p-4 bg-emerald-50 dark:bg-slate-800 rounded-2xl mb-5 text-emerald-500 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-emerald-100 dark:border-slate-700">
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
              {language === 'ko' ? '어떤 날을 찾고 계신가요?' : 'What Date Are You Looking For?'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'ko' ? '목적에 맞는 최고의 길일을 선별해 드립니다.' : 'We select the best auspicious days for your purpose.'}
            </p>
          </div>
          
          <div className="relative space-y-8 pl-4 sm:pl-0">
            {/* Vertical Line */}
            <div className="absolute left-[1.35rem] sm:left-6 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

            {examples.map((ex, idx) => (
              <div key={idx} className="relative flex gap-5 items-start">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                   <span className="text-lg font-black text-emerald-300 dark:text-emerald-900/50 italic">Q</span>
                </div>
                <div className="pt-1">
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">"{ex.q}"</p>
                  <div className="flex gap-2 items-start">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
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
