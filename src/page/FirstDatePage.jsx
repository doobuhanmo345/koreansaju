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
import ReportTemplateDate from '../component/ReportTemplateDate';
import AnalyzeButton from '../component/AnalyzeButton';
import ReportHid from '../component/ReportHid';
import { Heart, Sparkles, Target } from 'lucide-react';

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
      <div className="w-full max-w-xl mx-auto py-8">
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
            <AnalyzeButton
              onClick={() => handleStartClick(onStart)}
              disabled={isDisabled || isDisabled2}
              loading={false}
              isDone={false}
              label={language === 'ko' ? '운세 확인하기' : 'Check Fortune'}
              color='rose'
            />
          </footer>

          {/* 3-Column Info Bar */}
          <div className="grid grid-cols-3 gap-2 mt-10 mb-8 px-1">
            <div className="flex flex-col items-center p-3 rounded-2xl bg-rose-50/50 dark:bg-slate-800/50 border border-rose-100/50 dark:border-rose-900/20">
              <Heart className="w-5 h-5 text-rose-500 mb-2 opacity-80" />
              <span className="text-[10px] font-black text-rose-600/80 dark:text-rose-400 uppercase tracking-tight">
                {language === 'ko' ? '연애 케미' : 'Chemistry'}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-rose-50/50 dark:bg-slate-800/50 border border-rose-100/50 dark:border-rose-900/20">
              <Sparkles className="w-5 h-5 text-rose-500 mb-2 opacity-80" />
              <span className="text-[10px] font-black text-rose-600/80 dark:text-rose-400 uppercase tracking-tight">
                {language === 'ko' ? '무드 분석' : 'Vibe Check'}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-rose-50/50 dark:bg-slate-800/50 border border-rose-100/50 dark:border-rose-900/20">
              <Target className="w-5 h-5 text-rose-500 mb-2 opacity-80" />
              <span className="text-[10px] font-black text-rose-600/80 dark:text-rose-400 uppercase tracking-tight">
                {language === 'ko' ? '애프터 전략' : 'Strategy'}
              </span>
            </div>
          </div>

          {/* Preview Mode Teaser Section */}
          <div className="mt-12 space-y-10">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {language === 'ko' ? '사자가 준비한 완벽한 데이트 플랜' : "A Perfect Date Plan by Saza"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
                {language === 'ko'
                  ? '상대에게 잊히지 않을 첫인상을 남기는 비법과 성공적인 애프터를 위한 인사이트를 미리 확인하세요'
                  : 'Get the secret to leaving an unforgettable impression and insights for a successful after-date'}
              </p>
            </div>

            <div className="sjsj-report-container !mx-0 !p-0 bg-transparent">
              <div className="sjsj-content-inner !p-0">
                {/* 1. Vibe & OOTD Section */}
                <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
                  <div className="px-6 pt-6 opacity-40 grayscale contrast-75 select-none pointer-events-none">
                    <div className="sjsj-section-label">
                      <h2 className="sjsj-subTitle">{language === 'ko' ? '01. 맞춤 OOTD 전략' : '01. Vibe & OOTD'}</h2>
                    </div>
                    <div className="sjsj-analysis-box mb-6">
                      <div className="sjsj-keyword-grid">
                        <div className="sjsj-keyword-col">
                          <div className="sjsj-col-title text-rose-600">MOOD</div>
                          <ul className="sjsj-list">
                            <li>{language === 'ko' ? '"세련된 지성미"' : '"Sophisticated Intellect"'}</li>
                          </ul>
                        </div>
                        <div className="sjsj-keyword-col">
                          <div className="sjsj-col-title text-rose-600">POINT</div>
                          <ul className="sjsj-list">
                            <li>{language === 'ko' ? '실버 액세서리' : 'Silver Accessory'}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <p className="sjsj-long-text">
                      {language === 'ko' 
                        ? '당신의 오늘은 부드러움보다는 차분하고 이성적인 매력이 돋보이는 날입니다. 셔츠나 블라우스에 심플한 시계를 매치하여 전문적인 느낌을...' 
                        : "Your charm today is more calm and rational than soft. Match a shirt or blouse with a simple watch to give a professional feel..."}
                    </p>
                  </div>
                  <ReportHid
                    themeColor="#F43F5E"
                    badge={['1', language === 'ko' ? '전략' : 'Strategy']}
                    title={language === 'ko' ? <>상대를 사로잡는 <span className="text-rose-500">첫인상의 마법</span></> : <>The <span className="text-rose-500">Magic of First Impression</span> to Captivate</>}
                    des={language === 'ko' ? '당신의 에너지와 가장 잘 어울리는 무드와 디테일한 스타일링 포인트를 제안합니다.' : 'Suggests the mood and detailed styling points that best match your energy.'}
                    hClass="h-[600px]"
                    mClass="mt-[-300px]"
                  />
                </section>

                {/* 2. Psychological Insights Section */}
                <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden">
                  <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale">
                    <div className="sjsj-section-label">
                      <h2 className="sjsj-subTitle">{language === 'ko' ? '02. 관계 심리 리딩' : '02. Psychology'}</h2>
                    </div>
                    <div className="space-y-4 mb-6">
                      {[
                        { 
                          label: language === 'ko' ? '상대의 첫 마음' : "Partner's Mind", 
                          val: language === 'ko' ? '당신의 예의 바르고 배려심 넘치는 모습에 안도하면서도, 호기심을 느끼고 있습니다.' : 'Relieved by your polite and caring manner, yet feeling curious.'
                        },
                        { 
                          label: language === 'ko' ? '대화 매너' : 'Talk Tip', 
                          val: language === 'ko' ? '최근 본 영화나 가벼운 취미 이야기로 화제를 전환하면 훨씬 자연스러운 대화가 가능합니다.' : 'Switching to light hobbies or recent movies will make the conversation much more natural.'
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-rose-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                          <span className="text-[10px] font-black text-rose-500 uppercase mb-1 block tracking-wider">{item.label}</span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {item.val}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ReportHid
                    themeColor="#F43F5E"
                    badge={['2', language === 'ko' ? '심리' : 'Psychology']}
                    title={language === 'ko' ? <>보이지 않는 <span className="text-rose-500">마음의 온도</span> 읽기</> : <>Reading the Invisible <span className="text-rose-500">Mental Temperature</span></>}
                    des={language === 'ko' ? '상대의 무의식적인 반응을 캐치하고 호감을 높이는 대화의 열쇠를 알려드립니다.' : 'Tells you the key to conversation that catches the partner\'s unconscious reactions and increases favorability.'}
                    hClass="h-[600px]"
                    mClass="mt-[-300px]"
                  />
                </section>

                {/* 3. Chemistry & After Section */}
                <section className="relative sjsj-section !p-0 !mb-8 overflow-hidden">
                  <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale">
                    <div className="sjsj-section-label">
                      <h2 className="sjsj-subTitle">{language === 'ko' ? '03. 케미 & 후속 전략' : '03. Chemistry'}</h2>
                    </div>
                    <div className="bg-rose-50/50 dark:bg-slate-800/50 p-6 rounded-3xl mb-6 text-center border border-rose-100 dark:border-rose-900/30">
                       <div className="text-[10px] font-black text-rose-500 uppercase mb-2 tracking-widest">{language === 'ko' ? '대화 지수' : 'Vibe Index'}</div>
                       <div className="text-4xl font-black text-slate-800 dark:text-white">92<span className="text-sm ml-1 text-slate-400">pt</span></div>
                    </div>
                    <div className="rt-tip-box !border-rose-100 !bg-transparent p-0">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {language === 'ko' 
                          ? '당신이 먼저 가벼운 안부를 묻는 것이 관계 발전에 2배 더 강력한 운을 가져다줍니다. 골든 타임을 놓치지 마세요...' 
                          : 'Sending a light greeting first will bring twice as powerful luck to your relationship development. Don\'t miss the golden time...'}
                      </p>
                    </div>
                  </div>
                  <ReportHid
                    themeColor="#F43F5E"
                    badge={['3', language === 'ko' ? '애프터' : 'After']}
                    title={language === 'ko' ? <>확실한 <span className="text-rose-500">그린라이트</span>를 만드는 법</> : <>How to Create a Certain <span className="text-rose-500">Green Light</span></>}
                    des={language === 'ko' ? '두 사람의 상호작용 지수와 만남 이후 관계를 발전시킬 최적의 타이밍을 분석합니다.' : 'Analyzes the interaction index between the two and the optimal timing to develop the relationship after the meeting.'}
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
                disabled={isDisabled || isDisabled2}
                loading={false}
                isDone={false}
                label={language === 'ko' ? '운세 확인하기' : 'Check Fortune'}
                color='rose'
              />
            </div>
          </div>
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
      resultComponent={ReportTemplateDate}
      loadingTime={0}
    />
  );
}
