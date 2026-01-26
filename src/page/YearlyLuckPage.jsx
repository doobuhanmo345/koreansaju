import { useRef, useState, useEffect } from 'react';
import AnalysisStepContainer from '../component/AnalysisStepContainer';
import ViewResult from './ViewResult';
import { useSajuCalculator } from '../hooks/useSajuCalculator';
import EnergyBadge from '../ui/EnergyBadge';
import { useAuthContext } from '../context/useAuthContext';
import { useUsageLimit } from '../context/useUsageLimit';
import { db } from '../lib/firebase';
import { setDoc, doc, increment } from 'firebase/firestore';
import { useLoading } from '../context/useLoadingContext';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import { TicketIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { langPrompt, hanja } from '../data/constants';
import { fetchGeminiAnalysis } from '../api/gemini';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { classNames } from '../utils/helpers';
import { getEng } from '../utils/helpers';
import { calculateSajuData } from '../utils/sajuLogic';
import { ref, get, child } from 'firebase/database';
import { database } from '../lib/firebase';
import LoadingFourPillar from '../component/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '../service/SajuAnalysisService';
import { Brain, Users, Database } from 'lucide-react';
import ReportHid from '../component/ReportHid';
import { reportStyleBlue } from '../data/aiResultConstants';
import ReportTemplateNewYear from '../component/ReportTemplateNewYear';
import AnalyzeButton from '../component/AnalyzeButton';

// 1. 로딩 컴포넌트

// 2. 메인 페이지 컴포넌트
export default function YearlyLuckPage() {
  const { setLoadingType, aiResult, setAiResult } = useLoading();
  const [loading, setLoading] = useState(false);
  const [sajuData, setSajuData] = useState(null);
  const { userData, user, isYearDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = userData || {};

  const { language } = useLanguage();
  // useUsageLimit에서 editCount와 setEditCount 가져오기
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading;
  const isDisabled2 = !isYearDone && isLocked;

  useEffect(() => {
    if (inputDate) {
      const data = calculateSajuData(inputDate, gender, isTimeUnknown, language);
      if (data) {
        setSajuData(data);
        //   if (data.currentDaewoon) setSelectedDae(data.currentDaewoon);
      }
    }
  }, [inputDate, gender, isTimeUnknown, language]);

  const service = new SajuAnalysisService({
    user,
    userData,
    language,
    maxEditCount: MAX_EDIT_COUNT,
    uiText: UI_TEXT,
    langPrompt,
    hanja,
    setEditCount,
    setLoading,
    setAiResult,
  });

  const handleStartClick = async (onstart) => {
    setAiResult('');
    try {
      await service.analyze(AnalysisPresets.newYear({ saju, gender, language }));
      onstart();
    } catch (error) {
      console.error(error);
    }
  };

  // 안내 디자인 정의
  const sajuGuide = (onStart) => {
    if (loading) {
      return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;
    }

    return (
      <div className="max-w-lg mx-auto text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
          {language === 'ko' ? '오행으로 읽는' : 'Reading the Five Elements'}
          <br />
          <span className="relative text-red-600 dark:text-red-400">
            {language === 'ko' ? '2026 신년운세' : '2026 Fortune Preview'}
            <div className="absolute inset-0 bg-red-200/50 dark:bg-red-900/30 blur-md rounded-full scale-100"></div>
          </span>
        </h2>
        {/* 설명문구 */}
        <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep text-center">
          <p className="text-sm">
            {language === 'ko' ? (
              <>
                <strong>붉은 말의 해</strong>, 사주에 숨겨진 월별 건강운, 재물운, 연애운.
              </>
            ) : (
              '2026 is Year of the Red Horse, find out the fortune upcoming of yours'
            )}
          </p>

          <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img
              src="/images/introcard/newyear_1.webp"
              alt="2026 yearly luck"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* 4. 하단 3단 정보 바 */}
        <div className="w-full flex items-center mt-12 mb-12 px-2 py-4 border-t border-[#E8DCCF] dark:border-slate-800">
          <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
            <Users size={18} className="text-[#F47521]" />
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 leading-tight text-center">
              {language === 'ko' ? '27명 명리학자 참여' : '27 Saju Masters'}
              <br />
              <span className="font-medium text-[9px]">
                {language === 'ko' ? '직접 검증 데이터 기반' : 'Verified Data'}
              </span>
            </span>
          </div>
          <div className="h-8 w-[1px] bg-[#E8DCCF] dark:bg-slate-700 shrink-0"></div>
          <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
            <Database size={18} className="text-[#F47521]" />
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 leading-tight text-center">
              {language === 'ko' ? '수만 건 데이터' : 'Big Data Analysis'}
              <br />
              <span className="font-medium text-[9px]">
                {language === 'ko' ? '방대한 DB 활용 분석' : 'Structured DB'}
              </span>
            </span>
          </div>
          <div className="h-8 w-[1px] bg-[#E8DCCF] dark:bg-slate-700 shrink-0"></div>
          <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
            <Brain size={18} className="text-[#F47521]" />
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 leading-tight text-center">
              {language === 'ko' ? '질문 맞춤' : 'Personalized'}
              <br />
              <span className="font-bold">{language === 'ko' ? '분석' : 'Analysis'}</span>
            </span>
          </div>
        </div>

        {/* [NEW] Primary Analyze Button */}
        <div className="mb-12">
          <AnalyzeButton
            onClick={() => handleStartClick(onStart)}
            disabled={isDisabled || isDisabled2}
            loading={loading}
            isDone={isYearDone}
            label={language === 'ko' ? '2026 신년 운세 보기' : 'Check the 2026 Fortune'}
            color="red"
            cost={-1}
          />
          {isLocked ? (
            <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
              <ExclamationTriangleIcon className="w-4 h-4" />{' '}
              {language === 'ko' ? '크레딧이 부족합니다..' : 'Not enough credits'}
            </p>
          ) : (
            <p className="mt-4 text-[11px] text-slate-400">
              {language === 'ko'
                ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
                : 'Fortunes that have already been analyzed do not use credits.'}
            </p>
          )}
        </div>

        {/* Preview Section - Yearly Luck Teaser */}
        <div className="mt-10 text-left">
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
                {language === 'ko' ? '미리 보는 당신의 2026년' : 'Your 2026 Blueprint'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
                {language === 'ko'
                  ? '병오년의 뜨거운 에너지가 당신의 삶에 어떤 변화를 가져올지 짚어드립니다'
                  : "Preview the transformative energy of the Red Horse Year in your fate"}
              </p>
            </div>
          </div>

          <div className="sjsj-report-container !mx-0 !p-0 bg-transparent">
            <div className="sjsj-content-inner !p-0">
              {/* 1. 종합 분석 Section */}
              <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
                <div className="px-6 pt-6 opacity-40 grayscale contrast-75">
                  <div className="sjsj-section-label">
                    <h2 className="sjsj-subTitle">{language === 'ko' ? '2026년 종합 분석' : '2026 Analysis'}</h2>
                  </div>
                  <div className="sjsj-info-banner select-none pointer-events-none mb-6">
                    {language === 'ko' ? '새로운 시작과 도약의 기운이 강하게 작용하여, 당신의 잠재력을 세상에 증명할 최고의 기회가 찾아오는 해입니다.' : 'A year where the energy of new beginnings and leaps forward acts strongly, providing the best opportunity to prove your potential to the world.'}
                  </div>
                  <div className="sjsj-analysis-box select-none pointer-events-none mb-6">
                    <div className="sjsj-keyword-grid">
                      <div className="sjsj-keyword-col">
                        <div className="sjsj-col-title text-fire">{language === 'ko' ? '🔥 성장 키워드' : '🔥 Growth'}</div>
                        <ul className="sjsj-list">
                          <li>{language === 'ko' ? '#폭발적추진력 #새로운네트워크 #전문성강화' : '#Momentum #Networking #Expertise'}</li>
                        </ul>
                      </div>
                      <div className="sjsj-keyword-col">
                        <div className="sjsj-col-title text-earth">{language === 'ko' ? '💡 활용 요소' : '💡 Assets'}</div>
                        <ul className="sjsj-list">
                          <li><span className="sjsj-check">✓</span> {language === 'ko' ? '과거의 경험, 예기치 못한 귀인' : 'Past Experience, Unexpected Helpers'}</li>
                        </ul>
                      </div>
                      <div className="sjsj-keyword-col">
                        <div className="sjsj-col-title text-earth">{language === 'ko' ? '⚠️ 주의 요소' : '⚠️ Caution'}</div>
                        <ul className="sjsj-list">
                          <li><span className="sjsj-delta">△</span> {language === 'ko' ? '조급한 판단, 과도한 지출' : 'Hasty Decisions, Excessive Spending'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <p className="sjsj-long-text select-none pointer-events-none">
                    {language === 'ko' 
                      ? '병오년은 화(Fire)의 기운이 매우 강한 시기입니다. 이는 당신의 사주 내에 잠자고 있던 열정을 깨워 폭발적인 추진력을 만들어낼 것입니다. 특히 상반기에는 그동안 구상만 하던 일을 실천에 옮기기에 최적의 타이밍이며, 주변의 지지와 응원을 한몸에 받게 될 가능성이 큽니다. 다만, 너무 빠른 속도로 질주하다 보면 놓치기 쉬운 세밀한 부분들을 챙기는 지혜가 필요합니다...' 
                      : 'The Year of the Red Horse is a period of very strong Fire energy. This will awaken the passion dormant within your fate and create explosive momentum. Especially in the first half, it is the perfect timing to put ideas into action, and there is a high possibility of receiving full support and encouragement from those around you. However, wisdom is needed to take care of the fine details that are easy to miss when racing at such a high speed...'}
                  </p>
                </div>
                <ReportHid
                  gradientColor="#FEF2F2"
                  themeColor="#EF4444"
                  badge={['1', language === 'ko' ? '종합분석' : 'Analysis']}
                  title={language === 'ko' ? <>2026년을 관통하는 <span className="text-red-500">운명의 흐름</span></> : <>The <span className="text-red-500">Flow of Fate</span> in 2026</>}
                  des={language === 'ko' ? '병오년 한 해 동안 당신에게 찾아올 핵심 변화와 성장의 기회를 분석해 드립니다.' : 'Analyze the key changes and growth opportunities that will come to you in 2026.'}
                  hClass="h-[600px]"
                  mClass="mt-[-300px]"
                />
              </section>

              {/* 2. 월별 분석 Section */}
              <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
                <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale">
                  <div className="sjsj-section-label">
                    <h2 className="sjsj-subTitle">{language === 'ko' ? '월별 운세 상세 분석' : 'Monthly Detail'}</h2>
                  </div>
                  <div className="sjsj-month-card select-none pointer-events-none mb-6">
                    <div className="sjsj-month-header">
                      <div className="sjsj-month-title">
                        <h3>{language === 'ko' ? '1월: 기축월' : 'Jan'}</h3>
                        <div className="sjsj-progress-bar">
                          <div className="sjsj-progress-fill" style={{ width: '80%' }}></div>
                          {language === 'ko' ? '80점' : '80 Score'}
                        </div>
                      </div>
                      <div className="sjsj-star-rating">★★★★☆</div>
                    </div>
                    <div className="sjsj-month-summary-chips">
                      <div><span className="sjsj-check">✓</span> {language === 'ko' ? '방향: 기초 수립' : 'Focus: Base Building'}</div>
                      <div>▷ {language === 'ko' ? '활용: 네트워크 강화' : 'Action: Network'}</div>
                    </div>
                    <p className="sjsj-long-text">
                      {language === 'ko' ? '한 해를 설계하며 기반을 다지는 시기입니다. 당신의 성실함이 빛을 발하여 주변 사람들에게 깊은 신뢰를 심어주게 될 것입니다. 특히 중순 이후에는 멀리서 반가운 소식이 전해지거나 뜻밖의 제안을 받을 확률이 높습니다...' : 'A time to design the year and strengthen the foundation. Your sincerity will shine and instill deep trust in those around you. Especially after the middle of the month, there is a high probability of receiving welcome news from afar or unexpected proposals...'}
                    </p>
                  </div>

                  <div className="sjsj-month-card select-none pointer-events-none mb-6">
                    <div className="sjsj-month-header">
                      <div className="sjsj-month-title">
                        <h3>{language === 'ko' ? '2월: 경인월' : 'Feb'}</h3>
                        <div className="sjsj-progress-bar">
                          <div className="sjsj-progress-fill" style={{ width: '95%' }}></div>
                          {language === 'ko' ? '95점' : '95 Score'}
                        </div>
                      </div>
                      <div className="sjsj-star-rating">★★★★★</div>
                    </div>
                    <div className="sjsj-month-summary-chips">
                      <div><span className="sjsj-check">✓</span> {language === 'ko' ? '방향: 적극적 추진' : 'Focus: Active Push'}</div>
                      <div>▷ {language === 'ko' ? '활용: 리더십 발휘' : 'Action: Leadership'}</div>
                    </div>
                    <p className="sjsj-long-text">
                      {language === 'ko' ? '최상의 운세 흐름이 찾아오는 달입니다. 망설였던 일이 있다면 지금이 바로 기회입니다. 당신의 에너지가 최고조에 달하며, 어떤 장애물도 거뜬히 넘길 수 있는 용기가 솟구칠 것입니다...' : 'A month where the best fortune flow arrives. If there is something you have been hesitating about, now is the opportunity. Your energy will be at its peak, and courage will soar to overcome any obstacles...'}
                    </p>
                  </div>
                </div>
                <ReportHid
                  gradientColor="#FEF2F2"
                  themeColor="#EF4444"
                  badge={['2', language === 'ko' ? '월별운세' : 'Monthly']}
                  title={language === 'ko' ? <>12개월 <span className="text-red-500">운명 캘린더</span></> : <>12-Month <span className="text-red-500">Fate Calendar</span></>}
                  des={language === 'ko' ? '매월 변화하는 운의 기복과 주의해야 할 시기를 꼼꼼하게 짚어드립니다.' : 'Meticulously point out the monthly ups and downs of luck and periods of caution.'}
                  hClass="h-[600px]"
                  mClass="mt-[-300px]"
                />
              </section>

              {/* 3. 카테고리 분석 Section */}
              <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
                <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale">
                  <div className="sjsj-section-label">
                    <h2 className="sjsj-subTitle">{language === 'ko' ? '테마별 집중 분석' : 'Theme Analytics'}</h2>
                  </div>
                  <div className="select-none pointer-events-none mb-6">
                    <h3 className="sjsj-sub-section-title">{language === 'ko' ? '연애/결혼운' : 'Love/Marriage'}</h3>
                    <p className="sjsj-long-text">
                      {language === 'ko'
                        ? '소중한 인연이 찾아오는 최적의 시기와 관계를 더욱 깊게 만들어줄 구체적인 행동 지침을 제시합니다. 솔로라면 운명의 상대를 만날 확률이 높은 장소와 시기를 예측해 드립니다...'
                        : 'Provides optimal timing for special connections and specific action guidelines to deepen relationships. For singles, predicts places and times with high probability...'}
                    </p>
                    <h3 className="sjsj-sub-section-title">{language === 'ko' ? '재물/재테크' : 'Wealth/Invest'}</h3>
                    <p className="sjsj-long-text">
                      {language === 'ko'
                        ? '나가는 돈을 막고 들어오는 돈을 극대화할 수 있는 영리한 자금 관리 전략을 공개합니다. 투자에 유리한 섹터와 위험 요소가 도사리고 있는 시점을 월별로 정밀 분석합니다...'
                        : 'Reveals smart fund management strategies to block outflows and maximize inflows. Meticulously analyzes favorable sectors and risky periods by month...'}
                    </p>
                    <h3 className="sjsj-sub-section-title">{language === 'ko' ? '직장/사업운' : 'Career/Business'}</h3>
                    <p className="sjsj-long-text">
                      {language === 'ko'
                        ? '승진의 기회, 이직의 타이밍, 혹은 새로운 사업을 시작하기에 적합한 달을 짚어드립니다. 사회적 위치가 한 단계 격상될 수 있는 핵심적인 처세술을 사주 기반으로 제안합니다...'
                        : 'Points out promotion opportunities, timing for job changes, or suitable months to start a new business. Suggests key social skills to elevate status based on Saju...'}
                    </p>
                    <h3 className="sjsj-sub-section-title">{language === 'ko' ? '건강/웰니스' : 'Health/Wellness'}</h3>
                    <p className="sjsj-long-text">
                      {language === 'ko'
                        ? '사주 오행상 취약해지기 쉬운 신체 부위를 사전에 예방하고, 한 해 동안 최상의 컨디션을 유지하기 위한 맞춤형 생활 습관과 운동법을 추천해 드립니다...'
                        : 'Recommends customized lifestyle habits and exercise methods to prevent vulnerability in body parts and maintain optimal condition throughout the year...'}
                    </p>
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
                  <div className="sjsj-grid sjsj-grid-2 select-none pointer-events-none mb-6">
                    <div className="sjsj-premium-card">
                      <div className="sjsj-card-title">{language === 'ko' ? '기운이 복돋는 달' : 'Best Months'}</div>
                      <p className="text-xs mt-2 text-slate-500">{language === 'ko' ? '2월, 6월, 10월' : 'Feb, Jun, Oct'}</p>
                    </div>
                    <div className="sjsj-premium-card">
                      <div className="sjsj-card-title">{language === 'ko' ? '신중함이 필요한 달' : 'Caution Months'}</div>
                      <p className="text-xs mt-2 text-slate-500">{language === 'ko' ? '4월, 8월, 12월' : 'Apr, Aug, Dec'}</p>
                    </div>
                  </div>
                  <p className="sjsj-long-text select-none pointer-events-none">
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
        </div>

        {/* [NEW] Bottom Analyze Button */}
        <div className="mt-12">
          <AnalyzeButton
            onClick={() => handleStartClick(onStart)}
            disabled={isDisabled || isDisabled2}
            loading={loading}
            isDone={isYearDone}
            label={language === 'ko' ? '2026 신년 운세 보기' : 'Check the 2026 Fortune'}
            color="red"
            cost={-1}
          />
        </div>
      </div>
    );
  };
  // 1. 결과가 나왔을 때 스크롤을 위로 올리는 로직
  useEffect(() => {
    // aiResult가 유효한 문자열인지 확인
    if (typeof aiResult === 'string' && aiResult.trim().length > 0) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [aiResult]); // <--- aiResult를 반드시 넣어줘야 합니다!

  // 2. 로딩이 시작될 때 스크롤 상단 이동
  useEffect(() => {
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);

  return (
    <>
      <AnalysisStepContainer
        guideContent={sajuGuide}
        loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
        resultComponent={ReportTemplateNewYear}
        loadingTime={0}
      />
      <div dangerouslySetInnerHTML={{ __html: reportStyleBlue }} />
    </>
  );
}
