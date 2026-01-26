import React from 'react';
import { useLanguage } from '../../context/useLanguageContext';
import ReportHid from '../ReportHid';
import AnalyzeButton from '../AnalyzeButton';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

export default function TodaysLuckPreview({ onStart, isDisabled, isDisabled2, loading, isDone, isLocked }) {
  const { language } = useLanguage();

  return (
    <div className="mt-16 text-left">
        <div className="mx-4 my-10 flex flex-col items-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-200 bg-amber-50/50 mb-3">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[11px] font-bold text-amber-600 tracking-tight uppercase">
                Preview Mode
            </span>
            </div>
            
            <div className="text-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {language === 'ko' ? '오늘의 운세 미리보기' : "Today's Luck Preview"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
                {language === 'ko'
                ? '당신의 하루를 위한 맞춤형 조언과 운세 흐름을 미리 확인하세요'
                : 'Preview customized advice and luck flow for your day'}
            </p>
            </div>
        </div>

        <div className="sjsj-report-container !mx-0 !p-0 bg-transparent">
          <div className="sjsj-content-inner !p-0">
             {/* 1. 오늘의 총운 Section */}
            <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
              <div className="px-6 pt-6">
                <div className="sjsj-section-label">
                  <h2 className="sjsj-subTitle">
                    {language === 'ko' ? '오늘의 총운' : "Today's Overview"}
                  </h2>
                </div>
                {/* 블러 처리될 샘플 데이터 */}
                <div className="opacity-40 grayscale select-none pointer-events-none mb-6">
                   <div className="sjsj-score-box">
                    <div className="sjsj-score-circle">
                      <span className="sjsj-score-num">85</span>
                      <span className="sjsj-score-text">POINT</span>
                    </div>
                    <div className="sjsj-score-comment">
                       <strong>{language === 'ko' ? '기분 좋은 하루!' : 'Good Day!'}</strong>
                       <p>{language === 'ko' ? '순조로운 흐름 속에 소소한 행운이 따릅니다.' : 'Small luck follows in a smooth flow.'}</p>
                    </div>
                   </div>
                   <p className="sjsj-long-text mt-4">
                     {language === 'ko' 
                       ? '오늘은 전반적으로 안정적인 기운이 감도는 날입니다. 큰 걱정거리 없이 계획했던 일들을 차분하게 마무리할 수 있으며, 주변 사람들과의 관계에서도 온화한 분위기가...' 
                       : 'A day with generally stable energy. You can calmly finish planned tasks without big worries, and warm atmosphere in relationships...'}
                   </p>
                </div>
              </div>
               
              <ReportHid
                gradientColor="#FAF7F4"
                badge={['1', language === 'ko' ? '총운' : 'Overview']}
                title={
                  language === 'ko' ? (
                    <>
                       당신의 하루를 관통하는 <span className="text-[#F47521]">운명의 핵심</span>
                    </>
                  ) : (
                    <>
                       The <span className="text-[#F47521]">Core of Destiny</span> Piercing Your Day
                    </>
                  )
                }
                des={
                  language === 'ko'
                    ? '오늘 하루 예상되는 기운의 흐름과 종합 점수를 분석해 드립니다.'
                    : "Analyzes the expected energy flow and overall score for today."
                }
                hClass="h-[600px]"
                mClass="mt-[-300px]"
              />
            </section>

             {/* 2. 행운의 치트키 Section */}
            <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
              <div className="px-6 pt-6">
                <div className="sjsj-section-label">
                  <h2 className="sjsj-subTitle">
                    {language === 'ko' ? '행운의 치트키' : 'Lucky Charm'}
                  </h2>
                </div>

                <div className="opacity-40 grayscale select-none pointer-events-none mb-6">
                  <div className="sjsj-grid sjsj-grid-2">
                     <div className="sjsj-premium-card">
                       <div className="sjsj-card-title">LUCKY COLOR</div>
                       <div className="sjsj-color-chip" style={{ background: '#FFD700' }}></div>
                       <p className="text-xs mt-1 text-slate-500">Gold</p>
                     </div>
                     <div className="sjsj-premium-card">
                       <div className="sjsj-card-title">DIRECTION</div>
                        <p className="text-lg font-bold text-slate-800">East</p>
                       <p className="text-xs text-slate-500">{language === 'ko' ? '동쪽' : ''}</p>
                     </div>
                  </div>
                </div>
              </div>
              <ReportHid
                gradientColor="#FAF7F4"
                badge={['2', language === 'ko' ? '치트키' : 'CheatKey']}
                title={
                  language === 'ko' ? (
                    <>
                      당신의 운을 틔워줄 <span className="text-[#F47521]">행운의 치트키</span>
                    </>
                  ) : (
                    <>
                      Lucky <span className="text-[#F47521]">Cheat Keys</span> for You
                    </>
                  )
                }
                des={
                  language === 'ko'
                    ? '오늘 더 좋은 기운을 불러오는 방향, 컬러, 그리고 당신만의 핵심 키워드를 확인하세요.'
                    : "Check the direction, color, and your own core keywords that bring in better energy today."
                }
                hClass="h-[600px]"
                mClass="mt-[-300px]"
              />
            </section>

            {/* 3. 카테고리별 상세 분석 Section */}
            <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
              <div className="px-6 pt-6">
                <div className="sjsj-section-label">
                  <h2 className="sjsj-subTitle">
                    {language === 'ko' ? '카테고리별 상세 분석' : 'Category Deep Dive'}
                  </h2>
                </div>

                <div className="opacity-40 grayscale select-none pointer-events-none mb-6">
                  <h3 className="sjsj-sub-section-title">
                    {language === 'ko' ? '연애운' : 'Love Luck'}
                  </h3>
                  <div className="sjsj-long-text">
                    <strong>
                      {language === 'ko' ? '[서로의 마음을 확인하는 따뜻한 시간]' : '[A Warm Time to Confirm Each Other’s Hearts]'}
                    </strong>
                    <p>
                      {language === 'ko'
                        ? '그동안 소원했던 관계가 회복되거나, 상대방과의 깊은 대화가 매끄럽게 풀리는 하루입니다. 오해가 있었다면 오늘이 바로 그 실타래를 푸는 최적의 타이밍입니다...'
                        : 'A day where previously distant relationships are restored or deep conversations with others flow smoothly. If there were misunderstandings, today is the perfect timing...'}
                    </p>
                  </div>
                  <h3 className="sjsj-sub-section-title">
                    {language === 'ko' ? '금전운' : 'Wealth Luck'}
                  </h3>
                  <div className="sjsj-long-text">
                    <strong>
                      {language === 'ko' ? '[작은 절약이 모여 큰 흐름을 만드는 법]' : '[Small Savings Creating a Large Flow]'}
                    </strong>
                    <p>
                      {language === 'ko'
                        ? '뜻밖의 작은 행운이 찾아오거나, 과거에 해둔 소소한 투자가 빛을 발할 수 있습니다. 지출 관리에 조금만 더 신경 쓴다면 금전적 안정을 충분히 누릴 수 있는 기운입니다...'
                        : 'Unexpected small luck may find you, or small investments made in the past may shine. If you pay a little more attention...'}
                    </p>
                  </div>
                  <h3 className="sjsj-sub-section-title">
                    {language === 'ko' ? '직장/사업운' : 'Career/Business'}
                  </h3>
                  <div className="sjsj-long-text">
                    <strong>
                      {language === 'ko' ? '[당신의 리더십이 빛을 발하는 순간]' : '[The Moment Your Leadership Shines]'}
                    </strong>
                    <p>
                      {language === 'ko'
                        ? '중요한 프로젝트에서 당신의 의견이 적극적으로 수용되고, 주변 동료들로부터 신뢰를 얻게 되는 흐름입니다. 주체적으로 상황을 이끌어나가는 리더십을 발휘해보세요...'
                        : 'A flow where your opinions are actively accepted in important projects and you gain trust from colleagues. Exercise leadership...'}
                    </p>
                  </div>
                  <h3 className="sjsj-sub-section-title">
                    {language === 'ko' ? '건강/학업' : 'Health/Study'}
                  </h3>
                  <div className="sjsj-long-text">
                    <strong>
                      {language === 'ko' ? '[최상의 컨디션과 집중력]' : '[Optimal Condition and Concentration]'}
                    </strong>
                    <p>
                      {language === 'ko'
                        ? '에너지가 넘치는 날이니 새로운 공부를 시작하거나 어려운 과제에 도전해보기에 좋습니다. 신체적 활력도 좋아 가벼운 운동이 기분을 더욱 상쾌하게 만들어줄 것입니다...'
                        : 'A day full of energy, great for starting new studies or tackling difficult tasks. Good physical vitality means light exercise...'}
                    </p>
                  </div>
                </div>
              </div>

              <ReportHid
                gradientColor="#FAF7F4"
                badge={['3', language === 'ko' ? '상세분석' : 'Analytics']}
                title={
                  language === 'ko' ? (
                    <>
                      놓치면 안 될 <span className="text-[#F47521]">생활 밀착형 조언</span>
                    </>
                  ) : (
                    <>
                      Life-oriented <span className="text-[#F47521]">Advice You Can't Miss</span>
                    </>
                  )
                }
                des={
                  language === 'ko'
                    ? '재물, 애정, 직장, 건강, 학업까지 당신이 궁금한 모든 분야의 운세를 짚어드립니다.'
                    : "We cover fortunes in all areas you are curious about, including wealth, love, work, health, and studies."
                }
                hClass="h-[600px]"
                mClass="mt-[-300px]"
              />
            </section>

            {/* 4. 내일의 운세 Section */}
            <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
              <div className="px-6 pt-6">
                <div className="sjsj-section-label">
                  <h2 className="sjsj-subTitle">
                    {language === 'ko' ? '내일의 운세 미리보기' : "Tomorrow's Preview"}
                  </h2>
                </div>
                
                <div className="sjsj-month-card opacity-40 grayscale select-none pointer-events-none">
                  <div className="sjsj-month-header">
                    <div className="sjsj-month-title">
                      <h3>2026.01.27</h3>
                      <div className="sjsj-progress-bar">
                        <div className="sjsj-progress-fill" style={{ width: '70%' }}></div>
                        {language === 'ko' ? '70점' : '70 Score'}
                      </div>
                    </div>
                    <div className="sjsj-star-rating">★★★☆☆</div>
                  </div>
                  <div className="sjsj-month-summary-chips">
                    <div>
                      <span className="sjsj-check">✓</span> {language === 'ko' ? '주의: 불필요한 지출, 무리한 일정' : 'Caution: Unnecessary spending, Over-scheduling'}
                    </div>
                    <div>
                      ▷ {language === 'ko' ? '활용: 내실 다지기, 건강 관리 집중' : 'Action: Focus on internal stability, Health care'}
                    </div>
                  </div>
                  <p className="sjsj-long-text">
                    {language === 'ko' 
                      ? '내일은 오늘보다 차분하고 안정적인 흐름이 예상됩니다. 새로운 일을 벌이기보다는 현재 진행 중인 상태를 꼼꼼히 점검하고 내실을 다지는 것이 유리한 하루가 될 것입니다. 대인 관계에서도 화려한 사교 활동보다는 진실된 대화 한마디가 더 큰 힘을 발휘할 것입니다. 저녁 시간에는 충분한 휴식을 통해 에너지를 비축하는 것이 다음을 위한 현명한 선택입니다.' 
                      : 'A calmer and more stable flow is expected tomorrow compared to today. Rather than starting new ventures, it will be advantageous to meticulously check current progress and strengthen internal foundations. In interpersonal relationships, a single sincere word will be more powerful than flashy social activities. Wisely recharging your energy through sufficient rest in the evening will prepare you for what lies ahead.'}
                  </p>
                  <div className="sjsj-card-footer">
                    <div className="sjsj-footer-msg">
                      {language === 'ko' ? '내일은 한 보 후퇴하여 두 보 전진을 준비하는 시기입니다.' : 'Tomorrow is a time to take one step back to prepare for two steps forward.'}
                    </div>
                  </div>
                </div>
              </div>

              <ReportHid
                gradientColor="#FAF7F4"
                badge={['4', language === 'ko' ? '내일운세' : 'Tomorrow']}
                title={
                  language === 'ko' ? (
                    <>
                      한 발 앞서 준비하는 <span className="text-[#F47521]">내일의 청사진</span>
                    </>
                  ) : (
                    <>
                      Prepare Ahead with <span className="text-[#F47521]">Tomorrow's Blueprint</span>
                    </>
                  )
                }
                des={
                  language === 'ko'
                    ? '오늘 리포트의 마지막에는 내일을 대비할 수 있는 특별한 조언이 포함되어 있습니다.'
                    : "The end of today's report includes special advice to prepare for tomorrow."
                }
                hClass="h-[500px]"
                mClass="mt-[-250px]"
              />
            </section>
          </div>
        </div>
      
      {/* 시작 버튼: handleDailyStartClick 연결 */}
      <AnalyzeButton
          onClick={onStart}
          disabled={isDisabled || isDisabled2}
          loading={loading}
          isDone={isDone}
          label={language === 'ko' ? '운세 확인하기' : 'Check my Luck'}
          color="amber"
          cost={-1}
        />
        {isLocked ? (
          <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
            <ExclamationTriangleIcon className="w-4 h-4" />{' '}
            {language === 'ko' ? '크레딧이 부족합니다..' : 'not Enough credit'}
          </p>
        ) : (
          <p className="mt-4 text-[11px] text-slate-400">
            {language === 'ko'
              ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
              : 'Fortunes that have already been analyzed do not use credits.'}
          </p>
        )}
    </div>
  );
}
