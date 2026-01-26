import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { 
  PuzzlePieceIcon, 
  HeartIcon, 
  FireIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function MatchAppeal() {
  const { language } = useLanguage();

  const features = [
    {
      icon: PuzzlePieceIcon,
      title: language === 'ko' ? '정밀한 궁합 분석' : 'Precise Match Analysis',
      desc: language === 'ko' 
        ? '단순히 겉궁합만 보지 않습니다. 속궁합, 가치관, 오행의 상생상극까지 입체적으로 분석합니다.'
        : 'Not just surface compatibility. We analyze inner compatibility, values, and Five Elements interaction 3-dimensionally.'
    },
    {
      icon: FireIcon,
      title: language === 'ko' ? '케미스트리 지수' : 'Chemistry Index',
      desc: language === 'ko'
        ? '설렘의 유효기간은 언제까지일까요? 두 사람의 열정이 언제 가장 뜨거울지, 권태기는 어떻게 극복할지 알려드립니다.'
        : 'How long does the excitement last? We tell you when passion peaks and how to overcome boredom.'
    },
    {
      icon: ShieldCheckIcon,
      title: language === 'ko' ? '현실적 조언' : 'Realistic Advice',
      desc: language === 'ko'
        ? '모든 관계에는 갈등이 있습니다. 서로의 타고난 기질 차이를 이해하고, 싸우지 않고 맞춰가는 지혜를 드립니다.'
        : 'Every relationship has conflict. We give wisdom to understand innate differences and harmonize without fighting.'
    }
  ];

  const examples = [
    {
      q: language === 'ko' ? "우리는 결혼할 인연인가요?" : "Are we destined to marry?",
      a: language === 'ko' ? "배우자 자리에 서로가 들어와 있는지, 결혼 후 운세가 상승하는지 냉철하게 판단해 드립니다." : "We objectively judge if you are in each other's spouse palace and if luck improves after marriage."
    },
    {
      q: language === 'ko' ? "그 사람이 저를 좋아하나요?" : "Does he/she like me?",
      a: language === 'ko' ? "상대방의 사주에 나타나는 이성운의 흐름과 당신을 향한 숨겨진 마음의 시그널을 읽어드립니다." : "We read the flow of romance luck in their Saju and hidden signals of their heart towards you."
    },
    {
      q: language === 'ko' ? "동업해도 될까요?" : "Can we do business together?",
      a: language === 'ko' ? "비즈니스 파트너로서 서로의 부족한 점을 채워주는 귀인인지, 아니면 재물을 깨뜨리는 악연인지 확인하세요." : "Check if you are benefactors filling each other's gaps or ill-fated relations breaking wealth."
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
                흔들리지 않는 관계의 답,<br/>
                <span className="text-rose-600 dark:text-rose-400">운명의 파트너</span>를 찾으세요
              </>
            ) : (
              <>
                Answer to Unshakable Relationship,<br/>
                Find your <span className="text-rose-600 dark:text-rose-400">Destined Partner</span>
              </>
            )}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base break-keep">
            {language === 'ko' 
              ? '사랑도 비즈니스도 궁합이 중요합니다. 서로의 다름을 이해할 때, 관계는 더욱 깊어집니다.'
              : 'Match is important for love and business. When accepting differences, relationships deepen.'}
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
              {language === 'ko' ? '어떤 관계가 고민인가요?' : 'What Relationship Worries You?'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'ko' ? '연인, 친구, 동료... 모든 인연의 해답을 드립니다.' : 'Lover, friend, colleague... We give answers to all connections.'}
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
                    <SparklesIcon className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
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
