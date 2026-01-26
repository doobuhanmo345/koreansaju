import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { 
  BanknotesIcon, 
  ChartBarIcon, 
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

export default function WealthAppeal() {
  const { language } = useLanguage();

  const features = [
    {
      icon: BanknotesIcon,
      title: language === 'ko' ? '타고난 부의 그릇' : 'Innate Wealth Capacity',
      desc: language === 'ko' 
        ? '평생 모을 수 있는 재산의 규모는 정해져 있을까요? 내 사주에 숨겨진 진짜 부자의 그릇을 확인하세요.'
        : 'Is the scale of lifetime wealth predetermined? Check the true vessel of wealth hidden in your Saju.'
    },
    {
      icon: ChartBarIcon,
      title: language === 'ko' ? '투자의 골든타임' : 'Golden Time for Investment',
      desc: language === 'ko'
        ? '주식, 부동산, 코인... 나에게 맞는 투자처는 따로 있습니다. 재물운이 폭발하는 최적의 시기를 알려드립니다.'
        : 'Stocks, Real Estate, Crypto... There is a right investment for you. We inform you of the optimal time when wealth luck explodes.'
    },
    {
      icon: BuildingLibraryIcon,
      title: language === 'ko' ? '재물 창고 지키기' : 'Guarding Wealth Storage',
      desc: language === 'ko'
        ? '버는 것보다 지키는 것이 중요합니다. 나도 모르게 돈이 새는 구멍을 막고, 자산을 안전하게 불리는 비법을 공개합니다.'
        : 'Keeping is more important than earning. We reveal the secret to plugging money leaks and safely growing assets.'
    }
  ];

  const examples = [
    {
      q: language === 'ko' ? "저는 언제 부자가 될까요?" : "When will I be rich?",
      a: language === 'ko' ? "대운(10-year luck)이 들어오는 시점을 정확히 파악하여 인생 역전의 기회를 선점하세요." : "Identify exactly when the Great Luck comes in and preempt the opportunity for life turnaround."
    },
    {
      q: language === 'ko' ? "사업을 해도 될까요?" : "Can I start a business?",
      a: language === 'ko' ? "직장 생활이 맞는 사주와 내 사업을 해야 대성하는 사주는 다릅니다. 당신의 성향을 명쾌하게 분석합니다." : "Saju suited for jobs and Saju for business success are different. We clearly analyze your propensity."
    },
    {
      q: language === 'ko' ? "주식으로 돈을 잃었어요." : "I lost money on stocks.",
      a: language === 'ko' ? "투자 성향과 맞지 않는 방법일 수 있습니다. 손실을 줄이고 수익을 극대화하는 나만의 재테크 전략을 찾으세요." : "It might be a method not suiting your investment style. Find your own strategy to minimize loss and maximize profit."
    }
  ];

  return (
    <div className="w-full bg-amber-50/30 dark:bg-slate-900 border-t border-amber-100 dark:border-slate-800">
      
      {/* 1. Hero */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
            <CurrencyDollarIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            {language === 'ko' ? (
              <>
                돈이 따르는 사람의<br/>
                <span className="text-amber-600 dark:text-amber-400">부자 본능</span>을 깨우세요
              </>
            ) : (
              <>
                Awaken the <span className="text-amber-600 dark:text-amber-400">Rich Instinct</span><br/>
                of those whom money follows
              </>
            )}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base break-keep">
            {language === 'ko' 
              ? '재물운은 흐름입니다. 다가오는 기회를 잡고, 불안한 미래를 확실한 성공으로 바꾸는 로드맵을 제시합니다.'
              : 'Wealth luck is a flow. We present a roadmap to seize coming opportunities and turn uncertain future into certain success.'}
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
              {language === 'ko' ? '경제적 자유를 꿈꾼다면' : 'Dreaming of Financial Freedom'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'ko' ? '막연한 기대가 아닌, 명확한 데이터로 준비하세요.' : 'Prepare with clear data, not vague expectations.'}
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
                    <ScaleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
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
