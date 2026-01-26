import React from 'react';
import { useLanguage } from '../../context/useLanguageContext';
import ReportHid from '../ReportHid';
import AnalyzeButton from '../AnalyzeButton';

export default function FirstDatePreview({ onStart, isDisabled }) {
  const { language } = useLanguage();

  return (
    <div className="mt-16 text-left">
      <div className="mx-4 my-10 flex flex-col items-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-rose-200 bg-rose-50/50 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="text-[11px] font-bold text-rose-600 tracking-tight uppercase">
            Preview Mode
          </span>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {language === 'ko' ? '사자가 준비한 완벽한 데이트 플랜' : "A Perfect Date Plan by Saza"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
            {language === 'ko'
              ? '상대에게 잊히지 않을 첫인상을 남기는 비법과 성공적인 애프터를 위한 인사이트를 미리 확인하세요'
              : 'Get the secret to leaving an unforgettable impression and insights for a successful after-date'}
          </p>
        </div>
      </div>

      <div className="sjsj-report-container !mx-0 !p-0 bg-transparent">
        <div className="sjsj-content-inner !p-0">
          {/* 1. Vibe & OOTD Section */}
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
            <div className="px-6 pt-6 opacity-40 grayscale contrast-75 select-none pointer-events-none">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '01. 맞춤 OOTD 전략' : '01. Vibe & OOTD'}</h2>
              </div>
              <div className="sjsj-analysis-box mb-6">
                <div className="sjsj-keyword-grid">
                  <div className="sjsj-keyword-col">
                    <div className="sjsj-col-title text-rose-600">MOOD</div>
                    <ul className="sjsj-list">
                      <li>{language === 'ko' ? '"세련된 지성미"' : '"Sophisticated Intellect"'}</li>
                    </ul>
                  </div>
                  <div className="sjsj-keyword-col">
                    <div className="sjsj-col-title text-rose-600">POINT</div>
                    <ul className="sjsj-list">
                      <li>{language === 'ko' ? '실버 액세서리' : 'Silver Accessory'}</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p className="sjsj-long-text">
                {language === 'ko' 
                  ? '당신의 오늘은 부드러움보다는 차분하고 이성적인 매력이 돋보이는 날입니다. 셔츠나 블라우스에 심플한 시계를 매치하여 전문적인 느낌을...' 
                  : "Your charm today is more calm and rational than soft. Match a shirt or blouse with a simple watch to give a professional feel..."}
              </p>
            </div>
            <ReportHid
              themeColor="#F43F5E"
              badge={['1', language === 'ko' ? '전략' : 'Strategy']}
              title={language === 'ko' ? <>상대를 사로잡는 <span className="text-rose-500">첫인상의 마법</span></> : <>The <span className="text-rose-500">Magic of First Impression</span> to Captivate</>}
              des={language === 'ko' ? '당신의 에너지와 가장 잘 어울리는 무드와 디테일한 스타일링 포인트를 제안합니다.' : 'Suggests the mood and detailed styling points that best match your energy.'}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 2. Psychological Insights Section */}
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
            <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '02. 관계 심리 리딩' : '02. Psychology'}</h2>
              </div>
              <div className="space-y-4 mb-6">
                {[
                  { 
                    label: language === 'ko' ? '상대의 첫 마음' : "Partner's Mind", 
                    val: language === 'ko' ? '당신의 예의 바르고 배려심 넘치는 모습에 안도하면서도, 호기심을 느끼고 있습니다.' : 'Relieved by your polite and caring manner, yet feeling curious.'
                  },
                  { 
                    label: language === 'ko' ? '대화 매너' : 'Talk Tip', 
                    val: language === 'ko' ? '최근 본 영화나 가벼운 취미 이야기로 화제를 전환하면 훨씬 자연스러운 대화가 가능합니다.' : 'Switching to light hobbies or recent movies will make the conversation much more natural.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-rose-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                    <span className="text-[10px] font-black text-rose-500 uppercase mb-1 block tracking-wider">{item.label}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <ReportHid
              themeColor="#F43F5E"
              badge={['2', language === 'ko' ? '심리' : 'Psychology']}
              title={language === 'ko' ? <>말하지 않아도 통하는 <span className="text-rose-500">심리 공략</span></> : <>The <span className="text-rose-500">Psychology Strategy</span> Connecting without Words</>}
              des={language === 'ko' ? '상대방의 마음을 편안하게 열고 깊은 교감을 이끌어내는 대화의 기술을 알려드립니다.' : 'Teaches conversation skills to open the partner’s heart comfortably and lead deep connection.'}
              hClass="h-[500px]"
              mClass="mt-[-250px]"
            />
          </section>
        </div>
      </div>
        {/* Bottom Button for good measure */}
       <div className="mt-8 mb-12">
        <AnalyzeButton
          onClick={onStart}
          disabled={isDisabled}
          loading={false}
          isDone={false}
          label={language === 'ko' ? '첫 만남 가이드 받기' : 'Get Date Guide'}
          color='rose'
        />  
      </div>
    </div>
  );
}
