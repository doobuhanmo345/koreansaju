import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { 
  HeartIcon, 
  SparklesIcon, 
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  FireIcon
} from '@heroicons/react/24/outline';

export default function FirstDateAppeal() {
  const { language } = useLanguage();

  const features = [
    {
      icon: SparklesIcon,
      title: language === 'ko' ? '운명의 첫인상' : 'Destined First Impression',
      desc: language === 'ko' 
        ? '첫 만남 3초가 관계를 결정합니다. 나의 어떤 매력을 보여줘야 상대의 마음을 단번에 사로잡을 수 있는지 알려드립니다.'
        : 'The first 3 seconds determine the relationship. We tell you which charm to show to captivate their heart at once.'
    },
    {
      icon: PuzzlePieceIcon,
      title: language === 'ko' ? '보이지 않는 케미' : 'Invisible Chemistry',
      desc: language === 'ko'
        ? '말로 설명할 수 없는 끌림에는 이유가 있습니다. 두 사람의 오행(Five Elements)이 만들어내는 무의식적 조화를 분석합니다.'
        : 'There is a reason for attraction beyond words. We analyze the unconscious harmony created by the Five Elements of two people.'
    },
    {
      icon: FireIcon,
      title: language === 'ko' ? '애프터 성공 전략' : 'After-Date Strategy',
      desc: language === 'ko'
        ? '만남 이후가 더 중요합니다. 관계를 급격히 발전시킬 수 있는 연락 타이밍과 대화 주제를 구체적으로 제안합니다.'
        : 'After the meeting is more important. We suggest specific contact timing and conversation topics to rapidly develop the relationship.'
    }
  ];

  const examples = [
    {
      q: language === 'ko' ? "무슨 옷을 입고 나갈까요?" : "What should I wear?",
      a: language === 'ko' ? "오늘 나의 도화살을 극대화해 줄 행운의 컬러와 스타일링 팁을 확인하세요." : "Check the lucky color and styling tips to maximize your peach blossom energy today."
    },
    {
      q: language === 'ko' ? "이 사람, 저랑 잘 맞을까요?" : "Is he/she a good match?",
      a: language === 'ko' ? "단 한 번의 만남으로도 알 수 있습니다. 서로의 결핍을 채워주는 인연인지 미리 파악하세요." : "You can know in just one meeting. Find out in advance if it's a relationship that fills each other's voids."
    },
    {
      q: language === 'ko' ? "대화가 끊기면 어떡하죠?" : "What if the conversation stops?",
      a: language === 'ko' ? "상대방의 호기심을 자극하는 대화 주제와 절대 피해야 할 말실수를 짚어드립니다." : "We point out conversation topics that stimulate curiosity and slip of the tongue to absolutely avoid."
    }
  ];

  return (
    <div className="w-full bg-rose-50/30 dark:bg-slate-900 border-t border-rose-100 dark:border-slate-800">
      
      {/* 1. Hero */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full mb-4">
            <HeartIcon className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            {language === 'ko' ? (
              <>
                설레는 첫 만남,<br/>
                <span className="text-rose-600 dark:text-rose-400">운명의 시그널</span>을 읽으세요
              </>
            ) : (
              <>
                Exciting First Date,<br/>
                Read the <span className="text-rose-600 dark:text-rose-400">Signal of Destiny</span>
              </>
            )}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base break-keep">
            {language === 'ko' 
              ? '사랑은 타이밍이고 전략입니다. 사자사주가 당신의 연애 코치가 되어드릴게요.'
              : 'Love is timing and strategy. SazaSaju will be your dating coach.'}
          </p>
        </div>
      </section>

      {/* 2. Features */}
      <section className="py-12 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          
          {/* Decorative connector */}
          <div className="hidden md:block absolute top-[2.25rem] left-16 right-16 h-0.5 bg-gradient-to-r from-transparent via-rose-200 dark:via-rose-800 to-transparent z-0"></div>

          {features.map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              <div className="p-4 bg-rose-50 dark:bg-slate-800 rounded-2xl mb-5 text-rose-500 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-rose-100 dark:border-slate-700">
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
              {language === 'ko' ? '썸에서 연인으로' : 'From fling to lover'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'ko' ? '확실한 그린라이트를 만드는 비법.' : 'Secrets to create a certain green light.'}
            </p>
          </div>
          
          <div className="relative space-y-8 pl-4 sm:pl-0">
            {/* Vertical Line */}
            <div className="absolute left-[1.35rem] sm:left-6 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

            {examples.map((ex, idx) => (
              <div key={idx} className="relative flex gap-5 items-start">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                   <span className="text-lg font-black text-rose-300 dark:text-rose-900/50 italic">Q</span>
                </div>
                <div className="pt-1">
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">"{ex.q}"</p>
                  <div className="flex gap-2 items-start">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
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
