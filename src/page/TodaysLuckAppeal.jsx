import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { 
  SunIcon, 
  CalendarDaysIcon, 
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function TodaysLuckAppeal() {
  const { language } = useLanguage();

  const features = [
    {
      icon: SunIcon,
      title: language === 'ko' ? '오늘의 에너지' : 'Energy of the Day',
      desc: language === 'ko' 
        ? '매일 달라지는 오행의 기운을 분석하여, 오늘 당신에게 가장 유리한 행동과 피해야 할 것을 알려드립니다.'
        : 'Analyze the daily changing energy of Five Elements to inform you of the most favorable actions and what to avoid.'
    },
    {
      icon: ShieldCheckIcon,
      title: language === 'ko' ? '행운의 치트키' : 'Lucky Cheat Keys',
      desc: language === 'ko'
        ? '오늘 나를 지켜줄 행운의 색상, 방향, 그리고 귀인이 되어줄 사람의 특징을 구체적으로 제시합니다.'
        : 'Specifically suggest lucky colors, directions, and characteristics of people who will be your helpers today.'
    },
    {
      icon: CalendarDaysIcon,
      title: language === 'ko' ? '내일의 예보' : 'Tomorrow Forecast',
      desc: language === 'ko'
        ? '하루를 마감하며 내일의 운세를 미리 확인하세요. 다가올 흐름을 알면 더 여유로운 하루를 설계할 수 있습니다.'
        : 'Check tomorrow\'s fortune in advance. Knowing the upcoming flow allows you to design a more relaxed day.'
    }
  ];

  const examples = [
    {
      q: language === 'ko' ? "오늘 중요한 미팅이 있어요." : "I have an important meeting today.",
      a: language === 'ko' ? "상대방을 설득하기 좋은 시간대와 나의 기운을 북돋아 줄 팁을 확인하세요." : "Check the best time to persuade others and tips to boost your energy."
    },
    {
      q: language === 'ko' ? "썸타는 사람에게 고백할까요?" : "Should I confess to my crush?",
      a: language === 'ko' ? "오늘의 애정운 수치를 통해 성공 확률이 높은 날인지, 기다려야 할 날인지 판단해드립니다." : "Judge whether today is a high probability day or a day to wait through love luck scores."
    },
    {
      q: language === 'ko' ? "로또 사도 될까요?" : "Should I buy a lottery ticket?",
      a: language === 'ko' ? "금전운이 폭발하는 날이 있습니다. 재물이 모이는 날을 놓치지 마세요." : "There are days when wealth luck explodes. Don't miss the day when wealth gathers."
    }
  ];

  return (
    <div className="w-full bg-amber-50/30 dark:bg-slate-900 border-t border-amber-100 dark:border-slate-800">
      
      {/* 1. Hero */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
            <SunIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            {language === 'ko' ? (
              <>
                <span className="text-amber-600 dark:text-amber-400">오늘 하루</span>, 당신에게<br/>
                가장 필요한 조언
              </>
            ) : (
              <>
                Advice you need most<br/>
                for <span className="text-amber-600 dark:text-amber-400">Today</span>
              </>
            )}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base break-keep">
            {language === 'ko' 
              ? '같은 날이라도 사람마다 흐름은 다릅니다. 사자사주가 당신만의 맞춤형 일기예보가 되어드릴게요.'
              : 'Even on the same day, the flow is different for everyone. SazaSaju will be your personalized weather forecast.'}
          </p>
        </div>
      </section>

      {/* 2. Features */}
      <section className="py-12 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          
          {/* Decorative connector */}
          <div className="hidden md:block absolute top-[2.25rem] left-16 right-16 h-0.5 bg-gradient-to-r from-transparent via-amber-200 dark:via-amber-800 to-transparent z-0"></div>

          {features.map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl mb-5 text-amber-500 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-amber-100 dark:border-slate-700">
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
              {language === 'ko' ? '매일의 선택을 현명하게' : 'Wise Daily Choices'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'ko' ? '작은 선택들이 모여 운명을 만듭니다.' : 'Small choices gather to create destiny.'}
            </p>
          </div>
          
          <div className="relative space-y-8 pl-4 sm:pl-0">
            {/* Vertical Line */}
            <div className="absolute left-[1.35rem] sm:left-6 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

            {examples.map((ex, idx) => (
              <div key={idx} className="relative flex gap-5 items-start">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                   <span className="text-lg font-black text-amber-300 dark:text-amber-900/50 italic">Q</span>
                </div>
                <div className="pt-1">
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">"{ex.q}"</p>
                  <div className="flex gap-2 items-start">
                    <SparklesIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
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
