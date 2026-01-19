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
import { COLOR_THEMES } from '../data/theme';
import { getPromptFromDB } from '../service/SajuAnalysisService';
const INTERVIEW_GROUPS = [
  {
    id: 'category',
    label: { ko: '어떤 자리인가요?', en: 'What kind of place?' },
    options: [
      {
        id: 'job',
        ko: '기업 면접',
        en: 'Job Interview',
        prompt: '회사 취업 면접을 앞두고 있어요.',
      },
      {
        id: 'club',
        ko: '동아리/학회',
        en: 'Club/Society',
        prompt: '동아리나 학회 가입을 위한 면접이에요.',
      },
      {
        id: 'exam',
        ko: '국가고시/시험',
        en: 'Exam/Test',
        prompt: '중요한 시험이나 자격증 평가 날이에요.',
      },
      { id: 'etc', ko: '기타 면접', en: 'Other', prompt: '중요한 평가나 면접이 있는 날이에요.' },
    ],
  },
  {
    id: 'vibe',
    label: { ko: '내가 보여줄 모습', en: 'Your Attitude' },
    options: [
      {
        id: 'active',
        ko: '열정적/적극적',
        en: 'Passionate',
        prompt: '열정적이고 적극적인 태도로 임할 계획이에요.',
      },
      {
        id: 'calm',
        ko: '차분함/논리적',
        en: 'Logical',
        prompt: '차분하고 논리적인 대답에 집중할 생각이에요.',
      },
      {
        id: 'humble',
        ko: '겸손함/성실함',
        en: 'Humble',
        prompt: '겸손하고 성실한 인상을 심어주려 해요.',
      },
      {
        id: 'unique',
        ko: '창의적/개성적',
        en: 'Creative',
        prompt: '독특하고 창의적인 매력을 보여주고 싶어요.',
      },
    ],
  },
  {
    id: 'concern',
    label: { ko: '가장 걱정되는 점', en: 'Main Concern' },
    options: [
      {
        id: 'speech',
        ko: '말주변/긴장',
        en: 'Anxiety',
        prompt: '너무 긴장해서 말을 실수할까 봐 걱정돼요.',
      },
      {
        id: 'knowledge',
        ko: '직무/지식',
        en: 'Knowledge',
        prompt: '준비한 답변 외의 어려운 질문이 나올까 걱정돼요.',
      },
      {
        id: 'vibe',
        ko: '압박 면접',
        en: 'Stress',
        prompt: '분위기가 너무 딱딱하거나 압박이 심할까 봐 걱정돼요.',
      },
    ],
  },
];

export default function InterviewPage() {
  const activeTheme = COLOR_THEMES['blue'];
  const { loading, setLoading, setAiResult, aiResult } = useLoading();
  const [selectedDate, setSelectedDate] = useState(null);
  const detailSectionRef = useRef(null);

  useEffect(() => {
    if (selectedDate && detailSectionRef.current) {
      detailSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDate]);

  const [question, setQuestion] = useState('');
  const [selectedDateSaju, setSelectedDateSaju] = useState(null);
  const { userData, user, isDailyDone } = useAuthContext();
  const { birthDate, isTimeUnknown, gender, saju } = userData || {};
  const [dbPrompt, setDbPrompt] = useState(''); // DB에서 가져온 프롬프트를 담을 상태 변수
  useEffect(() => {
    const loadData = async () => {
      // 1. 위에서 만든 함수를 실행해서 변수에 할당
      const content = await getPromptFromDB('daily_s_interview');

      // 2. 상태 변수에 저장하여 분석 로직에서 사용
      setDbPrompt(content);
    };

    loadData();
  }, []);

  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();

  const isDisabled = !user || loading || !selectedDate;
  const isDisabled2 = !isDailyDone && isLocked;

  // 날짜 포맷팅 로직 (동일)
  const selDate = useMemo(() => {
    if (!selectedDate) return '';
    const d = new Date(selectedDate);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T12:00`;
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      const result = calculateSaju(selDate, true);
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
            saju,
            gender,
            language,
            selectedDate,
            question,
            sajuDate: selectedDateSaju,
            type: 'interview', // 타입을 면접용으로 변경
            promptAdd:''
          }),
        );
        onstart();
      } catch (error) {
        console.error(error);
      }
    },
    [service, saju, gender, language, selectedDate, question, selectedDateSaju, setAiResult],
  );

  const [selections, setSelections] = useState({ category: '', vibe: '', concern: '' });

  const handleSelect = useCallback((groupId, optionId, optionPrompt) => {
    setSelections((prev) => {
      const isAlreadySelected = prev[groupId] === optionId;
      const newSelections = { ...prev, [groupId]: isAlreadySelected ? '' : optionId };

      const updatedPrompts = INTERVIEW_GROUPS.map((group) => {
        if (group.id === groupId) return isAlreadySelected ? '' : optionPrompt;
        const foundOption = group.options.find((opt) => opt.id === newSelections[group.id]);
        return foundOption ? foundOption.prompt : null;
      });

      const combined = '이 날 면접(평가)은 ' + updatedPrompts.filter(Boolean).join(', ');
      setQuestion(combined);
      return newSelections;
    });
  }, []);

  const datePickerSection = useCallback(
    () => (
      <div className="w-full max-w-md mx-auto py-8">
        <header className="mb-10 px-1">
          <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
            <span className="font-bold">01.</span>
            <span className={`ml-3 italic font-serif ${activeTheme.text}`}>
              {language === 'ko' ? '결전의 날 선택' : 'The Big Day'}
            </span>
          </h2>
          <p className="mt-4 text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            {language === 'ko' ? '면접이나 발표가 언제인가요?' : 'When is your interview?'}
          </p>
        </header>

        <CustomCalendar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          theme="blue"
        />

        {selectedDate && (
          <div
            className="mt-20 pt-16 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-700"
            ref={detailSectionRef}
          >
            <header className="px-1 mb-12">
              <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                <span className="font-bold">02.</span>
                <span className={`ml-3 italic font-serif ${activeTheme.text}`}>
                  {language === 'ko' ? '디테일 정보 (선택)' : 'Context (Optional)'}
                </span>
              </h2>
              <p className="mt-4 text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                {language === 'ko' ? '더 정확한 합격운 분석을 위해' : 'For more precise analysis'}
              </p>
            </header>

            <div className="space-y-16 relative">
              <div className="absolute left-[13px] top-2 bottom-0 w-[1px] bg-slate-50 dark:bg-slate-800/50" />
              {INTERVIEW_GROUPS.map((group, index) => (
                <div key={group.id} className="relative pl-12">
                  <div className="absolute left-0 top-0 w-7 h-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center z-10 shadow-sm">
                    <span className={`text-[10px] font-black ${activeTheme.text}`}>
                      {index + 1}
                    </span>
                  </div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-6 px-1">
                    {language === 'ko' ? group.label.ko : group.label.en}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(group.id, opt.id, opt.prompt)}
                        className={`px-5 py-2.5 text-[12px] font-medium border transition-all duration-300
                        ${
                          selections[group.id] === opt.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl -translate-y-1'
                            : 'bg-white dark:bg-slate-800/30 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {language === 'ko' ? opt.ko : opt.en}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
    [language, selectedDate, selections, handleSelect],
  );

  const sajuGuide = useCallback(
    (onStart) => {
      if (loading) return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;

      return (
        <div className="max-w-md mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-3 duration-1000">
          <header className="text-right">
            <div className="inline-block px-2 py-1 mb-4 bg-slate-50 dark:bg-slate-800 rounded text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
              Pass or Fail
            </div>
            <h2 className="text-4xl font-light text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              {language === 'ko' ? '사자가 읽어주는' : 'Reading for'} <br />
              <span className={`font-serif italic font-medium ${activeTheme.text}`}>
                {language === 'ko' ? '합격의 기운' : 'your acceptance'}
              </span>
            </h2>
            <p className="mt-6 text-[13px] text-slate-400 dark:text-slate-500 leading-relaxed w-full">
              {language === 'ko' ? (
                <>
                  당신의 명식과 그날의 기운을 대조하여 <br />{' '}
                  <span className="text-slate-600 dark:text-slate-300 font-medium font-serif italic">
                    합격의 타이밍
                  </span>
                  을 읽어드립니다.
                </>
              ) : (
                <>
                  Analyzing your destiny and the energy of the day to find{' '}
                  <span className="text-slate-600 dark:text-slate-300 font-medium font-serif italic">
                    your moment of success.
                  </span>
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
                {language === 'ko' ? '합격운 확인하기' : 'Check Pass Luck'}
                {isLocked ? (
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

  return (
    <AnalysisStepContainer
      guideContent={sajuGuide}
      loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
      resultComponent={ViewResult}
      loadingTime={0}
    />
  );
}
