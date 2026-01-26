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
import ReportTemplateSelBirth from '../component/ReportTemplateSelBirth';

import DateInput from '../ui/DateInput';
import BdInput from '../ui/BdInput';
import AnalyzeButton from '../component/AnalyzeButton';
import ReportHid from '../component/ReportHid';
import { Baby, Sparkles, Target } from 'lucide-react';
export default function SelBirthPage() {
  const { loading, setLoading, setAiResult, aiResult, setLastParams } = useLoading();
  const { userData, user } = useAuthContext();
  const { saju, gender, isTimeUnknown } = userData || {};
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();

  // 출산 예정일 (기본값: 오늘로부터 약 5개월 뒤? 혹은 그냥 오늘)
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date();
    const future = new Date(today);
    future.setDate(today.getDate() + 90);
    return future.toISOString().split('T')[0];
  });

  const [partnerBirthInfo, setPartnerBirthInfo] = useState(() => {
    // 기본값: "1990-01-01T12:00"
    return '1990-01-01T12:00';
  });
  const [partnerTimeUnknown, setPartnerTimeUnknown] = useState(true);

  // 선택된 기간 옵션 (1, 2, 3주)
  const [rangeWeeks, setRangeWeeks] = useState(2); // 기본 2주

  // 실제 계산된 startDate, endDate
  const { startDate, endDate } = useMemo(() => {
    const end = new Date(dueDate);
    const start = new Date(dueDate);
    start.setDate(end.getDate() - (rangeWeeks * 7)); // 예정일로부터 n주 전

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }, [dueDate, rangeWeeks]);

  // 출산 방식 (기본값: 제왕절개)
  const [birthMethod, setBirthMethod] = useState('cesarean');
  // 아이 성별 (기본값: 모름)
  const [babyGender, setBabyGender] = useState('unknown');

  const isDisabled = !user || loading || !dueDate;

  const handleRangeSelect = (weeks) => {
    setRangeWeeks(weeks);
  };

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
        setLastParams,
      }),
    [user, userData, language, MAX_EDIT_COUNT, setEditCount, setLoading, setAiResult, setLastParams],
  );

  const handleStartClick = useCallback(
    async (onStart) => {
      setAiResult('');
      try {
        const methodText = birthMethod === 'natural' 
          ? (language === 'ko' ? '자연분만' : 'Natural Birth')
          : (language === 'ko' ? '제왕절개' : 'Cesarean Section');
          
        const genderText = babyGender === 'boy' 
          ? (language === 'ko' ? '남아' : 'Boy')
          : babyGender === 'girl' 
            ? (language === 'ko' ? '여아' : 'Girl')
            : (language === 'ko' ? '성별모름' : 'Unknown');

        const purposeText = `${language === 'ko' ? '출산 택일' : 'Childbirth Selection'} (${methodText}, ${genderText})`;
        
        await service.analyze(
          AnalysisPresets.selBirth({
            saju,
            gender,
            language,
            startDate,
            endDate,
            purpose: purposeText,
            dueDate,
            partnerBirthDate: partnerBirthInfo,
            partnerTimeUnknown,
            birthMethod,
            babyGender,
          }),
        );
        onStart();
      } catch (error) {
        console.error(error);
      }
    },
    [service, saju, gender, language, startDate, endDate, dueDate, partnerBirthInfo, partnerTimeUnknown, birthMethod, setAiResult],
  );

  const selectionSection = useCallback(() => {
    return (
      <div className="w-full max-w-lg mx-auto py-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="mb-6 px-1">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                <span className="font-bold">01.</span>
                <span className="ml-3 italic font-serif text-emerald-600/80">
                  {language === 'ko' ? '정보 입력' : 'Information'}
                </span>
              </h2>
            </div>
          </header>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-8">
              <div className="flex flex-col gap-6">
                {/* 1. 배우자 정보 (이제 첫번째) */}
                <BdInput
                  label={gender === 'female' 
                    ? (language === 'ko' ? '아빠(배우자) 생년월일' : "FATHER'S BIRTH DATE")
                    : (language === 'ko' ? '엄마(배우자) 생년월일' : "MOTHER'S BIRTH DATE")
                  }
                  language={language}
                  value={partnerBirthInfo}
                  onChange={setPartnerBirthInfo}
                  isTimeUnknown={partnerTimeUnknown}
                  setIsTimeUnknown={setPartnerTimeUnknown}
                  color="indigo"
                />

                {/* 2. 출산 예정일 */}
                <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50">
                  <DateInput 
                    label={language === 'ko' ? "출산 예정일" : "EXPECTED DUE DATE"}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full"
                    language={language}
                    color="emerald"
                  />
                </div>

                {/* 3. 출산 방식 */}
                <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50">
                  <p className="mb-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                    {language === 'ko' ? '출산 방식' : 'BIRTH METHOD'}
                  </p>
                  <div className="flex gap-2">
                    {[
                      { id: 'natural', label: language === 'ko' ? '자연분만' : 'Natural' },
                      { id: 'cesarean', label: language === 'ko' ? '제왕절개' : 'Cesarean' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setBirthMethod(method.id)}
                        className={`flex-1 py-4 text-sm font-bold rounded-xl transition-all duration-300 ${
                          birthMethod === method.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. 아이 성별 */}
                <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50">
                  <p className="mb-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                    {language === 'ko' ? '아이 성별' : "BABY'S GENDER"}
                  </p>
                  <div className="flex gap-2">
                    {[
                      { id: 'boy', label: language === 'ko' ? '남아' : 'Boy' },
                      { id: 'girl', label: language === 'ko' ? '여아' : 'Girl' },
                      { id: 'unknown', label: language === 'ko' ? '모름' : 'Unknown' }
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setBabyGender(g.id)}
                        className={`flex-1 py-4 text-sm font-bold rounded-xl transition-all duration-300 ${
                          babyGender === g.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. 기간 선택 */}
              <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50">
                <p className="mb-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                  {language === 'ko' ? '택일 범위 (예정일 기준)' : 'RANGE BEFORE DUE DATE'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((week) => (
                    <button 
                      key={week}
                      onClick={() => handleRangeSelect(week)}
                      className={`
                        py-4 text-sm font-bold rounded-xl transition-all duration-300
                        ${
                          rangeWeeks === week
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }
                      `}
                    >
                      {week}{language === 'ko' ? '주' : 'w'}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[11px] font-bold text-emerald-600/60 font-serif lowercase tracking-tighter">
                    {startDate} ~ {endDate}
                  </p>
                </div>
              </div>
          </div>
        </div>
      </div>
    );
  }, [language, dueDate, rangeWeeks, startDate, endDate, partnerBirthInfo, partnerTimeUnknown, gender, birthMethod, babyGender]);

  const sajuGuide = useCallback(
    (onStart) => {
      if (loading) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;
      }
      return (
        <div className="max-w-xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-3 duration-1000">
           <header className="text-right mb-12">
            <div className="inline-block px-2 py-1 mb-4 bg-slate-50 dark:bg-slate-800 rounded text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
              Childbirth Selection
            </div>
            <h2 className="text-4xl font-light text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              {language === 'ko' ? '세상과 만나는' : 'Meeting the World'} <br />
              <span className="font-serif italic font-medium text-emerald-600/80">
                {language === 'ko' ? '첫 순간의 기록' : 'The First Moment'}
              </span>
            </h2>
            <p className="mt-6 text-[13px] text-slate-400 dark:text-slate-500 leading-relaxed w-full">
              {language === 'ko' ? (
                <>
                  소중한 아이가 세상에 나오는 날,<br />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    가장 축복받는 시간
                  </span>을<br/>
                  명리학적으로 분석해 드립니다.
                </>
              ) : (
                <>
                  The day your precious child enters the world,<br />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    The most blessed time
                  </span><br/>
                  analyzed through Sajuology.
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
              <Baby size={18} className="text-emerald-500" />
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 leading-tight text-center">
                {language === 'ko' ? '아이 운명' : 'Baby Destiny'}
                <br />
                <span className="font-medium text-[9px]">DESTINY</span>
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 shrink-0"></div>
            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
              <Sparkles size={18} className="text-emerald-500" />
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
                {language === 'ko' ? '성장 전략' : 'Success'}
                <br />
                <span className="font-black">STRATEGY</span>
              </span>
            </div>
          </div>

          {/* Preview Section - SelBirth Teaser */}
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
                    title={language === 'ko' ? <>리스크를 예방하는 <span className="text-red-500">지혜로운 선택</span></> : <>A <span className="text-red-500">Wise Choice</span> to Prevent Risk</>}
                    des={language === 'ko' ? '선천적으로 가질 수 있는 취약점을 사전에 파악하여 부정적인 기운을 멀리하도록 돕습니다.' : "Helps to avoid negative energies by identifying potential vulnerabilities in advance."}
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
    [loading, saju, isTimeUnknown, language, selectionSection, handleStartClick, isDisabled, isLocked, user, userData, partnerBirthInfo, partnerTimeUnknown]
  );

  return (
    <AnalysisStepContainer
      guideContent={sajuGuide}
      loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
      resultComponent={ReportTemplateSelBirth}
      loadingTime={0}
    />
  );
}
