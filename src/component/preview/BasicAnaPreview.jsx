import React from 'react';
import { useLanguage } from '../../context/useLanguageContext';
import ReportHid from '../ReportHid';
import AnalyzeButton from '../AnalyzeButton';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { reportStyleSimple } from '../../data/aiResultConstants';

export default function BasicAnaPreview({ onStart, isDisabled, isDisabled2, loading, isDone, isLocked }) {
  const { language } = useLanguage();

  return (
    <div className="mt-16 text-left">
        <style>{reportStyleSimple}</style>
        <div className="mx-4 my-10 flex flex-col items-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50/50 mb-3">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[11px] font-bold text-indigo-600 tracking-tight uppercase">
                Preview Mode
            </span>
            </div>

            <div className="text-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {language === 'ko' ? '나를 찾는 평생 사주 분석' : "Lifetime Saju Analysis"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
                {language === 'ko'
                ? '타고난 기질부터 대운의 흐름, 그리고 인생의 조언까지 정밀하게 분석합니다'
                : 'Precise analysis from innate temperament to luck cycles and life advice'}
            </p>
            </div>
        </div>

      <div className="sjsj-report-container !mx-0 !p-0 bg-transparent">
        <div className="sjsj-content-inner !p-0">
          
          {/* 1. Who Am I & 명식 카드 스타일 Mockup */}
          <section className="relative sjsj-section !p-0 !mb-8 overflow-hidden">
            <div className="px-6 pt-6 opacity-40 grayscale contrast-75 select-none pointer-events-none">
              {/* 명식 카드 모의 디자인 */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4 opacity-50">
                  <div className="h-4 w-20 bg-slate-200 rounded"></div>
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                </div>
                <div className="flex justify-center gap-4 mb-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-8 h-3 bg-indigo-100 rounded mb-1"></div>
                      <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-500" style={{ width: '40%' }}></div>
                  <div className="h-full bg-red-500" style={{ width: '25%' }}></div>
                  <div className="h-full bg-yellow-500" style={{ width: '35%' }}></div>
                </div>
              </div>

              <div className="text-center mb-6">
                <span className="text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase">WHO AM I?</span>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
                  {language === 'ko' ? '청량한 숲속의 나무' : 'Tree in a Refreshing Forest'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'ko' ? '유연하면서도 강인한 생명력을 지닌 일주' : 'Day Pillar with flexible yet strong vitality'}
                </p>
              </div>

              <div className="opacity-40 grayscale">
                <div className="rt-card">
                  <h2 className="rt-card__title !text-left">{language === 'ko' ? '사주 정체성 요약' : 'Identity Summary'}</h2>
                  <p className="rt-card__text">
                    {language === 'ko' 
                      ? '당신의 타고난 성정과 인생의 목표는 조화와 성장입니다. 주변을 포용하는 따뜻한 기운이 풍부하며, 특히 사회적인 성취에 대한 열망이...'
                      : 'Your innate nature and life goals are harmony and growth. You have a warm energy that embraces those around you, and your desire for social achievement...'}
                  </p>
                </div>
              </div>
            </div>
            <ReportHid
              gradientColor="#DBEAFE" // 연한 블루
              themeColor="#3B82F6"
              badge={['1', language === 'ko' ? '총평' : 'Summary']}
              title={language === 'ko' ? <>나의 <span className="text-blue-500">인생 설계도</span> 첫 페이지</> : <>First Page of Your <span className="text-blue-500">Life Blueprint</span></>}
              des={language === 'ko' ? '당신이 어떤 사람인지, 어떤 강점을 타고났는지 명쾌하게 짚어드립니다.' : 'Clear analysis of who you are and what strengths you were born with.'}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 2. 상세 해석 섹션 (상세 그리드 스타일) */}
          <section className="relative sjsj-section !p-0 !mb-8 overflow-hidden ">
            <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale">
              <h2 className="rt-card__title !text-left !mb-6">{language === 'ko' ? '4대 영역 상세 해석' : 'Detailed Interpretation'}</h2>
              <div className="space-y-6">
                <div className="rt-card !m-0">
                  <div className="rt-ootd-item !mb-2">
                    <h3 className="rt-ootd-item__value">{language === 'ko' ? '재물운' : 'Wealth'}</h3>
                    <p className="rt-ootd-item__label">{language === 'ko' ? '비약적인 성장의 시기' : 'Period of Leap Growth'}</p>
                  </div>
                  <p className="rt-card__text">
                    {language === 'ko' 
                      ? '당신은 큰 돈을 굴리는 재능보다는 성실하게 자산을 축적하고 관리하는 데 특화된 기질을 가지고 있습니다...' 
                      : 'Rather than a talent for managing large sums of money, you have a temperament specialized in accumulating...'}
                  </p>
                </div>
                <div className="rt-card !m-0">
                  <div className="rt-ootd-item !mb-2">
                    <h3 className="rt-ootd-item__value">{language === 'ko' ? '직업운' : 'Career'}</h3>
                    <p className="rt-ootd-item__label">{language === 'ko' ? '창의적 리더십 발휘' : 'Creative Leadership'}</p>
                  </div>
                  <p className="rt-card__text">
                    {language === 'ko' 
                      ? '조직 내에서 중추적인 역할을 수행하며 리더십을 발휘하기에 최적인 운의 흐름을 타고났습니다...' 
                      : 'You were born with a flow of luck optimal for playing a pivotal role and exercising leadership...'}
                  </p>
                </div>
                {/* 추가된 영역: 애정운, 건강운 */}
                <div className="rt-card !m-0">
                  <div className="rt-ootd-item !mb-2">
                    <h3 className="rt-ootd-item__value">{language === 'ko' ? '애정운' : 'Love'}</h3>
                    <p className="rt-ootd-item__label">{language === 'ko' ? '소중한 인연의 출현' : 'The Appearance of a Special Bond'}</p>
                  </div>
                  <p className="rt-card__text">
                    {language === 'ko' 
                      ? '가까운 곳에서 당신을 지지해주는 따뜻한 인연이 찾아올 확률이 높습니다. 주변 사람들과의...' 
                      : 'There is a high probability that a warm connection who supports you from nearby will appear...'}
                  </p>
                </div>
                <div className="rt-card !m-0">
                  <div className="rt-ootd-item !mb-2">
                    <h3 className="rt-ootd-item__value">{language === 'ko' ? '건강운' : 'Health'}</h3>
                    <p className="rt-ootd-item__label">{language === 'ko' ? '안정적인 에너지 유지' : 'Maintaining Stable Energy'}</p>
                  </div>
                  <p className="rt-card__text">
                    {language === 'ko' 
                      ? '스트레스 관리에 유의하며 적절한 휴식을 취한다면 최상의 컨디션을 꾸준히 유지할 수 있을 것입니다...' 
                      : 'If you take care of stress management and get adequate rest, you will be able to maintain your best...'}
                  </p>
                </div>
              </div>
            </div>
            <ReportHid
              gradientColor="#DBEAFE"
              themeColor="#3B82F6"
              badge={['2', language === 'ko' ? '상세해설' : 'Details']}
              title={language === 'ko' ? <>삶을 지탱하는 <span className="text-blue-500">4대 운세</span> 자산</> : <>4 Major <span className="text-blue-500">Fortune Assets</span></>}
              des={language === 'ko' ? '재물, 직업, 애정, 건강에 이르는 포괄적인 인생 가이드를 제공합니다.' : 'Provides a comprehensive life guide covering wealth, career, love, and health.'}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 3. 대운 흐름 Section */}
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
            <div className="px-6 pt-6 opacity-40 grayscale contrast-75 select-none pointer-events-none">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '03. 대운 흐름 분석' : '03. Luck Cycles'}</h2>
              </div>
              <div className="space-y-4 mb-6">
                {[
                  { 
                    age: '15 ~ 24', 
                    name: language === 'ko' ? '갑오(甲午) 대운' : 'Gap-oh (甲午) Cycle', 
                    desc: language === 'ko' ? '새로운 배움과 호기심이 폭발하는 시기...' : 'A time where new learning and curiosity explode...'
                  },
                  { 
                    age: '25 ~ 34', 
                    name: language === 'ko' ? '을미(乙未) 대운' : 'Eul-mi (乙未) Cycle', 
                    desc: language === 'ko' ? '사회적 기반을 다지고 인맥이 확장되는...' : 'A period of building social foundations and networking...'
                  },
                  { 
                    age: '35 ~ 44', 
                    name: language === 'ko' ? '병신(丙申) 대운' : 'Byeong-shin (丙申) Cycle', 
                    desc: language === 'ko' ? '인생의 가장 화려한 성취가 기다리는...' : 'A time where the most brilliant achievements of life await...'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="rt-gap2 mb-4">
                    <span className="rt-analysis-list__sub-title block font-bold text-indigo-900 mb-1">{item.age} {item.name}</span>
                    <p className="rt-card__text text-left text-xs text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <ReportHid
              gradientColor="#DBEAFE"
              themeColor="#3B82F6"
              badge={['3', language === 'ko' ? '대운흐름' : 'Luck Cycles']}
              title={language === 'ko' ? <>인생의 <span className="text-blue-500">거대한 물줄기</span> 대운</> : <>The <span className="text-blue-500">Great Wave</span> of Luck</>}
              des={language === 'ko' ? '당신 앞에 놓인 10년 주기 변화의 지도를 한눈에 보여드립니다.' : 'Shows the map of 10-year cycle changes set before you at a glance.'}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 4. Final Conclusion 섹션 */}
          <section className="relative sjsj-section !p-0 !mb-8 overflow-hidden">
            <div className="p-6 select-none pointer-events-none opacity-40 grayscale">
              <div className="rt-card !m-0 bg-transparent shadow-none border-0">
                <h2 className="rt-card__title !text-left text-lg font-bold mb-4">{language === 'ko' ? '최종 결론' : 'Final Conclusion'}</h2>
                <div className="rt-tip-box mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <span className="rt-tip-box__label text-xs font-bold text-indigo-600 block mb-2">
                    {language === 'ko' ? '당신을 위한 마스터의 조언' : "Master's Advice for You"}
                  </span>
                  <p className="rt-card__text !mt-2 text-slate-600 text-sm leading-relaxed">
                    {language === 'ko'
                      ? '지금 당신에게 필요한 것은 변화를 두려워하지 않는 용기입니다. 현재의 안정에 안주하기보다 새로운 도전을 향해...'
                      : 'What you need now is the courage to not fear change. Rather than being complacent with current stability, head towards new challenges...'}
                  </p>
                </div>
              </div>
            </div>
            <ReportHid
              gradientColor="#DBEAFE"
              themeColor="#3B82F6"
              badge={['4', language === 'ko' ? '최종제언' : 'Conclusion']}
              title={language === 'ko' ? <>마스터가 전하는 <span className="text-blue-500">결정적 한 마디</span></> : <>The <span className="text-blue-500">Decisive Word</span> from the Master</>}
              des={language === 'ko' ? '리포트를 마무리하며 당신이 지금 즉시 실천해야 할 삶의 태도를 제안합니다.' : 'Suggests the life attitude you should practice immediately as we conclude the report.'}
              hClass="h-[500px]"
              mClass="mt-[-250px]"
            />
          </section>
        </div>
      </div>

      <div className="mt-8 mb-12 max-w-lg mx-auto">
        <AnalyzeButton
            onClick={onStart}
            disabled={isDisabled || isDisabled2}
            loading={loading}
            isDone={isDone}
            label={language === 'ko' ? '평생 운세 보기' : 'Analyze Saju'}
            color="indigo"
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
