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
import AnalyzeButton from '../component/AnalyzeButton';
import { langPrompt, hanja } from '../data/constants';
import { getPillars } from '../utils/sajuCalculator';
import { fetchGeminiAnalysis } from '../api/gemini';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { calculateSajuData } from '../utils/sajuLogic';
import { getEng } from '../utils/helpers';
import { ref, get, child } from 'firebase/database';
import { database } from '../lib/firebase';
import LoadingFourPillar from '../component/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '../service/SajuAnalysisService';
import DayLuckPage from './DayLuckPage';
import ReportTemplateToday from '../component/ReportTemplateToday';
import ReportHid from '../component/ReportHid';
import { Brain, Users, Database } from 'lucide-react';
import { reportStyle, reportStyleBlue } from '../data/aiResultConstants';
// 1. 로딩 컴포넌트

// 2. 메인 페이지 컴포넌트
export default function TodaysLuckPage() {
  const { loading, setLoading, setLoadingType, aiResult, setAiResult } = useLoading();
  const [sajuData, setSajuData] = useState(null);
  const { userData, user, isDailyDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender,saju } = userData || {};
  const { language } = useLanguage();
  // useUsageLimit에서 editCount와 setEditCount 가져오기
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading;
  const isDisabled2 = !isDailyDone && isLocked;
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
      await service.analyze(AnalysisPresets.daily({ saju, gender, language }));
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
      <div className="max-w-lg mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* 상단 비주얼: 🔮 대신 오늘을 상징하는 해/달 또는 달력 이모지 */}
        <div>
          {/* 타이틀: 매일의 흐름을 강조 */}
          <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
            {language === 'ko' ? '사자가 읽어주는' : "by Saza's Saju reading"}

            <br />
            <span className=" relative text-amber-600 dark:text-amber-500">
              {language === 'ko' ? '당신의 오늘' : 'Luck of the day'}
              <div className="absolute inset-0 bg-amber-200/50 dark:bg-amber-800/60 blur-md rounded-full scale-100"></div>
            </span>
          </h2>
        </div>
        {/* 설명문구: 줄줄이 쓰지 않고 핵심만 */}
        <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
          <p className="text-sm">
            {language === 'ko' ? (
              <>
                사주로 보는
                <strong>오늘의 재물운, 연애운</strong>부터 <strong>오늘의 방향과 컬러</strong>
                까지! 운명 지도 분석.
              </>
            ) : (
              'Including ‘Total score’, ‘Daily short report: Wealth, Love etc.’, ‘Lucky color, direction, keywords of the day’'
            )}
          </p>

          <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img
              src="/images/introcard/todaysluck_1.webp"
              alt="today's luck"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* [NEW] Primary Analyze Button (Original Position) */}
        <div className="mb-12">
          <AnalyzeButton
            onClick={() => handleStartClick(onStart)}
            disabled={isDisabled || isDisabled2}
            loading={loading}
            isDone={isDailyDone}
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

        {/* 4. 하단 3단 정보 바 (참고: NewYearKr.jsx) */}
        <div className="w-full flex items-center mt-12 px-2 py-4 border-t border-[#E8DCCF] dark:border-slate-800">
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

      {/* Preview Section - NewYearKr Landing Page Style */}
      <div className="mt-10 text-left">
        <div className="mx-4 my-10 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-orange-200 bg-orange-50/50 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[11px] font-bold text-orange-600 tracking-tight uppercase">
              Preview Mode
            </span>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              {language === 'ko' ? '사자의 눈으로 바라본 오늘' : "Saza's Daily Insight"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
              {language === 'ko'
                ? '오늘 하루 작용할 운의 흐름과 주요 포인트를 간단히 요약해드려요'
                : "Preview today's flow and key points derived from your fate"}
            </p>
          </div>
        </div>

        {/* Mock Report Structure using real sjsj- classes */}
        <div className="sjsj-report-container !mx-0 !p-0 bg-transparent">
          <div className="sjsj-content-inner !p-0">
            {/* 1. 오늘의 총운 Section */}
            <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
              <div className="px-6 pt-6">
                <div className="sjsj-section-label">
                  <h2 className="sjsj-subTitle">
                    {language === 'ko' ? '오늘의 총운' : "Today's Luck"}
                  </h2>
                </div>
                <div className="sjsj-section-label">
                  <p className="sjsj-label-main">
                    {language === 'ko' ? '운의 흐름과 핵심 조언' : 'Energy flow & core advice'}
                  </p>
                </div>
                
                <div className="sjsj-month-card opacity-40 grayscale select-none pointer-events-none">
                  <div className="sjsj-month-header">
                    <div className="sjsj-month-title">
                      <h3>2026.01.26</h3>
                      <div className="sjsj-progress-bar">
                        <div className="sjsj-progress-fill" style={{ width: '85%' }}></div>
                        {language === 'ko' ? '85점' : '85 Score'}
                      </div>
                    </div>
                    <div className="sjsj-star-rating">★★★★☆</div>
                  </div>
                  <div className="sjsj-month-summary-chips">
                    <div>
                      <span className="sjsj-check">✓</span> {language === 'ko' ? '주의: 무리한 투자, 조급한 결단' : 'Caution: Over-investing, Hasty decisions'}
                    </div>
                    <div>
                      ▷ {language === 'ko' ? '활용: 동료와 협업, 주변 조언 경청' : 'Action: Collaborate, Listen to advice'}
                    </div>
                  </div>
                  <p className="sjsj-long-text">
                    {language === 'ko' 
                      ? '오늘은 그동안 준비해온 일들이 결실을 맺기 시작하는 시기입니다. 당신의 끈기 있는 노력이 주변의 인정을 받게 되며, 특히 오전 중에 찾아오는 기회를 놓치지 않는 것이 중요합니다. 타인의 시선보다는 스스로의 중심을 지킬 때 더 큰 성과가 따라올 것입니다. 오후에는 잠시 숨을 고르며 주변을 정리하는 시간을 가져보세요.' 
                      : 'Today is when your steady efforts finally start bearing fruit. Your persistence will be recognized by those around you, and it is crucial not to miss opportunities arriving in the morning. Staying centered and trusting yourself rather than the eyes of others will bring greater results. Take some time in the afternoon to breathe and organize your surroundings.'}
                  </p>
                  <div className="sjsj-card-footer">
                    <div className="sjsj-footer-msg">
                      {language === 'ko' ? '열정적인 에너지가 당신의 하루를 이끌 것이니 망설이지 마세요.' : 'Enthusiastic energy will guide your day, so do not hesitate.'}
                    </div>
                  </div>
                </div>
              </div>

              <ReportHid
                gradientColor="#FAF7F4"
                badge={['1', language === 'ko' ? '총운' : 'Summary']}
                title={
                  language === 'ko' ? (
                    <>
                      오늘을 관통하는 <span className="text-[#F47521]">핵심 가이드</span>
                    </>
                  ) : (
                    <>
                      Core Guide to <span className="text-[#F47521]">Today's Energy</span>
                    </>
                  )
                }
                des={
                  language === 'ko'
                    ? '오늘 하루 당신의 중심을 잡아줄 총운 점수와 상세 분석을 제공합니다.'
                    : "Provides a score and detailed analysis that will center your day today."
                }
                hClass="h-[600px]"
                mClass="mt-[-300px]"
              />
            </section>

            {/* 2. 행운의 요소 Section */}
            <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
              <div className="px-6 pt-6">
                <div className="sjsj-section-label">
                  <p className="sjsj-label-main">
                    {language === 'ko' ? '오늘의 행운의 요소' : 'Lucky Elements'}
                  </p>
                </div>

                <div className="sjsj-analysis-box opacity-40 grayscale select-none pointer-events-none mb-6">
                  <div className="sjsj-keyword-grid">
                    <div className="sjsj-keyword-col">
                      <div className="sjsj-col-title text-fire">
                        {language === 'ko' ? '행운의 방향' : 'Direction'}
                      </div>
                      <ul className="sjsj-list">
                        <li>{language === 'ko' ? '남동쪽: 새로운 기회의 방위' : 'Southeast: New opportunities'}</li>
                      </ul>
                    </div>
                    <div className="sjsj-keyword-col">
                      <div className="sjsj-col-title text-earth">
                        {language === 'ko' ? '행운의 컬러' : 'Lucky color'}
                      </div>
                      <ul className="sjsj-list">
                        <li><span className="sjsj-check">✓</span> {language === 'ko' ? '오렌지: 창의력과 활기' : 'Orange: Creativity & Vitality'}</li>
                      </ul>
                    </div>
                    <div className="sjsj-keyword-col">
                      <div className="sjsj-col-title text-earth">
                        {language === 'ko' ? '키워드' : 'Keywords'}
                      </div>
                      <ul className="sjsj-list">
                        <li>
                          <span className="sjsj-delta">△</span>
                          <div>
                            <strong>{language === 'ko' ? '#성공 #도전 #결실' : '#Success #Challenge #Results'}</strong>
                            <br />
                            {language === 'ko' ? '변화를 두려워하지 않는 마음' : 'A mind that fears no change'}
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <ReportHid
                gradientColor="#FAF7F4"
                badge={['2', language === 'ko' ? '행운' : 'Luck']}
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
      </div>
  {/* 시작 버튼: handleDailyStartClick 연결 */}
      <AnalyzeButton
          onClick={() => handleStartClick(onStart)}
          disabled={isDisabled || isDisabled2}
          loading={loading}
          isDone={isDailyDone}
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
  };
  useEffect(() => {
    if (aiResult) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [aiResult]);

  // 추가: 로딩이 시작될 때도 상단으로 올리고 싶다면 (선택 사항)
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
        resultComponent={ReportTemplateToday}
        loadingTime={0}
      />
      <div dangerouslySetInnerHTML={{ __html: reportStyle }} />
    </>
  );
}
