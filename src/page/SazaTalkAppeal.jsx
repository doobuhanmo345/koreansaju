import React from 'react';
import { useLanguage } from '../context/useLanguageContext';
import { 
  SparklesIcon, 
  UserGroupIcon, 
  ChatBubbleBottomCenterTextIcon, 
  LightBulbIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';

export default function SazaTalkAppeal() {
  const { language } = useLanguage();

  const features = [
    {
      icon: UserGroupIcon,
      title: language === 'ko' ? '27인의 명리학자' : '27 Saju Masters',
      desc: language === 'ko' 
        ? '고전 명리학을 마스터한 27인의 전문가 페르소나가 다각도로 당신의 사주를 분석합니다.'
        : '27 expert personas mastering classical Saju analyze your chart from multiple angles.'
    },
    {
      icon: SparklesIcon,
      title: language === 'ko' ? 'AI 심층 추론' : 'AI Deep Reasoning',
      desc: language === 'ko'
        ? '단순한 통계가 아닌, 복합적인 상호작용을 계산하여 당신만을 위한 고유한 해석을 도출합니다.'
        : 'Beyond statistics, AI calculates complex interactions to derive a unique interpretation just for you.'
    },
    {
      icon: ChatBubbleBottomCenterTextIcon,
      title: language === 'ko' ? '완벽한 개인화' : 'Perfect Personalization',
      desc: language === 'ko'
        ? '당신의 질문 의도를 정확히 파악하고, 그에 딱 맞는 현실적이고 구체적인 조언을 제공합니다.'
        : 'It understands the intent of your question and provides realistic, specific advice tailored to it.'
    }
  ];

  const examples = [
    {
      q: language === 'ko' ? "저랑 안 맞는 직장 상사가 있어요..." : " I have a boss I don't get along with...",
      a: language === 'ko' ? "상사와의 오행 궁합을 분석하여 현명한 대처법을 알려드립니다." : "We analyze the elemental compatibility to suggest wise coping strategies."
    },
    {
      q: language === 'ko' ? "올해 이직운이 있을까요?" : "Is there luck for changing jobs this year?",
      a: language === 'ko' ? "올해의 흐름과 이직에 유리한 구체적인 시기를 짚어드립니다." : "We identify the flow of the year and specific timing favorable for moving."
    },
    {
      q: language === 'ko' ? "짝사랑 하는 그 사람 마음은?" : "What's on my crush's mind?",
      a: language === 'ko' ? "상대방의 기질을 분석하여 공략 포인트와 타이밍을 제안합니다." : "We analyze their temperament to suggest approach points and timing."
    }
  ];

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      
      {/* 1. Hero / Main Value Prop */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-violet-100 dark:bg-violet-900/30 rounded-full mb-4">
            <FingerPrintIcon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            {language === 'ko' ? (
              <>
                <span className="text-violet-600 dark:text-violet-400">27명의 전문가</span>와 함께<br/>
                당신만의 물음에 답합니다
              </>
            ) : (
              <>
                Answering your unique questions<br/>
                with <span className="text-violet-600 dark:text-violet-400">27 Experts</span>
              </>
            )}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base break-keep">
            {language === 'ko' 
              ? '사자톡은 단순한 챗봇이 아닙니다. 수천 년의 데이터를 학습한 AI가 27명의 명리학자 페르소나와 토론하여, 오직 당신만을 위한 최적의 해답을 찾아냅니다.'
              : 'SazaTalk is not just a chatbot. AI trained on millennia of data debates with 27 Saju master personas to find the optimal answer just for you.'}
          </p>
        </div>
      </section>

      {/* 2. Feature Cards */}
      <section className="py-10 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-white dark:bg-slate-700 rounded-xl mb-4 text-violet-500 shadow-sm">
                <item.icon className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">{item.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed break-keep">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Use Cases */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {language === 'ko' ? '무엇을 물어볼까요?' : 'What can I ask?'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'ko' ? '어떤 고민이든 구체적으로 물어보세요.' : 'Ask specifically about any concern.'}
            </p>
          </div>
          
          <div className="space-y-4">
            {examples.map((ex, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex-shrink-0 mt-1">
                  <LightBulbIcon className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">"{ex.q}"</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{ex.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Visual */}
      <section className="py-12 text-center bg-gradient-to-b from-slate-50 to-violet-50/50 dark:from-slate-900 dark:to-violet-900/10">
        <p className="text-xs font-bold text-violet-400 tracking-widest uppercase mb-2">SazaTalk AI</p>
        <p className="text-sm text-slate-400">
           {language === 'ko' ? '당신의 운명을 가장 깊이 이해하는 대화' : 'A conversation that understands your destiny most deeply'}
        </p>
      </section>
    </div>
  );
}
