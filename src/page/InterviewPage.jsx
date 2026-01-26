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
import ReportTemplateInterview from '../component/ReportTemplateInterview';
import AnalyzeButton from '../component/AnalyzeButton';
import ReportHid from '../component/ReportHid';
import { Sparkles, Clock, Target, ShieldCheck } from 'lucide-react';
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
            saju: saju,
            gender: gender,
            language: language,
            selectedDate: selectedDate,
            sajuDate: selectedDateSaju,
            question: question,
            type: 'interview',
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
      <div className="w-full max-w-xl mx-auto py-8">
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
          <header className="text-center">
            <div className="inline-block px-2 py-1 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">
              Interview Strategy
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-[1.2] tracking-tight">
              {language === 'ko' ? '사자가 제안하는' : 'Saza’s Strategic'}
              <br />
              <span className="relative text-blue-600 dark:text-blue-500">
                {language === 'ko' ? '면접 필승 바이브' : 'Interview Vibe'}
                <div className="absolute inset-0 bg-blue-200/50 dark:bg-blue-900/30 blur-md rounded-full scale-100"></div>
              </span>
            </h2>
          </header>

          <section className="mt-10">{datePickerSection()}</section>

          {/* [NEW] Primary Analyze Button */}
          <div className="my-12">
            <AnalyzeButton
              onClick={() => handleStartClick(onStart)}
              disabled={isDisabled || isDisabled2}
              loading={loading}
              isDone={false}
              label={language === 'ko' ? '합격운 확인하기' : 'Check Pass Luck'}
              color="blue"
              cost={-1}
            />
            {isLocked ? (
              <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {language === 'ko' ? '크레딧이 부족합니다..' : 'Not Enough credit'}
              </p>
            ) : (
              <p className="mt-4 text-[11px] text-slate-400 text-center">
                {language === 'ko'
                  ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
                  : 'Fortunes already analyzed do not use credits.'}
              </p>
            )}
          </div>

          {/* 3단 정보 바 (Vibe / Timing / Strategy) */}
          <div className="w-full flex items-center mt-12 mb-12 px-2 py-4 border-t border-slate-100 dark:border-slate-800 uppercase italic">
            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
              <Sparkles size={18} className="text-blue-500" />
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 leading-tight text-center">
                {language === 'ko' ? '바이브 전략' : 'Vibe'}
                <br />
                <span className="font-medium text-[9px]">MOOD</span>
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 shrink-0"></div>
            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
              <Clock size={18} className="text-blue-500" />
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 leading-tight text-center">
                {language === 'ko' ? '골든 타임' : 'Timing'}
                <br />
                <span className="font-medium text-[9px]">HOUR</span>
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 shrink-0"></div>
            <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
              <Target size={18} className="text-blue-500" />
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 leading-tight text-center">
                {language === 'ko' ? '돌발 대응' : 'Response'}
                <br />
                <span className="font-black">STRATEGY</span>
              </span>
            </div>
          </div>

          {/* Preview Mode Badge & Header */}
          <div className="mx-4 my-10 flex flex-col items-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50/50 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[11px] font-bold text-blue-600 tracking-tight uppercase">
                Preview Mode
              </span>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {language === 'ko' ? '전략적 합격 리포트 미리보기' : 'Strategic Pass Report Preview'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
                {language === 'ko'
                  ? '성공적인 인터뷰를 위해 사자가 읽어낸 기운과 필승의 바이브를 엿보세요'
                  : 'Peek into the energy and winning vibe read by Saza for your success'}
              </p>
            </div>
          </div>

          {/* High-Fidelity Mockup Sections */}
          <div className="sjsj-report-container !mx-0 !p-0 bg-transparent text-left">
            <div className="sjsj-content-inner !p-0">
              {/* Profile Card Mockup */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 mb-8 shadow-sm">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-slate-100 dark:border-slate-800">
                  <span className="text-xl font-black text-slate-800 dark:text-white">{userData?.displayName}</span>
                  <span className="text-[9px] bg-slate-900 text-white px-3 py-1 rounded-full font-black">CANDIDATE</span>
                </div>
                <div className="space-y-3 opacity-50">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">TARGET</span>
                    <span className="font-bold">{selections.category || 'Interview'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">DATE</span>
                    <span className="font-bold">{selectedDate ? new Date(selectedDate).toLocaleDateString() : '2026.01.26'}</span>
                  </div>
                </div>
              </div>

              {/* 01. Vibe Strategy */}
              <section className="relative sjsj-section !p-0 !mb-8 overflow-hidden">
                <div className="p-6 select-none pointer-events-none opacity-40 grayscale">
                  {/* 정교해진 소제목 스타일 */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white">
                      {language === 'ko' ? '01. 합격 바이브 전략' : '01. Vibe Strategy'}
                    </h2>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-bold text-blue-500 block mb-1">MOOD</span>
                      <span className="text-sm font-black">{language === 'ko' ? '"지적인 성실함"' : '"Intellectual Sincerity"'}</span>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-bold text-blue-500 block mb-1">KEY POINT</span>
                      <span className="text-sm font-black">{language === 'ko' ? '첫 질문의 속도' : 'Speed of first reply'}</span>
                    </div>
                  </div>
                  <p className="rt-card__text">
                    {language === 'ko' 
                      ? '오늘은 평소보다 조금 더 차분한 목소리로 신뢰감을 주는 것이 가장 중요한 포인트입니다. 상대방의 질문에 즉각적으로 답하기보다 1~2초 정도...' 
                      : 'Today, the most important point is to convey trust with a slightly calmer voice than usual. Rather than answering immediately...'}
                  </p>
                </div>
                <ReportHid
                  gradientColor="#DBEAFE"
                  themeColor="#3B82F6"
                  badge={['1', language === 'ko' ? '바이브' : 'Vibe']}
                  title={language === 'ko' ? <>합격을 부르는 <span className="text-blue-500">필승의 이미지</span></> : <>The <span className="text-blue-500">Winning Image</span> for Pass</>}
                  des={language === 'ko' ? '면접관의 마음을 사로잡을 당신만의 고유한 아우라를 정의해드립니다.' : 'Defines your unique aura that will captivate the interviewer’s heart.'}
                  hClass="h-[600px]"
                  mClass="mt-[-300px]"
                />
              </section>

              {/* 02. Success Index */}
              <section className="relative sjsj-section !p-0 !mb-8 overflow-hidden">
                <div className="p-6 select-none pointer-events-none opacity-40 grayscale">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white">
                      {language === 'ko' ? '02. 면접 합격 지수' : '02. Success Index'}
                    </h2>
                  </div>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-black text-blue-600">82%</div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 opacity-50">
                    <div className="border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 block mb-1">Golden Time</span>
                      <span className="text-xs font-bold">{language === 'ko' ? '오전 10:30' : '10:30 AM'}</span>
                    </div>
                    <div className="border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 block mb-1">Lucky Item</span>
                      <span className="text-xs font-bold">{language === 'ko' ? '블루 넥타이/스카프' : 'Blue Tie/Scarf'}</span>
                    </div>
                  </div>
                </div>
                <ReportHid
                  gradientColor="#DBEAFE"
                  themeColor="#3B82F6"
                  badge={['2', language === 'ko' ? '합격지수' : 'Index']}
                  title={language === 'ko' ? <>기운이 최고조에 달하는 <span className="text-blue-500">결전의 시간</span></> : <>The <span className="text-blue-500">Decisive Time</span> of Peak Energy</>}
                  des={language === 'ko' ? '언제 가장 빛날 수 있는지, 행운을 가져올 아이템은 무엇인지 정밀 분석합니다.' : 'Analyzes when you can shine the most and what items will bring luck.'}
                  hClass="h-[600px]"
                  mClass="mt-[-300px]"
                />
              </section>

              {/* 03. Strategic Insights */}
              <section className="relative sjsj-section !p-0 !mb-8 overflow-hidden">
                <div className="p-6 select-none pointer-events-none opacity-40 grayscale">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white">
                      {language === 'ko' ? '03. 필승 인사이트' : '03. Insights'}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-bold text-blue-500 block mb-1">
                        {language === 'ko' ? '불안 요소 해결' : 'Reducing Anxiety'}
                      </span>
                      <p className="text-xs">
                        {language === 'ko' 
                          ? '긴장으로 인한 말실수를 예방하기 위해 첫 인사를 나눌 때 호흡을 가다듬고 여유 있는 미소를...' 
                          : 'To prevent slips of the tongue due to nervousness, take a deep breath and smile when greeting...'}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-bold text-red-400 block mb-1">
                        {language === 'ko' ? '돌발 질문 대응' : 'Handling Surprise Qs'}
                      </span>
                      <p className="text-xs">
                        {language === 'ko' 
                          ? '상대방의 공격적인 질문에는 유연한 미소와 함께 핵심만 간결하게 전달하는 전략이 필요합니다...' 
                          : 'For aggressive questions, you need a strategy to deliver only the essentials concisely with a flexible smile...'}
                      </p>
                    </div>
                  </div>
                </div>
                <ReportHid
                  gradientColor="#DBEAFE"
                  themeColor="#3B82F6"
                  badge={['3', language === 'ko' ? '전략' : 'Strategy']}
                  title={language === 'ko' ? <>면접관을 아군으로 만드는 <span className="text-blue-500">강력한 한 방</span></> : <>The <span className="text-blue-500">Powerful Punch</span> to Make Them Allies</>}
                  des={language === 'ko' ? '돌발 질문 대처법부터 긍정적인 첫인상을 남기는 디테일한 팁까지 제공합니다.' : 'Provides detailed tips from handling surprise questions to leaving a positive first impression.'}
                  hClass="h-[600px]"
                  mClass="mt-[-300px]"
                />
              </section>

              {/* 04. Final Conclusion */}
              <section className="relative sjsj-section !p-0 !mb-8 overflow-hidden">
                <div className="p-6 select-none pointer-events-none opacity-40 grayscale">
                  <div className="rt-tip-box">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck size={16} className="text-blue-500" />
                      <span className="text-[10px] font-black tracking-widest uppercase text-blue-500">Final Recommendation</span>
                    </div>
                    <p className="rt-card__text !mt-2 italic">
                      {language === 'ko' 
                        ? '당신안의 정석적인 매력을 믿고 당당하게 임하세요. 오늘 당신의 기운은 충분히 빛나고 있습니다.' 
                        : 'Believe in your classic charm and act confidently. Your energy is shining bright enough today.'}
                    </p>
                  </div>
                </div>
                <ReportHid
                  gradientColor="#DBEAFE"
                  themeColor="#3B82F6"
                  badge={['4', language === 'ko' ? '결론' : 'Conclusion']}
                  title={language === 'ko' ? <>사자가 보증하는 <span className="text-blue-500">합격의 시그널</span></> : <>The <span className="text-blue-500">Pass Signal</span> Guaranteed by Saza</>}
                  des={language === 'ko' ? '리포트의 핵심 요약과 함께 당신을 승리로 이끌 마지막 행동 지침을 제안합니다.' : 'Suggests the final action guidelines to lead you to victory with a core summary.'}
                  hClass="h-[500px]"
                  mClass="mt-[-250px]"
                />
              </section>
            </div>
          </div>

          <footer className="mt-12">
            <AnalyzeButton
              onClick={() => handleStartClick(onStart)}
              disabled={isDisabled || isDisabled2}
              loading={loading}
              isDone={false}
              label={language === 'ko' ? '합격운 확인하기' : 'Check Pass Luck'}
              color="blue"
              cost={-1}
            />
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
      selections,
      selectedDate,
    ],
  );

  return (
    <AnalysisStepContainer
      guideContent={sajuGuide}
      loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
      resultComponent={ReportTemplateInterview}
      loadingTime={0}
    />
  );
}
