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
            <button
              onClick={() => handleStartClick(onStart)}
              disabled={isDisabled}
              className={classNames(
                'w-full py-5 text-sm font-bold tracking-widest uppercase transition-all duration-500',
                isDisabled
                  ? 'text-slate-300 cursor-not-allowed bg-slate-50 dark:bg-slate-800'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-[0.98]',
              )}
            >
              <div className="flex items-center justify-center gap-3">
                {language === 'ko' ? '좋은 날짜 받기' : 'Find Best Dates'}
                {isLocked ? (
                  <LockClosedIcon className="w-4 h-4 text-emerald-400" />
                ) : (
                  user && <EnergyBadge active={userData?.birthDate} consuming={loading} cost={-1} />
                )}
              </div>
            </button>
          </footer>
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