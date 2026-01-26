import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { 
  BriefcaseIcon, 
  TrophyIcon, 
  BoltIcon,
  ChatBubbleBottomCenterTextIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function InterviewAppeal() {
  const { language } = useLanguage();

  const features = [
    {
      icon: BoltIcon,
      title: language === 'ko' ? '승부의 골든타임' : 'Golden Time for Battle',
      desc: language === 'ko' 
        ? '면접관의 마음이 열리는 시간은 정해져 있습니다. 나의 기운이 가장 강력해지는 최적의 타이밍을 선점하세요.'
        : 'The time when interviewer\'s heart opens is set. Preempt the optimal timing when your energy becomes strongest.'
    },
    {
      icon: UserCircleIcon,
      title: language === 'ko' ? '합격 이미지 메이킹' : 'Pass Image Making',
      desc: language === 'ko'
        ? '겸손함이 필요할 때와 자신감이 필요할 때는 다릅니다. 오늘의 운세 맞춤형 태도와 스타일링 전략을 제안합니다.'
        : 'It is different when humility is needed and when confidence is needed. We suggest attitude and styling strategy tailored to today\'s fortune.'
    },
    {
      icon: TrophyIcon,
      title: language === 'ko' ? '돌발 상황 방어' : 'Defend Surprise Situation',
      desc: language === 'ko'
        ? '예상치 못한 압박 질문에도 흔들리지 않는 멘탈 관리법과 위기를 기회로 바꾸는 사주적 팁을 드립니다.'
        : 'We give mental management methods not to be shaken by unexpected pressure questions and Saju advice to turn crisis into opportunity.'
    }
  ];

  const examples = [
    {
      q: language === 'ko' ? "면접 복장, 정장이 답일까요?" : "Interview attire, is suit the answer?",
      a: language === 'ko' ? "회사의 분위기와 나의 관운(Job Luck)을 높여줄 행운의 아이템을 매치하면 신뢰도가 급상승합니다." : "Matching lucky items tailored to company atmosphere and your job luck boosts reliability."
    },
    {
      q: language === 'ko' ? "긴장을 너무 많이 해요." : "I get too nervous.",
      a: language === 'ko' ? "긴장은 기운의 불균형에서 옵니다. 마음을 차분하게 가라앉히는 호흡법과 마인드셋을 알려드립니다." : "Nervousness comes from energy imbalance. We teach breathing methods and mindsets to calm your mind."
    },
    {
      q: language === 'ko' ? "합격할 수 있을까요?" : "Can I pass?",
      a: language === 'ko' ? "합격 확률을 높이는 구체적인 행동 지침과 마음가짐을 통해 불안을 확신으로 바꿔드립니다." : "We turn anxiety into certainty through concrete action guidelines and mindsets that increase pass probability."
    }
  ];

  return (
    <div className="w-full bg-blue-50/30 dark:bg-slate-900 border-t border-blue-100 dark:border-slate-800">
      
      {/* 1. Hero */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <BriefcaseIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            {language === 'ko' ? (
              <>
                준비된 인재의 마지막 한 수,<br/>
                <span className="text-blue-600 dark:text-blue-400">합격의 운</span>을 잡으세요
              </>
            ) : (
              <>
                The Final Move of Prepared Talent,<br/>
                Seize the <span className="text-blue-600 dark:text-blue-400">Luck of Pass</span>
              </>
            )}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base break-keep">
            {language === 'ko' 
              ? '실력은 기본, 운은 필수입니다. 결정적인 순간, 보이지 않는 기운까지 내 편으로 만드세요.'
              : 'Skill is basic, luck is essential. Make even invisible energy your side at the decisive moment.'}
          </p>
        </div>
      </section>

      {/* 2. Features */}
      <section className="py-12 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          
          {/* Decorative connector */}
          <div className="hidden md:block absolute top-[2.25rem] left-16 right-16 h-0.5 bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-800 to-transparent z-0"></div>

          {features.map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-2xl mb-5 text-blue-500 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-blue-100 dark:border-slate-700">
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
              {language === 'ko' ? '면접관을 내 편으로' : 'Make Interviewer My Side'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'ko' ? '짧은 시간에 강렬한 신뢰를 주는 법.' : 'How to give intense trust in a short time.'}
            </p>
          </div>
          
          <div className="relative space-y-8 pl-4 sm:pl-0">
            {/* Vertical Line */}
            <div className="absolute left-[1.35rem] sm:left-6 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

            {examples.map((ex, idx) => (
              <div key={idx} className="relative flex gap-5 items-start">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                   <span className="text-lg font-black text-blue-300 dark:text-blue-900/50 italic">Q</span>
                </div>
                <div className="pt-1">
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">"{ex.q}"</p>
                  <div className="flex gap-2 items-start">
                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
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
