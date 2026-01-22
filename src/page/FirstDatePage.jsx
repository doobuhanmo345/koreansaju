import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
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
import { getPromptFromDB } from '../service/SajuAnalysisService';

// 퀘스천 그룹을 컴포넌트 밖으로 이동 (재렌더링 방지)
const QUESTION_GROUPS = [
  {
    id: 'meet',
    label: { ko: '어떻게 만났나요?', en: 'How did you meet?' },
    options: [
      { id: 'friend', ko: '지인소개', en: 'Intro', prompt: '지인소개로 만난 사람이에요' },
      { id: 'app', ko: '데이팅 앱', en: 'Dating App', prompt: '데이팅 앱으로 만난 사람이에요' },
      { id: 'work', ko: '일/학교', en: 'Work/School', prompt: '일/학교에서 만났어요' },
      {
        id: 'natural',
        ko: '자연스러운 만남',
        en: 'Natural',
        prompt: '자연스러운 만남으로 만났어요',
      },
      { id: 'etc', ko: '기타', en: 'Other', prompt: '' },
    ],
  },
  {
    id: 'status',
    label: { ko: '현재 관계의 온도', en: 'Relationship Status' },
    options: [
      {
        id: 'planned',
        ko: '만남 예정',
        en: 'Planned',
        prompt: '아직 만난적 없지만 이 날 만날거에요.',
      },
      { id: 'talking', ko: '연락 중', en: 'Talking', prompt: '몇 번 만났었어요.' },
      {
        id: 'metOnce',
        ko: '한번 만남',
        en: 'Met Once',
        prompt: '한번 만났어요. 이날 두번째 만나요',
      },
      { id: 'vibeOnly', ko: '얼굴만 아는 사이', en: 'Just Vibe', prompt: '얼굴만 아는 사이에요' },
    ],
  },
  {
    id: 'vibe',
    label: { ko: '상대의 첫인상', en: 'First Impression' },
    options: [
      {
        id: 'soft',
        ko: '다정하고 부드러움',
        en: 'Soft',
        prompt: '이 사람은 다정하고 부드러운 사람이에요',
      },
      { id: 'chill', ko: '지적이고 차분함', en: 'Chill', prompt: '이 사람은 지적이고 차분해요' },
      { id: 'active', ko: '열정적이고 외향적', en: 'Active', prompt: '이 사람은 외향적이에요' },
      {
        id: 'mystic',
        ko: '미스테리한 매력',
        en: 'Mysterious',
        prompt: '이 사람은 미스테리한 매력이 있어요',
      },
    ],
  },
];
// SajuAnalysisService.js 내부 혹은 유틸 함수로 분리

export default function FirstDatepage() {
  const { loading, setLoading, setLoadingType, aiResult, setAiResult } = useLoading();
  const [selectedDate, setSelectedDate] = useState(null);
  const detailSectionRef = useRef(null);
  const [dbPrompt, setDbPrompt] = useState(''); // DB에서 가져온 프롬프트를 담을 상태 변수
  useEffect(() => {
    const loadData = async () => {
      // 1. 위에서 만든 함수를 실행해서 변수에 할당
      const content = await getPromptFromDB('daily_s_date');

      // 2. 상태 변수에 저장하여 분석 로직에서 사용
      setDbPrompt(content);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedDate && detailSectionRef.current) {
      detailSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDate]);

  const [question, setQuestion] = useState('');
  const [selectedDateSaju, setSelectedDateSaju] = useState(null);
  const { userData, user, isDailyDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = userData || {};

  const { language } = useLanguage();
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();

  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading || !selectedDate;
  const isDisabled2 = !isDailyDone && isLocked;

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const parseDateFromInput = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const selDate = formatDateForInput(selectedDate) + 'T12:00';

  useEffect(() => {
    if (selectedDate) {
      const timeUnknown = true;
      const result = calculateSaju(selDate, timeUnknown);
      setSelectedDateSaju(result);
    }
  }, [selectedDate, selDate]);

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
    async (onstart) => {
      setAiResult('');
      try {
        await service.analyze(
          AnalysisPresets.dailySpecific({
            saju: saju,
            gender: gender,
            language: language,
            selectedDate: selectedDate,
            sajuDate: selectedDateSaju,
            question: question,
            type: 'firstDate',
            promptAdd: dbPrompt,
          }),
        );
        onstart();
      } catch (error) {
        console.error(error);
      }
    },
    [service, saju, gender, language, selectedDate, question, selectedDateSaju, setAiResult],
  );

  const [selections, setSelections] = useState({ meet: '', status: '', vibe: '' });

  // 선택/해제 핸들러 최적화
  const handleSelect = useCallback((groupId, optionId, optionPrompt) => {
    setSelections((prevSelections) => {
      // 이미 선택된 항목을 다시 클릭하면 해제
      const isAlreadySelected = prevSelections[groupId] === optionId;
      const newSelections = {
        ...prevSelections,
        [groupId]: isAlreadySelected ? '' : optionId,
      };

      // 프롬프트 업데이트
      const updatedPrompts = QUESTION_GROUPS.map((group) => {
        if (group.id === groupId) {
          return isAlreadySelected ? '' : optionPrompt;
        }

        const selectedOptionId = newSelections[group.id];
        const foundOption = group.options.find((opt) => opt.id === selectedOptionId);
        return foundOption ? foundOption.prompt : null;
      });

      const combined = '이 날 만날 사람은 ' + updatedPrompts.filter(Boolean).join(', ');
      setQuestion(combined);

      return newSelections;
    });
  }, []);

  const datePickerSection = useCallback(() => {
    const today = new Date();
    
    return (
      <div className="w-full max-w-md mx-auto py-8">
        <div className="mb-6">
          <header className="mb-6 px-1">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                <span className="font-bold">01.</span>
                <span className="ml-3 italic font-serif text-rose-500/80">
                  {language === 'ko' ? '날짜 선택' : 'Select day'}
                </span>
              </h2>
            </div>
            <p className="mt-4 text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">
              {language === 'ko' ? '이 분과 언제 만나나요?' : 'When are you meeting?'}
            </p>
          </header>

          <CustomCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </div>
        {selectedDate && (
          <div className="border-t border-slate-100 dark:border-slate-800" ref={detailSectionRef}>
            <header className="px-1 mb-6">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                  <span className="font-bold">02.</span>
                  <span className="ml-3 italic font-serif text-rose-500/80">
                    {language === 'ko'
                      ? '커넥션 디테일 (선택사항)'
                      : 'Connection Details(Optional)'}
                  </span>
                </h2>
              </div>
              {/* {selectedDate && (
                <span className="text-[11px] font-serif italic text-rose-500/80 tracking-tight">
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )} */}
              <p className="mt-4 text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">
                {language === 'ko' ? '정교한 분석을 위한 옵션' : 'For precise alignment'}
              </p>
            </header>

            <div className="mt-3 space-y-6 relative">
              <div className="absolute left-[13px] top-2 bottom-0 w-[1px] bg-slate-50 dark:bg-slate-800/50" />

              {QUESTION_GROUPS.map((group, index) => (
                <div
                  key={group.id}
                  className="relative pl-12 animate-in fade-in slide-in-from-bottom-4 duration-1000"
                >
                  <div className="absolute left-0 top-0 w-[27px] h-[27px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center z-10">
                    <span className="text-[10px] font-black text-slate-900 dark:text-white">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="mb-6">
                    <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white block mb-2">
                      {language === 'ko' ? group.label.ko : group.label.en}
                    </label>
                    <div className="h-[1px] w-12 bg-rose-400/30" />
                  </div>

                  <div className="flex flex-wrap gap-x-2 gap-y-3">
                    {group.options.map((opt) => {
                      const isSelected = selections[group.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(group.id, opt.id, opt.prompt)}
                          className={`
                px-5 py-2.5 text-[12px] font-medium transition-all duration-500
                ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl -translate-y-1'
                    : 'bg-white dark:bg-slate-800/30 text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-slate-300'
                }
              `}
                        >
                          {language === 'ko' ? opt.ko : opt.en}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }, [language, selectedDate, selections, handleSelect]);

  const sajuGuide = useCallback(
    (onStart) => {
      if (loading) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;
      }

      return (
        <div className="max-w-md mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-3 duration-1000">
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
                    we'll read how beautifully your universes align
                  </span>{' '}
                  with that special someone.
                </>
              )}
            </p>
          </header>

          <section className="mb-12">{datePickerSection()}</section>

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
    },
    [
      loading,
      saju,
      isTimeUnknown,
      language,
      datePickerSection,
      handleStartClick,
      isDisabled,
      isDisabled2,
      isLocked,
      user,
      userData,
    ],
  );

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
