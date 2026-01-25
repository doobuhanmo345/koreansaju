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
