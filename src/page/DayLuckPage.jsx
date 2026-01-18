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
      console.log('useeffect', inputDate, selDate);
      // 훅이 아니라 일반 함수를 호출하세요! (순수 JS 로직)
      const result = calculateSaju(selDate, timeUnknown);
      setSelectedDateSaju(result);
    }
  }, [selectedDate]);
  console.log(selDate, selectedDateSaju);
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
    const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    return (
      <div className="space-y-4 mb-8 p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {language === 'ko' ? '운세를 보고 싶은 날짜' : 'Select a date'}
          </label>
        </div>

        <input
          type="date"
          value={formatDateForInput(selectedDate)}
          onChange={(e) => setSelectedDate(parseDateFromInput(e.target.value))}
          min={formatDateForInput(minDate)}
          max={formatDateForInput(maxDate)}
          className="w-full px-4 py-3 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-all"
        />

        {selectedDate &&
          (() => {
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth() + 1;
            const day = selectedDate.getDate();
            return (
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                {language === 'ko'
                  ? `선택된 날짜: ${year}년 ${month}월 ${day}일`
                  : `Selected date: ${selectedDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}`}
              </div>
            );
          })()}

        {/* 질문 입력 */}
        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {language === 'ko' ? '궁금한 점 (선택사항)' : 'Question (Optional)'}
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={language === 'ko' ? '궁금한 점을 입력해주세요' : 'Enter your question'}
            className="w-full mt-2 px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-all"
            rows="3"
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
      <div className="max-w-lg mx-auto text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        {/* 상단 비주얼 */}
        <div>
          {/* 타이틀 */}
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
            {language === 'ko' ? '사자가 읽어주는' : "by Saza's Saju reading"}
            <br />
            <span className="relative text-amber-600 dark:text-amber-500">
              {language === 'ko' ? '특정일의 운세' : 'Specific Date Fortune'}
              <div className="absolute inset-0 bg-amber-200/50 dark:bg-amber-800/60 blur-md rounded-full scale-100"></div>
            </span>
          </h2>

          {/* 설명문구 */}
          <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
            <p className="text-sm">
              {language === 'ko' ? (
                <>
                  특정 날짜의 <strong>재물운, 연애운</strong>부터 <strong>방향과 컬러</strong>
                  까지! 당신이 원하는 날의 운명을 미리 확인해보세요.
                </>
              ) : (
                "Check the fortune for any specific day: including 'Wealth luck, Love luck', 'Lucky color, direction, keywords'"
              )}
            </p>

            <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
              <img
                src="/images/introcard/specificdate_luck.png"
                alt="specific date luck"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* 날짜 선택 섹션 */}
        {datePickerSection()}

        {/* 시작 버튼 */}
        <button
          onClick={() => handleStartClick(onStart)}
          disabled={isDisabled || isDisabled2}
          className={classNames(
            'w-full px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
            isDisabled
              ? DISABLED_STYLE
              : 'bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white shadow-amber-200 hover:-translate-y-1',
          )}
        >
          {language === 'ko' ? '특정일 운세 확인하기' : 'Check Fortune'}

          {isDailyDone ? (
            <div className="flex items-center gap-1 backdrop-blur-md bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
              <span className="text-[9px] font-bold text-white uppercase">Free</span>
              <TicketIcon className="w-3 h-3 text-white" />
            </div>
          ) : isLocked ? (
            <div className="mt-1 flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded-full border shadow-sm relative z-10 border-gray-500/50 bg-gray-400/40">
              <LockClosedIcon className="w-4 h-4 text-amber-500" />
            </div>
          ) : (
            user && (
              <div className="relative scale-90">
                <EnergyBadge active={userData?.birthDate} consuming={loading} cost={-1} />
              </div>
            )
          )}
        </button>

        {isLocked ? (
          <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {language === 'ko' ? '크레딧이 부족합니다..' : 'Not Enough credit'}
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
