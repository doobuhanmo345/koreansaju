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
import { classNames } from '../utils/helpers';
import { TicketIcon, LockClosedIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { langPrompt, hanja } from '../data/constants';
import { calculateSaju } from '../utils/sajuCalculator';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { calculateSajuData } from '../utils/sajuLogic';
import { ref, get, child } from 'firebase/database';
import { database } from '../lib/firebase';
import LoadingFourPillar from '../component/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '../service/SajuAnalysisService';
import { type } from 'firebase/firestore/pipelines';
import CustomCalendar from '../component/CustomCalendar';
export default function DayLuckPage() {
  const { loading, setLoading, setLoadingType, aiResult, setAiResult } = useLoading();
  const [selectedDate, setSelectedDate] = useState(null);

  const [question, setQuestion] = useState('');
  const [selectedDateSaju, setSelectedDateSaju] = useState(null);
  const { userData, user, isDailyDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = userData || {};

  const { language } = useLanguage();
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();

  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading || !selectedDate;
  const isDisabled2 = !isDailyDone && isLocked;

  // 날짜 입력 포맷 변환 (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  // 입력 포맷에서 Date로 변환
  const parseDateFromInput = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const selDate = formatDateForInput(selectedDate) + 'T12:00';

  useEffect(() => {
    if (selectedDate) {
      const timeUnknown = true;

      // 훅이 아니라 일반 함수를 호출하세요! (순수 JS 로직)
      const result = calculateSaju(selDate, timeUnknown);
      setSelectedDateSaju(result.saju);
    }
  }, [selectedDate]);

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
      // 선택된 날짜의 운세 분석
      await service.analyze(
        AnalysisPresets.dailySpecific({
          saju: saju,
          gender: gender,
          language: language,
          selectedDate: selectedDate,
          question: question,
          sajuDate: selectedDateSaju,
          promptAdd: '',
           type: 'dayluck',
        }),
      );
      onstart();
    } catch (error) {
      console.error(error);
    }
  };

  // 날짜 선택 UI
  const datePickerSection = () => {
    const today = new Date();

    return (
      <div className="w-full max-w-md mx-auto py-8">
        {/* Header Section: 아이콘 없이 텍스트로만 깔끔하게 */}
        <div className="mb-6">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 block mb-4">
            {language === 'ko' ? '01. 날짜 선택' : '01. Select Date'}
          </label>

          {/* 캘린더 호출 */}
          <CustomCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </div>

        {/* 선택된 날짜 & 질문 입력 영역: 경계선을 최소화하고 여백으로 구분 */}
        <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-end mb-4">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              {language === 'ko' ? '02. 질문' : '02. Question'}
            </label>
            {selectedDate && (
              <span className="text-[11px] font-medium text-slate-900 dark:text-white border-b border-slate-900 dark:border-white pb-0.5">
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={language === 'ko' ? '어떤 것이 궁금하신가요?' : 'What’s on your mind?'}
            className="w-full px-0 py-3 text-base bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-0 resize-none min-h-[100px]"
          />
        </div>
      </div>
    );
  };

  // 안내 디자인 정의
  const sajuGuide = (onStart) => {
    if (loading) {
      return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;
    }

    return (
      <div className="max-w-md mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-3 duration-1000">
        {/* 상단 타이틀 영역: 과한 효과 제거, 세련된 폰트 굵기 조절 */}
        <header className=" text-right">
          <div className="inline-block px-2 py-1 mb-4 bg-slate-50 dark:bg-slate-800 rounded text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
            Initial Spark
          </div>
          <h2 className="text-4xl font-light text-slate-900 dark:text-white leading-[1.1] tracking-tight">
            {language === 'ko' ? '사자가 읽어주는' : 'Reading for'} <br />
            <span className="font-serif italic font-medium text-rose-500/80">
              {language === 'ko' ? '특별한 하루' : 'your special day'}
            </span>
          </h2>

          <p className="mt-6 text-[13px] text-slate-400 dark:text-slate-500 leading-relaxed w-full">
            {language === 'ko' ? (
              <>
                새로운 인연이 기다리는 날, <br />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  그 사람과 잘 맞을까?
                </span>{' '}
                정교하게 읽어드립니다.
              </>
            ) : (
              <>
                On a day of new beginnings, <br />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  we’ll read how beautifully your universes align
                </span>{' '}
                with that special someone.
              </>
            )}
          </p>
        </header>

        {/* 날짜 선택 섹션: 불필요한 배경 카드 제거 */}
        <section className="mb-12">{datePickerSection()}</section>

        {/* 하단 액션 섹션 */}
        <footer className="space-y-6">
          <button
            onClick={() => handleStartClick(onStart)}
            disabled={isDisabled || isDisabled2}
            className={classNames(
              'w-full py-5 text-sm font-bold tracking-widest uppercase transition-all duration-500',
              isDisabled
                ? 'text-slate-300 cursor-not-allowed bg-slate-50 dark:bg-slate-800'
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-[0.98]',
            )}
          >
            <div className="flex items-center justify-center gap-3">
              {language === 'ko' ? '운세 확인하기' : 'Check Fortune'}

              {/* 배지 스타일: 심플한 텍스트/아이콘 조합 */}
              {false ? (
                <span className="text-[10px] px-2 py-0.5 border border-white/30 rounded text-white/70 font-medium">
                  FREE
                </span>
              ) : isLocked ? (
                <LockClosedIcon className="w-4 h-4 text-rose-400" />
              ) : (
                user && <EnergyBadge active={userData?.birthDate} consuming={loading} cost={-1} />
              )}
            </div>
          </button>
        </footer>
      </div>
    );
  };

  useEffect(() => {
    if (aiResult) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [aiResult]);

  useEffect(() => {
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);

  return (
    <AnalysisStepContainer
      guideContent={sajuGuide}
      loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
      resultComponent={ViewResult}
      loadingTime={0}
    />
  );
}
