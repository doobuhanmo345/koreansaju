import { useState, useCallback, useMemo } from 'react';
import AnalysisStepContainer from '../component/AnalysisStepContainer';
import { useAuthContext } from '../context/useAuthContext';
import { useUsageLimit } from '../context/useUsageLimit';
import { useLoading } from '../context/useLoadingContext';
import { UI_TEXT } from '../data/constants';
import { useLanguage } from '../context/useLanguageContext';
import { classNames } from '../utils/helpers';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { langPrompt, hanja } from '../data/constants';
import EnergyBadge from '../ui/EnergyBadge';
import LoadingFourPillar from '../component/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '../service/SajuAnalysisService';
import ReportTemplateSelDate from '../component/ReportTemplateSelDate';
import DateInput from '../ui/DateInput';
import AnalyzeButton from '../component/AnalyzeButton';
import ReportHid from '../component/ReportHid';
import { Calendar, Zap, Target } from 'lucide-react';

const PURPOSE_OPTIONS = [
  { id: 'moving', ko: '이사', en: 'Moving' },
  { id: 'wedding', ko: '결혼', en: 'Wedding' },
  { id: 'opening', ko: '개업', en: 'Business Opening' },
  { id: 'travel', ko: '여행', en: 'Travel' },
  { id: 'contract', ko: '계약', en: 'Contract' },
  { id: 'surgery', ko: '수술/시술', en: 'Surgery/Procedure' },
  { id: 'meeting', ko: '중요한 미팅', en: 'Important Meeting' },
  { id: 'other', ko: '기타 중요한 일', en: 'Other Important Event' },
];

export default function SelDatePage() {
  const { loading, setLoading, setAiResult, aiResult } = useLoading();
  const { userData, user } = useAuthContext();
  const { saju, gender, isTimeUnknown } = userData || {};
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();

  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    return nextMonth.toISOString().split('T')[0];
  });

  const isDisabled = !user || loading || !selectedPurpose || !startDate || !endDate;

  // 최대 100일 제한 계산
  const maxDate = useMemo(() => {
    const start = new Date(startDate);
    const max = new Date(start);
    max.setDate(start.getDate() + 100);
    return max.toISOString().split('T')[0];
  }, [startDate]);

  const handleQuickSelect = (amount, unit = 'months') => {
     const start = new Date(startDate);
     const end = new Date(start);
     
     if (unit === 'weeks') {
       end.setDate(start.getDate() + (amount * 7));
     } else {
       end.setMonth(start.getMonth() + amount);
     }
     
     // 100일 초과 시 maxDate로 설정 (혹은 단순 적용)
     // 2달은 60일 정도라 100일 안넘으므로 안전함.
     setEndDate(end.toISOString().split('T')[0]);
  };
  
  // const handleThisYear = ... (제거: 100일 넘을 수 있음)

  const service = useMemo(
    () =>
      new SajuAnalysisService({
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
      }),
    [user, userData, language, MAX_EDIT_COUNT, setEditCount, setLoading, setAiResult],
  );

  const handleStartClick = useCallback(
    async (onStart) => {
      // 100일 제한 유효성 검사
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 100) {
        alert(language === 'ko' ? '기간은 최대 100일까지 선택 가능합니다.' : 'Date range cannot exceed 100 days.');
        return;
      }

      setAiResult('');
      try {
        const purposeLabel = PURPOSE_OPTIONS.find(p => p.id === selectedPurpose);
        const purposeText = language === 'ko' ? purposeLabel?.ko : purposeLabel?.en;
        
        await service.analyze(
          AnalysisPresets.selDate({
            saju,
            gender,
            language,
            startDate,
            endDate,
            purpose: purposeText,
          }),
        );
        onStart();
      } catch (error) {
        console.error(error);
      }
    },
    [service, saju, gender, language, startDate, endDate, selectedPurpose, setAiResult],
  );

  const selectionSection = useCallback(() => {
    return (
      <div className="w-full max-w-xl mx-auto py-8">
        <div className="mb-10">
          <header className="mb-6 px-1">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                <span className="font-bold">01.</span>
                <span className="ml-3 italic font-serif text-emerald-600/80">
                  {language === 'ko' ? '목적 선택' : 'Select Purpose'}
                </span>
              </h2>
            </div>
            <p className="mt-4 text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">
              {language === 'ko' ? '어떤 중요한 일을 앞두고 계신가요?' : 'What is the occasion?'}
            </p>
          </header>
          
          <div className="grid grid-cols-2 gap-3">
            {PURPOSE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedPurpose(opt.id)}
                className={`
                  px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300
                  ${
                    selectedPurpose === opt.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md ring-2 ring-emerald-200 dark:ring-emerald-900'
                      : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }
                `}
              >
                {language === 'ko' ? opt.ko : opt.en}
              </button>
            ))}
          </div>
        </div>

        {selectedPurpose && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-6 px-1">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                  <span className="font-bold">02.</span>
                  <span className="ml-3 italic font-serif text-emerald-600/80">
                    {language === 'ko' ? '기간 선택' : 'Date Range'}
                  </span>
                </h2>
              </div>
              <p className="mt-4 text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">
                {language === 'ko' ? '언제가 좋을지 알아볼까요? (최대 100일)' : 'When are you planning? (Max 100 days)'}
              </p>
            </header>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
               <div className="flex flex-col gap-4">
                 <DateInput 
                    label="START DATE"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                    language={language}
                    color="emerald"
                 />
                 <DateInput 
                    label="END DATE"
                    value={endDate}
                    min={startDate}
                    max={maxDate} // 100일 제한 적용
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                    language={language}
                    color="emerald"
                 />
               </div>

               <div className="flex flex-wrap gap-2 justify-center">
                 <button 
                  onClick={() => handleQuickSelect(2, 'weeks')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-full border border-slate-200 dark:border-slate-600 transition-colors"
                 >
                    +2 {language === 'ko' ? '주' : 'Weeks'}
                 </button>
                 <button 
                  onClick={() => handleQuickSelect(1, 'months')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-full border border-slate-200 dark:border-slate-600 transition-colors"
                 >
                    +1 {language === 'ko' ? '달' : 'Month'}
                 </button>
                  <button 
                  onClick={() => handleQuickSelect(2, 'months')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-full border border-slate-200 dark:border-slate-600 transition-colors"
                 >
                    +2 {language === 'ko' ? '달' : 'Months'}
                 </button>
               </div>
            </div>
            <p className="text-center mt-3 text-xs text-emerald-600/80 italic">
                * {language === 'ko' ? '선택하신 기간 중에서 가장 좋은 날짜들을 뽑아드립니다' : 'Finding the best dates within this period'}
            </p>
          </div>
        )}
      </div>
    );
  }, [language, selectedPurpose, startDate, endDate, maxDate]);

  const sajuGuide = useCallback(
    (onStart) => {
      if (loading) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;
      }
      return (
        <div className="max-w-md mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-3 duration-1000">
           <header className="text-right mb-12">
            <div className="inline-block px-2 py-1 mb-4 bg-slate-50 dark:bg-slate-800 rounded text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
              Auspicious Day
            </div>
            <h2 className="text-4xl font-light text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              {language === 'ko' ? '찾아 드리는' : 'Finding your'} <br />
              <span className="font-serif italic font-medium text-emerald-600/80">
                {language === 'ko' ? '최고의 날' : 'Best Days'}
              </span>
            </h2>
            <p className="mt-6 text-[13px] text-slate-400 dark:text-slate-500 leading-relaxed w-full">
              {language === 'ko' ? (
                <>
                  중요한 시작을 앞두고 계신가요?<br />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    천상의 기운이 당신을 돕는 날
                  </span>을<br/>
                  정교하게 분석해 드립니다.
                </>
              ) : (
                <>
                  Planning something important?<br />
                  Let us find the days when <br/>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    the universe supports you the most.
                  </span>
                </>
              )}
            </p>
          </header>

          <section className="mb-12">{selectionSection()}</section>

          <footer className="space-y-6">
            <AnalyzeButton
              onClick={() => handleStartClick(onStart)}
              disabled={isDisabled}
              loading={false}
              isDone={false}
              label={language === 'ko' ? '좋은 날짜 받기' : 'Find Best Dates'}
              color='emerald'
            />
          </footer>

          {/* 3-Column Info Bar */}
          <div className="w-full flex items-center mt-12 mb-12 px-2 py-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
              <Calendar size={18} className="text-emerald-500" />
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 leading-tight text-center">
                {language === 'ko' ? '길일 선정' : 'Auspicious'}
                <br />
                <span className="font-medium text-[9px]">DATE</span>
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 shrink-0"></div>
            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
              <Zap size={18} className="text-emerald-500" />
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 leading-tight text-center">
                {language === 'ko' ? '기운 분석' : 'Energy'}
                <br />
                <span className="font-medium text-[9px]">ANALYSIS</span>
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 shrink-0"></div>
            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
              <Target size={18} className="text-emerald-500" />
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 leading-tight text-center">
                {language === 'ko' ? '맞춤 조언' : 'Personalized'}
                <br />
                <span className="font-black">STRATEGY</span>
              </span>
            </div>
          </div>

          {/* Preview Section - SelDate Teaser */}
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
                onClick={() => handleStartClick(onStart)}
                disabled={isDisabled}
                loading={false}
                isDone={false}
                label={language === 'ko' ? '좋은 날짜 받기' : 'Find Best Dates'}
                color='emerald'
              />
            </div>
          </div>
        </div>
      );
    },
    [loading, saju, isTimeUnknown, language, selectionSection, handleStartClick, isDisabled, isLocked, user, userData]
  );

  return (
    <AnalysisStepContainer
      guideContent={sajuGuide}
      loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
      resultComponent={ReportTemplateSelDate}
      loadingTime={0}
    />
  );
}