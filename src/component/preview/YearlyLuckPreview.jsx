import React from 'react';
import { useLanguage } from '../../context/useLanguageContext';
import ReportHid from '../ReportHid';
import AnalyzeButton from '../AnalyzeButton';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { reportStyleBlue } from '../../data/aiResultConstants';

export default function YearlyLuckPreview({ onStart, isDisabled, isDisabled2, loading, isDone, isLocked }) {
  const { language } = useLanguage();

  return (
    <div className="mt-16 text-left">
        <style>{reportStyleBlue}</style>
        <div className="mx-4 my-10 flex flex-col items-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-red-200 bg-red-50/50 mb-3">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[11px] font-bold text-red-600 tracking-tight uppercase">
                Preview Mode
            </span>
            </div>

            <div className="text-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {language === 'ko' ? '2026년 운세 미리보기' : "2026 Fortune Preview"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
                {language === 'ko'
                ? '당신의 2026년을 위한 핵심 테마와 주의해야 할 시기를 미리 확인하세요'
                : 'Preview key themes and caution periods for your 2026'}
            </p>
            </div>
        </div>

      <div className="sjsj-report-container !mx-0 !p-0 bg-transparent">
        <div className="sjsj-content-inner !p-0">
          
          {/* 1. Overview Section */}
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
            <div className="px-6 pt-6 opacity-40 grayscale contrast-75 select-none pointer-events-none">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '2026년 총운' : '2026 Overview'}</h2>
              </div>
              <div className="sjsj-quote-box mb-6 border-l-4 border-red-500 bg-red-50 p-4">
                <p className="font-serif italic text-lg text-slate-700 leading-relaxed">
                  {language === 'ko' 
                    ? '"붉은 말의 해, 당신은 질주하는 에너지와 마주하게 됩니다."' 
                    : '"Year of the Red Horse, you will encounter galloping energy."'}
                </p>
              </div>
              <p className="sjsj-long-text text-sm text-slate-600 leading-relaxed">
                {language === 'ko'
                  ? '올해는 변화와 역동성이 공존하는 시기입니다. 당신의 사주에 흐르는 기운이 세운(Yearly Luck)과 만나 폭발적인 시너지를 낼 수 있는 잠재력을 가지고 있습니다...'
                  : 'This year is a time where change and dynamism coexist. The energy flowing in your Saju meets the Yearly Luck to create explosive synergy potential...'}
              </p>
            </div>
            <ReportHid
              gradientColor="#FEF2F2"
              themeColor="#EF4444"
              badge={['1', language === 'ko' ? '총운' : 'Overview']}
              title={language === 'ko' ? <>2026년 당신을 기다리는 <span className="text-red-500">운명의 파도</span></> : <>The <span className="text-red-500">Wave of Destiny</span> Awaiting You in 2026</>}
              des={language === 'ko' ? '한 해의 전체적인 흐름과 분위기를 읽어내어 다가올 미래를 조망합니다.' : 'Reads the overall flow and atmosphere of the year to overlook the coming future.'}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 2. Key Keywords Section */}
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
            <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '올해의 핵심 키워드' : 'Keywords of the Year'}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['도전 (Challenge)', '성취 (Achievement)', '이동 (Movement)', '인연 (Relationship)'].map((kw, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-sm">
                    <span className="text-sm font-bold text-slate-700">{kw}</span>
                  </div>
                ))}
              </div>
              <div className="sjsj-analysis-box bg-slate-50 p-4 rounded-xl">
                 <p className="text-xs text-slate-500 leading-relaxed">
                   {language === 'ko' 
                     ? '이 키워드들은 당신의 한 해를 관통하는 핵심 주제가 될 것입니다. 각 키워드가 당신의 삶에서 어떤 구체적인 현상으로 나타날지...'
                     : 'These keywords will be the core themes penetrating your year. How each keyword will manifest as specific phenomena in your life...'}
                 </p>
              </div>
            </div>
            <ReportHid
              gradientColor="#FEF2F2"
              themeColor="#EF4444"
              badge={['2', language === 'ko' ? '키워드' : 'Keywords']}
              title={language === 'ko' ? <>미리 보는 올해의 <span className="text-red-500">핵심 이슈</span></> : <>Preview of This Year's <span className="text-red-500">Core Issues</span></>}
              des={language === 'ko' ? '복잡한 운세 속에서 당신이 집중해야 할 가장 중요한 단어들을 선별해 드립니다.' : 'Selects the most important words you should focus on amidst complex fortune.'}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 3. 테마 분석 Section */}
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
            <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '테마별 상세 분석' : 'Theme Analysis'}</h2>
              </div>
              <div className="sjsj-long-text-group space-y-4 mb-6">
                <div>
                  <h3 className="sjsj-sub-section-title font-bold text-red-600 mb-1">{language === 'ko' ? '재물/투자운' : 'Wealth/Investment'}</h3>
                  <p className="sjsj-long-text text-sm text-slate-600">
                    {language === 'ko'
                      ? '올해 당신의 재물운은 큰 흐름에서 상승곡선을 그리고 있습니다. 특히 상반기보다는 하반기에 투자의 결실이 맺힐 가능성이 높으며...'
                      : 'Your wealth luck this year is on an upward curve in the big picture. Fruits of investment are more likely to appear in the second half...'}
                  </p>
                </div>
                <div>
                  <h3 className="sjsj-sub-section-title font-bold text-red-600 mb-1">{language === 'ko' ? '직장/사업운' : 'Career/Business'}</h3>
                  <p className="sjsj-long-text text-sm text-slate-600">
                    {language === 'ko'
                      ? '승진의 기회, 이직의 타이밍, 혹은 새로운 사업을 시작하기에 적합한 달을 짚어드립니다. 사회적 위치가 한 단계 격상될 수 있는 핵심적인 처세술을 사주 기반으로 제안합니다...'
                      : 'Points out promotion opportunities, timing for job changes, or suitable months to start a new business. Suggests key social skills to elevate status based on Saju...'}
                  </p>
                </div>
                <div>
                  <h3 className="sjsj-sub-section-title font-bold text-red-600 mb-1">{language === 'ko' ? '건강/웰니스' : 'Health/Wellness'}</h3>
                  <p className="sjsj-long-text text-sm text-slate-600">
                    {language === 'ko'
                      ? '사주 오행상 취약해지기 쉬운 신체 부위를 사전에 예방하고, 한 해 동안 최상의 컨디션을 유지하기 위한 맞춤형 생활 습관과 운동법을 추천해 드립니다...'
                      : 'Recommends customized lifestyle habits and exercise methods to prevent vulnerability in body parts and maintain optimal condition throughout the year...'}
                  </p>
                </div>
              </div>
            </div>
            <ReportHid
              gradientColor="#FEF2F2"
              themeColor="#EF4444"
              badge={['3', language === 'ko' ? '테마분석' : 'Themes']}
              title={language === 'ko' ? <>인생의 <span className="text-red-500">4대 핵심 영역</span> 진단</> : <>Diagnosis of <span className="text-red-500">4 Core Areas</span></>}
              des={language === 'ko' ? '재물, 애정, 건강, 직업운까지 당신이 가장 궁금해하는 모든 것을 공개합니다.' : 'reveal everything you are most curious about, including wealth, love, health, and career.'}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 4. 주의할 점 Section */}
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
            <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '특별히 주의해야 할 기간' : 'Special Periods'}</h2>
              </div>
              <div className="sjsj-grid sjsj-grid-2 select-none pointer-events-none mb-6 grid grid-cols-2 gap-3">
                <div className="sjsj-premium-card bg-red-50 p-4 rounded-xl border border-red-100">
                  <div className="sjsj-card-title font-bold text-red-700 text-xs uppercase mb-1">{language === 'ko' ? '기운이 복돋는 달' : 'Best Months'}</div>
                  <p className="text-xs mt-2 text-slate-500">{language === 'ko' ? '2월, 6월, 10월' : 'Feb, Jun, Oct'}</p>
                </div>
                <div className="sjsj-premium-card bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="sjsj-card-title font-bold text-slate-700 text-xs uppercase mb-1">{language === 'ko' ? '신중함이 필요한 달' : 'Caution Months'}</div>
                  <p className="text-xs mt-2 text-slate-500">{language === 'ko' ? '4월, 8월, 12월' : 'Apr, Aug, Dec'}</p>
                </div>
              </div>
              <p className="sjsj-long-text select-none pointer-events-none text-sm text-slate-500 leading-relaxed">
                {language === 'ko' 
                  ? '특정 오행의 기운이 충돌하거나 과해지는 시기에는 평소보다 차분한 대응이 필요합니다. 특히 병오년의 화기운이 정점에 달하는 여름철에는...' 
                  : 'During periods when certain Five Elements energy collide or become excessive, a calmer response than usual is needed. Especially during the summer when the Fire energy of the Red Horse Year peaks...'}
              </p>
            </div>
            <ReportHid
              gradientColor="#FEF2F2"
              themeColor="#EF4444"
              badge={['4', language === 'ko' ? '주의기간' : 'Periods']}
              title={language === 'ko' ? <>절대 놓치면 안 될 <span className="text-red-500">핵심 터닝포인트</span></> : <>Critical <span className="text-red-500">Turning Points</span> You Can't Miss</>}
              des={language === 'ko' ? '한 해 중 운이 가장 폭발하는 시기와 반대로 자중하며 내실을 다져야 할 시기를 정확히 짚어드립니다.' : "Precisely point out when luck explodes and when you should be prudent and strengthen your inner self."}
              hClass="h-[500px]"
              mClass="mt-[-250px]"
            />
          </section>
        </div>
      </div>

      <div className="mt-12">
        <AnalyzeButton
          onClick={onStart}
          disabled={isDisabled || isDisabled2}
          loading={loading}
          isDone={isDone}
          label={language === 'ko' ? '2026 신년 운세 보기' : 'Check the 2026 Fortune'}
          color="red"
          cost={-1}
        />
        {isLocked ? (
            <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {language === 'ko' ? '크레딧이 부족합니다..' : 'Not Enough credit'}
            </p>
        ) : (
            <p className="mt-4 text-[11px] text-slate-400 text-center">
            {language === 'ko'
                ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
                : 'Fortunes already analyzed do not use credits.'}
            </p>
        )}
      </div>
    </div>
  );
}
