import React from 'react';
import { useLanguage } from '../../context/useLanguageContext';
import ReportHid from '../ReportHid';
import AnalyzeButton from '../AnalyzeButton';

export default function InterviewPreview({ onStart, isDisabled, userData, selections, selectedDate }) {
  const { language } = useLanguage();

  return (
    <div className="mt-16 text-left">
      <div className="mx-4 my-10 flex flex-col items-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50/50 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[11px] font-bold text-blue-600 tracking-tight uppercase">
            Preview Mode
          </span>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {language === 'ko' ? '전략적 합격 리포트 미리보기' : 'Strategic Pass Report Preview'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
            {language === 'ko'
              ? '성공적인 인터뷰를 위해 사자가 읽어낸 기운과 필승의 바이브를 엿보세요'
              : 'Peek into the energy and winning vibe read by Saza for your success'}
          </p>
        </div>
      </div>

      <div className="sjsj-report-container !mx-0 !p-0 bg-transparent text-left">
        <div className="sjsj-content-inner !p-0">
          {/* Profile Card Mockup */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-slate-100 dark:border-slate-800">
              <span className="text-xl font-black text-slate-800 dark:text-white">{userData?.displayName}</span>
              <span className="text-[9px] bg-slate-900 text-white px-3 py-1 rounded-full font-black">CANDIDATE</span>
            </div>
            <div className="space-y-3 opacity-50">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">TARGET</span>
                <span className="font-bold">{selections.category || 'Interview'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">DATE</span>
                <span className="font-bold">{selectedDate ? new Date(selectedDate).toLocaleDateString() : '2026.01.26'}</span>
              </div>
            </div>
          </div>

          {/* 01. Vibe Strategy */}
          <section className="relative sjsj-section !p-0 !mb-8 overflow-hidden">
            <div className="p-6 select-none pointer-events-none opacity-40 grayscale">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                <h2 className="text-lg font-black text-slate-800 dark:text-white">
                  {language === 'ko' ? '01. 합격 바이브 전략' : '01. Vibe Strategy'}
                </h2>
              </div>

              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-bold text-blue-500 block mb-1">MOOD</span>
                  <span className="text-sm font-black">{language === 'ko' ? '"지적인 성실함"' : '"Intellectual Sincerity"'}</span>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-bold text-blue-500 block mb-1">KEY POINT</span>
                  <span className="text-sm font-black">{language === 'ko' ? '첫 질문의 속도' : 'Speed of first reply'}</span>
                </div>
              </div>
              <p className="rt-card__text">
                {language === 'ko' 
                  ? '오늘은 평소보다 조금 더 차분한 목소리로 신뢰감을 주는 것이 가장 중요한 포인트입니다. 상대방의 질문에 즉각적으로 답하기보다 1~2초 정도...' 
                  : 'Today, the most important point is to convey trust with a slightly calmer voice than usual. Rather than answering immediately...'}
              </p>
            </div>
            <ReportHid
              gradientColor="#DBEAFE"
              themeColor="#3B82F6"
              badge={['1', language === 'ko' ? '바이브' : 'Vibe']}
              title={language === 'ko' ? <>합격을 부르는 <span className="text-blue-500">필승의 이미지</span></> : <>The <span className="text-blue-500">Winning Image</span> for Pass</>}
              des={language === 'ko' ? '면접관의 마음을 사로잡을 당신만의 고유한 아우라를 정의해드립니다.' : 'Defines your unique aura that will captivate the interviewer’s heart.'}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 02. Success Index */}
          <section className="relative sjsj-section !p-0 !mb-8 overflow-hidden">
            <div className="p-6 select-none pointer-events-none opacity-40 grayscale">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                <h2 className="text-lg font-black text-slate-800 dark:text-white">
                  {language === 'ko' ? '02. 면접 합격 지수' : '02. Success Index'}
                </h2>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-black text-blue-600">82%</div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '82%' }}></div>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                {language === 'ko' ? '당신의 에너지와 오늘의 기운이 강력한 시너지를 내고 있습니다.' : 'Your energy and today\'s energy are creating powerful synergy.'}
              </p>
            </div>
            <ReportHid
              gradientColor="#DBEAFE"
              themeColor="#3B82F6"
              badge={['2', language === 'ko' ? '확률' : 'Probability']}
              title={language === 'ko' ? <>데이터로 증명된 <span className="text-blue-500">합격 가능성</span></> : <>The <span className="text-blue-500">Pass Probability</span> Proven by Data</>}
              des={language === 'ko' ? '객관적인 지표와 흐름 분석을 통해 당신의 성공 가능성을 예측합니다.' : 'Predicts your success probability through objective indicators and flow analysis.'}
              hClass="h-[500px]"
              mClass="mt-[-250px]"
            />
          </section>
        </div>
      </div>
      <div className="mt-8 mb-12">
        <AnalyzeButton
          onClick={onStart}
          loading={false}
          isDone={false}
          disabled={isDisabled}
          label={language === 'ko' ? '면접/시험 분석 받기' : 'Get Analysis Analysis'}
          color='blue'
        />  
      </div>
    </div>
  );
}
