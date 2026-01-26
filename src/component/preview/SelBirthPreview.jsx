import React from 'react';
import { useLanguage } from '../../context/useLanguageContext';
import ReportHid from '../ReportHid';
import AnalyzeButton from '../AnalyzeButton';

export default function SelBirthPreview({ onStart, isDisabled }) {
  const { language } = useLanguage();

  return (
    <div className="mt-16 text-left">
      <div className="mx-4 my-10 flex flex-col items-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50/50 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-emerald-600 tracking-tight uppercase">
            Preview Mode
          </span>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {language === 'ko' ? '아이에게 주는 첫 번째 명품 선물' : "The First Premium Gift for Your Baby"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
            {language === 'ko'
              ? '축복받은 운명의 기운을 담은 최적의 출산일과 상세 분석 리포트를 확인하세요'
              : 'Check the optimal birth dates with blessed destiny energy and a detailed analysis report'}
          </p>
        </div>
      </div>

      <div className="sjsj-report-container !mx-0 !p-0 bg-transparent">
        <div className="sjsj-content-inner !p-0">
          {/* 1. Destiny Overview Section */}
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
            <div className="px-6 pt-6 opacity-40 grayscale contrast-75 select-none pointer-events-none">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '01. 아이의 운명 개요' : '01. Destiny Overview'}</h2>
              </div>
              <div className="sjsj-analysis-box mb-6">
                <div className="sjsj-keyword-grid">
                  <div className="sjsj-keyword-col">
                    <div className="sjsj-col-title text-emerald-600">FOCUS</div>
                    <ul className="sjsj-list">
                      <li>{language === 'ko' ? '건강/재물/명예' : 'Health/Wealth/Honor'}</li>
                    </ul>
                  </div>
                  <div className="sjsj-keyword-col">
                    <div className="sjsj-col-title text-emerald-600">KEYWORD</div>
                    <ul className="sjsj-list">
                      <li>{language === 'ko' ? '#천부적재능 #리더십 #대기만성' : '#Talent #Leadership #Success'}</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p className="sjsj-long-text">
                {language === 'ko' 
                  ? '태어날 아이의 사주에 흐르는 강한 금(Metal)의 기운은 변치 않는 의지와 결단력을 상징합니다. 부모님의 기운과 조화를 이루어 대인관계에서 신뢰를 얻고...' 
                  : "The strong Metal energy in your baby's destiny symbolizes unchanging will and determination. It harmonizes with the parents' energy to gain trust in relationships..."}
              </p>
            </div>
            <ReportHid
              gradientColor="#ECFDF5"
              themeColor="#10B981"
              badge={['1', language === 'ko' ? '개요' : 'Overview']}
              title={language === 'ko' ? <>아이의 미래를 그리는 <span className="text-emerald-500">운명의 지도</span></> : <>The <span className="text-emerald-500">Map of Destiny</span> for Baby's Future</>}
              des={language === 'ko' ? '아이의 타고난 기질과 잠재력을 명리학적으로 분석하여 핵심 테마를 제시합니다.' : "Provides core themes by analyzing the baby's innate temperament and potential through Sajuology."}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 2. Recommended Birth Dates Section */}
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
            <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '02. 추천 출산일 Best' : '02. Recommended Dates'}</h2>
              </div>
              <div className="space-y-4 mb-6">
                {[
                  { 
                    date: '2026.05.12', 
                    rank: 'Top 1', 
                    why: language === 'ko' ? '식신생재격의 귀한 명조로, 평생 의식주가 풍족하고 재능을 발휘하기 좋은 날입니다.' : 'A precious destiny of financial flow, ensuring lifelong abundance and great talent expression.',
                    tip: language === 'ko' ? '이 날 태어난 아이는 창의적 활동을 통해 자아를 실현하는 힘이 강합니다.' : 'A child born on this day has a strong power to realize self through creative activities.'
                  },
                  { 
                    date: '2026.05.18', 
                    rank: 'Top 2', 
                    why: language === 'ko' ? '관인상생의 기운이 뚜렷하여 학문적 성취와 사회적 명예를 얻기에 매우 유리합니다.' : 'Clear academic and social honor energy, very favorable for matching success and fame.',
                    tip: language === 'ko' ? '안정적인 환경에서 교육적 지원을 아끼지 않는 것이 성장에 큰 도움이 됩니다.' : 'Unsparing educational support in a stable environment will greatly help growth.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-emerald-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-black text-emerald-600">{item.date}</span>
                      <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-600 text-white rounded-full uppercase tracking-wider">
                        {item.rank}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-1">
                      <span className="font-bold text-emerald-500 mr-2">{language === 'ko' ? '사주 분석' : 'Analysis'}</span>
                      {item.why}
                    </p>
                    <p className="text-[10px] text-slate-400 italic">
                      <span className="font-bold text-emerald-400 mr-1">Future</span>
                      {item.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <ReportHid
              gradientColor="#ECFDF5"
              themeColor="#10B981"
              badge={['2', language === 'ko' ? '추천' : 'Best']}
              title={language === 'ko' ? <>축복 속에 선별된 <span className="text-emerald-500">최상의 출산일</span></> : <>The <span className="text-emerald-500">Best Dates</span> Selected in Blessing</>}
              des={language === 'ko' ? '부모님의 사주와 합을 이루며 아이의 운그릇을 극대화하는 날짜를 제안합니다.' : "Suggests dates that align with the parents' Saju and maximize the baby's destiny potential."}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 3. Dates to Avoid Section */}
          <section className="relative sjsj-section !p-0 !mb-8 overflow-hidden">
            <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '03. 피해야 할 시기' : '03. Dates to Avoid'}</h2>
              </div>
              <div className="sjsj-info-banner !bg-red-50 !text-red-700 !border-red-100 mb-6">
                {language === 'ko' 
                  ? '이 시기는 부모님과 아이의 기운이 서로 충돌하거나, 일간이 지나치게 신약해질 우려가 있어 신중한 검토가 필요합니다.' 
                  : "During this period, energies may clash or the child's self-energy may become too weak, requiring careful review."}
              </div>
              <div className="rt-tip-box !border-red-100 !bg-transparent p-0">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'ko' 
                    ? '특히 이 기간의 특정 시간대는 오행의 균형이 깨지기 쉬워 정서적 불안함을 초래할 수 있으니...' 
                    : "Especially certain times during this period can easily break the balance of five elements, leading to emotional instability..."}
                </p>
              </div>
            </div>
            <ReportHid
              gradientColor="#ECFDF5"
              themeColor="#10B981"
              badge={['3', language === 'ko' ? '주의' : 'Caution']}
              title={language === 'ko' ? <>리스크를 최소화하는 <span className="text-red-500">신중한 선택</span></> : <>A <span className="text-red-500">Prudent Choice</span> to Minimize Risk</>}
              des={language === 'ko' ? '흉운이 겹치는 기간을 미리 파악하여 불필요한 시행착오와 손실을 예방해 드립니다.' : 'Identify overlapping periods of bad luck in advance to prevent unnecessary trial and error.'}
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
          loading={false}
          isDone={false}
          disabled={isDisabled}
          label={language === 'ko' ? '좋은 날짜 받기' : 'Find Best Dates'}
          color='emerald'
        />  
      </div>
    </div>
  );
}
