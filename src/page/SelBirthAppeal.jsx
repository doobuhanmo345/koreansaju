import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { 
  HeartIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  GiftIcon,
  SunIcon
} from '@heroicons/react/24/outline';

export default function SelBirthAppeal() {
  const { language } = useLanguage();

  const features = [
    {
      icon: GiftIcon,
      title: language === 'ko' ? '첫 번째 선물' : 'First Gift',
      desc: language === 'ko' 
        ? '부모가 줄 수 있는 가장 값진 선물은 바로 \'좋은 운명\'입니다. 아이의 평생을 지켜줄 든든한 사주를 찾아주세요.'
        : 'The most valuable gift parents can give is \'Good Destiny\'. Find a strong Saju that will protect child lifetime.'
    },
    {
      icon: SunIcon,
      title: language === 'ko' ? '타고난 잠재력' : 'Innate Potential',
      desc: language === 'ko'
        ? '태어나는 순간 결정되는 오행의 에너지. 학업, 예술, 리더십 등 아이가 가진 재능이 가장 빛날 수 있는 시간을 선별합니다.'
        : 'Five Elements energy determined at birth. We select the time when the child\'s talents like study, art, leadership shine most.'
    },
    {
      icon: HeartIcon,
      title: language === 'ko' ? '가족의 조화' : 'Family Harmony',
      desc: language === 'ko'
        ? '아이 혼자만이 아닌, 부모님과도 조화롭게 어우러지는 날짜를 분석하여 행복한 가정의 기틀을 마련합니다.'
        : 'Analyze dates that harmonize not only for the child alone but also with parents to lay the foundation for happy family.'
    }
  ];

  const examples = [
    {
      q: language === 'ko' ? "제왕절개 날짜, 정말 중요한가요?" : "Is Cesarean date really important?",
      a: language === 'ko' ? "네, 인위적인 출산이라도 아이가 세상의 기운을 처음 마주하는 시각이 곧 사주가 됩니다." : "Yes, even artificial birth, the time child first meets world energy becomes Saju."
    },
    {
      q: language === 'ko' ? "아이가 부자와 결혼했으면 좋겠어요." : "I want my child to marry rich.",
      a: language === 'ko' ? "재물운과 배우자운이 균형 잡힌 명식을 찾아, 풍요롭고 안정적인 삶의 기반을 다져줍니다." : "We find a Saju balanced with wealth and spouse luck to build a foundation for a rich and stable life."
    },
    {
      q: language === 'ko' ? "건강한 아이를 낳고 싶어요." : "I want a healthy baby.",
      a: language === 'ko' ? "체질적으로 약한 오행을 보완하고, 신체 건강과 정신적 안정을 모두 갖춘 날을 최우선으로 고려합니다." : "We prioritize days that supplement weak Five Elements and possess both physical health and mental stability."
    }
  ];

  return (
    <div className="w-full bg-emerald-50/30 dark:bg-slate-900 border-t border-emerald-100 dark:border-slate-800">
      
      {/* 1. Hero */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
            <HeartIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            {language === 'ko' ? (
              <>
                세상에 하나뿐인 아이에게<br/>
                <span className="text-emerald-600 dark:text-emerald-400">최고의 운명</span>을 선물하세요
              </>
            ) : (
              <>
                Gift the <span className="text-emerald-600 dark:text-emerald-400">Best Destiny</span><br/>
                to your one and only child
              </>
            )}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base break-keep">
            {language === 'ko' 
              ? '출산 택일은 미신이 아닌 사랑입니다. 과학적인 사주 분석으로 아이의 밝은 미래를 열어주세요.'
              : 'Birth date selection is love, not superstition. Open a bright future for your child with scientific Saju analysis.'}
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
              {language === 'ko' ? '부모님의 간절한 마음' : "Parents' Earnest Heart"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'ko' ? '그 마음까지 헤아려 신중하게 분석합니다.' : 'We analyze carefully considering even that heart.'}
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
                    <SparklesIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
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
