import React from 'react';
import { useLanguage } from '../../context/useLanguageContext';
import ReportHid from '../ReportHid';
import AnalyzeButton from '../AnalyzeButton';

export default function SelDatePreview({ onStart, isDisabled }) {
  const { language } = useLanguage();

  return (
    <>
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
              {language === 'ko' ? '운이 따르는 최고의 순간을 미리 확인하세요' : "Preview the Universe's Best Timing"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
              {language === 'ko'
                ? '선별된 길일과 그에 따른 핵심 조언이 포함된 상세 리포트를 제공합니다'
                : 'Get a detailed report with selected lucky dates and core advice for your success'}
            </p>
          </div>
        </div>

        <div className="sjsj-report-container !mx-0 !p-0 bg-transparent">
          <div className="sjsj-content-inner !p-0">
            {/* 1. Purpose & Flow Section */}
            <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
              <div className="px-6 pt-6 opacity-40 grayscale contrast-75 select-none pointer-events-none">
                <div className="sjsj-section-label">
                  <h2 className="sjsj-subTitle">{language === 'ko' ? '01. 길일 선정 정보' : '01. Purpose & Flow'}</h2>
                </div>
                <div className="sjsj-analysis-box mb-6">
                  <div className="sjsj-keyword-grid">
                    <div className="sjsj-keyword-col">
                      <div className="sjsj-col-title text-emerald-600">PURPOSE</div>
                      <ul className="sjsj-list">
                        <li>{language === 'ko' ? '이사/이전' : 'Moving'}</li>
                      </ul>
                    </div>
                    <div className="sjsj-keyword-col">
                      <div className="sjsj-col-title text-emerald-600">KEYWORD</div>
                      <ul className="sjsj-list">
                        <li>{language === 'ko' ? '#새로운시작 #안정형성 #재물운상승' : '#NewBeginning #Stability #Wealth'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="sjsj-long-text">
                  {language === 'ko' 
                    ? '당신의 사주에 흐르는 목(Wood)의 기운과 상생하는 날짜를 분석하여, 새로운 터전에서 번영과 안정을 누릴 수 있는 최적의 시기를 도출했습니다. 특히 오전에 이동을 완료하는 것이...' 
                    : 'By analyzing dates that harmonize with the Wood energy in your fate, we have derived the optimal timing for prosperity and stability in your new home. Especially moving in the morning...'}
                </p>
              </div>
              <ReportHid
                gradientColor="#ECFDF5"
                themeColor="#10B981"
                badge={['1', language === 'ko' ? '정보' : 'Info']}
                title={language === 'ko' ? <>중요한 시작을 기록하는 <span className="text-emerald-500">운명의 키워드</span></> : <>The <span className="text-emerald-500">Destiny Keyword</span> for Your Start</>}
                des={language === 'ko' ? '당신이 선택한 목적에 딱 맞는 기운의 흐름과 핵심 테마를 분석해 드립니다.' : 'Analyzes the energy flow and core themes that perfectly match your chosen purpose.'}
                hClass="h-[600px]"
                mClass="mt-[-300px]"
              />
            </section>

            {/* 2. Top Recommendations Section */}
            <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
              <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale">
                <div className="sjsj-section-label">
                  <h2 className="sjsj-subTitle">{language === 'ko' ? '02. 최적의 날짜 추천' : '02. Top Recommendations'}</h2>
                </div>
                <div className="space-y-4 mb-6">
                  {[
                    { 
                      date: '2026.02.14', 
                      rank: 'Top 1', 
                      why: language === 'ko' ? '청룡의 기운이 머무는 날로, 문서 계약과 이동에 매우 유리한 시기입니다.' : 'A day where the Blue Dragon energy stays, very favorable for contracts and moving.',
                      tip: language === 'ko' ? '오전 9시에서 11시 사이에 현관문을 처음 여는 것이 좋습니다.' : 'It is best to open the front door for the first time between 9 and 11 AM.'
                    },
                    { 
                      date: '2026.02.26', 
                      rank: 'Top 2', 
                      why: language === 'ko' ? '재물운이 합을 이루어 금전적 성취와 자산 가치 상승이 기대되는 길일입니다.' : 'A lucky day where wealth energy aligns, bringing financial achievement and asset growth.',
                      tip: language === 'ko' ? '남쪽 방향으로 먼저 발걸음을 옮기면 더욱 좋은 기운을 받습니다.' : 'You will receive better energy if you first step towards the South.'
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
                        <span className="font-bold text-emerald-500 mr-2">Why?</span>
                        {item.why}
                      </p>
                      <p className="text-[10px] text-slate-400 italic">
                        <span className="font-bold text-emerald-400 mr-1">Tip</span>
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
                title={language === 'ko' ? <>당신을 위해 선별된 <span className="text-emerald-500">최상의 길일</span></> : <>The <span className="text-emerald-500">Best Dates</span> Selected for You</>}
                des={language === 'ko' ? '선별된 날짜별 특징과 당신에게 가장 유리한 실천 팁을 정밀하게 제안합니다.' : 'Suggests features of each selected date and the most favorable practical tips for you.'}
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
                    ? '이 기간에는 기운이 충돌하거나 흉성이 작용하여 예기치 못한 차질이 생길 수 있으니 가급적 중요한 결정을 미루는 것이 좋습니다.' 
                    : 'During this period, energy may clash or negative stars may act, causing unexpected setbacks, so it is better to postpone important decisions.'}
                </div>
                <div className="rt-tip-box !border-red-100 !bg-transparent p-0">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === 'ko' 
                      ? '특히 4월 중순은 주변 사람들과의 마찰이 예상되니, 감정적인 선택보다는 이성적인 판단이 필요한 시기입니다...' 
                      : 'Especially mid-April expects friction with those around you, a time requiring rational judgment rather than emotional choices...'}
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
            disabled={isDisabled}
            loading={false}
            isDone={false}
            label={language === 'ko' ? '좋은 날짜 받기' : 'Find Best Dates'}
            color='emerald'
          />
        </div>
      </div>
    </>
  );
}
